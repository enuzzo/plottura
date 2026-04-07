# Plottura Phase 1 — Rebrand & UI Overhaul Design Spec

**Date:** 2026-04-07
**Scope:** Phase 1 only — rebrand Terraink fork, replace UI shell and styling
**Status:** Draft

---

## 1. Goals

Transform the Terraink fork into a visually distinct product called Plottura ("From plot to print") by:

1. Removing all Terraink branding and trademark assets
2. Replacing the CSS-based UI with Tailwind + shadcn/ui components
3. Rebuilding the editor layout as an always-open sidebar with collapsible sections
4. Establishing a light-default, dark-optional neutral theme with a single teal accent
5. Preserving all existing functionality — poster creation, map rendering, export

The app must remain functional at every step of the migration (incremental approach).

---

## 2. Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| UI system | Tailwind CSS + shadcn/ui | Standard, well-maintained, React-native. No Vibemilk dependency for now. |
| Layout | Always-open left sidebar (320px) + accordion sections | Desktop-primary tool. Settings should be visible, not hidden behind icon clicks. |
| Default theme | Light (neutral whites/grays) | Poster/print context — paper-like. Output is the hero. |
| Dark mode | Available via toggle (near-black neutrals) | Secondary option. Same accent color. |
| Accent color | Cartographic Teal `#00BFA5` | Evokes cartographic tradition. Distinctive, high contrast on both light and dark. |
| UI font | Inter (variable, 400/500/600/700) | Screen-optimized, invisible, lets poster typography be the star. |
| Icons | Lucide | shadcn/ui default. Tree-shakeable, React-native. Replaces react-icons. |
| Migration strategy | Incremental, file-by-file | App stays working at every commit. Old CSS coexists temporarily with Tailwind. |
| State management | React Context + useReducer (preserved) | Zustand migration deferred to Phase 5 per plan. PosterContext stays as-is. |
| Default theme override | Light (overrides plan's dark default) | Decided during brainstorming: poster/print tool = paper context. Plan Section 4 originally said dark; this spec supersedes that decision. |

**Note:** This spec supersedes the PLOTTURA-PLAN.md file structure (Section 8) and default theme decision. The plan's `src/store/`, `src/styles/`, `src/themes/`, `src/presets/` directories are not used in Phase 1. The existing `src/features/` architecture is preserved instead.

---

## 3. Layout Architecture

### 3.1 Desktop (≥1024px)

```
┌──────────────────────────────────────────────────────┐
│ [P] Plottura                                    [🌙] │  ← Sidebar header (brand + theme toggle)
├──────────────────────┬───────────────────────────────┤
│  ▼ 🎨 Theme          │                               │
│    [theme cards]      │      Floating Location Bar    │
│    [color swatches]   │     ┌───────────────────┐     │
│  ► 📍 Location        │     │                   │     │
│  ► 🗺️ Map Settings    │     │   Poster Preview  │     │
│  ► 📐 Layers          │     │   (centered, with  │     │
│  ► 📌 Markers         │     │    drop shadow)    │     │
│  ► Aa Typography      │     │                   │     │
│                       │     └───────────────────┘     │
│                       │                          [+]  │
│  ┌─────────────────┐  │                          [-]  │
│  │  Export Poster   │  │                               │
│  └─────────────────┘  │                               │
└──────────────────────┴───────────────────────────────┘
       320px                    remaining space
```

**Sidebar:**
- Width: 320px, always visible
- Background: `--bg-panel` (#FAFAFA light / #141414 dark)
- Border-right: 1px solid `--border`
- Header: Plottura logo mark (teal "P" in rounded square) + wordmark + dark mode toggle
- Body: scrollable, accordion sections
- Footer: pinned Export button (teal, full-width, 40px height)

**Accordion sections** (6 total):
1. **Theme** — poster color palette selection + color editor
2. **Location** — search input, current location display, coordinates
3. **Map Settings** — zoom, map style, poster dimensions (width/height)
4. **Layers** — toggle visibility of roads, water, buildings, parks, railways, labels
5. **Markers** — add/edit/remove map markers, icon picker, size
6. **Typography** — poster title/subtitle text, font family, weight, size, alignment

Behavior:
- Built with shadcn/ui `Accordion` component (Radix `@radix-ui/react-accordion` under the hood) for proper animation and accessibility
- One section expanded at a time (accordion mode, `type="single"`) — expanding one collapses others
- Default open section on page load: **Theme** (the most common first action)
- Chevron icon rotates on expand (Radix handles this via `data-state`)
- Each header: Lucide icon + label text (15px, weight 600)

**Map canvas:**
- Fills remaining horizontal space
- Background: `--bg-app` (#F0F0F0 light / #0A0A0A dark) — slightly darker than sidebar to create depth
- Poster preview: centered, max-height 80vh, max-width 80% of canvas area, maintains aspect ratio from poster dimensions. `object-fit: contain` behavior. Surrounded by even padding (min 40px).
- Drop shadow: `var(--shadow-lg)` for the poster card
- Floating location search bar: top center, `background: rgba(255,255,255,0.95)`, `backdrop-filter: blur(12px)`, `border: 1px solid var(--border)`, `box-shadow: var(--shadow-md)`, `border-radius: var(--radius-lg)`
- Floating zoom controls: bottom right, stacked +/- buttons

### 3.2 Tablet (768px–1023px)

- Sidebar width reduces to 280px
- Otherwise same layout

### 3.3 Mobile (<768px)

**Deferred to Phase 1.5.** Desktop is the primary target per PLOTTURA-PLAN ("Poster design on phone is not a real use case"). For Phase 1, mobile gets a minimal responsive treatment:
- Sidebar stacks above the map canvas (vertical layout)
- Accordion sections still work
- No bottom sheet or tab bar yet
- Export button remains in sidebar footer

Full mobile rework (bottom sheet, tab bar, swipe gestures, snap points) is Phase 1.5 after the desktop UI is solid.

---

## 4. Token System

### 4.1 Color Tokens

Defined as CSS custom properties on `<html>`, mapped into `tailwind.config.ts`.

**Light theme** (`data-theme="light"`, default):

```css
--bg-app:          #F0F0F0
--bg-panel:        #FAFAFA
--bg-card:         #FFFFFF
--bg-input:        #FFFFFF
--bg-input-focus:  #FFFFFF
--border:          #E5E5E5
--border-subtle:   #EBEBEB
--text-primary:    #1A1A1A
--text-secondary:  #555555
--text-muted:      #999999
--accent:          #00BFA5
--accent-hover:    #00D9BC
--accent-active:   #00A891
--accent-subtle:   rgba(0, 191, 165, 0.08)
--shadow-sm:       0 1px 3px rgba(0, 0, 0, 0.05)
--shadow-md:       0 4px 12px rgba(0, 0, 0, 0.08)
--shadow-lg:       0 8px 28px rgba(0, 0, 0, 0.10)
```

**Dark theme** (`data-theme="dark"`):

```css
--bg-app:          #0A0A0A
--bg-panel:        #141414
--bg-card:         #1C1C1C
--bg-input:        #1C1C1C
--bg-input-focus:  #222222
--border:          #1E1E1E
--border-subtle:   #1A1A1A
--text-primary:    #F0F0F0
--text-secondary:  #999999
--text-muted:      #555555
--accent:          #00BFA5
--accent-hover:    #00D9BC
--accent-active:   #00A891
--accent-subtle:   rgba(0, 191, 165, 0.12)
--shadow-sm:       0 1px 3px rgba(0, 0, 0, 0.20)
--shadow-md:       0 4px 12px rgba(0, 0, 0, 0.30)
--shadow-lg:       0 8px 28px rgba(0, 0, 0, 0.35)
```

**Semantic colors** (same in both themes):

```css
--color-success:   #10B981
--color-warning:   #F59E0B
--color-danger:    #EF4444
--color-info:      #3B82F6
```

### 4.2 Typography Tokens

```css
--font-family:     'Inter Variable', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif
--font-mono:       'SF Mono', 'Fira Code', 'Cascadia Code', monospace

--text-xs:         12px    /* micro labels, badges */
--text-sm:         14px    /* captions, help text */
--text-base:       15px    /* body, form controls, section content */
--text-lg:         17px    /* section headers */
--text-xl:         20px    /* panel titles, sidebar header */

--font-normal:     400
--font-medium:     500
--font-semibold:   600
--font-bold:       700
```

### 4.3 Spacing

Follow Tailwind's default scale (4px base). No custom spacing tokens needed.

### 4.4 Border Radius

```css
--radius-sm:       6px     /* inputs, small cards */
--radius-md:       8px     /* cards, buttons */
--radius-lg:       11px    /* search bar, modals */
--radius-full:     9999px  /* pills, avatars */
```

### 4.5 Theme Switching

- Attribute: `data-theme="light"` or `data-theme="dark"` on `<html>`
- Persisted in `localStorage` key: `plottura-theme`
- Default: `light`
- Toggle: Moon/Sun icon in sidebar header
- Tailwind integration: CSS variables referenced via `theme.extend.colors` in config

Note: The UI theme (light/dark) is independent from poster themes (map color palettes). They are separate concerns.

---

## 5. Sidebar Section Details

Each section maps to an existing Terraink feature. The content is preserved; only the container/chrome is rebuilt.

### 5.1 Theme Section
- **Source:** `src/features/theme/`
- **Content:** Grid of theme cards (2 columns), each showing a color preview. Selected theme has teal border. Below: color editor with labeled swatches (Background, Water, Roads, Buildings, Text, etc.) — each opens a color picker on click.
- **Lucide icon:** `Palette`

### 5.2 Location Section
- **Source:** `src/features/location/`
- **Content:** Search input with autocomplete dropdown (Nominatim). Current location display (city, country). Coordinates (lat/lon). "Use my location" button.
- **Lucide icon:** `MapPin`
- **Note:** The floating search bar on the canvas is a shortcut to this same search. Both trigger the same autocomplete hook.

### 5.3 Map Settings Section
- **Source:** `src/features/map/`
- **Content:** Zoom level slider. Map style dropdown. Poster dimensions (width × height inputs with aspect ratio lock). Map rotation input.
- **Lucide icon:** `Map`

### 5.4 Layers Section
- **Source:** `src/features/map/ui/LayersSection.tsx`
- **Content:** Toggle switches for each map layer: roads, water, buildings, parks/green, railways, labels. Each toggle: label + on/off switch.
- **Lucide icon:** `Layers`

### 5.5 Markers Section
- **Source:** `src/features/markers/`
- **Content:** "Add marker" button. List of placed markers with edit/delete. Marker icon picker (modal/popover). Size slider. Drag to position on map.
- **Lucide icon:** `MapPinPlus`

### 5.6 Typography Section
- **Source:** `src/features/poster/ui/TypographySection.tsx`
- **Content:** Title text input. Subtitle text input. Font family dropdown (Google Fonts, inherited from Terraink). Font weight picker. Font size slider. Text alignment. Text color (inherits from theme or manual override).
- **Lucide icon:** `Type`

---

## 6. Components to Build (New)

These are new React components that replace Terraink's shell:

| Component | Purpose | Replaces |
|---|---|---|
| `Sidebar` | Always-open left panel container | `DesktopNavBar` + `desktop-left-panel` |
| `SidebarHeader` | Brand mark + wordmark + theme toggle | `GeneralHeader` |
| `SidebarSection` | Accordion section (header + collapsible body) | Part of `SettingsPanel` |
| `SidebarFooter` | Pinned export button | Part of `DesktopExportFab` |
| `MapCanvas` | Full-bleed map preview area | `PreviewPanel` (restyled) |
| `FloatingSearchBar` | Glassmorphic location search on canvas | `DesktopLocationBar` (repositioned) |
| `FloatingZoomControls` | +/- zoom buttons on canvas | New (extracted from map controls) |
| `MobileTabBar` | Bottom navigation for mobile | `MobileNavBar` (restyled) |
| `MobileSheet` | Bottom sheet for mobile settings | `SettingsDrawer` (restyled) |
| `ThemeToggle` | Light/dark mode switch | New |

All built with Tailwind utility classes + shadcn/ui primitives where applicable (e.g., `Accordion` for sidebar sections, `Popover` for color picker, `Select` for dropdowns, `Slider` for range inputs, `Switch` for toggles, `Input` for text fields).

**Note on mobile components:** `MobileTabBar` and `MobileSheet` are deferred to Phase 1.5. See Section 3.3.

---

## 7. Components Preserved (Migrated)

These existing Terraink components are kept but restyled with Tailwind:

| Component | Migration notes |
|---|---|
| `PosterContext` + `posterReducer` | Untouched — core state management |
| `PosterTextOverlay` | Restyle only |
| `GradientFades` | Restyle only |
| `MapPreview` (MapLibre wrapper) | Keep logic, restyle container |
| `MarkerOverlay` + `MarkerVisual` | Keep logic, restyle |
| `ColorPicker` | Replace with shadcn `Popover` + `react-colorful` (already a dep) |
| `ThemeCard` | Restyle with Tailwind |
| `LayoutCard` | Restyle with Tailwind |
| `LocationSection` internals | Keep hooks, restyle UI |
| `StartupLocationModal` | Preserved, restyled with shadcn `Dialog`. Shown on first visit to prompt location selection. |
| `MapPrimaryControls` | Cannibalized: zoom logic extracted into `FloatingZoomControls`. Other controls (if any) folded into Map Settings section. Original component removed. |
| `PickerModal` | Replaced with shadcn `Dialog` or `Popover` (for marker icon picker). Same functionality, new styling. |
| `ThemeSummarySection` | Folded into Theme accordion section content. Not a separate component. |
| `Icons.tsx` (custom SVGs) | Preserved temporarily. Replace individual icons with Lucide equivalents during each section's migration. Remove file when empty. |
| Mobile marker size bar | Preserved as-is for Phase 1. Full mobile rework in Phase 1.5. |
| Mobile "Done Editing" button | Preserved as-is for Phase 1. Full mobile rework in Phase 1.5. |
| All export infrastructure | Untouched (PNG/SVG/PDF pipeline) |
| All `src/core/` services | Untouched |
| All `src/shared/geo/` | Untouched |
| All `src/data/*.json` | Untouched — all presets carried over |

---

## 8. Components Removed

| Component | Reason |
|---|---|
| `AboutModal` | Terraink social links, Ko-fi, attribution. Replace with minimal Plottura about. |
| `AnnouncementModal` | Terraink update announcements. Not needed for fork. |
| `SupportModal` | Terraink Ko-fi support prompt. |
| `InstallPrompt` | PWA install prompt. Defer to later. |
| `FooterNote` | Terraink footer attribution. |
| `SocialLinkGroup` | Terraink social links. |
| `DesktopNavBar` | Replaced by `Sidebar`. |
| `MobileNavBar` | Replaced by `MobileTabBar`. |
| `GeneralHeader` | Replaced by `SidebarHeader`. |
| `InfoPanel` | Terraink info panel. |
| `SettingsInfo` | Terraink settings info display. |
| `useRepoStars` hook | Terraink GitHub stars display. |
| `MobileExportFab` | Replaced by export button in sidebar footer (desktop). Mobile-specific FAB deferred to Phase 1.5. |
| `DesktopExportFab` | Replaced by `SidebarFooter` export button. |

**Feature directories to remove:**
- `src/features/install/` — PWA install prompt, deferred
- `src/features/updates/` — Terraink announcement system, not needed

---

## 9. Rebrand Scope

### 9.1 Package & Config
- `package.json`: name → `plottura`, version → `0.1.0`
- `index.html`: title → "Plottura — From plot to print", meta tags, remove Terraink OG images
- `vite.config.js`: no changes expected

### 9.2 Files to Remove
- `TRADEMARK.md`
- `agent.md`
- `.github/PULL_REQUEST_TEMPLATE.md` (adapt or remove)
- `.vscode/commit-instructions.md` (adapt or remove)
- `public/` Terraink assets (logo, favicon, banner, OG images, showcase images)

### 9.3 Files to Create
- `public/favicon.svg` — Teal "P" mark
- `public/og-image.png` — Plottura social preview
- `README.md` — Per plan Section 9
- `CLAUDE.md` — Plottura-specific coding guide (adapted from Terraink's)
- `tailwind.config.ts`
- `postcss.config.js`
- `src/components/ui/` — shadcn/ui primitives directory

### 9.4 String Replacements
Global search-and-replace across all source files:
- "Terraink" → "Plottura"
- "terraink" → "plottura"
- "terraink.app" → "plottura.app"
- Remove all Terraink social URLs, Ko-fi links, Product Hunt badges

### 9.5 License & Attribution
- Keep `LICENSE` (AGPL-3.0) intact
- Keep `LICENSE-OLD` (MIT) intact
- `README.md` includes clear fork attribution per plan Section 9

---

## 10. AppShell Migration Strategy

`AppShell.tsx` is the root layout orchestrator. It is **rewritten incrementally**, not replaced in one shot:

1. **Step 3 (New shell):** Create a new `AppShell` that renders `Sidebar` + `MapCanvas` side by side. The sidebar initially wraps the old `SettingsPanel` content inside accordion sections verbatim (unstyled content in new containers).
2. **Steps 4–9 (Section migrations):** Each section migration replaces one chunk of old content inside `SidebarSection` with restyled Tailwind components. The old `SettingsPanel` shrinks as sections are extracted.
3. **Step 12 (Cleanup):** Old `SettingsPanel`, `DesktopNavBar`, `GeneralHeader`, `SettingsDrawer` are deleted. The new `AppShell` is now the sole orchestrator.

The new `AppShell` lives at `src/shared/ui/AppShell.tsx` (same path, rewritten in place) to minimize import changes across the codebase.

---

## 11. Font & Icon Loading

**Inter font:** Installed via `@fontsource-variable/inter` (npm package, self-hosted WOFF2). Imported in `globals.css`. No Google Fonts dependency for the UI font. Poster fonts still use Google Fonts API (inherited from Terraink).

**Lucide icons:** Installed via `lucide-react`. Tree-shakeable — only imported icons are bundled. `react-icons` is not removed immediately; both coexist during migration. Each section migration replaces its `react-icons` imports with Lucide equivalents. `react-icons` is removed from `package.json` in the cleanup step (Step 12) once no imports remain.

**Custom `Icons.tsx`:** Individual SVG icons in `src/shared/ui/Icons.tsx` are replaced with Lucide equivalents during section migrations. The file is deleted when empty.

---

## 12. File Structure (Target)

```
plottura/
├── public/
│   ├── favicon.svg
│   └── og-image.png
├── src/
│   ├── app/
│   │   ├── App.tsx                  # Thin shell (unchanged pattern)
│   │   ├── AppProviders.tsx         # Moved from core/
│   │   └── globals.css              # Tailwind directives + CSS custom properties
│   ├── components/
│   │   ├── ui/                      # shadcn/ui primitives
│   │   ├── sidebar/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── SidebarHeader.tsx
│   │   │   ├── SidebarSection.tsx
│   │   │   └── SidebarFooter.tsx
│   │   ├── canvas/
│   │   │   ├── MapCanvas.tsx
│   │   │   ├── FloatingSearchBar.tsx
│   │   │   └── FloatingZoomControls.tsx
│   │   ├── mobile/
│   │   │   ├── MobileTabBar.tsx
│   │   │   └── MobileSheet.tsx
│   │   └── ThemeToggle.tsx
│   ├── features/                    # Preserved from Terraink
│   │   ├── export/
│   │   ├── layout/
│   │   ├── location/
│   │   ├── map/
│   │   ├── markers/
│   │   ├── poster/
│   │   └── theme/
│   ├── core/                        # Preserved from Terraink
│   ├── shared/                      # Preserved from Terraink
│   ├── data/                        # Preserved from Terraink
│   ├── lib/
│   │   └── utils.ts                 # shadcn cn() utility
│   └── types/
├── components.json                  # shadcn/ui config
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig.json
├── vite.config.js
├── package.json
├── LICENSE
├── LICENSE-OLD
├── README.md
└── CLAUDE.md
```

---

## 13. Migration Order

Incremental, each step results in a working app:

1. **Infra setup** — Add Tailwind, PostCSS, shadcn/ui, `@fontsource-variable/inter`, `lucide-react`. Configure `tailwind.config.ts` with Plottura tokens. Both old CSS and Tailwind coexist. `react-icons` stays.
2. **Rebrand pass** — String replacements, remove Terraink assets, add Plottura favicon/meta. Remove `TRADEMARK.md`, `agent.md`, Terraink showcase images. App looks the same but says "Plottura".
3. **New shell** — Rewrite `AppShell` to render `Sidebar` + `MapCanvas` side by side. Build `SidebarHeader`, `SidebarSection` (using shadcn `Accordion`), `SidebarFooter`. Old `SettingsPanel` content wrapped verbatim inside accordion sections.
4. **Migrate Theme section** — Restyle `ThemeCard`, `ColorPicker`, `ThemeColorEditor` with Tailwind. Replace `react-icons` usage in this section with Lucide.
5. **Migrate Location section** — Restyle location UI. Build `FloatingSearchBar` on canvas. Restyle `StartupLocationModal` with shadcn `Dialog`. Replace icons.
6. **Migrate Map Settings section** — Restyle map controls, dimension fields. Extract zoom into `FloatingZoomControls`. Remove `MapPrimaryControls`. Replace icons.
7. **Migrate Layers section** — Restyle toggles with shadcn `Switch`. Replace icons.
8. **Migrate Markers section** — Restyle marker UI. Replace `PickerModal` with shadcn `Dialog`. Replace icons.
9. **Migrate Typography section** — Restyle typography controls. Replace icons.
10. **Dark mode** — Add `ThemeToggle` in `SidebarHeader`, wire up `data-theme` switching, define dark CSS custom properties.
11. **Cleanup** — Remove all old `src/styles/*.css`. Remove `react-icons` from `package.json`. Delete `Icons.tsx` if empty. Remove `src/features/install/`, `src/features/updates/`. Remove old shell components (`SettingsPanel`, `DesktopNavBar`, `GeneralHeader`, `SettingsDrawer`, `FooterNote`, `AboutModal`, etc.). Final grep for any remaining Terraink references.

Each step is one or more commits. The app runs after every step. Mobile rework (bottom sheet, tab bar) is Phase 1.5.

---

## 14. Out of Scope (Phase 1)

- Print format presets / DPI selector (Phase 2)
- Mockup mode (Phase 2)
- 3D terrain (Phase 3)
- Advanced cartographic styles (Phase 4)
- URL state / undo-redo / keyboard shortcuts (Phase 5)
- User accounts, payments, backend
- Vibemilk design system integration (separate project)
- Branding assets beyond favicon (logo suite, brand guidelines)
- i18n / localization
- Full mobile rework — bottom sheet, tab bar, swipe gestures (Phase 1.5)
