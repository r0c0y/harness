export class OpenAICompatibleProvider {
  #baseUrl;
  #apiKey;
  #model;

  constructor({ baseUrl, apiKey, model } = {}) {
    this.#apiKey = apiKey ?? process.env.AI_API_KEY ?? 'local-eval-key';
    this.#model = model ?? process.env.AI_MODEL ?? 'qwen2.5-coder';
    this.#baseUrl = baseUrl ?? process.env.AI_BASE_URL ?? 'http://127.0.0.1:8000/v1';
  }

  async next(messages, tools) {
    return this.#complete({ model: this.#model, messages, tools, tool_choice: 'auto', temperature: 0 });
  }

  async probe() {
    const message = await this.#complete({
      model: this.#model,
      temperature: 0,
      max_tokens: 128,
      messages: [
        { role: 'system', content: 'Use the supplied function tool when the user asks you to call it. Do not simulate a tool result in text.' },
        { role: 'user', content: 'Call probe_echo with value "ready" now.' },
      ],
      tools: [
        {
          type: 'function',
          function: {
            name: 'probe_echo',
            description: 'A harmless compatibility probe. Call it exactly once with the requested value.',
            parameters: {
              type: 'object',
              properties: { value: { type: 'string' } },
              required: ['value'],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: 'auto',
    });
    const call = message.tool_calls?.find(candidate => candidate.function?.name === 'probe_echo');
    if (!call) {
      return { ok: false, model: this.#model, endpoint: endpointUrl(this.#baseUrl, 'chat/completions').toString(), reason: 'No probe_echo tool call returned.' };
    }
    try {
      const args = JSON.parse(call.function.arguments);
      return args.value === 'ready'
        ? { ok: true, model: this.#model, endpoint: endpointUrl(this.#baseUrl, 'chat/completions').toString(), tool: 'probe_echo' }
        : { ok: false, model: this.#model, endpoint: endpointUrl(this.#baseUrl, 'chat/completions').toString(), reason: 'Probe returned malformed arguments.' };
    } catch {
      return { ok: false, model: this.#model, endpoint: endpointUrl(this.#baseUrl, 'chat/completions').toString(), reason: 'Probe returned non-JSON tool arguments.' };
    }
  }

  async #complete(payload) {
    const response = await fetch(endpointUrl(this.#baseUrl, 'chat/completions'), {
      method: 'POST',
      headers: { authorization: `Bearer ${this.#apiKey}`, 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(90000),
    });
    if (!response.ok) throw new Error(`Model request failed: ${response.status} ${await response.text()}`);
    const body = await response.json();
    const message = body.choices?.[0]?.message;
    if (!message) throw new Error('Model response did not include a message.');
    return message;
  }
}

export function endpointUrl(baseUrl, suffix) {
  return new URL(suffix, `${baseUrl.replace(/\/+$/, '')}/`);
}
