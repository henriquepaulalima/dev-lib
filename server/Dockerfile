FROM node:20-alpine AS build
WORKDIR /workspace
COPY package.json package-lock.json* ./
COPY client/package.json client/package.json
COPY server/package.json server/package.json
RUN npm ci --workspace server --include-workspace-root
COPY server server
RUN npm run build --workspace server

FROM node:20-alpine AS production-dependencies
WORKDIR /workspace
COPY package.json package-lock.json* ./
COPY client/package.json client/package.json
COPY server/package.json server/package.json
RUN npm ci --workspace server --include-workspace-root --omit=dev

FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /workspace
COPY --from=production-dependencies /workspace/node_modules node_modules
COPY --from=production-dependencies /workspace/server/node_modules server/node_modules
COPY --from=build /workspace/server/package.json server/package.json
COPY --from=build /workspace/server/dist server/dist
EXPOSE 3000
CMD ["node", "server/dist/main.js"]
