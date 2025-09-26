#!/usr/bin/env python3

"""
Enhanced script to push your project to GitHub
Target repository: dagz55/zignal-login.git
"""

import subprocess
import sys
import os
from typing import Tuple, Optional

# --- Configuration ---
# Allow overriding via environment variables
REPO_URL = os.environ.get("GIT_REPO_URL", "https://github.com/dagz55/zignal-login.git")
DEFAULT_BRANCH = os.environ.get("GIT_DEFAULT_BRANCH", "main")
DEFAULT_COMMIT_MESSAGE = "Update project files"

# --- Color Codes for Output ---
class Colors:
    """ANSI color codes for terminal output"""
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def c_print(color: str, message: str):
    """Prints a message in a specified color."""
    print(f"{color}{message}{Colors.ENDC}")

# --- Git Operations Class ---
class GitPusher:
    """Handles all Git-related operations for pushing the project."""

    def __init__(self, repo_url: str, default_branch: str, dry_run: bool = False, use_rebase: bool = False):
        self.repo_url = repo_url
        self.default_branch = default_branch
        self.current_branch = self._get_current_branch() or default_branch
        self.dry_run = dry_run
        self.use_rebase = use_rebase

    def _run_command(self, command: str, capture_output: bool = True, check_error: bool = True) -> Tuple[int, str, str]:
        """Runs a shell command and returns its exit code, stdout, and stderr."""
        c_print(Colors.OKCYAN, f"Executing: {command}")
        if self.dry_run and not command.startswith("git status") and not command.startswith("git diff"):
            c_print(Colors.WARNING, "Dry Run: Command not executed.")
            return 0, "Dry run mode", ""
        try:
            process = subprocess.run(
                command,
                shell=True,
                capture_output=capture_output,
                text=True,
                check=False
            )
            if check_error and process.returncode != 0 and process.stderr:
                c_print(Colors.FAIL, f"Command failed with error: {process.stderr}")
            return process.returncode, process.stdout.strip(), process.stderr.strip()
        except FileNotFoundError:
            c_print(Colors.FAIL, f"Command not found: {command.split()[0]}")
            return -1, "", f"Command not found: {command.split()[0]}"
        except Exception as e:
            c_print(Colors.FAIL, f"An unexpected error occurred: {e}")
            return -1, "", f"An unexpected error occurred: {e}"

    def _get_current_branch(self) -> Optional[str]:
        """Gets the current Git branch name, or None if not in a Git repo."""
        code, stdout, _ = self._run_command("git rev-parse --abbrev-ref HEAD", check_error=False)
        if code == 0:
            return stdout
        return None

    def check_git_installed(self) -> bool:
        """Checks if Git is installed and available in the system's PATH."""
        c_print(Colors.HEADER, "Checking for Git installation...")
        exit_code, _, _ = self._run_command("command -v git", check_error=False)
        if exit_code == 0:
            c_print(Colors.OKGREEN, "Git is installed.")
            return True
        c_print(Colors.FAIL, "Error: Git is not installed. Please install Git to proceed.")
        return False

    def initialize_repo(self) -> bool:
        """Initializes a Git repository if one doesn't already exist."""
        if self._get_current_branch():
            c_print(Colors.OKGREEN, "Git repository already exists.")
            return True
        
        c_print(Colors.HEADER, "Initializing new Git repository...")
        exit_code, _, stderr = self._run_command(f"git init -b {self.current_branch}")
        if exit_code != 0:
            c_print(Colors.FAIL, f"Failed to initialize Git repository. Error: {stderr}")
            return False
        c_print(Colors.OKGREEN, f"Git repository initialized on branch '{self.current_branch}'.")
        return True

    def setup_remote(self) -> bool:
        """Sets up or updates the 'origin' remote URL."""
        c_print(Colors.HEADER, "Configuring remote repository...")
        exit_code, current_url, _ = self._run_command("git remote get-url origin", check_error=False)
        
        if exit_code != 0: # Remote 'origin' does not exist
            c_print(Colors.OKBLUE, f"Adding remote 'origin' with URL: {self.repo_url}")
            exit_code, _, stderr = self._run_command(f"git remote add origin {self.repo_url}")
            if exit_code != 0:
                c_print(Colors.FAIL, f"Failed to add remote 'origin'. Error: {stderr}")
                return False
        elif current_url != self.repo_url:
            c_print(Colors.OKBLUE, f"Updating remote 'origin' URL to: {self.repo_url}")
            exit_code, _, stderr = self._run_command(f"git remote set-url origin {self.repo_url}")
            if exit_code != 0:
                c_print(Colors.FAIL, f"Failed to update remote 'origin' URL. Error: {stderr}")
                return False
        else:
            c_print(Colors.OKGREEN, "Remote 'origin' is already configured correctly.")
        return True

    def add_files(self) -> bool:
        """Adds all files to the staging area."""
        c_print(Colors.HEADER, "Adding files to staging...")
        exit_code, _, stderr = self._run_command("git add .")
        if exit_code != 0:
            c_print(Colors.FAIL, f"Failed to add files. Error: {stderr}")
            return False
        c_print(Colors.OKGREEN, "All files added to staging.")
        return True

    def commit_changes(self) -> bool:
        """Commits staged changes, prompting for a commit message."""
        c_print(Colors.HEADER, "Committing changes...")
        
        # Check if there are any changes to commit (staged or unstaged)
        status_code, status_output, _ = self._run_command("git status --porcelain", check_error=False)
        if status_code != 0 or not status_output:
            c_print(Colors.OKGREEN, "No changes to commit.")
            return True

        # Check if there are staged changes
        diff_staged_code, _, _ = self._run_command("git diff --staged --quiet", check_error=False)
        if diff_staged_code == 0: # No staged changes
            c_print(Colors.WARNING, "No changes are staged for commit. Staging all changes.")
            if not self.add_files():
                return False

        commit_message = input(f"Enter commit message (default: {DEFAULT_COMMIT_MESSAGE}): ").strip()
        if not commit_message:
            commit_message = DEFAULT_COMMIT_MESSAGE
        
        c_print(Colors.OKBLUE, f"Committing with message: '{commit_message}'")
        
        if self.dry_run:
            c_print(Colors.WARNING, "Dry Run: Commit not executed.")
            return True

        # Use subprocess.run directly for commit to better capture output and errors
        process = subprocess.run(
            f'git commit -m "{commit_message}"',
            shell=True,
            capture_output=True,
            text=True,
            check=False
        )
        
        if process.returncode != 0:
            if "nothing to commit" in process.stdout or "nothing to commit" in process.stderr:
                c_print(Colors.OKGREEN, "No changes to commit.")
                return True
            c_print(Colors.FAIL, f"Failed to commit files. Error: {process.stderr}")
            return False
        
        c_print(Colors.OKGREEN, "Changes committed successfully.")
        return True

    def push_changes(self, force: bool = False) -> bool:
        """Pushes committed changes to the remote repository."""
        c_print(Colors.HEADER, f"Pushing to '{self.current_branch}' branch...")
        push_command = f"git push -u origin {self.current_branch}"
        if force:
            push_command += " --force"

        exit_code, stdout, stderr = self._run_command(push_command)
        
        if exit_code == 0:
            c_print(Colors.OKGREEN, "Push successful!")
            return True

        # Handle common push errors
        if "non-fast-forward" in stderr or "Updates were rejected" in stderr:
            c_print(Colors.FAIL, "Push failed: The remote has changes you don't have locally.")
            c_print(Colors.WARNING, "You need to integrate the remote changes before pushing again.")
            pull_choice = input("Attempt to pull and integrate remote changes? (y/n): ").lower()
            if pull_choice == 'y':
                return self._pull_and_retry_push()
            else:
                c_print(Colors.FAIL, "Aborting. Please run 'git pull' or 'git pull --rebase' manually, resolve any conflicts, and then push again.")
                return False
        elif "Authentication failed" in stderr or "could not read Username" in stderr:
            c_print(Colors.FAIL, "Push failed: Authentication error.")
            c_print(Colors.WARNING, "Please ensure your Git credentials are correct and you have permission to push to the repository.")
            return False
        elif "repository not found" in stderr:
            c_print(Colors.FAIL, "Push failed: Remote repository not found.")
            c_print(Colors.WARNING, f"Please verify that the repository URL ({self.repo_url}) is correct and you have access.")
            return False
        else:
            c_print(Colors.FAIL, f"An unexpected error occurred during push: {stderr}")
            c_print(Colors.WARNING, "Please check your network connection and Git configuration.")
            return False

    def _pull_and_retry_push(self) -> bool:
        """Pulls remote changes and retries the push."""
        c_print(Colors.HEADER, "Attempting to pull and integrate remote changes...")
        pull_method = "--rebase" if self.use_rebase else "--no-rebase"
        pull_command = f"git pull {pull_method} origin {self.current_branch}"
        exit_code, stdout, stderr = self._run_command(pull_command)

        if exit_code != 0:
            c_print(Colors.FAIL, f"Failed to pull changes. Error: {stderr}")
            c_print(Colors.WARNING, "Please resolve any merge/rebase conflicts manually and then commit and push.")
            return False
        
        c_print(Colors.OKGREEN, "Pull successful. Retrying push...")
        return self.push_changes()

    def run(self, force_push: bool = False):
        """Executes the full sequence of Git operations."""
        c_print(Colors.HEADER, "\n--- GitHub Push Script (Python Version) ---")
        c_print(Colors.HEADER, "-------------------------------------------")
        if self.dry_run:
            c_print(Colors.WARNING + Colors.BOLD, "DRY RUN MODE ENABLED: No actual Git commands will modify the repository.")
        
        if not self.check_git_installed():
            sys.exit(1)
        
        c_print(Colors.HEADER, "\nCurrent Git Status:")
        self._run_command("git status", capture_output=False, check_error=False)
        print("-" * 40)

        if not self.initialize_repo():
            sys.exit(1)
        
        if not self.setup_remote():
            sys.exit(1)
        
        if not self.add_files():
            sys.exit(1)
        
        if not self.commit_changes():
            sys.exit(1)
        
        if not self.push_changes(force=force_push):
            c_print(Colors.FAIL, "Script finished with errors.")
            sys.exit(1)
        
        c_print(Colors.BOLD + Colors.OKGREEN, f"\nSuccessfully pushed project to {self.repo_url}")
        c_print(Colors.OKBLUE, f"View your repository at: {self.repo_url}")

# --- Main Execution ---
def main():
    """Main function to parse arguments and run the GitPusher."""
    import argparse
    parser = argparse.ArgumentParser(description="A script to automate pushing a project to a GitHub repository.")
    parser.add_argument("--force", action="store_true", help="Force push to the remote repository. Use with caution.")
    parser.add_argument("--dry-run", action="store_true", help="Show commands that would be executed without running them.")
    parser.add_argument("--rebase", action="store_true", help="Use git pull --rebase instead of git pull --no-rebase (merge) when integrating remote changes.")
    args = parser.parse_args()

    if args.force:
        c_print(Colors.WARNING, "You are about to perform a force push. This will overwrite the remote history.")
        confirm = input("Are you sure you want to continue? (yes/no): ").lower()
        if confirm != 'yes':
            c_print(Colors.FAIL, "Force push aborted by user.")
            sys.exit(0)

    pusher = GitPusher(REPO_URL, DEFAULT_BRANCH, dry_run=args.dry_run, use_rebase=args.rebase)
    pusher.run(force_push=args.force)

if __name__ == "__main__":
    main()
