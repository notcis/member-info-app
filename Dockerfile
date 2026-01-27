# Dockerfile for Next.js Application
# This Dockerfile is optimized for production and uses multi-stage builds
# to create a small and secure final image.

# --- Stage 1: Dependency Installation ---
# This stage installs all Node.js dependencies.
FROM node:20-alpine AS deps

# Alpine Linux images may require this for some native dependencies.
RUN apk add --no-cache libc6-compat

# Set the working directory inside the container.
WORKDIR /app

# Copy package.json and the lock file.
COPY package.json package-lock.json* ./

# Install dependencies using 'npm ci' for faster, more reliable builds.
RUN npm ci

# --- Stage 2: Application Builder ---
# This stage builds the Next.js application.
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies from the previous stage.
COPY --from=deps /app/node_modules ./node_modules

# Copy the rest of the application source code.
COPY . .

# Build the Next.js application for production.
RUN npm run build

# --- Stage 3: Production Runner ---
# This is the final, minimal image that will run the application.
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create a non-root user for security purposes.
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the standalone output from the builder stage.
# This requires `output: 'standalone'` in your next.config.js
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

# Start the server.
CMD ["node", "server.js"]