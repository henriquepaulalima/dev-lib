# Adding an entry

Runtime content is authored as JSON under `db/`. Each direct subdirectory represents its MongoDB collection, and every `*.data.json` file inside it contributes documents to that collection.

Current collections:

- `db/component/components.data.json` contains frontend components.
- `db/feature/features.data.json` contains backend features and concepts.

## Entry shape

Add an object to the JSON array for the appropriate collection:

```json
{
  "slug": "stable-kebab-case-name",
  "type": "component",
  "title": "Human-readable title",
  "summary": "One useful sentence for the search result.",
  "tags": ["angular", "forms"],
  "overview": "What this solves and when to reach for it.",
  "dependencies": [],
  "sections": [
    {
      "heading": "Approach",
      "body": "Explain the important decisions and tradeoffs.",
      "language": "typescript",
      "code": "export function example() {}"
    }
  ]
}
```

Use `component` as the type inside the `component` collection and `feature` inside the `feature` collection. Slugs must be unique across every collection.

## Load changes

Start or restart the database stack:

```bash
npm run start:dev:db --workspace server
```

The `mongo-seed` service clears only the collections represented by `db/` subdirectories, then imports every matching data file. Removing an entry from JSON therefore removes it from the managed MongoDB collection on the next seed run.

## Authoring checklist

- Keep the title short and make the summary answer “why would I open this?”
- Use lowercase tags and reuse existing vocabulary.
- Prefer platform APIs and raw TypeScript/CSS over dependencies.
- List every unavoidable runtime dependency explicitly.
- Keep snippets focused; include only the code needed to communicate the pattern.
- Explain accessibility, security, error handling, and cleanup when relevant.
- Never put secrets, credentials, private endpoints, or production data in an entry.
- Validate the JSON and verify the code in a minimal example before storing it.

## Adding a collection

Create `db/<collection-name>/` and place one or more `*.data.json` array files inside it. The generic seed script will create and populate the MongoDB collection automatically. Add a corresponding model registration in `server/src/storage/storage.module.ts` before exposing the collection through the API.
