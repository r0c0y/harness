---
name: secrets-handling-review
description: Credential secret token-redaction exposure
---

# Secrets handling review

1. Search for secret-bearing environment names and trace where values can flow.
2. Check tracked files, logs, errors, test fixtures, and frontend-visible configuration.
3. Never print, copy, or include secret values in a report.
4. If exposure is confirmed, describe containment and rotation needs without performing them silently.
5. Verify examples use placeholders and safe local defaults.
