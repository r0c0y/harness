---
name: unit-test-design
description: Unit testing assertion boundary-values
---

# Unit test design

1. Choose one behavior exposed by a stable public seam.
2. Use named examples for normal, boundary, and rejected inputs.
3. Keep fixtures small and expected values independent from the implementation.
4. Avoid tests that only assert private calls or repeat the function's own calculation.
5. Run the test alone first, then within the existing suite.
