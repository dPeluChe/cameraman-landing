# Clone checklist

Whoever is cloning keeps this file. You are the one who finds out what is missing or what
breaks, so write it down here as it happens. The blueprint does not pre-list your
problems; what you record here is what it learns from you.

Nothing here replaces the gates (`npm test`, `npm run audit`): this is the human side.

## 1. Inputs

One row per thing the site needs from the client. Add rows the blueprint did not think of.
Status: `missing`, `requested <date>`, `received`, `n/a`.

| Input | Status | Notes |
|---|---|---|
| Logo, SVG wordmark | missing | Blocks the visual review: until it is the client's, the demo brand shows over their copy |
| Logo, square mark and dark-background version | missing | |
| Brand color (one hex) | missing | |
| Images: photos, client logos, product shots, video | missing | |
| Copy, per section and per language | missing | |
| Portfolio: which projects and what can be said publicly | missing | Needs the end client's permission, project by project: ask first |
| Final domain | missing | |
| Email, phone, WhatsApp | missing | |
| Address, coordinates and hours (only with a physical location) | missing | |
| Languages (one or two) and dark mode (yes or no) | missing | |

## 2. What was missing or failed

Every surprise: a gate that failed for a reason the docs did not mention, a step that was
unclear, something you had to edit in a blueprint-owned file. Dated, with how it was solved.
Mark **upstream** when any landing would hit it.

| Date | What happened | File or command | How it was solved | Upstream |
|---|---|---|---|---|
| | | | | |

## 3. Before launch

The SEO rules and their gates: `docs/ARCHITECTURE/SEO.md#rules`. Check the ones only a
person can do, and note the date:

- [ ] `SITE_URL` is different in every clone and lives in three places: `.env` (`reset --site-url` writes it), Vercel for Preview **and** Production, and the repository variable for CI (`gh variable set SITE_URL --body https://<domain>`)
- [ ] `robots.index` back to `true`
- [ ] Old URLs still answer or redirect with a 301
- [ ] Search Console set up and the sitemap submitted
- [ ] Branch protection on `main`

## 4. Report upstream

When the clone ships, open an issue at github.com/dPeluChe/landings-base for each row in
section 2 marked **upstream**, linking this file. Do not fix it only here.
