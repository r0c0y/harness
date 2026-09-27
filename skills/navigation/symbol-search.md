# Symbol & Definition Search

## Purpose
Locate exact function signatures, class definitions, exports, and imports across large codebases.

## Best Practices

1. **Targeted Grep & Regex**: Search for definition patterns (`export class`, `function`, `const ... =`) rather than full file view.
2. **Line-Range Reading**: Use `file_read` with specific `start` and `end` lines to inspect target definitions without filling context windows.
3. **Reference Tracking**: Trace caller/callee paths before modifying shared API signatures.
