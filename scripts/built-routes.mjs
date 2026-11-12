// Routes present in a build, so a clone that renames or disables one still works.
// Shared by audit-build and check-responsive.
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

/** Routes actually built, so a clone that renames or disables one still works. */
export async function builtRoutes(dir, prefix = '') {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) found.push(...(await builtRoutes(join(dir, entry.name), `${prefix}/${entry.name}`)));
    else if (entry.name === 'index.html') found.push(prefix || '/');
  }
  return found;
}

/** Home and one page per top-level segment first, so a truncated run still
    covers every rendering path rather than eight sibling posts. */
export async function rankedRoutes(dist) {
  const found = (await builtRoutes(dist)).filter((route) => route !== '/404').sort();
  return [...new Set([...found.filter((r) => r.split('/').length <= 2), ...found])];
}
