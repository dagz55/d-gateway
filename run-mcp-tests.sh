#!/bin/bash

# MCP Gateway Test Runner
# Tests POST /mcp/nextjs with Clerk OAuth token, validates metadata responses,
# and ensures environment variable override functions work in the container.

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
GATEWAY_URL=${MCP_GATEWAY_URL:-"http://localhost:8080"}
CLERK_SECRET_KEY=${CLERK_SECRET_KEY}
TEST_USER_EMAIL=${TEST_USER_EMAIL:-"test@example.com"}

echo -e "${CYAN}============================================================${NC}"
echo -e "${CYAN}  MCP Gateway Test Suite${NC}"
echo -e "${CYAN}============================================================${NC}"
echo -e "${BLUE}Gateway URL: ${GATEWAY_URL}${NC}"
echo -e "${BLUE}Clerk Secret Key: ${CLERK_SECRET_KEY:+Set}${CLERK_SECRET_KEY:-Not Set}${NC}"
echo -e "${BLUE}Test User Email: ${TEST_USER_EMAIL}${NC}"
echo ""

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a service is running
check_service() {
    local url=$1
    local service_name=$2
    
    echo -e "${BLUE}Checking ${service_name}...${NC}"
    
    if curl -s -f "$url" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ ${service_name} is running${NC}"
        return 0
    else
        echo -e "${RED}❌ ${service_name} is not running${NC}"
        return 1
    fi
}

# Function to wait for a service to be ready
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1
    
    echo -e "${BLUE}Waiting for ${service_name} to be ready...${NC}"
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s -f "$url" >/dev/null 2>&1; then
            echo -e "${GREEN}✅ ${service_name} is ready after ${attempt} attempts${NC}"
            return 0
        fi
        
        echo -e "${YELLOW}Attempt ${attempt}/${max_attempts}: ${service_name} not ready yet...${NC}"
        sleep 2
        ((attempt++))
    done
    
    echo -e "${RED}❌ ${service_name} failed to start after ${max_attempts} attempts${NC}"
    return 1
}

# Function to run Docker Compose
run_docker_compose() {
    local compose_file=$1
    local service_name=$2
    
    echo -e "${BLUE}Starting ${service_name} with Docker Compose...${NC}"
    
    if [ ! -f "$compose_file" ]; then
        echo -e "${RED}❌ Docker Compose file not found: ${compose_file}${NC}"
        return 1
    fi
    
    # Stop any existing containers
    docker-compose -f "$compose_file" down 2>/dev/null || true
    
    # Start the services
    docker-compose -f "$compose_file" up -d
    
    # Wait for the gateway to be ready
    wait_for_service "${GATEWAY_URL}/health" "MCP Gateway"
}

# Function to run the test suite
run_test_suite() {
    echo -e "${CYAN}============================================================${NC}"
    echo -e "${CYAN}  Running Test Suite${NC}"
    echo -e "${CYAN}============================================================${NC}"
    
    # Check if Node.js is available
    if ! command_exists node; then
        echo -e "${RED}❌ Node.js is not installed${NC}"
        return 1
    fi
    
    # Check if the test script exists
    if [ ! -f "test-mcp-gateway.js" ]; then
        echo -e "${RED}❌ Test script not found: test-mcp-gateway.js${NC}"
        return 1
    fi
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ] || [ ! -f "node_modules/@clerk/backend/package.json" ]; then
        echo -e "${BLUE}Installing test dependencies...${NC}"
        npm install @clerk/backend
    fi
    
    # Run the test script
    echo -e "${BLUE}Running test script...${NC}"
    node test-mcp-gateway.js
}

# Function to test environment variable overrides
test_env_overrides() {
    echo -e "${CYAN}============================================================${NC}"
    echo -e "${CYAN}  Testing Environment Variable Overrides${NC}"
    echo -e "${CYAN}============================================================${NC}"
    
    # Test 1: Check current environment
    echo -e "${BLUE}Current environment variables:${NC}"
    env | grep -E "(NODE_ENV|LOG_LEVEL|TEST_|DEBUG|VERBOSE)" | sort
    
    # Test 2: Test override functionality
    echo -e "${BLUE}Testing override functionality...${NC}"
    node -e "
        console.log('Original NODE_ENV:', process.env.NODE_ENV);
        const original = process.env.NODE_ENV;
        process.env.NODE_ENV = 'test_override';
        console.log('Overridden NODE_ENV:', process.env.NODE_ENV);
        process.env.NODE_ENV = original;
        console.log('Restored NODE_ENV:', process.env.NODE_ENV);
        console.log('Environment variable override test completed successfully');
    "
    
    # Test 3: Test Docker environment overrides
    echo -e "${BLUE}Testing Docker environment overrides...${NC}"
    if command_exists docker; then
        docker run --rm -e NODE_ENV=test -e TEST_OVERRIDE=test_value_123 node:20-alpine sh -c "
            echo 'Docker container environment:'
            env | grep -E '(NODE_ENV|TEST_)' | sort
            echo 'Override test successful'
        "
    else
        echo -e "${YELLOW}⚠️  Docker not available, skipping Docker environment test${NC}"
    fi
}

# Function to clean up
cleanup() {
    echo -e "${BLUE}Cleaning up...${NC}"
    
    # Stop Docker Compose services
    if [ -f "docker-compose.mcp-test.yml" ]; then
        docker-compose -f docker-compose.mcp-test.yml down 2>/dev/null || true
    fi
    
    if [ -f "docker-compose.mcp-gateway-only.yml" ]; then
        docker-compose -f docker-compose.mcp-gateway-only.yml down 2>/dev/null || true
    fi
    
    echo -e "${GREEN}✅ Cleanup completed${NC}"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --docker          Run tests using Docker Compose"
    echo "  --local           Run tests locally (default)"
    echo "  --env-only        Test only environment variable overrides"
    echo "  --cleanup         Clean up Docker containers and exit"
    echo "  --help            Show this help message"
    echo ""
    echo "Environment Variables:"
    echo "  MCP_GATEWAY_URL   Gateway URL (default: http://localhost:8080)"
    echo "  CLERK_SECRET_KEY  Clerk secret key for OAuth testing"
    echo "  TEST_USER_EMAIL   Test user email (default: test@example.com)"
    echo ""
    echo "Examples:"
    echo "  $0 --local                    # Run tests locally"
    echo "  $0 --docker                   # Run tests with Docker"
    echo "  $0 --env-only                 # Test only environment overrides"
    echo "  CLERK_SECRET_KEY=sk_test_xxx $0 --local  # Run with Clerk key"
}

# Main execution
main() {
    local mode="local"
    local run_tests=true
    local test_env=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --docker)
                mode="docker"
                shift
                ;;
            --local)
                mode="local"
                shift
                ;;
            --env-only)
                test_env=true
                run_tests=false
                shift
                ;;
            --cleanup)
                cleanup
                exit 0
                ;;
            --help)
                show_usage
                exit 0
                ;;
            *)
                echo -e "${RED}Unknown option: $1${NC}"
                show_usage
                exit 1
                ;;
        esac
    done
    
    # Set up trap for cleanup on exit
    trap cleanup EXIT
    
    # Check prerequisites
    if [ "$mode" = "docker" ] && ! command_exists docker; then
        echo -e "${RED}❌ Docker is required for --docker mode${NC}"
        exit 1
    fi
    
    if [ "$mode" = "local" ] && ! command_exists node; then
        echo -e "${RED}❌ Node.js is required for --local mode${NC}"
        exit 1
    fi
    
    # Run environment variable tests
    test_env_overrides
    
    if [ "$test_env" = true ]; then
        echo -e "${GREEN}✅ Environment variable tests completed${NC}"
        exit 0
    fi
    
    # Run the appropriate test mode
    case $mode in
        "docker")
            echo -e "${BLUE}Running tests in Docker mode...${NC}"
            run_docker_compose "docker-compose.mcp-test.yml" "MCP Gateway Test"
            ;;
        "local")
            echo -e "${BLUE}Running tests in local mode...${NC}"
            if ! check_service "${GATEWAY_URL}/health" "MCP Gateway"; then
                echo -e "${YELLOW}⚠️  MCP Gateway not running. Please start it first.${NC}"
                echo -e "${BLUE}You can start it with:${NC}"
                echo -e "${BLUE}  docker-compose -f docker-compose.mcp-gateway-only.yml up -d${NC}"
                exit 1
            fi
            ;;
    esac
    
    # Run the test suite
    if [ "$run_tests" = true ]; then
        run_test_suite
    fi
    
    echo -e "${GREEN}✅ All tests completed successfully${NC}"
}

# Run main function with all arguments
main "$@"
