#!/usr/bin/env node
// Every external link in the built HTML must answer. Links rot on their own schedule, not
// ours, so this runs on a timer (.github/workflows/scheduled-checks.yml), never in
// `npm test`: a third party being down must not block a merge.
// Usage: node scripts/check-external-links.mjs   (needs a build in dist/)
import { readdir, readFile } from 'node:fs/promises';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = join(resolve(dirname(fileURLToPath(import.meta.url)), '..'), 'dist');
const TIMEOUT_MS = 15_000;
// mailto:, tel:, and the placeholder origin are not links a person can click through to.
const SKIP_HOSTS = new Set(['example.com', 'www.example.com', 'localhost']);
// Social sites answer a CI runner with a wall (429 Instagram, 999 LinkedIn, 403/401 others) whatever
// the link. That says nothing about the link, so it is reported but must not fail the run.
const BLOCKED = new Set([401, 403, 429, 999]);

async function htmlFiles(dir) {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await htmlFiles(path)));
    else if (entry.name.endsWith('.html')) files.push(path);
  }
  return files;
}

/** @returns {Map<string, string[]>} URL -> pages that link to it */
export async function collectLinks(dist) {
  const links = new Map();
  for (const file of await htmlFiles(dist)) {
    const html = await readFile(file, 'utf8');
    for (const [, href] of html.matchAll(/<a\s[^>]*href="(https?:\/\/[^"#]+)/g)) {
      const url = href.replaceAll('&amp;', '&');
      if (SKIP_HOSTS.has(new URL(url).hostname)) continue;
      links.set(url, [...(links.get(url) ?? []), file.replace(dist, '') || '/']);
    }
  }
  return links;
}

/** @returns {Promise<null | { kind: 'broken' | 'blocked', detail: string }>} null when it answers */
export async function check(url) {
  // HEAD first (cheap); some servers refuse it, so a failure is retried with GET.
  for (const method of ['HEAD', 'GET']) {
    try {
      const response = await fetch(url, { method, redirect: 'follow', signal: AbortSignal.timeout(TIMEOUT_MS), headers: { 'user-agent': 'landings-link-check' } });
      if (response.ok) return null;
      if (method === 'GET') return { kind: BLOCKED.has(response.status) ? 'blocked' : 'broken', detail: `HTTP ${response.status}` };
    } catch (error) {
      if (method === 'GET') return { kind: 'broken', detail: error.name === 'TimeoutError' ? 'timeout' : String(error.cause?.code ?? error.message) };
    }
  }
  return { kind: 'broken', detail: 'unreachable' };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const links = await collectLinks(DIST);
  console.log(`[links] ${links.size} external links in the build`);
  const broken = [];
  const blocked = [];
  for (const [url, pages] of links) {
    const problem = await check(url);
    if (problem) (problem.kind === 'blocked' ? blocked : broken).push({ url, detail: problem.detail, pages });
  }
  for (const { url, detail, pages } of blocked) console.log(`  UNVERIFIED ${url}  (${detail})  on ${pages.slice(0, 3).join(', ')}`);
  for (const { url, detail, pages } of broken) console.error(`  BROKEN ${url}  (${detail})  on ${pages.slice(0, 3).join(', ')}`);
  console.log(broken.length ? `[links] ${broken.length} broken` : '[links] all answer');
  if (blocked.length) console.log(`[links] ${blocked.length} could not be verified (the site blocks bots); check them by hand`);
  process.exit(broken.length ? 1 : 0);
}
