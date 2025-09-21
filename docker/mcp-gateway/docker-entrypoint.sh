#!/bin/sh

# MCP Gateway Docker Entrypoint Script

set -e

echo "🚀 Starting MCP Gateway..."
echo "📊 Environment: $NODE_ENV"
echo "🔗 Port: $GATEWAY_PORT"

# Wait for dependent services to be ready
wait_for_service() {
  local service_name=$1
  local service_url=$2
  local max_attempts=30
  local attempt=1
  
  echo "⏳ Waiting for $service_name to be ready..."
  
  while [ $attempt -le $max_attempts ]; do
    if wget --spider --quiet --timeout=5 "$service_url" 2>/dev/null; then
      echo "✅ $service_name is ready"
      return 0
    fi
    
    echo "⏳ Attempt $attempt/$max_attempts - $service_name not ready yet..."
    sleep 2
    attempt=$((attempt + 1))
  done
  
  echo "❌ $service_name failed to become ready after $max_attempts attempts"
  return 1
}

# Wait for core MCP services
echo "🔍 Checking MCP service availability..."

# Note: These health checks are optional - services will be proxied even if not immediately available
wait_for_service "Supabase MCP" "http://mcp-supabase:3000/health" || echo "⚠️ Supabase MCP not ready, will proxy when available"
wait_for_service "Filesystem MCP" "http://mcp-filesystem:3000/health" || echo "⚠️ Filesystem MCP not ready, will proxy when available"
wait_for_service "Memory MCP" "http://mcp-memory:3000/health" || echo "⚠️ Memory MCP not ready, will proxy when available"

echo "🎯 Starting MCP Gateway server..."

# Start the Node.js server
exec node server.js
