# Kilo Code MCP Gateway - Quick Start

## 🚀 One-Command Setup
```bash
# Start MCP Gateway and all services
docker-compose -f docker-compose.mcp.yml up -d && sleep 15 && curl -X POST http://localhost:8080/services/start-all && echo "✅ MCP Gateway Ready!"
```

## 🔍 Verify Setup
```bash
# Check gateway health
curl -s http://localhost:8080/health | jq '.services'

# List available tools
curl -X POST http://localhost:8080/mcp/filesystem \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | jq '.result.tools[].name'
```

## 🛠️ Essential Commands

### Read File
```bash
curl -X POST http://localhost:8080/mcp/filesystem \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "read_text_file",
      "arguments": {"path": "app/globals.css"}
    }
  }'
```

### Search Files
```bash
curl -X POST http://localhost:8080/mcp/filesystem \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "search_files",
      "arguments": {"path": ".", "pattern": "*.css"}
    }
  }'
```

### Database Query
```bash
curl -X POST http://localhost:8080/mcp/supabase \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "query",
      "arguments": {"sql": "SELECT COUNT(*) FROM user_profiles"}
    }
  }'
```

## 🎯 Available Services
- **filesystem**: File operations (`/mcp/filesystem`)
- **memory**: Data storage (`/mcp/memory`)
- **supabase**: Database (`/mcp/supabase`)
- **reactbits**: Components (`/mcp/reactbits`)
- **puppeteer**: Browser (`/mcp/puppeteer`)
- **context7**: Docs (`/mcp/context7`)

## 🔧 Troubleshooting
```bash
# Restart services
curl -X POST http://localhost:8080/services/start-all

# Check logs
docker logs zignal-login-mcp-gateway-1

# Full restart
docker-compose -f docker-compose.mcp.yml restart
```

**Ready to use!** 🚀
