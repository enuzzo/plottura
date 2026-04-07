# Vibemilk Theme QA Protocol

Use this protocol whenever:
- a new theme is added
- tokens affecting contrast or chrome are changed
- docs pages get visual redesigns
- a session ends with "it looks right in one theme" but not yet fully swept

## 0. Required Acceptance Rule
- Any new theme MUST execute this protocol before it is considered valid
- A theme is not "done" when the CSS exists; it is done only after this protocol passes
- No theme should be merged, released, or declared stable on the basis of one page, one screenshot, or one successful contrast run
- The goal is not only technical safety, but harmony with the rest of Vibemilk: controls, panels, docs pages, and specimen layouts must still feel like the same design system

## 1. Non-Negotiable Rules
- Always test over HTTP, not `file://`
- Preferred automated renderer on this machine: `Google Chrome Canary` headless
- Do not rely on Firefox headless here; it is unstable on macOS 26.3.1
- Verify both numbers and visuals. Contrast audit alone is not enough.

## 2. Baseline Commands
```bash
npm run build:tokens
npm run audit:gui-contrast
python3 -m http.server 8123 --bind 127.0.0.1
```

If any of these fail, the theme does not pass QA and should not be signed off.

## 3. Minimum Theme Set
For fast validation, always inspect these four first:
- `sakura-spring`
- `clean-sheet`
- `mint-protocol`
- `cathode-ray`

These expose the common failure modes:
- pastel low-contrast
- clean corporate washed-out states
- soft green low-separation controls
- dark neon overglow and edge noise

## 4. Full Sweep Matrix
Run a complete visual sweep page by page across all themes after any non-trivial docs or theme work.

Pages:
- `index.html`
- `pages/foundations.html`
- `pages/icons.html`
- `pages/comp-actions.html`
- `pages/comp-data.html`
- `pages/comp-overlays.html`
- `pages/comp-utilities.html`
- `pages/themes.html`
- `pages/integration.html`
- `pages/token-export.html`
- `pages/brand-voice.html`

Themes:
- `vibemilk-default`
- `vibemilk-dark`
- `cyber-grid`
- `acid-pop`
- `sakura-spring`
- `mono-brutalist`
- `mint-protocol`
- `cathode-ray`
- `clean-sheet`
- `clean-sheet-dark`
- `solar-dust`
- `geocities-97`

## 5. What To Check Visually
- Section hierarchy still reads clearly on desktop
- Sidebar labels, numbering, active state, and scroll retention feel stable
- New controls inherit theme personality without losing legibility
- Inputs, dropdowns, toggles, sliders, stepper, segmented controls stay visually distinct
- Scrollbars remain visible but not cartoonish
- Cards do not flatten into the page background
- Hero rows, specimen blocks, and note panels do not drift into low-contrast mush
- Brand Voice page keeps strong rhythm and does not collapse into a mobile-looking stack on desktop
- Icons page keeps contrast, equalized cards, and playful motion without visual noise

## 6. Theme Failure Patterns To Watch
- `sakura-spring`: muted pinks can erase borders and inactive text
- `clean-sheet`: soft corporate neutrals can hide states and separators
- `mint-protocol`: green-on-green can blur sliders and helper chrome
- `cathode-ray`: glow can overpower layout if edges are too loud
- `geocities-97`: bright surfaces can make scrollbar/thumb contrast disappear
- `mono-brutalist`: high restraint can make accents feel absent if controls get too subtle

## 7. Writing New Themes
When authoring a new theme:
- Start from a complete existing file, preferably `css/themes/cyber-grid.css`
- Override the full token set, not just colors you notice first
- Check `bg`, `text`, `stroke`, `accent`, focus, selection, controls, dropdown states, GUI tokens, and scrollbars
- Verify light themes especially carefully; they fail more often by softness than by obvious breakage
- Re-run token export and contrast audit before any sign-off

## 8. Mandatory Theme Validation Sequence
Execute this sequence every time a new theme is written:

1. Finish the theme token file and register it in the theme manifest
2. Run `npm run build:tokens`
3. Run `npm run audit:gui-contrast`
4. Start a local HTTP server
5. Perform a fast visual pass on the 4 fragile reference themes to recalibrate your eye
6. Perform a visual pass on the new theme across the full page matrix
7. Compare the new theme against at least one dark reference theme and one light reference theme
8. Fix any weak contrast, muddy chrome, flattened cards, or broken hierarchy
9. Repeat the audit and visual pass until the theme feels stable and system-native

The new theme should be judged on two axes:
- Stability: no broken states, missing separations, unreadable controls, or layout regressions
- Harmony: it still feels like Vibemilk, not like an unrelated skin pasted on top

## 9. Sign-Off Checklist
- `git diff --check` passes
- `npm run build:tokens` passes
- `npm run audit:gui-contrast` shows no risk themes
- Fast visual pass on the 4 fragile themes is clean
- Full page-by-page, theme-by-theme sweep is complete for release-grade sign-off
- The new theme has been reviewed for both stability and harmony with the rest of the system
- The theme can be described in one short sentence without apologizing for any weak section

## 10. Visual QA Record
When a new theme is validated, leave a short note in the session or commit context covering:
- theme name
- date
- which pages were checked
- which themes were used as comparison anchors
- any known compromises that were consciously accepted

If this note does not exist, assume the theme has not been fully validated yet.

## 11. Known-Good Screenshot Command
```bash
"/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary" \
  --headless=new \
  --disable-gpu \
  --virtual-time-budget=6000 \
  --window-size=1500,2200 \
  --screenshot=/tmp/vm_preview.png \
  "http://127.0.0.1:8123/pages/comp-actions.html#forms-live"
```

## 12. Current Open Reminder
The recent GUI/scrollbar/docs polish is numerically verified and partially visually checked, but still needs one full release-grade sweep:
- every modified docs page
- every built-in theme
- desktop-first, then spot-check mobile preview where layout density changed
