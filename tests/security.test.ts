// Content is CMS input, so every surface it can steer a URL or smuggle markup
// through gets the same rule: the schema refuses outright, the renderers
// neutralize. Each case below was an open hole before the check existed.
import { describe, expect, it } from 'vitest';
import { satteri } from '@astrojs/markdown-satteri';
import { isSafeUrl } from '../src/lib/safe-url.mjs';
import { safeMarkdown } from '../src/lib/safe-markdown.mjs';
import { renderMarkdown } from '../src/lib/markdown';
import { analyticsScript } from '../src/lib/analytics';

describe('isSafeUrl', () => {
  it.each(['/contacto', '#top', '?q=1', 'relative/page', '//cdn.example.com/x', 'mailto:a@b.c', 'tel:+521555123456', 'https://ok.dev', 'http://ok.dev'])(
    'allows %j',
    (url) => expect(isSafeUrl(url)).toBe(true),
  );

  it.each([
    'javascript:alert(1)',
    'JavaScript:alert(1)',
    '  javascript:alert(1)',
    'jav\tascript:alert(1)',
    'javascript&#58;alert(1)',
    '&#x6a;avascript:alert(1)',
    '&#106avascript:alert(1)',
    'data:text/html,<script>x</script>',
    'vbscript:x',
    'file:///etc/passwd',
    'foo:bar',
    '',
    '   ',
  ])('refuses %j', (url) => expect(isSafeUrl(url)).toBe(false));
});

describe('renderMarkdown', () => {
  it('unwraps a script-capable link to its text', () => {
    const html = renderMarkdown('[click](javascript:alert(1)) and [ok](/path)');
    expect(html).not.toContain('javascript');
    expect(html).not.toMatch(/<a[^>]*>click/);
    expect(html).toContain('click');
    expect(html).toContain('<a href="/path">ok</a>');
  });

  it('drops an image with a script-capable src, keeping the alt text', () => {
    const html = renderMarkdown('![diagram](data:text/html;base64,x)');
    expect(html).not.toContain('<img');
    expect(html).toContain('diagram');
  });

  it('neutralizes a script-capable reference definition', () => {
    const html = renderMarkdown('[click][r]\n\n[r]: javascript:alert(1)');
    expect(html).not.toContain('<a');
    expect(html).toContain('click');
  });
});

// The same entry the content layer calls: markdown.processor.createRenderer.
// A post body is raw markdown, so the plugin is the only thing between the CMS
// and the shipped HTML.
describe('post body sanitization (satteri processor)', () => {
  const render = async (body: string) =>
    (await satteri({ mdastPlugins: [safeMarkdown] }).createRenderer({})).render(body, {});

  it('strips a script block', async () => {
    const { code } = await render('<script>alert(1)</script>');
    expect(code).not.toContain('<script');
    expect(code).not.toContain('alert(1)');
  });

  it('strips inline html but keeps the text it wrapped', async () => {
    const { code } = await render('a <b onclick="x">bold</b> word');
    expect(code).not.toContain('<b');
    expect(code).toContain('bold');
  });

  it('unwraps a script-capable link to its text', async () => {
    const { code } = await render('[click](javascript:alert(1)) and [ok](/path)');
    expect(code).toContain('<a href="/path">ok</a>');
    expect(code).not.toContain('javascript');
    expect(code).toContain('click');
  });

  it('drops a script-capable reference definition', async () => {
    const { code } = await render('[click][r]\n\n[r]: javascript:alert(1)');
    expect(code).not.toContain('<a ');
    expect(code).not.toContain('javascript');
  });

  it('drops a script-capable image, keeping the alt text', async () => {
    const { code } = await render('![diagram](data:text/html;base64,x)');
    expect(code).not.toContain('<img');
    expect(code).toContain('diagram');
  });

  it('leaves safe markdown untouched', async () => {
    const { code } = await render('## T\n\n**bold** [ok](https://x.dev) ![i](/a.png)\n\n```js\ncode()\n```');
    expect(code).toContain('<strong>bold</strong>');
    expect(code).toContain('<a href="https://x.dev">ok</a>');
    expect(code).toContain('<img src="/a.png" alt="i"');
    expect(code).toContain('data-language="js"');
  });
});

describe('analytics script injection', () => {
  it('emits a GA4 snippet only for a real measurement id', () => {
    const script = analyticsScript({ provider: 'ga4', websiteId: 'G-AB12CD34' });
    expect(script?.src).toBe('https://www.googletagmanager.com/gtag/js?id=G-AB12CD34');
    expect(script?.inline).toContain('gtag(\'config\',"G-AB12CD34")');
  });

  it.each(["G-x');alert(1);//", 'not-an-id', 'g-lowercase'])('rejects the GA4 id %j', (websiteId) => {
    expect(analyticsScript({ provider: 'ga4', websiteId })).toBeNull();
  });

  it.each(['http://stats.example.com/s.js', 'javascript:alert(1)', '//stats.example.com/s.js'])(
    'rejects the scriptUrl %j',
    (scriptUrl) => {
      expect(analyticsScript({ provider: 'umami', websiteId: 'w', scriptUrl })).toBeNull();
      expect(analyticsScript({ provider: 'plausible', domain: 'd.dev', scriptUrl })).toBeNull();
    },
  );

  it('still emits plausible with the default script', () => {
    expect(analyticsScript({ provider: 'plausible', domain: 'd.dev' })?.src).toBe('https://plausible.io/js/script.js');
  });
});
