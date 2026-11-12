// Nav and footer links are free-form hrefs; routes are declared in the same
// file. Renaming a segment (the reason segments exist) leaves every nav href
// pointing at a 404 that only a visitor finds. This pairs them: every internal
// href must resolve to a page the router actually builds.
//
// The valid set is derived through `localizedPath`, the same helper the routes
// use, so it cannot drift from them. Deriving it by hand is what broke the
// first version: it checked the segment against the routes of the file it came
// from rather than the locale the href names, so a link to another locale was
// rejected when valid and accepted when broken -- and `/es/...` looked fine
// even though the default locale renders at the root with no prefix.
//
// Detail slugs (`/updates/some-post`) are content-managed and out of scope;
// only the locale prefix and first segment are checked, which is where renames
// bite.
import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { isLocale, locales, localizedPath, type Locale } from '../src/lib/i18n';

interface Link {
  label: string;
  href: string;
}

interface SiteFile {
  routes: Record<string, { enabled: boolean; segment: string }>;
  nav: Link[];
  footer: {
    columns: { links: Link[] }[];
    legalLinks: Link[];
  };
}

const readSite = async (locale: Locale): Promise<SiteFile> =>
  JSON.parse(
    await readFile(join(process.cwd(), 'src/content/site', `${locale}.json`), 'utf8'),
  ) as SiteFile;

const sites = Object.fromEntries(
  await Promise.all(locales.map(async (locale) => [locale, await readSite(locale)] as const)),
) as Record<Locale, SiteFile>;

/** Every public path the router emits, home included. */
const built = new Set(
  locales.flatMap((locale) => [
    localizedPath(locale),
    ...Object.values(sites[locale].routes)
      .filter((route) => route.enabled)
      .map((route) => localizedPath(locale, route.segment)),
  ]),
);

const isInternal = (href: string) => href.startsWith('/') && !href.startsWith('//');

/** Reduces an href to the route page it lands on, dropping anchor and detail slug. */
const pageOf = (href: string): string => {
  const path = href.split('#')[0]!.replace(/\/+$/, '');
  const [first, second] = path.slice(1).split('/').filter(Boolean);
  if (first && isLocale(first)) return second ? `/${first}/${second}` : `/${first}`;
  return first ? `/${first}` : '/';
};

describe('nav and footer hrefs resolve to pages the router builds', () => {
  it.each(locales)('%s: every internal link lands on a built page', (locale) => {
    const site = sites[locale];
    const links = [
      ...site.nav,
      ...site.footer.columns.flatMap((column) => column.links),
      ...site.footer.legalLinks,
    ];

    const broken = links
      .filter((link) => isInternal(link.href))
      .filter((link) => !built.has(pageOf(link.href)))
      .map(
        (link) =>
          `"${link.label}" -> ${link.href}: ${pageOf(link.href)} is not a page this site builds (src/content/site/${locale}.json)`,
      );

    expect(broken).toEqual([]);
  });
});
