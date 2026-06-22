# syntax=docker/dockerfile:1

###############################################################################
# E-Tech Cloud — imagem de produção (Next.js 16 standalone)
#
# Build multi-stage:
#   1. deps    → instala dependências (npm ci)
#   2. builder → gera o client do Prisma e faz o build standalone do Next
#   3. runner  → imagem final mínima, roda como usuário não-root
#
# Uso:
#   docker build -t etech-cloud .
#   docker run -p 3000:3000 --env-file .env etech-cloud
###############################################################################

# ---- base ----
FROM node:20-alpine AS base
# libc6-compat ajuda alguns binários nativos a rodarem no Alpine.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# ---- deps: instala node_modules a partir do lockfile ----
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ---- builder: gera Prisma client + build do Next ----
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# O prisma.config.ts exige DATABASE_URL já no `prisma generate` (roda dentro do
# build). Valor fake só pra satisfazer a config — nenhuma query roda no build.
ENV DATABASE_URL="file:./build.db"
# Não envia telemetria do Next durante o build.
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ---- runner: imagem final enxuta ----
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Usuário não-root por segurança.
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Assets públicos.
COPY --from=builder /app/public ./public

# Saída standalone do Next: traz só o server + node_modules mínimos necessários.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

# server.js é o entrypoint gerado pelo output standalone do Next.
CMD ["node", "server.js"]
