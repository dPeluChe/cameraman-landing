# Content sync — the CMS slot

This project ships the *hole*, not the CMS. `scripts/sync-content.mjs` runs on
`prebuild` and is wired end to end, including the fallback. It currently points at
nothing, and that is a supported state.

## Behaviour

```
npm run build
  └─ prebuild → npm run sync:content
       ├─ CONTENT_API_URL and CONTENT_API_TOKEN set?
       │    ├─ yes → fetch, shape-check, write into src/content/
       │    └─ no  → is there a committed snapshot in src/content/site/?
       │              ├─ yes → warn, exit 0        ← today, and every preview deploy
       │              └─ no  → error, exit 1
       └─ astro build
```

Two properties matter and are non-negotiable:

- **No runtime dependency.** The CMS is read at build time. The deployed site is
  static files; if the API dies, live pages keep serving.
- **Missing credentials never break the build.** Forks, preview deploys and new
  laptops build fine from the committed snapshot. Only a production sync needs
  secrets.

## Environment

| Variable | Required | Purpose |
|---|---|---|
| `CONTENT_API_URL` | no | Endpoint returning the payload below |
| `CONTENT_API_TOKEN` | no | Sent as `Authorization: Bearer …` |
| `CONTENT_SITE_ID` | no | Appended as `?siteId=` — the multi-tenant key. Empty means single tenant. |

Loaded with `node --env-file-if-exists=.env`, so a missing `.env` is not an error.

## Payload shape

```jsonc
{
  "site": {
    "es": { /* one full site config, exactly as src/content/site/es.json */ },
    "en": { /* … */ }
  },
  "pages": [
    { "locale": "es", "route": "index", "seo": { … }, "sections": [ … ] }
  ],
  "posts": [
    {
      "locale": "es",
      "slug": "respuesta-emergencias-bajio",
      "title": "…", "description": "…", "date": "2026-07-14",
      "translationKey": "bajio-base",
      "body": "Markdown body…"
    }
  ],
  "ui": { "es": { … }, "en": { … } }        // optional
}
```

`site`, `pages` and `posts` map one-to-one onto the collections in
[CONTENT_SCHEMA.md](./CONTENT_SCHEMA.md). A page entry is keyed by `route`, which
also names its file. Posts are the only shape that differs: the API sends `body`
as a string and the script rebuilds the Markdown file with frontmatter, so files
and API stay interchangeable.

## Where validation happens

The script checks the envelope: `site` is an object, `pages` is an array,
every entry has `locale` and `route`/`slug`. Field-level validation is left to the
Zod schemas at build time, on purpose — a bad payload then fails with an exact path
(`pages/es/index → sections[3].items[0].icon: lucide icon slug, kebab-case`)
instead of a vague error from a script.

Names are the exception, because here they become paths. A page `route` has to be
a route key (`/^[a-z][a-z0-9-]*$/`, the pattern the pages schema uses) and every
other name — a locale, a post `slug` — has to be one filename with no separator in
it, and the write is refused unless it lands in the directory it names. A
`../../..` would otherwise overwrite `package.json` and still exit 0; the next
build would find out, from a route key that is no longer one. The script cannot
import a Zod schema, so it keeps its own copy of the pattern;
`tests/sync-content.test.ts` fails the day the two disagree.

Post frontmatter keys get the same treatment for the same reason: each becomes a
`key:` line in a YAML block, so only `[A-Za-z0-9_]+` is accepted — a key with a
colon or a newline would smuggle fields in past the schema. Values are written
through `JSON.stringify`, which is already a valid YAML double-quoted scalar.

## What it writes

```
src/content/site/<locale>.json
src/content/pages/<locale>/<route>.json
src/content/posts/<locale>/<slug>.md
src/content/ui.json
```

That is, it overwrites the committed snapshot. After a local sync, `git diff` shows
exactly what the CMS changed — reviewable, and revertable.

## Building the real CMS later

The site side is done. What is missing is a service that serves the payload
above for a `siteId`. Requirements, in order of importance:

1. It must emit content that passes the Zod schemas. Validate on write, in the
   admin, against the same schemas — do not discover it at deploy time.
2. `(siteId, locale, route)` is the primary key for pages.
3. Section editing is an ordered list of typed blocks. Do not invent a second
   ordering mechanism.
4. Images should be served as absolute HTTPS URLs; the Astro pipeline optimizes
   them at build. The serving host must also be listed in `IMAGE_REMOTE_HOSTS`
   (see `.env.example`) — remote patterns are an allow-list, so an unlisted host
   fails the build.
5. Post `body` is Markdown, not HTML: the renderer (`safe-markdown.mjs`, wired
   into `markdown.processor`) drops raw HTML and neutralizes script-capable
   link/image targets, and `richText` bodies go through the same URL rule. Send
   clean markdown and let field-level links use http(s), mailto, tel or paths.
6. A publish action should trigger a deploy hook. There is no other invalidation
   path — the site is static.
7. Send only the keys above. `projects` has no slot in the script, so it would be
   dropped without a word and the committed snapshot would stay — stale content
   that still builds.
