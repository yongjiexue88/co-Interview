# Use Node.js 20 LTS
FROM node:20-slim

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/

# Expose port (Cloud Run uses PORT env var)
EXPOSE 8080

# Start the server
CMD ["node", "src/index.js"]
