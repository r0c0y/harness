---
name: cors-diagnostics
description: CORS preflight allow-origin cross-origin
---

# CORS diagnostics

1. Record the page origin, request origin, method, and requested headers.
2. Inspect preflight and actual responses, including allow-origin, allow-methods, and credentials behavior.
3. Compare server policy with the smallest trusted origin set required.
4. Do not recommend wildcard origins with credentials or disable browser protections.
5. State whether diagnosis is based on logs, source, or a live request.
