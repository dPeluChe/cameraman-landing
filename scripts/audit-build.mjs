#!/usr/bin/env node
// Enforces the performance budget against a real build, on a THROTTLED MOBILE
// profile. Pass --desktop for the easier one. Run after `npm run build`.
// Lighthouse comes from npx so it stays out of the dependency tree.
import { spawn } from 'node:child_process';
import { readFile, rm, mkdtemp } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { rankedRoutes } from './built-routes.mjs';
import { serveDist } from './serve-dist.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
// A free port only lowers the odds of a collision — between close() and serve's
// bind there is still a window another process can take it. What actually makes
// a wrong score impossible is the content check below, which refuses to measure
// anything that is not this repo's dist/.
const BUDGET = { performance: 95, accessibility: 100, 'best-practices': 100, seo: 100 };

if (!existsSync(DIST)) {
  console.error('[audit] dist/ not found. Run `npm run build` first.');
  process.exit(1);
}

const LIMIT = 8;
const ranked = await rankedRoutes(DIST);
const PATHS = process.argv.slice(2).length ? process.argv.slice(2) : ranked.slice(0, LIMIT);

if (!process.argv.slice(2).length && ranked.length > LIMIT) {
  console.log(`[audit] ${ranked.length} routes built; auditing the first ${LIMIT}. Pass paths as arguments to choose others.`);
}

// stderr is captured, not discarded: an audit that fails without saying why
// sends you diagnosing the wrong thing.
const run = (cmd, args, opts = {}) =>
  new Promise((done, fail) => {
    const child = spawn(cmd, args, { stdio: ['ignore', 'ignore', 'pipe'], ...opts });
    let stderr = '';
    child.stderr?.on('data', (chunk) => (stderr += chunk));
    child.on('error', fail);
    child.on('exit', (code) =>
      code === 0 ? done() : fail(new Error(`${cmd} exited ${code}\n${stderr.trim().split('\n').slice(-8).join('\n')}`)),
    );
  });

// npx shares one npm cache across every repo on the machine, so two clones
// auditing at once collided on its lock. Retrying was the wrong shape: the wait
// is a whole neighbouring audit, minutes, not the seconds a backoff gives. A
// repo-local cache removes the contention instead of waiting it out, at the
// cost of one lighthouse download per repo. Lighthouse stays out of
// devDependencies on purpose: it drags 17 moderate advisories and ~180MB into
// every clone. Reported by the eps-landing clone.
const NPX_CACHE = join(ROOT, 'node_modules', '.cache', 'npx');
const NPX_ENV = { ...process.env, npm_config_cache: NPX_CACHE };

/** Retained for genuine filesystem flakiness, not for cross-repo contention. */
async function runWithRetry(cmd, args, attempts = 3) {
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await run(cmd, args, { env: NPX_ENV });
    } catch (error) {
      const transient = /ECOMPROMISED|Lock compromised|EBUSY|ENOTEMPTY/.test(error.message);
      if (!transient || attempt === attempts) throw error;
      console.log(`      npx cache busy — retry ${attempt}/${attempts - 1}`);
      await new Promise((r) => setTimeout(r, 10000 * attempt));
    }
  }
}

/**
 * A raw Node stack trace here reads as "the blueprint is broken" to whoever just
 * cloned it. Name the real cause and say how far the run got.
 */
function reportFatal(error, done, total) {
  if (/ECOMPROMISED|Lock compromised/.test(error.message)) {
    console.error(`\n[audit] Blocked on the npm cache lock — ${done}/${total} routes measured.`);
    console.error('[audit] Another audit on this machine is most likely holding it. Retry when it finishes.');
    console.error(`[audit] This run used a repo-local cache (${NPX_CACHE}), so a stale global lock is the other suspect.`);
  } else {
    console.error(`\n[audit] ${error.message}`);
  }
  process.exit(1);
}

const { port: PORT, stop } = await serveDist(DIST).catch((error) => {
  console.error(`[audit] ${error.message}`);
  process.exit(1);
});
process.on('exit', stop);
process.on('SIGINT', () => process.exit(130));

const outDir = await mkdtemp(join(tmpdir(), 'lh-'));
let failed = false;
let measured = 0;

for (const path of PATHS) {
  const report = join(outDir, `${path.replace(/\W+/g, '_') || 'root'}.json`);

  await runWithRetry('npx', [
    '--yes',
    'lighthouse@12',
    `http://localhost:${PORT}${path}`,
    '--quiet',
    '--chrome-flags=--headless=new --no-sandbox',
    // Mobile, not desktop. Desktop scored 100 on a hero image whose srcset had a
    // single width — a wide viewport asks for the large source, so the waste is
    // invisible there. Mobile flagged it, and mobile is where landings are read.
    ...(process.argv.includes('--desktop') ? ['--preset=desktop'] : []),
    '--output=json',
    `--output-path=${report}`,
  ]).catch((error) => reportFatal(error, measured, PATHS.length));
  measured += 1;

  const { categories } = JSON.parse(await readFile(report, 'utf8'));
  const scores = Object.fromEntries(
    Object.keys(BUDGET).map((key) => [key, Math.round(categories[key].score * 100)]),
  );
  const misses = Object.entries(BUDGET).filter(([key, min]) => scores[key] < min);

  console.log(
    `${misses.length ? 'FAIL' : ' OK '} ${path.padEnd(14)} ` +
      Object.entries(scores)
        .map(([key, value]) => `${key.slice(0, 4)} ${value}`)
        .join('  '),
  );

  for (const [key, min] of misses) console.log(`      ${key}: ${scores[key]} < ${min}`);
  if (misses.length) failed = true;
}

stop();
await rm(outDir, { recursive: true, force: true });

if (failed) {
  console.error('\n[audit] Budget not met. See docs/ARCHITECTURE/SEO.md#budget');
  process.exit(1);
}
console.log('\n[audit] Budget met.');
