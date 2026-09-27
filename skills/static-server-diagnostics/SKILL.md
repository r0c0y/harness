---
name: static-server-diagnostics
description: Static server localhost port document-root asset-serving
---

# Static server diagnostics

1. Verify the exact start command, process output, bind address, and listening port.
2. Check the requested file path against the server's document root and fallback rules.
3. Inspect status, content type, and body for the failing asset route.
4. Distinguish a static file server from a platform host that injects runtime data or APIs.
5. Keep the existing app interface unchanged and report missing host capabilities plainly.
