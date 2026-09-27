---
name: csp-diagnostics
description: CSP directive nonce-hash script-src
---

# Content Security Policy diagnostics

1. Capture the blocked directive, resource origin, and policy that was delivered.
2. Trace whether the policy comes from a header, meta tag, proxy, or host platform.
3. Prefer a narrow source or nonce/hash correction over broad unsafe directives.
4. Check report-only behavior separately from enforced policy.
5. Verify the correction against the original blocked resource and avoid weakening unrelated directives.
