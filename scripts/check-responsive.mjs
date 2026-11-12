#!/usr/bin/env node
// Fails when any built page overflows horizontally at a declared width.
//
// Horizontal overflow is the one layout bug that is objectively wrong at every
// viewport — the page scrolls sideways and content leaves the screen. Everything
// else about "responsive" is judgement and belongs to a human with eyes; this is
// the part a machine can own, so it should.
//
// Needs a real browser, so it is not part of `npm test`. Run it beside
// `npm run audit`. Details: docs/GUIDES/TESTING.md
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { rankedRoutes } from './built-routes.mjs';
import { serveDist } from './serve-dist.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');

// 320 is the narrowest phone still in use; 1024 is where the desktop nav appears.
// A clone with a different breakpoint story should edit this list, not delete it.
const WIDTHS = [320, 375, 414, 768, 1024];

// Unique per run. A fixed path is the same collision the fixed port was: two
// clones checking at once fought over one Chrome profile directory.
const PROFILE = await mkdtemp(join(tmpdir(), 'landings-responsive-'));

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);

const chrome = CHROME_CANDIDATES.find((path) => existsSync(path));
if (!chrome) {
  console.error('[responsive] No Chrome found. Set CHROME_PATH to a Chrome or Chromium binary.');
  process.exit(1);
}

if (!existsSync(DIST)) {
  console.error('[responsive] dist/ not found. Run `npm run build` first.');
  process.exit(1);
}

const { port, stop: stopServer } = await serveDist(DIST).catch((error) => {
  console.error(`[responsive] ${error.message}`);
  process.exit(1);
});

const browser = spawn(chrome, [
  '--headless',
  '--disable-gpu',
  '--remote-debugging-port=0',
  `--user-data-dir=${PROFILE}`,
  'about:blank',
]);

// Cleanup must never decide the exit code. Removing the profile while Chrome is
// still shutting down threw ENOTEMPTY and turned a passing run into a red one.
const cleanup = () => {
  browser.kill();
  stopServer();
  rm(PROFILE, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }).catch(() => {});
};
process.on('exit', cleanup);
process.on('SIGINT', () => process.exit(130));

/** Chrome prints its DevTools endpoint on stderr when the port is 0. That one is
    the BROWSER target, which cannot navigate or evaluate — the page target has to
    be looked up over HTTP on the same port. */
const browserEndpoint = await new Promise((done, fail) => {
  const timer = setTimeout(() => fail(new Error('Chrome did not report a DevTools endpoint')), 20000);
  browser.stderr.on('data', (chunk) => {
    const match = /ws:\/\/[^\s]+/.exec(String(chunk));
    if (match) {
      clearTimeout(timer);
      done(match[0]);
    }
  });
}).catch((error) => {
  console.error(`[responsive] ${error.message}`);
  cleanup();
  process.exit(1);
});

const devtoolsPort = new URL(browserEndpoint.replace('ws://', 'http://')).port;
const targets = await fetch(`http://127.0.0.1:${devtoolsPort}/json`).then((r) => r.json());
const page = targets.find((target) => target.type === 'page');

if (!page) {
  console.error('[responsive] Chrome exposed no page target.');
  cleanup();
  process.exit(1);
}

const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (socket.onopen = r));

let messageId = 0;
const pending = new Map();
socket.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) pending.get(message.id)(message.result);
};
const send = (method, params = {}) =>
  new Promise((r) => {
    const id = ++messageId;
    pending.set(id, r);
    socket.send(JSON.stringify({ id, method, params }));
  });

await send('Page.enable');

// Reported rather than thrown one at a time: seeing every offender at once is
// what makes the fix one pass instead of five.
const OFFENDERS = `(() => {
  const vw = document.documentElement.clientWidth;
  const out = [];
  // Past the edge is fine inside a box that scrolls or clips it (tab strip, code block,
  // marquee) and fits the viewport itself; a box wider than the viewport is reported on its own.
  const contained = (el) => {
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      const x = getComputedStyle(p).overflowX;
      if (['auto', 'scroll', 'hidden', 'clip'].includes(x) && p.getBoundingClientRect().right <= vw + 1) return true;
    }
    return false;
  };
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();
    if ((r.width > vw + 1 || r.right > vw + 1) && !contained(el)) {
      const cls = el.className?.baseVal ?? String(el.className ?? '');
      out.push(el.tagName.toLowerCase() + (cls ? '.' + cls.split(' ').slice(0, 2).join('.') : ''));
    }
  }
  return JSON.stringify({ vw, scrollW: document.documentElement.scrollWidth, offenders: [...new Set(out)].slice(0, 4) });
})()`;

const routes = process.argv.slice(2).length ? process.argv.slice(2) : await rankedRoutes(DIST);
const problems = [];

for (const route of routes) {
  const results = [];
  for (const width of WIDTHS) {
    await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 768 });
    await send('Page.navigate', { url: `http://localhost:${port}${route}` });
    await new Promise((r) => setTimeout(r, 700));

    const { result } = await send('Runtime.evaluate', { expression: OFFENDERS, returnByValue: true });
    const { vw, scrollW, offenders } = JSON.parse(result.value);

    if (scrollW > vw || offenders.length) {
      problems.push(`${route} @${width}px — scrollWidth ${scrollW} > ${vw}${offenders.length ? ` · ${offenders.join(', ')}` : ''}`);
      results.push(`${width}✗`);
    } else {
      results.push(`${width}✓`);
    }
  }
  console.log(`  ${problems.length && results.some((r) => r.endsWith('✗')) ? 'FAIL' : ' OK '} ${route.padEnd(32)} ${results.join('  ')}`);
}

socket.close();
cleanup();

if (problems.length) {
  console.error(`\n[responsive] Horizontal overflow:\n${problems.map((p) => `  ${p}`).join('\n')}`);
  process.exit(1);
}
console.log(`\n[responsive] No horizontal overflow across ${routes.length} routes × ${WIDTHS.length} widths.`);
