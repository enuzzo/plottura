# Phase 3 M5 — Terrain 3D Design

**Date:** 2026-04-10
**Status:** Design approved, ready for implementation plan
**Scope:** Enable DEM-backed terrain (3D mesh + hillshade) in Plottura, completing Phase 3.

---

## Context

Phase 3 M1–M4 shipped 3D isometric view using MapLibre's `pitch` + `fill-extrusion` + `light`. The M5 milestone adds actual terrain elevation: mountains rise, valleys sink, and the map surface gains shaded relief.

The form fields `terrainEnabled: boolean` and `terrainExaggeration: string` are already present in `PosterForm` (`posterReducer.ts:70-71`, `PosterContext.tsx:104-105`). The UI stub in `SettingsPanel.tsx:277-283` shows a disabled "(coming soon)" switch.

## Decisions

### DEM Source
**AWS Terrarium (Mapzen Open Terrain Tiles)**

- URL: `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png`
- Encoding: `terrarium` (native MapLibre support)
- `tileSize: 256`, `maxzoom: 15`
- Free, no API key, global coverage, CORS enabled
- Hosted as AWS Open Data (public dataset, no rate limit)
- Consistent with the key-less / friction-free spirit of OpenFreeMap

Rejected alternatives:
- **MapTiler Terrain-RGB**: requires API key, breaks the GitHub Pages zero-config deploy. Could be added later as optional premium source.
- **MapLibre demo tiles**: explicitly "demo only, not for production".

### Feature Scope
Both **3D mesh deformation** AND **hillshade raster layer**, coupled together:

- Mesh (`map.setTerrain(...)`) provides real 3D elevation when pitched
- Hillshade layer provides shaded relief visible at any pitch, including flat 2D
- Single toggle (`terrainEnabled`) controls both

Terrain is independent of the existing `enable3D` toggle: a user can have hillshade in flat 2D without ever pitching the map.

### Lighting Coherence
Hillshade illumination is bound to the **existing** `lightAzimuth` and `lightIntensity` sliders, which already drive `fill-extrusion` buildings. No new controls.

Hillshade paint:
- `hillshade-illumination-direction` ← `form.lightAzimuth`
- `hillshade-illumination-anchor: "map"` (rotates with bearing, matches buildings)
- `hillshade-exaggeration` ← function of `form.lightIntensity`
- `hillshade-shadow-color` ← derived from `theme.ui.text` (soft dark tone)
- `hillshade-highlight-color` ← derived from `theme.map.land` (lightened)
- `hillshade-accent-color: transparent`

Result: buildings and hillshade cast coherent shadows from the same virtual light source, and the whole terrain tints automatically with theme changes.

## Architecture

### Style Generation (`maplibreStyle.ts`)

1. Add a `raster-dem` source `terrain-dem` **unconditionally** (always in style, matching the pattern used for symbol label layers to enable incremental updates).
2. Add a `hillshade` layer inserted **under** landcover/parks/water so that roads, buildings, and labels sit on top.
3. Layer visibility toggled by `terrainEnabled`; paint properties derived from theme + light settings.

### Runtime Updates (`MapPreview.tsx`)

- New props: `terrainEnabled`, `terrainExaggeration`
- New effect: when these change, call `map.setTerrain({ source: "terrain-dem", exaggeration })` or `map.setTerrain(null)` — direct API call, no style regen.
- Hillshade visibility toggle handled via the existing `applyIncrementalStyleUpdate()` path (paint/layout diff).

### UI (`SettingsPanel.tsx`, 3D View section)

- Remove the disabled stub. Add:
  - **Switch "Terrain"** → `form.terrainEnabled`
  - **Slider "Exaggeration"** (range 0.5–3, step 0.1, default 1.5), visible only when terrain is on → `form.terrainExaggeration`
- No separate hillshade controls. Light direction/intensity already present in the same section drive both.

### Export

**PNG / PDF (canvas capture path):** Works automatically. `compositeExport()` copies the MapLibre canvas, which already contains terrain mesh + hillshade as rendered. No changes beyond propagating the params.

**SVG (`layeredSvgExporter.ts`):** Hillshade is a normal map layer — the per-layer loop captures it like any other. **Terrain mesh is explicitly disabled on the offscreen export map**, even when `terrainEnabled` is true:

- Reason: the layered SVG exporter works by toggling layers on/off and rasterizing each. With mesh terrain active, every layer PNG contains the same 3D deformation, which defeats the "editable layered SVG" value proposition (layers can't be re-composited flat in Illustrator) and produces heavier files with transparent voids where the mesh drops.
- Implementation: in the offscreen map clone, skip `setTerrain()` regardless of form state. Hillshade paint stays on. Pitch and fill-extrusion buildings stay active as today.
- **UX**: when the user triggers SVG export with `terrainEnabled` on, show a toast/notice:
  > "SVG export includes terrain shading (hillshade), but not 3D elevation. Use PNG or PDF for full 3D terrain."
  This keeps the behavior silent-but-discoverable rather than mysterious.

Required param threading:
- `types.ts` → add `terrainEnabled`, `terrainExaggeration` to `ExportOptions`
- `useExport.ts` → wire form fields into both PNG/PDF and SVG paths
- `exportUtils.ts` / `resolveExportRenderParams()` → include terrain params
- `layeredSvgExporter.ts` → receive params, but apply only hillshade (no `setTerrain()` on clone)
- Canvas-capture path (`compositeExport`) needs no signature changes — it reads from the live `map`

### Attribution

Add "Terrain: Mapzen / AWS Open Data" to the credits footer text when `terrainEnabled` is true. Alternative: always include it alongside the OSM badge text — decide during impl based on visual density.

## Files Modified

| File | Change |
|---|---|
| `src/features/map/infrastructure/maplibreStyle.ts` | Add `terrain-dem` source + `hillshade` layer; theme-derived paint; light binding |
| `src/features/map/ui/MapPreview.tsx` | New props; `setTerrain()` effect |
| `src/features/poster/ui/SettingsPanel.tsx` | Remove disabled stub; terrain switch + exaggeration slider |
| `src/features/poster/domain/types.ts` | `ExportOptions` gains terrain fields |
| `src/features/export/application/useExport.ts` | Propagate terrain params to both export paths; toast on SVG + terrain combo |
| `src/features/export/infrastructure/exportUtils.ts` | `resolveExportRenderParams` returns terrain params |
| `src/features/export/infrastructure/layeredSvgExporter.ts` | Accept terrain params; do NOT call `setTerrain` on offscreen clone |
| `src/features/poster/infrastructure/renderer/typography.ts` | Attribution string update (if approach A) |
| `CLAUDE.md` | Document M5 complete, hillshade coupling, SVG caveat |

## Edge Cases

- **Terrain on + pitch 0 + 3D off**: mesh invisible, hillshade visible. Intended.
- **Terrain off + 3D on**: buildings extrude over a flat (non-elevated) ground. Intended — terrain is independent of the 3D toggle.
- **Theme change while terrain on**: hillshade colors re-derive on style regen. Already covered by the theme-change path that calls `setStyle()`.
- **Dark themes**: hillshade shadow/highlight must make sense for both light and dark palettes. Verify during impl; may need per-theme adjustment or clamping.
- **Building height cap + terrain**: `fill-extrusion` base is ground level. With terrain, buildings correctly sit on the deformed surface (MapLibre handles this). Existing 200m height cap unaffected.
- **Incremental style diff + new source**: adding `terrain-dem` as a new source means the first time the feature lands, every client needs a full `setStyle()` — `applyIncrementalStyleUpdate()` doesn't diff sources. Since the source is added unconditionally in the style generator from day one, this is a non-issue post-deploy; existing users just get one full style swap on upgrade.

## Out of Scope (Deferred)

- **MapTiler Terrain-RGB** as alternative source (future enhancement, not M5)
- **Contour lines** (separate feature, distinct layer)
- **Per-element hillshade opacity slider** (YAGNI — reuses light intensity)
- **SVG export of terrain mesh** (deliberate — explained above)
- **Terrain preset per theme** (could come later via copy/paste settings)

## Success Criteria

1. Toggling "Terrain" in 3D View section shows hillshade instantly in preview.
2. Pitching the map with terrain on shows real elevation (mountains rise).
3. Light direction slider rotates hillshade shadows coherently with building shadows.
4. Theme changes retint the hillshade automatically.
5. PNG/PDF export reproduces terrain + hillshade identically to preview.
6. SVG export reproduces hillshade only, shows the informational toast when terrain was enabled, and contains no terrain-deformed layer PNGs.
7. Zero TypeScript errors; zero new runtime dependencies.
8. Works on the GitHub Pages deploy with no configuration.
