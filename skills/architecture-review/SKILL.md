---
name: architecture-review
description: Architecture coupling bottlenecks ownership-audit
---

# Architecture review

1. Read repository maps, entry points, and the modules around the reported concern.
2. Trace ownership of state, validation, side effects, and error handling.
3. Identify concrete coupling or change-amplification examples rather than abstract style preferences.
4. Rank findings by user impact and evidence, and include one feasible seam for improvement.
5. Do not refactor during a review unless implementation was explicitly requested.
