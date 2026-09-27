# HARNESS Skills Collection

**Reviewed:** September 26, 2026  
**Purpose:** An 80-skill software-engineering collection for the HARNESS agent, with official upstream reading links.

This is a HARNESS-specific collection, not a verbatim mirror of the linked projects. I reviewed several upstream collections and wrote short, self-contained adaptations to fit this repo's current tools. There are 80 distinct `SKILL.md` modules: 79 added for this collection and the existing `navigation` skill copied from HARNESS. The Desktop copy is in `~/Desktop/skills`; the active copies are in `~/Desktop/HARNESS/skills`.

## Skill index (80)

### Core agent and repo skills (8)

- [navigation](./navigation/SKILL.md) · [grilling](./grilling/SKILL.md) · [tdd](./tdd/SKILL.md) · [systematic-debugging](./systematic-debugging/SKILL.md)
- [local-code-review](./local-code-review/SKILL.md) · [technical-web-research](./technical-web-research/SKILL.md) · [skill-authoring](./skill-authoring/SKILL.md) · [cave-host-diagnostics](./cave-host-diagnostics/SKILL.md)

### Planning and design (14)

[problem-framing](./problem-framing/SKILL.md) · [requirements-elicitation](./requirements-elicitation/SKILL.md) · [acceptance-criteria](./acceptance-criteria/SKILL.md) · [scope-control](./scope-control/SKILL.md) · [option-comparison](./option-comparison/SKILL.md) · [architecture-planning](./architecture-planning/SKILL.md) · [architecture-review](./architecture-review/SKILL.md) · [domain-modeling](./domain-modeling/SKILL.md) · [api-contract-design](./api-contract-design/SKILL.md) · [technical-design](./technical-design/SKILL.md) · [implementation-planning](./implementation-planning/SKILL.md) · [task-breakdown](./task-breakdown/SKILL.md) · [risk-review](./risk-review/SKILL.md) · [assumption-audit](./assumption-audit/SKILL.md)

### Implementation and reliability (16)

[feature-implementation](./feature-implementation/SKILL.md) · [minimal-change-fix](./minimal-change-fix/SKILL.md) · [refactoring](./refactoring/SKILL.md) · [module-deepening](./module-deepening/SKILL.md) · [migration-planning](./migration-planning/SKILL.md) · [dependency-review](./dependency-review/SKILL.md) · [config-review](./config-review/SKILL.md) · [error-handling-review](./error-handling-review/SKILL.md) · [logging-review](./logging-review/SKILL.md) · [performance-investigation](./performance-investigation/SKILL.md) · [concurrency-debugging](./concurrency-debugging/SKILL.md) · [flaky-failure-debugging](./flaky-failure-debugging/SKILL.md) · [root-cause-analysis](./root-cause-analysis/SKILL.md) · [reproduction-design](./reproduction-design/SKILL.md) · [patch-verification](./patch-verification/SKILL.md) · [regression-prevention](./regression-prevention/SKILL.md)

### Testing and security (14)

[test-plan](./test-plan/SKILL.md) · [unit-test-design](./unit-test-design/SKILL.md) · [integration-test-design](./integration-test-design/SKILL.md) · [end-to-end-test-design](./end-to-end-test-design/SKILL.md) · [test-fixture-review](./test-fixture-review/SKILL.md) · [test-coverage-analysis](./test-coverage-analysis/SKILL.md) · [compatibility-testing](./compatibility-testing/SKILL.md) · [api-contract-testing](./api-contract-testing/SKILL.md) · [accessibility-review](./accessibility-review/SKILL.md) · [web-security-review](./web-security-review/SKILL.md) · [injection-defense-review](./injection-defense-review/SKILL.md) · [input-validation-review](./input-validation-review/SKILL.md) · [secrets-handling-review](./secrets-handling-review/SKILL.md) · [dependency-security-review](./dependency-security-review/SKILL.md)

### Web, hosting, and integrations (9)

[browser-error-triage](./browser-error-triage/SKILL.md) · [static-server-diagnostics](./static-server-diagnostics/SKILL.md) · [http-routing-diagnostics](./http-routing-diagnostics/SKILL.md) · [dns-tls-diagnostics](./dns-tls-diagnostics/SKILL.md) · [cors-diagnostics](./cors-diagnostics/SKILL.md) · [csp-diagnostics](./csp-diagnostics/SKILL.md) · [webhook-design](./webhook-design/SKILL.md) · [third-party-api-integration](./third-party-api-integration/SKILL.md) · [sdk-upgrade-assessment](./sdk-upgrade-assessment/SKILL.md)

### Research, documentation, and Git operations (11)

[technical-docs-research](./technical-docs-research/SKILL.md) · [api-documentation-research](./api-documentation-research/SKILL.md) · [upstream-source-audit](./upstream-source-audit/SKILL.md) · [source-version-verification](./source-version-verification/SKILL.md) · [release-note-triage](./release-note-triage/SKILL.md) · [changelog-drafting](./changelog-drafting/SKILL.md) · [readme-maintenance](./readme-maintenance/SKILL.md) · [developer-onboarding-docs](./developer-onboarding-docs/SKILL.md) · [incident-handoff](./incident-handoff/SKILL.md) · [git-state-audit](./git-state-audit/SKILL.md) · [merge-conflict-analysis](./merge-conflict-analysis/SKILL.md)

### Agent runtime and tool safety (8)

[tool-schema-design](./tool-schema-design/SKILL.md) · [policy-gate-review](./policy-gate-review/SKILL.md) · [agent-behavior-evals](./agent-behavior-evals/SKILL.md) · [context-budgeting](./context-budgeting/SKILL.md) · [skill-trigger-audit](./skill-trigger-audit/SKILL.md) · [tool-result-trust](./tool-result-trust/SKILL.md) · [prompt-injection-defense](./prompt-injection-defense/SKILL.md) · [agent-loop-debugging](./agent-loop-debugging/SKILL.md)

Some entries are design or evidence workflows, not promises of unavailable execution. In particular, browser-path, live DNS/TLS, remote CI, and MCP items cannot be fully exercised until HARNESS gains the relevant runtime capability.

## How HARNESS loads these files

The current in-progress registry in `src/skills.js` discovers one-level folders at `skills/<name>/SKILL.md` and `.omp/skills/<name>/SKILL.md`. It reads the `name` and `description` lines from the YAML-style header, then exposes the instructions through `read_skill`. Keep each skill self-contained and its header simple; this loader does not resolve nested skill dependencies, reference files, or executable scripts. The project changes already in progress were left untouched.

The common `SKILL.md` shape is portable, but installation paths are not universal. Gemini CLI documents `.gemini/skills` and `.agents/skills`; those paths are not read by HARNESS's current registry. The current trigger matcher is a simple substring heuristic, not semantic search, so skill descriptions are intentionally specific. A skill file also cannot grant new tools: this HARNESS version has no browser automation or MCP host. Its public HTTPS fetch is gated by `HARNESS_ENABLE_NETWORK=1`, and it does not expose general web search. The web-research skill states those limits instead of pretending it can search.

## Why some popular upstream skills are reference-only

- Anthropic's `webapp-testing` expects Playwright plus its helper scripts; HARNESS does not currently provide a browser automation runtime. Its upstream guide is useful when that capability is deliberately added, but copying only its `SKILL.md` would leave broken references.
- Anthropic's `mcp-builder` is for building MCP servers. HARNESS currently has no MCP client/host integration, so it is linked for future work rather than activated as if MCP tools already exist.
- Several full engineering skills assume sub-agents, scripts, or companion reference files. The local versions are short, self-contained adaptations and do not claim those capabilities.

## Official sources and versions checked

These immutable commit links record the exact repository states inspected for this collection.

### Matt Pocock

- [Skills repository](https://github.com/mattpocock/skills/tree/c55ee46073ed923f86ce59a5eb3b6d895095d1b7)
- [Grill-me](https://github.com/mattpocock/skills/tree/c55ee46073ed923f86ce59a5eb3b6d895095d1b7/skills/productivity/grill-me)
- [Grilling](https://github.com/mattpocock/skills/tree/c55ee46073ed923f86ce59a5eb3b6d895095d1b7/skills/productivity/grilling)
- [Test-driven development](https://github.com/mattpocock/skills/tree/c55ee46073ed923f86ce59a5eb3b6d895095d1b7/skills/engineering/tdd)
- [Diagnosing bugs](https://github.com/mattpocock/skills/tree/c55ee46073ed923f86ce59a5eb3b6d895095d1b7/skills/engineering/diagnosing-bugs)
- [Code review](https://github.com/mattpocock/skills/tree/c55ee46073ed923f86ce59a5eb3b6d895095d1b7/skills/engineering/code-review)
- [Research](https://github.com/mattpocock/skills/tree/c55ee46073ed923f86ce59a5eb3b6d895095d1b7/skills/engineering/research)

### Google Gemini CLI

- [Using Agent Skills](https://geminicli.com/docs/cli/using-agent-skills/)
- [Agent Skills best practices](https://geminicli.com/docs/cli/skills-best-practices/)
- [Official Gemini CLI code-reviewer example](https://github.com/google-gemini/gemini-cli/tree/2fe7c2d3f065dc40ad573d50b2091116f8a4aa18/.gemini/skills/code-reviewer)
- [Gemini CLI built-in skill-creator](https://github.com/google-gemini/gemini-cli/tree/2fe7c2d3f065dc40ad573d50b2091116f8a4aa18/packages/core/src/skills/builtin/skill-creator)

### Anthropic

- [Official skills repository](https://github.com/anthropics/skills/tree/33375500bcea98d610eb30ce10ac4e59b89c390d)
- [Web app testing](https://github.com/anthropics/skills/tree/33375500bcea98d610eb30ce10ac4e59b89c390d/skills/webapp-testing)
- [MCP builder](https://github.com/anthropics/skills/tree/33375500bcea98d610eb30ce10ac4e59b89c390d/skills/mcp-builder)
- [Skill creator](https://github.com/anthropics/skills/tree/33375500bcea98d610eb30ce10ac4e59b89c390d/skills/skill-creator)

### Other reviewed references

- [Agent Skills format specification](https://agentskills.io/specification)
- [Superpowers brainstorming](https://github.com/obra/superpowers/tree/8ca22dba9a94f28898bbce59f2537ff4d87c747d/skills/brainstorming)
- [Superpowers systematic debugging](https://github.com/obra/superpowers/tree/8ca22dba9a94f28898bbce59f2537ff4d87c747d/skills/systematic-debugging)
- [Superpowers verification before completion](https://github.com/obra/superpowers/tree/8ca22dba9a94f28898bbce59f2537ff4d87c747d/skills/verification-before-completion)

The source repositories remain the authoritative place for their original skills, full dependencies, and current installation instructions. Re-check them before updating this collection.
