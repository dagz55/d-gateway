#!/usr/bin/env python3
"""
Enhanced Push and Deploy Helper for Zignals Trading Platform.

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
- Enhanced Error Handling: Retry mechanisms, fallback strategies, and comprehensive error recovery.
- One-Shot Deployment: Automatic retry and fallback to ensure successful deployment.

Env (Option A – default)
- VERCEL_TOKEN (required)
- VERCEL_PROJECT_ID (required; name or id)
- VERCEL_ORG_ID (optional)

Usage examples:
  # Production via GitHub integration (default) with enhanced error handling
  python3 scripts/push_and_deploy.py \
    -m "feat: enhanced payment system with security features" \
    --branch main \
    --via-github \
    --max-retries 3 \
    --fallback-to-cli

  # Production via Vercel CLI with retry mechanism
  python3 scripts/push_and_deploy.py \
    -m "chore: prod deploy with enhanced error handling" \
    --branch main \
    --vercel-cli --prod \
    --max-retries 5 \
    --health-check-timeout 30
"""

from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
import time
import logging
import signal
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Callable
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError
from contextlib import contextmanager
from dataclasses import dataclass
from enum import Enum

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
    "components",
    "hooks",
    "lib",
    "utils",
    "types",
    "middleware.ts",
    "next.config.mjs",
    "tailwind.config.ts",
    "tsconfig.json",
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

# Enhanced configuration
@dataclass
class DeployConfig:
    max_retries: int = 3
    retry_delay: int = 5
    health_check_timeout: int = 30
    deployment_timeout: int = 20
    fallback_to_cli: bool = True
    enable_rollback: bool = True
    verbose_logging: bool = False
    # Repository and branch management
    target_repo: Optional[str] = None  # Remote repository URL or name
    target_branch: str = "main"  # Target branch for deployment
    source_branch: Optional[str] = None  # Source branch (defaults to current)
    create_branch: bool = False  # Create branch if it doesn't exist
    switch_branch: bool = True  # Switch to target branch before deployment
    push_to_remote: bool = True  # Push to remote repository
    remote_name: str = "origin"  # Remote repository name

class DeployStatus(Enum):
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
    RETRYING = "RETRYING"
    FALLBACK = "FALLBACK"
    ROLLBACK = "ROLLBACK"
    TIMEOUT = "TIMEOUT"
    ERROR = "ERROR"

class DeployError(Exception):
    """Base exception for deployment errors"""
    def __init__(self, message: str, status: DeployStatus = DeployStatus.ERROR, retryable: bool = True):
        super().__init__(message)
        self.status = status
        self.retryable = retryable

class GitError(DeployError):
    """Git operation errors"""
    def __init__(self, message: str, retryable: bool = False):
        super().__init__(message, DeployStatus.ERROR, retryable)

class VercelError(DeployError):
    """Vercel API/CLI errors"""
    def __init__(self, message: str, retryable: bool = True):
        super().__init__(message, DeployStatus.ERROR, retryable)

class HealthCheckError(DeployError):
    """Health check failures"""
    def __init__(self, message: str, retryable: bool = True):
        super().__init__(message, DeployStatus.FAILED, retryable)

# Health check settings
HC_RETRIES = 3
HC_TIMEOUT_SECS = 15


class Shell:
    @staticmethod
    def run(cmd: List[str], cwd: Optional[Path] = None, check: bool = True, timeout: int = 300) -> subprocess.CompletedProcess:
        try:
            return subprocess.run(
                cmd, 
                cwd=str(cwd or REPO_ROOT), 
                check=check, 
                text=True, 
                capture_output=True,
                timeout=timeout
            )
        except subprocess.TimeoutExpired as e:
            raise DeployError(f"Command timed out after {timeout}s: {' '.join(cmd)}", DeployStatus.TIMEOUT)
        except subprocess.CalledProcessError as e:
            raise DeployError(f"Command failed with exit code {e.returncode}: {' '.join(cmd)}\nSTDOUT: {e.stdout}\nSTDERR: {e.stderr}")

    @staticmethod
    def run_no_check(cmd: List[str], cwd: Optional[Path] = None, timeout: int = 300) -> subprocess.CompletedProcess:
        try:
            return subprocess.run(
                cmd, 
                cwd=str(cwd or REPO_ROOT), 
                check=False, 
                text=True, 
                capture_output=True,
                timeout=timeout
            )
        except subprocess.TimeoutExpired as e:
            raise DeployError(f"Command timed out after {timeout}s: {' '.join(cmd)}", DeployStatus.TIMEOUT)

    @staticmethod
    def run_with_retry(cmd: List[str], max_retries: int = 3, delay: int = 5, cwd: Optional[Path] = None) -> subprocess.CompletedProcess:
        """Run command with retry mechanism"""
        last_error = None
        for attempt in range(max_retries):
            try:
                return Shell.run(cmd, cwd=cwd, check=True)
            except DeployError as e:
                last_error = e
                if attempt < max_retries - 1:
                    print(f"Attempt {attempt + 1} failed, retrying in {delay}s...")
                    time.sleep(delay)
                else:
                    raise e
        raise last_error or DeployError("Max retries exceeded")


# Enhanced logging setup
def setup_logging(verbose: bool = False) -> logging.Logger:
    """Setup enhanced logging with proper formatting"""
    level = logging.DEBUG if verbose else logging.INFO
    logging.basicConfig(
        level=level,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    return logging.getLogger(__name__)

@contextmanager
def signal_handler(signals_to_handle: List[int], handler: Callable):
    """Context manager for signal handling"""
    original_handlers = {}
    try:
        for sig in signals_to_handle:
            original_handlers[sig] = signal.signal(sig, handler)
        yield
    finally:
        for sig, original_handler in original_handlers.items():
            signal.signal(sig, original_handler)

@contextmanager
def deployment_context(config: DeployConfig):
    """Context manager for deployment operations with cleanup"""
    logger = setup_logging(config.verbose_logging)
    start_time = time.time()
    
    def cleanup_handler(signum, frame):
        logger.warning(f"Received signal {signum}, cleaning up...")
        raise KeyboardInterrupt("Deployment interrupted by user")
    
    try:
        with signal_handler([signal.SIGINT, signal.SIGTERM], cleanup_handler):
            logger.info("Starting deployment with enhanced error handling")
            yield logger
    except KeyboardInterrupt:
        logger.error("Deployment interrupted by user")
        raise
    except Exception as e:
        logger.error(f"Deployment failed: {e}")
        raise
    finally:
        elapsed = time.time() - start_time
        logger.info(f"Deployment context completed in {elapsed:.2f}s")

def is_rebase_in_progress(repo_root: Path) -> bool:
    return (repo_root / ".git/rebase-apply").exists() or (repo_root / ".git/rebase-merge").exists()


def ensure_git_repo() -> None:
    """Ensure we're in a git repository with enhanced error handling"""
    try:
        res = Shell.run_no_check(["git", "rev-parse", "--is-inside-work-tree"])
        if res.returncode != 0 or res.stdout.strip() != "true":
            raise GitError("Not inside a git repository", retryable=False)
    except DeployError:
        raise
    except Exception as e:
        raise GitError(f"Failed to verify git repository: {e}", retryable=False)


def current_branch() -> str:
    """Get current branch with error handling"""
    try:
        res = Shell.run(["git", "rev-parse", "--abbrev-ref", "HEAD"])
        return res.stdout.strip()
    except DeployError:
        raise
    except Exception as e:
        raise GitError(f"Failed to get current branch: {e}")


def get_actor() -> Tuple[str, str]:
    """Get git user info with fallbacks"""
    try:
        name_res = Shell.run_no_check(["git", "config", "user.name"])
        email_res = Shell.run_no_check(["git", "config", "user.email"])
        
        name = name_res.stdout.strip() or os.environ.get("GIT_USER_NAME", "unknown")
        email = email_res.stdout.strip() or os.environ.get("GIT_USER_EMAIL", "unknown@example.com")
        
        return name, email
    except Exception as e:
        # Fallback to environment variables or defaults
        name = os.environ.get("GIT_USER_NAME", "unknown")
        email = os.environ.get("GIT_USER_EMAIL", "unknown@example.com")
        return name, email


def get_commit_sha_and_title() -> Tuple[str, str]:
    """Get commit info with error handling"""
    try:
        sha_res = Shell.run(["git", "rev-parse", "HEAD"])
        title_res = Shell.run(["git", "log", "-1", "--pretty=%s"])
        
        sha = sha_res.stdout.strip()
        title = title_res.stdout.strip()
        
        return sha, title
    except DeployError:
        raise
    except Exception as e:
        raise GitError(f"Failed to get commit info: {e}")


def git_add_includes(config: DeployConfig) -> None:
    """Stage only included paths with retry mechanism"""
    try:
        for p in INCLUDE_PATHS:
            path = REPO_ROOT / p
            if path.exists():
                # Force-add the .vercel/project.json even if ignored elsewhere
                if p == ".vercel/project.json":
                    Shell.run_with_retry(["git", "add", "-f", p], config.max_retries, config.retry_delay)
                else:
                    Shell.run_with_retry(["git", "add", p], config.max_retries, config.retry_delay)
    except DeployError as e:
        raise GitError(f"Failed to stage files: {e}")


def git_has_staged_changes() -> bool:
    """Check staged changes with error handling"""
    try:
        res = Shell.run_no_check(["git", "diff", "--cached", "--name-only"])
        return len(res.stdout.strip()) > 0
    except DeployError:
        return False


def git_commit(message: str, config: DeployConfig) -> Optional[str]:
    """Commit changes with retry mechanism"""
    try:
        # Stage includes first
        git_add_includes(config)
        
        # If still nothing staged, return None
        if not git_has_staged_changes():
            return None
            
        # Commit with retry
        Shell.run_with_retry(["git", "commit", "-m", message], config.max_retries, config.retry_delay)
        
        # Return the new commit SHA
        sha_res = Shell.run(["git", "rev-parse", "HEAD"])
        return sha_res.stdout.strip()
    except DeployError as e:
        raise GitError(f"Failed to commit changes: {e}")


def git_push(branch: str, config: DeployConfig) -> None:
    """Push to remote with enhanced error handling and retry"""
    try:
        # Ensure we are on the target branch; switch if needed
        curr = current_branch()
        if curr != branch:
            # Create branch if it does not exist locally
            res = Shell.run_no_check(["git", "rev-parse", "--verify", branch])
            if res.returncode != 0:
                Shell.run_with_retry(["git", "checkout", "-b", branch], config.max_retries, config.retry_delay)
            else:
                Shell.run_with_retry(["git", "checkout", branch], config.max_retries, config.retry_delay)
        
        # Push to origin with retry
        Shell.run_with_retry(["git", "push", "-u", "origin", branch], config.max_retries, config.retry_delay)
        
    except DeployError as e:
        raise GitError(f"Failed to push to {branch}: {e}")


def git_rollback(previous_sha: str, config: DeployConfig) -> None:
    """Rollback to previous commit if deployment fails"""
    if not config.enable_rollback:
        return
        
    try:
        print(f"Rolling back to previous commit: {previous_sha}")
        Shell.run_with_retry(["git", "reset", "--hard", previous_sha], config.max_retries, config.retry_delay)
        Shell.run_with_retry(["git", "push", "--force", config.remote_name, current_branch()], config.max_retries, config.retry_delay)
        print("Rollback completed successfully")
    except DeployError as e:
        print(f"Rollback failed: {e}", file=sys.stderr)


# ---------------- Repository Management Functions ----------------

def get_remote_url(remote_name: str = "origin") -> Optional[str]:
    """Get the URL of a remote repository"""
    try:
        res = Shell.run_no_check(["git", "remote", "get-url", remote_name])
        if res.returncode == 0:
            return res.stdout.strip()
        return None
    except DeployError:
        return None


def list_remotes() -> Dict[str, str]:
    """List all remote repositories"""
    try:
        res = Shell.run(["git", "remote", "-v"])
        remotes = {}
        for line in res.stdout.strip().split('\n'):
            if line.strip():
                parts = line.split()
                if len(parts) >= 2:
                    name = parts[0]
                    url = parts[1]
                    remotes[name] = url
        return remotes
    except DeployError:
        return {}


def add_remote(name: str, url: str, config: DeployConfig) -> None:
    """Add a new remote repository"""
    try:
        # Check if remote already exists
        existing_url = get_remote_url(name)
        if existing_url:
            if existing_url != url:
                print(f"Remote '{name}' already exists with different URL: {existing_url}")
                print(f"Updating to: {url}")
                Shell.run_with_retry(["git", "remote", "set-url", name, url], config.max_retries, config.retry_delay)
            else:
                print(f"Remote '{name}' already exists with correct URL")
        else:
            Shell.run_with_retry(["git", "remote", "add", name, url], config.max_retries, config.retry_delay)
            print(f"Added remote '{name}': {url}")
    except DeployError as e:
        raise GitError(f"Failed to add remote '{name}': {e}")


def list_branches(remote: bool = False) -> List[str]:
    """List local or remote branches"""
    try:
        cmd = ["git", "branch", "-r"] if remote else ["git", "branch"]
        res = Shell.run(cmd)
        branches = []
        for line in res.stdout.strip().split('\n'):
            if line.strip():
                branch = line.strip().lstrip('* ').split('/')[-1]  # Remove remote prefix
                if branch and branch != "HEAD":
                    branches.append(branch)
        return branches
    except DeployError:
        return []


def branch_exists(branch_name: str, remote: bool = False) -> bool:
    """Check if a branch exists locally or remotely"""
    try:
        if remote:
            res = Shell.run_no_check(["git", "ls-remote", "--heads", "origin", branch_name])
            return res.returncode == 0 and branch_name in res.stdout
        else:
            res = Shell.run_no_check(["git", "rev-parse", "--verify", branch_name])
            return res.returncode == 0
    except DeployError:
        return False


def create_branch(branch_name: str, config: DeployConfig, source_branch: Optional[str] = None) -> None:
    """Create a new branch"""
    try:
        if branch_exists(branch_name):
            print(f"Branch '{branch_name}' already exists")
            return
            
        if source_branch:
            # Create from specific branch
            Shell.run_with_retry(["git", "checkout", "-b", branch_name, source_branch], config.max_retries, config.retry_delay)
        else:
            # Create from current branch
            Shell.run_with_retry(["git", "checkout", "-b", branch_name], config.max_retries, config.retry_delay)
        
        print(f"Created branch '{branch_name}'")
    except DeployError as e:
        raise GitError(f"Failed to create branch '{branch_name}': {e}")


def switch_to_branch(branch_name: str, config: DeployConfig) -> None:
    """Switch to a specific branch"""
    try:
        current = current_branch()
        if current == branch_name:
            print(f"Already on branch '{branch_name}'")
            return
            
        # Check if branch exists locally
        if branch_exists(branch_name):
            Shell.run_with_retry(["git", "checkout", branch_name], config.max_retries, config.retry_delay)
        elif branch_exists(branch_name, remote=True):
            # Create local tracking branch from remote
            Shell.run_with_retry(["git", "checkout", "-b", branch_name, f"{config.remote_name}/{branch_name}"], config.max_retries, config.retry_delay)
        else:
            raise GitError(f"Branch '{branch_name}' does not exist locally or remotely")
            
        print(f"Switched to branch '{branch_name}'")
    except DeployError as e:
        raise GitError(f"Failed to switch to branch '{branch_name}': {e}")


def setup_repository_and_branch(config: DeployConfig) -> str:
    """Setup repository and branch according to configuration"""
    logger = logging.getLogger(__name__)
    
    # Store current state for potential rollback
    original_branch = current_branch()
    original_sha = Shell.run(["git", "rev-parse", "HEAD"]).stdout.strip()
    
    try:
        # Handle target repository
        if config.target_repo:
            logger.info(f"Setting up target repository: {config.target_repo}")
            
            # Check if it's a URL or remote name
            if config.target_repo.startswith(('http://', 'https://', 'git@')):
                # It's a URL, add as remote
                add_remote(config.remote_name, config.target_repo, config)
            else:
                # It's a remote name, verify it exists
                remotes = list_remotes()
                if config.target_repo not in remotes:
                    raise GitError(f"Remote '{config.target_repo}' does not exist")
                config.remote_name = config.target_repo
        
        # Handle branch operations
        if config.switch_branch and config.target_branch != original_branch:
            logger.info(f"Switching to target branch: {config.target_branch}")
            
            if not branch_exists(config.target_branch) and not branch_exists(config.target_branch, remote=True):
                if config.create_branch:
                    # Create new branch from source
                    source = config.source_branch or original_branch
                    create_branch(config.target_branch, config, source)
                else:
                    raise GitError(f"Branch '{config.target_branch}' does not exist and create_branch is False")
            else:
                switch_to_branch(config.target_branch, config)
        
        # Fetch latest changes from remote
        if config.push_to_remote:
            logger.info("Fetching latest changes from remote")
            Shell.run_with_retry(["git", "fetch", config.remote_name], config.max_retries, config.retry_delay)
        
        return original_sha
        
    except DeployError as e:
        logger.error(f"Repository setup failed: {e}")
        # Attempt to restore original state
        try:
            Shell.run_with_retry(["git", "checkout", original_branch], config.max_retries, config.retry_delay)
        except:
            pass
        raise e


# ---------------- Vercel API helpers ----------------

class VercelAPI:
    def __init__(self, token: str, project: str, org_id: Optional[str] = None, config: Optional[DeployConfig] = None):
        self.token = token
        self.project = project  # name or id
        self.org_id = org_id
        self.config = config or DeployConfig()

    def _request(self, method: str, url: str, params: Optional[Dict[str, Any]] = None, retries: int = 3) -> Dict[str, Any]:
        """Make HTTP request with retry mechanism"""
        last_error = None
        
        for attempt in range(retries):
            try:
                if params:
                    url = f"{url}?{urlencode(params)}"
                req = Request(url, method=method)
                req.add_header("Authorization", f"Bearer {self.token}")
                req.add_header("Content-Type", "application/json")
                req.add_header("User-Agent", "Zignals-Deploy-Script/1.0")
                
                with urlopen(req, timeout=self.config.health_check_timeout) as resp:
                    data = json.loads(resp.read().decode("utf-8"))
                    return data
                    
            except HTTPError as e:
                body = e.read().decode("utf-8", errors="ignore")
                last_error = VercelError(f"Vercel API HTTPError {e.code}: {body}")
                
                # Don't retry on client errors (4xx)
                if 400 <= e.code < 500:
                    raise last_error
                    
            except URLError as e:
                last_error = VercelError(f"Vercel API URLError: {e}")
                
            except Exception as e:
                last_error = VercelError(f"Unexpected error: {e}")
            
            # Wait before retry
            if attempt < retries - 1:
                time.sleep(self.config.retry_delay * (attempt + 1))  # Exponential backoff
        
        raise last_error or VercelError("Max retries exceeded")

    def list_deployments_v13(self, limit: int = 20) -> Dict[str, Any]:
        """List deployments with enhanced error handling"""
        try:
            params: Dict[str, Any] = {"project": self.project, "limit": str(limit)}
            if self.org_id:
                params["teamId"] = self.org_id
            return self._request("GET", "https://api.vercel.com/v13/deployments", params)
        except VercelError as e:
            raise e
        except Exception as e:
            raise VercelError(f"Failed to list deployments: {e}")

    def get_deployment_status(self, deployment_id: str) -> Dict[str, Any]:
        """Get specific deployment status"""
        try:
            url = f"https://api.vercel.com/v13/deployments/{deployment_id}"
            return self._request("GET", url)
        except VercelError as e:
            raise e
        except Exception as e:
            raise VercelError(f"Failed to get deployment status: {e}")

    def cancel_deployment(self, deployment_id: str) -> bool:
        """Cancel a deployment"""
        try:
            url = f"https://api.vercel.com/v13/deployments/{deployment_id}/cancel"
            self._request("PATCH", url)
            return True
        except VercelError as e:
            print(f"Failed to cancel deployment: {e}")
            return False


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
    """Wait for deployment with enhanced error handling and progress tracking"""
    deadline = time.time() + timeout_minutes * 60
    last_state = "UNKNOWN"
    consecutive_errors = 0
    max_consecutive_errors = 3
    
    print(f"Waiting for deployment on branch '{branch}' (target: {target})...")
    
    while time.time() < deadline:
        try:
            data = vercel.list_deployments_v13(limit=20)
            dep = select_latest_deployment(data, branch=branch, target=target)
            
            if dep is None:
                last_state = "NOT_FOUND"
                print("No deployment found, continuing to wait...")
            else:
                state = dep.get("readyState") or dep.get("state") or "UNKNOWN"
                last_state = state
                dep_id = dep.get("uid") or dep.get("id", "unknown")
                
                print(f"Deployment {dep_id}: {state}")
                
                if state in ("READY", "BUILDING", "INITIALIZING", "QUEUED"):
                    if state == "READY":
                        print(f"✅ Deployment {dep_id} is ready!")
                        return dep, state
                    else:
                        print(f"⏳ Deployment {dep_id} is {state.lower()}...")
                        
                elif state in ("ERROR", "CANCELED"):
                    print(f"❌ Deployment {dep_id} failed with state: {state}")
                    return dep, state
                    
                elif state in ("FAILED", "TIMEOUT"):
                    print(f"💥 Deployment {dep_id} failed: {state}")
                    return dep, state
            
            consecutive_errors = 0  # Reset error counter on success
            
        except VercelError as e:
            consecutive_errors += 1
            last_state = f"VERCEL_ERROR: {e}"
            print(f"⚠️  Vercel API error ({consecutive_errors}/{max_consecutive_errors}): {e}")
            
            if consecutive_errors >= max_consecutive_errors:
                print("❌ Too many consecutive Vercel API errors, giving up")
                return None, last_state
                
        except Exception as e:
            consecutive_errors += 1
            last_state = f"ERROR: {e}"
            print(f"⚠️  Unexpected error ({consecutive_errors}/{max_consecutive_errors}): {e}")
            
            if consecutive_errors >= max_consecutive_errors:
                print("❌ Too many consecutive errors, giving up")
                return None, last_state
        
        # Wait before next check
        time.sleep(10)
    
    print(f"⏰ Deployment timeout after {timeout_minutes} minutes")
    return None, f"TIMEOUT: {last_state}"


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


def perform_health_checks(base_url: str, config: DeployConfig) -> List[Tuple[str, int, float]]:
    """Perform comprehensive health checks with retry mechanism"""
    results: List[Tuple[str, int, float]] = []
    
    # Ensure https scheme
    if base_url.startswith("http://") or base_url.startswith("https://"):
        origin = base_url
    else:
        origin = f"https://{base_url}"

    # Enhanced endpoint list for better health checking
    endpoints = [
        ("/", "Homepage"),
        ("/api/health", "Health API"),
        ("/favicon.ico", "Favicon"),
        ("/api/debug-auth", "Auth Debug"),
        ("/test-payment", "Test Payment Page")
    ]
    
    print(f"🔍 Performing health checks on {origin}")
    
    for ep, description in endpoints:
        url = origin.rstrip("/") + ep
        status = 0
        latency = 0.0
        success = False
        
        # Retry with exponential backoff
        for attempt in range(HC_RETRIES):
            try:
                status, latency = http_get(url, timeout=config.health_check_timeout)
                
                if status and status < 500 and status != 404:
                    success = True
                    print(f"✅ {description} ({ep}): {status} in {latency:.2f}s")
                    break
                else:
                    print(f"⚠️  {description} ({ep}): {status} (attempt {attempt + 1}/{HC_RETRIES})")
                    
            except Exception as e:
                print(f"❌ {description} ({ep}): Error - {e} (attempt {attempt + 1}/{HC_RETRIES})")
            
            if attempt < HC_RETRIES - 1:
                time.sleep(config.retry_delay * (attempt + 1))
        
        if not success:
            print(f"💥 {description} ({ep}): Failed after {HC_RETRIES} attempts")
            
        results.append((ep, status, latency))
    
    return results


def deploy_with_fallback(config: DeployConfig, logger: logging.Logger) -> Tuple[Optional[Dict[str, Any]], str]:
    """Deploy with fallback mechanism between GitHub integration and Vercel CLI"""
    dep: Optional[Dict[str, Any]] = None
    dep_state: str = "SKIPPED"
    
    # Try GitHub integration first (if configured)
    if not config.fallback_to_cli:
        logger.info("Attempting deployment via GitHub integration")
        try:
            token = os.environ.get("VERCEL_TOKEN")
            project = os.environ.get("VERCEL_PROJECT_ID")
            org = os.environ.get("VERCEL_ORG_ID")
            
            if not token or not project:
                raise VercelError("Missing VERCEL_TOKEN or VERCEL_PROJECT_ID env variables")
            
            vercel = VercelAPI(token=token, project=project, org_id=org, config=config)
            dep, dep_state = wait_for_vercel_deployment(
                vercel, 
                branch=config.target_branch, 
                target="production",
                timeout_minutes=config.deployment_timeout
            )
            
            if dep_state == "READY":
                logger.info("✅ GitHub integration deployment successful")
                return dep, dep_state
            else:
                logger.warning(f"GitHub integration deployment failed: {dep_state}")
                
        except VercelError as e:
            logger.error(f"GitHub integration failed: {e}")
            if not config.fallback_to_cli:
                raise e
    
    # Fallback to Vercel CLI
    if config.fallback_to_cli:
        logger.info("Attempting deployment via Vercel CLI (fallback)")
        try:
            cli_cmd = ["vercel", "deploy", "--prod", "--confirm"]
            
            # Add timeout to CLI command
            cli_res = Shell.run_no_check(cli_cmd, timeout=config.deployment_timeout * 60)
            
            if cli_res.returncode == 0:
                logger.info("✅ Vercel CLI deployment successful")
                
                # Try to extract URL from CLI output
                url = None
                for line in cli_res.stdout.splitlines():
                    if line.strip().startswith("https://") and ".vercel.app" in line:
                        url = line.strip()
                        break
                
                if url:
                    dep_state = "READY"
                    dep = {"url": url, "state": "READY", "uid": "cli-deployment"}
                else:
                    dep_state = "CLI_SUCCESS_NO_URL"
                    
            else:
                logger.error(f"Vercel CLI failed: {cli_res.stderr}")
                dep_state = "CLI_ERROR"
                
        except DeployError as e:
            logger.error(f"Vercel CLI deployment failed: {e}")
            dep_state = "CLI_ERROR"
    
    return dep, dep_state


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
    parser = argparse.ArgumentParser(description="Enhanced Push and Deploy to Vercel with Repository Management")
    parser.add_argument("--branch", default="main", help="Target branch to push/deploy (default: main)")
    parser.add_argument("-m", "--message", default=DEFAULT_COMMIT_MESSAGE, help="Commit message (Conventional Commits)")

    # Repository and branch management
    parser.add_argument("--target-repo", help="Target repository URL or remote name")
    parser.add_argument("--source-branch", help="Source branch for creating new branches")
    parser.add_argument("--create-branch", action="store_true", help="Create branch if it doesn't exist")
    parser.add_argument("--no-switch-branch", action="store_true", help="Don't switch to target branch")
    parser.add_argument("--no-push", action="store_true", help="Don't push to remote repository")
    parser.add_argument("--remote-name", default="origin", help="Remote repository name (default: origin)")

    # Deployment mode
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--via-github", action="store_true", help="Push to GitHub (default) and poll Vercel for deployment")
    mode.add_argument("--vercel-cli", action="store_true", help="Use Vercel CLI to deploy (also pushes by default)")
    mode.add_argument("--fallback-to-cli", action="store_true", help="Try GitHub first, fallback to CLI on failure")

    parser.add_argument("--preview", action="store_true", help="Deploy/poll preview target instead of production")
    parser.add_argument("--prod", action="store_true", help="For Vercel CLI: use --prod (default if not preview)")

    # Enhanced error handling and retry options
    parser.add_argument("--max-retries", type=int, default=3, help="Maximum retry attempts (default: 3)")
    parser.add_argument("--retry-delay", type=int, default=5, help="Delay between retries in seconds (default: 5)")
    parser.add_argument("--health-check-timeout", type=int, default=30, help="Health check timeout in seconds (default: 30)")
    parser.add_argument("--deployment-timeout", type=int, default=20, help="Deployment timeout in minutes (default: 20)")
    parser.add_argument("--no-rollback", action="store_true", help="Disable automatic rollback on failure")

    # Utility options
    parser.add_argument("--skip-push", action="store_true", help="Skip git push (advanced)")
    parser.add_argument("--dry-run", action="store_true", help="Do not push/deploy; print actions only")
    parser.add_argument("--verbose", action="store_true", help="Enable verbose logging")
    parser.add_argument("--list-remotes", action="store_true", help="List available remote repositories and exit")
    parser.add_argument("--list-branches", action="store_true", help="List available branches and exit")

    args = parser.parse_args(argv)

    # Create enhanced configuration
    config = DeployConfig(
        max_retries=args.max_retries,
        retry_delay=args.retry_delay,
        health_check_timeout=args.health_check_timeout,
        deployment_timeout=args.deployment_timeout,
        fallback_to_cli=args.fallback_to_cli or args.vercel_cli,
        enable_rollback=not args.no_rollback,
        verbose_logging=args.verbose,
        target_repo=args.target_repo,
        target_branch=args.branch,
        source_branch=args.source_branch,
        create_branch=args.create_branch,
        switch_branch=not args.no_switch_branch,
        push_to_remote=not args.no_push,
        remote_name=args.remote_name
    )

    # Handle utility commands
    if args.list_remotes:
        print("Available remote repositories:")
        remotes = list_remotes()
        for name, url in remotes.items():
            print(f"  {name}: {url}")
        return 0

    if args.list_branches:
        print("Available branches:")
        local_branches = list_branches(remote=False)
        remote_branches = list_branches(remote=True)
        print("  Local branches:")
        for branch in local_branches:
            print(f"    {branch}")
        print("  Remote branches:")
        for branch in remote_branches:
            print(f"    {branch}")
        return 0

    # Enhanced deployment with context management
    try:
        with deployment_context(config) as logger:
            ensure_git_repo()

            if is_rebase_in_progress(REPO_ROOT):
                raise GitError("Rebase in progress detected. Please resolve and run again.", retryable=False)

            # Setup repository and branch
            original_sha = setup_repository_and_branch(config)
            logger.info(f"Repository setup complete. Original SHA: {original_sha}")

            # Stage/commit with enhanced error handling
            if args.dry_run:
                logger.info("[DRY RUN] Would stage included paths:")
                for p in INCLUDE_PATHS:
                    logger.info(f"  - {p}")
            else:
                git_add_includes(config)

            sha_before = Shell.run(["git", "rev-parse", "HEAD"]).stdout.strip()

            if args.dry_run:
                logger.info(f"[DRY RUN] Would commit with message:\n{args.message}")
            else:
                new_sha = git_commit(args.message, config)
                if new_sha:
                    logger.info(f"Committed {new_sha}")
                else:
                    logger.info("No changes to commit. Proceeding with push.")

            # Push with enhanced error handling
            if not args.skip_push and config.push_to_remote:
                if args.dry_run:
                    logger.info(f"[DRY RUN] Would push to {config.remote_name} {config.target_branch}")
                else:
                    git_push(config.target_branch, config)
            else:
                logger.info("Skipping push per configuration")

            # Deploy with fallback mechanism
            dep: Optional[Dict[str, Any]] = None
            dep_state: str = "SKIPPED"
            health: Optional[List[Tuple[str, int, float]]] = None

            if not args.dry_run:
                dep, dep_state = deploy_with_fallback(config, logger)
                
                if dep and dep_state == "READY":
                    url = dep.get("url")
                    if url:
                        logger.info(f"Deployment successful: {url}")
                        health = perform_health_checks(url, config)
                    else:
                        logger.warning("Deployment successful but no URL found")
                else:
                    logger.error(f"Deployment failed: {dep_state}")
                    if config.enable_rollback and original_sha:
                        logger.info("Attempting rollback...")
                        git_rollback(original_sha, config)
            else:
                dep_state = "DRY_RUN"
                logger.info("[DRY RUN] Deployment skipped")

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
                config.target_branch,
                commit_sha,
                commit_title,
                diff_summary,
                dep,
                dep_state,
                health,
            )

            logger.info(f"Report written to {report_path}")
            
            if dep_state == "READY":
                logger.info("🎉 Deployment completed successfully!")
                return 0
            else:
                logger.error(f"❌ Deployment failed with state: {dep_state}")
                return 1

    except DeployError as e:
        print(f"❌ Deployment error: {e}", file=sys.stderr)
        return 1
    except KeyboardInterrupt:
        print("🛑 Deployment interrupted by user", file=sys.stderr)
        return 130
    except Exception as e:
        print(f"💥 Unexpected error: {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())

