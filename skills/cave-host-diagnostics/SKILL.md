---
name: cave-host-diagnostics
description: Cave bootstrap boot-manifest plugin route local-host startup
---

# The Cave host diagnostics

Diagnose the boundary between the HARNESS UI and the platform that serves it. Keep the requested UI intact.

1. Capture the exact startup error, request path, response status, and current server command. Inspect the project status and preserve existing edits.
2. Check what the page expects from its host, including any injected boot manifest and plugin routes. Compare that with what the local server actually returns; do not assume a static file server provides host-only APIs.
3. For bundle or archive failures, inspect the existing file type and response metadata before rebuilding anything. Work on a separate copy if an archive-format experiment is explicitly in scope.
4. Separate UI problems from hosting/bootstrap problems. Do not redesign the Cave, replace its interface, copy a transient upstream page, or patch generated assets as a substitute for a missing host contract.
5. If the host implementation or a required upstream service is unavailable, report the exact evidence and the smallest remaining prerequisite instead of inventing a manifest or claiming the app is hosted successfully.

## Project context

HARNESS's static `make serve` server is not, by itself, the upstream DSH plugin host. Prior investigation found the original host supplied `__DSH_BOOT__` and `/plugins/...` routes; treat those as observed facts to re-verify, not a guarantee about every future host version.

## Source basis

An original project-specific diagnostic playbook based on the HARNESS repository's documented runtime boundary and prior local-run evidence. It is not an upstream vendor skill.
