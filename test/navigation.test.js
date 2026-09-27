import assert from 'node:assert/strict';
import test from 'node:test';
import { CodebaseNavigator } from '../src/navigation.js';
import { ContextCompactor } from '../src/compaction.js';
import { SkillRegistry } from '../src/skills.js';
import { EvalEngine } from '../src/evals.js';

test('CodebaseNavigator scans tree and finds symbols', async () => {
  const navigator = new CodebaseNavigator({ workspace: process.cwd() });
  const tree = await navigator.scanTree();
  assert.ok(tree.length > 0);

  const symbols = await navigator.findSymbols('CodebaseNavigator');
  assert.ok(symbols.length > 0);
  assert.equal(symbols[0].name, 'CodebaseNavigator');
});

test('ContextCompactor prunes stale tool outputs and estimates tokens', () => {
  const compactor = new ContextCompactor();
  const tokens = compactor.estimateTokens('Hello World');
  assert.equal(tokens, 3);

  const messages = [
    { role: 'system', content: 'system prompt' },
    { role: 'user', content: 'user prompt' },
    { role: 'tool', content: 'A'.repeat(5000) },
    { role: 'assistant', content: 'assistant response' },
    { role: 'user', content: 'followup prompt' },
  ];

  const pruned = compactor.pruneMessages(messages, 100);
  assert.ok(pruned[2].content.includes('Pruned 4900 characters'));
});

test('SkillRegistry loads and matches skills', async () => {
  const registry = new SkillRegistry({ workspace: process.cwd() });
  const skills = await registry.loadSkills();
  assert.ok(skills.length > 0);

  const matched = registry.matchSkills('codebase navigation');
  assert.ok(matched.length > 0);
  assert.equal(matched[0].id, 'navigation');
});

test('EvalEngine asserts evidence and runs verification', async () => {
  const evals = new EvalEngine({ workspace: process.cwd() });
  const result = await evals.runVerification('node -v');
  assert.equal(result.passed, true);

  const evidence = evals.assertEvidence({
    verification: { executed: true },
    rejectedCount: 0,
  });
  assert.equal(evidence.passed, true);
});
