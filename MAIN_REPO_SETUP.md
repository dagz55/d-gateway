# Main Repository Setup Guide

## 🎯 **Setting Up Zignals Repository as Main Deployment Target**

This guide shows how to use the enhanced `push_and_deploy.py` script to configure this repository as the main deployment target with comprehensive error handling and repository management.

## 🚀 **Quick Setup Commands**

### 1. **Basic Main Repository Deployment**
```bash
# Deploy to main branch with enhanced error handling
python3 scripts/push_and_deploy.py \
  --branch "main" \
  --fallback-to-cli \
  --max-retries 3 \
  --deployment-timeout 20 \
  --health-check-timeout 30 \
  -m "feat: setup main repository deployment"
```

### 2. **Production-Ready Deployment**
```bash
# Deploy with full production configuration
python3 scripts/push_and_deploy.py \
  --branch "main" \
  --fallback-to-cli \
  --max-retries 5 \
  --retry-delay 10 \
  --deployment-timeout 30 \
  --health-check-timeout 45 \
  --verbose \
  -m "feat: production deployment with enhanced error handling"
```

### 3. **Repository Information Check**
```bash
# Check current repository configuration
python3 scripts/push_and_deploy.py --list-remotes
python3 scripts/push_and_deploy.py --list-branches

# Dry run to see what would be deployed
python3 scripts/push_and_deploy.py --dry-run -m "feat: test deployment"
```

## 🔧 **Repository Configuration Options**

### **Current Repository Setup**
- **Repository Path**: `/Users/robertsuarez/zignals/zignal-login`
- **Target Branch**: `main` (configurable)
- **Remote Name**: `origin` (configurable)
- **Deployment Target**: Production (configurable)

### **Enhanced Configuration**
```bash
# Configure specific repository settings
python3 scripts/push_and_deploy.py \
  --target-repo "origin" \
  --target-branch "main" \
  --remote-name "origin" \
  --create-branch \
  --switch-branch \
  -m "feat: configure main repository settings"
```

## 🛡️ **Error Handling & Reliability**

### **Retry Configuration**
```bash
# Deploy with custom retry settings
python3 scripts/push_and_deploy.py \
  --max-retries 5 \
  --retry-delay 15 \
  --deployment-timeout 25 \
  --health-check-timeout 40 \
  -m "feat: robust deployment with custom retry settings"
```

### **Fallback Strategy**
```bash
# Deploy with fallback to Vercel CLI
python3 scripts/push_and_deploy.py \
  --fallback-to-cli \
  --max-retries 3 \
  -m "feat: deployment with CLI fallback"
```

### **Rollback Protection**
```bash
# Deploy with automatic rollback on failure
python3 scripts/push_and_deploy.py \
  --max-retries 3 \
  --retry-delay 10 \
  -m "feat: deployment with rollback protection"
```

## 📊 **Health Monitoring**

### **Comprehensive Health Checks**
The enhanced script automatically checks:
- `/` - Homepage
- `/api/health` - Health API
- `/favicon.ico` - Favicon
- `/api/debug-auth` - Auth Debug
- `/test-payment` - Test Payment Page

### **Health Check Configuration**
```bash
# Deploy with custom health check timeout
python3 scripts/push_and_deploy.py \
  --health-check-timeout 60 \
  --max-retries 3 \
  -m "feat: deployment with extended health checks"
```

## 🎯 **One-Shot Deployment Examples**

### **Complete Production Deployment**
```bash
python3 scripts/push_and_deploy.py \
  --branch "main" \
  --fallback-to-cli \
  --max-retries 5 \
  --retry-delay 10 \
  --deployment-timeout 30 \
  --health-check-timeout 45 \
  --verbose \
  -m "feat: complete production deployment with enhanced error handling"
```

### **Feature Branch Deployment**
```bash
python3 scripts/push_and_deploy.py \
  --target-branch "feature/enhanced-payments" \
  --create-branch \
  --source-branch "main" \
  --fallback-to-cli \
  --max-retries 3 \
  -m "feat: deploy enhanced payment features"
```

### **Cross-Repository Deployment**
```bash
python3 scripts/push_and_deploy.py \
  --target-repo "https://github.com/zignals/production.git" \
  --branch "main" \
  --remote-name "production" \
  --fallback-to-cli \
  -m "feat: cross-repository production deployment"
```

## 🔍 **Monitoring & Debugging**

### **Verbose Logging**
```bash
# Deploy with detailed logging
python3 scripts/push_and_deploy.py \
  --verbose \
  --dry-run \
  -m "feat: debug deployment process"
```

### **Status Checking**
```bash
# Check deployment status
python3 scripts/push_and_deploy.py \
  --list-remotes \
  --list-branches \
  --dry-run \
  -m "feat: check repository status"
```

## 📋 **Environment Variables**

### **Required for Full Functionality**
```bash
export VERCEL_TOKEN="your_vercel_token"
export VERCEL_PROJECT_ID="your_project_id"
export VERCEL_ORG_ID="your_org_id"  # Optional
```

### **Optional Git Configuration**
```bash
export GIT_USER_NAME="Your Name"
export GIT_USER_EMAIL="your.email@example.com"
```

## 🚀 **Ready-to-Use Commands**

### **Immediate Main Repository Setup**
```bash
# Run this command to set up the main repository deployment
python3 scripts/push_and_deploy.py \
  --branch "main" \
  --fallback-to-cli \
  --max-retries 3 \
  --deployment-timeout 20 \
  --health-check-timeout 30 \
  --verbose \
  -m "feat: setup zignals main repository deployment"
```

### **Production Deployment**
```bash
# Run this for production deployment
python3 scripts/push_and_deploy.py \
  --branch "main" \
  --fallback-to-cli \
  --max-retries 5 \
  --retry-delay 10 \
  --deployment-timeout 30 \
  --health-check-timeout 45 \
  -m "feat: production deployment of zignals trading platform"
```

## ✨ **Enhanced Features Available**

- ✅ **Repository Management**: Switch between repositories and branches
- ✅ **Error Handling**: Comprehensive retry mechanisms and fallback strategies
- ✅ **Health Monitoring**: Multi-endpoint health checks with retry logic
- ✅ **Rollback Protection**: Automatic rollback on deployment failure
- ✅ **Signal Handling**: Graceful interruption with cleanup
- ✅ **Context Management**: Proper resource cleanup and error recovery
- ✅ **One-Shot Deployment**: End-to-end automation with reliability
- ✅ **Detailed Reporting**: Comprehensive deployment reports and diagnostics

The enhanced deploy script is now ready to use this repository as the main deployment target with enterprise-grade reliability and error handling! 🎯
