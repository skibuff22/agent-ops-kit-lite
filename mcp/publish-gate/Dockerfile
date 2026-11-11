# Publish Gate (lite) MCP server, stdio. Zero dependencies: nothing to install.
# docker build -t publish-gate-mcp . && docker run -i --rm publish-gate-mcp
# Inside the container pass draft_text / facts_text; *_path arguments only see files you mount.
FROM node:22-alpine
WORKDIR /app
COPY package.json server.js README.md ./
USER node
ENTRYPOINT ["node", "server.js"]
