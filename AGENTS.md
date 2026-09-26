# AI Coding Harness Repository Map & Policy Guide

Welcome to the AI Harness repository. This codebase is a zero-dependency, policy-controlled control plane designed for text-only LLMs (such as Qwen and DeepSeek).

## Architectural Principles & Bounds
1. **Zero External Dependencies**: Standard Node.js (v22+) native ESM only. No npm packages.
2. **Control Plane Isolation**: The model proposes tool calls; the harness validates inputs, checks workspace bounds, enforces safety policies, executes tools, and logs evidence.
3. **Evidence-Based Claims**: Never claim a fix, edit, or test result that has not occurred. Run `project_verify` or narrow shell commands to produce concrete evidence.
4. **Exact File Editing**: Prefer `file_replace` over `file_write` when editing existing source files to prevent accidental truncation or full file overwrites.

## Project Structure
- `Makefile`: Standard evaluation interface (`setup`, `probe`, `run`, `test`, `clean`).
- `src/main.js`: Primary CLI entry point.
- `src/control-plane.js`: Turn loop manager, workspace preflight auto-injection, message pruning, and run summary generation.
- `src/contracts.js`: Tool definitions and capability classification.
- `src/policy.js`: Security gate checking path escape, command blocklists, and network permissions.
- `src/tools.js`: Bounded workspace tool execution (`repo_list`, `repo_search`, `file_read`, `file_write`, `file_replace`, `project_verify`, `shell_exec`, `web_fetch`).
- `src/provider.js`: OpenAI-compatible API adapter for local/remote model completion & compatibility probing.
- `src/ledger.js`: Structured JSONL and markdown evidence ledger (`.ai-harness/runs/`).
- `src/preflight.js`: Repository structure inspection and instructions loader.
- `test/`: Native Node test suite (`node --test`).
