---
name: skill-authoring
description: SKILL.md create-skill metadata trigger matching
---

# Authoring skills for this HARNESS

Write a compact instruction module that the current registry can discover and a text-only model can follow.

1. Give the skill one job and a distinctive, short name. Add it at `skills/<name>/SKILL.md`.
2. Use the simple header this loader understands: `name` and a single-line `description` between `---` markers. Avoid multiline YAML, nested metadata, or relying on fields this registry ignores.
3. Make the description state concrete triggers. Keep the body self-contained; the current loader does not follow companion files, nested skill dependencies, scripts, or external installers.
4. Mention only tools and permissions that actually exist. Instructions cannot create browser, MCP, sub-agent, or network capabilities.
5. Include boundaries, evidence requirements, and a way to verify the result. Keep the module narrow enough that its trigger does not match unrelated work.
6. Before adding it, inspect the existing project state and ensure the destination name is unused. Test discovery and matching with the existing registry test or a focused read-only check.

Do not alter the registry or other project code just to accommodate a new skill unless the user separately asked for that change.

## Source basis

An original HARNESS-specific adapter informed by [Anthropic's skill-creator](https://github.com/anthropics/skills/tree/33375500bcea98d610eb30ce10ac4e59b89c390d/skills/skill-creator), the [Gemini CLI built-in skill-creator](https://github.com/google-gemini/gemini-cli/tree/2fe7c2d3f065dc40ad573d50b2091116f8a4aa18/packages/core/src/skills/builtin/skill-creator), and the [Agent Skills specification](https://agentskills.io/specification).
