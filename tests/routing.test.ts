// Locale prefixing and segment translation. These broke in review (an
// /en/contacto 404), so they stay covered.
//
// Nothing here names a locale: the suite has to survive LOCALES = ['es'] and a
// different primary language, which the docs promise and which used to be false.
import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { routeHref } from '../src/lib/routes';
import type { SiteEntry } from '../src/lib/content';
import { defaultLocale, isLocale, localeFromParam, localeStaticPaths, locales, localizedPath, stripLocale } from '../src/lib/i18n';

const secondary = locales.find((locale) => locale !== defaultLocale);
const multilingual = secondary !== undefined;

/** Segments are deliberately not the locale code, so a bug cannot pass by luck. */
const siteFor = (prefix: string) =>
  ({
    routes: Object.fromEntries(
      (['services', 'about', 'updates', 'contact'] as const).map((key) => [
        key,
        { enabled: true, segment: `${prefix}-${key}` },
      ]),
    ),
  }) as unknown as SiteEntry;

const primarySite = siteFor('p');
const secondarySite = siteFor('s');

describe('routeHref', () => {
  it('leaves the default locale unprefixed', () => {
    expect(routeHref(primarySite, defaultLocale, 'index')).toBe('/');
    expect(routeHref(primarySite, defaultLocale, 'services')).toBe('/p-services');
    expect(routeHref(primarySite, defaultLocale, 'contact')).toBe('/p-contact');
  });

  it('follows a renamed segment without a code change', () => {
    const renamed = siteFor('x');
    expect(routeHref(renamed, defaultLocale, 'about')).toBe('/x-about');
  });

  it.skipIf(!multilingual)('prefixes other locales and uses their segments', () => {
    expect(routeHref(secondarySite, secondary!, 'index')).toBe(`/${secondary}`);
    expect(routeHref(secondarySite, secondary!, 'services')).toBe(`/${secondary}/s-services`);
    expect(routeHref(secondarySite, secondary!, 'updates')).toBe(`/${secondary}/s-updates`);
  });

  it.skipIf(!multilingual)('never mixes one locale prefix with another locale segment', () => {
    // The /en/contacto bug: the prefix moved but the segment did not.
    const wrong = `/${secondary}/${primarySite.routes.contact!.segment}`;
    expect(routeHref(secondarySite, secondary!, 'contact')).not.toBe(wrong);
  });
});

describe('localizedPath', () => {
  it('normalizes slashes', () => {
    expect(localizedPath(defaultLocale, '/')).toBe('/');
    expect(localizedPath(defaultLocale, 'about')).toBe('/about');
    expect(localizedPath(defaultLocale, '/about/')).toBe('/about');
  });

  it.skipIf(!multilingual)('prefixes other locales, including the root', () => {
    expect(localizedPath(secondary!, '/')).toBe(`/${secondary}`);
    expect(localizedPath(secondary!, '/about')).toBe(`/${secondary}/about`);
  });
});

describe('stripLocale', () => {
  it('leaves a default-locale path alone', () => {
    expect(stripLocale('/about')).toBe('/about');
  });

  it('does not strip a path that merely starts with the locale letters', () => {
    expect(stripLocale(`/${defaultLocale}nergia`)).toBe(`/${defaultLocale}nergia`);
  });

  it.skipIf(!multilingual)('removes a leading locale segment only', () => {
    expect(stripLocale(`/${secondary}/about`)).toBe('/about');
    expect(stripLocale(`/${secondary}`)).toBe('/');
  });
});

describe('locale helpers', () => {
  it('falls back to the default locale for an empty rest param', () => {
    expect(localeFromParam(undefined)).toBe(defaultLocale);
    expect(localeFromParam('zz')).toBe(defaultLocale);
  });

  it('recognizes only declared locales', () => {
    expect(isLocale(defaultLocale)).toBe(true);
    expect(isLocale('zz')).toBe(false);
  });

  it('emits an undefined lang param for the default locale so it renders at the root', () => {
    const paths = localeStaticPaths();
    expect(paths).toHaveLength(locales.length);
    expect(paths.find((entry) => entry.props.locale === defaultLocale)?.params.lang).toBeUndefined();
  });

  it.skipIf(!multilingual)('prefixes every other locale', () => {
    expect(localeStaticPaths().some((entry) => entry.params.lang === secondary)).toBe(true);
    expect(localeFromParam(secondary!)).toBe(secondary);
  });
});

// Routes are open so a landing can add pages the blueprint never imagined. What
// that costs is the guarantee an enum used to give, so it is bought back here.
describe('the open route set', () => {
  const site = (routes: Record<string, { enabled: boolean; segment: string }>) =>
    ({ routes }) as unknown as Parameters<typeof routeHref>[0];

  it('builds a href for a key the blueprint never heard of', () => {
    expect(routeHref(site({ presence: { enabled: true, segment: 'presencia' } }), defaultLocale, 'presence')).toBe(
      '/presencia',
    );
  });

  // Silently emitting `/undefined` is the failure an open set makes possible.
  it('refuses to invent a href for an undeclared route', () => {
    expect(() => routeHref(site({}), defaultLocale, 'nowhere')).toThrow(/not declared/);
  });

  // Keys pair the locales for hreflang. If one locale declares `presence` and the
  // other does not, nothing breaks loudly — the alternate is just missing, which
  // is the kind of SEO loss nobody notices for months.
  it('declares the same route keys in every locale', async () => {
    const perLocale = await Promise.all(
      locales.map(async (locale) => {
        const raw = await readFile(join(process.cwd(), 'src/content/site', `${locale}.json`), 'utf8');
        return [locale, Object.keys(JSON.parse(raw).routes).sort()] as const;
      }),
    );

    const [first, ...rest] = perLocale;
    for (const [locale, keys] of rest) {
      expect(keys, `${locale} declares different routes than ${first![0]}`).toEqual(first![1]);
    }
  });
});
