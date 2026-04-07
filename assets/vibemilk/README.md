# Vibemilk

[![CSS](https://img.shields.io/badge/CSS-Custom_Properties-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
[![Themes](https://img.shields.io/badge/Themes-10_built--in-7551FF?style=for-the-badge)](#themes)
[![Tokens](https://img.shields.io/badge/Tokens-270+-E8A838?style=for-the-badge)](#architecture)
[![Platforms](https://img.shields.io/badge/Platforms-Web_·_ESP32_·_Swift_·_Rust-00FFD1?style=for-the-badge)](#token-export)
[![Elementor](https://img.shields.io/badge/Elementor-V4_Ready-92003B?style=for-the-badge&logo=elementor&logoColor=white)](#elementor-v4)
[![License](https://img.shields.io/badge/License-Proprietary-10B981?style=for-the-badge)](./LICENSE)

> A design system that works on a 3.49" ESP32 desk bar, a 100-inch party TV,
> an Elementor website, and a Swift app. At the same time. With the same tokens.

**Vibemilk** is the Netmilk Studio design system. 270 CSS custom properties, 10 themes, zero dependencies, zero build tools required. Token-driven, theme-ready, framework-agnostic. Built for every Netmilk interface — from embedded displays with 172 pixels of width to full desktop dashboards — without the usual "one design system per platform" madness.

It is not a component library. Component libraries have npm install and a therapist.
This has *a flat CSS file and opinions about border-radius.*

---

## Table of Contents

- [Why This Exists](#why-this-exists)
- [Themes](#themes)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Token Export](#token-export)
- [Elementor V4](#elementor-v4)
- [Brand Voice](#brand-voice)
- [Documentation](#documentation)
- [License](#license)

---

## Why This Exists

Every agency eventually builds a design system. Usually after the fourth project where someone hardcodes `#7551FF` in twelve places, the fifth where the client wants "the same look but corporate", and the sixth where the intern asks "do we have a button component?" and gets three different answers.

So you build one. You start with tokens because you've read the articles. You add themes because ScryBar needs phosphor green and the client website needs boardroom blue. You add ESP32 export because your desk bar runs on RGB565 and doesn't speak CSS. You add Swift and Rust because why not, the tokens are just strings. You add Elementor because the agency uses WordPress and half the team lives in the visual editor.

Then you realize you've built a multi-platform design system that exports to five languages and runs on hardware that costs less than a pizza. And you're fine with it.

---

## Themes

Ten built-in themes. Dark, light, retro, corporate, nostalgic. Each one overrides all 270 tokens.

| Theme | Mood | Font | Mode |
|---|---|---|---|
| **vibemilk-default** | Studio signature — violet/cyan on deep dark | Montserrat | Dark |
| **cyber-grid** | Terminal hacker, neon grid lines | Space Mono | Dark |
| **acid-pop** | Neon rave, high contrast | Chakra Petch | Dark |
| **tokyo-transit** | Japanese metro signage | Delius Unicase | Dark |
| **mono-brutalist** | Editorial, raw typography | IBM Plex Mono | Dark |
| **mint-protocol** | Herbal harmony, soft light | Encode Sans Semi Expanded | Light |
| **cathode-ray** | CRT phosphor green, 1983 vibes | Space Mono | Dark |
| **clean-sheet** | Corporate B2B — the one that won't scare a CFO | Montserrat | Light |
| **solar-dust** | Desert tech, warm dark, Tatooine control panel | Chakra Petch | Dark |
| **geocities-97** | Win95/Geocities, bevel borders, visitor counter energy | System UI | Light |

Switching themes is one attribute: `<html data-theme="cathode-ray">`. Everything else follows.

New theme rule: a theme is not considered accepted when the CSS file exists. It is accepted only after it passes the full QA protocol in `docs/theme-qa-protocol.md`, including token export, contrast audit, and page-by-page visual verification over HTTP.

---

## Architecture

```
.
|-- index.html                    # Hub landing page
|-- pages/
|   |-- foundations.html          # Tokens, layout, colors, typography
|   |-- components.html           # Live component catalog (20+ components)
|   |-- themes.html               # Theme gallery + device mockups
|   |-- integration.html          # Quick start, AI playbook, Elementor V4
|   |-- token-export.html         # Token explorer + multi-platform export
|   `-- brand-voice.html          # Netmilk writing style guide
|-- css/
|   |-- vibemilk-core.css         # Tokens + base + components + utilities
|   |-- vibemilk-themes.css       # All themes aggregator
|   |-- vibemilk.css              # Full bundle (core + themes)
|   |-- core/
|   |   |-- tokens.css            # 270 design tokens (the source of truth)
|   |   |-- base.css              # Reset + base elements
|   |   |-- components.css        # Component imports
|   |   `-- utilities.css         # Helper classes
|   |-- components/               # Surfaces, actions, forms, feedback, data, nav, carousel
|   `-- themes/                   # 10 theme files
|-- js/
|   `-- vibemilk-docs.js          # Theme manager + docs UI (~700 lines, vanilla IIFE)
|-- scripts/
|   `-- build-tokens.js           # Token export: JSON, Swift, Rust, C/RGB565, Elementor
|-- tokens/                       # Generated exports (gitignored)
`-- docs/
    `-- brand-voice.md            # Full brand voice reference
```

**Core rule:** the core layer doesn't know themes exist. Themes only override tokens. Components read tokens. The dependency arrow always points one way.

---

## Quick Start

### Single Theme (production)

```html
<link rel="stylesheet" href="css/vibemilk-core.css">
<link rel="stylesheet" href="css/themes/clean-sheet.css">
<html data-theme="clean-sheet">
```

Zero overhead from unused themes. One CSS file for the system, one for the look.

### Runtime Theme Switcher

```html
<link rel="stylesheet" href="css/vibemilk-core.css">
<script src="js/vibemilk-docs.js" defer></script>
<select data-vm-theme-select>
  <option value="vibemilk-default">vibemilk-default</option>
  <option value="cyber-grid">cyber-grid</option>
  <!-- ... -->
</select>
```

Theme files are lazy-loaded on demand. Selection persists to `localStorage`.

### Full Bundle (if you just want everything)

```html
<link rel="stylesheet" href="css/vibemilk.css">
```

---

## Token Export

One Node script, five output formats, ten themes. No dependencies.

```bash
npm run build:tokens
# Generates 50 files in tokens/
```

| Format | File | For |
|---|---|---|
| **JSON** | `{theme}.json` | Web, design tools, W3C Design Tokens format |
| **Swift** | `{theme}.swift` | iOS/macOS apps (static let constants) |
| **Rust** | `{theme}.rs` | Rust projects (pub const) |
| **C Header** | `{theme}.h` | ESP32/Arduino (colors as RGB565 `uint16_t`) |
| **Elementor** | `{theme}.elementor.json` | Elementor V4 Variables Manager reference |

The C header converts every hex color to RGB565 for TFT displays. Because a 172×320 screen doesn't have opinions about HSL.

---

## Elementor V4

Vibemilk maps directly to Elementor V4's architecture:

| Vibemilk | Elementor V4 |
|---|---|
| `--accent-primary` | Variable (Color type) |
| `--font-family` | Variable (Typography type) |
| `.vm-btn--primary` | Global Class + scoped Custom CSS |

Create Variables in the Variables Manager, create Global Classes with `selector { ... }` scoped CSS, switch themes by updating Variable values. One set of classes, infinite themes.

Full guide: `pages/integration.html#elementor`

---

## Brand Voice

Netmilk has a documented writing style. Technically precise, culturally irreverent, never verbose, always self-aware. The Brand Voice Guide lives at `docs/brand-voice.md` and covers README structure, tone spectrum, signature patterns, UI copy guidelines, and a checklist.

Every Netmilk README follows the same skeleton: badges, sardonic blockquote, bold pitch, "Why This Exists" narrative, tables for structured data, MIT license with a closing italic line. Not loosely — exactly.

---

## Documentation

The design system is its own documentation. Open `index.html` (or serve locally for full theme switching):

```bash
npx serve -p 8765
# Open http://localhost:8765
```

Renderer gotcha for local automation on this machine: Firefox headless is currently unstable on macOS `26.3.1` and may crash before rendering. For automated screenshots or visual QA, prefer `Google Chrome Canary` headless after serving the repo over HTTP.

Pages: Hub, Foundations, Components (20+ live demos), Themes (gallery + device mockups), Integration (quick start + Elementor V4), Token Export, Brand Voice.

---

## Naming Conventions

- **Classes:** `vm-` prefix, BEM-adjacent (`.vm-btn`, `.vm-btn--primary`, `.vm-card__header`)
- **Tokens:** `--bg-*`, `--text-*`, `--accent-*`, `--fs-*`, `--fw-*`, `--space-*`, `--radius-*`, `--shadow-*`
- **Theme selector:** `:root[data-theme="theme-name"]`
- **Storage key:** `vibemilk.design-system.theme`

---

## License

All rights reserved (c) 2026 Netmilk Studio sagl — Monteggio Plains.

---

<div align="center">

*Built with CSS custom properties, ten themes nobody asked for, and the unwavering belief*
*that a design system should work on a 1.47" ESP32 display and an Elementor website without changing a single token name.*

</div>
