# Extending a clone without editing the blueprint

A clone owns everything under `src/site/` (see `OWNED` in
`scripts/blueprint-lock.mjs`). These are the places to put what only this site
needs, so a later blueprint update never conflicts with it.

The first two clones (iteris.tech, dpeluche.dev) had to edit `BaseLayout`,
`sections.ts` and `SectionRenderer.astro` to do the same three things. Those
edits showed up as drift and would have been overwritten by every blueprint
update. These extension points replace them.

## Your own section types

1. Declare the zod variants in `src/site/sections.ts`, discriminated on `type`:

   ```ts
   export const buildSiteSections = (image: ImageFn) =>
     [
       z.object({ ...sectionBase, type: z.literal('acmeHero'), title: z.string().min(1) }),
     ] as const;
   ```

2. Render them in `src/site/SiteSection.astro`:

   ```astro
   {section.type === 'acmeHero' && <AcmeHero section={section} headingLevel={headingLevel} />}
   ```

3. Use the type in `src/content/pages/<locale>/<page>.json` like any other section.

Prefix the type with the site name (`acmeHero`, not `hero`) so it can never
collide with a type the blueprint adds later. Copy stays in the page JSON; the
"no content in components" rule still applies.

When a page of the original site is one bespoke layout rather than a stack of
sections, make the whole page one site section. Both clones did that.

## Your own chrome

`BaseLayout` renders `src/site/chrome/SiteHeader.astro` above `<main>` and
`src/site/chrome/SiteFooter.astro` below it. The blueprint versions render its
Header, Footer, background, floating contact and sticky CTA. Replace either file
with the site's own; render nothing from them if each page draws its own frame.

## What is not an extension point yet

- **Detail pages from another source.** `updates` and `projects` are the only
  collections with a page per entry. A site whose details come from elsewhere
  (an API snapshot, a third collection) adds its own route in `src/pages/`,
  for example `src/pages/products/[slug].astro`; static segments win over the
  blueprint's `[...lang]/[section]/[slug]`. Keep its URLs in the sitemap and
  give each page the same head (`BaseLayout` with title, description, canonical).
- **Free UI strings.** `ui.json` is a closed schema; site chrome copy lives in
  a JSON file under `src/site/`.

Report a third clone needing either of these: that is the signal to promote it.
