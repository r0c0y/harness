---
name: skill-trigger-audit
description: Skill-trigger description-collision matching
---

# Skill trigger audit

1. Inspect the registry's actual matching algorithm before editing descriptions.
2. Test each skill against a few intended prompts and unrelated near-neighbors.
3. Remove generic trigger words that cause widespread accidental matches.
4. Prefer distinctive phrases and one clear responsibility per skill.
5. Do not change the registry implementation unless that separate code change was requested.
