// Defaults for the networks most clients have, so the common case needs no icon
// in content. lucide ships no brand marks for tiktok, threads, pinterest,
// spotify or behance -- those need an explicit `icon`, which is exactly why the
// platform list is not an enum: the blueprint cannot know what a client uses.
// Guide: docs/ARCHITECTURE/CONTENT_SCHEMA.md#social

const DEFAULT_ICONS: Record<string, string> = {
  facebook: 'facebook',
  instagram: 'instagram',
  linkedin: 'linkedin',
  x: 'x',
  twitter: 'twitter',
  youtube: 'youtube',
  github: 'github',
  twitch: 'twitch',
  dribbble: 'dribbble',
  slack: 'slack',
  telegram: 'send',
  whatsapp: 'message-circle',
  tiktok: 'music',
  rss: 'rss',
};

/** Explicit icon wins; then a known platform; then a neutral link glyph. */
export function socialIcon(item: { platform: string; icon?: string }): string {
  return item.icon ?? DEFAULT_ICONS[item.platform.trim().toLowerCase()] ?? 'link';
}
