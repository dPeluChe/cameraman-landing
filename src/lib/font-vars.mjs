// Kept apart from fonts.mjs so components never import astro/config (it broke
// `astro build` on 7.3.6 to 7.3.x, withastro/astro#18364, fixed by 7.4.7).
// Must list every cssVariable declared in fonts.mjs (tests/fonts.test.ts).
// Rendered as <Font preload> in BaseHead. The const assertion keeps these as
// literals, which is what <Font> accepts -- a plain string[] fails `astro check`
// even though the build succeeds.
//
// Preload and payload were tuned against `npm run audit`, not guessed. Dropping
// the preload sank the text-led pages (/nosotros 96 -> 88) because the font is
// their LCP; keeping it while shipping latin+latin-ext sank the image-led ones,
// where it competed with the hero. Preload plus the latin-only subset is the
// only combination measured at budget. Re-measure if you change either.
export const FONT_VARS = /** @type {const} */ (['--font-brand']);
