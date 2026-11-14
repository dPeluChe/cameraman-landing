// The schema is the contract a CMS must satisfy, so these tests assert what it
// REJECTS as much as what it accepts. A rule that stops failing is a hole.
import { describe, expect, it } from 'vitest';
import { z } from 'astro/zod';
import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { buildSectionSchema } from '../src/schemas/sections';
import { defaultLocale } from '../src/lib/i18n';
import { buildSiteSchema } from '../src/schemas/site';
import { iconSchema, seoSchema } from '../src/schemas/primitives';
import { socialIcon } from '../src/lib/social';

// Stands in for Astro's image() helper, which only exists inside a content config.
const image = () => z.string() as unknown as ReturnType<Parameters<typeof buildSiteSchema>[0]>;
const siteSchema = buildSiteSchema(image as never);
const sectionSchema = buildSectionSchema(image as never);

const baseSite = {
  locale: defaultLocale,
  brand: { name: 'Acme', logo: { light: { src: 'logo.svg', alt: 'Acme' } } },
  contact: { email: 'hi@acme.test' },
  seo: {
    defaultTitle: 'Acme',
    defaultDescription: 'A description that is comfortably longer than the fifty character minimum.',
  },
  organization: { type: 'Organization' as const },
  features: {},
  contactForm: {},
  routes: {
    services: { segment: 'servicios' },
    about: { segment: 'nosotros' },
    updates: { segment: 'novedades' },
    projects: { segment: 'proyectos' },
    contact: { segment: 'contacto' },
  },
};

const issuePaths = (result: z.ZodSafeParseResult<unknown>) =>
  result.success ? [] : result.error.issues.map((issue) => issue.path.join('.'));

describe('site config', () => {
  it('accepts a minimal valid config and applies defaults', () => {
    const parsed = siteSchema.parse(baseSite);
    expect(parsed.features.darkMode).toBe(true);
    expect(parsed.seo.titleTemplate).toBe('%title% | %brand%');
    expect(parsed.assets.favicon).toBe('/favicon.ico');
    expect(parsed.seo.robots).toEqual({ index: true, follow: true });
    expect(parsed.footer.credit).toEqual({ label: 'Iteris', href: 'https://iteris.tech' });
  });

  it('rejects LocalBusiness without an address', () => {
    const result = siteSchema.safeParse({ ...baseSite, organization: { type: 'LocalBusiness' } });
    expect(issuePaths(result)).toContain('contact.address');
  });

  it('accepts a Person without an address', () => {
    const result = siteSchema.safeParse({ ...baseSite, organization: { type: 'Person' } });
    expect(result.success, JSON.stringify(result.error?.issues)).toBe(true);
  });

  it('accepts LocalBusiness once an address is present', () => {
    const result = siteSchema.safeParse({
      ...baseSite,
      organization: { type: 'LocalBusiness' },
      contact: {
        ...baseSite.contact,
        address: { street: 'A 1', city: 'CDMX', state: 'CDMX', zip: '01000', country: 'MX' },
      },
    });
    expect(result.success).toBe(true);
  });

  it('accepts Person without an address', () => {
    const result = siteSchema.safeParse({ ...baseSite, organization: { type: 'Person' } });
    expect(result.success).toBe(true);
  });

  it('accepts an address with only city, state and country', () => {
    const result = siteSchema.safeParse({
      ...baseSite,
      contact: { ...baseSite.contact, address: { city: 'Zapopan', state: 'Jalisco', country: 'MX' } },
    });
    expect(result.success).toBe(true);
  });

  it('accepts a founder linked by id and a disambiguating description', () => {
    const parsed = siteSchema.parse({
      ...baseSite,
      organization: {
        type: 'Organization',
        disambiguatingDescription: 'Not the other Acme.',
        founder: { id: 'https://ana.test/#person' },
        logo: '/logo.png',
      },
    });
    expect(parsed.organization.founder?.id).toBe('https://ana.test/#person');
  });

  it('rejects a founder id that is not a URL', () => {
    const result = siteSchema.safeParse({ ...baseSite, organization: { type: 'Organization', founder: { id: 'ana' } } });
    expect(issuePaths(result)).toContain('organization.founder.id');
  });

  it('rejects the endpoint provider without an endpoint', () => {
    const result = siteSchema.safeParse({ ...baseSite, contactForm: { provider: 'endpoint' } });
    expect(issuePaths(result)).toContain('contactForm.endpoint');
  });

  it('rejects a theme toggle with dark mode disabled', () => {
    const result = siteSchema.safeParse({
      ...baseSite,
      features: { darkMode: false, showThemeToggle: true },
    });
    expect(issuePaths(result)).toContain('features.showThemeToggle');
  });

  it('rejects a title template missing the %title% placeholder', () => {
    const result = siteSchema.safeParse({
      ...baseSite,
      // The old syntax is the realistic mistake now, not a random string.
      seo: { ...baseSite.seo, titleTemplate: '%s | %brand%' },
    });
    expect(issuePaths(result)).toContain('seo.titleTemplate');
  });

  it('rejects a country that is not a 2-letter code', () => {
    const result = siteSchema.safeParse({
      ...baseSite,
      contact: {
        ...baseSite.contact,
        address: { street: 'A 1', city: 'CDMX', state: 'CDMX', zip: '01000', country: 'MEX' },
      },
    });
    expect(issuePaths(result)).toContain('contact.address.country');
  });

  it('rejects a url segment that is not kebab-case', () => {
    const result = siteSchema.safeParse({
      ...baseSite,
      routes: { ...baseSite.routes, services: { segment: 'Our Services' } },
    });
    expect(issuePaths(result)).toContain('routes.services.segment');
  });

  // Open routes make two new mistakes possible that an enum made unrepresentable.
  it('rejects a route named index, which could never be reached', () => {
    const result = siteSchema.safeParse({
      ...baseSite,
      routes: { ...baseSite.routes, index: { segment: 'inicio' } },
    });
    expect(issuePaths(result)).toContain('routes.index');
  });

  it('rejects two routes claiming the same segment', () => {
    const result = siteSchema.safeParse({
      ...baseSite,
      routes: { ...baseSite.routes, presence: { segment: 'contacto' } },
    });
    expect(issuePaths(result).join()).toContain('presence.segment');
  });

  it('accepts a route key the blueprint never defined', () => {
    const result = siteSchema.safeParse({
      ...baseSite,
      routes: { ...baseSite.routes, presence: { segment: 'presencia' } },
    });
    expect(result.success, issuePaths(result).join(', ')).toBe(true);
  });
});

describe('page seo', () => {
  it('rejects a description shorter than 50 characters', () => {
    const result = seoSchema.safeParse({ title: 'T', description: 'too short' });
    expect(issuePaths(result)).toContain('description');
  });

  it('rejects a title longer than 70 characters', () => {
    const result = seoSchema.safeParse({
      title: 'x'.repeat(71),
      description: 'A description that is comfortably longer than the fifty character minimum.',
    });
    expect(issuePaths(result)).toContain('title');
  });
});

describe('sections', () => {
  it('rejects an unknown section type', () => {
    expect(sectionSchema.safeParse({ type: 'carousel', title: 'x' }).success).toBe(false);
  });

  it('rejects a hero without a title', () => {
    expect(sectionSchema.safeParse({ type: 'hero', subtitle: 'x' }).success).toBe(false);
  });

  // A shape check passed "shield-checkk" and the section shipped a blank slot.
  it.each(['ShieldCheck', 'shield-checkk'])('rejects the icon %s', (icon) => {
    const result = sectionSchema.safeParse({
      type: 'services',
      title: 'Services',
      items: [{ icon, title: 'a', description: 'b' }],
    });
    expect(issuePaths(result).join()).toContain('icon');
  });

  it('accepts an icon that exists in the lucide set', () => {
    const result = sectionSchema.safeParse({
      type: 'services',
      title: 'Services',
      items: [{ icon: 'shield-check', title: 'a', description: 'b' }],
    });
    expect(result.success).toBe(true);
  });

  it('rejects a stats section with fewer than two items', () => {
    const result = sectionSchema.safeParse({
      type: 'stats',
      items: [{ value: '1', label: 'one' }],
    });
    expect(issuePaths(result)).toContain('items');
  });

  it('rejects media without alt text', () => {
    const result = sectionSchema.safeParse({
      type: 'hero',
      title: 'T',
      media: { src: 'a.png' },
    });
    expect(issuePaths(result).join()).toContain('alt');
  });

  it('rejects a youtube id of the wrong length', () => {
    const result = sectionSchema.safeParse({
      type: 'features',
      title: 'F',
      youtubeId: 'tooshort',
      items: [{ icon: 'wrench', title: 'a', description: 'b' }],
    });
    expect(issuePaths(result)).toContain('youtubeId');
  });

  it('defaults enabled to true and faq jsonLd to true', () => {
    const parsed = sectionSchema.parse({
      type: 'faq',
      title: 'FAQ',
      items: [
        { question: 'a', answer: 'b' },
        { question: 'c', answer: 'd' },
      ],
    });
    expect(parsed.enabled).toBe(true);
    expect(parsed.type === 'faq' && parsed.jsonLd).toBe(true);
  });

  it('accepts hero layout variants', () => {
    for (const layout of ['centered', 'split-left', 'split-right'] as const) {
      const parsed = sectionSchema.parse({
        type: 'hero',
        title: 'Hero Title',
        layout,
      });
      expect(parsed.type === 'hero' && parsed.layout).toBe(layout);
    }
  });

  it('accepts pricing with billingToggle and yearlyPrice', () => {
    const parsed = sectionSchema.parse({
      type: 'pricing',
      title: 'Pricing',
      billingToggle: { monthlyLabel: 'Mes', yearlyLabel: 'Año', discountNote: '-20%' },
      plans: [
        {
          name: 'Pro',
          price: '$20',
          period: 'mo',
          yearlyPrice: '$200',
          periodYearly: 'yr',
          features: ['Feature 1'],
          action: { label: 'Start', href: '/start' },
        },
      ],
    });
    expect(parsed.type === 'pricing' && parsed.billingToggle?.discountNote).toBe('-20%');
  });

  it('accepts comparison section', () => {
    const parsed = sectionSchema.parse({
      type: 'comparison',
      title: 'Compare plans',
      headers: ['Feature', 'Starter', 'Pro'],
      rows: [
        { feature: 'Support', values: ['Email', '24/7 Phone'] },
        { feature: 'Custom domain', values: [false, true] },
      ],
    });
    expect(parsed.type === 'comparison' && parsed.rows.length).toBe(2);
  });

  it('accepts timeline section', () => {
    const parsed = sectionSchema.parse({
      type: 'timeline',
      title: 'Our Journey',
      items: [
        { title: 'Founded', description: 'Started the journey in 2024', date: '2024' },
        { title: 'Launch', description: 'Launched v1.0 to public', date: '2025' },
      ],
    });
    expect(parsed.type === 'timeline' && parsed.items.length).toBe(2);
  });

  it('accepts bento section with colSpan and rowSpan', () => {
    const parsed = sectionSchema.parse({
      type: 'bento',
      title: 'Our Features',
      items: [
        { title: 'Feature 1', description: 'Desc 1', icon: 'zap', colSpan: 2 },
        { title: 'Feature 2', description: 'Desc 2', icon: 'cpu', colSpan: 1 },
      ],
    });
    expect(parsed.type === 'bento' && parsed.items.length).toBe(2);
  });
});

// hrefs and script srcs are the one place CMS content becomes markup, so these
// refuse every scheme that can execute — in any case or encoding.
describe('content URL rules', () => {
  const cta = (href: string) => ({ type: 'cta', title: 'T', actions: [{ label: 'A', href }] });

  it.each(['javascript:alert(1)', 'JaVaScript:alert(1)', 'jav&#x09;ascript:alert(1)', 'data:text/html,x', 'vbscript:x'])(
    'rejects the link href %j',
    (href) => expect(sectionSchema.safeParse(cta(href)).success).toBe(false),
  );

  it.each(['/contacto', '#form', 'mailto:hi@x.dev', 'tel:+521555123456', 'https://x.dev', 'nosotros/equipo'])(
    'accepts the link href %j',
    (href) => expect(sectionSchema.safeParse(cta(href)).success).toBe(true),
  );

  it.each(['javascript:alert(1)', 'data:x', 'https://stats.example.com/embed', 'http://www.openstreetmap.org/export/embed.html?bbox=1'])(
    'rejects the mapEmbedUrl %j',
    (url) => expect(sectionSchema.safeParse({ type: 'location', title: 'T', mapEmbedUrl: url }).success).toBe(false),
  );

  it.each(['https://www.openstreetmap.org/export/embed.html?bbox=1', 'https://www.google.com/maps/embed?pb=1'])(
    'accepts the map embed %j',
    (url) => expect(sectionSchema.safeParse({ type: 'location', title: 'T', mapEmbedUrl: url }).success).toBe(true),
  );

  it.each(['javascript:alert(1)', 'data:x'])('rejects redirectTo %j', (redirectTo) => {
    const result = siteSchema.safeParse({ ...baseSite, contactForm: { redirectTo } });
    expect(issuePaths(result)).toContain('contactForm.redirectTo');
  });

  it('rejects a floating custom target of javascript:', () => {
    const result = siteSchema.safeParse({
      ...baseSite,
      features: { floatingContact: { enabled: true, platform: 'custom', target: 'javascript:alert(1)' } },
    });
    expect(issuePaths(result)).toContain('features.floatingContact.target');
  });

  it('rejects an analytics scriptUrl that is not https', () => {
    for (const scriptUrl of ['http://stats.example.com/s.js', 'javascript:alert(1)', '//stats.example.com/s.js']) {
      const result = siteSchema.safeParse({
        ...baseSite,
        analytics: { provider: 'umami', websiteId: 'w', scriptUrl },
      });
      expect(issuePaths(result), scriptUrl).toContain('analytics.scriptUrl');
    }
  });

  it('rejects ga4 without a real measurement id', () => {
    for (const analytics of [{ provider: 'ga4' }, { provider: 'ga4', websiteId: "x');alert(1);//" }, { provider: 'ga4', websiteId: 'g-abc123' }]) {
      const result = siteSchema.safeParse({ ...baseSite, analytics });
      expect(issuePaths(result), JSON.stringify(analytics)).toContain('analytics.websiteId');
    }
    expect(siteSchema.safeParse({ ...baseSite, analytics: { provider: 'ga4', websiteId: 'G-AB12CD34' } }).success).toBe(true);
  });

  it('rejects a script-capable social url', () => {
    const result = siteSchema.safeParse({
      ...baseSite,
      social: [{ platform: 'x', url: 'javascript:alert(1)' }],
    });
    expect(result.success).toBe(false);
  });
});

describe('site features & analytics', () => {
  it('accepts site analytics and defaults provider to none', () => {
    const parsed = siteSchema.parse(baseSite);
    expect(parsed.analytics.provider).toBe('none');

    const withUmami = siteSchema.parse({
      ...baseSite,
      analytics: {
        provider: 'umami',
        websiteId: '12345',
        scriptUrl: 'https://stats.example.com/script.js',
      },
    });
    expect(withUmami.analytics.provider).toBe('umami');
    expect(withUmami.analytics.websiteId).toBe('12345');
  });

  it('accepts floatingContact configuration', () => {
    const parsed = siteSchema.parse({
      ...baseSite,
      features: {
        ...baseSite.features,
        floatingContact: {
          enabled: true,
          platform: 'whatsapp',
          target: '5215512345678',
          message: 'Hello!',
        },
      },
    });
    expect(parsed.features.floatingContact.enabled).toBe(true);
    expect(parsed.features.floatingContact.platform).toBe('whatsapp');
  });

  it('accepts stickyMobileCta configuration', () => {
    const parsed = siteSchema.parse({
      ...baseSite,
      features: {
        ...baseSite.features,
        stickyMobileCta: {
          enabled: true,
          label: 'Book call',
          href: '/contact',
          icon: 'phone',
        },
      },
    });
    expect(parsed.features.stickyMobileCta.enabled).toBe(true);
    expect(parsed.features.stickyMobileCta.label).toBe('Book call');
  });
});

// Guards against the demo drifting out of the contract it is supposed to demonstrate.
describe('shipped demo content', () => {
  const contentDir = join(process.cwd(), 'src/content');

  it('every site config parses', async () => {
    const files = await readdir(join(contentDir, 'site'));
    expect(files.length).toBeGreaterThan(0);

    for (const file of files.filter((name) => name.endsWith('.json'))) {
      const raw = JSON.parse(await readFile(join(contentDir, 'site', file), 'utf8'));
      const result = siteSchema.safeParse(raw);
      expect(result.success, `${file}: ${issuePaths(result).join(', ')}`).toBe(true);
    }
  });

  it('every page section parses', async () => {
    const locales = await readdir(join(contentDir, 'pages'));
    let checked = 0;

    for (const locale of locales) {
      for (const file of await readdir(join(contentDir, 'pages', locale))) {
        const raw = JSON.parse(await readFile(join(contentDir, 'pages', locale, file), 'utf8'));
        for (const [index, section] of raw.sections.entries()) {
          const result = sectionSchema.safeParse(section);
          expect(result.success, `${locale}/${file} §${index}: ${issuePaths(result).join(', ')}`).toBe(true);
          checked += 1;
        }
      }
    }

    expect(checked, 'no sections were checked').toBeGreaterThan(0);
  });

  // A project detail is composed from the same sections a page is, so the same
  // contract has to hold there — otherwise half the site is unvalidated.
  it('every project section parses, in every locale', async () => {
    const locales = existsSync(join(contentDir, 'projects')) ? await readdir(join(contentDir, 'projects')) : [];
    let checked = 0;
    let files = 0;

    for (const locale of locales) {
      for (const file of await readdir(join(contentDir, 'projects', locale))) {
        files += 1;
        const raw = JSON.parse(await readFile(join(contentDir, 'projects', locale, file), 'utf8'));
        for (const [index, section] of raw.sections.entries()) {
          const result = sectionSchema.safeParse(section);
          expect(result.success, `${locale}/${file} §${index}: ${issuePaths(result).join(', ')}`).toBe(true);
          checked += 1;
        }
      }
    }

    // No floor on `checked`: a clone with no portfolio yet has an empty
    // collection, and failing it for that would mean the starting point does not
    // pass its own suite. The guard is that files present must parse.
    if (files > 0) expect(checked, 'project files exist but no section was checked').toBeGreaterThan(0);
  });

  // Slugs differ per language, so translationKey is the only thing pairing a
  // project with its counterpart. A typo silently drops the hreflang pair.
  it('pairs every translated project by translationKey', async () => {
    const byLocale = new Map<string, Set<string>>();
    const projectsDir = join(contentDir, 'projects');
    if (!existsSync(projectsDir)) return;

    for (const locale of await readdir(projectsDir)) {
      const keys = new Set<string>();
      for (const file of await readdir(join(contentDir, 'projects', locale))) {
        const raw = JSON.parse(await readFile(join(contentDir, 'projects', locale, file), 'utf8'));
        expect(raw.translationKey, `${locale}/${file} has no translationKey`).toBeTruthy();
        expect(keys.has(raw.translationKey), `${locale}/${file}: duplicate translationKey`).toBe(false);
        keys.add(raw.translationKey);
      }
      byLocale.set(locale, keys);
    }

    const [first, ...rest] = [...byLocale.entries()];
    for (const [locale, keys] of rest) {
      const missing = [...first![1]].filter((key) => !keys.has(key));
      expect(missing, `${locale} is missing translations for: ${missing.join(', ')}`).toHaveLength(0);
    }
  });

  // `npm run reset` seeds placeholders on purpose; this is what stops a clone
  // from shipping while any of them survive.
  it('carries no leftover reset placeholders', async () => {
    const leftovers: string[] = [];

    const walk = async (dir: string) => {
      for (const entry of await readdir(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) await walk(full);
        else if (/\.(json|md)$/.test(entry.name) && (await readFile(full, 'utf8')).includes('TODO')) {
          leftovers.push(full.replace(contentDir, 'src/content'));
        }
      }
    };
    await walk(contentDir);

    expect(leftovers, 'fill these in before shipping').toEqual([]);
  });

  // At most one, not exactly one: a site with no FAQ is valid; two is the bug,
  // because Google devalues duplicate FAQPage markup.
  it('emits FAQPage markup on at most one section per locale', async () => {
    const locales = await readdir(join(contentDir, 'pages'));

    for (const locale of locales) {
      let emitting = 0;
      for (const file of await readdir(join(contentDir, 'pages', locale))) {
        const raw = JSON.parse(await readFile(join(contentDir, 'pages', locale, file), 'utf8'));
        emitting += raw.sections.filter(
          (section: { type: string; jsonLd?: boolean }) => section.type === 'faq' && section.jsonLd !== false,
        ).length;
      }
      expect(emitting, `${locale} emits ${emitting} FAQPage graphs`).toBeLessThanOrEqual(1);
    }
  });
});

// Adding a network used to mean editing an enum AND an icon map inside
// Footer.astro — a code change for a content need, which in a clone means
// owning a layout file forever.
describe('social links', () => {
  const withSocial = (social: unknown[]) => siteSchema.safeParse({ ...baseSite, social });

  it('accepts a platform the blueprint never heard of', () => {
    const result = withSocial([{ platform: 'Threads', url: 'https://threads.net/@x', icon: 'at-sign' }]);
    expect(result.success, issuePaths(result).join(', ')).toBe(true);
  });

  it('rejects an icon that is not a real lucide slug', () => {
    const result = withSocial([{ platform: 'Threads', url: 'https://threads.net/@x', icon: 'threads' }]);
    expect(issuePaths(result).join()).toContain('icon');
  });

  it('rejects a url that is not a url', () => {
    expect(withSocial([{ platform: 'Threads', url: '@x' }]).success).toBe(false);
  });

  it.each([
    [{ platform: 'LinkedIn' }, 'linkedin'],
    [{ platform: 'TikTok', icon: 'music' }, 'music'],
    [{ platform: 'Threads' }, 'link'],
  ])('resolves %o to the %s icon', (item, expected) => {
    expect(socialIcon(item)).toBe(expected);
  });

  it('resolves every default to an icon that exists in lucide', () => {
    for (const platform of ['facebook', 'instagram', 'linkedin', 'x', 'youtube', 'github', 'telegram', 'whatsapp', 'tiktok', 'rss']) {
      const icon = socialIcon({ platform });
      expect(iconSchema.safeParse(icon).success, `${platform} -> ${icon} is not a lucide slug`).toBe(true);
    }
  });
});
