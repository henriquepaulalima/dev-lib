# Architecture

## Purpose

Dev Lib is a personal catalog of reusable frontend pieces and backend ideas. It deliberately keeps discovery data separate from implementation content so the list stays fast and the detailed material can evolve independently.

## Request flow

```text
Angular client
  ├─ GET /api/catalog?q=...      → metadata projection
  ├─ GET /api/catalog/:slug      → one metadata projection
  └─ GET /api/library/:slug      → detailed content projection
                                      │
                          component + feature collections
                                      │
                                   MongoDB
```

The details page joins catalog metadata and library content in the browser. The API never leaks full library content through the search route.

## Client boundaries

- `pages/home` owns search and the catalog list.
- `pages/details` owns one entry's complete reading view.
- `services/library-api.ts` is the only HTTP boundary.
- `models/library-entry.ts` is the client-side API contract.
- Components use standalone Angular APIs, signals, built-in control flow, and Sass. Do not add a UI framework.

## Server boundaries

- `catalog/` owns titles, summaries, tags, types, and search.
- `library/` owns explanations, code snippets, dependencies, and implementation concepts.
- `storage/` maps the repository-backed `component` and `feature` collections.
- `db/` at the repository root is the data authoring source. The seed container imports it before the API starts.
- `health.controller.ts` is operational only and contains no library behavior.

Catalog and library modules may share primitive types, but neither should call the other's routes or return the other's document shape.

## Data ownership

MongoDB contains one collection per subdirectory in `db/`. The initial collections are:

- `component` — frontend pieces and their documentation.
- `feature` — backend concepts and their documentation.

Each stored document contains both searchable metadata and detailed content. The API preserves separation by projecting only metadata from catalog routes and only implementation content from library routes.

The `slug` is the stable identifier and must be unique across all managed collections. Every local database start clears each managed collection and imports all of its `*.data.json` files, making repository data the source of truth.
