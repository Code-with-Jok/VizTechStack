# Zero-Debt Engineering Rules

These rules are mandatory for new code and refactors.

## 1) SOLID + Patterns For `roadmap` Domain

Current hotspot: roadmap logic is concentrated in resolver layer (`apps/api/src/modules/roadmap/roadmap.resolver.ts`).

Target design:

- `Resolver` (transport only): input/output mapping for GraphQL.
- `Application Service`: use-case orchestration (`CreateRoadmap`, `GetRoadmapBySlug`, `ListRoadmaps`).
- `Repository Port`: interface over data access.
- `Convex Adapter`: implementation for Convex queries/mutations.
- `Policy/Guard Service`: role and authorization policy.

Required patterns:

- `Dependency Inversion`: resolver depends on interfaces, not Convex client directly.
- `Factory` for client creation with retry/timeouts.
- `Result` pattern for business errors (avoid throwing raw strings).
- `Mapper` for DTO <-> Domain conversion.

## 2) Naming and Folder Standard (30-minute onboarding target)

Use this structure per module:

```text
apps/api/src/modules/<domain>/
  application/
    commands/
    queries/
    services/
  domain/
    entities/
    value-objects/
    policies/
    errors/
  infrastructure/
    repositories/
    adapters/
  transport/
    graphql/
      resolvers/
      schemas/
      mappers/
```

Naming rules:

- Files: `kebab-case`.
- Classes: `PascalCase`.
- Functions/variables: `camelCase`.
- DTO/Input suffix: `*Dto` / `*Input`.
- Domain errors: `*DomainError`.
- Cross-app shared contracts live only in `packages/shared/types`.

## 3) Centralized Error Handling

Rules:

- No raw `throw new Error("...")` for expected business cases.
- Use typed errors:
  - `DomainError`
  - `ValidationError`
  - `AuthorizationError`
  - `InfrastructureError`
- Map errors centrally:
  - NestJS `ExceptionFilter` for API.
  - UI error boundary + typed API error mapping.

Required metadata in every error log:

- `traceId`, `userId` (if available), `module`, `operation`, `severity`.

## 4) End-to-End Type-Safety Strategy

Current risk:

- Manual GraphQL string operations in web pages.
- Casts and `any` usage in Convex identity handling.
- ESLint allows explicit `any`.

Target pipeline:

1. Convex schema remains source of truth.
2. Generate typed API contracts (GraphQL codegen or typed client wrapper).
3. Share domain schemas with Zod in `packages/shared/types`.
4. Validate external inputs at boundaries only, then use inferred types internally.
5. Disallow `any` globally.

Required enforcement:

- Set `@typescript-eslint/no-explicit-any: error`.
- Set `@typescript-eslint/no-unsafe-assignment: error`.
- Set `@typescript-eslint/no-unsafe-member-access: error`.
- Add CI gate: fail if `rg "\bany\b"` matches outside approved exceptions.

Exception process:

- Use `unknown` + narrow, not `any`.
- If temporary `any` is unavoidable:
  - Add inline `TODO(debt-id)` with expiry date.
  - Add debt ticket before merge.
