// One rule for what a URL looks like in this site, so canonical, OG, hreflang and
// the sitemap cannot disagree: no trailing slash, except the root, which is
// `https://site/`. That is how the WHATWG URL serializer writes an origin, and
// @astrojs/sitemap 3.7.4+ emits it that way whatever trailingSlash says
// (astro#17851). Matching it let the blueprint drop its sitemap pin.
//
// Plain .mjs so astro.config.mjs can import it too.

/** '' for the root, '/servicios' otherwise. Never a trailing slash. */
export function canonicalPath(path) {
  return path.replace(/\/+$/, '');
}

export function absoluteUrl(origin, path) {
  return `${origin}${canonicalPath(path) || '/'}`;
}
