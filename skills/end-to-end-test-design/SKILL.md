---
name: end-to-end-test-design
description: E2E user-path browser-workflow interface-journey
---

# End-to-end test design

1. Describe the user's starting state, actions, and visible success condition.
2. Include one important error path and recovery step.
3. Decide what must be isolated and what integration is intentionally real.
4. Keep selectors and setup stable; do not test incidental visual details.
5. This skill designs checks only. Do not claim execution without an enabled browser runner.
