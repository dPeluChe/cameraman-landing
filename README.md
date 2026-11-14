# Cameraman landing

The site for [Cameraman](https://github.com/dPeluChe/cameraman), served at cameraman.dev.
Static site built with Astro. Content is data validated by Zod schemas; brand
values live in one CSS file; SEO is generated, not hand-written.

## Quick start

```bash
npm install
npm run dev               # http://localhost:4433
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server on port 4433 |
| `npm run build` | `sync:content` (prebuild) then static build to `dist/` |
| `npm run preview` | Serve `dist/` on port 4433 |
| `npm test` | Schema, routing, contact transport, token contrast, built HTML |
| `npm run check` | `astro check` |
| `npm run lint` | ESLint, must be 0 warnings |
| `npm run assets` | Regenerate favicons, webmanifest and OG image from the brand SVGs |
| `npm run audit` | Lighthouse against `dist/`, fails if the budget is not met |
| `npm run responsive` | Fails on horizontal overflow at 320/375/414/768/1024 |

## How work lands

**Nothing is committed to `main` directly.** Every change — content, brand,
copy fix — goes on a branch, gets its own commit, and lands through a pull
request. Approving your own PR is fine when you are working alone; skipping the
PR is not.

```bash
git checkout -b content/home-copy
# ...work, then the gates: lint, check, build, test
git commit -m "content: home hero and services copy"
git push -u origin content/home-copy
gh pr create --fill && gh pr merge --squash --delete-branch
```

The reason is not ceremony: a landing is edited by more than one person and by
agents, and `main` is what deploys. A branch is the only place a half-finished
page can exist without being published.

## Where to change what

| To change | Edit |
|---|---|
| Copy, sections, page order | `src/content/pages/<locale>/*.json` |
| Brand name, contact, SEO defaults, routes | `src/content/site/<locale>.json` |
| Colors, radii, fonts | `src/styles/tokens.css` |
| Logo and favicon source | `src/assets/brand/`, then `npm run assets` |

## Documentation

| Doc | Covers |
|---|---|
| [ARCHITECTURE/CONTENT_SCHEMA.md](docs/ARCHITECTURE/CONTENT_SCHEMA.md) | What content is allowed to be |
| [ARCHITECTURE/ROUTING.md](docs/ARCHITECTURE/ROUTING.md) | Routes, URL segments, hreflang |
| [ARCHITECTURE/SEO.md](docs/ARCHITECTURE/SEO.md) | What metadata ships and where it comes from |
| [ARCHITECTURE/STRUCTURE.md](docs/ARCHITECTURE/STRUCTURE.md) | Where things live |
| [GUIDES/BRAND_TOKENS.md](docs/GUIDES/BRAND_TOKENS.md) | Rebranding and contrast |
| [GUIDES/STATIC_ASSETS.md](docs/GUIDES/STATIC_ASSETS.md) | Favicons, manifest, OG image |
| [GUIDES/CONTACT_FORM.md](docs/GUIDES/CONTACT_FORM.md) | Form transport |
| [GUIDES/ANALYTICS.md](docs/GUIDES/ANALYTICS.md) | Turning analytics on |
| [GUIDES/DEPLOY.md](docs/GUIDES/DEPLOY.md) | Vercel setup and env vars |
| [GUIDES/TESTING.md](docs/GUIDES/TESTING.md) | What the suite covers |

## Reporting upstream

This project came from the **landings-base** blueprint. Bugs or improvements that
would help *any* landing go to github.com/dPeluChe/landings-base/issues — not into this repo's
backlog, and never pushed to that repo directly.
