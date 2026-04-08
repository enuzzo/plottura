# Plottura — Coding Guide

## Commands

```bash
bun install        # Install dependencies
bun run dev        # Start dev server (Vite)
bun run build      # Production build
bun run typecheck  # TypeScript type checking
```

Note: bun is at `~/.bun/bin/bun` — you may need `export PATH="$HOME/.bun/bin:$PATH"`.

## Architecture

- **Framework:** React 18 + TypeScript + Vite
- **Map engine:** MapLibre GL JS with OpenFreeMap tiles
- **UI:** Tailwind CSS + shadcn/ui + Lucide icons + Inter font
- **State:** PosterContext + useReducer (src/features/poster/ui/PosterContext.tsx)
- **Import alias:** `@/` maps to `src/`

## CSS Architecture

- **All styling is Tailwind utilities** — no component CSS classes in globals.css
- `src/app/globals.css` contains ONLY: font import, Tailwind directives, design tokens (light/dark CSS custom properties), one MapLibre control-hide rule
- Design tokens: `var(--bg-app)`, `var(--accent)`, `var(--text-primary)`, etc. — toggled by `[data-theme="dark"]`
- Tailwind references tokens via `tailwind.config.ts` extend (e.g., `bg-accent` → `var(--accent)`)
- For complex button styles shared across components, use `const` class strings at the top of the file (see `CTL_BTN` pattern in PreviewPanel.tsx)
- Container queries: use `[container-type:size]` arbitrary property + `cqmin`/`cqh` in inline styles
- Slider thumbs: use `[&::-webkit-slider-thumb]:` and `[&::-moz-range-thumb]:` arbitrary variants

## Icons

- **All icons are Lucide** (`lucide-react`) — no react-icons
- Marker icons: `src/features/markers/infrastructure/iconRegistry.ts` — 18 predefined Lucide icons
- UI chrome icons: import directly from `lucide-react`

## Directory Structure

```
src/
  app/            # globals.css (tokens only)
  core/           # Config, cache, platform, services
  components/
    sidebar/      # Sidebar shell (Sidebar, SidebarHeader, SidebarFooter, SidebarSection)
    canvas/       # FloatingSearchBar (to be removed), FloatingZoomControls
  features/
    export/       # PNG/SVG/PDF export pipeline (useExport has all 3 handlers)
    layout/       # Poster dimension & layout presets
    location/     # Geocoding, search, startup modal (to be removed)
    map/          # MapLibre integration, themes, styles
    markers/      # Draggable marker system, icon registry (Lucide)
    poster/       # PosterContext, reducer, PreviewPanel, overlays
    theme/        # Theme definitions and colour palettes
    install/      # PWA install prompt (deferred)
  shared/         # Shared UI components (AppShell), hooks, geo utils
```

## Key Conventions

- Functional components only (no class components)
- TypeScript strict mode enabled
- Feature-sliced architecture: domain / application / infrastructure / ui per feature
- Use `@/` import alias, never relative paths crossing feature boundaries
- 4 pre-existing TS errors (pngExporter, StartupLocationModal, typography, MobileNavBar) — don't fix unless touching those files

## Current Status

Phase 2 in progress. See `docs/superpowers/specs/2026-04-08-phase2-architecture-and-ux-design.md` for full spec.
- **M1 done:** react-icons → Lucide migration
- **M2 done:** CSS architecture — pure Tailwind, globals.css tokens only
- **M3-M5 pending:** UX cleanup, theme redesign, new features

Handoff notes: `docs/superpowers/notes/2026-04-08-phase2-session1-handoff.md`

## Future Vision

The most important milestone is **3D isometric poster view** — all architecture decisions should keep the rendering pipeline modular to support an alternative 3D renderer alongside the current 2D flat view.
