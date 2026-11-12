# Deploy

Target is Vercel with static output. There is no server at runtime; the deploy is
a folder of files behind a CDN.

## What `vercel.json` already sets

Framework, build command (`npm run build`), output directory (`dist`), `cleanUrls`,
no trailing slash, plus:

| Path | Header |
|---|---|
| `/_astro/*` | `Cache-Control: public, max-age=31536000, immutable` — fingerprinted filenames |
| Favicons, `/og/*` | `Cache-Control: public, max-age=604800` |
| `/*` | `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`, `Strict-Transport-Security` |

Do not remove the immutable header on `/_astro/*` — it is what keeps repeat visits
free of asset requests.

## First deploy

```bash
git add -A && git commit -m "feat: initial landing"
gh repo create dPeluChe/<client>-landing --private --source=. --push
```

Then protect `main`, before anyone pushes to it:

```bash
gh api -X PUT repos/dPeluChe/<client>-landing/branches/main/protection --input - <<'JSON'
{"required_status_checks":null,"enforce_admins":true,
 "required_pull_request_reviews":{"required_approving_review_count":0,"dismiss_stale_reviews":false},
 "restrictions":null,"allow_force_pushes":false,"allow_deletions":false}
JSON
```

Two details that are easy to get wrong:

- **`enforce_admins: true` is the whole point.** With it `false`, admins bypass
  the rule — and on a solo repo the admin is the only person pushing, so the
  protection is decorative. Verified: a direct push to `main` succeeded until
  this was flipped on.
- **`required_approving_review_count: 0`, not 1.** GitHub does not let you
  approve your own PR, so requiring an approval locks a solo maintainer out of
  their own repo. Zero still forces every change through a PR, which is the
  guarantee worth having.

`gh pr merge` keeps working. `git push origin main` stops working, which is what
you want.

In Vercel: **Add New → Project → Import** the repo. Framework is detected from
`vercel.json`. Before the first build, add the environment variables below.

## Environment variables

| Variable | Where | Required | Notes |
|---|---|---|---|
| `SITE_URL` | Production, Preview | **yes** | Canonical, OG, sitemap, robots. Wrong value = wrong canonicals on every page. |
| `PUBLIC_CONTACT_ENDPOINT` | Production | if `provider` ≠ `mailto` | |
| `PUBLIC_CONTACT_KEY` | Production | if the service needs one | Public by design — it ships in the bundle |
| `PUBLIC_ANALYTICS_PROVIDER` | Production | no | Off unless set |
| `PUBLIC_ANALYTICS_DOMAIN` / `_ID` / `_SRC` | Production | per provider | |
| `CONTENT_API_URL` | Production | no | Only when a CMS exists |
| `CONTENT_API_TOKEN` | Production | no | |
| `CONTENT_SITE_ID` | Production | no | Multi-tenant key |
| `IMAGE_REMOTE_HOSTS` | Production | if content has remote images | Comma-separated hosts `image.remotePatterns` allows — the CMS/asset host. An unlisted remote `src` fails the build. |

**CI too.** A clone's own GitHub Actions build runs with `CI=true`, so without a real origin it refuses to
build. Set the `SITE_URL` **repository variable** (Settings → Secrets and variables → Actions → Variables):
`ci.yml` passes it to every job. The first CI run of a new clone fails with a clear message until you do.

Set `SITE_URL` on Preview too, otherwise preview builds emit production canonicals
and confuse anyone testing SEO on a preview URL.

`CONTENT_API_*` are optional on purpose: without them `sync:content` uses the
committed snapshot and the build succeeds. See
[../ARCHITECTURE/CONTENT_SYNC.md](../ARCHITECTURE/CONTENT_SYNC.md).

## Domain

1. Vercel → Settings → Domains → add the domain.
2. Point DNS as instructed (usually `CNAME` to `cname.vercel-dns.com`).
3. Set `SITE_URL` to the final domain and **redeploy** — `SITE_URL` is baked in at
   build time, so changing the variable alone changes nothing.
4. Decide the canonical host (`www` or apex) and redirect the other. Serving both
   splits SEO signals.

## Before the first deploy of a clone

- [ ] `robots.index` is back to `true` in every `src/content/site/<locale>.json`
      — `npm run reset` leaves it `false` on purpose so a half-finished clone
      cannot get indexed, and nothing turns it back on for you
- [ ] `routes.updates.enabled` reflects what the client actually wants; reset
      turns it off
- [ ] `npm test` passes, which means no `TODO` placeholder survives
- [ ] `npm run audit` and `npm run responsive` both pass on the real content
- [ ] `npm run assets` was re-run after the brand SVGs changed
- [ ] `PUBLIC_ANALYTICS_PROVIDER` is set if the old site had analytics. It is an
      env var, not a dependency, so a migration that forgets it loses the traffic
      history with nothing failing — raised by the first clone, which came from a
      site running `@vercel/analytics`

## Post-deploy checklist

- [ ] `https://domain.com/robots.txt` points at `https://domain.com/sitemap-index.xml`
- [ ] `sitemap-0.xml` lists the real URLs, not `example.com`
- [ ] `<link rel="canonical">` on the home page is the real domain
- [ ] OG card renders correctly in the LinkedIn Post Inspector
- [ ] Favicon shows in a hard-reloaded tab
- [ ] Contact form delivers a message that actually arrives
- [ ] Lighthouse on the production URL, both a home and an interior page
- [ ] Domain submitted to Google Search Console, sitemap registered

## Redeploying on content change

The site is static — a content change requires a build. Options:

- Commit the content change (normal path today).
- Vercel Deploy Hook, called by the CMS on publish, once one exists.

There is no other cache invalidation path, and that is intentional.

## Other hosts

Nothing here is Vercel-specific except `vercel.json`. `dist/` is plain static
output and works on Netlify, Cloudflare Pages or any bucket behind a CDN — you just
have to re-express the headers in that platform's format. Keep the immutable
caching on `/_astro/*` wherever you land.
