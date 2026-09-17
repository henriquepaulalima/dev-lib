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
- Model meaningful alternatives as nested variants that inherit the parent contract while providing complete, independently runnable source.
- Keep the default example minimal; variants should describe only their behavioral delta and remain collapsed until requested.
- A TypeScript equivalent may be included for typed projects, but the dependency-free preview always executes the canonical JavaScript source.
- Start with semantic HTML and progressively enhance it with an ES module.
- Use `data-component` on the component root and `data-*` attributes for JavaScript hooks; styling classes are not behavior hooks.
- Prefix styling classes with `c-` and scope customization variables to the component, such as `--dialog-radius`.
- Export one initializer that accepts a root element and returns documented methods plus `destroy()` when behavior is interactive.
- Use semantic HTML before adding ARIA. Add ARIA only where native semantics are insufficient.
- Do not rely on a framework, preprocessor, bundler, global state, or undeclared network resource.
- Avoid global event listeners; if one is necessary, document and implement teardown.
- Verify multiple instances, keyboard operation, narrow layouts, visible focus, and reduced-motion behavior before marking an entry verified.

## Component visual contract

All component recipes must feel like one library even though every recipe is standalone. Treat these values as the default visual language. A component may deviate only when its semantics or interaction require it, and that delta must be explained in its customization or limitation notes.

### Color roles

Use semantic roles instead of scattering raw colors through selectors:

| Role | Baseline | Use |
| --- | --- | --- |
| Canvas | `#f5f5ef` | Demo and page background |
| Surface | `#ffffff` | Component panels and controls |
| Text | `#171915` | Primary content |
| Muted text | `#62665d` | Descriptions and secondary content |
| Border | `#dcddd4` | Dividers and quiet boundaries |
| Strong border | `#bfc1b7` | Controls and emphasized boundaries |
| Accent | `#b9f474` | Primary actions and focus support |
| Accent text | `#162600` | Text placed on the accent |
| Focus | `#b9f474` | Visible keyboard focus outline |
| Backdrop | `rgb(20 24 18 / 55%)` | Modal blocking layer |

- Define these roles as component-prefixed custom properties on the component root, such as `--dialog-surface`; never depend on viewer-level variables.
- Variants must keep the parent's token names and defaults. They may add variant-specific tokens but must not silently redefine the shared palette.
- Color must never be the only indicator of focus, state, validation, or selection.

### Spacing and sizing

- Use the shared spacing scale: `0.25rem`, `0.5rem`, `0.75rem`, `1rem`, `1.5rem`, and `2rem`.
- Default component padding is `1.5rem`; compact regions may use `1rem`, and demo canvases may use `2rem`.
- Use a `1rem` safe viewport gutter on each side of overlays: `calc(100% - 2rem)`.
- Interactive controls have a minimum height of `2.75rem`. Icon-only controls use the same minimum hit area.
- Use content-driven widths with a viewport cap. Standard dialog widths are `22rem` small, `30–36rem` regular, and `48rem` large.
- Avoid arbitrary one-off measurements. Add a documented token when a genuinely reusable new size is needed.

### Shape and elevation

- Controls use a `0.55rem` radius, nested panels use `0.75rem`, and primary floating surfaces use `1rem`.
- Pills are the only elements that use a fully rounded radius.
- Standard floating elevation is `0 1.5rem 5rem rgb(20 24 18 / 22%)`.
- Use `1px` borders. Prefer the border role for structure and the strong-border role for controls.

### Typography

- Use `Inter, ui-sans-serif, system-ui, sans-serif`; controls inherit the surrounding font.
- Body text starts at `1rem` with `1.6` line height.
- Component titles use `clamp(1.55rem, 5vw, 2rem)`, `1.05` line height, and `-0.04em` letter spacing.
- Eyebrows and metadata use `0.7rem`, `0.08em` letter spacing, and uppercase text.
- Use weights `400` for body copy and `650` for controls or important labels. Do not introduce extra font families inside a recipe.

### Interaction and motion

- Keyboard focus uses a `0.2rem` solid focus outline with a `0.15rem` offset.
- Hover may strengthen a border or text color but must not move layout.
- Keep nonessential transitions between `160ms` and `180ms` and disable them under `prefers-reduced-motion: reduce`.
- When a recipe animates entry or exit, provide a matching opening and closing path. Escape, backdrop clicks, and close controls must use the same exit path, with a non-animated fallback when motion is reduced or unavailable.
- Disabled, busy, selected, expanded, and invalid states must remain distinguishable at narrow widths and high zoom.

### Variant consistency audit

Before marking a component or variant verified, compare it with its default recipe and confirm:

1. Shared color, typography, spacing, radius, elevation, control-size, focus, and backdrop values are unchanged.
2. All raw values belong to the baseline scales above or are documented variant-specific values.
3. The full shared token set is present because every variant example must remain independently copyable.
4. Only behavior-specific properties differ, such as width, maximum height, positioning, or overflow.
5. Desktop, mobile, keyboard, reduced-motion, and long-content behavior have been checked in the exact stored source.

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
- Apply the Component visual contract to every frontend recipe and audit every subcomponent against its parent before publication.
