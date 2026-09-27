---
name: reproduction-design
description: Minimal-reproduction repro-script stable-trigger
---

# Reproduction design

1. Preserve the original input, environment, expected result, and observed result.
2. Remove unrelated steps while keeping the failure intact.
3. Make timing, external services, and configuration explicit.
4. Prefer a test or isolated fixture that avoids real user data and external writes.
5. Record what changes make the symptom disappear; those are diagnostic evidence, not proof alone.
