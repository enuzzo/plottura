# Netmilk Studio — Brand Voice Guide

> How Netmilk writes. For READMEs, docs, UI copy, and anything that leaves the building with our name on it.

---

## The Netmilk Voice in One Sentence

**Technically precise, culturally irreverent, never verbose, always self-aware.**

We write like someone who knows exactly how the thing works, finds it slightly absurd that it exists, and is going to tell you about it anyway — because it's genuinely good and you should use it.

---

## Tone Spectrum

| Axis | Where we sit | What it means in practice |
|---|---|---|
| **Formal ↔ Casual** | 70% casual | We use contractions, first person plural, parenthetical asides. We don't use slang without purpose. |
| **Serious ↔ Playful** | 60% playful | Technical sections are precise. Introductions and descriptions earn the jokes. |
| **Humble ↔ Confident** | 75% confident | We know what we built. We also know it's a desk lamp running physics simulations in YAML. Both are true. |
| **Dry ↔ Warm** | Oscillates | Dry wit on the surface, genuine warmth underneath. Never cold. Never sappy. |

### The Four Ingredients

1. **Irreverent but nerdy-competent** — We make fun of the absurdity, but the specs are flawless.
2. **Sarcastic but warm** — The sarcasm is pointed at ourselves, not the reader.
3. **Cynical yet affectionate** — We know the limitations. We shipped it anyway. We're proud of it.
4. **Sly and sharp** — Every line earns its place. No filler. No corporate fog.

---

## README Structure

Every Netmilk README follows this skeleton. Not loosely — exactly.

### 1. Badge Row (required)

Colored badges, `for-the-badge` style, at the very top. No plain-text alternatives.

```markdown
[![Arduino](https://img.shields.io/badge/Arduino-Firmware-00979D?style=for-the-badge&logo=arduino&logoColor=white)](https://arduino.cc/)
[![ESP32-S3](https://img.shields.io/badge/ESP32--S3-Waveshare_3.49"-E7352C?style=for-the-badge&logo=espressif&logoColor=white)](https://www.espressif.com/)
```

**Rules:**
- Always `style=for-the-badge` — never flat, never plastic
- Colors match the tech stack or project palette
- Include the official logo when available (`&logo=...`)
- License badge always present, always last in the row
- Link each badge to its relevant URL

### 2. Opening Blockquote (required)

A sardonic, self-aware one-liner that sets the mood before any description.

> "What if I took the live camera feed and ran it through a shader that makes everything look like a 1970s vector art fever dream?"
> *Someone who had clearly watched too many Rutt-Etra videos at 2am and owned a bunch of unused Raspberry Pis*

> A CLI that converts videos.
> Wrapped in more BBS ANSI chrome than any video converter has any business having.

**Rules:**
- Sets the emotional tone for the entire project
- Can be a quote (attributed to a fictional/anonymous version of ourselves)
- Can be two short lines that juxtapose what it is vs. what it looks like
- Never earnest, always slightly self-deprecating

### 3. Bold One-Liner Pitch (required)

One paragraph, bolded project name, plain description of what it actually does. Immediately after the blockquote.

> **Synthalia** is an interactive light instrument disguised as a lamp. Five meters of WS2812B strip wound into an 18-turn helix, sealed inside a frosted glass cloche, controlled by hand gestures and brass knobs, powered by an ESP32-S3 running ESPHome.

**Rules:**
- One paragraph, 2-3 sentences max
- Bold the project name
- State what it is, what it uses, what it does
- No marketing language — just facts, clearly stated

### 4. The Kicker (optional but encouraged)

A short follow-up that reframes the pitch with personality.

> It is not a smart lamp. Smart lamps have apps.
> This has *physics simulations and a gesture smoothing pipeline.*

> This is not a camera filter app. Camera filter apps have sliders and a share button.
> This has a GLSL pipeline, a bare-metal DRM/KMS renderer, and a keyboard thread that intercepts Ctrl+C before the OS even knows it happened.

**Rules:**
- Contrasts "what normal people make" vs. "what we made"
- Italicize the punchline
- Two lines, parallel structure

### 5. "Why This Exists" Section (required for substantial projects)

The origin story. Always honest, always funny, always acknowledges the absurdity.

**Pattern:** Start with a universal relatable scenario → escalate through increasingly specific decisions → arrive at the current project as the inevitable conclusion.

> Every video conversion workflow starts the same way. You drag a file into some app. The app wants fifteen decisions about codecs you don't have opinions about...

> Every LED project starts the same way: *"I'll just make it glow."* Then you add a rotary encoder because buttons are for people who buy lamps at IKEA...

**Rules:**
- Use second person ("you") to pull the reader into the narrative
- Italicize internal monologue: *"I'll just make it glow."*
- Escalation is the comedic engine — each step more absurd than the last
- End with acceptance: "Both things are simultaneously true and we are at peace with it."

### 6. Hardware / Tech Table (when applicable)

| Component | Spec | Role |
|---|---|---|
| **MCU** | ESP32-S3, 240 MHz, dual-core | The brain. 16 MB flash, OPI PSRAM in octal mode, because LVGL needs room to think. |

**Rules:**
- Bold the component name
- "Role" column is where personality lives — start with a metaphor ("The brain."), follow with the actual reason
- Keep specs precise (exact values, model numbers)
- Parenthetical commentary in the role column is encouraged

### 7. Image Layouts

Side-by-side table layout: image on one side, description on the other.

```markdown
<table><tr>
<td width="55%"><img src="..." alt="..." width="100%"></td>
<td>

**Bold title.** Description paragraph with personality.

</td>
</tr></table>
```

**Rules:**
- Images explain more than text — use them aggressively
- Every image needs a descriptive alt text
- The description next to the image should be self-contained

### 8. Closing Elements (required)

**License block:** Always MIT. Always with a sardonic one-liner.

> MIT — Use it, fork it, modify it, put it on a desk somewhere and tell people it's art (it is).

**Closing italic line:** Poetic, absurd, centered. The last thing anyone reads.

> *Built with ESPHome, too many smoothing constants, and the unwavering belief*
> *that `alpha = 0.16` is objectively better than `alpha = 0.15`.*

**Pattern:** "Built with [real tech], [absurd detail], and the unwavering belief that [hyperspecific opinion]."

---

## Writing Rules

### Do

- **Lead with the interesting part.** If the feature runs DOOM on a desk bar, say that first.
- **Use tables for structured data.** Specs, controls, commands, effects — if it has columns, it's a table.
- **Use parenthetical asides** for commentary that would break the flow as a full sentence. *(because when you're dodging imps on a desk bar, subtlety is not a virtue)*
- **Use italics for inner monologue** — the voice in your head while building: *"I'll just make it glow."*
- **Be technically precise.** Model numbers, pin numbers, exact values. Imprecision is disrespectful to the reader.
- **Acknowledge absurdity.** If the project is overkill, say so. Then explain why it's great anyway.
- **Use code blocks generously** for commands, config, and file paths. Inline `code` for values and names.
- **Write alt text that describes, not decorates.** "HOME view, Toxic Candy theme" — not "screenshot".

### Don't

- **Never be verbose.** If a sentence doesn't earn its place, delete it.
- **Never be generic.** "This project aims to provide a solution for..." is how other people write. Not us.
- **Never be gratuitously mean.** Sarcasm targets ourselves, our decisions, the absurdity of the situation. Never the reader. Never other projects.
- **Never use marketing language.** No "revolutionary", "next-generation", "seamless", "robust". These words mean nothing.
- **Never explain what the reader can see.** If there's a screenshot, don't describe what's in it. Describe what matters.
- **Never apologize for the project existing.** It exists. It's good. Move on.
- **Never skip the badges.** A README without badges is a README without respect for the format.

---

## Signature Patterns

### The Escalation

Start normal, escalate to absurd, land on acceptance.

> Then a Time-of-Flight sensor because why *tap* a button when you can wave at your furniture like a Jedi with boundary issues. Then you spend a weekend deciding if `alpha = 0.16` or `alpha = 0.18` makes the gesture feel more "buttery" and less "drunk".

### The Contrast Kicker

State what the normal version is. State what ours is. The gap is the joke.

> It is not a smart lamp. Smart lamps have apps.
> This has *physics simulations and a gesture smoothing pipeline.*

### The Honest Aside

Drop into parentheses to say the quiet part out loud.

> (because when you're dodging imps on a desk bar, subtlety is not a virtue)
> (no cat)
> (will play it twice)

### The Accepting Conclusion

Acknowledge the contradiction. Accept it. Move on.

> Is it overkill for a video converter? Yes. Is `slowmovie` (a real preset for e-ink displays, 1fps, no audio) also in here? Also yes. Both things are simultaneously true and we are at peace with it.

### The Precise Absurdity

Be extremely specific about something inherently ridiculous.

> A 640×172 strip that tells time in Klingon, fetches weather from an API you could just open yourself, scrolls headlines you already read on your phone, pulls random Wikipedia facts nobody asked for, and opens a portal to Hell.

### The Reframe

Take a dry technical fact and give it a personality.

> The bar knows when you're angry. *(about the IMU shake detection)*
> Adding a language means writing 4 functions... If you can conjugate verbs, you can add a language.

---

## UI Copy Guidelines

For buttons, labels, tooltips, error messages, and in-app text:

| Context | Style | Example |
|---|---|---|
| **Button labels** | Short, verb-first | "Copy as JSON", "Switch theme", "View source" |
| **Empty states** | Helpful, not apologetic | "No tokens match your filter." — not "Sorry, nothing found!" |
| **Error messages** | State what happened, what to do | "Config file missing. Copy `secrets.h.example` and fill in your credentials." |
| **Tooltips** | One line, factual | "Click to copy value to clipboard" |
| **Section headers** | Noun or noun phrase | "Design Tokens", "Live Catalog", "Theme Gallery" |
| **Descriptions** | One sentence, no period if it's a fragment | "Token-driven, theme-ready, AI-friendly" |

### In-App Personality (use sparingly)

Personality belongs in READMEs and docs. In the UI itself, clarity wins. But at specific moments — empty states, Easter eggs, about screens, loading messages — a touch of voice is welcome:

> "No themes loaded. This is technically impressive in a depressing way."
> "Built by Netmilk Studio. Yes, the lamp people."

---

## Before / After Examples

### Generic Tech Writing (don't)

> "ScryBar is a versatile ESP32-S3 based device that provides multiple functionalities including a word clock, RSS feed reader, Wikipedia viewer, and gaming capability. It supports multiple languages and themes, and can be configured via a web-based interface."

### Netmilk Voice (do)

> **ScryBar** is an open-source ESP32-S3 desk companion. One 3.49" touchscreen, five swipeable views, a word clock that composes real sentences in thirteen languages (from Italian and Latin to Klingon, 1337 Speak, and Bellazio), actual grammar, not uppercase tiles, plus RSS feeds, a Wikipedia viewer, a full DOOM port with gyro controls, and a LAN web config UI.

### Generic Security Section (don't)

> "Please ensure that sensitive credentials are not committed to the repository. Use environment variables or a local configuration file that is excluded from version control."

### Netmilk Voice (do)

> `secrets.h` is git-ignored and never committed. `secrets.h.example` is committed with placeholders only.
> - **Never** commit `secrets.h`. The `.gitignore` has your back, but paranoia is a feature.

---

## Checklist for Any Netmilk README

- [ ] Badge row with `for-the-badge` style and relevant colors/logos
- [ ] Opening blockquote that sets the tone
- [ ] Bold one-liner pitch with project name
- [ ] Table of Contents for anything over 3 sections
- [ ] Hardware/tech table with personality in the "Role" column
- [ ] At least one image or screenshot with descriptive layout
- [ ] "Why This Exists" narrative (for non-trivial projects)
- [ ] Security section (if credentials or keys are involved)
- [ ] MIT license block with sardonic closer
- [ ] Centered italic closing line: "Built with [tech], [absurdity], and [belief]"
- [ ] No marketing language anywhere
- [ ] No sentence that doesn't earn its place

---

*Built by analyzing ScryBar, Synthalia, Retina Cannon, and minimuvi —*
*four projects that have nothing in common except a refusal to be boring.*
