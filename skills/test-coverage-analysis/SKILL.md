---
name: test-coverage-analysis
description: Coverage-matrix untested-branch risk-based
---

# Test coverage analysis

1. Map changed behavior to success, boundary, and failure branches.
2. Use coverage output only as a locator for unexercised code, not as a quality score.
3. Prioritize branches that guard permissions, state changes, parsing, or recovery.
4. Add tests at observable boundaries rather than chasing a percentage.
5. Report any coverage tool or environment limit.
