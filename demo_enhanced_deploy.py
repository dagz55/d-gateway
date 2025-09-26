#!/usr/bin/env python3
"""
Demo script showing how to use the enhanced push_and_deploy.py
to set up this repository as the main deployment target
"""

import subprocess
import sys
from pathlib import Path

def run_command(cmd, description):
    """Run a command and display the result"""
    print(f"\n🔧 {description}")
    print(f"Command: {' '.join(cmd)}")
    print("-" * 50)
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, cwd=Path(__file__).parent)
        if result.stdout:
            print("STDOUT:")
            print(result.stdout)
        if result.stderr:
            print("STDERR:")
            print(result.stderr)
        print(f"Return code: {result.returncode}")
        return result.returncode == 0
    except Exception as e:
        print(f"Error running command: {e}")
        return False

def main():
    """Demonstrate the enhanced deploy script capabilities"""
    print("🚀 Enhanced Deploy Script Demo")
    print("=" * 60)
    print("Setting up Zignals Repository as Main Deployment Target")
    print("=" * 60)
    
    # Check if we're in the right directory
    current_dir = Path.cwd()
    print(f"Current directory: {current_dir}")
    
    if not (current_dir / "scripts" / "push_and_deploy.py").exists():
        print("❌ Enhanced deploy script not found!")
        print("Please run this from the project root directory.")
        return 1
    
    print("✅ Enhanced deploy script found!")
    
    # Demo 1: List repository information
    print("\n📋 Demo 1: Repository Information")
    run_command([
        "python3", "scripts/push_and_deploy.py", "--list-remotes"
    ], "List available remote repositories")
    
    run_command([
        "python3", "scripts/push_and_deploy.py", "--list-branches"
    ], "List available branches")
    
    # Demo 2: Dry run deployment
    print("\n🎯 Demo 2: Dry Run Deployment")
    run_command([
        "python3", "scripts/push_and_deploy.py",
        "--dry-run",
        "--verbose",
        "-m", "feat: setup zignals main repository deployment"
    ], "Dry run deployment to main branch")
    
    # Demo 3: Enhanced deployment with error handling
    print("\n🛡️ Demo 3: Enhanced Deployment Configuration")
    run_command([
        "python3", "scripts/push_and_deploy.py",
        "--dry-run",
        "--branch", "main",
        "--fallback-to-cli",
        "--max-retries", "3",
        "--deployment-timeout", "20",
        "--health-check-timeout", "30",
        "--verbose",
        "-m", "feat: enhanced deployment with error handling"
    ], "Enhanced deployment with retry and fallback mechanisms")
    
    # Demo 4: Production deployment configuration
    print("\n🚀 Demo 4: Production Deployment Setup")
    run_command([
        "python3", "scripts/push_and_deploy.py",
        "--dry-run",
        "--branch", "main",
        "--fallback-to-cli",
        "--max-retries", "5",
        "--retry-delay", "10",
        "--deployment-timeout", "30",
        "--health-check-timeout", "45",
        "--verbose",
        "-m", "feat: production deployment of zignals trading platform"
    ], "Production deployment with comprehensive error handling")
    
    print("\n" + "=" * 60)
    print("🎉 Enhanced Deploy Script Demo Complete!")
    print("=" * 60)
    print("\n📚 Available Commands for Main Repository Setup:")
    print("1. Basic deployment:")
    print("   python3 scripts/push_and_deploy.py --branch main -m 'deploy message'")
    print("\n2. Enhanced deployment with fallback:")
    print("   python3 scripts/push_and_deploy.py --fallback-to-cli --max-retries 3 -m 'deploy message'")
    print("\n3. Production deployment:")
    print("   python3 scripts/push_and_deploy.py --fallback-to-cli --max-retries 5 --deployment-timeout 30 -m 'deploy message'")
    print("\n4. Repository management:")
    print("   python3 scripts/push_and_deploy.py --list-remotes")
    print("   python3 scripts/push_and_deploy.py --list-branches")
    print("\n5. Debug and testing:")
    print("   python3 scripts/push_and_deploy.py --dry-run --verbose -m 'test message'")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
