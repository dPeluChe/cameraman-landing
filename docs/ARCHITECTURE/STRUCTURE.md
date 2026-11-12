# Directory structure

Where each kind of code lives and what owns it. Read this once when you land in
the repo; after that the names are self-explanatory.

```
src/
├── content.config.ts       Collection definitions (thin; schemas live in schemas/)
├── schemas/                THE CONTRACT — primitives, sections, site config
├── content/                Committed snapshot: site/, pages/, posts/, projects/, ui.json
├── components/
│   ├── sections/           One component per section `type` + SectionRenderer dispatch
│   ├── ui/                 Picture, Button, Icon, SectionHeader, PostCard, ProjectCard,
│   │                       FloatingContact, StickyMobileCta
│   ├── layout/             Header, Footer, ThemeToggle, LocaleSwitcher, BackgroundDecor
│   ├── embeds/             LiteYouTube, LiteMap (click-to-load facades)
│   ├── islands/            React islands — currently only ContactForm
│   └── seo/                BaseHead, JsonLd
├── layouts/                BaseLayout, ContentPage, listings (Updates/Projects Index)
│                           and details (PostDetail, ProjectDetail)
├── pages/[...lang]/        Rest-param routes; default locale renders unprefixed
├── lib/                    content, routes, i18n, seo, fonts, sitemap, url, analytics,
│                           contact, format, markdown, markdown-figure, social, locales,
│                           site-url, font-vars, safe-url, safe-markdown
├── site/                   The clone's own: extra section types and chrome (EXTENDING.md)
├── scripts/                Client-side behavior (carousel)
└── styles/                 tokens.css (brand) + global.css (Tailwind bridge)

scripts/                    Node scripts: init-clone, apply-preset, generate-og,
                            generate-static-assets, sync-content, audit-build, reset-content
tests/                      Vitest: schemas, routing, contact, contrast, build output, drift
docs/                       ARCHITECTURE/ and GUIDES/ — the real documentation
```

## What each layer is allowed to know

| Layer | Knows about | Must not |
|---|---|---|
| `schemas/` | Zod, the shape of content | Import anything from `components/` or `lib/` except `locales.mjs` |
| `content/` | Nothing — it is data | Contain classes, colors, or component names |
| `lib/` | Collections and Astro's virtual modules | Render anything |
| `components/sections/` | One section type, via a single `section` prop | Fetch content by guessing an id, or hold copy |
| `components/ui/` | Its own props | Know which section rendered it |
| `layouts/` | Which page it is rendering | Contain section-specific logic |
| `pages/` | Routing and `getStaticPaths` | Contain markup beyond composing a layout |

The direction is one-way: `content` → `schemas` → `lib` → `layouts`/`components` → `pages`.
Anything that reverses it is a design smell.

## The three files that matter most

| File | Why |
|---|---|
| `src/schemas/sections.ts` | The list of section types. Adding one starts here. |
| `src/lib/fonts.mjs` | The brand typeface. The one brand value not in `tokens.css`. |
| `src/styles/tokens.css` | Every brand value in the project. A rebrand is this file. |
| `src/content/site/<locale>.json` | Identity, contact, SEO defaults, feature flags, route segments. |

## Related

- Content contract: [CONTENT_SCHEMA.md](./CONTENT_SCHEMA.md)
- Routing and i18n: [ROUTING.md](./ROUTING.md)
- Code conventions: [../../AGENTS.md](../../AGENTS.md)
