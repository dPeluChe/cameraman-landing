# Audit: labs-landings-base, iteris-landing, dpeluche-landing (Astro 7)

Date: 2026-10-13. Read-only. No installs, no branch switches, no builds. Where "dist/" output is cited it was read from the existing `dist/` folders (built Oct 13, 16:14), not rebuilt, so treat those facts as "as of that build".

Repos read as they sit in the working tree:
- BP = `workspace-blueprints/labs-landings-base` (`feat/seo-gates`)
- IT = `workspace-dpeluche/iteris-landing` (`astro-migration`)
- DP = `workspace-dpeluche/dpeluche-landing` (`feat/migrate-site`)

Key structural fact: `astro.config.mjs`, `src/lib/seo.ts`, `src/components/seo/BaseHead.astro` and `src/components/ui/Picture.astro` are byte-identical across all three repos (checked with `diff -q`). `package.json` differs only by name (IT) and by `convex` + `sync:hq` (DP). So almost every SEO, config and image finding is a blueprint finding, and a fix there reaches the clones through `carry`/UPDATING_FROM_BLUEPRINT.

Docs cited (all fetched this session): docs.astro.build/en/reference/configuration-reference/, /guides/view-transitions/, /guides/images/, /guides/fonts/, /guides/content-collections/, /reference/content-loader-reference/, /guides/testing/, /guides/environment-variables/, /guides/prefetch/, /guides/integrations-guide/sitemap/, /reference/modules/astro-assets/, /guides/upgrade-to/v7/; developers.google.com/search/docs (product-snippet, article, localized-versions, build-sitemap). The installed Astro 7.3.5 config schema (`node_modules/astro/dist/core/config/schemas/base.js`) was read to confirm which options exist.

---

## 0. Installed versions vs latest published (`npm outdated`, `npm view`)

| Package | BP | IT | DP | Latest | Note |
|---|---|---|---|---|---|
| astro | 7.3.5 | 7.3.5 | 7.3.5 | 7.3.8 | patch; 7.3.8 needs vite ^8.3.1 |
| @astrojs/react | 6.0.2 | 6.0.2 | 6.0.2 | 7.0.1 | major; 7.x adds peer `oxc-transform-react`; 6.0.6 is the in-range "wanted" |
| @astrojs/sitemap | 3.7.3 (exact pin) | same | same | 3.7.4 | pin, see section 7 |
| @astrojs/rss | 4.0.19 | same | same | 4.0.19 | current |
| @astrojs/check | 0.9.10 | same | same | 0.9.10 | peer `typescript ^5 \|\| ^6` |
| @astrojs/mdx | not used | | | 8.0.3 | not needed |
| tailwindcss, @tailwindcss/vite | 4.3.3 | same | same | 4.3.3 | current |
| vite | 8.2.0 | same | same | 8.3.4 | comes via astro |
| zod | 4.6.5 | same | same | 4.6.7 | explicit dep, docs say import from `astro/zod` |
| typescript | 5.9.3 | same | same | 7.0.2 | highest allowed by @astrojs/check and typescript-eslint is 6.0.3 |
| eslint / @eslint/js | 9.39.5 | same | same | 10.12.0 / 10.0.1 | pin, see section 7 |
| vitest | 4.1.11 | same | same | 5.0.4 | major, peer vite ^6.4 \|\| ^7 \|\| ^8, node ^22.12 |
| react / react-dom | 19.2.8 | same | same | 19.3.0 | minor |
| marked | 18.0.9 | same | same | 18.1.1 | minor |
| convex | n/a | n/a | 1.34.0 | 1.46.0 | only used by `scripts/sync-hq.mjs` |
| astro-eslint-parser | 3.0.0 | 3.2.0 | 3.2.0 | 3.2.0 | lockfile drift between repos |
| lighthouse (via npx) | @12 | @12 | @12 | 13.5.0 | `scripts/audit-build.mjs` pins `lighthouse@12` |

`npm audit --omit=dev` in BP: 0 vulnerabilities. `npm ls` in BP exits with ELSPROBLEMS: a nested `astro-eslint-parser@1.4.0` under `eslint-plugin-astro` is "invalid" against the `overrides` `^3.0.0`. The local `node_modules` is stale relative to the override; `npm ci` fixes it. Not a repo bug, but worth running before trusting a local `npm run lint`.

---

## 1. astro.config.mjs

All three files are identical, so every item is a BP item unless marked.

### 1.1 `site` falls back to `https://example.com` (astro.config.mjs:18)
- Does: `env.SITE_URL || env.PUBLIC_SITE_URL || 'https://example.com'`. A deploy without the variable builds green and ships example.com canonicals, sitemap and og:image.
- Evidence it bites: IT `docs/BLUEPRINT_FEEDBACK.md` #15, DP `docs/BLUEPRINT_FEEDBACK.md` #13 (Vercel project without the variable passed every test), BP `docs/TASK_TODO.md` WQ-003 still open. `tests/build-output.test.ts:13-15` also resolves the env differently from the config (DP feedback last paragraph).
- Better: fail fast at config time when `process.env.CI` or `VERCEL_ENV` is set and the value is empty or `example.com`; read the same resolved value in tests from one shared helper. Docs: https://docs.astro.build/en/reference/configuration-reference/#site (site drives canonical, sitemap, RSS).
- Impact: high (SEO, silent). Effort: S. Belongs in the blueprint.

### 1.2 No `env.schema` / `astro:env` (astro.config.mjs has no `env`; reads at `src/components/sections/ContactFormSection.astro:25-26`, `src/components/dp/pages/Contact.astro:19-20`, `src/lib/analytics.ts:20`)
- Does: `import.meta.env.PUBLIC_*` with `?? ''` fallbacks; `process.env` in `scripts/sync-*.mjs`.
- Better: declare `PUBLIC_CONTACT_ENDPOINT`, `PUBLIC_CONTACT_KEY`, analytics ids with `envField` (`context: 'client', access: 'public'`) so a missing required value fails the build with a name, and the sync tokens as `context: 'server', access: 'secret'`. Docs: https://docs.astro.build/en/guides/environment-variables/ ("astro:env" section). `astro:env` cannot feed `site` itself (config loads first), so 1.1 still needs the explicit guard.
- Impact: med (rule 5 in CLAUDE.md, "a missing required field must break the build", is not enforced for env). Effort: S-M. Blueprint.

### 1.3 `trailingSlash: 'never'` with default `build.format: 'directory'` (astro.config.mjs:23)
- Does: emits `servicios/index.html`; the "no trailing slash" URL works because `vercel.json` sets `cleanUrls` and `trailingSlash: false`.
- Better practice: Astro states trailing slashes on prerendered pages are handled by the host and "may not respect your chosen configuration" (config reference, `trailingSlash`). `build.format: 'file'` yields `servicios.html`, which matches a slash-less URL on any static host. Only matters if a clone leaves Vercel.
- Impact: low (portability). Effort: S, but touches `build-output` tests that read `dir/index.html`. Blueprint, optional; at minimum document it in `docs/GUIDES/DEPLOY.md`.

### 1.4 `build.inlineStylesheets: 'auto'` (astro.config.mjs:55)
- Does: sets the default value explicitly (no-op). DP dist `<head>` shows two external stylesheets plus inline `<style>` blocks, so CSS above 4 KB is still a render-blocking request (BP WQ-004 lists "render-blocking CSS").
- Better: measure `'always'` on a mobile Lighthouse run; for a 5-30 page landing the extra HTML bytes usually cost less than the blocking round trip. Docs: config reference `build.inlineStylesheets`.
- Impact: low-med (perf). Effort: S (one line plus `npm run audit`). Blueprint, behind a measurement.

### 1.5 `prefetch: { prefetchAll: true, defaultStrategy: 'viewport' }` (astro.config.mjs:57)
- Does: prefetches every same-origin link as it enters the viewport. Docs: data-saver and slow connections fall back to `tap`; with `<ClientRouter />` prefetch is already on with `prefetchAll: true` (https://docs.astro.build/en/guides/prefetch/, "Using with View Transitions").
- Better: fine for small static sites. `hover` is gentler on mobile data; viewport on a page with a 17-card grid (DP /projects) prefetches 17 pages. Consider `data-astro-prefetch="false"` on grids.
- Impact: low. Effort: S. Blueprint, optional.

### 1.6 `image.remotePatterns: [{ protocol: 'https' }]` (astro.config.mjs:53)
- Does: any https host is processed by the image service at build, and by the dev `/_image` endpoint.
- Better: allow-list the CMS host per clone with `domains`/`remotePatterns.hostname`. Docs: https://docs.astro.build/en/guides/images/#remote-images ("only process images from authorized image sources").
- Impact: low-med (supply chain, dev SSRF surface). Effort: S. Blueprint default narrow, clone adds its host.

### 1.7 No `image.layout` / `responsiveStyles` (astro.config.mjs:53)
- See section 3.2; `Picture.astro` hand-rolls what `layout` generates.

### 1.8 i18n block (astro.config.mjs:25-29)
- Does: `prefixDefaultLocale: false`, locales from `src/lib/locales.mjs`; hreflang and sitemap alternates are custom because segments are translated (documented in SEO.md, tested).
- Assessment: justified; Astro's sitemap `i18n` option pairs by identical path, which is the documented reason it is bypassed. DP has a single locale (`LOCALES = ['en']`) and still carries the `[...lang]` route tree; harmless but adds files (DP feedback #5). No action.

### 1.9 Integrations (astro.config.mjs:31-44)
- `react()` is loaded in all three, but IT uses no island (its `contact` is a custom Astro form, `grep client:` finds only `ContactFormSection.astro:40`, which no IT page renders) and DP's contact is an inline script. The integration adds no client JS when unused, but keeps `react`, `react-dom`, `@astrojs/react`, `@types/react*`, `react-doctor`, `eslint-plugin-jsx-a11y` in the tree and the `doctor` gate (BP CLAUDE.md "react-doctor 100/100") scoring a framework the clones do not ship. IT's migration doc says "Sin React", but the dependency stays.
- Better: blueprint keeps React optional; `npm run init:clone` (or a documented `drop-react` step) removes it when no section uses the island.
- Impact: low (maintenance). Effort: M. Blueprint (a flag) and IT/DP (use it).

### 1.10 Experimental flags
- Astro 7.3.5 schema accepts: `clientPrerender`, `contentIntellisense`, `chromeDevtoolsWorkspace`, `incrementalBuild`, `svgOptimizer`, `collectionStorage`. None is set. `queuedRendering`, `rustCompiler`, `advancedRouting`, `cache`, `routeRules`, `logger` graduated in 7.0 (upgrade guide), so no stale flags remain. Candidates: `svgOptimizer` for the SVG logos in `src/assets/brand/` (tiny win); `clientPrerender` only if DP keeps ClientRouter (Speculation Rules eagerness). Not worth enabling blind.
- Impact: low. Effort: S. Skip for now.

### 1.11 Security: no `security.csp` (astro.config.mjs has no `security`)
- Does: `vercel.json` sets nosniff, Referrer-Policy, X-Frame-Options, Permissions-Policy and HSTS preload (all three repos); no CSP anywhere. Analytics loads from a third-party origin (DP: `stats.fondor.space`).
- Better: `security.csp` is stable in 7 (config reference `security.csp`, "Added in 6.0.0"): it hashes bundled scripts/styles and writes a `<meta http-equiv="content-security-policy">`. Documented limits: external scripts need explicit hashes/resources, and "Astro's view transitions using `<ClientRouter />` are not supported", which makes it incompatible with DP as built. Inline `is:inline` theme script and `define:vars` also need hashes.
- Impact: med-low (a static landing with no user input). Effort: M for BP/IT; L for DP (drop ClientRouter or use native View Transitions). Blueprint, opt-in flag; DP only after the router decision.

### 1.12 `<meta name="generator">` (BaseHead.astro:~49) and `defaultStrategy` etc. are fine; nothing else flagged in config.

---

## 2. Head, SEO, structured data

### 2.1 JSON-LD is serialized without escaping `<` (`src/components/seo/JsonLd.astro:10`)
- Does: `set:html={JSON.stringify(entry)}`. A CMS string containing `</script>` (FAQ answer, post title, project name) ends the script element and injects markup. Content is CMS-fed (CONTENT_SYNC.md), so this is not hypothetical. IT also pushes `item.seo.title` etc. into the graph (`WorkDetail.astro:55-66`).
- Better: `JSON.stringify(entry).replace(/</g, '\\u003c')` (valid JSON, same meaning). Add a build-output test that plants `</script>` in a fixture title.
- Impact: med (security/correctness). Effort: S. Blueprint; clones inherit.

### 2.2 `sameAs` is duplicated (`src/lib/seo.ts:52`)
- Does: `[...org.sameAs, ...site.social.map(s => s.url)]`. DP dist/index.html emits GitHub and LinkedIn twice (both lists hold the same URLs in `src/content/site/en.json:19-27,49-52`).
- Better: de-duplicate with `new Set`. Impact: low. Effort: S. Blueprint.

### 2.3 No `Person` entity (`src/schemas/site.ts:91`, enum `Organization | LocalBusiness | ProfessionalService`)
- Does: DP, a personal portfolio, emits `Organization` with a `contactPoint` of type `sales` (dist/index.html). DP feedback #6 already asks for it.
- Better: a `Person` node (`name`, `jobTitle`, `url`, `image`, `sameAs`, `worksFor`) as the site's `@id`, and `WebSite.publisher` pointing at it; optionally `ProfilePage` on `/about`. Schema.org guidance; Google treats Person as an entity signal for knowledge panels.
- Impact: med for DP, none for IT. Effort: M (schema enum + `organizationJsonLd` branch + `WebSite.publisher` `@id` + schema and build-output tests). Blueprint (entity kind), consumed by DP.

### 2.4 Per-page types are thin
- BP has `Organization|LocalBusiness`, `WebSite`, `FAQPage`, `BreadcrumbList`, `Article` (`seo.ts:43,82,94,107,128`). `Article` has no `author` (Google lists `author` as recommended: developers.google.com/search/docs/appearance/structured-data/article), no `articleSection`, no `BlogPosting` option.
- DP `DetailPage.astro:20-26` builds only a `BreadcrumbList`, even for changelog posts (the blueprint's `articleJsonLd` is not used by the HQ-backed route) and ProjectDetail pages.
- IT `WorkDetail.astro:55` types own products as `Product` with a `brand` and no `offers`, `review` or `aggregateRating`. Google's product-snippet page states one of those three is required ("Product snippets require either review or aggregateRating or offers"), so these nodes are invalid for rich results and show as errors in Search Console. A `SoftwareApplication` (or `WebPage` with `about`) matches what FeedBy/Krilbot/Tasky are.
- IT also uses `inLanguage: locale` (`'en'`) at `WorkDetail.astro:~59` while BP uses `htmlLang(locale)` (`'en-US'`); pick one.
- Impact: med (SEO eligibility/clean Search Console). Effort: S per type. DP and IT fixes are clone-local; `author` on Article plus a `BlogPosting` toggle belong in BP.

### 2.5 Canonical, hreflang, x-default
- Canonical comes from `Astro.url.pathname` (BaseHead.astro:~32) and goes through `absoluteUrl` (`src/lib/url.mjs`), tested against the sitemap. Good.
- `x-default` is `alternates[0]` (BaseHead.astro:60). It is right only while the default locale is first in `LOCALES`; BP (`['es','en']`, default `es`) and IT (`['en','es']`, default `en`) happen to line up. Better: pick the alternate whose `locale === defaultLocale` (Google: x-default is the fallback for unmatched languages, localized-versions doc). Impact: low (latent). Effort: S. Blueprint.
- `showAlternates = alternates.length > 1` means single-locale pages emit no self-referencing hreflang. That is acceptable for DP.

### 2.6 OG/Twitter (BaseHead.astro:86-100)
- `og:image:alt` equals the page title (line 95), no `twitter:image:alt`, no `article:published_time`/`article:modified_time`/`article:section` for `ogType="article"`, no per-project OG image in DP (`DetailPage.astro` passes none, so every project and post uses `/og/default.png`).
- Better: alt = dedicated field (or brand + page title), article times from `post.data.date/updated` (and HQ `publishedAt`), per-project OG via the existing `generate:og` script or the cover image once self-hosted.
- Impact: low-med (share previews). Effort: S-M. Blueprint (alt/article tags); DP (per-item OG).

### 2.7 Titles: brand duplicated on home (DP dist/index.html)
- `<title>Antonio Martinez, CEO & Builder | Antonio Martinez</title>`: `src/content/pages/en/index.json:5` holds the title and `site.seo.titleTemplate` (`"%title% | %brand%"`, `en.json:33`) appends the brand again; `seo.defaultTitle` is the same string (`en.json:32`).
- Better: home uses `defaultTitle` and skips the template, or a build-output test fails when `title` ends with `brand` twice. Impact: low-med. Effort: S. Blueprint (index rule + test); DP content edit.

### 2.8 Robots meta and sitemap
- `robots.txt.ts` (all repos) is generated from config; fine. IT's plan promises GPTBot/ClaudeBot/PerplexityBot access; `User-agent: * / Allow: /` already does that, so no per-bot block is needed.
- `@astrojs/sitemap` filter only drops `/404` (astro.config.mjs:36). A page with `seo.noindex: true` still enters the sitemap and no test checks it (`grep noindex tests/` only covers 404). Google flags "submitted URL marked noindex". Better: exclude noindex pages in `filter` using the same page data as `alternatesByPath`, and add a build-output assertion. Impact: low-med. Effort: S. Blueprint.
- `lastmod` is deliberately omitted (SEO.md "No lastmod"). The reasoning holds for the blueprint demo but not for the data these sites have: BP posts carry `date`/`updated` (`content.config.ts`), DP carries `updatedAt` on projects and `publishedAt` on posts (`src/site/hq.ts:37,60`). Google: lastmod is used "if it's consistently and verifiably accurate" (build-sitemap doc). Better: emit `lastmod` only for entries with a real timestamp via `serialize()`. Impact: low-med. Effort: S-M. Blueprint (posts/projects) and DP (HQ data).

### 2.9 RSS (`src/pages/[...lang]/rss.xml.ts`)
- Does: title, description, pubDate, category, link per item; `xmlns: { atom }` is declared (line ~34) but no `atom:link rel="self"` is added, so the namespace is unused and feed validators warn. No `content` (full text) and no `author`/`dc:creator`.
- Better: add `<atom:link href=... rel="self" type="application/rss+xml"/>` in `customData`, optionally `content: sanitizeHtml(...)` per the Astro RSS guide (https://docs.astro.build/en/guides/rss/). DP has no feed at all (`routes.updates` disabled; changelog posts come from the HQ) although it has a changelog with dated posts: a DP feed from `postDetails` is cheap.
- Impact: low. Effort: S. Blueprint (self link), DP (feed).

---

## 3. Images and fonts

### 3.1 Fonts: italic files are downloaded and preloaded on every page (`src/lib/fonts.mjs:12-22`, `BaseHead.astro:65`)
- Does: no `styles` key, so Astro's default `["normal", "italic"]` applies (config reference `font.styles`). BP dist/index.html preloads two Inter files (`e868…woff2` 48 KB normal, `91753…woff2` 51.6 KB italic) and emits `font-style:italic` in 6 `@font-face` rules. Italic is used only in a testimonial blockquote and `prose.css:41`. DP dist preloads six files (148 KB total): Inter normal+italic and IBM Plex Mono 400/700 normal+italic; DP has no `italic` anywhere in `src/`. `<Font preload>` with no array preloads "all possible font links" (astro-assets reference).
- The fonts.mjs comment says preload plus latin subset was "measured at budget"; the measurement never separated italic.
- Better: `styles: ['normal']` for DP/BP when italics are unused (the browser synthesizes italic for the one blockquote, or keep italic unpreloaded), and pass a preload array, for example `preload={[{ weight: 400, style: 'normal', subset: 'latin' }]}`. Docs: https://docs.astro.build/en/guides/fonts/ ("Preloading fonts") and https://docs.astro.build/en/reference/modules/astro-assets/#preload.
- Impact: med-high (about 50 KB of high-priority transfer per page in BP, ~70-100 KB in DP; font is LCP on text pages, per fonts.mjs). Effort: S. Blueprint first; DP also trims Plex.

### 3.2 `Picture.astro` hand-rolls responsive images (`src/components/ui/Picture.astro:20-21,32-65`)
- Does: wraps `<Image>` (the file is named Picture but never uses `<Picture>`), fixed width ladder, per-call `sizes`, WebP only (dist shows `.webp`). `Bento.astro:68` and `Logos.astro:24,27` pass no `sizes`, so with a `widths` ladder the browser assumes `100vw` and can pick a larger candidate than the layout slot (SVG logos get a single `200w` srcset, harmless noise).
- Better: Astro 7 supports `layout="constrained"` per component or `image.layout` globally, which generates `srcset` and `sizes` and the CSS (https://docs.astro.build/en/guides/images/#responsive-image-behavior); Tailwind 4 users keep `responsiveStyles: false` per the docs. For photos, `<Picture formats={['avif','webp']}>` gives AVIF. `priority` on `<Image>` also sets `fetchpriority=high`, `loading=eager`, and `decoding=sync` (the wrapper sets `decoding="async"` for the LCP image).
- Impact: low-med (perf for photo-heavy clones; demo is already 100). Effort: M (the ladder was measured against the audit script, so re-measure). Blueprint. Cheap first step: add `sizes` to Bento/Logos (S).

### 3.3 DP: remote covers as CSS background (`src/components/dp/work/ProjectCard.astro:10-11,20-21`, `src/components/dp/pages/ProjectDetail.astro:36-43`)
- Does: `style="background-image: url(https://placehold.co/…)"`. `src/content/hq/projects.json` and `featured.json` carry `placehold.co` URLs for `coverImage` and `image` (17 projects). Consequences: (a) 17 third-party requests on `/projects` with no lazy loading (CSS backgrounds are not lazy); (b) the detail cover is the above-the-fold image but invisible to the preload scanner and has `role="presentation"` and no alt; (c) not indexable as images; (d) a runtime dependency on placehold.co in production; (e) the comment says remote placeholders "never go through Picture", which is no longer true: `image.remotePatterns` already allows https and `Picture.astro` has a remote branch (lines 41-52).
- Better: render covers with `<Image>`/`Picture` (remote, `inferSize` or fixed 800x600 / 1600x900), lazy for cards, `priority` for the detail cover, descriptive alt from `project.title`. Build then downloads and self-hosts them. Better still: stop shipping placeholder URLs and give the HQ a real `coverImage` (or none, which the card already handles with initials). Docs: https://docs.astro.build/en/guides/images/#remote-images.
- Impact: high (perf, a11y, SEO images, third-party dependency). Effort: M. DP only (the HQ data fix is outside this repo).

### 3.4 DP: arrow glyphs missing from Google subsets (DP feedback #11; `src/lib/fonts.mjs:25-33`, `ProjectDetail.astro:105,115` uses `←` `→`)
- Does: `subsets: ['latin']` for IBM Plex Mono; arrows fall back to a system font.
- Correction to the proposed fix: `font.unicodeRange` (config reference) controls when the browser downloads a face; it does not add glyphs. The Google provider does accept `options: { experimental: { glyphs: [...] } }` (unifont 0.7.5 appends `&text=`), which returns a face containing only those characters, but it is experimental and a `&text=` face replaces the regular subset for that request, so it needs a second font entry.
- Simplest robust fix: render the arrows as SVG icons (lucide `arrow-left`/`arrow-right` via the existing `Icon.astro`) in the five places that use them (`ProjectDetail.astro`, `src/layouts/PostDetail.astro`, `work-ui.json`, `changelog-ui.json`, `terminal/commands.ts`). 
- Impact: low (cosmetic). Effort: S. DP only.

### 3.5 Other image notes
- IT `src/components/iteris/TechStack.astro:10-25` loads technology icons from `cdn.simpleicons.org` and `cdn.jsdelivr.net` as raw `<img>` (two per tech for light/dark). That breaks BP rule 3 ("No raw `<img>`"), contradicts the font-egress philosophy (`scripts/check-font-egress.mjs`), adds third-party requests on every page that lists a stack, and fails offline/CDN-down. Better: `astro-icon` with `@iconify-json/simple-icons` and `@iconify-json/devicon` (inlined at build, themable via `currentColor`, so the dark/light pair collapses to one element). Impact: med-high (perf, privacy, robustness). Effort: M. IT only.
- BP `LiteYouTube.astro:23` raw thumbnail `<img>` is documented and justified.

---

## 4. Scripts and interactivity

### 4.1 Bundled vs inline
- BP follows its rule: bundled `<script>` for components, `is:inline` only for the pre-paint theme script. 10 components in BP, 17 in IT, 18 in DP carry a `<script>`. Astro dedupes bundled scripts, so cost is one request per distinct chunk. Fine.

### 4.2 Theme script lacks storage guards (BP `src/layouts/BaseLayout.astro:63`, `ThemeToggle.astro:65`; IT `BaseLayout.astro` same)
- Does: unguarded `localStorage.getItem/setItem`. Blocked storage (private modes, strict settings) throws in the head script and aborts the theme resolve; the throw happens before first paint.
- DP already ships the hardened version (`BaseLayout.astro:60-77`: try/catch, `apply(doc)` reused). IT's Navbar toggle has a try/catch on set (`Navbar.astro:150-155`) but not on the head read.
- Better: backport DP's guarded `apply`, and add `<meta name="color-scheme">`/`color-scheme` CSS so form controls and scrollbars match (no `color-scheme` in `src/styles` today).
- Impact: low-med (robustness). Effort: S. Blueprint; IT inherits.

### 4.3 React islands
- BP: one island, `ContactForm` with `client:visible` (`ContactFormSection.astro:40`), tested to be absent from the home page. Good. See 1.9 for the clones that no longer use it.

### 4.4 `<ClientRouter />` in DP (`src/layouts/BaseLayout.astro:2,57`)
Lifecycle review against https://docs.astro.build/en/guides/view-transitions/ ("Script behavior", `astro:page-load`, `transition:persist`):
- Correct: page scripts run inside `document.addEventListener('astro:page-load', …)` (EditorWindow.astro:79, Terminal.astro:55, Work.astro:72, About.astro:99, Changelog.astro:129, Contact.astro:117). Module scripts execute once, so each registers a single listener and re-binds on every swap. `Nav.astro:12` and `Footer.astro:14` use `transition:persist`, and their scripts (Nav.astro:42-63, KikaPaws.astro:231-255) bind once to persisted nodes, which is right. The head theme script guards with `window.__dpTheme` and applies to `e.newDocument` in `astro:before-swap` (BaseLayout.astro:72-75), which avoids the flash and is the correct hook.
- Gaps:
  1. Focus: ClientRouter ships an `astro-route-announcer` (live region, verified in `node_modules/astro/components/ClientRouter.astro`) so the new title is announced, but it does not move focus. After clicking a tab link the focused element is replaced and focus drops to `<body>`. Better: on `astro:after-swap`/`page-load`, move focus to `#main` (`tabindex="-1"`) or the `h1`, except on hash-only navigation. Impact: med (a11y). Effort: S.
  2. `EditorWindow.astro:34-52`: tabs that navigate are `<a role="tab" aria-selected="false">` inside `role="tablist"`. Links that go to other pages are not tabs in the ARIA sense (no `tabpanel`, no arrow-key roving), and `aria-selected` on `<a>` is invalid-ish. Better: `<nav aria-label>` with `aria-current="page"` for page links and real tablist semantics only for in-page panels (`button` + `aria-controls`). Impact: med (a11y). Effort: M.
  3. `Nav.astro:18-22`: site nav links carry no `aria-current` (BP's Header does: `Header.astro:40,73`). With a persisted nav the current-page state must be updated on `astro:page-load`. Impact: low-med. Effort: S.
  4. `Terminal.astro:~97` calls `root.scrollIntoView({ behavior: 'smooth' })` and `KikaPaws` animates without a reduced-motion check; `base.css:43` has a global reduce rule but the smooth scroll is JS-driven. Low.
  5. The 51 uses of `text-[9px]`/`[10px]`/`[11px]` are a readability issue noted in `docs/MIGRACION.md` as copied from the design. Lighthouse does not fail it; WCAG 1.4.4 resize still works. Low-med.
- Prefetch: with ClientRouter the docs say `prefetchAll: true` is implied; BP config already sets it, so nothing to change.
- CSP is incompatible (see 1.11).
- Cost: ClientRouter adds one module script site-wide; DP Lighthouse is 98-99 so this is acceptable.

### 4.5 Should IT adopt ClientRouter?
- Not as a drop-in. IT has about 17 component scripts that bind once at load and are not page-load aware (`Navbar.astro:138-177`, `AgentChat.astro:120-`, `CustomCursor.astro`, `IterisContact.astro`, `IterisStory.astro`, `WorkDetail.astro`, `TechStack.astro` shuffle, and the `IntersectionObserver` reveal in `BaseLayout.astro:80-95`). Every one would need the DP treatment (page-load wrapper, persist for chrome), and the reveal observer would stop working on swapped pages, which is the kind of regression the tests do not cover.
- Benefit is smaller than in DP: IT's chrome is a normal navbar/footer, not an app-like shell. The one thing a swap would preserve is the canned AgentChat conversation, which can instead live in `sessionStorage`.
- Better, cheaper option for the same smoothness: native cross-document view transitions (`@view-transition { navigation: auto; }` in CSS, MDN "View Transition API", supported in current Chromium and Safari) plus the existing prefetch. IT already uses `document.startViewTransition` for its theme reveal (`Navbar.astro:157-162`, `iteris.css:81-86`), so the skill and CSS are in house. This also keeps the door open to CSP.
- Impact: low-med (UX only). Effort: S for the CSS, L for ClientRouter. IT only. Recommendation: do not adopt ClientRouter in IT; try the CSS rule if wanted.

### 4.6 Theme handling summary
- DP: robust. BP/IT: see 4.2. DP toggle updates aria-label per theme (`Nav.astro:46-50`) while BP uses `aria-pressed` plus a fixed label; both are valid, DP lacks `aria-pressed`. No system-preference change listener in any repo (low).

---

## 5. Content

### 5.1 Collections and loaders in BP
- `src/content.config.ts` uses `glob`/`file` loaders with explicit `generateId` and Zod 4, `image()` in schemas. Matches https://docs.astro.build/en/guides/content-collections/. 
- `import { z } from 'zod'` (content.config.ts:5, schemas/*.ts) while the docs now say "import the z utility from `astro/zod`. This is a re-export of the Zod library" (content-collections guide). BP carries its own `zod ^4.4.3` (installed 4.6.5) next to Astro's own `zod ^4.6.5`; two copies can drift and `@astrojs/sitemap@3.7.1` moved to its own zod, so the "which zod" question is open. Better: `astro/zod` in `src/content.config.ts` (the part Astro reads); keep `zod` for tests/scripts only if needed. Impact: low. Effort: S. Blueprint.
- `src/lib/sitemap.mjs:23-35` re-parses content files by hand (`readFileSync`, frontmatter) at config time, a second reader of the same data the collections read. It is why the sitemap works before the content layer exists, and it is covered by a test, so it is acceptable, but any new collection must be added in two places (DETAIL_SOURCES, `content.ts`). Low.

### 5.2 DP: HQ snapshot outside collections (`src/site/hq.ts:3-6,74-88`, `scripts/sync-hq.mjs`)
- Does: `sync-hq.mjs` pulls four Convex queries plus per-item details at `prebuild`, `rm`s `src/content/hq`, rewrites it (lines 64-74), and falls back to the committed snapshot on missing URL or failure (lines 18-25, 79-87). Pages read it through `import projectsJson …` plus `as unknown as Project[]` casts (hq.ts:74-77) and `import.meta.glob(…, { eager: true })` (hq.ts:84-85).
- Risks: no runtime validation (a renamed Convex field becomes `undefined` in the page, not a build error, contradicting BP rule 5); `slug` uniqueness and `getStaticPaths` are unchecked; the rm-then-write sequence leaves an empty tree if a write fails midway; nothing records when the snapshot was taken, so a production build without `HQ_CONVEX_URL` can publish stale data silently; `const URL = …` at sync-hq.mjs:15 shadows the global; `convex` is a devDependency used only for two imports and sits at 1.34 vs 1.46.
- Would a Content Layer loader be the right shape? Yes for the validation and typing, with one caveat. A custom loader (`defineCollection({ loader: hqLoader() })`, https://docs.astro.build/en/reference/content-loader-reference/) gets `parseData` against a Zod schema, `store.set`, digest-based change detection, and typed `getCollection`. The caveat is the fallback: the loader's store lives in `.astro/data-store.json`, which a fresh Vercel build does not have, so the "keep the committed snapshot" behavior must be reproduced inside the loader (read the committed JSON when fetch fails). Live loaders (`defineLiveCollection`) need on-demand rendering and are the wrong tool for `output: 'static'`.
- Recommended shape, smallest step first: (1) keep `sync-hq.mjs` as the writer (committed, reviewable diffs, deterministic offline builds), write one file per entry plus a `meta.json` with `syncedAt`; (2) register `hqProjects`, `hqPosts` with the `glob` loader and a Zod schema (S-M); (3) later, replace the script by a loader that fetches Convex and falls back to the snapshot (M). Both IT's CMS sync and BP's `sync-content.mjs` already follow "fetch, shape-check, write files, fall back" (CONTENT_SYNC.md), so (1)+(2) matches the blueprint pattern.
- Impact: high (maintainability, correctness). Effort: M. DP only; the freshness check (`syncedAt` older than N days fails CI on `main`) is a small BP idea.

### 5.3 IT: CMS sync
- `legacy/scripts/sync-iteris-content.mjs` (81 lines) pulls prospects into `src/data/prospects.generated.json`; the prospects moved to `iteris-demos` (MIGRACION_ASTRO.md "Contenido"), so it can be deleted with `legacy/`. IT's active `scripts/sync-content.mjs` is the blueprint's generic CMS slot, unchanged and unused (content lives in the repo, pending step 7 in the migration doc). Nothing to add until the CMS (Postea loader) exists; when it does, the same loader-versus-snapshot argument as 5.2 applies, and the blueprint's contract (Zod schemas as the CMS contract) already fits a loader.
- Impact: low now. Effort: S (delete). IT only.

### 5.4 IT `work` collection (`src/content.config.ts`, `src/site/work-routes.ts`)
- Custom `work` and `workUi` collections required edits to blueprint files (IT feedback #4: `content.config.ts`, `[section]/[slug].astro`, `sitemap.mjs`), which is why `tests/blueprint-drift.test.ts` is red. Two clones now request the same extension point (DP #3). Blueprint item: a `detailCollections` registry plus an empty `src/site/sections.ts` hook (IT #2, DP #2). Impact: med (maintainability of the clone model). Effort: M-L. Blueprint.

---

## 6. Tests and gates

What exists (BP `tests/`, 11 files, about 2000 lines; DP/IT same set): schemas (rejection tests), routing, nav-vs-routes, contact transport, contrast (WCAG over declared token pairs), build-output (one h1, canonical/description/og:image per page, JSON-LD graphs, FAQ once, hreflang segments, internal links and anchors, no `<img>` without alt, no React on home, robots/sitemap), carry, sync-content, presets, drift, doc-vs-tests. Plus scripts: `audit` (Lighthouse@12 mobile, budget 95/100/100/100), `responsive`, `doctor` (react-doctor), `verify:clone`, `check-font-egress`. CI runs lint, check, `npm audit`, doctor, build, test, verify-clone (`.github/workflows/ci.yml`).

Gaps against Astro and web guidance:

| # | Gap | Evidence | Better practice | Impact | Effort | Where |
|---|---|---|---|---|---|---|
| 6.1 | No axe-level a11y check. Lighthouse covers a subset and only 8 routes (`audit-build.mjs` `LIMIT = 8`, line 25). Nothing exercises keyboard, focus after navigation, or ARIA misuse (DP tabs, 4.4). | grep for `axe`, `playwright`, `AstroContainer` in tests/scripts/package.json finds nothing | `@axe-core/cli` or Playwright + `@axe-core/playwright` over every built route in `dist/` (Astro testing guide recommends Playwright for E2E: https://docs.astro.build/en/guides/testing/#playwright) | med-high | M | BP gate, clones inherit |
| 6.2 | Link checking is internal only (`nav-vs-routes`, build-output anchors). External links (social, project URLs from the HQ) are never checked | build-output.test.ts "every internal link" | `linkinator` (or `lychee`) on `dist/` in a scheduled job; DP has 17 HQ-sourced project URLs | low-med | S | BP (scheduled), DP |
| 6.3 | No component-level tests. Section components and layouts are only tested through the full build | no `astro/container` import anywhere; `experimental_AstroContainer` exists in 7 (`package.json` exports `./container`; testing guide "Vitest and Container API") | Container API tests for `SectionRenderer` (each section type renders its landmark and one heading), `JsonLd` escaping (2.1), `Picture` branches (local/remote/public) | med | M | BP |
| 6.4 | `audit` samples 8 routes ranked by `rankedRoutes`; DP builds 33 pages (17 projects, 7 posts, ...) and IT 24+ | `audit-build.mjs:25-33` | Audit one page per layout/template instead of the first N; add LCP, CLS, TBT assertions, not only category scores (mobile score ≥95 is noisy) | low-med | S | BP |
| 6.5 | Lighthouse runs on a pinned major (`lighthouse@12`, latest 13.5.0) via `npx`, and nothing runs `audit` or `responsive` in CI (BP TASK_TODO "Run npm run responsive in CI") | `audit-build.mjs:84`, ci.yml | Label-triggered job with Chrome, `lighthouse@13` | low | S-M | BP |
| 6.6 | Contrast gate is red in both clones: IT "161 of 177 pass, 8 contrast fail + drift" (MIGRACION_ASTRO.md "Cómo quedó"); DP contrast pairs listed as pending (DP feedback #8). The CI "Test" job therefore cannot be green on either clone | docs | Decide (copy exact vs raise contrast), then encode as allow-listed exceptions with expiry in `tests/contrast.test.ts`, so the gate stays meaningful | high (process) | S | IT, DP; BP supports clone-declared pairs (DP #8) |
| 6.7 | Nothing tests `sync-hq.mjs`, `hq.ts` shape, or ProjectDetail/Changelog routes beyond the generic build-output | `grep hq tests/` empty (DP) | Schema test over `src/content/hq/**` once 5.2 lands; test that every project slug builds a page | med | S | DP |
| 6.8 | No test asserts noindex pages are absent from the sitemap, or that titles do not repeat the brand (2.7, 2.8); no test for JSON-LD parseability | tests/build-output.test.ts | Add three assertions | low-med | S | BP |
| 6.9 | The `Node` floor: `package.json` `engines.node >=22.9.0` (line 8) is below Astro 7.3.8's `>=22.12.0` and vitest 5's `^22.12 \|\| ^24 \|\| >=26` | npm view astro@7.3.8 engines | Raise to `>=22.12.0`; CI already uses Node `22` | low | S | BP |

---

## 7. Dependencies and the four pins

BP CLAUDE.md explains three pins plus one override. Rechecked today against the registry:

1. `eslint` 9 (latest 10.12.0). Reason in doc: `eslint-plugin-jsx-a11y` peer caps at eslint 9. Registry check: jsx-a11y 6.10.2 peers `eslint ^3 … ^9`, last modified 2024-10-26, so the cap still stands. New fact: `eslint-plugin-astro` 3.2.1 (latest) requires `eslint >=10` with optional peers on either `eslint-plugin-jsx-a11y` or `eslint-plugin-jsx-a11y-x`; `eslint-plugin-jsx-a11y-x` 0.2.0 (es-tooling org, updated 2026-05-10, 4 releases) peers `eslint ^9 \|\| ^10`. So the pin can lift by swapping the a11y plugin; I did not verify that astro's `jsx-a11y-recommended` preset resolves to the `-x` fork, so test it. Verdict: pin still valid today, with a concrete exit path. Effort M. It is the same task as pin 4.
2. `typescript` ~5.9 (latest 7.0.2). Reason: "astro check refuses to start on TS 7". Registry: `@astrojs/check@0.9.10` peers `typescript ^5 \|\| ^6`, and typescript-eslint 8.71.2 peers `>=4.8.4 <6.1.0`, so TS 7 is genuinely out. I did not execute `astro check` on TS 7 (no installs). The pin, however, is tighter than the ceiling: TS 6.0.3 satisfies both. The "Latest 7" column in the doc table should read "latest compatible 6.0.x". Verdict: the TS 7 block is valid; moving to `~6.0.3` is allowed, effort S (run `npm run check`, `lint`). Also `tsconfig.json` extends `astro/tsconfigs/strict` and sets `baseUrl` (deprecated in TS 6; verify). 
3. `@astrojs/sitemap` 3.7.3 exact (latest 3.7.4, released 2026-08-31). Reason: 3.7.4 serializes the root as `https://site/`, clashing with the bare-origin canonical under `trailingSlash: 'never'` (astro#17851). Changelog for 3.7.4 confirms the change (homepage output when `trailingSlash` is `never` or `build.format` is `file`). The conflict is of the blueprint's own making: `src/lib/url.mjs:13-19` strips the slash from the root, while the same codebase already writes `${origin}/#organization` (`seo.ts:42`) and BP's own SEO.md concedes RFC 3986 treats `https://site` and `https://site/` as one resource; browsers and `new URL()` always send `/`. Verdict: the pin is not needed. Make the root canonical `https://site/` (one change in `absoluteUrl`, update `build-output` tests), drop the exact pin, and take future sitemap patches (3.7.4 also pulls `sitemap ^9`). Effort S-M. This is a design decision the pin note itself lists as the second exit ("this repo deciding the bare-origin canonical was wrong").
4. `overrides: astro-eslint-parser: $astro-eslint-parser` (braces GHSA-vfj7-8cjw-p6xm). Registry: `eslint-plugin-astro@1.7.0` still declares `astro-eslint-parser ^1.3.0`; parser 3.2.0 (dist-tag latest) has no `braces`/`micromatch` chain (uses `tinyglobby`). The override forces a major the plugin was not built for; it works (lint passes per CLAUDE.md) but is fragile, and the three repos already drift (BP lock 3.0.0, IT/DP 3.2.0). Verdict: valid until `eslint-plugin-astro@3` (needs ESLint 10), so it is coupled to pin 1. Plan them as one PR.

Other dependency actions (not pins):
- Bump astro to 7.3.8 (needs vite ^8.3.1), zod 4.6.7, react 19.3, marked 18.1, `@astrojs/react` to 6.0.6 in range; `@astrojs/react` 7.0.1 and vitest 5.0.4 are majors: one PR each with the full `pre-deploy` gate, as BP's TASK_TODO already prescribes ("Dependency and version review").
- Raise `engines.node` (6.9).
- DP: `convex` 1.34 to 1.46 (minor); IT: remove `legacy/` and `react-doctor` if React is dropped (1.9).
- Lockfile drift between repos (astro-eslint-parser 3.0.0 vs 3.2.0) suggests running one `npm update` in BP and re-carrying.

---

## 8. Checked and fine (no action)

- `prefetch`, `trailingSlash` with `cleanUrls`, immutable caching on `/_astro/*` and security headers in `vercel.json`.
- Canonical, sitemap and hreflang agreement is tested per URL (the strongest part of the blueprint).
- Fonts API is used (self-hosted, fallbacks with size-adjust, `check-font-egress` in CI); only the italic and preload scope need work.
- No stale Astro 6 experimental flags; Rust compiler strictness did not break the three builds (dist exists).
- Pagination, tags, `getStaticPaths` are not used where not needed.
- `llms.txt` is static in the clones (DP, IT `public/llms.txt`). Generating it from collections is possible but no major search engine documents using it; leave as is.

---

## 9. Ranked top 15

Ranking = impact times breadth (how many repos) divided by effort, with correctness and silent-failure risks lifted.

| Rank | Item | Repo(s) | Impact | Effort | Evidence |
|---|---|---|---|---|---|
| 1 | Stop preloading and shipping italic font files: `styles: ['normal']` and a `preload` array | BP, IT, DP (DP also trims Plex) | high | S | BP `fonts.mjs:12-22`, `BaseHead.astro:65`; dist preloads 2 Inter files (48 KB + 51.6 KB italic) in BP, 6 files / 148 KB in DP; Astro defaults `styles` to normal+italic |
| 2 | Fail the build when `SITE_URL` is missing or `example.com` in CI/Vercel; one shared env resolver for config and tests; `env.schema` for `PUBLIC_*` | BP (clones inherit) | high | S | `astro.config.mjs:18`; IT feedback #15, DP feedback #13; WQ-003 open |
| 3 | DP: render HQ covers with `<Image>` (lazy, alt, dimensions, `priority` on detail) and stop depending on placehold.co | DP | high | M | `ProjectCard.astro:10-21`, `ProjectDetail.astro:36-43`, `hq/projects.json` placehold.co URLs; 17 cards load 17 third-party images, no lazy |
| 4 | DP: promote the HQ snapshot to Zod-validated collections (glob over committed JSON now, loader with snapshot fallback later); add `syncedAt` and a staleness gate | DP | high | M | `hq.ts:74-88` casts, no schema; `sync-hq.mjs:64-87` rm-then-write, silent stale fallback |
| 5 | JSON-LD hardening: escape `<` in `JsonLd.astro`, de-duplicate `sameAs`, add tests | BP (all) | med | S | `JsonLd.astro:10`, `seo.ts:52`, DP dist emits duplicate sameAs |
| 6 | Structured data per page type: `Person` (+ `publisher` link) for DP, `BlogPosting`/Article with `author` for posts, `SoftwareApplication` instead of offer-less `Product` for IT products | BP (entity, author), DP, IT | med | M | `site.ts:91` enum; `DetailPage.astro:20-26`; `WorkDetail.astro:55`; Google product-snippet "requires either review or aggregateRating or offers" |
| 7 | IT: replace runtime CDN tech icons with build-time `astro-icon` sets | IT | med-high | M | `TechStack.astro:10-25` simpleicons + jsdelivr raw `<img>`, 2 per tech |
| 8 | Retire pins: root canonical with trailing slash then drop sitemap pin; TypeScript to 6.0.x; plan ESLint 10 with `jsx-a11y-x` and `eslint-plugin-astro@3` (also removes the override) | BP, then clones | med | S-M (sitemap S-M, TS S, ESLint M) | `url.mjs:13-19`; sitemap 3.7.4 changelog; `@astrojs/check` peer `^5 \|\| ^6`; plugin-astro 3.2.1 peers |
| 9 | Dependency sweep: astro 7.3.8, zod 4.6.7 (import `z` from `astro/zod`), react 19.3, engines node `>=22.12`, convex 1.46, then majors one by one (@astrojs/react 7, vitest 5) | all | med | S (sweep), M (majors) | section 0 table; `package.json:8`; content-collections guide |
| 10 | Add axe-core over all built routes, a scheduled external-link check, Container API tests, and widen `audit` beyond 8 routes | BP gate, clones inherit | med-high | M | tests/scripts grep finds no axe/Container/linkinator; `audit-build.mjs:25` |
| 11 | DP ClientRouter a11y: focus to `#main` after swap, `aria-current` in persisted nav, fix `role="tab"` on page links | DP | med | S-M | `BaseLayout.astro:57`, `Nav.astro:18-22`, `EditorWindow.astro:34-52`; router does not manage focus |
| 12 | Unblock the red gates: decide the contrast exceptions (IT 8 pairs, DP pairs) and encode them as dated allow-list entries | IT, DP | high (process) | S | MIGRACION_ASTRO.md "Pruebas: 161 de 177"; DP feedback #8 |
| 13 | Sitemap hygiene: `lastmod` from real dates (HQ `updatedAt`/`publishedAt`, post `updated`), exclude `noindex` pages, assert both | BP, DP | low-med | S-M | `astro.config.mjs:36`, `hq.ts:37,60`; Google build-sitemap lastmod note |
| 14 | Head polish: home title without the brand template, `x-default` from `defaultLocale`, `og:image:alt`, `article:*` times, per-item OG in DP, RSS `atom:link` self | BP, DP | low-med | S | DP dist `<title>`; `BaseHead.astro:60,95`; `rss.xml.ts` |
| 15 | Images: add `sizes` to Bento/Logos, evaluate `layout="constrained"` and AVIF via `<Picture formats>`; guarded `localStorage` + `color-scheme` in the theme script | BP, IT | low-med | S-M | `Bento.astro:68`, `Logos.astro:24`, `Picture.astro:20-21`; `BaseLayout.astro:63` |

Not in the top 15 but queued: `security.csp` (blocked by ClientRouter in DP, 1.11), narrowing `image.remotePatterns` (1.6), dropping React from clones that do not use it (1.9), blueprint extension points for custom sections and detail collections (5.4), the Arrow glyph fix (3.4), `build.inlineStylesheets: 'always'` trial (1.4), and cross-document view transitions for IT (4.5).
