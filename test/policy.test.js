import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import { PolicyEngine } from '../src/policy.js';

const workspace = path.resolve('/tmp/harness-policy-workspace');
const policy = new PolicyEngine({ workspace, networkEnabled: false });

test('allows workspace reads and blocks path escapes', () => {
  assert.equal(policy.evaluate('file_read', { path: 'src/index.js' }).allowed, true);
  const result = policy.evaluate('file_read', { path: '../secret.txt' });
  assert.equal(result.allowed, false);
  assert.equal(result.reason, 'path_escape');
});

test('blocks destructive shell commands', () => {
  const result = policy.evaluate('shell_exec', { command: 'rm -rf /tmp/anything' });
  assert.equal(result.allowed, false);
  assert.equal(result.reason, 'dangerous_command');
});

test('keeps network disabled unless explicitly enabled', () => {
  const result = policy.evaluate('web_fetch', { url: 'https://example.com' });
  assert.equal(result.allowed, false);
  assert.equal(result.reason, 'network_disabled');
});
