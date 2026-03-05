# AI Agent Operating Docs

This folder defines rules and workflows for AI agents working in `VizTechStack`.

## Structure

- `rules/decision-framework.md`: Mandatory decision model (Speed vs Quality vs Cost) and technical debt policy.
- `rules/zero-debt-engineering.md`: Clean code, SOLID, naming, error handling, and end-to-end type-safety standards.
- `rules/prod-incident-access.md`: Mandatory permissions and flow for production incidents (browser, terminal, PR access).
- `workflows/scalability-audit.md`: CTO-level scalability audit and 6-month technical roadmap for this repo.
- `workflows/git-flow-ci-cd.md`: Branch-to-production workflow with lint, tests, and security gates.
- `workflows/review-strategy.md`: Code review checklist focused on logic, security, and performance.
- `workflows/documentation-and-dora.md`: Documentation-as-code, ADR lifecycle, and DORA metrics tracking.

## Execution Order For Agent

1. Read `rules/decision-framework.md`.
2. Read the workflow document matching the task.
3. If task is production incident, read `rules/prod-incident-access.md` before triage.
4. Apply `rules/zero-debt-engineering.md` before proposing or shipping changes.
5. Validate against review and DORA docs before merge.

## Non-Negotiables

- Always evaluate `Speed`, `Quality`, and `Cost` before giving a recommendation.
- Always flag potential technical debt and provide a better alternative.
- Prefer automation and long-term maintainability over manual steps.
