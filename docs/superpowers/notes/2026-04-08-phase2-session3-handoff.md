# Phase 2 Session 3 — Handoff Notes

**Date:** 2026-04-08
**Branch:** main (uncommitted)
**What was done:** Milestone 5 completed (5a-5c), PDF export wired, all TS errors fixed, Map Settings populated

---

## Completed

### Milestone 5a — Typefaces

Added 5 new Google Fonts to `FONT_OPTIONS` in `src/core/config.ts`:
- Pacifico, Permanent Marker, Caveat, Lobster, Satisfy
- Total: 15 typefaces (10 original + 5 new)
- Auto-loaded via existing `ensureGoogleFont()` in TypographySection

### Milestone 5b — Gradient Toggles

- Added `showGradientTop` and `showGradientBottom` boolean fields to `PosterForm` (both default `true`)
- Updated `GradientFades.tsx` to accept `showTop`/`showBottom` props
- Updated `PreviewPanel.tsx` to pass fields (decoupled from `showMarkers`)
- Updated canvas `applyFades()` in `layers.ts` for independent top/bottom
- Wired through both PNG (`compositeExport`) and SVG (`createLayeredSvgBlobFromMap`) export pipelines
- Toggle UI in Map Settings sidebar section

### Milestone 5c — Credits & Attribution

- **Credits toggle:** Added Switch in Map Settings, wired to existing `includeCredits` field and `handleCreditsChange` handler
- **OSM badge toggle:** New `includeOsmBadge` boolean field in `PosterForm` (default `true`). Controls the "© OpenStreetMap contributors" text in both preview (`PosterTextOverlay`) and export (`typography.ts`)
- **Disclaimer:** When both Credits and OSM badge are off, a small note appears in Map Settings: "Map data provided by OpenStreetMap contributors. Poster generated with Plottura. Please credit both when sharing publicly."

### Additional Map Settings Controls

- **Country toggle:** New `showCountry` boolean (default `true`). Hides/shows the divider line + country name on the poster
- **Coordinates toggle:** New `showCoordinates` boolean (default `true`). Hides/shows the lat/lon coordinates on the poster
- Both wired through `PosterTextOverlay` (preview) and `typography.ts` (canvas export)

### PDF Export

- `handleDownloadPdf` already existed in `useExport.ts` — wired it through `AppShell` → `Sidebar` → `SidebarFooter`
- Added PDF button (outlined style, `FileText` icon) alongside PNG and SVG
- Uses existing `createPdfBlobFromCanvas` from export infrastructure

### Notch Styling

- Top notch (layout label): `text-[11px] font-medium` → `text-sm font-semibold uppercase`
- Bottom notch (Recenter/Edit Map): `text-[0.78rem]` → `text-sm font-semibold uppercase`

### TS Error Fixes

All pre-existing TypeScript errors resolved (4 → 0):
- `pngExporter.ts`: Uint8Array/BlobPart — cast `withDpi as BlobPart`
- `typography.ts`: `.map` on wrong type — added `map?: { land?: string }` to theme parameter type
- `StartupLocationModal.tsx`: Removed in session 2 (M3a)
- `MobileNavBar` import in `SettingsPanel.tsx`: Replaced with `string` type + removed dead import

---

## Files Modified

| File | Change |
|---|---|
| `src/core/config.ts` | 5 new fonts in FONT_OPTIONS |
| `src/features/poster/application/posterReducer.ts` | Added showGradientTop, showGradientBottom, includeOsmBadge, showCountry, showCoordinates to PosterForm |
| `src/features/poster/ui/PosterContext.tsx` | Defaults for new form fields |
| `src/features/poster/ui/GradientFades.tsx` | showTop/showBottom props |
| `src/features/poster/ui/PreviewPanel.tsx` | Gradient fields, includeOsmBadge, showCountry, showCoordinates passed to children. Top notch text-sm uppercase |
| `src/features/poster/ui/PosterTextOverlay.tsx` | includeOsmBadge, showCountry, showCoordinates conditionals |
| `src/features/poster/ui/MapPrimaryControls.tsx` | Bottom notch text-sm uppercase |
| `src/features/poster/ui/SettingsPanel.tsx` | MobileNavBar fix, Map Settings section with 6 toggles + disclaimer |
| `src/features/poster/infrastructure/renderer/layers.ts` | applyFades showTop/showBottom params |
| `src/features/poster/infrastructure/renderer/typography.ts` | includeOsmBadge, showCountry, showCoordinates params + theme type fix |
| `src/features/poster/infrastructure/renderer/index.ts` | Wire new params through compositeExport |
| `src/features/poster/domain/types.ts` | ExportOptions: new optional fields |
| `src/features/export/application/useExport.ts` | Pass new fields in both SVG and PNG paths |
| `src/features/export/infrastructure/layeredSvgExporter.ts` | LayeredSvgOptions + wire new params |
| `src/features/export/infrastructure/pngExporter.ts` | BlobPart cast fix |
| `src/components/sidebar/Sidebar.tsx` | onExportPdf prop |
| `src/components/sidebar/SidebarFooter.tsx` | PDF button + onExportPdf prop |
| `src/shared/ui/AppShell.tsx` | Wire handleDownloadPdf |
| `CLAUDE.md` | Updated status to Phase 2 complete |

---

## Architecture Notes

### Map Settings Section (6 toggles)

The Map Settings section in the sidebar now contains:
1. Gradient top (showGradientTop)
2. Gradient bottom (showGradientBottom)
3. Country (showCountry)
4. Coordinates (showCoordinates)
5. Credits (includeCredits)
6. OpenStreetMap badge (includeOsmBadge)

All use `dispatch({ type: "SET_FIELD", ... })` except Credits which uses `handleCreditsChange` from `useFormHandlers`.

### Export Pipeline

Three export formats now fully wired:
- **PNG:** compositeExport → createPngBlob (with DPI injection)
- **SVG:** createLayeredSvgBlobFromMap (layered offscreen MapLibre render)
- **PDF:** compositeExport → createPdfBlobFromCanvas (canvas-based)

All three respect: showGradientTop, showGradientBottom, includeCredits, includeOsmBadge, showCountry, showCoordinates.

---

## Phase 2 Status: COMPLETE

All milestones (M1-M5) done. Zero TS errors. Ready for Phase 3 (3D isometric poster view).
