# syntax=docker/dockerfile:1.7
ARG NODE_VERSION=22-alpine

FROM node:${NODE_VERSION} AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1

ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_ANALYTICS_ENABLED
ARG NEXT_PUBLIC_ANALYTICS_API_KEY
ARG NEXT_PUBLIC_ANALYTICS_ENDPOINT

RUN if [ -f bun.lock ]; then npm install -g bun@1.2.17 && bun install; \
    elif [ -f package-lock.json ]; then npm ci; \
    else npm install; fi

RUN if [ -f bun.lock ]; then bun run build; else npm run build; fi
RUN mkdir -p /app/public

FROM node:${NODE_VERSION} AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN apk add --no-cache libc6-compat openssl wget
RUN addgroup -g 1001 -S nodejs && adduser -u 1001 -S nextjs -G nodejs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
