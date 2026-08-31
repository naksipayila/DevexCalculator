<div align="center">

<img src="icon-512.png" alt="DevEx Calculator" width="96" />

# DevEx Calculator

**Robux → USD → TRY** — estimate DevEx payouts in seconds.

Zero dependencies · fully static · PWA · works offline

[**🚀 Live Demo**](https://naksipayila.github.io/DevexCalculator/)

![HTML](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JS](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen?style=flat-square)
![PWA](https://img.shields.io/badge/PWA-offline-blueviolet?style=flat-square)

</div>

<br />

<table align="center">
  <tr>
    <td align="center"><img src="assets/screenshot-dark.png" alt="Dark theme" width="420" /></td>
    <td align="center"><img src="assets/screenshot-light.png" alt="Light theme" width="420" /></td>
  </tr>
  <tr>
    <td align="center"><sub>🌙 Dark</sub></td>
    <td align="center"><sub>☀️ Light</sub></td>
  </tr>
</table>

---

## ✨ Features

| | |
|---|---|
| **Instant conversion** | Robux or USD entry mode; the other currencies update on every keystroke |
| **Live USD/TRY rate** | Fetched from [open.er-api.com](https://open.er-api.com/), with manual override and reset to live |
| **Gross price calculator** | Sale price needed to net a target Robux amount after the 30% Roblox fee, plus fee breakdown |
| **DevEx minimum guard** | Instant hint below the 30,000 R$ payout threshold |
| **One-click copy** | Robux, USD, TRY and gross values to the clipboard |
| **Dark / light theme** | Preference persisted in the browser |
| **Offline (PWA)** | App shell cached by a service worker; last rate served from cache |

---

## 🧮 How It Calculates

```text
USD           = Robux × 0.0038          (fixed DevEx rate)
TRY           = USD × rate              (live / manual USD-TRY)
Gross price   = ceil(Net Robux ÷ 0.70)  (to net the target after the 30% fee)
```

> The DevEx rate (1 R$ = $0.0038) and the 30% marketplace fee are set by Roblox;
> final eligibility and payout terms are determined by Roblox, not this app.

---

## ⚡ Quick Start

No install, no build — static files only:

```bash
# serve locally
python -m http.server 8000
# → http://localhost:8000
```

> The service worker and clipboard APIs require a secure context like `localhost` (`file://` won't work).

---

## Project Structure

```text
DevexCalculator/
├── index.html            # Markup, a11y, cache-busted asset refs
├── app.js                # All state, calculations, rate fetching, persistence
├── style.css             # Design tokens, dark/light theme, layout
├── sw.js                 # Cache-first app-shell service worker
├── manifest.webmanifest  # PWA manifest
└── assets/               # Screenshots
```

---

<div align="center">

Made for Roblox developers 💛

</div>
