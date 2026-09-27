---
name: test-fixture-review
description: Fixture deterministic isolation synthetic-data
---

# Test fixture review

1. Confirm fixtures represent realistic, minimal cases.
2. Check for dependence on machine paths, current time, iteration order, or ambient environment.
3. Keep each test's data isolated and cleanup reliable.
4. Remove real credentials, personal data, and unnecessary large samples.
5. Prefer inline examples for simple cases and shared fixtures only for true reuse.
