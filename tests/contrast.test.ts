// tokens.css claims its pairs pass WCAG AA. This computes the ratios so the claim
// is a check, not a comment. Lighthouse only sees pairs the demo happens to render.
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

type Rgba = { r: number; g: number; b: number; a: number };

const CSS = readFileSync(join(process.cwd(), 'src/styles/tokens.css'), 'utf8');

/** Declarations inside a given selector block. */
function block(selector: string): Map<string, string> {
  const start = CSS.indexOf(selector);
  if (start === -1) throw new Error(`Selector not found in tokens.css: ${selector}`);
  const open = CSS.indexOf('{', start);
  const close = CSS.indexOf('\n}', open);
  const out = new Map<string, string>();
  for (const line of CSS.slice(open + 1, close).split('\n')) {
    const match = line.match(/^\s*(--[\w-]+):\s*([^;]+);/);
    if (match) out.set(match[1]!, match[2]!.trim());
  }
  return out;
}

const light = block(':root');
const dark = new Map([...light, ...block("[data-theme='dark']")]);

function resolve(name: string, vars: Map<string, string>, seen = new Set<string>()): string {
  if (seen.has(name)) throw new Error(`Circular token: ${name}`);
  seen.add(name);
  const value = vars.get(name);
  if (!value) throw new Error(`Undefined token: ${name}`);
  const ref = value.match(/^var\((--[\w-]+)\)$/);
  return ref ? resolve(ref[1]!, vars, seen) : value;
}

function parseColor(value: string): Rgba {
  const hex = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    const h = hex[1]!.length === 3 ? [...hex[1]!].map((c) => c + c).join('') : hex[1]!;
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
      a: 1,
    };
  }
  // Modern syntax only: `rgb(37 99 235 / 0.16)` is what tokens.css uses.
  const rgb = value.match(/^rgb\(\s*(\d+)\s+(\d+)\s+(\d+)\s*(?:\/\s*([\d.]+)\s*)?\)$/);
  if (rgb) {
    return { r: +rgb[1]!, g: +rgb[2]!, b: +rgb[3]!, a: rgb[4] ? +rgb[4] : 1 };
  }
  throw new Error(`Unsupported color syntax: ${value}`);
}

/** A translucent token is only legible over what sits behind it. */
function flatten(fg: Rgba, bg: Rgba): Rgba {
  if (fg.a === 1) return fg;
  return {
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a),
    a: 1,
  };
}

function luminance({ r, g, b }: Rgba): number {
  const channel = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** A translucent background is itself composited over the page surface first. */
function ratio(fgToken: string, bgToken: string, vars: Map<string, string>): number {
  const surface = parseColor(resolve('--color-surface', vars));
  const bg = flatten(parseColor(resolve(bgToken, vars)), surface);
  const fg = flatten(parseColor(resolve(fgToken, vars)), bg);
  const [hi, lo] = [luminance(fg), luminance(bg)].sort((a, b) => b - a) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

// WCAG 2.2: 4.5 for body text, 3.0 for large text and non-text UI (borders, focus).
const PAIRS: { fg: string; bg: string; min: number; what: string }[] = [
  { fg: '--color-text', bg: '--color-surface', min: 4.5, what: 'body text on cards' },
  { fg: '--color-text', bg: '--color-bg', min: 4.5, what: 'body text on page' },
  { fg: '--color-text-muted', bg: '--color-surface', min: 4.5, what: 'muted copy' },
  { fg: '--color-text-muted', bg: '--color-bg', min: 4.5, what: 'muted copy on page' },
  { fg: '--color-text-subtle', bg: '--color-surface', min: 4.5, what: 'metadata' },
  { fg: '--color-text-on-brand', bg: '--brand-600', min: 4.5, what: 'label on solid button' },
  { fg: '--color-brand-fg', bg: '--color-surface', min: 4.5, what: 'brand color as text' },
  { fg: '--color-brand-fg', bg: '--color-brand-bg', min: 4.5, what: 'brand text on brand tint' },
  { fg: '--color-focus', bg: '--color-bg', min: 3, what: 'focus ring' },
  { fg: '--color-border-strong', bg: '--color-surface', min: 3, what: 'visible borders' },
  { fg: '--color-danger', bg: '--color-surface', min: 4.5, what: 'error message' },
  { fg: '--color-success', bg: '--color-surface', min: 4.5, what: 'success message' },
];

describe.each([
  ['light', light],
  ['dark', dark],
])('%s theme contrast', (theme, vars) => {
  it.each(PAIRS)('$what: $fg on $bg >= $min:1', ({ fg, bg, min }) => {
    const value = ratio(fg, bg, vars);
    expect(
      Number(value.toFixed(2)),
      `${theme}: ${fg} on ${bg} is ${value.toFixed(2)}:1, needs ${min}:1`,
    ).toBeGreaterThanOrEqual(min);
  });
});

describe('token hygiene', () => {
  it('resolves every token the dark theme overrides', () => {
    for (const name of block("[data-theme='dark']").keys()) {
      expect(() => resolve(name, dark), name).not.toThrow();
    }
  });
});
