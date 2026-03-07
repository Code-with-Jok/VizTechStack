# Design Document: Roadmap Feature

## Overview

The Roadmap feature is the core functionality of VizTechStack, providing an interactive graph-based learning path visualization system. This design implements a full-stack solution spanning backend API services, database schema, and frontend visualization components.

The system enables users to browse, view, and track progress through technology learning roadmaps, while administrators can create and manage roadmap content. A key innovation is the ability to reuse skill nodes across multiple role roadmaps through drag-and-drop composition, enabling efficient roadmap creation and maintaining consistency across related learning paths.

### Key Design Principles

1. **Hexagonal Architecture**: Clear separation between domain logic, application services, infrastructure adapters, and transport layers
2. **Real-time Synchronization**: Leverage Convex's real-time capabilities for instant updates during roadmap editing
3. **Graph-First Data Model**: Store roadmap structure as JSON-serialized graph data (nodes and edges) optimized for React Flow rendering
4. **Performance Optimization**: Use denormalized roadmap summaries for list queries to avoid parsing large JSON payloads
5. **Node Reusability**: Enable skill nodes to be referenced across multiple role roadmaps without duplication

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                    │
├─────────────────────────────────────────────────────────────┤
│  • RoadmapList (browse/filter)                              │
│  • RoadmapViewer (React Flow visualization)                 │
│  • NodeSidebar (drag-and-drop skill nodes)                  │
│  • TopicPanel (content display)                             │
│  • ProgressTracker (status updates)                         │
└────────────────────┬────────────────────────────────────────┘
                     │ GraphQL (Apollo Client)
┌────────────────────┴────────────────────────────────────────┐
│                    Backend (NestJS + Apollo)                 │
├─────────────────────────────────────────────────────────────┤
│  Transport Layer:                                            │
│    • GraphQL Resolvers (queries/mutations)                  │
│    • Authentication Guards (Clerk JWT)                      │
│    • Role-based Authorization                               │
├─────────────────────────────────────────────────────────────┤
│  Application Layer:                                          │
│    • RoadmapApplicationService                              │
│    • Commands: CreateRoadmap, UpdateRoadmap, etc.           │
│    • Queries: ListRoadmaps, GetRoadmapBySlug, etc.          │
├─────────────────────────────────────────────────────────────┤
│  Domain Layer:                                               │
│    • RoadmapEntity, TopicEntity, ProgressEntity             │
│    • RoadmapInputPolicy (validation)                        │
│    • Domain Errors                                           │
├─────────────────────────────────────────────────────────────┤
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
│    • roadmaps (full data with nodesJson/edgesJson)         │
│    • roadmapSummaries (denormalized for list queries)      │
│    • topics (node content)                                  │
│    • progress (user completion tracking)                    │
│    • bookmarks (user favorites)                             │
│    • users (authentication/authorization)                   │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow Patterns

#### Read Flow (View Roadmap)
1. User requests roadmap by slug via GraphQL query
2. GraphQL resolver calls RoadmapApplicationService
3. Service executes GetRoadmapBySlugQuery
4. Query calls RoadmapRepository.findBySlug()
5. Repository queries Convex roadmaps table
6. JSON strings (nodesJson, edgesJson) are parsed into objects
7. Entity is mapped to GraphQL DTO and returned
8. Frontend receives data and renders with React Flow

#### Write Flow (Create Roadmap)
1. Admin submits CreateRoadmap mutation via GraphQL
2. AuthGuard validates JWT and checks admin role
3. GraphQL resolver calls RoadmapApplicationService
4. Service executes CreateRoadmapCommand
5. Domain policy validates input (unique slug, valid JSON)
6. Repository serializes graph data and stores in Convex
7. Repository creates corresponding roadmapSummary record
8. Success response returned to frontend

#### Real-time Flow (Drag-and-Drop Node Reuse)
1. Admin opens role roadmap editor
2. Frontend subscribes to Convex real-time query for skill nodes
3. Sidebar displays available skill nodes from skill roadmaps
4. Admin drags skill node from sidebar to canvas
5. Frontend updates local React Flow state
6. Frontend calls UpdateRoadmap mutation with new nodesJson
7. Backend validates and persists updated graph data
8. Convex broadcasts change to all connected clients
9. Other editors see update in real-time

## Components and Interfaces

### Backend Modules

#### Roadmap Module

**Application Services**
- `RoadmapApplicationService`: Orchestrates roadmap operations
  - `createRoadmap(command: CreateRoadmapCommand): Promise<RoadmapEntity>`
  - `updateRoadmap(command: UpdateRoadmapCommand): Promise<RoadmapEntity>`
  - `deleteRoadmap(command: DeleteRoadmapCommand): Promise<void>`
  - `getRoadmapBySlug(query: GetRoadmapBySlugQuery): Promise<RoadmapEntity | null>`
  - `listRoadmaps(query: ListRoadmapsQuery): Promise<RoadmapPageEntity>`
  - `getSkillNodesForRoleRoadmap(query: GetSkillNodesQuery): Promise<NodeEntity[]>`

**Domain Entities**
- `RoadmapEntity`: Core roadmap aggregate
  ```typescript
  interface RoadmapEntity {
    id: string;
    slug: string;
    title: string;
    description: string;
    category: 'role' | 'skill' | 'best-practice';
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    nodesJson: string; // Serialized Node[]
    edgesJson: string; // Serialized Edge[]
    topicCount: number;
    status: 'public' | 'draft' | 'private';
    createdAt: number;
  }
  ```

- `NodeEntity`: Individual node in roadmap graph
  ```typescript
  interface NodeEntity {
    id: string;
    type: string;
    position: { x: number; y: number };
    data: {
      label: string;
      topicId?: string;
      isReusedSkillNode?: boolean;
      originalRoadmapId?: string;
    };
  }
  ```

- `EdgeEntity`: Connection between nodes
  ```typescript
  interface EdgeEntity {
    id: string;
    source: string;
    target: string;
    type?: string;
  }
  ```

- `TopicEntity`: Content for a node
  ```typescript
  interface TopicEntity {
    id: string;
    roadmapId: string;
    nodeId: string;
    title: string;
    content: string; // Markdown
    resources: ResourceEntity[];
  }
  ```

- `ProgressEntity`: User progress tracking
  ```typescript
  interface ProgressEntity {
    id: string;
    userId: string;
    roadmapId: string;
    nodeId: string;
    status: 'done' | 'in-progress' | 'skipped';
  }
  ```

- `BookmarkEntity`: User bookmarks
  ```typescript
  interface BookmarkEntity {
    id: string;
    userId: string;
    roadmapId: string;
  }
  ```

**Domain Policies**
- `RoadmapInputPolicy`: Validates roadmap creation/update
  - `validateSlug(slug: string): void` - Ensures slug format and uniqueness
  - `validateGraphData(nodesJson: string, edgesJson: string): void` - Validates JSON structure
  - `validateCategory(category: string): void` - Ensures valid category value
  - `validateDifficulty(difficulty: string): void` - Ensures valid difficulty value
  - `validateStatus(status: string): void` - Ensures valid status value

**Repository Interfaces**
- `RoadmapRepository`
  - `create(roadmap: RoadmapEntity): Promise<RoadmapEntity>`
  - `update(id: string, roadmap: Partial<RoadmapEntity>): Promise<RoadmapEntity>`
  - `delete(id: string): Promise<void>`
  - `findBySlug(slug: string): Promise<RoadmapEntity | null>`
  - `findById(id: string): Promise<RoadmapEntity | null>`
  - `list(filters: RoadmapFilters, pagination: PaginationInput): Promise<RoadmapPageEntity>`
  - `findSkillRoadmaps(): Promise<RoadmapEntity[]>`

- `TopicRepository`
  - `create(topic: TopicEntity): Promise<TopicEntity>`
  - `findByNodeId(roadmapId: string, nodeId: string): Promise<TopicEntity | null>`
  - `findByRoadmapId(roadmapId: string): Promise<TopicEntity[]>`

- `ProgressRepository`
  - `upsert(progress: ProgressEntity): Promise<ProgressEntity>`
  - `findByUserAndRoadmap(userId: string, roadmapId: string): Promise<ProgressEntity[]>`

- `BookmarkRepository`
  - `create(bookmark: BookmarkEntity): Promise<BookmarkEntity>`
  - `delete(userId: string, roadmapId: string): Promise<void>`
  - `findByUserId(userId: string): Promise<BookmarkEntity[]>`

#### Topic Module

**Application Services**
- `TopicApplicationService`: Manages topic content
  - `createTopic(command: CreateTopicCommand): Promise<TopicEntity>`
  - `getTopicByNodeId(query: GetTopicByNodeIdQuery): Promise<TopicEntity | null>`

#### Progress Module

**Application Services**
- `ProgressApplicationService`: Tracks user progress
  - `updateProgress(command: UpdateProgressCommand): Promise<ProgressEntity>`
  - `getProgressForRoadmap(query: GetProgressQuery): Promise<ProgressEntity[]>`

#### Bookmark Module

**Application Services**
- `BookmarkApplicationService`: Manages bookmarks
  - `addBookmark(command: AddBookmarkCommand): Promise<BookmarkEntity>`
  - `removeBookmark(command: RemoveBookmarkCommand): Promise<void>`
  - `getUserBookmarks(query: GetUserBookmarksQuery): Promise<BookmarkEntity[]>`

### Frontend Components

#### RoadmapList Component
- Displays paginated list of roadmaps
- Supports category filtering
- Shows roadmap cards with title, description, category, difficulty, topic count
- Handles authentication state for visibility rules

#### RoadmapViewer Component
- Renders interactive graph using React Flow
- Displays nodes and edges from roadmap data
- Handles node selection for topic viewing
- Shows progress status on nodes (colored indicators)
- Supports zoom, pan, and fit-to-view controls

#### NodeSidebar Component (NEW for Requirement 11)
- Displays available skill nodes from existing skill roadmaps
- Implements drag source for skill nodes
- Filters nodes by search/category
- Shows node preview with title and description
- Only visible when editing role roadmaps

#### RoadmapEditor Component (NEW for Requirement 11)
- Extends RoadmapViewer with editing capabilities
- Implements drop target for skill nodes from sidebar
- Handles node position updates
- Manages edge creation/deletion
- Saves changes via GraphQL mutations
- Real-time sync with Convex

#### TopicPanel Component
- Displays topic content in modal or side panel
- Renders markdown content as HTML
- Lists learning resources with links
- Shows resource type icons (article/video/course)

#### ProgressTracker Component
- Provides UI for marking node status
- Shows status buttons (done/in-progress/skipped)
- Updates progress via GraphQL mutation
- Reflects current status visually

### GraphQL Schema

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

type Topic {
  id: ID!
  roadmapId: ID!
  nodeId: String!
  title: String!
  content: String!
  resources: [Resource!]!
}

type Resource {
  title: String!
  url: String!
  type: ResourceType!
}

type Progress {
  id: ID!
  userId: ID!
  roadmapId: ID!
  nodeId: String!
  status: ProgressStatus!
}

type Bookmark {
  id: ID!
  userId: ID!
  roadmapId: ID!
}

type RoadmapPage {
  items: [Roadmap!]!
  nextCursor: String
  isDone: Boolean!
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

enum ProgressStatus {
  DONE
  IN_PROGRESS
  SKIPPED
}

enum ResourceType {
  ARTICLE
  VIDEO
  COURSE
}

input CreateRoadmapInput {
  slug: String!
  title: String!
  description: String!
  category: RoadmapCategory!
  difficulty: RoadmapDifficulty!
  nodes: [NodeInput!]!
  edges: [EdgeInput!]!
  topicCount: Int!
  status: RoadmapStatus!
}

input NodeInput {
  id: ID!
  type: String!
  position: PositionInput!
  data: NodeDataInput!
}

input PositionInput {
  x: Float!
  y: Float!
}

input NodeDataInput {
  label: String!
  topicId: String
  isReusedSkillNode: Boolean
  originalRoadmapId: String
}

input EdgeInput {
  id: ID!
  source: String!
  target: String!
  type: String
}

input UpdateProgressInput {
  roadmapId: ID!
  nodeId: String!
  status: ProgressStatus!
}

input RoadmapFilters {
  category: RoadmapCategory
  status: RoadmapStatus
}

input PaginationInput {
  limit: Int
  cursor: String
}

type Query {
  # Roadmap queries
  getRoadmapBySlug(slug: String!): Roadmap
  listRoadmaps(filters: RoadmapFilters, pagination: PaginationInput): RoadmapPage!
  getSkillNodesForRoleRoadmap: [Node!]!
  
  # Topic queries
  getTopicByNodeId(roadmapId: ID!, nodeId: String!): Topic
  
  # Progress queries
  getProgressForRoadmap(roadmapId: ID!): [Progress!]!
  
  # Bookmark queries
  getUserBookmarks: [Bookmark!]!
}

type Mutation {
  # Roadmap mutations
  createRoadmap(input: CreateRoadmapInput!): Roadmap!
  updateRoadmap(id: ID!, input: CreateRoadmapInput!): Roadmap!
  deleteRoadmap(id: ID!): Boolean!
  
  # Topic mutations
  createTopic(input: CreateTopicInput!): Topic!
  
  # Progress mutations
  updateProgress(input: UpdateProgressInput!): Progress!
  
  # Bookmark mutations
  addBookmark(roadmapId: ID!): Bookmark!
  removeBookmark(roadmapId: ID!): Boolean!
}
```

## Data Models

### Database Schema (Convex)

The existing Convex schema already supports most requirements. For Requirement 11 (node reuse), we'll extend the node data structure within the JSON to include metadata about reused nodes:

```typescript
// Extended NodeData structure (stored within nodesJson)
interface NodeData {
  label: string;
  topicId?: string;
  isReusedSkillNode?: boolean;      // NEW: Indicates this is a reused skill node
  originalRoadmapId?: string;        // NEW: Reference to source skill roadmap
}
```

### Graph Data Serialization

Roadmap graph data is stored as JSON strings in the database and parsed/serialized at the repository layer:

**Storage Format (nodesJson)**:
```json
[
  {
    "id": "node-1",
    "type": "default",
    "position": { "x": 100, "y": 100 },
    "data": {
      "label": "React Basics",
      "topicId": "topic-123"
    }
  },
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
]
```

**Storage Format (edgesJson)**:
```json
[
  {
    "id": "edge-1",
    "source": "node-1",
    "target": "node-2",
    "type": "smoothstep"
  }
]
```

### Roadmap Summary Denormalization

To optimize list queries, roadmap summaries are maintained as a separate table:

```typescript
interface RoadmapSummaryEntity {
  id: string;
  roadmapId: string;  // Reference to full roadmap
  slug: string;
  title: string;
  description: string;
  category: RoadmapCategory;
  difficulty: RoadmapDifficulty;
  topicCount: number;
  status: RoadmapStatus;
  createdAt: number;
}
```

This denormalization avoids parsing large JSON payloads when listing roadmaps.

### Node Reuse Tracking

For Requirement 11, we track which role roadmaps reference which skill nodes:

**Approach**: Store metadata in the node's data field within nodesJson
- `isReusedSkillNode: true` - Indicates this node is reused from a skill roadmap
- `originalRoadmapId: string` - References the source skill roadmap

**Benefits**:
- No additional database tables needed
- Node reuse is self-documenting within the graph data
- Easy to query which roadmaps use a specific skill node
- Supports future features like "update all references" when skill content changes


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I identified several areas of redundancy:

1. **Filtering properties (1.3, 8.2)**: Both test category filtering - can be combined into one comprehensive property
2. **Field presence properties (1.4, 9.2)**: Difficulty display is already covered by the general field presence check
3. **Required field validation (5.1, 9.3)**: Difficulty requirement is part of the general required fields check
4. **Serialization properties (7.1-7.4, 7.5)**: Individual serialize/parse operations are subsumed by the round-trip property
5. **Summary consistency (5.5, 10.1)**: The detailed version (10.1) subsumes the simpler version (5.5)

The following properties represent the minimal set needed for comprehensive validation:

### Property 1: Roadmap List Ordering

*For any* collection of roadmaps, when querying the roadmap list, the results SHALL be ordered by creation date in descending order (newest first).

**Validates: Requirements 1.1, 8.4**

### Property 2: Pagination Page Size

*For any* roadmap list query, each page SHALL contain at most 24 items.

**Validates: Requirements 1.2, 8.3**

### Property 3: Category Filter Correctness

*For any* category filter value (role, skill, or best-practice), all returned roadmaps SHALL have a category matching the filter value.

**Validates: Requirements 1.3, 8.2**

### Property 4: Roadmap Response Completeness

*For any* roadmap in a list response, the roadmap SHALL include slug, title, description, category, difficulty, topicCount, and status fields.

**Validates: Requirements 1.4, 9.2**

### Property 5: Unauthenticated User Visibility

*For any* unauthenticated user request, all returned roadmaps SHALL have status set to "public".

**Validates: Requirements 1.5**

### Property 6: Admin User Visibility

*For any* admin user request, returned roadmaps MAY have any status value (public, draft, or private).

**Validates: Requirements 1.6**

### Property 7: Graph Data Round-Trip (Nodes)

*For any* valid node array, serializing to JSON then parsing back SHALL produce an equivalent node array structure.

**Validates: Requirements 2.1, 7.1, 7.3, 7.5**

### Property 8: Graph Data Round-Trip (Edges)

*For any* valid edge array, serializing to JSON then parsing back SHALL produce an equivalent edge array structure.

**Validates: Requirements 2.2, 7.2, 7.4, 7.5**

### Property 9: Public Roadmap Access

*For any* roadmap with status "public", any user (authenticated or not) SHALL be able to retrieve it by slug.

**Validates: Requirements 2.4**

### Property 10: Non-Public Roadmap Access Restriction

*For any* roadmap with status "draft" or "private", only admin users SHALL be able to retrieve it by slug.

**Validates: Requirements 2.5**

### Property 11: Non-Existent Roadmap Handling

*For any* non-existent roadmap slug, the system SHALL return null without throwing an error.

**Validates: Requirements 2.6**

### Property 12: Progress Tracking Round-Trip

*For any* valid progress record (userId, roadmapId, nodeId, status), storing the record then retrieving it SHALL return the same values.

**Validates: Requirements 3.1**

### Property 13: Progress Status Validation

*For any* progress update, the status value SHALL be one of: "done", "in-progress", or "skipped". Any other value SHALL be rejected.

**Validates: Requirements 3.2**

### Property 14: Progress Retrieval Completeness

*For any* user and roadmap combination, retrieving progress SHALL return all node status records for that combination.

**Validates: Requirements 3.3**

### Property 15: Progress Update Idempotence

*For any* existing progress record, updating it with a new status SHALL replace the old status, not create a duplicate record.

**Validates: Requirements 3.4**

### Property 16: Topic Retrieval Round-Trip

*For any* valid topic (with roadmapId and nodeId), storing the topic then retrieving it by nodeId SHALL return the same content.

**Validates: Requirements 4.1**

### Property 17: Markdown Parsing Validity

*For any* valid markdown string, parsing it SHALL produce valid HTML output without errors.

**Validates: Requirements 4.2**

### Property 18: Topic Response Completeness

*For any* topic response, it SHALL include id, roadmapId, nodeId, title, content, and resources fields.

**Validates: Requirements 4.3**

### Property 19: Resource Field Completeness

*For any* topic with learning resources, each resource SHALL include title, url, and type fields.

**Validates: Requirements 4.4**

### Property 20: Resource Type Validation

*For any* resource, the type value SHALL be one of: "article", "video", or "course". Any other value SHALL be rejected.

**Validates: Requirements 4.5**

### Property 21: Roadmap Creation Required Fields

*For any* roadmap creation request missing slug, title, description, category, difficulty, topicCount, nodesJson, edgesJson, or status, the system SHALL reject the request with a validation error.

**Validates: Requirements 5.1, 9.3**

### Property 22: Slug Uniqueness Constraint

*For any* roadmap creation request with a slug that already exists, the system SHALL reject the request with a duplicate slug error.

**Validates: Requirements 5.2**

### Property 23: Automatic Timestamp Generation

*For any* roadmap creation, the system SHALL automatically generate and store a createdAt timestamp.

**Validates: Requirements 5.4**

### Property 24: Roadmap Summary Consistency

*For any* created roadmap, the system SHALL create a corresponding roadmap summary with matching slug, title, description, category, difficulty, topicCount, status, and createdAt values.

**Validates: Requirements 5.5, 10.1**

### Property 25: Non-Admin Creation Restriction

*For any* roadmap creation request from a non-admin user, the system SHALL reject the request with an authorization error.

**Validates: Requirements 5.6**

### Property 26: Bookmark Creation Round-Trip

*For any* valid bookmark (userId and roadmapId), creating the bookmark then retrieving user bookmarks SHALL include that roadmap.

**Validates: Requirements 6.1**

### Property 27: Bookmark Deletion Completeness

*For any* existing bookmark, deleting it then retrieving user bookmarks SHALL not include that roadmap.

**Validates: Requirements 6.2**

### Property 28: Bookmark Query Includes Summaries

*For any* user's bookmarks, the query SHALL return roadmap summary data (not just bookmark records) for all bookmarked roadmaps.

**Validates: Requirements 6.4**

### Property 29: Bookmark Uniqueness Constraint

*For any* user and roadmap combination, creating a bookmark multiple times SHALL result in only one bookmark record (idempotent operation).

**Validates: Requirements 6.5**

### Property 30: Invalid JSON Error Handling

*For any* roadmap with invalid JSON in nodesJson or edgesJson, parsing SHALL return a descriptive error message indicating the JSON parsing failure.

**Validates: Requirements 7.6**

### Property 31: Category Validation

*For any* roadmap creation or update, the category value SHALL be one of: "role", "skill", or "best-practice". Any other value SHALL be rejected.

**Validates: Requirements 8.1**

### Property 32: Unfiltered Category Inclusion

*For any* roadmap list query without a category filter, the results MAY include roadmaps from all three categories (role, skill, best-practice).

**Validates: Requirements 8.5**

### Property 33: Difficulty Validation

*For any* roadmap creation or update, the difficulty value SHALL be one of: "beginner", "intermediate", or "advanced". Any other value SHALL be rejected.

**Validates: Requirements 9.1**

### Property 34: Difficulty Storage Consistency

*For any* created roadmap, the difficulty value SHALL be stored identically in both the roadmap record and the roadmap summary record.

**Validates: Requirements 9.4**

### Property 35: One-to-One Roadmap-Summary Relationship

*For any* roadmap, there SHALL exist exactly one corresponding roadmap summary with matching roadmapId.

**Validates: Requirements 10.2**

### Property 36: Skill Node Query Filtering

*For any* request for skill nodes (when editing a role roadmap), all returned nodes SHALL come from roadmaps with category "skill".

**Validates: Requirements 11.1**

### Property 37: Node Addition Preserves JSON Validity

*For any* valid nodesJson array, adding a new node and re-serializing SHALL produce valid JSON that can be parsed back into a node array.

**Validates: Requirements 11.3**

### Property 38: Reused Node Metadata Presence

*For any* skill node added to a role roadmap, the node data SHALL include isReusedSkillNode=true and originalRoadmapId fields.

**Validates: Requirements 11.4**

### Property 39: Node Reference Tracking

*For any* skill node ID, querying all roadmaps and parsing their nodesJson SHALL identify all role roadmaps that reference that node.

**Validates: Requirements 11.5**

## Error Handling

### Domain Errors

The system defines specific domain errors for different failure scenarios:

**RoadmapValidationDomainError**
- Thrown when: Invalid input data (missing required fields, invalid enum values, malformed JSON)
- HTTP Status: 400 Bad Request
- Example: "Invalid category: must be one of role, skill, best-practice"

**RoadmapNotFoundDomainError**
- Thrown when: Requested roadmap doesn't exist
- HTTP Status: 404 Not Found
- Example: "Roadmap with slug 'frontend-developer' not found"

**RoadmapDuplicateDomainError**
- Thrown when: Attempting to create roadmap with existing slug
- HTTP Status: 409 Conflict
- Example: "Roadmap with slug 'frontend-developer' already exists"

**RoadmapAuthorizationDomainError**
- Thrown when: User lacks permission for operation
- HTTP Status: 403 Forbidden
- Example: "Only admin users can create roadmaps"

**RoadmapParsingDomainError**
- Thrown when: JSON parsing fails for nodesJson or edgesJson
- HTTP Status: 422 Unprocessable Entity
- Example: "Failed to parse nodesJson: Unexpected token at position 42"

### Error Handling Strategy

1. **Input Validation**: Validate all inputs at the domain policy layer before processing
2. **Graceful Degradation**: Return null for missing resources instead of throwing errors (e.g., getRoadmapBySlug)
3. **Descriptive Messages**: Include specific details about what went wrong and how to fix it
4. **Error Propagation**: Domain errors are caught by GraphQL filters and mapped to appropriate HTTP status codes
5. **Logging**: All errors are logged with context (user ID, operation, input data) for debugging

### GraphQL Error Format

```graphql
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

## Testing Strategy

### Dual Testing Approach

The Roadmap feature requires both unit tests and property-based tests for comprehensive coverage:

**Unit Tests**: Focus on specific examples, edge cases, and integration points
- Example: Test that creating a roadmap with slug "frontend-dev" succeeds
- Example: Test that markdown with code blocks renders correctly
- Edge case: Test empty nodesJson array
- Edge case: Test roadmap with no edges (disconnected nodes)
- Integration: Test that creating a roadmap triggers summary creation

**Property-Based Tests**: Verify universal properties across all inputs
- Generate random roadmaps with various categories, difficulties, and statuses
- Generate random node/edge arrays and verify round-trip serialization
- Generate random progress records and verify storage/retrieval
- Generate random filter combinations and verify results match filters

### Property-Based Testing Configuration

**Library Selection**: 
- Backend: `fast-check` (TypeScript property-based testing library)
- Minimum 100 iterations per property test

**Test Tagging Format**:
Each property test must include a comment referencing the design document property:

```typescript
// Feature: roadmap, Property 7: Graph Data Round-Trip (Nodes)
it('should preserve node structure through serialize-parse round-trip', () => {
  fc.assert(
    fc.property(fc.array(nodeArbitrary()), (nodes) => {
      const serialized = JSON.stringify(nodes);
      const parsed = JSON.parse(serialized);
      expect(parsed).toEqual(nodes);
    }),
    { numRuns: 100 }
  );
});
```

### Test Organization

**Backend Tests** (apps/api/src/modules/roadmap):
```
application/
  services/
    roadmap-application.service.spec.ts  # Unit tests for service orchestration
  commands/
    create-roadmap.command.spec.ts       # Property tests for command validation
  queries/
    list-roadmaps.query.spec.ts          # Property tests for filtering/pagination
infrastructure/
  adapters/
    convex-roadmap.repository.spec.ts    # Unit tests for repository operations
domain/
  policies/
    roadmap-input.policy.spec.ts         # Property tests for validation rules
  entities/
    roadmap.entity.spec.ts               # Property tests for serialization
```

**Frontend Tests** (apps/web/src/components/roadmap):
```
RoadmapList.test.tsx          # Unit tests for list rendering
RoadmapViewer.test.tsx        # Unit tests for graph visualization
NodeSidebar.test.tsx          # Unit tests for drag source
RoadmapEditor.test.tsx        # Integration tests for drag-and-drop
```

### Test Coverage Goals

- Branches: 25% minimum (project standard)
- Functions: 25% minimum (project standard)
- Lines: 25% minimum (project standard)
- Statements: 25% minimum (project standard)

### Critical Test Scenarios

1. **Graph Data Integrity**: Round-trip serialization must preserve all node and edge data
2. **Authorization**: Non-admin users cannot create/update/delete roadmaps
3. **Visibility Rules**: Unauthenticated users only see public roadmaps
4. **Node Reuse**: Skill nodes maintain reference to original roadmap when reused
5. **Summary Consistency**: Roadmap and summary records stay synchronized
6. **Pagination**: Results are correctly paginated with proper cursor handling
7. **Filtering**: Category filters return only matching roadmaps
8. **Progress Tracking**: User progress updates are idempotent (no duplicates)
9. **Bookmark Management**: Bookmarks are unique per user-roadmap combination
10. **Error Handling**: Invalid JSON produces descriptive error messages

### Testing Best Practices

1. **Use Generators**: Create arbitrary generators for entities (roadmaps, nodes, edges, progress)
2. **Test Invariants**: Focus on properties that must always hold (ordering, uniqueness, completeness)
3. **Avoid Over-Testing**: Don't write unit tests for every possible input—let property tests handle coverage
4. **Test Boundaries**: Explicitly test edge cases (empty arrays, null values, maximum lengths)
5. **Mock External Dependencies**: Mock Convex client in repository tests
6. **Test Real-Time Behavior**: Verify Convex subscriptions trigger updates in frontend tests

### Example Property Test

```typescript
import fc from 'fast-check';
import { RoadmapEntity } from '../entities/roadmap.entity';

// Feature: roadmap, Property 7: Graph Data Round-Trip (Nodes)
describe('Graph Data Serialization', () => {
  it('should preserve node structure through round-trip', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.string(),
            type: fc.string(),
            position: fc.record({
              x: fc.float(),
              y: fc.float(),
            }),
            data: fc.record({
              label: fc.string(),
              topicId: fc.option(fc.string()),
            }),
          })
        ),
        (nodes) => {
          const nodesJson = JSON.stringify(nodes);
          const parsed = JSON.parse(nodesJson);
          expect(parsed).toEqual(nodes);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

## Implementation Notes

### Drag-and-Drop Implementation (Requirement 11)

The drag-and-drop feature for reusing skill nodes requires coordination between frontend and backend:

**Frontend Implementation**:
1. Use React Flow's built-in drag-and-drop capabilities
2. Implement custom drag source in NodeSidebar component
3. Handle drop events in RoadmapEditor component
4. Update local React Flow state immediately for responsive UI
5. Debounce GraphQL mutations to avoid excessive API calls
6. Use Convex real-time subscriptions for multi-user editing

**Backend Implementation**:
1. Provide `getSkillNodesForRoleRoadmap` query to fetch available skill nodes
2. Validate that only skill nodes can be reused in role roadmaps
3. Ensure node metadata (isReusedSkillNode, originalRoadmapId) is preserved
4. Update nodesJson with new node while maintaining JSON validity

**Real-Time Synchronization**:
- Leverage Convex's reactive queries for instant updates
- Multiple admins can edit the same roadmap simultaneously
- Changes propagate to all connected clients within milliseconds
- Conflict resolution: last-write-wins (Convex default)

### Performance Considerations

1. **List Queries**: Use roadmapSummaries table to avoid parsing large JSON payloads
2. **Pagination**: Implement cursor-based pagination for efficient large dataset handling
3. **Caching**: Apollo Client caches GraphQL responses on frontend
4. **Indexing**: Convex indexes on slug, category, status, and createdAt for fast queries
5. **JSON Parsing**: Parse nodesJson/edgesJson only when needed (not for list queries)

### Security Considerations

1. **Authentication**: All mutations require valid Clerk JWT token
2. **Authorization**: Role-based access control via @Roles decorator
3. **Input Validation**: Validate all inputs at domain policy layer
4. **SQL Injection**: Not applicable (Convex uses type-safe queries)
5. **XSS Prevention**: Sanitize markdown content before rendering HTML
6. **Rate Limiting**: Implement rate limiting on mutations (future enhancement)

### Migration Strategy

Since some roadmap functionality already exists, the implementation will:

1. **Extend Existing Entities**: Add optional fields for node reuse metadata
2. **Backward Compatibility**: Existing roadmaps without metadata continue to work
3. **Gradual Rollout**: Implement features incrementally (list → view → create → edit → reuse)
4. **Data Migration**: No migration needed—new fields are optional
5. **Testing**: Run property tests against existing data to ensure compatibility

