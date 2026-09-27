---
name: patch-verification
description: Verify-patch reproduce regression-check evidence
---

# Patch verification

1. Re-run the exact failing reproduction after the change.
2. Check the expected behavior and at least one relevant boundary or failure path.
3. Run the project's narrow test and broader check when practical.
4. Inspect the final diff for unrelated edits or generated noise.
5. Report actual command output and any check that could not be run.
