# Kilo Code MCP Gateway Integration Prompt

## 🎯 Objective
Enable Kilo Code to detect and connect to the Zignal MCP Gateway, providing access to the same powerful tools available for development, debugging, and analysis.

## 🔧 MCP Gateway Setup Instructions

### Step 1: Detect MCP Gateway
```bash
# Check if MCP Gateway is running
curl -s http://localhost:8080/health

# Expected response:
# {"gateway":"healthy","timestamp":"...","services":{...},"uptime":...,"runningServices":...,"totalServices":6}
```

### Step 2: Start MCP Gateway (if not running)
```bash
# Start the MCP Gateway using Docker Compose
docker-compose -f docker-compose.mcp.yml up -d

# Wait for services to start
sleep 10

# Verify gateway is healthy
curl -s http://localhost:8080/health
```

### Step 3: Start Required Services
```bash
# Start filesystem service for file operations
curl -X POST http://localhost:8080/services/filesystem/start

# Start memory service for data storage
curl -X POST http://localhost:8080/services/memory/start

# Start Supabase service for database operations
curl -X POST http://localhost:8080/services/supabase/start

# Start ReactBits service for component analysis
curl -X POST http://localhost:8080/services/reactbits/start

# Start all services at once
curl -X POST http://localhost:8080/services/start-all
```

## 🛠️ Available MCP Tools

### 1. Filesystem Service (`/mcp/filesystem`)
**Purpose**: File operations, directory management, content analysis

**Available Tools**:
- `read_text_file` - Read file contents
- `write_file` - Create/overwrite files
- `edit_file` - Make line-based edits
- `list_directory` - List directory contents
- `search_files` - Search for files by pattern
- `get_file_info` - Get file metadata
- `create_directory` - Create directories
- `move_file` - Move/rename files

**Example Usage**:
```bash
curl -X POST http://localhost:8080/mcp/filesystem \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "read_text_file",
      "arguments": {
        "path": "app/globals.css"
      }
    }
  }'
```

### 2. Memory Service (`/mcp/memory`)
**Purpose**: Data storage, caching, session management

**Available Tools**:
- `store` - Store data in memory
- `retrieve` - Retrieve stored data
- `delete` - Delete stored data
- `list` - List all stored keys

### 3. Supabase Service (`/mcp/supabase`)
**Purpose**: Database operations, user management, data analysis

**Available Tools**:
- `query` - Execute SQL queries
- `insert` - Insert data
- `update` - Update records
- `delete` - Delete records
- `get_schema` - Get database schema

### 4. ReactBits Service (`/mcp/reactbits`)
**Purpose**: React component analysis, UI development

**Available Tools**:
- `analyze_component` - Analyze React components
- `generate_component` - Generate new components
- `optimize_component` - Optimize existing components

### 5. Puppeteer Service (`/mcp/puppeteer`)
**Purpose**: Browser automation, web scraping, testing

**Available Tools**:
- `navigate` - Navigate to URLs
- `screenshot` - Take screenshots
- `extract_data` - Extract data from pages
- `click_element` - Click elements
- `fill_form` - Fill form fields

### 6. Context7 Service (`/mcp/context7`)
**Purpose**: Documentation search, knowledge retrieval

**Available Tools**:
- `search_docs` - Search documentation
- `get_context` - Get relevant context
- `summarize` - Summarize content

## 🔍 Common Use Cases

### 1. CSS Analysis and Debugging
```bash
# Read CSS file
curl -X POST http://localhost:8080/mcp/filesystem \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "read_text_file",
      "arguments": {
        "path": "app/globals.css"
      }
    }
  }'

# Search for specific CSS patterns
curl -X POST http://localhost:8080/mcp/filesystem \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "search_files",
      "arguments": {
        "path": ".",
        "pattern": "*.css"
      }
    }
  }'
```

### 2. Database Operations
```bash
# Query user profiles
curl -X POST http://localhost:8080/mcp/supabase \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "query",
      "arguments": {
        "sql": "SELECT * FROM user_profiles LIMIT 10"
      }
    }
  }'
```

### 3. Component Analysis
```bash
# Analyze React component
curl -X POST http://localhost:8080/mcp/reactbits \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "analyze_component",
      "arguments": {
        "componentPath": "components/layout/Sidebar.tsx"
      }
    }
  }'
```

## 🚀 Quick Start Commands

### 1. Full MCP Setup
```bash
# Start everything
docker-compose -f docker-compose.mcp.yml up -d
sleep 15
curl -X POST http://localhost:8080/services/start-all
curl -s http://localhost:8080/health
```

### 2. Verify All Services
```bash
# Check service status
curl -s http://localhost:8080/services | jq '.services[] | {name: .name, status: .status}'
```

### 3. Test Filesystem Access
```bash
# List project files
curl -X POST http://localhost:8080/mcp/filesystem \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "list_directory",
      "arguments": {
        "path": "/app"
      }
    }
  }'
```

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. Gateway Not Running
```bash
# Check Docker containers
docker ps | grep mcp

# Restart gateway
docker-compose -f docker-compose.mcp.yml restart mcp-gateway
```

#### 2. Services Not Starting
```bash
# Check service logs
docker logs zignal-login-mcp-gateway-1

# Restart specific service
curl -X POST http://localhost:8080/services/filesystem/start
```

#### 3. Permission Issues
```bash
# Check file permissions
ls -la /app

# Ensure proper workspace access
curl -X POST http://localhost:8080/mcp/filesystem \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "list_allowed_directories",
      "arguments": {}
    }
  }'
```

## 📋 Service Endpoints

| Service | Endpoint | Status Check |
|---------|----------|--------------|
| Gateway | `http://localhost:8080/health` | `curl -s http://localhost:8080/health` |
| Filesystem | `http://localhost:8080/mcp/filesystem` | `curl -X POST http://localhost:8080/mcp/filesystem` |
| Memory | `http://localhost:8080/mcp/memory` | `curl -X POST http://localhost:8080/mcp/memory` |
| Supabase | `http://localhost:8080/mcp/supabase` | `curl -X POST http://localhost:8080/mcp/supabase` |
| ReactBits | `http://localhost:8080/mcp/reactbits` | `curl -X POST http://localhost:8080/mcp/reactbits` |
| Puppeteer | `http://localhost:8080/mcp/puppeteer` | `curl -X POST http://localhost:8080/mcp/puppeteer` |
| Context7 | `http://localhost:8080/mcp/context7` | `curl -X POST http://localhost:8080/mcp/context7` |

## 🎯 Integration Examples

### 1. Automated CSS Analysis
```bash
# Read CSS file and analyze for issues
curl -X POST http://localhost:8080/mcp/filesystem \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "read_text_file",
      "arguments": {
        "path": "app/globals.css"
      }
    }
  }' | jq -r '.result.content[0].text' | grep -n "\[.*\].*with"
```

### 2. Database Health Check
```bash
# Check database connection and user count
curl -X POST http://localhost:8080/mcp/supabase \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "query",
      "arguments": {
        "sql": "SELECT COUNT(*) as user_count FROM user_profiles"
      }
    }
  }'
```

### 3. Component Optimization
```bash
# Analyze and optimize React components
curl -X POST http://localhost:8080/mcp/reactbits \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "optimize_component",
      "arguments": {
        "componentPath": "components/layout/Sidebar.tsx",
        "optimizationLevel": "high"
      }
    }
  }'
```

## 🔐 Security Notes

- **Local Only**: MCP Gateway runs on localhost:8080
- **No External Access**: Services are not exposed externally
- **File Access**: Limited to `/app` directory
- **Database Access**: Read-only mode for Supabase service
- **Authentication**: Uses Clerk OAuth for protected operations

## 📚 Additional Resources

- **MCP Documentation**: https://modelcontextprotocol.io/
- **Docker Compose**: `docker-compose.mcp.yml`
- **Gateway Config**: `mcp-config.json`
- **Service Logs**: `docker logs zignal-login-mcp-gateway-1`

---

**Ready to use!** 🚀 Start with the Quick Start Commands and explore the powerful MCP tools available for your development workflow.
