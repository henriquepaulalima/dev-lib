# Engineering patterns

## General rules

1. Keep each entry independently understandable and copyable.
2. Prefer a small native solution; add a package only when it removes meaningful risk or complexity.
3. Keep transport, business logic, persistence, and presentation in distinct boundaries.
4. Treat the TypeScript compiler's strict mode as part of the design, not a final cleanup step.
5. Add focused tests for logic with branching, transformations, or failure states.

## Frontend entries

- Use standalone Angular components and built-in template control flow.
- Default to `ChangeDetectionStrategy.OnPush` and signals for local view state.
- Use semantic HTML before adding ARIA. Add ARIA only where native semantics are insufficient.
- Scope component Sass locally and use the global design tokens when the library client renders a demo.
- Avoid global event listeners; if one is necessary, document teardown.
- Keep data fetching out of presentational components.

## Backend entries

- Keep controllers thin: parse the request, delegate, and map the result.
- Put business rules in injectable services that can run without HTTP.
- Hide database-specific behavior behind a repository or focused persistence service when the feature may be reused.
- Validate untrusted input at the boundary and cap search, paging, and payload sizes.
- Return intentional errors instead of persistence-library errors.
- Make retries and repeated commands safe where practical.

## API conventions

- All routes live under `/api`.
- Catalog routes return metadata only.
- Library routes return detailed content only.
- Slugs use lowercase kebab-case and are stable identifiers.
- New list endpoints should be bounded and deterministic.

## Styling conventions

- No UI libraries or CSS frameworks.
- Use Sass for organization and native CSS custom properties for runtime tokens.
- Ensure keyboard focus is visible and color is not the only signal.
- Test layouts at narrow mobile and wide desktop widths.
- Respect reduced-motion preferences when adding nonessential animation.

