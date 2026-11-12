# Routing and i18n

## The split that matters

A **route key** is English, fixed, and names files. A **URL segment** is public,
translated per locale, and lives in content.

| Route key | `es` segment | `en` segment | Content file |
|---|---|---|---|
| `index` | `/` | `/en` | `src/content/pages/<locale>/index.json` |
| `services` | `/servicios` | `/en/services` | `…/services.json` |
| `about` | `/nosotros` | `/en/about` | `…/about.json` |
| `updates` | `/novedades` | `/en/updates` | `…/updates.json` |
| `projects` | `/proyectos` | `/en/projects` | `…/projects.json` |
| `contact` | `/contacto` | `/en/contact` | `…/contact.json` |

Segments come from `site.routes[key].segment`. Renaming `/servicios` to
`/que-hacemos` is a content edit — no file moves, no code changes.

**The set is open.** The table above is what the demo ships, not what the
blueprint allows. A landing that needs *Presencia*, *Catálogo* or *Revista* adds
them with two content edits:

```jsonc
// src/content/site/es.json
"routes": { "presence": { "enabled": true, "segment": "presencia" } }
// plus src/content/pages/es/presence.json with { locale, route, seo, sections }
```

That is the whole change — hreflang, sitemap, canonical and nav follow. It used
to require editing the blueprint's schema, which pulled those files into the
clone's `owned` list and cost it every future upgrade. A closed list made adding
a fourth page more expensive than it had any reason to be.

Two keys are **reserved** because they render a collection rather than sections:
`updates` and `projects`. Everything else renders its own sections.

### Why pages are open and collections are not

They look like halves of the same idea and they are not, which is why only one
of them was opened.

A **page** is a name and a segment. The components never learn it, the routing
derives everything from config, and the blueprint has no opinion about whether a
landing needs *Presencia* or *Catálogo*. Keeping that list closed bought nothing
and cost a clone its upgrade path.

A **collection** is a shape: what fields an entry has, how a card renders, what
the detail page looks like. That cannot come from config, because there is
nothing to configure until someone declares it. Making it declarative would
produce a contract a CMS can violate — a route pointing at a collection that
does not exist — which is exactly what these schemas exist to prevent.

So: adding a page is content, adding a collection is code, and that asymmetry is
the design rather than an unfinished half of it. `updates` and `projects` are
reserved keys for the two that exist. A third gets added when a second clone
needs one, with its shape known rather than guessed.

### What the open set costs, and what buys it back

An enum made two mistakes unrepresentable. Now they are possible, so each has a
rule:

| Mistake | Caught by |
|---|---|
| A route named `index` | Schema — the home is implicit and has no segment |
| Two routes sharing a segment | Schema — they would build to the same URL |
| A locale declaring a route another does not | Test — keys pair the locales for `hreflang`, and a missing one loses the alternate silently |
| Asking for an undeclared route | `routeHref` throws instead of emitting `/undefined` |

The last one is the trade in plain terms: a typo in a route name used to fail in
the editor, and now fails at build with `Route "x" is not declared in
src/content/site/es.json`. Same error, a few seconds later, and still impossible
to ship.

## Files

```
src/pages/
├── [...lang]/
│   ├── index.astro              /            /en
│   ├── [page].astro             /servicios   /en/services   (every non-home page)
│   └── [section]/[slug].astro   /novedades/x /proyectos/y   (post or project detail)
├── 404.astro
└── robots.txt.ts
```

`[...lang]` is a rest parameter, so it matches **zero** segments for the default
locale. `localeStaticPaths()` returns `{ lang: undefined }` for `es` and
`{ lang: 'en' }` for `en`, which is why Spanish pages have no prefix and English
pages do. This is the whole reason there is no duplicated page tree.

`[page].astro` dispatches: `updates` renders `UpdatesIndex` (sections plus the post
list), `projects` renders `ProjectsIndex` (sections plus the project grid),
everything else renders `ContentPage` (sections only).

`[section]/[slug].astro` serves **both** detail collections. Their URL shape is
identical and the segment is what distinguishes them, so a second route file
would only duplicate `getStaticPaths`. Which collection an entry came from
arrives as the `route` prop, and the file dispatches to `PostDetail` or
`ProjectDetail`.

## Disabling a route

Set `site.routes.updates.enabled = false`. The page stops being generated, which
also removes it from the sitemap, and `alternateHrefs` stops emitting an
`hreflang` for it. Remember to drop it from `site.nav` too — nav is content, and
nothing validates that a nav link points somewhere real.

## hreflang and the language switcher

Both come from `alternateHrefs(route, post?)` in `src/lib/routes.ts`. It walks the
locales and, per locale, resolves the segment from that locale's site config. A
locale is skipped when:

- the route is disabled there, or
- it is a post page and no translated counterpart exists.

A skipped locale gets no `hreflang` and no switcher entry. The alternative —
building the URL by string-substituting the locale prefix — is what produced
`/en/contacto` 404s during development, which is why it is done this way.

Post translations are matched by `translationKey`, falling back to an identical
slug. See [CONTENT_SCHEMA.md](./CONTENT_SCHEMA.md#posts--the-updates-feed).

## Adding a route

The two content edits from **The set is open** above: declare the key with its
`{ enabled, segment }` in every `src/content/site/<locale>.json`, then add
`src/content/pages/<locale>/<key>.json`. Nothing outside `src/content/` is edited
at any step, and there is no new file under `src/pages/` — `[page].astro` picks the
key up.

## Going single-language

`LOCALES = ['es']` in `src/lib/locales.mjs`. Delete `src/content/**/en*`. Routes,
`hreflang` and the switcher all adapt on their own.

## Anchors

Anchors (`#preventivo` vs `#preventive`) are per-locale content, so a translated
page can easily keep the other locale's fragment. `tests/build-output.test.ts`
collects every `id` in the built HTML and asserts that every `#fragment` in every
internal link resolves on its target page — a stale anchor fails the suite instead
of scrolling nowhere.
