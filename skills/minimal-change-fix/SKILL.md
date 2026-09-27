---
name: minimal-change-fix
description: Narrow-defect minimal-fix root-cause
---

# Minimal change fix

1. Reproduce the defect and identify its owning boundary.
2. Inspect current edits and avoid overwriting unrelated work.
3. Make one narrow correction that addresses the cause, not just the visible symptom.
4. Add a regression check where feasible.
5. Avoid redesigns, cleanup, package additions, and unrelated renames.
