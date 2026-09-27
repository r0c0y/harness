---
name: git-state-audit
description: Git-status branch-divergence dirty-tree upstream
---

# Git state audit

1. Read the current branch, upstream, status, and diff summary.
2. Identify staged, unstaged, untracked, ahead, and behind state separately.
3. Treat every uncommitted change as user-owned until proven otherwise.
4. Explain safe choices without running push, reset, clean, checkout, or branch deletion.
5. Before any external GitHub action, verify target repository and requested scope.
