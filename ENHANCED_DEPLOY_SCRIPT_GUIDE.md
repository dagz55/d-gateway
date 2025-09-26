# Enhanced Push and Deploy Script Guide

## Overview

The enhanced `push_and_deploy.py` script provides robust, one-shot deployment capabilities with comprehensive error handling, repository management, and fallback mechanisms for the Zignals Trading Platform.

## Key Features

### 🚀 **One-Shot Deployment**
- Automatic retry mechanisms with exponential backoff
- Fallback from GitHub integration to Vercel CLI
- Comprehensive error recovery and rollback capabilities
- Signal handling for graceful interruption

### 🔧 **Repository Management**
- Dynamic repository switching and branch management
- Support for multiple remote repositories
- Automatic branch creation and switching
- Remote repository URL management

### 🛡️ **Enhanced Error Handling**
- Custom exception hierarchy with retryable/non-retryable errors
- Context managers for cleanup and signal handling
- Comprehensive logging with different verbosity levels
- Automatic rollback on deployment failure

### 📊 **Health Monitoring**
- Multi-endpoint health checks with retry mechanisms
- Real-time deployment status monitoring
- Comprehensive deployment reports
- Performance metrics tracking

## Usage Examples

### Basic Deployment
```bash
# Deploy to main branch with default settings
python3 scripts/push_and_deploy.py -m "feat: enhanced payment system"

# Deploy with verbose logging
python3 scripts/push_and_deploy.py -m "feat: new features" --verbose
```

### Repository and Branch Management
```bash
# Deploy to a different repository
python3 scripts/push_and_deploy.py \
  --target-repo "https://github.com/user/repo.git" \
  --branch "production" \
  -m "feat: production deployment"

# Create and deploy to a new branch
python3 scripts/push_and_deploy.py \
  --target-branch "feature/payment-enhancement" \
  --create-branch \
  --source-branch "main" \
  -m "feat: payment system enhancements"

# Deploy to existing remote repository
python3 scripts/push_and_deploy.py \
  --target-repo "upstream" \
  --branch "main" \
  -m "feat: upstream deployment"
```

### Enhanced Error Handling
```bash
# Deploy with custom retry settings
python3 scripts/push_and_deploy.py \
  --max-retries 5 \
  --retry-delay 10 \
  --deployment-timeout 30 \
  -m "feat: robust deployment"

# Deploy with fallback to CLI
python3 scripts/push_and_deploy.py \
  --fallback-to-cli \
  --health-check-timeout 45 \
  -m "feat: fallback deployment"

# Deploy without rollback
python3 scripts/push_and_deploy.py \
  --no-rollback \
  -m "feat: no rollback deployment"
```

### Utility Commands
```bash
# List available remote repositories
python3 scripts/push_and_deploy.py --list-remotes

# List available branches
python3 scripts/push_and_deploy.py --list-branches

# Dry run to see what would be deployed
python3 scripts/push_and_deploy.py --dry-run -m "feat: test deployment"
```

## Configuration Options

### Repository Management
- `--target-repo`: Target repository URL or remote name
- `--target-branch`: Target branch for deployment (default: main)
- `--source-branch`: Source branch for creating new branches
- `--create-branch`: Create branch if it doesn't exist
- `--no-switch-branch`: Don't switch to target branch
- `--no-push`: Don't push to remote repository
- `--remote-name`: Remote repository name (default: origin)

### Deployment Modes
- `--via-github`: Use GitHub integration (default)
- `--vercel-cli`: Use Vercel CLI directly
- `--fallback-to-cli`: Try GitHub first, fallback to CLI

### Error Handling & Retry
- `--max-retries`: Maximum retry attempts (default: 3)
- `--retry-delay`: Delay between retries in seconds (default: 5)
- `--health-check-timeout`: Health check timeout in seconds (default: 30)
- `--deployment-timeout`: Deployment timeout in minutes (default: 20)
- `--no-rollback`: Disable automatic rollback on failure

### Utility Options
- `--verbose`: Enable verbose logging
- `--dry-run`: Show what would be done without executing
- `--list-remotes`: List available remote repositories
- `--list-branches`: List available branches

## Environment Variables

### Required for GitHub Integration
```bash
export VERCEL_TOKEN="your_vercel_token"
export VERCEL_PROJECT_ID="your_project_id"
export VERCEL_ORG_ID="your_org_id"  # Optional
```

### Optional Git Configuration
```bash
export GIT_USER_NAME="Your Name"
export GIT_USER_EMAIL="your.email@example.com"
```

## Error Handling

### Exception Types
- `DeployError`: Base exception for all deployment errors
- `GitError`: Git operation errors (usually non-retryable)
- `VercelError`: Vercel API/CLI errors (usually retryable)
- `HealthCheckError`: Health check failures (usually retryable)

### Retry Strategy
- **Exponential Backoff**: Retry delays increase with each attempt
- **Error Classification**: Retryable vs non-retryable errors
- **Consecutive Error Limits**: Stop after too many consecutive failures
- **Timeout Handling**: Graceful timeout with proper cleanup

### Rollback Mechanism
- Automatic rollback to previous commit on deployment failure
- Configurable rollback behavior
- Force push to restore repository state
- Rollback status reporting

## Health Checks

### Endpoints Checked
- `/` - Homepage
- `/api/health` - Health API
- `/favicon.ico` - Favicon
- `/api/debug-auth` - Auth Debug
- `/test-payment` - Test Payment Page

### Health Check Features
- Multiple retry attempts with exponential backoff
- Status code validation (2xx, 3xx success)
- Latency measurement
- Comprehensive error reporting

## Deployment Reports

Reports are automatically generated in the `reports/` directory with:
- Timestamp and actor information
- Branch and commit details
- Deployment status and URL
- Health check results
- Error logs and diagnostics

## Best Practices

### 1. **Use Dry Run First**
```bash
python3 scripts/push_and_deploy.py --dry-run -m "feat: test deployment"
```

### 2. **Enable Verbose Logging for Debugging**
```bash
python3 scripts/push_and_deploy.py --verbose -m "feat: debug deployment"
```

### 3. **Use Fallback for Critical Deployments**
```bash
python3 scripts/push_and_deploy.py --fallback-to-cli -m "feat: critical deployment"
```

### 4. **Configure Appropriate Timeouts**
```bash
python3 scripts/push_and_deploy.py \
  --deployment-timeout 30 \
  --health-check-timeout 45 \
  -m "feat: long deployment"
```

### 5. **Test Repository Management**
```bash
# List available options
python3 scripts/push_and_deploy.py --list-remotes
python3 scripts/push_and_deploy.py --list-branches
```

## Troubleshooting

### Common Issues

1. **Repository Not Found**
   - Use `--list-remotes` to see available repositories
   - Check repository URL format
   - Verify remote repository access

2. **Branch Not Found**
   - Use `--list-branches` to see available branches
   - Use `--create-branch` to create new branches
   - Check branch name spelling

3. **Deployment Timeout**
   - Increase `--deployment-timeout` value
   - Check Vercel project configuration
   - Verify environment variables

4. **Health Check Failures**
   - Increase `--health-check-timeout` value
   - Check application endpoints
   - Verify deployment URL

### Debug Mode
```bash
python3 scripts/push_and_deploy.py \
  --verbose \
  --dry-run \
  --list-remotes \
  --list-branches
```

## Integration with CI/CD

### GitHub Actions Example
```yaml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy with Enhanced Script
        run: |
          python3 scripts/push_and_deploy.py \
            --fallback-to-cli \
            --max-retries 3 \
            --deployment-timeout 20 \
            -m "feat: automated deployment from CI"
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
```

## Security Considerations

- Environment variables are handled securely
- No sensitive data is logged in verbose mode
- Repository access is validated before operations
- Rollback operations use force push (use with caution)

## Performance

- Parallel health checks for faster validation
- Exponential backoff reduces API load
- Timeout mechanisms prevent hanging operations
- Efficient git operations with minimal network calls

---

**Note**: This enhanced script is designed for production use with comprehensive error handling and recovery mechanisms. Always test with `--dry-run` first and use appropriate timeouts for your deployment environment.
