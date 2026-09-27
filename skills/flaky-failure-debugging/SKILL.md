---
name: flaky-failure-debugging
description: Flaky intermittent nondeterministic failure-sample
---

# Flaky failure debugging

1. Record environment, test order, seed, timing, and the exact failure evidence.
2. Repeat the narrow case to estimate reproducibility; preserve representative logs.
3. Check shared state, time dependence, randomness, network variance, and cleanup.
4. Replace nondeterministic timing assumptions with controlled synchronization or fixtures.
5. Confirm stability over a reasonable repeated run and avoid hiding failures with retries.
