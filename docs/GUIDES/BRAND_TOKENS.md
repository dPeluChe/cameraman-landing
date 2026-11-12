# Brand tokens

`src/styles/tokens.css` is the only file that carries visual identity. No component
contains a color, a radius or a font. Rebranding is editing this file.

## How it reaches the components

```
tokens.css            CSS custom properties (--brand-600, --color-fg-muted, …)
    ↓ @theme inline
theme.css             maps them to Tailwind utilities + the dark variant
    ↓
components            bg-surface, text-fg-muted, text-brand, rounded-lg
```

The stylesheet is split by concern, so changing one thing means opening one file:

| File | Holds | Touch it when |
|---|---|---|
| `tokens.css` | Every brand value | Rebranding. This is the one. |
| `theme.css` | Tokens → Tailwind bridge, dark variant | Adding a token that needs a utility |
| `base.css` | Element defaults, focus, reduced motion | Changing global typography behaviour |
| `layout.css` | Container, section rhythm, snap layout | Changing page spacing |
| `prose.css` | Rendered Markdown | Styling `richText` and post bodies |
| `global.css` | Nothing but imports | Adding a stylesheet |

A component writes `text-fg-muted`, never `text-slate-600`. That indirection is
what makes a clone a config change instead of a find-and-replace.

## Token groups

### Brand ramp

```css
--brand-50, --brand-100      /* tints: icon backgrounds, hover surfaces */
--brand-300, --brand-400     /* light steps: brand color as TEXT on dark */
--brand-500                  /* the brand color as given by the client */
--brand-600, --brand-700     /* dark steps: solid buttons, hover */
```

Only `--brand-500` comes from the brand guide. Generate the rest with any tint/shade
tool; what matters is that the pairs below pass contrast.

`--accent-500` defaults to the brand color. Most businesses have one color — only
split it if the brand guide says so.

### Surfaces and text

Semantic, not literal. `--color-surface` is "the card background", not "white".
The dark theme redefines the same names under `[data-theme='dark']`, which is why
components need no dark-mode logic beyond the `dark:` variant.

| Token | Role |
|---|---|
| `--color-bg` | Page background |
| `--color-surface` | Cards, header, footer |
| `--color-surface-muted` | Secondary fills |
| `--color-border` / `--color-border-strong` | Hairlines / visible borders |
| `--color-text` | Primary text |
| `--color-text-muted` | Body copy |
| `--color-text-subtle` | Metadata, captions |
| `--color-text-on-brand` | Text on a solid brand background |
| `--color-brand-fg` | Brand color used **as text** |
| `--color-brand-bg` | Tinted brand background |
| `--color-focus` | Focus ring |

### Shape

`--radius-base` is a single dial; every other radius derives from it.

| Value | Reads as |
|---|---|
| `0.25rem` | Technical, dense |
| `0.375rem` | Corporate, serious |
| `0.75rem` | Neutral modern (default) |
| `1rem`+ | Soft, consumer, friendly |

### Rhythm

`--section-py`, `--container-max`, `--container-px`. Raising `--section-py` makes
the site feel more premium and lengthens the page; lowering it makes it denser.

### Typeface

The one exception to "everything lives in `tokens.css`": a webfont has to be
downloaded and subset at build time, so the family is declared in
`src/lib/fonts.mjs` and `tokens.css` only consumes it.

```css
--font-sans: var(--font-brand, ui-sans-serif, system-ui, …);
```

The blueprint ships **Inter**, weights 400/600/700, latin subset only. To change
it, edit the `name` in `src/lib/fonts.mjs`. Adding a second typeface also means
listing its `cssVariable` in `src/lib/font-vars.mjs` (a test checks they match). Keep the weights
aligned with `--font-weight-body`, `-strong` and `-display`, or the browser will
synthesize the missing one and it will look wrong.

**Do not add a `<link>` to Google Fonts.** Astro downloads the files at build and
serves them from your own origin. That means no third-party request at runtime
(nothing to disclose in a privacy notice), and no render-blocking stylesheet on a
domain you do not control. A pasted `<link>` gives up all of it.

It also measures the real face against the fallback stack and emits an adjusted
`@font-face` (`Inter fallback: Arial`), so the swap does not move the layout.
That is CLS you never pay, and it is why `fallbacks` in `fonts.mjs` is not
decoration.

### The preload/payload tuning

Both settings were measured with `npm run audit`, and both were wrong before they
were right:

| Config | Result |
|---|---|
| preload + latin & latin-ext | Image-led pages fail — the font competes with the hero for bandwidth (`/` 94) |
| no preload + latin only | Text-led pages fail — the font *is* their LCP, so it arrives too late (`/nosotros` 88) |
| **preload + latin only** | **Budget met**, 99–100 across the audited routes |

The lesson generalizes: whether preloading a font helps depends on whether the
page's LCP is the text or an image, and a landing has both kinds of page. Cutting
the payload is what makes one setting work for both.

If you add a weight, a subset or a second family, **re-run `npm run audit`**. This
is the one part of the blueprint where a reasonable-looking edit silently costs
you the budget.

To ship no webfont at all, empty the `FONTS` and `FONT_VARS` arrays. The
`var(--font-brand, …)` fallback in `tokens.css` then renders the system stack,
and `<Font>` in `BaseHead.astro` renders nothing — verified: `astro check` stays
at 0 errors and the build emits no `.woff2`.

## Contrast

`tests/contrast.test.ts` parses this file, resolves the `var()` chains, composites
translucent tokens over their background and computes the WCAG ratio for every
declared pair, in both themes. Change a color and `npm test` recomputes them —
there is nothing to re-verify by hand.

It is a real gate: when it was first written it failed four pairs that this repo
had shipped as "verified" — `--color-border-strong` in both themes, and
`--color-danger` / `--color-success` in dark, which had no dark override at all
and were being read against a near-black surface.

Minimums (WCAG 2.2 AA):

| Content | Ratio |
|---|---|
| Body text | 4.5:1 |
| Text ≥ 24 px, or ≥ 19 px bold | 3:1 |
| UI borders, focus rings, icons | 3:1 |

Pairs to check, in **both** themes:

- `--color-text` on `--color-surface` and on `--color-bg`
- `--color-text-muted` on `--color-surface`
- `--color-text-subtle` on `--color-surface` (this is the one that usually fails)
- `--color-text-on-brand` on `--brand-600`
- `--color-brand-fg` on `--color-surface`
- `--color-focus` on `--color-bg`

The common failure: a mid-tone brand color used as text on a dark background. The
dark theme handles it by remapping `--color-brand-fg` to `--brand-400`. If your
brand color is already light, the light theme is what needs the darker step.

Lighthouse's accessibility audit is a useful second opinion, but it only sees the
pairs the demo happens to render. The test covers every declared pair whether the
demo uses it or not — add a row to `PAIRS` when you add a token that carries text
or delimits a control.

## The sticky header

`features.headerBlur` is **off** by default. `backdrop-filter` on a sticky element
makes the browser re-sample and blur the strip behind it on every scroll frame,
across the full viewport width — it is a common cause of scroll that feels sticky,
and the effect is decorative. The default header is opaque and costs nothing.

Turn it on per site if the design wants it, and scroll the page on a real machine
before deciding it is free. A headless browser will not show you the difference.

## Dark mode

Driven by `[data-theme]` on `<html>`, set before first paint by an inline script in
`BaseLayout.astro`. Resolution order: `localStorage` → `features.defaultTheme` →
OS preference.

It is attribute-driven rather than media-query-driven so the user's toggle wins
over the OS. Never write `@media (prefers-color-scheme: dark)` in a component.

Turn it off entirely with `features.darkMode = false` in site config. The toggle
disappears and the page stays light; the schema will reject `showThemeToggle: true`
in that state.

## Anti-patterns

| Do not | Instead |
|---|---|
| `bg-blue-600` in a component | `bg-brand-solid` |
| `#2563eb` in a component | a token |
| `dark:bg-gray-900` next to every `bg-white` | `bg-surface`, which already flips |
| A new `--color-*` for one component | reuse a semantic token, or argue for a new one in the PR |
| `rounded-[14px]` | `rounded-lg` |
