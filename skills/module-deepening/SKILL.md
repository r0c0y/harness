---
name: module-deepening
description: Module-boundary cohesive-interface ownership
---

# Module deepening

1. Trace the repeated decisions callers currently make about the same responsibility.
2. Identify the data and invariants one module could own behind a small interface.
3. Compare the proposed interface with the current call sites and test seams.
4. Prefer an interface that removes decisions from callers without hiding useful behavior.
5. Present the seam and tradeoffs first; refactor only when requested.
