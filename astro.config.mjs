// @ts-check
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import { satteri } from '@astrojs/markdown-satteri';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import tailwindcss from '@tailwindcss/vite';

import { DEFAULT_LOCALE, LOCALES } from './src/lib/locales.mjs';
import { alternatesByPath, isNoindexPage, lastmodByPath } from './src/lib/sitemap.mjs';
import { FONTS } from './src/lib/fonts.mjs';
import { figurePlugin } from './src/lib/markdown-figure.mjs';
import { safeMarkdown } from './src/lib/safe-markdown.mjs';
import { resolveSiteUrl } from './src/lib/site-url.mjs';

// loadEnv, not process.env: this file runs before Vite loads .env, so a SITE_URL
// living only in .env silently produced example.com canonicals on local builds.
const env = { ...loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), ''), ...process.env };

// Drives canonical, OG urls, sitemap and robots. Set per deploy.
const site = resolveSiteUrl(env);

// Remote image hosts the pipeline may optimize: only what the clone's CMS or
// asset server actually serves, comma-separated in IMAGE_REMOTE_HOSTS. The
// blueprint itself lists none; an unset list means a remote src fails the
// build instead of opening the optimizer to any https host on the internet.
const imageHosts = (env.IMAGE_REMOTE_HOSTS ?? '')
  .split(',')
  .map((host) => host.trim())
  .filter(Boolean);

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'never',

  i18n: {
    defaultLocale: DEFAULT_LOCALE,
    locales: [...LOCALES],
    routing: { prefixDefaultLocale: false },
  },

  integrations: [
    react(),
    icon(),
    sitemap({
      filter: (page) => !page.includes('/404') && !isNoindexPage(page),
      // Alternates are injected here, not via the i18n option: that option pairs
      // URLs by identical path and finds nothing once segments are translated.
      serialize(item) {
        const path = new URL(item.url).pathname.replace(/\/$/, '') || '/';
        const links = alternatesByPath(site).get(path);
        const lastmod = lastmodByPath().get(path);
        return { ...item, ...(links && { links }), ...(lastmod && { lastmod }) };
      },
    }),
  ],

  fonts: FONTS,

  server: { port: 4433 },

  vite: { plugins: [tailwindcss()] },

  markdown: { processor: satteri({ mdastPlugins: [safeMarkdown], hastPlugins: [figurePlugin] }) },

  // A CMS-fed site serves absolute image URLs; they still go through the pipeline.
  image: { remotePatterns: imageHosts.map((hostname) => ({ protocol: 'https', hostname })) },

  build: { inlineStylesheets: 'auto' },

  prefetch: { prefetchAll: true, defaultStrategy: 'viewport' },
});
