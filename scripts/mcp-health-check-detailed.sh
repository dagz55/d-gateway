#!/bin/bash

# This script provides a detailed health check of the MCP gateway and its services.

GATEWAY_URL="http://localhost:8080"

# Function to check the health of a service
check_service_health() {
  SERVICE_NAME=$1
  SERVICE_URL="$GATEWAY_URL/mcp/$SERVICE_NAME"
  
  echo "----------------------------------------"
  echo "Checking health of $SERVICE_NAME..."
  
  # Check the service's health endpoint
  response_code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$SERVICE_URL" -H "Content-Type: application/json" -d '{"method":"health"}')
  
  if [ "$response_code" -eq 200 ]; then
    echo "✅ $SERVICE_NAME is healthy."
  else
    echo "❌ $SERVICE_NAME is not healthy. (HTTP status: $response_code)"
    
    # Get the service's logs
    echo "--- Logs for $SERVICE_NAME ---"
    docker-compose -f docker-compose.mcp.yml logs --tail=20 "$SERVICE_NAME"
    echo "----------------------------------------"
  fi
}

# Check the gateway's health
echo "Checking health of MCP gateway..."
gateway_response=$(curl -s -o /dev/null -w "%{http_code}" "$GATEWAY_URL/health")

if [ "$gateway_response" -eq 200 ]; then
  echo "✅ MCP gateway is healthy."
  
  # Get the list of services
  services=$(docker-compose -f docker-compose.mcp.yml config --services)
  
  # Check the health of each service
  for service in $services; do
    if [ "$service" != "mcp-gateway" ]; then
      check_service_health "$service"
    fi
  done
else
  echo "❌ MCP gateway is not healthy. (HTTP status: $gateway_response)"
fi