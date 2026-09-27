import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

/**
 * Harness evaluation engine and verification assertion runner.
 * Evaluates execution policies, test suite outcomes, and evidence claims.
 */
export class EvalEngine {
  #workspace;

  constructor({ workspace } = {}) {
    this.#workspace = workspace ?? process.cwd();
  }

  /**
   * Run empirical project verification suite.
   */
  async runVerification(command = 'node --test') {
    const startTime = Date.now();
    try {
      const { stdout, stderr } = await execAsync(command, { cwd: this.#workspace, timeout: 30000 });
      return {
        passed: true,
        command,
        durationMs: Date.now() - startTime,
        output: (stdout + '\n' + stderr).trim(),
      };
    } catch (error) {
      return {
        passed: false,
        command,
        durationMs: Date.now() - startTime,
        error: error.message,
        output: (error.stdout || '') + '\n' + (error.stderr || ''),
      };
    }
  }

  /**
   * Assert evidence requirements (e.g. file exists, test suite passed).
   */
  assertEvidence(runSummary) {
    const checks = [];

    // Rule 1: Verification must be executed
    checks.push({
      name: 'Verification Command Executed',
      passed: Boolean(runSummary.verification && runSummary.verification.executed),
    });

    // Rule 2: All executed tools recorded evidence
    checks.push({
      name: 'Policy Gate Compliance',
      passed: !runSummary.rejectedCount || runSummary.rejectedCount === 0,
    });

    return {
      passed: checks.every(c => c.passed),
      checks,
    };
  }
}
