---
inclusion: always
---

# Project Structure

## Monorepo Organization

```
viztechstack/
├── apps/                   # Applications
│   ├── web/               # Next.js frontend
│   └── api/               # NestJS backend
├── packages/              # Shared packages
│   ├── shared/           # Shared utilities and types
│   ├── core/             # Business logic packages
│   └── ui/               # UI component library
├── tooling/              # Development tools
│   ├── env/             # Environment validation
│   └── scripts/         # Build scripts
├── convex/               # Convex database functions
├── .docs/                # Architecture documentation
├── .kiro/                # Kiro configuration
│   ├── specs/           # Feature specs
│   └── steering/        # Steering rules
└── configs/              # Shared configurations
```

## Backend Module Structure (Domain-Driven Design)

Each NestJS module follows hexagonal architecture with clear layer separation:

```
apps/api/src/modules/{module-name}/
├── application/           # Application Layer
│   ├── commands/         # Write operations (CreateX, UpdateX, DeleteX)
│   ├── queries/          # Read operations (ListX, GetXBy...)
│   ├── services/         # Use case orchestration
│   └── ports/            # Repository interfaces (contracts)
├── domain/               # Domain Layer
│   ├── entities/         # Domain models (business objects)
│   ├── errors/           # Domain-specific exceptions
│   └── policies/         # Business rules and validation
├── infrastructure/       # Infrastructure Layer
│   └── adapters/         # Concrete implementations (ConvexRepository)
└── transport/            # Transport Layer
    └── graphql/          # GraphQL API
        ├── resolvers/    # GraphQL resolvers
        ├── schemas/      # GraphQL type definitions
        ├── mappers/      # DTO ↔ Domain transformations
        └── filters/      # Exception filters
```

## Shared Packages Structure

```
packages/shared/
├── graphql-schema/        # GraphQL schema definitions (.graphql files)
├── graphql-generated/     # Auto-generated types and Zod schemas
├── api-client/           # Type-safe GraphQL client with React hooks
├── validation/           # Validation utilities and error handling
├── types/                # Shared Zod schemas and TypeScript types
└── utils/                # Common utilities
```

## Frontend Structure

```
apps/web/src/
├── app/                  # Next.js App Router
│   ├── layout.tsx       # Root layout with providers
│   ├── page.tsx         # Homepage
│   └── roadmaps/        # Roadmap pages
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   └── roadmap/        # Domain-specific components
└── lib/                # Utilities and configurations
```

## Key Conventions

### Naming Patterns

- **Commands**: `{Verb}{Entity}Command` (e.g., CreateRoadmapCommand)
- **Queries**: `{Verb}{Entity}Query` or `Get{Entity}By{Criteria}Query`
- **Entities**: `{Entity}Entity` (e.g., RoadmapEntity)
- **Errors**: `{Entity}{Type}DomainError` (e.g., RoadmapValidationDomainError)
- **Repositories**: `{Entity}Repository` interface, `Convex{Entity}Repository` implementation
- **Services**: `{Entity}ApplicationService`

### File Naming

- Use kebab-case for files: `roadmap-application.service.ts`
- Use PascalCase for classes: `RoadmapApplicationService`
- GraphQL files use `.graphql` extension
- Test files use `.spec.ts` suffix

### Import Conventions

- Use workspace protocol for internal packages: `@viztechstack/{package-name}`
- Prefer named exports over default exports
- Group imports: external → internal → relative

## Architecture Patterns

### Dependency Flow

```
Transport Layer (GraphQL Resolvers)
    ↓ depends on
Application Layer (Services)
    ↓ depends on
Domain Layer (Entities, Policies)
    ↓ depends on
Infrastructure Layer (Repositories)
```

### Repository Pattern

- **Port**: Interface in `application/ports/` defines contract
- **Adapter**: Implementation in `infrastructure/adapters/` provides concrete behavior
- **DI**: NestJS module binds interface to implementation using Symbol token

### Guards and Decorators

- **@Public()**: Skip authentication for public endpoints
- **@Roles('admin')**: Require specific role for protected endpoints
- **ClerkAuthGuard**: Validates JWT tokens from Clerk
- **RolesGuard**: Checks user role from JWT metadata

## Testing Structure

```
apps/api/
├── src/                  # Source code
│   └── **/*.spec.ts     # Unit tests (co-located with source)
└── test/                # Integration tests
    └── **/*.e2e-spec.ts # E2E tests
```

Coverage thresholds: 25% (branches, functions, lines, statements)
