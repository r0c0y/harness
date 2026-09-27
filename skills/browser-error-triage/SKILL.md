---
name: browser-error-triage
description: Browser-console network-tab screenshot client-exception
---

# Browser error triage

1. Preserve the exact message, URL, status, and timing from the supplied evidence.
2. Separate client exceptions, failed requests, policy blocks, and host errors.
3. Trace the first failure in time rather than treating later cascade errors as causes.
4. Compare with source and server logs; ask for missing evidence only when it changes the diagnosis.
5. This harness has no browser automation. Do not claim to have opened DevTools or reproduced a UI flow unless those tools were actually used.
