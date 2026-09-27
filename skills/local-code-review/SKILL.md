---
name: local-code-review
description: Review diff findings severity read-only regression audit
---

# Local code review

Review first; do not modify the code while reviewing.

1. Inspect repo instructions, branch, status, and the exact diff. Do not switch branches, stage files, amend commits, or discard uncommitted work.
2. Compare the diff with the task or specification. Read enough surrounding code to understand the changed behavior and its callers.
3. Check for concrete defects: broken behavior, unsafe input handling, policy bypasses, missing failure handling, regressions, or a requirement that is still unmet.
4. Run only relevant, non-destructive checks when practical. Distinguish findings from hypotheses and include evidence.
5. Report actionable findings first, with severity, file and line, impact, and a minimal correction direction. If no finding is supported, say so and state what was not tested.

This is a single-agent local review. Do not claim parallel reviewer coverage or inspect a remote pull request unless the task and available integration explicitly cover it.

## Source basis

An original local-only adaptation informed by the [Gemini CLI code-reviewer example](https://github.com/google-gemini/gemini-cli/tree/2fe7c2d3f065dc40ad573d50b2091116f8a4aa18/.gemini/skills/code-reviewer) and [Matt Pocock's code-review skill](https://github.com/mattpocock/skills/tree/c55ee46073ed923f86ce59a5eb3b6d895095d1b7/skills/engineering/code-review). Remote branch operations and multi-agent review are intentionally excluded.
