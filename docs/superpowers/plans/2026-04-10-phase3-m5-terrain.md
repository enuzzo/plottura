# Phase 3 M5 — Terrain 3D Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add DEM-backed terrain (3D mesh + hillshade raster) to Plottura, coupling hillshade illumination to the existing light controls, and documenting the SVG export caveat.

**Architecture:** `raster-dem` source (AWS Terrarium) added unconditionally to every generated style, with a `hillshade` layer drawn above landcover and below water/roads/labels, and visibility toggled by `terrainEnabled`. 3D mesh deformation is applied via `map.setTerrain()` as a runtime effect in `MapPreview.tsx` — never baked into the generated style — so incremental style diffs still work. SVG export deliberately strips `style.terrain` on the offscreen clone so per-layer PNGs remain flat.

**Tech Stack:** MapLibre GL JS v5, AWS Terrarium DEM tiles, TypeScript, React, Tailwind. Zero new runtime dependencies.

**Testing approach:** This project has no unit test framework. Every task verifies via `bun run typecheck` and manual checks against `bun run dev` / preview server. Each task that changes user-visible behavior ends with a concrete preview-server assertion.

---

## File Structure

New files: **none**.

Modified files:

| File | Responsibility |
|---|---|
| `src/features/map/infrastructure/maplibreStyle.ts` | Add `terrain-dem` source + `hillshade` layer; accept `terrainEnabled` option; derive hillshade paint from theme + light |
| `src/features/poster/ui/PosterContext.tsx` | Forward `terrainEnabled` into `generateMapStyle()`; include in memo deps |
| `src/features/map/ui/MapPreview.tsx` | New `terrainEnabled` / `terrainExaggeration` props; effect calling `map.setTerrain()` |
| `src/features/poster/ui/PreviewPanel.tsx` | Thread terrain props into both `<MapPreview>` sites (full + framed) |
| `src/features/poster/ui/SettingsPanel.tsx` | Replace disabled "Terrain (coming soon)" stub with real switch + conditional exaggeration slider |
| `src/features/poster/domain/types.ts` | Extend `ExportOptions` with `terrainEnabled` / `terrainExaggeration` |
| `src/features/export/application/useExport.ts` | Pass terrain fields to SVG path; `window.alert` notice when SVG + terrain; pass fields to `compositeExport` for completeness |
| `src/features/export/infrastructure/layeredSvgExporter.ts` | Accept `terrainEnabled` / `terrainExaggeration` params; strip `style.terrain` on the offscreen clone so per-layer PNGs stay flat |
| `src/features/poster/infrastructure/renderer/typography.ts` | Append "Terrain: Mapzen / AWS Open Data" to OSM attribution string when `terrainEnabled` is true |
| `CLAUDE.md` | Document M5 complete, hillshade/light coupling, SVG caveat, attribution rule |

---

## Task 1: Add terrain-dem source + hillshade layer to `generateMapStyle()`

**Files:**
- Modify: `src/features/map/infrastructure/maplibreStyle.ts`

- [ ] **Step 1: Add top-of-file constants for the DEM source**

Below the existing `OPENFREEMAP_GLYPHS` / `SOURCE_ID` constants (around line 6–11), add:

```ts
const TERRAIN_SOURCE_ID = "terrain-dem";
const TERRAIN_TILE_URL =
  "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png";
const TERRAIN_TILE_SIZE = 256;
const TERRAIN_MAX_ZOOM = 15;
```

- [ ] **Step 2: Extend the `options` parameter with a `terrainEnabled` flag**

In the `generateMapStyle(theme, options?)` signature (around line 193), add `terrainEnabled?: boolean;` to the options object type alongside `buildingExtrusion` / `lightAzimuth` / `lightIntensity`.

Then in the defaults block (around line 227–247) add:

```ts
const terrainEnabled = options?.terrainEnabled ?? false;
```

- [ ] **Step 3: Add the `terrain-dem` source unconditionally**

In the `sources` object of the returned style (around line 316–322), add the Terrarium source alongside the existing OpenFreeMap source so it's present in every style (matching the "always present, toggle visibility" pattern used for label layers):

```ts
sources: {
  [SOURCE_ID]: {
    type: "vector",
    url: OPENFREEMAP_SOURCE,
    maxzoom: SOURCE_MAX_ZOOM,
  },
  [TERRAIN_SOURCE_ID]: {
    type: "raster-dem",
    tiles: [TERRAIN_TILE_URL],
    tileSize: TERRAIN_TILE_SIZE,
    maxzoom: TERRAIN_MAX_ZOOM,
    encoding: "terrarium",
    attribution:
      "Terrain © <a href='https://registry.opendata.aws/terrain-tiles/'>Mapzen / AWS Open Data</a>",
  },
},
```

- [ ] **Step 4: Insert the `hillshade` layer after `landcover`, before `park`**

The hillshade layer must be drawn on top of the solid land/landcover fill but under parks, water, roads, buildings, and labels — this way shaded relief reads over raw terrain but never obscures the vector features. Insert it immediately **after** the `landcover` layer object and **before** the `park` layer object (around line 350, between the two):

```ts
// Hillshade: shaded relief from terrain-dem. Always present in the style;
// visibility is toggled by terrainEnabled. Paint properties are bound to
// the same light azimuth/intensity sliders that drive 3D buildings, so
// building shadows and terrain shadows stay coherent.
{
  id: "hillshade",
  source: TERRAIN_SOURCE_ID,
  type: "hillshade" as const,
  layout: {
    visibility: terrainEnabled ? ("visible" as const) : ("none" as const),
  },
  paint: {
    "hillshade-illumination-direction": lightAzimuth,
    "hillshade-illumination-anchor": "map" as const,
    "hillshade-exaggeration": Math.max(0.15, Math.min(1, lightIntensity * 0.85 + 0.15)),
    "hillshade-shadow-color": blendHex(
      theme.ui.text || "#111111",
      theme.map.land || "#ffffff",
      0.55,
    ),
    "hillshade-highlight-color": blendHex(
      theme.map.land || "#ffffff",
      "#ffffff",
      0.35,
    ),
    "hillshade-accent-color": "rgba(0,0,0,0)",
  },
},
```

Rationale for each paint value:
- `illumination-direction`: shares the existing `lightAzimuth` (0–360) driving building `light.position`
- `illumination-anchor: "map"` rotates shadows with bearing so they stay consistent when the user rotates the poster
- `exaggeration` maps the `lightIntensity` slider (0–1) into a reasonable hillshade range (≈0.15–1.0), with a floor so shadows never disappear entirely
- `shadow-color` is a darkened blend of text and land — reads as soft dark tone that works against any theme's land color
- `highlight-color` is a slightly whitened land color — subtle bloom on lit faces without blowing out
- `accent-color: transparent` disables the fringe color (usually too punchy against vector map backgrounds)

- [ ] **Step 5: Verify types and that the style still compiles**

Run: `bun run typecheck`
Expected: `tsc --noEmit` exits 0, no new errors.

- [ ] **Step 6: Commit**

```bash
git add src/features/map/infrastructure/maplibreStyle.ts
git commit -m "feat(map): add terrain-dem source + hillshade layer to style generator"
```

---

## Task 2: Thread `terrainEnabled` through `PosterContext` mapStyle memo

**Files:**
- Modify: `src/features/poster/ui/PosterContext.tsx`

- [ ] **Step 1: Pass `terrainEnabled` into `generateMapStyle()`**

In the `mapStyle` `useMemo` (around line 220), add `terrainEnabled: state.form.terrainEnabled,` to the options object alongside `buildingExtrusion` / `lightAzimuth` / `lightIntensity`.

The block becomes:

```ts
const mapStyle = useMemo(
  () =>
    generateMapStyle(effectiveTheme, {
      includeBuildings: state.form.includeBuildings,
      // … all existing options …
      enable3D: state.form.enable3D,
      buildingExtrusion: state.form.buildingExtrusion,
      terrainEnabled: state.form.terrainEnabled,
      lightAzimuth: Number(state.form.lightAzimuth) || 210,
      lightIntensity: Number(state.form.lightIntensity) || 0.6,
    }),
  [
    effectiveTheme,
    // … all existing deps …
    state.form.enable3D,
    state.form.buildingExtrusion,
    state.form.terrainEnabled,
    state.form.lightAzimuth,
    state.form.lightIntensity,
  ],
);
```

- [ ] **Step 2: Typecheck**

Run: `bun run typecheck`
Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/poster/ui/PosterContext.tsx
git commit -m "feat(poster): forward terrainEnabled flag into map style generator"
```

---

## Task 3: Add `terrainEnabled` / `terrainExaggeration` props + `setTerrain` effect to `MapPreview`

**Files:**
- Modify: `src/features/map/ui/MapPreview.tsx`

- [ ] **Step 1: Extend the `MapPreviewProps` interface**

In the interface around line 78, add two optional props:

```ts
interface MapPreviewProps {
  style: StyleSpecification;
  center: [lon: number, lat: number];
  zoom: number;
  pitch?: number;
  lightAzimuth?: number;
  lightIntensity?: number;
  terrainEnabled?: boolean;
  terrainExaggeration?: number;
  mapRef: MapInstanceRef;
  // … rest unchanged …
}
```

- [ ] **Step 2: Destructure the new props in the component signature**

Update the destructuring at line 103 to include the new props with defaults:

```ts
export default function MapPreview({
  style,
  center,
  zoom,
  pitch = 0,
  lightAzimuth,
  lightIntensity,
  terrainEnabled = false,
  terrainExaggeration = 1.5,
  mapRef,
  interactive = false,
  // … rest unchanged …
}: MapPreviewProps) {
```

- [ ] **Step 3: Add a `setTerrain` effect after the light effect (around line 296)**

Insert a new effect after the existing `useEffect` that calls `map.setLight()`:

```ts
useEffect(() => {
  const map = mapRef.current;
  if (!map) return;

  const applyTerrain = () => {
    if (terrainEnabled) {
      map.setTerrain({
        source: "terrain-dem",
        exaggeration: terrainExaggeration,
      });
    } else {
      map.setTerrain(null);
    }
  };

  // The terrain source must exist in the current style before setTerrain
  // can attach to it. On the very first render, or immediately after a
  // full setStyle(), the style may still be loading.
  if (map.isStyleLoaded()) {
    applyTerrain();
    return;
  }

  const onLoad = () => applyTerrain();
  map.once("load", onLoad);
  return () => {
    map.off("load", onLoad);
  };
}, [terrainEnabled, terrainExaggeration, style, mapRef]);
```

The `style` dep ensures that when a full `setStyle()` swap happens (e.g. theme change), the effect re-runs and re-attaches terrain on top of the freshly loaded style. Without it, a theme change would silently drop terrain.

- [ ] **Step 4: Typecheck**

Run: `bun run typecheck`
Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git add src/features/map/ui/MapPreview.tsx
git commit -m "feat(map): add terrainEnabled/terrainExaggeration props with setTerrain effect"
```

---

## Task 4: Pass terrain props from `PreviewPanel` to both `MapPreview` sites

**Files:**
- Modify: `src/features/poster/ui/PreviewPanel.tsx`

- [ ] **Step 1: Add `terrainEnabled` and `terrainExaggeration` to both `<MapPreview>` invocations**

There are two sites in `PreviewPanel.tsx` (around lines 390 and 429 — the framed layout and the full layout). For each, add the two new props right after `lightIntensity`:

```tsx
<MapPreview
  style={mapStyle}
  center={mapCenter}
  zoom={mapZoom}
  pitch={mapPitch}
  lightAzimuth={form.enable3D ? numOrDefault(form.lightAzimuth, 210) : undefined}
  lightIntensity={form.enable3D ? numOrDefault(form.lightIntensity, 0.6) : undefined}
  terrainEnabled={form.terrainEnabled}
  terrainExaggeration={numOrDefault(form.terrainExaggeration, 1.5)}
  mapRef={mapRef}
  // … rest unchanged …
/>
```

Note: unlike `lightAzimuth`/`lightIntensity`, terrain is NOT gated on `form.enable3D`. A user can turn on hillshade in flat 2D mode. That's by design per the spec.

- [ ] **Step 2: Typecheck**

Run: `bun run typecheck`
Expected: 0 errors.

- [ ] **Step 3: Start the preview server and verify hillshade is hidden by default**

Run the preview server via `preview_start` (or `bun run dev` if running manually). Open the app. Without toggling anything, the map should look identical to before this change — the `terrain-dem` source is present in the style but the hillshade layer visibility is `"none"` and `setTerrain` is null.

Use `preview_console_logs` filtered for `error|warning` to confirm no new MapLibre source/tile errors.

- [ ] **Step 4: Commit**

```bash
git add src/features/poster/ui/PreviewPanel.tsx
git commit -m "feat(poster): thread terrain props into map preview components"
```

---

## Task 5: Replace the disabled Terrain stub in `SettingsPanel` with a working switch + exaggeration slider

**Files:**
- Modify: `src/features/poster/ui/SettingsPanel.tsx`

- [ ] **Step 1: Replace the disabled stub (lines 277–283)**

Find this block:

```tsx
<div className="flex items-center justify-between opacity-50 cursor-not-allowed">
  <span className="text-base text-text-secondary">
    Terrain{" "}
    <span className="text-xs text-text-muted">(coming soon)</span>
  </span>
  <Switch checked={false} disabled />
</div>
```

Replace it with a real switch plus a conditional exaggeration slider that only appears when terrain is on. Use the same visual pattern as the existing Light direction / Light intensity slider blocks below it:

```tsx
<div className="flex items-center justify-between">
  <span className="text-base text-text-secondary">Terrain</span>
  <Switch
    checked={Boolean(state.form.terrainEnabled)}
    onCheckedChange={(checked) => {
      dispatch({
        type: "SET_FIELD",
        name: "terrainEnabled",
        value: checked,
      });
    }}
  />
</div>

{state.form.terrainEnabled ? (
  <div className="flex flex-col gap-1.5">
    <div className="flex items-center justify-between">
      <span className="text-base text-text-secondary">Exaggeration</span>
      <span className="text-sm text-text-muted tabular-nums">
        {(Number.isFinite(Number(state.form.terrainExaggeration))
          ? Number(state.form.terrainExaggeration)
          : 1.5
        ).toFixed(1)}
        ×
      </span>
    </div>
    <input
      type="range"
      min={0.5}
      max={3}
      step={0.1}
      value={
        Number.isFinite(Number(state.form.terrainExaggeration))
          ? Number(state.form.terrainExaggeration)
          : 1.5
      }
      onChange={(e) =>
        dispatch({
          type: "SET_FIELD",
          name: "terrainExaggeration",
          value: e.target.value,
        })
      }
      className="w-full accent-accent"
    />
  </div>
) : null}
```

Note the `Number.isFinite(Number(x)) ? Number(x) : fallback` pattern — per CLAUDE.md gotcha #8, never use `Number(x) || fallback` because the 0 case would trigger the fallback.

- [ ] **Step 2: Typecheck**

Run: `bun run typecheck`
Expected: 0 errors.

- [ ] **Step 3: Manual verification in preview server**

Run the preview server. Open the sidebar → 3D View section.

Verify:
1. The "Terrain" row now has an enabled switch (no "(coming soon)" label).
2. Toggling it on: hillshade appears on the map — shaded relief is visible as soft darker regions on mountainous terrain. Try zooming into a mountainous area (e.g., set location to "Chamonix" or "Zermatt") to clearly see hillshade.
3. With terrain on and `enable3D` also on, pitching the map (use the pitch slider) makes mountains rise — real 3D elevation.
4. The exaggeration slider only appears when terrain is on. Dragging it updates the mesh height in real time.
5. Rotating the `lightAzimuth` slider moves the hillshade shadows coherently with building shadows (both driven by the same azimuth).
6. Toggling terrain off: hillshade disappears and mesh flattens.

Use `preview_console_logs` filtered on `error|warn` to confirm no runtime errors.

- [ ] **Step 4: Commit**

```bash
git add src/features/poster/ui/SettingsPanel.tsx
git commit -m "feat(ui): wire real terrain switch + exaggeration slider in 3D View section"
```

---

## Task 6: Extend `ExportOptions` with terrain fields

**Files:**
- Modify: `src/features/poster/domain/types.ts`

- [ ] **Step 1: Add `terrainEnabled` and `terrainExaggeration` to `ExportOptions`**

In `ExportOptions` (around line 17), add two optional fields alongside the existing `markerSizeScale?: number;`:

```ts
export interface ExportOptions {
  theme: ResolvedTheme;
  // … existing fields …
  markerSizeScale?: number;
  terrainEnabled?: boolean;
  terrainExaggeration?: number;
}
```

These are informational for downstream export consumers. The canvas-capture path reads terrain directly off the live map and does not need to re-apply it, but keeping them on `ExportOptions` makes the plumbing uniform.

- [ ] **Step 2: Typecheck**

Run: `bun run typecheck`
Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/poster/domain/types.ts
git commit -m "feat(export): add terrain fields to ExportOptions type"
```

---

## Task 7: Update `layeredSvgExporter` to receive terrain params and strip `style.terrain` on the offscreen clone

**Files:**
- Modify: `src/features/export/infrastructure/layeredSvgExporter.ts`

- [ ] **Step 1: Add the two fields to `LayeredSvgOptions`**

In the `LayeredSvgOptions` interface (around line 17), add:

```ts
interface LayeredSvgOptions {
  map: MaplibreMap;
  exportWidth: number;
  exportHeight: number;
  // … existing fields …
  markers: MarkerItem[];
  markerIcons: MarkerIconDefinition[];
  terrainEnabled?: boolean;
  terrainExaggeration?: number;
}
```

- [ ] **Step 2: Destructure them in the function signature and give default fallbacks**

Update the destructured argument list in `createLayeredSvgBlobFromMap` (around line 84–111):

```ts
export async function createLayeredSvgBlobFromMap({
  map,
  // … existing fields …
  markers,
  markerIcons,
  terrainEnabled = false,
  terrainExaggeration: _terrainExaggeration = 1.5,
}: LayeredSvgOptions): Promise<Blob> {
```

The exaggeration value is intentionally prefixed `_` and unused here — the offscreen clone deliberately does NOT apply mesh terrain. Accepting it in the signature keeps the call site uniform and documents intent.

- [ ] **Step 3: Strip `style.terrain` from the cloned style before constructing the offscreen map**

After the `resolveExportRenderParams()` call returns `style` (around line 127), and BEFORE `new maplibregl.Map({ container: offscreenContainer, style, … })` (around line 132), insert:

```ts
// Strip runtime terrain from the cloned style. The live map may have
// mesh terrain attached via setTerrain(); the layered SVG exporter
// toggles layers on/off and rasterises each one, and a mesh-deformed
// surface would bake the 3D warp into every per-layer PNG — defeating
// the "editable layered SVG" value proposition. Hillshade (a plain
// map layer) is kept and captured like any other layer.
const flatStyle: StyleSpecification = {
  ...style,
  terrain: undefined as any,
};
```

Then change the map constructor to use `flatStyle`:

```ts
const exportMap = new maplibregl.Map({
  container: offscreenContainer,
  style: flatStyle,
  center: [mapCenter.lng, mapCenter.lat],
  zoom,
  pitch,
  bearing,
  interactive: false,
  attributionControl: false,
  pixelRatio,
  canvasContextAttributes: { preserveDrawingBuffer: true },
});
```

- [ ] **Step 4: Suppress unused-variable lint noise for `terrainEnabled` via a trivial comment reference**

To make the `terrainEnabled` parameter meaningful (not just an unused arg) and to preserve space for a future enhancement without requiring a signature change, add a no-op reference right after the destructuring:

```ts
// terrainEnabled is accepted for API symmetry with the canvas export path.
// The offscreen clone deliberately does not reapply mesh terrain — see
// flatStyle construction below for rationale.
void terrainEnabled;
```

- [ ] **Step 5: Typecheck**

Run: `bun run typecheck`
Expected: 0 errors.

- [ ] **Step 6: Commit**

```bash
git add src/features/export/infrastructure/layeredSvgExporter.ts
git commit -m "feat(export): strip runtime terrain from SVG offscreen clone; accept terrain params"
```

---

## Task 8: Propagate terrain fields in `useExport` and warn on SVG + terrain combo

**Files:**
- Modify: `src/features/export/application/useExport.ts`

- [ ] **Step 1: Add a helper at the top of the `exportPoster` callback to resolve the exaggeration**

Just after the `const lon = Number(form.longitude) || 0;` line (around line 103), add:

```ts
const terrainEnabled = Boolean(form.terrainEnabled);
const terrainExaggeration = Number.isFinite(Number(form.terrainExaggeration))
  ? Number(form.terrainExaggeration)
  : 1.5;
```

- [ ] **Step 2: Show an informational alert before the SVG branch when terrain is on**

Immediately before `if (format === "svg") {` (around line 105), insert:

```ts
if (format === "svg" && terrainEnabled) {
  // Silent-but-discoverable notice: the layered SVG includes hillshade
  // (a normal vector map layer) but deliberately not mesh terrain.
  // See docs/superpowers/specs/2026-04-10-phase3-m5-terrain-design.md.
  window.alert(
    "SVG export includes terrain shading (hillshade), but not 3D elevation. Use PNG or PDF for full 3D terrain.",
  );
}
```

- [ ] **Step 3: Pass the two fields into `createLayeredSvgBlobFromMap`**

Inside the SVG branch (around lines 106–135), add the two fields to the options object passed to `createLayeredSvgBlobFromMap`, right after `markerIcons`:

```ts
const svgBlob = await createLayeredSvgBlobFromMap({
  // … existing fields …
  markers: hasVisibleMarkers ? state.markers : [],
  markerIcons: hasVisibleMarkers
    ? getAllMarkerIcons(state.customMarkerIcons)
    : [],
  terrainEnabled,
  terrainExaggeration,
});
```

- [ ] **Step 4: Pass the two fields into `compositeExport`**

Inside the PNG/PDF branch (around lines 157–183), add the two fields to the options object passed to `compositeExport`, right after `markerSizeScale`:

```ts
const { canvas } = await compositeExport(mapCanvas, {
  // … existing fields …
  markerSizeScale: hasVisibleMarkers ? markerSizeScale : undefined,
  terrainEnabled,
  terrainExaggeration,
});
```

This keeps the contract uniform. The canvas-capture path already reads the terrain-rendered pixels directly from the live MapLibre canvas — no re-rendering needed — but forwarding the flags lets future code (e.g. attribution in the renderer) read them off `ExportOptions` without reaching back into form state.

- [ ] **Step 5: Typecheck**

Run: `bun run typecheck`
Expected: 0 errors.

- [ ] **Step 6: Manual verification in preview server**

In the preview, with a location that has mountainous terrain and hillshade visible:

1. Export PNG: verify the downloaded PNG shows hillshade shading and, if `enable3D` was on, mountains rising.
2. Export PDF: same check.
3. Export SVG with `terrainEnabled: false`: no alert appears, SVG opens flat as before.
4. Export SVG with `terrainEnabled: true`: `window.alert` fires with the notice text. After dismissing, the SVG downloads. Open the SVG and verify:
   - The hillshade layer is present as its own `<g id="map-layer-hillshade">` group containing a `<image>`.
   - The map is flat — no 3D mesh deformation visible on any layer.
5. Use `preview_console_logs` filtered on `error|warn` to confirm no runtime errors.

- [ ] **Step 7: Commit**

```bash
git add src/features/export/application/useExport.ts
git commit -m "feat(export): propagate terrain params to all export paths; warn on SVG + terrain"
```

---

## Task 9: Append terrain attribution to the OSM credits line

**Files:**
- Modify: `src/features/poster/domain/types.ts` (already touched in Task 6 — add one more field)
- Modify: `src/features/poster/infrastructure/renderer/typography.ts`
- Modify: `src/features/export/application/useExport.ts`
- Modify: `src/features/export/infrastructure/layeredSvgExporter.ts`
- Modify: `src/features/poster/ui/PosterTextOverlay.tsx`

Scope: when `terrainEnabled` is true, the bottom-right OSM attribution string should also acknowledge the terrain source. The spec lists two options; we take the conservative one: append "· Mapzen terrain" only when terrain is on, so unchanged posters stay byte-identical.

- [ ] **Step 1: Find the OSM attribution string and understand its rendering**

Run:

```bash
grep -rn "OpenStreetMap\|openstreetmap" src/features/poster/
```

Expected: hits in `typography.ts` (canvas export) and `PosterTextOverlay.tsx` (DOM preview). Note the exact literal used in each — the two renderers must stay in sync (CLAUDE.md gotcha #4).

- [ ] **Step 2: Add a `terrainEnabled` parameter to `drawPosterText` in `typography.ts`**

Append a new optional parameter to the `drawPosterText` signature (currently ending with `coordsLetterSpacing`):

```ts
export function drawPosterText(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  theme: { ui?: { text?: string }; map?: { land?: string } },
  center: Coordinate,
  city: string,
  country: string,
  fontFamily: string | undefined,
  showPosterText: boolean,
  showOverlay: boolean,
  includeCredits: boolean = true,
  includeOsmBadge: boolean = true,
  showCountry: boolean = true,
  showCoordinates: boolean = true,
  textUppercase: boolean = true,
  textLetterSpacing: number = 0.3,
  cityFontScale: number = 1,
  countryFontScale: number = 1,
  coordsFontScale: number = 1,
  creditsFontScale: number = 1,
  countryUppercase: boolean = true,
  coordsLetterSpacing: number = 0,
  terrainEnabled: boolean = false,
): void {
```

- [ ] **Step 3: Modify the OSM attribution text when `terrainEnabled` is true**

Locate the block in `typography.ts` that draws the OSM attribution (the line referencing `"OpenStreetMap"`). Replace the literal attribution string with a variable:

```ts
const osmLine = terrainEnabled
  ? "© OpenStreetMap · Mapzen terrain"
  : "© OpenStreetMap";
```

…and reference `osmLine` wherever the literal "© OpenStreetMap" string was previously used. Match the existing literal exactly (it may include "contributors" — use grep output to pin the text).

- [ ] **Step 4: Mirror the change in `PosterTextOverlay.tsx`**

Open `src/features/poster/ui/PosterTextOverlay.tsx`, find the same OSM literal, and accept a new optional `terrainEnabled?: boolean` prop on the component. Compute the same `osmLine` string and render it in place of the current literal. Pass `terrainEnabled` from `PreviewPanel.tsx` (which gets it off `form.terrainEnabled`).

- [ ] **Step 5: Thread `terrainEnabled` from the canvas export compositor down to `drawPosterText`**

Find the caller of `drawPosterText` inside `compositeExport` (in `src/features/poster/infrastructure/renderer/index.ts`) and add the new trailing argument. Read it off `options.terrainEnabled` (defined in Task 6).

Also update the SVG exporter's inline `drawPosterText` call (`layeredSvgExporter.ts` around line 221) to pass `terrainEnabled` — store it as a local off the destructured option in Task 7 (we already accept it) and forward it.

- [ ] **Step 6: Thread `terrainEnabled` from `PreviewPanel.tsx` into `<PosterTextOverlay>`**

Find the `<PosterTextOverlay …/>` usage in `PreviewPanel.tsx` and add `terrainEnabled={form.terrainEnabled}`.

- [ ] **Step 7: Typecheck**

Run: `bun run typecheck`
Expected: 0 errors.

- [ ] **Step 8: Manual verification in preview**

1. With `terrainEnabled: false`, confirm the OSM attribution reads exactly as before (byte-identical diff in the rendered text).
2. Toggle `terrainEnabled: true`, confirm the attribution reads "© OpenStreetMap · Mapzen terrain" in both the DOM preview and a freshly exported PNG.

- [ ] **Step 9: Commit**

```bash
git add src/features/poster/infrastructure/renderer/typography.ts src/features/poster/ui/PosterTextOverlay.tsx src/features/poster/ui/PreviewPanel.tsx src/features/poster/infrastructure/renderer/index.ts src/features/export/infrastructure/layeredSvgExporter.ts
git commit -m "feat(text): append Mapzen terrain credit to OSM attribution when terrain is on"
```

---

## Task 10: Production build sanity check

**Files:** none modified.

- [ ] **Step 1: Run the full production build**

Run: `bun run build`
Expected: build exits 0, no new Vite warnings related to terrain source types.

- [ ] **Step 2: Run typecheck once more on the whole project**

Run: `bun run typecheck`
Expected: 0 errors.

- [ ] **Step 3: Smoke-test the built app via preview**

Run: `bun run preview` (or the preview tool's equivalent). Reproduce the terrain toggle + pitch interaction on a mountainous location. Export PNG and SVG. Confirm both behave as in the dev-mode verification steps.

No commit needed — this task is verification only.

---

## Task 11: Update `CLAUDE.md` with M5 completion notes

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Update the "Phase 3 Status" section**

Change the current "M1-M4 COMPLETE" / "M5 (future)" text to reflect M5 complete. Replace the existing block that starts with `## Phase 3 Status: 3D Isometric Map View — M1-M4 COMPLETE` with:

```markdown
## Phase 3 Status: 3D Isometric + Terrain — COMPLETE

3D isometric map view + DEM terrain, both using MapLibre native features (zero new dependencies):
- **Pitch + buildings:** MapLibre `pitch` + `fill-extrusion` + `light` (M1–M4)
- **Terrain:** AWS Terrarium raster-dem source + `hillshade` layer + runtime `setTerrain()` mesh (M5)
- **Poster stays flat** — only the map content tilts/deforms into 3D perspective
- **UI:** "3D" toggle in bottom notch + "3D View" sidebar section with pitch, buildings, terrain, exaggeration, light direction, light intensity
- **Hillshade is coupled to the existing light controls** — illumination direction ← `lightAzimuth`, exaggeration derived from `lightIntensity`, colors derived from theme. Building shadows and terrain shadows stay coherent under a single virtual light source.
- **Terrain is independent of `enable3D`** — hillshade works in flat 2D too; mesh only becomes visible when the map is pitched.
- **Style generation:** `generateMapStyle()` always emits the `terrain-dem` source + `hillshade` layer; visibility toggled by `terrainEnabled`. `setTerrain()` is applied as a runtime effect in `MapPreview.tsx` and is NOT part of the generated style spec — keeps incremental style diffs working.
- **Export:**
  - **PNG/PDF:** work automatically (canvas capture reads the terrain-rendered pixels from the live map)
  - **SVG:** hillshade is captured like any other map layer; mesh terrain is deliberately stripped on the offscreen clone (`flatStyle = { ...style, terrain: undefined }`) so per-layer PNGs stay flat and re-compositable in Illustrator. When the user triggers SVG export with terrain on, an informational `window.alert` fires: "SVG export includes terrain shading (hillshade), but not 3D elevation. Use PNG or PDF for full 3D terrain."
- **Attribution:** OSM attribution line gains "· Mapzen terrain" when `terrainEnabled` is true.

See:
- Spec: `docs/superpowers/specs/2026-04-10-phase3-m5-terrain-design.md`
- Plan: `docs/superpowers/plans/2026-04-10-phase3-m5-terrain.md`
```

- [ ] **Step 2: Add a new gotcha about the `terrain-dem` source + setTerrain timing**

In the "Gotchas & Learnings" section, append a new numbered entry after the current last one (#17):

```markdown
18. **Terrain source + setTerrain timing** — `terrain-dem` is baked into every style so it's always present for `setTerrain()` to attach to. But `setTerrain()` must be called only after the style is loaded; the `MapPreview.tsx` terrain effect guards on `map.isStyleLoaded()` and falls back to `map.once("load", …)` when the style is still mounting. The effect also lists `style` in its deps so a full `setStyle()` swap (e.g. theme change) re-applies terrain.
19. **Hillshade vs mesh in SVG export** — The layered SVG exporter strips `style.terrain` on the offscreen clone via `flatStyle = { ...style, terrain: undefined }`. Hillshade stays (it's a normal map layer). The rationale: mesh deformation would bake 3D warp into every per-layer PNG and defeat the editable-layered-SVG value prop. `useExport.ts` fires a `window.alert` when the user triggers SVG with terrain on so the behavior is discoverable.
20. **Terrain is independent of `enable3D`** — Hillshade draws in flat 2D too. The PreviewPanel `<MapPreview>` passes `terrainEnabled` unconditionally (unlike `lightAzimuth`/`lightIntensity` which are gated on `enable3D`). Mesh is only visually noticeable when pitched, but the source is always attached when `terrainEnabled` is on.
```

- [ ] **Step 3: Update the "TODO / Future Work" section**

Remove the `**Terrain DEM** (M5)` bullet from the TODO list — it's done.

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: mark Phase 3 M5 (terrain) complete in CLAUDE.md"
```

---

## Self-Review Checklist

Run this mentally before handoff:

1. **Spec coverage:** Every section of `docs/superpowers/specs/2026-04-10-phase3-m5-terrain-design.md` maps to a task:
   - DEM source (AWS Terrarium): Task 1
   - Feature scope (mesh + hillshade): Tasks 1, 3
   - Lighting coherence: Task 1 (paint bound to lightAzimuth/lightIntensity)
   - Style generation (`maplibreStyle.ts`): Task 1
   - Runtime updates (`MapPreview.tsx`): Task 3
   - UI (`SettingsPanel.tsx`): Task 5
   - Export PNG/PDF: Task 8
   - Export SVG + explicit mesh strip: Tasks 7, 8
   - Attribution: Task 9
   - CLAUDE.md docs: Task 11
   - Edge case: theme change while terrain on → Task 3 Step 3 (style dep on terrain effect)

2. **No placeholders:** Every step that asks for a code change shows the actual code. No "similar to above", no "add error handling as needed".

3. **Name consistency:** `terrainEnabled` / `terrainExaggeration` are the consistent names everywhere (form field, MapPreview prop, ExportOptions, layeredSvgExporter option, drawPosterText param). `TERRAIN_SOURCE_ID = "terrain-dem"` is referenced by the runtime `setTerrain({ source: "terrain-dem" })` call in Task 3 — they match.

4. **Ordering:** Tasks 1–2 establish the style. Task 3 adds runtime terrain attachment. Task 4 wires it through the preview. Task 5 exposes it to the user. Tasks 6–8 wire exports. Task 9 handles attribution (touches files already modified earlier, which is fine). Tasks 10–11 finalize.
