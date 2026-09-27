---
name: sdk-upgrade-assessment
description: SDK semver migration release-breakage runtime-support
---

# SDK upgrade assessment

1. Identify the installed and target versions from lockfiles and official release notes.
2. Compare breaking changes, runtime requirements, removed APIs, and security fixes.
3. Search current call sites for affected methods or changed defaults.
4. Propose a staged upgrade and focused compatibility tests.
5. Do not update package files until the user requested that implementation.
