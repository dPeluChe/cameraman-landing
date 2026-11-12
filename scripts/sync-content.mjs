#!/usr/bin/env node
// CMS slot. Runs on prebuild. With credentials it pulls content and writes it
// into src/content/; without them it keeps the committed snapshot and exits 0,
// so a fork or a preview deploy never fails for lack of secrets.
// Contract and payload shape: docs/ARCHITECTURE/CONTENT_SYNC.md
import { mkdir, readdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT_DIR = join(ROOT, 'src', 'content');

const API_URL = process.env.CONTENT_API_URL?.trim();
const TOKEN = process.env.CONTENT_API_TOKEN?.trim();
const SITE_ID = process.env.CONTENT_SITE_ID?.trim();

const log = (msg) => console.log(`[sync-content] ${msg}`);
const fail = (msg) => {
  console.error(`[sync-content] ${msg}`);
  process.exit(1);
};

// Copy of the route-key pattern in src/content.config.ts, which is the contract.
// A script cannot import a Zod schema, and it has to decide before the value
// becomes a filename; tests/sync-content.test.ts holds the two in step.
const ROUTE_KEY = /^[a-z][a-z0-9-]*$/;
// Any other name a payload may pick for a file: one segment, no dotfile, no `..`.
const FILE_NAME = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
// Frontmatter keys become `key:` lines in a YAML block; anything wider injects
// frontmatter. Values are JSON.stringify'd, so they are already safe.
const FRONTMATTER_KEY = /^[A-Za-z0-9_]+$/;

// A payload value becomes a filename here, a whole build before the schema sees
// it, so this is the only check between the CMS and the filesystem.
function fileName(value, pattern, what) {
  if (typeof value === 'string' && pattern.test(value)) return value;
  fail(`${what} ${JSON.stringify(value ?? null).slice(0, 60)} is not a usable filename`);
}

// Resolves one name under `dir` and refuses anything that lands elsewhere, so a
// name that slips past the patterns above still cannot leave the directory.
function contentPath(dir, name) {
  const parent = resolve(CONTENT_DIR, dir);
  const target = resolve(parent, name);
  if (dirname(target) !== parent) fail(`Refusing to write outside ${dir}/: ${name}`);
  return target;
}

async function hasSnapshot() {
  if (!existsSync(join(CONTENT_DIR, 'site'))) return false;
  const entries = await readdir(join(CONTENT_DIR, 'site'));
  return entries.some((name) => name.endsWith('.json'));
}

async function writeJson(dir, name, data) {
  const target = contentPath(dir, name);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  return target;
}

if (!API_URL || !TOKEN) {
  if (await hasSnapshot()) {
    log('No CONTENT_API_URL / CONTENT_API_TOKEN. Using the committed snapshot in src/content/.');
    process.exit(0);
  }
  fail('No credentials AND no committed snapshot in src/content/. Nothing to build.');
}

const endpoint = new URL(API_URL);
if (SITE_ID) endpoint.searchParams.set('siteId', SITE_ID);

log(`GET ${endpoint.href}`);
const startedAt = Date.now();

let response;
try {
  response = await fetch(endpoint, { headers: { Authorization: `Bearer ${TOKEN}` } });
} catch (error) {
  fail(`Network error: ${error.message}`);
}

if (!response.ok) {
  const body = await response.text().catch(() => '<no body>');
  fail(`HTTP ${response.status} ${response.statusText} — ${body.slice(0, 300)}`);
}

let payload;
try {
  payload = await response.json();
} catch (error) {
  fail(`Invalid JSON: ${error.message}`);
}

// Shape check only. Field-level validation is the Zod schema's job at build time,
// so a bad payload fails with a precise path instead of a vague error here.
if (!payload?.site || typeof payload.site !== 'object') fail('Payload missing `site` object keyed by locale.');
if (!Array.isArray(payload.pages)) fail('Payload missing `pages` array.');

const written = [];

for (const [locale, config] of Object.entries(payload.site)) {
  written.push(await writeJson('site', `${fileName(locale, FILE_NAME, 'site locale')}.json`, config));
}

// Pages are keyed by `route` and posts by `slug`: the pages loader reads a
// `slug` field as the entry id, which would collapse both locales onto one
// entry. Matching the posts loop here breaks the build instead.
for (const page of payload.pages) {
  if (!page?.locale || !page?.route) fail(`Page entry missing locale/route: ${JSON.stringify(page).slice(0, 120)}`);
  const locale = fileName(page.locale, FILE_NAME, 'page locale');
  const route = fileName(page.route, ROUTE_KEY, 'page route');
  written.push(await writeJson(join('pages', locale), `${route}.json`, page));
}

if (payload.ui && typeof payload.ui === 'object') {
  written.push(await writeJson('.', 'ui.json', payload.ui));
}

// Posts arrive as markdown bodies; the frontmatter is rebuilt from the same fields
// the Zod schema declares, so files and API stay interchangeable.
for (const post of payload.posts ?? []) {
  if (!post?.locale || !post?.slug) fail(`Post entry missing locale/slug: ${JSON.stringify(post).slice(0, 120)}`);
  const { locale, slug, body = '', ...frontmatter } = post;
  const dir = join('posts', fileName(locale, FILE_NAME, 'post locale'));
  const lines = Object.entries(frontmatter).map(([key, value]) => {
    if (!FRONTMATTER_KEY.test(key)) fail(`post ${slug}: frontmatter key ${JSON.stringify(key)} is not usable`);
    return `${key}: ${JSON.stringify(value)}`;
  });
  const target = contentPath(dir, `${fileName(slug, FILE_NAME, 'post slug')}.md`);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, `---\nlocale: "${locale}"\n${lines.join('\n')}\n---\n\n${body}\n`, 'utf8');
  written.push(target);
}

log(`OK · ${written.length} files · ${Date.now() - startedAt}ms`);
