// Three states, not two. The discriminator is a marker the blueprint ships and
// `npm run reset` deletes — never the absence of the lock, because absence also
// means "a clone that never ran reset", and that is the case the guard exists for.
//
//   marker present            -> the blueprint, skip
//   no marker, lock present   -> a clone, verify
//   no marker, no lock        -> a clone that never reset, fail and say so
import { describe, expect, it } from 'vitest';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { currentFiles, isOwned } from '../scripts/blueprint-lock.mjs';
import { defaultLocale } from '../src/lib/i18n';

const LOCK = join(process.cwd(), '.blueprint-lock.json');
const MARKER = join(process.cwd(), '.blueprint-source');

const isBlueprint = existsSync(MARKER);
const hasLock = existsSync(LOCK);

// Runs in the blueprint too: it checks the OWNED list, not this repo's state.
// src/lib/fonts.mjs shipped documented as the clone's edit point while absent
// from OWNED, so doing what the guide said would have failed the drift test.
describe('the clone edit surface is owned', () => {
  it.each([
    'src/styles/tokens.css',
    'src/lib/fonts.mjs',
    'src/lib/locales.mjs',
    'src/content/site/es.json',
    'src/assets/brand/logo.svg',
    'package.json',
  ])('%s', (path) => {
    expect(isOwned(path), `NEW_LANDING.md tells a clone to edit ${path}, so it must be in OWNED.`).toBe(true);
  });
});

describe.skipIf(isBlueprint)('blueprint drift', () => {
  it('has a lock to check against', () => {
    expect(
      hasLock,
      'This is a clone with no .blueprint-lock.json, so the drift guard protects nothing.\n' +
        'Run `npm run reset` — it writes the lock and removes the blueprint marker.',
    ).toBe(true);
  });

  it.skipIf(!hasLock)('has not modified files the blueprint owns', async () => {
    const lock = JSON.parse(await readFile(LOCK, 'utf8'));
    const problems: string[] = [];

    for (const [path, expected] of Object.entries(lock.files as Record<string, string>)) {
      const full = join(process.cwd(), path);
      if (!existsSync(full)) {
        problems.push(`deleted:  ${path}`);
        continue;
      }
      const actual = createHash('sha256').update(await readFile(full)).digest('hex').slice(0, 16);
      if (actual !== expected) problems.push(`modified: ${path}`);
    }

    // A file the blueprint never shipped is the loudest signal of all — it is a
    // clone growing its own code — and fingerprints alone could not see it.
    const known = new Set(Object.keys(lock.files as Record<string, string>));
    for (const path of await currentFiles(process.cwd(), lock.owned)) {
      if (!known.has(path)) problems.push(`added:    ${path}`);
    }

    expect(
      problems,
      'These belong to the blueprint. Re-cloning no longer carries your work forward for free.\n' +
        'If the change is intentional, move the path into `owned` in .blueprint-lock.json and drop it from `files`.\n' +
        'If it fixes something any landing would want, open an issue upstream instead.',
    ).toEqual([]);
  });
});

// A count in prose drifts silently; the table it points at cannot. Digits and
// the spelled-out numbers around the real set, on every name the docs have
// used for it.
const STALE_COUNT =
  /\b(?:\d+|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)\b\s+(?:available\s+)?(?:block\s+types|section\s+types|variants)\b/i;

// The drift test above checks that what the guide says to edit is OWNED. It does
// not check the opposite direction: that the guide mentions what exists. That is
// how `projects` shipped complete in code while NEW_LANDING.md never named it,
// so an agent following the guide literally never built the portfolio page.
// Blueprint-only: `reset` deletes NEW_LANDING.md, because a clone has no use for
// instructions on how to create a landing. Reading it unconditionally made every
// clone fail five tests -- the same "assumes the blueprint's context" mistake
// this file's other suites exist to catch.
describe.skipIf(!isBlueprint)('the guide keeps up with the schema', () => {
  // Lazy on purpose. skipIf skips the `it`s, not the describe body: eagerly
  // reading here created a promise nobody awaited, which rejected in every reset
  // clone and got attributed to whatever test was in flight -- masking the
  // placeholder gate's message at the one moment someone reads it.
  const guide = () => readFile(join(process.cwd(), 'docs/GUIDES/NEW_LANDING.md'), 'utf8');

  // Derived, not listed: a hardcoded list here would drift exactly the way the
  // guide did. The schema requires every route key in this file, so its keys are
  // the real set.
  const routeKeys = Object.keys(
    JSON.parse(readFileSync(join(process.cwd(), 'src/content/site', `${defaultLocale}.json`), 'utf8')).routes,
  );

  it.each(routeKeys)('names the %s route', async (route) => {
    expect(
      (await guide()).includes(route),
      `NEW_LANDING.md never mentions "${route}", so a clone following it will not build that page.`,
    ).toBe(true);
  });

  it('states no block-type count that could go stale', async () => {
    expect((await guide()).match(STALE_COUNT)).toBeNull();
  });
});

// Unconditional, like the ROUTING.md guard below: `reset` drops NEW_LANDING.md
// but keeps CONTENT_SCHEMA.md — a clone builds its CMS against it.
describe('CONTENT_SCHEMA.md states no block-type count', () => {
  it('matches no count that could go stale', async () => {
    const doc = await readFile(join(process.cwd(), 'docs/ARCHITECTURE/CONTENT_SCHEMA.md'), 'utf8');
    expect(doc.match(STALE_COUNT)).toBeNull();
  });

  it('catches a count, not a bare mention of the tails', () => {
    expect('Nineteen variants'.match(STALE_COUNT)).not.toBeNull();
    expect('19 section types'.match(STALE_COUNT)).not.toBeNull();
    expect('The section types below are discriminated on `type`.'.match(STALE_COUNT)).toBeNull();
    expect('the renderer supports variants of a block'.match(STALE_COUNT)).toBeNull();
  });
});

// "Adding a route" named a route enum, a schema and a registry, all three deleted
// when the set was opened, and no gate noticed: a doc can disagree with the code
// silently. Unconditional -- `reset` keeps ROUTING.md, so a clone holds this too.
describe("'Adding a route' stays content-only", () => {
  it('names no file outside src/content/', async () => {
    const doc = await readFile(join(process.cwd(), 'docs/ARCHITECTURE/ROUTING.md'), 'utf8');
    const section = doc.split('\n## ').find((part) => part.startsWith('Adding a route')) ?? '';
    expect(section, "ROUTING.md has no '## Adding a route' section -- point this guard at the new heading").not.toBe('');

    const named = [...section.matchAll(/src\/[\w./<>-]*\.\w+/g)].map(([path]) => path);
    expect(
      named.filter((path) => !path.startsWith('src/content/')),
      'Adding a route is two content edits. A code file in that section means it drifted from the open set again.',
    ).toEqual([]);
  });
});

// The lib/ annotation names every module in prose; social.ts shipped while Footer
// imported it and the list still said twelve (#637). Set equality, same trick as
// the TESTING.md table -- unconditional because `reset` keeps STRUCTURE.md.
describe('STRUCTURE.md lib annotation', () => {
  it('lists exactly the modules in src/lib/', async () => {
    const doc = await readFile(join(process.cwd(), 'docs/ARCHITECTURE/STRUCTURE.md'), 'utf8');
    const lines = doc.split('\n');
    const start = lines.findIndex((line) => line.includes('├── lib/'));
    expect(start, "STRUCTURE.md has no lib/ annotation -- point this guard at it").not.toBe(-1);

    const block = [lines[start]!.slice(lines[start]!.indexOf('lib/') + 4)];
    for (const line of lines.slice(start + 1)) {
      if (!line.startsWith('│')) break;
      block.push(line.slice(line.indexOf('│') + 1));
    }
    const listed = block
      .join(' ')
      .split(',')
      .map((name) => name.trim())
      .filter(Boolean)
      .sort();

    const actual = (await readdir(join(process.cwd(), 'src/lib')))
      .map((file) => file.replace(/\.(ts|mjs|js|tsx)$/, ''))
      .sort();

    expect(listed, 'STRUCTURE.md enumerates src/lib/; a module missing from the list hides the map.').toEqual(actual);
  });
});
