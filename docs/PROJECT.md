# Project

DevEx Calculator estimates Roblox DevEx payouts: converts a Robux or USD amount through the fixed `DEVEX_RATE` of $0.0038/R$ into USD and TRY, and computes the gross marketplace sale price needed to net a given Robux amount after the 30% Roblox fee.

## Capabilities

- Robux/USD entry modes (segmented toggle); the other currency is derived on every keystroke.
- DevEx minimum guard: hint below `DEVEX_MIN_ROBUX` (30,000 R$).
- TRY conversion at a live USD/TRY rate from open.er-api.com, with manual rate override and reset to live.
- Gross price panel: net Robux in, `Math.ceil(net / (1 - 0.30))` gross out, fee breakdown, copy, "use main Robux" shortcut.
- Copy Robux/USD/TRY/gross to clipboard (legacy `execCommand` fallback).
- Dark/light theme, localStorage persistence of rates/theme/panel state (entered amounts reset on page load), offline app-shell via service worker.

## Terminology

- DevEx: Roblox developer exchange; fixed payout rate, 30,000 R$ minimum.
- Net/gross: Robux received after vs. required sale price before the 30% `TAX_RATE`.
- Entry mode: `robux` or `usd`, the currency the user types.
- Rate source: `live` (fetched), `cache` (localStorage), `manual` (user override, wins over market), `default` (`DEFAULT_TRY_RATE` fallback).
- Stale rate: live/cache market rate older than `RATE_STALE_MS` (6 hours).

## Non-goals

- Final DevEx eligibility and payouts are determined by Roblox, not this app (stated in the UI "How estimates work" note).
- No automated test suite, no build tooling, no localization (UI and manifest are English-only).
