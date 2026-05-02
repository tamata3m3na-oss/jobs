# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root configuration files for npm workspaces
COPY package.json package-lock.json tsconfig.base.json ./

# Copy package files for each workspace to ensure npm ci works correctly
COPY shared/package.json ./shared/
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Install all dependencies (including devDependencies for building)
RUN npm ci

# Copy source code and configuration for building
COPY shared/ ./shared/
COPY backend/ ./backend/

# Generate Prisma client before building (required for TypeScript types)
RUN npm run prisma:generate --workspace=@smartjob/backend

# Build shared first (required by backend)
RUN npm run build --workspace=@smartjob/shared

# Build backend
RUN npm run build --workspace=@smartjob/backend

# Stage 2: Production
FROM node:20-alpine AS runner

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Copy package.json files and workspace configuration
COPY package.json package-lock.json tsconfig.base.json ./
COPY shared/package.json ./shared/
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Install only production dependencies
RUN npm ci --omit=dev

# Copy source code for Prisma client generation (needed at runtime)
COPY backend/prisma ./backend/prisma

# Generate Prisma client for production runtime
RUN npm run prisma:generate --workspace=@smartjob/backend

# Copy built artifacts from builder
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/backend/dist ./backend/dist

# Set ownership
RUN chown -R nestjs:nodejs /app

USER nestjs

# Environment variables
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/v1 || exit 1

# Start command
CMD ["node", "backend/dist/main.js"]
