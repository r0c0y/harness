---
name: systematic-debugging
description: Debugging reproduce root-cause stack-trace hypothesis
---

# Systematic debugging

Find evidence for the cause before changing code.

1. Preserve the current state. Read repo guidance and inspect `git status` and the relevant diff before editing; treat existing work as user-owned.
2. Capture the exact symptom: command, URL or route, status code, relevant log lines, and what was expected. Redact secrets.
3. Reproduce with the narrowest safe check available. Separate a failure in the app from one in its host, proxy, model provider, or external service.
4. List a few plausible causes. For each, choose one read-only check that would distinguish it from the others; do not shotgun-edit several layers.
5. Confirm the root cause, then make one minimal in-scope correction. Avoid UI redesigns, dependency additions, or unrelated cleanup.
6. Add or run a regression check and repeat the original reproduction. If a prerequisite host or tool is unavailable, say exactly what remains unverified.

Prefer source configuration and live responses over copied cache files or stale generated bundles. A local static server cannot be assumed to reproduce an upstream host's injected boot manifest or plugin routes.

## Source basis

An original HARNESS adaptation informed by [Matt Pocock's debugging skill](https://github.com/mattpocock/skills/tree/c55ee46073ed923f86ce59a5eb3b6d895095d1b7/skills/engineering/diagnosing-bugs) and [Superpowers systematic debugging](https://github.com/obra/superpowers/tree/8ca22dba9a94f28898bbce59f2537ff4d87c747d/skills/systematic-debugging).
