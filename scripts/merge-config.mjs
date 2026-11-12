// Merging a clone's config onto a newer shape, for `npm run carry`.
//
// A release can add a required key the old content cannot know about, and
// copying the old file wholesale made the build fail on `routes.projects:
// Required` -- once per new key, each fix a trip to the blueprint to look the
// value up. Spec: docs/GUIDES/UPDATING_FROM_BLUEPRINT.md

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

/**
 * The clone's values win. Keys only the new shape has are kept, and reported so
 * they get reviewed rather than silently inherited. Arrays are content -- nav,
 * social, sections -- so the clone's replaces the new one whole rather than
 * merging element by element, which would interleave demo entries into it.
 */
export function mergeKeeping(base, override, trail = [], filled = []) {
  if (!isPlainObject(base) || !isPlainObject(override)) return { value: override, filled };

  const out = { ...base };
  for (const key of Object.keys(base)) {
    if (!(key in override)) filled.push([...trail, key].join('.'));
  }
  for (const [key, value] of Object.entries(override)) {
    out[key] = key in base ? mergeKeeping(base[key], value, [...trail, key], filled).value : value;
  }
  return { value: out, filled };
}
