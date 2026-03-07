# Roadmap Feature - Implementation Guide

## Tổng Quan

Tài liệu này mô tả chi tiết flow implementation của tính năng Roadmap trong VizTechStack, từ UI (Frontend) đến Logic (Backend), theo kiến trúc Hexagonal Architecture và Domain-Driven Design.

## Kiến Trúc Tổng Thể

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js + React)                │
│  - Components (UI)                                           │
│  - Apollo Client (GraphQL)                                   │
│  - Clerk Authentication                                      │
└────────────────────┬────────────────────────────────────────┘
                     │ GraphQL over HTTP
┌────────────────────┴────────────────────────────────────────┐
│                Backend (NestJS + Apollo Server)              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Transport Layer (GraphQL Resolvers)                   │  │
│  └────────────────┬─────────────────────────────────────┘  │
│  ┌────────────────┴─────────────────────────────────────┐  │
│  │ Application Layer (Services, Commands, Queries)      │  │
│  └────────────────┬─────────────────────────────────────┘  │
│  ┌────────────────┴─────────────────────────────────────┐  │
│  │ Domain Layer (Entities, Policies, Errors)            │  │
│  └────────────────┬─────────────────────────────────────┘  │
│  ┌────────────────┴─────────────────────────────────────┐  │
│  │ Infrastructure Layer (Repositories, Adapters)        │  │
│  └────────────────┬─────────────────────────────────────┘  │
└────────────────────┴────────────────────────────────────────┘
                     │ Convex Client SDK
┌────────────────────┴────────────────────────────────────────┐
│                    Database (Convex)                         │
│  - roadmaps, roadmapSummaries                               │
│  - topics, progress, bookmarks                              │
└─────────────────────────────────────────────────────────────┘
```

## 1. Roadmap List Feature - Browse Roadmaps

### 1.1 Frontend Flow (UI → Backend)

**Component**: `RoadmapList.tsx`
**Location**: `apps/web/src/components/roadmap/RoadmapList.tsx`

**Step 1: User visits roadmap list page**
```typescript
// User navigates to /roadmaps
// Component renders and triggers GraphQL query
```

**Step 2: GraphQL Query Execution**

```typescript
// Frontend: RoadmapList component
const LIST_ROADMAPS = gql`
  query ListRoadmaps($filters: RoadmapFilters, $pagination: PaginationInput) {
    listRoadmaps(filters: $filters, pagination: $pagination) {
      items {
        id
        slug
        title
        description
        category
        difficulty
        topicCount
        status
      }
      nextCursor
      isDone
    }
  }
`;

const { data, loading } = useQuery(LIST_ROADMAPS, {
  variables: {
    filters: { category: selectedCategory },
    pagination: { limit: 24, cursor: null }
  }
});
```

### 1.2 Backend Flow (GraphQL → Database)

**Step 3: GraphQL Resolver receives request**
**Location**: `apps/api/src/modules/roadmap/transport/graphql/resolvers/roadmap.resolver.ts`

```typescript
@Query(() => RoadmapPageDto)
@Public()
async listRoadmaps(
  @Args('filters', { nullable: true }) filters?: RoadmapFiltersInput,
  @Args('pagination', { nullable: true }) pagination?: PaginationInput,
): Promise<RoadmapPageDto> {
  // Delegate to Application Service
  return this.roadmapApplicationService.listRoadmaps(filters, pagination);
}
```

**Step 4: Application Service orchestrates the query**
**Location**: `apps/api/src/modules/roadmap/application/services/roadmap-application.service.ts`

```typescript
async listRoadmaps(
  filters?: RoadmapFiltersInput,
  pagination?: PaginationInput,
): Promise<RoadmapPageEntity> {
  // Create query object
  const query = new ListRoadmapsQuery(filters, pagination);
  
  // Execute query via repository
  return this.roadmapRepository.list(
    query.filters,
    query.pagination
  );
}
```

**Step 5: Repository queries database**
**Location**: `apps/api/src/modules/roadmap/infrastructure/adapters/convex-roadmap.repository.ts`

```typescript
async list(
  filters: RoadmapFilters,
  pagination: PaginationInput
): Promise<RoadmapPageEntity> {
  // Query Convex database
  const result = await this.convex.query(
    api.roadmap.listRoadmaps,
    {
      category: filters?.category,
      limit: pagination.limit || 24,
      cursor: pagination.cursor
    }
  );
  
  // Map to domain entities
  return {
    items: result.items.map(item => this.mapToEntity(item)),
    nextCursor: result.nextCursor,
    isDone: result.isDone
  };
}
```

**Step 6: Convex Database Query**
**Location**: `convex/roadmap/queries.ts`

```typescript
export const listRoadmaps = query({
  args: {
    category: v.optional(v.string()),
    limit: v.number(),
    cursor: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("roadmapSummaries");
    
    // Apply category filter
    if (args.category) {
      query = query.filter(q => 
        q.eq(q.field("category"), args.category)
      );
    }
    
    // Apply pagination
    const items = await query
      .order("desc")
      .paginate({
        numItems: args.limit,
        cursor: args.cursor
      });
    
    return {
      items: items.page,
      nextCursor: items.continueCursor,
      isDone: items.isDone
    };
  }
});
```

### 1.3 Response Flow (Database → UI)

**Step 7: Data flows back through layers**
- Convex returns raw data
- Repository maps to Domain Entities
- Application Service returns entities
- GraphQL Resolver maps to DTOs
- Frontend receives typed data via Apollo Client
- React component renders UI


## 2. Roadmap Viewer Feature - Interactive Visualization

### 2.1 Frontend Flow

**Component**: `RoadmapViewer.tsx`
**Location**: `apps/web/src/components/roadmap/RoadmapViewer.tsx`

**Step 1: User clicks on a roadmap card**
```typescript
// User navigates to /roadmaps/[slug]
// Component queries roadmap by slug
const GET_ROADMAP_BY_SLUG = gql`
  query GetRoadmapBySlug($slug: String!) {
    getRoadmapBySlug(slug: $slug) {
      id
      slug
      title
      nodes { id, type, position, data }
      edges { id, source, target, type }
    }
  }
`;
```

**Step 2: React Flow renders graph**
```typescript
// Parse nodes and edges
const nodes = roadmap.nodes.map(node => ({
  ...node,
  data: {
    ...node.data,
    progressStatus: progressMap.get(node.id) // Enrich with progress
  }
}));

// Render with React Flow
<ReactFlow
  nodes={nodes}
  edges={edges}
  nodeTypes={nodeTypes}
  onNodeClick={handleNodeClick}
/>
```

### 2.2 Backend Flow

**GraphQL Resolver**:
```typescript
@Query(() => RoadmapDto)
@Public()
async getRoadmapBySlug(
  @Args('slug') slug: string
): Promise<RoadmapDto | null> {
  return this.roadmapApplicationService.getRoadmapBySlug(slug);
}
```


**Repository Layer**:
```typescript
async findBySlug(slug: string): Promise<RoadmapEntity | null> {
  const result = await this.convex.query(
    api.roadmap.getRoadmapBySlug,
    { slug }
  );
  
  if (!result) return null;
  
  // Parse JSON strings to objects
  return {
    ...result,
    nodes: JSON.parse(result.nodesJson),
    edges: JSON.parse(result.edgesJson)
  };
}
```

**Key Points**:
- Graph data stored as JSON strings in database
- Parsed to objects at repository layer
- React Flow consumes native JavaScript objects
- Real-time updates via Convex subscriptions

## 3. Progress Tracking Feature

### 3.1 Frontend Flow

**Component**: `ProgressTracker.tsx`
**Location**: `apps/web/src/components/roadmap/ProgressTracker.tsx`

**Step 1: Query user progress**
```typescript
const GET_PROGRESS_FOR_ROADMAP = gql`
  query GetProgressForRoadmap($roadmapId: ID!) {
    getProgressForRoadmap(roadmapId: $roadmapId) {
      id
      userId
      roadmapId
      nodeId
      status
    }
  }
`;
```

**Step 2: User clicks status button**
```typescript
const UPDATE_PROGRESS = gql`
  mutation UpdateProgress($input: UpdateProgressInput!) {
    updateProgress(input: $input) {
      id
      nodeId
      status
    }
  }
`;

// Optimistic update
await updateProgress({
  variables: { input: { roadmapId, nodeId, status } },
  optimisticResponse: { ... }
});
```


### 3.2 Backend Flow

**GraphQL Resolver**:
```typescript
@Mutation(() => ProgressDto)
async updateProgress(
  @Args('input') input: UpdateProgressInput,
  @CurrentUser() user: UserContext
): Promise<ProgressDto> {
  const command = new UpdateProgressCommand(
    user.id,
    input.roadmapId,
    input.nodeId,
    input.status
  );
  
  return this.progressApplicationService.updateProgress(command);
}
```

**Application Service**:
```typescript
async updateProgress(command: UpdateProgressCommand): Promise<ProgressEntity> {
  // Validate status
  this.progressPolicy.validateStatus(command.status);
  
  // Upsert progress (replace if exists)
  return this.progressRepository.upsert({
    userId: command.userId,
    roadmapId: command.roadmapId,
    nodeId: command.nodeId,
    status: command.status
  });
}
```

**Repository (Convex)**:
```typescript
async upsert(progress: ProgressEntity): Promise<ProgressEntity> {
  // Find existing progress
  const existing = await this.convex.query(
    api.progress.findByUserAndNode,
    { userId: progress.userId, nodeId: progress.nodeId }
  );
  
  if (existing) {
    // Update existing
    return this.convex.mutation(
      api.progress.update,
      { id: existing._id, status: progress.status }
    );
  } else {
    // Create new
    return this.convex.mutation(
      api.progress.create,
      progress
    );
  }
}
```


### 3.3 Integration with RoadmapViewer

**Step 1: Load progress data**
```typescript
// In RoadmapViewer component
const { data: progressData } = useQuery(GET_PROGRESS_FOR_ROADMAP, {
  variables: { roadmapId },
  skip: !isSignedIn
});

// Create progress map
const progressMap = useMemo(() => {
  const map = new Map();
  progressData?.getProgressForRoadmap.forEach(p => {
    map.set(p.nodeId, p.status);
  });
  return map;
}, [progressData]);
```

**Step 2: Enrich nodes with progress**
```typescript
const nodes = roadmap.nodes.map(node => ({
  ...node,
  data: {
    ...node.data,
    progressStatus: progressMap.get(node.id)
  }
}));
```

**Step 3: Visual feedback on nodes**
```typescript
// In RoadmapNode component
const borderColor = progressStatus
  ? progressStatusConfig[progressStatus].borderColor
  : 'border-white/10';

// Render colored border and badge
<div className={`${borderColor} ...`}>
  {progressStatus && (
    <div className={`${badgeColor} ...`}>
      {statusIcon}
    </div>
  )}
</div>
```

**Key Points**:
- Progress loaded separately from roadmap data
- Client-side join via Map for O(1) lookup
- Optimistic updates for instant UI feedback
- Apollo cache automatically updates all queries


## 4. Bookmark Management Feature

### 4.1 Frontend Flow

**Component**: `BookmarkButton.tsx`
**Location**: `apps/web/src/components/roadmap/BookmarkButton.tsx`

**Step 1: Add bookmark**
```typescript
const ADD_BOOKMARK = gql`
  mutation AddBookmark($roadmapId: ID!) {
    addBookmark(roadmapId: $roadmapId) {
      id
      userId
      roadmapId
    }
  }
`;

await addBookmark({
  variables: { roadmapId },
  optimisticResponse: {
    addBookmark: {
      __typename: 'Bookmark',
      id: `temp-${Date.now()}`,
      userId: user.id,
      roadmapId
    }
  },
  update(cache, { data }) {
    // Update cache to include new bookmark
    const existing = cache.readQuery({ query: GET_USER_BOOKMARKS });
    cache.writeQuery({
      query: GET_USER_BOOKMARKS,
      data: {
        getUserBookmarks: [...existing.getUserBookmarks, data.addBookmark]
      }
    });
  }
});
```

**Step 2: Remove bookmark**
```typescript
const REMOVE_BOOKMARK = gql`
  mutation RemoveBookmark($roadmapId: ID!) {
    removeBookmark(roadmapId: $roadmapId)
  }
`;

await removeBookmark({
  variables: { roadmapId },
  update(cache) {
    // Remove from cache
    const existing = cache.readQuery({ query: GET_USER_BOOKMARKS });
    cache.writeQuery({
      query: GET_USER_BOOKMARKS,
      data: {
        getUserBookmarks: existing.getUserBookmarks.filter(
          b => b.roadmapId !== roadmapId
        )
      }
    });
  }
});
```


### 4.2 Backend Flow

**GraphQL Resolvers**:
```typescript
@Mutation(() => BookmarkDto)
async addBookmark(
  @Args('roadmapId') roadmapId: string,
  @CurrentUser() user: UserContext
): Promise<BookmarkDto> {
  const command = new AddBookmarkCommand(user.id, roadmapId);
  return this.bookmarkApplicationService.addBookmark(command);
}

@Mutation(() => Boolean)
async removeBookmark(
  @Args('roadmapId') roadmapId: string,
  @CurrentUser() user: UserContext
): Promise<boolean> {
  const command = new RemoveBookmarkCommand(user.id, roadmapId);
  await this.bookmarkApplicationService.removeBookmark(command);
  return true;
}
```

**Application Service**:
```typescript
async addBookmark(command: AddBookmarkCommand): Promise<BookmarkEntity> {
  // Check if bookmark already exists
  const existing = await this.bookmarkRepository.findByUserAndRoadmap(
    command.userId,
    command.roadmapId
  );
  
  if (existing) {
    return existing; // Idempotent
  }
  
  // Create new bookmark
  return this.bookmarkRepository.create({
    userId: command.userId,
    roadmapId: command.roadmapId
  });
}
```

**Repository**:
```typescript
async create(bookmark: BookmarkEntity): Promise<BookmarkEntity> {
  const id = await this.convex.mutation(
    api.bookmarks.create,
    {
      userId: bookmark.userId,
      roadmapId: bookmark.roadmapId
    }
  );
  
  return { ...bookmark, id };
}
```


### 4.3 Bookmarked Roadmaps List

**Component**: `BookmarkedRoadmapsList.tsx`

**Challenge**: N+1 Query Problem
- `getUserBookmarks` returns only bookmark records (userId, roadmapId)
- Need roadmap summaries for display

**Solution**: Fetch all roadmaps and filter client-side
```typescript
// Query 1: Get user bookmarks
const { data: bookmarksData } = useQuery(GET_USER_BOOKMARKS);

// Query 2: Get all roadmaps (cached)
const { data: roadmapsData } = useQuery(LIST_ROADMAPS, {
  variables: { pagination: { limit: 100 } }
});

// Client-side join
const bookmarkedRoadmapIds = new Set(
  bookmarksData.getUserBookmarks.map(b => b.roadmapId)
);
const bookmarkedRoadmaps = roadmapsData.listRoadmaps.items.filter(
  roadmap => bookmarkedRoadmapIds.has(roadmap.id)
);
```

**Future Optimization**: Modify backend to return roadmap summaries directly
```graphql
type Bookmark {
  id: ID!
  userId: ID!
  roadmapId: ID!
  roadmap: Roadmap!  # Add this field
}
```

## 5. Authentication & Authorization

### 5.1 Frontend Authentication (Clerk)

**Setup**: `app/layout.tsx`
```typescript
import { ClerkProvider } from '@clerk/nextjs';

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```


**Get Auth Token**:
```typescript
import { useAuth } from '@clerk/nextjs';

const { getToken, isSignedIn } = useAuth();

// Pass token to GraphQL requests
const token = await getToken();
await createRoadmapClient(input, token);
```

**Conditional Rendering**:
```typescript
import { useUser } from '@clerk/nextjs';

const { isSignedIn, user } = useUser();

if (!isSignedIn) {
  return <SignInPrompt />;
}

return <ProgressTracker />;
```

### 5.2 Backend Authentication (NestJS + Clerk)

**Auth Guard**: `ClerkAuthGuard`
```typescript
@Injectable()
export class ClerkAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);
    
    if (!token) {
      throw new UnauthorizedException('Missing token');
    }
    
    // Verify JWT with Clerk
    const session = await clerkClient.verifyToken(token);
    
    // Attach user to request
    request.user = {
      id: session.sub,
      role: session.publicMetadata?.role || 'user'
    };
    
    return true;
  }
}
```

**Public Decorator**:
```typescript
export const Public = () => SetMetadata('isPublic', true);

// Usage
@Query(() => RoadmapDto)
@Public()
async getRoadmapBySlug(@Args('slug') slug: string) {
  // No authentication required
}
```


**Role-Based Authorization**:
```typescript
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) return true;
    
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    return requiredRoles.includes(user.role);
  }
}

// Usage
@Mutation(() => RoadmapDto)
@Roles('admin')
async createRoadmap(@Args('input') input: CreateRoadmapInput) {
  // Only admins can access
}
```

## 6. Data Flow Summary

### 6.1 Read Operations (Queries)

```
User Action (UI)
    ↓
Apollo Client Query
    ↓
GraphQL Resolver (@Public or @Roles)
    ↓
Application Service
    ↓
Repository Interface (Port)
    ↓
Convex Repository (Adapter)
    ↓
Convex Database Query
    ↓
Raw Data
    ↓
Map to Domain Entity
    ↓
Map to GraphQL DTO
    ↓
Apollo Client Cache
    ↓
React Component Renders
```

### 6.2 Write Operations (Mutations)

```
User Action (Button Click)
    ↓
Apollo Client Mutation (with optimistic response)
    ↓
UI Updates Immediately (optimistic)
    ↓
GraphQL Resolver (with @Roles guard)
    ↓
Application Service
    ↓
Domain Policy Validation
    ↓
Repository Interface (Port)
    ↓
Convex Repository (Adapter)
    ↓
Convex Database Mutation
    ↓
Success Response
    ↓
Apollo Cache Update
    ↓
UI Re-renders with Real Data
```


## 7. Key Implementation Patterns

### 7.1 Hexagonal Architecture Benefits

**Separation of Concerns**:
- Domain logic independent of infrastructure
- Easy to swap Convex for PostgreSQL
- Business rules in one place (Domain Layer)

**Testability**:
- Mock repositories for unit tests
- Test domain logic without database
- Integration tests at resolver level

**Maintainability**:
- Clear boundaries between layers
- Changes isolated to specific layers
- Easy to understand data flow

### 7.2 GraphQL Code Generation

**Schema-First Approach**:
```bash
# 1. Define schema
packages/shared/graphql-schema/src/roadmap.graphql

# 2. Generate types
pnpm codegen

# 3. Use generated types
packages/shared/graphql-generated/src/types.ts
```

**Benefits**:
- Type safety across frontend and backend
- Zod schemas for runtime validation
- Single source of truth for API contract

### 7.3 Apollo Client Patterns

**Optimistic Updates**:
```typescript
await mutation({
  variables: { ... },
  optimisticResponse: {
    // Fake response for instant UI
  },
  update(cache, { data }) {
    // Update cache manually
  }
});
```

**Cache Management**:
```typescript
// Read from cache
const data = cache.readQuery({ query: GET_PROGRESS });

// Write to cache
cache.writeQuery({
  query: GET_PROGRESS,
  data: { getProgress: [...existing, newItem] }
});
```


### 7.4 Convex Real-time Patterns

**Reactive Queries**:
```typescript
// Convex automatically re-runs query when data changes
const roadmaps = useQuery(api.roadmap.listRoadmaps, { category: "role" });

// Component re-renders automatically
```

**Subscriptions**:
```typescript
// Subscribe to roadmap changes
const roadmap = useQuery(api.roadmap.getRoadmapBySlug, { slug });

// When another user edits, this component updates automatically
```

## 8. Complete Feature Implementations

### 8.1 Implemented Components

**Frontend Components** (apps/web/src/components/roadmap/):
- ✅ `RoadmapList.tsx` - Browse roadmaps with filters
- ✅ `RoadmapCard.tsx` - Display roadmap summary
- ✅ `RoadmapViewer.tsx` - Interactive graph visualization
- ✅ `RoadmapNode.tsx` - Custom node with progress indicator
- ✅ `RoadmapControls.tsx` - Zoom/pan controls
- ✅ `TopicPanel.tsx` - Display topic content
- ✅ `ResourceList.tsx` - Learning resources
- ✅ `MarkdownRenderer.tsx` - Render markdown content
- ✅ `ProgressTracker.tsx` - Track learning progress
- ✅ `BookmarkButton.tsx` - Bookmark management
- ✅ `BookmarkedRoadmapsList.tsx` - View bookmarked roadmaps
- ✅ `CategoryFilter.tsx` - Filter by category

**Backend Modules** (apps/api/src/modules/roadmap/):
- ✅ Domain Layer: Entities, Policies, Errors
- ✅ Application Layer: Services, Commands, Queries
- ✅ Infrastructure Layer: Convex Repositories
- ✅ Transport Layer: GraphQL Resolvers, Mappers, Filters

**Database Schema** (convex/):
- ✅ roadmaps table
- ✅ roadmapSummaries table (denormalized)
- ✅ topics table
- ✅ progress table
- ✅ bookmarks table


### 8.2 Feature Matrix

| Feature | Frontend | Backend | Database | Status |
|---------|----------|---------|----------|--------|
| List Roadmaps | RoadmapList | RoadmapResolver | roadmapSummaries | ✅ |
| View Roadmap | RoadmapViewer | RoadmapResolver | roadmaps | ✅ |
| Filter by Category | CategoryFilter | RoadmapResolver | roadmapSummaries | ✅ |
| View Topic | TopicPanel | TopicResolver | topics | ✅ |
| Track Progress | ProgressTracker | ProgressResolver | progress | ✅ |
| Bookmark Roadmap | BookmarkButton | BookmarkResolver | bookmarks | ✅ |
| View Bookmarks | BookmarkedRoadmapsList | BookmarkResolver | bookmarks | ✅ |
| Create Roadmap | CreateRoadmapForm | RoadmapResolver | roadmaps | ✅ |
| Authentication | Clerk | ClerkAuthGuard | - | ✅ |
| Authorization | Role checks | RolesGuard | - | ✅ |

## 9. Bug Fixes & Improvements

### 9.1 Fixed Issues

**Issue #1: Create Roadmap Mutation Error**
- **Problem**: Mutation returned string instead of Roadmap object
- **Location**: `apps/web/src/lib/api-client/roadmaps.ts`
- **Solution**: Updated mutation to request full Roadmap fields
```typescript
// Before
mutation CreateRoadmap($input: CreateRoadmapInput!) {
  createRoadmap(input: $input)  // Returns string
}

// After
mutation CreateRoadmap($input: CreateRoadmapInput!) {
  createRoadmap(input: $input) {
    id
    slug
    title
    // ... all fields
  }
}
```

### 9.2 Performance Optimizations

**Optimization #1: Denormalized Roadmap Summaries**
- Avoid parsing large JSON in list queries
- Use `roadmapSummaries` table for list operations
- Only parse JSON when viewing full roadmap

**Optimization #2: Client-side Progress Join**
- Load progress separately from roadmap
- Use Map for O(1) lookup
- Avoid N+1 query problem

**Optimization #3: Apollo Cache Management**
- Optimistic updates for instant feedback
- Manual cache updates after mutations
- Avoid unnecessary refetches


## 10. Testing Strategy

### 10.1 Unit Tests (Optional - Marked with *)

**Backend Tests**:
- Domain Policy validation
- Repository operations
- Service orchestration
- Mapper transformations

**Frontend Tests**:
- Component rendering
- User interactions
- GraphQL query mocking
- Cache updates

### 10.2 Property-Based Tests (Optional)

**Correctness Properties**:
- Round-trip serialization (JSON ↔ Objects)
- Progress tracking idempotence
- Bookmark uniqueness
- Authorization rules
- Data consistency

### 10.3 Integration Tests

**End-to-End Flows**:
- User browses and views roadmaps
- User tracks progress on nodes
- User bookmarks roadmaps
- Admin creates and edits roadmaps

## 11. Deployment Checklist

### 11.1 Environment Setup

```bash
# Required Environment Variables
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
CONVEX_DEPLOYMENT=...
NEXT_PUBLIC_CONVEX_URL=https://...
```

### 11.2 Build & Deploy

```bash
# 1. Generate GraphQL types
pnpm codegen

# 2. Type check
pnpm typecheck

# 3. Lint
pnpm lint

# 4. Build
pnpm build

# 5. Deploy to Vercel
git push origin main  # Auto-deploys
```

### 11.3 Database Migration

```bash
# Deploy Convex schema
npx convex deploy

# Verify tables created
npx convex dashboard
```


## 12. Common Patterns & Best Practices

### 12.1 Error Handling

**Frontend**:
```typescript
const { data, loading, error } = useQuery(QUERY);

if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage message={error.message} />;
if (!data) return <EmptyState />;

return <Content data={data} />;
```

**Backend**:
```typescript
try {
  return await this.service.execute(command);
} catch (error) {
  if (error instanceof RoadmapNotFoundDomainError) {
    throw new NotFoundException(error.message);
  }
  throw error;
}
```

### 12.2 Type Safety

**GraphQL Code Generation**:
```typescript
// Generated types are used everywhere
import { RoadmapCategory, ProgressStatus } from '@viztechstack/graphql-generated';

// Type-safe queries
const { data } = useQuery<GetRoadmapBySlugQuery>(GET_ROADMAP_BY_SLUG);

// Type-safe mutations
const [updateProgress] = useMutation<UpdateProgressMutation>(UPDATE_PROGRESS);
```

**Zod Validation**:
```typescript
// Runtime validation
const input = CreateRoadmapInputSchema.parse(formData);

// Automatic error messages
if (!input.success) {
  console.error(input.error.issues);
}
```

### 12.3 Code Organization

**Feature-based Structure**:
```
roadmap/
├── domain/           # Business logic
├── application/      # Use cases
├── infrastructure/   # External dependencies
└── transport/        # API layer
```

**Separation of Concerns**:
- UI components don't know about database
- Domain logic doesn't know about GraphQL
- Infrastructure can be swapped easily

## 13. Future Enhancements

### 13.1 Planned Features

- [ ] Drag-and-drop node reuse (Task 14)
- [ ] Real-time collaborative editing
- [ ] Roadmap templates
- [ ] Export to PDF/PNG
- [ ] Social sharing
- [ ] Comments and discussions

### 13.2 Performance Improvements

- [ ] Implement DataLoader for batch queries
- [ ] Add Redis caching layer
- [ ] Optimize large graph rendering
- [ ] Lazy load topic content
- [ ] Image optimization for node icons

### 13.3 Backend Optimizations

- [ ] Add roadmap summaries to bookmark query
- [ ] Implement GraphQL subscriptions
- [ ] Add full-text search
- [ ] Implement rate limiting
- [ ] Add request tracing


## 14. Troubleshooting Guide

### 14.1 Common Issues

**Issue: GraphQL query returns null**
- Check authentication token
- Verify user has permission
- Check database has data
- Inspect network tab for errors

**Issue: Optimistic update doesn't work**
- Verify cache update function
- Check optimisticResponse structure
- Ensure query is in cache
- Use Apollo DevTools to inspect cache

**Issue: Component doesn't re-render**
- Check if query is using cache-and-network
- Verify dependencies in useMemo/useCallback
- Check if data structure changed
- Use React DevTools to inspect props

**Issue: Authentication fails**
- Verify Clerk keys in .env
- Check token expiration
- Ensure ClerkProvider wraps app
- Verify backend JWT validation

### 14.2 Debugging Tools

**Frontend**:
- React DevTools - Component inspection
- Apollo DevTools - GraphQL cache inspection
- Network Tab - API requests
- Console - Error messages

**Backend**:
- NestJS Logger - Request logging
- GraphQL Playground - Query testing
- Convex Dashboard - Database inspection
- Postman - API testing

## 15. Summary

### 15.1 What We Built

A complete roadmap feature with:
- ✅ Interactive graph visualization (React Flow)
- ✅ Progress tracking system
- ✅ Bookmark management
- ✅ Authentication & authorization
- ✅ Hexagonal architecture backend
- ✅ Type-safe GraphQL API
- ✅ Real-time database (Convex)

### 15.2 Key Technologies

**Frontend Stack**:
- Next.js 16 (App Router)
- React 19 (Server & Client Components)
- Apollo Client 3.8 (GraphQL)
- React Flow (Graph visualization)
- Clerk (Authentication)
- Tailwind CSS 4 (Styling)

**Backend Stack**:
- NestJS 11 (Framework)
- Apollo Server 5 (GraphQL)
- Convex (Database)
- TypeScript 5.7 (Language)
- Zod (Validation)

**Development Tools**:
- pnpm (Package manager)
- Turbo (Build system)
- GraphQL Codegen (Type generation)
- ESLint + Prettier (Code quality)

### 15.3 Architecture Highlights

1. **Hexagonal Architecture** - Clean separation of concerns
2. **Domain-Driven Design** - Business logic in domain layer
3. **GraphQL Code Generation** - Type safety across stack
4. **Optimistic Updates** - Instant UI feedback
5. **Real-time Sync** - Convex reactive queries
6. **Role-based Access** - Secure authorization

### 15.4 Lessons Learned

**What Worked Well**:
- Hexagonal architecture made testing easier
- GraphQL codegen eliminated type mismatches
- Optimistic updates improved UX significantly
- Convex simplified real-time features

**Challenges Faced**:
- N+1 query problem with bookmarks
- Large JSON parsing in list queries
- Mutation response type mismatch
- Cache management complexity

**Solutions Applied**:
- Denormalized roadmap summaries
- Client-side data joining
- Fixed GraphQL mutation schema
- Manual cache update functions

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-07  
**Author**: VizTechStack Development Team
