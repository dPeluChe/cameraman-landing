// Title/canonical resolution and JSON-LD builders.
// What each graph is for: docs/ARCHITECTURE/SEO.md
import type { SiteEntry } from './content';
import { resolveTemplate } from './content';
import { htmlLang, type Locale } from './i18n';

export function pageTitle(site: SiteEntry, title?: string): string {
  if (!title) return site.seo.defaultTitle;
  // "Ana Ruiz, Designer | Ana Ruiz" wastes the half of the title a result shows.
  if (title.toLowerCase().includes(site.brand.name.toLowerCase())) return title;
  return resolveTemplate(site.seo.titleTemplate, { title, brand: site.brand.name });
}

/** One place that answers "what is my base URL", for canonical, OG and JSON-LD. */
export function siteBase(astro: { site?: URL | undefined; url: URL }): URL {
  return astro.site ?? new URL(astro.url.origin);
}

export function robotsContent(site: SiteEntry, noindex: boolean): string {
  const index = noindex || !site.seo.robots.index ? 'noindex' : 'index';
  const follow = site.seo.robots.follow ? 'follow' : 'nofollow';
  return `${index}, ${follow}`;
}

type Json = Record<string, unknown>;

function postalAddress(site: SiteEntry): Json | undefined {
  const a = site.contact.address;
  if (!a) return undefined;
  return {
    '@type': 'PostalAddress',
    streetAddress: a.street,
    addressLocality: a.city,
    addressRegion: a.state,
    postalCode: a.zip,
    addressCountry: a.country,
  };
}

/** A typed reference to another graph: `id` becomes `@id`, the rest is copied. */
function linked(type: string, { id, ...rest }: { id?: string | undefined; [key: string]: unknown }): Json {
  return { '@type': type, ...(id ? { '@id': id } : {}), ...rest };
}

/** The `@id` every other graph points at as publisher or author. */
export function ownerId(site: SiteEntry, origin: string): string {
  return `${origin}/#${site.organization.type === 'Person' ? 'person' : 'organization'}`;
}

/** Organization, LocalBusiness or Person depending on site.organization.type. */
export function organizationJsonLd(site: SiteEntry, origin: string, brandLogoUrl: string): Json {
  const { organization: org, contact } = site;
  const logoUrl = org.logo ? new URL(org.logo, origin).href : brandLogoUrl;
  const imageUrl = org.image ? new URL(org.image, origin).href : logoUrl;
  const sameAs = [...new Set([...org.sameAs, ...site.social.map((s) => s.url)])];

  if (org.type === 'Person') {
    return {
      '@context': 'https://schema.org',
      '@type': 'Person',
      '@id': ownerId(site, origin),
      name: site.brand.name,
      ...(org.alternateName.length ? { alternateName: org.alternateName } : {}),
      url: origin,
      image: imageUrl,
      description: org.description ?? site.seo.defaultDescription,
      email: contact.email,
      sameAs,
      ...(org.jobTitle ? { jobTitle: org.jobTitle } : {}),
      ...(org.worksFor ? { worksFor: linked('Organization', org.worksFor) } : {}),
      ...(org.knowsAbout.length ? { knowsAbout: org.knowsAbout } : {}),
      ...(postalAddress(site) ? { address: postalAddress(site) } : {}),
    };
  }

  const base: Json = {
    '@context': 'https://schema.org',
    '@type': org.type,
    '@id': `${origin}/#organization`,
    name: site.brand.name,
    // Only when declared: defaulting to the brand name publishes a legal name nobody gave.
    ...(site.brand.legalName ? { legalName: site.brand.legalName } : {}),
    ...(org.alternateName.length ? { alternateName: org.alternateName } : {}),
    url: origin,
    logo: logoUrl,
    image: imageUrl,
    description: org.description ?? site.seo.defaultDescription,
    email: contact.email,
    sameAs,
  };

  if (org.disambiguatingDescription) base.disambiguatingDescription = org.disambiguatingDescription;
  if (org.founder) base.founder = linked('Person', org.founder);
  if (org.knowsAbout.length) base.knowsAbout = org.knowsAbout;

  if (contact.phone) base.telephone = contact.phone;
  if (org.foundingDate) base.foundingDate = org.foundingDate;

  const address = postalAddress(site);
  if (address) base.address = address;
  if (org.areaServed.length) base.areaServed = org.areaServed;

  if (org.type !== 'Organization') {
    if (contact.geo) {
      base.geo = { '@type': 'GeoCoordinates', latitude: contact.geo.lat, longitude: contact.geo.lng };
    }
    if (contact.openingHours.length) base.openingHours = contact.openingHours;
    if (org.priceRange) base.priceRange = org.priceRange;
  } else {
    base.contactPoint = {
      '@type': 'ContactPoint',
      email: contact.email,
      ...(contact.phone ? { telephone: contact.phone } : {}),
      contactType: 'sales',
    };
  }

  return base;
}

export function websiteJsonLd(site: SiteEntry, origin: string, locale: Locale): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${origin}/#website`,
    url: origin,
    name: site.brand.name,
    ...(site.organization.alternateName.length ? { alternateName: site.organization.alternateName } : {}),
    inLanguage: htmlLang(locale),
    publisher: { '@id': ownerId(site, origin) },
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function faqJsonLd(items: { question: string; answer: string }[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

export function articleJsonLd(input: {
  title: string;
  description: string;
  url: string;
  image: string;
  datePublished: Date;
  dateModified?: Date;
  origin: string;
  locale: Locale;
  /** ownerId(): the person or organization that wrote it. */
  owner: string;
}): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: input.title,
    description: input.description,
    image: input.image,
    inLanguage: htmlLang(input.locale),
    datePublished: input.datePublished.toISOString(),
    dateModified: (input.dateModified ?? input.datePublished).toISOString(),
    mainEntityOfPage: { '@type': 'WebPage', '@id': input.url },
    author: { '@id': input.owner },
    publisher: { '@id': input.owner },
  };
}
