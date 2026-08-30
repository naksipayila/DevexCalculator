# Conventions

## JavaScript (`app.js`)

- Constants first as `UPPER_SNAKE_CASE`, then mutable state as `let`, then DOM refs via `getElementById`, then helpers, then event handlers, then the bottom-of-file init calls.
- Arrow-function `const` for pure helpers; `function` declarations only for state mutators (`setFromRobux`, `setFromUsd`).
- camelCase everywhere else; option objects with defaults for behavior flags (`{ keepCaret = false }`).
- Silent `catch` blocks carry a short English comment explaining why the error is swallowed.
- Amounts flow as digit-only strings in state; parsing (`parseRobux`, `parseUsd`) and formatting (`formatNumber`, `formatUsdInput`) are separate steps; all display formatting is `en-US`.
- Editable inputs preserve the caret via `setFormattedValueKeepingCaret`; re-render skips the focused input.
- A11y pattern: `aria-pressed` toggles, `aria-expanded` panels, debounced `aria-live` announcements through `queueAnnouncement`.

## CSS (`style.css`)

- kebab-case classes, `is-*` prefix for state classes (`is-active`, `is-zero`, `is-stale`).
- All colors, radii, shadows as `:root` tokens; light theme only overrides tokens under `:root[data-theme="light"]` plus a few icon rules.
- Visibility toggled by the `hidden` attribute, not display classes.
- Interaction styles gated behind `@media (hover: hover)`; touch and reduced-motion variants in separate media queries.

## Asset versioning

- Cache busting via `?v=N` on `app.js`/`style.css` refs in `index.html`; bump the changed asset's version and `sw.js` `CACHE_NAME` together (they currently differ per asset: css v53, js v55).
