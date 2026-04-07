# Plottura — Development Plan

> **"From plot to print."**
> Cartographic poster engine. Fork of [Terraink](https://github.com/yousifamanuel/terraink) by Yousuf Amanuel.

---

## 1. Identity

**Name:** Plottura
**Tagline:** From plot to print.
**Meaning:** Portmanteau of *plot* (to trace coordinates on a map; plotter machine) + *-tura* (Italian suffix denoting the result of an action, as in pittura, scultura). The art of plotting places.
**Domain:** plottura.app
**GitHub:** `enuzzo/plottura`
**License:** AGPL-3.0 (inherits from upstream). Code prior to Terraink's April 3 2026 cutoff remains MIT.

---

## 2. Fork Setup (Day 0)

### 2.1 Repository

- Fork `yousifamanuel/terraink` on GitHub → `enuzzo/plottura`.
- GitHub will automatically show "forked from yousifamanuel/terraink" — keep it.
- Rename `main` default branch. Keep `dev` as working branch per upstream convention.
- Update `package.json`: name → `plottura`, version → `0.1.0`.
- Remove Terraink trademark assets (logo, banner, favicon, OG images).
- Update all references: Terraink → Plottura, terraink.app → plottura.app.

### 2.2 License & Attribution

- Keep `LICENSE` (AGPL-3.0) and `LICENSE-OLD` (MIT) files intact.
- Update `README.md` with clear attribution:
  ```
  Plottura is a fork of [Terraink](https://github.com/yousifamanuel/terraink)
  by Yousuf Amanuel, originally inspired by
  [MapToPoster](https://github.com/originalankur/maptoposter) by Ankur Gupta.
  ```
- Remove `TRADEMARK.md` (it was Terraink-specific). Add own if needed later.

### 2.3 Cleanup

- Remove showcase images (they're Terraink's marketing).
- Remove Terraink social links, Product Hunt badges, Ko-fi.
- Remove `agent.md` (Terraink's AI coding instructions).
- Strip `.github/` templates or adapt to Plottura.

### 2.4 Verify It Runs

```bash
bun install
bun run dev
```

The app should work immediately — same features, new name. This is the checkpoint before any code changes.

---

## 3. Architecture Overview (Inherited)

```
Stack: Bun + Vite + React 18 + TypeScript
Map:   MapLibre GL JS + OpenFreeMap tiles (OpenMapTiles schema)
Geo:   Nominatim geocoding
Style: CSS (27% of codebase — will be replaced)
Export: PNG + SVG (both already working)
```

No backend. Fully client-side.

---

## 4. Feature Roadmap

### Phase 1 — Rebrand & UI Overhaul (on a working fork)

**Prerequisite:** Fork runs, Terraink references removed, `bun run dev` works.

**Goal:** Make it look and feel like Plottura. Ship a working app that is already better than upstream visually.

- [ ] **Branding assets** — Logo, favicon, OG images. Minimal mark that works at 16px and 512px. This comes first because everything else builds on the visual identity.
- [ ] **Design system** — Replace raw CSS with Tailwind + shadcn/ui components. Define Plottura design tokens: color palette, typography scale, spacing, radius, shadows.
- [ ] **New layout** — Redesign the editor panel. Current UI is functional but crowded. Target: clean sidebar with collapsible sections, full-bleed map preview, floating toolbar for quick actions.
- [ ] **Dark mode** — Default. The map editor is a creative tool, dark UI reduces distraction from the poster content. Light mode as option.
- [ ] **Responsive** — Tablet support at minimum. Poster design on phone is not a real use case.

**Checkpoint:** Plottura v0.1 — a visually distinct, rebranded, working poster engine.

### Phase 2 — Print Presets + Mockup Mode (Quick Wins)

**Goal:** Add the two features that immediately make Plottura more useful than upstream, without touching the map renderer.

#### 2a — Physical Format Presets

- [ ] **Frame size dropdown** with grouped categories:
  - **IKEA frames:** RIBBA (13×18, 21×30, 30×40, 40×50, 50×70 cm), HOVSTA, LOMVIKEN
  - **ISO standard:** A5, A4, A3, A2, A1, A0
  - **US standard:** 8×10", 11×14", 16×20", 18×24", 24×36"
  - **Square:** 20×20, 30×30, 40×40 cm
  - **Custom** (free input with live aspect ratio lock)
- [ ] **DPI selector** — 150 (screen/proof), 300 (print standard), 450 (fine art). Affects export pixel dimensions.
- [ ] **Bleed & crop marks** — Optional 3mm bleed + trim marks for professional printing.
- [ ] **PDF export** — jsPDF or similar. Client-side, embed fonts.

#### 2b — Poster Mockup Mode

- [ ] **Mockup renderer** — Show the poster in context:
  - White frame on white wall (minimal)
  - Black frame on dark wall (moody)
  - Wood frame in living room (lifestyle)
  - Desk lean (no frame, poster on shelf)
  - Grid display (2–4 posters together)
- [ ] **Implementation:** Start with CSS 3D transforms + perspective on room background images. Fast to build, good enough quality. Upgrade to Three.js later if needed.
- [ ] **Download mockup** — Export the mockup view as a separate PNG for sharing / Etsy listings.

**Checkpoint:** Plottura v0.2 — real print sizes, mockup previews, PDF export. Already a significantly better product than upstream.

### Phase 3 — 3D Terrain View ⭐ (Key Differentiator)

**Goal:** Generate poster-quality 3D views of any location, with elevation, hillshading, and extruded buildings.

**Note:** This is the biggest feature and the reason Plottura exists as a separate project. It builds on a stable, visually polished base from Phases 1–2.

- [ ] **Terrain DEM source** — Integrate raster-dem tiles. Options (evaluate in order):
  1. Mapzen Terrarium tiles (open, free, hosted by AWS/Stamen)
  2. MapTiler terrain (free tier, high quality)
  3. Self-hosted from SRTM/Copernicus DEM data
- [ ] **MapLibre terrain API** — `map.addSource('terrain', { type: 'raster-dem' })` + `map.setTerrain({ source: 'terrain', exaggeration: 1.5 })`.
- [ ] **Hillshade layer** — Native MapLibre `hillshade` layer type. Controls: shadow color, highlight color, azimuth (sun angle), altitude.
- [ ] **Camera controls** — Expose pitch (0°–85°), bearing (0°–360°), zoom as poster parameters. Add presets:
  - "Top-down" (pitch 0° — classic flat poster)
  - "Bird's eye" (pitch 45°)
  - "Cinematic" (pitch 60°, slight bearing offset)
  - "Panoramic" (pitch 75°, dramatic)
- [ ] **3D buildings** — `fill-extrusion` layer from OpenMapTiles `building` layer. Style with theme colors. Height from `render_height` / `render_min_height`.
- [ ] **Terrain exaggeration slider** — Vertical scale control (1x = realistic, 2–3x = dramatic poster).
- [ ] **2D/3D toggle** — Clean switch in toolbar.

**Checkpoint:** Plottura v0.3 — the version nobody else has. 3D cartographic posters.

### Phase 4 — Advanced Cartographic Styles

**Goal:** Go beyond color themes. Offer fundamentally different cartographic aesthetics.

- [ ] **Style engine** — Decouple visual styles from the theme system. A "style" = entire MapLibre style spec (layers, rendering). A "theme" = color palette applied to a style.
- [ ] **Built-in styles:**
  - **Classic** (current — roads, water, parks, buildings)
  - **Topographic** (contour lines from DEM, muted fills, USGS-inspired)
  - **Blueprint** (white lines on blue, technical drawing feel)
  - **Minimal** (roads only, ultra-clean)
  - **Noir** (dark base, glowing roads like city lights at night)
  - **Vintage** (parchment tones, serif labels, antique map feel)
  - **Xilograph** (woodcut look — heavy strokes, hatching, no fills)
- [ ] **Per-layer visibility** — Full control: roads, buildings, water, parks, railways, labels, contours.

### Phase 5 — Polish & Infrastructure

- [ ] **URL state** — Encode poster config in URL hash for shareable links.
- [ ] **Undo/redo** — Zustand middleware.
- [ ] **Keyboard shortcuts** — ⌘Z, ⌘S (export), arrows (pan), +/- (zoom).
- [ ] **Performance** — 3D terrain + buildings + high-res export. OffscreenCanvas for export.
- [ ] **CI/CD** — GitHub Actions: lint, typecheck, build, deploy preview on PR.
- [ ] **Analytics** — Plausible or Umami (self-hosted, privacy-respecting).

---

## 5. Non-Goals (For Now)

- User accounts / saved posters (keep it stateless)
- Payment / e-commerce
- Backend / API for batch generation
- Native mobile app
- AI-generated style suggestions

---

## 6. Technical Decisions

| Decision | Choice | Why |
|---|---|---|
| Package manager | Bun (inherited) | Fast, works, no reason to change |
| Styling | Tailwind + shadcn/ui | Replace 27% CSS with utility classes and composable components |
| State management | Zustand | Lightweight, fits React, good for undo/redo |
| 3D terrain tiles | Mapzen Terrarium (start) | Free, open, adequate quality. Upgrade to MapTiler if needed |
| PDF export | jsPDF + svg2pdf.js | Client-side, no backend needed |
| Mockup rendering | CSS 3D transforms (start) | Ship fast, upgrade to Three.js if quality insufficient |
| Font loading | Google Fonts API (inherited) | Works, broad selection |

---

## 7. Development Order

```
Day 0:     Fork, rebrand, verify it runs               → v0.0.1
Week 1-2:  Tailwind + shadcn migration, new layout      → v0.1.0
Week 3:    Print format presets, DPI, PDF export         → v0.1.5
Week 4:    Mockup mode v1                                → v0.2.0
Week 5-7:  3D terrain integration                        → v0.3.0
Week 8+:   Advanced styles, polish                       → v0.4.0+
```

Each phase ships a usable improvement. No big bang. The fork is functional from minute one.

---

## 8. File Structure (Target)

```
plottura/
├── public/
│   ├── assets/            # Plottura branding only
│   └── mockups/           # Room/frame template images
├── src/
│   ├── components/
│   │   ├── ui/            # shadcn/ui primitives
│   │   ├── editor/        # Sidebar panels
│   │   ├── map/           # MapLibre wrapper, terrain, 3D
│   │   ├── export/        # PNG/SVG/PDF export logic
│   │   └── mockup/        # Poster-in-frame renderer
│   ├── styles/            # Cartographic style definitions
│   ├── themes/            # Color palettes
│   ├── presets/            # Frame sizes, camera angles
│   ├── store/             # Zustand stores
│   ├── lib/               # Utils, constants, types
│   └── App.tsx
├── CONTRIBUTING.md
├── LICENSE                # AGPL-3.0
├── LICENSE-OLD            # MIT (upstream pre-April 2026)
├── README.md
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

---

## 9. README Structure (New)

```markdown
# Plottura

> From plot to print.

Cartographic poster engine with 2D and 3D terrain views.
Create print-ready map posters for any place on Earth.

[screenshot / demo gif]

## Features
- Custom map posters for any location, powered by OpenStreetMap
- 2D and 3D terrain views with hillshading and extruded buildings
- Real print format presets (IKEA frames, A-series, US sizes)
- High-res PNG, SVG, and PDF export with bleed/crop marks
- Poster mockup mode — see your poster framed on a wall
- Dozens of cartographic styles and color themes
- Fully client-side, no account required

## Attribution
Plottura is a fork of [Terraink](https://github.com/yousifamanuel/terraink)
by Yousuf Amanuel, originally inspired by
[MapToPoster](https://github.com/originalankur/maptoposter) by Ankur Gupta.

## License
AGPL-3.0. See LICENSE.
Code from Terraink prior to April 3, 2026 is MIT-licensed. See LICENSE-OLD.
```

---

## 10. Notes for Claude Code

- **This is a fork. It works already.** Start by running `bun install && bun run dev` and verifying everything functions before changing anything.
- Do NOT use the name "Terraink" anywhere in code, UI, or comments (trademark).
- Respect upstream attribution in README and LICENSE files always.
- English for all code, comments, variable names, docs.
- UI strings in English (i18n can come later).
- Commit messages: conventional commits (`feat:`, `fix:`, `refactor:`, `docs:`).
- When in doubt about a MapLibre API, check https://maplibre.org/maplibre-gl-js/docs/
- **Phase order matters.** Do not jump to 3D terrain before the UI overhaul is done and the app is visually distinct from Terraink. The fork must stand on its own before adding new features.
- Keep the app fully client-side. No backend, no API keys required for basic use.
- Test exports at real print sizes (A2 at 300dpi = 4960×7016px). Performance matters.
- When migrating CSS → Tailwind, work file by file. Don't attempt a bulk rewrite. Each component should be migrated, tested, then committed individually.
