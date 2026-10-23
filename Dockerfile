# Rifftown sunucusu (API + zamanlayıcı) için imaj.
# Depo kökünden derlenir: docker build -t rifftown-server .

FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY server/package.json server/
COPY app/package.json app/
# Mobil uygulama paketi sunucuya gerekmez; sadece sunucu ve ortak paket kurulur.
RUN npm ci --workspace server --workspace packages/shared --include-workspace-root=false
COPY packages/shared packages/shared
COPY server server
RUN npm run build --workspace server

FROM node:22-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY server/package.json server/
COPY app/package.json app/
RUN npm ci --workspace server --omit=dev --include-workspace-root=false

FROM node:22-slim
ENV NODE_ENV=production
WORKDIR /app/server
COPY --from=deps /app/node_modules /app/node_modules
COPY --from=build /app/server/dist ./dist
COPY server/migrations ./migrations
COPY server/legal ./legal
COPY server/package.json ./
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD node -e "fetch('http://127.0.0.1:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "dist/main.js"]
