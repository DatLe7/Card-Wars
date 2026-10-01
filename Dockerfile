# syntax=docker/dockerfile:1

FROM node:24-bookworm-slim AS engine-build
WORKDIR /app/engine
COPY engine/package*.json ./
RUN npm ci --ignore-scripts
COPY engine/ ./
RUN npm run build

FROM engine-build AS api-build
WORKDIR /app/backend
COPY backend/package*.json ./
# The local engine dependency is already compiled in the sibling directory.
RUN npm ci --ignore-scripts
COPY backend/ ./
RUN npm run build

FROM api-build AS api-dependencies
RUN npm prune --omit=dev --ignore-scripts

FROM node:24-bookworm-slim AS api
ENV NODE_ENV=production
WORKDIR /app/backend
COPY --from=api-dependencies /app/backend/package*.json ./
COPY --from=api-dependencies /app/backend/node_modules ./node_modules
COPY --from=api-build /app/backend/build ./build
# npm installs file:../engine as a symlink; retain that relative layout.
COPY --from=engine-build /app/engine/package.json /app/engine/package.json
COPY --from=engine-build /app/engine/dist /app/engine/dist
USER node
EXPOSE 3012
CMD ["node", "build/src/server.js"]

FROM node:24-bookworm-slim AS web-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM nginx:1.28-alpine AS web
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=web-build /app/frontend/dist /usr/share/nginx/html
EXPOSE 80
