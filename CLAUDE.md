# CLAUDE.md

@~/.agents/skills/FLOW_CLAUDE.md

## ship config

```yaml
lint: npm run lint   # eslint flat config, 0 warnings -- verified 2026-07-31
typecheck: npm run check   # astro check -- verified 2026-07-31
build: npm run build   # prebuild runs sync:content -- verified 2026-07-31
test: npm test   # vitest: schemas, routing, contact, contrast, build output -- verified 2026-08-02
# Not in `npm test` -- run all of these before shipping a clone; each has its
# own cost:
#   npm run audit        Lighthouse budget on the built routes (downloads Lighthouse, headless Chrome)
#   npm run responsive   horizontal overflow at 320/375/414/768/1024 (needs Chrome)
#   npm run doctor   static analysis; blueprint ships at 100/100 (react-doctor devDependency; needs network)
#   npm run pre-deploy   lint + check + build + test + audit + doctor in one command (not responsive; also: make help)
#   npm run verify:clone        resets a throwaway copy, runs build + suite, then builds every preset (local + CI, no browser)
merge_policy: ask   # auto | ask
loc_limit: 500
simplify: 400       # run /simplify only if changed LOC > N
```

Nothing lands on `main` directly. Every change goes through a branch and a PR.

---

## What this repo is

A client landing. It serves ONE site and answers to nobody else.

Content lives in `src/content/` and is validated by `src/schemas/`. Brand values
live in `src/styles/tokens.css` and nowhere else.

It started from the **landings-base** blueprint, which is now only a place to
report to: if you hit a bug or find an improvement that *any* landing would want,
open an issue at github.com/dPeluChe/landings-base/issues. Do not try to push there, and do not
carry blueprint concerns into this repo's backlog.

Nothing is committed to `main` directly. Branch, commit, pull request — every
time, including content-only edits. `main` is what deploys.

## Stack

- **Astro 7**, `output: 'static'` — no server at runtime. Needs Node 22.23.4+ (`engines`; CI reads it from `package.json`)
- **React 19** as islands only (`@astrojs/react`); default is zero client JS
- **TypeScript** strict, **Tailwind 4** via `@tailwindcss/vite`
- **Content collections** with **Zod 4** schemas — the contract a future CMS must satisfy
- **Vitest** — schema, routing, transport and built-HTML assertions
- Deploy: **Vercel** (static output, `vercel.json` at root)

One dependency is held back on purpose (re-checked Oct 2026):

| Held | Latest | Why |
|---|---|---|
| `typescript` 6 | 7 | `@astrojs/check` declares `typescript ^5 \|\| ^6`; `astro check` does not run on 7. Lift when its peer range does. |

Retired in Oct 2026, with what made each possible:

- `eslint` 9: moved to eslint 10 with `eslint-plugin-jsx-a11y-x` (the maintained
  fork; the original still caps at eslint 9) and `eslint-plugin-astro` 3. A
  planted `<img>` without alt still fails lint in `.astro` and `.tsx`.
- `@astrojs/sitemap` 3.7.3: 3.7.4 writes the root as `https://site/`, so the
  canonical root now has the slash too (`src/lib/url.mjs`).
- The `astro-eslint-parser` override: `eslint-plugin-astro` 3 depends on parser
  3, which never pulled the vulnerable `braces` 2.x chain. `npm audit
  --audit-level=high` stays clean without it.

`overrides.minimatch` ^11.0.5 clears GHSA-g3hv-75wg-m249 (moderate, in the eslint
tree). Drop it when `eslint` and `typescript-eslint` depend on minimatch 11 themselves.

Astro 7.3.6 to 7.3.x failed to build when page code imported `astro/config`
(withastro/astro#18364, fixed upstream; a page importing `fonts.mjs` builds on
7.4.7). `font-vars.mjs` stays separate from `fonts.mjs` so components never pull
in the config module; `tests/fonts.test.ts` keeps the two lists equal.

Dev port: **4433**.

## Where things are

Full map, plus what each layer is allowed to know: `docs/ARCHITECTURE/STRUCTURE.md`.

The three that matter most: `src/schemas/sections.ts` (the section types),
`src/styles/tokens.css` (every brand value), `src/content/site/<locale>.json`
(identity, flags, route segments).

## Rules that are not negotiable

1. **No brand values in components.** Colors, radii, fonts come from
   `src/styles/tokens.css`. A rebrand edits that file, never a component.
2. **No content in components.** Copy, icons and links come from collections.
   Icons are string names (lucide slugs), never imported components.
3. **No raw `<img>`.** Everything goes through `components/ui/Picture.astro`.
4. **No new client JS without a reason.** Prefer Astro + a small inline script;
   reach for a React island only when component state actually justifies it.
5. **A missing required field must break the build.** Do not add fallbacks that
   publish an empty section.
6. **Comments in English, sparse, WHY-only.** Structure and rationale go in `docs/`.
7. **File names in English.** URL segments may be Spanish or English — they come
   from `site.routes[key].segment`, not from file names.
8. **A claim in a comment is not a check.** If a doc or comment asserts a property
   ("verified AA", "every link resolves"), there must be a test that fails when it
   stops holding — otherwise state it as an assumption. `tokens.css` once claimed
   AA contrast; when the check was finally written it failed four pairs.
9. **Never trust a gate you have not seen go red.** Plant the violation, watch it
   fail, then trust the green. Read the exit code, not the reporter's summary.
10. **"The tool is wrong about the cause" is not "there is no cause."** A linter
    finding is a hypothesis about a smell; its label can be wrong while the smell
    is real. Verify against ground truth, then ask what made the code look that
    way. Never silence a rule, and never add markup whose only job is to quiet
    one. Both findings written off here as false positives hid real defects —
    see `docs/GUIDES/TESTING.md#the-static-analysis-gate`.
11. **Every change passes the SEO rules.** `docs/ARCHITECTURE/SEO.md#rules`
    lists them with their gate. `npm test` runs the automatic ones; before a
    preview is shared, also run `npm run audit` and the manual ones (old URLs
    still answer, before/after numbers recorded).

Detailed conventions: `AGENTS.md`. Content contract: `docs/ARCHITECTURE/CONTENT_SCHEMA.md`.

## Cloning this

`npm run reset` replaces `src/content/` with schema-valid placeholders and turns
`robots.index` off, so a half-finished clone cannot get indexed. `npm test` fails
while any `TODO` remains. Full process: `docs/GUIDES/NEW_LANDING.md`.

## Three ways to grow a site, and only one of them is code

Before a migration onto this blueprint, read `docs/GUIDES/LESSONS_FROM_CLONES.md`.
A clone's own section types and chrome go in `src/site/` (`docs/GUIDES/EXTENDING.md`),
never in blueprint files.

The line between "the blueprint's" and "this project's" runs here. Know which
one you are doing before you start.

**A page — content. No code, ever.** Declare the key in `site.routes` with its
segment per locale, add `src/content/pages/<locale>/<key>.json`. Routing,
`hreflang`, sitemap and canonical follow. Every locale must declare the same
key. See `docs/ARCHITECTURE/ROUTING.md`.

**A section type — three edits, in this order:**

1. Variant in `src/schemas/sections.ts` (discriminated on `type`)
2. Component in `src/components/sections/`
3. `case` in `src/components/sections/SectionRenderer.astro`

If it needs more than that, the design is wrong.

**A collection with a page per entry — deliberate, and rare.** `updates` and
`projects` are the only two, and adding a third is real work: a Zod schema, a
card, a listing and a detail layout, plus registration. That cost is not an
oversight. A new content type has to declare its shape, and making it
configuration would let a CMS point at a collection that does not exist.

> **In a clone:** the first is yours. The second is usually yours, and worth
> reporting upstream if any landing would want it. The third is a conversation
> with the blueprint before you write a line — if you find yourself needing it,
> say so rather than growing it locally.

## Performance budget

Lighthouse on the demo site, desktop preset: **Performance ≥ 95, Accessibility 100,
Best Practices 100, SEO 100**. Measured on `/`, `/servicios`, `/contacto`,
a post page and `/en`. Not met = not done.

## Cameraman specifics

- Site: cameraman.dev, the landing of [dPeluChe/cameraman](https://github.com/dPeluChe/cameraman). English is the
  default locale (`/`), Spanish at `/es`. One page (`index`); the other routes are off.
- Own section types in `src/site/`: `cmHero` (navy hero; `rotate` words take turns in a pill at `{rotate}` in the title; a real screenshot, or the CSS editor mockup without one; with a screenshot it shows `Mascot.astro`, the icon whose face swaps between playback controls, inline and as a desktop-only floater that reacts to the section in view),
  `cmShowcase` (alternating screenshot rows; a row's `mascot` face and `say` bubble pop the mascot up beside its shot; shots load behind a `Shot.astro` skeleton), `cmFeatures` (compact list), `cmCta` (CTA card with a peeking mascot), the hero `guide` (floating mascot link and its line per section anchor), `cmAgent` (assistant chat). Accent hues
  are the `--pop-*` tokens in `tokens.css`. `src/site/chrome/SiteHeader.astro` highlights the nav link in view.
- App screenshots live in `src/assets/screens/` (owned in `.blueprint-lock.json`). Before adding one, check the
  recorded terminal for tokens: the Nov 2026 shots showed an MCP bearer token and were pixelated before commit.
- The logo SVGs in `src/assets/brand/` were redrawn from the app icon (`docs/branding` in the app repo).
- Feature copy must match the app: check its `docs/CHANGELOG.md` before claiming a feature, and keep the
  MCP tool count ("40+") and "beta" honest.
- The React/Vite site this replaced is at tag `react-landing-final`; its July 2026 v2-v4 experiments are on
  branch `archive/react-variants`.
