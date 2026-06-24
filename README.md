# Cameraman Landing

> Landing page for [Cameraman](https://github.com/dPeluChe/cameraman) — open source screen recorder & editor for macOS.

Live at **[cameraman.dev](https://cameraman.dev)**.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Stack: React 19](https://img.shields.io/badge/stack-React%2019-blue.svg)](https://react.dev)
[![Tailwind CSS 4](https://img.shields.io/badge/style-Tailwind%204-06b6d4.svg)](https://tailwindcss.com)

## Stack

- **React 19** + TypeScript (strict)
- **Tailwind CSS 4** (via `@tailwindcss/postcss`)
- **framer-motion** — entrance animations, scroll reveals, parallax, stagger
- **Vite** (rolldown-vite) for dev + build
- **lucide-react** available for icons
- Deploy: **Vercel**

## Quick start

```bash
npm install
npm run dev      # http://localhost:3914
npm run build    # tsc + vite build → dist/
npm run preview  # preview the production build
npm run lint     # eslint
```

Requires Node 18+.

## Sections

| Section | Component | What it shows |
|---------|-----------|---------------|
| Hero | `sections/Hero.tsx` | Headline, CTAs, animated editor mockup with parallax + 3D tilt |
| Why | `sections/Why.tsx` | 4 value-prop cards with gradient accents |
| Features | `sections/Features.tsx` | Bento grid (3-col) with status badges + screenshot slots |
| Agents | `sections/Agents.tsx` | MCP server showcase with animated chat mock (tool calls stagger) |
| Comparison | `sections/Comparison.tsx` | Table vs Screen Studio / Kap / OBS |
| Tech | `sections/Tech.tsx` | Stats (LOC, tests, MCP tools, version) + tech tags |
| Status | `sections/Status.tsx` | Beta status card with orange glow |
| Install | `sections/Install.tsx` | Download buttons + build-from-source code block |

## Animation system

- **`SectionBackground`** — 5 reusable variants: `grid`, `mesh`, `orbs` (floating blobs), `dots`, `gradient`. Combinable per section.
- **`Reveal`** — scroll-triggered fade + slide entrance (single element).
- **`Stagger` + `StaggerItem`** — scroll-triggered entrance with staggered children (grids, lists).
- **`EditorMockup`** — parallax + `rotateX` on scroll, animated playhead, waveform bars, zoom pulse, PiP spring-in, transcription caption.
- **`Agents` chat mock** — sequential message reveals on scroll, tool calls stagger with ✓ checkmarks.

## Feature status badges

Feature cards in `sections/Features.tsx` carry a status badge overlaid on the screenshot slot:

| Badge | Color | Meaning |
|-------|-------|---------|
| Shipped | Green | Working in the current beta |
| New in 0.7.0 | Blue | Just shipped in the latest version |
| Being Tuned | Orange | Shipped but gated / actively improved (e.g. auto-zoom) |
| Improving | Purple | Core works, major upgrade in progress (e.g. transcription, overlays) |

These must reflect the real state of the [Cameraman app](https://github.com/dPeluChe/cameraman). When updating, cross-reference the app's [`docs/TASK_TODO.md`](https://github.com/dPeluChe/cameraman/blob/main/docs/TASK_TODO.md) and [`docs/CHANGELOG.md`](https://github.com/dPeluChe/cameraman/blob/main/docs/CHANGELOG.md).

## Screenshots

Feature cards use `FeatureImage` with gradient placeholders. To add a real screenshot:

1. Drop the image into `public/screenshots/`
2. Set `imageSrc: '/screenshots/your-image.png'` on the feature object in `src/sections/Features.tsx`

The placeholder is automatically replaced when `src` is set.

## Structure

```
src/
├── components/
│   ├── Nav.tsx                 — sticky nav bar with logo + links
│   ├── Footer.tsx              — footer with links
│   ├── Button.tsx              — primary / ghost button (href-based)
│   ├── Badge.tsx               — pill badge (green/blue/orange/purple/default)
│   ├── SectionBackground.tsx   — reusable animated backgrounds (grid/mesh/orbs/dots/gradient)
│   ├── SectionHeading.tsx      — eyebrow + title + subtitle with scroll reveals
│   ├── Reveal.tsx              — scroll-triggered entrance + Stagger/StaggerItem wrappers
│   ├── FeatureImage.tsx        — screenshot slot (placeholder gradient → real image via `src`)
│   └── EditorMockup.tsx        — animated CSS mockup of the 3-panel editor
├── sections/
│   ├── Hero.tsx                — hero with layered backgrounds + editor mockup
│   ├── Why.tsx                 — 4 value-prop cards
│   ├── Features.tsx            — bento grid with status badges (shipped/new/tuning/improving)
│   ├── Agents.tsx              — MCP server section with animated chat mock
│   ├── Comparison.tsx          — comparison table vs Screen Studio / Kap / OBS
│   ├── Tech.tsx                — stats + tech tags
│   ├── Status.tsx              — beta status card
│   └── Install.tsx             — download + build-from-source instructions
├── lib/
│   └── cn.ts                   — class name merge helper
├── App.tsx                     — assembles all sections
├── main.tsx                    — entry point
└── index.css                   — Tailwind 4 theme tokens + base styles

public/
└── branding/
    ├── favicon.png             — from the Cameraman app icon
    └── app-icon.png            — OG/Twitter image
```

## Content

All copy lives in the section components. The stats in `sections/Tech.tsx` (LOC, test lines, MCP tool count, version) should be updated when the app releases a new version.

## Deploy

The repo is configured for Vercel (`vercel.json` — Vite SPA mode with clean URLs). The `cameraman.dev` domain is managed in Vercel project settings.

To set up deploy from scratch:
1. Import the repo in Vercel
2. Framework preset: Vite (auto-detected)
3. Build command: `npm run build` (from vercel.json)
4. Output directory: `dist` (from vercel.json)
5. Add the `cameraman.dev` domain in Vercel project settings → Domains
6. Update DNS records at the domain registrar to point to Vercel

## Relationship to the main repo

This is a **separate repo** from the [Cameraman app](https://github.com/dPeluChe/cameraman).
The app repo previously hosted the landing as a static `docs/index.html` (GitHub Pages).
That static page has been superseded by this React app.

## License

[MIT](LICENSE) — © 2026 Antonio Martinez Quintero (dPeluChe).
