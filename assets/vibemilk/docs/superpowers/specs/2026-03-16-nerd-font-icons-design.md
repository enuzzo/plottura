# Phase 8: Nerd Font Icon Integration — Design Spec

> Vibemilk Design System v3.0 — 2026-03-16

## Summary

Replace all inline SVG icons and Unicode symbols across Vibemilk with Nerd Font icon glyphs. Add a dedicated icon specimen page, utility CSS classes, and update token exports. Zero SVG residuals.

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| SVG replacement scope | Full — ~142 SVG instances (~20-30 unique patterns, duplicated across 10 pages) + 8 Unicode symbols | Consistency across the entire system |
| Font source | Symbols Only Nerd Font (glyphs only, no alphanumeric) | Clean separation from text fonts |
| Specimen location | Dedicated `pages/icons.html` + mini-preview in foundations | Avoid bloating foundations.html (lesson from Phase 7 split) |
| Specimen features | Search, categories, click-to-copy, size scale, color variants, usage snippets | Features 7 (counter) and 8 (dark/light toggle) cut — YAGNI |
| Subsetting | Two-tier: curated subset (~300 glyphs, ~50-80KB) + full font (~1.2MB) | Subset for production, full for exploration |
| CSS API | Unicode-first with `.vm-nf` base class + modifiers; named `::before` classes for subset only | Lightweight CSS, familiar pattern, no 10k-class bloat |
| Migration strategy | Incremental by icon type (structural first, decorative second) | Parallelizable, each batch is an atomic commit |
| Architecture approach | Infrastructure-first: font → CSS → specimen → migration → docs | Each layer tested before building on top |

## 1. Font Infrastructure

### 1.1 Font Files

```
fonts/nerd/
  SymbolsNerdFontMono-Regular.woff2   — full Nerd Font symbols (~1.2MB)
  VibemilkIcons.woff2                  — curated subset (~50-80KB)
```

- **VibemilkIcons** = custom-named subset of Symbols Nerd Font Mono
- Generated via `pyftsubset` from the full font, selecting ~300 codepoints
- Only `.woff2` format (modern browser coverage is 97%+)

### 1.2 @font-face Declarations

Added to `css/core/tokens.css` (alongside existing Matt @font-face):

```css
@font-face {
  font-family: 'VibemilkIcons';
  src: url('../fonts/nerd/VibemilkIcons.woff2') format('woff2');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Symbols Nerd Font Mono';
  src: url('../fonts/nerd/SymbolsNerdFontMono-Regular.woff2') format('woff2');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}
```

### 1.3 Token

```css
/* Inside :root, :root[data-theme="vibemilk-default"] block, next to --font-family and --font-mono */
--font-icons: 'VibemilkIcons', 'Symbols Nerd Font Mono', sans-serif;
```

Placement: inside the `:root` block alongside `--font-family` and `--font-mono`. Theme files do NOT override this token — the icon font is theme-agnostic.

Fallback chain: subset → full → `sans-serif` (renders tofu/empty boxes for PUA codepoints). This is acceptable — if both woff2 files fail to load, the site has bigger problems than missing icons. No `@supports` check or loading state needed.

## 2. CSS Class System (`css/core/icons.css`)

New file, imported by `css/vibemilk-core.css`.

### 2.1 Base Class

```css
.vm-nf {
  font-family: var(--font-icons);
  font-style: normal;
  font-weight: normal;
  font-size: inherit;
  line-height: 1;
  display: inline-block;
  vertical-align: middle;
  text-rendering: auto;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

### 2.2 Size Modifiers (phi-derived)

```css
.vm-nf--sm  { font-size: 0.75em; }
.vm-nf--md  { font-size: 1em; }      /* default */
.vm-nf--lg  { font-size: 1.272em; }  /* sqrt(phi) */
.vm-nf--xl  { font-size: 1.618em; }  /* phi */
.vm-nf--2xl { font-size: 2.618em; }  /* phi squared */
```

### 2.3 Color Modifiers

```css
.vm-nf--accent    { color: var(--accent-primary); }
.vm-nf--secondary { color: var(--accent-secondary); }
.vm-nf--muted     { color: var(--text-muted); }
.vm-nf--success   { color: var(--color-success); }
.vm-nf--warning   { color: var(--color-warning); }
.vm-nf--danger    { color: var(--color-danger); }
```

### 2.4 Named Classes (subset only, ~300)

```css
.vm-nf-git::before           { content: "\F1D3"; }
.vm-nf-docker::before        { content: "\F308"; }
.vm-nf-chevron-right::before { content: "\E0B0"; }
/* ... ~300 total */
```

### 2.5 Accessibility

**Decorative icons** (chevrons, arrows, visual embellishments):
```html
<span class="vm-nf" aria-hidden="true">&#xE702;</span>
```

**Informational icons** (status indicators, action icons without text):
```html
<span class="vm-nf vm-nf-warning" aria-label="Warning"></span>
<!-- or with adjacent sr-only text -->
<span class="vm-nf vm-nf-check" aria-hidden="true"></span>
<span class="sr-only">Success</span>
```

Rules:
- Sidebar chevrons, dropdown arrows, decorative card icons → `aria-hidden="true"`
- Status indicators (check, x, warning, info) in Batch 4 → need `aria-label` or adjacent `.sr-only` text
- Buttons with icon + visible text → icon gets `aria-hidden="true"` (text provides the label)
- Icon-only buttons → button gets `aria-label`, icon gets `aria-hidden="true"`

### 2.6 Usage Patterns

```html
<!-- Unicode-first (decorative) -->
<span class="vm-nf" aria-hidden="true">&#xE702;</span>

<!-- With modifiers -->
<span class="vm-nf vm-nf--lg vm-nf--accent" aria-hidden="true">&#xE702;</span>

<!-- Named class (empty element) -->
<span class="vm-nf vm-nf-git" aria-hidden="true"></span>

<!-- Informational icon -->
<span class="vm-nf vm-nf-warning" aria-label="Warning"></span>
```

## 3. Curated Subset — Glyph Categories

~250-300 glyphs across 10 categories:

| Category | Count | Examples |
|----------|-------|---------|
| UI Controls | ~40 | chevrons, arrows, close, check, search, gear, eye, edit, trash |
| Dev & Languages | ~60 | git, GitHub, terminal, JS, TS, Python, Rust, Swift, Docker, npm |
| File Types | ~30 | folder, file-code, file-image, json, markdown, yaml |
| Status & Feedback | ~25 | check-circle, x-circle, warning, info, clock, shield, lock |
| System & Hardware | ~20 | desktop, mobile, wifi, CPU, server, cloud, chip |
| Navigation & Layout | ~20 | home, dashboard, layers, grid, list, sidebar |
| Communication | ~15 | mail, chat, notification, share, link |
| Weather | ~15 | sun, cloud, rain, snow, wind, temperature |
| Powerline | ~10 | arrow separators, branch, line-number |
| Brand/Logo | ~15 | Apple, Linux, Windows, Android, Raspberry Pi, Arduino |

## 4. Icon Specimen Page (`pages/icons.html`)

### 4.1 Page Sections

1. **Hero** — title, glyph count badge, two-tier explanation
2. **Quick Start** — 3 copy-paste snippets (Unicode, named class, with modifiers)
3. **Size Scale** — one icon at all 5 sizes, phi labels
4. **Color Variants** — 2x3 grid, 6 color modifiers, theme-aware
5. **Icon Explorer** — search bar + category tabs + clickable glyph grid + copy toast
6. **Usage Patterns** — real-world examples (button+icon, badge, nav item, card header, input prefix)
7. **Integration Guide** — subset vs full loading, token reference, link to integration.html

### 4.2 Icon Explorer Interactivity

Vanilla JS (~150-200 lines), either IIFE in page or added to `vibemilk-docs.js`:

- `filterIcons(query)` — real-time search filtering
- `filterByCategory(cat)` — tab-based category filter
- `copyToClipboard(code)` — click glyph → copy HTML entity → toast "Copied!"
- `loadFullFont()` — on-demand load of Symbols Only NF when switching from subset to full view

### 4.3 Explorer Grid

```css
display: grid;
grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
gap: var(--space-3);
```

Each card: glyph (large), name (small), codepoint (tiny). Click target is the full card.

## 5. Mini-Preview in Foundations

Added after typography section in `pages/foundations.html`:

- Title: "Icon System — Nerd Font Glyphs"
- Row 1: 8-10 curated icons, `--lg`, alternating accent/secondary
- Row 2: Size scale demo (one icon, `--sm` to `--2xl`)
- Row 3: Quick usage snippet
- CTA: "Explore all icons →" linking to `pages/icons.html`

~30-40 lines HTML, zero JS.

## 6. Icon Migration (by type)

### Batch 1: Sidebar Chevrons
- All sidebar nav chevron SVGs → `<span class="vm-nf vm-nf-chevron-right"></span>`
- Identical across all 10+ HTML pages — global search-and-replace

### Batch 2: Theme Toggle
- `&#9728;` (sun) and `&#9790;` (moon) → Nerd Font sun/moon glyphs
- 11 instances each across pages

### Batch 3: Dropdown Arrows
- SVG `<polyline points="6 9 12 15 18 9"/>` → chevron-down glyph
- CSS adjustment for vertical alignment

### Batch 4: Decorative Icons
- Hub card icons (index.html) → thematic Nerd Font glyphs per card
- Section header icons → relevant category glyphs
- Status indicators (check, x, warning, info) → NF equivalents
- Case-by-case selection using the specimen page as reference

## 7. Documentation Updates

### 7.1 Integration Page
New "Icons" section in `pages/integration.html`:
- Loading instructions (subset vs full)
- Token reference
- Class API
- Minimal working example
- ESP32 note: use codepoint values from C header export

### 7.2 Sidebar Nav
All 10+ HTML pages get "Icons" link in sidebar navigation.

### 7.3 Token Export (`scripts/build-tokens.js`)
New category: `icons: ['--font-icons']`

Export formats:
- **JSON:** `"icons": { "font-icons": "..." }`
- **Swift:** `static let fontIcons = "VibemilkIcons"`
- **Rust:** `pub const FONT_ICONS: &str = "VibemilkIcons";`
- **C/Arduino:** `#define VM_FONT_ICONS "VibemilkIcons"` + codepoint defines for subset

## 8. Files Changed

| File | Action |
|------|--------|
| `fonts/nerd/SymbolsNerdFontMono-Regular.woff2` | Add (new) |
| `fonts/nerd/VibemilkIcons.woff2` | Add (new, generated subset) |
| `css/core/tokens.css` | Add @font-face + --font-icons token |
| `css/core/icons.css` | Add (new) — base class, modifiers, named classes |
| `css/vibemilk-core.css` | Add `@import "core/icons.css"` |
| `pages/icons.html` | Add (new) — full specimen page |
| `css/showcase.css` | Add icon explorer grid styles |
| `pages/foundations.html` | Add mini-preview section |
| `pages/integration.html` | Add Icons documentation section |
| `scripts/build-tokens.js` | Add icons category + C codepoint header |
| `index.html` + `pages/*.html` (all active pages) | Update sidebar nav + migrate SVG/Unicode → NF glyphs |
| `js/vibemilk-docs.js` | Add icon explorer JS (search, filter, copy, font toggle) |

**Note:** `pages/components.html` is a legacy file from before the Phase 7 split. If it still exists, skip it — the active pages are `comp-actions.html`, `comp-data.html`, `comp-overlays.html`, `comp-utilities.html`.

## 9. Out of Scope

- Icon counter animation (cut — gimmick)
- Inline dark/light preview toggle (cut — theme switcher exists)
- Nerd Font for text rendering (text fonts unchanged)
- Font subsetting build step in npm scripts (manual generation, documented)
- Animated icons / icon transitions
