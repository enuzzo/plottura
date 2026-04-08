# Phase 3 — 3D Isometric Map View

**Date:** 2026-04-08
**Status:** Approved
**Approach:** MapLibre Native (pitch + fill-extrusion + light + terrain)

---

## Overview

Add an optional 3D isometric view to the poster preview. The poster frame stays flat and upright — only the map content inside tilts into perspective, showing extruded buildings and terrain relief. The aesthetic remains minimal: flat colors from the active theme, no textures, no photorealism. Think "architectural model" or "Google Maps tilt" but with the clean Plottura palette.

## Goals

1. Toggle between 2D (current) and 3D isometric map view
2. 3D buildings extruded with real heights from OpenMapTiles data
3. Terrain/elevation from DEM tiles (separate milestone)
4. Directional lighting with configurable angle and intensity
5. Adjustable pitch (tilt) angle via slider
6. All 3D features respect existing theme colors
7. Export pipeline (PNG/PDF/SVG) captures 3D view at 300 DPI
8. Zero new dependencies — MapLibre v5.19 handles everything natively

## Non-Goals

- Textures or photorealistic materials
- Three.js or Deck.gl integration
- Real cast shadows (MapLibre only supports directional shading)
- 3D globe projection
- Animated transitions between 2D and 3D (nice-to-have, not required)

---

## Architecture

### Technology Choice: MapLibre Native

MapLibre GL JS v5.19 (already in the stack) provides all required 3D features:

| Feature | MapLibre API |
|---|---|
| Camera tilt | `pitch` property (0°–85°) |
| 3D buildings | `fill-extrusion` layer type |
| Building heights | `render_height` / `render_min_height` from OpenMapTiles |
| Lighting | Root `light` object in style spec |
| Terrain | `raster-dem` source + `map.setTerrain()` |

**Why not Three.js or Deck.gl?** The goal is flat-colored minimal volumes — not custom materials, real shadows, or complex 3D geometry. MapLibre does this natively with ~50 lines of style config, zero new dependencies, and automatic integration with the existing tile source, theme system, and export pipeline.

---

## State & Data Model

### New PosterForm Fields

Added to `PosterForm` in `posterReducer.ts`:

```typescript
// ── 3D View ──
enable3D: boolean;              // master toggle (default: false)
mapPitch: string;               // camera tilt "0"–"85" (default: "60")
buildingExtrusion: boolean;     // 3D extruded buildings (default: true)
terrainEnabled: boolean;        // DEM terrain relief (default: false)
terrainExaggeration: string;    // terrain scale "0.5"–"3.0" (default: "1.5")
lightAzimuth: string;           // light direction "0"–"360" (default: "210")
lightIntensity: string;         // light strength "0.0"–"1.0" (default: "0.6")
```

**Conventions followed:**
- String type for numeric fields (matches existing `width`, `height`, `latitude`, `distance`)
- Boolean for on/off toggles (matches `includeBuildings`, `showGradientTop`, etc.)
- `enable3D` as master switch — when off, everything reverts to current 2D behavior (pitch=0, flat fill buildings)

### Behavior Matrix

| enable3D | buildingExtrusion | terrainEnabled | Result |
|---|---|---|---|
| off | — | — | Current 2D flat view (pitch=0, fill layer) |
| on | on | off | Tilted map + extruded buildings + light shading |
| on | off | off | Tilted map only (minimal perspective look) |
| on | on | on | Tilted map + buildings + terrain relief |
| on | off | on | Tilted map + terrain only (mountain posters) |

### Default State

```typescript
enable3D: false,
mapPitch: "60",
buildingExtrusion: true,
terrainEnabled: false,
terrainExaggeration: "1.5",
lightAzimuth: "210",
lightIntensity: "0.6",
```

---

## Map Style & Rendering

### Building Layer: fill → fill-extrusion

In `generateMapStyle()`, when `enable3D && buildingExtrusion`:

**Current (2D):**
```typescript
{
  id: "building",
  type: "fill",
  source: SOURCE_ID,
  "source-layer": "building",
  paint: {
    "fill-color": buildingFill,
    "fill-opacity": 0.84,
  }
}
```

**3D mode:**
```typescript
{
  id: "building-3d",
  type: "fill-extrusion",
  source: SOURCE_ID,
  "source-layer": "building",
  minzoom: buildingMinZoom,
  layout: { visibility: "visible" },
  paint: {
    "fill-extrusion-color": buildingFill,
    "fill-extrusion-height": ["get", "render_height"],
    "fill-extrusion-base": ["get", "render_min_height"],
    "fill-extrusion-opacity": 0.84,
    "fill-extrusion-vertical-gradient": true,
  }
}
```

Key details:
- `render_height` and `render_min_height` come from OpenMapTiles vector tiles (already in OpenFreeMap source)
- `fill-extrusion-vertical-gradient: true` darkens the base of buildings, adding depth
- Same `buildingFill` color derived from theme (blended land + text colors)
- Same `buildingMinZoom` logic applies

### generateMapStyle() Changes

New options added to the function signature:

```typescript
export function generateMapStyle(
  theme: ResolvedTheme,
  options?: {
    // ... existing options ...
    enable3D?: boolean;
    buildingExtrusion?: boolean;
    lightAzimuth?: number;
    lightIntensity?: number;
  },
): StyleSpecification
```

When `enable3D` is true, the returned `StyleSpecification` includes:

1. **Building layer** switches from `fill` to `fill-extrusion` (or hidden if `buildingExtrusion` is false)
2. **Light object** added at root level:

```typescript
light: {
  anchor: "map",           // light rotates with map bearing
  color: "#ffffff",
  intensity: 0.6,          // from options.lightIntensity
  position: [1.15, 210, 30] // [radial, azimuth, polar]
                             // azimuth from options.lightAzimuth
}
```

### Pitch Control in MapPreview

`MapPreview.tsx` gets a new `pitch` prop:

```typescript
interface MapPreviewProps {
  // ... existing props ...
  pitch?: number;  // 0–85, default 0
}
```

- Passed to MapLibre `Map` constructor as initial value
- Synced via `map.setPitch()` when the prop changes
- `PreviewPanel` computes: `pitch = form.enable3D ? Number(form.mapPitch) || 60 : 0`

### Incremental Update Strategy

| Change | Update mechanism |
|---|---|
| Toggle 3D on/off | Full `generateMapStyle()` regeneration (layer type changes) |
| Change pitch | Direct `map.setPitch()` — no style regen |
| Change light angle/intensity | `map.setLight()` — no style regen |
| Change theme colors | Incremental paint diff on `fill-extrusion-color` (existing mechanism) |
| Toggle building extrusion | Full style regen (layer added/removed) |

### Terrain (Milestone 5 — Future)

Terrain requires:
1. A `raster-dem` source added to the style
2. `map.setTerrain({ source: "dem", exaggeration: 1.5 })` call
3. Free DEM tile source evaluation (MapLibre demo tiles vs MapTiler free tier)

This is independent from buildings and shipped separately. The `terrainEnabled` and `terrainExaggeration` fields are in the form from the start but the UI controls are disabled until the DEM source is integrated.

---

## UI Design

### Canvas: 3D Toggle Button

A "3D" button in the **bottom notch** area, next to Recenter and Edit Map:

- Icon: `Box` from lucide-react
- Label: "3D" (when off) / "2D" (when on, to indicate clicking returns to 2D)
- Styled like existing notch buttons: themed `lightestColor` bg, `darkestColor` text, semibold uppercase
- Active state: uses `CTL_BTN_PRIMARY` style (accent color) when 3D is enabled
- Click dispatches `SET_FIELD` for `enable3D`

### Sidebar: "3D View" Accordion Section

New accordion section in `SettingsPanel.tsx`, positioned after "Map Settings":

- Icon: `Box` from lucide-react
- Section title: "3D View"
- **Visible only when `enable3D` is true** (collapsed/hidden when 3D is off — no controls to confuse users in 2D mode)

Controls within the section:

| Control | Type | Field | Range |
|---|---|---|---|
| Pitch | Slider + number | `mapPitch` | 0°–85° |
| Buildings | Switch | `buildingExtrusion` | on/off |
| Terrain | Switch (disabled) | `terrainEnabled` | on/off (disabled until M5) |
| Light Direction | Slider | `lightAzimuth` | 0°–360° |
| Light Intensity | Slider | `lightIntensity` | 0.0–1.0 |

### Floating Controls (Edit Mode)

When both Edit Map and 3D are active, a pitch slider appears in the floating controls area (below the poster), between the zoom slider and the rotation slider. Same styling as existing sliders (`CTL_SLIDER` class).

---

## Export Pipeline

### What Works Automatically

The export pipeline already captures all 3D state:

1. `resolveExportRenderParams()` reads `map.getPitch()` and `map.getBearing()` — ✅ already in place
2. `map.getStyle()` returns the full StyleSpecification including `fill-extrusion` layers and `light` — ✅ already captured
3. Offscreen MapLibre renderer (SVG export) uses the same style → 3D buildings render in the offscreen canvas — ✅ works automatically
4. `compositeExport()` layers map canvas + fades + markers + text — ✅ map canvas already contains the 3D render

### What Needs Verification

- **Fill-extrusion rendering in offscreen context**: MapLibre's WebGL renderer should handle fill-extrusion in the offscreen container, but needs testing at 300 DPI export resolution
- **Gradient fades over 3D map**: The CSS gradient overlays should still work since they're composited on top of the canvas, but visual quality at extreme pitch angles needs verification
- **Marker positioning with pitch**: Markers are projected from lat/lon to screen coordinates — at non-zero pitch, the projection changes. The existing `projectMarkerToCanvas()` may need to account for pitch in the projection math

### Terrain Export (Future)

When terrain is added, the offscreen MapLibre renderer will need the DEM tile source available. The DEM tiles must load before `waitForMapIdle()` resolves — same pattern as vector tiles.

---

## Milestones

### M1: State + Style Generation
- Add 7 new fields to `PosterForm` with defaults
- Update `PosterContext.tsx` with default values
- Extend `generateMapStyle()` with `enable3D`, `buildingExtrusion`, light options
- Add `fill-extrusion` building layer (conditional on `enable3D`)
- Add `light` object to style spec (conditional on `enable3D`)
- Wire new form fields through to `generateMapStyle()` call site

### M2: MapPreview Pitch Integration
- Add `pitch` prop to `MapPreview.tsx`
- Set pitch in MapLibre Map constructor
- Sync pitch changes via `map.setPitch()` effect
- Wire `PreviewPanel.tsx` to pass computed pitch
- Handle `map.setLight()` for dynamic light changes

### M3: UI — Canvas Button + Sidebar Section
- Add "3D" toggle button to bottom notch in `PreviewPanel.tsx`
- Create 3D View sidebar section in `SettingsPanel.tsx` (pitch slider, building toggle, light controls)
- Add pitch slider to floating controls (edit mode)
- Terrain controls present but disabled (greyed out with "Coming soon" label)

### M4: Export Verification
- Test PNG export with 3D view at 300 DPI
- Test SVG export with offscreen 3D render
- Test PDF export with 3D view
- Verify marker projection accuracy at non-zero pitch
- Verify gradient fades render correctly over tilted map
- Fix any issues found

### M5: Terrain DEM Integration (Future)
- Evaluate DEM tile sources (MapLibre demo, MapTiler, AWS)
- Add `raster-dem` source to style generation
- Implement `map.setTerrain()` call with exaggeration
- Enable terrain UI controls in sidebar
- Test terrain + buildings combination
- Test terrain in export pipeline

---

## Files to Modify

| File | Changes |
|---|---|
| `src/features/poster/application/posterReducer.ts` | 7 new PosterForm fields, defaults |
| `src/features/poster/ui/PosterContext.tsx` | Default values for new fields |
| `src/features/map/infrastructure/maplibreStyle.ts` | fill-extrusion layer, light object, new options |
| `src/features/map/ui/MapPreview.tsx` | `pitch` prop, `setPitch()` sync, `setLight()` |
| `src/features/poster/ui/PreviewPanel.tsx` | 3D button in bottom notch, pitch wiring |
| `src/features/poster/ui/MapPrimaryControls.tsx` | 3D toggle button component |
| `src/features/poster/ui/SettingsPanel.tsx` | New "3D View" accordion section |
| `src/features/export/application/useExport.ts` | Pass 3D-related fields through export options |
| `src/features/poster/domain/types.ts` | ExportOptions: new 3D fields |

---

## Gotchas & Risks

1. **fill-extrusion changes layer type** — cannot incrementally update from `fill` to `fill-extrusion`. Toggling 3D requires full style regeneration, not incremental diff. The existing `applyIncrementalStyleUpdate` handles layer additions/removals by falling through to `setStyle()`.

2. **Marker projection at pitch** — at high pitch angles, the map's vanishing point compresses distant areas. Markers placed far from center may appear distorted. Need to verify the projection math handles this correctly.

3. **Gradient fades at extreme pitch** — the top gradient fade hides the "horizon" edge where the tilted map meets the poster boundary. This is actually beneficial — it creates a natural fade-out. But the gradient height may need adjustment at high pitch values.

4. **Building data availability** — not all areas have `render_height` data in OpenMapTiles. Buildings without height data should fall back to a default height (e.g., 10m). Use MapLibre expression: `["coalesce", ["get", "render_height"], 10]`.

5. **Performance** — fill-extrusion is GPU-intensive. At dense zoom levels with many buildings, performance may degrade on low-end devices. Consider a building count threshold or LOD strategy if this becomes an issue.

6. **DEM tile source for terrain** — free, high-quality DEM tiles are limited. MapLibre demo tiles are low resolution. MapTiler free tier has rate limits. AWS Terrain Tiles require an API key. This is why terrain is a separate milestone.
