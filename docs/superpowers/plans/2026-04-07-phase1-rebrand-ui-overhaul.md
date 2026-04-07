# Phase 1: Rebrand & UI Overhaul — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the Terraink fork into Plottura — a visually distinct cartographic poster engine with a new layout, design tokens, and brand identity.

**Architecture:** Incremental migration of a working React 18 + TypeScript + MapLibre app. Add Tailwind CSS + shadcn/ui alongside existing CSS. Rebuild the shell (sidebar + canvas) while preserving all feature logic. Remove old CSS and Terraink branding at the end.

**Tech Stack:** Bun, Vite, React 18, TypeScript, MapLibre GL JS, Tailwind CSS 3, shadcn/ui (Radix primitives), Lucide React, @fontsource-variable/inter

**Spec:** `docs/superpowers/specs/2026-04-07-phase1-rebrand-ui-overhaul-design.md`

**Source reference (Terraink original):** `assets/terraink-original/terraink-main/`

---

## Pre-flight: Copy fork source into working directory

Before any tasks, the Terraink source needs to be copied from the assets folder into the repo root as the working codebase.

- [ ] **Step 1: Copy Terraink source to repo root**

```bash
cp -R assets/terraink-original/terraink-main/* .
cp assets/terraink-original/terraink-main/.gitignore .
cp assets/terraink-original/terraink-main/.env.example .
```

- [ ] **Step 2: Install dependencies and verify it runs**

```bash
bun install
bun run dev
```

Expected: App launches at http://localhost:5173 showing the Terraink poster editor.

- [ ] **Step 3: Verify build**

```bash
bun run build
```

Expected: Clean build, no errors.

- [ ] **Step 4: Commit baseline**

```bash
git add -A
git commit -m "feat: import terraink source as baseline"
```

---

## Task 1: Infrastructure Setup (Tailwind + shadcn/ui + Inter + Lucide)

**Files:**
- Create: `tailwind.config.ts`
- Create: `postcss.config.js`
- Create: `src/app/globals.css`
- Create: `src/lib/utils.ts`
- Create: `components.json`
- Modify: `package.json` (add deps)
- Modify: `vite.config.js` (no change needed — alias already works)
- Modify: `src/main.tsx` (add globals.css import)
- Modify: `tsconfig.json` (add baseUrl for shadcn)
- Modify: `index.html` (no change yet)

- [ ] **Step 1: Install Tailwind + PostCSS + autoprefixer**

```bash
bun add -d tailwindcss postcss autoprefixer
bunx tailwindcss init -p --ts
```

- [ ] **Step 2: Install shadcn/ui dependencies**

**Strategy:** Install Radix primitives directly (not via `bunx shadcn@latest add` — the CLI may not work with Bun). All shadcn components will be manually created in `src/components/ui/` following the shadcn source patterns from https://ui.shadcn.com.

```bash
bun add tailwind-merge clsx class-variance-authority
bun add @radix-ui/react-accordion @radix-ui/react-switch @radix-ui/react-popover @radix-ui/react-dialog @radix-ui/react-select @radix-ui/react-slider @radix-ui/react-slot
```

- [ ] **Step 3: Install Inter font + Lucide icons**

```bash
bun add @fontsource-variable/inter lucide-react
```

- [ ] **Step 4: Create `postcss.config.js`**

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 5: Create `tailwind.config.ts`**

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        app: "var(--bg-app)",
        panel: "var(--bg-panel)",
        card: "var(--bg-card)",
        input: "var(--bg-input)",
        "input-focus": "var(--bg-input-focus)",
        border: "var(--border)",
        "border-subtle": "var(--border-subtle)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",
        accent: "var(--accent)",
        "accent-hover": "var(--accent-hover)",
        "accent-active": "var(--accent-active)",
        "accent-subtle": "var(--accent-subtle)",
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        danger: "var(--color-danger)",
        info: "var(--color-info)",
      },
      fontFamily: {
        sans: [
          "Inter Variable",
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
        mono: ["SF Mono", "Fira Code", "Cascadia Code", "monospace"],
      },
      fontSize: {
        xs: "12px",
        sm: "14px",
        base: "15px",
        lg: "17px",
        xl: "20px",
        "2xl": "24px",
      },
      borderRadius: {
        sm: "6px",
        md: "8px",
        lg: "11px",
        full: "9999px",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 6: Create `src/app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import "@fontsource-variable/inter";

/* ===== Plottura Design Tokens ===== */

/* Light theme (default) */
:root,
:root[data-theme="light"] {
  --bg-app: #F0F0F0;
  --bg-panel: #FAFAFA;
  --bg-card: #FFFFFF;
  --bg-input: #FFFFFF;
  --bg-input-focus: #FFFFFF;
  --border: #E5E5E5;
  --border-subtle: #EBEBEB;
  --text-primary: #1A1A1A;
  --text-secondary: #555555;
  --text-muted: #999999;
  --accent: #00BFA5;
  --accent-hover: #00D9BC;
  --accent-active: #00A891;
  --accent-subtle: rgba(0, 191, 165, 0.08);
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 8px 28px rgba(0, 0, 0, 0.10);
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-danger: #EF4444;
  --color-info: #3B82F6;
}

/* Dark theme */
:root[data-theme="dark"] {
  --bg-app: #0A0A0A;
  --bg-panel: #141414;
  --bg-card: #1C1C1C;
  --bg-input: #1C1C1C;
  --bg-input-focus: #222222;
  --border: #1E1E1E;
  --border-subtle: #1A1A1A;
  --text-primary: #F0F0F0;
  --text-secondary: #999999;
  --text-muted: #555555;
  --accent: #00BFA5;
  --accent-hover: #00D9BC;
  --accent-active: #00A891;
  --accent-subtle: rgba(0, 191, 165, 0.12);
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.20);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.30);
  --shadow-lg: 0 8px 28px rgba(0, 0, 0, 0.10);
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-danger: #EF4444;
  --color-info: #3B82F6;
}
```

- [ ] **Step 7: Create `src/lib/utils.ts`**

```ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 8: Create `components.json`** (shadcn/ui config)

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  }
}
```

- [ ] **Step 9: Add globals.css import to `src/main.tsx`**

Add at the top of imports (before the existing `./styles/index.css`):

```ts
import "@/app/globals.css";
```

Both old CSS and new Tailwind now coexist.

- [ ] **Step 10: Verify app still builds and runs**

```bash
bun run build && bun run dev
```

Expected: App runs with both old CSS and Tailwind loaded. No visual changes yet.

- [ ] **Step 11: Commit**

```bash
git add tailwind.config.ts postcss.config.js components.json src/app/globals.css src/lib/utils.ts src/main.tsx package.json bun.lock tsconfig.json
git commit -m "feat: add tailwind, shadcn/ui, inter font, and lucide infrastructure"
```

---

## Task 2: Rebrand Pass

**Files:**
- Modify: `package.json` (name, version)
- Modify: `index.html` (title, meta, favicons, all Terraink refs)
- Create: `public/favicon.svg`
- Remove: `TRADEMARK.md`, `agent.md`
- Remove: `public/assets/` (Terraink logos, showcase images)
- Remove: `.github/PULL_REQUEST_TEMPLATE.md`
- Remove: `.vscode/commit-instructions.md`
- Create: `README.md` (new Plottura readme)
- Create: `CLAUDE.md` (new Plottura coding guide)
- Modify: All source files with Terraink string references

- [ ] **Step 1: Update `package.json`**

Change `"name": "terraink"` → `"name": "plottura"`, `"version": "0.4.2"` → `"version": "0.1.0"`.

- [ ] **Step 2: Create `public/favicon.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="7" fill="#00BFA5"/>
  <text x="16" y="23" text-anchor="middle" fill="white" font-family="Inter, system-ui, sans-serif" font-weight="700" font-size="20">P</text>
</svg>
```

- [ ] **Step 3: Remove Terraink-specific files**

```bash
rm -f TRADEMARK.md agent.md
rm -rf .github/
rm -f .vscode/commit-instructions.md
rm -rf public/assets/
rm -f public/site.webmanifest
```

- [ ] **Step 4: Rewrite `index.html`**

Replace the entire `<head>` and meta section with Plottura branding. Remove all Terraink references, OG images, JSON-LD, and PWA manifest references. Keep the basic structure: `<div id="root">` and the script tag.

Key changes:
- Title: "Plottura — From plot to print"
- Description: "Create print-ready cartographic posters for any place on Earth."
- Favicon: `/favicon.svg`
- Remove canonical URL (no domain live yet)
- Remove all OG/Twitter tags (add later with real images)
- Remove JSON-LD structured data
- Remove PWA manifest link
- Remove service worker registration hints
- Theme color: `#00BFA5`

- [ ] **Step 5: Global string replacements across source**

```bash
# Find all files with Terraink references
grep -r "Terraink\|terraink\|TerraInk\|TERRAINK" src/ --include="*.ts" --include="*.tsx" -l
```

For each file found, replace:
- `TerraInk` → `Plottura`
- `Terraink` → `Plottura`
- `terraink` → `plottura`
- `terraink.app` → `plottura.app`

Also remove Ko-fi, Product Hunt, and social link references from any source files.

- [ ] **Step 6: Remove service worker registration from `src/main.tsx`**

Delete the service worker block (lines 30-35 in original). PWA deferred.

- [ ] **Step 7: Create `README.md`**

Content per PLOTTURA-PLAN.md Section 9:
- Header: "Plottura — From plot to print"
- Feature list
- Attribution: Fork of Terraink by Yousuf Amanuel
- License: AGPL-3.0

- [ ] **Step 8: Create `CLAUDE.md`**

Adapt from Terraink's CLAUDE.md:
- Update commands section (same: `bun install`, `bun run dev`, `bun run build`)
- Keep architecture description but replace all Terraink refs
- Add Plottura-specific notes: Tailwind + shadcn/ui, CSS custom properties, Inter font
- Keep import rules, naming conventions

- [ ] **Step 9: Verify build**

```bash
bun run build && bun run dev
```

Expected: App runs, says "Plottura" everywhere, no Terraink references visible.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: rebrand terraink to plottura — name, assets, meta, strings"
```

---

## Task 3: New AppShell — Sidebar + Canvas Layout

This is the core layout rebuild. Build the new shell components and wire them into AppShell, wrapping the existing SettingsPanel content.

**Files:**
- Create: `src/components/sidebar/Sidebar.tsx`
- Create: `src/components/sidebar/SidebarHeader.tsx`
- Create: `src/components/sidebar/SidebarSection.tsx`
- Create: `src/components/sidebar/SidebarFooter.tsx`
- Create: `src/components/canvas/MapCanvas.tsx`
- Create: `src/components/ui/accordion.tsx` (shadcn Accordion primitive)
- Modify: `src/shared/ui/AppShell.tsx` (rewrite)

- [ ] **Step 1: Create `src/components/sidebar/SidebarHeader.tsx`**

```tsx
import { cn } from "@/lib/utils";

interface SidebarHeaderProps {
  className?: string;
}

export default function SidebarHeader({ className }: SidebarHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 px-5 py-4 border-b border-border",
        className
      )}
    >
      <div className="w-[30px] h-[30px] bg-accent rounded-[7px] flex items-center justify-center font-bold text-white text-[15px]">
        P
      </div>
      <span className="text-xl font-bold text-text-primary tracking-tight">
        Plottura
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Create `src/components/sidebar/SidebarFooter.tsx`**

```tsx
import { cn } from "@/lib/utils";

interface SidebarFooterProps {
  onExport: () => void;
  isExporting: boolean;
  className?: string;
}

export default function SidebarFooter({
  onExport,
  isExporting,
  className,
}: SidebarFooterProps) {
  return (
    <div
      className={cn(
        "px-5 py-3.5 border-t border-border bg-panel",
        className
      )}
    >
      <button
        type="button"
        onClick={onExport}
        disabled={isExporting}
        className="w-full h-10 bg-accent hover:bg-accent-hover active:bg-accent-active text-white font-semibold text-[15px] rounded-[9px] transition-colors shadow-[0_2px_8px_rgba(0,191,165,0.2)] disabled:opacity-50"
      >
        {isExporting ? "Exporting…" : "Export Poster"}
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Create `src/components/sidebar/Sidebar.tsx`**

```tsx
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import SidebarHeader from "./SidebarHeader";
import SidebarFooter from "./SidebarFooter";

interface SidebarProps {
  children: ReactNode;
  onExport: () => void;
  isExporting: boolean;
  className?: string;
}

export default function Sidebar({
  children,
  onExport,
  isExporting,
  className,
}: SidebarProps) {
  return (
    <aside
      className={cn(
        "w-[320px] min-w-[320px] bg-panel border-r border-border flex flex-col h-screen",
        className
      )}
    >
      <SidebarHeader />
      <div className="flex-1 overflow-y-auto">{children}</div>
      <SidebarFooter onExport={onExport} isExporting={isExporting} />
    </aside>
  );
}
```

- [ ] **Step 4: Create `src/components/ui/accordion.tsx`**

Manually create the shadcn Accordion component wrapping `@radix-ui/react-accordion`. Follow the shadcn source pattern: export `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent`. Style triggers with Tailwind: `flex items-center justify-between py-3 px-5 text-[15px] font-semibold text-text-primary hover:bg-accent-subtle transition-colors`. Content animates via Radix `data-state` with `overflow-hidden` and CSS keyframes for slide-down/slide-up.

- [ ] **Step 5: Create `src/components/sidebar/SidebarSection.tsx`**

A thin wrapper around shadcn `AccordionItem` that adds Plottura's section styling:

```tsx
import { type ReactNode } from "react";
import { type LucideIcon } from "lucide-react";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

interface SidebarSectionProps {
  value: string;
  icon: LucideIcon;
  label: string;
  children: ReactNode;
}

export default function SidebarSection({
  value,
  icon: Icon,
  label,
  children,
}: SidebarSectionProps) {
  return (
    <AccordionItem value={value} className="border-b border-border-subtle">
      <AccordionTrigger className="px-5 py-3 gap-2">
        <div className="flex items-center gap-2">
          <Icon size={18} className="text-text-muted" />
          <span>{label}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-5 pb-4">
        {children}
      </AccordionContent>
    </AccordionItem>
  );
}
```

- [ ] **Step 6: Create `src/components/canvas/MapCanvas.tsx`**

A wrapper that renders the existing `PreviewPanel` inside the new canvas layout:

```tsx
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MapCanvasProps {
  children: ReactNode;
  className?: string;
}

export default function MapCanvas({ children, className }: MapCanvasProps) {
  return (
    <main
      className={cn(
        "flex-1 bg-app flex items-center justify-center relative overflow-hidden",
        className
      )}
    >
      {children}
    </main>
  );
}
```

- [ ] **Step 7: Rewrite `src/shared/ui/AppShell.tsx`**

Replace the entire component with the new sidebar + canvas layout. The old SettingsPanel is rendered inside the Sidebar, and PreviewPanel inside MapCanvas. Keep all existing state management and hooks.

Key changes:
- Remove `GeneralHeader`, `DesktopNavBar`, `FooterNote`, `InstallPrompt`, `AnnouncementModal` renders
- Import and render `Sidebar` + `MapCanvas` side by side in a flex container
- Keep `SettingsPanel` rendering inside `Sidebar` (will be migrated section-by-section in later tasks)
- Keep `PreviewPanel` rendering inside `MapCanvas`
- Keep all `PosterContext` state and mobile drawer logic for now
- Keep `DesktopLocationBar` rendering (will be moved to floating position later)
- Keep `StartupLocationModal` rendering

**Export wiring:** The existing export flow is in `src/features/export/application/useExport.ts`. Import `useExport` in AppShell and pass its trigger function to SidebarFooter:

```tsx
import { useExport } from "@/features/export/application/useExport";
// ... inside AppShell:
const { handleExport } = useExport();
// ... in JSX:
<Sidebar onExport={handleExport} isExporting={state.isExporting}>
```

Note: `useExport` reads `PosterContext` internally for all poster data. The `handleExport` function handles the full pipeline (capture map → composite → download). Check the actual hook signature and adapt — it may need `mapRef` or format params.

The AppShell should render:
```tsx
<div className="flex h-screen font-sans text-text-primary bg-app">
  <Sidebar onExport={handleExport} isExporting={state.isExporting}>
    <SettingsPanel />
  </Sidebar>
  <MapCanvas>
    <PreviewPanel />
  </MapCanvas>
</div>
```

- [ ] **Step 8: Verify app runs with new layout**

```bash
bun run dev
```

Expected: Sidebar on left (320px) with existing settings content. Map preview on right filling remaining space. Old CSS still applies to inner components but the shell is new.

- [ ] **Step 9: Commit**

```bash
git add src/components/ src/shared/ui/AppShell.tsx
git commit -m "feat: new sidebar + canvas layout shell"
```

---

## Task 4: Migrate Theme Section

Replace the theme/layout accordion sections with Tailwind-styled components inside a shadcn Accordion.

**Files:**
- Create: `src/components/ui/accordion.tsx` (shadcn primitive)
- Modify: `src/features/poster/ui/SettingsPanel.tsx` (replace accordion with shadcn)
- Modify: `src/features/theme/ui/ThemeCard.tsx` (restyle)
- Modify: `src/features/theme/ui/ThemeColorEditor.tsx` (restyle)
- Modify: `src/features/map/ui/MapSettingsSection.tsx` (restyle theme/layout parts)

- [ ] **Step 1: Refactor SettingsPanel to use shadcn Accordion + SidebarSection**

The `accordion.tsx` and `SidebarSection.tsx` were already created in Task 3. Now replace the custom accordion logic in `SettingsPanel.tsx`:

- Remove the custom `AccordionHeader` component and `toggleSection`/`openSections` state
- Remove imports from `@/shared/ui/Icons` (the old custom icons)
- Wrap the form in `<Accordion type="single" defaultValue="theme">`
- Each section becomes `<SidebarSection value="theme" icon={Palette} label="Theme">...</SidebarSection>`
- Import Lucide icons: `Palette`, `MapPin`, `Map`, `Layers`, `MapPinPlus`, `Type`
- Rename sections: "Layout" → "Map Settings", "Style" → "Typography"

**PosterContext wiring note:** `SettingsPanel` already calls `usePosterContext()` and passes state/dispatch to each child section. This wiring is preserved — only the accordion chrome changes, not the data flow. Each `LocationSection`, `MapSettingsSection`, etc. still receives the same props from the same hooks.

- [ ] **Step 3: Restyle ThemeCard with Tailwind**

Replace CSS classes with Tailwind utilities. Theme cards should be a 2-column grid with:
- `bg-card border border-border rounded-md` (default)
- `border-2 border-accent` (selected)
- Color preview swatch centered in card

- [ ] **Step 4: Restyle ThemeColorEditor with Tailwind**

Replace CSS classes. Color swatches in a vertical list with label + swatch button per row. Swatch opens existing `react-colorful` picker in a Popover.

- [ ] **Step 5: Verify theme section looks correct**

```bash
bun run dev
```

Expected: Theme section in sidebar uses new Tailwind styling. Accordion opens/closes smoothly. Theme selection and color editing still work.

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/accordion.tsx src/features/poster/ui/SettingsPanel.tsx src/features/theme/ src/features/map/ui/MapSettingsSection.tsx
git commit -m "feat: migrate theme section to tailwind + shadcn accordion"
```

---

## Task 5: Migrate Location Section + Floating Search Bar

**Files:**
- Create: `src/components/canvas/FloatingSearchBar.tsx`
- Modify: `src/features/location/ui/LocationSection.tsx` (restyle)
- Modify: `src/features/location/ui/StartupLocationModal.tsx` (restyle with shadcn Dialog)
- Modify: `src/shared/ui/AppShell.tsx` (add FloatingSearchBar to canvas)

- [ ] **Step 1: Create `src/components/canvas/FloatingSearchBar.tsx`**

A floating search bar positioned absolute top-center on the map canvas. It provides a secondary entry point for location search (the primary is in the sidebar Location section). Both share the same autocomplete hook.

```tsx
import { useState, useRef, useEffect } from "react";
import { MapPin, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePosterContext } from "@/features/poster/ui/PosterContext";
import { useLocationAutocomplete } from "@/features/location/application/useLocationAutocomplete";
import { useFormHandlers } from "@/features/poster/application/useFormHandlers";
import { useMapSync } from "@/features/map/application/useMapSync";
import type { SearchResult } from "@/features/location/domain/types";

export default function FloatingSearchBar({ className }: { className?: string }) {
  const { state, dispatch, mapRef } = usePosterContext();
  const { handleChange, handleLocationSelect, handleClearLocation, setLocationFocused } = useFormHandlers();
  const [isFocused, setIsFocused] = useState(false);
  const { locationSuggestions, isLocationSearching, searchNow } = useLocationAutocomplete(
    state.form.location,
    isFocused,
  );
  const { flyToLocation } = useMapSync(state, dispatch, mapRef);
  const inputRef = useRef<HTMLInputElement>(null);

  const showSuggestions = isFocused && locationSuggestions.length > 0;

  const onSelect = (result: SearchResult) => {
    handleLocationSelect(result);
    flyToLocation(result.lat, result.lon);
    setIsFocused(false);
    inputRef.current?.blur();
  };

  return (
    <div className={cn("absolute top-3.5 left-1/2 -translate-x-1/2 z-10 w-full max-w-[360px]", className)}>
      <div className="bg-white/95 dark:bg-card/95 backdrop-blur-[12px] border border-border rounded-lg shadow-md flex items-center gap-2.5 px-4 py-2.5">
        <MapPin size={16} className="text-text-muted shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={state.form.location}
          onChange={(e) => handleChange(e)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          name="location"
          placeholder="Search location..."
          className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
        />
        {state.form.location && (
          <button type="button" onClick={handleClearLocation} className="text-text-muted hover:text-text-secondary">
            <X size={14} />
          </button>
        )}
      </div>
      {showSuggestions && (
        <div className="mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto">
          {locationSuggestions.map((result) => (
            <button
              key={result.place_id}
              type="button"
              className="w-full text-left px-4 py-2.5 text-sm text-text-primary hover:bg-accent-subtle transition-colors"
              onMouseDown={() => onSelect(result)}
            >
              {result.display_name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

Note: Check the actual `handleChange` signature — it may expect a React ChangeEvent. Adapt the input's onChange accordingly. The `name="location"` attribute should match the form field name used by `useFormHandlers`.

- [ ] **Step 2: Restyle LocationSection with Tailwind**

Replace all CSS classes in `LocationSection.tsx` with Tailwind utilities. Form controls use `bg-input border-border rounded-sm text-base` tokens.

- [ ] **Step 3: Restyle StartupLocationModal with shadcn Dialog**

Replace the custom modal markup with shadcn `Dialog` component. Same content, new chrome.

- [ ] **Step 4: Add FloatingSearchBar to AppShell canvas area**

In `AppShell.tsx`, render `FloatingSearchBar` inside `MapCanvas` as an absolute-positioned overlay above the map.

- [ ] **Step 5: Verify location search works from both sidebar and canvas**

```bash
bun run dev
```

Expected: Search from floating bar triggers autocomplete. Selecting a result flies the map. Sidebar Location section also works independently.

- [ ] **Step 6: Commit**

```bash
git add src/components/canvas/FloatingSearchBar.tsx src/features/location/ src/shared/ui/AppShell.tsx
git commit -m "feat: migrate location section + add floating search bar"
```

---

## Task 6: Migrate Map Settings Section

**Files:**
- Modify: `src/features/map/ui/MapSettingsSection.tsx` (restyle)
- Modify: `src/features/map/ui/MapSettingsPickers.tsx` (restyle)
- Modify: `src/features/map/ui/MapDimensionFields.tsx` (restyle)
- Create: `src/components/canvas/FloatingZoomControls.tsx`
- Modify: `src/shared/ui/AppShell.tsx` (add zoom controls)

- [ ] **Step 1: Restyle MapSettingsSection with Tailwind**

Replace CSS classes. Sliders, dropdowns, and dimension inputs use Tailwind tokens. Use shadcn `Select` for dropdowns, shadcn `Slider` for range inputs.

- [ ] **Step 2: Restyle MapDimensionFields with Tailwind**

Width/height inputs with aspect ratio lock button. Use `bg-input border-border rounded-sm` tokens. The aspect ratio lock toggle is already implemented in the Terraink source (`MapDimensionFields.tsx`) — preserve its logic, only restyle the button with Tailwind: `p-1.5 rounded-sm border border-border hover:bg-accent-subtle` with a Lucide `Lock`/`Unlock` icon replacing whatever icon it currently uses.

- [ ] **Step 3: Create `FloatingZoomControls`**

```tsx
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePosterContext } from "@/features/poster/ui/PosterContext";

export default function FloatingZoomControls({ className }: { className?: string }) {
  const { mapRef } = usePosterContext();

  const zoomIn = () => mapRef.current?.zoomIn();
  const zoomOut = () => mapRef.current?.zoomOut();

  const btnBase = "w-[34px] h-[34px] bg-white/95 dark:bg-card/95 border border-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-card transition-colors shadow-sm";

  return (
    <div className={cn("absolute bottom-4 right-4 z-10 flex flex-col", className)}>
      <button type="button" onClick={zoomIn} className={cn(btnBase, "rounded-t-md")} aria-label="Zoom in">
        <Plus size={16} />
      </button>
      <button type="button" onClick={zoomOut} className={cn(btnBase, "rounded-b-md border-t-0")} aria-label="Zoom out">
        <Minus size={16} />
      </button>
    </div>
  );
}
```

Note: Check `mapRef.current` type — MapLibre's `Map` instance has `zoomIn()` and `zoomOut()` methods. If the ref stores a different wrapper, adapt accordingly.

- [ ] **Step 4: Add FloatingZoomControls to canvas**

Render in `MapCanvas` area of `AppShell.tsx`.

- [ ] **Step 5: Verify map settings and zoom work**

```bash
bun run dev
```

- [ ] **Step 6: Commit**

```bash
git add src/features/map/ src/components/canvas/FloatingZoomControls.tsx src/shared/ui/AppShell.tsx
git commit -m "feat: migrate map settings section + floating zoom controls"
```

---

## Task 7: Migrate Layers Section

**Files:**
- Modify: `src/features/map/ui/LayersSection.tsx` (restyle)

- [ ] **Step 1: Restyle LayersSection with Tailwind**

Replace CSS toggle switches with shadcn `Switch` components. Each layer: label (text-base, text-secondary) + Switch aligned right. Vertical stack with gap-3.

- [ ] **Step 2: Create shadcn Switch component**

Manually create `src/components/ui/switch.tsx` wrapping `@radix-ui/react-switch` (already installed in Task 1). Follow shadcn source pattern. Style: 44×24px track with teal accent when checked, 18px thumb.

- [ ] **Step 3: Verify layer toggles work**

```bash
bun run dev
```

Toggle each layer on/off and verify the map updates.

- [ ] **Step 4: Commit**

```bash
git add src/features/map/ui/LayersSection.tsx src/components/ui/switch.tsx
git commit -m "feat: migrate layers section to tailwind + shadcn switch"
```

---

## Task 8: Migrate Markers Section

**Files:**
- Modify: `src/features/markers/ui/MarkersSection.tsx` (restyle)
- Modify: `src/features/markers/ui/MarkerPicker.tsx` (restyle, use shadcn Dialog)
- Modify: `src/features/markers/ui/MarkerVisual.tsx` (restyle)

- [ ] **Step 1: Restyle MarkersSection with Tailwind**

"Add marker" button: `bg-accent text-white rounded-md`. Marker list: vertical stack with edit/delete buttons per item. Size slider: shadcn `Slider`.

- [ ] **Step 2: Restyle MarkerPicker with shadcn Dialog**

Replace the custom `PickerModal` usage with shadcn `Dialog`. Icon grid inside the dialog.

- [ ] **Step 3: Verify markers work end-to-end**

```bash
bun run dev
```

Add a marker, change its icon, resize it, drag it on the map, delete it.

- [ ] **Step 4: Commit**

```bash
git add src/features/markers/
git commit -m "feat: migrate markers section to tailwind + shadcn"
```

---

## Task 9: Migrate Typography Section

**Files:**
- Modify: `src/features/poster/ui/TypographySection.tsx` (restyle)

- [ ] **Step 1: Restyle TypographySection with Tailwind**

Text inputs: `bg-input border-border rounded-sm text-base`. Font family dropdown: shadcn `Select`. Font weight picker. Font size slider: shadcn `Slider`. Text alignment buttons.

- [ ] **Step 2: Verify typography changes reflect on poster**

```bash
bun run dev
```

Change title, subtitle, font, weight, size, alignment — all should update the poster preview live.

- [ ] **Step 3: Commit**

```bash
git add src/features/poster/ui/TypographySection.tsx
git commit -m "feat: migrate typography section to tailwind"
```

---

## Task 10: Dark Mode Toggle

**Files:**
- Create: `src/components/ThemeToggle.tsx`
- Modify: `src/components/sidebar/SidebarHeader.tsx` (add toggle)

- [ ] **Step 1: Create `src/components/ThemeToggle.tsx`**

```tsx
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    return (localStorage.getItem("plottura-theme") as "light" | "dark") || "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("plottura-theme", theme);
  }, [theme]);

  return (
    <button
      type="button"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className={cn(
        "w-8 h-8 rounded-md flex items-center justify-center text-text-muted hover:text-text-secondary hover:bg-accent-subtle transition-colors",
        className
      )}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
    </button>
  );
}
```

- [ ] **Step 2: Add ThemeToggle to SidebarHeader**

Add the toggle button at the right side of the header (with `ml-auto`).

- [ ] **Step 3: Verify dark mode works**

```bash
bun run dev
```

Click toggle. All UI chrome should switch to dark tokens. Map poster preview should be unaffected (poster themes are independent).

- [ ] **Step 4: Commit**

```bash
git add src/components/ThemeToggle.tsx src/components/sidebar/SidebarHeader.tsx
git commit -m "feat: add light/dark mode toggle"
```

---

## Task 11: Cleanup

Remove all old CSS, old components, and stale dependencies.

**Files:**
- Remove: `src/styles/` (entire directory — all old CSS)
- Remove: `src/features/install/` (PWA install prompt)
- Remove: `src/features/updates/` (announcement modal)
- Remove: `src/shared/ui/AboutModal.tsx`
- Remove: `src/shared/ui/DesktopNavBar.tsx`
- Remove: `src/shared/ui/MobileNavBar.tsx`
- Remove: `src/shared/ui/GeneralHeader.tsx`
- Remove: `src/shared/ui/FooterNote.tsx`
- Remove: `src/shared/ui/SocialLinkGroup.tsx`
- Remove: `src/shared/ui/InfoPanel.tsx`
- Remove: `src/shared/ui/PickerModal.tsx`
- Remove: `src/shared/ui/Icons.tsx` (if all icons replaced)
- Remove: `src/shared/hooks/useRepoStars.ts`
- Remove: `src/features/poster/ui/SettingsInfo.tsx`
- Remove: `src/features/export/ui/DesktopExportFab.tsx`
- Remove: `src/features/export/ui/MobileExportFab.tsx`
- Remove: `src/features/export/ui/SupportModal.tsx`
- Modify: `src/main.tsx` (remove old styles/index.css import)
- Modify: `package.json` (remove react-icons)
- Modify: `vite.config.js` (remove react-icons chunk splitting)

- [ ] **Step 1: Remove old CSS directory**

```bash
rm -rf src/styles/
```

Remove the `import "./styles/index.css"` line from `src/main.tsx`.

- [ ] **Step 2: Remove unused feature directories**

```bash
rm -rf src/features/install/
rm -rf src/features/updates/
```

- [ ] **Step 3: Remove unused shared UI components**

```bash
rm -f src/shared/ui/AboutModal.tsx
rm -f src/shared/ui/DesktopNavBar.tsx
rm -f src/shared/ui/MobileNavBar.tsx
rm -f src/shared/ui/GeneralHeader.tsx
rm -f src/shared/ui/FooterNote.tsx
rm -f src/shared/ui/SocialLinkGroup.tsx
rm -f src/shared/ui/InfoPanel.tsx
rm -f src/shared/ui/PickerModal.tsx
rm -f src/shared/hooks/useRepoStars.ts
rm -f src/features/poster/ui/SettingsInfo.tsx
rm -f src/features/export/ui/DesktopExportFab.tsx
rm -f src/features/export/ui/MobileExportFab.tsx
rm -f src/features/export/ui/SupportModal.tsx
```

- [ ] **Step 4: Remove react-icons dependency**

```bash
bun remove react-icons
```

Update `vite.config.js`: remove the `react-icons` manual chunk entry.

- [ ] **Step 5: Remove Icons.tsx if empty**

Check if `src/shared/ui/Icons.tsx` still has any icons used. If all replaced by Lucide, delete it. If some remain, keep it for now.

- [ ] **Step 6: Final Terraink reference check**

```bash
grep -r "Terraink\|terraink\|TerraInk\|TERRAINK" src/ --include="*.ts" --include="*.tsx"
grep -r "Terraink\|terraink\|TerraInk\|TERRAINK" index.html package.json README.md CLAUDE.md
```

Expected: No results.

- [ ] **Step 7: Verify clean build**

```bash
bun run build
bun run dev
```

Expected: App builds clean, runs perfectly with only Tailwind CSS. No old CSS remnants. All features work: search, theme selection, color editing, layer toggles, markers, typography, export.

- [ ] **Step 8: Type check**

```bash
bun run typecheck
```

Fix any TypeScript errors from removed imports.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: remove old css, unused components, and react-icons — cleanup complete"
```

---

## Post-flight: Final Verification

- [ ] **Step 1: Full feature test**

1. Search for a location → map flies to it
2. Select a theme → poster colors change
3. Edit a theme color → color picker works, poster updates
4. Change poster dimensions → poster aspect ratio updates
5. Toggle layers on/off → map layers update
6. Add a marker → appears on map, draggable
7. Change marker icon and size → updates on map
8. Edit title/subtitle text → poster text updates
9. Change font family and size → poster typography updates
10. Toggle dark mode → UI switches, poster unaffected
11. Export PNG → downloads correctly
12. Export SVG → downloads correctly

- [ ] **Step 2: Tag release**

```bash
git tag v0.1.0
```
