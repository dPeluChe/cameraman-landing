// Typed accessors over the collections. Every page reads content through here,
// never with a raw getEntry, so a missing entry fails loudly at build time.
import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import type { Locale } from './i18n';

export type SiteEntry = CollectionEntry<'site'>['data'];
export type PageEntry = CollectionEntry<'pages'>;
export type PostEntry = CollectionEntry<'posts'>;
export type ProjectEntry = CollectionEntry<'projects'>;
export type UiStrings = CollectionEntry<'ui'>['data'];

export type PageRoute = PageEntry['data']['route'];

/** Routes whose entries get a page each. Both collections share the detail URL. */
export type DetailRoute = 'updates' | 'projects';
export type DetailEntry = PostEntry | ProjectEntry;

export async function getSite(locale: Locale): Promise<SiteEntry> {
  const entry = await getEntry('site', locale);
  if (!entry) throw new Error(`Missing site config: src/content/site/${locale}.json`);
  return entry.data;
}

export async function getUi(locale: Locale): Promise<UiStrings> {
  const entry = await getEntry('ui', locale);
  if (!entry) throw new Error(`Missing UI strings for "${locale}" in src/content/ui.json`);
  return entry.data;
}

export async function getPage(locale: Locale, route: PageRoute): Promise<PageEntry> {
  const entry = await getEntry('pages', `${locale}/${route}`);
  if (!entry) throw new Error(`Missing page: src/content/pages/${locale}/${route}.json`);
  return entry;
}

// Every post page resolves its translations, which reaches for the whole
// collection once per locale. Cached for builds only; dev must see content edits.
const postsByLocale = new Map<Locale, PostEntry[]>();

/** Drafts never reach a production build; they stay visible while developing. */
export async function getPosts(locale: Locale): Promise<PostEntry[]> {
  const cached = postsByLocale.get(locale);
  if (cached && !import.meta.env.DEV) return cached;

  const posts = await getCollection('posts', ({ data }) => data.locale === locale && (import.meta.env.DEV || !data.draft));
  const sorted = posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
  postsByLocale.set(locale, sorted);
  return sorted;
}

const projectsByLocale = new Map<Locale, ProjectEntry[]>();

/** Ordered by `order`, then newest, then title — never by filesystem accident. */
export async function getProjects(locale: Locale): Promise<ProjectEntry[]> {
  const cached = projectsByLocale.get(locale);
  if (cached && !import.meta.env.DEV) return cached;

  const found = await getCollection('projects', ({ data }) => data.locale === locale && (import.meta.env.DEV || !data.draft));
  const sorted = found.sort((a, b) => {
    const byOrder = (a.data.order ?? Infinity) - (b.data.order ?? Infinity);
    if (byOrder !== 0) return byOrder;
    const byDate = (b.data.date?.getTime() ?? 0) - (a.data.date?.getTime() ?? 0);
    return byDate !== 0 ? byDate : a.data.title.localeCompare(b.data.title);
  });
  projectsByLocale.set(locale, sorted);
  return sorted;
}

/** The collection behind a detail route. Keeps routing free of per-type branches. */
export async function getDetails(locale: Locale, route: DetailRoute): Promise<DetailEntry[]> {
  return route === 'projects' ? getProjects(locale) : getPosts(locale);
}

/**
 * Counterpart of an entry in another locale, matched by translationKey then slug.
 * Searches the collection instead of probing getEntry: a miss is the normal case
 * for an untranslated entry, and probing logs a build warning for it.
 */
export async function getTranslatedDetail(
  locale: Locale,
  route: DetailRoute,
  entry: DetailEntry,
): Promise<DetailEntry | undefined> {
  const candidates = await getDetails(locale, route);
  const key = entry.data.translationKey;
  if (key) {
    const byKey = candidates.find((candidate) => candidate.data.translationKey === key);
    if (byKey) return byKey;
  }
  const slug = detailSlug(entry);
  return candidates.find((candidate) => detailSlug(candidate) === slug);
}

/** Filename without the locale directory — used as the URL segment. */
export function detailSlug(entry: DetailEntry): string {
  return entry.id.split('/').slice(1).join('/');
}

/**
 * Every page this locale builds: the implicit home, plus each declared route that
 * is enabled. Order follows the config file, so a clone controls it by ordering
 * its own JSON rather than by a rule written here.
 */
export async function enabledRoutes(locale: Locale): Promise<PageRoute[]> {
  const { routes } = await getSite(locale);
  const enabled: PageRoute[] = ['index'];
  for (const [key, route] of Object.entries(routes)) {
    if (route.enabled) enabled.push(key);
  }
  return enabled;
}

export function resolveTemplate(template: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce((out, [key, value]) => out.replaceAll(`%${key}%`, value), template);
}
