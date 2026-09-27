---
name: performance-investigation
description: Latency throughput memory-profile performance-regression
---

# Performance investigation

1. Capture the affected operation, baseline, workload, environment, and measurement method.
2. Reproduce the regression and separate measurement noise from a repeatable trend.
3. Profile or instrument the narrow path before proposing optimization.
4. Change one likely bottleneck and compare measurements using the same workload.
5. Report tradeoffs and avoid optimizing unmeasured code.
