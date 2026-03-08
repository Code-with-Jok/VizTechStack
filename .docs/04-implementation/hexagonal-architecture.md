# Hướng Dẫn Hexagonal Architecture

## Tổng Quan

Backend modules của VizTechStack tuân theo hexagonal architecture (còn gọi là ports and adapters) để đạt được sự phân tách concerns rõ ràng và business logic có thể test được.

## Các Layer Kiến Trúc

```
Transport Layer (GraphQL Resolvers)
    ↓ phụ thuộc vào
Application Layer (Services, Commands, Queries)
    ↓ phụ thuộc vào
Domain Layer (Entities, Policies, Errors)
    ↑ implements
Infrastructure Layer (Repository Adapters)
```

## Cấu Trúc Module

```
apps/api/src/modules/{module-name}/
├── application/           # Application Layer
│   ├── commands/         # Thao tác ghi
│   ├── queries/          # Thao tác đọc
│   ├── services/         # Orchestration use case
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

## Trách Nhiệm Các Layer

### Transport Layer

**Mục Đích**: Xử lý giao tiếp bên ngoài (GraphQL, REST, etc.)

**Chứa**:
- GraphQL resolvers
- GraphQL type definitions
- DTO mappers
- Exception filters

**Ví Dụ**:
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

**Mục Đích**: Orchestrate use cases và business workflows

**Chứa**:
- Commands (thao tác ghi)
- Queries (thao tác đọc)
- Application services
- Repository interfaces (ports)

**Ví Dụ**:
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

**Mục Đích**: Chứa business logic và rules

**Chứa**:
- Domain entities
- Business policies
- Domain errors
- Value objects

**Ví Dụ**:
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

**Mục Đích**: Triển khai technical concerns (database, external services)

**Chứa**:
- Repository implementations
- Database adapters
- External service clients

**Ví Dụ**:
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

Sử dụng NestJS DI với symbol tokens:

```typescript
// Định nghĩa token
export const ROADMAP_REPOSITORY = Symbol('ROADMAP_REPOSITORY')

// Cấu hình module
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

## Lợi Ích

- **Testability**: Dễ dàng mock dependencies
- **Flexibility**: Thay đổi implementations mà không thay đổi business logic
- **Maintainability**: Phân tách concerns rõ ràng
- **Independence**: Business logic độc lập với frameworks

## Tạo Module Mới

Sử dụng utility script:

```bash
pnpm generate:module user-profile
```

Lệnh này tự động tạo cấu trúc hexagonal hoàn chỉnh.

## Xem Thêm

- [Cấu Trúc Backend Module](../02-architecture/README.md#backend-module-structure)
- [Tính Năng Roadmap](../03-features/roadmap.md)
