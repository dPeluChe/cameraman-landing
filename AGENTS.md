# AGENTS.md

Code conventions for this repo. Architecture and workflow live in `CLAUDE.md`;
the content contract lives in `docs/ARCHITECTURE/CONTENT_SCHEMA.md`.

## Hard limits

- **500 LOC per file, 400 preferred.** A file past that gets split by
  responsibility, not sliced arbitrarily. `src/schemas/sections.ts` is the one
  file allowed to be long — it is a schema, and splitting it would hide the
  contract.
- **0 lint warnings.** `npm run lint` is a gate, not a suggestion.
- **No direct commits to `main`.** Branch, PR, merge.

## Language

- Code, comments, identifiers, file names, commit messages: **English**.
- `docs/`: English.
- User-facing copy: whatever locale the content file is for. It never lives in
  code — it lives in `src/content/`.
- URL segments: Spanish or English per locale, set in `site.routes[key].segment`.

## Comments

Default is none. When one is genuinely needed, write a WHY note of at most three
lines. Never restate the code, never narrate an algorithm. Long explanations go to
`docs/` with a one-line pointer from the code.

A good comment states the constraint the code is obeying — *"Google devalues
duplicate FAQPage markup: keep it on one section per site"*. A bad one narrates
what the reader can already see: *"this maps each item to a Question object, then
wraps them in a FAQPage…"*. If you cannot state the WHY in three lines, the
explanation belongs in `docs/` and the code gets the pointer.

## Naming

| Thing | Convention | Example |
|---|---|---|
| Astro / React components | PascalCase | `SectionHeader.astro`, `ContactForm.tsx` |
| Modules in `lib/`, `scripts/` | kebab or single word | `routes.ts`, `sync-content.mjs` |
| Content files | English route key | `src/content/pages/es/about.json` |
| Post files | slug in the post's language | `src/content/posts/es/bitacora-digital-v3.md` |
| Section `type` | camelCase | `howItWorks`, `postsPreview` |
| Route key | English, fixed | `services`, `about`, `updates`, `contact` |
| Icon names | lucide slug, checked against the real set at build | `shield-check` |
| CSS tokens | kebab, semantic before literal | `--color-fg-muted`, not `--slate-600` |

## Imports

Relative paths within `src/`. Order: framework (`astro:content`, `react`), then
local modules (`../lib/content`), then type-only imports (`import type`). No barrel
files — they hide what a page actually pulls in.

## Styling

- Tailwind utilities only, resolved through the token bridge in `global.css`.
  `bg-surface`, `text-fg-muted`, `text-brand` — never `bg-slate-50` or `text-blue-600`.
- No inline `style` attributes except for values that cannot be a class
  (a computed gradient inside a scoped `<style>` is fine).
- Dark mode via the `dark:` variant, which reads `[data-theme='dark']`. Never
  `prefers-color-scheme` directly in a component — the toggle has to win.
- Any new color pair must be checked for AA contrast in **both** themes.

## Components

- Every component declares `export interface Props`. The `export` matters: without
  it, a component whose props are all optional gets flagged as declaring an unused
  type, and the hint lands in every clone's first `npm run check`.
- `npm run check` should report 0 errors, 0 warnings **and 0 hints**. Hints are
  debt, not noise to scroll past — the first person to clone this reported all
  three of ours before writing a line of content.
- Section components take exactly one prop: `section: SectionOf<'type'>`.
- Components never fetch content by guessing an id; they call a helper from
  `lib/content.ts`, which throws with a path when an entry is missing.
- Accessibility is part of the component, not a later pass: semantic landmarks,
  a single `h1` per page, `aria-label` on icon-only controls, visible focus,
  touch targets of at least 24×24 px.

## Client JS

Ordered by preference:

1. No JS.
2. Astro component with a small inline `<script>` (theme toggle, carousel, embeds).
3. React island with an explicit directive (`client:visible` unless there is a
   reason for `client:load`).

If you add an island, say in the PR why option 2 was not enough.

## Tests

`npm test` (Vitest). What is covered, what is deliberately not, and the bar for
adding a test: `docs/GUIDES/TESTING.md`.

Two rules worth repeating here:

- For anything schema-shaped, assert **rejection**, not only acceptance. A happy-path
  test passes against a schema with every rule deleted.
- If a bug reaches review, add the test that would have caught it before fixing it.

Do not assert class names or user-facing copy. They change; the contract does not.

## Content changes

Editing `src/content/**` is editing data. It still goes through a PR, and the
build must stay green — the schema will reject a malformed entry.
