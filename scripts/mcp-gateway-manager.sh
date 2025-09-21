#!/bin/bash

# MCP Gateway Management Script
set -e

COMPOSE_FILE="docker-compose.mcp-gateway-only.yml"
GATEWAY_URL="http://localhost:8080"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    printf "${BLUE}ℹ️  %s${NC}\n" "$1"
}

log_success() {
    printf "${GREEN}✅ %s${NC}\n" "$1"
}

log_warning() {
    printf "${YELLOW}⚠️  %s${NC}\n" "$1"
}

log_error() {
    printf "${RED}❌ %s${NC}\n" "$1"
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker is not running. Please start Docker Desktop."
        exit 1
    fi
    log_success "Docker is running"
}

# Start MCP Gateway
start_gateway() {
    log_info "Starting MCP Gateway..."
    docker-compose -f $COMPOSE_FILE up -d --build
    
    log_info "Waiting for gateway to be ready..."
    sleep 10
    
    if curl -sf $GATEWAY_URL/health > /dev/null; then
        log_success "MCP Gateway is running at $GATEWAY_URL"
    else
        log_warning "Gateway may still be starting up"
    fi
}

# Stop MCP Gateway
stop_gateway() {
    log_info "Stopping MCP Gateway..."
    docker-compose -f $COMPOSE_FILE down
    log_success "MCP Gateway stopped"
}

# Show status
show_status() {
    printf "\n${BLUE}🔍 MCP Gateway Status${NC}\n"
    echo "=========================="
    
    # Check if gateway is responding
    if curl -sf $GATEWAY_URL/health > /dev/null; then
        log_success "Gateway: Running at $GATEWAY_URL"
        
        printf "\n${BLUE}📊 Service Health:${NC}\n"
        curl -s $GATEWAY_URL/health | jq '.services' 2>/dev/null || echo "Health data not available"
        
        printf "\n${BLUE}🔗 Available Services:${NC}\n"
        curl -s $GATEWAY_URL/services | jq '.services[] | "\(.name): \(.endpoint)"' 2>/dev/null || echo "Service list not available"
    else
        log_error "Gateway: Not responding"
    fi
    
    printf "\n${BLUE}🐳 Container Status:${NC}\n"
    docker-compose -f $COMPOSE_FILE ps
}

# Show logs
show_logs() {
    local service=${1:-mcp-gateway}
    log_info "Showing logs for $service..."
    docker-compose -f $COMPOSE_FILE logs --tail=20 -f $service
}

# Test endpoints
test_endpoints() {
    log_info "Testing MCP Gateway endpoints..."
    
    printf "\n${BLUE}🏥 Health Check:${NC}\n"
    curl -s $GATEWAY_URL/health | jq '.' || log_error "Health check failed"
    
    printf "\n${BLUE}🔍 Service Discovery:${NC}\n"
    curl -s $GATEWAY_URL/services | jq '.services[].name' || log_error "Service discovery failed"
    
    printf "\n${BLUE}📈 Gateway Stats:${NC}\n"
    curl -s $GATEWAY_URL/health | jq '{gateway: .gateway, uptime: .uptime, timestamp: .timestamp}' || log_error "Stats failed"
}

# Restart services
restart_gateway() {
    log_info "Restarting MCP Gateway..."
    stop_gateway
    sleep 2
    start_gateway
}

# Main script logic
case "${1:-status}" in
    "start")
        check_docker
        start_gateway
        show_status
        ;;
    "stop")
        stop_gateway
        ;;
    "restart")
        check_docker
        restart_gateway
        show_status
        ;;
    "status")
        show_status
        ;;
    "logs")
        show_logs $2
        ;;
    "test")
        test_endpoints
        ;;
    "help"|"-h"|"--help")
        echo "MCP Gateway Manager"
        echo "==================="
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  start     - Start the MCP Gateway"
        echo "  stop      - Stop the MCP Gateway"
        echo "  restart   - Restart the MCP Gateway"
        echo "  status    - Show current status (default)"
        echo "  logs      - Show logs [service-name]"
        echo "  test      - Test gateway endpoints"
        echo "  help      - Show this help"
        echo ""
        echo "Examples:"
        echo "  $0 start"
        echo "  $0 logs mcp-supabase"
        echo "  $0 test"
        ;;
    *)
        log_error "Unknown command: $1"
        echo "Use '$0 help' for usage information"
        exit 1
        ;;
esac
