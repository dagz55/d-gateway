# Use the official Node.js 20 Alpine image
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Install the MCP server package
RUN npm install -g @supabase/mcp-server-supabase@latest

# Expose the port the server will run on
EXPOSE 3000

# Set the default command to run the server
CMD ["mcp-server-supabase", "--read-only", "--project-ref=elnntdfdlojxpcjiyehe"]