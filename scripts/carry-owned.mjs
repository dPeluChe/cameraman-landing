#!/usr/bin/env node
// Copies the files a clone owns from an older checkout into this one, driven by
// `owned` in .blueprint-lock.json.
//
// The manual version of this step is where re-cloning goes wrong: the first clone
// was told "you had not touched content" and nearly lost a commit to an rm -rf.
// Reading the owned list beats remembering it.
//
// Dry run by default. See docs/GUIDES/UPDATING_FROM_BLUEPRINT.md
import { existsSync } from 'node:fs';
import { cp, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { mergeKeeping } from './merge-config.mjs';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const APPLY = process.argv.includes('--yes');
const source = process.argv.slice(2).find((arg) => !arg.startsWith('--'));

const die = (message) => {
  console.error(`[carry] ${message}`);
  process.exit(1);
};

if (!source) die('Usage: npm run carry -- ../old-checkout [--yes]');

const FROM = resolve(process.cwd(), source);
if (!existsSync(FROM)) die(`No such directory: ${FROM}`);
if (resolve(FROM) === ROOT) die('Source and destination are the same checkout.');

// The source's lock is the authority on what the OLD clone owned: a clone
// records a deliberate divergence by moving that path into `owned`, and the
// fresh checkout cannot know about it. Reading only the destination's lock
// silently skipped six files in a real clone -- and drift stayed green
// afterwards, because they had been reverted to the blueprint's own versions.
// The destination's list is still unioned in: it may carry paths added upstream
// since the old clone was cut.
const destLock = join(ROOT, '.blueprint-lock.json');
const sourceLock = join(FROM, '.blueprint-lock.json');

if (!existsSync(destLock)) {
  die('No .blueprint-lock.json here. Run `npm run reset -- --yes` first: it defines what this clone owns.');
}
if (!existsSync(sourceLock)) {
  die(`No .blueprint-lock.json in ${FROM}. Without it there is no record of what that clone owned, and carrying would guess.`);
}

const readOwned = async (path) => JSON.parse(await readFile(path, 'utf8')).owned ?? [];
const [destOwned, sourceOwned] = await Promise.all([readOwned(destLock), readOwned(sourceLock)]);

const owned = [...new Set([...sourceOwned, ...destOwned])];
const claimedByClone = sourceOwned.filter((entry) => !destOwned.includes(entry));

// Skipped rather than copied: they are rebuilt, not authored.
const SKIP = new Set(['package-lock.json']);

// Config files where a release can add a required key the old content cannot
// know about. Copying the old file wholesale made the build fail on
// `routes.projects: Required`, once per new key, each fix a trip to the
// blueprint to look the value up. The destination was freshly reset, so it
// already holds the new shape: merge the clone's values over it instead.
const MERGE = [/^src\/content\/site\/[^/]+\.json$/, /^src\/content\/ui\.json$/];
const filled = [];

/** Destination paths matching MERGE, read before anything overwrites them. */
async function newShapeSnapshot() {
  const snapshot = new Map();
  const walk = async (relative) => {
    const full = join(ROOT, relative);
    if (!existsSync(full)) return;

    for (const item of await readdir(full, { withFileTypes: true })) {
      const child = `${relative}/${item.name}`;
      if (item.isDirectory()) await walk(child);
      else if (MERGE.some((re) => re.test(child))) snapshot.set(child, JSON.parse(await readFile(join(ROOT, child), 'utf8')));
    }
  };
  await walk('src/content');
  return snapshot;
}

const newShape = await newShapeSnapshot();

const planned = [];
const missing = [];

for (const entry of owned) {
  if (SKIP.has(entry)) continue;

  const from = join(FROM, entry);
  if (!existsSync(from)) {
    missing.push(entry);
    continue;
  }

  const isDir = (await stat(from)).isDirectory();
  if (isDir && (await readdir(from)).length === 0) continue;

  planned.push(entry.endsWith('/') || !isDir ? entry : `${entry}/`);
  if (APPLY) await cp(from, join(ROOT, entry), { recursive: true, force: true });
}

// After the copy, so the clone's values are what gets merged onto the new shape.
for (const [relative, base] of newShape) {
  const target = join(ROOT, relative);
  if (!existsSync(target)) continue;

  const merged = mergeKeeping(base, JSON.parse(await readFile(target, 'utf8')), [relative], filled);
  if (APPLY) await writeFile(target, `${JSON.stringify(merged.value, null, 2)}\n`, 'utf8');
}

for (const entry of planned) console.log(`  ${APPLY ? 'copied' : 'would copy'}  ${entry}`);
if (missing.length) console.log(`\n[carry] not present in the source, skipped: ${missing.join(', ')}`);

// The whole point of the merge: these are the keys this release added, filled
// from the new shape instead of sending you to the blueprint to look them up.
if (filled.length) {
  console.log(`\n[carry] keys this release added, kept from the new shape — review each:`);
  for (const key of filled) console.log(`           ${key}`);
}

// Named out loud: these are the ones a destination-only read would have dropped,
// and their loss is invisible afterwards because the drift test would pass.
if (claimedByClone.length) {
  console.log(`\n[carry] carried because the OLD clone claimed them, not because the blueprint lists them:`);
  for (const entry of claimedByClone) console.log(`           ${entry}`);
  console.log(`[carry] Re-check each against the new blueprint — a fix upstream may have made the divergence unnecessary.`);

  // Carrying a divergence without recording it fails the drift test on the next
  // run, for a change carry made deliberately. The lock is the record, so carry
  // writes it rather than telling you to.
  if (APPLY) {
    const lock = JSON.parse(await readFile(destLock, 'utf8'));
    lock.owned = owned;
    for (const entry of claimedByClone) delete lock.files[entry];
    await writeFile(destLock, `${JSON.stringify(lock, null, 2)}\n`, 'utf8');
    console.log(`[carry] Recorded them as owned in .blueprint-lock.json, so the drift guard agrees.`);
  }
}

if (!APPLY) {
  console.log(`\n[carry] Dry run. Re-run with --yes to apply.`);
  process.exit(0);
}

console.log(`\n[carry] Done. Now run: npm run lint && npm run check && npm test && npm run build`);
console.log(`[carry] Keep ${FROM} until they all pass.`);
