// The payload in docs/ARCHITECTURE/CONTENT_SYNC.md is the contract, and it has
// disagreed with this script before: a page entry was read as `slug`. Copied
// under a temp tree because the script resolves src/content from its own path.
import { describe, expect, it, afterAll } from 'vitest';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { cp, mkdir, mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative as relPath } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { z } from 'astro/zod';
import { collections } from '../src/content.config';
// The clone's own default locale: a single-language clone has no `es` to write to.
import { DEFAULT_LOCALE as L } from '../src/lib/locales.mjs';

const SCRIPT = fileURLToPath(new URL('../scripts/sync-content.mjs', import.meta.url));

// Stands in for Astro's image() helper, which only exists inside a content config.
const image = () => undefined;
const pageSchema = (collections.pages.schema as (ctx: unknown) => z.ZodType)({ image });

const issues = (result: z.ZodSafeParseResult<unknown>) =>
  result.success ? 'accepted' : result.error.issues.map((issue) => issue.path.join('.')).join(', ');

const SEO = { title: 'Acme', description: 'A description comfortably longer than the fifty character minimum.' };
const PAGE = { locale: L, route: 'index', seo: SEO, sections: [{ type: 'hero', title: 'Acme' }] };
const SLUG_PAGE = { locale: L, slug: 'index', seo: SEO, sections: [{ type: 'hero', title: 'Acme' }] };
const POST = {
  locale: L,
  slug: 'respuesta-emergencias',
  title: 'Respuesta a emergencias',
  description: SEO.description,
  date: '2026-07-14',
  body: '# Bajío',
};
// `undefined` disappears in JSON.stringify, which is the point: what the CMS
// sends is a post with a route and no slug.
const ROUTE_POST = { ...POST, slug: undefined, route: 'nota' };

const roots: string[] = [];

afterAll(async () => {
  for (const root of roots) await rm(root, { recursive: true, force: true });
});

async function sync(payload: unknown) {
  const root = await mkdtemp(join(tmpdir(), 'landings-sync-'));
  roots.push(root);
  const script = join(root, 'scripts', 'sync-content.mjs');
  await mkdir(join(root, 'scripts'), { recursive: true });
  await cp(SCRIPT, script);

  // Every file the sync produced, the copy of the script excluded: an entry the
  // script rejects has to leave the tree exactly as it found it.
  const writtenFiles = async (dir = root): Promise<string[]> => {
    const out: string[] = [];
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (full === script) continue;
      if (entry.isDirectory()) out.push(...(await writtenFiles(full)));
      else out.push(relPath(root, full));
    }
    return out;
  };

  const server = createServer((_request, response) => {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(payload));
  });
  await new Promise<void>((done) => server.listen(0, '127.0.0.1', done));
  const { port } = server.address() as AddressInfo;

  try {
    const run = spawn(process.execPath, [script], {
      env: {
        ...process.env,
        CONTENT_API_URL: `http://127.0.0.1:${port}/content`,
        CONTENT_API_TOKEN: 'test-token',
        CONTENT_SITE_ID: '',
      },
    });
    let stderr = '';
    run.stderr.on('data', (chunk) => (stderr += chunk));
    const status = await new Promise<number | null>((done) => {
      run.on('close', done);
    });

    const read = (relative: string) => readFile(join(root, 'src', 'content', relative), 'utf8');
    const list = (relative: string) => readdir(join(root, 'src', 'content', relative));
    const exists = (relative: string) => existsSync(join(root, 'src', 'content', relative));
    const existsIn = (relative: string) => existsSync(join(root, relative));
    return { status, stderr, read, readJson: async (rel: string) => JSON.parse(await read(rel)), list, exists, existsIn, written: writtenFiles };
  } finally {
    server.close();
  }
}

describe('a page entry is keyed by route', () => {
  it('writes the documented payload to pages/<locale>/<route>.json', async () => {
    const site = { [L]: { brand: 'Acme' } };
    const ui = { [L]: { menu: 'Menu' } };
    const { status, stderr, readJson } = await sync({ site, pages: [PAGE], ui });

    expect(status, `the payload documented in CONTENT_SYNC.md has to sync: ${stderr}`).toBe(0);
    expect(await readJson(`pages/${L}/index.json`)).toEqual(PAGE);
    expect(await readJson(`site/${L}.json`)).toEqual(site[L]);
    expect(await readJson('ui.json')).toEqual(ui);
  });

  // The filename is half the entry id, and getPage() looks a page up as
  // `<locale>/<route>`: a page written under any other name is one the build
  // never finds, with a green sync as the only warning.
  it('names the file after the route, the way the collection ids it', async () => {
    const { status, list } = await sync({ site: {}, pages: [PAGE] });

    expect(status).toBe(0);
    expect(await list(`pages/${L}`)).toEqual(['index.json']);
  });

  it('lands a file the pages collection accepts', async () => {
    const { readJson } = await sync({ site: {}, pages: [PAGE] });

    expect(issues(pageSchema.safeParse(await readJson(`pages/${L}/index.json`)))).toBe('accepted');
  });

  it('rejects a page entry keyed by slug', async () => {
    const { status, stderr, exists } = await sync({ site: {}, pages: [SLUG_PAGE] });

    expect(status).toBe(1);
    expect(stderr).toContain('locale/route');
    expect(exists(`pages/${L}/index.json`), 'a malformed entry writes nothing').toBe(false);
  });

  it('leaves the pages schema rejecting a slug-keyed entry', async () => {
    expect(issues(pageSchema.safeParse(SLUG_PAGE))).toContain('route');
  });

  // The script keeps its own copy of the route-key pattern; this stops it
  // drifting from the schema: rejecting a route the build accepts, or writing
  // a file the build then refuses.
  it.each(['index', 'case-studies', 'v2-services', 'About', 'about_us', '2026'])(
    'agrees with the pages schema on the route %j',
    async (route) => {
      const { status } = await sync({ site: {}, pages: [{ ...PAGE, route }] });
      const accepted = issues(pageSchema.safeParse({ ...PAGE, route })) === 'accepted';

      expect(status === 0, `script and schema must both ${accepted ? 'accept' : 'reject'} "${route}"`).toBe(accepted);
    },
  );
});

describe('a post entry is keyed by slug', () => {
  it('writes the documented payload to posts/<locale>/<slug>.md', async () => {
    const { status, read } = await sync({ site: {}, pages: [], posts: [POST] });

    expect(status).toBe(0);
    const file = await read(`posts/${L}/respuesta-emergencias.md`);
    expect(file).toContain(`locale: "${L}"`);
    expect(file).toContain('date: "2026-07-14"');
    expect(file).toContain('# Bajío');
  });

  it('rejects a post entry keyed by route', async () => {
    const { status, stderr } = await sync({ site: {}, pages: [], posts: [ROUTE_POST] });

    expect(status).toBe(1);
    expect(stderr).toContain('locale/slug');
  });

  // Every other frontmatter field becomes a `key:` line in a YAML block, so a
  // key carrying `:` or a newline would smuggle fields past the schema.
  it('refuses a post whose frontmatter key is not a usable YAML key', async () => {
    const { status, stderr, exists } = await sync({
      site: {},
      pages: [],
      posts: [{ ...POST, 'injected: more': 'value' }],
    });

    expect(status).toBe(1);
    expect(stderr).toContain('frontmatter key');
    expect(exists('posts/es/respuesta-emergencias.md'), 'a rejected post writes nothing').toBe(false);
  });
});

// A payload value becomes a path segment here, a whole build before the schema
// sees it, so a traversing name would overwrite repo files and still exit 0.
describe('a name that leaves the content directory', () => {
  it.each([
    ['page route', { site: {}, pages: [{ ...PAGE, route: '../../site/es' }] }, 'src/content/site/es.json'],
    ['page locale', { site: {}, pages: [{ ...PAGE, locale: '../../site' }] }, 'src/site/index.json'],
    ['post slug', { site: {}, pages: [], posts: [{ ...POST, slug: '../../site/es' }] }, 'src/content/site/es.md'],
    ['site locale', { site: { '../../site': {} }, pages: [] }, 'src/site.json'],
  ])('refuses a %s that traverses', async (_what, payload, escaped) => {
    const { status, stderr, existsIn, written } = await sync(payload);

    expect(status).toBe(1);
    expect(stderr).toContain('is not a usable filename');
    expect(existsIn(escaped), `${escaped} must never be written`).toBe(false);
    expect(await written(), 'a rejected entry leaves the tree untouched').toEqual([]);
  });
});
