# Plottura — Coding Guide

## Commands

```bash
bun install        # Install dependencies
bun run dev        # Start dev server (Vite)
bun run build      # Production build
bun run typecheck  # TypeScript type checking
```

## Architecture

- **Framework:** React 18 + TypeScript + Vite
- **Map engine:** MapLibre GL JS with OpenFreeMap tiles
- **UI:** Tailwind CSS + shadcn/ui + Lucide icons + Inter font
- **State:** PosterContext + useReducer (src/features/poster/ui/PosterContext.tsx)
- **Import alias:** `@/` maps to `src/`

## Directory Structure

```
src/
  app/            # Global styles (globals.css)
  core/           # Config, cache, platform, services
  features/
    export/       # PNG/SVG/PDF export pipeline
    layout/       # Poster dimension & layout presets
    location/     # Geocoding, search, startup modal
    map/          # MapLibre integration, themes, styles
    markers/      # Draggable marker system, icon registry
    poster/       # PosterContext, reducer, renderer
    theme/        # Theme definitions and colour palettes
    install/      # PWA install prompt (deferred)
  shared/         # Shared UI components, hooks, icons
  styles/         # Legacy CSS (index.css)
```

## Key Conventions

- Functional components only (no class components)
- TypeScript strict mode enabled
- Feature-sliced architecture: domain / application / infrastructure / ui per feature
- Use `@/` import alias, never relative paths crossing feature boundaries
