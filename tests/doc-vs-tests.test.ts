// TESTING.md's "What is covered" table claims to enumerate the suite; #34
// added a file with no row and nothing noticed. Set equality makes the claim
// executable: a new test file without a row, or a row without a file, fails.
import { describe, expect, it } from 'vitest';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();

const suite = (await readdir(join(root, 'tests'), { recursive: true }))
  .map((file) => file.replaceAll('\\', '/'))
  .filter((file) => file.endsWith('.test.ts'))
  .map((file) => `tests/${file}`)
  .sort();

const listed = [
  ...(await readFile(join(root, 'docs/GUIDES/TESTING.md'), 'utf8')).matchAll(
    /^\| `(tests\/[^`]+\.test\.ts)` \|/gm,
  ),
]
  .map((match) => match[1]!)
  .sort();

describe('docs/GUIDES/TESTING.md "What is covered"', () => {
  it('lists exactly the test files in tests/', () => {
    expect(listed).toEqual(suite);
  });
});
