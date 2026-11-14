# TASK_TODO

Backlog for cameraman.dev.

## Before launch

- [ ] Vercel: `SITE_URL=https://cameraman.dev` for Preview and Production (the build refuses without it)
- [ ] Search Console: verify the domain and submit `/sitemap-index.xml`
- [ ] Apex-to-www (or the reverse) redirect is a 308, not a 307

## Next

- [ ] Sharper app screenshots (check them for tokens; make sure the peeking mascot does not cover key controls)
- [ ] Short demo video of the app
- [ ] Update copy and the "40+" tool count when 0.8 ships (source: the app's `docs/CHANGELOG.md`)

## Done (clone, 2026-11-12)

- Content filled in en/es, brand SVGs and assets generated, `robots.index` on, `SITE_URL` repo variable set.
- Before: the React SPA served 0 words in its first HTML. After: 890, Lighthouse 100/100/100/100.

## Done (2026-11-13, PR #7)

- Astro rebuild live in `src/site/`: real screenshots behind loading skeletons, the mascot (cycling in the hero, peeking beside each shot and the CTA, floating guide link with a line per section).
- Copy for more than tutorials: rotating pill in the hero title, "Edita sin ser editor", three ways to edit (yourself, MCP, the assistant), the "salvó la edición" closing card.
- Gates: lint, check, 16/16 test files, responsive, Lighthouse 100/100/100/100 on all routes, react-doctor 100.

## What the clone hit (report upstream: github.com/dPeluChe/landings-base/issues)

| Date | What happened | Where | How it was solved |
|---|---|---|---|
| 2026-11-12 | `howItWorks` draws its connector past the page with 4+ steps: the grid is `md:grid-cols-3`, so step 3's line runs off the row | `components/sections/HowItWorks.astro` | Used 3 steps |
| 2026-11-12 | A clone with no posts fails CI: git does not keep the empty `src/content/posts/`, and the sitemap test scans it and reads every file in it as a post (a `.gitkeep` fails too) | `tests/build-output.test.ts` | Open: needs the blueprint fix |
| 2026-11-12 | `verify:clone` fails in a clone that kept `docs/CLONE_CHECKLIST.md`, which reset itself creates and tells the clone to keep | `scripts/verify-clone.mjs` | Moved the checklist here, as dpeluche-landing did |
| 2026-11-12 | `verify:clone` fails in an English-default clone: reset writes the same segment for both locales, so the hreflang test fails, and the posts test above fails too | `scripts/reset-templates.mjs` | Open: needs the blueprint fix (issue #64 is the same family) |
| 2026-11-13 | `richText` cannot render the page h1, so a hero-less page has no way to own its heading | `components/sections/RichText.astro` | Own `cmHero` renders the h1 |
| 2026-11-13 | astro-icon warns `ENOENT scandir src/icons` when the clone has no local icons | `astro.config.mjs` | Kept an empty `src/icons/.gitkeep`, owned in `.blueprint-lock.json` |
| 2026-11-12 | The icon schema accepts lucide names only, not aliases (`history` fails, `undo-2` works) | `schemas/primitives.ts` | Picked a non-alias icon |

## Not this repo's problem

Bugs or improvements in the blueprint itself go to github.com/dPeluChe/landings-base/issues.
Keeping them here means fixing the same thing in six landings.
