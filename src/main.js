import readline from 'node:readline/promises';
import process from 'node:process';
import { ControlPlane } from './control-plane.js';
import { EvidenceLedger, createRunId } from './ledger.js';
import { createDecisionOracle } from './oracles.js';
import { PolicyEngine } from './policy.js';
import { OpenAICompatibleProvider } from './provider.js';
import { WorkspaceTools } from './tools.js';

const workspace = process.env.HARNESS_WORKSPACE ?? process.cwd();
const provider = new OpenAICompatibleProvider({
  baseUrl: process.env.AI_BASE_URL,
  apiKey: process.env.AI_API_KEY,
  model: process.env.AI_MODEL,
});

if (process.argv.includes('--probe')) {
  try {
    const result = await provider.probe();
    process.stdout.write(`${JSON.stringify({ type: 'provider_probe', ...result })}\n`);
    if (!result.ok) process.exitCode = 1;
  } catch (error) {
    process.stdout.write(`${JSON.stringify({ type: 'provider_probe', ok: false, message: error instanceof Error ? error.message : String(error) })}\n`);
    process.exitCode = 1;
  }
} else if (process.argv.includes('--serve') || process.env.HARNESS_SERVE === '1') {
  const { startServer } = await import('./server.js');
  startServer({ workspace });
} else {

// Construct on startup so optional adapters fail clearly before a run. The first
// control-plane slice intentionally uses deterministic policy for enforcement.
createDecisionOracle(process.env);

const controlPlane = new ControlPlane({
  provider,
  tools: new WorkspaceTools({ workspace }),
  policy: new PolicyEngine({ workspace, networkEnabled: process.env.HARNESS_ENABLE_NETWORK === '1' }),
  ledger: new EvidenceLedger({ workspace, runId: createRunId() }),
  workspace,
});

const cliTaskArg = process.argv.slice(2).filter(arg => !arg.startsWith('--')).join(' ').trim();
if (cliTaskArg) {
  try {
    const result = await controlPlane.run(parseTask(cliTaskArg));
    process.stdout.write(`${JSON.stringify({ type: 'result', ...result })}\n`);
  } catch (error) {
    process.stdout.write(`${JSON.stringify({ type: 'error', message: error instanceof Error ? error.message : String(error) })}\n`);
    process.exitCode = 1;
  }
} else {

const input = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: process.stdin.isTTY });
if (process.stdin.isTTY) process.stdout.write('Harness ready. Enter a software-engineering task, or type exit.\n> ');
for await (const line of input) {
  const trimmed = line.trim();
  if (!trimmed) continue;
  if (trimmed === 'exit') break;
  const task = parseTask(trimmed);
  try {
    const result = await controlPlane.run(task);
    process.stdout.write(`${JSON.stringify({ type: 'result', ...result })}\n`);
  } catch (error) {
    process.stdout.write(`${JSON.stringify({ type: 'error', message: error instanceof Error ? error.message : String(error) })}\n`);
  }
  if (process.stdin.isTTY) process.stdout.write('> ');
}

}
}

function parseTask(line) {
  try {
    const parsed = JSON.parse(line);
    return typeof parsed.task === 'string' ? parsed.task : line;
  } catch {
    return line;
  }
}
