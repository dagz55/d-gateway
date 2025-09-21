#!/bin/bash

# MCP Cleanup Script - Remove old individual MCP processes
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Count processes before cleanup
count_mcp_processes() {
    ps aux | grep -E "(mcp|context7|supabase-mcp|puppeteer.*mcp)" | grep -v grep | wc -l | tr -d ' '
}

# Get list of MCP process PIDs
get_mcp_pids() {
    ps aux | grep -E "(mcp|context7|supabase-mcp|puppeteer.*mcp)" | grep -v grep | awk '{print $2}' | tr '\n' ' '
}

log_info "🧹 Starting MCP Remnants Cleanup..."

# Count initial processes
INITIAL_COUNT=$(count_mcp_processes)
log_info "Found $INITIAL_COUNT MCP processes to clean up"

if [ "$INITIAL_COUNT" -eq 0 ]; then
    log_success "No MCP processes found to clean up!"
    exit 0
fi

# Show processes that will be terminated
echo -e "\n${BLUE}📋 Processes to be terminated:${NC}"
ps aux | grep -E "(mcp|context7|supabase-mcp|puppeteer.*mcp)" | grep -v grep | while read line; do
    echo "  🔸 $line"
done

echo ""
read -p "Do you want to proceed with cleanup? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_warning "Cleanup cancelled by user"
    exit 0
fi

log_info "🛑 Stopping individual MCP processes..."

# Get PIDs to terminate
PIDS=$(get_mcp_pids)

if [ -n "$PIDS" ]; then
    log_info "Terminating PIDs: $PIDS"
    
    # First try graceful shutdown (SIGTERM)
    for pid in $PIDS; do
        if kill -0 $pid 2>/dev/null; then
            log_info "Sending SIGTERM to PID $pid"
            kill -TERM $pid 2>/dev/null || true
        fi
    done
    
    # Wait a bit for graceful shutdown
    sleep 3
    
    # Check if any are still running and force kill if needed
    REMAINING_PIDS=$(get_mcp_pids)
    if [ -n "$REMAINING_PIDS" ]; then
        log_warning "Some processes still running, force killing..."
        for pid in $REMAINING_PIDS; do
            if kill -0 $pid 2>/dev/null; then
                log_info "Force killing PID $pid"
                kill -KILL $pid 2>/dev/null || true
            fi
        done
        sleep 1
    fi
fi

# Clean up npm cache and temporary files
log_info "🧹 Cleaning up npm cache and temporary files..."

# Clean npm cache for MCP packages
npm cache clean --force 2>/dev/null || true

# Clean up npx cache for MCP packages
rm -rf ~/.npm/_npx/*mcp* 2>/dev/null || true
rm -rf ~/.npm/_npx/*context7* 2>/dev/null || true
rm -rf ~/.npm/_npx/*supabase* 2>/dev/null || true
rm -rf ~/.npm/_npx/*puppeteer* 2>/dev/null || true

log_info "🧹 Cleaning up temporary MCP files..."

# Clean up any temporary MCP files
find /tmp -name "*mcp*" -type f -mtime +0 -delete 2>/dev/null || true
find /tmp -name "*context7*" -type f -mtime +0 -delete 2>/dev/null || true

# Final count
FINAL_COUNT=$(count_mcp_processes)

echo -e "\n${BLUE}📊 Cleanup Summary:${NC}"
echo "=================="
log_info "Initial MCP processes: $INITIAL_COUNT"
log_info "Remaining MCP processes: $FINAL_COUNT"

if [ "$FINAL_COUNT" -eq 0 ]; then
    log_success "All MCP processes successfully cleaned up!"
    log_success "Your system is now clean and ready for centralized MCP gateway"
else
    log_warning "$FINAL_COUNT processes still running (may be protected or system processes)"
    echo -e "\n${BLUE}Remaining processes:${NC}"
    ps aux | grep -E "(mcp|context7|supabase-mcp|puppeteer.*mcp)" | grep -v grep || echo "None found"
fi

# Check Docker MCP Gateway status
echo -e "\n${BLUE}🐳 Docker MCP Gateway Status:${NC}"
if curl -sf http://localhost:8080/health > /dev/null 2>&1; then
    log_success "Docker MCP Gateway is running at http://localhost:8080"
    RUNNING_SERVICES=$(curl -s http://localhost:8080/health | jq -r '.runningServices' 2>/dev/null || echo "unknown")
    TOTAL_SERVICES=$(curl -s http://localhost:8080/health | jq -r '.totalServices' 2>/dev/null || echo "unknown")
    log_info "Gateway services: $RUNNING_SERVICES/$TOTAL_SERVICES running"
else
    log_warning "Docker MCP Gateway is not responding"
    log_info "Start it with: docker-compose -f docker-compose.mcp-gateway-only.yml up -d"
fi

echo -e "\n${GREEN}🎉 Cleanup completed!${NC}"
echo -e "Your system now uses the centralized Docker-based MCP gateway instead of individual processes."
