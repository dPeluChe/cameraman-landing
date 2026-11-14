// hreflang alternates for the sitemap, built from the same route data the pages
// use. @astrojs/sitemap's i18n mode pairs URLs by identical path, which never
// matches once segments are translated (/servicios vs /en/services) — it silently
// emitted alternates for the two homepages only.
// Plain .mjs because astro.config.mjs imports it. Spec: docs/ARCHITECTURE/SEO.md
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

import { DEFAULT_LOCALE, LOCALES, LOCALE_TAGS } from './locales.mjs';
import { absoluteUrl } from './url.mjs';

const CONTENT = join(process.cwd(), 'src', 'content');
/** Route key -> where its detail entries live and how they are written. */
const DETAIL_SOURCES = [
  { route: 'updates', dir: 'posts', ext: '.md' },
  { route: 'projects', dir: 'projects', ext: '.json' },
];

const prefix = (locale) => (locale === DEFAULT_LOCALE ? '' : `/${locale}`);

function siteConfig(locale) {
  const file = join(CONTENT, 'site', `${locale}.json`);
  return existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : null;
}

/** `updated`, else `date`, from a post's frontmatter, as an ISO string. Only posts carry dates. */
function lastmodOf(raw) {
  const field = (key) => raw.match(new RegExp(`^${key}:\\s*"?([^"\\n]+)"?`, 'm'))?.[1]?.trim();
  const value = field('updated') ?? field('date');
  const time = value ? new Date(value).getTime() : NaN;
  return Number.isNaN(time) ? undefined : new Date(time).toISOString();
}

/** slug + translationKey per locale, skipping drafts the build also skips. */
function details(locale, { dir, ext }) {
  const base = join(CONTENT, dir, locale);
  if (!existsSync(base)) return [];

  const found = [];
  for (const name of readdirSync(base)) {
    if (!name.endsWith(ext)) continue;

    const raw = readFileSync(join(base, name), 'utf8');
    // Frontmatter is line-oriented, JSON is not, so each gets its own reading.
    const entry =
      ext === '.json'
        ? JSON.parse(raw)
        : {
            draft: /^draft:\s*true/m.test(raw),
            translationKey: raw.match(/^translationKey:\s*"?([^"\n]+)"?/m)?.[1]?.trim(),
            lastmod: lastmodOf(raw),
          };

    if (entry.draft) continue;
    found.push({ slug: name.slice(0, -ext.length), translationKey: entry.translationKey, lastmod: entry.lastmod });
  }
  return found;
}

/** Groups of paths that are the same page in different locales. */
function groups() {
  const out = [];

  out.push(LOCALES.map((locale) => [locale, prefix(locale) || '/']));

  // Derived from config: a listed set here would miss every route a clone adds.
  const keys = new Set(LOCALES.flatMap((locale) => Object.keys(siteConfig(locale)?.routes ?? {})));

  for (const key of keys) {
    const paths = [];
    for (const locale of LOCALES) {
      const route = siteConfig(locale)?.routes?.[key];
      if (route?.enabled) paths.push([locale, `${prefix(locale)}/${route.segment}`]);
    }
    if (paths.length) out.push(paths);
  }

  for (const source of DETAIL_SOURCES) {
    // Keyed per source: a post and a project may share a translationKey without
    // being the same page, and merging them would emit a wrong hreflang pair.
    const byKey = new Map();

    for (const locale of LOCALES) {
      const route = siteConfig(locale)?.routes?.[source.route];
      if (!route?.enabled) continue;

      for (const entry of details(locale, source)) {
        const key = entry.translationKey ?? entry.slug;
        const path = `${prefix(locale)}/${route.segment}/${entry.slug}`;
        byKey.set(key, [...(byKey.get(key) ?? []), [locale, path]]);
      }
    }
    out.push(...byKey.values());
  }

  return out;
}

/**
 * path -> the xhtml:link list @astrojs/sitemap expects, x-default included.
 * Single-locale groups get nothing: a lone alternate is noise.
 */
export function alternatesByPath(siteUrl) {
  const origin = new URL(siteUrl).origin;
  const index = new Map();

  for (const group of groups()) {
    if (group.length < 2) continue;

    const links = group.map(([locale, path]) => ({ lang: LOCALE_TAGS[locale], url: absoluteUrl(origin, path) }));
    const fallback = group.find(([locale]) => locale === DEFAULT_LOCALE) ?? group[0];

    for (const [, path] of group) {
      index.set(path, [...links, { lang: 'x-default', url: absoluteUrl(origin, fallback[1]) }]);
    }
  }

  return index;
}

/**
 * True when the built page for `url` asks not to be indexed. Read from dist/ at
 * sitemap time (the integration runs after the pages are written): a sitemap that
 * lists a noindex page sends Google two opposite signals for the same URL.
 */
export function isNoindexPage(url, outDir = join(process.cwd(), 'dist')) {
  // Site-wide noindex (a clone before launch) is a switch, not a page decision:
  // the sitemap stays complete so it is right the day robots.index flips.
  if (siteConfig(DEFAULT_LOCALE)?.seo?.robots?.index === false) return false;
  const path = new URL(url).pathname.replace(/\/$/, '');
  const file = join(outDir, path, 'index.html');
  if (!existsSync(file)) return false;
  return /<meta name="robots" content="noindex/.test(readFileSync(file, 'utf8'));
}

/**
 * path -> ISO lastmod for pages whose content carries a real date (posts). Every other page
 * gets none: Google ignores a lastmod it cannot trust, so a build date on every URL would
 * teach it to ignore the honest ones too.
 */
export function lastmodByPath() {
  const index = new Map();
  for (const locale of LOCALES) {
    const route = siteConfig(locale)?.routes?.updates;
    if (!route?.enabled) continue;
    for (const entry of details(locale, DETAIL_SOURCES[0])) {
      if (entry.lastmod) index.set(`${prefix(locale)}/${route.segment}/${entry.slug}`, entry.lastmod);
    }
  }
  return index;
}
