# Plottura — Coding Guide

## Commands

```bash
bun install        # Install dependencies
bun run dev        # Start dev server (Vite)
bun run build      # Production build
bun run typecheck  # TypeScript type checking
```

Note: bun is at `~/.bun/bin/bun` — you may need `export PATH="$HOME/.bun/bin:$PATH"`.

## Architecture

- **Framework:** React 18 + TypeScript + Vite
- **Map engine:** MapLibre GL JS v5 with OpenFreeMap tiles (OpenMapTiles schema)
- **UI:** Tailwind CSS + shadcn/ui (Radix primitives) + Lucide icons + Inter font
- **State:** PosterContext + useReducer (`src/features/poster/ui/PosterContext.tsx`)
- **Import alias:** `@/` maps to `src/`
- **Pattern:** Hexagonal / feature-sliced — each feature has domain / application / infrastructure / ui layers

## CSS Architecture

- **All styling is Tailwind utilities** — no component CSS classes in globals.css
- `src/app/globals.css` contains ONLY: font import, Tailwind directives, design tokens (light/dark CSS custom properties), one MapLibre control-hide rule
- Design tokens: `var(--bg-app)`, `var(--accent)`, `var(--text-primary)`, etc. — toggled by `[data-theme="dark"]`
- Tailwind references tokens via `tailwind.config.ts` extend (e.g., `bg-accent` → `var(--accent)`)
- For complex button styles shared across components, use `const` class strings at the top of the file (see `CTL_BTN` pattern in PreviewPanel.tsx)
- Container queries: use `[container-type:size]` arbitrary property + `cqmin`/`cqh` in inline styles

## Icons

- **All icons are Lucide** (`lucide-react`) — no react-icons
- Marker icons: `src/features/markers/infrastructure/iconRegistry.ts` — 18 predefined Lucide icons
- UI chrome icons: import directly from `lucide-react`

## Directory Structure

```
src/
  app/            # globals.css (tokens only)
  core/           # Config constants, cache, platform, services (singleton adapters)
  components/
    sidebar/      # Sidebar shell (Sidebar, SidebarHeader, SidebarFooter, SidebarSection)
    canvas/       # FloatingZoomControls, MapCanvas
    ui/           # Radix primitives (accordion, dialog, switch)
  features/
    export/       # PNG/SVG/PDF export pipeline (useExport has all 3 handlers)
    layout/       # Poster dimension & layout presets (Print, IKEA Frames, Social Media, etc.)
    location/     # Geocoding via Nominatim, search autocomplete
    map/          # MapLibre integration, style generation, layer visibility
    markers/      # Draggable marker system, icon registry (Lucide), custom icon upload
    poster/       # PosterContext, reducer, PreviewPanel, text overlay, gradient fades
    theme/        # 18 theme definitions, color editor, palette display
    install/      # PWA install prompt (deferred)
  shared/         # AppShell, geo utils, color utils, hooks
```

## Key Conventions

- Functional components only (no class components)
- TypeScript strict mode enabled — **zero TS errors**
- Feature-sliced architecture: domain / application / infrastructure / ui per feature
- Use `@/` import alias, never relative paths crossing feature boundaries

## State Management

**PosterContext** (`src/features/poster/ui/PosterContext.tsx`) holds all app state via `useReducer`.

**PosterForm** fields (all in `posterReducer.ts`):
- Location: `location`, `latitude`, `longitude`, `distance`, `displayCity`, `displayCountry`, `displayContinent`
- Layout: `width`, `height`, `theme`, `layout`
- Typography: `fontFamily`, `showPosterText`
- Map layers: `includeBuildings`, `includeWater`, `includeParks`, `includeAeroway`, `includeRail`, `includeRoads`, `includeRoadPath`, `includeRoadMinorLow`, `includeRoadOutline`
- Overlays: `showMarkers`, `showGradientTop`, `showGradientBottom`
- Attribution: `includeCredits`, `includeOsmBadge`
- Text visibility: `showCountry`, `showCoordinates`

**Key actions:** `SET_FIELD`, `SET_FORM_FIELDS`, `SET_THEME`, `SET_LAYOUT`, `SET_COLOR`, `RESET_COLORS`, `SELECT_LOCATION`, marker CRUD

**Handlers** are in `useFormHandlers.ts` — provides `handleChange`, `handleThemeChange`, `handleLayoutChange`, `handleCreditsChange`, etc.

## Theme System

**ResolvedTheme** (`src/features/theme/domain/types.ts`):
```
{ name, description, ui: { bg, text }, map: { land, water, waterway, parks, buildings, aeroway, rail, roads: { major, minor_high, minor_mid, minor_low, path, outline } } }
```

18 themes defined in `themeRepository.ts`. Custom color overrides stored in `state.customColors` (keyed by dot-path like `"map.land"`). Applied via `applyThemeColorOverrides()`.

## Map Style Generation

`generateMapStyle()` in `src/features/map/infrastructure/maplibreStyle.ts`:
- OpenFreeMap vector tiles (SOURCE_MAX_ZOOM = 14)
- 5-tier road system: major, minor_high, minor_mid, minor_low, path
- Road outlines as separate layer underneath
- Building blend factor 0.14, fill opacity 0.84
- Layer visibility controlled by PosterForm boolean fields
- Style spec is regenerated when theme or layer toggles change

## Export Pipeline

Three formats, all at 300 DPI:
- **PNG:** `compositeExport()` → `createPngBlob()` (with pHYs DPI chunk injection)
- **PDF:** `compositeExport()` → `createPdfBlobFromCanvas()` (handwritten minimal PDF 1.4, no external lib)
- **SVG:** `createLayeredSvgBlobFromMap()` (offscreen MapLibre render → layered SVG with embedded PNGs)

**Export flow** (in `useExport.ts`):
1. Load Google Font
2. Calculate print dimensions (cm → inches → 300 DPI px)
3. SVG path: offscreen MapLibre + overlay layers → SVG blob
4. PNG/PDF path: capture map canvas → compositeExport (map + fades + markers + text) → format-specific blob
5. Trigger browser download

**All export options respect:** showGradientTop/Bottom, includeCredits, includeOsmBadge, showCountry, showCoordinates, showPosterText, showMarkers

## Poster Text Rendering

Two parallel implementations that must stay in sync:
1. **Preview:** `PosterTextOverlay.tsx` — DOM-based with container queries (`cqmin` units), GPU-composited
2. **Export:** `typography.ts` (`drawPosterText()`) — Canvas 2D API, pixel-based scaling

Both use shared layout constants from `src/features/poster/domain/textLayout.ts` (Y ratios, font sizes, margin ratios).

**Text elements:** city label (spaced uppercase), divider line, country, coordinates, OSM attribution (bottom-right), credits (bottom-left)

## UI Layout

- **Desktop:** Sidebar (360px, collapsible) + Canvas area with poster
- **Canvas area:** Neutral `bg-app` background, poster card with drop-shadow + mouse-tracking parallax
- **Top notch:** Layout label (themed dark bg, light text, semibold uppercase)
- **Bottom notch:** Recenter + Edit Map buttons (themed light bg, dark text, semibold uppercase)
- **Sidebar footer:** Settings summary grid + 3 export buttons (PNG filled, SVG/PDF outlined)
- **Sidebar sections:** Location, Theme, Layout, Map Settings, Layers, Markers, Typography (Radix Accordion)

## Gotchas & Learnings

1. **Ghost canvas was expensive** — Syncing a canvas clone on every map render was heavy. Neutral bg + themed notches is simpler and cleaner.
2. **Animated gradients don't work for poster backgrounds** — Colored backgrounds compete with the poster. Neutral gray wins.
3. **Theme-derived UI colors work well** — Computing lightest/darkest from the palette for buttons/notches creates automatic visual coherence. See `PreviewPanel.tsx` lightestColor/darkestColor computation.
4. **Two text renderers must stay in sync** — `PosterTextOverlay.tsx` (DOM preview) and `typography.ts` (canvas export) use the same constants from `textLayout.ts`. Any text layout change must update both.
5. **MapLibre offscreen rendering** — SVG export creates an offscreen MapLibre instance in a hidden container. Must wait for `idle` event before capturing. See `exportUtils.ts`.
6. **PDF is handwritten** — No jsPDF dependency. `pdfExporter.ts` writes minimal PDF 1.4 binary directly. Works but limited to raster content.
7. **Google Fonts loaded dynamically** — `ensureGoogleFont()` in `services.ts` injects a `<link>` tag. Fonts must be loaded before export capture.
8. **PosterForm uses string values for numeric fields** — `width`, `height`, `distance`, `latitude`, `longitude` are all strings in the form, parsed to numbers where needed.
9. **Layout matching** — When width/height changes, `resolveLayoutIdForSize()` tries to match a predefined layout within tolerance. See `layoutMatcher.ts`.
10. **Container queries for responsive poster text** — The poster overlay uses `[container-type:size]` and `cqmin` units so text scales proportionally with the poster frame size.

## Phase 2 Status: COMPLETE

All milestones done (M1-M5). Zero TS errors. See:
- Spec: `docs/superpowers/specs/2026-04-08-phase2-architecture-and-ux-design.md`
- Handoff: `docs/superpowers/notes/2026-04-08-phase2-session{1,2,3}-handoff.md`

## Next: Phase 3 — 3D Isometric Poster View

The key future milestone. The current rendering pipeline is modular:
- `PreviewPanel.tsx` manages the poster frame, map, overlays, and text
- `MapPreview.tsx` wraps the MapLibre instance
- Export uses `compositeExport()` which layers map + fades + markers + text on canvas

A 3D isometric view should be an **alternative renderer alongside the current 2D flat view**, not a replacement. The poster content (map + overlays + text) stays the same — only the presentation changes (flat card vs. 3D perspective with shadow/depth).
