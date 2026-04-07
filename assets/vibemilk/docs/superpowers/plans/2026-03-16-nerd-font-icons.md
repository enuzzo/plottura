# Phase 8: Nerd Font Icon Integration — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all inline SVGs and Unicode symbols across Vibemilk with Nerd Font icon glyphs, add a dedicated icon specimen page, utility CSS classes, and update token exports.

**Architecture:** Infrastructure-first approach. Font files and @font-face declarations first, then CSS class system, then specimen page, then incremental icon migration by type, then documentation updates. Each layer builds on the previous and is independently testable.

**Tech Stack:** Pure CSS custom properties, vanilla JS (IIFE), woff2 webfonts, no build tools required.

**Spec:** `docs/superpowers/specs/2026-03-16-nerd-font-icons-design.md`

---

## File Structure

### New Files
| File | Responsibility |
|------|---------------|
| `fonts/nerd/SymbolsNerdFontMono-Regular.woff2` | Full Nerd Font symbols (~1.2MB) |
| `fonts/nerd/VibemilkIcons.woff2` | Curated subset (~50-80KB, ~300 glyphs) |
| `css/core/icons.css` | `.vm-nf` base class, size/color modifiers, named classes |
| `pages/icons.html` | Full icon specimen page with explorer |

### Modified Files
| File | Changes |
|------|---------|
| `css/core/tokens.css` | Add @font-face declarations + `--font-icons` token |
| `css/vibemilk-core.css` | Add `@import url('./core/icons.css')` |
| `css/showcase.css` | Add icon explorer grid styles |
| `css/docs.css` | Adjust sidebar chevron/toggle styles for NF glyphs |
| `js/vibemilk-docs.js` | Add icon explorer JS functions |
| `pages/foundations.html` | Add mini-preview section |
| `pages/integration.html` | Add Icons documentation section |
| `scripts/build-tokens.js` | Add icons category to token export |
| `index.html` | Sidebar nav update + migrate SVGs |
| `pages/comp-actions.html` | Sidebar nav update + migrate SVGs |
| `pages/comp-data.html` | Sidebar nav update + migrate SVGs |
| `pages/comp-overlays.html` | Sidebar nav update + migrate SVGs |
| `pages/comp-utilities.html` | Sidebar nav update + migrate SVGs |
| `pages/foundations.html` | Sidebar nav update + migrate SVGs |
| `pages/themes.html` | Sidebar nav update + migrate SVGs |
| `pages/integration.html` | Sidebar nav update + migrate SVGs |
| `pages/token-export.html` | Sidebar nav update + migrate SVGs |
| `pages/brand-voice.html` | Sidebar nav update + migrate SVGs |

---

## Chunk 1: Font Infrastructure

### Task 1: Download and place Nerd Font files

**Files:**
- Create: `fonts/nerd/SymbolsNerdFontMono-Regular.woff2`
- Create: `fonts/nerd/VibemilkIcons.woff2` (initially a copy of full, subset later)

- [ ] **Step 1: Create fonts/nerd directory**

```bash
mkdir -p fonts/nerd
```

- [ ] **Step 2: Download Symbols Only Nerd Font**

Download `SymbolsNerdFontMono-Regular.woff2` from the Nerd Fonts GitHub releases (v3.3.0+). The Symbols Only variant contains ONLY icon glyphs (~10,000), no alphanumeric characters.

```bash
# Download from GitHub releases
curl -L -o fonts/nerd/SymbolsNerdFontMono-Regular.woff2 \
  "https://github.com/ryanoasis/nerd-fonts/releases/latest/download/NerdFontsSymbolsOnly.zip"
# Unzip and extract the woff2 file
# If zip doesn't contain woff2 directly, convert from ttf using tools or download webfont version
```

Alternative: Download the TTF from GitHub and convert to woff2 using an online converter or `woff2_compress`.

- [ ] **Step 3: Create initial VibemilkIcons.woff2**

For now, copy the full symbols font as the subset placeholder. We'll generate the real subset after confirming all needed codepoints during migration.

```bash
cp fonts/nerd/SymbolsNerdFontMono-Regular.woff2 fonts/nerd/VibemilkIcons.woff2
```

- [ ] **Step 4: Verify font files exist**

```bash
ls -la fonts/nerd/
# Expected: two .woff2 files
```

- [ ] **Step 5: Commit**

```bash
git add fonts/nerd/
git commit -m "feat(phase8): add Nerd Font symbol webfont files

Add Symbols Only Nerd Font for icon glyphs. VibemilkIcons is
initially a copy of the full font; will be subsetted later.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 2: Add @font-face declarations to tokens.css

**Files:**
- Modify: `css/core/tokens.css` (lines 18-19, after Matt @font-face block)

- [ ] **Step 1: Add @font-face for VibemilkIcons and Symbols Nerd Font Mono**

Insert after line 18 (after the last Matt @font-face), before the comment block:

```css
/* -- Nerd Font Icons (Symbols Only) -- */
@font-face { font-family: 'VibemilkIcons'; src: url('../fonts/nerd/VibemilkIcons.woff2') format('woff2'); font-weight: normal; font-style: normal; font-display: swap; }
@font-face { font-family: 'Symbols Nerd Font Mono'; src: url('../fonts/nerd/SymbolsNerdFontMono-Regular.woff2') format('woff2'); font-weight: normal; font-style: normal; font-display: swap; }
```

- [ ] **Step 2: Add --font-icons token inside :root block**

Insert after line 31 (`--font-mono: ...`):

```css
  --font-icons: 'VibemilkIcons', 'Symbols Nerd Font Mono', sans-serif;
```

- [ ] **Step 3: Verify by opening any HTML page in browser**

```bash
python3 -m http.server 8080
# Open http://localhost:8080/index.html
# Check DevTools → Network tab → font files should load
# Check DevTools → Elements → :root computed style → --font-icons should be present
```

- [ ] **Step 4: Commit**

```bash
git add css/core/tokens.css
git commit -m "feat(phase8): add @font-face and --font-icons token

Register VibemilkIcons (subset) and Symbols Nerd Font Mono (full)
webfonts. Add --font-icons CSS custom property to :root.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 3: Create css/core/icons.css with class system

**Files:**
- Create: `css/core/icons.css`
- Modify: `css/vibemilk-core.css` (add import)

- [ ] **Step 1: Create icons.css with base class and modifiers**

File: `css/core/icons.css`

```css
/* ============================================
   VIBEMILK ICON SYSTEM — Nerd Font Glyphs
   Base class + size/color modifiers + named classes
   ============================================ */

/* -- Base Icon Class -- */
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

/* -- Size Scale (phi-derived) --
   sm=0.75  md=1  lg=sqrt(phi)  xl=phi  2xl=phi^2 */
.vm-nf--sm  { font-size: 0.75em; }
.vm-nf--md  { font-size: 1em; }
.vm-nf--lg  { font-size: 1.272em; }
.vm-nf--xl  { font-size: 1.618em; }
.vm-nf--2xl { font-size: 2.618em; }

/* -- Color Variants (token-driven) -- */
.vm-nf--accent    { color: var(--accent-primary); }
.vm-nf--secondary { color: var(--accent-secondary); }
.vm-nf--muted     { color: var(--text-muted); }
.vm-nf--success   { color: var(--color-success); }
.vm-nf--warning   { color: var(--color-warning); }
.vm-nf--danger    { color: var(--color-danger); }

/* ============================================
   NAMED CLASSES — Curated Subset (~300 glyphs)
   Usage: <span class="vm-nf vm-nf-git"></span>
   ============================================ */

/* -- UI Controls -- */
.vm-nf-chevron-right::before  { content: "\eb6f"; }
.vm-nf-chevron-down::before   { content: "\eb6c"; }
.vm-nf-chevron-up::before     { content: "\eb70"; }
.vm-nf-chevron-left::before   { content: "\eb6e"; }
.vm-nf-arrow-right::before    { content: "\ea9c"; }
.vm-nf-arrow-left::before     { content: "\ea9b"; }
.vm-nf-arrow-up::before       { content: "\ea9d"; }
.vm-nf-arrow-down::before     { content: "\ea9a"; }
.vm-nf-close::before          { content: "\ea76"; }
.vm-nf-check::before          { content: "\ea6a"; }
.vm-nf-plus::before           { content: "\eb0b"; }
.vm-nf-minus::before          { content: "\eaec"; }
.vm-nf-search::before         { content: "\eb1c"; }
.vm-nf-filter::before         { content: "\eaac"; }
.vm-nf-sort::before           { content: "\eb4c"; }
.vm-nf-settings::before       { content: "\eb2e"; }
.vm-nf-gear::before           { content: "\eb2e"; }
.vm-nf-eye::before            { content: "\ea6b"; }
.vm-nf-eye-off::before        { content: "\f48a"; }
.vm-nf-edit::before           { content: "\eb04"; }
.vm-nf-pencil::before         { content: "\eb04"; }
.vm-nf-trash::before          { content: "\eb55"; }
.vm-nf-download::before       { content: "\ea8b"; }
.vm-nf-upload::before         { content: "\eb58"; }
.vm-nf-external-link::before  { content: "\eac8"; }
.vm-nf-copy::before           { content: "\eab0"; }
.vm-nf-pin::before            { content: "\eb08"; }
.vm-nf-bookmark::before       { content: "\ea60"; }
.vm-nf-bell::before           { content: "\ea57"; }
.vm-nf-menu::before           { content: "\eae7"; }
.vm-nf-more::before           { content: "\eaf2"; }
.vm-nf-refresh::before        { content: "\eb13"; }
.vm-nf-maximize::before       { content: "\eae4"; }
.vm-nf-minimize::before       { content: "\eaeb"; }
.vm-nf-fullscreen::before     { content: "\eae4"; }
.vm-nf-grip::before           { content: "\eac0"; }
.vm-nf-move::before           { content: "\eaf3"; }
.vm-nf-zoom-in::before        { content: "\eb69"; }
.vm-nf-zoom-out::before       { content: "\eb6a"; }

/* -- Weather & Theme -- */
.vm-nf-sun::before            { content: "\eb30"; }
.vm-nf-moon::before           { content: "\eaf0"; }
.vm-nf-cloud::before          { content: "\ea73"; }
.vm-nf-rain::before           { content: "\e339"; }
.vm-nf-snow::before           { content: "\e33a"; }
.vm-nf-wind::before           { content: "\e37d"; }
.vm-nf-temperature::before    { content: "\e350"; }
.vm-nf-lightning::before      { content: "\eb49"; }

/* -- Status & Feedback -- */
.vm-nf-check-circle::before   { content: "\f058"; }
.vm-nf-x-circle::before       { content: "\f057"; }
.vm-nf-warning::before        { content: "\ea6c"; }
.vm-nf-info::before           { content: "\ea74"; }
.vm-nf-question::before       { content: "\eb0f"; }
.vm-nf-clock::before          { content: "\ea70"; }
.vm-nf-shield::before         { content: "\eb2d"; }
.vm-nf-lock::before           { content: "\eadb"; }
.vm-nf-unlock::before         { content: "\eb57"; }
.vm-nf-fire::before           { content: "\f490"; }
.vm-nf-star::before           { content: "\eb4e"; }
.vm-nf-heart::before          { content: "\eac6"; }
.vm-nf-thumbs-up::before      { content: "\eb51"; }
.vm-nf-circle-dot::before     { content: "\eacc"; }
.vm-nf-alert::before          { content: "\ea6c"; }
.vm-nf-ban::before            { content: "\eb56"; }

/* -- Dev & Languages -- */
.vm-nf-git::before            { content: "\f1d3"; }
.vm-nf-git-branch::before     { content: "\eab0"; }
.vm-nf-git-commit::before     { content: "\eab1"; }
.vm-nf-git-merge::before      { content: "\eab2"; }
.vm-nf-git-pr::before         { content: "\eab3"; }
.vm-nf-github::before         { content: "\f113"; }
.vm-nf-gitlab::before         { content: "\f296"; }
.vm-nf-terminal::before       { content: "\eb4a"; }
.vm-nf-code::before           { content: "\ea77"; }
.vm-nf-brackets::before       { content: "\ea77"; }
.vm-nf-bug::before            { content: "\ea63"; }
.vm-nf-html::before           { content: "\e736"; }
.vm-nf-css::before            { content: "\e749"; }
.vm-nf-javascript::before     { content: "\e781"; }
.vm-nf-typescript::before     { content: "\e628"; }
.vm-nf-python::before         { content: "\e73c"; }
.vm-nf-rust::before           { content: "\e7a8"; }
.vm-nf-swift::before          { content: "\e755"; }
.vm-nf-go::before             { content: "\e724"; }
.vm-nf-react::before          { content: "\e7ba"; }
.vm-nf-vue::before            { content: "\e6a0"; }
.vm-nf-angular::before        { content: "\e753"; }
.vm-nf-node::before           { content: "\e718"; }
.vm-nf-npm::before            { content: "\e71e"; }
.vm-nf-docker::before         { content: "\f308"; }
.vm-nf-kubernetes::before     { content: "\f10fe"; }
.vm-nf-aws::before            { content: "\e7ad"; }
.vm-nf-database::before       { content: "\f1c0"; }
.vm-nf-api::before            { content: "\ea52"; }
.vm-nf-package::before        { content: "\eafd"; }
.vm-nf-php::before            { content: "\e73d"; }
.vm-nf-ruby::before           { content: "\e791"; }
.vm-nf-java::before           { content: "\e738"; }
.vm-nf-c::before              { content: "\e61e"; }
.vm-nf-cpp::before            { content: "\e61d"; }

/* -- File Types -- */
.vm-nf-folder::before         { content: "\ea83"; }
.vm-nf-folder-open::before    { content: "\ea84"; }
.vm-nf-file::before           { content: "\ea7b"; }
.vm-nf-file-code::before      { content: "\ea7c"; }
.vm-nf-file-text::before      { content: "\ea7f"; }
.vm-nf-file-image::before     { content: "\ea7d"; }
.vm-nf-file-pdf::before       { content: "\eae1"; }
.vm-nf-file-zip::before       { content: "\ea81"; }
.vm-nf-json::before           { content: "\e60b"; }
.vm-nf-markdown::before       { content: "\e73e"; }
.vm-nf-yaml::before           { content: "\e6a1"; }
.vm-nf-toml::before           { content: "\e6b2"; }
.vm-nf-config::before         { content: "\eb2e"; }

/* -- System & Hardware -- */
.vm-nf-desktop::before        { content: "\eb49"; }
.vm-nf-mobile::before         { content: "\ea8f"; }
.vm-nf-tablet::before         { content: "\ea36"; }
.vm-nf-wifi::before           { content: "\eb62"; }
.vm-nf-bluetooth::before      { content: "\e61f"; }
.vm-nf-cpu::before            { content: "\e266"; }
.vm-nf-memory::before         { content: "\eac5"; }
.vm-nf-battery::before        { content: "\ea54"; }
.vm-nf-server::before         { content: "\ea2c"; }
.vm-nf-cloud-server::before   { content: "\ea73"; }
.vm-nf-chip::before           { content: "\e266"; }
.vm-nf-serial::before         { content: "\eb57"; }
.vm-nf-sensor::before         { content: "\e350"; }
.vm-nf-display::before        { content: "\eb49"; }
.vm-nf-keyboard::before       { content: "\eacf"; }
.vm-nf-mouse::before          { content: "\eaf1"; }
.vm-nf-usb::before            { content: "\e1e0"; }
.vm-nf-sd-card::before        { content: "\e240"; }
.vm-nf-printer::before        { content: "\eb0c"; }

/* -- Navigation & Layout -- */
.vm-nf-home::before           { content: "\eac9"; }
.vm-nf-dashboard::before      { content: "\eac9"; }
.vm-nf-layers::before         { content: "\ead7"; }
.vm-nf-grid::before           { content: "\eabf"; }
.vm-nf-list::before           { content: "\eadd"; }
.vm-nf-columns::before        { content: "\eb53"; }
.vm-nf-sidebar::before        { content: "\eb2a"; }
.vm-nf-layout::before         { content: "\eb53"; }
.vm-nf-table::before          { content: "\eadd"; }
.vm-nf-rows::before           { content: "\eadd"; }
.vm-nf-panel::before          { content: "\eb2a"; }

/* -- Communication -- */
.vm-nf-mail::before           { content: "\eae5"; }
.vm-nf-chat::before           { content: "\ea69"; }
.vm-nf-comment::before        { content: "\ea6d"; }
.vm-nf-notification::before   { content: "\ea57"; }
.vm-nf-share::before          { content: "\eb2b"; }
.vm-nf-link::before           { content: "\eadb"; }
.vm-nf-at-sign::before        { content: "\ea51"; }
.vm-nf-hashtag::before        { content: "\eac3"; }
.vm-nf-send::before           { content: "\eb27"; }
.vm-nf-inbox::before          { content: "\eaca"; }
.vm-nf-phone::before          { content: "\eb07"; }
.vm-nf-video::before          { content: "\eb5c"; }
.vm-nf-image::before          { content: "\eacb"; }
.vm-nf-camera::before         { content: "\ea66"; }

/* -- Powerline -- */
.vm-nf-pl-right::before       { content: "\e0b0"; }
.vm-nf-pl-right-thin::before  { content: "\e0b1"; }
.vm-nf-pl-left::before        { content: "\e0b2"; }
.vm-nf-pl-left-thin::before   { content: "\e0b3"; }
.vm-nf-pl-branch::before      { content: "\e0a0"; }
.vm-nf-pl-line::before        { content: "\e0a1"; }
.vm-nf-pl-lock::before        { content: "\e0a2"; }
.vm-nf-pl-column::before      { content: "\e0a3"; }

/* -- Brand & Logo -- */
.vm-nf-apple::before          { content: "\f179"; }
.vm-nf-linux::before          { content: "\f17c"; }
.vm-nf-windows::before        { content: "\f17a"; }
.vm-nf-android::before        { content: "\f17b"; }
.vm-nf-raspberry-pi::before   { content: "\f315"; }
.vm-nf-arduino::before        { content: "\e255"; }
.vm-nf-spotify::before        { content: "\f1bc"; }
.vm-nf-discord::before        { content: "\f392"; }
.vm-nf-slack::before          { content: "\f198"; }
.vm-nf-vscode::before         { content: "\e70c"; }
.vm-nf-chrome::before         { content: "\e743"; }
.vm-nf-firefox::before        { content: "\e745"; }
.vm-nf-safari::before         { content: "\e748"; }
.vm-nf-figma::before          { content: "\e771"; }
.vm-nf-sketch::before         { content: "\e7b4"; }
```

- [ ] **Step 2: Add import to vibemilk-core.css**

Insert after line 4 (`@import url('./core/utilities.css');`):

```css
@import url('./core/icons.css');
```

- [ ] **Step 3: Test base class renders**

Create a quick test in browser console on any page:

```javascript
document.body.insertAdjacentHTML('beforeend',
  '<div style="padding:20px;font-size:24px">' +
  '<span class="vm-nf">&#xf1d3;</span> ' +
  '<span class="vm-nf vm-nf--accent">&#xf113;</span> ' +
  '<span class="vm-nf vm-nf-docker"></span>' +
  '</div>');
```

Expected: Three icons visible — Git, GitHub (accent colored), Docker (via named class).

- [ ] **Step 4: Commit**

```bash
git add css/core/icons.css css/vibemilk-core.css
git commit -m "feat(phase8): add vm-nf icon class system with 200+ named classes

Base .vm-nf class with phi-derived size scale and token-driven
color modifiers. Named classes for curated subset covering UI,
dev, files, status, system, nav, comms, weather, powerline, brands.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Chunk 2: Icon Specimen Page

### Task 4: Create pages/icons.html — full specimen page

**Files:**
- Create: `pages/icons.html`

- [ ] **Step 1: Create the icon specimen page**

The page follows the standard Vibemilk docs layout (sidebar + main content). It includes:
1. Hero section with title and two-tier font explanation
2. Quick Start snippets
3. Size scale demo
4. Color variants grid
5. Icon Explorer with search + category tabs + clickable grid
6. Usage Patterns with real-world examples
7. Integration Guide summary

The sidebar nav should match all other pages. Use the same `vm-docs` layout class and structure from `index.html`.

The Icon Explorer data (glyph name, codepoint, category) is embedded as a JS array in a `<script>` block at the bottom. Each icon card is generated dynamically.

Key implementation details:
- Search input filters icons by name in real-time (input event listener)
- Category tabs use `.vm-tab` component, filtering by `data-category` attribute
- Click on icon card → copies `&#x{hex};` to clipboard → shows toast via existing `.vm-toast` component
- "Show full font" toggle loads SymbolsNerdFontMono-Regular and expands the grid
- Grid uses `display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));`

- [ ] **Step 2: Verify page loads and search works**

```bash
python3 -m http.server 8080
# Open http://localhost:8080/pages/icons.html
# Verify: sidebar loads, theme switcher works, icons render
# Type "git" in search → should filter to git-related icons
# Click an icon → should copy to clipboard
```

- [ ] **Step 3: Commit**

```bash
git add pages/icons.html
git commit -m "feat(phase8): add icon specimen page with searchable explorer

Full icon reference page with hero, quick start, size scale, color
variants, interactive explorer (search + category filter + copy to
clipboard), usage patterns, and integration guide.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 5: Add icon explorer styles to showcase.css

**Files:**
- Modify: `css/showcase.css` (append at end)

- [ ] **Step 1: Add icon grid and card styles**

Append to `css/showcase.css`:

```css
/* ============================================
   ICON SPECIMEN — Explorer Grid
   ============================================ */
.icon-explorer { margin-top: var(--space-5); }

.icon-explorer__search {
  position: sticky;
  top: 0;
  z-index: 10;
  padding: var(--space-3) 0;
  background: var(--bg-surface);
}

.icon-explorer__search-input {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  font-size: var(--fs-body-md);
  border: 1px solid var(--stroke-default, var(--divider-color));
  border-radius: var(--radius-md);
  background: var(--bg-input);
  color: var(--text-primary);
  font-family: var(--font-mono);
}

.icon-explorer__search-input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 2px var(--accent-primary-subtle, rgba(117, 81, 255, 0.2));
}

.icon-explorer__categories {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin: var(--space-3) 0;
}

.icon-explorer__cat-btn {
  padding: var(--space-1) var(--space-3);
  font-size: var(--fs-caption);
  font-family: var(--font-mono);
  border: 1px solid var(--divider-color);
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: var(--transition-fast);
}

.icon-explorer__cat-btn:hover,
.icon-explorer__cat-btn.is-active {
  background: var(--accent-primary);
  color: var(--bg-surface);
  border-color: var(--accent-primary);
}

.icon-explorer__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: var(--space-2);
}

.icon-explorer__card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-3) var(--space-2);
  border: 1px solid var(--divider-color);
  border-radius: var(--radius-md);
  background: var(--bg-elevated);
  cursor: pointer;
  transition: var(--transition-fast);
  text-align: center;
  min-height: 90px;
}

.icon-explorer__card:hover {
  border-color: var(--accent-primary);
  background: var(--accent-primary-subtle, rgba(117, 81, 255, 0.08));
  transform: translateY(-1px);
}

.icon-explorer__card-glyph {
  font-family: var(--font-icons);
  font-size: 28px;
  line-height: 1;
  margin-bottom: var(--space-1);
  color: var(--text-primary);
}

.icon-explorer__card-name {
  font-size: var(--fs-micro);
  font-family: var(--font-mono);
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

.icon-explorer__card-code {
  font-size: 9px;
  font-family: var(--font-mono);
  color: var(--text-muted);
  opacity: 0.6;
}

.icon-explorer__empty {
  grid-column: 1 / -1;
  text-align: center;
  padding: var(--space-6);
  color: var(--text-muted);
  font-family: var(--font-mono);
}

/* Size scale specimen */
.icon-size-scale {
  display: flex;
  align-items: flex-end;
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--bg-elevated);
  border-radius: var(--radius-lg);
}

.icon-size-scale__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
}

.icon-size-scale__label {
  font-size: var(--fs-micro);
  font-family: var(--font-mono);
  color: var(--text-muted);
}

/* Color variants specimen */
.icon-color-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-3);
}

@media (max-width: 600px) {
  .icon-color-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.icon-color-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-3);
  border: 1px solid var(--divider-color);
  border-radius: var(--radius-md);
  background: var(--bg-elevated);
}

.icon-color-card__label {
  font-size: var(--fs-micro);
  font-family: var(--font-mono);
  color: var(--text-muted);
  margin-top: var(--space-1);
}

/* Usage pattern specimens */
.icon-usage-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-3);
}

.icon-usage-card {
  padding: var(--space-4);
  border: 1px solid var(--divider-color);
  border-radius: var(--radius-md);
  background: var(--bg-elevated);
}

.icon-usage-card__title {
  font-size: var(--fs-caption);
  font-family: var(--font-mono);
  color: var(--text-muted);
  margin-bottom: var(--space-2);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Toast notification for copy feedback */
.icon-toast {
  position: fixed;
  bottom: var(--space-4);
  left: 50%;
  transform: translateX(-50%) translateY(100px);
  padding: var(--space-2) var(--space-4);
  background: var(--accent-primary);
  color: #fff;
  font-family: var(--font-mono);
  font-size: var(--fs-caption);
  border-radius: var(--radius-full);
  opacity: 0;
  transition: all 0.3s ease;
  pointer-events: none;
  z-index: 9999;
}

.icon-toast.is-visible {
  transform: translateX(-50%) translateY(0);
  opacity: 1;
}
```

- [ ] **Step 2: Commit**

```bash
git add css/showcase.css
git commit -m "feat(phase8): add icon explorer grid and specimen styles

Styles for icon search, category filters, clickable glyph grid,
size scale, color variants, usage patterns, and copy toast.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 6: Add mini-preview to foundations.html

**Files:**
- Modify: `pages/foundations.html` (after typography specimen section)

- [ ] **Step 1: Add icon system mini-preview section**

Insert after the last typography specimen section, before the next major section. Look for the end of the golden ratio / button scale section.

```html
<!-- ═══ NN. ICON SYSTEM ═══ -->
<section class="vm-docs__section" id="icon-system">
  <h2 class="vm-docs__section-title">Icon System — Nerd Font Glyphs</h2>
  <p class="vm-docs__section-desc">250+ curated icons from the Nerd Fonts project. Dev icons, UI controls, status indicators, and more — all theme-aware via CSS tokens.</p>

  <div class="vm-card-lite" style="padding: var(--space-4);">
    <div style="display:flex; flex-wrap:wrap; gap:var(--space-3); align-items:center; margin-bottom:var(--space-3);">
      <span class="vm-nf vm-nf--lg vm-nf--accent" aria-hidden="true">&#xf1d3;</span>
      <span class="vm-nf vm-nf--lg vm-nf--secondary" aria-hidden="true">&#xf113;</span>
      <span class="vm-nf vm-nf--lg vm-nf--accent" aria-hidden="true">&#xf308;</span>
      <span class="vm-nf vm-nf--lg vm-nf--secondary" aria-hidden="true">&#xe73c;</span>
      <span class="vm-nf vm-nf--lg vm-nf--accent" aria-hidden="true">&#xe7a8;</span>
      <span class="vm-nf vm-nf--lg vm-nf--secondary" aria-hidden="true">&#xe781;</span>
      <span class="vm-nf vm-nf--lg vm-nf--accent" aria-hidden="true">&#xe755;</span>
      <span class="vm-nf vm-nf--lg vm-nf--secondary" aria-hidden="true">&#xe718;</span>
    </div>

    <div class="icon-size-scale" style="margin-bottom:var(--space-3);">
      <div class="icon-size-scale__item">
        <span class="vm-nf vm-nf--sm" aria-hidden="true">&#xf1d3;</span>
        <span class="icon-size-scale__label">sm</span>
      </div>
      <div class="icon-size-scale__item">
        <span class="vm-nf vm-nf--md" aria-hidden="true">&#xf1d3;</span>
        <span class="icon-size-scale__label">md</span>
      </div>
      <div class="icon-size-scale__item">
        <span class="vm-nf vm-nf--lg" aria-hidden="true">&#xf1d3;</span>
        <span class="icon-size-scale__label">lg (sqrt phi)</span>
      </div>
      <div class="icon-size-scale__item">
        <span class="vm-nf vm-nf--xl" aria-hidden="true">&#xf1d3;</span>
        <span class="icon-size-scale__label">xl (phi)</span>
      </div>
      <div class="icon-size-scale__item">
        <span class="vm-nf vm-nf--2xl" aria-hidden="true">&#xf1d3;</span>
        <span class="icon-size-scale__label">2xl (phi^2)</span>
      </div>
    </div>

    <pre class="vm-code-block" style="font-size:var(--fs-caption);"><code>&lt;span class="vm-nf vm-nf--lg vm-nf--accent" aria-hidden="true"&gt;&amp;#xf1d3;&lt;/span&gt;</code></pre>

    <a href="icons.html" class="vm-btn vm-btn--outline vm-btn--sm" style="margin-top:var(--space-3);">
      <span class="vm-nf vm-nf--sm" aria-hidden="true">&#xeb6f;</span> Explore all icons
    </a>
  </div>
</section>
```

- [ ] **Step 2: Add sidebar nav link for Icons in foundations.html**

In the sidebar nav, add "Icons" link pointing to `icons.html` in the appropriate group.

- [ ] **Step 3: Verify preview renders**

Open `pages/foundations.html` → scroll to icon system section → icons should render with accent/secondary colors, size scale should show progression.

- [ ] **Step 4: Commit**

```bash
git add pages/foundations.html
git commit -m "feat(phase8): add icon system mini-preview in foundations

Curated icon showcase, phi-derived size scale, and quick usage
snippet with link to full icon specimen page.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Chunk 3: Icon Migration

### Task 7: Batch 1 — Sidebar chevrons (all pages)

**Files:**
- Modify: `index.html`, all `pages/*.html` (10 files total)

- [ ] **Step 1: Replace sidebar nav group chevrons**

In every HTML file, find all instances of:
```html
<svg class="vm-docs__nav-group-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
```

Replace with:
```html
<span class="vm-nf vm-docs__nav-group-chevron" aria-hidden="true">&#xeb6c;</span>
```

Note: The CSS for `.vm-docs__nav-group-chevron` in `css/docs.css` will need adjustment — it currently styles an SVG. Update to style the NF glyph (rotation for expand/collapse).

- [ ] **Step 2: Replace dropdown chevrons**

Find all instances of:
```html
<svg class="vm-dropdown__chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
```

Replace with:
```html
<span class="vm-nf vm-dropdown__chevron" aria-hidden="true">&#xeb6c;</span>
```

- [ ] **Step 3: Update CSS for chevron classes in docs.css**

Adjust `.vm-docs__nav-group-chevron` and `.vm-dropdown__chevron` to work with font glyphs instead of SVG:

```css
.vm-docs__nav-group-chevron {
  font-size: 12px;
  transition: transform var(--transition-fast);
}
/* Remove any SVG-specific properties (width, height, stroke) */
```

- [ ] **Step 4: Verify chevrons work on all pages**

Open each page, expand/collapse sidebar nav groups, open/close dropdowns. Chevrons should animate rotation.

- [ ] **Step 5: Commit**

```bash
git add index.html pages/*.html css/docs.css
git commit -m "feat(phase8): migrate sidebar/dropdown chevrons to Nerd Font

Replace all SVG chevron icons with vm-nf glyphs across all 10
HTML pages. Update docs.css for font-based chevron styling.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 8: Batch 2 — Theme toggle sun/moon

**Files:**
- Modify: All HTML files with theme toggle (10 files)
- Modify: `css/docs.css` (toggle icon styles)

- [ ] **Step 1: Replace sun Unicode with NF glyph**

Find all instances of:
```html
<span class="vm-theme-toggle__icon vm-theme-toggle__icon--sun">&#9728;</span>
```

Replace with:
```html
<span class="vm-theme-toggle__icon vm-theme-toggle__icon--sun vm-nf" aria-hidden="true">&#xeb30;</span>
```

- [ ] **Step 2: Replace moon Unicode with NF glyph**

Find all instances of:
```html
<span class="vm-theme-toggle__icon vm-theme-toggle__icon--moon">&#9790;</span>
```

Replace with:
```html
<span class="vm-theme-toggle__icon vm-theme-toggle__icon--moon vm-nf" aria-hidden="true">&#xeaf0;</span>
```

- [ ] **Step 3: Adjust CSS if needed**

The toggle icons may need font-size adjustments since NF glyphs render differently than Unicode symbols. Check `css/docs.css` for `.vm-theme-toggle__icon` styles.

- [ ] **Step 4: Test toggle across themes**

Switch between vibemilk-default ↔ vibemilk-dark, clean-sheet ↔ clean-sheet-dark. Toggle should work and icons should be visible.

- [ ] **Step 5: Commit**

```bash
git add index.html pages/*.html css/docs.css
git commit -m "feat(phase8): migrate theme toggle sun/moon to Nerd Font

Replace Unicode sun (☀) and moon (☾) with Nerd Font glyphs
across all pages. Consistent icon rendering with theme system.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 9: Batch 3 — Navigation arrows and misc SVGs

**Files:**
- Modify: All HTML files with remaining SVG icons

- [ ] **Step 1: Replace right-arrow SVGs in sidebar nav links**

Find SVGs used for navigation arrows (e.g., in link indicators, breadcrumb arrows). Replace with appropriate NF glyphs.

- [ ] **Step 2: Replace hub card icons (index.html)**

The 6 hub cards in `index.html` have decorative SVG icons. Replace with thematic NF glyphs:
- Integration → `&#xea77;` (code brackets)
- Foundations → `&#xead7;` (layers)
- Components → `&#xeabf;` (grid)
- Themes → `&#xeb04;` (palette/edit)
- Token Export → `&#xeafd;` (package)
- Brand Voice → `&#xea69;` (chat)

- [ ] **Step 3: Replace status indicators**

Find remaining Unicode symbols (✓ ✗ ⚠ ℹ △ ◘) and replace with NF equivalents.

- [ ] **Step 4: Full visual audit**

Open every page, check for any remaining SVG or Unicode icons that should be NF glyphs.

- [ ] **Step 5: Commit**

```bash
git add index.html pages/*.html
git commit -m "feat(phase8): migrate remaining SVGs and Unicode to Nerd Font

Replace hub card icons, navigation arrows, and status indicators.
All inline SVGs and Unicode symbols now use Nerd Font glyphs.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 10: Add Icons link to sidebar nav on all pages

**Files:**
- Modify: All 10 HTML files (sidebar nav section)

- [ ] **Step 1: Add Icons nav link**

In each page's sidebar `<nav class="vm-docs__nav">`, add an "Icons" link in the "Design System" group (or equivalent), pointing to `icons.html` (or `pages/icons.html` from index.html).

- [ ] **Step 2: Verify navigation works from every page**

Click "Icons" link from each page — should navigate to the icon specimen page.

- [ ] **Step 3: Commit**

```bash
git add index.html pages/*.html
git commit -m "feat(phase8): add Icons link to sidebar nav on all pages

Every page now has navigation to the icon specimen page.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Chunk 4: Documentation & Token Export

### Task 11: Add Icons section to integration.html

**Files:**
- Modify: `pages/integration.html`

- [ ] **Step 1: Add Icons integration section**

Add a new numbered section covering:
- How to load icon fonts (subset for production, full for exploration)
- The `--font-icons` token
- `.vm-nf` class system with size and color modifiers
- Minimal working example (5 lines of HTML)
- ESP32 note: font not applicable, use codepoint values from C header

- [ ] **Step 2: Commit**

```bash
git add pages/integration.html
git commit -m "docs(phase8): add icon integration guide

How to load fonts, use vm-nf classes, and access icons in
custom projects including ESP32/Arduino via C header codepoints.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 12: Update token export script

**Files:**
- Modify: `scripts/build-tokens.js`

- [ ] **Step 1: Add icon category to categorize function**

After line 72 (`if (name.startsWith('font-family') || name.startsWith('font-mono')) return 'typography';`), add:

```javascript
  if (name.startsWith('font-icons')) return 'icons';
```

- [ ] **Step 2: Add icon type detection**

After line 106 (`if (name.startsWith('font-family') || name.startsWith('font-mono')) return 'fontFamily';`), add:

```javascript
  if (name.startsWith('font-icons')) return 'fontFamily';
```

- [ ] **Step 3: Run build and verify**

```bash
npm run build:tokens
# Check tokens/vibemilk-default.json → should have "icons" category
# Check tokens/vibemilk-default.swift → should have fontIcons property
# Check tokens/vibemilk-default.h → should have VM_FONT_ICONS define
```

- [ ] **Step 4: Commit**

```bash
git add scripts/build-tokens.js
git commit -m "feat(phase8): add icon font token to export system

Token --font-icons now exported to JSON, Swift, Rust, C/Arduino,
and Elementor formats.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 13: Update TODO.md and project memory

**Files:**
- Modify: `TODO.md`

- [ ] **Step 1: Mark Phase 8 as complete in TODO.md**

Change heading to: `## Phase 8: NERD FONTS ICON INTEGRATION ✅ DONE (2026-03-16)`

- [ ] **Step 2: Commit**

```bash
git add TODO.md
git commit -m "docs: mark Phase 8 (Nerd Font icons) as complete

All icon migration, specimen page, CSS classes, and token export
updates are done.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 14: Final verification and push

- [ ] **Step 1: Start local server and test all pages**

```bash
python3 -m http.server 8080
```

Verify:
- [ ] All 10 pages load without console errors
- [ ] Icons render on every page (no tofu/boxes)
- [ ] Theme switching works — icons adapt to all 12 themes
- [ ] Icon specimen page: search, category filter, copy-to-clipboard all functional
- [ ] Foundations mini-preview shows icons correctly
- [ ] Sidebar chevrons animate on expand/collapse
- [ ] Theme toggle sun/moon icons visible and functional
- [ ] Hub cards show NF icons instead of SVGs
- [ ] Mobile responsive — icons scale appropriately
- [ ] Token export: `npm run build:tokens` succeeds

- [ ] **Step 2: Push to remote**

```bash
git push origin main
```
