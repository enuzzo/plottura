# Vibemilk - the Netmilk Studio Design System

Version: `2.2.0`  
Brand: **Netmilk Studio sagl**  
Scope: Flexible web UI system for Netmilk products, tools, dashboards, and control panels

## 1. Philosophy

Vibemilk is a dark-first, token-driven design system built to:

- stay lightweight and modular across very different Netmilk web projects
- scale from 1 theme to dozens of themes without unmaintainable CSS monoliths
- be straightforward for both humans and AI agents to integrate

## 2. File Structure

```text
.
|-- index.html
|-- js/
|   `-- vibemilk-docs.js
`-- css/
    |-- vibemilk-core.css
    |-- vibemilk-themes.css
    |-- vibemilk.css
    |-- docs.css
    |-- showcase.css
    |-- core/
    |   |-- tokens.css
    |   |-- base.css
    |   |-- components.css
    |   `-- utilities.css
    |-- components/
    |   |-- surfaces.css
    |   |-- actions.css
    |   |-- forms.css
    |   |-- feedback.css
    |   `-- data-display.css
    `-- themes/
        |-- cyber-grid.css
        |-- acid-pop.css
        |-- sakura-spring.css
        |-- mono-brutalist.css
        `-- mint-protocol.css
```

## 3. Integration

### 3.1 Single Theme (recommended for production)

```html
<link rel="stylesheet" href="css/vibemilk-core.css">
<link rel="stylesheet" href="css/themes/cyber-grid.css">
<html data-theme="cyber-grid">
```

### 3.2 Runtime Theme Switcher

```html
<link rel="stylesheet" href="css/vibemilk-core.css">
<script src="js/vibemilk-docs.js" defer></script>
<select data-vm-theme-select>...</select>
```

The manager stores the current theme in `localStorage` under:

```text
vibemilk.design-system.theme
```

Automatic fallback: `vibemilk-default`.

### 3.3 Documentation and Live Catalog

The documentation app in `index.html` uses:

- `css/docs.css` for the fixed-sidebar docs shell
- `css/showcase.css` for the full live component catalog
- `js/vibemilk-docs.js` for theme switching, token readouts, section spy, and desktop/mobile preview mode

Production projects that only consume the design system should load the core CSS and, optionally, one theme file. They do not need `docs.css` or `showcase.css`.

The preview mode stores its last state in `localStorage` under:

```text
vibemilk.design-system.preview-mode
```

## 4. Theme System

Built-in themes:

- `vibemilk-default` (baseline in `core/tokens.css`)
- `cyber-grid`
- `acid-pop`
- `sakura-spring`
- `mono-brutalist`
- `mint-protocol` (Herbal Harmony base + lilac/blush contrast accents, `Encode Sans Semi Expanded` 400/500)

### 4.1 Add a New Theme

1. Create `css/themes/<theme>.css`
2. Override the full token set, not just a small accent subset
3. Register the theme in the JS `THEME_MANIFEST`
4. Run `npm run build:tokens`
5. Run `npm run audit:gui-contrast`
6. Perform a visual sweep over HTTP following `docs/theme-qa-protocol.md`
7. Do not consider the theme accepted until the protocol passes

Example:

```css
:root[data-theme="arctic-noise"] {
  --theme-id: 'arctic-noise';
  --accent-primary: #8BE8FF;
  --bg-surface: #0F1E2A;
  --font-family: 'Chakra Petch', sans-serif;
}
```

```js
const THEME_MANIFEST = {
  "vibemilk-default": null,
  "arctic-noise": "css/themes/arctic-noise.css"
};
```

### 4.2 Theme Acceptance Policy

Every new theme must pass a dedicated QA protocol before merge or release.

Required checks:
- token export succeeds
- GUI/scrollbar contrast audit succeeds
- visual sweep is performed page by page
- the theme is checked for both stability and harmony with the rest of Vibemilk

Reference protocol:
- `docs/theme-qa-protocol.md`

Important:
- "Looks good on one page" is not enough
- "The colors are nice" is not enough
- a new theme is considered complete only after protocol-driven verification

## 5. Namespace and Naming

- Components: `.vm-*`
- Modifiers: `--variant` (for example `.vm-btn--primary`)
- Inner elements: `__element` (for example `.vm-card__header`)

Do not use legacy names or parallel namespaces.

## 6. Core Design Tokens

### 6.1 Colors

- `--bg-*`
- `--text-*`
- `--accent-*`
- `--color-success|warning|danger|info`

### 6.2 Typography

- `--font-family`, `--font-mono`
- `--fs-display-xl ... --fs-micro`
- `--fw-light ... --fw-extrabold`

### 6.3 Spacing and Shape

- `--space-1 ... --space-16`
- `--radius-xs ... --radius-full`
- `--shadow-sm ... --shadow-xl`

### 6.4 Motion and State

- `--transition-fast|base|slow|spring`
- `--focus-ring-*`
- `--selection-*`

## 7. Layout API

Shell classes:

- `.vm-app`
- `.vm-sidebar`
- `.vm-main`
- `.vm-topbar`
- `.vm-content`

Grid classes:

- `.vm-grid`
- `.vm-col-1 ... .vm-col-12`
- responsive helpers: `.vm-col-md-6`, `.vm-col-md-12`

## 8. Component API (Quick)

### 8.1 Buttons

- Base: `.vm-btn`
- Size: `.vm-btn--xs|sm|md|lg|xl`
- Variant: `.vm-btn--primary|secondary|outline|ghost|success|warning|danger|gradient`
- Utility: `.vm-btn--icon`, `.vm-btn--block`, `.vm-btn--loading`

### 8.2 Forms

- Input: `.vm-input`, `.vm-input--sm|lg|error|success`
- Textarea: `.vm-textarea`
- Select: `.vm-select`
- Custom dropdown: `.vm-dropdown`, `__trigger`, `__menu`, `__item`
- Grouping: `.vm-form-group`, `.vm-label`, `.vm-help-text`, `.vm-error-text`
- Toggle: `.vm-toggle`, `.vm-toggle__track`, `.vm-toggle__label`
- Checkbox: `.vm-checkbox`, `.vm-checkbox__box`
- Radio: `.vm-radio`, `.vm-radio__circle`

### 8.3 Surfaces and Data

- Card: `.vm-card` + `--elevated|interactive|glow|gradient|flush`
- Stat: `.vm-stat`
- Table: `.vm-table`, `.vm-table--striped`, wrapper `.vm-table-wrapper`
- Tabs: `.vm-tabs`, `.vm-tab`, `.vm-tabs--underline`

### 8.4 Feedback and State

- Badge: `.vm-badge` + semantic variants
- Dot: `.vm-dot` + variants + `--pulse`
- Alert: `.vm-alert`, `.vm-alert--info|success|warning|danger`
- Toast: `.vm-toast`, `.vm-toast-container`
- Progress: `.vm-progress`, `.vm-progress__fill`
- Status: `.vm-status`, `.vm-status--online|warning|offline|connecting`

### 8.5 Overlay and Support

- Modal: `.vm-modal-overlay`, `.vm-modal`, `__header`, `__body`, `__footer`
- Tooltip: `.vm-tooltip-wrapper`, `.vm-tooltip`
- Skeleton: `.vm-skeleton` + variants
- Empty state: `.vm-empty`, `__icon`, `__title`, `__text`
- Code block: `.vm-code`, `.vm-code--inline`
- Diagnostics panel: `.vm-nerds` family

### 8.6 Live Catalog Coverage

The restored live catalog in `index.html` covers the full showcase set:

- foundations, typography, spacing, radius, shadows, grid
- buttons, form controls, dropdowns
- cards, stat cards, badges, status dots
- tabs, tables, progress bars
- alerts, banners, feed/list items
- avatars, tooltips, modal dialogs, toasts
- skeletons, empty states, breadcrumb/navigation, log/code panels
- sidebar navigation, animation demos, diagnostics panel
- configuration panel patterns and the FX grid

## 9. Utilities

Spacing:

- `mt-*`, `mb-*`, `p-*`, `m-0`

Layout:

- `flex`, `items-center`, `justify-between`, `gap-*`, `w-full`, `h-full`

Visual:

- `rounded-*`, `opacity-*`, `overflow-*`, `cursor-pointer`, `hidden`, `block`

Animations:

- `animate-fade-in-up|left|down|bounce-in`
- `delay-1 ... delay-8`

## 10. AI-First Rules

When an AI agent integrates Vibemilk, it should:

1. explicitly pick single-theme or runtime-switcher mode
2. use `vm-*` classes without inventing parallel namespaces
3. avoid hardcoded colors/sizes when a token exists
4. prefer `:root` token overrides over patching core components
5. preserve basic accessibility (labels, focus-visible, contrast)
6. validate both desktop and mobile preview before exporting a UI fragment

## 11. Changelog (Summary)

### v2.2.0

- new built-in `mint-protocol` theme added
- Herbal Harmony mint palette integrated as a token-complete theme preset
- `Encode Sans Semi Expanded` added as a theme-local font dependency at weights `400` and `500`

### v2.1.0

- full live component catalog restored from the legacy system
- desktop/mobile preview canvas added to the central showcase
- section navigation aligned with the restored catalog
- parity checked against the legacy component surface

### v2.0.0

- full rebranding to Vibemilk
- legacy naming removed
- CSS reorganized into `core + themes + docs`
- clear support for single-theme integration and runtime theme switching
- documentation rewritten for modular, long-term maintainability and AI-first usage

---

(c) 2026 Netmilk Studio sagl. All rights reserved.
