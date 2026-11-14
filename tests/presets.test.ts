// Presets are content the schema never saw until a clone's first build: three of
// four shipped data nothing validated — lucide slugs renamed upstream and a logo
// path one `../` short. The script resolves ROOT from its own location, so it
// runs against a temp tree seeded with this repo's content and assets; the
// filesystem check stands in for image(), which only fails on a missing file
// inside `astro build` (that real build lives in scripts/verify-clone.mjs).
import { afterAll, describe, expect, it } from 'vitest';
import { spawn } from 'node:child_process';
import { cp, mkdir, mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'astro/zod';
import { collections } from '../src/content.config';
import { PRESETS } from '../scripts/apply-preset.mjs';
// The clone's own locales: a single-language clone must not be asked for `es` files.
import { LOCALES } from '../src/lib/locales.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SCRIPT = join(ROOT, 'scripts', 'apply-preset.mjs');


// A string schema stands in for image(): existence is asserted on disk below.
const image = () => z.string();
const schemaOf = (name: 'pages' | 'site') =>
  (collections[name].schema as (ctx: unknown) => z.ZodType)({ image });
const pageSchema = schemaOf('pages');
const siteSchema = schemaOf('site');

const issues = (result: z.ZodSafeParseResult<unknown>) =>
  result.success
    ? 'accepted'
    : result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');

const roots: string[] = [];

afterAll(async () => {
  for (const root of roots) await rm(root, { recursive: true, force: true });
});

async function apply(preset: string) {
  const root = await mkdtemp(join(tmpdir(), 'landings-preset-'));
  roots.push(root);
  await mkdir(join(root, 'scripts'), { recursive: true });
  await cp(SCRIPT, join(root, 'scripts', 'apply-preset.mjs'));
  await cp(join(ROOT, 'src', 'content'), join(root, 'src', 'content'), { recursive: true });
  await cp(join(ROOT, 'src', 'assets'), join(root, 'src', 'assets'), { recursive: true });

  const run = spawn(process.execPath, [join('scripts', 'apply-preset.mjs'), preset], { cwd: root });
  let stderr = '';
  run.stderr.on('data', (chunk) => (stderr += chunk));
  const status = await new Promise<number | null>((done) => run.on('close', done));

  return { root, status, stderr };
}

/** Every `../`-relative string in a JSON file must land on a real file. */
async function danglingPaths(dir: string, base: string): Promise<string[]> {
  const out: string[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await danglingPaths(full, base)));
      continue;
    }
    if (!entry.name.endsWith('.json')) continue;

    const data: unknown = JSON.parse(await readFile(full, 'utf8'));
    const walk = (value: unknown): void => {
      if (typeof value === 'string' && /^\.\.?\//.test(value)) {
        const target = resolve(dirname(full), value);
        if (!existsSync(target)) out.push(`${relative(base, full)}: ${value}`);
        return;
      }
      if (Array.isArray(value)) value.forEach(walk);
      else if (value && typeof value === 'object') Object.values(value).forEach(walk);
    };
    walk(data);
  }
  return out;
}

describe.each(Object.keys(PRESETS))('preset "%s"', (preset) => {
  it('applies cleanly onto the shipped content', async () => {
    const { status, stderr } = await apply(preset);
    expect(status, stderr).toBe(0);
  });

  it.each(LOCALES)('emits an %s page the schema accepts', async (locale) => {
    const { root } = await apply(preset);
    const page = JSON.parse(await readFile(join(root, 'src/content/pages', locale, 'index.json'), 'utf8'));
    expect(issues(pageSchema.safeParse(page))).toBe('accepted');
  });

  it.each(LOCALES)('leaves an %s site config the schema accepts', async (locale) => {
    const { root } = await apply(preset);
    const site = JSON.parse(await readFile(join(root, 'src/content/site', `${locale}.json`), 'utf8'));
    expect(issues(siteSchema.safeParse(site))).toBe('accepted');
  });

  it('writes no media path that resolves to a missing file', async () => {
    const { root } = await apply(preset);
    const content = join(root, 'src', 'content');
    expect(await danglingPaths(content, content)).toEqual([]);
  });
});
