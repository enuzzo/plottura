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
    map/          # MapLibre integration, style generation, layer visibility, labels
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
- **Numeric form values are strings** — always use `Number.isFinite(Number(x)) ? Number(x) : fallback` pattern, never `Number(x) || fallback` (0 is falsy!)

## State Management

**PosterContext** (`src/features/poster/ui/PosterContext.tsx`) holds all app state via `useReducer`.

**PosterForm** fields (all in `posterReducer.ts`):
- Location: `location`, `latitude`, `longitude`, `distance`, `displayCity`, `displayCountry`, `displayContinent`
- Layout: `width`, `height`, `theme`, `layout`
- Typography: `fontFamily`, `showPosterText`, `textUppercase`, `textLetterSpacing`, `cityFontScale`, `countryFontScale`, `coordsFontScale`, `creditsFontScale`, `countryUppercase`, `coordsLetterSpacing`
- Poster layout mode: `posterLayout` ("full" | "framed"), `framePadding`, `frameBorderWidth`
- Map layers: `includeBuildings`, `includeWater`, `includeParks`, `includeAeroway`, `includeRail`, `includeRoads`, `includeRoadPath`, `includeRoadMinorLow`, `includeRoadOutline`, `includeBoundary`, `includeLandcover`
- Map labels: `includePlaceLabels`, `placeLabelDensity`, `includeWaterLabels`, `includeMountainPeaks`
- Overlays: `showMarkers`, `showGradientTop`, `showGradientBottom`
- Attribution: `includeCredits`, `includeOsmBadge`
- Text visibility: `showCountry`, `showCoordinates`
- 3D View: `enable3D`, `mapPitch`, `buildingExtrusion`, `terrainEnabled`, `terrainExaggeration`, `lightAzimuth`, `lightIntensity`

**Key actions:** `SET_FIELD`, `SET_FORM_FIELDS`, `SET_THEME`, `SET_LAYOUT`, `SET_COLOR`, `RESET_COLORS`, `SELECT_LOCATION`, marker CRUD

**Handlers** are in `useFormHandlers.ts` — provides `handleChange`, `handleThemeChange`, `handleLayoutChange`, `handleCreditsChange`, etc.

## Theme System

**ResolvedTheme** (`src/features/theme/domain/types.ts`):
```
{ name, description, ui: { bg, text }, map: { land, water, waterway, parks, buildings, aeroway, rail, roads: { major, minor_high, minor_mid, minor_low, path, outline } } }
```

18 themes defined in `themeRepository.ts`. Default theme: **Terracotta**. Custom color overrides stored in `state.customColors` (keyed by dot-path like `"map.land"`). Applied via `applyThemeColorOverrides()`.

## Map Style Generation

`generateMapStyle()` in `src/features/map/infrastructure/maplibreStyle.ts`:
- OpenFreeMap vector tiles (SOURCE_MAX_ZOOM = 14)
- OpenFreeMap glyph server for text labels (`Noto Sans Regular/Bold/Italic`)
- 5-tier road system: major, minor_high, minor_mid, minor_low, path
- Road outlines as separate layer underneath
- Building blend factor 0.14, fill opacity 0.84, height capped at 200m
- Layer visibility controlled by PosterForm boolean fields
- Style spec is regenerated when theme or layer toggles change
- 3D mode: `fill-extrusion` building layer with `render_height` from OpenMapTiles, `light` object with configurable azimuth/intensity
- Toggling 3D changes building layer ID (`building` ↔ `building-3d`), triggering full style regen (not incremental)
- Symbol layers (place names, water names, mountain peaks) always present with visibility toggle — text sizes multiplied by `overzoomScale` to compensate for the 5.5x overzoom rendering
- Boundary layer (admin borders) with dashed line, filterable by admin_level
- Landcover layer (forests, grass, farmland) blended from parks + land colors

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

**All export options respect:** showGradientTop/Bottom, includeCredits, includeOsmBadge, showCountry, showCoordinates, showPosterText, showMarkers, enable3D (pitch + fill-extrusion + light captured automatically), per-element typography (font scales, letter spacing, uppercase)

## Poster Text Rendering

Two parallel implementations that must stay in sync:
1. **Preview:** `PosterTextOverlay.tsx` — DOM-based with container queries (`cqmin` units), GPU-composited
2. **Export:** `typography.ts` (`drawPosterText()`) — Canvas 2D API, pixel-based scaling

Both use shared layout constants from `src/features/poster/domain/textLayout.ts` (Y ratios, font sizes, margin ratios).

**Text elements:** city label, divider line, country, coordinates, OSM attribution (bottom-right), credits (bottom-left)

**Per-element customization:** Each text element has independent font size scale (0.3×–2×). City and country have independent uppercase toggles. City and coordinates have independent letter spacing. Letter spacing uses CSS `letter-spacing` (preview) and `ctx.letterSpacing` (export) in `em` units — NOT physical space characters.

## Poster Layout Modes

Two modes controlled by `posterLayout` field:
- **"full"** (default): Map fills entire poster, text overlays on top of map
- **"framed"**: Map inside a bordered rectangle with configurable padding, text below the frame

**Framed layout rules:**
- Frame uses absolute positioning: `top/left/right` from `framePadding`, `bottom` derived from `TEXT_CITY_Y_RATIO + gap`
- Text overlay (`PosterTextOverlay`) is the SAME component in both modes — identical positioning, spacing, behavior
- Frame border color derived from theme text color
- Border width 0 = no border (slider shows "off")
- Tested across all aspect ratios: tall portrait (iPhone), square (Instagram), landscape (16:9), extreme wide (Reddit Banner 7.5:1)

## UI Layout

- **Desktop:** Sidebar (360px, collapsible) + Canvas area with poster
- **Canvas area:** Neutral `bg-app` background, poster card with drop-shadow + mouse-tracking parallax
- **Top notch:** Layout label (themed dark bg, light text, semibold uppercase)
- **Bottom notch:** Recenter + Edit Map/Lock Map + 3D/2D toggle (themed dark bg, light text — always fixed at bottom)
- **Floating controls:** Frosted-glass bubble above poster (only in edit mode) with rotation slider + pitch slider (when 3D) + reset view button
- **Sidebar footer:** Settings summary grid + 3 export buttons (PNG filled, SVG/PDF outlined) + Copy/Paste settings buttons
- **Sidebar sections:** Location, Theme, Layout, Map Settings, 3D View (conditional), Layers, Markers, Typography (Radix Accordion, single-select)
- **Layout section:** Layout name + rotate button (swap width↔height) + pencil edit button

## Copy/Paste Settings

- **Copy settings**: Copies full `PosterForm` + `customColors` as JSON to clipboard with `_plottura: "1.0"` version marker
- **Paste settings**: Reads JSON from clipboard, validates `_plottura` marker, applies all form fields via `SET_FORM_FIELDS`
- Located in sidebar footer below export buttons
- Used for sharing configurations and defining theme presets with typography

## Gotchas & Learnings

1. **Ghost canvas was expensive** — Syncing a canvas clone on every map render was heavy. Neutral bg + themed notches is simpler and cleaner.
2. **Animated gradients don't work for poster backgrounds** — Colored backgrounds compete with the poster. Neutral gray wins.
3. **Theme-derived UI colors work well** — Computing lightest/darkest from the palette for buttons/notches creates automatic visual coherence. See `PreviewPanel.tsx` lightestColor/darkestColor computation.
4. **Two text renderers must stay in sync** — `PosterTextOverlay.tsx` (DOM preview) and `typography.ts` (canvas export) use the same constants from `textLayout.ts`. Any text layout change must update both. Per-element typography params must be wired through both paths.
5. **MapLibre offscreen rendering** — SVG export creates an offscreen MapLibre instance in a hidden container. Must wait for `idle` event before capturing. See `exportUtils.ts`.
6. **PDF is handwritten** — No jsPDF dependency. `pdfExporter.ts` writes minimal PDF 1.4 binary directly. Works but limited to raster content.
7. **Google Fonts loaded dynamically** — `ensureGoogleFont()` in `services.ts` injects a `<link>` tag. Fonts must be loaded before export capture.
8. **PosterForm uses string values for numeric fields** — `width`, `height`, `distance`, `latitude`, `longitude` are all strings in the form, parsed to numbers where needed. **Always use `Number.isFinite(Number(x)) ? Number(x) : fallback`** — never `Number(x) || fallback` because 0 is falsy and would trigger the fallback.
9. **Layout matching** — When width/height changes, `resolveLayoutIdForSize()` tries to match a predefined layout within tolerance. See `layoutMatcher.ts`.
10. **Container queries for responsive poster text** — The poster overlay uses `[container-type:size]` and `cqmin` units so text scales proportionally with the poster frame size.
11. **3D toggle requires full style regen** — `fill-extrusion` changes the layer type and ID (`building` → `building-3d`). The incremental style updater detects layer ID mismatches and falls through to `setStyle()`. Pitch and light use direct `setPitch()`/`setLight()` calls without style regen.
12. **Building height fallback + cap** — Not all OpenMapTiles buildings have `render_height` data. The style uses `["min", ["coalesce", ["get", "render_height"], 10], 200]` to default to 10m and cap at 200m (prevents data errors causing buildings to "explode").
13. **Overzoom scale affects symbol labels** — MAP_OVERZOOM_SCALE = 5.5 renders the map at 5.5x size then CSS-scales down. Text labels from symbol layers must have their `text-size` multiplied by `overzoomScale` to appear at correct size. Symbol layers are always present (with visibility toggle) rather than conditionally spread — this allows incremental style updates.
14. **Letter spacing uses CSS/canvas em units** — NOT physical space characters. `textLetterSpacing` is in em (0 = font default, 0.3 = poster default). Preview uses CSS `letter-spacing`, export uses `ctx.letterSpacing` with em→px conversion per font size.
15. **Framed layout uses same text overlay** — The `PosterTextOverlay` component renders identically in both full and framed modes. Only the map area changes (gets padding + border). Text Y positions are fixed percentages of poster height.
16. **No GPS on startup** — `useGeolocation` sets London as default without calling `navigator.geolocation`. GPS permission is requested ONLY when the user clicks "Use current location" button (via `useCurrentLocation`).
17. **OpenFreeMap glyphs** — Font glyphs for map labels served at `https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf`. Available: Noto Sans Regular, Bold, Italic. Glyphs URL always included in style spec (not conditional).

## Phase 2 Status: COMPLETE

All milestones done (M1-M5). Zero TS errors. See:
- Spec: `docs/superpowers/specs/2026-04-08-phase2-architecture-and-ux-design.md`
- Handoff: `docs/superpowers/notes/2026-04-08-phase2-session{1,2,3}-handoff.md`

## Phase 3 Status: 3D Isometric Map View — M1-M4 COMPLETE

3D isometric map view using MapLibre native features (zero new dependencies):
- **Approach:** MapLibre `pitch` + `fill-extrusion` buildings + `light` shading
- **Poster stays flat** — only the map content tilts into 3D perspective
- **UI:** "3D" toggle button in bottom notch + "3D View" sidebar section (pitch slider, building toggle, light direction/intensity)
- **MapPreview:** New `pitch`, `lightAzimuth`, `lightIntensity` props; `setPitch()` and `setLight()` for real-time updates
- **Style:** `generateMapStyle()` conditionally emits `fill-extrusion` layer + `light` object when `enable3D` is true
- **Export:** Works automatically — pitch, style (incl. fill-extrusion + light) captured via existing `resolveExportRenderParams()`
- **M5 (future):** Terrain DEM integration (`terrainEnabled`, `terrainExaggeration` fields ready, UI disabled)

See:
- Spec: `docs/superpowers/specs/2026-04-08-phase3-3d-isometric-view-design.md`
- Plan: `docs/superpowers/plans/2026-04-08-phase3-3d-isometric-view.md`
- Handoff: `docs/superpowers/notes/2026-04-09-phase3-session1-handoff.md`

## Phase 3 Session 2: Features & Polish

Completed in a single extended session:
- **Map labels:** Place names, water names, mountain peaks with density slider (OpenFreeMap glyphs)
- **New layers:** Boundary (admin borders), Landcover (forests/grass)
- **Per-element typography:** Independent font size, letter spacing, uppercase for city/country/coords/credits
- **Framed poster layout:** Map in bordered frame with configurable padding + border width
- **Layout rotate:** Swap width↔height button for any layout preset
- **Copy/paste settings:** JSON export/import of full poster configuration
- **Controls cleanup:** Removed redundant zoom, frosted-glass floating bubble, always-visible rotation/pitch sliders
- **Bottom notch inverted:** Dark bg + light text (matches top notch)
- **Default theme → Terracotta**
- **GPS only on click** (no startup permission request)

## TODO / Future Work

- **Terrain DEM** (M5): `terrainEnabled` + `terrainExaggeration` fields ready, UI disabled. Needs DEM tile source evaluation.
- **Framed layout export**: Wire framed layout through PNG/SVG/PDF export pipeline (preview works, export not yet)
- **Text position sliders**: Allow customizing Y-position ratios for text elements in Typography
- **Shareable URL**: Endpoint that opens Plottura with a specific map configuration (copy/paste settings is the precursor)
- **Per-theme typography presets**: Use copy/paste JSON to define default typography for each theme
