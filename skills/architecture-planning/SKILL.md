---
name: architecture-planning
description: Architecture decomposition service-boundaries component-ownership
---

# Architecture planning

1. Map the current system and its constraints before proposing new components.
2. Identify responsibilities, data flow, trust boundaries, and failure ownership.
3. Prefer a small number of stable interfaces over broad rewrites or speculative layers.
4. Compare a minimal extension with a larger redesign and state migration costs.
5. Provide a testable boundary and rollout sequence; defer choices unsupported by evidence.
