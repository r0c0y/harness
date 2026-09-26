import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { ControlPlane } from '../src/control-plane.js';
import { EvidenceLedger } from '../src/ledger.js';
import { PolicyEngine } from '../src/policy.js';
import { WorkspaceTools } from '../src/tools.js';

test('executes an allowed tool call and records evidence', async () => {
  const workspace = await fs.mkdtemp(path.join(os.tmpdir(), 'harness-control-'));
  await fs.writeFile(path.join(workspace, 'sample.txt'), 'hello\nworld\n');
  const provider = new ScriptedProvider([
    { role: 'assistant', tool_calls: [{ id: 'call_1', function: { name: 'file_read', arguments: JSON.stringify({ path: 'sample.txt' }) } }] },
    { role: 'assistant', content: 'Read sample.txt and found two lines.' },
  ]);
  const plane = new ControlPlane({
    provider,
    tools: new WorkspaceTools({ workspace }),
    policy: new PolicyEngine({ workspace }),
    ledger: new EvidenceLedger({ workspace, runId: 'test-run' }),
  });

  const result = await plane.run('Inspect sample.txt');
  assert.equal(result.toolCalls, 1);
  assert.match(result.answer, /two lines/);
  const ledger = await fs.readFile(path.join(workspace, '.ai-harness', 'runs', 'test-run.jsonl'), 'utf8');
  assert.match(ledger, /tool_policy/);
  assert.match(ledger, /tool_result/);
});

test('returns a policy rejection to the model instead of running a blocked command', async () => {
  const workspace = await fs.mkdtemp(path.join(os.tmpdir(), 'harness-control-'));
  const provider = new ScriptedProvider([
    { role: 'assistant', tool_calls: [{ id: 'call_1', function: { name: 'shell_exec', arguments: JSON.stringify({ command: 'sudo reboot' }) } }] },
    { role: 'assistant', content: 'The blocked command was not executed.' },
  ]);
  const plane = new ControlPlane({
    provider,
    tools: new WorkspaceTools({ workspace }),
    policy: new PolicyEngine({ workspace }),
    ledger: new EvidenceLedger({ workspace, runId: 'blocked-run' }),
  });

  const result = await plane.run('Restart the machine');
  assert.equal(result.toolCalls, 1);
  assert.match(result.answer, /not executed/);
  assert.match(provider.messages.at(-1).content, /blocked/);
});

test('executes file_replace tool call successfully', async () => {
  const workspace = await fs.mkdtemp(path.join(os.tmpdir(), 'harness-replace-'));
  await fs.writeFile(path.join(workspace, 'config.js'), 'const port = 3000;\n');
  const provider = new ScriptedProvider([
    { role: 'assistant', tool_calls: [{ id: 'call_1', function: { name: 'file_replace', arguments: JSON.stringify({ path: 'config.js', old_text: '3000', new_text: '8080' }) } }] },
    { role: 'assistant', content: 'Replaced port number with 8080.' },
  ]);
  const plane = new ControlPlane({
    provider,
    tools: new WorkspaceTools({ workspace }),
    policy: new PolicyEngine({ workspace }),
    ledger: new EvidenceLedger({ workspace, runId: 'replace-run' }),
    workspace,
  });

  const result = await plane.run('Update port');
  assert.equal(result.toolCalls, 1);
  const updated = await fs.readFile(path.join(workspace, 'config.js'), 'utf8');
  assert.equal(updated, 'const port = 8080;\n');
  assert.equal(result.verified, false);
  assert.match(result.answer, /without a passing standard verification/);
});

test('executes project_verify quick check', async () => {
  const workspace = await fs.mkdtemp(path.join(os.tmpdir(), 'harness-verify-'));
  const provider = new ScriptedProvider([
    { role: 'assistant', tool_calls: [{ id: 'call_1', function: { name: 'project_verify', arguments: JSON.stringify({ level: 'quick' }) } }] },
    { role: 'assistant', content: 'Verified diff status.' },
  ]);
  const plane = new ControlPlane({
    provider,
    tools: new WorkspaceTools({ workspace }),
    policy: new PolicyEngine({ workspace }),
    ledger: new EvidenceLedger({ workspace, runId: 'verify-run' }),
    workspace,
  });

  const result = await plane.run('Run quick verification');
  assert.equal(result.toolCalls, 1);
  assert.match(result.answer, /Verified diff/);
});

class ScriptedProvider {
  constructor(messages) {
    this.responses = [...messages];
    this.messages = [];
  }

  async next(messages) {
    this.messages = messages;
    const response = this.responses.shift();
    if (!response) throw new Error('Scripted provider exhausted.');
    return response;
  }
}


test('standard verification is required after an edit', async () => {
  const workspace = await fs.mkdtemp(path.join(os.tmpdir(), 'harness-gate-'));
  await fs.writeFile(path.join(workspace, 'config.js'), 'const ready = false;\n');
  const provider = new ScriptedProvider([
    { role: 'assistant', tool_calls: [{ id: 'edit', function: { name: 'file_replace', arguments: JSON.stringify({ path: 'config.js', old_text: 'false', new_text: 'true' }) } }] },
    { role: 'assistant', tool_calls: [{ id: 'quick', function: { name: 'project_verify', arguments: JSON.stringify({ level: 'quick' }) } }] },
    { role: 'assistant', content: 'Solved.' },
  ]);
  const plane = new ControlPlane({ provider, tools: new WorkspaceTools({ workspace }), policy: new PolicyEngine({ workspace }), ledger: new EvidenceLedger({ workspace, runId: 'gate-run' }), workspace });
  const result = await plane.run('Fix config');
  assert.equal(result.verified, false);
  assert.match(result.answer, /without a passing standard verification/);
});
