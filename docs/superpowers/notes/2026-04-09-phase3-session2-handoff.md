# Phase 3 Session 2 — Handoff Notes

**Date:** 2026-04-09
**Branch:** main
**What was done:** Extended session — 3D polish, map labels, typography, framed layout, UX cleanup, code review

---

## Completed

### 3D View Fixes
- Buildings forced visible when 3D + buildingExtrusion on (includeBuildings was false by default)
- Building height capped at 200m (`["min", ..., 200]`) to prevent OSM data errors
- Bottom notch no longer hidden during editing — always visible
- Floating controls in frosted-glass bubble (bg-white/80 backdrop-blur-sm rounded-xl)
- Rotation slider always visible in edit mode (removed Enable Rotation toggle)
- Pitch slider visible when 3D active
- "Reset View" button (resets to north + 60° pitch)
- Poster raised (74vh + 100px bottom padding) for control space

### Map Labels (Place Names, Water, Peaks)
- Place names: city/town/village from OpenMapTiles `place` source-layer
- Water names: lake/sea/ocean in italic from `water_name` source-layer
- Mountain peaks: name + elevation from `mountain_peak` source-layer
- Density slider (1–16) controls place label filtering by rank
- OpenFreeMap glyph server: Noto Sans Regular/Bold/Italic
- Text sizes multiplied by overzoomScale (5.5x) — critical fix for visibility
- Labels always present in style with visibility toggle (not conditional spread)

### New Map Layers
- **Boundary**: Admin borders (country + state), dashed line, toggleable
- **Landcover**: Forests, grass, farmland as subtle background fill

### Typography Customization
- Letter spacing: real CSS `letter-spacing` in `em` units (not physical spaces)
- Range: -0.1em to 0.5em, default 0.3em
- Per-element controls: city (size + spacing + uppercase), country (size + uppercase), coordinates (size + spacing), credits (size)
- "Customize text" collapsible panel with section headers
- Reset to defaults button

### Framed Poster Layout
- "Framed layout" toggle in Map Settings
- Map in bordered rectangle with configurable padding (2–15%) and border width (0–6px)
- Same `PosterTextOverlay` component in both modes — identical text
- Frame bottom edge at `(1 - TEXT_CITY_Y_RATIO + 0.045) * 100%` — always above text start
- Tested across 7 aspect ratios: A4, iPhone, Square, 16:9, 21:9, 4:1, 7.5:1

### Layout Rotate
- Rotate button (RotateCw icon) next to layout name in Layout section
- Swaps width↔height, switches to custom layout

### Other Features
- Copy/paste settings (JSON with `_plottura: "1.0"` marker) in sidebar footer
- Default theme changed to Terracotta
- Bottom notch inverted colors (dark bg, light text — matches top notch)
- GPS permission only on "Use current location" click (removed startup geolocation)
- Renamed "Overlay layer" to "Show markers"

### Code Review & Cleanup
- Fixed falsy-value traps: `Number(x) || fallback` → `Number.isFinite(Number(x)) ? Number(x) : fallback`
- Removed dead code: `letterSpacingToEm`, `handleRotateBy`, unused `isLatinScript` import
- Fixed stale closure: added `form.enable3D`, `form.mapPitch` to `handleRecenter` deps
- Framed layout bottom edge references `TEXT_CITY_Y_RATIO` constant (not magic number)

---

## Files Modified (28 files)

| File | Change |
|---|---|
| `CLAUDE.md` | Full rewrite with all session features |
| `src/features/poster/application/posterReducer.ts` | Typography, framed layout, label fields |
| `src/features/poster/ui/PosterContext.tsx` | Defaults, MAP_OVERZOOM_SCALE import, memo deps |
| `src/features/poster/ui/PreviewPanel.tsx` | Framed layout, controls cleanup, numOrDefault helper |
| `src/features/poster/ui/PosterTextOverlay.tsx` | Per-element typography props |
| `src/features/poster/ui/SettingsPanel.tsx` | 3D View section, framed layout controls |
| `src/features/poster/ui/TypographySection.tsx` | Per-element customize panel, SliderRow component |
| `src/features/poster/ui/MapPrimaryControls.tsx` | 3D toggle, inverted notch colors |
| `src/features/poster/domain/textLayout.ts` | formatCityLabel params, removed letterSpacingToEm |
| `src/features/poster/domain/types.ts` | ExportOptions typography + framed fields |
| `src/features/poster/infrastructure/renderer/typography.ts` | Per-element params, ctx.letterSpacing |
| `src/features/poster/infrastructure/renderer/index.ts` | Wire new params |
| `src/features/map/infrastructure/maplibreStyle.ts` | Labels, boundary, landcover, overzoom, height cap |
| `src/features/map/ui/MapPreview.tsx` | Pitch/light props, layer-aware style diff |
| `src/features/map/ui/LayersSection.tsx` | New toggles, density slider |
| `src/features/map/application/useGeolocation.ts` | No GPS on startup |
| `src/features/export/application/useExport.ts` | Wire typography + framed fields |
| `src/features/export/infrastructure/layeredSvgExporter.ts` | Wire typography fields |
| `src/features/layout/ui/LayoutSection.tsx` | Rotate button |
| `src/features/theme/infrastructure/themeRepository.ts` | Default → Terracotta |
| `src/components/sidebar/SidebarFooter.tsx` | Copy/paste settings |

---

## Architecture Notes

### Overzoom Scale + Symbol Labels
MAP_OVERZOOM_SCALE = 5.5 means MapLibre renders at 5.5x the visible size, then CSS scales down. Symbol layer text-size must be multiplied by overzoomScale or labels are invisible. Symbol layers are always in the style (with visibility toggle) to enable incremental updates.

### Falsy-Value Pattern
PosterForm stores numbers as strings. `Number("0")` is `0` which is falsy. `Number(x) || fallback` prevents users from setting values to 0. Always use `Number.isFinite(Number(x)) ? Number(x) : fallback`. PreviewPanel has a `numOrDefault()` helper.

### Framed Layout Rule
Frame bottom = `(1 - TEXT_CITY_Y_RATIO + 0.045) * 100%` from poster bottom. This guarantees ~4.5% gap between frame edge and text start at Y=84.5%, independent of aspect ratio.

---

## Status

Phase 3 M1-M4 + Session 2 features: COMPLETE. Zero TS errors. Build clean.
