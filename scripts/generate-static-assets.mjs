#!/usr/bin/env node
// Rebrand step, run by hand (`npm run assets`) and the output is committed —
// it is NOT part of the build, so no deploy depends on fonts or sharp being
// available. Details: docs/GUIDES/STATIC_ASSETS.md
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

import { DEFAULT_LOCALE } from '../src/lib/locales.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC_DIR = join(ROOT, 'public');
// PNG is accepted because clients hand over PNG far more often than SVG. SVG
// first: it is the only source that gives a real favicon.svg.
const BRAND_DIR = join(ROOT, 'src/assets/brand');
const pick = (base) =>
  ['svg', 'png'].map((ext) => join(BRAND_DIR, `${base}.${ext}`)).find((file) => existsSync(file));

const ICON = pick('icon');
const LOGO = pick('logo');

if (!ICON || !LOGO) {
  console.error(`[assets] Need src/assets/brand/icon.{svg,png} and logo.{svg,png}. Found icon=${ICON ?? 'none'} logo=${LOGO ?? 'none'}.`);
  process.exit(1);
}

// The demo's own marks, by content. Generating a client's favicon set from the
// blueprint's logo used to succeed silently and ship the wrong brand — it happened
// on the first clone, which had put its PNGs beside the demo's leftover icon.svg.
const DEMO_MARKS = new Set(['1bd67ad1d4db8410', 'f861b162ccf3054f']);
const digest = (buffer) => createHash('sha256').update(buffer).digest('hex').slice(0, 16);

// The blueprint legitimately regenerates its own demo assets; a clone never should.
const isBlueprint = existsSync(join(ROOT, '.blueprint-source'));

for (const [label, file] of isBlueprint ? [] : [['icon', ICON], ['logo', LOGO]]) {
  if (DEMO_MARKS.has(digest(await readFile(file)))) {
    console.error(`[assets] ${file} is still the blueprint's demo ${label}.`);
    console.error(`[assets] Replace it with the client's mark. Generating from this would ship the demo brand.`);
    process.exit(1);
  }
}

const site = JSON.parse(await readFile(join(ROOT, `src/content/site/${DEFAULT_LOCALE}.json`), 'utf8'));
const brandName = site.brand.name;
const tagline = site.brand.tagline ?? site.seo.defaultDescription;
const themeColor = site.assets?.themeColor ?? '#ffffff';
const accent = site.assets?.maskIconColor ?? '#2563eb';

const log = (file) => console.log(`[assets] ${file}`);

async function out(relativePath, buffer) {
  const target = join(PUBLIC_DIR, relativePath);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, buffer);
  log(relativePath);
}

/** ICO with embedded PNGs. sharp cannot write .ico, and the container is trivial. */
function packIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  let offset = 6 + images.length * 16;
  const entries = images.map(({ size, data }) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += data.length;
    return entry;
  });

  return Buffer.concat([header, ...entries, ...images.map((image) => image.data)]);
}

const iconSource = await readFile(ICON);
const png = (size) => sharp(iconSource, { density: 384 }).resize(size, size).png().toBuffer();
const isVectorIcon = ICON.endsWith('.svg');

const icoSizes = [16, 32, 48];
const icoImages = await Promise.all(icoSizes.map(async (size) => ({ size, data: await png(size) })));
await out('favicon.ico', packIco(icoImages));

// A raster favicon.svg would be a lie: the tag promises a scalable source.
if (isVectorIcon) {
  await copyFile(ICON, join(PUBLIC_DIR, 'favicon.svg'));
  log('favicon.svg');
} else {
  console.warn('[assets] icon is PNG, so no favicon.svg was written.');
  console.warn('[assets] Set assets.faviconSvg to "" in src/content/site/*.json — the tags drop out on their own.');
}

await out('apple-touch-icon.png', await png(180));
await out('icon-192.png', await png(192));
await out('icon-512.png', await png(512));

// Maskable needs 20% safe padding or Android crops the mark.
await out(
  'icon-maskable-512.png',
  await sharp({ create: { width: 512, height: 512, channels: 4, background: themeColor } })
    .composite([{ input: await png(320), gravity: 'center' }])
    .png()
    .toBuffer(),
);

const escape = (value) => value.replace(/[<>&]/g, (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' })[char]);

const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="${accent}" stop-opacity="0.12"/>
    <stop offset="100%" stop-color="${accent}" stop-opacity="0.03"/>
  </linearGradient></defs>
  <rect width="1200" height="630" fill="${themeColor}"/>
  <rect width="1200" height="630" fill="url(#g)"/>
  <rect x="0" y="606" width="1200" height="24" fill="${accent}"/>
  <text x="90" y="330" font-family="Helvetica,Arial,sans-serif" font-size="76" font-weight="700" fill="#0f172a">${escape(brandName)}</text>
  <text x="90" y="400" font-family="Helvetica,Arial,sans-serif" font-size="32" fill="#475569">${escape(tagline.slice(0, 90))}</text>
</svg>`;

const logoOverlay = await sharp(await readFile(LOGO), { density: 384 }).resize({ height: 64 }).png().toBuffer();

await out(
  'og/default.png',
  await sharp(Buffer.from(ogSvg))
    .composite([{ input: logoOverlay, top: 90, left: 90 }])
    .png()
    .toBuffer(),
);

await out(
  'site.webmanifest',
  Buffer.from(
    `${JSON.stringify(
      {
        name: brandName,
        short_name: brandName,
        description: tagline,
        start_url: '/',
        display: 'standalone',
        background_color: themeColor,
        theme_color: themeColor,
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      null,
      2,
    )}\n`,
  ),
);

console.log('[assets] done — commit the files under public/');
