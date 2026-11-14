// Opt-in analytics. Off unless PUBLIC_ANALYTICS_PROVIDER says otherwise, so a
// fresh clone ships zero third-party requests. Setup: docs/GUIDES/ANALYTICS.md

export type AnalyticsProvider = 'none' | 'vercel' | 'plausible' | 'umami' | 'ga4';

export interface AnalyticsScript {
  src: string;
  attrs: Record<string, string>;
  /** GA4 needs an inline bootstrap after the loader. */
  inline?: string;
}

export interface SiteAnalyticsConfig {
  provider?: AnalyticsProvider;
  websiteId?: string;
  scriptUrl?: string;
  domain?: string;
}

const env = import.meta.env;

export function analyticsProvider(siteConfig?: SiteAnalyticsConfig): AnalyticsProvider {
  if (siteConfig?.provider && siteConfig.provider !== 'none') {
    return siteConfig.provider;
  }
  const raw = (env.PUBLIC_ANALYTICS_PROVIDER ?? 'none').toString().trim();
  const allowed: AnalyticsProvider[] = ['none', 'vercel', 'plausible', 'umami', 'ga4'];
  return (allowed as string[]).includes(raw) ? (raw as AnalyticsProvider) : 'none';
}

/** Returns null when analytics is off or its required configuration is missing. */
export function analyticsScript(siteConfig?: SiteAnalyticsConfig): AnalyticsScript | null {
  const provider = analyticsProvider(siteConfig);
  const domain = siteConfig?.domain?.trim() || env.PUBLIC_ANALYTICS_DOMAIN?.toString().trim();
  const id = siteConfig?.websiteId?.trim() || env.PUBLIC_ANALYTICS_ID?.toString().trim();
  const src = siteConfig?.scriptUrl?.trim() || env.PUBLIC_ANALYTICS_SRC?.toString().trim();
  // Env vars bypass the schema, so the https rule is enforced here too: a
  // configured src that is not https degrades to no analytics (null), never to
  // an unsafe tag and never to a silent fallback.
  const script = !src ? undefined : src.startsWith('https://') ? src : null;

  switch (provider) {
    case 'vercel':
      return { src: '/_vercel/insights/script.js', attrs: { defer: '' } };

    case 'plausible': {
      if (!domain || script === null) return null;
      return {
        src: script ?? 'https://plausible.io/js/script.js',
        attrs: { defer: '', 'data-domain': domain },
      };
    }

    case 'umami':
      if (!id || !script) return null;
      return { src: script, attrs: { defer: '', 'data-website-id': id } };

    case 'ga4':
      // The id lands in both the src query and an inline script, so it must be
      // a measurement id and nothing else — content and env both reach this line.
      if (!id || !/^G-[A-Z0-9]+$/.test(id)) return null;
      return {
        src: `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`,
        attrs: { async: '' },
        inline: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config',${JSON.stringify(id)});`,
      };

    default:
      return null;
  }
}

