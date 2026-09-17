# Engineering patterns

## General rules

1. Keep each entry independently understandable and copyable.
2. Prefer a small native solution; add a package only when it removes meaningful risk or complexity.
3. Keep transport, business logic, persistence, and presentation in distinct boundaries.
4. Treat the TypeScript compiler's strict mode as part of the design, not a final cleanup step.
5. Add focused tests for logic with branching, transformations, or failure states.

## Frontend entries

- Store component recipes as framework-independent HTML, CSS, and JavaScript. Angular is the library viewer, not the component runtime.
- Every example must render from the same stored source shown in its HTML, CSS, and JavaScript tabs.
- A TypeScript equivalent may be included for typed projects, but the dependency-free preview always executes the canonical JavaScript source.
- Start with semantic HTML and progressively enhance it with an ES module.
- Use `data-component` on the component root and `data-*` attributes for JavaScript hooks; styling classes are not behavior hooks.
- Prefix styling classes with `c-` and scope customization variables to the component, such as `--dialog-radius`.
- Export one initializer that accepts a root element and returns documented methods plus `destroy()` when behavior is interactive.
- Use semantic HTML before adding ARIA. Add ARIA only where native semantics are insufficient.
- Do not rely on a framework, preprocessor, bundler, global state, or undeclared network resource.
- Avoid global event listeners; if one is necessary, document and implement teardown.
- Verify multiple instances, keyboard operation, narrow layouts, visible focus, and reduced-motion behavior before marking an entry verified.

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
