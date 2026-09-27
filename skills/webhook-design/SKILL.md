---
name: webhook-design
description: Webhook signature idempotency retry-backoff
---

# Webhook design

1. Define event identity, payload version, signing, and receiver authentication.
2. Make duplicate delivery safe through idempotency and stable event identifiers.
3. Specify timeout, retry schedule, backoff, terminal failure, and replay behavior.
4. Minimize sensitive data and include observability without leaking payloads.
5. Design a local contract test; do not send a live event without explicit approval.
