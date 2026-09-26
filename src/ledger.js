import fs from 'node:fs/promises';
import path from 'node:path';

export class EvidenceLedger {
  #file;

  constructor({ workspace, runId }) {
    this.#file = path.join(workspace, '.ai-harness', 'runs', `${runId}.jsonl`);
  }

  async append(type, payload) {
    await fs.mkdir(path.dirname(this.#file), { recursive: true });
    const event = { at: new Date().toISOString(), type, ...payload };
    await fs.appendFile(this.#file, `${JSON.stringify(event)}\n`, 'utf8');
    return event;
  }

  async writeSummary(summaryText) {
    const summaryFile = this.#file.replace(/\.jsonl$/, '-summary.md');
    await fs.mkdir(path.dirname(summaryFile), { recursive: true });
    await fs.writeFile(summaryFile, summaryText, 'utf8');
    return summaryFile;
  }
}

export function createRunId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}
