---
name: codebase-navigation
description: Navigation, symbol discovery, repository mapping, and context management for large codebases.
version: 1.0.0
---

# Codebase Navigation & Intelligence Skill

This skill equips Kuro AI Harness with fast, zero-dependency navigation capabilities across large codebases. Inspired by the prewalk scanning and compaction engines in `oh-my-pi` and `opencode`.

## Navigation Principles

1. **Prewalk First**: Before editing any code, inspect the repository structure (`repo_list`, `repo_search`, or `navigation.js` symbol scanner).
2. **Context Preservation**: Avoid loading entire multi-megabyte source files into the context window. Use symbol location offsets and line ranges.
3. **Compaction Strategy**: When a conversation or task execution history grows long, prune stale tool outputs while keeping critical user constraints intact.

## Skill Modules

- [Repo Map](file:///Users/priyanshutomar/Desktop/HARNESS/skills/navigation/repo-map.md): Architectural mapping and directory tree indexing.
- [Symbol Search](file:///Users/priyanshutomar/Desktop/HARNESS/skills/navigation/symbol-search.md): Fast symbol, class, and method definition scanning.
- [Context Compaction](file:///Users/priyanshutomar/Desktop/HARNESS/skills/navigation/context-compaction.md): Context window pruning and handoff summary generation.
- [Policy Evals](file:///Users/priyanshutomar/Desktop/HARNESS/skills/navigation/policy-evals.md): Evaluation loops, safety checks, and policy assertions.
