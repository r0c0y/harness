---
name: injection-defense-review
description: Shell-injection prompt-injection template-escape
---

# Injection defense review

1. Find where untrusted values enter shell commands, model instructions, templates, or query languages.
2. Check whether values are passed as structured data or safely encoded for their exact context.
3. Ensure retrieved content cannot override system, developer, or user instructions.
4. Test a harmless adversarial example that demonstrates the boundary.
5. Do not run a destructive payload to prove a theoretical issue.
