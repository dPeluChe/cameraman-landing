# Astro and SEO research, October 2026

Why this exists: the first two clones (iteris.tech and dpeluche.dev) scored
well on Lighthouse, but neither site is found by search engines, and a manual
review turned up failures that no gate caught (placeholder canonicals, demo
icons, a hero without LCP). Before adding more rules, we checked the blueprint
against what Astro and Google actually recommend today.

Three reports, each citing a source URL for every claim:

| File | What it answers |
|---|---|
| [01_ASTRO_OFFICIAL.md](./01_ASTRO_OFFICIAL.md) | What Astro 5, 6 and 7 recommend for a static landing: rendering, images, fonts, view transitions, SEO built-ins, Content Layer, tooling. Ends with 49 checks to run on a repo |
| [02_SEO_SEARCH_CONSOLE.md](./02_SEO_SEARCH_CONSOLE.md) | (Spanish) Search Console step by step, Bing and IndexNow, relaunching on the same domain, entity SEO when the name collides with another brand, AI search, what to measure. Ends with a P0/P1/P2 list per site |
| [03_REPO_AUDIT.md](./03_REPO_AUDIT.md) | The blueprint and both clones against that practice, with file:line evidence and a ranked top 15 |

## Where we stand

The rendering choice was right: static HTML is what Astro recommends and what
fixed the real problem (the old sites served 3 to 12 words per page before
JavaScript). What is missing falls in four groups:

1. **Silent misconfiguration.** `SITE_URL` still falls back to `example.com`
   (`astro.config.mjs:18`). Both clones shipped it to a preview. The PR #58
   test catches it after the build; the build itself should refuse.
2. **Weight we did not choose.** The Fonts API defaults to normal and italic
   and preloads both: about 100 KB of Inter per page in the blueprint, 148 KB in
   dpeluche-landing, none of it italic in use.
3. **Structured data that does not describe the site.** No `Person` type, so
   a personal site claims to be an `Organization`. Posts carry no
   `BlogPosting`. iteris-landing marks products as `Product` without offers or
   reviews, which Google requires. `JsonLd.astro` does not escape `<` from CMS
   content, and `sameAs` is emitted twice.
4. **Things only a person can do.** Search Console is not set up on either
   domain, iteris.tech redirects apex to www with a temporary 307, and neither
   brand name can win its bare query (Iteris Inc., D'Peluche). The realistic
   target is the full name or name plus city.

## Decisions needed before building

| # | Decision | Options | Recommendation |
|---|---|---|---|
| D1 | Page transitions | **Decided (13 oct), revised the same day:** native cross-document view transitions were applied first, but the owner saw a full reload on both sites, so both clones went back to `<ClientRouter />`. It costs CSP and ~15 KB of JS; SEO and Lighthouse (99 to 100 perf, 100 a11y) unchanged | Per-site choice; the blueprint ships neither. See `docs/GUIDES/LESSONS_FROM_CLONES.md#page-transitions` |
| D2 | Canonical host for dpeluche.dev | apex or www | Apex (`dpeluche.dev`), the one already indexed; 308 from www |
| D3 | Contrast | Copy the old palettes exactly, or lift the failing pairs to AA | Lift; record any kept exception as a dated allow-list entry so the gate turns green again |
| D4 | Iteris products in JSON-LD | `Product` (needs offers or reviews) or `SoftwareApplication` / `CreativeWork` | `SoftwareApplication` only where it is software with real data; `CreativeWork` otherwise |
| D5 | Google Business Profile for Iteris | **Decided (13 oct): no.** Iteris works remotely with no office that receives clients, so it is not eligible | Disambiguate with descriptor, city and `sameAs` instead |

## Plan

### Blueprint (one PR per line, clones inherit)

| Pri | Change | Effort | Source |
|---|---|---|---|
| P0 | Fonts: `styles: ['normal']`, explicit `preload` list | S | 03 rank 1 |
| P0 | Build fails when `SITE_URL` is missing or `example.com` under `CI`/`VERCEL_ENV`; one env resolver shared by config and tests (`astro:env` schema) | S | 03 rank 2 |
| P0 | JSON-LD: escape `<`, single `sameAs`, tests | S | 03 rank 5 |
| P1 | `Person` and `ProfilePage` support in `organization.type`; `BlogPosting` with `author` on posts; `BreadcrumbList` on detail pages | M | 03 rank 6, 02 section 3 |
| P1 | Head polish: home title without the brand suffix, `x-default`, `og:image:alt`, `article:*` times, RSS `atom:link` | S | 03 rank 14 |
| P1 | Sitemap: exclude `noindex` pages, real `lastmod`; then retire the 3.7.3 pin (3.7.4 fixed the root URL) | S-M | 03 ranks 8, 13; 01 |
| P1 | Gates: axe over every built route, external link check on a schedule, `audit` beyond 8 routes | M | 03 rank 10 |
| P1 | Dependency sweep: astro 7.3.8, `z` from `astro/zod`, Node `>=22.12`, TypeScript 6.0; majors in their own PRs | S-M | 03 rank 9, 01 |
| P2 | CSP (`security.csp`) for sites that do not use `<ClientRouter />` | M | 01 section 3 |
| P2 | Extension points clones keep asking for: site sections, detail collections, chrome slot | M | both clones' BLUEPRINT_FEEDBACK |

### iteris-landing

| Pri | Change | Effort |
|---|---|---|
| P0 | Apex to www with 308, not 307 (Vercel domain settings or a `vercel.json` rule) | S |
| P0 | `SITE_URL` in Production before the merge | S |
| P1 | Tech icons built with `astro-icon` instead of runtime requests to simpleicons and jsdelivr | M |
| P1 | Product JSON-LD per D4; `Organization` with address, `founder` linked to the dpeluche.dev `Person` | M |
| P1 | Fixed descriptor in titles: "Product and technology lab in Guadalajara" | S |

### dpeluche-landing

| Pri | Change | Effort |
|---|---|---|
| P0 | Full name "Antonio Martínez Quintero" in the home title, h1 or first paragraph, and `Person.name`; "dPeluChe" as `alternateName` | S |
| P1 | HQ data as Zod-validated collections (committed JSON first, a Content Layer loader with snapshot fallback later), with a staleness check | M |
| P1 | Project covers through `<Image>` with alt and lazy loading; stop depending on placehold.co | M |
| P1 | ClientRouter accessibility: focus to `#main` after a swap, `aria-current` in the nav, page links not marked `role="tab"` | S-M |
| P1 | Arrow glyphs: add the Arrows unicode range to the mono font | S |

### Off-site (owner, with a guide in 02 section 1)

| Pri | Task |
|---|---|
| P0 | Search Console Domain property for both domains (TXT record on Cloudflare), two owners each, sitemap submitted |
| P0 | Baseline before each domain switch: `site:` counts, position for branded queries, current status codes |
| P1 | Bing Webmaster Tools imported from Search Console |
| P1 | LinkedIn, GitHub and Crunchbase profiles with the same name, descriptor and city, each linking to the site |
| P1 | dpeluche.dev and iteris.tech link to each other |
| P2 | Monthly: branded-query filter, Google's generative AI report, Bing AI Performance |

## What not to expect

- `llms.txt` does not help with Google, which says it ignores it. It stays
  because it costs nothing.
- Nothing above wins the bare queries "Iteris" or "dPeluChe".
- The timelines in 02 (indexing in 1 to 3 weeks, branded position stable in
  4 to 8) are the researcher's estimate, not a Google figure.
