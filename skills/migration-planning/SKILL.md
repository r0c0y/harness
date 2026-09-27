---
name: migration-planning
description: Migration schema-version runtime-upgrade
---

# Migration planning

1. Record source and target versions and identify persisted or externally consumed formats.
2. Check backward compatibility, ordering constraints, and mixed-version operation.
3. Define backup, dry-run, observability, and rollback requirements before mutation.
4. Split the migration into verifiable, reversible steps where possible.
5. Do not run a destructive migration without explicit authorization and confirmed target.
