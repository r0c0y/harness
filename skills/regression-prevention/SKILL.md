---
name: regression-prevention
description: Regression-prevention invariant-check recurrence
---

# Regression prevention

1. Identify the invariant violated by the original defect.
2. Add the cheapest stable test at the boundary where that invariant is observable.
3. Ensure the test fails on the old behavior and passes on the corrected behavior.
4. Avoid encoding incidental implementation details or brittle timing.
5. Link the check to the defect's symptom in its name or test description.
