# Design Document - Node Management System

## Overview

Hệ thống Node Management System là một tính năng toàn diện cho phép quản lý hai loại node: Article và Roadmap. Hệ thống được xây dựng trên kiến trúc monorepo với Next.js frontend, NestJS GraphQL backend, Convex serverless database, và Clerk authentication.

### Mục tiêu chính

- Cung cấp editor giống Notion cho Article nodes với rich text và blocks
- Cung cấp roadmap builder với drag-and-drop visualization sử dụng React Flow
- Đảm bảo type-safety end-to-end với TypeScript và Zod validation
- Implement role-based access control với Clerk authentication
- Tối ưu performance với lazy loading, caching, và code splitting
- Đảm bảo accessibility theo WCAG 2.1 AA standards

### Phạm vi

**In Scope:**
- CRUD operations cho Article và Roadmap nodes
- Rich text editor với auto-save
- Interactive roadmap visualization với drag-and-drop
- Navigation giữa các nodes
- Search và filter functionality
- Real-time validation và error handling
- Performance optimizations
- Accessibility features

**Out of Scope:**
- Real-time collaboration (optional requirement)
- Version history và rollback
- Comments và discussions
- Export/import functionality
- Multi-language support



## Architecture

### System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend Layer                       │
│                    (Next.js 16 App Router)                   │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Article      │  │ Roadmap      │  │ Node         │      │
│  │ Editor Page  │  │ Builder Page │  │ View Pages   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────────────────────────────────────────┐       │
│  │         Shared Components                         │       │
│  │  - NodeSwitch                                     │       │
│  │  - ContentEditor (Notion-like)                    │       │
│  │  - RoadmapVisualization (React Flow)              │       │
│  │  - NodeSidebar (Draggable)                        │       │
│  └──────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ GraphQL over HTTPS
                            │ (Apollo Client)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                       │
│                    (NestJS + Apollo Server)                  │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────┐       │
│  │         Authentication & Authorization            │       │
│  │  - ClerkAuthGuard (JWT verification)              │       │
│  │  - RolesGuard (Admin/User check)                  │       │
│  └──────────────────────────────────────────────────┘       │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │ Article      │  │ Roadmap      │                         │
│  │ Resolver     │  │ Resolver     │                         │
│  └──────────────┘  └──────────────┘                         │
│         │                  │                                 │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │ Article      │  │ Roadmap      │                         │
│  │ Service      │  │ Service      │                         │
│  └──────────────┘  └──────────────┘                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Convex Client SDK
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Database Layer                          │
│                   (Convex Serverless DB)                     │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ articles     │  │ roadmaps     │  │ users        │      │
│  │ table        │  │ table        │  │ table        │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- Next.js 16.1.6 với App Router
- React 19.2.3 (Server và Client Components)
- TypeScript 5.7
- Tailwind CSS 4 với shadcn/ui components
- React Flow (@xyflow/react) cho roadmap visualization
- Apollo Client 3.8.8 cho GraphQL
- Clerk cho authentication

**Backend:**
- NestJS 11.0.1
- Apollo Server 5.4.0 với code-first approach
- Clerk JWT validation với @clerk/backend
- Zod cho validation

**Database:**
- Convex serverless database
- Real-time sync capabilities
- TypeScript-first schema

**Shared Packages:**
- @viztechstack/graphql-schema: GraphQL schema definitions
- @viztechstack/graphql-generated: Auto-generated types và Zod schemas
- @viztechstack/validation: Runtime validation utilities
- @viztechstack/roadmap-visualization: Roadmap parsing và layout



### Architecture Patterns

**Layered Architecture:**
- **Transport Layer**: GraphQL resolvers và REST controllers
- **Application Layer**: Business logic services
- **Domain Layer**: Domain models và interfaces
- **Infrastructure Layer**: Database access và external services

**Design Patterns:**
- **Repository Pattern**: Convex service abstraction cho database operations
- **Guard Pattern**: Authentication và authorization guards
- **Decorator Pattern**: Custom decorators cho metadata (@Roles, @CurrentUser, @Public)
- **Service Pattern**: Business logic encapsulation
- **Factory Pattern**: Node creation với type discrimination

### Data Flow

**Create Article Node Flow:**
```
User Input → ContentEditor → Validation (Client) → GraphQL Mutation
  → ClerkAuthGuard → RolesGuard → ArticleResolver → ArticleService
  → Validation (Server) → Slug Generation → Convex Mutation
  → Database → Response → Redirect to /article/[slug]
```

**Create Roadmap Node Flow:**
```
User Input → Form + Visualization → Validation (Client) → GraphQL Mutation
  → ClerkAuthGuard → RolesGuard → RoadmapResolver → RoadmapService
  → Validation (Server) → Structure Validation → Slug Generation
  → Convex Mutation → Database → Response → Redirect to /roadmap/[slug]
```

**View Node Flow:**
```
URL /article/[slug] → Next.js Route → GraphQL Query (Public)
  → ArticleResolver → ArticleService → Convex Query
  → Database → Response → SSR/CSR Rendering → Display
```



## Components and Interfaces

### Frontend Components

#### 1. NodeSwitch Component

**Purpose**: Cho phép admin chọn loại node (Article/Roadmap) khi tạo mới.

**Location**: `apps/web/src/components/node/NodeSwitch.tsx`

**Props**:
```typescript
interface NodeSwitchProps {
  value: 'article' | 'roadmap';
  onChange: (value: 'article' | 'roadmap') => void;
  disabled?: boolean;
}
```

**Behavior**:
- Hiển thị 2 options: Article và Roadmap
- Visual feedback khi select
- Keyboard accessible (Tab, Arrow keys, Enter)
- ARIA labels cho screen readers

**Requirements**: 1.2, 1.3

---

#### 2. ContentEditor Component

**Purpose**: Rich text editor giống Notion cho Article nodes.

**Location**: `apps/web/src/components/editor/ContentEditor.tsx`

**Props**:
```typescript
interface ContentEditorProps {
  initialContent?: string;
  onChange: (content: string) => void;
  onSave: (content: string) => Promise<void>;
  autoSaveInterval?: number; // default: 30000ms
  readOnly?: boolean;
}
```

**Features**:
- Rich text formatting: bold, italic, underline, strikethrough
- Headings: H1, H2, H3
- Lists: ordered, unordered, checklist
- Blocks: paragraph, image, code block, quote, divider
- Auto-save every 30 seconds
- Keyboard shortcuts (Cmd+B, Cmd+I, etc.)
- Drag-and-drop blocks
- Slash commands (/, /heading, /code, etc.)

**Technology**: 
- Tiptap editor hoặc Novel editor (based on Tiptap)
- Prosemirror under the hood

**Requirements**: 2.1, 2.2, 2.3, 2.4

---

#### 3. RoadmapVisualization Component

**Purpose**: Interactive visualization của roadmap với React Flow.

**Location**: `apps/web/src/components/roadmap/RoadmapVisualization.tsx`

**Props**:
```typescript
interface RoadmapVisualizationProps {
  nodes: RoadmapNode[];
  edges: RoadmapEdge[];
  onNodesChange?: (nodes: RoadmapNode[]) => void;
  onEdgesChange?: (edges: RoadmapEdge[]) => void;
  onNodeClick?: (nodeId: string) => void;
  readOnly?: boolean;
  showExplanatoryNotes?: boolean;
}

interface RoadmapNode {
  id: string;
  type: 'article' | 'roadmap';
  position: { x: number; y: number };
  data: {
    slug: string;
    title: string;
    description?: string;
  };
}

interface RoadmapEdge {
  id: string;
  source: string;
  target: string;
  type?: 'default' | 'step' | 'smoothstep';
}
```

**Features**:
- Render nodes với React Flow
- Drag-and-drop repositioning
- Auto-layout với dagre algorithm
- Zoom và pan controls
- Mini-map navigation
- Node colors: Article (blue), Roadmap (purple)
- Hover tooltips
- Click navigation
- Explanatory notes overlay
- Virtualization cho 50+ nodes

**Requirements**: 3.3, 4.7, 4.8, 4.9, 6.3, 6.6, 6.7, 6.8, 7.1, 7.2

---

#### 4. NodeSidebar Component

**Purpose**: Draggable sidebar chứa available Article nodes.

**Location**: `apps/web/src/components/roadmap/NodeSidebar.tsx`

**Props**:
```typescript
interface NodeSidebarProps {
  articles: ArticleNode[];
  onDragStart?: (article: ArticleNode) => void;
  onDragEnd?: () => void;
  loading?: boolean;
  error?: Error;
}

interface ArticleNode {
  id: string;
  slug: string;
  title: string;
  description?: string;
}
```

**Features**:
- List tất cả Article nodes
- Draggable items với HTML5 Drag API
- Search/filter trong sidebar
- Empty state với warning message
- Link đến create Article page
- Loading skeleton
- Error handling

**Requirements**: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6



### Frontend Pages

#### 1. Create Node Page

**Route**: `/admin/nodes/create`

**Location**: `apps/web/app/admin/nodes/create/page.tsx`

**Layout**:
- NodeSwitch ở top
- Conditional rendering based on selected type:
  - Article: ContentEditor full-width
  - Roadmap: Split layout (40% form, 60% visualization)

**Authorization**: Admin only (Clerk middleware)

**Requirements**: 1.2, 1.3, 2.1, 3.1

---

#### 2. Article View Page

**Route**: `/article/[slug]`

**Location**: `apps/web/app/article/[slug]/page.tsx`

**Layout**:
```
┌─────────────────────────────────────┐
│ Breadcrumb (if part of roadmap)    │
├─────────────────────────────────────┤
│ Title (H1)                          │
│ Metadata (author, date, read time) │
├─────────────────────────────────────┤
│                                     │
│ Content (Notion-style rendering)   │
│                                     │
│ - Rich text                         │
│ - Images (lazy loaded)              │
│ - Code blocks (syntax highlighted) │
│ - Quotes, lists, etc.               │
│                                     │
├─────────────────────────────────────┤
│ Related Articles                    │
└─────────────────────────────────────┘
```

**Features**:
- SSR cho SEO
- Responsive layout
- Reading time calculation
- Scroll depth tracking
- Share buttons
- Print-friendly CSS

**Requirements**: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.10

---

#### 3. Roadmap View Page

**Route**: `/roadmap/[slug]`

**Location**: `apps/web/app/roadmap/[slug]/page.tsx`

**Layout**:
```
┌─────────────────────────────────────┐
│ Title (H1)                          │
│ Description                         │
│ Metadata (author, date, node count)│
├─────────────────────────────────────┤
│                                     │
│ Content (optional text content)    │
│                                     │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ Roadmap Visualization           │ │
│ │                                 │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ Explanatory Notes (top-right)│ │ │
│ │ └─────────────────────────────┘ │ │
│ │                                 │ │
│ │ [Interactive React Flow Graph]  │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Features**:
- SSR cho SEO
- Interactive visualization
- Click navigation
- Zoom/pan controls
- Responsive layout
- Share buttons

**Requirements**: 6.1, 6.2, 6.3, 6.4, 6.5



### Backend Components

#### 1. Article Module

**Location**: `apps/api/src/modules/article/`

**Structure**:
```
article/
├── article.module.ts
├── transport/
│   └── graphql/
│       ├── resolvers/
│       │   └── article.resolver.ts
│       └── schemas/
│           ├── article.schema.ts
│           └── article-input.schema.ts
├── application/
│   └── services/
│       └── article.service.ts
└── domain/
    └── models/
        └── article.model.ts
```

**Resolver Methods**:
- `articles(): Promise<Article[]>` - List all published articles (Public)
- `articlesForAdmin(): Promise<Article[]>` - List all articles including drafts (Admin)
- `article(slug: string): Promise<Article | null>` - Get article by slug (Public)
- `createArticle(input: CreateArticleInput): Promise<Article>` - Create article (Admin)
- `updateArticle(input: UpdateArticleInput): Promise<Article>` - Update article (Admin)
- `deleteArticle(id: string): Promise<Article>` - Delete article (Admin)

**Service Methods**:
- `findAll(): Promise<Article[]>` - Query published articles from Convex
- `findAllForAdmin(): Promise<Article[]>` - Query all articles from Convex
- `findBySlug(slug: string): Promise<Article | null>` - Query article by slug
- `create(input: CreateArticleInput, authorId: string): Promise<Article>` - Create with validation
- `update(input: UpdateArticleInput): Promise<Article>` - Update with validation
- `delete(id: string): Promise<Article>` - Soft delete article

**Requirements**: 2.6, 2.7, 2.8, 2.9, 2.10, 9.1, 9.3, 9.5

---

#### 2. Roadmap Module (Extended)

**Location**: `apps/api/src/modules/roadmap/`

**Additional Methods** (beyond existing):
- Validation cho roadmap structure
- Referential integrity checks
- Node count calculation

**Requirements**: 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 9.2, 9.4, 9.5

---

#### 3. Search Module

**Location**: `apps/api/src/modules/search/`

**Structure**:
```
search/
├── search.module.ts
├── transport/
│   └── graphql/
│       ├── resolvers/
│       │   └── search.resolver.ts
│       └── schemas/
│           └── search.schema.ts
└── application/
    └── services/
        └── search.service.ts
```

**Resolver Methods**:
- `search(query: string, filters: SearchFilters): Promise<SearchResults>` - Search nodes (Public)

**Service Methods**:
- `searchNodes(query: string, filters: SearchFilters): Promise<SearchResults>` - Full-text search
- `filterByType(results: Node[], type: NodeType): Node[]` - Filter by type
- `filterByTags(results: Node[], tags: string[]): Node[]` - Filter by tags
- `sortResults(results: Node[], sortBy: SortOption): Node[]` - Sort results

**Requirements**: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8



### Shared Packages

#### 1. GraphQL Schema Package

**Location**: `packages/shared/graphql-schema/src/`

**Files**:
- `article.graphql` - Article type definitions
- `roadmap.graphql` - Roadmap type definitions (existing)
- `search.graphql` - Search type definitions
- `node.graphql` - Common node interface

**Example Schema**:
```graphql
# node.graphql
interface Node {
  id: ID!
  slug: String!
  title: String!
  author: String!
  createdAt: Float!
  updatedAt: Float!
  isPublished: Boolean!
}

# article.graphql
type Article implements Node {
  id: ID!
  slug: String!
  title: String!
  content: String!
  author: String!
  tags: [String!]!
  createdAt: Float!
  updatedAt: Float!
  isPublished: Boolean!
  readingTime: Int!
}

input CreateArticleInput {
  slug: String!
  title: String!
  content: String!
  tags: [String!]!
  isPublished: Boolean!
}

input UpdateArticleInput {
  id: String!
  slug: String
  title: String
  content: String
  tags: [String]
  isPublished: Boolean
}

type Query {
  articles: [Article!]!
  articlesForAdmin: [Article!]!
  article(slug: String!): Article
}

type Mutation {
  createArticle(input: CreateArticleInput!): Article!
  updateArticle(input: UpdateArticleInput!): Article!
  deleteArticle(id: String!): Article!
}
```

**Requirements**: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8

---

#### 2. Validation Package

**Location**: `packages/shared/validation/src/`

**Schemas**:
```typescript
// article-validation.ts
export const ArticleSchema = z.object({
  slug: z.string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  content: z.string()
    .min(1, 'Content is required'),
  tags: z.array(z.string()).default([]),
  isPublished: z.boolean().default(false),
});

export const CreateArticleInputSchema = ArticleSchema;

export const UpdateArticleInputSchema = ArticleSchema.partial().extend({
  id: z.string(),
});

// roadmap-validation.ts
export const RoadmapStructureSchema = z.object({
  nodes: z.array(z.object({
    id: z.string(),
    type: z.enum(['article', 'roadmap']),
    position: z.object({
      x: z.number(),
      y: z.number(),
    }),
    data: z.object({
      slug: z.string(),
      title: z.string(),
      description: z.string().optional(),
    }),
  })).min(1, 'Roadmap must contain at least one node'),
  edges: z.array(z.object({
    id: z.string(),
    source: z.string(),
    target: z.string(),
    type: z.string().optional(),
  })),
});

export const RoadmapSchema = z.object({
  slug: z.string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  description: z.string(),
  content: z.string().optional(),
  structure: RoadmapStructureSchema,
  tags: z.array(z.string()).default([]),
  isPublished: z.boolean().default(false),
});
```

**Requirements**: 9.9, 13.1, 13.2, 13.3, 13.4, 13.5



## Data Models

### Convex Database Schema

#### Articles Table

**Location**: `convex/schema.ts`

```typescript
articles: defineTable({
  // Core fields
  slug: v.string(),
  title: v.string(),
  content: v.string(), // JSON string from editor
  
  // Metadata
  author: v.string(), // Clerk user ID
  tags: v.array(v.string()),
  
  // Timestamps
  createdAt: v.number(),
  updatedAt: v.number(),
  publishedAt: v.optional(v.number()),
  
  // Status
  isPublished: v.boolean(),
  isDeleted: v.optional(v.boolean()), // Soft delete flag
  
  // Computed fields (stored for performance)
  readingTime: v.optional(v.number()), // in minutes
  wordCount: v.optional(v.number()),
})
  .index("by_slug", ["slug"])
  .index("by_author", ["author"])
  .index("by_published", ["isPublished", "publishedAt"])
  .index("by_tags", ["tags"])
```

**Indexes**:
- `by_slug`: Fast lookup by slug (unique constraint enforced in service layer)
- `by_author`: Query articles by author
- `by_published`: Query published articles sorted by date
- `by_tags`: Filter articles by tags

**Requirements**: 10.1, 10.3, 10.5, 10.6, 10.7, 10.8

---

#### Roadmaps Table (Extended)

**Location**: `convex/schema.ts`

```typescript
roadmaps: defineTable({
  // Core fields
  slug: v.string(),
  title: v.string(),
  description: v.string(),
  content: v.optional(v.string()), // Optional text content
  
  // Roadmap structure (JSON string)
  nodesJson: v.string(), // Serialized RoadmapNode[]
  edgesJson: v.string(), // Serialized RoadmapEdge[]
  
  // Metadata
  author: v.string(), // Clerk user ID
  tags: v.array(v.string()),
  
  // Timestamps
  createdAt: v.number(),
  updatedAt: v.number(),
  publishedAt: v.optional(v.number()),
  
  // Status
  isPublished: v.boolean(),
  isDeleted: v.optional(v.boolean()), // Soft delete flag
  
  // Computed fields
  nodeCount: v.optional(v.number()),
  
  // Legacy fields (keep for backward compatibility)
  category: v.optional(v.string()),
  status: v.optional(v.string()),
  difficulty: v.optional(v.string()),
  topicCount: v.optional(v.number()),
})
  .index("by_slug", ["slug"])
  .index("by_author", ["author"])
  .index("by_published", ["isPublished", "publishedAt"])
  .index("by_tags", ["tags"])
```

**Requirements**: 10.2, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9

---

### TypeScript Types

#### Article Types

```typescript
// Domain model
export interface Article {
  _id: string; // Convex document ID
  slug: string;
  title: string;
  content: string;
  author: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  publishedAt?: number;
  isPublished: boolean;
  isDeleted?: boolean;
  readingTime?: number;
  wordCount?: number;
}

// GraphQL schema type (generated)
export interface ArticleSchema {
  id: string; // Maps to _id
  slug: string;
  title: string;
  content: string;
  author: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  isPublished: boolean;
  readingTime: number;
}

// Input types
export interface CreateArticleInput {
  slug: string;
  title: string;
  content: string;
  tags: string[];
  isPublished: boolean;
}

export interface UpdateArticleInput {
  id: string;
  slug?: string;
  title?: string;
  content?: string;
  tags?: string[];
  isPublished?: boolean;
}
```

#### Roadmap Types

```typescript
// Roadmap structure types
export interface RoadmapNode {
  id: string;
  type: 'article' | 'roadmap';
  position: { x: number; y: number };
  data: {
    slug: string;
    title: string;
    description?: string;
  };
}

export interface RoadmapEdge {
  id: string;
  source: string;
  target: string;
  type?: 'default' | 'step' | 'smoothstep';
}

export interface RoadmapStructure {
  nodes: RoadmapNode[];
  edges: RoadmapEdge[];
}

// Domain model
export interface Roadmap {
  _id: string;
  slug: string;
  title: string;
  description: string;
  content?: string;
  nodesJson: string; // Serialized RoadmapNode[]
  edgesJson: string; // Serialized RoadmapEdge[]
  author: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  publishedAt?: number;
  isPublished: boolean;
  isDeleted?: boolean;
  nodeCount?: number;
}
```



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

Sau khi phân tích 115 acceptance criteria, tôi đã xác định các properties có thể consolidate:

**Redundancy Analysis:**
- Properties về slug generation cho Article và Roadmap có thể combine thành một property chung
- Properties về authorization cho create/delete operations có thể combine
- Properties về validation consistency giữa client và server có thể combine
- Properties về metadata persistence cho Article và Roadmap có thể combine
- Properties về navigation cho Article và Roadmap nodes có thể combine

**Final Property Set**: 15 comprehensive properties (reduced from potential 40+ individual tests)

---

### Property 1: Slug Uniqueness Across All Nodes

*For any* node (Article hoặc Roadmap), khi tạo node mới với slug S, nếu đã tồn tại node khác với slug S, thì hệ thống phải reject creation và return error message cụ thể.

**Validates: Requirements 2.7, 5.5, 10.5, 13.3**

**Test Strategy**: Property-based test generate random node data với various slugs, attempt to create duplicates, và verify rejection.

**Pattern**: Error Conditions + Invariant

---

### Property 2: Node Creation Round-Trip Preservation

*For any* valid node data (Article hoặc Roadmap), creating node rồi immediately fetching by slug phải return data equivalent với original input (excluding auto-generated fields như timestamps và IDs).

**Validates: Requirements 2.6, 2.10, 5.3, 5.8, 10.7**

**Test Strategy**: Property-based test với random valid node data: `getNode(createNode(data)).content ≈ data.content`

**Pattern**: Round Trip

---

### Property 3: Slug Generation Idempotence

*For any* title string, generating slug từ title nhiều lần phải produce consistent result (same title → same base slug, collision handling adds suffix deterministically).

**Validates: Requirements 2.7, 5.5**

**Test Strategy**: Property-based test: `generateSlug(title) == generateSlug(title)` cho random titles.

**Pattern**: Idempotence

---

### Property 4: Authorization Enforcement for Mutations

*For any* mutation operation (create, update, delete), nếu user không có admin role, thì hệ thống phải reject request với 403 Forbidden error.

**Validates: Requirements 1.1, 1.4, 9.10, 9.11**

**Test Strategy**: Property-based test với random user roles và mutation types, verify non-admin users bị reject.

**Pattern**: Security + Invariant

---

### Property 5: Validation Consistency Between Client and Server

*For any* invalid input data, cả client-side và server-side validation phải reject với same validation errors (field names và error messages consistent).

**Validates: Requirements 2.9, 5.7, 9.9, 13.6**

**Test Strategy**: Property-based test với random invalid inputs, verify both client Zod schema và server Zod schema reject với equivalent errors.

**Pattern**: Metamorphic

---

### Property 6: Roadmap Referential Integrity

*For any* Roadmap structure, tất cả Article node references trong roadmap.nodes phải correspond to existing Article nodes trong database (no broken references).

**Validates: Requirements 5.2, 10.9**

**Test Strategy**: Property-based test tạo roadmaps với random node references, verify all references resolve to valid nodes.

**Pattern**: Invariant

---

### Property 7: Drag-and-Drop Position Preservation

*For any* roadmap với node positions, saving roadmap rồi reloading phải preserve exact node positions và connections (round-trip property).

**Validates: Requirements 4.7, 5.4, 6.6**

**Test Strategy**: Property-based test với random node positions: `reload(save(positions)) == positions`

**Pattern**: Round Trip

---

### Property 8: Auto-Connection Logic Consistency

*For any* two nodes dropped within proximity threshold (e.g., 100px), hệ thống phải automatically create connection giữa chúng. Nếu distance > threshold, không tạo connection.

**Validates: Requirements 4.8, 4.11**

**Test Strategy**: Property-based test với random node positions, verify connections created iff distance < threshold.

**Pattern**: Metamorphic

---

### Property 9: Navigation Preserves Node Type

*For any* node click trong roadmap visualization, navigation URL phải match node type: Article nodes → `/article/[slug]`, Roadmap nodes → `/roadmap/[slug]`.

**Validates: Requirements 7.1, 7.2**

**Test Strategy**: Property-based test với random node types và slugs, verify correct URL generation.

**Pattern**: Invariant

---

### Property 10: Content Sanitization Prevents XSS

*For any* user input containing malicious scripts (script tags, event handlers, javascript: URLs), hệ thống phải sanitize input và render safe HTML (no script execution).

**Validates: Requirements 13.10**

**Test Strategy**: Property-based test với random XSS payloads, verify chúng được escaped hoặc removed.

**Pattern**: Security + Error Conditions

---

### Property 11: Metadata Completeness Invariant

*For any* created node (Article hoặc Roadmap), node phải contain all required metadata fields: author, createdAt, updatedAt, và các fields này phải có valid values (non-empty author, timestamps > 0).

**Validates: Requirements 2.10, 5.8**

**Test Strategy**: Property-based test tạo random nodes, verify all metadata fields present và valid.

**Pattern**: Invariant

---

### Property 12: Update Timestamp Monotonicity

*For any* node update operation, updatedAt timestamp sau update phải strictly greater than updatedAt trước update.

**Validates: Requirements 10.7**

**Test Strategy**: Property-based test với random updates, verify `node.updatedAt_after > node.updatedAt_before`.

**Pattern**: Invariant

---

### Property 13: Soft Delete Preservation

*For any* deleted node, node phải still exist trong database với isDeleted=true flag, và không appear trong public queries (findAll), nhưng có thể retrieved trong admin queries (findAllForAdmin).

**Validates: Requirements 10.8**

**Test Strategy**: Property-based test delete random nodes, verify presence in admin queries và absence in public queries.

**Pattern**: Invariant

---

### Property 14: Search Results Relevance Ordering

*For any* search query Q1 và more specific query Q2 (where Q2 contains Q1), results for Q2 phải be subset of results for Q1: `results(Q1) ⊇ results(Q2)`.

**Validates: Requirements 12.2, 12.3**

**Test Strategy**: Property-based test với random query pairs, verify subset relationship.

**Pattern**: Metamorphic

---

### Property 15: Error Recovery Without Data Loss

*For any* error condition (network error, validation error, server error), nếu user retry operation với same valid data, operation phải eventually succeed và produce correct result (no data corruption from failed attempts).

**Validates: Requirements 13.7, 13.8, 10.10**

**Test Strategy**: Property-based test inject random errors, verify retry succeeds và data integrity maintained.

**Pattern**: Error Conditions + Idempotence



## Error Handling

### Error Categories

#### 1. Validation Errors (400 Bad Request)

**Client-Side**:
```typescript
// Zod validation errors
try {
  ArticleSchema.parse(input);
} catch (error) {
  if (error instanceof ZodError) {
    // Display inline error messages
    error.errors.forEach(err => {
      showFieldError(err.path.join('.'), err.message);
    });
  }
}
```

**Server-Side**:
```typescript
// NestJS validation pipe
@UsePipes(new ValidationPipe({ transform: true }))
async createArticle(@Body() input: CreateArticleInput) {
  // Validation happens automatically
  // Returns 400 with error details if validation fails
}
```

**Error Response Format**:
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "title",
      "message": "Title must be less than 200 characters"
    },
    {
      "field": "slug",
      "message": "Slug must be lowercase alphanumeric with hyphens"
    }
  ]
}
```

**Requirements**: 2.9, 5.7, 13.1, 13.2, 13.3, 13.4, 13.5, 13.6

---

#### 2. Authentication Errors (401 Unauthorized)

**Scenario**: Invalid hoặc missing JWT token

**Handler**:
```typescript
// ClerkAuthGuard
@Injectable()
export class ClerkAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const token = extractToken(context);
      const user = await verifyToken(token);
      attachUserToContext(context, user);
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
```

**Error Response**:
```json
{
  "statusCode": 401,
  "message": "Invalid or expired token",
  "error": "Unauthorized"
}
```

**Client Handling**:
- Redirect to login page
- Clear local storage
- Show "Session expired" message

**Requirements**: 1.1, 9.10

---

#### 3. Authorization Errors (403 Forbidden)

**Scenario**: User không có required role

**Handler**:
```typescript
// RolesGuard
@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) return true;
    
    const user = context.switchToHttp().getRequest().user;
    const hasRole = requiredRoles.some(role => user.role === role);
    
    if (!hasRole) {
      throw new ForbiddenException('Insufficient permissions');
    }
    return true;
  }
}
```

**Error Response**:
```json
{
  "statusCode": 403,
  "message": "Insufficient permissions",
  "error": "Forbidden"
}
```

**Client Handling**:
- Show "Access denied" message
- Redirect to home page
- Log attempt for security audit

**Requirements**: 1.4, 9.11

---

#### 4. Not Found Errors (404 Not Found)

**Scenario**: Node không tồn tại

**Handler**:
```typescript
async findBySlug(slug: string): Promise<Article | null> {
  const article = await this.convexService.query('articles:getBySlug', { slug });
  if (!article) {
    throw new NotFoundException(`Article with slug "${slug}" not found`);
  }
  return article;
}
```

**Error Response**:
```json
{
  "statusCode": 404,
  "message": "Article with slug \"my-article\" not found",
  "error": "Not Found"
}
```

**Client Handling**:
- Show custom 404 page
- Suggest related content
- Provide search functionality

**Requirements**: 6.9, 8.8

---

#### 5. Conflict Errors (409 Conflict)

**Scenario**: Duplicate slug

**Handler**:
```typescript
async create(input: CreateArticleInput): Promise<Article> {
  const existing = await this.findBySlug(input.slug);
  if (existing) {
    throw new ConflictException(`Article with slug "${input.slug}" already exists`);
  }
  // Proceed with creation
}
```

**Error Response**:
```json
{
  "statusCode": 409,
  "message": "Article with slug \"my-article\" already exists",
  "error": "Conflict"
}
```

**Client Handling**:
- Show inline error on slug field
- Suggest alternative slugs
- Allow user to modify slug

**Requirements**: 10.5, 13.3

---

#### 6. Network Errors

**Scenario**: API request fails due to network issues

**Handler**:
```typescript
// Apollo Client error handling
const [createArticle] = useMutation(CREATE_ARTICLE, {
  onError: (error) => {
    if (error.networkError) {
      showErrorToast({
        title: 'Network Error',
        message: 'Unable to connect to server. Please check your connection.',
        action: {
          label: 'Retry',
          onClick: () => createArticle({ variables: input }),
        },
      });
    }
  },
});
```

**Client Handling**:
- Show retry button
- Cache failed request for retry
- Show offline indicator
- Queue operations for when online

**Requirements**: 13.7

---

#### 7. Server Errors (500 Internal Server Error)

**Scenario**: Unexpected server error

**Handler**:
```typescript
async create(input: CreateArticleInput): Promise<Article> {
  try {
    // Business logic
  } catch (error) {
    this.logger.error('Failed to create article', error.stack);
    throw new InternalServerErrorException('An unexpected error occurred. Please try again later.');
  }
}
```

**Error Response**:
```json
{
  "statusCode": 500,
  "message": "An unexpected error occurred. Please try again later.",
  "error": "Internal Server Error"
}
```

**Client Handling**:
- Show generic error message
- Log error to monitoring service (Sentry)
- Provide support contact
- Don't expose technical details to user

**Requirements**: 13.8, 10.10

---

### Error Logging Strategy

**Client-Side**:
```typescript
// Log to console in development
if (process.env.NODE_ENV === 'development') {
  console.error('Error:', error);
}

// Send to monitoring service in production
if (process.env.NODE_ENV === 'production') {
  Sentry.captureException(error, {
    tags: {
      component: 'ArticleEditor',
      action: 'create',
    },
    user: {
      id: user.id,
      email: user.email,
    },
  });
}
```

**Server-Side**:
```typescript
// NestJS Logger
this.logger.error(
  `Failed to create article: ${input.slug}`,
  error.stack,
  {
    userId: authorId,
    input: sanitizeForLogging(input),
    timestamp: new Date().toISOString(),
  }
);
```

**Requirements**: 1.5, 9.13, 13.8



## Testing Strategy

### Dual Testing Approach

Hệ thống sử dụng combination của unit tests và property-based tests để đảm bảo comprehensive coverage:

**Unit Tests**: Verify specific examples, edge cases, và error conditions
**Property Tests**: Verify universal properties across all inputs

Cả hai approaches đều necessary và complementary. Unit tests catch concrete bugs, property tests verify general correctness.

---

### Property-Based Testing Configuration

**Library**: fast-check (JavaScript/TypeScript property-based testing library)

**Configuration**:
```typescript
// jest.config.js
module.exports = {
  testMatch: ['**/*.properties.spec.ts'],
  testTimeout: 30000, // Property tests may take longer
};

// Property test configuration
const FC_CONFIG = {
  numRuns: 100, // Minimum 100 iterations per property
  verbose: true,
  seed: Date.now(), // Random seed for reproducibility
};
```

**Test Tagging Format**:
```typescript
/**
 * Feature: node-management-system
 * Property 1: Slug Uniqueness Across All Nodes
 * 
 * For any node (Article hoặc Roadmap), khi tạo node mới với slug S,
 * nếu đã tồn tại node khác với slug S, thì hệ thống phải reject creation
 * và return error message cụ thể.
 */
describe('Property 1: Slug Uniqueness', () => {
  it('should reject duplicate slugs across all node types', () => {
    fc.assert(
      fc.asyncProperty(
        fc.record({
          slug: fc.string({ minLength: 1, maxLength: 50 }),
          title: fc.string({ minLength: 1, maxLength: 200 }),
          content: fc.string({ minLength: 1 }),
        }),
        async (nodeData) => {
          // Create first node
          await createNode(nodeData);
          
          // Attempt to create duplicate
          await expect(createNode(nodeData)).rejects.toThrow(/already exists/);
        }
      ),
      FC_CONFIG
    );
  });
});
```

---

### Unit Testing Strategy

#### Frontend Unit Tests

**Location**: `apps/web/src/**/__tests__/*.test.tsx`

**Framework**: Jest + React Testing Library

**Coverage Areas**:
- Component rendering
- User interactions (click, drag, type)
- Form validation
- State management
- Error handling
- Accessibility (ARIA, keyboard navigation)

**Example**:
```typescript
// NodeSwitch.test.tsx
describe('NodeSwitch Component', () => {
  it('should render both Article and Roadmap options', () => {
    render(<NodeSwitch value="article" onChange={jest.fn()} />);
    expect(screen.getByText('Article')).toBeInTheDocument();
    expect(screen.getByText('Roadmap')).toBeInTheDocument();
  });

  it('should call onChange when option is selected', () => {
    const onChange = jest.fn();
    render(<NodeSwitch value="article" onChange={onChange} />);
    
    fireEvent.click(screen.getByText('Roadmap'));
    expect(onChange).toHaveBeenCalledWith('roadmap');
  });

  it('should be keyboard accessible', () => {
    const onChange = jest.fn();
    render(<NodeSwitch value="article" onChange={onChange} />);
    
    const roadmapOption = screen.getByText('Roadmap');
    roadmapOption.focus();
    fireEvent.keyDown(roadmapOption, { key: 'Enter' });
    
    expect(onChange).toHaveBeenCalledWith('roadmap');
  });
});
```

---

#### Backend Unit Tests

**Location**: `apps/api/src/modules/**/__tests__/unit/*.spec.ts`

**Framework**: Jest + NestJS Testing

**Coverage Areas**:
- Service methods
- Resolver methods
- Validation logic
- Error handling
- Authorization checks

**Example**:
```typescript
// article.service.spec.ts
describe('ArticleService', () => {
  let service: ArticleService;
  let convexService: ConvexService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ArticleService,
        {
          provide: ConvexService,
          useValue: {
            query: jest.fn(),
            mutation: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ArticleService>(ArticleService);
    convexService = module.get<ConvexService>(ConvexService);
  });

  describe('create', () => {
    it('should create article with valid input', async () => {
      const input: CreateArticleInput = {
        slug: 'test-article',
        title: 'Test Article',
        content: 'Content',
        tags: ['test'],
        isPublished: false,
      };

      jest.spyOn(convexService, 'query').mockResolvedValue(null); // No existing
      jest.spyOn(convexService, 'mutation').mockResolvedValue('article-id');

      const result = await service.create(input, 'user-123');

      expect(result).toBeDefined();
      expect(result.slug).toBe('test-article');
    });

    it('should throw ConflictException for duplicate slug', async () => {
      const input: CreateArticleInput = {
        slug: 'existing-article',
        title: 'Test',
        content: 'Content',
        tags: [],
        isPublished: false,
      };

      jest.spyOn(convexService, 'query').mockResolvedValue({ slug: 'existing-article' });

      await expect(service.create(input, 'user-123')).rejects.toThrow(ConflictException);
    });
  });
});
```

---

### Property-Based Tests

**Location**: `apps/api/src/modules/**/__tests__/properties/*.properties.spec.ts`

**Framework**: Jest + fast-check

**Test Files**:
- `slug-uniqueness.properties.spec.ts` - Property 1
- `round-trip.properties.spec.ts` - Property 2, 7
- `authorization.properties.spec.ts` - Property 4
- `validation.properties.spec.ts` - Property 5
- `referential-integrity.properties.spec.ts` - Property 6
- `navigation.properties.spec.ts` - Property 9
- `sanitization.properties.spec.ts` - Property 10
- `metadata.properties.spec.ts` - Property 11, 12
- `soft-delete.properties.spec.ts` - Property 13
- `search.properties.spec.ts` - Property 14
- `error-recovery.properties.spec.ts` - Property 15

**Example**:
```typescript
// round-trip.properties.spec.ts
/**
 * Feature: node-management-system
 * Property 2: Node Creation Round-Trip Preservation
 */
describe('Property 2: Round-Trip Preservation', () => {
  it('should preserve article data through create-fetch cycle', () => {
    fc.assert(
      fc.asyncProperty(
        fc.record({
          slug: fc.stringMatching(/^[a-z0-9-]+$/),
          title: fc.string({ minLength: 1, maxLength: 200 }),
          content: fc.string({ minLength: 1 }),
          tags: fc.array(fc.string()),
          isPublished: fc.boolean(),
        }),
        async (articleData) => {
          // Create article
          const created = await articleService.create(articleData, 'user-123');
          
          // Fetch article
          const fetched = await articleService.findBySlug(articleData.slug);
          
          // Verify equivalence (excluding auto-generated fields)
          expect(fetched.slug).toBe(articleData.slug);
          expect(fetched.title).toBe(articleData.title);
          expect(fetched.content).toBe(articleData.content);
          expect(fetched.tags).toEqual(articleData.tags);
          expect(fetched.isPublished).toBe(articleData.isPublished);
        }
      ),
      FC_CONFIG
    );
  });
});
```

---

### Integration Tests

**Location**: `apps/api/src/modules/**/__tests__/integration/*.integration.spec.ts`

**Coverage Areas**:
- End-to-end GraphQL operations
- Database interactions
- Authentication flow
- Authorization flow

**Example**:
```typescript
// article-crud.integration.spec.ts
describe('Article CRUD Integration', () => {
  let app: INestApplication;
  let adminToken: string;
  let userToken: string;

  beforeAll(async () => {
    // Setup test app
    app = await setupTestApp();
    adminToken = await getAdminToken();
    userToken = await getUserToken();
  });

  it('should allow admin to create article', async () => {
    const mutation = `
      mutation CreateArticle($input: CreateArticleInput!) {
        createArticle(input: $input) {
          id
          slug
          title
        }
      }
    `;

    const response = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        query: mutation,
        variables: {
          input: {
            slug: 'test-article',
            title: 'Test Article',
            content: 'Content',
            tags: [],
            isPublished: false,
          },
        },
      });

    expect(response.status).toBe(200);
    expect(response.body.data.createArticle).toBeDefined();
  });

  it('should reject non-admin user from creating article', async () => {
    const mutation = `...`; // Same mutation

    const response = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ query: mutation, variables: { input: {...} } });

    expect(response.status).toBe(200);
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain('Forbidden');
  });
});
```

---

### E2E Tests

**Location**: `apps/web/e2e/**/*.spec.ts`

**Framework**: Playwright

**Coverage Areas**:
- Critical user flows
- Cross-browser compatibility
- Mobile responsiveness
- Accessibility

**Example**:
```typescript
// create-article.e2e.spec.ts
test.describe('Create Article Flow', () => {
  test('admin can create and view article', async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await loginAsAdmin(page);

    // Navigate to create page
    await page.goto('/admin/nodes/create');
    
    // Select Article type
    await page.click('text=Article');
    
    // Fill in content
    await page.fill('[name="title"]', 'My Test Article');
    await page.fill('[role="textbox"]', 'This is the content');
    
    // Save
    await page.click('text=Save');
    
    // Verify redirect
    await page.waitForURL('/article/my-test-article');
    
    // Verify content displayed
    await expect(page.locator('h1')).toHaveText('My Test Article');
    await expect(page.locator('article')).toContainText('This is the content');
  });
});
```

---

### Test Coverage Goals

**Minimum Coverage**:
- Unit tests: 80%
- Integration tests: 60%
- E2E tests: Critical paths only

**Priority Areas** (aim for 90%+ coverage):
- Validation logic
- Authorization logic
- Data persistence
- Error handling
- Security features



## Security Considerations

### Authentication

**Clerk Integration**:
- JWT-based authentication
- Token verification trong ClerkAuthGuard
- User metadata extraction từ JWT claims
- Session management với Clerk SDK

**Implementation**:
```typescript
// ClerkAuthGuard
export class ClerkAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);
    
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }
    
    try {
      const session = await clerkClient.verifyToken(token);
      request.user = {
        id: session.sub,
        email: session.email,
        role: session.publicMetadata.role || 'user',
      };
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
```

**Requirements**: 1.1, 9.10



### Authorization

**Role-Based Access Control (RBAC)**:
- Roles: `guest`, `user`, `admin`
- Admin-only operations: create, update, delete nodes
- Public operations: view published nodes
- User operations: view own drafts (future)

**Implementation**:
```typescript
// RolesGuard
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) return true;
    
    const user = context.switchToHttp().getRequest().user;
    if (!user) return false;
    
    return requiredRoles.includes(user.role);
  }
}

// Usage
@Mutation(() => Article)
@Roles('admin')
async createArticle(@Args('input') input: CreateArticleInput) {
  // Only admins can access
}
```

**Requirements**: 1.4, 9.11



### Input Sanitization

**XSS Prevention**:
- Sanitize all user inputs
- Use DOMPurify cho HTML content
- Escape special characters
- Validate URLs

**Implementation**:
```typescript
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'code', 'pre', 'blockquote', 'a', 'img'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class'],
    ALLOW_DATA_ATTR: false,
  });
}

// Usage in editor
const sanitizedContent = sanitizeHTML(editorContent);
await createArticle({ ...input, content: sanitizedContent });
```

**Requirements**: 13.10



### Rate Limiting

**API Protection**:
- Rate limit GraphQL mutations
- Prevent brute force attacks
- Throttle expensive operations

**Implementation**:
```typescript
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

// Module configuration
ThrottlerModule.forRoot({
  ttl: 60, // Time window in seconds
  limit: 10, // Max requests per window
}),

// Apply to mutations
@UseGuards(ThrottlerGuard)
@Mutation(() => Article)
async createArticle() {
  // Rate limited to 10 requests per minute
}
```

### CORS Configuration

**Cross-Origin Requests**:
```typescript
// main.ts
app.enableCors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```



## Performance Optimizations

### Frontend Optimizations

#### 1. Code Splitting

**Route-based splitting**:
```typescript
// app/admin/nodes/create/page.tsx
import dynamic from 'next/dynamic';

const ContentEditor = dynamic(() => import('@/components/editor/ContentEditor'), {
  loading: () => <EditorSkeleton />,
  ssr: false, // Client-side only
});

const RoadmapVisualization = dynamic(() => import('@/components/roadmap/RoadmapVisualization'), {
  loading: () => <VisualizationSkeleton />,
  ssr: false,
});
```

**Requirements**: 14.1, 14.5

---

#### 2. Image Optimization

**Next.js Image Component**:
```typescript
import Image from 'next/image';

<Image
  src={article.coverImage}
  alt={article.title}
  width={800}
  height={400}
  loading="lazy"
  placeholder="blur"
  blurDataURL={article.coverImageBlur}
/>
```

**Requirements**: 14.4, 8.6

---

#### 3. GraphQL Caching

**Apollo Client Configuration**:
```typescript
const apolloClient = new ApolloClient({
  uri: process.env.NEXT_PUBLIC_API_URL,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          articles: {
            merge(existing, incoming) {
              return incoming;
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});
```

**Requirements**: 14.3



#### 4. Virtualization

**React Flow Virtualization**:
```typescript
import { ReactFlow } from '@xyflow/react';

<ReactFlow
  nodes={nodes}
  edges={edges}
  // Enable virtualization for 50+ nodes
  nodesDraggable={nodes.length < 50}
  elementsSelectable={nodes.length < 50}
  // Optimize rendering
  onlyRenderVisibleElements={nodes.length > 50}
/>
```

**Requirements**: 14.8

---

#### 5. Debouncing

**Auto-save Debouncing**:
```typescript
import { useDebouncedCallback } from 'use-debounce';

const debouncedSave = useDebouncedCallback(
  (content: string) => {
    saveArticleDraft(content);
  },
  30000 // 30 seconds
);

// Usage
const handleContentChange = (content: string) => {
  setContent(content);
  debouncedSave(content);
};
```

**Search Debouncing**:
```typescript
const debouncedSearch = useDebouncedCallback(
  (query: string) => {
    searchNodes(query);
  },
  300 // 300ms
);
```

**Requirements**: 2.4, 12.9, 14.9

---

#### 6. Prefetching

**Link Prefetching**:
```typescript
import Link from 'next/link';

<Link 
  href={`/article/${article.slug}`}
  prefetch={true} // Prefetch on hover
>
  {article.title}
</Link>
```

**Requirements**: 14.7



### Backend Optimizations

#### 1. Database Indexing

**Convex Indexes**:
```typescript
// Optimized queries with indexes
articles: defineTable({...})
  .index("by_slug", ["slug"]) // O(log n) lookup
  .index("by_author", ["author"]) // Filter by author
  .index("by_published", ["isPublished", "publishedAt"]) // Compound index
  .index("by_tags", ["tags"]) // Array index for filtering
```

**Requirements**: 10.6

---

#### 2. Query Optimization

**Selective Field Fetching**:
```typescript
// Only fetch needed fields
const articles = await ctx.db
  .query("articles")
  .withIndex("by_published", (q) => q.eq("isPublished", true))
  .collect();

// Don't fetch large content field for list views
const articlePreviews = articles.map(a => ({
  id: a._id,
  slug: a.slug,
  title: a.title,
  description: a.description,
  // Omit content field
}));
```

---

#### 3. Response Caching

**HTTP Caching Headers**:
```typescript
// NestJS interceptor
@Injectable()
export class CacheInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse();
    
    // Cache public queries for 5 minutes
    if (isPublicQuery(context)) {
      response.setHeader('Cache-Control', 'public, max-age=300');
    }
    
    return next.handle();
  }
}
```

---

#### 4. Timeout Configuration

**API Timeouts**:
```typescript
// Apollo Client
const apolloClient = new ApolloClient({
  link: new HttpLink({
    uri: API_URL,
    fetch: (uri, options) => {
      return fetch(uri, {
        ...options,
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });
    },
  }),
});
```

**Requirements**: 14.10



## Accessibility

### WCAG 2.1 AA Compliance

#### 1. Keyboard Navigation

**Implementation**:
```typescript
// All interactive elements keyboard accessible
<button
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
  tabIndex={0}
>
  Create Node
</button>

// Skip to content link
<a href="#main-content" className="skip-link">
  Skip to main content
</a>
```

**Requirements**: 15.1, 15.8

---

#### 2. ARIA Labels

**Implementation**:
```typescript
// Screen reader support
<div
  role="region"
  aria-label="Roadmap Visualization"
  aria-describedby="roadmap-instructions"
>
  <ReactFlow nodes={nodes} edges={edges} />
</div>

<div id="roadmap-instructions" className="sr-only">
  Interactive roadmap. Use arrow keys to navigate between nodes.
  Press Enter to open a node.
</div>

// Form labels
<label htmlFor="article-title">
  Article Title
  <input
    id="article-title"
    name="title"
    aria-required="true"
    aria-invalid={errors.title ? 'true' : 'false'}
    aria-describedby={errors.title ? 'title-error' : undefined}
  />
</label>
{errors.title && (
  <span id="title-error" role="alert">
    {errors.title}
  </span>
)}
```

**Requirements**: 15.2, 15.9, 15.10



#### 3. Focus Management

**Implementation**:
```typescript
// Focus trap in modals
import { FocusTrap } from '@headlessui/react';

<FocusTrap>
  <Dialog>
    <DialogTitle>Create Node</DialogTitle>
    <DialogContent>...</DialogContent>
  </Dialog>
</FocusTrap>

// Focus management on navigation
useEffect(() => {
  // Focus main heading after navigation
  const heading = document.querySelector('h1');
  heading?.focus();
}, [pathname]);
```

**Requirements**: 15.3

---

#### 4. Color Contrast

**Design Tokens**:
```css
/* Tailwind config - WCAG AA compliant colors */
:root {
  --color-text-primary: #1a1a1a; /* Contrast ratio: 16:1 */
  --color-text-secondary: #4a4a4a; /* Contrast ratio: 9:1 */
  --color-bg-primary: #ffffff;
  --color-accent: #0066cc; /* Contrast ratio: 4.5:1 */
}
```

**Requirements**: 15.4

---

#### 5. Responsive Design

**Breakpoints**:
```typescript
// Tailwind breakpoints
const breakpoints = {
  sm: '640px',  // Mobile
  md: '768px',  // Tablet
  lg: '1024px', // Desktop
  xl: '1280px', // Large desktop
};

// Responsive layout
<div className="
  flex flex-col md:flex-row
  gap-4 md:gap-6
  p-4 md:p-6 lg:p-8
">
  <div className="w-full md:w-2/5">Form</div>
  <div className="w-full md:w-3/5">Visualization</div>
</div>
```

**Requirements**: 15.5, 15.6, 3.7

---

#### 6. Touch Support

**Implementation**:
```typescript
// Touch-friendly drag and drop
import { useDrag } from 'react-dnd-touch-backend';

// Larger touch targets (min 44x44px)
<button className="min-h-[44px] min-w-[44px] p-3">
  Create
</button>

// Touch gestures for roadmap
<ReactFlow
  nodes={nodes}
  edges={edges}
  // Enable touch gestures
  panOnDrag={[1, 2]} // Left and right mouse buttons + touch
  zoomOnPinch={true}
  zoomOnScroll={true}
/>
```

**Requirements**: 15.7



## Implementation Phases

### Phase 1: Foundation (Week 1-2)

**Backend Setup**:
- [ ] Create Article module structure
- [ ] Define Article GraphQL schema
- [ ] Implement Article Convex schema
- [ ] Create Article resolver với authentication guards
- [ ] Implement Article service với CRUD operations
- [ ] Add Zod validation schemas
- [ ] Write unit tests cho Article service

**Frontend Setup**:
- [ ] Create NodeSwitch component
- [ ] Setup routing cho /admin/nodes/create
- [ ] Implement authentication middleware
- [ ] Create basic layout components

**Deliverables**:
- Working Article CRUD API
- Admin authentication flow
- Basic UI structure

---

### Phase 2: Article Editor (Week 3-4)

**Editor Implementation**:
- [ ] Integrate Tiptap/Novel editor
- [ ] Implement rich text formatting
- [ ] Add block types (heading, list, code, quote, image)
- [ ] Implement auto-save functionality
- [ ] Add validation và error handling
- [ ] Create Article view page
- [ ] Implement responsive layout

**Testing**:
- [ ] Unit tests cho editor components
- [ ] Integration tests cho Article CRUD
- [ ] E2E tests cho create flow

**Deliverables**:
- Fully functional Article editor
- Article view pages
- Comprehensive tests

---

### Phase 3: Roadmap Builder (Week 5-7)

**Roadmap Backend**:
- [ ] Extend Roadmap schema với structure fields
- [ ] Implement structure validation
- [ ] Add referential integrity checks
- [ ] Update Roadmap service

**Roadmap Frontend**:
- [ ] Integrate React Flow
- [ ] Implement RoadmapVisualization component
- [ ] Create NodeSidebar với draggable items
- [ ] Implement drag-and-drop functionality
- [ ] Add auto-connection logic
- [ ] Create split-screen layout
- [ ] Implement form synchronization

**Testing**:
- [ ] Unit tests cho roadmap components
- [ ] Property tests cho drag-and-drop
- [ ] Integration tests cho roadmap CRUD

**Deliverables**:
- Interactive roadmap builder
- Drag-and-drop functionality
- Roadmap view pages

---

### Phase 4: Navigation & Search (Week 8-9)

**Navigation**:
- [ ] Implement node click handlers
- [ ] Add hover tooltips
- [ ] Implement loading states
- [ ] Add breadcrumb navigation

**Search**:
- [ ] Create Search module
- [ ] Implement full-text search
- [ ] Add filter functionality
- [ ] Implement sort options
- [ ] Create search UI

**Testing**:
- [ ] Unit tests cho search logic
- [ ] Property tests cho search relevance
- [ ] E2E tests cho navigation flow

**Deliverables**:
- Working navigation between nodes
- Search và filter functionality

---

### Phase 5: Polish & Optimization (Week 10-11)

**Performance**:
- [ ] Implement code splitting
- [ ] Add image optimization
- [ ] Configure caching
- [ ] Add virtualization cho large roadmaps
- [ ] Implement debouncing
- [ ] Add prefetching

**Accessibility**:
- [ ] Audit keyboard navigation
- [ ] Add ARIA labels
- [ ] Implement focus management
- [ ] Verify color contrast
- [ ] Test với screen readers

**Security**:
- [ ] Implement input sanitization
- [ ] Add rate limiting
- [ ] Security audit
- [ ] Penetration testing

**Testing**:
- [ ] Property-based tests cho all properties
- [ ] Performance testing
- [ ] Accessibility testing
- [ ] Security testing

**Deliverables**:
- Optimized performance
- WCAG AA compliance
- Security hardening
- Complete test coverage

---

### Phase 6: Documentation & Deployment (Week 12)

**Documentation**:
- [ ] API documentation
- [ ] Component documentation
- [ ] User guide
- [ ] Admin guide
- [ ] Deployment guide

**Deployment**:
- [ ] Production deployment
- [ ] Monitoring setup
- [ ] Error tracking
- [ ] Analytics setup
- [ ] Backup strategy

**Deliverables**:
- Complete documentation
- Production-ready system
- Monitoring và alerting



## Risks and Mitigations

### Technical Risks

#### Risk 1: Editor Performance với Large Documents

**Impact**: High  
**Probability**: Medium

**Description**: Tiptap editor có thể lag với documents > 10,000 words.

**Mitigation**:
- Implement virtual scrolling cho editor
- Lazy load blocks outside viewport
- Optimize re-render với React.memo
- Consider pagination cho very large documents
- Set reasonable content length limits

---

#### Risk 2: React Flow Performance với Large Roadmaps

**Impact**: High  
**Probability**: Medium

**Description**: Roadmaps với 100+ nodes có thể slow down visualization.

**Mitigation**:
- Enable virtualization cho 50+ nodes
- Implement level-of-detail rendering
- Optimize edge rendering
- Add loading states
- Consider pagination hoặc filtering

---

#### Risk 3: Slug Collision Edge Cases

**Impact**: Medium  
**Probability**: Low

**Description**: Automatic slug generation có thể fail với unusual characters.

**Mitigation**:
- Comprehensive slug validation
- Fallback slug generation strategies
- Allow manual slug override
- Clear error messages
- Property-based tests cho edge cases

---

### Security Risks

#### Risk 4: XSS Attacks via Rich Text Content

**Impact**: Critical  
**Probability**: Medium

**Description**: User-generated HTML content có thể contain malicious scripts.

**Mitigation**:
- Strict input sanitization với DOMPurify
- Content Security Policy headers
- Regular security audits
- Property-based tests với XSS payloads
- Escape all user content on render

---

#### Risk 5: Authorization Bypass

**Impact**: Critical  
**Probability**: Low

**Description**: Bugs trong guards có thể allow unauthorized access.

**Mitigation**:
- Comprehensive authorization tests
- Defense in depth (multiple layers)
- Regular security reviews
- Audit logging
- Property-based tests cho authorization

---

### Operational Risks

#### Risk 6: Data Loss During Auto-Save

**Impact**: High  
**Probability**: Low

**Description**: Network issues có thể cause draft loss.

**Mitigation**:
- Local storage backup
- Retry logic với exponential backoff
- Clear save status indicators
- Conflict resolution strategy
- User notification on save failure

---

#### Risk 7: Database Migration Issues

**Impact**: High  
**Probability**: Medium

**Description**: Schema changes có thể break existing data.

**Mitigation**:
- Comprehensive migration testing
- Backward compatibility
- Rollback strategy
- Data validation after migration
- Staging environment testing



## Monitoring and Observability

### Metrics to Track

**Performance Metrics**:
- Page load time (target: < 2s)
- API response time (target: < 500ms p95)
- Editor input latency (target: < 100ms)
- Roadmap render time (target: < 1s for 100 nodes)

**Business Metrics**:
- Nodes created per day
- Active users
- Node views
- Search queries
- Error rate

**User Experience Metrics**:
- Time to first interaction
- Auto-save success rate
- Navigation success rate
- Search result click-through rate

---

### Logging Strategy

**Frontend Logging**:
```typescript
// Development: Console
if (process.env.NODE_ENV === 'development') {
  console.log('[NodeEditor]', event, data);
}

// Production: Sentry
if (process.env.NODE_ENV === 'production') {
  Sentry.captureMessage(event, {
    level: 'info',
    tags: { component: 'NodeEditor' },
    extra: data,
  });
}
```

**Backend Logging**:
```typescript
// NestJS Logger
this.logger.log('Article created', {
  articleId: article._id,
  slug: article.slug,
  userId: authorId,
  timestamp: new Date().toISOString(),
});

this.logger.error('Failed to create article', {
  error: error.message,
  stack: error.stack,
  input: sanitizeForLogging(input),
  userId: authorId,
});
```

---

### Error Tracking

**Sentry Integration**:
```typescript
// Frontend
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  beforeSend(event) {
    // Filter sensitive data
    return sanitizeEvent(event);
  },
});

// Backend
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
  ],
});
```

---

### Alerting

**Critical Alerts** (PagerDuty/Slack):
- API error rate > 5%
- Database connection failures
- Authentication service down
- Critical security events

**Warning Alerts** (Slack):
- API response time > 1s (p95)
- High memory usage
- Failed auto-saves > 10%
- Search errors > 2%



## Future Enhancements

### Phase 2 Features (Post-MVP)

#### 1. Real-time Collaboration

**Description**: Multiple admins có thể edit cùng một node simultaneously.

**Implementation**:
- WebSocket connection với Convex
- Operational Transformation hoặc CRDT
- Presence indicators
- Conflict resolution
- Lock mechanism

**Requirements**: 11.1, 11.2, 11.3, 11.4

---

#### 2. Version History

**Description**: Track changes và allow rollback.

**Implementation**:
- Store snapshots on save
- Diff visualization
- Restore previous versions
- Compare versions side-by-side

---

#### 3. Comments and Discussions

**Description**: Allow users to comment on nodes.

**Implementation**:
- Comment threads
- Mentions (@user)
- Notifications
- Moderation tools

---

#### 4. Advanced Search

**Description**: Enhanced search với filters và facets.

**Implementation**:
- Full-text search với Algolia/Elasticsearch
- Faceted search (by author, date, tags)
- Search suggestions
- Search analytics

---

#### 5. Export/Import

**Description**: Export nodes to various formats.

**Implementation**:
- Export to Markdown
- Export to PDF
- Export to JSON
- Import from Markdown
- Bulk operations

---

#### 6. Templates

**Description**: Pre-built templates cho common use cases.

**Implementation**:
- Template library
- Custom templates
- Template variables
- Template preview

---

#### 7. Analytics Dashboard

**Description**: Detailed analytics cho admins.

**Implementation**:
- Node performance metrics
- User engagement metrics
- Search analytics
- Custom reports

---

#### 8. Multi-language Support

**Description**: Support multiple languages.

**Implementation**:
- i18n với next-intl
- Language switcher
- Translated content
- RTL support



## Appendix

### A. Technology Decisions

#### Why Tiptap/Novel for Editor?

**Pros**:
- Modern, extensible architecture
- Excellent TypeScript support
- Rich ecosystem of extensions
- Good performance
- Active development

**Alternatives Considered**:
- Slate.js: More low-level, steeper learning curve
- Draft.js: Older, less maintained
- Quill: Limited extensibility
- ProseMirror: Too low-level

**Decision**: Tiptap (or Novel which wraps Tiptap) provides best balance of features, performance, và developer experience.

---

#### Why React Flow for Roadmap Visualization?

**Pros**:
- Built for React
- Excellent performance
- Customizable nodes và edges
- Built-in controls (zoom, pan, minimap)
- Good documentation

**Alternatives Considered**:
- D3.js: Too low-level, harder to integrate với React
- Cytoscape.js: Not React-native
- vis.js: Older, less maintained
- Custom canvas solution: Too much work

**Decision**: React Flow is purpose-built cho interactive node graphs trong React.

---

#### Why Convex for Database?

**Pros**:
- Serverless, no infrastructure management
- Real-time sync capabilities
- TypeScript-first
- Built-in authentication
- Good developer experience

**Existing Choice**: Already used trong project.

---

#### Why Clerk for Authentication?

**Pros**:
- Easy integration
- Comprehensive features
- Good documentation
- Handles edge cases
- Secure by default

**Existing Choice**: Already used trong project.

---

### B. API Examples

#### Create Article

**Request**:
```graphql
mutation CreateArticle($input: CreateArticleInput!) {
  createArticle(input: $input) {
    id
    slug
    title
    content
    author
    tags
    createdAt
    updatedAt
    isPublished
  }
}
```

**Variables**:
```json
{
  "input": {
    "slug": "my-first-article",
    "title": "My First Article",
    "content": "<p>This is the content...</p>",
    "tags": ["tutorial", "beginner"],
    "isPublished": false
  }
}
```

**Response**:
```json
{
  "data": {
    "createArticle": {
      "id": "k1234567890",
      "slug": "my-first-article",
      "title": "My First Article",
      "content": "<p>This is the content...</p>",
      "author": "user_abc123",
      "tags": ["tutorial", "beginner"],
      "createdAt": 1704067200000,
      "updatedAt": 1704067200000,
      "isPublished": false
    }
  }
}
```

---

#### Create Roadmap

**Request**:
```graphql
mutation CreateRoadmap($input: CreateRoadmapInput!) {
  createRoadmap(input: $input) {
    id
    slug
    title
    description
    structure
    tags
    createdAt
    updatedAt
    isPublished
  }
}
```

**Variables**:
```json
{
  "input": {
    "slug": "frontend-roadmap",
    "title": "Frontend Development Roadmap",
    "description": "Complete guide to frontend development",
    "structure": {
      "nodes": [
        {
          "id": "node-1",
          "type": "article",
          "position": { "x": 100, "y": 100 },
          "data": {
            "slug": "html-basics",
            "title": "HTML Basics",
            "description": "Learn HTML fundamentals"
          }
        },
        {
          "id": "node-2",
          "type": "article",
          "position": { "x": 300, "y": 100 },
          "data": {
            "slug": "css-basics",
            "title": "CSS Basics",
            "description": "Learn CSS fundamentals"
          }
        }
      ],
      "edges": [
        {
          "id": "edge-1",
          "source": "node-1",
          "target": "node-2",
          "type": "smoothstep"
        }
      ]
    },
    "tags": ["frontend", "web-development"],
    "isPublished": true
  }
}
```

---

### C. Database Queries

#### Convex Query Examples

**Get Article by Slug**:
```typescript
// convex/articles.ts
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return await ctx.db
      .query("articles")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
  },
});
```

**List Published Articles**:
```typescript
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("articles")
      .withIndex("by_published", (q) => q.eq("isPublished", true))
      .order("desc")
      .collect();
  },
});
```

**Search Articles**:
```typescript
export const search = query({
  args: { query: v.string() },
  handler: async (ctx, { query }) => {
    const articles = await ctx.db
      .query("articles")
      .withIndex("by_published", (q) => q.eq("isPublished", true))
      .collect();
    
    // Simple text search (can be enhanced with full-text search)
    return articles.filter(article => 
      article.title.toLowerCase().includes(query.toLowerCase()) ||
      article.content.toLowerCase().includes(query.toLowerCase())
    );
  },
});
```

---

### D. Glossary

**Terms**:
- **Node**: Base unit of content (Article hoặc Roadmap)
- **Slug**: URL-friendly identifier (e.g., "my-article")
- **CRUD**: Create, Read, Update, Delete operations
- **SSR**: Server-Side Rendering
- **CSR**: Client-Side Rendering
- **PBT**: Property-Based Testing
- **RBAC**: Role-Based Access Control
- **XSS**: Cross-Site Scripting
- **WCAG**: Web Content Accessibility Guidelines
- **ARIA**: Accessible Rich Internet Applications

---

## Conclusion

Design document này provides comprehensive technical specifications cho Node Management System. Implementation sẽ follow phased approach với focus on:

1. **Type Safety**: End-to-end TypeScript với Zod validation
2. **Security**: Authentication, authorization, input sanitization
3. **Performance**: Code splitting, caching, virtualization
4. **Accessibility**: WCAG 2.1 AA compliance
5. **Testing**: Dual approach với unit tests và property-based tests
6. **Maintainability**: Clean architecture, comprehensive documentation

Next steps: Review design với stakeholders, then proceed với Phase 1 implementation.

