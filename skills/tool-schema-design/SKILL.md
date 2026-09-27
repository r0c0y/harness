---
name: tool-schema-design
description: Tool-schema JSON-input output-shape failure-contract
---

# Tool schema design

1. Define the narrow user capability and the authority it requires.
2. Make inputs explicit, bounded, and easy to reject when malformed.
3. Return structured success and failure data with stable error reasons.
4. Classify side effects and enforce workspace, network, and permission boundaries before execution.
5. Add tests for valid input, invalid input, denied capability, and partial failure.
