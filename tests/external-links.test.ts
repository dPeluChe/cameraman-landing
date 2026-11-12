import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { check } from '../scripts/check-external-links.mjs';

let server: Server;
let base = '';

beforeAll(async () => {
  server = createServer((req, res) => {
    const status = Number(req.url?.slice(1));
    res.writeHead(status);
    res.end();
  });
  await new Promise<void>((done) => server.listen(0, '127.0.0.1', done));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(() => new Promise<void>((done) => server.close(() => done())));

describe('external link check', () => {
  it('accepts a link that answers', async () => {
    expect(await check(`${base}/200`)).toBeNull();
  });

  it('fails a dead link', async () => {
    expect(await check(`${base}/404`)).toEqual({
      kind: 'broken',
      detail: 'HTTP 404',
    });
    expect(await check(`${base}/500`)).toEqual({
      kind: 'broken',
      detail: 'HTTP 500',
    });
  });

  it('does not fail a link the site blocks for bots (429, 999, 403)', async () => {
    for (const status of [429, 999, 403]) {
      expect(await check(`${base}/${status}`), String(status)).toEqual({
        kind: 'blocked',
        detail: `HTTP ${status}`,
      });
    }
  });

  it('fails a host that does not resolve', async () => {
    expect((await check('http://no-such-host.invalid/'))?.kind).toBe('broken');
  });
});
