// One feed per locale, not one feed with both: a reader subscribing from the
// Spanish site should not get English items. Tied to routes.updates.enabled --
// a clone with no updates section has nothing to syndicate.
// Discovery link lives in BaseHead. Spec: docs/ARCHITECTURE/SEO.md#rss
import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { detailSlug, getPosts, getSite, getUi } from '../../lib/content';
import { localeStaticPaths, localizedPath, type Locale } from '../../lib/i18n';
import { routeHref } from '../../lib/routes';
import { canonicalPath } from '../../lib/url.mjs';

export function getStaticPaths() {
  return localeStaticPaths();
}

export const GET: APIRoute = async ({ props, site }) => {
  const locale = props.locale as Locale;
  const config = await getSite(locale);
  if (!config.routes.updates?.enabled) return new Response(null, { status: 404 });

  // After the early return, so a disabled feed reads nothing it will not use.
  const [ui, posts] = await Promise.all([getUi(locale), getPosts(locale)]);

  const base = site ?? new URL('https://example.com');
  const updatesHref = routeHref(config, locale, 'updates');

  return rss({
    title: `${config.brand.name} — ${ui.updatesTitle}`,
    description: config.seo.defaultDescription,
    site: base,
    trailingSlash: false,
    xmlns: { atom: 'http://www.w3.org/2005/Atom' },
    // The feed names itself, as RSS readers and validators expect (W3C feed validator warns without it).
    customData: `<language>${locale}</language><atom:link href="${new URL(localizedPath(locale, '/rss.xml'), base).href}" rel="self" type="application/rss+xml"/>`,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: canonicalPath(`${updatesHref}/${detailSlug(post)}`),
      categories: post.data.category ? [post.data.category] : undefined,
    })),
  });
};
