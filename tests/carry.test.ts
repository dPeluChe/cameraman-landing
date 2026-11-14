// The dangerous property of `npm run carry` is not that it copies — it is what
// it does when the schema grew a required key the old content predates. Getting
// this backwards overwrites a client's config with placeholders.
import { describe, expect, it } from 'vitest';
import { mergeKeeping } from '../scripts/merge-config.mjs';

const NEW_SHAPE = {
  brand: { name: 'TODO Brand name', tagline: 'TODO tagline' },
  routes: { about: { enabled: true, segment: 'about' }, projects: { enabled: false, segment: 'projects' } },
  nav: [{ label: 'Placeholder', href: '/x' }],
};

const CLONE = {
  brand: { name: 'Skysset' },
  routes: { about: { enabled: true, segment: 'nosotros' } },
  nav: [{ label: 'Inicio', href: '/' }, { label: 'Contacto', href: '/contacto' }],
};

describe('carry merges a clone onto a newer shape', () => {
  const { value, filled } = mergeKeeping(NEW_SHAPE, CLONE);

  it("keeps the clone's value wherever it has one", () => {
    expect(value.brand.name).toBe('Skysset');
    expect(value.routes.about.segment).toBe('nosotros');
  });

  it('fills keys the release added and the clone cannot know about', () => {
    expect(value.routes.projects).toEqual({ enabled: false, segment: 'projects' });
    expect(value.brand.tagline).toBe('TODO tagline');
  });

  it('names every filled key, so none is inherited silently', () => {
    expect(filled).toContain('brand.tagline');
    expect(filled).toContain('routes.projects');
  });

  // Merging arrays element by element would interleave demo nav items into the
  // clone's menu — plausible-looking and wrong, the worst failure shape.
  it('replaces arrays whole instead of merging them', () => {
    expect(value.nav).toEqual(CLONE.nav);
  });

  it('does not mutate either input', () => {
    expect(NEW_SHAPE.brand.name).toBe('TODO Brand name');
    expect(CLONE.routes.about).not.toHaveProperty('enabled', undefined);
  });
});
