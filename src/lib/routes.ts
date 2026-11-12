// Route keys are English and fixed (they name content files and components);
// URL segments come from site.routes[key].segment and are translated per locale.
// Rationale and how to add a route: docs/ARCHITECTURE/ROUTING.md
import {
  detailSlug,
  enabledRoutes,
  getDetails,
  getSite,
  getTranslatedDetail,
  type DetailEntry,
  type DetailRoute,
  type PageRoute,
  type SiteEntry,
} from './content';
import { defaultLocale, localeStaticPaths, locales, type Locale } from './i18n';
import { LOCALE_LABELS, LOCALE_TAGS } from './locales.mjs';

export interface Alternate {
  locale: Locale;
  tag: string;
  label: string;
  href: string;
}

/** Public path for a route key in a given locale, prefix included. */
export function routeHref(site: SiteEntry, locale: Locale, route: PageRoute): string {
  const prefix = locale === defaultLocale ? '' : `/${locale}`;
  if (route === 'index') return prefix || '/';

  // Routes are open, so an undeclared key is a real possibility -- a component
  // asking for one is a bug, and a silent `/undefined` would ship.
  const declared = site.routes[route];
  if (!declared) throw new Error(`Route "${route}" is not declared in src/content/site/${locale}.json`);
  return `${prefix}/${declared.segment}`;
}

/**
 * Built from the route key, not the URL: segments differ per locale, and a locale
 * that lacks the page is omitted rather than linked to a 404. See ROUTING.md.
 */
export async function alternateHrefs(route: PageRoute, detail?: DetailEntry): Promise<Alternate[]> {
  // Locales are independent, so they resolve together rather than in sequence.
  const resolved = await Promise.all(
    locales.map(async (locale) => {
      const site = await getSite(locale);
      // A locale that never declared this route simply has no counterpart.
      if (route !== 'index' && !site.routes[route]?.enabled) return null;

      let href = routeHref(site, locale, route);
      if (detail) {
        const translated = await getTranslatedDetail(locale, route as DetailRoute, detail);
        if (!translated) return null;
        href = `${href}/${detailSlug(translated)}`;
      }

      return { locale, tag: LOCALE_TAGS[locale], label: LOCALE_LABELS[locale], href };
    }),
  );

  return resolved.filter((entry) => entry !== null);
}

/** One entry per (locale, enabled route) pair, with the localized segment. */
export async function pagePaths() {
  const perLocale = await Promise.all(
    localeStaticPaths().map(async (entry) => {
      const locale = entry.props.locale as Locale;
      const [site, routes] = await Promise.all([getSite(locale), enabledRoutes(locale)]);

      const paths = [];
      for (const route of routes) {
        // enabledRoutes only returns declared keys, plus the implicit home.
        const declared = site.routes[route];
        if (!declared) continue;
        paths.push({
          params: { ...entry.params, page: declared.segment },
          props: { ...entry.props, route },
        });
      }
      return paths;
    }),
  );

  return perLocale.flat();
}

const DETAIL_ROUTES: DetailRoute[] = ['updates', 'projects'];

/**
 * Every detail page, from both collections. One route file serves them because
 * the URL shape is identical — the segment is what tells them apart, and it
 * comes from site config, so a clone renames either without touching a route.
 */
export async function detailPaths() {
  const perLocale = await Promise.all(
    localeStaticPaths().map(async (entry) => {
      const locale = entry.props.locale as Locale;
      const site = await getSite(locale);

      const perRoute = await Promise.all(
        DETAIL_ROUTES.map(async (route) => {
          const declared = site.routes[route];
          if (!declared?.enabled) return [];

          const { segment } = declared;
          const details = await getDetails(locale, route);
          return details.map((detail) => ({
            params: { ...entry.params, section: segment, slug: detailSlug(detail) },
            props: { ...entry.props, route, detail },
          }));
        }),
      );

      return perRoute.flat();
    }),
  );

  return perLocale.flat();
}
