# Phase 2 — Architecture Modernization & UX Polish

**Date:** 2026-04-08
**Status:** In Progress — M1+M2 complete (commit 8c3ff11), M3-M5 pending
**Context:** After Phase 1 rebrand, modernize CSS architecture to pure Tailwind, migrate icons to Lucide, and fix UX issues. The 3D isometric poster view is the project's key future milestone — all architecture decisions prioritize flexibility for that integration.

---

## Milestone 1 — Icon Migration (react-icons → Lucide)

**Goal:** Replace all 18 react-icons marker icons with Lucide equivalents, remove react-icons dependency.

**Files:**
- `src/features/markers/infrastructure/iconRegistry.ts` — main registry, imports from react-icons/fa6, react-icons/io, react-icons/sl
- `src/features/markers/domain/types.ts` — imports `IconType` from react-icons

**Icon Mapping:**

| react-icons (current) | Lucide equivalent |
|---|---|
| FaLocationDot (fa6) | MapPin |
| FaHeart (fa6) | Heart |
| FaHouse (fa6) | House |
| FaStar (fa6) | Star |
| FaCircle (fa6) | Circle |
| FaSquare (fa6) | Square |
| FaXmark (fa6) | X |
| FaSun (fa6) | Sun |
| FaMoon (fa6) | Moon |
| FaBuilding (fa6) | Building2 |
| FaPaperPlane (fa6) | Send |
| FaRegSnowflake (fa6) | Snowflake |
| FaShop (fa6) | Store |
| FaCamera (fa6) | Camera |
| FaTree (fa6) | TreePine |
| FaFlag (fa6) | Flag |
| IoMdFlower (io) | Flower2 |
| SlTarget (sl) | Target |

**Approach:**
1. Replace `IconType` from react-icons with Lucide's `LucideIcon` type
2. Replace `createSvgIcon()` factory to work with Lucide components (they render as SVG natively)
3. Update all icon imports
4. Remove `react-icons` from package.json
5. Verify markers render correctly in poster preview

---

## Milestone 2 — CSS Architecture (globals.css → Tailwind)

**Goal:** Migrate ~370 lines of component CSS from globals.css to Tailwind utilities. globals.css retains ONLY design tokens (CSS custom properties for theming).

**Incremental sub-tasks:**
- **2a:** `.poster-viewport`, `.poster-frame`, `.poster-card` → Tailwind on PreviewPanel.tsx
- **2b:** `.map-container`, `.map-control-btn`, `.map-controls` → Tailwind on MapPreview.tsx, MapPrimaryControls.tsx
- **2c:** `.poster-text-overlay` (container queries, cqh units) → Tailwind @container + arbitrary values on PosterTextOverlay.tsx
- **2d:** `.poster-fade`, `.poster-ghost-layer` → Tailwind on GradientFades.tsx, PreviewPanel.tsx
- **2e:** `.marker-*`, mobile `@media` overrides → Tailwind on marker components
- **2f:** Final cleanup — verify globals.css has zero component CSS, only tokens

**Tailwind features used:**
- `@container` / `@[size]` for container queries
- Arbitrary values `[1cqh]`, `[aspect-ratio:...]` for CSS features
- `before:` / `after:` for pseudo-elements
- `max-[768px]:` for mobile media queries

---

## Milestone 3 — UX Cleanup

- **3a:** Remove FloatingSearchBar from canvas, remove StartupLocationModal, set DEFAULT_FORM coordinates to London (51.5074, -0.1278). Location search remains in sidebar only. Crosshair button in sidebar triggers geolocation.
- **3b:** Add sidebar collapse toggle — button in sidebar header, collapses to zero-width, map goes full viewport. Persist state in localStorage.
- **3c:** Replace native scrollbar in sidebar with custom slim scrollbar via Tailwind `scrollbar-*` utilities or CSS pseudo-element (`::-webkit-scrollbar`). Minimal, visible contrast.

---

## Milestone 4 — Theme Redesign

- **4a:** Remove theme description text from ThemeCard / ThemeSummarySection
- **4b:** Theme palette layout: full sidebar width, 2-column grid, color swatches as adjacent squares (no borders, no stroke, no circles, no cards). Light separator between rows.
- **4c:** Replace ghost map (blurred background layer) with a CSS gradient derived from the poster's dominant colors (darker tones preferred for contrast). Add drop-shadow to the poster card.

---

## Milestone 5 — Features

- **5a:** Add typefaces: Pacifico, Permanent Marker, Caveat, Lobster, Satisfy. Install Google Fonts, add to font selector dropdown in TypographySection.
- **5b:** Gradient toggles: add independent on/off switches for top and bottom gradient fades in Map Settings section. Wire to PosterContext form state.
- **5c:** Credits toggle: add on/off switch for attribution/credits in Map Settings. When off, show a small non-intrusive note explaining OSM license elsewhere (e.g., export metadata or tooltip).
- **5d:** Export SVG + PDF: useExport.ts already has `downloadSvg()` and `downloadPdf()`. Wire SidebarFooter to show format selector (dropdown or button group) instead of PNG-only button.

---

## Architecture Notes

- **Single CSS system:** After Milestone 2, all styling is Tailwind utilities + CSS custom properties for tokens. No component CSS classes in globals.css.
- **Design tokens stay in globals.css:** `--bg-app`, `--accent`, etc. continue as CSS custom properties toggled by `[data-theme]`. Tailwind references them via `tailwind.config.ts` extend.
- **Future-proofing for 3D:** The poster rendering pipeline (PreviewPanel → MapPreview → overlays) stays modular. The 3D isometric view will be an alternative renderer alongside the current 2D flat view, not a replacement. Clean component boundaries now make that integration easier.
