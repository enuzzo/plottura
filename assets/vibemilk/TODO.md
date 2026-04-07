# Vibemilk Design System v3.0 — Action Plan

> Generated 2026-03-15 from session audit. Start a fresh session and work through these phases sequentially.
> Use multi-agents for parallel tasks. Use `superpowers:frontend-design` skill for UI work.
> Use `superpowers:dispatching-parallel-agents` for concurrent independent tasks.

---

## Phase 1: BUGS ✅ DONE (2026-03-15)

### 1.1 Dark mode toggle bug
- **Symptom**: On vibemilk-default, clicking the sidebar day/night toggle may switch to the wrong theme (e.g., cyber-grid instead of vibemilk-dark)
- **Root cause**: `applyModeTheme()` in `js/vibemilk-docs.js` (~line 616) reads from `localStorage.getItem(STORAGE_KEY)` which can be stale if the user changed themes via the dropdown
- **Fix**: Replace with `document.documentElement.getAttribute("data-theme") || DEFAULT_THEME`
- **File**: `js/vibemilk-docs.js`
- **Test**: Switch to vibemilk-default via dropdown, click day/night toggle → should go to vibemilk-dark. Switch to clean-sheet → should go to clean-sheet-dark. Themes without pairs should show disabled toggle.

### 1.2 Dropdowns don't open
- **Symptom**: Section 11 in components.html — dropdown buttons do nothing when clicked
- **Root cause**: HTML markup exists (`data-dropdown`, `.vm-dropdown__trigger`, `.vm-dropdown__menu`, `.vm-dropdown__item`) but there is ZERO JavaScript for dropdown behavior
- **Fix**: Add `initDropdowns()` function in `js/vibemilk-docs.js`:
  1. On `.vm-dropdown__trigger` click → toggle `.is-open` on parent `.vm-dropdown`, set `aria-expanded`
  2. On `.vm-dropdown__item` click → update `.vm-dropdown__value` text, toggle `.is-selected`/`aria-selected`, close menu
  3. On document click outside → close all open dropdowns
  4. Skip `.vm-dropdown--disabled` elements
- **CSS verify**: Check `css/components/forms.css` has `.vm-dropdown.is-open .vm-dropdown__menu { display: block; }` — if not, add it
- **File**: `js/vibemilk-docs.js` + possibly `css/components/forms.css`
- **Test**: Click each dropdown in section 11 → should open/close, selecting an item should update the displayed value

### 1.3 vibemilk-dark: restore original purple palette
- **Symptom**: vibemilk-dark uses warm dark tones (#0E0D14 etc.) — user wants the original purple/navy backgrounds from early Vibemilk commits
- **File**: `css/themes/vibemilk-dark.css`
- **Replace backgrounds**:
  ```
  --bg-deepest:        #070D2D   (was #0E0D14)
  --bg-deep:           #0B1437   (was #16151E)
  --bg-surface:        #111C44   (was #1E1D28)
  --bg-surface-hover:  #162052   (was #26252F)
  --bg-elevated:       #1A2558   (was #2A2935)
  --bg-elevated-hover: #1E2D66   (was #32313D)
  --bg-input:          #0B1437   (was #1E1D28)
  --bg-input-focus:    #111C44   (was #26252F)
  --bg-overlay:        rgba(7, 13, 45, 0.85)  (was rgba(0,0,0,0.78))
  ```
- **Replace accents**:
  ```
  --accent-primary:        #7551FF   (was #FF3DB5 magenta → now violet)
  --accent-primary-hover:  #8B6FFF   (was #FF60C5)
  --accent-primary-active: #5D3FD3   (was #E0188F)
  --accent-primary-subtle: rgba(117, 81, 255, 0.14)
  --accent-secondary:      #39B8FF   (was #6E94E8 → now cyan)
  --accent-secondary-hover:#5DC8FF   (was #8AABE8)
  --accent-secondary-subtle:rgba(57, 184, 255, 0.14)
  ```
- **IMPORTANT**: Cascade ALL rgba/gradient references in the file — every `rgba(255, 61, 181, ...)` → `rgba(117, 81, 255, ...)`, every `rgba(110, 148, 232, ...)` → `rgba(57, 184, 255, ...)`
- **Update gradients**:
  ```
  --gradient-brand: linear-gradient(135deg, #868CFF 0%, #4318FF 100%)
  --gradient-surface: linear-gradient(135deg, #111C44 0%, #1A2558 100%)
  --gradient-sidebar: linear-gradient(180deg, #111C44 0%, #0B1437 100%)
  --gradient-text: linear-gradient(90deg, #7551FF 0%, #39B8FF 100%)
  ```
- **Also update**: `--stroke-accent`, `--selection-bg`, `--focus-ring-color`, `--nerds-border`, `--nerds-inset-glow`, FX grid colors, `--loader-stroke-active`, `--select-option-selected-bg`, `--logo-color`
- **Test**: Switch to vibemilk-dark → backgrounds should be deep navy/purple, not neutral dark gray

---

## Phase 2: REMOVALS ✅ DONE (2026-03-15)

### 2.1 Remove live catalog intro (Section 07 hero)
- **What**: Delete the `showcase__hero` div in components.html (~lines 191-209) containing logo, title, version badge, description, copyright, and token pills
- **Keep**: The `vm-preview-canvas` wrapper and `<hr>` before buttons section
- **Result**: Page starts directly with the Buttons component section
- **File**: `pages/components.html`

### 2.2 Remove carousel entirely
- **What**: Delete the entire carousel section in components.html (look for `carousel-live` anchor)
- **Also**: Remove carousel nav link from sidebar nav in ALL 7 HTML pages (index.html + 6 pages/)
- **Optionally**: Remove `initCarousels()` from `js/vibemilk-docs.js` (harmless to keep)
- **Files**: `pages/components.html` + sidebar nav in all HTML files

### 2.3 Background FX → placeholder 2x2 grid
- **What**: Replace ALL 4 FX demos (Retro Grid, Floating Particles, Aurora Gradient, Starfield) with simple placeholder cards
- **Layout**: 2x2 CSS grid with minimal padding
- **Each card**: `vm-card-lite` with:
  - Title (e.g., "Retro Grid")
  - 1-2 line description of what the effect will do
  - "Coming Soon" badge using `.vm-badge`
  - Placeholder text: "Will be built in a dedicated session"
- **File**: `pages/components.html`
- **Note**: Keep the CSS for FX in `css/showcase.css` — we'll use it later

---

## Phase 3: LAYOUT FIXES ✅ DONE (2026-03-15)

### 3.1 Overlays section — 3-column layout
- **Current**: List items, avatars, tooltips stacked vertically → wastes vertical space
- **Target**: 3 columns side by side using `vm-compact-grid`
  - Column 1: List items
  - Column 2: Avatars (sizes + group, stacked vertically within column)
  - Column 3: Tooltips
- **File**: `pages/components.html` section ~17 (`overlays-live`)

### 3.2 Add horizontal navigation examples
- **Current**: Section 18 (Navigation) only shows vertical sidebar demos (collapsed + expanded)
- **Add**: Below the sidebar demos:
  - Horizontal nav bar with logo + 4-5 links + CTA button
  - Tab-style horizontal nav (different from the Tabs component — this is page-level nav)
- **File**: `pages/components.html` section 18
- **CSS**: May need new styles in `css/docs.css` or `css/showcase.css` for `.showcase-horizontal-nav`

### 3.3 Theme toggle — remove duplicate
- **Current**: Section shows toggle in both day and night states (2 cards)
- **Fix**: Show ONE interactive toggle only. The user can toggle it themselves to see both states.
- **File**: `pages/components.html` section ~22 (`theme-toggle-live`)

### 3.4 Language selector — 3 columns, 3 languages
- **Current**: 3 rows (Default/Small/Large) with 5 languages each (EN, IT, ES, DE, FR)
- **Fix**:
  - Keep 3 size variants as 3 side-by-side columns (already using `vm-compact-grid`)
  - Reduce languages from 5 to 3: EN, IT, ES (remove DE, FR)
- **File**: `pages/components.html` section ~23 (`lang-select-live`)

### 3.5 Animations — 3 cards, smaller text
- **Current**: 4 animation demos (Fade In Up, Blur In, Scale Up, Flip In) in 2×2 grid
- **Fix**:
  - Remove "Flip In" (least common entrance animation)
  - Change grid to `repeat(3, 1fr)` for 3 equal columns
  - Reduce font size inside demo cards (smaller `.showcase-label` and `.vm-stat__value`)
- **Files**: `pages/components.html` + `css/showcase.css` (`.vm-anim-grid`)

### 3.6 Ghost vs Outline button labels
- **Finding**: They ARE semantically distinct:
  - **Ghost** (`vm-btn--ghost`): No border, transparent bg, secondary text color. For de-emphasized actions.
  - **Outline** (`vm-btn--outline`): Accent-colored border, transparent bg, accent text. For secondary CTAs.
- **Fix**: Add clear label/caption in the buttons section explaining this distinction
- **File**: `pages/components.html` section 07 (buttons)

### 3.7 Full horizontal space review (final sweep)
- Verify ALL sections use multi-column layouts where appropriate
- Previous agent converted: cards, badges, tabs, progress, alerts, avatars, tooltips, loading, toasts, breadcrumb+code+empty state, language selector, theme toggle
- **Check remaining**: Forms section (input sizes side by side?), stat cards, any other single-column sections
- **File**: `pages/components.html` (full pass)

---

## Phase 4: THEME REFINEMENTS ✅ DONE (2026-03-15)

### 4.1 Sakura spring — add sky blue
- **Current**: Dusty rose `#C87C85` (primary) + teal `#6BA3B5` (secondary)
- **Problem**: Sakura is cherry blossoms AND sky — needs more visible blue
- **Fix**: Shift `--accent-secondary` from muted teal to brighter sky blue:
  ```
  --accent-secondary:       #5EAED4   (was #6BA3B5)
  --accent-secondary-hover: #7EC4E4   (was #82BCC9)
  --accent-secondary-subtle: rgba(94, 174, 212, 0.12)
  ```
- **Also update**: gradients that use secondary, `--gradient-glow-blue`, `--color-info`, FX grid blue references
- **File**: `css/themes/sakura-spring.css`
- **Test**: Sakura theme should feel like "cherry blossoms against a spring sky" — not just pink + gray-green

### 4.2 Stats for Nerds — ASCII art must be light
- **Current**: Panel bg is always dark `#0A0E1A` (correct). ASCII logo uses `color-mix(in srgb, var(--text-primary) 76%, var(--accent-primary) 24%)` — on light themes, `--text-primary` is dark (#1A1A2E), making ASCII dark-on-dark = invisible
- **Fix**: Change ASCII logo color to use a light base regardless of theme:
  ```css
  color: color-mix(in srgb, #D0D8E8 76%, var(--accent-primary) 24%);
  ```
  This ensures light text tinted with the theme's accent color.
- **File**: `css/components/data-display.css` (~line 293)
- **Test**: Switch through ALL themes — ASCII art should always be visible against the dark panel

### 4.3 Per-theme toggle variants (verify only)
- Already implemented in `css/docs.css` — 12 themes have custom `.vm-theme-toggle--sidebar` styles
- **Action**: Visual verification only — switch through each theme and check the sidebar toggle looks themed
- **GOTCHA**: After fixing vibemilk-dark colors (task 1.3), the per-theme toggle CSS for `[data-theme="vibemilk-dark"]` may need updating from magenta to violet references

---

## Phase 5: TYPOGRAPHY & GOLDEN RATIO ✅ DONE (2026-03-15)

### 5.1 Typography specimen expansion
- **Current**: `pages/foundations.html` has a golden ratio specimen section (~lines 408-570) with:
  - φ reference bar, heading hierarchy, article layout, card grid, button scale, microcopy
- **Add**:
  - **Accent text examples**: highlighted text, pull quotes, callout boxes with accent colors
  - **Real-world text compositions**: blog post layout, dashboard text hierarchy, form with labels/helpers
  - **Image placeholders**: Use `https://placehold.co/640x396/accent/white?text=Hero+Image` or inline SVGs with `fill: var(--accent-primary)` for theme-aware colors
  - **Spacing annotations**: Visual rulers showing the φ-derived spacing between elements
  - **Microcopy specimen**: error messages, success messages, tooltips, empty states
- **Files**: `pages/foundations.html` + `css/showcase.css`
- **Skill**: Use `superpowers:frontend-design` for this

### 5.2 Golden ratio audit — system-wide
- **Current spacing**: 4px grid (`4, 8, 12, 16, 20, 24, 32, 40, 48, 64`) — practical but not φ
- **Current font sizes**: `10, 11, 12, 13, 14, 16, 18, 20, 24, 28, 36` — irregular steps
- **Approach** (conservative — don't break existing components):
  1. Add `--phi-space-*` parallel token set in `css/core/tokens.css`:
     ```
     --phi-1: 4px; --phi-2: 7px; --phi-3: 11px; --phi-4: 18px; --phi-5: 29px; --phi-6: 47px; --phi-7: 76px;
     ```
  2. Apply `--phi-space-*` to section-level spacing in `css/docs.css` and `css/showcase.css`
  3. Verify font size scale — the upper range (14→16→18→20→24→28→36) roughly follows φ^(1/3) steps
  4. Review card proportions — target φ:1 aspect ratios (e.g., 300×185, 400×247)
  5. Button scale already uses ∛φ ≈ 1.175 per step (documented in foundations.html) — verify
- **DO NOT**: Replace `--space-*` tokens (would break everything)
- **Files**: `css/core/tokens.css`, `css/docs.css`, `css/showcase.css`
- **User mandate**: "pixel perfect in modo maniacale" — every layout proportion should derive from φ

---

## Phase 6: VERIFICATION & CLEANUP ✅ DONE (2026-03-15)

### 6.1 Section renumbering
- After all additions/removals, do a clean sequential renumber pass
- Format: `<!-- ═══ NN. SECTION NAME ═══ -->`
- Update sidebar nav in ALL 7 HTML pages to match
- **Files**: All HTML files

### 6.2 Verify hub intro removal
- `index.html` was rewritten by an agent to use sidebar layout (not hub intro)
- Verify it loads correctly, sidebar links work, Resources group present
- **File**: `index.html`

### 6.3 Verify Token Export & Brand Voice in sidebar
- Agent added "Resources" group to all sidebar navs
- Verify links work from every page (relative paths correct?)
- **Files**: All HTML sidebar navs

### 6.4 Final code review
- Use `superpowers:requesting-code-review` skill
- Check for: unclosed tags, orphaned CSS, JS syntax errors, broken references

---

## Phase 7: ARCHITECTURE ✅ DONE (2026-03-16)

### 7.1 Split components.html into multiple pages
- **Problem**: `components.html` is ~1700+ lines and growing. Hard to maintain, slow to navigate, agent edits get complex.
- **⚠ PLAN FIRST**: Before touching anything, decide:
  1. Split strategy: by category (forms.html, feedback.html, overlays.html) or by logical group?
  2. How to handle sidebar nav — one shared nav across all sub-pages?
  3. Anchor links that currently point to `components.html#section-id` from all 7 pages
  4. Whether to introduce a simple HTML includes system (e.g., a build step that injects sidebar partials)
- **DO NOT** start this without a written plan approved by the user
- **Files**: `pages/components.html` → multiple files, all sidebar navs, potentially a build script

---

## Phase 8: NERD FONTS ICON INTEGRATION ✅ DONE (2026-03-16)

> **⚠️ CLARIFICATION**: "Nerd Fonts" here means the **ICON GLYPHS** (10,000+ icons: dev icons, powerline symbols, material design, font awesome, octicons, weather, etc.), NOT typefaces/text fonts. We already have our text fonts (Montserrat, Space Mono, Chakra Petch, etc.). This phase is about replacing inline SVG icons and Unicode symbols with Nerd Font icon glyphs.

### 8.1 Integrate Nerd Font icons across the design system
- **What**: Replace inline SVG icons and basic Unicode symbols with [Nerd Fonts](https://www.nerdfonts.com/) icon glyphs throughout Vibemilk
- **Why**: Nerd Fonts provide 10,000+ icons in a single font file — dev icons, powerline symbols, material design, font awesome, octicons, weather, and more. Perfect for a dev-oriented design system.
- **Steps**:
  1. Choose a Nerd Font base: likely a patched version of one of our existing fonts (Space Mono Nerd Font or IBM Plex Mono Nerd Font)
  2. Add the webfont files to `fonts/` and `@font-face` declarations
  3. Create a `--font-icons` token in `tokens.css`

---

## Phase 9: THEME SWEEP & RELEASE QA

### 9.1 Full visual sweep still pending
- **Status**: Open reminder
- **Why**: Recent docs/UI work has good technical validation and partial visual checks, but not yet a release-grade sweep across all pages and all themes
- **Protocol**: Follow `docs/theme-qa-protocol.md`
- **Scope**:
  - All docs pages
  - All 12 built-in themes
  - Desktop-first review, then mobile spot-check where density/layout changed
- **Minimum first pass**:
  - `sakura-spring`
  - `clean-sheet`
  - `mint-protocol`
  - `cathode-ray`
- **Definition of done**:
  - no broken hierarchy
  - no low-contrast controls
  - no flattened cards/panels
  - no sidebar/nav regressions
  - no sections that feel mobile-compressed on desktop

### 9.2 New theme verification must use a fixed protocol
- **Rule**: Never sign off a new theme from one page or one component alone
- **Required**:
  1. `npm run build:tokens`
  2. `npm run audit:gui-contrast`
  3. HTTP-served preview
  4. visual sweep using Chrome Canary headless or interactive browser review
- **Reference**: `docs/theme-qa-protocol.md`
  4. Replace current icons: sidebar nav icons, hub card icons, section headers, status indicators, theme toggle symbols (☀/☾), badges, toast icons
  5. Build a Nerd Fonts specimen section in `pages/foundations.html` — showcasing icon categories, sizes, colors, and how to use them with `vm-*` classes
  6. Create a utility class system: `.vm-nf` base + `.vm-nf--lg`, `.vm-nf--accent`, etc.
  7. Document integration in `pages/integration.html` — how to use Nerd Font glyphs in custom projects
  8. Update token export (`scripts/build-tokens.js`) to include icon font references
- **Showoff**: The specimen page should be impressive — searchable icon grid, copy-to-clipboard glyph codes, theme-aware coloring, size scale demos
- **Files**: `fonts/`, `css/core/tokens.css`, `css/core/base.css` (or new `css/core/icons.css`), `pages/foundations.html`, `pages/integration.html`, `css/showcase.css`
- **Note**: Nerd Fonts are ~2-4MB per variant. Consider subsetting for web delivery, or offering full + subset versions.

---

## Agent Assignment Strategy

```
SESSION START:
├── Agent A (bugs):       1.1 → 1.2 (both in vibemilk-docs.js)
├── Agent B (theme fix):  1.3 (vibemilk-dark.css — independent file)
│
AFTER BUGS:
├── Agent A (removals):   2.1 + 2.2 + 2.3 (components.html)
│
AFTER REMOVALS:
├── Agent A (layouts):    3.1 → 3.2 → 3.3 → 3.4 → 3.5 → 3.6 → 3.7
│                         (single pass through components.html)
│
AFTER LAYOUTS:
├── Agent A (sakura):     4.1 (sakura-spring.css)
├── Agent B (nerds):      4.2 (data-display.css)
├── Agent C (verify):     4.3 (docs.css — read only)
│
AFTER THEMES:
├── Agent A (typography): 5.1 (foundations.html)
│   then:                 5.2 (tokens.css audit)
│
FINAL:
├── Agent A (cleanup):    6.1 → 6.2 → 6.3 → 6.4
```

---

## Gotchas & Notes for Future Self

1. **file:// CORS**: Opening HTML files via `file://` protocol blocks font loading and some JS. Use a local server (`python3 -m http.server 8080`).
2. **Sidebar duplication**: Sidebar HTML is copy-pasted across ALL 7 pages. Changes must be replicated everywhere. Consider a future includes system.
3. **Theme toggle + THEME_PAIRS**: Only themes listed in `THEME_PAIRS` get a working toggle. Others show disabled state with tooltip. After changing vibemilk-dark colors, update the per-theme toggle CSS too.
4. **components.html is massive**: ~1800+ lines. When multiple agents edit it simultaneously, merge conflicts are guaranteed. Use ONE agent for components.html edits.
5. **RGB565 parsing**: Token exporter for ESP32 uses RGB565 format. If you change any color tokens, run `npm run build:tokens` afterward.
6. **Version sync**: `tokens.css` line 1 has version number. Keep in sync with `package.json`.
7. **Golden ratio values**: φ = 1.618, 1/φ = 0.618, √φ = 1.272, ∛φ ≈ 1.175. Button height steps use ∛φ, avatar steps use √φ.
8. **Matt font**: Custom brand typeface loaded from `css/fonts/matt/WEB/`. Only used in vibemilk-default and vibemilk-dark themes. Other themes use Google Fonts.
9. **`VibemilkThemeManager`**: Assigned TWICE in vibemilk-docs.js (line ~326 and ~780). Second overwrites first. Not a bug per se but worth noting.
10. **Ghost ≠ Outline**: Ghost = no border, secondary text. Outline = accent border, accent text. User initially thought they were the same — they're not. Document clearly.
