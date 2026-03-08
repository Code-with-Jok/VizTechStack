# Phân Tích Sâu Codebase - VizTechStack

**Ngày phân tích:** 2026-03-08  
**Phiên bản:** 2.0.0 (Phân tích chi tiết)  
**Ngôn ngữ:** Tiếng Việt

---

## Tóm Tắt Điều Hành (Executive Summary)

VizTechStack là nền tảng học tập tương tác với roadmap visualization, được xây dựng bằng kiến trúc hiện đại: **Hexagonal Architecture + Domain-Driven Design + CQRS**. Dự án có cấu trúc tốt, type safety mạnh mẽ, nhưng tồn tại các vấn đề nghiêm trọng về **vendor lock-in**, **JSON storage**, và **thiếu monitoring**.

### Điểm Mạnh Chính
✅ **Kiến trúc Clean**: DDD + Hexagonal Architecture được implement đúng chuẩn  
✅ **Type Safety**: End-to-end TypeScript + Zod validation  
✅ **Repository Pattern**: Abstraction layer tốt cho database  
✅ **GraphQL Code Generation**: Tự động generate types và schemas  
✅ **Monorepo**: Tổ chức tốt với pnpm + Turbo

### Vấn Đề Nghiêm Trọng
🔴 **Vendor Lock-in**: Phụ thuộc hoàn toàn vào Convex (khó migrate)  
🔴 **JSON Storage**: nodesJson/edgesJson không thể query được  
🔴 **Thiếu Monitoring**: Không có error tracking, logging, alerting  
🟡 **Test Coverage**: Thấp, chưa đủ để đảm bảo quality  
🟡 **N+1 Query Problem**: Chưa implement DataLoader

---

## 1. Kiến Trúc Tổng Thể

### 1.1 Mô Hình 3-Tier Architecture

```
┌─────────────────────────────────────────────────────────┐
│              PRESENTATION LAYER (Frontend)               │
│  Next.js 16 + React 19 + Apollo Client                 │
│  - Server Components (SSR/SSG)                          │
│  - Client Components (Interactive UI)                   │
│  - React Flow (Graph Visualization)                     │
└────────────────────┬────────────────────────────────────┘
                     │ GraphQL over HTTPS
┌────────────────────┴────────────────────────────────────┐
│            APPLICATION LAYER (Backend API)               │
│  NestJS 11 + Apollo Server + GraphQL                    │
│  - Resolvers (Transport Layer)                          │
│  - Application Services (Use Cases)                     │
│  - Domain Entities & Policies                           │
│  - Repository Interfaces (Ports)                        │
└────────────────────┬────────────────────────────────────┘
                     │ Convex HTTP Client
┌────────────────────┴────────────────────────────────────┐
│              DATA LAYER (Database)                       │
│  Convex Serverless Database                             │
│  - Real-time sync                                       │
│  - TypeScript-first schema                              │
│  - Built-in authentication                              │
└─────────────────────────────────────────────────────────┘
```

### 1.2 Hexagonal Architecture (Backend)

Backend được thiết kế theo **Ports & Adapters pattern**:


```
┌─────────────────────────────────────────────────────────┐
│                  TRANSPORT LAYER                         │
│  GraphQL Resolvers, REST Controllers                    │
│  - Nhận requests từ clients                             │
│  - Validate input với Zod schemas                       │
│  - Transform DTO ↔ Domain entities                      │
│  - Apply Guards (Auth, Roles)                           │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│                APPLICATION LAYER                         │
│  Use Cases & Application Services                       │
│  - Orchestrate business operations                      │
│  - Call domain policies for validation                  │
│  - Coordinate multiple repositories                     │
│  - Transaction management                               │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│                   DOMAIN LAYER                           │
│  Entities, Value Objects, Policies                      │
│  - Core business logic                                  │
│  - Business rules validation                            │
│  - Domain events (chưa implement)                       │
│  - Pure TypeScript (no dependencies)                    │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│              INFRASTRUCTURE LAYER                        │
│  Repository Adapters, External Services                 │
│  - ConvexRoadmapRepository (implements RoadmapRepository)│
│  - Database access                                      │
│  - External API calls                                   │
│  - File system operations                               │
└─────────────────────────────────────────────────────────┘
```

**Ưu điểm của kiến trúc này:**
- ✅ Domain logic độc lập với infrastructure
- ✅ Dễ test (mock repositories)
- ✅ Dễ swap implementations (Convex → PostgreSQL)
- ✅ Clear separation of concerns

---

## 2. Cấu Trúc Dự Án Chi Tiết

### 2.1 Monorepo Organization

```
viztechstack/
├── apps/                          # Applications
│   ├── web/                      # Next.js 16 Frontend
│   │   ├── src/
│   │   │   ├── app/             # App Router (Pages)
│   │   │   │   ├── roadmaps/   # Public roadmap pages
│   │   │   │   ├── admin/      # Admin dashboard
│   │   │   │   ├── my/         # User pages (bookmarks)
│   │   │   │   └── layout.tsx  # Root layout với Clerk
│   │   │   ├── components/      # React Components
│   │   │   │   ├── roadmap/    # Roadmap-specific
│   │   │   │   ├── ui/         # shadcn/ui components
│   │   │   │   └── layout/     # Layout components
│   │   │   └── lib/            # Utilities
│   │   └── package.json
│   │
│   └── api/                      # NestJS 11 Backend
│       ├── src/
│       │   ├── modules/         # Domain modules
│       │   │   └── roadmap/    # Roadmap module (DDD)
│       │   │       ├── application/
│       │   │       │   ├── commands/    # Write ops
│       │   │       │   ├── queries/     # Read ops
│       │   │       │   ├── services/    # Use cases
│       │   │       │   └── ports/       # Interfaces
│       │   │       ├── domain/
│       │   │       │   ├── entities/    # Domain models
│       │   │       │   ├── errors/      # Domain errors
│       │   │       │   └── policies/    # Business rules
│       │   │       ├── infrastructure/
│       │   │       │   └── adapters/    # Convex repos
│       │   │       └── transport/
│       │   │           └── graphql/     # GraphQL API
│       │   │               ├── resolvers/
│       │   │               ├── schemas/
│       │   │               ├── mappers/
│       │   │               └── filters/
│       │   ├── common/          # Shared utilities
│       │   │   ├── guards/      # Auth guards
│       │   │   ├── decorators/  # Custom decorators
│       │   │   └── convex/      # Convex service
│       │   └── main.ts
│       └── package.json
│
├── packages/                      # Shared Packages
│   └── shared/
│       ├── graphql-schema/       # .graphql files
│       ├── graphql-generated/    # Generated types + Zod
│       ├── api-client/          # GraphQL client + hooks
│       ├── types/               # Zod schemas
│       ├── validation/          # Validation utils
│       └── utils/               # Common utilities
│
├── convex/                        # Convex Database
│   ├── schema.ts                 # Database schema
│   ├── roadmaps.ts              # Roadmap queries/mutations
│   ├── topics.ts                # Topic queries/mutations
│   ├── progress.ts              # Progress tracking
│   └── bookmarks.ts             # Bookmark management
│
├── .docs/                         # Documentation
│   ├── architecture/             # Architecture docs
│   └── analysis/                # Code analysis
│
├── .kiro/                         # Kiro AI Config
│   ├── specs/                   # Feature specs
│   └── steering/                # Steering rules
│
└── configs/                       # Shared configs
    ├── eslint/
    ├── typescript/
    └── tailwind/
```

### 2.2 Backend Module Structure (Roadmap Module)

Roadmap module là ví dụ điển hình của DDD implementation:


```
apps/api/src/modules/roadmap/
├── application/                           # Application Layer
│   ├── commands/                         # Write Operations (CQRS)
│   │   ├── create-roadmap.command.ts    # CreateRoadmapCommand
│   │   ├── update-roadmap.command.ts    # UpdateRoadmapCommand
│   │   └── delete-roadmap.command.ts    # DeleteRoadmapCommand
│   │
│   ├── queries/                          # Read Operations (CQRS)
│   │   ├── list-roadmaps.query.ts       # ListRoadmapsQuery
│   │   ├── get-roadmap-by-slug.query.ts # GetRoadmapBySlugQuery
│   │   └── get-skill-nodes.query.ts     # GetSkillNodesQuery
│   │
│   ├── services/                         # Use Case Orchestration
│   │   ├── roadmap-application.service.ts
│   │   ├── topic-application.service.ts
│   │   ├── progress-application.service.ts
│   │   └── bookmark-application.service.ts
│   │
│   └── ports/                            # Repository Interfaces (Ports)
│       ├── roadmap.repository.ts        # Interface
│       ├── topic.repository.ts
│       ├── progress.repository.ts
│       └── bookmark.repository.ts
│
├── domain/                                # Domain Layer
│   ├── entities/                         # Domain Models
│   │   ├── roadmap.entity.ts            # RoadmapEntity
│   │   ├── roadmap-page.entity.ts       # RoadmapPageEntity
│   │   ├── node.entity.ts               # NodeEntity
│   │   ├── edge.entity.ts               # EdgeEntity
│   │   ├── topic.entity.ts
│   │   ├── progress.entity.ts
│   │   └── bookmark.entity.ts
│   │
│   ├── errors/                           # Domain Exceptions
│   │   └── roadmap-domain-error.ts      # Base + specific errors
│   │       ├── RoadmapValidationDomainError
│   │       ├── RoadmapNotFoundDomainError
│   │       ├── RoadmapAuthorizationDomainError
│   │       └── RoadmapInfrastructureDomainError
│   │
│   └── policies/                         # Business Rules
│       └── roadmap-input.policy.ts      # Validation policies
│           ├── validateCreateRoadmapInput()
│           ├── validateUpdateRoadmapInput()
│           └── validateRoadmapSlug()
│
├── infrastructure/                        # Infrastructure Layer
│   └── adapters/                         # Concrete Implementations (Adapters)
│       ├── convex-roadmap.repository.ts # ConvexRoadmapRepository
│       ├── convex-topic.repository.ts
│       ├── convex-progress.repository.ts
│       └── convex-bookmark.repository.ts
│
└── transport/                             # Transport Layer
    └── graphql/                          # GraphQL API
        ├── resolvers/                    # GraphQL Resolvers
        │   ├── roadmap.resolver.ts      # Queries + Mutations
        │   ├── topic.resolver.ts
        │   ├── progress.resolver.ts
        │   └── bookmark.resolver.ts
        │
        ├── schemas/                      # GraphQL Type Definitions
        │   ├── roadmap.schema.ts        # @ObjectType, @InputType
        │   ├── node.schema.ts
        │   ├── edge.schema.ts
        │   ├── topic.schema.ts
        │   ├── progress.schema.ts
        │   └── bookmark.schema.ts
        │
        ├── mappers/                      # DTO ↔ Domain Transformations
        │   ├── roadmap.mapper.ts        # mapRoadmapEntityToGraphQL()
        │   ├── topic.mapper.ts
        │   ├── progress.mapper.ts
        │   └── bookmark.mapper.ts
        │
        └── filters/                      # Exception Filters
            └── roadmap-domain-exception.filter.ts
```

**Giải thích các layer:**

1. **Transport Layer**: Nhận requests, validate input, transform data
2. **Application Layer**: Orchestrate use cases, gọi domain policies
3. **Domain Layer**: Business logic thuần túy, không phụ thuộc infrastructure
4. **Infrastructure Layer**: Implement repositories, gọi external services

---

## 3. Business Logic Flow Chi Tiết

### 3.1 Luồng Đọc Dữ Liệu: List Roadmaps

**Sequence Diagram:**

```
Client (Next.js)
    ↓ GraphQL Query: listRoadmaps(category: "role")
RoadmapResolver (@Public)
    ↓ Call service
RoadmapApplicationService.listRoadmaps()
    ↓ Validate input (limit, cursor)
    ↓ Call repository
ConvexRoadmapRepository.list()
    ↓ Convex HTTP Client
Convex Database Query
    ↓ SELECT FROM roadmapSummaries WHERE category = "role"
    ↓ Filter by status = "public"
    ↓ Paginate (cursor-based)
Return { page: [...], continueCursor, isDone }
    ↓ Transform to RoadmapPageEntity
RoadmapApplicationService
    ↓ Return domain entities
RoadmapResolver
    ↓ Map to GraphQL types (mapRoadmapPageEntityToGraphQL)
Apollo Client
    ↓ Cache response
Client renders RoadmapCard components
```

**Code Flow Chi Tiết:**

**Step 1: Client Request**
```typescript
// apps/web/src/app/roadmaps/page.tsx
const { data, loading } = useQuery(LIST_ROADMAPS_QUERY, {
  variables: { 
    input: { 
      category: 'role',
      limit: 24 
    } 
  }
});
```

**Step 2: GraphQL Resolver**
```typescript
// apps/api/src/modules/roadmap/transport/graphql/resolvers/roadmap.resolver.ts
@Query(() => RoadmapPage)
@Public()  // ← Không cần authentication
async listRoadmaps(
  @Args('input', { type: () => RoadmapPageInput, nullable: true })
  input?: RoadmapPageInput,
): Promise<RoadmapPage> {
  const roadmapPage = await this.roadmapApplicationService.listRoadmaps({
    category: input?.category ? this.mapCategoryToDomain(input.category) : undefined,
    limit: input?.limit ?? 24,
    cursor: input?.cursor ?? null,
  });
  
  return mapRoadmapPageEntityToGraphQL(roadmapPage);
}
```

**Step 3: Application Service**
```typescript
// apps/api/src/modules/roadmap/application/services/roadmap-application.service.ts
async listRoadmaps(query: ListRoadmapsQuery): Promise<RoadmapPageEntity> {
  // 1. Validate input
  const limit = query.limit ?? 24;
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new RoadmapValidationDomainError(
      'Limit must be an integer between 1 and 100.',
      'listRoadmaps',
    );
  }
  
  // 2. Call repository
  return this.roadmapRepository.list(
    { category: query.category },
    { limit, cursor: query.cursor ?? null },
    query.isAdmin ?? false,
  );
}
```

**Step 4: Repository (Adapter)**
```typescript
// apps/api/src/modules/roadmap/infrastructure/adapters/convex-roadmap.repository.ts
async list(
  filters: RoadmapFilters,
  pagination: PaginationInput,
  _isAdmin: boolean,
): Promise<RoadmapPageEntity> {
  // Call Convex API
  const result = await this.convexService.client.query(
    api.roadmaps.list,
    {
      category: filters.category,
      paginationOpts: {
        numItems: pagination.limit ?? 24,
        cursor: pagination.cursor ?? null,
      },
    },
  );
  
  // Transform to domain entities
  const items: RoadmapEntity[] = result.page.map(summary => ({
    id: summary._id,
    slug: summary.slug,
    title: summary.title,
    // ... other fields
  }));
  
  return {
    items,
    nextCursor: result.continueCursor ?? null,
    isDone: result.isDone,
  };
}
```

**Step 5: Convex Database Query**
```typescript
// convex/roadmaps.ts
export const list = query({
  args: {
    category: v.optional(v.union(
      v.literal("role"),
      v.literal("skill"),
      v.literal("best-practice"),
    )),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    // Build query
    let query = ctx.db.query("roadmapSummaries");
    
    // Apply category filter
    if (args.category) {
      query = query.withIndex("by_category_created_at", (q) =>
        q.eq("category", args.category)
      );
    }
    
    // Filter by status (only public)
    query = query.filter((q) => q.eq(q.field("status"), "public"));
    
    // Order by createdAt desc
    query = query.order("desc");
    
    // Paginate
    const result = await query.paginate(args.paginationOpts);
    
    return {
      page: result.page,
      continueCursor: result.continueCursor,
      isDone: result.isDone,
    };
  },
});
```

### 3.2 Luồng Ghi Dữ Liệu: Create Roadmap (Admin Only)

**Sequence Diagram:**

```
Admin Client
    ↓ GraphQL Mutation: createRoadmap(input)
ClerkAuthGuard
    ↓ Validate JWT token
    ↓ Extract user from token
RolesGuard
    ↓ Check role === "admin"
    ↓ If not admin → throw UnauthorizedException
RoadmapResolver (@Roles('admin'))
    ↓ Map input to CreateRoadmapCommand
RoadmapApplicationService.createRoadmap()
    ↓ Normalize input (trim strings)
    ↓ Call domain policy
RoadmapInputPolicy.validateCreateRoadmapInput()
    ↓ Validate slug, title, description
    ↓ Validate JSON format (nodesJson, edgesJson)
    ↓ If invalid → throw RoadmapValidationDomainError
ConvexRoadmapRepository.create()
    ↓ Convex HTTP Client
Convex Mutation: createRoadmap
    ↓ Check authentication
    ↓ Check admin role
    ↓ Check slug uniqueness
    ↓ INSERT INTO roadmaps
    ↓ INSERT INTO roadmapSummaries (denormalization)
Return roadmapId
    ↓ Fetch created roadmap
Return RoadmapEntity
    ↓ Map to GraphQL type
Apollo Client
    ↓ Update cache
Client redirects to /admin/roadmaps/[slug]/edit
```

**Code Flow Chi Tiết:**

**Step 1-2: Authentication & Authorization**
```typescript
// apps/api/src/common/guards/clerk-auth.guard.ts
@Injectable()
export class ClerkAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext();
    
    // Check if route is public
    const isPublic = this.reflector.get<boolean>('isPublic', context.getHandler());
    if (isPublic) return true;
    
    // Validate JWT token
    const token = this.extractToken(req);
    if (!token) throw new UnauthorizedException('No token provided');
    
    try {
      const payload = await this.clerkClient.verifyToken(token);
      req.user = payload;  // ← Attach user to request
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}

// apps/api/src/common/guards/roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) return true;
    
    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext();
    const user = req.user;
    
    const userRole = user?.publicMetadata?.role;
    return requiredRoles.includes(userRole);  // ← Check if user has required role
  }
}
```

**Step 3: Resolver**
```typescript
// apps/api/src/modules/roadmap/transport/graphql/resolvers/roadmap.resolver.ts
@Mutation(() => Roadmap)
@Roles('admin')  // ← Only admin can create
async createRoadmap(
  @Args('input', { type: () => CreateRoadmapInput })
  input: CreateRoadmapInput,
): Promise<Roadmap> {
  const roadmap = await this.roadmapApplicationService.createRoadmap(
    mapCreateRoadmapInputToCommand(input),
  );
  return mapRoadmapEntityToGraphQL(roadmap);
}
```

**Step 4: Application Service + Domain Validation**
```typescript
// apps/api/src/modules/roadmap/application/services/roadmap-application.service.ts
async createRoadmap(command: CreateRoadmapCommand): Promise<RoadmapEntity> {
  // 1. Normalize input
  const normalizedCommand: CreateRoadmapCommand = {
    ...command,
    slug: command.slug.trim(),
    title: command.title.trim(),
    description: command.description.trim(),
  };
  
  // 2. Validate using domain policy
  validateCreateRoadmapInput(normalizedCommand);
  
  // 3. Create entity
  const roadmapToCreate: Omit<RoadmapEntity, 'id'> = {
    slug: normalizedCommand.slug,
    title: normalizedCommand.title,
    description: normalizedCommand.description,
    category: normalizedCommand.category,
    difficulty: normalizedCommand.difficulty,
    nodesJson: normalizedCommand.nodesJson,
    edgesJson: normalizedCommand.edgesJson,
    topicCount: normalizedCommand.topicCount,
    status: normalizedCommand.status,
    createdAt: Date.now(),
  };
  
  // 4. Call repository
  return this.roadmapRepository.create(roadmapToCreate);
}

// apps/api/src/modules/roadmap/domain/policies/roadmap-input.policy.ts
export function validateCreateRoadmapInput(command: CreateRoadmapCommand): void {
  // Slug validation
  if (!command.slug || command.slug.length < 3) {
    throw new RoadmapValidationDomainError(
      'Slug must be at least 3 characters',
      'slug'
    );
  }
  
  // Title validation
  if (!command.title || command.title.length < 5) {
    throw new RoadmapValidationDomainError(
      'Title must be at least 5 characters',
      'title'
    );
  }
  
  // JSON validation
  try {
    JSON.parse(command.nodesJson);
    JSON.parse(command.edgesJson);
  } catch (error) {
    throw new RoadmapValidationDomainError(
      'Invalid JSON format',
      'nodesJson/edgesJson'
    );
  }
}
```

**Step 5: Repository + Convex Mutation**
```typescript
// apps/api/src/modules/roadmap/infrastructure/adapters/convex-roadmap.repository.ts
async create(roadmap: Omit<RoadmapEntity, 'id'>): Promise<RoadmapEntity> {
  const roadmapId = await this.convexService.client.mutation(
    api.roadmaps.createRoadmap,
    {
      slug: roadmap.slug,
      title: roadmap.title,
      description: roadmap.description,
      category: roadmap.category,
      difficulty: roadmap.difficulty,
      topicCount: roadmap.topicCount,
      nodesJson: roadmap.nodesJson,
      edgesJson: roadmap.edgesJson,
      status: roadmap.status,
    },
  );
  
  // Fetch the created roadmap
  const created = await this.convexService.client.query(
    api.roadmaps.getById,
    { id: roadmapId as Id<'roadmaps'> },
  );
  
  return this.mapToEntity(created);
}

// convex/roadmaps.ts
export const createRoadmap = mutation({
  args: { /* ... */ },
  handler: async (ctx, args) => {
    // 1. Check authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }
    
    // 2. Check authorization
    assertAdmin(identity, "createRoadmap");
    
    // 3. Check uniqueness
    const existing = await ctx.db
      .query("roadmaps")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    
    if (existing) {
      throw new Error(`Roadmap with slug '${args.slug}' already exists`);
    }
    
    // 4. Insert roadmap
    const roadmapId = await ctx.db.insert("roadmaps", {
      ...args,
      userId: identity.subject,
      createdAt: Date.now(),
    });
    
    // 5. Insert summary (denormalization)
    await ctx.db.insert("roadmapSummaries", {
      roadmapId,
      slug: args.slug,
      title: args.title,
      description: args.description,
      category: args.category,
      difficulty: args.difficulty,
      topicCount: args.topicCount,
      status: args.status,
      createdAt: Date.now(),
    });
    
    return roadmapId;
  },
});
```

---

## 4. Database Schema & Data Models

### 4.1 Convex Schema


```typescript
// convex/schema.ts
export default defineSchema({
  // ============================================
  // ROADMAPS TABLE (Full Data)
  // ============================================
  roadmaps: defineTable({
    slug: v.string(),                    // Unique identifier (URL-friendly)
    title: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("role"),
      v.literal("skill"),
      v.literal("best-practice"),
    ),
    difficulty: v.union(
      v.literal("beginner"),
      v.literal("intermediate"),
      v.literal("advanced"),
    ),
    nodesJson: v.string(),               // ⚠️ JSON string (không query được)
    edgesJson: v.string(),               // ⚠️ JSON string (không query được)
    topicCount: v.number(),
    status: v.optional(v.union(
      v.literal("public"),
      v.literal("draft"),
      v.literal("private"),
    )),
    userId: v.optional(v.string()),      // Creator (admin)
    createdAt: v.optional(v.number()),
  })
    .index("by_slug", ["slug"])          // Fast lookup by slug
    .index("by_category", ["category"])  // Filter by category
    .index("by_status", ["status"])      // Filter by status
    .index("by_category_status", ["category", "status"]),  // Composite index
  
  // ============================================
  // ROADMAP SUMMARIES TABLE (Denormalized)
  // ============================================
  roadmapSummaries: defineTable({
    roadmapId: v.id("roadmaps"),         // Reference to full roadmap
    slug: v.string(),
    title: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("role"),
      v.literal("skill"),
      v.literal("best-practice"),
    ),
    difficulty: v.union(
      v.literal("beginner"),
      v.literal("intermediate"),
      v.literal("advanced"),
    ),
    topicCount: v.number(),
    status: v.optional(v.union(
      v.literal("public"),
      v.literal("draft"),
      v.literal("private"),
    )),
    createdAt: v.optional(v.number()),
  })
    .index("by_roadmap", ["roadmapId"])
    .index("by_category_created_at", ["category", "createdAt"]),
  
  // ============================================
  // TOPICS TABLE (Node Content)
  // ============================================
  topics: defineTable({
    roadmapId: v.id("roadmaps"),
    nodeId: v.string(),                  // Reference to node in nodesJson
    title: v.string(),
    content: v.string(),                 // Markdown content
    resources: v.array(v.object({
      title: v.string(),
      url: v.string(),
      type: v.union(
        v.literal("article"),
        v.literal("video"),
        v.literal("course"),
      ),
    })),
  })
    .index("by_roadmap_node", ["roadmapId", "nodeId"]),
  
  // ============================================
  // PROGRESS TABLE (User Tracking)
  // ============================================
  progress: defineTable({
    userId: v.string(),
    roadmapId: v.id("roadmaps"),
    nodeId: v.string(),
    status: v.union(
      v.literal("done"),
      v.literal("in-progress"),
      v.literal("skipped"),
    ),
    updatedAt: v.number(),
  })
    .index("by_user_roadmap", ["userId", "roadmapId"])
    .index("by_user_roadmap_node", ["userId", "roadmapId", "nodeId"]),
  
  // ============================================
  // BOOKMARKS TABLE
  // ============================================
  bookmarks: defineTable({
    userId: v.string(),
    roadmapId: v.id("roadmaps"),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_roadmap", ["userId", "roadmapId"]),
});
```

### 4.2 Vấn Đề Nghiêm Trọng: JSON Storage

**Vấn đề:**
```typescript
// ❌ BAD: Storing graph as JSON strings
roadmaps: defineTable({
  nodesJson: v.string(),  // JSON string: '[{id: "1", ...}, {id: "2", ...}]'
  edgesJson: v.string(),  // JSON string: '[{id: "e1", source: "1", ...}]'
})
```

**Hậu quả:**
- ❌ **Không thể query individual nodes**: Không thể tìm node theo ID
- ❌ **Phải parse toàn bộ JSON**: Mỗi lần đọc phải parse cả graph
- ❌ **Không có schema validation**: JSON structure không được enforce
- ❌ **Khó update single node**: Phải parse → modify → stringify
- ❌ **Không có relational integrity**: Không thể enforce foreign keys

**Ví dụ thực tế:**
```typescript
// Muốn tìm node có id = "node-123"
// ❌ Không thể làm:
const node = await ctx.db
  .query("roadmapNodes")
  .withIndex("by_node_id", (q) => q.eq("nodeId", "node-123"))
  .first();

// ✅ Phải làm:
const roadmap = await ctx.db.query("roadmaps").first();
const nodes = JSON.parse(roadmap.nodesJson);  // Parse toàn bộ
const node = nodes.find(n => n.id === "node-123");  // Linear search
```

**Giải pháp đề xuất:**

```typescript
// ✅ GOOD: Normalized schema
roadmaps: defineTable({
  slug: v.string(),
  title: v.string(),
  // ... other fields (NO nodesJson, NO edgesJson)
}),

roadmapNodes: defineTable({
  roadmapId: v.id("roadmaps"),
  nodeId: v.string(),
  type: v.string(),
  positionX: v.number(),
  positionY: v.number(),
  label: v.string(),
  topicId: v.optional(v.string()),
  isReusedSkillNode: v.optional(v.boolean()),
  originalRoadmapId: v.optional(v.id("roadmaps")),
})
  .index("by_roadmap", ["roadmapId"])
  .index("by_roadmap_node", ["roadmapId", "nodeId"]),

roadmapEdges: defineTable({
  roadmapId: v.id("roadmaps"),
  edgeId: v.string(),
  source: v.string(),
  target: v.string(),
  type: v.optional(v.string()),
})
  .index("by_roadmap", ["roadmapId"])
  .index("by_source", ["roadmapId", "source"])
  .index("by_target", ["roadmapId", "target"]),
```

**Benefits:**
- ✅ Query individual nodes: `ctx.db.query("roadmapNodes").withIndex(...)`
- ✅ Update single node: `ctx.db.patch(nodeId, { positionX: newX })`
- ✅ Find edges by source: `ctx.db.query("roadmapEdges").withIndex("by_source", ...)`
- ✅ Schema validation: Convex enforces structure
- ✅ Relational integrity: Foreign keys với `v.id("roadmaps")`

### 4.3 Denormalization Strategy

**Tại sao có 2 tables: `roadmaps` và `roadmapSummaries`?**

```
roadmaps (Full Data)
├── Chứa toàn bộ data (nodesJson, edgesJson)
├── Size lớn (có thể > 1MB với graph phức tạp)
└── Dùng cho: getRoadmapBySlug (detail page)

roadmapSummaries (Lightweight)
├── Chỉ chứa metadata (title, description, category, ...)
├── Size nhỏ (< 1KB)
└── Dùng cho: listRoadmaps (list page)
```

**Trade-off:**
- ✅ **Performance**: List queries nhanh hơn 10x (không parse JSON)
- ✅ **Scalability**: Pagination hiệu quả hơn
- ❌ **Storage**: Duplicate data (tốn storage)
- ❌ **Consistency**: Phải sync 2 tables khi update

**Code implementation:**
```typescript
// convex/roadmaps.ts
export const createRoadmap = mutation({
  handler: async (ctx, args) => {
    // 1. Insert full roadmap
    const roadmapId = await ctx.db.insert("roadmaps", {
      slug: args.slug,
      title: args.title,
      // ... all fields including nodesJson, edgesJson
    });
    
    // 2. Insert summary (denormalization)
    await ctx.db.insert("roadmapSummaries", {
      roadmapId,
      slug: args.slug,
      title: args.title,
      description: args.description,
      category: args.category,
      difficulty: args.difficulty,
      topicCount: args.topicCount,
      status: args.status,
      // ← NO nodesJson, NO edgesJson
    });
    
    return roadmapId;
  },
});
```

---

## 5. Authentication & Authorization

### 5.1 Clerk Integration

**Flow:**
```
1. User clicks "Sign In"
   ↓
2. Clerk modal (email/OAuth)
   ↓
3. Clerk issues JWT token
   ↓
4. Token stored in cookies
   ↓
5. All API requests include Authorization header
   ↓
6. ClerkAuthGuard validates token
   ↓
7. Extract user info from token
   ↓
8. RolesGuard checks role
   ↓
9. Request proceeds or rejected
```

**JWT Token Structure:**
```json
{
  "sub": "user_123",  // User ID
  "email": "admin@example.com",
  "publicMetadata": {
    "role": "admin"  // ← Role stored here
  },
  "iat": 1234567890,
  "exp": 1234571490
}
```

### 5.2 Authorization Matrix

| Operation | Public | User | Admin |
|-----------|--------|------|-------|
| **Roadmaps** |
| List public roadmaps | ✅ | ✅ | ✅ |
| View public roadmap | ✅ | ✅ | ✅ |
| View draft/private roadmap | ❌ | ❌ | ✅ |
| Create roadmap | ❌ | ❌ | ✅ |
| Update roadmap | ❌ | ❌ | ✅ |
| Delete roadmap | ❌ | ❌ | ✅ |
| **Topics** |
| View topic | ✅ | ✅ | ✅ |
| Create topic | ❌ | ❌ | ✅ |
| **Progress** |
| View own progress | ❌ | ✅ | ✅ |
| Update own progress | ❌ | ✅ | ✅ |
| **Bookmarks** |
| View own bookmarks | ❌ | ✅ | ✅ |
| Add bookmark | ❌ | ✅ | ✅ |
| Remove bookmark | ❌ | ✅ | ✅ |

### 5.3 Implementation

**Public Endpoints:**
```typescript
@Query(() => [Roadmap])
@Public()  // ← Decorator to skip authentication
async getRoadmaps() { ... }
```

**User Endpoints:**
```typescript
@Query(() => [Progress])
// ← No decorator = requires authentication (default)
async getProgressForRoadmap(
  @CurrentUser() user: CurrentUserData,  // ← User injected by guard
) { ... }
```

**Admin Endpoints:**
```typescript
@Mutation(() => Roadmap)
@Roles('admin')  // ← Decorator to require admin role
async createRoadmap() { ... }
```

---

## 6. GraphQL API

### 6.1 Schema Overview

**Queries (Read Operations):**
```graphql
type Query {
  # Roadmaps
  listRoadmaps(input: RoadmapPageInput): RoadmapPage!
  getRoadmapBySlug(slug: String!): Roadmap
  getSkillNodesForRoleRoadmap: [Node!]!  # Admin only
  
  # Topics
  getTopicByNodeId(roadmapId: ID!, nodeId: ID!): Topic
  
  # Progress
  getProgressForRoadmap(roadmapId: ID!): [Progress!]!
  
  # Bookmarks
  getUserBookmarks: [Bookmark!]!
}
```

**Mutations (Write Operations):**
```graphql
type Mutation {
  # Roadmaps (Admin only)
  createRoadmap(input: CreateRoadmapInput!): Roadmap!
  updateRoadmap(id: ID!, input: UpdateRoadmapInput!): Roadmap!
  deleteRoadmap(id: ID!): Boolean!
  
  # Topics (Admin only)
  createTopic(input: CreateTopicInput!): Topic!
  
  # Progress (User)
  updateProgress(input: UpdateProgressInput!): Progress!
  
  # Bookmarks (User)
  addBookmark(roadmapId: ID!): Bookmark!
  removeBookmark(roadmapId: ID!): Boolean!
}
```

### 6.2 Type Definitions

**Roadmap Type:**
```graphql
type Roadmap {
  id: ID!
  slug: String!
  title: String!
  description: String!
  category: RoadmapCategory!
  difficulty: RoadmapDifficulty!
  nodes: [Node!]!
  edges: [Edge!]!
  topicCount: Int!
  status: RoadmapStatus!
  createdAt: Float!
}

enum RoadmapCategory {
  ROLE
  SKILL
  BEST_PRACTICE
}

enum RoadmapDifficulty {
  BEGINNER
  INTERMEDIATE
  ADVANCED
}

enum RoadmapStatus {
  PUBLIC
  DRAFT
  PRIVATE
}
```

**Node & Edge Types:**
```graphql
type Node {
  id: ID!
  type: String!
  position: Position!
  data: NodeData!
}

type Position {
  x: Float!
  y: Float!
}

type NodeData {
  label: String!
  topicId: String
  isReusedSkillNode: Boolean
  originalRoadmapId: String
}

type Edge {
  id: ID!
  source: String!
  target: String!
  type: String
}
```

### 6.3 Code Generation

**Process:**
```
1. Write GraphQL schema (.graphql files)
   ↓
2. Run: pnpm codegen
   ↓
3. GraphQL Codegen generates:
   - TypeScript types
   - Zod schemas
   - React hooks
   ↓
4. Use in code with full type safety
```

**Generated Files:**
```
packages/shared/graphql-generated/src/
├── types.ts              # TypeScript types
├── zod-schemas.ts        # Zod validation schemas
└── index.ts              # Exports
```

**Usage:**
```typescript
// Frontend
import { useListRoadmapsQuery } from '@viztechstack/api-client';

const { data, loading, error } = useListRoadmapsQuery({
  variables: { input: { category: 'role' } }
});

// Backend
import { CreateRoadmapInput } from '@viztechstack/graphql-generated';
import { createRoadmapInputSchema } from '@viztechstack/graphql-generated/zod-schemas';

// Validate input
const validated = createRoadmapInputSchema.parse(input);
```

---

## 7. Frontend Architecture

### 7.1 Next.js App Router Structure

```
apps/web/src/app/
├── layout.tsx                    # Root layout với Clerk
├── page.tsx                      # Homepage
│
├── roadmaps/                     # Public roadmap pages
│   ├── page.tsx                 # List page (SSR)
│   └── [slug]/
│       └── page.tsx             # Detail page (SSR)
│
├── admin/                        # Admin dashboard
│   └── roadmaps/
│       ├── page.tsx             # Admin roadmap list
│       ├── new/
│       │   └── page.tsx         # Create roadmap
│       └── [slug]/
│           └── edit/
│               └── page.tsx     # Edit roadmap
│
└── my/                           # User pages
    └── bookmarks/
        └── page.tsx             # User bookmarks
```

### 7.2 Component Hierarchy

**RoadmapList Page:**
```
RoadmapListPage (Server Component)
├── CategoryFilter (Client Component)
└── RoadmapGrid
    └── RoadmapCard[] (Client Component)
        ├── Image
        ├── Title, Description
        ├── Category Badge
        ├── Difficulty Badge
        └── BookmarkButton (Client Component)
```

**RoadmapDetail Page:**
```
RoadmapDetailPage (Server Component)
└── RoadmapDetailClient (Client Component)
    ├── RoadmapViewer
    │   ├── ReactFlow
    │   │   └── RoadmapNode[] (Custom Node)
    │   └── RoadmapControls
    │       ├── Zoom In/Out
    │       ├── Fit View
    │       └── Mini Map
    ├── TopicPanel (Modal/Sidebar)
    │   ├── MarkdownRenderer
    │   └── ResourceList
    │       └── ResourceLink[]
    └── ProgressTracker
        └── Status Buttons (done/in-progress/skipped)
```

**RoadmapEditor Page (Admin):**
```
RoadmapEditorPage (Server Component)
└── RoadmapEditorClient (Client Component)
    ├── NodeSidebar
    │   └── SkillNodeList (Draggable)
    ├── RoadmapEditor
    │   ├── ReactFlow (Editable)
    │   └── Toolbar
    │       ├── Save Button
    │       ├── Cancel Button
    │       └── Delete Button
    └── CreateTopicForm (Modal)
```

### 7.3 Data Fetching Patterns

**Server Components (SSR):**
```typescript
// apps/web/src/app/roadmaps/page.tsx
export default async function RoadmapsPage() {
  // Fetch data on server
  const { data } = await apolloClient.query({
    query: LIST_ROADMAPS_QUERY,
  });
  
  return <RoadmapList roadmaps={data.listRoadmaps.items} />;
}
```

**Client Components (CSR):**
```typescript
// apps/web/src/components/roadmap/roadmap-detail-client.tsx
'use client';

export function RoadmapDetailClient({ slug }: { slug: string }) {
  const { data, loading } = useQuery(GET_ROADMAP_BY_SLUG_QUERY, {
    variables: { slug },
  });
  
  if (loading) return <Skeleton />;
  
  return <RoadmapViewer roadmap={data.getRoadmapBySlug} />;
}
```

---

## 8. Vấn Đề & Khuyến Nghị

### 8.1 🔴 Critical Issues (Ưu Tiên Cao)

#### Issue 1: Vendor Lock-in với Convex

**Mô tả:**
- Toàn bộ data layer phụ thuộc vào Convex
- Không thể migrate sang database khác dễ dàng
- Rủi ro về pricing, policies, platform stability

**Impact:** 🔴 Critical  
**Effort:** 🔴 High (3-6 months)

**Giải pháp:**

**Option 1: Migration Strategy**
```
Phase 1: Dual Write (3 months)
├── Implement PostgreSQL repository
├── Write to both Convex và PostgreSQL
├── Read from Convex (primary)
└── Validate data consistency

Phase 2: Gradual Migration (2 months)
├── Switch reads to PostgreSQL
├── Monitor performance
└── Keep Convex as backup

Phase 3: Complete Migration (1 month)
├── Remove Convex dependencies
├── Update all queries
└── Decommission Convex
```

**Option 2: Alternative Stack**
```typescript
PostgreSQL (Database)
  ↓
Prisma (ORM)
  ↓
tRPC (Type-safe API)
  ↓
Next.js Client

Benefits:
✅ No vendor lock-in
✅ Powerful SQL queries
✅ Better performance at scale
✅ Lower cost
✅ Industry standard
```

**Action Items:**
1. **Immediate**: Document all Convex-specific logic
2. **Short-term (1-3 months)**: Implement PostgreSQL repository
3. **Long-term (6-12 months)**: Complete migration

---

#### Issue 2: JSON Storage Problem

**Mô tả:**
- nodesJson và edgesJson stored as strings
- Không thể query individual nodes
- Phải parse toàn bộ JSON mỗi lần đọc

**Impact:** 🟡 Medium  
**Effort:** 🟡 Medium (1-2 months)

**Giải pháp:** Normalize schema (xem section 4.2)

---

#### Issue 3: Thiếu Monitoring & Observability

**Mô tả:**
- Không có error tracking
- Không có logging infrastructure
- Không có performance monitoring
- Không có alerting system

**Impact:** 🔴 Critical  
**Effort:** 🟢 Low (2-3 weeks)

**Giải pháp:**

**Phase 1: Error Tracking (Week 1)**
```bash
pnpm add @sentry/nextjs @sentry/node
```

```typescript
// apps/web/sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

**Phase 2: Logging (Week 2)**
```bash
pnpm add pino pino-pretty
```

```typescript
// apps/api/src/common/logger/logger.service.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
});

// Usage
logger.info({ userId, action: 'create_roadmap' }, 'Roadmap created');
logger.error({ error, context }, 'Failed to fetch roadmap');
```

**Phase 3: Performance Monitoring (Week 3)**
- Add custom metrics
- Monitor API response times
- Track database query performance

---

### 8.2 🟡 Medium Priority Issues

#### Issue 4: N+1 Query Problem

**Mô tả:**
```typescript
// ❌ Potential N+1 problem
@ResolveField(() => [Topic])
async topics(@Parent() roadmap: Roadmap) {
  // This runs for EACH roadmap in a list
  return this.topicService.getTopicsByRoadmapId(roadmap.id);
}

// If fetching 20 roadmaps:
// 1 query for roadmaps + 20 queries for topics = 21 queries!
```

**Giải pháp:** Implement DataLoader

```typescript
import DataLoader from 'dataloader';

export class TopicDataLoader {
  private loader: DataLoader<string, Topic[]>;

  constructor(private topicService: TopicService) {
    this.loader = new DataLoader(async (roadmapIds: string[]) => {
      // Batch load topics for all roadmaps in one query
      const topics = await this.topicService.getTopicsByRoadmapIds(roadmapIds);
      
      // Group by roadmapId
      const topicsByRoadmap = new Map<string, Topic[]>();
      for (const topic of topics) {
        const existing = topicsByRoadmap.get(topic.roadmapId) || [];
        topicsByRoadmap.set(topic.roadmapId, [...existing, topic]);
      }
      
      // Return in same order as input
      return roadmapIds.map(id => topicsByRoadmap.get(id) || []);
    });
  }

  load(roadmapId: string): Promise<Topic[]> {
    return this.loader.load(roadmapId);
  }
}
```

---

#### Issue 5: Thiếu Rate Limiting

**Mô tả:**
- Không có rate limiting trên API
- Vulnerable to DDoS attacks
- Không có protection against abuse

**Giải pháp:**
```bash
pnpm add @nestjs/throttler
```

```typescript
// apps/api/src/app.module.ts
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,  // 60 seconds
      limit: 100,  // 100 requests per minute
    }]),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
```

---

#### Issue 6: Test Coverage Thấp

**Current State:** Unknown (chưa có coverage report)  
**Target:** 80%+ coverage

**Action Plan:**
1. **Unit Tests**: Application services, domain policies
2. **Integration Tests**: GraphQL resolvers với real database
3. **E2E Tests**: Complete user journeys

---

### 8.3 🟢 Low Priority (Nice to Have)

- Code documentation (JSDoc)
- Performance optimization (caching, code splitting)
- Accessibility (WCAG 2.1 AA compliance)
- Internationalization (i18n)

---

## 9. Điểm Mạnh của Codebase

### 9.1 Kiến Trúc Clean

✅ **Hexagonal Architecture**: Domain logic độc lập với infrastructure  
✅ **DDD**: Clear separation giữa entities, policies, services  
✅ **CQRS**: Commands và Queries tách biệt  
✅ **Repository Pattern**: Abstraction layer tốt

### 9.2 Type Safety

✅ **End-to-end TypeScript**: Frontend → Backend → Database  
✅ **Zod Validation**: Runtime validation  
✅ **GraphQL Code Generation**: Auto-generate types  
✅ **Strict Mode**: TypeScript strict mode enabled

### 9.3 Developer Experience

✅ **Monorepo**: Code sharing hiệu quả  
✅ **Turbo**: Fast builds với caching  
✅ **Hot Reload**: Fast feedback loop  
✅ **Git Hooks**: Lint + typecheck trước commit

---

## 10. Kết Luận & Roadmap

### 10.1 Tổng Kết

VizTechStack có một **kiến trúc tốt** với DDD và Hexagonal pattern, nhưng tồn tại các **vấn đề nghiêm trọng** về vendor lock-in, JSON storage, và thiếu monitoring. Cần có **action plan cụ thể** để giải quyết các vấn đề này.

### 10.2 Priority Matrix

| Issue | Impact | Effort | Priority | Timeline |
|-------|--------|--------|----------|----------|
| Convex Lock-in | 🔴 Critical | 🔴 High | P0 | 3-6 months |
| Monitoring | 🔴 Critical | 🟢 Low | P0 | 2-3 weeks |
| JSON Storage | 🟡 Medium | 🟡 Medium | P1 | 1-2 months |
| Test Coverage | 🟡 Medium | 🟡 Medium | P1 | Ongoing |
| N+1 Queries | 🟡 Medium | 🟢 Low | P1 | 1 week |
| Rate Limiting | 🟡 Medium | 🟢 Low | P1 | 1 day |

### 10.3 Roadmap (Next 6 Months)

**Month 1:**
- ✅ Add Sentry error tracking
- ✅ Implement logging infrastructure
- ✅ Add rate limiting
- ✅ Implement DataLoader

**Month 2:**
- 📊 Set up performance monitoring
- 🧪 Increase test coverage to 50%
- 📝 Document Convex dependencies
- 🔍 Evaluate PostgreSQL migration

**Month 3:**
- 🗄️ Design PostgreSQL schema
- 🔄 Implement PostgreSQL repository
- 🧪 Test coverage to 70%

**Month 4-6:**
- 🚀 Gradual migration to PostgreSQL
- 🧪 Test coverage to 80%
- 📚 Complete documentation

---

**Document Version:** 2.0.0  
**Last Updated:** 2026-03-08  
**Status:** Complete  
**Next Review:** 2026-04-08

