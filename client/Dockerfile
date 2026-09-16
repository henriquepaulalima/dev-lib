FROM node:20-alpine AS build
ARG BUILD_CONFIGURATION=production
WORKDIR /workspace
COPY package.json package-lock.json* ./
COPY client/package.json client/package.json
COPY server/package.json server/package.json
RUN npm ci --workspace client --include-workspace-root
COPY client client
RUN npm run build --workspace client -- --configuration ${BUILD_CONFIGURATION}

FROM nginx:1.29-alpine
COPY client/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/client/dist/client/browser /usr/share/nginx/html
EXPOSE 80
