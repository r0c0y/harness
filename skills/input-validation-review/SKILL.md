---
name: input-validation-review
description: Malformed-input bounds encoding rejection
---

# Input validation review

1. Identify all external and persisted input boundaries.
2. Verify type, size, range, encoding, and required-field checks happen before side effects.
3. Check malformed, oversized, duplicate, and unexpected values.
4. Ensure rejection is explicit and does not leak internal state.
5. Keep validation aligned with the domain contract instead of silently coercing invalid data.
