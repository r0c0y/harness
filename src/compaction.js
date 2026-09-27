/**
 * Context compaction, token estimation, and mechanical output pruning.
 * Inspired by oh-my-pi compaction & shake architecture.
 */
export class ContextCompactor {
  #maxTokens;
  #pruneThreshold;

  constructor({ maxTokens = 64000, pruneThreshold = 0.8 } = {}) {
    this.#maxTokens = maxTokens;
    this.#pruneThreshold = pruneThreshold;
  }

  /**
   * Estimate token count (rough heuristic: ~4 chars per token).
   */
  estimateTokens(text) {
    if (typeof text !== 'string') text = JSON.stringify(text || '');
    return Math.ceil(text.length / 4);
  }

  /**
   * Mechanically shake/prune large old tool outputs to keep context compact.
   */
  pruneMessages(messages, maxResultChars = 1000) {
    return messages.map((msg, idx) => {
      // Keep system prompt, first user prompt, and recent 2 messages intact
      if (idx === 0 || idx === 1 || idx >= messages.length - 2) return msg;

      if (msg.role === 'tool' && typeof msg.content === 'string' && msg.content.length > maxResultChars) {
        return {
          ...msg,
          content: `${msg.content.slice(0, maxResultChars / 2)}\n... [Pruned ${msg.content.length - maxResultChars} characters of historical tool output] ...\n${msg.content.slice(-maxResultChars / 2)}`,
        };
      }
      return msg;
    });
  }

  /**
   * Generate a structured handoff summary for context boundaries.
   */
  generateHandoffSummary(task, completedSteps, modifiedFiles) {
    return {
      type: 'compaction_summary',
      task,
      completedSteps: completedSteps || [],
      modifiedFiles: modifiedFiles || [],
      timestamp: new Date().toISOString(),
    };
  }
}
