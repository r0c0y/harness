export class DeterministicOracle {
  async decide({ options, fallback }) {
    if (!options.includes(fallback)) throw new Error('Fallback must be one of the provided options.');
    return { choice: fallback, confidence: 1, source: 'deterministic' };
  }
}

export class SystemOneHttpOracle {
  #baseUrl;
  #apiKey;
  #model;

  constructor({ baseUrl, apiKey, model }) {
    this.#baseUrl = baseUrl;
    this.#apiKey = apiKey;
    this.#model = model;
  }

  async decide({ state, question, options, fallback }) {
    const response = await fetch(systemOneUrl(this.#baseUrl), {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(this.#apiKey ? { authorization: `Bearer ${this.#apiKey}` } : {}),
      },
      body: JSON.stringify({
        model: this.#model,
        state,
        questions: { decision: { type: 'choice', instructions: question, criteria: Object.fromEntries(options.map(option => [option, option])) } },
      }),
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) return { choice: fallback, confidence: 0, source: 'oracle_error' };
    const payload = await response.json();
    const answer = payload.answers?.decision;
    return options.includes(answer?.choice)
      ? { choice: answer.choice, confidence: answer.confidence ?? 0, source: 'system_one' }
      : { choice: fallback, confidence: 0, source: 'oracle_invalid' };
  }
}

function endpointUrl(baseUrl, suffix) {
  return new URL(suffix, `${baseUrl.replace(/\/+$/, '')}/`);
}

function systemOneUrl(baseUrl) {
  const normalized = baseUrl.replace(/\/+$/, '');
  return endpointUrl(normalized, normalized.endsWith('/v1') ? 'systemone' : 'v1/systemone');
}

export function createDecisionOracle(env) {
  const kind = env.HARNESS_DECISION_ORACLE ?? 'deterministic';
  if (kind === 'deterministic') return new DeterministicOracle();
  if (kind === 'jev' || kind === 'laya') {
    const baseUrl = env.HARNESS_DECISION_BASE_URL;
    const apiKey = env.HARNESS_DECISION_API_KEY;
    if (!baseUrl) throw new Error(`${kind} requires HARNESS_DECISION_BASE_URL.`);
    return new SystemOneHttpOracle({ baseUrl, apiKey, model: env.HARNESS_DECISION_MODEL ?? 'auto' });
  }
  throw new Error(`Unsupported HARNESS_DECISION_ORACLE: ${kind}`);
}
