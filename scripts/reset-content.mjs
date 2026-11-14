#!/usr/bin/env node
// Replaces the demo content with placeholders that are valid against the schema
// but obviously unfinished. The risk demo copy carries is not that it exists —
// it is that it reads plausible, so it survives review and reaches a client site.
// Dry run by default. See docs/GUIDES/NEW_LANDING.md
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { execFileSync } from 'node:child_process';

import { LOCALES } from '../src/lib/locales.mjs';
import { isUnusable } from '../src/lib/site-url.mjs';
import { LOCK_FILE, OWNED, fingerprint } from './blueprint-lock.mjs';
import {
  BLUEPRINT_IDENTITY,
  BLUEPRINT_REPO,
  CLONE_CHECKLIST,
  CLONE_IDENTITY,
  CLONE_TASK_TODO,
  DROP,
  cloneReadme,
} from './reset-templates.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = join(ROOT, 'src', 'content');
const APPLY = process.argv.includes('--yes');

// The origin differs in every clone, so cleaning one up includes naming it. Optional here
// (the build refuses to deploy without it anyway), but when given it must be usable, and a
// bad value stops the reset before anything is rewritten.
const siteUrlFlag = process.argv.indexOf('--site-url');
const SITE_URL = siteUrlFlag === -1 ? undefined : (process.argv[siteUrlFlag + 1] ?? '').trim().replace(/\/$/, '');
if (SITE_URL !== undefined && isUnusable(SITE_URL)) {
  console.error(`[reset] --site-url must be the clone's real origin, e.g. https://clientdomain.com (got "${SITE_URL}").`);
  process.exit(1);
}

/** Writes SITE_URL into .env (created from .env.example), so local builds and tests use it. */
async function writeSiteUrl() {
  if (!SITE_URL) return null;
  const file = join(ROOT, '.env');
  const base = existsSync(file) ? await readFile(file, 'utf8') : await readFile(join(ROOT, '.env.example'), 'utf8');
  const line = `SITE_URL="${SITE_URL}"`;
  const next = /^SITE_URL=.*$/m.test(base) ? base.replace(/^SITE_URL=.*$/m, line) : `${line}\n${base}`;
  if (APPLY) await writeFile(file, next, 'utf8');
  return `.env (SITE_URL=${SITE_URL})`;
}

// A clone that keeps the blueprint's origin can push a client's content into the
// blueprint. Cheap to leave wired by accident, expensive to notice afterwards.
function checkRemote() {
  let origin;
  try {
    origin = execFileSync('git', ['remote', 'get-url', 'origin'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return; // no repo or no origin: nothing to point at the wrong place
  }

  if (!/[:/]dPeluChe\/landings-base(\.git)?$/.test(origin)) return;

  console.error(`\n[reset] STOP — origin still points at the blueprint: ${origin}`);
  console.error('[reset] A push from here would land the client\'s content in the blueprint.');
  console.error('[reset] Give this clone its own repo first:');
  console.error('[reset]   rm -rf .git && git init && git branch -M main');
  console.error('[reset]   gh repo create dPeluChe/<client>-landing --private --source=. --push');
  process.exit(1);
}

checkRemote();

const TODO = 'TODO';
const filler = (what) =>
  `${TODO}: replace this ${what}. It is long enough to satisfy the schema and short enough to fit a search result.`;

// Segments follow the locale's own language; an unknown locale falls back to the
// route key, which is always a valid segment.
const SEGMENTS = {
  es: { services: 'servicios', about: 'nosotros', updates: 'novedades', projects: 'proyectos', contact: 'contacto' },
};

// updates and projects start off: a clone that has neither would otherwise ship
// two empty listings, and turning one on is a line of config.
const OFF_BY_DEFAULT = new Set(['updates', 'projects']);

const routesFor = (locale) =>
  Object.fromEntries(
    ['services', 'about', 'updates', 'projects', 'contact'].map((key) => [
      key,
      { enabled: !OFF_BY_DEFAULT.has(key), segment: SEGMENTS[locale]?.[key] ?? key },
    ]),
  );

const site = (locale) => ({
  locale,
  brand: {
    name: `${TODO} Brand name`,
    tagline: `${TODO}: one sentence on what this business does.`,
    logo: {
      light: { src: '../../assets/brand/logo.svg', alt: `${TODO} Brand name`, width: 200, height: 40 },
    },
  },
  contact: { email: 'todo@example.com', openingHours: [] },
  social: [],
  seo: {
    defaultTitle: `${TODO} Brand name`,
    titleTemplate: '%title% | %brand%',
    defaultDescription: filler('site description'),
    defaultOgImage: '/og/default.png',
    robots: { index: false, follow: true },
    verification: {},
  },
  organization: { type: 'Organization', sameAs: [] },
  nav: [],
  footer: { columns: [], legalLinks: [], copyright: '© %year% %brand%.' },
  features: { darkMode: true, defaultTheme: 'system', showThemeToggle: true, scrollLayout: 'flow' },
  contactForm: { provider: 'mailto' },
  routes: routesFor(locale),
});

// One section per page: enough to build and to show where content goes, too
// little to be mistaken for finished work.
const page = (locale, route, extra) => ({
  locale,
  route,
  seo: { title: `${TODO} ${route} title`, description: filler(`${route} description`), noindex: false },
  sections: [
    {
      type: 'hero',
      title: `${TODO}: headline for the ${route} page`,
      subtitle: filler('subtitle'),
      actions: [],
    },
    ...extra,
  ],
});

const PAGES = (locale) => ({
  index: page(locale, 'index', [
    {
      type: 'services',
      title: `${TODO}: what you offer`,
      items: [
        { icon: 'circle', title: `${TODO} item one`, description: filler('description') },
        { icon: 'circle', title: `${TODO} item two`, description: filler('description') },
      ],
    },
    { type: 'cta', title: `${TODO}: closing call to action`, actions: [{ label: `${TODO} button`, href: '#', variant: 'primary' }] },
  ]),
  services: page(locale, 'services', []),
  about: page(locale, 'about', [{ type: 'richText', body: `${TODO}: tell the story of this business in Markdown.` }]),
  updates: page(locale, 'updates', []),
  projects: page(locale, 'projects', []),
  contact: page(locale, 'contact', [
    {
      type: 'contactForm',
      title: `${TODO}: contact heading`,
      submitLabel: `${TODO} send`,
      successMessage: `${TODO}: confirmation message`,
      errorMessage: `${TODO}: failure message`,
      extraFields: [],
    },
  ]),
});

// reset is the moment the repo stops being a blueprint. Anything that instructs
// someone how to CREATE a landing, or tracks the blueprint's own work, is noise
// here — and worse, it invites a clone to carry upstream concerns in its backlog.
async function retargetAgentInstructions() {
  const file = join(ROOT, 'CLAUDE.md');
  const current = await readFile(file, 'utf8');

  if (current.includes(CLONE_IDENTITY)) return 'CLAUDE.md (already retargeted)';
  if (!current.includes(BLUEPRINT_IDENTITY)) {
    console.warn('[reset] CLAUDE.md: "What this repo is" was edited — retarget it by hand.');
    return null;
  }

  if (APPLY) await writeFile(file, current.replace(BLUEPRINT_IDENTITY, CLONE_IDENTITY), 'utf8');
  return 'CLAUDE.md (retargeted to a clone)';
}

/** Docs index for the clone README, minus the guide that no longer exists. */
async function docsIndex() {
  const rows = [
    ['ARCHITECTURE/CONTENT_SCHEMA.md', 'What content is allowed to be'],
    ['ARCHITECTURE/ROUTING.md', 'Routes, URL segments, hreflang'],
    ['ARCHITECTURE/SEO.md', 'What metadata ships and where it comes from'],
    ['ARCHITECTURE/STRUCTURE.md', 'Where things live'],
    ['CLONE_CHECKLIST.md', 'This clone\'s working list: inputs, what failed, before launch'],
    ['GUIDES/BRAND_TOKENS.md', 'Rebranding and contrast'],
    ['GUIDES/STATIC_ASSETS.md', 'Favicons, manifest, OG image'],
    ['GUIDES/CONTACT_FORM.md', 'Form transport'],
    ['GUIDES/ANALYTICS.md', 'Turning analytics on'],
    ['GUIDES/DEPLOY.md', 'Vercel setup and env vars'],
    ['GUIDES/TESTING.md', 'What the suite covers'],
  ];
  return ['| Doc | Covers |', '|---|---|', ...rows.map(([f, w]) => `| [${f}](docs/${f}) | ${w} |`)].join('\n');
}

async function stripBlueprintDocs() {
  const done = [];

  for (const relative of DROP) {
    const target = join(ROOT, relative);
    if (!existsSync(target)) continue;
    done.push(`${relative} (delete)`);
    if (APPLY) await rm(target, { recursive: true, force: true });
  }

  done.push('README.md (rewritten for a clone)');
  if (APPLY) await writeFile(join(ROOT, 'README.md'), cloneReadme(await docsIndex()), 'utf8');

  // Created once and never overwritten: a rerun of reset must not wipe the clone's own notes.
  const checklist = join(ROOT, 'docs', 'CLONE_CHECKLIST.md');
  if (!existsSync(checklist)) {
    done.push('docs/CLONE_CHECKLIST.md (created: the working list lives in the clone)');
    if (APPLY) await writeFile(checklist, CLONE_CHECKLIST, 'utf8');
  }

  done.push('docs/TASK_TODO.md (reset to this landing\'s backlog)');
  if (APPLY) await writeFile(join(ROOT, 'docs', 'TASK_TODO.md'), CLONE_TASK_TODO, 'utf8');

  const index = join(ROOT, 'docs', 'README.md');
  const current = await readFile(index, 'utf8');
  const withoutGuide = current
    .split('\n')
    .filter((line) => !line.includes('NEW_LANDING.md'))
    .join('\n');
  if (withoutGuide !== current) {
    done.push('docs/README.md (dropped the clone guide row)');
    if (APPLY) await writeFile(index, withoutGuide, 'utf8');
  }

  return done;
}

const planned = [];
const write = async (relative, data) => {
  planned.push(relative);
  if (!APPLY) return;
  const target = join(CONTENT, relative);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
};

for (const locale of LOCALES) {
  await write(join('site', `${locale}.json`), site(locale));
  for (const [route, data] of Object.entries(PAGES(locale))) {
    await write(join('pages', locale, `${route}.json`), data);
  }

  // Detail entries are the client's own work; a placeholder project would be a
  // TODO that renders as a real portfolio card. Both listings handle empty.
  for (const collection of ['posts', 'projects']) {
    const dir = join(CONTENT, collection, locale);
    if (!existsSync(dir)) continue;

    for (const file of await readdir(dir)) {
      planned.push(join(collection, locale, file) + ' (delete)');
      if (APPLY) await rm(join(dir, file));
    }
  }
}

// Written last: it fingerprints the repo as the clone starts, which is exactly
// the blueprint state. tests/blueprint-drift.test.ts checks it from then on.
async function writeLock() {
  if (APPLY) {
    const lock = {
      blueprint: BLUEPRINT_REPO,
      note: 'Files the clone owns are listed in `owned`. Everything in `files` belongs to the blueprint — see docs/GUIDES/UPDATING_FROM_BLUEPRINT.md',
      owned: OWNED,
      files: await fingerprint(ROOT),
    };
    await writeFile(join(ROOT, LOCK_FILE), `${JSON.stringify(lock, null, 2)}\n`, 'utf8');
  }
  return `${LOCK_FILE} (fingerprint of what the blueprint shipped)`;
}

const retargeted = await retargetAgentInstructions();
if (retargeted) planned.push(retargeted);
planned.push(...(await stripBlueprintDocs()));
planned.push(await writeLock());
const wroteEnv = await writeSiteUrl();
if (wroteEnv) planned.push(wroteEnv);

for (const line of planned) console.log(`  ${APPLY ? 'wrote' : 'would write'}  ${line}`);

if (!APPLY) {
  console.log(`\n[reset] Dry run. Re-run with --yes to apply.`);
  console.log(`[reset] The demo content stays available in the blueprint repo if you need it as reference.`);
  process.exit(0);
}

console.log(`\n[reset] Done. src/content/ is now placeholders, valid against the schema.`);
console.log(`[reset] robots.index is OFF and updates is DISABLED so a half-finished clone cannot get indexed.`);
console.log(`[reset] CLAUDE.md and README.md now describe a clone, not the blueprint.`);
console.log(`[reset] Blueprint bugs or improvements go to ${BLUEPRINT_REPO}/issues, not this backlog.`);
console.log(`[reset] SITE_URL is different in every clone and lives in three places, none of them the repo:`);
console.log(`[reset]   1. .env${SITE_URL ? ' (written)' : '   -> re-run with --site-url https://<domain>, or edit it'}`);
console.log(`[reset]   2. Vercel: Settings > Environment Variables, for Preview AND Production`);
console.log(`[reset]   3. GitHub: gh variable set SITE_URL --body "${SITE_URL ?? 'https://<domain>'}"   (the clone's CI refuses to build without it)`);
console.log(`[reset] Next: tokens.css, src/assets/brand/*, then \`npm run assets\`, then fill src/content/.`);
console.log(`[reset] Nothing ships while a ${TODO} remains: \`npm test\` fails on leftovers.`);
