# Testing

```bash
npm test           # once
npm run test:watch # while working
```

Vitest, configured through `getViteConfig` from `astro/config` so tests can import
`src/lib/*` without stubbing Astro's virtual modules.

The suite is small on purpose and grows with the project. The bar for adding a
test: **it must be able to fail for a reason that type checking and the build
cannot catch.**

## What is covered

| File | Asserts |
|---|---|
| `tests/schemas.test.ts` | The content contract — what it accepts, and more importantly what it **rejects**. Plus: the shipped demo content still parses. |
| `tests/routing.test.ts` | Locale prefixing and per-locale URL segments. |
| `tests/nav-vs-routes.test.ts` | Every internal nav and footer link resolves to a page the router builds, so a segment rename cannot leave hrefs 404ing. |
| `tests/contact.test.ts` | Form transport, honeypot behavior, Markdown HTML escaping. |
| `tests/security.test.ts` | CMS content cannot inject script: the safe-URL rule, both markdown renderers, and the analytics snippet. |
| `tests/contrast.test.ts` | WCAG ratios computed over every declared token pair, both themes. |
| `tests/build-output.test.ts` | The HTML actually shipped in `dist/`. |
| `tests/fonts.test.ts` | Font config: every declared font is preloaded through `font-vars.mjs`, and each sets `styles` (Astro defaults to normal plus italic). |
| `tests/site-url.test.ts` | The deploy origin resolver: a clone deploying without a real `SITE_URL` fails the build. |
| `tests/carry.test.ts` | That `npm run carry` keeps the clone's values when the schema grew a key the clone predates. |
| `tests/markdown-figures.test.ts` | That a lone image with a title becomes a `<figure>` through the real post processor, and that an image in running text does not. |
| `tests/sync-content.test.ts` | That the payload in [CONTENT_SYNC.md](../ARCHITECTURE/CONTENT_SYNC.md) is what the sync script writes: pages by `route`, posts by `slug`, and what lands on disk passes the collection schema. |
| `tests/blueprint-drift.test.ts` | In a clone: that it has not edited files the blueprint owns. In the blueprint: that every documented edit point *is* owned. Everywhere: that ROUTING.md's "Adding a route" still names no code file, that CONTENT_SCHEMA.md states no block-type count that could go stale, and that STRUCTURE.md's `lib/` annotation lists exactly the modules in `src/lib/`. |
| `tests/presets.test.ts` | That every preset applies cleanly and emits pages and site config the schemas accept — lucide slugs included — and that no `../`-relative media path resolves to a missing file. |
| `tests/external-links.test.ts` | The link checker's verdicts against a local server: dead links (404, 5xx, DNS) fail, sites that wall off bots (401, 403, 429, 999) are unverified and do not. |
| `tests/doc-vs-tests.test.ts` | That this table lists every file in `tests/` — the enumeration cannot drift from the suite. |

### Schema tests

The schema is a contract, so a test that only checks the happy path is nearly
worthless — a schema with every rule deleted would still pass it. Each rule that
exists to stop a bad site from publishing has a test that feeds it a bad site:

- `LocalBusiness` without an address
- `provider: "endpoint"` without an endpoint
- `showThemeToggle` with `darkMode: false`
- a `titleTemplate` missing `%title%`
- a description under 50 characters, a title over 70
- an icon name that is not in the installed lucide set
- media without `alt`
- a URL segment that is not kebab-case

The last block parses every file under `src/content/` against the schemas, so the
demo cannot drift out of the contract it is meant to demonstrate. It also asserts
that exactly one FAQ section per locale emits `FAQPage` markup.

Two of those checks cover `projects` specifically, because a project detail is
composed from the same sections a page is — leaving it unchecked would mean half
the site is unvalidated:

- every project section parses, in every locale
- every project pairs with its counterpart by `translationKey`

The second one exists because slugs differ per language, so a typo in a key does
not fail anything visible: it silently drops the `hreflang` pair and the language
switcher stops offering the translation.

### Contrast tests

`tokens.css` used to carry the comment "contrast pairs verified AA in both themes".
Nobody had computed them. The test parses the file, resolves `var()` chains,
composites translucent tokens over their background and computes the WCAG ratio.

On its first run it failed four pairs the repo had shipped as verified:
`--color-border-strong` in both themes (1.48:1 and 1.80:1 against a 3:1 floor for
control boundaries), and `--color-danger` / `--color-success` in dark — those two
had no dark override at all and were being read against a near-black surface.

Add a row to `PAIRS` whenever you add a token that carries text or delimits a control.

### Build-output tests

These read `dist/`, which means the artifact they judge can be out of date. The
suite treats the three states differently on purpose:

| `dist/` | Behaviour | Why |
|---|---|---|
| absent | skip, exit 0 | You never built. Honest, and `npm test` still works on a clean checkout. |
| older than `src/` | **fail, exit 1** | Deceptive. The assertions would pass against HTML that no longer matches the source. |
| current | run | |

The stale case is the dangerous one and it is not hypothetical: it was hit during
review — content restored, `npm test` run before rebuilding, two failures that
looked real and were not. Had they passed instead, the reviewer would have drawn a
false conclusion about the repo. For a clone the shape is worse: edit content, see
green from an old build, publish.

`npm test` deliberately does not build. The build is slow enough that coupling
them would make the suite something people skip, so the guard is the answer
instead.

They catch what nothing else does:

- exactly one `<h1>` per page
- a canonical, a description of legal length and an `og:image` on every page
- `Organization`/`LocalBusiness` and `WebSite` graphs everywhere
- `FAQPage` on exactly one page per locale
- `hreflang` translating the **segment**, not just the prefix
- every internal link resolving to a page that was actually built
- the home page shipping no React island
- the contact form deferred with `client="visible"`
- no `<img>` without `alt`
- every in-page `#anchor` resolving to an id that exists on the target page
- `robots.txt` and the sitemap pointing at real URLs

Assertions derive expected routes from `src/content/site/*.json`, never from the
demo's copy. That is deliberate: `npm run reset` wipes the demo, and a clone that
runs it must not inherit a red suite for routes it legitimately renamed or turned
off. The one test that *should* go red after a reset is the leftover-`TODO` gate.

The `hreflang` and internal-link tests exist because both broke during
development. A bug that reached review earns a regression test.

Every one of these has been seen to fail on purpose before being trusted. A check
you have never watched go red has not been verified — it has been assumed.

## The two browser gates

`npm test` never launches a browser: it has to stay fast enough that people run
it. The two checks that need one live beside it as scripts, and both exit 1 on
failure.

| Command | Asserts |
|---|---|
| `npm run audit` | Lighthouse budget on the built routes |
| `npm run responsive` | No horizontal overflow at 320/375/414/768/1024, every built route |

Both discover their routes from `dist/`, so a clone that renames or disables one
still works, and both refuse to measure a server that is not this repo's build.

**Why overflow specifically.** Almost everything about "responsive" is judgement
and needs a human with eyes. Horizontal overflow is the exception: the page
scrolls sideways and content leaves the screen, and that is wrong at every
viewport with no argument. It is the part a machine can own, so it should own it —
and it was previously verified once by hand, which protects nothing.

Content past the edge is not reported when it sits inside a box that scrolls
(`overflow-x: auto|scroll`) or clips it (`hidden|clip`) and that box fits the
viewport: a marquee or a tab strip moves nothing sideways. A box wider than the
viewport is reported on its own. Seen red before and after with planted cases.

Widths live in `WIDTHS` in `scripts/check-responsive.mjs`. A clone with a
different breakpoint story edits that list; it does not delete the check.

## The static-analysis gate

`npm run doctor` (react-doctor, a pinned devDependency) scores the repo out of
100. The blueprint ships at **100 with zero findings**, and a clone should not
merge below that. `npm run doctor` and CI require exactly 100.

It is not in `npm test`: the supply-chain check needs network and the scan is
slower than the suite. Run it before shipping, with `--verbose` to see the
actual rules.

**How to handle a finding — the part that keeps going wrong.** Twice now a
finding was dismissed as a false positive and twice there was a real defect
underneath it:

| Finding | First read | What it actually was |
|---|---|---|
| `control-has-associated-label` | False positive — the labels are correct | True, but the fix was to nest the control in its `<label>` and delete the `useId`/`fieldId` plumbing the analyzer could not resolve. Less code, same accessible names |
| `deslop/unused-dependency` on `@iconify-json/lucide` | False positive — `astro-icon` resolves it by name, removing it breaks the build | Both facts held, yet "nothing imports it" pointed at `iconSchema` only checking kebab-*shape*. Validating against the real icon set fixed the rule and caught two live blank icons |

The rule to carry: **"the tool is wrong about the cause" is not "there is no
cause."** A finding is a hypothesis about a smell, and its label can be wrong
while the smell is real. Before writing one off, verify against ground truth —
the rendered accessibility tree, the failing build — and then ask what made the
code look that way to a static analyzer. Never silence a rule, and never add
markup like a redundant `aria-label` whose only job is to quiet it; that is a
regression wearing the costume of a fix.

If a finding survives that and is genuinely unfixable, record it in
`docs/TASK_TODO.md` under *Known and accepted* with the evidence.

## The state nobody was testing

`npm run verify:clone` copies the repo to a temp directory, runs `reset --yes`,
builds, and runs the suite — asserting that **the only failure is the placeholder
gate** — then applies every preset and builds again. The preset builds run for
real because only `astro build` exercises `image()` path resolution; the schema
asserts `alt` and shape, not that the file exists. Three of the four presets
shipped unable to build, and no gate was looking.

It exists because nobody runs `reset` against the blueprint, so the state every
project starts in was the one state nothing checked. Doing it by hand once found
a crash that left a clone half-reset, two tests that failed for having nothing
rather than something wrong, and an unhandled rejection that masked the very
message a new clone most needs to read.

It checks unhandled errors separately from failed assertions, because a rejection
is not a failed test: it lands on whatever was in flight and never reaches the
JSON report. The first version of this script looked only at assertions and
stayed green against the exact bug it was written for — which is the reason the
`--reporter=default` is there alongside the JSON one.

Suggested by the eps-landing clone.

## What is deliberately not tested

- **Component rendering.** Astro components are checked by the build and by the
  built-HTML assertions. Snapshot tests of markup would break on every design
  tweak and catch nothing real.
- **Anything needing a browser, inside `npm test`.** See the two gates above.
- **Whether a layout looks good.** The check catches overflow, not ugliness. Read
  the pages in both themes before shipping; nothing replaces that.
- **The carousel and theme scripts.** Behavioral, DOM-heavy, low risk. If they
  grow past their current size, they earn a test.

## Adding a test

Put it in the file that matches the layer. If a bug reaches review, add the test
that would have caught it — that is how this suite is meant to grow.

Rules of thumb:

- Assert rejection, not just acceptance, for anything schema-shaped.
- Assert the shipped HTML for anything SEO- or accessibility-shaped.
- Do not assert class names or copy. They change; the contract does not.
