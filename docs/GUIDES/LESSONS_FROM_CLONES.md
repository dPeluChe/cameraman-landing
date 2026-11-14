# Lessons from the first clones

What went wrong or cost rework when iteris.tech (React and Vite) and
dpeluche.dev (Next.js) were moved onto this blueprint in October 2026. Each
lesson says what the blueprint now does about it, or what to do by hand. Read
this before starting a migration; most of it is invisible until a preview is
already up.

The full reports: `iteris-landing/docs/BLUEPRINT_FEEDBACK.md`,
`dpeluche-landing/docs/BLUEPRINT_FEEDBACK.md`, and
[../RESEARCH/ASTRO_SEO_2026/](../RESEARCH/ASTRO_SEO_2026/README.md).

The checklist for a new clone is **not** kept here. `npm run reset` creates
`docs/CLONE_CHECKLIST.md` in the clone, and whoever clones fills it in: they are the one who
sees what is missing or breaks. When something recurs across clones it gets promoted to this
file.

## Before writing code

| Lesson | Now |
|---|---|
| Measure the old site first: Lighthouse, words in the first HTML response, indexed pages, its sitemap URLs. Both old sites served 3 to 12 words per page, which explained why search engines had 1 and 3 of their pages. Without the "before", "better" is an opinion. | Manual. SEO rule 9 |
| Decide the default language and the URL of every page up front. Changing `locales.mjs` later breaks tests and presets that assume `es`. | Manual. Known gap: `presets` and `sync-content` tests assume `es` |
| Set `SITE_URL` in `.env`, in the deploy environment (Preview and Production) and as the `SITE_URL` repository variable for CI, before the first deploy. A new Vercel project has none. | The build fails in CI/Vercel for a clone without it |
| Run `npm run reset`, then `npm run assets` with the real brand SVGs. Reset leaves the demo's og image, icons and manifest in `public/`. | `build-output` fails if the manifest is not this brand's |

## While porting

| Lesson | Now |
|---|---|
| Custom chrome and bespoke pages do not need blueprint edits. | `src/site/` extension points ([EXTENDING.md](./EXTENDING.md)) |
| A design that fades its headline in from `opacity: 0` has no LCP: Lighthouse performance 0, and no Core Web Vitals for real users. Start at `0.01`. | `fade-in` starts at 0.01; `npm run audit` shows it |
| Contrast tests only see the blueprint's tokens. Both clones failed AA on their own colors: brand hues used as text, and text on a brand tint. | Manual: measure custom colors too; use a darker `-fg` variant of a brand hue for text |
| Every link needs a real `href`; a row that opens only with JavaScript is invisible to crawlers. | `build-output` test |
| Never import `src/lib/fonts.mjs` from a component: it imports `astro/config`, which breaks `astro build` from 7.3.6 (withastro/astro#18364). | `font-vars.mjs` holds what components need |
| Astro fetches normal and italic for every font unless `styles` is set, and preloads both. | `styles: ['normal']`, test that every font sets it |
| The subset `latin` has no arrows (`←` `→`); they fall back to another font. | Manual: add a `unicodeRange` if the design uses them |
| Content from an API (CMS, Convex) needs a committed snapshot so a deploy never depends on it being up. Validate it with a schema instead of casting. | Pattern in [../ARCHITECTURE/CONTENT_SYNC.md](../ARCHITECTURE/CONTENT_SYNC.md) |
| A personal site is a `Person`, not an `Organization`. | `organization.type: "Person"` emits Person and ProfilePage |
| `astro preview` runs detached; a second one on a busy port says "already running" and starts nothing. Check which repo answers before screenshotting. | Manual |
| A stale `.astro/` data store can keep the old schema after a schema change (`Cannot read properties of undefined`). | Manual: `rm -rf .astro` and rebuild |

## Page transitions

A site that moved from a client-side app (React Router, Next) is used to pages
that change without reloading. A static port reloads every page, and users see
it. The first two clones tried both options on 13 Oct 2026:

- **Native cross-document view transitions** (`@view-transition { navigation:
  auto; }`), even with hover prerendering. No JavaScript and compatible with a
  Content Security Policy, but the browser still loads a new document on every
  click: the owner saw a full reload on both sites. It also does nothing when
  the OS has "reduce motion" on, and in browsers without support.
- **`<ClientRouter />`**. The page content swaps without a reload; chrome can
  stay on screen (`transition:persist`). What it costs: every script re-runs on
  `astro:page-load`, the theme must be re-applied on `astro:before-swap`, focus
  must be moved to `<main>` after a swap, and `security.csp` cannot be enabled.
  About 15 KB of JS. Lighthouse stayed at 99 to 100 performance and 100
  accessibility on both clones, and SEO is unaffected: each page is still full
  HTML for crawlers.

Both clones kept `<ClientRouter />`. Choose per site: the router when the
site should feel like an app (or replaces one); nothing, or native transitions,
for a plain brochure where CSP matters more. The blueprint ships neither
turned on.

Persist only chrome that is identical on every page. A navbar whose active
link or language switch changes per page must re-render (use
`transition:animate="none"`), or it keeps pointing at the previous page.

## Before the domain switch

The SEO rules and their gates: [../ARCHITECTURE/SEO.md#rules](../ARCHITECTURE/SEO.md#rules).
The ones only a person can do: every old URL still answers or has a 301,
Search Console set up and the sitemap submitted, the apex-to-www redirect is a
308 and not a temporary 307, and `robots.index` turned on.
