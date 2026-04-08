# Phase 2 Session 1 — Handoff Notes

**Date:** 2026-04-08
**Commit:** `8c3ff11` (on main)
**What was done:** Milestone 1 (icon migration) + Milestone 2 (CSS architecture)

---

## Completed

### Milestone 1 — Icon Migration (react-icons → Lucide)

- Replaced all 18 marker icons in `src/features/markers/infrastructure/iconRegistry.ts`
- Changed `IconType` → `LucideIcon` in `src/features/markers/domain/types.ts`
- Removed `react-icons` from `package.json`
- Mapping: FaLocationDot→MapPin, FaHeart→Heart, FaHouse→House, FaStar→Star, FaCircle→Circle, FaSquare→Square, FaXmark→X, SlTarget→Target, FaSun→Sun, FaMoon→Moon, FaBuilding→Building2, FaPaperPlane→Send, FaRegSnowflake→Snowflake, FaShop→Store, FaCamera→Camera, IoMdFlower→Flower2, FaTree→TreePine, FaFlag→Flag
- `renderToStaticMarkup(createElement(...))` pattern preserved — needed by export pipeline for SVG markup strings
- All 18 icons verified visually in browser

### Milestone 2 — CSS Architecture Migration

- Removed ~370 lines of component CSS from `src/app/globals.css`
- `globals.css` now contains ONLY: font import, Tailwind directives, design tokens (light/dark), one MapLibre rule
- Migrated components:
  - **PreviewPanel.tsx**: poster-viewport, poster-frame, poster-ghost-layer, desktop-layout-label, map-controls, map-control-group, map-control-btn (all states), map-control-slider (including ::-webkit-slider-thumb/::-moz-range-thumb via arbitrary variants)
  - **MapPrimaryControls.tsx**: map-control-btn, map-control-btn--primary
  - **MapPreview.tsx**: map-container
  - **PosterTextOverlay.tsx**: poster-text-overlay (container-type:size), poster-city, poster-divider, poster-country, poster-coords, poster-attribution, poster-credits
  - **GradientFades.tsx**: poster-fade, poster-fade--top, poster-fade--bottom
  - **MarkerOverlay.tsx**: poster-marker-overlay, poster-marker (draggable, dragging, selected states)
- Button class constants (CTL_BTN, CTL_BTN_PRIMARY, etc.) defined at top of PreviewPanel.tsx and MapPrimaryControls.tsx
- Mobile overrides handled via `max-[768px]:` Tailwind variants inline

---

## Remaining Work (M3–M5)

### Milestone 3 — UX Cleanup
- **3a:** Remove `FloatingSearchBar` (src/components/canvas/FloatingSearchBar.tsx) + its import from `AppShell.tsx`. Remove `StartupLocationModal` (src/features/location/ui/StartupLocationModal.tsx). Set DEFAULT_FORM to London (51.5074, -0.1278) in `src/core/config.ts` AND update DEFAULT_LOCATION_LABEL in PosterContext/PreviewPanel. Keep location search in sidebar only. Crosshair button triggers geolocation.
- **3b:** Add sidebar collapse toggle in SidebarHeader. Collapse to zero-width, map goes full viewport. Persist in localStorage.
- **3c:** Custom slim scrollbar for sidebar — CSS `::-webkit-scrollbar` or Tailwind plugin.

### Milestone 4 — Theme Redesign
- **4a:** Remove theme description text from ThemeSummarySection/ThemeCard.
- **4b:** Theme palette: full sidebar width, 2-column grid, adjacent squares (no borders/stroke/circles/cards), light separator between rows.
- **4c:** Replace ghost map (blurred canvas) with CSS gradient from poster dominant colors (darker tones). Add drop-shadow to poster card.

### Milestone 5 — Features
- **5a:** Add typefaces: Pacifico, Permanent Marker, Caveat, Lobster, Satisfy. Install @fontsource packages, add to TypographySection font selector.
- **5b:** Gradient top/bottom independent toggles in Map Settings. New form fields: `showTopFade`, `showBottomFade`. Wire to GradientFades component.
- **5c:** Credits on/off toggle. `form.includeCredits` already exists in state — just add Switch UI in Map Settings. When off, note OSM license in export metadata or tooltip.
- **5d:** Export SVG + PDF. `handleDownloadSvg` and `handleDownloadPdf` already exist in `useExport.ts`. Change SidebarFooter from single button to format selector (dropdown or button group). SidebarFooter interface needs to change from `onExport: () => void` to receive format-specific handlers.

---

## Key Files for Next Session

| File | What to do |
|---|---|
| `src/shared/ui/AppShell.tsx` | Remove FloatingSearchBar import, add sidebar collapse logic |
| `src/components/canvas/FloatingSearchBar.tsx` | DELETE |
| `src/features/location/ui/StartupLocationModal.tsx` | DELETE |
| `src/core/config.ts` | Change DEFAULT_LAT/LON to London |
| `src/features/poster/ui/PreviewPanel.tsx` | Update DEFAULT_LOCATION_LABEL to London |
| `src/components/sidebar/SidebarHeader.tsx` | Add collapse toggle button |
| `src/components/sidebar/Sidebar.tsx` | Collapse animation logic |
| `src/features/theme/ui/ThemeSummarySection.tsx` | Remove descriptions, redesign palette grid |
| `src/features/poster/ui/SettingsPanel.tsx` | Add gradient toggles, credits toggle |
| `src/components/sidebar/SidebarFooter.tsx` | Multi-format export selector |
| `src/features/poster/ui/GradientFades.tsx` | Accept top/bottom toggle props |

---

## Pre-existing Issues (unchanged)

4 TypeScript errors exist but predate our work:
- `src/features/export/infrastructure/pngExporter.ts` (Uint8Array/BlobPart)
- `src/features/location/ui/StartupLocationModal.tsx` (GeolocationRequestResult.reason)
- `src/features/poster/infrastructure/renderer/typography.ts` (.map on wrong type)
- `src/features/poster/ui/SettingsPanel.tsx` (MobileNavBar import)

---

## Architecture After This Session

```
globals.css = font import + Tailwind directives + design tokens (light/dark) + 1 MapLibre rule
Components = 100% Tailwind utilities (no CSS class dependencies)
Icons = 100% Lucide (no react-icons)
```
