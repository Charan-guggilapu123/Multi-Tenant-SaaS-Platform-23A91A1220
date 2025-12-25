# Multi-stage build for optimized production image
FROM node:18-alpine AS base

# Install dependencies for health check
RUN apk --no-cache add curl

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy application source
COPY . .

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 5000

# Start the application directly (migrations and seeding handled by server.js)
CMD ["node", "src/server.js"]
