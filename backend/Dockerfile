# Stage 1: Dependencies
FROM node:20-alpine AS deps

WORKDIR /app

# Copy root configuration files for npm workspaces
COPY package.json package-lock.json tsconfig.base.json ./

# Copy package and config files for each workspace to ensure npm ci works correctly in a monorepo
COPY shared/package.json ./shared/package.json
COPY backend/package.json ./backend/package.json
COPY frontend/package.json ./frontend/package.json

# Copy other configuration files needed for building
COPY shared/tsconfig.json ./shared/tsconfig.json
COPY backend/tsconfig.json ./backend/tsconfig.json
COPY backend/nest-cli.json ./backend/nest-cli.json

# Install all dependencies
RUN npm ci

# Stage 2: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy all configuration and source code
COPY package.json package-lock.json tsconfig.base.json ./
# Copy all package.json files to ensure npm workspace resolution works
COPY --from=deps /app/shared/package.json ./shared/package.json
COPY --from=deps /app/backend/package.json ./backend/package.json
COPY --from=deps /app/frontend/package.json ./frontend/package.json

# Copy source code for building
COPY shared/ ./shared/
COPY backend/ ./backend/

# Build shared first (required by backend)
RUN npm run build --workspace=@smartjob/shared

# Build backend
RUN npm run build --workspace=@smartjob/backend

# Stage 3: Production
FROM node:20-alpine AS runner

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Copy package.json files for workspaces to preserve symlink integrity
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nestjs:nodejs /app/shared/package.json ./shared/package.json
COPY --from=builder --chown=nestjs:nodejs /app/backend/package.json ./backend/package.json
COPY --from=builder --chown=nestjs:nodejs /app/frontend/package.json ./frontend/package.json
COPY --from=builder --chown=nestjs:nodejs /app/tsconfig.base.json ./tsconfig.base.json

# Copy built artifacts from builder
COPY --from=builder --chown=nestjs:nodejs /app/shared/dist ./shared/dist
COPY --from=builder --chown=nestjs:nodejs /app/backend/dist ./backend/dist

# Copy node_modules (keep permissions intact)
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules

# Set ownership for the app directory
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
