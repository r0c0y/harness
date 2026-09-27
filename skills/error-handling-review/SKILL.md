---
name: error-handling-review
description: Swallowed-errors failure-mapping recovery-path
---

# Error handling review

1. Trace errors from the source through adapters to the user-visible boundary.
2. Check whether failures preserve useful context without exposing secrets.
3. Distinguish retryable, terminal, and user-correctable errors.
4. Look for empty catches, false success responses, and cleanup skipped after failure.
5. Recommend a consistent correction tied to a concrete failure scenario.
