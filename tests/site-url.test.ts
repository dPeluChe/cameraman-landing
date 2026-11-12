import { describe, expect, it } from 'vitest';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PLACEHOLDER_ORIGIN, resolveSiteUrl } from '../src/lib/site-url.mjs';

const blueprint = mkdtempSync(join(tmpdir(), 'site-url-bp-'));
const clone = mkdtempSync(join(tmpdir(), 'site-url-clone-'));
writeFileSync(join(clone, '.blueprint-lock.json'), '{}');

describe('resolveSiteUrl', () => {
  it('keeps the placeholder for the blueprint demo, even in CI', () => {
    expect(resolveSiteUrl({ CI: 'true' }, blueprint)).toBe(PLACEHOLDER_ORIGIN);
  });

  it('lets a clone build locally without SITE_URL', () => {
    expect(resolveSiteUrl({}, clone)).toBe(PLACEHOLDER_ORIGIN);
  });

  it('refuses a clone deploy without a real origin', () => {
    expect(() => resolveSiteUrl({ VERCEL: '1' }, clone)).toThrow(/SITE_URL/);
    expect(() => resolveSiteUrl({ CI: 'true', SITE_URL: 'https://example.com' }, clone)).toThrow(/SITE_URL/);
  });

  it('refuses a host that is example.com or a subdomain of it, and nothing else', () => {
    for (const site of ['https://example.com', 'https://www.example.com', 'http://EXAMPLE.com/']) {
      expect(() => resolveSiteUrl({ CI: 'true', SITE_URL: site }, clone), site).toThrow(/SITE_URL/);
    }
  });

  // Matching the substring "example.com" rejected real domains that merely contain it.
  it('accepts real domains that only contain the text example.com', () => {
    for (const site of ['https://myexample.com', 'https://example.com.mx', 'https://notexample.com']) {
      expect(resolveSiteUrl({ CI: 'true', SITE_URL: site }, clone), site).toBe(site);
    }
  });

  it('refuses a value that is not an absolute URL: Astro needs a protocol', () => {
    expect(() => resolveSiteUrl({ CI: 'true', SITE_URL: 'postino.app' }, clone)).toThrow(/SITE_URL/);
  });

  it('returns the configured origin without a trailing slash', () => {
    expect(resolveSiteUrl({ VERCEL: '1', SITE_URL: 'https://www.iteris.tech/' }, clone)).toBe('https://www.iteris.tech');
  });
});
