// Per-locale site configuration: brand, contact, SEO defaults, static assets,
// nav, feature flags, route toggles. First file to edit when cloning.
// Spec: docs/ARCHITECTURE/CONTENT_SCHEMA.md#site
import { z } from 'astro/zod';
import {
  httpsUrlSchema,
  iconSchema,
  linkSchema,
  localeSchema,
  mediaSchema,
  safeUrlSchema,
  webUrlSchema,
  type ImageFn,
} from './primitives';

const routeSchema = z.object({
  enabled: z.boolean().default(true),
  segment: z.string().regex(/^[a-z0-9-]+$/, 'url segment, kebab-case'),
});

export const buildSiteSchema = (image: ImageFn) =>
  z
    .object({
      locale: localeSchema,

      brand: z.object({
        name: z.string().min(1),
        legalName: z.string().optional(),
        tagline: z.string().optional(),
        logo: z.object({
          light: mediaSchema(image),
          /** Falls back to `light` when absent. */
          dark: mediaSchema(image).optional(),
        }),
      }),

      contact: z.object({
        email: z.email(),
        phone: z.string().optional(),
        /** Digits with country code, no plus sign. */
        whatsapp: z
          .string()
          .regex(/^\d{10,15}$/)
          .optional(),
        /** street and zip are optional: a studio can name its city without publishing where it works. */
        address: z
          .object({
            street: z.string().optional(),
            city: z.string(),
            state: z.string(),
            zip: z.string().optional(),
            country: z.string().length(2),
          })
          .optional(),
        geo: z.object({ lat: z.number(), lng: z.number() }).optional(),
        /** schema.org format: "Mo-Fr 09:00-18:00". */
        openingHours: z.array(z.string()).default([]),
      }),

      // Not an enum: a client's networks are not the blueprint's to enumerate, and
      // adding one used to mean editing a component. `platform` is the accessible
      // label and picks a default icon; `icon` overrides it for the networks
      // lucide has no brand mark for. See src/lib/social.ts.
      social: z
        .array(
          z.object({
            platform: z.string().min(1),
            url: webUrlSchema,
            icon: iconSchema.optional(),
          }),
        )
        .default([]),

      seo: z.object({
        defaultTitle: z.string().min(1),
        titleTemplate: z.string().includes('%title%').default('%title% | %brand%'),
        defaultDescription: z.string().min(50).max(165),
        defaultOgImage: z.string().default('/og/default.png'),
        twitterHandle: z.string().startsWith('@').optional(),
        /** og:image:alt for the default image. Falls back to the page title. */
        defaultOgImageAlt: z.string().min(1).optional(),
        robots: z.object({ index: z.boolean().default(true), follow: z.boolean().default(true) }).prefault({}),
        verification: z.record(z.string(), z.string()).default({}),
      }),

      /** Emitted by `npm run assets` into public/. See docs/GUIDES/STATIC_ASSETS.md */
      assets: z
        .object({
          favicon: z.string().default('/favicon.ico'),
          /** Empty when the brand mark is a PNG: there is no scalable source to point at. */
          faviconSvg: z.string().default('/favicon.svg'),
          appleTouchIcon: z.string().default('/apple-touch-icon.png'),
          manifest: z.string().default('/site.webmanifest'),
          maskIconColor: z.string().default('#2563eb'),
          themeColor: z.string().default('#ffffff'),
          themeColorDark: z.string().default('#050505'),
        })
        // prefault, not default: the value is parsed so the inner defaults apply.
        .prefault({}),

      organization: z
        .object({
          /** `Person` is for a personal site: it emits Person and ProfilePage instead of an Organization. */
          type: z.enum(['Organization', 'LocalBusiness', 'ProfessionalService', 'Person']).default('Organization'),
          description: z.string().optional(),
          /** Other names people search for: a handle, the name without accents, a former name. */
          alternateName: z.array(z.string().min(1)).default([]),
          /** Person only. */
          jobTitle: z.string().optional(),
          /** Person only: the company, linked by name and URL, and by `id` to its own Organization graph. */
          worksFor: z.object({ name: z.string().min(1), url: z.url(), id: z.url().optional() }).optional(),
          /** Topics, for the knowledge graph. */
          knowsAbout: z.array(z.string().min(1)).default([]),
          /** Business types only: where it sells, as place names ("México"). Not valid on Person. */
          areaServed: z.array(z.string().min(1)).default([]),
          priceRange: z.string().optional(),
          sameAs: z.array(z.url()).default([]),
          foundingDate: z.string().optional(),
          /** Business types only: tells this brand apart from another with the same name. */
          disambiguatingDescription: z.string().min(1).optional(),
          /** Business types only: links the founder's Person graph by `id` (e.g. "https://ana.dev/#person"). */
          founder: z.object({ id: z.url().optional(), name: z.string().min(1).optional(), url: z.url().optional() }).optional(),
          /** Stable raster logo path ("/logo.png"). Google wants PNG/JPG >= 112px at a fixed URL; the brand SVG is hashed. */
          logo: z.string().min(1).optional(),
          /** Image for the graph ("/og/home.png"). Defaults to the logo. */
          image: z.string().min(1).optional(),
        })
        .prefault({}),

      nav: z.array(linkSchema).default([]),

      footer: z
        .object({
          // title is optional: a flat row of links is a real footer shape, and
          // requiring a heading forced the first clone to invent copy or drop links.
          columns: z
            .array(z.object({ title: z.string().optional(), links: z.array(linkSchema).min(1) }))
            .default([]),
          legalLinks: z.array(linkSchema).default([]),
          /** `%year%` and `%brand%` are substituted at build time. */
          copyright: z.string().default('© %year% %brand%.'),
          credit: z
            .object({ label: z.string(), href: webUrlSchema })
            .nullable()
            .default({ label: 'Iteris', href: 'https://iteris.tech' }),
        })
        // prefault on every all-defaults group: omitting it must behave the same
        // as passing {}, otherwise "optional" is only true one level deep.
        .prefault({}),

      features: z
        .object({
          darkMode: z.boolean().default(true),
          defaultTheme: z.enum(['light', 'dark', 'system']).default('system'),
          showThemeToggle: z.boolean().default(true),
          scrollLayout: z.enum(['flow', 'snap']).default('flow'),
          showLocaleSwitcher: z.boolean().default(true),
          /** Frosted sticky header. Off by default: backdrop-filter repaints the
              strip behind the header on every scroll frame. */
          headerBlur: z.boolean().default(false),
          /** Instant floating contact button (WhatsApp, Telegram, Phone, Email). */
          floatingContact: z
            .object({
              enabled: z.boolean().default(false),
              platform: z.enum(['whatsapp', 'telegram', 'phone', 'email', 'custom']).default('whatsapp'),
              /** `custom` renders verbatim as the button href — hence the URL rule. */
              target: safeUrlSchema.optional(),
              message: z.string().optional(),
              label: z.string().default('Contact'),
            })
            .prefault({}),
          /** Sticky CTA bar pinned to bottom on mobile viewport. */
          stickyMobileCta: z
            .object({
              enabled: z.boolean().default(false),
              label: z.string().default('Contact'),
              href: safeUrlSchema.default('/contact'),
              icon: iconSchema.optional(),
            })
            .prefault({}),
        })
        .prefault({}),

      /** Analytics configuration. Takes priority over PUBLIC_ANALYTICS_* env vars. */
      analytics: z
        .object({
          provider: z.enum(['none', 'vercel', 'plausible', 'umami', 'ga4']).default('none'),
          websiteId: z.string().optional(),
          /** Injected as a <script> src: https only, never a bare protocol swap. */
          scriptUrl: httpsUrlSchema.optional(),
          domain: z.string().optional(),
        })
        .prefault({}),

      /** Transport only. URLs and keys live in env, never in content. */
      contactForm: z
        .object({
          provider: z.enum(['mailto', 'external', 'endpoint']).default('mailto'),
          endpoint: safeUrlSchema.optional(),
          honeypotField: z.string().default('company_website'),
          /** Passed to location.assign in the island, so it follows the URL rule. */
          redirectTo: safeUrlSchema.optional(),
        })
        .prefault({}),

      /**
       * Open on purpose. A key names a content file and is shared across locales;
       * `segment` is the public URL piece and is translated per locale. Adding a
       * page a landing needs is content, not a code change -- a closed list made a
       * clone edit the blueprint to get a fourth page, which cost it every future
       * upgrade. Two keys are reserved: `updates` and `projects` render listings.
       * Spec: docs/ARCHITECTURE/ROUTING.md
       */
      routes: z.record(
        z.string().regex(/^[a-z][a-z0-9-]*$/, 'route key: lowercase, kebab-case, English'),
        routeSchema,
      ),
    })
    .superRefine((cfg, ctx) => {
      // Only a business with premises needs an address; a Person or plain Organization does not.
      if (!['Organization', 'Person'].includes(cfg.organization.type) && !cfg.contact.address) {
        ctx.addIssue({
          code: 'custom',
          path: ['contact', 'address'],
          message: `organization.type="${cfg.organization.type}" requires contact.address for LocalBusiness JSON-LD.`,
        });
      }
      if (cfg.analytics.provider === 'ga4' && !/^G-[A-Z0-9]+$/.test(cfg.analytics.websiteId ?? '')) {
        ctx.addIssue({
          code: 'custom',
          path: ['analytics', 'websiteId'],
          message: 'analytics.provider="ga4" requires a measurement id as websiteId (G-XXXXXXXXXX).',
        });
      }
      if (cfg.contactForm.provider === 'endpoint' && !cfg.contactForm.endpoint) {
        ctx.addIssue({
          code: 'custom',
          path: ['contactForm', 'endpoint'],
          message: 'contactForm.provider="endpoint" requires contactForm.endpoint.',
        });
      }
      // `index` has no segment -- it is the locale root -- so declaring it would
      // create a page that can never be reached.
      if ('index' in cfg.routes) {
        ctx.addIssue({
          code: 'custom',
          path: ['routes', 'index'],
          message: 'The home page is implicit and has no segment. Remove `index` from routes.',
        });
      }
      const segments = new Set<string>();
      for (const [key, route] of Object.entries(cfg.routes)) {
        if (segments.has(route.segment)) {
          ctx.addIssue({
            code: 'custom',
            path: ['routes', key, 'segment'],
            message: `Duplicate segment "${route.segment}": two routes would build to the same URL.`,
          });
        }
        segments.add(route.segment);
      }
      if (cfg.features.showThemeToggle && !cfg.features.darkMode) {
        ctx.addIssue({
          code: 'custom',
          path: ['features', 'showThemeToggle'],
          message: 'showThemeToggle requires features.darkMode enabled.',
        });
      }
    });
