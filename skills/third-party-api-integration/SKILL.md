---
name: third-party-api-integration
description: External-API authentication timeout retry-mapping
---

# Third-party API integration

1. Verify the provider's current official endpoint, authentication, limits, and error schema.
2. Keep credentials in the approved secret store or environment, never source files or logs.
3. Set bounded timeouts and retry only safe, idempotent operations.
4. Map provider errors into stable internal errors while preserving diagnostic identifiers.
5. Test with a mock or sandbox before any production request.
