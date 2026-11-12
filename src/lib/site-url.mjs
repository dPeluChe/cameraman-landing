// One resolver for the deploy origin, shared by astro.config.mjs and the tests so
// they cannot disagree. Plain .mjs: the config imports it before Vite exists.
import { existsSync } from 'node:fs';
import { join } from 'node:path';

export const PLACEHOLDER_ORIGIN = 'https://example.com';

/** True for no usable origin: not an absolute URL, or the placeholder host (example.com or a subdomain). */
export function isUnusable(site) {
  try {
    const { hostname } = new URL(site);
    return hostname === 'example.com' || hostname.endsWith('.example.com');
  } catch {
    return true;
  }
}

/**
 * A clone (it has a .blueprint-lock.json) building in CI or on Vercel must name
 * its origin: two clones shipped example.com canonicals to a preview because the
 * new Vercel project had no SITE_URL. The blueprint's own demo keeps the placeholder.
 */
export function resolveSiteUrl(env, cwd = process.cwd()) {
  const site = (env.SITE_URL || env.PUBLIC_SITE_URL || '').trim().replace(/\/$/, '');
  const isClone = existsSync(join(cwd, '.blueprint-lock.json'));
  const isDeploy = Boolean(env.CI || env.VERCEL);
  if (isClone && isDeploy && (!site || isUnusable(site))) {
    throw new Error(
      'SITE_URL is missing, not an absolute URL, or still example.com. Set it in the deploy environment (Preview and Production) and as the SITE_URL repository variable for CI. docs/ARCHITECTURE/SEO.md#rules',
    );
  }
  return site || PLACEHOLDER_ORIGIN;
}
