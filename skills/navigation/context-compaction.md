# Context Compaction & Handoff Generation

## Purpose
Prevent context overflow during long autonomous turn loops by mechanically pruning stale outputs and generating structured handoff summaries.

## Strategy (Inspired by oh-my-pi compaction)

1. **Prune Stale Tool Results**: Replace multi-line directory listings or old terminal logs with concise summaries `[Result pruned: N lines]`.
2. **Preserve System Rules & Active Goals**: Never prune the root prompt, user instructions, or active constraints.
3. **Generate Handoff Entry**: Summarize completed work, modified files, and remaining steps.
