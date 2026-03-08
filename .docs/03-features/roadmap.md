# Roadmap Feature Architecture

## Overview

The Roadmap feature is the core functionality of VizTechStack, providing an interactive graph-based learning path visualization system. This document describes the complete architecture of the implemented roadmap feature, including backend services, database schema, frontend components, and data flow patterns.

**Last Updated:** 2026-03-07  
**Status:** Implemented  
**Related Spec:** `.kiro/specs/roadmap/`

## System Architecture

### High-Level Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js 16)                     │
├─────────────────────────────────────────────────────────────┤
│  Pages:                                                      │
│    • /roadmaps - RoadmapList (browse/filter)               │
│    • /roadmaps/[slug] - RoadmapViewer (visualization)      │
│    • /admin/roadmaps - RoadmapEditor (CRUD)                │
│    • /my/bookmarks - BookmarkedRoadmapsList                │
│                                                              │
│  Components:                                                 │
│    • RoadmapCard - Display roadmap summary                  │
│    • RoadmapViewer - React Flow visualization              │
│    • RoadmapEditor - Drag-and-drop editor                  │
│    • NodeSidebar - Skill node library                      │
│    • TopicPanel - Content display                          │
│    • ProgressTracker - Status updates                      │
│    • BookmarkButton - Bookmark management                  │
└────────────────────┬────────────────────────────────────────┘
                     │ GraphQL (Apollo Client)
┌────────────────────┴────────────────────────────────────────┐
│                Backend (NestJS 11 + Apollo Server)           │
├─────────────────────────────────────────────────────────────┤
│  Transport Layer (GraphQL):                                  │
│    • RoadmapResolver - Roadmap queries/mutations            │
│    • TopicResolver - Topic queries/mutations                │
│    • ProgressResolver - Progress tracking                   │
│    • BookmarkResolver - Bookmark management                 │
│    • ClerkAuthGuard - JWT validation                        │
│    • RolesGuard - Admin authorization                       │
│                                                              │
│  Application Layer:                                          │
│    • RoadmapApplicationService                              │
│    • TopicApplicationService                                │
│    • ProgressApplicationService                             │
│    • BookmarkApplicationService                             │
│                                                              │
│  Domain Layer:                                               │
│    • Entities: Roadmap, Topic, Progress, Bookmark, Node     │
│    • Policies: RoadmapInputPolicy (validation)              │
│    • Errors: Domain-specific exceptions                     │
│                                                              │
│  Infrastructure Layer:                                       │
│    • ConvexRoadmapRepository                                │
│    • ConvexTopicRepository                                  │
│    • ConvexProgressRepository                               │
│    • ConvexBookmarkRepository                               │
└────────────────────┬────────────────────────────────────────┘
                     │ Convex Client
┌────────────────────┴────────────────────────────────────────┐
│                    Database (Convex)                         │
├─────────────────────────────────────────────────────────────┤
│  Tables:                                                     │
│    • roadmaps - Full roadmap data with graph JSON           │
│    • roadmapSummaries - Denormalized for list queries      │
│    • topics - Node content (markdown + resources)          │
│    • progress - User completion tracking                    │
│    • bookmarks - User favorites                             │
│    • users - Authentication/authorization                   │
│                                                              │
│  Indexes:                                                    │
│    • by_slug, by_category, by_status                       │
│    • by_category_status (composite)                        │
│    • by_user_roadmap (progress, bookmarks)                 │
└─────────────────────────────────────────────────────────────┘
```

## Backend Architecture (Hexagonal/DDD)

### Module Structure

```
apps/api/src/modules/roadmap/
├── application/                    # Application Layer
│   ├── commands/                  # Write operations (CQRS)
│   │   ├── create-roadmap.command.ts
│   │   ├── update-roadmap.command.ts
│   │   ├── delete-roadmap.command.ts
│   │   ├── create-topic.command.ts
│   │   ├── update-progress.command.ts
│   │   ├── add-bookmark.command.ts
│   │   └── remove-bookmark.command.ts
│   ├── queries/                   # Read operations (CQRS)
│   │   ├── list-roadmaps.query.ts
│   │   ├── get-roadmap-by-slug.query.ts
│   │   ├── get-topic-by-node-id.query.ts
│   │   ├── get-progress.query.ts
│   │   ├── get-skill-nodes.query.ts
│   │   └── get-user-bookmarks.query.ts
│   ├── services/                  # Use case orchestration
│   │   ├── roadmap-application.service.ts
│   │   ├── topic-application.service.ts
│   │   ├── progress-application.service.ts
│   │   └── bookmark-application.service.ts
│   └── ports/                     # Repository interfaces
│       ├── roadmap.repository.ts
│       ├── topic.repository.ts
│       ├── progress.repository.ts
│       └── bookmark.repository.ts
├── domain/                        # Domain Layer
│   ├── entities/                  # Domain models
│   │   ├── roadmap.entity.ts
│   │   ├── roadmap-summary.entity.ts
│   │   ├── node.entity.ts
│   │   ├── edge.entity.ts
│   │   ├── topic.entity.ts
│   │   ├── progress.entity.ts
│   │   └── bookmark.entity.ts
│   ├── errors/                    # Domain exceptions
│   │   └── roadmap-domain-error.ts
│   └── policies/                  # Business rules
│       └── roadmap-input.policy.ts
├── infrastructure/                # Infrastructure Layer
│   └── adapters/                  # Concrete implementations
│       ├── convex-roadmap.repository.ts
│       ├── convex-topic.repository.ts
│       ├── convex-progress.repository.ts
│       └── convex-bookmark.repository.ts
└── transport/                     # Transport Layer
    └── graphql/                   # GraphQL API
        ├── resolvers/
        │   ├── roadmap.resolver.ts
        │   ├── topic.resolver.ts
        │   ├── progress.resolver.ts
        │   └── bookmark.resolver.ts
        ├── schemas/
        │   ├── roadmap.schema.ts
        │   ├── topic.schema.ts
        │   ├── progress.schema.ts
        │   └── bookmark.schema.ts
        ├── mappers/
        │   ├── roadmap.mapper.ts
        │   ├── topic.mapper.ts
        │   ├── progress.mapper.ts
        │   └── bookmark.mapper.ts
        └── filters/
            └── roadmap-domain-exception.filter.ts
```

### Key Design Patterns

1. **Hexagonal Architecture (Ports & Adapters)**
   - Ports: Repository interfaces in `application/ports/`
   - Adapters: Convex implementations in `infrastructure/adapters/`
   - Benefit: Easy to swap database (Convex → PostgreSQL)

2. **CQRS (Command Query Responsibility Segregation)**
   - Commands: Write operations in `application/commands/`
   - Queries: Read operations in `application/queries/`
   - Benefit: Separate optimization strategies for reads/writes

3. **Domain-Driven Design**
   - Domain entities with business logic
   - Domain policies for validation
   - Domain errors for specific failures

4. **Dependency Injection**
   - NestJS DI container
   - Symbol tokens for repository interfaces
   - Easy mocking for tests

## Data Models

### Database Schema (Convex)

#### Roadmaps Table
```typescript
{
  _id: Id<"roadmaps">,
  slug: string,                    // Unique identifier (URL-friendly)
  title: string,
  description: string,
  category: "role" | "skill" | "best-practice",
  difficulty: "beginner" | "intermediate" | "advanced",
  nodesJson: string,               // Serialized Node[] for React Flow
  edgesJson: string,               // Serialized Edge[] for React Flow
  topicCount: number,
  status: "public" | "draft" | "private",
  userId?: string,                 // Creator (admin)
  createdAt: number,
}
```

**Indexes:**
- `by_slug`: Fast lookup by slug
- `by_category`: Filter by category
- `by_status`: Filter by status
- `by_category_status`: Composite index for combined filters

#### Roadmap Summaries Table (Denormalized)
```typescript
{
  _id: Id<"roadmapSummaries">,
  roadmapId: Id<"roadmaps">,      // Reference to full roadmap
  slug: string,
  title: string,
  description: string,
  category: "role" | "skill" | "best-practice",
  difficulty: "beginner" | "intermediate" | "advanced",
  topicCount: number,
  status: "public" | "draft" | "private",
  createdAt: number,
}
```

**Purpose:** Optimize list queries by avoiding JSON parsing

#### Topics Table
```typescript
{
  _id: Id<"topics">,
  roadmapId: Id<"roadmaps">,
  nodeId: string,                  // Reference to node in nodesJson
  title: string,
  content: string,                 // Markdown content
  resources: Array<{
    title: string,
    url: string,
    type: "article" | "video" | "course"
  }>,
}
```

**Index:** `by_roadmap_node`: Fast lookup by roadmapId + nodeId

#### Progress Table
```typescript
{
  _id: Id<"progress">,
  userId: string,
  roadmapId: Id<"roadmaps">,
  nodeId: string,
  status: "done" | "in-progress" | "skipped",
  updatedAt: number,
}
```

**Index:** `by_user_roadmap`: Fast lookup by userId + roadmapId

#### Bookmarks Table
```typescript
{
  _id: Id<"bookmarks">,
  userId: string,
  roadmapId: Id<"roadmaps">,
  createdAt: number,
}
```

**Index:** `by_user`: Fast lookup by userId

### Graph Data Serialization

Roadmap graph data is stored as JSON strings and parsed at runtime:

**Node Structure (stored in nodesJson):**
```json
{
  "id": "node-1",
  "type": "default",
  "position": { "x": 100, "y": 100 },
  "data": {
    "label": "React Basics",
    "topicId": "topic-123",
    "isReusedSkillNode": false,
    "originalRoadmapId": null
  }
}
```

**Edge Structure (stored in edgesJson):**
```json
{
  "id": "edge-1",
  "source": "node-1",
  "target": "node-2",
  "type": "smoothstep"
}
```

**Node Reuse (Requirement 11):**
When a skill node is reused in a role roadmap:
```json
{
  "id": "node-2",
  "type": "default",
  "position": { "x": 300, "y": 100 },
  "data": {
    "label": "React Hooks",
    "topicId": "topic-456",
    "isReusedSkillNode": true,
    "originalRoadmapId": "roadmap-react-skill"
  }
}
```

## Frontend Architecture

### Component Hierarchy

```
RoadmapList Page (/roadmaps)
├── CategoryFilter
└── RoadmapCard (multiple)
    └── BookmarkButton

RoadmapViewer Page (/roadmaps/[slug])
├── RoadmapViewer
│   ├── ReactFlow
│   │   └── RoadmapNode (custom node)
│   └── RoadmapControls
├── TopicPanel (modal/sidebar)
│   ├── MarkdownRenderer
│   └── ResourceList
└── ProgressTracker
    └── Status buttons (done/in-progress/skipped)

RoadmapEditor Page (/admin/roadmaps/[slug]/edit)
├── NodeSidebar
│   └── Skill nodes (draggable)
├── RoadmapEditor
│   ├── ReactFlow (editable)
│   └── Save/Cancel buttons
└── CreateTopicForm

BookmarkedRoadmapsList Page (/my/bookmarks)
└── RoadmapCard (multiple)
```

### Key Frontend Components

#### RoadmapList
- **Purpose:** Browse and filter roadmaps
- **Features:**
  - Category filtering (role/skill/best-practice)
  - Pagination (24 items per page)
  - Responsive grid layout
- **Data:** Uses `listRoadmaps` GraphQL query

#### RoadmapViewer
- **Purpose:** Interactive roadmap visualization
- **Features:**
  - React Flow graph rendering
  - Node selection for topic viewing
  - Progress status indicators
  - Zoom/pan/fit controls
- **Data:** Uses `getRoadmapBySlug` + `getProgressForRoadmap` queries

#### RoadmapEditor (Admin only)
- **Purpose:** Create and edit roadmaps
- **Features:**
  - Drag-and-drop node positioning
  - Edge creation/deletion
  - Real-time sync with Convex
  - Skill node reuse from sidebar
- **Data:** Uses `createRoadmap`, `updateRoadmap` mutations

#### NodeSidebar (Admin only)
- **Purpose:** Library of reusable skill nodes
- **Features:**
  - Display skill nodes from skill roadmaps
  - Drag source for node reuse
  - Search/filter nodes
- **Data:** Uses `getSkillNodesForRoleRoadmap` query

#### TopicPanel
- **Purpose:** Display topic content
- **Features:**
  - Markdown rendering
  - Resource links (article/video/course)
  - Responsive modal/sidebar
- **Data:** Uses `getTopicByNodeId` query

#### ProgressTracker
- **Purpose:** Track learning progress
- **Features:**
  - Status buttons (done/in-progress/skipped)
  - Visual feedback on nodes
  - Optimistic updates
- **Data:** Uses `updateProgress` mutation

## Data Flow Patterns

### Read Flow: List Roadmaps

```
1. User visits /roadmaps
   ↓
2. RoadmapList component mounts
   ↓
3. Apollo Client executes listRoadmaps query
   ↓
4. GraphQL request → NestJS API
   ↓
5. RoadmapResolver.getRoadmaps()
   ↓
6. RoadmapApplicationService.listRoadmaps()
   ↓
7. ConvexRoadmapRepository.listRoadmaps()
   ↓
8. Convex query: roadmapSummaries table
   ↓
9. Filter by category, status, pagination
   ↓
10. Return RoadmapPageEntity
   ↓
11. Map to GraphQL types
   ↓
12. Apollo Client caches response
   ↓
13. RoadmapList renders RoadmapCard components
```

### Write Flow: Create Roadmap

```
1. Admin submits CreateRoadmapForm
   ↓
2. Apollo Client executes createRoadmap mutation
   ↓
3. GraphQL request → NestJS API
   ↓
4. ClerkAuthGuard validates JWT token
   ↓
5. RolesGuard checks admin role
   ↓
6. RoadmapResolver.createRoadmap()
   ↓
7. Map GraphQL input to CreateRoadmapCommand
   ↓
8. RoadmapApplicationService.createRoadmap()
   ↓
9. RoadmapInputPolicy.validateCreateRoadmapCommand()
   ↓
10. ConvexRoadmapRepository.createRoadmap()
   ↓
11. Convex mutation: insert into roadmaps table
   ↓
12. Convex mutation: insert into roadmapSummaries table
   ↓
13. Return roadmap ID
   ↓
14. Apollo Client updates cache
   ↓
15. Redirect to /admin/roadmaps/[slug]/edit
```

### Real-time Flow: Concurrent Editing

```
1. Admin A opens roadmap editor
   ↓
2. Frontend subscribes to Convex real-time query
   ↓
3. Admin B updates same roadmap
   ↓
4. Convex broadcasts change to all subscribers
   ↓
5. Admin A receives update notification
   ↓
6. Frontend shows "Concurrent edit detected" message
   ↓
7. Admin A can refresh to see latest changes
```

## Authentication & Authorization

### Authentication Flow (Clerk)

```
1. User clicks "Sign In"
   ↓
2. Clerk authentication modal
   ↓
3. User authenticates (email/OAuth)
   ↓
4. Clerk issues JWT token
   ↓
5. Token stored in cookies/localStorage
   ↓
6. All API requests include Authorization header
   ↓
7. ClerkAuthGuard validates token
   ↓
8. User identity extracted from token
   ↓
9. Request proceeds with user context
```

### Authorization Rules

| Operation | Public | User | Admin |
|-----------|--------|------|-------|
| List public roadmaps | ✅ | ✅ | ✅ |
| View public roadmap | ✅ | ✅ | ✅ |
| View draft/private roadmap | ❌ | ❌ | ✅ |
| Track progress | ❌ | ✅ | ✅ |
| Bookmark roadmap | ❌ | ✅ | ✅ |
| Create roadmap | ❌ | ❌ | ✅ |
| Update roadmap | ❌ | ❌ | ✅ |
| Delete roadmap | ❌ | ❌ | ✅ |
| Create topic | ❌ | ❌ | ✅ |

### Implementation

**Public Endpoints:**
```typescript
@Query(() => [Roadmap])
@Public()  // Decorator to skip authentication
async getRoadmaps() { ... }
```

**Admin-only Endpoints:**
```typescript
@Mutation(() => String)
@Roles('admin')  // Decorator to require admin role
async createRoadmap() { ... }
```

## Error Handling

### Domain Errors

```typescript
// Base error
export abstract class RoadmapDomainError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<string, unknown>,
  ) {
    super(message);
  }
}

// Specific errors
export class RoadmapValidationDomainError extends RoadmapDomainError {
  // HTTP 400 Bad Request
}

export class RoadmapNotFoundDomainError extends RoadmapDomainError {
  // HTTP 404 Not Found
}

export class RoadmapAuthorizationDomainError extends RoadmapDomainError {
  // HTTP 403 Forbidden
}

export class RoadmapDuplicateDomainError extends RoadmapDomainError {
  // HTTP 409 Conflict
}
```

### GraphQL Error Format

```json
{
  "errors": [
    {
      "message": "Roadmap with slug 'frontend-developer' already exists",
      "extensions": {
        "code": "ROADMAP_DUPLICATE",
        "statusCode": 409,
        "field": "slug"
      }
    }
  ]
}
```

### Error Handling Strategy

1. **Input Validation:** Validate at domain policy layer
2. **Graceful Degradation:** Return null for missing resources
3. **Descriptive Messages:** Include specific details
4. **Error Propagation:** Domain errors → GraphQL filters → HTTP status
5. **Logging:** All errors logged with context

## Performance Optimizations

### 1. Denormalization (Roadmap Summaries)

**Problem:** Listing roadmaps requires parsing large JSON payloads  
**Solution:** Maintain separate `roadmapSummaries` table  
**Benefit:** 10x faster list queries

### 2. Cursor-based Pagination

**Problem:** Offset pagination slow for large datasets  
**Solution:** Convex cursor-based pagination  
**Benefit:** Consistent performance regardless of page number

### 3. GraphQL Field Selection

**Problem:** Over-fetching data  
**Solution:** GraphQL allows clients to request only needed fields  
**Benefit:** Reduced payload size

### 4. Apollo Client Caching

**Problem:** Redundant API calls  
**Solution:** Apollo Client normalized cache  
**Benefit:** Instant UI updates, reduced server load

### 5. React Flow Optimization

**Problem:** Large graphs cause performance issues  
**Solution:** React Flow virtualization  
**Benefit:** Smooth rendering for 100+ nodes

## Testing Strategy

### Unit Tests

**Backend:**
- Domain policies (validation logic)
- Application services (use case orchestration)
- Repository adapters (data transformation)
- GraphQL mappers (DTO ↔ Domain)

**Frontend:**
- Component rendering
- User interactions
- State management
- API mocking

### Integration Tests

**Backend:**
- GraphQL resolvers with real database
- Authentication/authorization flows
- Error handling

**Frontend:**
- Component integration
- API integration
- User flows

### E2E Tests

- Complete user journeys
- Admin workflows
- Cross-browser testing

### Property-Based Tests

- Graph serialization round-trip
- Pagination consistency
- Progress tracking idempotence
- Bookmark uniqueness

## Deployment Architecture

```
┌─────────────────────────────────────────────────────┐
│                Vercel Edge Network                   │
│  ┌──────────────────┐      ┌──────────────────┐   │
│  │  Next.js Web App │      │  NestJS API      │   │
│  │  (apps/web)      │      │  (apps/api)      │   │
│  │  - SSR/SSG       │      │  - Serverless    │   │
│  │  - Edge Runtime  │      │  - Functions     │   │
│  └──────────────────┘      └──────────────────┘   │
└─────────────────────────────────────────────────────┘
                    ↓                    ↓
              ┌─────────────────────────────┐
              │    Convex Cloud Database    │
              │    - Real-time sync         │
              │    - Serverless             │
              │    - Auto-scaling           │
              └─────────────────────────────┘
```

### Deployment Process

1. **Code Push:** Developer pushes to GitHub
2. **CI/CD:** GitHub Actions runs tests
3. **Build:** Turbo builds all packages
4. **Deploy Web:** Vercel deploys Next.js app
5. **Deploy API:** Vercel deploys NestJS as serverless functions
6. **Database:** Convex automatically syncs schema

## Future Enhancements

### Planned Features

1. **Roadmap Versioning**
   - Track changes over time
   - Rollback to previous versions
   - Compare versions

2. **Collaborative Editing**
   - Multiple admins editing simultaneously
   - Conflict resolution
   - Change attribution

3. **Advanced Progress Analytics**
   - Completion rates
   - Time tracking
   - Learning path recommendations

4. **Content Recommendations**
   - AI-powered resource suggestions
   - Personalized learning paths
   - Skill gap analysis

5. **Export/Import**
   - Export roadmaps as JSON/PDF
   - Import from external sources
   - Roadmap templates

### Technical Debt

1. **Test Coverage:** Increase to 80%+
2. **Error Tracking:** Integrate Sentry
3. **Performance Monitoring:** Add APM tool
4. **Documentation:** API documentation with Swagger
5. **Accessibility:** WCAG 2.1 AA compliance

## Related Documents

- **Requirements:** `.kiro/specs/roadmap/requirements.md`
- **Design:** `.kiro/specs/roadmap/design.md`
- **Tasks:** `.kiro/specs/roadmap/tasks.md`
- **General Architecture:** `.docs/architecture/01-tong-quan-kien-truc.md`
- **Business Logic Flow:** `.docs/architecture/04-business-logic-flow.md`
- **Technical Stack:** `.kiro/steering/tech.md`
- **Project Structure:** `.kiro/steering/structure.md`

---

**Document Version:** 1.0.0  
**Last Updated:** 2026-03-07  
**Status:** Complete  
**Maintainer:** VizTechStack Team
