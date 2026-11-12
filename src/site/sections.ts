// Section types this site adds on top of the blueprint's. Empty in the blueprint.
// A clone returns its zod variants here (discriminated on `type`) and renders them
// in ./SiteSection.astro; no blueprint file changes. docs/GUIDES/EXTENDING.md
import type { ImageFn } from '../schemas/primitives';

export const buildSiteSections = (_image: ImageFn) => [] as const;
