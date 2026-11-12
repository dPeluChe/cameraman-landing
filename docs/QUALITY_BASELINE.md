# Web quality baseline

Measured 2026-10-06 on the demo content, from `npm run build` output. Docs-only: nothing
here changed code. Fixes are queued as `WQ-001`…`WQ-004` in [TASK_TODO.md](./TASK_TODO.md).

Targets from the request: react-doctor ≥ 90; Lighthouse SEO, accessibility and best
practices ≥ 90; performance ≥ 80 on mobile. The repo's own gates are stricter
(`npm run doctor` = 100; `npm run audit` budget: performance ≥ 95, the rest 100), so both are
reported and issues are ranked against the stricter one.

## How it was measured

- `npm run build`, then `astro preview` on port 4433; the served `/` was byte-compared with
  `dist/index.html` before measuring (`astro preview` has no such check of its own; only
  `scripts/serve-dist.mjs` does).
- `orbital-lighthouse <url> --runs 3 --form-factor mobile|desktop`, median of 3, headless Chrome.
- `npx react-doctor . --verbose`: the repo devDependency **0.9.14**, the binary `npm run doctor`
  runs. The global one is 0.9.13.
- Routes: `/`, `/servicios`, `/contacto`, `/novedades/bitacora-digital-v3` (a post), `/en`. They
  cover the home, a section page, the page with the React island, an article and the second
  locale. `npm run audit` takes the first 8 ranked routes instead.
- `SITE_URL` was unset, so canonicals and OG URLs use the `https://example.com` fallback.

## Scores

react-doctor: **100 / 100**, 99 files scanned, no issues. Target 90, repo gate 100: met.

Lighthouse, median of 3 (performance / accessibility / best practices / SEO):

| Page | Mobile | Desktop | Mobile perf, 3 runs |
|---|---|---|---|
| `/` | 99 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 99, 99, 100 |
| `/servicios` | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 100, 100, 99 |
| `/contacto` | 95 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 95, 93, 96 |
| `/novedades/bitacora-digital-v3` | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 100, 100, 100 |
| `/en` | 95 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 95, 97, 95 |

Every cell meets the request's targets. Mobile performance meets the repo budget (95) on all
five pages, but `/contacto` has a run at 93 and `/en` sits exactly on 95.

Presets, mobile `/` only (3 runs), each applied on a throwaway copy after `npm run reset --yes`
(`reset` refuses to run while `origin` is the blueprint, so the repo itself was not touched):

| Preset | Build | Result |
|---|---|---|
| `leadgen` | ok | perf 100, a11y 100, BP 100, SEO 69. The SEO drop is `is-crawlable`: `reset` sets `robots.index` off on purpose — intentional, not a defect. |
| `saas` | ok (was `ImageNotFound ../../assets/brand/logo.svg`) | perf 100, a11y 100, BP 100, SEO 69 (same `is-crawlable` cause) |
| `services` | ok (was `Unknown lucide icon "sliders"`, `"check-circle-2"`) | perf 100, a11y 100, BP 100, SEO 69 (same `is-crawlable` cause) |
| `local` | ok (was `Unknown lucide icon "check-circle"`) | perf 100, a11y 100, BP 100, SEO 69 (same `is-crawlable` cause) |

Re-measured 2026-10-06 after WQ-001, served with `serve@14` through
`scripts/serve-dist.mjs` (byte-verified against `dist/`). SEO 69 on all four is
`reset`'s `robots.index: false`, the intended state of a fresh clone; it lifts
the moment a clone turns indexing on. `cache-insight` reflects the static file
server, not the build.

## SEO review

Checked on the built HTML of the five routes, `dist/robots.txt`, `dist/sitemap-0.xml` and `dist/404.html`.

| Item | Result |
|---|---|
| Title and meta description | present and unique on every route checked |
| Open Graph / Twitter | `og:type/site_name/locale/url/title/description/image(+size, alt)`, `twitter:card/title/description/image` on every route; `og:type=article` on the post |
| Canonical and hreflang | present; `es-MX`, `en-US`, `x-default` pairs point at the right translated segment |
| `html lang` | `es-MX` / `en-US` per locale |
| One `h1`, heading order | one `h1` on each built page; no skipped level (h1 → h2 → h3) |
| Image `alt` | 0 `<img>` without `alt` on the five routes |
| JSON-LD | `LocalBusiness` + `WebSite` everywhere; `FAQPage` on home; `BreadcrumbList` on inner pages; `Article` on the post |
| `robots.txt`, sitemap | `Allow: /`, `Sitemap:` line, `sitemap-index.xml` + `sitemap-0.xml` |
| Login-gated pages | none: static site, so nothing needs `noindex` except the 404, which has it |
| Gaps | see issues 2 and 3 |

## Top issues, ranked

Nothing misses the request's targets. The list is what stands between the site and its own
stricter budget, or what breaks the blueprint's promise.

1. ~~**Three of four presets do not build after `reset`.**~~ Fixed (WQ-001). `saas` wrote the
   logo path one `../` short for `pages/<locale>/`; `services` and `local` used lucide slugs
   renamed upstream. `tests/presets.test.ts` now fails `npm test` on both bug classes and
   `verify:clone` builds every preset — in CI.
2. **Sitemap and page disagree about the root URL.** `sitemap-0.xml` has `<loc>https://example.com</loc>`
   but its hreflang alternates for the root are `https://example.com/`; the page `<head>` uses the bare
   origin. The `@astrojs/sitemap` pin exists to keep these byte-equal, so this is a leak in the
   alternates path (`src/lib/sitemap.mjs`).
3. **A missing `SITE_URL` ships silently.** The build falls back to `https://example.com` for every
   canonical, OG URL and the sitemap; only a comment in `.env.example` warns.
4. **Mobile performance headroom is thin on `/contacto` and `/en`** (95 median, 93 low). Evidence:
   `/contacto` fails `unused-javascript` (≈33 KiB, the React island runtime) and Speed Index 4.1 s;
   `/en` fails `mainthread-work-breakdown` (2.0 s). Render-blocking CSS and the network dependency
   tree are flagged on every page but cost nothing measurable on `/servicios` or the post (100).
5. **Hold-the-line gaps.** `npm run audit`, `doctor` and `responsive` are not in CI; nothing keeps
   the 100s above from drifting.

## Fix plan

| Step | Files | Expected gain |
|---|---|---|
| ~~WQ-001 Presets build after reset, with a test~~ done | `scripts/apply-preset.mjs`, `tests/presets.test.ts`, `scripts/verify-clone.mjs`, `ci.yml` | all four presets build (perf/a11y/BP 100, SEO 69 by design); a regression fails `npm test` and CI |
| WQ-002 Sitemap root alternates match the page | `src/lib/sitemap.mjs`, `tests/` sitemap/routing test | root hreflang equal in sitemap and `<head>`; no score change |
| WQ-003 Fail production builds without `SITE_URL` | `astro.config.mjs`, `docs/GUIDES/DEPLOY.md` | no `example.com` canonical can reach production |
| WQ-004 Mobile perf headroom on `/contacto` and `/en` | `src/components/islands/ContactForm.*`, `src/components/seo/BaseHead.astro`, `astro.config.mjs` | +2–4 mobile perf on both, so the floor stays ≥ 95 |

CI wiring for `audit`, `doctor` and `responsive` (issue 5) is already in the backlog as
"Run `npm run responsive` in CI"; it is not duplicated here.

The first three are about correctness and need no performance work; WQ-004 is the only step
that moves a Lighthouse number, and it should be re-measured with the same commands above.
