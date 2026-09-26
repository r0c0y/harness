import assert from 'node:assert/strict';
import test from 'node:test';
import { endpointUrl } from '../src/provider.js';

test('preserves a local OpenAI-compatible v1 path', () => {
  assert.equal(endpointUrl('http://127.0.0.1:8000/v1', 'chat/completions').toString(), 'http://127.0.0.1:8000/v1/chat/completions');
});

test('normalizes trailing slashes before appending a provider endpoint', () => {
  assert.equal(endpointUrl('https://provider.example/v1/', 'chat/completions').toString(), 'https://provider.example/v1/chat/completions');
});
