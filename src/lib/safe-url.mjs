// The one rule for URLs content may point at: navigation schemes (http, https,
// mailto, tel) and document-relative references. Every other scheme —
// javascript:, data:, vbscript: — is refused however it is disguised: entities
// are decoded and whitespace/control characters stripped first, because that is
// what the browser does before deciding what an href runs.
//
// Plain .mjs so astro.config.mjs-side code can import it too. Consumers: the
// Zod schemas (reject at build), src/lib/markdown.ts and safe-markdown.mjs
// (neutralize at render).

const SCHEME = /^[a-z][a-z0-9+.-]*:/;
const ALLOWED_SCHEMES = new Set(['http:', 'https:', 'mailto:', 'tel:']);
const NAMED_ENTITIES = { colon: ':', tab: '\t', newline: '\n' };

/** @param {unknown} value */
export function isSafeUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return false;

  const decoded = value.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);?/gi, (entity, body) => {
    const lower = body.toLowerCase();
    if (lower[0] !== '#') return NAMED_ENTITIES[lower] ?? entity;
    const hex = lower[1] === 'x';
    const code = Number.parseInt(lower.slice(hex ? 2 : 1), hex ? 16 : 10);
    return Number.isNaN(code) ? entity : String.fromCodePoint(code);
  });

  const scheme = decoded.replace(/[\s\p{Cc}\p{Cf}]+/gu, '').toLowerCase().match(SCHEME)?.[0];
  return scheme ? ALLOWED_SCHEMES.has(scheme) : true;
}
