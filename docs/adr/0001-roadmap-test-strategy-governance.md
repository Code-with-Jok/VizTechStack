# ADR-0001: Roadmap Module Test Strategy and Governance Baseline

## Context

`apps/api` had limited automated coverage and no enforced baseline for roadmap refactors.
The roadmap module was recently split into `transport -> application -> domain -> infrastructure`,
but validation depended on a small test set and did not cover key regression risks:

- application validation and input normalization
- Convex adapter payload/error mapping
- GraphQL role-based mutation access (`admin` only)

Without stronger test governance, future refactors can regress behavior while still passing
lint/typecheck/build stages.

## Decision

Adopt a layered test matrix for roadmap module changes and enforce a minimum coverage gate:

1. Add unit tests for `RoadmapApplicationService`.
2. Add integration-style tests for `ConvexRoadmapRepository` with mocked Convex client.
3. Add GraphQL e2e tests for:
   - list roadmaps
   - get roadmap by slug
   - create roadmap (`admin` allowed, non-admin denied)
4. Update `apps/api` `test` script to run both unit/integration and e2e suites.
5. Add `coverageThreshold` baseline in `apps/api` Jest config:
   - branches: 20
   - functions: 25
   - lines: 25
   - statements: 25

## Alternatives Considered

- Option A: Keep only unit tests and defer e2e to manual QA.
  - Faster initially, but weak confidence at GraphQL/auth boundary.
- Option B: Add full matrix now with minimum coverage gate. (selected)
  - Slightly higher run time, but materially lower regression risk.

## Consequences

Positive:

- Critical roadmap flows are now covered across service, adapter, and GraphQL transport.
- Governance command `pnpm turbo test --filter='./apps/**'` now validates both regular and e2e suites.
- Coverage has an explicit floor to prevent silent erosion.

Negative:

- API test execution time increases due to e2e bootstrapping.
- Threshold is intentionally conservative and should be raised in subsequent phases.

## Rollback Strategy

If CI duration or flakiness becomes unacceptable:

1. Revert `apps/api` `test` script to unit/integration only (`jest`).
2. Keep e2e suite available under `test:e2e` and execute in a dedicated CI job.
3. Keep or lower coverage threshold temporarily with follow-up ticket and deadline.

## Links

- PR: TBD
- Issue: `task.md` Phase 5 - Test Strategy & Governance (P1)
