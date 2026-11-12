// Presentation helpers shared by components. Kept out of i18n.ts so that file
// stays about routing.
import { LOCALE_TAGS } from './locales.mjs';
import type { Locale } from './i18n';

/** Avatar fallback. `override` wins so content can fix names the split gets wrong. */
export function initialsOf(name: string, override?: string): string {
  if (override) return override;
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase();
}

export function formatDate(locale: Locale, date: Date): string {
  return date.toLocaleDateString(LOCALE_TAGS[locale], { year: 'numeric', month: 'long', day: 'numeric' });
}
