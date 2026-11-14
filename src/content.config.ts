// Content contract. Today files, tomorrow a CMS through scripts/sync-content.mjs:
// same schema, different source, zero render changes.
// Spec: docs/ARCHITECTURE/CONTENT_SCHEMA.md
import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob, file } from 'astro/loaders';
import { localeSchema, mediaSchema, seoSchema } from './schemas/primitives';
import { buildSectionSchema } from './schemas/sections';
import { buildSiteSchema } from './schemas/site';

// Explicit ids: the default generator slugifies, drops `index` and honours a
// `slug` field — all three would break the `<locale>/<route>` key.
const stripExt = (entry: string) => entry.replace(/\.(json|md)$/, '');

const site = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/site', generateId: ({ entry }) => stripExt(entry) }),
  schema: ({ image }) => buildSiteSchema(image),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/pages', generateId: ({ entry }) => stripExt(entry) }),
  schema: ({ image }) =>
    z.object({
      locale: localeSchema,
      // Named `route`, not `slug`: the glob loader treats a `slug` field as the
      // entry id and would collapse both locales onto the same entry.
      //
      // A key, not an enum: routes are open, so the set lives in site config. The
      // pairing is still enforced -- getPage throws when a declared route has no
      // file, and a file with no declared route is never built.
      route: z.string().regex(/^[a-z][a-z0-9-]*$/, 'route key: lowercase, kebab-case'),
      seo: seoSchema,
      sections: z.array(buildSectionSchema(image)).min(1),
    }),
});

// Portfolio, products, cases -- one shape, renamed per client through
// site.routes.projects.segment. Each entry is composed from the same sections a
// page is, so a project detail is authored, not designed.
const projects = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/projects', generateId: ({ entry }) => stripExt(entry) }),
  schema: ({ image }) =>
    z.object({
      locale: localeSchema,
      title: z.string().min(1).max(90),
      description: z.string().min(50).max(200),
      // Required, unlike a post cover: a portfolio card with no image is a hole.
      cover: mediaSchema(image),
      category: z.string().optional(),
      /** Spec sheet: client, year, location, scope. Rendered as a definition list. */
      meta: z.array(z.object({ label: z.string().min(1), value: z.string().min(1) })).default([]),
      date: z.coerce.date().optional(),
      /** Ascending. Ties break by date, then title, so ordering is never random. */
      order: z.number().int().optional(),
      translationKey: z.string().optional(),
      featured: z.boolean().default(false),
      draft: z.boolean().default(false),
      seo: seoSchema.partial().optional(),
      sections: z.array(buildSectionSchema(image)).min(1),
    }),
});

// Updates feed, not a blog: no tags, no pagination, no authors.
const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts', generateId: ({ entry }) => stripExt(entry) }),
  schema: ({ image }) =>
    z.object({
      locale: localeSchema,
      title: z.string().min(1).max(90),
      description: z.string().min(50).max(200),
      date: z.coerce.date(),
      updated: z.coerce.date().optional(),
      cover: mediaSchema(image).optional(),
      category: z.string().optional(),
      // Ties a post to its counterpart in other locales; slugs differ per language.
      translationKey: z.string().optional(),
      featured: z.boolean().default(false),
      draft: z.boolean().default(false),
    }),
});

// Kept apart from editorial content so a CMS edit cannot break a11y labels.
const ui = defineCollection({
  loader: file('./src/content/ui.json'),
  schema: z.object({
    skipToContent: z.string(),
    menu: z.string(),
    closeMenu: z.string(),
    toggleTheme: z.string(),
    switchLanguage: z.string(),
    readMore: z.string(),
    backTo: z.string(),
    publishedOn: z.string(),
    updatedOn: z.string(),
    emptyPosts: z.string(),
    required: z.string(),
    optional: z.string(),
    sending: z.string(),
    playVideo: z.string(),
    loadMap: z.string(),
    slideTo: z.string(),
    opensInNewTab: z.string(),
    updatesTitle: z.string(),
    projectsTitle: z.string(),
    emptyProjects: z.string(),
    notFoundTitle: z.string(),
    notFoundBody: z.string(),
    backToHome: z.string(),
    fieldName: z.string(),
    fieldEmail: z.string(),
    fieldMessage: z.string(),
  }),
});

export const collections = { site, pages, posts, projects, ui };
