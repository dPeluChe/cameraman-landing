// The one place a clone changes the brand typeface. Astro downloads and self-hosts
// these at build time, so the browser never talks to a font CDN and there is no
// third-party request to disclose. Guide: docs/GUIDES/BRAND_TOKENS.md#typeface
//
// `fallbacks` is not decoration: Astro measures the real face against them and
// emits an adjusted @font-face so the swap does not move the layout.
import { fontProviders } from 'astro/config';

const SYSTEM_SANS = ['ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'];

/** Weights must cover --font-weight-body / -strong / -display in tokens.css. */
export const FONTS = [
  {
    provider: fontProviders.google(),
    name: 'Inter',
    cssVariable: '--font-brand',
    weights: [400, 600, 700],
    // Astro fetches normal and italic by default and preloads both. Nothing here
    // sets italic, so it was ~50 KB of preloaded font no page used.
    styles: ['normal'],
    // latin covers es/en accents; latin-ext is Polish/Czech/Turkish and doubled
    // the payload for characters this blueprint never renders.
    subsets: ['latin'],
    fallbacks: SYSTEM_SANS,
    display: 'swap',
  },
];

// The CSS variables BaseHead renders live in font-vars.mjs: a page that imports
// this file pulls in astro/config and breaks the build (withastro/astro#18364).
