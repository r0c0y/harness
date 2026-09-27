---
name: api-contract-design
description: Endpoint request-response schema error-contract HTTP
---

# API contract design

1. Identify callers, trust boundaries, and the versioning constraints.
2. Specify required and optional inputs, validation, output shape, and error semantics.
3. Define authentication, authorization, idempotency, and timeout behavior where relevant.
4. Keep the contract minimal and compatible with existing callers.
5. Derive contract tests from examples before implementing the handler.
