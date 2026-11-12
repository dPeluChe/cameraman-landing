// Renders inline markdown fields (richText.body, post excerpts) at build time.
// HTML is escaped before parsing, so a CMS cannot inject markup through content.
// marked emits link/image hrefs verbatim, so an unsafe target — javascript: and
// friends — is demoted to its text: the copy survives, the URL does not.
import { marked, type Token } from 'marked';
import { isSafeUrl } from './safe-url.mjs';

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
};

const dropUnsafeTarget = (token: Token) => {
  if ((token.type === 'link' || token.type === 'image' || token.type === 'def') && !isSafeUrl(token.href)) {
    // The parser renders a text token's children without the wrapper element.
    (token as { type: string }).type = 'text';
  }
};

export function renderMarkdown(source: string): string {
  const escaped = source.replace(/[&<>]/g, (char) => ESCAPES[char] ?? char);
  return marked.parse(escaped, { async: false, gfm: true, breaks: false, walkTokens: dropUnsafeTarget });
}
