/// <reference types="vitest/config" />
// getViteConfig resolves Astro's virtual modules (astro:content) so tests can
// import from src/lib without stubbing them. The reference above teaches
// Vite's UserConfig about the `test` key.
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    restoreMocks: true,
  },
});
