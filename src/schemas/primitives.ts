import type { SchemaContext } from 'astro:content';
import { icons as lucide } from '@iconify-json/lucide';
import { z } from 'astro/zod';
import { LOCALES } from '../lib/locales.mjs';
import { isSafeUrl } from '../lib/safe-url.mjs';

const LUCIDE_SLUGS = new Set(Object.keys(lucide.icons));

export type ImageFn = SchemaContext['image'];

export const localeSchema = z.enum(LOCALES as unknown as [string, ...string[]]);

/** Local path (optimized at build) or absolute URL (optimized via remotePatterns). */
export const mediaSchema = (image: ImageFn) =>
  z.object({
    src: z.union([image(), z.string().min(1)]),
    alt: z.string().min(1),
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
    priority: z.boolean().default(false),
  });

// Icons are content, not imports, so a typo used to pass a shape check and ship a
// blank slot. Membership in the real set is stronger than any kebab-case regex.
export const iconSchema = z.string().superRefine((slug, ctx) => {
  if (LUCIDE_SLUGS.has(slug)) return;
  ctx.addIssue({ code: 'custom', message: `Unknown lucide icon "${slug}". Browse them at https://lucide.dev/icons` });
});

// CMS content lands in hrefs and script srcs; the URL rule lives in
// lib/safe-url.mjs because markdown renderers apply the same one.
export const safeUrlSchema = z
  .string()
  .refine(isSafeUrl, 'must be http(s), mailto, tel, an #anchor or a relative path');

export const webUrlSchema = z
  .url()
  .refine((value) => URL.canParse(value) && ['http:', 'https:'].includes(new URL(value).protocol), 'must be an http(s) URL');

export const httpsUrlSchema = z
  .url()
  .refine((value) => URL.canParse(value) && new URL(value).protocol === 'https:', 'must be an https URL');

export const linkSchema = z.object({
  label: z.string().min(1),
  href: safeUrlSchema.min(1),
  variant: z.enum(['primary', 'secondary', 'ghost']).default('primary'),
  icon: iconSchema.optional(),
  external: z.boolean().optional(),
});

export const seoSchema = z.object({
  title: z.string().min(1).max(70),
  description: z.string().min(50).max(165),
  ogImage: z.string().optional(),
  noindex: z.boolean().default(false),
  canonical: z.url().optional(),
});

export const sectionBase = {
  anchor: z
    .string()
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  enabled: z.boolean().default(true),
};

export type Media = z.infer<ReturnType<typeof mediaSchema>>;
export type Link = z.infer<typeof linkSchema>;
export type Seo = z.infer<typeof seoSchema>;
