---
name: logging-review
description: Logs observability redaction credential-leak
---

# Logging review

1. Identify which operational question each log line should answer.
2. Preserve correlation identifiers and relevant status while excluding secrets and private payloads.
3. Check log level, duplicate volume, and whether failures remain observable.
4. Prefer structured, stable fields over parsing prose where the project supports them.
5. Verify that a log change does not leak request bodies or credentials.
