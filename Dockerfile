# syntax=docker/dockerfile:1.7
# Multi-stage — 85MB runtime en CX23 Dokploy (Traefik SSL auto)
FROM node:20-alpine AS base
WORKDIR /app

# --- deps: layer cache npm ci ---
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

# --- builder: build Next standalone ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

# --- runner: minimal standalone ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# public assets
COPY --from=builder /app/public ./public
# standalone output (server.js + .next + node_modules minimal)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# fallback data dir for /api/lead jsonl (persist via volume if needed)
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1

CMD ["node", "server.js"]
