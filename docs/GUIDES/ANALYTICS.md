# Analytics

Off by default. A fresh clone ships **zero** third-party requests until configured.

Implementation: `src/lib/analytics.ts`, injected by `components/seo/BaseHead.astro`.

## Enabling

Analytics can be enabled in `src/content/site/<locale>.json` or via environment variables:

### Option A: Site Config (`src/content/site/<locale>.json`)

```jsonc
"analytics": {
  "provider": "umami", // none | vercel | plausible | umami | ga4
  "websiteId": "your-website-id",
  "scriptUrl": "https://stats.example.com/script.js" // optional for plausible/umami
}
```

### Option B: Environment Variables (`.env`)

```bash
PUBLIC_ANALYTICS_PROVIDER="plausible"   # none | vercel | plausible | umami | ga4
PUBLIC_ANALYTICS_DOMAIN="example.com"
```

If a provider's required values are missing, nothing is injected — a typo
degrades to no analytics, never to a broken page. External script domains automatically receive preconnect hints.

| Provider | Required | Notes |
|---|---|---|
| `vercel` | — | `/_vercel/insights/script.js`. First-party path, no cookie banner, only works on Vercel. |
| `plausible` | `PUBLIC_ANALYTICS_DOMAIN` | `PUBLIC_ANALYTICS_SRC` to override the script URL when self-hosting (`https:` only). No cookies. |
| `umami` | `PUBLIC_ANALYTICS_ID`, `PUBLIC_ANALYTICS_SRC` | Self-hosted; both values come from your instance. The script URL must be `https:`. |
| `ga4` | `PUBLIC_ANALYTICS_ID` | `G-XXXXXXXXXX` — the schema enforces the measurement-id shape, and the lib refuses anything else. Sets cookies — the client needs a banner and a privacy notice. |

## Recommendation

Default to `vercel` when the site is on Vercel: it is first-party, adds no cookie
banner obligation, and costs nothing in Best Practices score. Reach for `plausible`
or `umami` when the client wants numbers they own. Use `ga4` only when the client
explicitly requires it — it is the only option here that drags legal obligations
and a third-party cookie along with it.

## Cost

Every provider costs a request and some parse time. On the demo, adding GA4 is the
difference between a Performance score of 100 and roughly 95. Worth knowing before
promising a number to a client.

## Adding another provider

One `case` in `analyticsScript()` returning `{ src, attrs, inline? }`, plus a row
in the enum. Do not add a provider that needs a `<script>` in `<body>` or a
framework integration — that is a sign it does not belong on a static landing.

## Privacy

If the client enables anything that sets cookies, they need a privacy notice
covering it. The `contactForm` section already has a `privacyNote` field, and the
demo uses a FAQ section on `/contacto` for the data-handling questions. Neither is
legal advice — that is the client's counsel's job.
