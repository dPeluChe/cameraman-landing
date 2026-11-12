#!/usr/bin/env node
// Interactive or flag-driven initialization wizard for new clones.
// Configures brand identity, tokens, and generates starter assets in seconds.
// Usage:
//   node scripts/init-clone.mjs
//   node scripts/init-clone.mjs --name "My Brand" --color "#0ea5e9" --email "info@mybrand.com"
import { createInterface } from 'node:readline/promises';
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PKG_PATH = join(ROOT, 'package.json');
const ES_SITE_PATH = join(ROOT, 'src', 'content', 'site', 'es.json');
const EN_SITE_PATH = join(ROOT, 'src', 'content', 'site', 'en.json');
const TOKENS_PATH = join(ROOT, 'src', 'styles', 'tokens.css');

function parseArgs() {
  const args = process.argv.slice(2);
  const flags = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      const val = args[i + 1] && !args[i + 1].startsWith('--') ? args[++i] : true;
      flags[key] = val;
    }
  }
  return flags;
}

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean, 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0')).join('');
}

function tint(hex, factor) {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r + (255 - r) * factor, g + (255 - g) * factor, b + (255 - b) * factor);
}

function shade(hex, factor) {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r * (1 - factor), g * (1 - factor), b * (1 - factor));
}

function generatePalette(baseHex) {
  return {
    '50': tint(baseHex, 0.94),
    '100': tint(baseHex, 0.82),
    '300': tint(baseHex, 0.5),
    '400': tint(baseHex, 0.25),
    '500': baseHex,
    '600': shade(baseHex, 0.15),
    '700': shade(baseHex, 0.3),
  };
}

async function runScript(cmd, args) {
  return new Promise((res, rej) => {
    const p = spawn(cmd, args, { stdio: 'inherit', cwd: ROOT });
    p.on('exit', (code) => (code === 0 ? res() : rej(new Error(`${cmd} exited with ${code}`))));
  });
}

async function main() {
  const flags = parseArgs();
  const rl = createInterface({ input: process.stdin, output: process.stdout });

  const ask = async (prompt, defVal) => {
    const answer = await rl.question(`${prompt}${defVal ? ` (${defVal})` : ''}: `);
    return answer.trim() || defVal;
  };

  console.log('\n🚀 Blueprint Clone Initializer\n');

  const brandName = flags.name || (await ask('Brand Name', 'My Brand'));
  const tagline = flags.tagline || (await ask('Tagline', 'Innovative solutions for forward-thinking teams'));
  const email = flags.email || (await ask('Contact Email', 'hello@example.com'));
  const whatsapp = flags.whatsapp || (await ask('WhatsApp phone (digits, optional)', ''));
  const brandColor = flags.color || (await ask('Primary brand color (hex)', '#2563eb'));

  rl.close();

  // 1. Update package.json
  if (existsSync(PKG_PATH)) {
    const pkg = JSON.parse(await readFile(PKG_PATH, 'utf8'));
    pkg.name = brandName.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/^-+|-+$/g, '') || 'landing';
    await writeFile(PKG_PATH, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
    console.log(`✓ Updated package.json name to "${pkg.name}"`);
  }

  // 2. Update site configs (es.json & en.json)
  for (const path of [ES_SITE_PATH, EN_SITE_PATH]) {
    if (existsSync(path)) {
      const site = JSON.parse(await readFile(path, 'utf8'));
      site.brand.name = brandName;
      if (tagline) site.brand.tagline = tagline;
      site.seo.defaultTitle = brandName;
      if (tagline) site.seo.defaultDescription = `${brandName} — ${tagline}. Contact us today to learn more.`;
      site.contact.email = email;
      if (whatsapp) site.contact.whatsapp = whatsapp.replace(/\D/g, '');
      await writeFile(path, JSON.stringify(site, null, 2) + '\n', 'utf8');
      console.log(`✓ Updated site config at ${path}`);
    }
  }

  // 3. Update brand tokens if valid hex
  if (/^#[0-9a-fA-F]{6}$/.test(brandColor) && existsSync(TOKENS_PATH)) {
    const palette = generatePalette(brandColor);
    let tokens = await readFile(TOKENS_PATH, 'utf8');
    tokens = tokens
      .replace(/--brand-50:\s*#[0-9a-fA-F]{6};/, `--brand-50: ${palette['50']};`)
      .replace(/--brand-100:\s*#[0-9a-fA-F]{6};/, `--brand-100: ${palette['100']};`)
      .replace(/--brand-300:\s*#[0-9a-fA-F]{6};/, `--brand-300: ${palette['300']};`)
      .replace(/--brand-400:\s*#[0-9a-fA-F]{6};/, `--brand-400: ${palette['400']};`)
      .replace(/--brand-500:\s*#[0-9a-fA-F]{6};/, `--brand-500: ${palette['500']};`)
      .replace(/--brand-600:\s*#[0-9a-fA-F]{6};/, `--brand-600: ${palette['600']};`)
      .replace(/--brand-700:\s*#[0-9a-fA-F]{6};/, `--brand-700: ${palette['700']};`);
    await writeFile(TOKENS_PATH, tokens, 'utf8');
    console.log(`✓ Updated tokens.css with new brand palette for ${brandColor}`);
  }

  // 4. Generate OG image
  try {
    await runScript('node', ['scripts/generate-og.mjs']);
  } catch {
    console.warn('⚠️ Could not generate OG image automatically.');
  }

  console.log('\n✨ Project initialized successfully! Run `npm run dev` to start.\n');
}

main().catch((err) => {
  console.error('[init-clone] Error:', err);
  process.exit(1);
});
