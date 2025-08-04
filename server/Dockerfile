# Use Node.js 18 Alpine as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for TypeScript types)
RUN npm install

# Copy source code and TypeScript config
COPY src/ ./src/
COPY tsconfig.prod.json ./tsconfig.json

# Build TypeScript to JavaScript
RUN npm run build

# Remove source files and dev dependencies to reduce image size
RUN rm -rf src/ tsconfig.json

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start the application
CMD ["npm", "start"] 