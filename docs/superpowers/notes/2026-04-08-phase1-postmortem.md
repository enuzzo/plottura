# Phase 1 Post-Implementation Notes & Known Issues

**Date:** 2026-04-08
**Context:** After completing the full Phase 1 rebrand & UI overhaul (11 tasks), a visual review revealed issues. This document captures findings, gotchas, and guidance for the next session.

---

## Critical Fix Applied

### Poster Preview CSS Was Missing

**Problem:** The cleanup task (Task 11) deleted `src/styles/` which contained all poster preview CSS. The section migrations (Tasks 4-9) only restyled sidebar UI components, but nobody restyled the poster preview components (`PreviewPanel`, `MapPreview`, `PosterTextOverlay`, `GradientFades`, `MarkerOverlay`, map controls). These components rely on CSS classes (`.poster-viewport`, `.poster-frame`, `.map-container`, `.poster-text-overlay`, `.poster-fade`, `.map-controls`, etc.) that use features impossible to express with Tailwind utilities alone: container queries (`cqh` units), complex `aspect-ratio` calculations, `::before` pseudo-elements, and deeply nested selectors.

**Fix:** Added ~370 lines of component CSS to `src/app/globals.css` (commit `9ab2713`). These styles use Plottura design tokens (`var(--bg-app)`, `var(--border)`, `var(--accent)`, etc.) instead of the old Terraink hardcoded colors.

**Gotcha for future work:** Any component that uses CSS class names (not Tailwind utilities) gets its styles from `globals.css`. If you see a class like `.poster-frame` or `.map-control-btn` in a component, the styles live in `globals.css`, NOT in a separate CSS file or inline.

---

## Known Visual Issues (Need Fixing)

### 1. Floating Search Bar State Loss on Dark Mode Toggle

**What happens:** When clicking the dark mode toggle (moon/sun icon in sidebar header), the floating search bar's location text clears. Before toggle: shows "Hanover, Germany". After toggle: empty field.

**Likely cause:** The `ThemeToggle` component calls `document.documentElement.setAttribute("data-theme", theme)` which may trigger a React re-render cascade. The `FloatingSearchBar` component manages its own focus state and may be resetting. Or the `FloatingSearchBar` reads `state.form.location` which might be getting cleared during the theme switch.

**Where to look:**
- `src/components/ThemeToggle.tsx` — the toggle handler
- `src/components/canvas/FloatingSearchBar.tsx` — check if it has local state that resets
- `src/features/poster/ui/PosterContext.tsx` — check if `data-theme` change triggers a state reset

**Fix approach:** The floating search bar should be a controlled component reading from `state.form.location`. If it's losing that value, the issue is upstream in the context. If it's a display issue only (value exists but field appears empty), it could be a color/styling issue where text becomes invisible against the background.

### 2. Map Control Buttons Styling

**What happens:** The "Edit Map" button uses the `.map-control-btn--primary` class with accent color styling. In some contexts (especially over dark poster themes), the button text/border may lack sufficient contrast.

**Where to look:**
- `src/app/globals.css` — `.map-control-btn--primary` styles
- `src/features/poster/ui/MapPrimaryControls.tsx` — button markup

**Fix approach:** Consider adding a semi-transparent background panel behind the map controls, or ensuring the buttons have enough opacity/contrast regardless of the poster theme behind them. The original Terraink used `rgba(14, 33, 46, 0.85)` backgrounds which provided consistent contrast. Our current buttons use `var(--bg-card)` which changes with light/dark mode but doesn't account for the poster content behind them.

### 3. Ghost Map Layer Opacity

**What happens:** The blurred ghost map behind the poster card is quite prominent, especially in dark mode. It may be more visually noisy than intended.

**Where to look:**
- `src/app/globals.css` — `.poster-ghost-layer` has `opacity: 0.35`
- Original Terraink used `opacity: 0.45` with a solid dark background (`#080f18`)

**Fix approach:** The ghost layer opacity may need tuning. Try `opacity: 0.25` for a subtler effect. The original worked because the viewport had a solid dark background; our version uses `var(--bg-app)` which is light gray in light mode, making the ghost layer look different.

---

## Architecture Gotchas for Next Session

### CSS Architecture (Hybrid Tailwind + Component CSS)

The app uses TWO CSS approaches:
1. **Tailwind utilities** — for sidebar UI, accordion sections, buttons, form controls, layout
2. **Component CSS in globals.css** — for poster preview, map container, text overlay, markers, map controls

This is intentional. The poster components use CSS features (container queries, `cqh` units, complex aspect-ratio math, pseudo-elements) that Tailwind can't handle. Don't try to convert these to Tailwind.

### Design Token Usage

All component CSS in globals.css uses CSS custom properties from the token system:
- Light theme: `var(--bg-app)` = `#F0F0F0`, `var(--bg-card)` = `#FFFFFF`, etc.
- Dark theme: automatically switches via `[data-theme="dark"]` selector
- The poster's own colors (`--poster-bg`) are separate from the UI theme

### react-icons Still in Dependencies

`react-icons` is still in `package.json` because the marker icon system (`src/features/markers/infrastructure/iconRegistry.ts`) imports 18 marker icons (FaHeart, FaStar, FaLocationDot, etc.) from `react-icons/fa6`. These are content icons rendered on the map poster, not UI chrome. Removing them requires migrating the marker icon registry to Lucide or a custom SVG system.

### Mobile Layout Is Partial

The mobile layout lost `MobileNavBar` and `MobileExportFab` during cleanup. The mobile path in `AppShell.tsx` still renders a drawer-based settings panel, but there's no bottom navigation or mobile export button. This is expected — the plan defers full mobile rework to Phase 1.5.

### Pre-existing TypeScript Errors

There are 3 pre-existing TypeScript errors in files we didn't modify:
- `src/features/export/infrastructure/pngExporter.ts`
- `src/features/location/ui/StartupLocationModal.tsx`
- `src/features/poster/ui/typography.ts` (or similar)

These existed before Phase 1 and should be investigated separately.

### Export Button Wiring

The sidebar "Export Poster" button is wired to `handleDownloadPng` (PNG only). The original had a flyout with PNG/SVG/PDF options. To add format selection back, modify `SidebarFooter.tsx` to include a dropdown or the export dialog from `useExport()`.

---

## File Reference

Key files for the next session:

| File | Purpose |
|---|---|
| `src/app/globals.css` | Design tokens + poster preview component CSS |
| `src/shared/ui/AppShell.tsx` | Root layout (sidebar + canvas) |
| `src/components/sidebar/` | Sidebar shell components |
| `src/components/canvas/FloatingSearchBar.tsx` | Floating search bar |
| `src/components/canvas/FloatingZoomControls.tsx` | Zoom +/- buttons |
| `src/components/ThemeToggle.tsx` | Dark mode toggle |
| `src/features/poster/ui/PreviewPanel.tsx` | Poster preview (564 lines, complex) |
| `src/features/poster/ui/PosterTextOverlay.tsx` | Text overlay with container queries |
| `src/features/poster/ui/GradientFades.tsx` | Top/bottom gradient fades |
| `src/features/map/ui/MapPreview.tsx` | MapLibre wrapper |
| `src/features/poster/ui/MapPrimaryControls.tsx` | Recenter/Edit Map buttons |
| `src/features/poster/ui/SettingsPanel.tsx` | Accordion sections container |
| `tailwind.config.ts` | Tailwind config with Plottura tokens |

---

## Git History

```
9ab2713 fix: restore poster preview CSS removed during cleanup
0e266d9 feat: remove old css, unused components, and Icons.tsx re-export layer
8cfcfce feat: add light/dark mode toggle
8e9dda3 feat: migrate typography section to tailwind
f518a51 feat: migrate markers section to tailwind + shadcn
775d415 feat: migrate layers section to tailwind + shadcn switch
230097d feat: migrate map settings section + floating zoom controls
968951b feat: migrate location section + add floating search bar
97af8bf feat: migrate theme section to tailwind + shadcn accordion
3538591 feat: new sidebar + canvas layout shell
fdd48c5 fix: remove stale CONTRIBUTING.md with Terraink branding
1ae3354 feat: rebrand terraink to plottura — name, assets, meta, strings
4bf7410 feat: add tailwind, shadcn/ui, inter font, and lucide infrastructure
1345d75 feat: import terraink source as baseline
```

Remote: https://github.com/enuzzo/plottura (private)
Tag: `v0.1.0` (on commit `0e266d9`, before the CSS fix)
