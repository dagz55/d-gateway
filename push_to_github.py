#!/usr/bin/env python3

"""
Script to push your project to GitHub
Target repository: dagz55/zignal-login.git
Python equivalent of push_to_github.sh
"""

import subprocess
import sys
import os
from typing import Tuple, Optional

# Configuration
REPO_URL = "https://github.com/dagz55/zignal-login.git"
BRANCH_NAME = "main"
DEFAULT_COMMIT_MESSAGE = "Update project files"

def run_command(command: str, capture_output: bool = True) -> Tuple[int, str, str]:
    """
    Run a shell command and return exit code, stdout, and stderr
    
    Args:
        command: The shell command to run
        capture_output: Whether to capture stdout/stderr
    
    Returns:
        Tuple of (exit_code, stdout, stderr)
    """
    try:
        if capture_output:
            result = subprocess.run(
                command, 
                shell=True, 
                capture_output=True, 
                text=True, 
                check=False
            )
            return result.returncode, result.stdout, result.stderr
        else:
            result = subprocess.run(command, shell=True, check=False)
            return result.returncode, "", ""
    except Exception as e:
        print(f"Error running command '{command}': {e}")
        return 1, "", str(e)

def check_git_installed() -> bool:
    """Check if git is installed"""
    exit_code, _, _ = run_command("command -v git")
    return exit_code == 0

def initialize_git_repo() -> bool:
    """Initialize Git repository if it's not already one"""
    if os.path.exists(".git"):
        return True
    
    print("Initializing new Git repository...")
    exit_code, _, stderr = run_command(f"git init -b {BRANCH_NAME}")
    
    if exit_code != 0:
        print(f"Failed to initialize git repository. If a default branch name other than '{BRANCH_NAME}' was created, adjust BRANCH_NAME in this script.")
        print(f"Error: {stderr}")
        return False
    
    print(f"Git repository initialized on branch '{BRANCH_NAME}'.")
    return True

def setup_remote() -> bool:
    """Set up the remote if not already set or if URL is different"""
    exit_code, current_url, _ = run_command("git remote get-url origin")
    remote_exists = exit_code == 0
    
    if not remote_exists:
        print(f"Adding remote 'origin' with URL: {REPO_URL}")
        exit_code, _, stderr = run_command(f"git remote add origin {REPO_URL}")
        if exit_code != 0:
            print(f"Failed to add remote 'origin'. Error: {stderr}")
            return False
    elif current_url.strip() != REPO_URL:
        print(f"Updating remote 'origin' URL to: {REPO_URL}")
        exit_code, _, stderr = run_command(f"git remote set-url origin {REPO_URL}")
        if exit_code != 0:
            print(f"Failed to update remote 'origin' URL. Error: {stderr}")
            return False
    else:
        print(f"Remote 'origin' is already configured to {REPO_URL}.")
    
    return True

def add_files() -> bool:
    """Add all files to staging"""
    print("Adding all files to staging...")
    exit_code, _, stderr = run_command("git add .")
    if exit_code != 0:
        print(f"Failed to add files. Error: {stderr}")
        return False
    return True

def commit_changes() -> bool:
    """Commit the changes"""
    # Check if there are changes to commit
    exit_code, _, _ = run_command("git diff --staged --quiet")
    if exit_code == 0:
        print("No changes staged for commit. If you want to push existing commits, you can run 'git push' manually or re-run this script after making new changes.")
        return True
    
    # Get commit message from user
    commit_message = input(f"Enter commit message (default: {DEFAULT_COMMIT_MESSAGE}): ").strip()
    if not commit_message:
        commit_message = DEFAULT_COMMIT_MESSAGE
    
    print(f"Committing files with message: {commit_message}")
    exit_code, _, stderr = run_command(f'git commit -m "{commit_message}"')
    
    if exit_code != 0:
        print(f"Failed to commit files. This might be because there are no actual changes to commit, or a git pre-commit hook failed.")
        print(f"Error: {stderr}")
        
        # Check if there are still staged changes
        exit_code, _, _ = run_command("git diff --staged --quiet")
        if exit_code != 0:
            return False
    
    return True

def push_changes() -> bool:
    """Push the changes to GitHub"""
    print(f"Pushing to {BRANCH_NAME} branch on remote 'origin'...")
    exit_code, stdout, stderr = run_command(f"git push -u origin {BRANCH_NAME}")
    
    if exit_code != 0:
        # Check for non-fast-forward error
        if "fetch first" in stderr or "non-fast-forward" in stderr:
            print("Push failed: Remote contains work that you do not have locally.")
            print("You need to pull and merge the remote changes first.")
            
            pull_confirm = input("Do you want to pull and merge remote changes now? (y/n): ").strip().lower()
            if pull_confirm in ['y', 'yes']:
                print("Pulling and merging remote changes...")
                exit_code, _, stderr = run_command(f"git pull --no-rebase origin {BRANCH_NAME}")
                
                if exit_code != 0:
                    print(f"Failed to pull and merge remote changes. Please resolve any conflicts and try again.")
                    print(f"Error: {stderr}")
                    return False
                
                print("Retrying push...")
                exit_code, _, stderr = run_command(f"git push -u origin {BRANCH_NAME}")
                
                if exit_code != 0:
                    print(f"Push still failed. Please check for conflicts or other issues.")
                    print(f"Error: {stderr}")
                    return False
            else:
                print("Aborting push. Please pull and merge manually, then re-run this script.")
                return False
        else:
            print("Failed to push to GitHub. Please ensure:")
            print(f"1. The remote repository {REPO_URL} exists and you have push permissions.")
            print(f"2. Your local branch '{BRANCH_NAME}' is up-to-date or can be fast-forwarded.")
            print("3. You have authenticated with Git for GitHub (e.g., using a Personal Access Token or SSH key).")
            print(f"Error: {stderr}")
            return False
    
    return True

def main():
    """Main function to orchestrate the git push process"""
    print("GitHub Push Script (Python Version)")
    print("=" * 40)
    
    # Check if git is installed
    if not check_git_installed():
        print("Error: git is not installed. Please install git first.")
        sys.exit(1)
    
    # Initialize Git repository if needed
    if not initialize_git_repo():
        sys.exit(1)
    
    # Set up remote
    if not setup_remote():
        sys.exit(1)
    
    # Add files
    if not add_files():
        sys.exit(1)
    
    # Commit changes
    if not commit_changes():
        sys.exit(1)
    
    # Push changes
    if not push_changes():
        sys.exit(1)
    
    print("")
    print(f"Successfully pushed project to {REPO_URL}")
    print(f"You can view your repository at: {REPO_URL}")

if __name__ == "__main__":
    main()
