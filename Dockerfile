# syntax=docker/dockerfile:1

# ----- Base with pnpm/npm cache support (using npm here) -----
FROM node:20-alpine AS base
ENV NODE_ENV=production
WORKDIR /app

# ----- Dependencies layer -----
FROM base AS deps
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json* .npmrc* ./
RUN npm ci --include=dev

# ----- Build layer -----
FROM base AS builder
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time public env vars (embedded into client bundle)
ARG NEXT_PUBLIC_API_BASE
ARG APP_ENV=deploy
ENV NEXT_PUBLIC_API_BASE=${NEXT_PUBLIC_API_BASE}
ENV APP_ENV=${APP_ENV}

# Note: server-side secrets like BACKEND_URL/ANALYTICS_PROXY_BASE should be set at run-time, not baked
RUN npm run build

# ----- Runtime layer (standalone) -----
FROM node:20-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app

# For Next standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Next standalone output includes server.js with bundled app
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
