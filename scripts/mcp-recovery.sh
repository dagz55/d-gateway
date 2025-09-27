#!/bin/bash

# This script attempts to recover the MCP gateway and its services if they become unhealthy.

HEALTH_CHECK_SCRIPT="./scripts/mcp-health-check.sh"

# Function to restart a service
restart_service() {
  SERVICE_NAME=$1
  
  echo "Attempting to restart $SERVICE_NAME..."
  
  docker-compose -f docker-compose.mcp.yml restart "$SERVICE_NAME"
  
  # Wait for a few seconds to allow the service to restart
  sleep 5
  
  # Check the health of the service again
  bash "$HEALTH_CHECK_SCRIPT" | grep "$SERVICE_NAME is healthy"
  
  if [ $? -eq 0 ]; then
    echo "$SERVICE_NAME has been restarted successfully."
  else
    echo "Failed to restart $SERVICE_NAME."
  fi
}

# Run the health check script and capture the output
health_check_output=$(bash "$HEALTH_CHECK_SCRIPT")

# Check if the gateway is healthy
if echo "$health_check_output" | grep -q "MCP gateway is not healthy"; then
  echo "MCP gateway is not healthy. Attempting to restart the entire stack..."
  docker-compose -f docker-compose.mcp.yml down
  docker-compose -f docker-compose.mcp.yml up -d
else
  # Check for unhealthy services
  unhealthy_services=$(echo "$health_check_output" | grep "is not healthy" | awk '{print $1}')
  
  if [ -n "$unhealthy_services" ]; then
    for service in $unhealthy_services; do
      restart_service "$service"
    done
  else
    echo "All MCP services are healthy."
  fi
fi