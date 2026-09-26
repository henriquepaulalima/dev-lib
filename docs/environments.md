# Environments

## Client

Angular environment files are selected at build time:

- `client/src/environments/environment.ts` is used by development builds and points to `http://localhost:3000/api`.
- `client/src/environments/environment.production.ts` is used by production builds and contains a placeholder for the deployed API URL.

Update `apiUrl` in the production file before deploying the client. Do not place secrets in Angular environment files: every value is included in the browser bundle.

Run the client with `npm run start:dev --workspace client` or `npm run start:prod --workspace client`.

The client Dockerfile accepts a `BUILD_CONFIGURATION` build argument. It defaults to `production`; local Docker Compose explicitly selects `development` so the browser can reach the API exposed on local port 3000.

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

## Vercel client deployment

The Vercel build runs `npm run seed:db --workspace server` before building the Angular client. Set `MONGODB_URI` in the Vercel project's environment variables for every environment that can deploy (Production, Preview, and Development if those deployments should refresh the database). The build replaces each MongoDB collection represented by a direct subdirectory of `/db` with the JSON documents in that directory. Collections not represented in `/db` are left untouched.

Configure this variable as a secret and ensure its database user can delete and insert documents in the managed collections. A deployment fails before the client build if the variable is missing or the seed operation fails.
