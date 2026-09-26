import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { startServer } from '../src/server.js';

test('server exposes preflight workspace API and Web UI', async () => {
  const workspace = await fs.mkdtemp(path.join(os.tmpdir(), 'harness-server-'));
  await fs.writeFile(path.join(workspace, 'AGENTS.md'), '# Test Rules\n');
  const server = startServer({ port: 0, workspace });
  const address = server.address();
  const port = address.port;

  try {
    const htmlRes = await fetch(`http://localhost:${port}/`);
    assert.equal(htmlRes.status, 200);
    const html = await htmlRes.text();
    assert.match(html, /Kuro | Harness Control Plane/);

    const preflightRes = await fetch(`http://localhost:${port}/api/preflight`);
    assert.equal(preflightRes.status, 200);
    const data = await preflightRes.json();
    assert.equal(data.root, path.resolve(workspace));
  } finally {
    server.close();
  }
});
