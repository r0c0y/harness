---
name: risk-review
description: Blast-radius rollback exposure deployment-risk
---

# Risk review

1. Identify what state, users, credentials, or external systems can be affected.
2. Estimate impact and likelihood qualitatively and cite the evidence for each concern.
3. Check backup, rollback, observability, and partial-failure behavior.
4. Prefer reversible staged actions and read-only validation before writes.
5. Pause for user direction when the action is destructive, externally visible, or outside the approved scope.
