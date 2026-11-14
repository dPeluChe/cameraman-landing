// Ordered, discriminated block list. Adding a type = variant here + component in
// src/components/sections/ + entry in SectionRenderer.astro.
// Field-by-field spec: docs/ARCHITECTURE/CONTENT_SCHEMA.md
import { z } from 'astro/zod';
import { httpsUrlSchema, iconSchema, linkSchema, mediaSchema, safeUrlSchema, sectionBase, webUrlSchema, type ImageFn } from './primitives';
import { buildSiteSections } from '../site/sections';

// The facade loads this URL in an iframe on click, so the host list is the
// contract: map embeds, nothing else. A clone embedding another provider adds
// its host here — the alternative is trusting whatever the CMS sends.
const MAP_EMBED_HOSTS = new Set(['google.com', 'www.google.com', 'maps.google.com', 'openstreetmap.org', 'www.openstreetmap.org']);
const mapEmbedUrlSchema = httpsUrlSchema.refine(
  (value) => URL.canParse(value) && MAP_EMBED_HOSTS.has(new URL(value).hostname),
  'must be a Google Maps or OpenStreetMap embed URL',
);

const iconItem = z.object({
  icon: iconSchema,
  title: z.string().min(1),
  description: z.string().min(1),
});

export const buildSectionSchema = (image: ImageFn) =>
  z.discriminatedUnion('type', [
    z.object({
      ...sectionBase,
      type: z.literal('hero'),
      layout: z.enum(['centered', 'split-left', 'split-right']).default('centered'),
      badge: z.object({ text: z.string(), icon: iconSchema.optional() }).optional(),
      title: z.string().min(1),
      /** Substring of `title` rendered in brand color. */
      titleHighlight: z.string().optional(),
      subtitle: z.string().optional(),
      actions: z.array(linkSchema).max(3).default([]),
      media: mediaSchema(image).optional(),
    }),

    z.object({
      ...sectionBase,
      type: z.literal('stats'),
      title: z.string().optional(),
      items: z.array(z.object({ value: z.string().min(1), label: z.string().min(1) })).min(2).max(6),
    }),

    z.object({
      ...sectionBase,
      type: z.literal('features'),
      title: z.string().min(1),
      subtitle: z.string().optional(),
      youtubeId: z
        .string()
        .regex(/^[\w-]{11}$/)
        .optional(),
      media: mediaSchema(image).optional(),
      items: z.array(iconItem).min(1).max(8),
      autoplayMs: z.number().int().min(0).default(5000),
    }),

    z.object({
      ...sectionBase,
      type: z.literal('howItWorks'),
      title: z.string().min(1),
      subtitle: z.string().optional(),
      steps: z.array(iconItem).min(2).max(6),
    }),

    z.object({
      ...sectionBase,
      type: z.literal('services'),
      title: z.string().min(1),
      subtitle: z.string().optional(),
      items: z.array(iconItem.extend({ href: safeUrlSchema.optional() })).min(1).max(9),
    }),

    z.object({
      ...sectionBase,
      type: z.literal('testimonials'),
      title: z.string().optional(),
      items: z
        .array(
          z.object({
            quote: z.string().min(1),
            name: z.string().min(1),
            role: z.string().optional(),
            initials: z.string().max(3).optional(),
            avatar: mediaSchema(image).optional(),
          }),
        )
        .min(1),
    }),

    z.object({
      ...sectionBase,
      type: z.literal('cta'),
      title: z.string().min(1),
      subtitle: z.string().optional(),
      actions: z.array(linkSchema).min(1).max(2),
    }),

    z.object({
      ...sectionBase,
      type: z.literal('faq'),
      title: z.string().min(1),
      subtitle: z.string().optional(),
      items: z.array(z.object({ question: z.string().min(1), answer: z.string().min(1) })).min(2),
      /** Google devalues duplicate FAQPage markup: keep it on one section per site. */
      jsonLd: z.boolean().default(true),
    }),

    z.object({
      ...sectionBase,
      type: z.literal('logos'),
      title: z.string().optional(),
      grayscale: z.boolean().default(true),
      items: z
        .array(
          z.object({
            name: z.string().min(1),
            logo: mediaSchema(image),
            href: webUrlSchema.optional(),
          }),
        )
        .min(2),
    }),

    z.object({
      ...sectionBase,
      type: z.literal('location'),
      title: z.string().min(1),
      subtitle: z.string().optional(),
      mapEmbedUrl: mapEmbedUrlSchema.optional(),
      /** Reads address/phone/hours from site.contact instead of duplicating them. */
      showBusinessInfo: z.boolean().default(true),
      note: z.string().optional(),
    }),

    z.object({
      ...sectionBase,
      type: z.literal('pricing'),
      title: z.string().min(1),
      subtitle: z.string().optional(),
      billingToggle: z
        .object({
          monthlyLabel: z.string().default('Monthly'),
          yearlyLabel: z.string().default('Annual'),
          discountNote: z.string().optional(),
        })
        .optional(),
      plans: z
        .array(
          z.object({
            name: z.string().min(1),
            /** Pre-formatted string: formatting is content, not logic. Omit to show a quote CTA. */
            price: z.string().optional(),
            period: z.string().optional(),
            yearlyPrice: z.string().optional(),
            periodYearly: z.string().optional(),
            description: z.string().optional(),
            features: z.array(z.string()).min(1),
            featured: z.boolean().default(false),
            action: linkSchema,
          }),
        )
        .min(1)
        .max(4),
      note: z.string().optional(),
    }),

    z.object({
      ...sectionBase,
      type: z.literal('comparison'),
      title: z.string().min(1),
      subtitle: z.string().optional(),
      headers: z.array(z.string().min(1)).min(2).max(4),
      rows: z
        .array(
          z.object({
            feature: z.string().min(1),
            description: z.string().optional(),
            values: z.array(z.union([z.string(), z.boolean()])).min(1),
          }),
        )
        .min(1),
      note: z.string().optional(),
    }),

    z.object({
      ...sectionBase,
      type: z.literal('timeline'),
      title: z.string().min(1),
      subtitle: z.string().optional(),
      items: z
        .array(
          z.object({
            step: z.string().optional(),
            date: z.string().optional(),
            title: z.string().min(1),
            description: z.string().min(1),
            icon: iconSchema.optional(),
            tag: z.string().optional(),
          }),
        )
        .min(2),
    }),

    z.object({
      ...sectionBase,
      type: z.literal('bento'),
      title: z.string().min(1),
      subtitle: z.string().optional(),
      items: z
        .array(
          z.object({
            title: z.string().min(1),
            description: z.string().min(1),
            icon: iconSchema.optional(),
            tag: z.string().optional(),
            media: mediaSchema(image).optional(),
            colSpan: z.union([z.literal(1), z.literal(2), z.literal(3)]).default(1),
            rowSpan: z.union([z.literal(1), z.literal(2)]).default(1),
            href: safeUrlSchema.optional(),
          }),
        )
        .min(2)
        .max(8),
    }),

    z.object({
      ...sectionBase,
      type: z.literal('richText'),
      title: z.string().optional(),
      subtitle: z.string().optional(),
      /** Markdown, rendered sanitized. Raw HTML from a CMS is not accepted. */
      body: z.string().min(1),
      media: mediaSchema(image).optional(),
      layout: z.enum(['prose', 'split']).default('prose'),
    }),

    z.object({
      ...sectionBase,
      type: z.literal('team'),
      title: z.string().min(1),
      subtitle: z.string().optional(),
      members: z
        .array(
          z.object({
            name: z.string().min(1),
            role: z.string().min(1),
            bio: z.string().optional(),
            photo: mediaSchema(image).optional(),
            links: z.array(linkSchema).default([]),
          }),
        )
        .min(1),
    }),

    z.object({
      ...sectionBase,
      type: z.literal('contactForm'),
      title: z.string().min(1),
      subtitle: z.string().optional(),
      submitLabel: z.string().min(1),
      successMessage: z.string().min(1),
      errorMessage: z.string().min(1),
      extraFields: z
        .array(
          z.object({
            name: z.string().regex(/^[a-z][a-zA-Z0-9_]*$/),
            label: z.string().min(1),
            type: z.enum(['text', 'tel', 'email', 'select', 'textarea']).default('text'),
            required: z.boolean().default(false),
            options: z.array(z.string()).optional(),
          }),
        )
        .default([]),
      privacyNote: z.string().optional(),
    }),

    z.object({
      ...sectionBase,
      type: z.literal('postsPreview'),
      title: z.string().min(1),
      subtitle: z.string().optional(),
      limit: z.number().int().min(1).max(12).default(3),
      viewAll: linkSchema.optional(),
    }),

    z.object({
      ...sectionBase,
      type: z.literal('projectsPreview'),
      title: z.string().min(1),
      subtitle: z.string().optional(),
      limit: z.number().int().min(1).max(12).default(3),
      /** Falls back to every project when none is flagged featured. */
      featuredOnly: z.boolean().default(true),
      viewAll: linkSchema.optional(),
    }),

    // Site-owned section types: src/site/sections.ts (empty in the blueprint).
    ...buildSiteSections(image),
  ]);

export type Section = z.infer<ReturnType<typeof buildSectionSchema>>;
export type SectionOf<T extends Section['type']> = Extract<Section, { type: T }>;
