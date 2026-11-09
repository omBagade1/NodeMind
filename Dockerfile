# Use official Node.js 20 LTS Alpine image for minimal attack surface and size
FROM node:20-alpine

# Install git so git-based agent tools (git_status, git_diff) work inside the container
RUN apk add --no-cache git

WORKDIR /app

# Copy package descriptors first to leverage Docker layer caching
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy application source code
COPY . .

# Set default production environment variables
ENV NODE_ENV=production \
    PORT=3000 \
    OLLAMA_HOST=http://host.docker.internal:11434 \
    OLLAMA_MODEL=llama3.2 \
    OLLAMA_TIMEOUT_MS=60000

# Expose server port
EXPOSE 3000

# Start server
CMD ["node", "src/server.js"]
