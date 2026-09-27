---
name: config-review
description: Environment-config precedence defaults secret-exposure
---

# Configuration review

1. Trace where each setting is read, defaulted, validated, and overridden.
2. Check development versus production behavior and missing-value handling.
3. Look for secrets in defaults, samples, logs, or frontend bundles; never print secret values.
4. Verify that invalid settings fail clearly rather than silently falling back unsafely.
5. Report exact keys and files without changing the user's environment.
