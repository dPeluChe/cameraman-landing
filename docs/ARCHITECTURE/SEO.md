# SEO

SEO is why this project is Astro and not a SPA. Everything below is in the HTML
that ships — nothing depends on JavaScript running.

## What every page emits

Produced by `src/components/seo/BaseHead.astro`.

| Tag | Source |
|---|---|
| `<title>` | `page.seo.title` through `site.seo.titleTemplate` (`%title%`, `%brand%`) |
| `<meta name="description">` | `page.seo.description`, falling back to `site.seo.defaultDescription` |
| `<meta name="robots">` | `site.seo.robots` combined with `page.seo.noindex` |
| `<link rel="canonical">` | Current pathname against `SITE_URL`, or `page.seo.canonical`. Omitted on `noindex` pages (the 404 included): a canonical there points Google at a page it was told to drop |
| `<link rel="alternate" hreflang>` | `alternateHrefs()` — one per locale that actually has the page, plus `x-default` |
| Favicon set | `site.assets.*` |
| `<meta name="theme-color">` | `site.assets.themeColor` / `themeColorDark`, per `prefers-color-scheme` |
| Open Graph | title, description, url, image (1200×630, the file must really be that size), `og:locale`, `og:type`. `og:image:alt` is `site.seo.defaultOgImageAlt` on the default image, else the title |
| Twitter card | `summary_large_image` |
| Verification meta | `site.seo.verification` — arbitrary key/value pairs |

`SITE_URL` is read in `astro.config.mjs`. Set it per deploy; it drives canonical,
OG URLs, the sitemap and `robots.txt`. Leaving it at `https://example.com` ships
wrong canonicals — that is the single most common way to break this.

## Generated files

| File | How |
|---|---|
| `sitemap-index.xml` + `sitemap-0.xml` | `@astrojs/sitemap`. 404 is filtered out; disabled routes never enter it because they are never built. hreflang alternates come from `src/lib/sitemap.mjs`, **not** from the integration's `i18n` option — see below. |
| `robots.txt` | `src/pages/robots.txt.ts`. Follows `site.seo.robots.index` and points at the sitemap index. Generated, not committed, so it can never contradict config. |
| `rss.xml` and `<locale>/rss.xml` | `src/pages/[...lang]/rss.xml.ts`. One feed per locale — a reader subscribing from the Spanish site must not get English items. Only when `routes.updates.enabled`. |
| `og/default.png` | `npm run assets`, from the brand SVGs. Committed. |
| Favicon set | `npm run assets`. Committed. See [GUIDES/STATIC_ASSETS.md](../GUIDES/STATIC_ASSETS.md). |

### Why the sitemap does not use the `i18n` option

That option pairs URLs by identical path. With translated segments
(`/servicios` ↔ `/en/services`) nothing pairs, so it emitted alternates for the
two homepages and nothing for the other 13 URLs — while the pages themselves
emitted them correctly. Two sources of the same claim, disagreeing silently, and
Google reads both.

`src/lib/sitemap.mjs` builds the alternates from the same route data the pages
use, including `translationKey` for posts. A page whose locale has no counterpart
gets no alternates rather than a wrong one, matching the page-level behaviour.
`tests/build-output.test.ts` asserts the two agree per URL.

### One rule for URL shape

`src/lib/url.mjs` decides what a URL looks like here, and canonical, OG, hreflang
and the sitemap all go through it. The rule follows `trailingSlash: 'never'`: no
trailing slash, except the root, which is `https://site.com/`. That is how the
WHATWG URL serializer writes an origin and how `@astrojs/sitemap` 3.7.4+ emits it
(astro#17851); before Oct 2026 the blueprint pinned 3.7.3 to keep a bare root.

It exists because they disagreed. `@astrojs/sitemap` applies the trailing-slash
policy *after* `serialize()`, and applies it inconsistently — it strips the slash
from `<loc>` and keeps it in that same entry's alternates. Neither is reachable
through its API, so the fix is to make everything the project controls agree with
`<loc>`, which is the URL Google reads alongside the page's canonical.

`tests/build-output.test.ts` asserts that pairing exactly. The only place the root
forms are treated as equal is the sitemap-vs-page hreflang comparison, where the
integration emits both — and RFC 3986 says an empty path and `/` are the same
resource, so that normalization is a fact, not a loosened assertion.

### `lastmod`: posts only, from their own dates

A post's `lastmod` is its `updated`, else its `date`, as written in its frontmatter
(`src/lib/sitemap.mjs`). Every other page has none, deliberately: the honest source
would be the content's last edit, a fresh clone has no such timestamp (file mtimes
become the checkout date), and an inaccurate `lastmod` is worse than none — Google
discounts the signal for the whole site once it stops trusting it. A page gets one the
day its content carries a real edit date. `tests/build-output.test.ts` checks both
directions: every post has the right value, no other page has one.

### Article dates in the head

A post also declares `article:published_time` and `article:modified_time` (the same two
dates) next to `og:type="article"`, and its JSON-LD carries `datePublished` and
`dateModified`. Pages that are not articles declare neither.

### RSS

The feed is useless without the discovery link, so `BaseHead` emits
`<link rel="alternate" type="application/rss+xml">` on every page, pointing at
the current locale's feed. Its `title` is the **feed's** title, not the page's:
using the page title made every page advertise a different name for the same
feed, which readers show verbatim in a subscribe dialog.

Items carry title, description, `pubDate`, category and an absolute link built
by the same `canonicalPath` rule as the canonical tag and the sitemap. Projects
are deliberately not syndicated: a portfolio is not chronological, and a feed
that re-emits it every time an entry is reordered is noise.

## JSON-LD

Built in `src/lib/seo.ts`, emitted by `components/seo/JsonLd.astro`.

| Graph | Where | Notes |
|---|---|---|
| `Organization` \| `LocalBusiness` \| `ProfessionalService` | Every page | Type from `site.organization.type`. The non-`Organization` types add `geo`, `openingHours` and `priceRange`, and the schema *requires* `contact.address` for them. `organization.areaServed` adds where it sells. `Person` gets `address` too when there is one. |
| `WebSite` | Every page | Linked to the organization by `@id` |
| `FAQPage` | Sections with `jsonLd: true` | Keep it to one section per site — Google devalues duplicates |
| `BreadcrumbList` | Every non-home page and every post | |
| `Article` | Post detail | `datePublished`, `dateModified`, `image`, publisher by `@id` |

For a business with a physical location, `LocalBusiness` with real coordinates and
hours is worth more than any amount of copy tuning. That is why the schema refuses
to let you declare the type without the address.

A business that works remotely can still say where it is: `contact.address`
with only `city`, `state` and `country` emits a locality without a street, and
`organization.areaServed` (for example `["México"]`) tells search engines the
market is wider than that city.

Two brands with the same name: `organization.disambiguatingDescription` says
which one this is, and `organization.founder` (`id` pointing at the founder's
`Person` graph on their own site) ties the two together. A personal site does the
reverse with `worksFor.id`. `organization.logo` should be a stable PNG path
(`/logo.png`): Google ignores a hashed SVG. `legalName` is only emitted when
`brand.legalName` is declared.

## Images

Every image goes through `components/ui/Picture.astro`, which wraps Astro's
`<Image>`. Local assets are optimized at build; remote CMS URLs go through the
remote pipeline (`image.remotePatterns`, allow-listed per host through the
`IMAGE_REMOTE_HOSTS` env var). Public-directory paths fall back to a
plain tag because there is nothing to optimize.

`priority: true` on a media object sets `loading="eager"` and `fetchpriority="high"`.
Use it on the LCP image only — one per page, at most.

`Picture.astro` emits a width ladder (400 to 1920, capped at the source) so a phone
downloads a phone-sized image. It used to emit a single width: on the demo's 20KB
hero that wasted 17KB, and a real client photo is ten times that.

### Scroll cost is not in the Lighthouse score

Lighthouse measures load, not interaction smoothness. A page can score 100 and
still scroll badly: `backdrop-filter` on a sticky header, large `fixed` layers and
`scroll-snap` all cost per frame, not at load. The blueprint keeps the header blur
off by default for this reason (`features.headerBlur`).

Verify by scrolling on a real machine. Headless Chrome does not reproduce it —
measured here at CPU 6x with and without GPU, 880 frames, zero over 20ms, while a
real window felt wrong.

### No `<link rel="preload">` for the hero, on purpose

Measured rather than assumed. With the hero in place, Lighthouse reports
`prioritize-lcp-image` as passing and the LCP breakdown as:

| Phase | Time |
|---|---|
| TTFB | 453 ms |
| Load Delay | **0.7 ms** |
| Load Time | 34 ms |
| Render Delay | 718 ms |

A preload buys back Load Delay. There is none to buy: the image is in the initial
HTML with `fetchpriority="high"`, so the browser finds it immediately. Adding one
would be a tag that looks like an optimization and does nothing.

If a clone moves the hero image behind JS, or loads it from another origin, this
stops being true — re-measure before concluding it still holds.

## Third-party embeds

YouTube and maps load as facades: a static thumbnail or placeholder, with the real
iframe injected on click. An eager YouTube embed costs roughly half a megabyte of
third-party JavaScript and takes the performance score down with it. YouTube is
loaded from `youtube-nocookie.com`.

## Budget

Lighthouse desktop preset, measured on the demo site (`npm run build && npm run preview`):

`npm run audit` runs a **throttled mobile** profile. It ran desktop until the hero
image went in: desktop scored 100 on a single-width `srcset`, because a wide
viewport asks for the large source anyway. Only mobile saw the waste, and mobile
is where landings are read. `npm run audit -- --desktop` still exists for the
easier profile.

| Category | Target | Demo result |
|---|---|---|
| Performance | ≥ 95 | 100 |
| Accessibility | 100 | 100 |
| Best Practices | 100 | 100 |
| SEO | 100 | 100 |

`npm run audit` picks a free port and then verifies the server answering is
really serving this repo's `dist/` before it measures. Two clones auditing at the
same time used to collide on a fixed port — the lucky outcome was a crash, the
unlucky one was scoring the other repo's build and reporting it as yours.

Lighthouse runs through `npx` rather than as a devDependency: as a dependency it
drags 17 moderate advisories and ~180MB into every clone, which is a worse trade
than retrying the occasional shared-cache collision.

Verified on `/`, `/servicios`, `/contacto`, `/en` and a post page. Re-run it before
shipping a clone — new content, especially unoptimized images, is what usually
breaks the budget.

Contrast is not part of this budget — Lighthouse only scores the pairs the demo
renders. Every declared token pair is checked by `tests/contrast.test.ts`; see
[../GUIDES/BRAND_TOKENS.md](../GUIDES/BRAND_TOKENS.md#contrast).

## Rules

Every change is checked against these before it ships. Each rule names the gate
that fails when it breaks; a rule without a gate is marked manual, and stays a
checklist item until someone writes its test. They come from the first two
clones (iteris.tech and dpeluche.dev, Oct 2026): every one of them shipped to a
preview with the rest of the suite green.

| # | Rule | Gate |
|---|---|---|
| 1 | Content is in the first HTML response. A crawler indexes what the server sends; a page that renders its copy in the browser answers with an empty shell. Both sites these clones replaced served 3 to 12 words per page, and search engines had indexed 1 and 3 of their pages. | `build-output`: at least 40 words in `<main>` without JS |
| 2 | Canonical, sitemap and `og:image` use the real origin. `SITE_URL` goes in `.env` **and** in every deploy environment (Preview and Production). A new Vercel project has neither. | `build-output`: no `example.com` origin in a clone |
| 3 | Every link has a real `href`. A row that only opens with JavaScript is invisible to a crawler. | `build-output`: anchors without `href` fail |
| 4 | Icons, manifest and og image belong to the brand. `npm run reset` leaves the demo's in `public/`. | `build-output`: manifest name equals `brand.name` |
| 5 | The LCP element is never animated from `opacity: 0`. Chrome does not count an opacity-0 paint as LCP, so a headline that fades in from 0 reports no LCP: Lighthouse performance 0, and no Core Web Vitals for real users. Start entrance animations at `0.01`. | `npm run audit` (performance 0 on that page). `fade-in` in `theme.css` already starts at 0.01 |
| 6 | Every URL the old site had still answers: 200 at the same path, or a 301 in `vercel.json`. Compare against the old `sitemap.xml`, and keep `/sitemap.xml` answering if Search Console knows that name. | manual, before the domain switch |
| 7 | One `<h1>`, a title and a description per page; hreflang and sitemap agree. | `build-output` (existing tests) |
| 8 | Lighthouse budget met on real content, mobile profile. With `robots.index` off the only SEO audit allowed to fail is `is-crawlable`. | `npm run audit` |
| 9 | Measure before and after. A migration records the old site's Lighthouse scores and word counts next to the new ones in its plan, so "better" is a number. | manual |

`npm test` covers 1 to 4 and 7 on every run. Rules 5, 6, 8 and 9 need a browser
or the old site, so they run before each preview is shared and again before
the domain switch.

## Being found

A Lighthouse SEO score of 100 means the page is technically readable. It does
not mean anyone finds it. What decides that, and what a clone should settle
before launch:

- **Search Console is the source of truth.** Verify the domain, submit the
  sitemap, and read coverage and queries a week after launch. Without it,
  "indexed" is a guess.
- **The name people search.** Use the name the brand or person is actually
  searched by (full legal or full personal name) in the home `<title>`, the
  `<h1>` or first paragraph, and `organization`. A short handle that collides
  with a bigger brand (another company with the same name, a store with the
  same handle) loses that query no matter how good the page is.
- **Connect the entity.** `organization.sameAs` lists the profiles that
  already rank for the name (LinkedIn, GitHub, accelerator pages, directories),
  and those profiles link back to the site. That is how a search engine joins
  the site to the person or company it already knows.
- **Disambiguate with place and category.** When the name is shared, the copy
  and JSON-LD carry what tells them apart: city, country, what the business
  does.
- **Inbound links.** Every profile, repo README and directory listing the
  owner controls points to the site, with the brand name as link text.
- **Depth.** One page per product, project or service, with real text. A home
  page alone ranks for the brand at best.

## Checklist before a clone goes live

- [ ] `robots.index` back to `true` (`npm run reset` leaves it off)
- [ ] `SITE_URL` set in `.env` and in the Preview and Production deploy environments (rule 2)
- [ ] `site.seo.defaultTitle` / `defaultDescription` rewritten (not the demo's)
- [ ] `npm run assets` re-run after replacing the brand SVGs
- [ ] `organization.type` matches reality, with address and geo if local
- [ ] `FAQPage` enabled on exactly one section
- [ ] Search Console verification added to `site.seo.verification`
- [ ] `/rss.xml` opens and lists the real posts, if `updates` is enabled
- [ ] Lighthouse re-measured on the real content, old site measured too (rules 8, 9)
- [ ] Old sitemap URLs all answer (rule 6)
- [ ] Search Console: sitemap submitted, coverage read a week later
- [ ] `organization.sameAs` lists the profiles that already rank for the name
