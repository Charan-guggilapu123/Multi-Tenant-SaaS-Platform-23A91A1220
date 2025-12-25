# Multi-stage build for optimized production image
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci && npm cache clean --force

# Copy source files
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies and vite for serving
RUN npm ci --only=production && \
    npm install -g vite && \
    npm cache clean --force

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/index.html ./
COPY --from=builder /app/vite.config.js ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000

# Use vite preview for production serving with host flag
CMD ["npm", "run", "preview", "--", "--host", "--port", "3000"]
