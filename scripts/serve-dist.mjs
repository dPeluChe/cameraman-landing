// Serve dist/ on a free port and prove it is really this repo's build before any
// check measures it. Shared by audit-build and check-responsive: two clones
// running either at once used to collide, and the quiet failure was measuring
// the other repo. Detail: docs/ARCHITECTURE/SEO.md
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const freePort = () =>
  new Promise((done) => {
    const probe = createServer();
    probe.listen(0, () => {
      const { port } = probe.address();
      probe.close(() => done(port));
    });
  });

/** Resolves to { port, stop }. Throws if no port ends up serving this dist/. */
export async function serveDist(dist, attempts = 3) {
  const expected = await readFile(join(dist, 'index.html'), 'utf8');

  for (let attempt = 1; ; attempt += 1) {
    const port = await freePort();
    const server = spawn('npx', ['--yes', 'serve@14', dist, '-l', String(port)], { stdio: 'ignore' });

    // Poll rather than sleep: a fixed wait is a race that loses on a cold npx cache.
    let served = null;
    for (let probe = 0; probe < 40 && served === null; probe += 1) {
      await new Promise((r) => setTimeout(r, 500));
      served = await fetch(`http://localhost:${port}/`).then((r) => (r.ok ? r.text() : null), () => null);
    }

    if (served === expected) return { port, stop: () => server.kill() };

    server.kill();
    if (attempt === attempts) {
      throw new Error(`No port ended up serving ${dist}. Refusing to measure another build.`);
    }
    console.log(`[serve] port ${port} answered with something else — retrying`);
  }
}
