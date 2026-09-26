# HARNESS teammate handoff

## Start locally

- Requires Node.js 22 or newer; the checked machine has Node v22.22.1.
- From this repository root, run `make setup`, then `make serve`.
- The control-plane server listens at `http://localhost:3000/` by default. Set `PORT` to change it.
- This project has no npm runtime dependencies. `make serve` must be started from the repository root because static files are read from `public/` relative to the current directory.

## Verified on the originating Mac

- `make setup` succeeds.
- `make serve` starts and prints the local URL.
- `/`, the built JS/CSS assets, `/preview.html`, its worker bundle, and `/api/preflight` returned HTTP 200.
- `node --test`: 10 passed, 1 failed. `test/server.test.js` expects the text `Kuro`, but the current `public/index.html` title is `DSH Local Build`. Confirm intended product branding; then update the assertion to verify stable UI structure rather than an obsolete brand string if appropriate.
- The captured browser error is `web boot: window.__ModuleLoader__ bootstrap facade is missing`.

## Main investigation lead

The static server is up, so the reported issue is in the embedded web preview boot, not basic HTTP startup. `public/index.html` and `public/preview.html` load the built app bundles, while `scratch_index.html` contains an inline queue-mode `window.__ModuleLoader__` bootstrap prelude. Compare the prelude and injected boot data in `scratch_index.html` with the shell actually served at `/` and `/preview.html`; the current bundle and shell appear mismatched. Regenerate the shell from the matching web build or restore the required bootstrap in the right order, then verify the preview in a real browser. Do not copy the scratch file blindly without checking its asset revisions and routes.

There is also an older preview server running from `harnessresources/deepseek-harness/apps/web` on port 4173; it is a different checkout. The HARNESS control panel is the server on port 3000.

## Next checks

1. Fix the module-loader/bootstrap mismatch and verify the embedded preview starts in a browser.
2. Align the server test with the intended UI, then run `node --test` again.
3. Configure a local OpenAI-compatible provider before testing model calls. Supply `AI_API_KEY`, `AI_BASE_URL`, and `AI_MODEL` through the shell or a local ignored `.env`; never commit credentials.
4. Re-run `make setup`, `node --test`, and the preview smoke check before calling the handoff complete.

The local `.ai-harness/` run ledger is intentionally excluded from Git because it can contain prompts, paths, and execution evidence.
