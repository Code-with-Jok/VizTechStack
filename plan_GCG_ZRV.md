# Plan: GraphQL Code Generator + Zod Runtime Validation

## 1) Objective

Build a monorepo-ready architecture that delivers both:
- compile-time type safety from GraphQL
- runtime response validation using Zod

Target stack:
- TypeScript
- React frontend
- GraphQL backend/API

## 2) Scope

In scope:
- GraphQL type generation pipeline
- Zod validation integration for query/mutation responses
- Shared package boundaries for monorepo
- React client usage pattern and error mapping

Out of scope (phase 1):
- Full migration of all legacy GraphQL operations
- Large-scale caching redesign
- Backend resolver business refactor not related to validation pipeline

## 3) Decision (Speed / Quality / Cost)

### Option A - Manual Zod schemas from generated TypeScript
- Speed: 2/5
- Quality: 4/5
- Cost: 2/5
- Risk: schema drift and duplicated contracts

### Option B - Auto-generate Zod using plugin
- Speed: 4/5
- Quality: 3/5
- Cost: 4/5
- Risk: limited control for custom scalar edge cases

### Option C - Hybrid (selected)
- Speed: 4/5
- Quality: 5/5
- Cost: 4/5
- Approach: auto-generated baseline + manual overrides for edge cases

Debt warning:
- Medium debt if override policy is not controlled.
- Mitigation:
  - enforce codegen check in CI
  - keep overrides in one package
  - require tests for each override

## 4) Monorepo Structure

Planned structure:

```text
apps/
  web/

packages/
  graphql-schema/
    src/schema.graphql
    src/operations/**/*.graphql
  graphql-generated/
    src/schema-types.ts
    src/operations.ts
  validation/
    src/generated/graphql-zod.ts
    src/overrides/*.ts
  api-client/
    src/graphql-client.ts
    src/roadmaps.client.ts
```

## 5) Implementation Phases

## Phase 1 - Foundation

Tasks:
- Add `packages/graphql-schema` as source of truth for schema + operations.
- Add `codegen.ts` at repo root with:
  - `typescript`
  - `typescript-operations`
  - `typed-document-node`
  - `typescript-zod`
- Add scripts:
  - `codegen`
  - `codegen:watch`
  - `codegen:check`

Definition of Done:
- codegen runs successfully and generates TS + Zod artifacts.

## Phase 2 - Validation Package

Tasks:
- Create `packages/validation`.
- Export generated schemas from `src/generated`.
- Add override layer for custom scalars and special payloads.
- Add helper function:
  - `validateOrThrow(operationName, schema, payload)`

Definition of Done:
- any operation can parse response with one shared validator entry point.

## Phase 3 - API Client Integration

Tasks:
- Create `packages/api-client` typed request wrapper.
- Consume typed documents from `graphql-generated`.
- Parse responses with Zod before returning to app code.
- Define normalized errors:
  - `NetworkError`
  - `GraphQLRequestError`
  - `RuntimeValidationError`

Definition of Done:
- no raw GraphQL response object is returned directly to UI code.

## Phase 4 - React Adoption

Tasks:
- Migrate target feature calls in `apps/web` to new api-client.
- Add query hooks with typed return states.
- Add UI fallback for runtime validation failure.

Definition of Done:
- target feature pages no longer run ad-hoc GraphQL fetch + manual parsing.

## Phase 5 - Governance and Testing

Tasks:
- Add unit tests for validators and error mapping.
- Add integration tests for api-client parse behavior.
- Add e2e smoke test for one critical GraphQL flow.
- Enforce `codegen:check` in CI.

Definition of Done:
- CI fails on generated artifact drift or validator regressions.

## 6) Public Interfaces and Contracts

New interfaces:
- `packages/graphql-generated` exports generated operation types and documents.
- `packages/validation` exports operation schemas and validation helpers.
- `packages/api-client` exports feature-level typed functions/hooks.

Error contract:
- All runtime parse failures must throw `RuntimeValidationError` with:
  - `operationName`
  - `issues`
  - `rawResponse` (optional, sanitized)

## 7) Testing Matrix

Unit tests:
- schema parse success/failure
- override behavior
- error normalizer behavior

Integration tests:
- api-client request -> parse pipeline
- typed operation + zod schema compatibility

E2E tests:
- one read path and one write path with UI-safe handling

## 8) Rollout Plan

1. Deploy with feature-flagged client adoption for first feature.
2. Observe validation error rate and request failures.
3. Expand to remaining features by module.
4. Remove legacy client paths after parity verification.

Rollback:
- Switch feature flag to legacy client.
- Keep generated pipeline intact, rollback only client routing if needed.

## 9) Acceptance Criteria

- GraphQL operations are generated and typed.
- Runtime responses are validated via Zod before UI usage.
- No duplicated hand-written contracts for migrated operations.
- React app receives normalized typed errors.
- CI blocks schema/codegen drift.

