// Routing helpers for the `[...lang]` rest-param routes.
// Default locale has no prefix; the rest match zero segments.
// Rationale for the zero-segment prefix scheme: docs/ARCHITECTURE/ROUTING.md
import { DEFAULT_LOCALE, LOCALES, LOCALE_TAGS } from './locales.mjs';

export type Locale = (typeof LOCALES)[number];

export const locales = LOCALES as readonly Locale[];
export const defaultLocale = DEFAULT_LOCALE as Locale;

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (locales as readonly string[]).includes(value);
}

/** `[...lang]` param -> locale. Empty/undefined means the default locale. */
export function localeFromParam(param: string | undefined): Locale {
  return isLocale(param) ? param : defaultLocale;
}

/** One entry per locale; the default one yields `undefined` so it renders at the root. */
export function localeStaticPaths() {
  return locales.map((locale) => ({
    params: { lang: locale === defaultLocale ? undefined : locale },
    props: { locale },
  }));
}

/** Prefixes a root-relative path with the locale segment when needed. */
export function localizedPath(locale: Locale, path = '/'): string {
  const clean = `/${path.replace(/^\/+/, '')}`.replace(/\/$/, '') || '/';
  if (locale === defaultLocale) return clean;
  return clean === '/' ? `/${locale}` : `/${locale}${clean}`;
}

/** Strips the locale prefix from a pathname to get the logical route. */
export function stripLocale(pathname: string): string {
  const match = pathname.match(new RegExp(`^/(${locales.join('|')})(?=/|$)`));
  const stripped = match ? pathname.slice(match[0].length) : pathname;
  return `/${stripped.replace(/^\/+/, '')}`.replace(/\/$/, '') || '/';
}

export function htmlLang(locale: Locale): string {
  return LOCALE_TAGS[locale];
}
