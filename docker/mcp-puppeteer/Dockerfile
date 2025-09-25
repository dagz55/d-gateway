# Use the official Node.js 20 Alpine image
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Install chromium and other dependencies
RUN apk add --no-cache chromium nss freetype freetype-dev harfbuzz ca-certificates ttf-freefont

# Install the MCP server package
RUN npm install -g @modelcontextprotocol/server-puppeteer

# Expose the port the server will run on
EXPOSE 3000

# Set the environment variable for the puppeteer executable
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Set the default command to run the server
CMD ["mcp-server-puppeteer"]