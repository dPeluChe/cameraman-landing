#!/usr/bin/env node
// Generates the default Open Graph image (1200x630) using sharp and an SVG template.
// Reads brand identity and tagline from src/content/site/es.json and tokens.css.
import { readFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SITE_PATH = join(ROOT, 'src', 'content', 'site', 'es.json');
const TOKENS_PATH = join(ROOT, 'src', 'styles', 'tokens.css');
const OUT_DIR = join(ROOT, 'public', 'og');
const OUT_FILE = join(OUT_DIR, 'default.png');

function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case '\'':
        return '&apos;';
      case '"':
        return '&quot;';
    }
  });
}

function extractBrandColor(tokensContent) {
  const match = tokensContent.match(/--brand-500:\s*(#[0-9a-fA-F]{6}|rgb\([^)]+\))/);
  return match ? match[1] : '#2563eb';
}

async function main() {
  if (!existsSync(SITE_PATH)) {
    console.error(`[generate-og] Site config not found at ${SITE_PATH}`);
    process.exit(1);
  }

  const site = JSON.parse(await readFile(SITE_PATH, 'utf8'));
  const tokens = existsSync(TOKENS_PATH) ? await readFile(TOKENS_PATH, 'utf8') : '';
  const brandColor = extractBrandColor(tokens);

  const brandName = escapeXml(site.brand?.name ?? 'Blueprint');
  const title = escapeXml(site.seo?.defaultTitle ?? brandName);
  const tagline = escapeXml(site.brand?.tagline ?? site.seo?.defaultDescription?.slice(0, 100) ?? '');

  const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090d16" />
      <stop offset="50%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#030712" />
    </linearGradient>
    <linearGradient id="brandGlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${brandColor}" stop-opacity="0.35" />
      <stop offset="100%" stop-color="${brandColor}" stop-opacity="0" />
    </linearGradient>
    <linearGradient id="accentLine" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${brandColor}" />
      <stop offset="100%" stop-color="#38bdf8" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)" />

  <!-- Ambient Glow -->
  <circle cx="1050" cy="150" r="450" fill="url(#brandGlow)" />
  <circle cx="150" cy="550" r="350" fill="url(#brandGlow)" />

  <!-- Accent Top Border -->
  <rect x="0" y="0" width="1200" height="6" fill="url(#accentLine)" />

  <!-- Content Box -->
  <g transform="translate(100, 140)">
    <!-- Brand Badge -->
    <rect x="0" y="0" width="${Math.max(120, brandName.length * 14 + 40)}" height="42" rx="21" fill="${brandColor}" fill-opacity="0.15" stroke="${brandColor}" stroke-opacity="0.4" stroke-width="1.5" />
    <text x="20" y="27" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="700" fill="${brandColor}">
      ${brandName}
    </text>

    <!-- Main Headline -->
    <text x="0" y="140" font-family="system-ui, -apple-system, sans-serif" font-size="56" font-weight="800" fill="#f8fafc" letter-spacing="-0.02em">
      ${title.length > 35 ? title.slice(0, 32) + '...' : title}
    </text>

    <!-- Tagline / Description -->
    <text x="0" y="210" font-family="system-ui, -apple-system, sans-serif" font-size="26" font-weight="400" fill="#94a3b8" width="1000">
      ${tagline.length > 75 ? tagline.slice(0, 72) + '...' : tagline}
    </text>

    <!-- Footer URL -->
    <text x="0" y="360" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="600" fill="#64748b">
      ${escapeXml(site.brand?.name?.toLowerCase().replace(/\s+/g, '') ?? 'site')}.com
    </text>
  </g>
</svg>`;

  if (!existsSync(OUT_DIR)) {
    await mkdir(OUT_DIR, { recursive: true });
  }

  await sharp(Buffer.from(svg))
    .png({ quality: 90 })
    .toFile(OUT_FILE);

  console.log(`[generate-og] Generated Open Graph image at ${OUT_FILE}`);
}

main().catch((err) => {
  console.error('[generate-og] Error:', err);
  process.exit(1);
});
