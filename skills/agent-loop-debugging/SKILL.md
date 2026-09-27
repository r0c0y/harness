---
name: agent-loop-debugging
description: Agent-loop state-transition tool-call termination
---

# Agent loop debugging

1. Capture the task, state transitions, model turn, tool request, policy decision, and final observation.
2. Identify whether the fault is prompt selection, schema parsing, tool execution, result mapping, or stopping logic.
3. Reproduce with the smallest deterministic task and synthetic safe inputs.
4. Add an evaluation that checks both the intended action and the required stop condition.
5. Preserve credentials and user data in logs; do not claim a tool executed without result evidence.
