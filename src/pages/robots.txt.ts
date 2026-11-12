// Generated, not committed: it has to follow site.seo.robots and SITE_URL.
import type { APIRoute } from 'astro';
import { getSite } from '../lib/content';
import { defaultLocale } from '../lib/i18n';

export const GET: APIRoute = async ({ site }) => {
  const config = await getSite(defaultLocale);
  const origin = site ? new URL(site).origin : '';
  const allow = config.seo.robots.index;

  const body = [
    'User-agent: *',
    allow ? 'Allow: /' : 'Disallow: /',
    '',
    origin ? `Sitemap: ${origin}/sitemap-index.xml` : '',
  ]
    .filter(Boolean)
    .join('\n');

  return new Response(`${body}\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
