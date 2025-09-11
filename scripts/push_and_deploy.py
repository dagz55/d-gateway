#!/usr/bin/env python3
"""
Push and deploy helper for Big4Trading member-dashboard.

Features
- Rebase safety: hard-stop if a rebase is in progress.
- Staging policy: include only specified project files/dirs.
- Commit: Conventional Commits message (overridable via -m).
- Push: to the specified branch (default: main).
- Deployment:
  * Option A (default): via GitHub integration. Poll Vercel API for latest deployment of project/branch.
  * Option B: via Vercel CLI (--vercel-cli). Uses `vercel --prod --confirm` unless --preview is passed.
- Monitoring: health checks on deployed URL (/, /api/health if present, /favicon.ico).
- Reporting: writes deployment report to reports/.

Env (Option A – default)
- VERCEL_TOKEN (required)
- VERCEL_PROJECT_ID (required; name or id)
- VERCEL_ORG_ID (optional)

Usage examples:
  # Production via GitHub integration (default)
  python3 scripts/push_and_deploy.py \
    -m "feat: pricing table & copy updates" \
    --branch main \
    --via-github

  # Production via Vercel CLI
  python3 scripts/push_and_deploy.py \
    -m "chore: prod deploy" \
    --branch main \
    --vercel-cli --prod
"""

from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError

REPO_ROOT = Path(__file__).resolve().parents[1]
REPORTS_DIR = REPO_ROOT / "reports"

DEFAULT_COMMIT_MESSAGE = (
    "chore(deploy): push to main for production release\n\n"
    "Context: automated push & deploy via script."
)

# Include-only staging policy
INCLUDE_PATHS: List[str] = [
    "src",
    "app",
    "public",
    "scripts",
    ".github",
    "supabase",
    "infra",
    "terraform",
    "tests",
    "test",
    "__tests__",
    # Configs
    "package.json",
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
    "next.config.ts",
    "next.config.js",
    "vercel.json",
    "Dockerfile",
    "docker-compose.yml",
    # Special: keep Vercel project link
    ".vercel/project.json",
]

# Health check settings
HC_RETRIES = 2
HC_TIMEOUT_SECS = 10


class Shell:
    @staticmethod
    def run(cmd: List[str], cwd: Optional[Path] = None, check: bool = True) -> subprocess.CompletedProcess:
        return subprocess.run(cmd, cwd=str(cwd or REPO_ROOT), check=check, text=True, capture_output=True)

    @staticmethod
    def run_no_check(cmd: List[str], cwd: Optional[Path] = None) -> subprocess.CompletedProcess:
        return subprocess.run(cmd, cwd=str(cwd or REPO_ROOT), check=False, text=True, capture_output=True)


def is_rebase_in_progress(repo_root: Path) -> bool:
    return (repo_root / ".git/rebase-apply").exists() or (repo_root / ".git/rebase-merge").exists()


def ensure_git_repo() -> None:
    res = Shell.run_no_check(["git", "rev-parse", "--is-inside-work-tree"])
    if res.returncode != 0 or res.stdout.strip() != "true":
        print("Error: Not inside a git repository.", file=sys.stderr)
        sys.exit(2)


def current_branch() -> str:
    res = Shell.run(["git", "rev-parse", "--abbrev-ref", "HEAD"])
    return res.stdout.strip()


def get_actor() -> Tuple[str, str]:
    name = Shell.run_no_check(["git", "config", "user.name"]).stdout.strip() or "unknown"
    email = Shell.run_no_check(["git", "config", "user.email"]).stdout.strip() or "unknown@example.com"
    return name, email


def get_commit_sha_and_title() -> Tuple[str, str]:
    sha = Shell.run(["git", "rev-parse", "HEAD"]).stdout.strip()
    title = Shell.run(["git", "log", "-1", "--pretty=%s"]).stdout.strip()
    return sha, title


def git_add_includes() -> None:
    # Stage only included paths if they exist
    for p in INCLUDE_PATHS:
        path = REPO_ROOT / p
        if path.exists():
            # Force-add the .vercel/project.json even if ignored elsewhere
            if p == ".vercel/project.json":
                Shell.run_no_check(["git", "add", "-f", p])
            else:
                Shell.run_no_check(["git", "add", p])


def git_has_staged_changes() -> bool:
    # Check staged changes only
    res = Shell.run_no_check(["git", "diff", "--cached", "--name-only"])
    return len(res.stdout.strip()) > 0


def git_commit(message: str) -> Optional[str]:
    # Stage includes first
    git_add_includes()
    # If still nothing staged, return None
    if not git_has_staged_changes():
        return None
    res = Shell.run(["git", "commit", "-m", message])
    # Return the new commit SHA
    return Shell.run(["git", "rev-parse", "HEAD"]).stdout.strip()


def git_push(branch: str) -> None:
    # Ensure we are on the target branch; switch if needed
    curr = current_branch()
    if curr != branch:
        # Create branch if it does not exist locally
        res = Shell.run_no_check(["git", "rev-parse", "--verify", branch])
        if res.returncode != 0:
            Shell.run(["git", "checkout", "-b", branch])
        else:
            Shell.run(["git", "checkout", branch])
    # Push to origin
    push_res = Shell.run_no_check(["git", "push", "-u", "origin", branch])
    if push_res.returncode != 0:
        print(push_res.stdout)
        print(push_res.stderr, file=sys.stderr)
        print("Error: git push failed.", file=sys.stderr)
        sys.exit(3)


# ---------------- Vercel API helpers ----------------

class VercelAPI:
    def __init__(self, token: str, project: str, org_id: Optional[str] = None):
        self.token = token
        self.project = project  # name or id
        self.org_id = org_id

    def _request(self, method: str, url: str, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        if params:
            url = f"{url}?{urlencode(params)}"
        req = Request(url, method=method)
        req.add_header("Authorization", f"Bearer {self.token}")
        req.add_header("Content-Type", "application/json")
        try:
            with urlopen(req, timeout=HC_TIMEOUT_SECS) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                return data
        except HTTPError as e:
            body = e.read().decode("utf-8", errors="ignore")
            raise RuntimeError(f"Vercel API HTTPError {e.code}: {body}")
        except URLError as e:
            raise RuntimeError(f"Vercel API URLError: {e}")

    def list_deployments_v13(self, limit: int = 20) -> Dict[str, Any]:
        params: Dict[str, Any] = {"project": self.project, "limit": str(limit)}
        if self.org_id:
            params["teamId"] = self.org_id
        return self._request("GET", "https://api.vercel.com/v13/deployments", params)


def select_latest_deployment(deployments: Dict[str, Any], branch: str, target: str = "production") -> Optional[Dict[str, Any]]:
    items = deployments.get("deployments") or deployments.get("data") or []
    # Filter by target and branch (meta data may vary across API versions)
    filtered: List[Dict[str, Any]] = []
    for d in items:
        d_target = d.get("target") or d.get("deploymentTarget")
        meta = d.get("meta") or {}
        git_branch = meta.get("gitBranch") or meta.get("githubCommitRef") or meta.get("branch")
        if d_target == target and (git_branch is None or git_branch == branch):
            filtered.append(d)
    if not filtered:
        return None
    # Sort by createdAt descending
    filtered.sort(key=lambda x: x.get("createdAt", 0), reverse=True)
    return filtered[0]


def wait_for_vercel_deployment(vercel: VercelAPI, branch: str, target: str = "production", timeout_minutes: int = 15) -> Tuple[Optional[Dict[str, Any]], str]:
    deadline = time.time() + timeout_minutes * 60
    last_state = "UNKNOWN"
    while time.time() < deadline:
        try:
            data = vercel.list_deployments_v13(limit=20)
            dep = select_latest_deployment(data, branch=branch, target=target)
            if dep is None:
                last_state = "NOT_FOUND"
            else:
                state = dep.get("readyState") or dep.get("state") or "UNKNOWN"
                last_state = state
                if state in ("READY", "BUILDING", "INITIALIZING", "QUEUED"):
                    if state == "READY":
                        return dep, state
                if state in ("ERROR", "CANCELED"):
                    return dep, state
        except Exception as e:
            last_state = f"ERROR: {e}"
        time.sleep(10)
    return None, last_state


def http_get(url: str, timeout: int = HC_TIMEOUT_SECS) -> Tuple[int, float]:
    start = time.time()
    req = Request(url, method="GET")
    try:
        with urlopen(req, timeout=timeout) as resp:
            status = resp.getcode()
    except HTTPError as e:
        status = e.code
    except URLError:
        status = 0
    elapsed = time.time() - start
    return status, elapsed


def perform_health_checks(base_url: str) -> List[Tuple[str, int, float]]:
    results: List[Tuple[str, int, float]] = []
    # Ensure https scheme
    if base_url.startswith("http://") or base_url.startswith("https://"):
        origin = base_url
    else:
        origin = f"https://{base_url}"

    endpoints = ["/", "/api/health", "/favicon.ico"]
    for ep in endpoints:
        url = origin.rstrip("/") + ep
        status = 0
        latency = 0.0
        # 2 retries
        for _ in range(HC_RETRIES):
            status, latency = http_get(url, timeout=HC_TIMEOUT_SECS)
            if status and status < 500 and status != 404:
                break
            time.sleep(1)
        results.append((ep, status, latency))
    return results


def write_report(
    report_path: Path,
    actor_name: str,
    actor_email: str,
    branch: str,
    commit_sha: str,
    commit_title: str,
    diff_summary: str,
    dep: Optional[Dict[str, Any]],
    dep_state: str,
    health: Optional[List[Tuple[str, int, float]]],
) -> None:
    ts = datetime.now(timezone.utc).isoformat()
    lines: List[str] = []
    lines.append(f"Timestamp: {ts}")
    lines.append(f"Actor: {actor_name} <{actor_email}>")
    lines.append(f"Branch: {branch}")
    lines.append(f"Commit: {commit_sha}")
    lines.append(f"Title: {commit_title}")
    lines.append("")
    if diff_summary:
        lines.append("Diff summary:")
        lines.append(diff_summary.strip())
        lines.append("")
    lines.append("Deployment:")
    if dep:
        dep_id = dep.get("uid") or dep.get("id") or "unknown"
        dep_url = dep.get("url") or ""
        dep_target = dep.get("target") or dep.get("deploymentTarget") or ""
        created = dep.get("createdAt")
        inspect = dep.get("inspectorUrl") or dep.get("inspectUrl") or ""
        lines.append(f"  id: {dep_id}")
        lines.append(f"  url: {dep_url}")
        lines.append(f"  target: {dep_target}")
        lines.append(f"  state: {dep_state}")
        lines.append(f"  createdAt: {created}")
        if inspect:
            lines.append(f"  buildLogs: {inspect}")
    else:
        lines.append(f"  state: {dep_state}")
    lines.append("")
    if health:
        lines.append("Health checks:")
        for ep, status, latency in health:
            lines.append(f"  GET {ep} -> {status} in {latency:.2f}s")
        lines.append("")
    # Determine exit state summary
    lines.append("Exit: " + ("0" if dep_state == "READY" else "1"))

    report_path.write_text("\n".join(lines), encoding="utf-8")


def get_diff_summary() -> str:
    # Try HEAD~1..HEAD; if first commit, skip
    count_res = Shell.run_no_check(["git", "rev-list", "--count", "HEAD"])
    try:
        cnt = int(count_res.stdout.strip())
    except Exception:
        cnt = 0
    if cnt <= 1:
        return "(first commit or no prior commit)"
    res = Shell.run_no_check(["git", "--no-pager", "diff", "--shortstat", "HEAD~1..HEAD"])
    return res.stdout.strip()


def main(argv: Optional[List[str]] = None) -> int:
    parser = argparse.ArgumentParser(description="Push and deploy to Vercel (GitHub integration or CLI)")
    parser.add_argument("--branch", default="main", help="Branch to push/deploy (default: main)")
    parser.add_argument("-m", "--message", default=DEFAULT_COMMIT_MESSAGE, help="Commit message (Conventional Commits)")

    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--via-github", action="store_true", help="Push to GitHub (default) and poll Vercel for deployment")
    mode.add_argument("--vercel-cli", action="store_true", help="Use Vercel CLI to deploy (also pushes by default)")

    parser.add_argument("--preview", action="store_true", help="Deploy/poll preview target instead of production")
    parser.add_argument("--prod", action="store_true", help="For Vercel CLI: use --prod (default if not preview)")

    parser.add_argument("--skip-push", action="store_true", help="Skip git push (advanced)")
    parser.add_argument("--dry-run", action="store_true", help="Do not push/deploy; print actions only")

    args = parser.parse_args(argv)

    ensure_git_repo()

    if is_rebase_in_progress(REPO_ROOT):
        print("Rebase in progress detected (.git/rebase-apply or .git/rebase-merge). Please resolve and run again.", file=sys.stderr)
        return 10

    # Stage/commit
    if args.dry_run:
        print("[DRY RUN] Would stage included paths:")
        for p in INCLUDE_PATHS:
            print(f"  - {p}")
    else:
        git_add_includes()

    sha_before = Shell.run_no_check(["git", "rev-parse", "HEAD"]).stdout.strip()

    if args.dry_run:
        print(f"[DRY RUN] Would commit with message:\n{args.message}")
    else:
        new_sha = git_commit(args.message)
        if new_sha:
            print(f"Committed {new_sha}")
        else:
            print("No changes to commit. Proceeding with push.")

    # Push
    target_branch = args.branch or "main"
    if not args.skip_push:
        if args.dry_run:
            print(f"[DRY RUN] Would push to origin {target_branch}")
        else:
            git_push(target_branch)
    else:
        print("Skipping push per --skip-push")

    # Determine deployment mode
    via_github = args.via_github or (not args.vercel-cli)
    target = "preview" if args.preview else "production"

    dep: Optional[Dict[str, Any]] = None
    dep_state: str = "SKIPPED"
    health: Optional[List[Tuple[str, int, float]]] = None

    if via_github:
        # Poll Vercel API
        token = os.environ.get("VERCEL_TOKEN")
        project = os.environ.get("VERCEL_PROJECT_ID")
        org = os.environ.get("VERCEL_ORG_ID")
        if not token or not project:
            print("Missing VERCEL_TOKEN or VERCEL_PROJECT_ID env; cannot poll Vercel.", file=sys.stderr)
            dep_state = "MISSING_ENV"
        else:
            vercel = VercelAPI(token=token, project=project, org_id=org)
            dep, dep_state = wait_for_vercel_deployment(vercel, branch=target_branch, target=target)
            if dep and dep_state == "READY":
                url = dep.get("url")
                if url:
                    health = perform_health_checks(url)
    else:
        # Vercel CLI path
        cli_cmd = ["vercel", "deploy"]
        if not args.preview:
            cli_cmd.append("--prod")
        cli_cmd.append("--confirm")
        if args.dry_run:
            print("[DRY RUN] Would run:", " ".join(cli_cmd))
            dep_state = "DRY_RUN"
        else:
            cli_res = Shell.run_no_check(cli_cmd)
            print(cli_res.stdout)
            if cli_res.returncode != 0:
                print(cli_res.stderr, file=sys.stderr)
                dep_state = "CLI_ERROR"
            else:
                # Try to extract URL from CLI output
                url = None
                for line in cli_res.stdout.splitlines():
                    if line.strip().startswith("https://") and ".vercel.app" in line:
                        url = line.strip()
                        break
                dep_state = "READY" if url else "UNKNOWN"
                if url:
                    health = perform_health_checks(url)

    # Collect report data
    actor_name, actor_email = get_actor()
    commit_sha, commit_title = get_commit_sha_and_title()
    diff_summary = get_diff_summary()

    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    ts_slug = datetime.now().strftime("%Y%m%d_%H%M%S")
    report_path = REPORTS_DIR / f"deploy_{ts_slug}.txt"
    write_report(
        report_path,
        actor_name,
        actor_email,
        target_branch,
        commit_sha,
        commit_title,
        diff_summary,
        dep,
        dep_state,
        health,
    )

    print(f"Report written to {report_path}")
    return 0 if dep_state == "READY" else 1


if __name__ == "__main__":
    sys.exit(main())

