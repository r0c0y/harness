---
name: dependency-security-review
description: Package-advisory lockfile provenance vulnerability
---

# Dependency security review

1. Identify direct and transitive packages affected by the proposed change.
2. Check official advisories and package metadata for version-specific evidence.
3. Inspect install scripts, maintainership signals, and lockfile churn where relevant.
4. Avoid running unknown package scripts or transmitting project files to scanners without permission.
5. Report actionable risk and the exact versions checked.
