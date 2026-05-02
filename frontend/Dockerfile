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

# Copy all node_modules from deps stage (includes hoisted and workspace-specific)
COPY --from=deps /app ./

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

# Copy standalone build and static files
# Next.js standalone output includes everything needed to run the server
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/static ./frontend/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/frontend/public ./frontend/public
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/frontend/public ./public

# Set ownership
RUN chown -R nextjs:nodejs /app

USER nextjs

# Expose port
EXPOSE 3001

# Environment variables
ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3001 || exit 1

# Start Next.js production server using the standalone server
# We work from the root so Next.js can find the .next and public folders correctly
CMD ["node", "frontend/server.js"]
