// Which files a clone OWNS, and a fingerprint of the ones it does not.
//
// A clone's divergence is small and portable — content, tokens, brand assets —
// because of rules 1 and 2 in CLAUDE.md. That is what makes "re-clone and reload"
// cost minutes instead of a merge. This file exists to keep that true: it records
// what the blueprint shipped so a test can tell you the day the clone starts
// editing blueprint code, which is the day re-cloning stops being free.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { statSync } from 'node:fs';
import { join, relative } from 'node:path';

export const LOCK_FILE = '.blueprint-lock.json';

/** Paths a clone is expected to change. Everything else is the blueprint's. */
export const OWNED = [
  'src/content/',
  'src/assets/brand/',
  'src/assets/demo/',
  'src/styles/tokens.css',
  // The guide tells a clone to edit this to change or drop a language.
  'src/lib/locales.mjs',
  // Same reason: it is the single edit point for the brand typeface.
  'src/lib/fonts.mjs',
  // Paired with fonts.mjs: the clone edits both when it changes typefaces.
  'src/lib/font-vars.mjs',
  // Extension points: a clone's own sections and chrome (docs/GUIDES/EXTENDING.md).
  'src/site/',
  'public/',
  'docs/TASK_TODO.md',
  // Created by reset in the clone and kept by whoever clones: the blueprint never rewrites it.
  'docs/CLONE_CHECKLIST.md',
  // reset drops the clone-guide row from it.
  'docs/README.md',
  'package.json',
  'package-lock.json',
  'README.md',
  'CLAUDE.md',
  '.env',
];

const SKIP = new Set(['node_modules', 'dist', '.astro', '.git', '.vercel', '.DS_Store']);

const isRegularFile = (path) => {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
};

/**
 * Ask git, so .gitignore decides what counts. Walking the disk pulled in editor
 * caches, and deleting one later reported it as blueprint drift — a guardrail
 * that cries wolf stops being read.
 *
 * `--cached --others`: a fresh clone runs `git init` with nothing committed yet,
 * so `--cached` alone returns nothing.
 */
function gitFiles(root) {
  try {
    return execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], {
      cwd: root,
      encoding: 'buffer',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString('utf8')
      .split('\0')
      .filter(Boolean);
  } catch {
    return null; // no git available: fall back to the disk walk
  }
}

export const isOwned = (path, owned = OWNED) =>
  owned.some((entry) => (entry.endsWith('/') ? path.startsWith(entry) : path === entry));

async function walk(root, dir = root) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(root, full)));
    else out.push(relative(root, full));
  }
  return out;
}

/** Everything the blueprint owns right now, by the same rules the lock uses. */
export async function currentFiles(root, owned = OWNED) {
  // isRegularFile is not paranoia: git lists paths that reset just deleted, and a
  // symlinked node_modules slips past a `node_modules/` gitignore rule and then
  // reads back as EISDIR. Both crashed reset partway through, after it had
  // already replaced the content.
  const listing = gitFiles(root) ?? (await walk(root));
  return listing
    .filter((path) => path !== LOCK_FILE && !isOwned(path, owned) && isRegularFile(join(root, path)))
    .sort();
}

export async function fingerprint(root, owned = OWNED) {
  const files = {};
  for (const path of await currentFiles(root, owned)) {
    files[path] = createHash('sha256').update(await readFile(join(root, path))).digest('hex').slice(0, 16);
  }
  return files;
}
