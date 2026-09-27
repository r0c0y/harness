---
name: http-routing-diagnostics
description: HTTP status routing route-matching redirect-chain proxy-upstream
---

# HTTP routing diagnostics

1. Capture method, host, path, status, redirect chain, and relevant response headers.
2. Trace the request through router, proxy, and handler configuration.
3. Check route precedence, base paths, trailing slashes, and method handling.
4. Compare the failing request with a known working request without sending writes.
5. Redact cookies, authorization values, and personal data from evidence.
