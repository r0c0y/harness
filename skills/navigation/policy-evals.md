# Policy Loops & Evaluation Assertions

## Purpose
Enforce policy checks and empirical evaluation gates before claiming task completion.

## First Principles Execution Loop

1. **Preflight Policy Check**: Validate workspace bounds, network access rules, and command blocklists.
2. **Action Execution**: Execute model-proposed tool call.
3. **Empirical Verification**: Run native test assertions (`node --test`, `project_verify`).
4. **Evidence Logging**: Record full JSONL event log and markdown summary in `.ai-harness/runs/`.
