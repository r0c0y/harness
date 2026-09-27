---
name: integration-test-design
description: Integration-check adapters contract-boundary
---

# Integration test design

1. Identify the real boundary whose interaction has risk.
2. Keep the production adapter where feasible and replace only expensive or unsafe external dependencies.
3. Verify request/response mapping, failure propagation, and cleanup.
4. Make external state deterministic or use an isolated test fixture.
5. Keep the test independent from live credentials and irreversible side effects.
