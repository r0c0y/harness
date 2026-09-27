---
name: policy-gate-review
description: Policy-gate permission-boundary path-containment denial-reason
---

# Policy gate review

1. Trace a proposed tool action from model request through validation to execution.
2. Check default-deny behavior for network, external writes, and out-of-workspace paths.
3. Verify normalization, aliases, malformed arguments, and alternate execution routes.
4. Ensure a denial is logged with useful evidence and does not perform a partial side effect.
5. Review is read-only unless the user explicitly asks for a policy change.
