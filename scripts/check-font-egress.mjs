// astro build fetches the css2 sheet and then the woff2 files off
// fonts.gstatic.com; `cache: npm` does not cover that egress. A pool firewall
// must fail here — not halfway through `astro build`.
const CSS_URL = 'https://fonts.googleapis.com/css2?family=Inter:wght@400&display=swap';
const TIMEOUT = 15_000;

const css = await fetch(CSS_URL, { signal: AbortSignal.timeout(TIMEOUT) }).then((r) => {
  if (!r.ok) throw new Error(`${CSS_URL} answered ${r.status}`);
  return r.text();
});

const fontUrl = css.match(/https:\/\/fonts\.gstatic\.com\/[^)\s]+/)?.[0];
if (!fontUrl) throw new Error(`${CSS_URL} carried no fonts.gstatic.com URL`);

const font = await fetch(fontUrl, { signal: AbortSignal.timeout(TIMEOUT) });
if (!font.ok) throw new Error(`${fontUrl} answered ${font.status}`);

console.log(`[fonts] egress ok: ${CSS_URL} -> ${fontUrl}`);
