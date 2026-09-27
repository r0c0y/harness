---
name: concurrency-debugging
description: Race-condition interleaving shared-state lost-update
---

# Concurrency debugging

1. Identify shared state, competing actors, and the expected ordering or atomicity.
2. Capture a reproducible interleaving or stress case without changing production data.
3. Inspect locks, queues, transactions, cancellation, and retry boundaries.
4. Test one synchronization hypothesis and add a deterministic regression check.
5. Avoid timing-only sleeps as a correctness fix; document remaining concurrency limits.
