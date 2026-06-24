# Cameraman Landing

> Landing page for [Cameraman](https://github.com/dPeluChe/cameraman) — open source screen recorder & editor for macOS.

Live at **[cameraman.dev](https://cameraman.dev)**.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Stack

- **React 19** + TypeScript
- **Tailwind CSS 4** (via `@tailwindcss/postcss`)
- **framer-motion** for animations (entrance, scroll reveals, parallax)
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

## Structure

```
src/
├── components/
│   ├── Nav.tsx                 — sticky nav bar
│   ├── Footer.tsx              — footer with links
│   ├── Button.tsx              — primary / ghost button
│   ├── Badge.tsx               — pill badge (green/blue/orange/purple)
│   ├── SectionBackground.tsx   — reusable animated backgrounds (grid/mesh/orbs/dots)
│   ├── SectionHeading.tsx      — eyebrow + title + subtitle with reveals
│   ├── Reveal.tsx              — scroll-triggered entrance + stagger wrappers
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
```

## Screenshots

Feature cards have placeholder gradient slots (`FeatureImage`). To add a real
screenshot, set the `imageSrc` prop on the feature object in
`src/sections/Features.tsx` — the placeholder is automatically replaced.

## Content

All copy lives in the section components. Feature status badges
(`shipped` / `new` / `tuning` / `improving`) reflect the real state of the
Cameraman app — update them when the app's status changes.

## Deploy

The repo is configured for Vercel (`vercel.json`). The `cameraman.dev` domain
is managed in Vercel project settings.

## Relationship to the main repo

This is a **separate repo** from the [Cameraman app](https://github.com/dPeluChe/cameraman).
The app repo previously hosted the landing as a static `docs/index.html` (GitHub Pages).
That static page has been superseded by this React app.

## License

[MIT](LICENSE) — © 2026 Antonio Martinez Quintero (dPeluChe).
