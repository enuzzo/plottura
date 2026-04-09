# Phase 3 Session 1 — Handoff Notes

**Date:** 2026-04-09
**Branch:** main
**What was done:** Phase 3 Milestones 1–4 completed — 3D isometric map view with MapLibre native features

---

## Completed

### Milestone 1 — State + Style Generation

- Added 7 new fields to `PosterForm`: `enable3D`, `mapPitch`, `buildingExtrusion`, `terrainEnabled`, `terrainExaggeration`, `lightAzimuth`, `lightIntensity`
- Extended `generateMapStyle()` with `enable3D`, `buildingExtrusion`, `lightAzimuth`, `lightIntensity` options
- When `enable3D` is true: building layer switches from `fill` (id: `building`) to `fill-extrusion` (id: `building-3d`)
- `fill-extrusion` uses `render_height` from OpenMapTiles with fallback to 10m via `["coalesce", ["get", "render_height"], 10]`
- `fill-extrusion-vertical-gradient: true` for depth shading
- Root `light` object added to style spec with configurable azimuth and intensity

### Milestone 2 — MapPreview Pitch Integration

- Added `pitch`, `lightAzimuth`, `lightIntensity` props to `MapPreview.tsx`
- Pitch set in Map constructor and synced via `map.setPitch()` effect
- Light synced via `map.setLight()` effect (no style regen needed for light changes)
- `maxPitch: 85` set in Map constructor
- Layer-aware incremental style update: detects layer ID changes and falls through to `setStyle()` when building layer switches between 2D/3D

### Milestone 3 — UI Controls

- **Bottom notch:** New "3D" toggle button (lucide `Box` icon) in `MapPrimaryControls.tsx`. Shows "3D" when off, "2D" when on. Wired via both notch instances (desktop bottom + editing controls).
- **Sidebar:** New "3D View" accordion section in `SettingsPanel.tsx`, visible only when `enable3D` is true. Contains:
  - Pitch slider (0°–85°)
  - Buildings toggle (`buildingExtrusion`)
  - Terrain toggle (disabled, "coming soon" label)
  - Light direction slider (0°–360°)
  - Light intensity slider (0.0–1.0)
- **Floating controls:** Pitch slider appears in edit mode floating controls when 3D is active

### Milestone 4 — Export Verification

- Export pipeline already captures pitch via `map.getPitch()` in `resolveExportRenderParams()`
- Full style (including `fill-extrusion` and `light`) captured via `map.getStyle()`
- Offscreen MapLibre renderer uses same style and pitch — 3D renders in export automatically
- No code changes needed

---

## Files Modified

| File | Change |
|---|---|
| `src/features/poster/application/posterReducer.ts` | 7 new PosterForm fields |
| `src/features/poster/ui/PosterContext.tsx` | Default values + 3D options wired to generateMapStyle |
| `src/features/map/infrastructure/maplibreStyle.ts` | fill-extrusion layer, light object, 3D options |
| `src/features/map/ui/MapPreview.tsx` | pitch/light props, setPitch/setLight effects, layer-aware style diff |
| `src/features/poster/ui/PreviewPanel.tsx` | pitch wiring, 3D toggle handler, light props, pitch slider in floating controls |
| `src/features/poster/ui/MapPrimaryControls.tsx` | 3D toggle button (Box icon) |
| `src/features/poster/ui/SettingsPanel.tsx` | 3D View sidebar section |
| `CLAUDE.md` | Updated with Phase 3 docs |

---

## Architecture Notes

### 3D Toggle Flow

1. User clicks "3D" button → `dispatch({ type: "SET_FIELD", name: "enable3D", value: true })`
2. `PosterContext` recomputes `mapStyle` with `enable3D: true` → `generateMapStyle()` emits `fill-extrusion` + `light`
3. `MapPreview` receives new style → detects layer ID change → `setStyle()` full swap
4. `MapPreview` receives `pitch={60}` → `setPitch(60)` tilts the camera
5. Building layer renders as 3D extrusions with directional light shading

### Light Updates (No Style Regen)

Light changes go through `map.setLight()` directly, bypassing style regeneration. This avoids tile reloads and gives smooth real-time slider control.

### Layer ID Detection

When toggling 3D, the building layer changes from `id: "building"` (fill) to `id: "building-3d"` (fill-extrusion). The incremental style updater now compares layer IDs and falls through to `setStyle()` when they don't match.

---

## Future Work

### M5 — Terrain DEM Integration
- `terrainEnabled` and `terrainExaggeration` fields are in the form with defaults
- UI controls are present but disabled ("coming soon")
- Needs: DEM tile source evaluation (MapLibre demo tiles, MapTiler, AWS)
- Implementation: `raster-dem` source + `map.setTerrain()` call

### Potential Improvements
- Animated transition between 2D and 3D (smooth pitch animation)
- Building height multiplier slider for artistic control
- Light color control (currently hardcoded to white)
- Sky/atmosphere effect at high pitch angles

---

## Phase 3 Status: M1–M4 COMPLETE

Zero TS errors. 3D isometric map view working with buildings, pitch control, and lighting. Export captures 3D state automatically. Terrain (M5) ready for future integration.
