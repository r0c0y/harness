---
name: merge-conflict-analysis
description: Merge-conflict competing-edits preserve-resolution
---

# Merge conflict analysis

1. Identify the operation and exact files in conflict without aborting it.
2. Read both sides and surrounding code to infer intent from evidence.
3. Explain overlapping decisions and preserve non-conflicting user changes.
4. Propose a minimal resolution and note any ambiguous behavior for the user.
5. Edit only when resolution was requested; then run focused tests and inspect the diff.
