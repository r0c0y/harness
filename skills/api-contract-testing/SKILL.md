---
name: api-contract-testing
description: Contract-test response-schema status-codes API-boundary
---

# API contract testing

1. Compare the implementation with the published request and response schema.
2. Cover required fields, optional fields, invalid values, and stable error codes.
3. Check content type, status, and version behavior where clients depend on them.
4. Avoid tests that require live customer data or external writes.
5. Flag undocumented behavior rather than quietly making it part of the contract.
