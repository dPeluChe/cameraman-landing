// Plain .mjs because astro.config.mjs imports it before the TS pipeline exists.
// Single-language site: set LOCALES to ['es'] — routes and switcher adapt.

/** @type {readonly ['en', 'es']} */
export const LOCALES = ['en', 'es'];

/** @type {'en'} */
export const DEFAULT_LOCALE = 'en';

export const LOCALE_LABELS = { es: 'Español', en: 'English' };

/** BCP-47 tag for <html lang> and hreflang. */
export const LOCALE_TAGS = { es: 'es-MX', en: 'en-US' };
