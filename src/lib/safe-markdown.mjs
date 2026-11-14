// MDAST plugin for the satteri markdown processor (wired in astro.config.mjs).
// Post bodies arrive from the CMS sync and render verbatim — unlike richText,
// which is escaped and re-parsed — so they get the same contract here: no raw
// HTML, and link/image targets pass the isSafeUrl rule. Unsafe markup keeps its
// text and loses its markup instead of failing the whole build.
import { isSafeUrl } from './safe-url.mjs';

export const safeMarkdown = {
  name: 'safe-markdown',
  html(node, ctx) {
    ctx.removeNode(node);
  },
  link(node, ctx) {
    if (!isSafeUrl(node.url)) ctx.replaceNode(node, node.children ?? []);
  },
  image(node, ctx) {
    if (!isSafeUrl(node.url)) ctx.replaceNode(node, { type: 'text', value: node.alt ?? '' });
  },
  // Reference-style targets live on the definition; with it gone the
  // reference renders as literal text, which is the CommonMark fallback.
  definition(node, ctx) {
    if (!isSafeUrl(node.url)) ctx.removeNode(node);
  },
};
