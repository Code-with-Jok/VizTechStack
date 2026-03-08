# Hexagonal Architecture Guide

## Overview

VizTechStack backend modules follow hexagonal architecture (also known as ports and adapters) to achieve clean separation of concerns and testable business logic.

## Architecture Layers

```
Transport Layer (GraphQL Resolvers)
    ↓ depends on
Application Layer (Services, Commands, Queries)
    ↓ depends on
Domain Layer (Entities, Policies, Errors)
    ↑ implements
Infrastructure Layer (Repository Adapters)
```

## Module Structure

```
apps/api/src/modules/{module-name}/
├── application/           # Application Layer
│   ├── commands/         # Write operations
│   ├── queries/          # Read operations
│   ├── services/         # Use case orchestration
│   └── ports/            # Repository interfaces
├── domain/               # Domain Layer
│   ├── entities/         # Business objects
│   ├── errors/           # Domain exceptions
│   └── policies/         # Business rules
├── infrastructure/       # Infrastructure Layer
│   └── adapters/         # Repository implementations
└── transport/            # Transport Layer
    └── graphql/          # GraphQL API
        ├── resolvers/    # GraphQL resolvers
        ├── schemas/      # GraphQL types
        └── mappers/      # DTO transformations
```

## Layer Responsibilities

### Transport Layer

**Purpose**: Handle external communication (GraphQL, REST, etc.)

**Contains**:
- GraphQL resolvers
- GraphQL type definitions
- DTO mappers
- Exception filters

**Example**:
```typescript
@Resolver(() => Roadmap)
export class RoadmapResolver {
  constructor(private service: RoadmapApplicationService) {}

  @Query(() => [Roadmap])
  async getRoadmaps() {
    const roadmaps = await this.service.findAll()
    return roadmaps.map(RoadmapMapper.toGraphQL)
  }
}
```

### Application Layer

**Purpose**: Orchestrate use cases and business workflows

**Contains**:
- Commands (write operations)
- Queries (read operations)
- Application services
- Repository interfaces (ports)

**Example**:
```typescript
@Injectable()
export class RoadmapApplicationService {
  constructor(
    @Inject(ROADMAP_REPOSITORY)
    private repository: RoadmapRepository
  ) {}

  async createRoadmap(command: CreateRoadmapCommand) {
    const entity = RoadmapEntity.create(command)
    return await this.repository.save(entity)
  }
}
```

### Domain Layer

**Purpose**: Contain business logic and rules

**Contains**:
- Domain entities
- Business policies
- Domain errors
- Value objects

**Example**:
```typescript
export class RoadmapEntity {
  constructor(
    public readonly id: string,
    public title: string,
    public slug: string,
    public status: RoadmapStatus
  ) {}

  publish() {
    if (this.nodes.length === 0) {
      throw new RoadmapValidationError('Cannot publish empty roadmap')
    }
    this.status = 'public'
  }
}
```

### Infrastructure Layer

**Purpose**: Implement technical concerns (database, external services)

**Contains**:
- Repository implementations
- Database adapters
- External service clients

**Example**:
```typescript
@Injectable()
export class ConvexRoadmapRepository implements RoadmapRepository {
  async save(entity: RoadmapEntity): Promise<RoadmapEntity> {
    const id = await this.convex.mutation(api.roadmaps.create, {
      ...entity
    })
    return { ...entity, id }
  }
}
```

## Dependency Injection

Use NestJS DI with symbol tokens:

```typescript
// Define token
export const ROADMAP_REPOSITORY = Symbol('ROADMAP_REPOSITORY')

// Module configuration
@Module({
  providers: [
    {
      provide: ROADMAP_REPOSITORY,
      useClass: ConvexRoadmapRepository,
    },
    RoadmapApplicationService,
  ],
})
export class RoadmapModule {}
```

## Benefits

- **Testability**: Easy to mock dependencies
- **Flexibility**: Swap implementations without changing business logic
- **Maintainability**: Clear separation of concerns
- **Independence**: Business logic independent of frameworks

## Generating New Modules

Use the utility script:

```bash
pnpm generate:module user-profile
```

This creates the complete hexagonal structure automatically.

## See Also

- [Backend Module Structure](../02-architecture/README.md#backend-module-structure)
- [Roadmap Feature](../03-features/roadmap.md)
