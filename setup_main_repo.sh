#!/bin/bash

# Setup Main Repository Deployment Script
# This script uses the enhanced push_and_deploy.py to configure this repo as the main deployment target

echo "🚀 Setting up Zignals Repository as Main Deployment Target"
echo "=========================================================="

# Get current repository information
echo "📋 Current Repository Information:"
echo "Repository Path: $(pwd)"
echo "Current Branch: $(git branch --show-current 2>/dev/null || echo 'Unknown')"
echo "Remote Origin: $(git config --get remote.origin.url 2>/dev/null || echo 'Not configured')"

echo ""
echo "🔧 Using Enhanced Deploy Script to Setup Main Repository..."

# Use the enhanced deploy script to set up the main repository
echo "Running enhanced deploy script with main repository configuration..."

# Example 1: Deploy to main branch with enhanced error handling
echo "📦 Example 1: Deploy to main branch with fallback"
python3 scripts/push_and_deploy.py \
  --branch "main" \
  --fallback-to-cli \
  --max-retries 3 \
  --deployment-timeout 20 \
  --health-check-timeout 30 \
  --verbose \
  -m "feat: setup main repository deployment with enhanced error handling"

echo ""
echo "🎯 Repository Setup Complete!"
echo "The enhanced deploy script has been configured to use this repository as the main deployment target."
echo ""
echo "📚 Available Commands:"
echo "  - List remotes: python3 scripts/push_and_deploy.py --list-remotes"
echo "  - List branches: python3 scripts/push_and_deploy.py --list-branches"
echo "  - Dry run: python3 scripts/push_and_deploy.py --dry-run -m 'test message'"
echo "  - Deploy with fallback: python3 scripts/push_and_deploy.py --fallback-to-cli -m 'deploy message'"
echo ""
echo "✨ Enhanced features available:"
echo "  - Repository switching: --target-repo"
echo "  - Branch management: --target-branch, --create-branch"
echo "  - Error handling: --max-retries, --retry-delay"
echo "  - Health monitoring: --health-check-timeout"
echo "  - Rollback protection: --no-rollback (to disable)"
