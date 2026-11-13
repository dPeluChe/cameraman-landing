// Cameraman's own section types, on top of the blueprint's. docs/GUIDES/EXTENDING.md
import { z } from 'astro/zod';
import { iconSchema, linkSchema, mediaSchema, sectionBase, type ImageFn } from '../schemas/primitives';

/** Accent hues from tokens.css (--pop-*); cards and chips only, never body text. */
const popColor = z.enum(['red', 'yellow', 'teal', 'plum', 'sky']);
export type PopColor = z.infer<typeof popColor>;
export const mascotFace = z.enum(['play', 'pause', 'rec', 'talk']);
export type MascotFace = z.infer<typeof mascotFace>;

export const buildSiteSections = (image: ImageFn) =>
  [
    z.object({
      ...sectionBase,
      type: z.literal('cmHero'),
      badge: z.string().optional(),
      title: z.string().min(1),
      /** Substring of `title` drawn in the brand color. */
      titleHighlight: z.string().optional(),
      subtitle: z.string().min(1),
      actions: z.array(linkSchema).min(1).max(2),
      chips: z.array(z.object({ label: z.string().min(1), color: popColor })).max(6).default([]),
      note: z.string().optional(),
      /** A real screenshot; without it the hero draws the CSS editor mockup. */
      media: mediaSchema(image).optional(),
    }),
    z.object({
      ...sectionBase,
      type: z.literal('cmFeatures'),
      eyebrow: z.string().optional(),
      title: z.string().min(1),
      subtitle: z.string().optional(),
      items: z
        .array(
          z.object({
            icon: iconSchema,
            title: z.string().min(1),
            description: z.string().min(1),
            color: popColor,
            tag: z.string().optional(),
            wide: z.boolean().default(false),
          }),
        )
        .min(2)
        .max(12),
    }),
    z.object({
      ...sectionBase,
      type: z.literal('cmShowcase'),
      title: z.string().min(1),
      subtitle: z.string().optional(),
      rows: z
        .array(
          z.object({
            title: z.string().min(1),
            description: z.string().min(1),
            points: z.array(z.string().min(1)).max(4).default([]),
            color: popColor,
            media: mediaSchema(image),
            mascot: mascotFace.optional(),
          }),
        )
        .min(1)
        .max(4),
    }),
    z.object({
      ...sectionBase,
      type: z.literal('cmAgent'),
      eyebrow: z.string().optional(),
      title: z.string().min(1),
      subtitle: z.string().min(1),
      points: z.array(z.object({ title: z.string().min(1), description: z.string().min(1) })).min(1).max(5),
      clients: z.array(z.string().min(1)).default([]),
      chat: z.object({
        label: z.string().min(1),
        youLabel: z.string().min(1),
        agentLabel: z.string().min(1),
        request: z.string().min(1),
        reply: z.string().min(1),
        tools: z.array(z.string().min(1)).min(1).max(8),
        done: z.string().min(1),
      }),
    }),
  ] as const;
