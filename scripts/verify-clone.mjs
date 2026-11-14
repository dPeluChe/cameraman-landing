#!/usr/bin/env node
// Verifies the state every project actually starts in: a clone, freshly reset.
//
// Nobody runs `reset` against the blueprint, so nothing checked that state until
// it was done by hand -- and doing it by hand found a crash that left a clone
// half-reset, two tests that failed for having nothing rather than something
// wrong, and an unhandled rejection that masked the one message a new clone most
// needs to read. Rule 9 applied to reset: see it red for the right reason.
//
// The only failures allowed are the launch gates (LAUNCH_GATES). They are the point.
import { cp, mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PRESETS } from './apply-preset.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const KEEP = process.argv.includes('--keep');
const SKIP = new Set(['node_modules', 'dist', '.astro', '.git', '.vercel', '.DS_Store']);
// Launch gates a fresh clone fails on purpose: it has placeholder copy, the demo's
// icons and `#` links until someone fills it. Each must fail here, or nothing
// stops a clone shipping in that state.
const LAUNCH_GATES = [
  'carries no leftover reset placeholders',
  'carries each page content in the HTML, not only after JavaScript',
  'gives every link an href a crawler can follow',
  'ships icons and og image generated for this brand',
];
// A real origin, so the build behaves as a configured deploy would (in CI a clone
// without SITE_URL refuses to build, which is a different gate).
const CLONE_ENV = { ...process.env, SITE_URL: 'https://clone.verify.test' };

const say = (message) => console.log(`[verify-clone] ${message}`);
const run = (cmd, args, cwd) =>
  execFileSync(cmd, args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], env: CLONE_ENV });

const work = await mkdtemp(join(tmpdir(), 'clone-check-'));
const CLONE = join(work, 'clone');

try {
  say(`building a clone in ${CLONE}`);
  await cp(ROOT, CLONE, { recursive: true, filter: (src) => !SKIP.has(src.split('/').pop()) });

  // Symlinked package by package, not as one link to node_modules: Astro caches
  // collections in node_modules/.astro, and a single link would make the clone
  // read the blueprint's cache and build the blueprint's content.
  await mkdir(join(CLONE, 'node_modules'));
  for (const entry of await readdir(join(ROOT, 'node_modules'))) {
    if (entry === '.astro') continue;
    // <ClientRouter /> is a styled .astro file; through a symlink its real path falls outside the
    // project root and the build cannot find its compile metadata. Copy so it stays inside.
    if (entry === 'astro') {
      await cp(join(ROOT, 'node_modules', entry), join(CLONE, 'node_modules', entry), { recursive: true });
      continue;
    }
    await symlink(join(ROOT, 'node_modules', entry), join(CLONE, 'node_modules', entry));
  }

  // Dynamic routes the clone owns ([slug] pages) read content that reset replaces;
  // static ones (its own 404) still build and stay.
  // The blueprint itself has no lock until reset writes one; only a clone does.
  const lockPath = join(CLONE, '.blueprint-lock.json');
  const { owned = [] } = existsSync(lockPath) ? JSON.parse(await readFile(lockPath, 'utf8')) : {};
  for (const path of owned.filter((entry) => entry.startsWith('src/pages/') && entry.includes('['))) {
    await rm(join(CLONE, path), { recursive: true, force: true });
  }

  // Committed first: reset crashed with ENOENT only when git had something
  // cached, because it still lists files reset has just deleted.
  run('git', ['init', '-q'], CLONE);
  run('git', ['remote', 'add', 'origin', 'https://github.com/dPeluChe/verify-clone.git'], CLONE);
  run('git', ['add', '-A'], CLONE);
  run('git', ['-c', 'user.email=v@v', '-c', 'user.name=v', '-c', 'core.hooksPath=/dev/null', 'commit', '-qm', 'init'], CLONE);

  say('running reset');
  // A bad --site-url must stop the reset before it rewrites anything.
  try {
    run('node', ['scripts/reset-content.mjs', '--yes', '--site-url', 'https://example.com'], CLONE);
    say('FAIL — reset accepted the placeholder origin as --site-url.');
    process.exit(1);
  } catch (error) {
    if (!String(error.stderr ?? '').includes('--site-url')) throw error;
  }
  if (existsSync(join(CLONE, 'docs', 'CLONE_CHECKLIST.md'))) {
    say('FAIL — reset changed files before rejecting a bad --site-url.');
    process.exit(1);
  }
  run('node', ['scripts/reset-content.mjs', '--yes', '--site-url', 'https://clone.verify.test'], CLONE);
  if (!(await readFile(join(CLONE, '.env'), 'utf8')).includes('SITE_URL="https://clone.verify.test"')) {
    say('FAIL — reset did not write SITE_URL into the clone\'s .env.');
    process.exit(1);
  }

  // The list of what is missing is the cloner's, kept in the destination.
  say('checking that reset left the clone its own checklist');
  const checklist = await readFile(join(CLONE, 'docs', 'CLONE_CHECKLIST.md'), 'utf8').catch(() => '');
  if (!checklist.includes('# Clone checklist') || !checklist.includes('What was missing or failed')) {
    say('FAIL: reset did not create docs/CLONE_CHECKLIST.md in the clone.');
    process.exit(1);
  }

  // A reset clone carries .blueprint-lock.json, so in CI it must refuse to build without a real
  // SITE_URL. The unit test covers the function; this proves it holds in the state a clone ships in.
  say('checking that a deploy without SITE_URL is refused');
  try {
    run('node', ['--input-type=module', '-e', "import('./src/lib/site-url.mjs').then((m) => m.resolveSiteUrl({ CI: '1' }))"], CLONE);
    say('FAIL: a fresh clone built in CI without SITE_URL: nothing stops it shipping example.com canonicals.');
    process.exit(1);
  } catch (error) {
    if (!String(error.stderr ?? '').includes('SITE_URL')) throw error;
  }

  say('building');
  run('npm', ['run', 'build'], CLONE);

  say('running the suite');
  const report = join(work, 'vitest.json');
  let output = '';
  try {
    output = run('npx', ['vitest', 'run', '--reporter=default', '--reporter=json', `--outputFile=${report}`], CLONE);
  } catch (error) {
    // A non-zero exit is expected: the launch gates fail on purpose.
    output = `${error.stdout ?? ''}${error.stderr ?? ''}`;
  }

  // Checked separately from the assertions, because an unhandled rejection is
  // not a failed test: it lands on whatever was in flight and does not reach the
  // JSON report at all. That is the exact shape of the bug this script exists to
  // catch -- a first version of it looked only at assertions and stayed green.
  if (/Unhandled (Error|Rejection)/i.test(output)) {
    say('FAIL: the suite left an unhandled error, which lands on an unrelated test:');
    console.log(output.split('\n').filter((line) => /Unhandled|Error:/.test(line)).slice(0, 6).join('\n'));
    process.exit(1);
  }

  if (!existsSync(report)) throw new Error('vitest produced no report: the suite did not run');
  const { testResults = [] } = JSON.parse(await readFile(report, 'utf8'));
  const failed = testResults
    .flatMap((file) => file.assertionResults ?? [])
    .filter((test) => test.status === 'failed')
    .map((test) => test.title);

  const unexpected = failed.filter((title) => !LAUNCH_GATES.includes(title));
  if (unexpected.length) {
    say(`FAIL: a fresh clone fails tests it should pass:`);
    for (const title of unexpected) console.log(`    ${title}`);
    process.exit(1);
  }
  for (const gate of LAUNCH_GATES.filter((title) => !failed.includes(title))) {
    say(`FAIL: "${gate}" passed on a fresh clone, so nothing stops one shipping unfinished.`);
    process.exit(1);
  }

  // tests/presets.test.ts validates the data a preset writes; only astro build
  // proves image() can resolve every media path. A preset that fails here is a
  // clone broken on day one: that is exactly what shipped three times.
  say('building each preset');
  for (const preset of Object.keys(PRESETS)) {
    run('node', ['scripts/apply-preset.mjs', preset], CLONE);
    try {
      run('npm', ['run', 'build'], CLONE);
    } catch (error) {
      say(`FAIL: preset "${preset}" does not build:`);
      console.log(
        `${error.stdout ?? ''}${error.stderr ?? ''}`.split('\n').filter(Boolean).slice(-15).join('\n'),
      );
      process.exit(1);
    }
    say(`  ${preset}: build ok`);
  }

  say('OK: a fresh clone builds, fails only its launch gates, and every preset builds.');
} finally {
  if (KEEP) {
    await writeFile(join(work, 'README'), 'Left by `npm run verify:clone -- --keep`.\n');
    say(`kept: ${CLONE}`);
  } else {
    await rm(work, { recursive: true, force: true });
  }
}
