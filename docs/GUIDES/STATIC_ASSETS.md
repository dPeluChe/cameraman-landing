# Static assets — favicons, manifest, OG image

## The rule

`npm run assets` is a **rebranding step run by hand**, and its output is
**committed**. It is deliberately not part of `npm run build`.

Why: the script rasterizes SVG and renders text through `sharp`, which depends on
the fonts available on the machine. On a CI runner with a different font set the OG
image would come out subtly wrong — or blank. Generating once, locally, and
committing the result means every deploy ships bytes someone actually looked at.

## Inputs

Three files in `src/assets/brand/`:

| File | Used for |
|---|---|
| `icon.svg` or `icon.png` | Square mark → the entire favicon set |
| `logo.svg` or `logo.png` | Wordmark → the OG image, header, footer |
| `logo-dark.svg` | Wordmark for dark backgrounds (optional) |

SVG is preferred and taken first when both exist: it is the only source that can
produce a real `favicon.svg`. With a PNG the script says so and skips that one
file — remove its `<link>` from `BaseHead.astro` or get an SVG.

**The script refuses to run on the blueprint's demo marks.** It compares by
content, so leaving `icon.svg` from the demo beside your new `icon.png` no longer
generates a favicon set with the wrong brand and reports success — which is what
happened on the first clone.

Plus, read from the default locale's site config (`src/content/site/<DEFAULT_LOCALE>.json`):
`brand.name`, `brand.tagline`,
`assets.themeColor`, `assets.maskIconColor`.

So: replace the SVGs and edit site config **before** running the script.

## Outputs

```bash
npm run assets
```

| File | Size | Purpose |
|---|---|---|
| `public/favicon.ico` | 16, 32, 48 | Browser tabs, bookmarks, legacy Windows |
| `public/favicon.svg` | vector | Modern browsers, scales to any DPI |
| `public/apple-touch-icon.png` | 180×180 | iOS home screen |
| `public/icon-192.png` | 192×192 | Android, PWA manifest |
| `public/icon-512.png` | 512×512 | Splash screens |
| `public/icon-maskable-512.png` | 512×512 | Android adaptive icons, 20% safe padding |
| `public/site.webmanifest` | — | Name, colors, icon list |
| `public/og/default.png` | 1200×630 | Open Graph and Twitter cards |

`sharp` cannot write `.ico`, so the script packs the PNGs into an ICO container
itself (~25 lines in `scripts/generate-static-assets.mjs`). ICO legitimately allows
embedded PNG data; every browser since IE11 reads it.

The maskable icon insets the mark to 62% of the canvas. Android crops adaptive
icons to a circle or squircle and a full-bleed mark loses its edges.

## Commit them

```bash
npm run assets
git add public/
git commit -m "chore: regenerate brand assets"
```

## Per-page OG images

`site.seo.defaultOgImage` is the fallback. Any page can override it:

```jsonc
"seo": { "title": "…", "description": "…", "ogImage": "/og/services.png" }
```

Put the file in `public/og/`, sized 1200×630. There is no automatic per-page OG
generation — it would mean a rendering step at build time, which is exactly the
dependency this design avoids. If a client needs it, that is a clone-level
decision, not a base-level one.

## Verifying

After deploying:

- Favicon: hard-reload; browsers cache favicons aggressively.
- OG card: paste the URL into the LinkedIn Post Inspector or X card validator.
  Both cache — use their refresh action after a change.
- Manifest: Chrome DevTools → Application → Manifest.

## If the mark is not an SVG

`sharp` reads PNG too. Point `ICON_SVG` in the script at the PNG, feed it at least
1024×1024, and expect `favicon.svg` to be wrong — remove that `<link>` from
`BaseHead.astro` rather than ship a broken one. Getting an SVG from the client is
always the better answer.
