import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import test from 'node:test';
import { WorkspaceTools } from '../src/tools.js';

test('verification fails in a non-git directory', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'verify-'));
  const tools = new WorkspaceTools({ workspace: root });
  assert.equal((await tools.execute('project_verify', { level: 'quick' })).ok, false);
  assert.equal((await tools.execute('project_verify', { level: 'standard' })).ok, false);
});

test('quick remains diagnostic and standard runs tests', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'verify-'));
  execFileSync('git', ['init', '-q', root]);
  await fs.writeFile(path.join(root, 'package.json'), JSON.stringify({ type: 'module', scripts: { test: 'node --test test.js' } }));
  await fs.writeFile(path.join(root, 'test.js'), 'import { test } from "node:test"; test("pass", () => {});\n');
  const tools = new WorkspaceTools({ workspace: root });
  const quick = await tools.execute('project_verify', { level: 'quick' });
  assert.equal(quick.ok, false);
  const standard = await tools.execute('project_verify', { level: 'standard' });
  assert.equal(standard.ok, true, JSON.stringify(standard));
  assert.equal(standard.passed, true);
});
