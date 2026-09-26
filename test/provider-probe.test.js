import assert from 'node:assert/strict';
import test from 'node:test';
import { OpenAICompatibleProvider } from '../src/provider.js';

test('provider probe validates a native tool call without executing it', async () => {
  const originalFetch = globalThis.fetch;
  let request;
  globalThis.fetch = async (_url, options) => {
    request = JSON.parse(options.body);
    return new Response(JSON.stringify({
      model: 'qwen/actual-route',
      choices: [{ message: { role: 'assistant', tool_calls: [{ id: 'probe_1', function: { name: 'probe_echo', arguments: '{"value":"ready"}' } }] } }],
    }), { status: 200, headers: { 'content-type': 'application/json' } });
  };
  try {
    const provider = new OpenAICompatibleProvider({ baseUrl: 'http://127.0.0.1:8000/v1', apiKey: 'test-key', model: 'test-model' });
    const result = await provider.probe();
    assert.equal(result.ok, true);
    assert.equal(result.routed_model, 'qwen/actual-route');
    assert.equal(request.tool_choice, 'auto');
    assert.equal(request.tools[0].function.name, 'probe_echo');
  } finally {
    globalThis.fetch = originalFetch;
  }
});


test('probe rejects text-only and malformed tool calls', async () => {
  const originalFetch = globalThis.fetch;
  const responses = [
    { model: 'deepseek/test', choices: [{ message: { role: 'assistant', content: '{"value":"ready"}' } }] },
    { model: 'qwen/test', choices: [{ message: { role: 'assistant', tool_calls: [{ id: 'c', function: { name: 'probe_echo', arguments: '{broken' } }] } }] },
  ];
  globalThis.fetch = async () => new Response(JSON.stringify(responses.shift()), { status: 200 });
  try {
    const provider = new OpenAICompatibleProvider({ baseUrl: 'https://provider.example/v1', apiKey: 'test-key', model: 'requested' });
    const textOnly = await provider.probe();
    assert.equal(textOnly.ok, false);
    assert.equal(textOnly.routed_model, 'deepseek/test');
    const malformed = await provider.probe();
    assert.equal(malformed.ok, false);
    assert.equal(malformed.routed_model, 'qwen/test');
  } finally { globalThis.fetch = originalFetch; }
});
