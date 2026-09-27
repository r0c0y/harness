# Repository Structural Mapping

## Purpose
Build a concise mental map of the repository without reading every single file.

## Workflow

1. **Top-Level Discovery**: Scan entry points (`Makefile`, `package.json`, `Cargo.toml`, `AGENTS.md`, `README.md`).
2. **Directory Tree Walk-up**: Discover nested rulebooks (`.omp/AGENTS.md`, `AGENTS.md`, `CLAUDE.md`, `.cursorrules`).
3. **Module Boundaries**: Identify core control planes, tool registries, providers, and test suites.

## Output Format
Generate concise markdown trees summarizing module responsibilities.
