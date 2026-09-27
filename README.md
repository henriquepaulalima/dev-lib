# Dev Lib

A private, searchable library for small frontend components and backend concepts. The Angular client displays the catalog, the NestJS API separates searchable metadata from detailed library content, and MongoDB persists both.

## Prerequisites

- Node.js 20.19 or newer
- npm
- Docker with Docker Compose

Install the workspace dependencies once:

```bash
npm install
```

## Run in development

### Complete Docker stack

To build and run MongoDB, the seeded API, and the Angular client together:

```bash
docker compose up --build
```

Open `http://localhost:4200`. The API is available at `http://localhost:3000/api`, and MongoDB is exposed on `localhost:27017`.

Compose uses the development environments. Database content is loaded from `db/` before the API starts.

### Local watch mode

Start the database and seed the repository data:

```bash
npm run start:dev:db --workspace server
```

Then run these in separate terminals:

```bash
npm run start:dev --workspace server
```

```bash
npm run start:dev --workspace client
```

The local watch client reads `client/src/environments/environment.ts`, and the server reads `server/.env.development`. Keep the API port in those files aligned. Docker builds use `client/src/environments/environment.docker.ts` to call the API directly on port 3000.

The local client opens on `http://localhost:4400`. To use another client port, pass it after npm's `--` separator, for example `npm run start:dev --workspace client -- --port 4500`, and add that origin to `CLIENT_ORIGIN` in `server/.env.development`.

To run only the database and containerized API together:

```bash
npm run start:dev:all --workspace server
```

Start the Angular client separately with `npm run start:dev --workspace client`.

Stop foreground commands with `Ctrl+C`. To remove Compose containers afterward while preserving database data:

```bash
docker compose down
```

## Run in production mode

Before starting production mode:

1. Set the deployed API URL in `client/src/environments/environment.production.ts`.
2. Set `MONGODB_URI` and `CLIENT_ORIGIN` in `server/.env.production`, or provide them as deployment environment variables.
3. Ensure the production MongoDB instance is reachable.

Build both applications:

```bash
npm run build --workspace server
npm run build --workspace client -- --configuration production
```

Start the compiled production server:

```bash
npm run start:prod --workspace server
```

In another terminal, serve the client using its production configuration:

```bash
npm run start:prod --workspace client
```

The client is available at `http://localhost:4200` unless Angular reports a different port. Production deployments should serve the generated files from `client/dist/client/browser` with a web server instead of using `ng serve`.

## Workspace

- `client/` — standalone Angular application using native Angular features and Sass only.
- `server/` — NestJS API split into catalog metadata and detailed library content.
- `db/` — versioned JSON source data, organized by MongoDB collection.
- `docs/` — architecture, authoring rules, and conventions.

Environment configuration is documented in [docs/environments.md](docs/environments.md). Production files contain placeholders that must be replaced or overridden by deployment environment variables.

Two clearly marked example entries are seeded from `db/` whenever the local database stack starts. Replace them when adding real library entries. See [docs/adding-entries.md](docs/adding-entries.md).
