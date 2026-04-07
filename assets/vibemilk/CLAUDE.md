# Vibemilk Design System

## Rules
- Work ONLY within this project directory. Never read, write, or execute outside of it.

## What This Is
Vibemilk is a token-driven CSS design system by Netmilk Studio. Pure CSS custom properties + vanilla JS. No frameworks, no build tools required. Serves as a universal design reference for web (desktop/mobile), ESP32 tiny displays, Swift apps, and Rust projects.

## Architecture

```
css/core/tokens.css       → 270 design tokens (colors, type, spacing, shadows, motion, FX)
css/core/base.css         → Reset + base element styles
css/core/utilities.css    → Utility classes (spacing, layout, display)
css/components/*.css      → Component styles (surfaces, actions, forms, feedback, data-display)
css/themes/*.css          → Theme overrides via :root[data-theme="name"] selectors
css/vibemilk-core.css     → Aggregator: core + base + components
css/vibemilk-themes.css   → Aggregator: all themes
css/vibemilk.css          → Full bundle aggregator
css/docs.css              → Docs layout (not for production use)
css/showcase.css          → Component catalog styles (not for production use)
js/vibemilk-docs.js       → Theme manager + docs UI IIFE (~700 lines)
index.html                → Hub landing page with card navigation
pages/*.html              → Section pages (foundations, components, themes, integration, brand-voice, token-export)
partials/*.html           → Reference docs for shared HTML structure
scripts/build-tokens.js   → Token export: JSON, Swift, Rust, C/Arduino, Elementor
tokens/                   → Generated token exports
docs/brand-voice.md       → Netmilk communication style guide
```

## Naming Conventions
- All classes use `vm-` prefix
- BEM-adjacent: `.vm-btn`, `.vm-btn--primary`, `.vm-card__header`
- Tokens: `--bg-*`, `--text-*`, `--accent-*`, `--color-*`, `--fs-*`, `--fw-*`, `--space-*`, `--radius-*`, `--shadow-*`, `--transition-*`
- Theme selector: `:root[data-theme="theme-name"]`

## Theming
Each theme file overrides the full token set defined in `css/core/tokens.css`. Use `cyber-grid.css` (384 lines, most complete) as the template for new themes.

Theme manifest lives in `js/vibemilk-docs.js` at `THEME_MANIFEST` object. Register new themes there and in all `<select data-vm-theme-select>` elements.

Themes: vibemilk-default, vibemilk-dark, cyber-grid, acid-pop, sakura-spring, mono-brutalist, mint-protocol, cathode-ray, clean-sheet, clean-sheet-dark, solar-dust, geocities-97

## Key Commands
```bash
npm run build:tokens    # Generate JSON/Swift/Rust/C/Elementor token exports
npm run audit:gui-contrast  # Audit GUI/scrollbar contrast across all themes
```

## Browser Renderer Gotcha
- On this machine, Firefox 148.0.2 crashes during headless startup on macOS 26.3.1 before docs preview is usable. Do not use Firefox for automated preview or screenshots here.
- Preferred renderer for automated visual checks: `Google Chrome Canary` in headless mode.
- For docs pages with runtime theme switching, serve the repo over HTTP first. `file://` is unreliable for the full docs experience.
- Known-good local preview flow:

```bash
python3 -m http.server 8123 --bind 127.0.0.1
"/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary" \
  --headless=new \
  --disable-gpu \
  --virtual-time-budget=6000 \
  --window-size=1500,2200 \
  --screenshot=/tmp/vm_preview.png \
  "http://127.0.0.1:8123/pages/comp-actions.html#forms-live"
```

- If theme-specific screenshots are needed, prefer an HTTP-served helper or a controlled `localStorage` setup instead of relying on ad-hoc `file://` redirects.

## Language Convention
All files, code, comments, and documentation in English. Conversation with the user may be in Italian.

## Writing Style
See `docs/brand-voice.md` for the Netmilk communication style guide. TL;DR: irreverent but nerdy-competent, sarcastic but warm, cynical yet kawaii, never verbose, always factual and goal-oriented.

## Theme QA
- Before signing off docs or theme-heavy work, follow `docs/theme-qa-protocol.md`
- Any new theme MUST run the protocol before it is considered complete
- A new theme is not valid just because the token file exists or one page looks good
- Do not assume one good-looking theme implies cross-theme safety
- For quick visual risk checks, start with: `sakura-spring`, `clean-sheet`, `mint-protocol`, `cathode-ray`

## Fonts (Google Fonts)
Montserrat (300-800), Space Mono (400/700), Chakra Petch (400-700), Delius Unicase (400/700), IBM Plex Mono (400-700), Encode Sans Semi Expanded (400/500, theme-local for mint-protocol)

## Integration Modes
- **Single theme (production):** Load `vibemilk-core.css` + one theme file + set `data-theme` on `<html>`
- **Runtime switcher:** Load `vibemilk-core.css` + `vibemilk-docs.js` + add `<select data-vm-theme-select>`
- **Full bundle:** Load `vibemilk.css`

## AI Rules
1. Use `vm-*` classes, never invent parallel namespaces
2. Use tokens instead of hardcoded values
3. Override via `:root` tokens, not by patching component CSS
4. Preserve accessibility (labels, focus-visible, contrast)
5. Test both desktop and mobile preview
