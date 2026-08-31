# Architecture

Dependency-free static PWA: plain HTML/CSS/JS, no framework, no build step. External services: Google Fonts (Inter) and `https://open.er-api.com/v6/latest/USD` for live TRY rates.

## Ownership

- `index.html`: markup organized as `.shell` grid panels (`panel-enter`/`panel-results`/`panel-gross`/`panel-rates`) stacked in a single column at every width. Element ids are the DOM contract consumed by `app.js`. A11y attributes, cache-busted asset refs (`?v=N`).
- `app.js`: all state (module-level `let`), pure helpers, DOM refs by id, event handlers, persistence, rate fetching. No modules, single global script.
- `style.css`: neobrutalist design tokens on `:root` (2px borders, offset hard shadows, yellow accent); light theme via `:root[data-theme="light"]` overrides.
- `sw.js`: cache-first app shell; `CACHE_NAME` version must stay in sync with the cached `app.js` query version.

## Data flow

- Amount input → `setFromRobux`/`setFromUsd` (derive the other currency via `DEVEX_RATE`) → `persistCalculatorState` → `updateUI` full re-render.
- Rate: `fetchExchangeRate` → `marketTryRate`/`marketRateSource` → `syncEffectiveRate` (manual override takes precedence) → `tryRate` feeds TRY display.
- Tax panel: `netRobuxInput` → `calculateTaxNet` (capped at `TAX_MAX_ROBUX`) → `calculateGross` → `refreshTaxDisplays`.
- Refresh triggers: startup, daily `setInterval`, `visibilitychange`, `online` event, manual button; `isRateRequestInFlight` guards re-entry.
- The footer status line (`#resetRateBtn`) is shown only when the rate state needs attention (in-flight, manual, cached, stale, offline default); clicking it clears a manual override or re-fetches otherwise. On a fresh live rate the line is hidden and the update time moves into the refresh button's label/title.

## Persistence

`STORAGE_KEYS` is the single registry of localStorage keys (theme, amounts, entry mode, market rate + timestamp, manual rate, tax net, panel open). All access goes through try/catch wrappers `getStoredItem`/`setStoredItem`/`removeStoredItem` for embedded contexts without storage.

## Startup sequence

Bottom of `app.js`: initialize theme → restore cached/manual rates → `syncEffectiveRate` → restore calculator and tax state → apply entry mode and panel visibility → `updateUI` → initial fetch → register service worker (secure contexts only).
