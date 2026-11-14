# Content schema — the contract

This is the single definition of what "content" means in this project. Today it
is filled from JSON and Markdown files in the repo. Tomorrow the same schema is
filled from an API through `scripts/sync-content.mjs`. Same schema, different
source, zero changes to the render layer.

Source of truth is code, not this page:

| File | Holds |
|---|---|
| `src/schemas/primitives.ts` | `media`, `icon`, `link`, `seo`, section base |
| `src/schemas/sections.ts` | The discriminated union of section types |
| `src/schemas/site.ts` | Per-locale site configuration |
| `src/content.config.ts` | Collection definitions and loaders |

If this page and the code disagree, the code wins and this page is a bug.

---

## Rules a CMS has to respect

1. **Whatever the CMS emits must pass these schemas unchanged.** If it does not,
   the build fails. That is intentional: a broken build beats a live page with an
   empty section.
2. **No field carries presentation.** No components, no Tailwind classes, no hex
   colors. Icons are *names* (lucide slugs); color comes from
   `src/styles/tokens.css`. A CMS cannot inject styling. Icon names are validated
   against the installed lucide set, so a slug the CMS invents — or one lucide
   renames on upgrade — fails the build instead of rendering a blank slot.
3. **`sections` is an ordered array.** Array order is page order. There is no
   separate "position" field to keep in sync.
4. **Everything partitions by locale via directory.** A multi-tenant CMS needs
   `(siteId, locale, route)` as its key.
5. **Optional means optional.** If an optional field is missing the section
   renders without it. Required fields blow up the build on purpose.
6. **Markdown, never HTML.** `richText.body` and post bodies are Markdown. HTML is
   escaped before parsing (`src/lib/markdown.ts`), so a compromised CMS cannot
   inject markup.

---

## Collections

| Collection | Loader | Entry id | Holds |
|---|---|---|---|
| `site` | `glob` over `src/content/site/*.json` | `es`, `en` | Brand, contact, SEO defaults, assets, nav, footer, flags, routes |
| `pages` | `glob` over `src/content/pages/**/*.json` | `es/index`, `en/about`, … | Per-page SEO + ordered `sections` |
| `posts` | `glob` over `src/content/posts/**/*.md` | `es/my-note` | Updates feed entries |
| `projects` | `glob` over `src/content/projects/**/*.json` | `es/my-project`, … | Portfolio, products, cases — a page of their own, built from `sections` |
| `ui` | `file` over `src/content/ui.json` | `es`, `en` | Interface strings (labels, aria text) |

Ids are generated explicitly (`generateId: stripExt`). The default generator
slugifies, drops `index` and honours a `slug` field — all three would break the
`<locale>/<route>` key. This is why the page route field is called `route`, not
`slug`.

`ui` is a separate collection on purpose: editorial content and accessibility
labels have different owners and different risk. A copywriter changing a headline
should not be able to empty an `aria-label`.

---

## Shared primitives

### `media`

```jsonc
{
  "src": "../../assets/brand/logo.svg",   // path relative to the content file, OR an https URL
  "alt": "Nordika",                        // required — no exceptions
  "width": 200,                            // optional; remote images infer it at build
  "height": 40,
  "priority": false                        // true only for the LCP image, one per page
}
```

Local paths resolve through Astro's `image()` helper into `ImageMetadata` and get
optimized at build. Absolute `https://` URLs — what a CMS will send — go through
the remote pipeline (`image.remotePatterns` in `astro.config.mjs`, an allow-list
fed by the `IMAGE_REMOTE_HOSTS` env var — comma-separated hostnames, empty in the
blueprint). Both render via
`components/ui/Picture.astro`; there is no raw `<img>` anywhere.

### `link`

```jsonc
{
  "label": "Agendar diagnóstico",
  "href": "/contacto",                     // internal path, mailto:, tel:, #anchor, or absolute http(s) URL
  "variant": "primary",                    // primary | secondary | ghost — maps to tokens
  "icon": "calendar-check",                // optional lucide slug
  "external": true                         // optional; inferred from href when omitted
}
```

`href` is validated by the shared safe-URL rule (`src/lib/safe-url.mjs`):
navigation schemes and relative references only — a `javascript:`, `data:` or
`vbscript:` value fails the schema whatever the case or encoding. Every field
that lands in an `href` or a script `src` follows the same rule (nav, footer
links, `services`/`bento`/`logos` item hrefs, `floatingContact.target`,
`stickyMobileCta.href`, `contactForm.redirectTo`, `contactForm.endpoint`).

External links get `target="_blank"`, `rel="noopener noreferrer"` and a screen
reader hint automatically.

### `seo`

```jsonc
{
  "title": "…",          // 1–70 chars; longer gets truncated in results
  "description": "…",    // 50–165 chars; shorter and Google rewrites it
  "ogImage": "/og/custom.png",  // optional; falls back to site.seo.defaultOgImage
  "noindex": false,
  "canonical": "https://…"      // optional override, for mirror domains only
}
```

The length bounds are enforced. A CMS that lets an editor write a 200-character
description will fail the build rather than ship a truncated snippet.

### Section base

Every section accepts:

- `anchor` — kebab-case id for in-page navigation (`#services`). Must be unique per page.
- `enabled` — default `true`. Turns a section off without deleting its content.

---

## Section types

The section types below are discriminated on `type`. Each maps to one component in
`src/components/sections/` and one `case` in `SectionRenderer.astro`.

| `type` | Purpose | Required fields | Client JS |
|---|---|---|---|
| `hero` | First screen (`centered`, `split-left`, `split-right`) | `title` | none |
| `stats` | Hard numbers | `items[2..6]` | none |
| `features` | Carousel next to media | `title`, `items[1..8]` | carousel (~0.9 KB) |
| `bento` | Asymmetrical feature cards grid (`colSpan`, `rowSpan`) | `title`, `items[2..8]` | none |
| `howItWorks` | Numbered steps | `title`, `steps[2..6]` | none |
| `services` | Card grid | `title`, `items[1..9]` | none |
| `testimonials` | Quote carousel | `items[1..]` | carousel (shared) |
| `cta` | Conversion block | `title`, `actions[1..2]` | none |
| `faq` | Accordion + FAQPage JSON-LD | `title`, `items[2..]` | none (`<details>`) |
| `logos` | Trust strip | `items[2..]` | none |
| `location` | Address, hours, lazy map | `title` | map facade |
| `pricing` | Plan grid with optional monthly/annual toggle | `title`, `plans[1..4]` | inline toggle |
| `comparison` | Feature vs alternatives / plans comparison table | `title`, `headers[2..4]`, `rows[1..]` | none |
| `timeline` | Roadmap, history, milestones or process | `title`, `items[2..]` | none |
| `richText` | Long-form prose | `body` | none |
| `team` | People | `title`, `members[1..]` | none |
| `contactForm` | The conversion point | `title`, `submitLabel`, `successMessage`, `errorMessage` | React island |
| `postsPreview` | Latest updates | `title` | none |
| `projectsPreview` | Featured projects | `title` | none |

### Notes on the ones with rules attached

**`hero.titleHighlight`** must be a substring of `title`. The renderer splits the
title once and wraps that fragment in the brand color. If the fragment is not
found, the title renders plain — no crash, no partial highlight.

**`features.youtubeId`** loads a facade: a static thumbnail and a play button. The
YouTube iframe (and its ~500 KB of third-party JS) is only injected on click, via
`youtube-nocookie.com`. Same pattern for `location.mapEmbedUrl`, with a tighter
contract: it must be an `https://` URL on `google.com` or `openstreetmap.org` —
the host list in `src/schemas/sections.ts` is what stands between the CMS and an
arbitrary iframe. A clone embedding another provider adds its host there.

**`faq.jsonLd`** defaults to `true` but should only be `true` on **one** section
across the whole site. Google devalues duplicate `FAQPage` markup. The demo has it
on the home FAQ and off on the two secondary FAQs.

**`location.showBusinessInfo`** reads address, phone, WhatsApp and hours from
`site.contact`. It does not duplicate them, so the JSON-LD `LocalBusiness` and the
visible block can never drift apart.

**`pricing.plans[].price`** is a pre-formatted string (`"Desde $18,900"`). Money
formatting is content, not logic — currency, separators and wording differ per
market. A plan with no `price` renders its CTA as a quote request, which is what
most service businesses need.

**`contactForm`** describes *what* the form asks. It says nothing about *how* the
message is sent — that is `site.contactForm` plus env. See
[GUIDES/CONTACT_FORM.md](../GUIDES/CONTACT_FORM.md).

---

## `site` — per-locale configuration

One entry per locale (`src/content/site/es.json`, `en.json`). This is the first
file to edit when cloning.

| Group | Holds | Notes |
|---|---|---|
| `brand` | name, legalName, tagline, logo (light + optional dark) | `legalName` feeds JSON-LD only when set |
| `contact` | email, phone, whatsapp, address, geo, openingHours | `openingHours` uses schema.org format (`"Mo-Fr 09:00-18:00"`) |
| `social` | `platform` + `url`, optional `icon` | Also merged into JSON-LD `sameAs`. See below. |
| `seo` | defaultTitle, titleTemplate, defaultDescription, defaultOgImage, defaultOgImageAlt, twitterHandle, robots, verification | `titleTemplate` must contain `%title%`; `%brand%` is also substituted |
| `assets` | favicon, faviconSvg, appleTouchIcon, manifest, maskIconColor, themeColor(+Dark) | Paths under `public/`, produced by `npm run assets` |
| `organization` | type, description, alternateName, priceRange, sameAs, foundingDate, areaServed, knowsAbout, disambiguatingDescription, founder, logo, image; Person: jobTitle, worksFor (`id` links the company graph) | `type` drives which JSON-LD graph is emitted |
| `nav` | array of `link` | Rendered in header, desktop and mobile |
| `footer` | columns, legalLinks, copyright, credit | A column's `title` is optional: a flat row of links is a real footer shape, and requiring a heading means inventing copy | `copyright` substitutes `%year%` and `%brand%`; `credit` is the Iteris byline, set to `null` to remove |
| `features` | darkMode, defaultTheme, showThemeToggle, scrollLayout, showLocaleSwitcher, headerBlur, floatingContact | Feature flags — see below |
| `analytics` | provider, websiteId, scriptUrl, domain | Centralized analytics config (umami, plausible, vercel, ga4). `scriptUrl` must be `https:`; `ga4` requires a `G-…` measurement id |
| `contactForm` | provider, endpoint, honeypotField, redirectTo | Transport only. `endpoint` and `redirectTo` follow the safe-URL rule |
| `routes` | per route: `enabled` + `segment` | Route keys are English and fixed; `segment` is the public URL piece |

### Placeholder syntax

Every substituted token is `%name%`, matching the variable it stands for:
`%title%`, `%brand%`, `%year%`. There is no shorthand.

There used to be: `titleTemplate` documented `%s`, and the substitution only ever
replaced `%name%`, so `%s` was never touched. Every page of the demo shipped
`<title>%s | Nordika</title>` and Lighthouse still scored SEO 100 — it checks that
a `<title>` exists, not that it says anything. Two things stop it now: the schema
rejects a template without `%title%`, and a test fails on any `%token%` surviving
in the built `<head>`.

### Omitting a whole group

`organization`, `footer`, `features`, `analytics`, `contactForm`, `seo.robots` and `assets` are
all-defaults groups: omitting them behaves exactly like passing `{}`. They use
Zod's `prefault`, not `default`, so the value is parsed and the inner defaults
apply — with plain `default` the group would be required in practice, which is
what "optional" quietly meant here until a test caught it.

`routes` stays required: a segment has no sensible cross-locale default, and
guessing one would silently ship English URLs on a Spanish site.

### Cross-field validation

`site` uses `superRefine`, so these fail the build with a field path:

| Rule | Why |
|---|---|
| `organization.type` other than `Organization` or `Person` requires `contact.address` | A `LocalBusiness` without an address is invisible in local search — which is the only reason to use that type |
| `contactForm.provider === "endpoint"` requires `contactForm.endpoint` | Otherwise the form silently posts nowhere |
| `analytics.provider === "ga4"` requires `analytics.websiteId` as `^G-[A-Z0-9]+$` | The id is interpolated into a script `src` and an inline `gtag('config', …)` — anything but a measurement id is injection or broken analytics |
| `features.showThemeToggle` requires `features.darkMode` | A toggle with nothing to toggle |

### Feature flags

| Flag | Default | Effect |
|---|---|---|
| `darkMode` | `true` | Set `false` for clients who do not want it. Forces light, hides the toggle. |
| `defaultTheme` | `"system"` | `light`, `dark` or `system`. Resolved before first paint by an inline script — no flash. |
| `showThemeToggle` | `true` | Hide the control while keeping dark mode responsive to the OS. |
| `scrollLayout` | `"flow"` | `"snap"` turns every section into a full-height scroll-snap screen (the Skysset look). |
| `showLocaleSwitcher` | `true` | Auto-hides anyway when only one locale exists. |
| `headerBlur` | `false` | Frosted sticky header via `backdrop-filter`. Off by default: it repaints the strip behind the header on every scroll frame. |
| `floatingContact` | `{ enabled: false }` | Floating WhatsApp/Telegram/Phone contact bubble with direct chat link. |
| `stickyMobileCta` | `{ enabled: false }` | Sticky bottom conversion bar for mobile viewports. |

---

## `posts` — the updates feed

Deliberately not a blog: no tags, no pagination, no authors. It ships one RSS
feed per locale — `/rss.xml` for the default locale, `/<locale>/rss.xml` for the
rest — gated on `routes.updates.enabled`, with the discovery link in `BaseHead`.
See [SEO.md](./SEO.md#rss).

```yaml
---
locale: "es"
title: "…"                 # ≤ 90 chars
description: "…"           # 50–200 chars
date: 2026-07-14
updated: 2026-07-20        # optional
cover: { src: "…", alt: "…" }   # optional
category: "Operación"      # optional, free label — not a taxonomy
translationKey: "bajio-base"    # optional, ties locales together
featured: false
draft: false               # excluded from production builds, visible in dev
---

Markdown body.
```

`translationKey` exists because slugs differ per language:
`novedades/respuesta-emergencias-bajio` and `en/updates/bajio-regional-base` are the
same post. It works identically for `projects`. Entries sharing a key are linked
with `hreflang` and by the language switcher. Without a key, the switcher falls
back to matching slugs, and if there is no counterpart the alternate is simply
omitted — never a link to a 404.

### `social` — why it is not an enum

`platform` is free text. It is the **accessible label** on the link, so it should
read as the network is written (`LinkedIn`, not `linkedin`), and it selects a
default icon by lowercasing it.

lucide ships no brand mark for TikTok, Threads, Pinterest, Spotify or Behance, so
those need an explicit `icon` — validated against the real icon set like any
other. Everything else resolves from `src/lib/social.ts`, and an unknown platform
with no icon falls back to a neutral link glyph rather than breaking the build.

```jsonc
{ "platform": "LinkedIn", "url": "https://…" },
{ "platform": "TikTok", "url": "https://…", "icon": "music" }
```

It used to be an enum plus an icon map **inside `Footer.astro`**, so adding a
network was a code change for a content need — and in a clone, that means owning
a layout file forever.

## `projects` — portfolio, products, cases

One collection for anything that needs a page of its own besides an update: a
delivered project, a product, a case study. It is **not** renamed per client in
code — the route key stays `projects` and the client's word for it comes from
`site.routes.projects.segment` (`/proyectos`, `/portafolio`, `/productos`).

```jsonc
{
  "locale": "es",
  "title": "…",                 // ≤ 90 chars
  "description": "…",           // 50–200 chars — used on the card and for SEO
  "cover": { "src": "…", "alt": "…" },   // required: a card with no image is a hole
  "category": "Retrofit",       // optional, free label
  "meta": [                     // spec sheet; first two also show on the card
    { "label": "Cliente", "value": "Planta Cedro" },
    { "label": "Año", "value": "2026" }
  ],
  "date": "2026-03-18",         // optional
  "order": 1,                   // optional, ascending; ties break by date then title
  "translationKey": "cedar-line-2-retrofit",
  "featured": true,             // what projectsPreview shows
  "draft": false,
  "seo": { },                   // optional, falls back to title/description
  "sections": [ ]               // the same sections a page is built from
}
```

**Why `sections` and not a Markdown body.** A project is a showcase, so the
detail page needs the same blocks a landing has — stats, galleries, rich text,
logos. The cost is that authoring one is heavier than writing a post; copy an
existing project as the starting shape rather than composing from nothing.

Ordering is explicit on purpose: `order`, then newest, then title. A portfolio
whose sequence depends on filenames reorders itself the day someone renames a
file.

---

## Placeholders

`npm run reset` writes content that satisfies every rule above while being
obviously unfinished — every string starts with `TODO`. A test fails while any of
them survives, so the placeholders cannot reach production.

This matters more than it sounds: the failure mode demo content causes is not that
it is missing, it is that it reads plausible enough to survive review. Placeholder
copy has to be implausible on purpose.

## Changing the languages

`src/lib/locales.mjs` is the switch, and it is a file the clone owns.

**Dropping a language** is code-only. Set `LOCALES = ['es']`, delete
`src/content/**/en*`, and that is it: the `/en/*` routes stop being generated,
`hreflang` disappears, the switcher hides itself, and the test suite adapts —
every locale-specific assertion derives from `LOCALES` rather than naming `es`.
Verified: 0 type errors, 9 pages, no failing tests.

**Changing which language is primary** — `DEFAULT_LOCALE = 'en'` — also builds
correctly and emits the right `hreflang`, but it moves every URL: `/servicios`
becomes `/es/servicios` and `/en/services` becomes `/services`. The absolute
`href`s in `site.nav` and `site.footer` are **content**, so they do not follow.
Update them, or the link and anchor tests will tell you which ones you missed.

That is the tests doing their job, not a limitation: a nav link is a string a
human wrote, and nothing can infer where it meant to point.
