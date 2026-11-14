import { describe, expect, it } from 'vitest';
import { FONTS } from '../src/lib/fonts.mjs';
import { FONT_VARS } from '../src/lib/font-vars.mjs';

describe('fonts', () => {
  it('preloads exactly the CSS variables the config declares', () => {
    expect([...FONT_VARS].sort()).toEqual(FONTS.map((font) => font.cssVariable).sort());
  });

  it('ships no italic unless a font asks for it', () => {
    for (const font of FONTS) expect(font.styles, `${font.name}: set styles explicitly`).toBeDefined();
  });
});
