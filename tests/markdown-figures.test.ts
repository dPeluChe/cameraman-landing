import { describe, expect, it } from 'vitest';
import { satteri } from '@astrojs/markdown-satteri';

import { figurePlugin } from '../src/lib/markdown-figure.mjs';
import { safeMarkdown } from '../src/lib/safe-markdown.mjs';

// The real processor: captions depend on where it runs user plugins.
const render = async (body: string) => {
  const processor = satteri({ mdastPlugins: [safeMarkdown], hastPlugins: [figurePlugin] });
  return (await (await processor.createRenderer({})).render(body, {})).code;
};

describe('figurePlugin', () => {
  it('turns a lone titled image into a figure', async () => {
    const html = await render('![Gráfica](https://x.dev/a.png "Costo mensual")');

    expect(html).toContain('<figure>');
    expect(html).toContain('alt="Gráfica"');
    expect(html).toContain('<figcaption>Costo mensual</figcaption>');
    expect(html).not.toContain('<p>');
  });

  it.each([
    ['an image without a title', '![Gráfica](https://x.dev/a.png)'],
    ['an image inside running text', 'Mira ![Gráfica](https://x.dev/a.png "Pie") aquí'],
  ])('leaves %s alone', async (_, body) => {
    expect(await render(body)).not.toContain('<figure>');
  });

  it('never builds a figure around an unsafe image', async () => {
    const html = await render('![a](javascript:alert(1) "Pie")');

    expect(html).not.toContain('javascript:');
    expect(html).not.toContain('<figure>');
  });

  it('escapes HTML in the caption', async () => {
    expect(await render('![a](https://x.dev/a.png "<script>x</script>")')).not.toContain('<script>');
  });
});
