# Adding an entry

Runtime content is authored as JSON under `db/`. Each direct subdirectory represents its MongoDB collection, and every `*.data.json` file inside it contributes documents to that collection.

Current collections:

- `db/component/components.data.json` contains frontend component recipes.
- `db/feature/features.data.json` contains backend features and concepts.

## Shared metadata

Every entry starts with searchable catalog metadata and a short overview:

```json
{
  "slug": "stable-kebab-case-name",
  "type": "component",
  "title": "Human-readable title",
  "summary": "One useful sentence for the search result.",
  "tags": ["html", "css", "javascript"],
  "overview": "What this solves and when to reach for it.",
  "dependencies": []
}
```

Use `component` inside the component collection and `feature` inside the feature collection. Slugs must be unique across every collection.

## Component content

Components use a typed `component` object rather than free-form article sections:

```json
{
  "sections": [],
  "component": {
    "status": "verified",
    "useWhen": "The situation this pattern is designed for.",
    "avoidWhen": "Cases where another pattern is clearer.",
    "examples": [
      {
        "slug": "basic",
        "title": "Basic example",
        "description": "What to try in the live session.",
        "canvasHeight": 420,
        "source": {
          "html": "<div data-component=\"example\">...</div>",
          "css": ".c-example { ... }",
          "javascript": "export function createExample(root) { ... }",
          "typescript": "export function createExample(root: HTMLElement) { ... }"
        }
      }
    ],
    "anatomy": [{ "name": "Trigger", "description": "What this part does." }],
    "tokens": [{ "name": "--example-color", "defaultValue": "#000000", "description": "What the token controls." }],
    "accessibility": ["Keyboard and screen-reader behavior to verify."],
    "responsive": "How the component adapts at narrow widths.",
    "limitations": ["A deliberate constraint or unsupported case."],
    "provenance": {
      "label": "Original implementation",
      "note": "Where the pattern came from and what was changed."
    }
  }
}
```

The preview runs the exact `source` values in an isolated iframe. Do not maintain separate demo-only markup or behavior.

### Component example rules

- Provide complete HTML, CSS, and JavaScript that work together.
- Keep the first example minimal and representative; add separate examples only for meaningful variants or states.
- Use native browser APIs and no dependencies by default.
- Keep JavaScript out of the HTML string. The session loads the JavaScript field as an ES module.
- TypeScript is optional and is displayed as a typed authoring alternative; keep it behaviorally equivalent to the JavaScript source.
- Do not add remote scripts, styles, fonts, images, API calls, or form submissions. The preview session intentionally blocks network access.
- Scope CSS to the component root and document every supported custom property.
- Include teardown for listeners, observers, and timers.
- Record source URLs and licensing in provenance when another library inspired the result. Do not copy source that its license does not permit.

## Feature content

Features remain article-like and use ordered sections:

```json
{
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

## Load changes

Start or restart the database stack:

```bash
npm run start:dev:db --workspace server
```

The seed service clears only the collections represented by `db/` subdirectories, then imports every matching data file. Removing an entry from JSON therefore removes it from the managed MongoDB collection on the next seed run.

## Authoring checklist

- Make the summary answer “why would I open this?”
- Reuse lowercase tag vocabulary.
- Keep every example independently understandable and copyable.
- Test the exact stored source in the live session.
- Explain accessibility, responsive behavior, cleanup, limitations, and provenance.
- Never store secrets, credentials, private endpoints, production data, or unlicensed assets.
- Validate the JSON and run both client and server builds before committing.
