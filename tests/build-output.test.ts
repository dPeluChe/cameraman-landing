// Asserts the shipped HTML, not the source. Catches regressions that type
// checking cannot see: a lost canonical, a second h1, a broken internal link.
// Skipped when dist/ is absent so `npm test` works without a build.
import { beforeAll, describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { readFile, readdir, stat } from "node:fs/promises";
import { join, relative } from "node:path";
import { loadEnv } from "vite";
import { defaultLocale, locales } from "../src/lib/i18n";
import { resolveSiteUrl } from "../src/lib/site-url.mjs";

const DIST = join(process.cwd(), "dist");
// Same resolution as astro.config.mjs, .env included. Hardcoding example.com made
// these pass only while SITE_URL was unset; reading process.env alone made them
// fail when SITE_URL lived only in .env, which the build does read.
const env = {
  ...loadEnv(process.env.NODE_ENV ?? "production", process.cwd(), ""),
  ...process.env,
};
const ORIGIN = resolveSiteUrl(env);
const built = existsSync(DIST);

/** Most recent mtime under a path, or 0 if it does not exist. */
async function newestMtime(path: string): Promise<number> {
  if (!existsSync(path)) return 0;
  const info = await stat(path);
  if (!info.isDirectory()) return info.mtimeMs;

  let newest = 0;
  for (const entry of await readdir(path, { withFileTypes: true })) {
    newest = Math.max(newest, await newestMtime(join(path, entry.name)));
  }
  return newest;
}

// Absent dist is honest — you never built, and the suite skips. Stale dist LIES:
// these assertions would pass against an artifact that no longer matches src/,
// which is a green that means nothing. Edit content, run tests, ship the old build.
const SOURCES = ["src", "astro.config.mjs"].map((p) => join(process.cwd(), p));
const staleBy = built
  ? Math.max(...(await Promise.all(SOURCES.map(newestMtime)))) -
    (await newestMtime(DIST))
  : 0;

async function htmlFiles(dir: string): Promise<string[]> {
  const out: string[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await htmlFiles(full)));
    else if (entry.name.endsWith(".html")) out.push(full);
  }
  return out;
}

const routeOf = (file: string) =>
  `/${relative(DIST, file)
    .replace(/(index)?\.html$/, "")
    .replace(/\/$/, "")}`;

const siteConfig = async (locale: string) =>
  JSON.parse(
    await readFile(
      join(process.cwd(), "src/content/site", `${locale}.json`),
      "utf8",
    ),
  );

/** Expected routes come from site config, not from the demo's copy. */
async function expectedRoutes(): Promise<string[]> {
  const dir = join(process.cwd(), "src/content/site");
  const routes: string[] = [];

  for (const file of await readdir(dir)) {
    if (!file.endsWith(".json")) continue;
    const locale = file.replace(".json", "");
    const prefix = locale === defaultLocale ? "" : `/${locale}`;
    const site = JSON.parse(await readFile(join(dir, file), "utf8"));

    routes.push(prefix || "/");
    for (const route of Object.values(site.routes) as {
      enabled: boolean;
      segment: string;
    }[]) {
      if (route.enabled) routes.push(`${prefix}/${route.segment}`);
    }
  }
  return routes;
}
const matches = (html: string, re: RegExp) => html.match(re) ?? [];

/**
 * Only the root is normalized, and only because RFC 3986 says an empty path and
 * "/" are the same resource. @astrojs/sitemap emits both forms in one file — it
 * strips the slash from <loc> and keeps it in the alternates — and neither is
 * reachable through its API. Every other path is compared exactly.
 */
const sameUrl = (a: string, b: string) =>
  a.replace(/\/$/, "") === b.replace(/\/$/, "");

describe.skipIf(!built)("built pages", () => {
  beforeAll(() => {
    if (staleBy > 0) {
      throw new Error(
        `dist/ is ${Math.round(staleBy / 1000)}s older than src/ — run \`npm run build\`. ` +
          "These assertions read the built HTML, so a stale dist/ would report on code that is no longer there.",
      );
    }
  });

  it("builds every locale and enabled route", async () => {
    const built = (await htmlFiles(DIST)).map(routeOf);
    for (const route of await expectedRoutes()) {
      expect(built, `missing ${route}`).toContain(route);
    }
  });

  // Lighthouse scores SEO 100 for a <title> that literally says "%s" — it checks
  // the tag exists, not that it means anything. This is what catches that.
  it("leaves no unsubstituted %placeholder% in the head", async () => {
    const leftovers: string[] = [];

    for (const file of await htmlFiles(DIST)) {
      const head =
        (await readFile(file, "utf8")).match(/<head>[\s\S]*?<\/head>/)?.[0] ??
        "";
      for (const [token] of head.matchAll(/%[a-z]+%/gi))
        leftovers.push(`${routeOf(file)}: ${token}`);
    }

    expect(leftovers).toEqual([]);
  });

  it("gives every page exactly one h1", async () => {
    for (const file of await htmlFiles(DIST)) {
      expect(
        matches(await readFile(file, "utf8"), /<h1[\s>]/g).length,
        `${routeOf(file)}`,
      ).toBe(1);
    }
  });

  it("gives every page a canonical, a description and an OG image", async () => {
    for (const file of await htmlFiles(DIST)) {
      const html = await readFile(file, "utf8");
      const route = routeOf(file);
      const noindex = /<meta name="robots" content="noindex/.test(html);
      const canonicals = matches(html, /<link rel="canonical"/g).length;
      // noindex pages drop it; a site-wide pre-launch noindex keeps it.
      if (noindex) expect(canonicals, route).toBeLessThanOrEqual(1);
      else expect(canonicals, route).toBe(1);
      expect(html, route).toMatch(/<meta name="description" content=".{50,}?"/);
      expect(html, route).toContain('property="og:image"');
    }
  });

  it("emits the organization and website graphs on every page", async () => {
    for (const file of await htmlFiles(DIST)) {
      const html = await readFile(file, "utf8");
      expect(html, routeOf(file)).toContain('"@type":"WebSite"');
      expect(html, routeOf(file)).toMatch(
        /"@type":"(Organization|LocalBusiness|ProfessionalService|Person)"/,
      );
    }
  });

  it("emits JSON-LD that cannot close its own script tag, with unique sameAs", async () => {
    for (const file of await htmlFiles(DIST)) {
      const html = await readFile(file, "utf8");
      for (const [, body] of html.matchAll(
        /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
      )) {
        expect(body, `${routeOf(file)}: raw < inside JSON-LD`).not.toContain(
          "<",
        );
        const sameAs =
          (JSON.parse(body!) as { sameAs?: string[] }).sameAs ?? [];
        expect(new Set(sameAs).size, `${routeOf(file)}: duplicate sameAs`).toBe(
          sameAs.length,
        );
      }
    }
  });

  it("emits FAQPage on at most one page per locale", async () => {
    const perLocale = new Map<string, string[]>();

    for (const file of await htmlFiles(DIST)) {
      if (!(await readFile(file, "utf8")).includes('"@type":"FAQPage"'))
        continue;
      const route = routeOf(file);
      const segment = route.split("/")[1] ?? "";
      const locale = (locales as readonly string[]).includes(segment)
        ? segment
        : defaultLocale;
      perLocale.set(locale, [...(perLocale.get(locale) ?? []), route]);
    }

    for (const [locale, pages] of perLocale) {
      expect(
        pages,
        `${locale} emits FAQPage on ${pages.length} pages`,
      ).toHaveLength(1);
    }
  });

  it("translates the segment in hreflang instead of only the prefix", async () => {
    const dir = join(process.cwd(), "src/content/site");
    const other = locales.find((locale) => locale !== defaultLocale);
    if (!other) return; // single-locale site: there is no alternate to translate

    const es = JSON.parse(
      await readFile(join(dir, `${defaultLocale}.json`), "utf8"),
    );
    const en = JSON.parse(await readFile(join(dir, `${other}.json`), "utf8"));

    // Only meaningful where the two locales disagree on the segment.
    const key = (["contact", "about", "services"] as const).find(
      (k) =>
        es.routes[k].enabled &&
        en.routes[k].enabled &&
        es.routes[k].segment !== en.routes[k].segment,
    );
    if (!key) return;

    const html = await readFile(
      join(DIST, es.routes[key].segment, "index.html"),
      "utf8",
    );
    expect(html).toContain(
      `href="${ORIGIN}/${other}/${en.routes[key].segment}"`,
    );
    expect(html).not.toContain(`/${other}/${es.routes[key].segment}`);
  });

  it("resolves every internal link to a built page", async () => {
    const routes = new Set((await htmlFiles(DIST)).map(routeOf));
    const broken: string[] = [];

    for (const file of await htmlFiles(DIST)) {
      const html = await readFile(file, "utf8");
      for (const match of html.matchAll(/href="(\/[^"#?]*)(?:#[^"]*)?"/g)) {
        const href = match[1]!.replace(/\/$/, "") || "/";
        if (href.startsWith("/_astro") || /\.[a-z0-9]+$/i.test(href)) continue;
        if (!routes.has(href)) broken.push(`${routeOf(file)} -> ${href}`);
      }
    }

    expect(broken).toEqual([]);
  });

  // A nav link to a missing #anchor scrolls nowhere instead of failing anything —
  // a silently broken CTA. Anchors are per-locale content, so nothing else catches it.
  it("resolves every in-page anchor to an id that exists on the target page", async () => {
    const files = await htmlFiles(DIST);
    const idsByRoute = new Map<string, Set<string>>();

    for (const file of files) {
      const html = await readFile(file, "utf8");
      idsByRoute.set(
        routeOf(file),
        new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]!)),
      );
    }

    const broken: string[] = [];
    for (const file of files) {
      const from = routeOf(file);
      const html = await readFile(file, "utf8");

      for (const match of html.matchAll(/href="([^"]*)#([^"]+)"/g)) {
        const [, path, fragment] = match as unknown as [string, string, string];
        if (/^https?:/.test(path)) continue;

        const target = path === "" ? from : path.replace(/\/$/, "") || "/";
        const ids = idsByRoute.get(target);
        if (!ids) {
          broken.push(`${from} -> ${target}#${fragment} (page not built)`);
        } else if (!ids.has(fragment)) {
          broken.push(`${from} -> ${target}#${fragment} (no such id)`);
        }
      }
    }

    expect(broken).toEqual([]);
  });

  it("keeps the home page free of the React runtime", async () => {
    const html = await readFile(join(DIST, "index.html"), "utf8");
    expect(html).not.toContain("astro-island");
  });

  it("loads the contact form as a deferred island", async () => {
    const es = await siteConfig(defaultLocale);
    if (!es.routes.contact.enabled) return;
    const html = await readFile(
      join(DIST, es.routes.contact.segment, "index.html"),
      "utf8",
    );
    expect(html).toContain('client="visible"');
  });

  it("never emits an unoptimized img from content", async () => {
    for (const file of await htmlFiles(DIST)) {
      const html = await readFile(file, "utf8");
      for (const [tag] of html.matchAll(/<img\b[^>]*>/g)) {
        expect(tag, `${routeOf(file)}: ${tag}`).toMatch(/\balt="/);
      }
    }
  });

  // The sitemap and the pages are two sources of the same hreflang claim, and
  // Google reads both. They disagreed silently until this checked them.
  it("lists each page at the URL that page calls canonical", async () => {
    const sitemap = await readFile(join(DIST, "sitemap-0.xml"), "utf8");
    const mismatches: string[] = [];

    for (const loc of [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
      (m) => m[1]!,
    )) {
      const path = new URL(loc).pathname.replace(/\/$/, "") || "/";
      const file = join(
        DIST,
        path === "/" ? "index.html" : `${path.slice(1)}/index.html`,
      );
      if (!existsSync(file)) continue;

      const canonical = (await readFile(file, "utf8")).match(
        /rel="canonical" href="([^"]+)"/,
      )?.[1];
      if (canonical !== loc)
        mismatches.push(
          `${path}\n  sitemap:   ${loc}\n  canonical: ${canonical}`,
        );
      // Exact, not sameUrl: this pair is the one Google reads together.
    }

    expect(mismatches).toEqual([]);
  });

  it("agrees with each page on its hreflang alternates", async () => {
    const sitemap = await readFile(join(DIST, "sitemap-0.xml"), "utf8");
    const mismatches: string[] = [];

    for (const entry of sitemap.matchAll(/<url>(.*?)<\/url>/gs)) {
      const block = entry[1]!;
      const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1];
      if (!loc) continue;

      const path = new URL(loc).pathname.replace(/\/$/, "") || "/";
      const file = join(
        DIST,
        path === "/" ? "index.html" : `${path.slice(1)}/index.html`,
      );
      if (!existsSync(file)) continue;

      const fromSitemap = [
        ...block.matchAll(/hreflang="([^"]+)" href="([^"]+)"/g),
      ]
        .map((m) => `${m[1]}=${m[2]}`)
        .sort();
      const fromPage = [
        ...(await readFile(file, "utf8")).matchAll(
          /rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g,
        ),
      ]
        .map((m) => `${m[1]}=${m[2]}`)
        .sort();

      const agree =
        fromSitemap.length === fromPage.length &&
        fromSitemap.every((entry, i) => {
          const [lang, url] = entry.split("=");
          const [otherLang, otherUrl] = fromPage[i]!.split("=");
          return lang === otherLang && sameUrl(url!, otherUrl!);
        });

      if (!agree) {
        mismatches.push(
          `${path}\n  sitemap: ${fromSitemap.join(", ") || "(none)"}\n  page:    ${fromPage.join(", ") || "(none)"}`,
        );
      }
    }

    expect(mismatches).toEqual([]);
  });

  it("points robots.txt at the sitemap and lists the real routes", async () => {
    const robots = await readFile(join(DIST, "robots.txt"), "utf8");
    expect(robots).toContain(`Sitemap: ${ORIGIN}/sitemap-index.xml`);

    const sitemap = await readFile(join(DIST, "sitemap-0.xml"), "utf8");
    // Exact <loc> entries, not a substring of the document: `toContain(origin + '/')`
    // was satisfied by any of the other routes and never checked the home at all.
    const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
      (m) => m[1]!,
    );

    for (const route of await expectedRoutes()) {
      const expected = `${ORIGIN}${route}`;
      expect(
        locs.some((loc) => sameUrl(loc, expected)),
        `sitemap missing ${route} — has ${locs.join(", ")}`,
      ).toBe(true);
    }
    expect(locs.some((loc) => loc.includes("/404"))).toBe(false);
  });
  // A feed nobody can find is not a feed: the discovery link is the whole point,
  // and its title has to name the feed, not whatever page it happens to sit on.
  it("ships one RSS feed per locale, discoverable and self-consistent", async () => {
    for (const locale of locales) {
      const prefix = locale === defaultLocale ? "" : `/${locale}`;
      const feedPath = join(
        DIST,
        ...`${prefix}/rss.xml`.split("/").filter(Boolean),
      );

      // The route 404s when updates is off, by design. Asserting the feed exists
      // unconditionally made a freshly reset clone -- where reset turns updates
      // off -- fail its own suite on the first run.
      if (!(await siteConfig(locale)).routes.updates.enabled) {
        expect(
          existsSync(feedPath),
          `${locale}: updates is off, so there should be no feed`,
        ).toBe(false);
        continue;
      }

      expect(existsSync(feedPath), `missing ${prefix}/rss.xml`).toBe(true);

      const feed = await readFile(feedPath, "utf8");
      const feedTitle = feed.match(/<title>([^<]+)<\/title>/)?.[1];
      expect(feed).toContain(`<language>${locale}</language>`);

      // Every item must live under this locale, or a reader gets the other language.
      const links = [...feed.matchAll(/<link>([^<]+)<\/link>/g)]
        .map((m) => m[1]!)
        .slice(1);
      for (const link of links) {
        expect(
          link.startsWith(`${ORIGIN}${prefix}/`),
          `${locale} feed links out: ${link}`,
        ).toBe(true);
      }

      const home = await readFile(
        join(DIST, ...`${prefix}/index.html`.split("/").filter(Boolean)),
        "utf8",
      );
      const tag = home.match(
        /<link rel="alternate" type="application\/rss\+xml"[^>]*>/,
      )?.[0];
      expect(tag, `${locale} home has no feed discovery link`).toBeTruthy();
      expect(tag).toContain(`href="${prefix}/rss.xml"`);
      expect(tag, "discovery title must match the feed title").toContain(
        `title="${feedTitle}"`,
      );
    }
  });
  // A 404 that redirects home is a soft 404: it tells a crawler the page exists
  // when it does not, and teleports a user who simply mistyped. The page has to
  // answer 404 and offer the way back instead.
  it("ships a 404 page that is noindex and offers a real way home", async () => {
    const page = join(DIST, "404.html");
    expect(
      existsSync(page),
      "no 404.html — a mistyped URL would get the host default",
    ).toBe(true);

    const html = await readFile(page, "utf8");
    expect(html, "404 must not be indexable").toContain("noindex");

    // The default locale renders unprefixed, so its home is `/` — and it must be
    // a route the build actually produced, not a link written by hand.
    const routes = await expectedRoutes();
    expect(routes, "the build produced no home page").toContain("/");
    expect(html, "404 does not link home").toContain('href="/"');

    // No meta refresh and no location assignment: both are the redirect this
    // test exists to prevent, wearing different clothes.
    expect(html).not.toMatch(/http-equiv=["']refresh["']/i);
    expect(html).not.toMatch(/location\s*(\.(href|replace)\s*=|\.replace\()/);
  });

  // The rules below each come from a clone that shipped the failure with every
  // other test green. docs/ARCHITECTURE/SEO.md#rules

  // A clone (it has a lock file) deploying with the placeholder origin sends every
  // canonical, sitemap entry and og:image to example.com.
  it("does not ship the placeholder origin from a clone", () => {
    if (!existsSync(join(process.cwd(), ".blueprint-lock.json"))) return;
    expect(
      ORIGIN,
      "set SITE_URL in .env and in the deploy environment",
    ).not.toMatch(/example\.com/);
  });

  // Crawlers index the first HTML response. A page that renders its copy in the
  // browser answers with a near-empty shell; two client sites did, for years.
  it("carries each page content in the HTML, not only after JavaScript", async () => {
    for (const file of await htmlFiles(DIST)) {
      if (routeOf(file) === "/404") continue;
      const html = await readFile(file, "utf8");
      const main = html.match(/<main[\s\S]*<\/main>/)?.[0] ?? "";
      const text = main
        .replace(/<(script|style|template|noscript)[\s\S]*?<\/\1>/g, " ")
        .replace(/<[^>]+>/g, " ")
        .split(/\s+/)
        .filter(Boolean);
      expect(
        text.length,
        `${routeOf(file)}: only ${text.length} words in <main> without JS`,
      ).toBeGreaterThanOrEqual(40);
    }
  });

  it("never repeats the brand inside one title", async () => {
    const site = await siteConfig(defaultLocale);
    const brand = String(site.brand.name).toLowerCase();
    for (const file of await htmlFiles(DIST)) {
      const title = (
        (await readFile(file, "utf8")).match(/<title>([^<]*)<\/title>/)?.[1] ??
        ""
      ).toLowerCase();
      expect(
        title.split(brand).length - 1,
        `${routeOf(file)}: "${title}"`,
      ).toBeLessThanOrEqual(1);
    }
  });

  it("leaves pages marked noindex out of the sitemap", async () => {
    const site = await siteConfig(defaultLocale);
    if (site.seo.robots.index === false) return;
    const sitemap = await readFile(join(DIST, "sitemap-0.xml"), "utf8");
    for (const file of await htmlFiles(DIST)) {
      const html = await readFile(file, "utf8");
      if (
        !/<meta name="robots" content="noindex/.test(html) ||
        routeOf(file) === "/404"
      )
        continue;
      expect(sitemap, `${routeOf(file)} is noindex but listed`).not.toContain(
        `<loc>${ORIGIN}${routeOf(file)}</loc>`,
      );
    }
  });

  // Content steers href/src attributes; the schema and the renderers are the
  // guards, this is the tripwire that proves nothing slipped past both.
  it("never emits a script-capable URL in an attribute", async () => {
    for (const file of await htmlFiles(DIST)) {
      const html = await readFile(file, "utf8");
      expect(html, routeOf(file)).not.toMatch(
        /\bhref\s*=\s*"(?:javascript|vbscript|data)\s*:/i,
      );
      expect(html, routeOf(file)).not.toMatch(
        /\bsrc\s*=\s*"(?:javascript|vbscript)\s*:/i,
      );
    }
  });

  it("gives every link an href a crawler can follow", async () => {
    for (const file of await htmlFiles(DIST)) {
      const html = await readFile(file, "utf8");
      for (const [tag] of html.matchAll(/<a\b[^>]*>/g)) {
        expect(tag, `${routeOf(file)}: anchor without a real href`).toMatch(
          /\bhref="(?!#?"|javascript:)[^"]+"/,
        );
      }
    }
  });

  // `npm run assets` writes the manifest, icons and og image in one pass, so a
  // manifest still named after another brand means all of them are stale.
  it("ships icons and og image generated for this brand", async () => {
    const manifest = JSON.parse(
      await readFile(join(DIST, "site.webmanifest"), "utf8"),
    );
    const site = await siteConfig(defaultLocale);
    expect(
      manifest.name,
      "run `npm run assets` after replacing the brand SVGs",
    ).toBe(site.brand.name);
  });
  // Search engines and feed readers decide freshness from dates the page declares. Posts
  // carried `date` and `updated` in their content but only the JSON-LD used them.
  describe("article dates", () => {
    const POSTS = join(process.cwd(), "src/content/posts");
    type Post = {
      locale: string;
      slug: string;
      date: string;
      updated?: string;
    };

    async function posts(): Promise<Post[]> {
      const found: Post[] = [];
      for (const locale of await readdir(POSTS)) {
        for (const name of await readdir(join(POSTS, locale))) {
          const raw = await readFile(join(POSTS, locale, name), "utf8");
          if (/^draft:\s*true/m.test(raw)) continue;
          const field = (key: string) =>
            raw
              .match(new RegExp(`^${key}:\\s*"?([^"\\n]+)"?`, "m"))?.[1]
              ?.trim();
          found.push({
            locale,
            slug: name.replace(/\.md$/, ""),
            date: field("date")!,
            updated: field("updated"),
          });
        }
      }
      return found;
    }

    const urlOf = async (post: Post) => {
      const site = await siteConfig(post.locale);
      const prefix = post.locale === defaultLocale ? "" : `/${post.locale}`;
      return `${prefix}/${site.routes.updates.segment}/${post.slug}`;
    };

    it("declares article:published_time and article:modified_time on every post", async () => {
      // A reset clone ships with updates off and no posts: nothing to declare yet.
      const updatesOn = (await Promise.all(locales.map(siteConfig))).some(
        (site) => site.routes.updates?.enabled,
      );
      if (!updatesOn) return;
      const all = await posts();
      expect(
        all.length,
        "updates are on but there are no posts to check",
      ).toBeGreaterThan(0);
      for (const post of all) {
        const html = await readFile(
          join(
            DIST,
            ...(await urlOf(post)).split("/").filter(Boolean),
            "index.html",
          ),
          "utf8",
        );
        const published = html.match(
          /<meta property="article:published_time" content="([^"]+)"/,
        )?.[1];
        const modified = html.match(
          /<meta property="article:modified_time" content="([^"]+)"/,
        )?.[1];
        expect(published, `${post.slug}: article:published_time`).toBe(
          new Date(post.date).toISOString(),
        );
        expect(modified, `${post.slug}: article:modified_time`).toBe(
          new Date(post.updated ?? post.date).toISOString(),
        );
      }
    });

    it("does not put article times on pages that are not articles", async () => {
      const home = await readFile(join(DIST, "index.html"), "utf8");
      expect(home).not.toContain("article:published_time");
    });

    it("gives every post a sitemap lastmod from its own dates, and no page a made-up one", async () => {
      const sitemap = await readFile(join(DIST, "sitemap-0.xml"), "utf8");
      const entries = new Map<string, string | undefined>(
        [
          ...sitemap.matchAll(
            /<url><loc>([^<]+)<\/loc>(?:<lastmod>([^<]+)<\/lastmod>)?/g,
          ),
        ].map((m) => [m[1]!, m[2]] as const),
      );
      const withLastmod = new Set<string>();
      for (const post of await posts()) {
        const loc = `${ORIGIN}${await urlOf(post)}`;
        withLastmod.add(loc);
        expect(entries.get(loc), `${post.slug}: lastmod`).toBe(
          new Date(post.updated ?? post.date).toISOString(),
        );
      }
      for (const [loc, lastmod] of entries) {
        if (!withLastmod.has(loc))
          expect(
            lastmod,
            `${loc} has a lastmod no content backs`,
          ).toBeUndefined();
      }
    });

    it("keeps post articles free of script tags", async () => {
      const updatesOn = (await Promise.all(locales.map(siteConfig))).some(
        (site) => site.routes.updates?.enabled,
      );
      if (!updatesOn) return;
      for (const post of await posts()) {
        const html = await readFile(
          join(
            DIST,
            ...(await urlOf(post)).split("/").filter(Boolean),
            "index.html",
          ),
          "utf8",
        );
        const article = html.match(/<article[\s\S]*?<\/article>/)?.[0] ?? "";
        // A CMS body is markdown; the satteri plugin strips raw HTML upstream,
        // so a script tag here means the seam between them failed.
        expect(article, post.slug).not.toContain("<script");
      }
    });

    it('points every feed at itself with atom:link rel="self"', async () => {
      for (const locale of locales) {
        const site = await siteConfig(locale);
        if (!site.routes.updates?.enabled) continue;
        const prefix = locale === defaultLocale ? "" : `/${locale}`;
        const feed = await readFile(
          join(DIST, ...`${prefix}/rss.xml`.split("/").filter(Boolean)),
          "utf8",
        );
        expect(feed, `${locale} feed`).toContain(
          `<atom:link href="${ORIGIN}${prefix}/rss.xml" rel="self" type="application/rss+xml"/>`,
        );
      }
    });
  });
});
