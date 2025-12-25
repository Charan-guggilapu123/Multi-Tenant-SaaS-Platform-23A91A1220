# Multi-stage build for optimized production image
FROM node:18-alpine AS base

# Install dependencies for health check and database wait
RUN apk --no-cache add curl netcat-openbsd

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy application source
COPY . .

# Make entrypoint script executable
RUN chmod +x entrypoint.sh

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 5000

# Use entrypoint script for automatic initialization
ENTRYPOINT ["./entrypoint.sh"]
