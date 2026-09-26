# Harness Control Plane

A text-only software-engineering harness designed to improve a prescribed coding model through controlled context, typed tools, policy enforcement, verification, and evidence.

## Run

```sh
export AI_API_KEY="..."
export AI_MODEL="organizer-model-name"
export AI_BASE_URL="http://127.0.0.1:8000/v1"
make setup
make run
```

`make run` accepts one task per line on standard input. A line may be plain text or a JSON object with a `task` field. Type `exit` to stop.

## Web Control Panel (Interactive UI)

```sh
make serve
# Launches local Web UI at http://localhost:3000
```

`make serve` hosts an interactive, zero-dependency Web Control Panel ("The Cave") providing:
- Real-time task dispatch & execution timeline with Server-Sent Events (SSE).
- Live Policy Gate monitor displaying allowed vs. blocked tool calls with exact reasons.
- Workspace preflight brief inspector and automated test command detector.
- Model tool-call compatibility probe button.

Before an evaluation run, use `make probe`. It sends one harmless synthetic function-call request to the configured model endpoint and verifies that the model returns a valid tool call. It does not execute a tool or modify `HARNESS_WORKSPACE`.

The default provider is OpenAI-compatible chat completions. This is intentional: Qwen and DeepSeek local servers commonly expose this wire format, so the evaluator can point `AI_BASE_URL` at its local `/v1` endpoint without changing harness code. Provider-specific implementations remain behind a small adapter boundary.

## Safety model

- Tools operate only inside `HARNESS_WORKSPACE` (the current directory by default).
- Network access is disabled unless `HARNESS_ENABLE_NETWORK=1`.
- Untrusted content from issues, files, the web, and tool servers is labelled as data, never instructions.
- Destructive shell patterns are blocked before execution.
- Every action is recorded in `.ai-harness/runs/` with its policy decision and result summary.

## Configuration

| Variable | Purpose |
| --- | --- |
| `AI_API_KEY` | Required provider credential. Never written to logs. |
| `AI_BASE_URL` | OpenAI-compatible API base URL, including a local `/v1` path when applicable. |
| `AI_MODEL` | Prescribed model name. |
| `HARNESS_WORKSPACE` | Repository to inspect and modify. Defaults to the current directory. |
| `HARNESS_ENABLE_NETWORK` | Set to `1` to enable the optional, read-only web fetch tool. |
| `HARNESS_DECISION_ORACLE` | `deterministic` (default), `jev`, or `laya`. Optional adapters only. |

## Deliberate first-slice limits

The initial runtime is a focused, inspect-edit-verify harness. It does not enable browser automation, remote MCP servers, cloud sandboxes, autonomous git push, or auxiliary models by default. Those capabilities require their own policies and tests before activation.


## Local-only safety warning

Run `make serve` only on a trusted local machine, not on a public interface. The HTTP API currently lacks authentication, allows cross-origin requests, accepts a workspace override and a provider URL, and its probe accepts an API key through a GET query. The shell tool runs `/bin/sh` behind a limited command blocklist, not a container or OS sandbox; workspace file checks are lexical and may follow symlinks outside the root. Do not point it at untrusted repositories or expose it to other users until these are hardened. `project_verify` with `standard` runs the declared tests; a quick check and an untested edit are never a verified fix.
