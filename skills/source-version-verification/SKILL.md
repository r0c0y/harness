---
name: source-version-verification
description: Version commit-tag revision-release installed-version
---

# Source version verification

1. Read lockfiles, version constants, release tags, and runtime reports.
2. Resolve mutable branch references to a commit or release when reproducibility matters.
3. Compare the observed behavior with the matching source version, not only the latest docs.
4. Record the verification date and distinguish installed, configured, and available versions.
5. Do not assume a project has upgraded because a newer version exists upstream.
