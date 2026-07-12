<p align="center">
  <br>
  <strong>DevEx Calculator</strong>
  <br>
  <sub>Robux &rarr; USD &middot; Live TRY &middot; Tax Calculator</sub>
  <br><br>
  <img alt="Version" src="https://img.shields.io/badge/version-1.0-4aa3ff">
  <img alt="License" src="https://img.shields.io/badge/license-MIT-35d49a">
  <img alt="Made with" src="https://img.shields.io/badge/vanilla-JavaScript-f7df1e">
  <img alt="Dependencies" src="https://img.shields.io/badge/dependencies-none-success">
</p>

---

A focused, dark-themed calculator for Roblox developers. Convert Robux to USD and Turkish Lira with the official DevEx rate and live exchange data. Clean interface, instant feedback, no compromises. Zero dependencies.

---

## Contents

- [Overview](#overview)
- [How to Use](#how-to-use)
- [Gestures & Shortcuts](#gestures--shortcuts)
- [Tax Calculator](#tax-calculator)
- [Exchange Rate](#exchange-rate)
- [Install as an App](#install-as-an-app)
- [How It Works](#how-it-works)
- [File Structure](#file-structure)
- [Development](#development)

---

## Overview

| | |
|---|---|
| **Robux** | Type any amount in the main input |
| **USD** | Converts instantly at the fixed DevEx rate |
| **Reverse** | Edit the USD field to calculate Robux backwards |
| **TRY** | Shows the equivalent in Turkish Lira |
| **Rate** | Live USD/TRY from API &mdash; or type your own |
| **Quick Add** | `+1K` `+10K` `+100K` `+200K` |
| **Tax Calc** | Built-in 30% Roblox marketplace fee drawer |
| **Copy** | One-tap copy for TRY and gross Robux |
| **Persistence** | Values survive page reloads via LocalStorage |
| **Dark UI** | Responsive, works on mobile and desktop |

---

## How to Use

Open `index.html` in any browser. No server, no build step.

| Platform | Command |
|----------|---------|
| Windows | `start index.html` |
| macOS | `open index.html` |
| Linux | `xdg-open index.html` |

### Basic Flow

1. Type a Robux amount &mdash; USD and TRY update instantly.
2. Click the **USD** field to type a value directly &mdash; Robux recalculates.
3. Tap a quick-add button to increment the Robux amount.
4. Adjust the TRY rate inline or press the refresh icon for the latest rate.
5. Tap the **TRY** amount to copy it to the clipboard.

---

## Gestures & Shortcuts

| Action | Mobile | Desktop |
|--------|--------|---------|
| Add amount | Tap quick button | Click quick button |
| Add double | — | Right‑click |
| Double preview | — | — |
| Clear all | Tap trash icon | Click trash icon |

The quick button labels update live as you interact:

| Button | Single Tap / Left Click | Right‑click |
|--------|--------------------------|--------------|
| `+1K` | 1,000 | 2,000 |
| `+10K` | 10,000 | 20,000 |
| `+100K` | 100,000 | 200,000 |
| `+200K` | 200,000 | 400,000 |

---

## Tax Calculator

Tap the calculator icon in the header to open the drawer.

Enter either **Net Robux** (amount received after the 30% cut) or **Gross Robux** (sale or gamepass price). The other field and the fee calculate automatically.

```
Gross  =  Net / 0.70     rounded down
Net    =  Gross x 0.70   rounded down
Fee    =  Gross - Net
```

| Control | Behavior |
|---------|----------|
| Close | `Esc` key, close button, or tap outside |
| Copy | Icon next to the gross Robux field |

---

## Exchange Rate

The USD/TRY rate is fetched from the free [Exchange Rate API](https://open.er-api.com).

```
GET https://open.er-api.com/v6/latest/USD
```

| Behavior | Detail |
|----------|--------|
| On load | Fetches the latest rate |
| Cache TTL | 24 hours in LocalStorage |
| Fallback | Last cached rate if API is down |
| Default | `46.00` if no cache exists |
| Manual | Type any rate in the inline input |

---

## Install as an App

When hosted through HTTPS or `localhost`, the calculator can be installed as a standalone app from the browser's install menu. After the first visit, the calculator interface is available offline. The USD/TRY rate continues to use the most recently saved value when the exchange-rate API is unavailable.

Service workers do not run when `index.html` is opened with `file://`. Use a local web server for development.

---

## How It Works

| Constant | Value | Location |
|----------|-------|----------|
| DevEx rate | `0.0038` | `app.js:1` |
| Tax rate | `0.30` | `app.js:2` |

### Core Formula

```
USD  = Robux * 0.0038
Robux = USD / 0.0038     rounded down
TRY  = USD * exchangeRate
```

### State Flow

The app maintains a simple state cycle:

```
Input change → update Robux/USD → recalculate TRY → persist to LocalStorage → render UI
```

This runs on every interaction: typing, quick-add, clear, and rate change.

### Number Formatting

Robux values use Turkish locale formatting with thousand separators. USD uses two decimal places with a dollar prefix. TRY uses `Intl.NumberFormat` for proper Turkish Lira formatting.

---

## File Structure

```
devex-calculator/
├── index.html      App markup and drawer overlay
├── style.css       Dark theme, responsive breakpoints, animations
├── app.js          Conversion, tax calculator, API, gestures, state
├── favicon.png     Browser tab icon
├── icon-192.png    PWA install icon
├── icon-512.png    PWA install icon
├── manifest.webmanifest  PWA metadata
├── sw.js            Offline app-shell cache
└── README.md
```

No build tools. No npm. No framework.

---

## Development

```bash
# Validate JavaScript syntax
node --check app.js
```

To change constants, edit the top of `app.js`:

```js
const DEVEX_RATE = 0.0038;
const TAX_RATE   = 0.30;
```

To change quick button amounts, edit `renderQuickButtons()`:

```js
[1000, 10000, 100000, 200000].forEach((amt) => { ... });
```

---

## License

MIT
