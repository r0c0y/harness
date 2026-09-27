---
name: grilling
description: Grill or grilling pressure-test uncertain plans and ideas
---

# Grilling

Use a focused interview to expose decisions that could materially change the outcome.

1. First inspect the repository, instructions, and supplied context for facts that can be discovered without the user. Do not ask the user to look up facts the available tools can establish.
2. Identify unresolved decisions, order them by dependency, and ask only about the current decision that would change scope, architecture, risk, or acceptance criteria.
3. Give a concise recommendation and its tradeoff with the question. Keep the interview small; do not turn clear implementation requests into a long questionnaire.
4. Update the shared understanding when the answer changes earlier assumptions. Stop when the important decisions are settled.
5. Do not implement a plan during a requested grilling session. Summarize the agreed direction and wait for the user to authorize implementation.

If the user asked for implementation rather than an interview, make a low-risk assumption when appropriate, state it briefly, and proceed. Do not invent approval for destructive, external, or scope-expanding actions.

## HARNESS limits

This agent has no sub-agent dispatch in its current toolset. Gather discoverable facts yourself and label anything you could not verify; never claim a background agent has been started.

## Source basis

An original HARNESS adaptation informed by [Matt Pocock's grilling skills](https://github.com/mattpocock/skills/tree/c55ee46073ed923f86ce59a5eb3b6d895095d1b7/skills/productivity/grilling) and the [Agent Skills format](https://agentskills.io/specification).
