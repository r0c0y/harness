---
name: tdd
description: TDD red-green-refactor test-driven test-first loop
---

# Test-driven development

Use a small behavior-level red-green-refactor loop.

1. Read the repo instructions and existing tests. Identify the command the project already uses; do not install a framework just to follow this workflow.
2. Run the narrow relevant test before editing when practical. Record whether it already fails.
3. Add or adjust one test for the requested behavior at a public seam. Keep the assertion independent of the implementation.
4. Run that test and confirm it fails for the missing behavior, not because of setup or syntax.
5. Make the smallest implementation change that satisfies the test. Preserve unrelated user edits and the existing interface.
6. Re-run the test, then the smallest relevant broader check. Refactor only while the behavior remains green.
7. Report the exact commands and results. If tests cannot run, explain why and use an honest alternative check; never describe an unrun test as passing.

Ask about a test boundary only when the choice changes externally visible behavior or cannot be resolved from the task and existing project conventions.

## Source basis

An original HARNESS adaptation informed by [Matt Pocock's TDD skill](https://github.com/mattpocock/skills/tree/c55ee46073ed923f86ce59a5eb3b6d895095d1b7/skills/engineering/tdd).
