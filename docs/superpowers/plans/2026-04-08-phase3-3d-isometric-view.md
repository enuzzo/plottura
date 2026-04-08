# Phase 3 — 3D Isometric Map View Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an optional 3D isometric view to the poster map using MapLibre's native pitch, fill-extrusion, and lighting — zero new dependencies.

**Architecture:** The poster frame stays flat. When 3D is enabled, `generateMapStyle()` emits a `fill-extrusion` building layer and a `light` object. MapPreview receives a `pitch` prop. A "3D" button in the bottom notch toggles the mode; a sidebar section provides fine controls (pitch, light, building toggle).

**Tech Stack:** MapLibre GL JS v5.19 (existing), React 18, TypeScript, Tailwind CSS, Lucide icons

---

### Task 1: Add 3D fields to PosterForm and defaults

**Files:**
- Modify: `src/features/poster/application/posterReducer.ts` (PosterForm interface, lines 17–47)
- Modify: `src/features/poster/ui/PosterContext.tsx` (DEFAULT_FORM, lines 53–83)

- [ ] **Step 1: Add 3D fields to PosterForm interface**

In `src/features/poster/application/posterReducer.ts`, add these fields to the `PosterForm` interface after `showCoordinates: boolean`:

```typescript
  // ── 3D View ──
  enable3D: boolean;
  mapPitch: string;
  buildingExtrusion: boolean;
  terrainEnabled: boolean;
  terrainExaggeration: string;
  lightAzimuth: string;
  lightIntensity: string;
```

- [ ] **Step 2: Add defaults to PosterContext**

In `src/features/poster/ui/PosterContext.tsx`, add to `DEFAULT_FORM` after `showCoordinates: true`:

```typescript
  enable3D: false,
  mapPitch: "60",
  buildingExtrusion: true,
  terrainEnabled: false,
  terrainExaggeration: "1.5",
  lightAzimuth: "210",
  lightIntensity: "0.6",
```

- [ ] **Step 3: Run typecheck**

Run: `bun run typecheck`
Expected: PASS with zero errors (existing SET_FIELD action handles string | boolean dynamically)

- [ ] **Step 4: Commit**

```bash
git add src/features/poster/application/posterReducer.ts src/features/poster/ui/PosterContext.tsx
git commit -m "feat(3d): add 3D view fields to PosterForm with defaults"
```

---

### Task 2: Extend generateMapStyle() with fill-extrusion and light

**Files:**
- Modify: `src/features/map/infrastructure/maplibreStyle.ts`

- [ ] **Step 1: Add new options to generateMapStyle signature**

In `src/features/map/infrastructure/maplibreStyle.ts`, extend the `options` parameter of `generateMapStyle()` (around line 192):

```typescript
export function generateMapStyle(
  theme: ResolvedTheme,
  options?: {
    includeBuildings?: boolean;
    includeWater?: boolean;
    includeParks?: boolean;
    includeAeroway?: boolean;
    includeRail?: boolean;
    includeRoads?: boolean;
    includeRoadPath?: boolean;
    includeRoadMinorLow?: boolean;
    includeRoadOutline?: boolean;
    distanceMeters?: number;
    enable3D?: boolean;
    buildingExtrusion?: boolean;
    lightAzimuth?: number;
    lightIntensity?: number;
  },
): StyleSpecification {
```

- [ ] **Step 2: Extract new options with defaults**

After the existing `const buildingMinZoom = ...` line (around line 221), add:

```typescript
  const enable3D = options?.enable3D ?? false;
  const buildingExtrusion = options?.buildingExtrusion ?? true;
  const lightAzimuth = options?.lightAzimuth ?? 210;
  const lightIntensity = options?.lightIntensity ?? 0.6;
```

- [ ] **Step 3: Replace building layer with conditional 2D/3D**

Replace the existing building layer object (lines 344–355) with:

```typescript
      // Building layer: flat fill in 2D, extruded in 3D
      ...(enable3D && buildingExtrusion
        ? [
            {
              id: "building-3d",
              source: SOURCE_ID,
              "source-layer": "building",
              type: "fill-extrusion" as const,
              minzoom: buildingMinZoom,
              layout: {
                visibility: includeBuildings
                  ? ("visible" as const)
                  : ("none" as const),
              },
              paint: {
                "fill-extrusion-color": buildingFill,
                "fill-extrusion-height": [
                  "coalesce",
                  ["get", "render_height"],
                  10,
                ],
                "fill-extrusion-base": [
                  "coalesce",
                  ["get", "render_min_height"],
                  0,
                ],
                "fill-extrusion-opacity": BUILDING_FILL_OPACITY,
                "fill-extrusion-vertical-gradient": true,
              },
            },
          ]
        : [
            {
              id: "building",
              source: SOURCE_ID,
              "source-layer": "building",
              type: "fill" as const,
              minzoom: buildingMinZoom,
              layout: {
                visibility: includeBuildings
                  ? ("visible" as const)
                  : ("none" as const),
              },
              paint: {
                "fill-color": buildingFill,
                "fill-opacity": BUILDING_FILL_OPACITY,
              },
            },
          ]),
```

Note: This uses array spread (`...[]`) to conditionally emit one layer or the other.

- [ ] **Step 4: Add light object to the returned StyleSpecification**

In the returned object (around line 273), add the `light` property after `version: 8`:

```typescript
  return {
    version: 8,
    ...(enable3D
      ? {
          light: {
            anchor: "map" as const,
            color: "#ffffff",
            intensity: lightIntensity,
            position: [1.15, lightAzimuth, 30],
          },
        }
      : {}),
    sources: {
      // ... existing sources
```

- [ ] **Step 5: Run typecheck**

Run: `bun run typecheck`
Expected: PASS with zero errors

- [ ] **Step 6: Commit**

```bash
git add src/features/map/infrastructure/maplibreStyle.ts
git commit -m "feat(3d): add fill-extrusion building layer and light to map style"
```

---

### Task 3: Wire 3D options through PosterContext to generateMapStyle

**Files:**
- Modify: `src/features/poster/ui/PosterContext.tsx` (mapStyle useMemo, lines 195–222)

- [ ] **Step 1: Pass 3D fields to generateMapStyle**

Update the `mapStyle` useMemo in `PosterContext.tsx` to pass the new options:

```typescript
  const mapStyle = useMemo(
    () =>
      generateMapStyle(effectiveTheme, {
        includeBuildings: state.form.includeBuildings,
        includeWater: state.form.includeWater,
        includeParks: state.form.includeParks,
        includeAeroway: state.form.includeAeroway,
        includeRail: state.form.includeRail,
        includeRoads: state.form.includeRoads,
        includeRoadPath: state.form.includeRoadPath,
        includeRoadMinorLow: state.form.includeRoadMinorLow,
        includeRoadOutline: state.form.includeRoadOutline,
        distanceMeters: Number(state.form.distance),
        enable3D: state.form.enable3D,
        buildingExtrusion: state.form.buildingExtrusion,
        lightAzimuth: Number(state.form.lightAzimuth) || 210,
        lightIntensity: Number(state.form.lightIntensity) || 0.6,
      }),
    [
      effectiveTheme,
      state.form.includeBuildings,
      state.form.includeWater,
      state.form.includeParks,
      state.form.includeAeroway,
      state.form.includeRail,
      state.form.includeRoads,
      state.form.includeRoadPath,
      state.form.includeRoadMinorLow,
      state.form.includeRoadOutline,
      state.form.distance,
      state.form.enable3D,
      state.form.buildingExtrusion,
      state.form.lightAzimuth,
      state.form.lightIntensity,
    ],
  );
```

- [ ] **Step 2: Run typecheck**

Run: `bun run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/features/poster/ui/PosterContext.tsx
git commit -m "feat(3d): wire 3D form fields through to generateMapStyle"
```

---

### Task 4: Add pitch prop to MapPreview

**Files:**
- Modify: `src/features/map/ui/MapPreview.tsx`

- [ ] **Step 1: Add pitch to MapPreviewProps interface**

In `MapPreview.tsx`, add `pitch` to the props interface (around line 73):

```typescript
interface MapPreviewProps {
  style: StyleSpecification;
  center: [lon: number, lat: number];
  zoom: number;
  pitch?: number;
  mapRef: MapInstanceRef;
  interactive?: boolean;
  allowRotation?: boolean;
  minZoom?: number;
  maxZoom?: number;
  onMoveEnd?: (center: [number, number], zoom: number) => void;
  onMove?: (center: [number, number], zoom: number) => void;
  containerStyle?: CSSProperties;
  overzoomScale?: number;
}
```

- [ ] **Step 2: Destructure pitch and pass to Map constructor**

Add `pitch = 0` to the destructured props (around line 98):

```typescript
export default function MapPreview({
  style,
  center,
  zoom,
  pitch = 0,
  mapRef,
  interactive = false,
  allowRotation = false,
  minZoom,
  maxZoom,
  onMoveEnd,
  onMove,
  containerStyle,
  overzoomScale = 1,
}: MapPreviewProps) {
```

In the Map constructor (around line 121), add `pitch` and `maxPitch`:

```typescript
    const map = new maplibregl.Map({
      container: containerRef.current,
      style,
      center,
      zoom,
      pitch,
      maxPitch: 85,
      interactive: false,
      attributionControl: false,
      canvasContextAttributes: { preserveDrawingBuffer: true },
    });
```

- [ ] **Step 3: Add pitch sync effect**

After the center/zoom sync effect (after line 253), add a new effect:

```typescript
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const currentPitch = map.getPitch();
    if (Math.abs(currentPitch - pitch) < 0.1) return;

    map.setPitch(pitch);
  }, [pitch, mapRef]);
```

- [ ] **Step 4: Handle incremental style updates with layer changes**

The `applyIncrementalStyleUpdate` function only updates existing layers. When toggling 3D, the building layer changes from `"building"` (fill) to `"building-3d"` (fill-extrusion) — a layer that doesn't exist in the previous style. The existing code at line 217 checks if sources match and skips layers not found in prevLayerMap. When building layer IDs change, the incremental path won't update them, so we need to detect layer set changes and fall through to `setStyle()`.

Update the style sync effect (around line 217) to also compare layer IDs:

```typescript
    // Fast path: apply only the changed paint/layout/zoom properties directly,
    // avoiding a full setStyle diff and any risk of source re-initialisation.
    const sourcesMatch =
      prevStyleRef.current &&
      JSON.stringify(prevStyleRef.current.sources) ===
        JSON.stringify(style.sources);
    const layerIdsMatch =
      prevStyleRef.current &&
      prevStyleRef.current.layers.length === style.layers.length &&
      prevStyleRef.current.layers.every(
        (l, i) => l.id === style.layers[i]?.id,
      );

    if (sourcesMatch && layerIdsMatch) {
      applyIncrementalStyleUpdate(map, prevStyleRef.current, style);
    } else {
      map.setStyle(style);
    }
```

- [ ] **Step 5: Run typecheck**

Run: `bun run typecheck`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/features/map/ui/MapPreview.tsx
git commit -m "feat(3d): add pitch prop to MapPreview with sync effect and layer-aware style updates"
```

---

### Task 5: Wire pitch from PreviewPanel to MapPreview

**Files:**
- Modify: `src/features/poster/ui/PreviewPanel.tsx`

- [ ] **Step 1: Compute pitch from form state and pass to MapPreview**

In `PreviewPanel.tsx`, after the existing `const formLon = ...` line (around line 181), add:

```typescript
  const mapPitch = form.enable3D ? Number(form.mapPitch) || 60 : 0;
```

Then in the MapPreview JSX (around line 409), add the `pitch` prop:

```typescript
          <MapPreview
            style={mapStyle}
            center={mapCenter}
            zoom={mapZoom}
            pitch={mapPitch}
            mapRef={mapRef}
            interactive={isEditing && !isMarkerEditorActive}
            allowRotation={isEditing && isRotationEnabled}
            minZoom={mapMinZoom}
            maxZoom={mapMaxZoom}
            overzoomScale={MAP_OVERZOOM_SCALE}
            onMove={handleMove}
            onMoveEnd={handleMoveEnd}
          />
```

- [ ] **Step 2: Reset pitch on recenter**

In the `handleRecenter` callback (around line 318), update the `jumpTo` call to also reset pitch when 3D is not enabled, or keep pitch when 3D is active:

```typescript
    map.stop();
    map.jumpTo({
      bearing: 0,
      pitch: form.enable3D ? Number(form.mapPitch) || 60 : 0,
    });
```

- [ ] **Step 3: Run typecheck and dev server**

Run: `bun run typecheck`
Expected: PASS

Run: `bun run dev`
Expected: App loads, poster displays normally (3D is off by default, so no visible change yet)

- [ ] **Step 4: Commit**

```bash
git add src/features/poster/ui/PreviewPanel.tsx
git commit -m "feat(3d): wire pitch from form state through PreviewPanel to MapPreview"
```

---

### Task 6: Add 3D toggle button to bottom notch

**Files:**
- Modify: `src/features/poster/ui/MapPrimaryControls.tsx`
- Modify: `src/features/poster/ui/PreviewPanel.tsx`

- [ ] **Step 1: Add 3D toggle props and button to MapPrimaryControls**

In `src/features/poster/ui/MapPrimaryControls.tsx`, add the `Box` import and new props:

```typescript
import { Lock, Focus, Unlock, Box } from "lucide-react";

interface MapPrimaryControlsProps {
  isMapEditing: boolean;
  isMarkerEditorActive: boolean;
  recenterHint: string;
  unlockHint: string;
  onRecenter: () => void;
  onStartEditing: () => void;
  onFinishEditing: () => void;
  lightColor?: string;
  darkColor?: string;
  is3DEnabled?: boolean;
  onToggle3D?: () => void;
}
```

Update the destructuring to include the new props:

```typescript
export default function MapPrimaryControls({
  isMapEditing,
  isMarkerEditorActive,
  recenterHint,
  unlockHint,
  onRecenter,
  onStartEditing,
  onFinishEditing,
  lightColor = "#ffffff",
  darkColor = "#1a1a1a",
  is3DEnabled = false,
  onToggle3D,
}: MapPrimaryControlsProps) {
```

Add a divider + 3D button after the Edit Map / Lock Map button, before the closing `</div>`:

```tsx
      {onToggle3D ? (
        <>
          <div className="w-px self-stretch my-1.5" style={dividerStyle} />
          <button
            type="button"
            className={BTN}
            onClick={onToggle3D}
            title={is3DEnabled ? "Switch to 2D view" : "Switch to 3D view"}
          >
            <Box className="w-4 h-4" />
            <span>{is3DEnabled ? "2D" : "3D"}</span>
          </button>
        </>
      ) : null}
    </div>
```

- [ ] **Step 2: Wire 3D toggle in PreviewPanel**

In `PreviewPanel.tsx`, add a toggle handler after the existing handlers (around line 270):

```typescript
  const handleToggle3D = useCallback(() => {
    dispatch({
      type: "SET_FIELD",
      name: "enable3D",
      value: !form.enable3D,
    });
  }, [dispatch, form.enable3D]);
```

Pass `is3DEnabled` and `onToggle3D` to both MapPrimaryControls instances in PreviewPanel:

For the bottom notch (non-mobile, around line 573):

```tsx
          <MapPrimaryControls
            isMapEditing={isEditing}
            isMarkerEditorActive={isMarkerEditorActive}
            recenterHint={RECENTER_HINT}
            unlockHint={UNLOCK_HINT}
            onRecenter={handleRecenter}
            onStartEditing={handleStartEditing}
            onFinishEditing={handleFinishEditing}
            lightColor={lightestColor}
            darkColor={darkestColor}
            is3DEnabled={form.enable3D}
            onToggle3D={handleToggle3D}
          />
```

For the editing controls (mobile and desktop, around line 461):

```tsx
                  <MapPrimaryControls
                    isMapEditing
                    isMarkerEditorActive={isMarkerEditorActive}
                    recenterHint={RECENTER_HINT}
                    unlockHint={UNLOCK_HINT}
                    onRecenter={handleRecenter}
                    onStartEditing={handleStartEditing}
                    onFinishEditing={handleFinishEditing}
                    lightColor={lightestColor}
                    darkColor={darkestColor}
                    is3DEnabled={form.enable3D}
                    onToggle3D={handleToggle3D}
                  />
```

- [ ] **Step 3: Run typecheck**

Run: `bun run typecheck`
Expected: PASS

- [ ] **Step 4: Visual test**

Run: `bun run dev`
Expected: "3D" button appears in the bottom notch next to Recenter/Edit Map. Clicking it toggles the map into 3D perspective with extruded buildings. Clicking again returns to 2D. The label switches between "3D" and "2D".

- [ ] **Step 5: Commit**

```bash
git add src/features/poster/ui/MapPrimaryControls.tsx src/features/poster/ui/PreviewPanel.tsx
git commit -m "feat(3d): add 3D toggle button to bottom notch controls"
```

---

### Task 7: Add 3D View sidebar section

**Files:**
- Modify: `src/features/poster/ui/SettingsPanel.tsx`

- [ ] **Step 1: Add Box icon import**

In `SettingsPanel.tsx`, update the Lucide import:

```typescript
import { MapPin, Palette, LayoutGrid, Map, Layers, MapPinPlus, Type, Box } from "lucide-react";
```

- [ ] **Step 2: Add 3D View accordion section**

After the Map Settings section (after line 181) and before the Layers section, add:

```tsx
        {state.form.enable3D ? (
          <SidebarSection value="3d-view" icon={Box} label="3D View">
            {!isColorEditorActive ? (
              <section className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-base text-text-secondary">Pitch</span>
                    <span className="text-sm text-text-muted tabular-nums">
                      {state.form.mapPitch}°
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={85}
                    step={1}
                    value={Number(state.form.mapPitch) || 60}
                    onChange={(e) =>
                      dispatch({
                        type: "SET_FIELD",
                        name: "mapPitch",
                        value: e.target.value,
                      })
                    }
                    className="w-full accent-accent"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-base text-text-secondary">Buildings</span>
                  <Switch
                    checked={Boolean(state.form.buildingExtrusion)}
                    onCheckedChange={(checked) => {
                      dispatch({
                        type: "SET_FIELD",
                        name: "buildingExtrusion",
                        value: checked,
                      });
                    }}
                  />
                </div>

                <div className="flex items-center justify-between opacity-50 cursor-not-allowed">
                  <span className="text-base text-text-secondary">
                    Terrain{" "}
                    <span className="text-xs text-text-muted">(coming soon)</span>
                  </span>
                  <Switch checked={false} disabled />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-base text-text-secondary">Light direction</span>
                    <span className="text-sm text-text-muted tabular-nums">
                      {state.form.lightAzimuth}°
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={360}
                    step={5}
                    value={Number(state.form.lightAzimuth) || 210}
                    onChange={(e) =>
                      dispatch({
                        type: "SET_FIELD",
                        name: "lightAzimuth",
                        value: e.target.value,
                      })
                    }
                    className="w-full accent-accent"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-base text-text-secondary">Light intensity</span>
                    <span className="text-sm text-text-muted tabular-nums">
                      {(Number(state.form.lightIntensity) || 0.6).toFixed(1)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={Number(state.form.lightIntensity) || 0.6}
                    onChange={(e) =>
                      dispatch({
                        type: "SET_FIELD",
                        name: "lightIntensity",
                        value: e.target.value,
                      })
                    }
                    className="w-full accent-accent"
                  />
                </div>
              </section>
            ) : null}
          </SidebarSection>
        ) : null}
```

- [ ] **Step 3: Run typecheck**

Run: `bun run typecheck`
Expected: PASS

- [ ] **Step 4: Visual test**

Run: `bun run dev`
Expected: When 3D is enabled (via the notch button), a "3D View" accordion section appears in the sidebar with pitch slider, buildings toggle, terrain toggle (disabled), and light controls. Adjusting pitch and light sliders updates the map in real time.

- [ ] **Step 5: Commit**

```bash
git add src/features/poster/ui/SettingsPanel.tsx
git commit -m "feat(3d): add 3D View sidebar section with pitch, buildings, and light controls"
```

---

### Task 8: Add pitch slider to floating edit controls

**Files:**
- Modify: `src/features/poster/ui/PreviewPanel.tsx`

- [ ] **Step 1: Add pitch slider in floating controls when 3D + edit mode**

In `PreviewPanel.tsx`, inside the editing controls area (around line 504, after the rotation slider block), add a pitch slider that appears when 3D is enabled:

```tsx
                {!isMobileViewport && form.enable3D ? (
                  <div className={CTL_SLIDER_ROW}>
                    <span className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-wide">
                      Pitch
                    </span>
                    <input
                      className={CTL_SLIDER}
                      type="range"
                      min={0}
                      max={85}
                      step={1}
                      value={Number(form.mapPitch) || 60}
                      onChange={(e) =>
                        dispatch({
                          type: "SET_FIELD",
                          name: "mapPitch",
                          value: e.target.value,
                        })
                      }
                      aria-label="Pitch angle"
                    />
                    <span className="text-xs text-[var(--text-muted)] tabular-nums min-w-[2.5rem] text-right">
                      {form.mapPitch}°
                    </span>
                  </div>
                ) : null}
```

- [ ] **Step 2: Run typecheck**

Run: `bun run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/features/poster/ui/PreviewPanel.tsx
git commit -m "feat(3d): add pitch slider to floating edit controls"
```

---

### Task 9: Handle light changes via setLight (avoid full style regen)

**Files:**
- Modify: `src/features/map/ui/MapPreview.tsx`

- [ ] **Step 1: Add light props to MapPreviewProps**

Add optional light props to the interface:

```typescript
interface MapPreviewProps {
  style: StyleSpecification;
  center: [lon: number, lat: number];
  zoom: number;
  pitch?: number;
  lightAzimuth?: number;
  lightIntensity?: number;
  mapRef: MapInstanceRef;
  // ... rest unchanged
}
```

Destructure them with defaults:

```typescript
export default function MapPreview({
  style,
  center,
  zoom,
  pitch = 0,
  lightAzimuth,
  lightIntensity,
  mapRef,
  // ... rest
}: MapPreviewProps) {
```

- [ ] **Step 2: Add setLight effect**

After the pitch sync effect, add:

```typescript
  useEffect(() => {
    const map = mapRef.current;
    if (!map || lightAzimuth == null || lightIntensity == null) return;

    map.setLight({
      anchor: "map",
      color: "#ffffff",
      intensity: lightIntensity,
      position: [1.15, lightAzimuth, 30],
    });
  }, [lightAzimuth, lightIntensity, mapRef]);
```

- [ ] **Step 3: Wire light props from PreviewPanel**

In `PreviewPanel.tsx`, pass the light props to MapPreview:

```tsx
          <MapPreview
            style={mapStyle}
            center={mapCenter}
            zoom={mapZoom}
            pitch={mapPitch}
            lightAzimuth={form.enable3D ? Number(form.lightAzimuth) || 210 : undefined}
            lightIntensity={form.enable3D ? Number(form.lightIntensity) || 0.6 : undefined}
            mapRef={mapRef}
            interactive={isEditing && !isMarkerEditorActive}
            allowRotation={isEditing && isRotationEnabled}
            minZoom={mapMinZoom}
            maxZoom={mapMaxZoom}
            overzoomScale={MAP_OVERZOOM_SCALE}
            onMove={handleMove}
            onMoveEnd={handleMoveEnd}
          />
```

- [ ] **Step 4: Run typecheck**

Run: `bun run typecheck`
Expected: PASS

- [ ] **Step 5: Visual test**

Run: `bun run dev`
Expected: Moving the light direction and intensity sliders in the sidebar updates building shading in real time without a flicker (no full style regen, just `setLight()`).

- [ ] **Step 6: Commit**

```bash
git add src/features/map/ui/MapPreview.tsx src/features/poster/ui/PreviewPanel.tsx
git commit -m "feat(3d): use setLight for real-time light updates without style regeneration"
```

---

### Task 10: Verify and fix export pipeline with 3D

**Files:**
- Modify: `src/features/export/application/useExport.ts` (if needed)
- Modify: `src/features/export/infrastructure/exportUtils.ts` (if needed)

- [ ] **Step 1: Test PNG export with 3D view**

Run the dev server, enable 3D, set a prominent city (e.g., London at zoom ~13), and export as PNG. Verify:
- Buildings are extruded in the export
- Pitch is correctly captured
- Gradient fades render over the tilted map
- Text overlay is correctly positioned

The export pipeline already captures pitch via `map.getPitch()` and style via `map.getStyle()`, so this should work without code changes. If issues are found, fix them.

- [ ] **Step 2: Test SVG export with 3D view**

Export as SVG with 3D enabled. The offscreen MapLibre renderer receives the full style (including fill-extrusion) and the camera pitch. Verify the SVG output shows the 3D perspective.

- [ ] **Step 3: Test PDF export with 3D view**

Export as PDF with 3D enabled. Same verification as PNG (PDF uses the same compositeExport path).

- [ ] **Step 4: Commit (if changes were needed)**

```bash
git add -A
git commit -m "fix(3d): ensure export pipeline correctly captures 3D view"
```

---

### Task 11: Update CLAUDE.md and create handoff notes

**Files:**
- Modify: `CLAUDE.md`
- Create: `docs/superpowers/notes/2026-04-08-phase3-session1-handoff.md`

- [ ] **Step 1: Update CLAUDE.md**

Update the Phase 3 section in CLAUDE.md from the placeholder "Next: Phase 3" to document the completed implementation. Add:

- New PosterForm fields (enable3D, mapPitch, buildingExtrusion, terrainEnabled, terrainExaggeration, lightAzimuth, lightIntensity)
- 3D style generation details (fill-extrusion, light object)
- MapPreview pitch/light props
- UI: 3D button in bottom notch + sidebar section
- Export: works automatically via existing pitch/style capture
- Gotcha: toggling 3D requires full style regen (layer ID changes)

- [ ] **Step 2: Write handoff notes**

Create `docs/superpowers/notes/2026-04-08-phase3-session1-handoff.md` with:
- What was done (all tasks)
- Files modified
- Known issues / future work (terrain M5)
- Architecture notes

- [ ] **Step 3: Run final typecheck**

Run: `bun run typecheck`
Expected: PASS with zero errors

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md docs/superpowers/notes/2026-04-08-phase3-session1-handoff.md
git commit -m "docs: update CLAUDE.md and add Phase 3 session 1 handoff notes"
```
