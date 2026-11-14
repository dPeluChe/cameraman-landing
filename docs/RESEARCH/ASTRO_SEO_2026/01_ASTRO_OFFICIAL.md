# Astro official recommendations for static marketing/portfolio sites (as of 2026-10-13)

Method: fetched docs.astro.build pages, astro.build blog posts, the upstream CHANGELOGs on GitHub and the npm registry (version and date facts). Raw fetches are in `research/raw/` next to this file. Where a claim could not be confirmed it says UNKNOWN. No claim below comes from memory without a URL.

## 0. Version baseline (verified)

| Item | Fact | Source |
|---|---|---|
| Latest `astro` on npm | 7.3.8, published 2026-10-08 | `npm view astro` (registry) |
| Astro 5.0.0 | 2024-12-03 | npm registry `time` field for `astro` |
| Astro 6.0.0 | 2026-03-10 | npm registry `time` field |
| Astro 7.0.0 | 2026-06-22 (blog also dated Jun 22, 2026; one third-party post says Jul 7, that is wrong) | https://astro.build/blog/astro-7/ and npm registry |
| 7.1.0 / 7.2.0 / 7.3.0 | 2026-07-16 / 2026-08-06 / 2026-09-03 | npm registry; https://astro.build/blog/astro-710/ , /astro-720/ , /astro-730/ |
| Node requirement | `>=22.12.0` (dropped Node 18 and 20 in v6) | `npm view astro engines.node`; https://docs.astro.build/en/guides/upgrade-to/v6/ |
| Bundler | Vite 7 in v6, Vite 8 (Rolldown) in v7 | https://docs.astro.build/en/guides/upgrade-to/v7/ |
| `@astrojs/sitemap` latest | 3.7.4 (modified 2026-08-31). Your pin 3.7.3 is one patch behind | `npm view @astrojs/sitemap`; https://raw.githubusercontent.com/withastro/astro/main/packages/integrations/sitemap/CHANGELOG.md |
| Other latest | `@astrojs/vercel` 11.0.14, `@astrojs/node` 11.1.7, `@astrojs/check` 0.9.10, `@astrojs/rss` 4.0.19, `astro-icon` 1.2.0, `@tailwindcss/vite` 4.3.3 | npm registry |

Note on 7.x changelog scope: the upstream `packages/astro/CHANGELOG.md` served from `main` only contains 7.x entries. 6.x minor details below come from the v6 upgrade guide, the Astro 6 blog and the config reference "Added in" markers.

## 1. Rendering: static vs on-demand, `prerender`, server islands

**What Astro recommends**
- Default is static: "By default, Astro pages, routes, and API endpoints will be pre-rendered at build time." Opt a route out with `export const prerender = false` after adding an adapter; or set `output: 'server'` and opt individual pages back in with `prerender = true`. https://docs.astro.build/en/guides/on-demand-rendering/
- `output` only accepts `'static' | 'server'`, default `'static'`. `'static'` still allows per-route opt-out of prerendering if an adapter is present. https://docs.astro.build/en/reference/configuration-reference/
- Static deploy to Vercel needs no adapter: "Your Astro project is a static site by default. You don't need any extra configuration." https://docs.astro.build/en/guides/deploy/vercel/
- Server islands (`server:defer`) need an adapter. Page renders instantly with `slot="fallback"` content, island content is fetched later. Props must be serializable (no functions). https://docs.astro.build/en/guides/server-islands/
- For a landing: stay `output: 'static'`; reach for an adapter only for a form handler, a gated page, personalised bits (server island) or webhooks. Docs say "You may also wish to add an adapter even if your site is entirely static" (example: Netlify Image CDN; server islands). https://docs.astro.build/en/guides/on-demand-rendering/

**Stable or experimental**
- On-demand rendering and `prerender`: stable (long-standing).
- Server islands: stable (documented as normal guide, no experimental flag). Introduced as part of 5.0 per upgrade-era docs; exact introduction version UNKNOWN from the pages fetched.
- Route caching (`cache`, `routeRules`, `Astro.cache.set`): stable in 7.0 (was experimental in 6). CDN cache providers (`cacheVercel()`, `cacheNetlify()`, `cacheCloudflare()`): still experimental in 7.x. https://astro.build/blog/astro-7/
- Live content collections: stable since 6.0. https://docs.astro.build/en/guides/upgrade-to/v6/
- Advanced Routing (`src/fetch.ts`, Hono compatible): stable and on by default since 7.0. https://astro.build/blog/astro-7/

**Gotchas**
- `src/fetch.ts` is now a reserved filename in 7.x; rename or set `fetchFile` (string or `null`). https://docs.astro.build/en/guides/upgrade-to/v7/
- `security.checkOrigin` (default `true`, since 4.9) only protects on-demand pages: "These features only exist for pages rendered on demand (SSR) using server mode or pages that opt out of prerendering". Irrelevant for pure static output. https://docs.astro.build/en/reference/configuration-reference/
- Server island GET URLs are capped at 2048 bytes; larger props flip to POST which is not cached. Inside an island `Astro.url` is `/_server-islands/Name`, use the `Referer` header for the page URL. https://docs.astro.build/en/guides/server-islands/
- `trailingSlash` only governs dev server and on-demand pages. "Trailing slashes on prerendered pages are handled by the hosting platform." https://docs.astro.build/en/reference/configuration-reference/
- Redirects in static mode with no adapter become `<meta http-equiv="refresh">` HTML, with no status codes. https://docs.astro.build/en/reference/configuration-reference/
- Session support can be disabled with `session: false` (since 7.2.0) to shrink SSR bundles; matters for your server-mode clone. https://docs.astro.build/en/reference/configuration-reference/ and 7.2.0 notes at https://astro.build/blog/astro-720/

## 2. Performance

### 2.1 Images
**Recommends**
- Keep local images in `src/` so they are optimized; `public/` is copied as-is, never processed. Use `<Image />` (infers width/height, `loading="lazy"`, `decoding="async"`) and `<Picture />` (`formats={['avif','webp']}`). `alt` is mandatory. https://docs.astro.build/en/guides/images/
- Responsive images: `layout="constrained" | "full-width" | "fixed"` on the component, or globally via `image.layout`. Stable since 5.10.0. `priority` (sets `loading="eager"`, `decoding="sync"`, `fetchpriority="high"`) for above-the-fold images, since 5.10.0. https://docs.astro.build/en/reference/modules/astro-assets/ and config reference (`image.layout`, `image.responsiveStyles`, `image.breakpoints`, all "Added in astro@5.10.0").
- With Tailwind 4: leave `image.responsiveStyles` at default `false` if you want Tailwind rules to win, because Astro's responsive styles are unlayered and beat Tailwind's layered rules. https://docs.astro.build/en/guides/images/
- Remote images are only optimized for hosts in `image.domains` / `image.remotePatterns`. `inferSize` only fetches dimensions for authorized domains (since 5.17.3). https://docs.astro.build/en/reference/modules/astro-assets/
- Image service: default is Sharp (`astro/assets/services/sharp`). Per-format encoder defaults (`image.service.config.jpeg|webp|avif|png`) since 6.1.0; `kernel` since 5.17.0; `limitInputPixels`. https://docs.astro.build/en/reference/configuration-reference/
- SVG components: `import Logo from './logo.svg'` inlines the SVG (since 5.7.0); `SvgComponent` type since 5.14.0. https://docs.astro.build/en/guides/images/
- OG images: docs show building them from a static endpoint with Satori, using `fontData` from `astro:assets` to get font files. https://docs.astro.build/en/guides/fonts/ (section on `fontData`). `getImage()` is server only and throws on the client (6.0 change). https://docs.astro.build/en/reference/modules/astro-assets/

**Stable/experimental**: all of the above stable. SVG optimization (`experimental.svgOptimizer: svgoOptimizer()`, since 5.16.0) is still experimental. https://docs.astro.build/en/reference/experimental-flags/svg-optimization/ `image.dangerouslyProcessSVG` added in 6.3.0, default `false`.

**Gotchas (from the v6 guide)**
- Default image service now crops by default and never upscales; SVG rasterization changed. https://docs.astro.build/en/guides/upgrade-to/v6/
- Responsive image styles are now emitted as a hashed class plus `data-astro-fit` / `data-astro-pos` instead of inline `style`, so they are CSP-compatible. Anything targeting `style="--fit"` breaks. https://docs.astro.build/en/guides/upgrade-to/v6/
- Responsive images multiply generated files and build time. https://docs.astro.build/en/guides/images/
- Astro has no video optimization; docs recommend a hosted video service. https://docs.astro.build/en/guides/images/

### 2.2 Fonts API
**Recommends**: declare fonts in `fonts: [...]` in the config with `provider`, `name`, `cssVariable`; render `<Font cssVariable="--font-x" preload />` in the head; apply via CSS variable. Astro downloads and self-hosts the files, generates optimized fallbacks, adds preload. https://docs.astro.build/en/guides/fonts/
- Built-in providers: Adobe, Bunny, Fontshare, Fontsource, Google, Google Icons, NPM, plus `fontProviders.local()` for your own files (variants with `src`, `weight`, `style`). https://docs.astro.build/en/guides/fonts/
- Defaults to know: `weights: [400]`, `styles: ["normal","italic"]`, `subsets: ["latin"]`, `formats: ["woff2"]`, `fallbacks: ["sans-serif"]`, `optimizedFallbacks: true`. Per-font `display`, `unicodeRange`, `featureSettings`, `variationSettings` exist. https://docs.astro.build/en/reference/configuration-reference/ (all "Added in astro@6.0.0")
- Variable fonts: give a weight range string (`"100 900"` locally, `weights: ["300 700"]` for remote providers). https://docs.astro.build/en/guides/fonts/
- Preload "sparingly": only above-the-fold fonts; pass an array to `preload` to pick specific files. https://docs.astro.build/en/guides/fonts/
- Tailwind 4: map with `@theme inline { --font-sans: var(--font-roboto); }`. https://docs.astro.build/en/guides/fonts/

**Stable/experimental**: stable since 6.0.0 (was `experimental.fonts` in 5.x). https://docs.astro.build/en/guides/upgrade-to/v6/ . `FontData.subset` field added in 7.0.0. https://github.com/withastro/astro/blob/main/packages/astro/CHANGELOG.md

**Gotchas**: only weight 400 is fetched unless you list more (silent missing weights). Fallback metrics are generated from the LAST generic fallback in your list, so end the list with the right generic family. https://docs.astro.build/en/guides/fonts/ The `unicodeRange` option can cut downloads for multi-script sites. https://docs.astro.build/en/reference/configuration-reference/

### 2.3 CSS
- `build.inlineStylesheets: 'always' | 'auto' | 'never'`, default `'auto'` (inline only if smaller than Vite `assetsInlineLimit`, 4 kB default). For tiny landings `'always'` removes the render-blocking CSS request. Since 2.6.0. https://docs.astro.build/en/reference/configuration-reference/
- 6.0 changed `<script>` and `<style>` to render in source order (was reversed in 5.x); check cascade overrides. https://docs.astro.build/en/guides/upgrade-to/v6/
- 7.0 Rust compiler uses Lightning CSS for scoping, so colors may be re-serialized (`rebeccapurple` becomes `#639`) and `url()` quotes may change. Cosmetic. https://docs.astro.build/en/guides/upgrade-to/v7/
- Tailwind 4: official path is `npx astro add tailwind`, which installs `@tailwindcss/vite` (Astro >= 5.2.0). Tailwind 3 integration is legacy. https://docs.astro.build/en/guides/styling/

### 2.4 Scripts
- `<script>` in `.astro` is processed: bundled, TypeScript, imports, becomes `type="module"`, deduplicated (runs once per page even if the component repeats). `is:inline` opts out (no bundling); use it for scripts in `public/` or on a CDN. https://docs.astro.build/en/guides/client-side-scripts/
- Gotcha: scripts that must run before first paint (theme) need `is:inline` in `<head>`; bundled module scripts are deferred.

### 2.5 Prefetch
- Opt-in: `prefetch: true` adds the script; links need `data-astro-prefetch` unless `prefetch.prefetchAll: true`. Strategies: `hover` (default), `tap`, `viewport`, `load`. Data saver or slow connection falls back to `tap`. https://docs.astro.build/en/guides/prefetch/
- With `<ClientRouter />`: prefetch is enabled automatically with `{ prefetchAll: true }`; override with `prefetch: false` or `prefetchAll: false`. https://docs.astro.build/en/guides/prefetch/
- `prefetch()` from `astro:prefetch` for programmatic use. https://docs.astro.build/en/guides/prefetch/
- Experimental: `experimental.clientPrerender` (Speculation Rules, since 4.2.0) still experimental; `prefetch(url, { eagerness })` needs it (since 5.6.0). https://docs.astro.build/en/reference/experimental-flags/client-prerender/
- Gotcha: Firefox prefetch errors (`NS_BINDING_ABORTED`) without explicit `Cache-Control`/`Expires`/`ETag` headers. https://docs.astro.build/en/guides/prefetch/ ; so set cache headers on the host.
- The v6 guide removed the `prefetch()` `with` option. https://docs.astro.build/en/guides/upgrade-to/v6/

### 2.6 Compression, `build.format`, `trailingSlash`
- Compression (gzip/brotli): UNKNOWN as an Astro setting; no config key found in the configuration reference. It is a host/CDN concern (Vercel does it by default, but that was not verified on a docs page here). `compressHTML` is about whitespace, not transport.
- `compressHTML` default changed in 7.0 from `true` to `'jsx'` (JSX whitespace rules: `<span>a</span>\n<em>b</em>` renders `ab` with no space). Use `{" "}` or set `compressHTML: true` to restore. https://docs.astro.build/en/guides/upgrade-to/v7/
- `build.format`: `'directory'` (default, `/about/index.html`), `'file'` (`/about.html`), `'preserve'`. Docs advise pairing: directory with `trailingSlash: 'always'`, file with `'never'`, so `Astro.url` matches between dev and build. https://docs.astro.build/en/reference/configuration-reference/
- Gotcha tied to your pinned sitemap: `@astrojs/sitemap` 3.7.4 fixes the homepage being emitted without the trailing slash when `trailingSlash: 'never'` or `build.format: 'file'`. https://raw.githubusercontent.com/withastro/astro/main/packages/integrations/sitemap/CHANGELOG.md
- Gotcha: since 6.0, endpoints with a file extension (`sitemap.xml.ts`, `robots.txt.ts`) cannot be requested with a trailing slash regardless of config. https://docs.astro.build/en/guides/upgrade-to/v6/

## 3. View transitions and `<ClientRouter />`

**What Astro recommends now**
- The docs frame two options. Native cross-document view transitions in an MPA "don't alter the core functionality of a multi-page application, nor do they affect any existing scripts or add additional JavaScript". `<ClientRouter />` adds client-side routing, persistence and fallbacks, at the cost of re-initializing scripts. Astro states: "as browser APIs and web standards evolve, using Astro's `<ClientRouter />` for this additional functionality will increasingly become unnecessary", and tells you to decide per feature. https://docs.astro.build/en/guides/view-transitions/
- The CSP docs go further: `<ClientRouter />` is not supported with `security.csp`, and "you can consider migrating to the browser native View Transition API instead". https://docs.astro.build/en/reference/configuration-reference/ (`security.csp` limitations)
- The guide has no code sample for the CSS `@view-transition { navigation: auto }` rule (grep of the fetched page found none). So the exact snippet to use is UNKNOWN from Astro docs; it comes from the browser spec (MDN), not verified here.
- Name change: `<ViewTransitions />` became `<ClientRouter />` in 5.0 and the old component was removed in 6.0. https://docs.astro.build/en/guides/upgrade-to/v6/

**Stable/experimental**: stable. `transition:persist` since 2.10.0, `transition:persist-props` since 4.5.0, `data-astro-rerun` since 4.5.0, form transitions since 4.0.0, route announcer since 3.2.0, `astro:before-swap` since 3.6.0. https://docs.astro.build/en/guides/view-transitions/ . `handleForms` prop on `ClientRouter` removed in 6.0 (no-op). https://docs.astro.build/en/guides/upgrade-to/v6/

**Lifecycle (exact order)**: `astro:before-preparation` -> `astro:after-preparation` -> `astro:before-swap` -> `astro:after-swap` -> `astro:page-load`. `before-*` can modify, `after-*` notify. `before-swap` fires inside the transition while the user still sees the old snapshot; `event.newDocument` is the incoming doc (docs example: carry the light/dark preference over). `after-swap` fires right after the swap, before paint. `astro:page-load` fires at the end of navigation, after new scripts run. https://docs.astro.build/en/guides/view-transitions/

**Script re-execution rules**
- Bundled module scripts (the default) run once, then are ignored on later navigations even if present on the next page.
- Inline (`is:inline`) scripts can re-execute if the page is revisited; `data-astro-rerun` forces re-run on every transition (implies `is:inline`).
- Wrap init code in `astro:page-load` listeners (docs example: hamburger menu). Scripts run in order. https://docs.astro.build/en/guides/view-transitions/

**Theme flash**: docs example puts an `is:inline` script that applies the theme immediately and again on `astro:after-swap` ("avoids a flash of light mode theme after page navigation by checking and, if necessary, setting the dark mode theme before the new page is rendered"). Alternative documented: copy preference onto `event.newDocument` in `astro:before-swap`. https://docs.astro.build/en/guides/view-transitions/

**Accessibility**: built-in route announcer (`aria-live="assertive"`; text from `<title>`, else first `<h1>`, else pathname; "always include a `<title>`"). Built-in `prefers-reduced-motion` media query disables all view transition animations including fallbacks. https://docs.astro.build/en/guides/view-transitions/

**Fallback**: `fallback="animate"` (default, recommended), `"swap"`, `"none"` (full page navigation in non-supporting browsers). "The initial browser animation is not simulated by Astro." https://docs.astro.build/en/guides/view-transitions/

**SEO effects**: the docs do not discuss SEO impact; each page is still a real URL fetched and swapped. UNKNOWN beyond that.

**Gotchas**
- Both pages must use `<ClientRouter />` for client routing; otherwise full reload. Opt out per link/form with `data-astro-reload`. https://docs.astro.build/en/guides/view-transitions/
- `transition:persist` cannot avoid CSS animation restarts or iframe reloads. https://docs.astro.build/en/guides/view-transitions/
- `navigate()` does no URL sanitization (open redirect / `javascript:`); validate input. https://docs.astro.build/en/guides/view-transitions/
- Internals removed from `astro:transitions` in 7.0 (`TRANSITION_*` constants, `isTransitionBeforePreparationEvent`, `isTransitionBeforeSwapEvent`, `createAnimationScope`). Use the literal event names. https://docs.astro.build/en/guides/upgrade-to/v7/
- Using `<ClientRouter />` silently turns on `prefetchAll`.
- Not compatible with Astro CSP (see above), so a decision between the two features is forced if you want CSP.

## 4. SEO-related built-ins

- `site`: "Your final, deployed URL. Astro uses this full URL to generate your sitemap and canonical URLs... strongly recommended." Docs example for canonical is manual: `new URL(Astro.url.pathname, Astro.site)` in a `<link rel="canonical">`. Astro does not inject a canonical for you. https://docs.astro.build/en/reference/configuration-reference/ and https://docs.astro.build/en/reference/api-reference/
- `Astro.site` inside `getStaticPaths()` is deprecated in 6.0: use `import.meta.env.SITE`. Only `Astro.site` and `Astro.generator` existed there. https://docs.astro.build/en/guides/upgrade-to/v6/
- i18n (stable since 3.5.0): `i18n.locales`, `defaultLocale`, `fallback`, `routing.prefixDefaultLocale` (default `false`), `routing.redirectToDefaultLocale` (since 4.2.0; default flipped to `false` in 6.0 and only valid with `prefixDefaultLocale: true`), `routing.fallbackType: 'redirect' | 'rewrite'` (since 4.15.0), `domains` (4.3.0), `routing: 'manual'`. Helpers from `astro:i18n`: `getRelativeLocaleUrl`, `getAbsoluteLocaleUrl`, `getAbsoluteLocaleUrlList`, plus manual-routing helpers `redirectToDefaultLocale`, `notFound`, `redirectToFallback`, and `middleware()`. `Astro.preferredLocale` / `preferredLocaleList` read `Accept-Language`. https://docs.astro.build/en/guides/internationalization/ and config reference. Astro does not ship an hreflang helper in the pages fetched (grep for `hreflang` in the i18n guide: no hits), so hreflang tags are manual or come from the sitemap integration.
- Locale `path` aliasing: `{ path: "english", codes: ["en","en-US"] }`, and helpers take the path value. https://docs.astro.build/en/guides/internationalization/
- `@astrojs/sitemap` (3.7.4): options `filter(page)`, `customPages`, `customSitemaps` (3.5.0), `entryLimit` (45000), `changefreq`/`lastmod`/`priority` (global; Google ignores changefreq and priority), `serialize(item)` (per-page, can set `lastmod`, `links`), `i18n: { defaultLocale, locales }` (emits xhtml hreflang alternates), `xslURL`, `filenameBase`, `namespaces`. Requires `site`; cannot produce entries for SSR dynamic routes. Outputs `sitemap-index.xml` + `sitemap-0.xml`. Add `<link rel="sitemap">` and `Sitemap:` in robots.txt; docs show a dynamic `src/pages/robots.txt.ts` using `site`. https://docs.astro.build/en/guides/integrations-guide/sitemap/
  - 3.7.2 fixes i18n fallback pages missing with `fallbackType: 'rewrite'`; 3.7.3 stamps per-child `lastmod` in the index; 3.7.4 fixes homepage URL lacking `/` under `trailingSlash: 'never'` or `format: 'file'`. https://raw.githubusercontent.com/withastro/astro/main/packages/integrations/sitemap/CHANGELOG.md
  - Reason for your pin at 3.7.3: UNKNOWN; the changelog shows no reason to stay on 3.7.3 rather than 3.7.4.
- RSS: `@astrojs/rss` `rss({ title, description, site: context.site, items, customData })` in `src/pages/rss.xml.js`; needs `site`. https://docs.astro.build/en/recipes/rss/ (fetched via guides path; content confirmed).
- `astro:env` (stable since 5.0.0): `env.schema` with `envField.string|number|enum|boolean({ context: 'client'|'server', access: 'public'|'secret', optional, default })`; import from `astro:env/client` or `astro:env/server`. `env.validateSecrets` (default `false`) also validates secrets at dev start/build, useful in CI. https://docs.astro.build/en/guides/environment-variables/ and config reference. To enforce a `SITE_URL`, declare it as `context: 'server', access: 'public'` and set `validateSecrets: true` if secret. Gotcha: `.env` files are NOT loaded inside `astro.config.*`, so `site: process.env.SITE_URL` needs Vite `loadEnv` or real env vars; `astro:env` cannot feed `site` itself. https://docs.astro.build/en/guides/environment-variables/
- `import.meta.env` is always inlined and never coerced since 6.0 (`"true"` stays a string). https://docs.astro.build/en/guides/upgrade-to/v6/
- `security.checkOrigin`: see section 1 (SSR only). `security.allowedDomains` (since 5.14.2) validates `X-Forwarded-Host` for SSR behind proxies; empty means header untrusted. Relevant to your server-mode clone. https://docs.astro.build/en/reference/configuration-reference/
- CSP: stable in 6.0.0 (was `experimental.csp`). `security.csp: true` or object: `algorithm` (SHA-256 default), `directives`, `styleDirective` / `scriptDirective` with `hashes` and `resources`, `strictDynamic`. Emitted as a `<meta http-equiv="content-security-policy">` per page. Limits: no external scripts/styles out of the box, no `<ClientRouter />`, no Shiki (inline styles), not testable in dev (use build + preview). 7.1.0 added `kind: 'element'|'attribute'|'default'` for `-elem` / `-attr` directives. Meta tags cannot set `frame-ancestors`, `report-uri` or `sandbox`: this is general CSP spec knowledge, not stated in the fetched page, so treat as UNVERIFIED here. https://docs.astro.build/en/reference/configuration-reference/ and https://astro.build/blog/astro-710/
- OG images: `<meta property="og:image">` is manual (`new URL('/images/preview.png', Astro.url)`); generate dynamically via an endpoint with Satori and `fontData`, or import the image through `astro:assets` and use `getImage()` for a resized URL. https://docs.astro.build/en/reference/api-reference/ ; https://docs.astro.build/en/guides/fonts/

## 5. Content layer and collections

**Recommends**
- "We suggest using build-time content collections whenever possible, and using live collections when your content needs updating in real time." Build-time data is cached between builds and "suitable for tens of thousands of content entries." https://docs.astro.build/en/guides/content-collections/
- Config file `src/content.config.ts`; loaders `glob()` (since 5.0.0) and `file()`; schema with Zod imported from `astro/zod` (NOT `astro:content` or `astro:schema`, both deprecated in 6.0). Zod is v4 since 6.0 (`z.email()`, `{ error: ... }`, `.default()` must match output type, `.prefault()` for old behavior). https://docs.astro.build/en/guides/upgrade-to/v6/
- Schema images: `image()` helper in the schema validates local images; `image().refine()` is unsupported. https://docs.astro.build/en/guides/content-collections/
- `render(entry)` from `astro:content` returns `<Content />` and headings. https://docs.astro.build/en/guides/content-collections/
- Legacy content collections (pre-5.0 `src/content/config.ts` without loaders) were removed in 6.0. https://docs.astro.build/en/guides/upgrade-to/v6/
- Loader function signature `schema` changed in 6.0 (types now inferred, not generated). https://docs.astro.build/en/guides/upgrade-to/v6/
- `glob()` options: `pattern`, `base`, `generateId`, `retainBody` (5.17.0, set `false` to shrink the data store), `deferRender` (7.1.0, lowers memory on huge Markdown collections). https://docs.astro.build/en/reference/content-loader-reference/
- Entries gained an optional `digest` in 7.2.0, intended as a `cacheKey` for experimental incremental builds. https://astro.build/blog/astro-720/

**Remote source (your Convex HQ), per the docs**
- No prebuilt remote loaders ship with Astro: "For remote content, no prebuilt loaders are provided. You will have to build an object loader or use a community-published loader." https://docs.astro.build/en/reference/content-loader-reference/
- Two shapes: (a) simple inline async function returning an array of entries with unique `id` (store is cleared and reloaded each build, no helpers); (b) object loader `{ name, load({ store, parseData, logger, meta, generateDigest }), schema }` that fetches, `store.clear()`, validates each item with `parseData({ id, data })`, then `store.set({ id, data })`. https://docs.astro.build/en/reference/content-loader-reference/
- Schema precedence: a schema in `defineCollection` overrides the loader's schema; use `createSchema()` for dynamic schemas. https://docs.astro.build/en/reference/content-loader-reference/
- Live alternative: `src/live.config.ts`, `defineLiveCollection`, live loader with `loadCollection` / `loadEntry`, `getLiveEntry` / `getLiveCollection`, `cacheHint` forwarded to `Astro.cache.set()`. Needs an adapter. No built-in live loaders. Stable since 6.0. For a static landing, the build-time loader is the docs' default advice. https://docs.astro.build/en/guides/content-collections/ and https://docs.astro.build/en/reference/content-loader-reference/
- Implication for HQ: build-time custom loader that calls the HQ read API with a server-side token, validated by Zod, then a deploy hook to rebuild when HQ publishes (docs do not prescribe the webhook; Vercel deploy hooks are a host feature, not verified here). Incremental build flag (7.2, experimental) could later reduce rebuild cost: https://docs.astro.build/en/reference/experimental-flags/incremental-build/
- Gotcha: `getStaticPaths` params cannot be numbers (6.0). https://docs.astro.build/en/guides/upgrade-to/v6/
- Experimental: `experimental.collectionStorage: "chunked"` (7.1.0) splits `.astro/data-store.json` for large sets. https://docs.astro.build/en/reference/experimental-flags/collection-storage/

## 6. Tooling and quality

- `astro check`: type-checks `.astro` files, exits 1 on errors, "intended to be used in CI". Flags: `--watch`, `--root`, `--tsconfig`, `--minimumFailingSeverity`, `--minimumSeverity`, `--noSync`. Requires `@astrojs/check` + `typescript` (latest check 0.9.10; the requirement itself is from general Astro knowledge, UNVERIFIED on the fetched page). https://docs.astro.build/en/reference/cli-reference/
- `astro add <integration>` installs and edits the config (e.g. `astro add tailwind`, `astro add sitemap`). `astro info` prints env info (also behind the dev toolbar "Copy debug info"). `astro sync` regenerates types. `astro preferences` toggles toolbar etc. https://docs.astro.build/en/reference/cli-reference/
- Dev toolbar (`devToolbar.enabled`, default on; `placement` since 5.17.0): apps Astro Menu, Inspect (islands + props + directives), Audit (basic perf and a11y checks: red dot when issues), Settings. Docs say audits are "not a replacement for dedicated tools like Pa11y or Lighthouse". https://docs.astro.build/en/guides/dev-toolbar/
- Testing: Vitest via `getViteConfig()` from `astro/config` (needs Vitest >= 3.2 or 4.1 beta 5 per the v6 guide). Container API for component tests: `experimental_AstroContainer` from `astro/container` (since 4.9.0) is STILL prefixed `experimental_` in the 7.3 docs. https://docs.astro.build/en/guides/testing/ and https://docs.astro.build/en/reference/container-reference/
  - 6.0: Astro components cannot be rendered in Vitest client environments. https://docs.astro.build/en/guides/upgrade-to/v6/
  - 7.0: `getContainerRenderer()` imports from integration package roots are deprecated; use `@astrojs/react/container-renderer` (also preact, solid-js, svelte, vue, mdx). https://docs.astro.build/en/guides/upgrade-to/v7/
  - E2E: Playwright is the documented option; 7.1/7.3 added `--ignore-lock` for `astro dev` / `astro preview` so multiple servers can run in parallel. https://astro.build/blog/astro-730/
- Upgrade tool: `npx @astrojs/upgrade`. https://docs.astro.build/en/guides/upgrade-to/v7/

## 7. New in Astro 6 and 7 that you are probably missing (one-line why)

| Feature | Since | Why it matters for landings | Source |
|---|---|---|---|
| Fonts API stable | 6.0 | Self-hosted, preloaded, metric-matched fallbacks; kills CLS and Google Fonts third-party request | https://astro.build/blog/astro-6/ |
| Built-in CSP (`security.csp`) | 6.0 | Hash-based CSP for static pages without a server; but incompatible with `ClientRouter` | https://docs.astro.build/en/reference/configuration-reference/ |
| Live content collections | 6.0 | Option to pull HQ data per request for pages that must be fresh (needs adapter) | https://astro.build/blog/astro-6/ |
| Zod 4 and `astro/zod` | 6.0 | Schemas must use `z.email()`, `error:` message key; `z` from `astro:content` deprecated | https://docs.astro.build/en/guides/upgrade-to/v6/ |
| `<ViewTransitions />` removed | 6.0 | Only `<ClientRouter />` exists | same |
| Scripts/styles in source order | 6.0 | Can change cascade results vs 5.x | same |
| `import.meta.env` always inlined | 6.0 | No more type coercion; `"true"` is a string | same |
| `i18n.redirectToDefaultLocale` default false | 6.0 | Root `/` no longer redirects unless explicit | same |
| Per-format Sharp encoder defaults | 6.1 | Set one project-wide AVIF/WebP quality | https://docs.astro.build/en/reference/configuration-reference/ |
| Custom logger | 6.2 experimental, stable 7.0 | Structured logs for CI; low relevance to static landings | https://github.com/withastro/astro/blob/main/packages/astro/CHANGELOG.md |
| `image.dangerouslyProcessSVG` | 6.3 | Default blocks SVG raster pipeline (DoS safeguard) | config reference |
| Pluggable Markdown processor (Sätteri) | 6.4 opt-in, default 7.0 | Faster MD/MDX builds; remark/rehype now need `@astrojs/markdown-remark` and `unified()` | https://docs.astro.build/en/guides/upgrade-to/v7/ |
| Vite 8 / Rolldown, Rust compiler, queued rendering | 7.0 | 15-61% faster builds (Astro's benchmarks); stricter HTML (unclosed tags error) | https://astro.build/blog/astro-7/ |
| `compressHTML: 'jsx'` default | 7.0 | Inline whitespace changes (`<span/> <em/>` loses the space) | https://docs.astro.build/en/guides/upgrade-to/v7/ |
| Route caching stable | 7.0 | Only relevant if you run server mode | https://astro.build/blog/astro-7/ |
| Advanced Routing `src/fetch.ts` | 7.0 | Reserved filename; collision risk | upgrade v7 guide |
| `@astrojs/db` removed | 7.0 | Remove if present | upgrade v7 guide |
| `astro dev --background`, agent detection, JSON logs | 7.0 | Useful for agent workflows; agent detection auto-enables background mode | https://astro.build/blog/astro-7/ |
| CSP `kind` (`-elem` / `-attr`) | 7.1 | Allow inline style attributes without loosening external CSS | https://astro.build/blog/astro-710/ |
| `paginate({ format() })`, `glob({ deferRender })`, `--ignore-lock` | 7.1 | URL shaping, memory control, parallel servers | same |
| Incremental static builds (experimental) | 7.2 | Skip unchanged pages using `cacheKey`/`entry.digest`; only matters when page count is large | https://astro.build/blog/astro-720/ |
| `session: false` | 7.2 | Smaller SSR bundle for the server-mode clone | config reference |
| `astro preview --background`, logger to image services | 7.2 / 7.3 | Dev ergonomics | https://astro.build/blog/astro-730/ |

## Questions to check in our repos

Run these greps in each Astro clone (config at `astro.config.*`, source in `src/`).

Rendering and adapters
1. `grep -rn "output:" astro.config.*` : is `output` explicitly `'static'` in static clones; which clone uses `'server'` and does it need to (any `prerender = false`, `Astro.cookies`, forms, API routes)?
2. `grep -rn "prerender" src/` : do server-mode pages opt back in with `export const prerender = true` for marketing pages?
3. `grep -rn "server:defer" src/` : any server islands, and is an adapter present?
4. `grep -n "session" astro.config.*` : in the server clone, `session: false` if sessions are unused (7.2+).
5. `ls src/fetch.*` and `grep -n fetchFile astro.config.*` : no accidental collision with the reserved `src/fetch.ts`.
6. `grep -n "allowedDomains\|checkOrigin" astro.config.*` : server clone behind Vercel/Node proxy sets `security.allowedDomains`.

Images and fonts
7. `grep -rn "<img " src/ --include=*.astro` : raw `<img>` pointing at `src/` assets bypasses optimization.
8. `grep -rn "priority\|layout=" src/ --include=*.astro` and `grep -n "image:" -A6 astro.config.*` : hero image has `priority`; `image.layout` / `responsiveStyles` consistent with Tailwind 4 (responsiveStyles should be off if Tailwind owns styling).
9. `grep -rn "fetchpriority\|loading=\"lazy\"" src/` : conflicts with `priority`.
10. `grep -n "fonts:" -A12 astro.config.*` : each font declares `weights`, `subsets`, `fallbacks`, no leftover `@fontsource`, `fonts.googleapis.com` or manual `@font-face`; `grep -rn "googleapis\|@font-face\|@fontsource" src/ package.json`.
11. `grep -rn "<Font " src/` : exactly one render per font, `preload` only on above-the-fold fonts.
12. `grep -rn "font-sans\|@theme" src/styles` : Tailwind `--font-*` maps to the Astro `cssVariable`.
13. `grep -rn "dangerouslyProcessSVG\|\.svg'" astro.config.* src/` : SVGs used as components instead of raster pipeline.

CSS, scripts, build
14. `grep -n "inlineStylesheets\|compressHTML\|format:\|trailingSlash" astro.config.*` : `build.format` and `trailingSlash` are a matched pair; `compressHTML` handled for 7.x JSX whitespace (search for adjacent inline elements: `grep -rnE "</(span|em|strong|a)>\s*$" src/ -A1` and eyeball).
15. `grep -rn "is:inline" src/` : only for head-blocking scripts (theme) or `public/` scripts; no needless `is:inline` that blocks bundling.
16. `grep -n "prefetch" astro.config.* && grep -rn "data-astro-prefetch" src/` : explicit prefetch policy, especially in the clone with `<ClientRouter />` (implicit `prefetchAll`).
17. `grep -rn "lightningcss\|@tailwindcss/vite" astro.config.* package.json` : Tailwind 4 through the Vite plugin, not the old integration.

View transitions
18. `grep -rn "ClientRouter\|ViewTransitions" src/` : which clones use it; confirm no `ViewTransitions` import (removed in 6.0), no `handleForms` prop.
19. `grep -rn "astro:page-load\|astro:after-swap\|astro:before-swap\|data-astro-rerun" src/` : every JS init (menu, theme, analytics, forms) re-binds on `astro:page-load`; theme script is `is:inline` and re-applies on `astro:after-swap` (or in `before-swap` on `newDocument`).
20. `grep -rn "transition:persist\|transition:name\|transition:animate" src/` : persisted elements are islands or media; no reliance on iframe/CSS animation continuity.
21. `grep -rn "TRANSITION_\|isTransition\|createAnimationScope" src/` : must be empty (removed in 7.0).
22. `grep -rn "prefers-reduced-motion" src/` : custom animations respect it (Astro's own transitions already do).
23. `grep -rn "@view-transition" src/` : any clone using native cross-document transitions instead; consider for clones that do not need persistence.
24. `grep -n "csp" astro.config.*` : if CSP is wanted anywhere, that clone cannot use `<ClientRouter />`.
25. Analytics/third-party scripts: `grep -rn "gtag\|plausible\|posthog\|umami" src/` : are they re-fired on `astro:page-load` in the ClientRouter clone (page views missed otherwise).

SEO
26. `grep -n "site:" astro.config.*` : is `site` set in every clone, and from a validated source (env needs `loadEnv`, `.env` is not read in config)?
27. `grep -rn "Astro.site\|rel=\"canonical\"" src/` : one shared `<head>` component builds canonical from `new URL(Astro.url.pathname, Astro.site)`; no `Astro.site` inside `getStaticPaths` (use `import.meta.env.SITE`).
28. `grep -n "sitemap" astro.config.* package.json` : version pin vs 3.7.4 (homepage trailing slash fix); `filter` excludes draft/noindex/thank-you pages; `serialize` sets `lastmod` from content dates; `i18n` option matches `i18n` config; `grep -rn "rel=\"sitemap\"\|Sitemap:" src public`.
29. `ls src/pages/robots.txt.* public/robots.txt` and `ls src/pages/rss.xml.*` : robots built from `site`; RSS present for blog collections and uses `context.site`.
30. `grep -rn "hreflang" src/` and `grep -n "i18n" -A12 astro.config.*` : manual hreflang in head (Astro ships no helper), `prefixDefaultLocale` / `redirectToDefaultLocale` pair explicit (6.0 default change), `getRelativeLocaleUrl` used instead of hand-built paths: `grep -rn "getRelativeLocaleUrl\|getAbsoluteLocaleUrl" src/`.
31. `grep -n "env:" -A10 astro.config.* && grep -rn "astro:env\|import.meta.env\|process.env" src/` : typed `astro:env` schema for SITE_URL / API tokens; no `process.env` reads in client code; no reliance on `import.meta.env` string coercion.
32. `grep -rn "og:image\|twitter:image" src/` : OG image absolute URL via `new URL(path, Astro.url)`; if dynamic OG exists, check Satori endpoint and `fontData` usage.
33. `grep -rn "<title>" src/layouts` : always present (route announcer and SEO).

Content
34. `ls src/content.config.ts src/live.config.ts src/content/config.ts` : legacy `src/content/config.ts` must not exist (removed in 6.0).
35. `grep -rn "from 'astro:content'" src/ | grep -n " z"` and `grep -rn "astro:schema" src/` : `z` must come from `astro/zod`.
36. `grep -rn "z\.string()\.\(email\|url\|uuid\)\|errorMap\|message:" src/content.config.ts` : Zod 4 syntax (`z.email()`, `error:`), `.default()` vs transform output type.
37. `grep -rn "image()" src/content.config.ts` : cover/OG images go through `image()` rather than string paths.
38. `grep -rn "loader:" src/content.config.ts` : glob/file for local; for HQ: a custom build-time loader with `parseData` + `store.set` (not ad-hoc `fetch` inside pages). Look for `fetch(` inside `src/pages`: `grep -rn "await fetch(" src/pages src/components`.
39. `grep -rn "retainBody\|deferRender" src/content.config.ts` : set when collections are large.
40. `grep -rn "getStaticPaths" -A6 src/pages | grep -n "params.*:.*[0-9]"` : params must be strings (6.0).

Tooling
41. `grep -n "\"check\"\|astro check\|@astrojs/check\|\"typescript\"" package.json` and CI files: `astro check` runs in CI, not just `astro build`.
42. `grep -rn "getViteConfig\|AstroContainer\|vitest" package.json vitest.config.* src/` : Container API imports `experimental_AstroContainer`; renderers imported from `/container-renderer` subpath (7.0).
43. `grep -rn "playwright" package.json` and `grep -rn "ignore-lock" package.json .github` : parallel preview servers for e2e.
44. `grep -n "devToolbar" astro.config.*` : toolbar audit left on in dev; team actually runs the Audit app before shipping.
45. `grep -n "\"astro\":\|\"node\":\|engines" package.json; cat .nvmrc .node-version 2>/dev/null` : Astro 7.x with Node >= 22.12.
46. `grep -rn "experimental" astro.config.*` : removed flags (`csp`, `fonts`, `liveContentCollections`, `preserveScriptOrder`, `staticImportMetaEnv`, `headingIdCompat`, `queuedRendering`, `rustCompiler`, `advancedRouting`, `cache`, `routeRules`, `logger`) must be gone; remaining ones are intentional.
47. `grep -n "markdown" -A6 astro.config.*; grep -n "remark\|rehype" package.json` : on 7.x remark/rehype plugins require `@astrojs/markdown-remark` and `markdown.processor: unified()`.
48. `grep -rn "@astrojs/db\|ASSETS_PREFIX\|Astro.glob" src/ package.json` : removed or deprecated APIs.
49. Host headers: check Vercel config for `Cache-Control` on `/_astro/*` and HTML (needed for Firefox prefetch) and confirm compression is on at the host (Astro itself has no setting; UNKNOWN in docs).
