# Environments

## Client

Angular environment files are selected at build time:

- `client/src/environments/environment.ts` is used by `npm run start:dev --workspace client` and sends browser requests directly to the local API. Set its `apiUrl` port to match `PORT` in `server/.env.development` when changing the API port.
- `client/src/environments/environment.docker.ts` is used by Docker builds and calls the API exposed on local port 3000 directly.
- `client/src/environments/environment.production.ts` is used by production builds and points to the deployed API.

Update `apiUrl` in the production file before deploying the client. Do not place secrets in Angular environment files: every value is included in the browser bundle.

Run the local client on port 4400 with `npm run start:dev --workspace client`, or use `npm run start:prod --workspace client` for the production build. To override the local client port, pass `-- --port <port>` after the workspace argument and update `CLIENT_ORIGIN` in the server environment.

The client Dockerfile accepts a `BUILD_CONFIGURATION` build argument. It defaults to `production`; local Docker Compose selects `docker` so the browser calls the API exposed on local port 3000.

## Server

Nest loads one runtime file according to `NODE_ENV`:

- `server/.env.development` points to MongoDB on `localhost:27017` and permits the local Angular client.
- `server/.env.production` contains placeholders for the deployed MongoDB connection and client origin.

Deployment environment variables override values loaded from the files. Prefer setting the production MongoDB connection as a platform secret rather than committing real credentials.

Server development commands:

- `npm run start:dev:db --workspace server` starts MongoDB and imports the repository data from `db/`.
- `npm run start:dev --workspace server` starts the local watch server.
- `npm run start:dev:all --workspace server` starts MongoDB and the containerized server together.
- `npm run start:prod --workspace server` starts the compiled server with the production environment.

Required server variables:

| Variable | Purpose |
| --- | --- |
| `PORT` | API listening port |
| `MONGODB_URI` | MongoDB connection string |
| `CLIENT_ORIGIN` | Comma-separated origins allowed by CORS |
| `TRUST_PROXY_HOPS` | Proxies in front of the API, used to find each visitor's address for rate limiting (default `1`, Railway's edge) |

The API allows 120 requests per minute per address (the health check is exempt) and lets clients cache catalog and library responses for five minutes. Catalog and library content is read from MongoDB once per process, because it only changes when the server seeds the database on startup.

## Deployments

Vercel builds and serves only the Angular client. The server container seeds MongoDB from `/db` every time it starts, before the API accepts requests. Keep `MONGODB_URI` configured as a secret on the server deployment platform (Railway in the current production setup), not only in Vercel. The seed replaces each MongoDB collection represented by a direct subdirectory of `/db`; collections not represented there are left untouched.

The server's database user needs permission to delete and insert documents in the managed collections. A server deployment fails to start if the seed operation fails.
