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
COPY frontend/tsconfig.json ./frontend/tsconfig.json
COPY frontend/next.config.js ./frontend/next.config.js
COPY frontend/postcss.config.js ./frontend/postcss.config.js
COPY frontend/tailwind.config.ts ./frontend/tailwind.config.ts

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
COPY --from=deps /app/frontend/package.json ./frontend/package.json
COPY --from=deps /app/backend/package.json ./backend/package.json

# Copy source code for building
COPY shared/ ./shared/
COPY frontend/ ./frontend/

# Build shared first (required by frontend)
RUN npm run build --workspace=@smartjob/shared

# Build frontend
RUN npm run build --workspace=@smartjob/frontend

# Stage 3: Production
FROM node:20-alpine AS runner

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy package.json files and configuration for workspaces
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/shared/package.json ./shared/package.json
COPY --from=builder --chown=nextjs:nodejs /app/frontend/package.json ./frontend/package.json
COPY --from=builder --chown=nextjs:nodejs /app/backend/package.json ./backend/package.json
COPY --from=builder --chown=nextjs:nodejs /app/tsconfig.base.json ./tsconfig.base.json
COPY --from=builder --chown=nextjs:nodejs /app/frontend/next.config.js ./frontend/next.config.js

# Copy built artifacts and public files
COPY --from=builder --chown=nextjs:nodejs /app/shared/dist ./shared/dist
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next ./frontend/.next
COPY --from=builder --chown=nextjs:nodejs /app/frontend/public ./frontend/public

# Copy node_modules (keep permissions intact)
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

# Set ownership
RUN chown -R nextjs:nodejs /app

USER nextjs

# Expose port
EXPOSE 3001

# Environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3001 || exit 1

# Start Next.js production server
CMD ["node_modules/.bin/next", "start", "frontend", "-p", "3001"]
