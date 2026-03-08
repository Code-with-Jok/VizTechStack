# Tổng Quan Kiến Trúc - VizTechStack

## 1. Giới Thiệu Dự Án

**VizTechStack** là một nền tảng học tập tương tác cho phép người dùng khám phá và theo dõi lộ trình học tập (roadmap) trong lĩnh vực công nghệ. Dự án được xây dựng theo mô hình **monorepo** với kiến trúc hiện đại, tách biệt rõ ràng giữa frontend, backend và các shared packages.

### Mục Tiêu Chính
- Cung cấp roadmap học tập trực quan dưới dạng đồ thị (graph)
- Theo dõi tiến độ học tập của người dùng
- Quản lý nội dung giáo dục (guides, topics)
- Hỗ trợ bookmark và personalization

## 2. Kiến Trúc Tổng Thể

### 2.1 Mô Hình Monorepo

```
viztechstack/
├── apps/                    # Ứng dụng chính
│   ├── web/                # Next.js frontend
│   └── api/                # NestJS backend
├── packages/               # Shared packages
│   ├── shared/            # Types, validation, API client
│   ├── core/              # Business logic
│   └── ui/                # UI components
├── configs/               # Shared configurations
├── tooling/               # Development tools
└── convex/                # Database & backend functions
```

**Công Nghệ Quản Lý Monorepo:**
- **pnpm workspaces**: Quản lý dependencies hiệu quả
- **Turbo**: Build orchestration và caching thông minh
- **Node.js**: >= 20.11.0

### 2.2 Kiến Trúc 3-Tier

```
┌─────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                    │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Next.js 16 + React 19 (apps/web)                │  │
│  │  - Server Components                              │  │
│  │  - Client Components với React Flow              │  │
│  │  - Clerk Authentication                           │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                     │
│  ┌──────────────────────────────────────────────────┐  │
│  │  NestJS GraphQL API (apps/api)                   │  │
│  │  - GraphQL Resolvers                             │  │
│  │  - Application Services                          │  │
│  │  - Guards & Decorators                           │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                      DATA LAYER                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Convex Database (convex/)                       │  │
│  │  - Serverless Database                           │  │
│  │  - Real-time Sync                                │  │
│  │  - Built-in Authentication                       │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## 3. Luồng Dữ Liệu (Data Flow)

### 3.1 Luồng Đọc Dữ Liệu (Read Flow)

```
User Request
    ↓
Next.js Server Component
    ↓
API Client (@viztechstack/api-client)
    ↓
GraphQL Query → NestJS API
    ↓
Application Service
    ↓
Repository Interface (Port)
    ↓
Convex Repository (Adapter)
    ↓
Convex HTTP Client
    ↓
Convex Database
    ↓
Response → Transform → Return
```

### 3.2 Luồng Ghi Dữ Liệu (Write Flow)

```
User Action (Admin)
    ↓
Next.js Client Component
    ↓
GraphQL Mutation → NestJS API
    ↓
ClerkAuthGuard (JWT Validation)
    ↓
RolesGuard (Admin Check)
    ↓
Application Service
    ↓
Domain Validation
    ↓
Repository → Convex Mutation
    ↓
Database Update
    ↓
Response
```

## 4. Các Thành Phần Chính

### 4.1 Frontend (apps/web)

**Công Nghệ:**
- Next.js 16.1.6 với App Router
- React 19.2.3 (Server & Client Components)
- TypeScript 5.7
- Tailwind CSS 4
- React Flow cho visualization

**Cấu Trúc:**
```
apps/web/src/
├── app/                    # App Router pages
│   ├── layout.tsx         # Root layout với Clerk
│   ├── page.tsx           # Homepage
│   └── roadmaps/          # Roadmap pages
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── roadmap/          # Roadmap-specific components
└── lib/                  # Utilities
    └── api-client/       # API integration
```

**Đặc Điểm:**
- Server-side rendering (SSR) cho SEO
- Static generation cho performance
- Client-side interactivity với React Flow
- Clerk authentication integration

### 4.2 Backend (apps/api)

**Công Nghệ:**
- NestJS 11.0.1
- GraphQL với Apollo Server
- TypeScript
- Jest cho testing

**Cấu Trúc Module (Domain-Driven Design):**
```
apps/api/src/modules/roadmap/
├── application/           # Use Cases
│   ├── commands/         # CreateRoadmapCommand
│   ├── queries/          # ListRoadmaps, GetBySlug
│   ├── services/         # RoadmapApplicationService
│   └── ports/            # RoadmapRepository (interface)
├── domain/               # Business Logic
│   ├── entities/         # RoadmapEntity
│   ├── errors/           # Domain Errors
│   └── policies/         # Validation Rules
├── infrastructure/       # Technical Implementation
│   └── adapters/         # ConvexRoadmapRepository
└── transport/            # API Layer
    └── graphql/          # Resolvers, Schemas, Mappers
```

**Pattern: Hexagonal Architecture (Ports & Adapters)**
- **Ports**: Interfaces định nghĩa contract
- **Adapters**: Implementation cụ thể (Convex, GraphQL)
- **Domain**: Business logic độc lập với infrastructure

### 4.3 Database (Convex)

**Convex Schema:**
```typescript
roadmaps {
  slug: string
  title: string
  description: string
  category: "role" | "skill" | "best-practice"
  difficulty: "beginner" | "intermediate" | "advanced"
  nodesJson: string  // Graph nodes
  edgesJson: string  // Graph edges
  topicCount: number
  status: "public" | "draft" | "private"
  userId?: string
  createdAt?: number
}

roadmapSummaries {
  roadmapId: Id<"roadmaps">
  slug: string
  title: string
  description: string
  category: ...
  difficulty: ...
  topicCount: number
  status: ...
  createdAt?: number
}
```

**Indexes:**
- `by_slug`: Tìm kiếm theo slug
- `by_category`: Filter theo category
- `by_status`: Filter theo status
- `by_category_status`: Composite index

**Denormalization Strategy:**
- `roadmaps`: Full data với graph JSON
- `roadmapSummaries`: Lightweight data cho listing
- Trade-off: Storage vs Query Performance

## 5. Shared Packages

### 5.1 Type Safety Layer

```
@viztechstack/types
├── roadmap.ts           # Zod schemas
├── topic.ts
└── user.ts

@viztechstack/validation
└── Zod-based validation với error handling
```

### 5.2 API Communication Layer

```
@viztechstack/graphql-schema
└── GraphQL operation definitions

@viztechstack/graphql-generated
└── Generated TypeScript types

@viztechstack/api-client
└── Type-safe GraphQL client
```

### 5.3 Configuration Layer

```
@viztechstack/env
├── server.ts            # Server-side env
└── client.ts            # Client-side env

@viztechstack/eslint-config
@viztechstack/typescript-config
@viztechstack/tailwind-config
```

## 6. Authentication & Authorization

### 6.1 Authentication Flow

```
User Login
    ↓
Clerk Authentication
    ↓
JWT Token (với role trong metadata)
    ↓
Request với Authorization Header
    ↓
ClerkAuthGuard validates JWT
    ↓
RolesGuard checks role
    ↓
Access Granted/Denied
```

### 6.2 Role-Based Access Control (RBAC)

**Roles:**
- `admin`: Full access (CRUD operations)
- `user`: Read-only access

**Implementation:**
```typescript
@UseGuards(ClerkAuthGuard, RolesGuard)
@Roles('admin')
async createRoadmap() { ... }

@Public()
async getRoadmaps() { ... }
```

## 7. Build & Deployment

### 7.1 Build System

**Turbo Tasks:**
```json
{
  "build": "Compile TypeScript, bundle assets",
  "lint": "ESLint checking",
  "typecheck": "TypeScript type checking",
  "test": "Jest unit tests",
  "dev": "Development servers"
}
```

**Caching Strategy:**
- Local cache: `.turbo/cache/`
- Remote cache: Vercel (optional)
- Cache invalidation: Based on file changes

### 7.2 Deployment Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Vercel Edge Network                │
│  ┌──────────────────┐      ┌──────────────────┐   │
│  │  Next.js Web App │      │  NestJS API      │   │
│  │  (apps/web)      │      │  (apps/api)      │   │
│  └──────────────────┘      └──────────────────┘   │
└─────────────────────────────────────────────────────┘
                    ↓                    ↓
              ┌─────────────────────────────┐
              │    Convex Cloud Database    │
              └─────────────────────────────┘
```

**Deployment Targets:**
- **Web**: Vercel (Next.js optimized)
- **API**: Vercel Serverless Functions
- **Database**: Convex Cloud (managed)

## 8. Ưu Điểm Kiến Trúc

### 8.1 Scalability
- Monorepo cho code sharing hiệu quả
- Serverless database (Convex) tự động scale
- Edge deployment với Vercel
- Cursor-based pagination cho large datasets

### 8.2 Maintainability
- Domain-Driven Design tách biệt concerns
- Type safety end-to-end (TypeScript + Zod)
- Shared packages giảm code duplication
- Clear separation: Domain → Application → Infrastructure

### 8.3 Developer Experience
- Turbo caching tăng tốc builds
- Hot reload cho development
- Type generation tự động (GraphQL)
- Conventional commits + Husky hooks

### 8.4 Security
- JWT-based authentication
- Role-based authorization
- Environment variable validation
- Input validation với Zod

## 9. Trade-offs & Decisions

### 9.1 GraphQL vs REST
**Chọn GraphQL vì:**
- Type safety với code generation
- Flexible queries (client quyết định data shape)
- Single endpoint
- Better developer experience

**Trade-off:**
- Complexity cao hơn REST
- Cần GraphQL client setup
- Caching phức tạp hơn

### 9.2 Convex vs Traditional Database
**Chọn Convex vì:**
- Serverless (no infrastructure management)
- Real-time sync built-in
- TypeScript-first
- Integrated authentication

**Trade-off:**
- Vendor lock-in
- Limited query capabilities vs SQL
- Cost scaling với usage

### 9.3 Monorepo vs Polyrepo
**Chọn Monorepo vì:**
- Atomic changes across packages
- Shared tooling & configuration
- Easier refactoring
- Single source of truth

**Trade-off:**
- Larger repository size
- Build complexity
- Requires good tooling (Turbo)

## 10. Core Features Implementation

### 10.1 Roadmap Feature (Implemented)

**Status:** ✅ Complete  
**Documentation:** `.docs/architecture/05-roadmap-feature-architecture.md`

The Roadmap feature is the core functionality providing interactive graph-based learning path visualization:

**Key Components:**
- **Backend:** NestJS modules with hexagonal architecture
  - Application services for use case orchestration
  - Domain entities and policies
  - Convex repository adapters
  - GraphQL resolvers with authentication/authorization

- **Frontend:** Next.js pages and React components
  - RoadmapList for browsing and filtering
  - RoadmapViewer with React Flow visualization
  - RoadmapEditor for admin CRUD operations
  - Progress tracking and bookmarking

- **Database:** Convex tables
  - roadmaps (full data with graph JSON)
  - roadmapSummaries (denormalized for performance)
  - topics, progress, bookmarks

**Features:**
- ✅ Browse roadmaps with category filtering
- ✅ Interactive graph visualization
- ✅ Progress tracking (done/in-progress/skipped)
- ✅ Topic content with markdown rendering
- ✅ Bookmark management
- ✅ Admin CRUD operations
- ✅ Real-time collaborative editing
- ✅ Skill node reuse across roadmaps

**Architecture Patterns:**
- Hexagonal Architecture (Ports & Adapters)
- CQRS (Command Query Responsibility Segregation)
- Domain-Driven Design
- Repository Pattern
- Dependency Injection

## 11. Kết Luận

VizTechStack được thiết kế với kiến trúc hiện đại, scalable và maintainable. Các quyết định kỹ thuật được cân nhắc kỹ lưỡng để balance giữa developer experience, performance và long-term maintainability.

**Điểm Mạnh:**
- Clean architecture với DDD
- Type safety end-to-end
- Modern tech stack
- Good separation of concerns
- Comprehensive roadmap feature implementation
- Real-time collaboration capabilities

**Điểm Cần Cải Thiện:**
- Monitoring & observability
- Error tracking (Sentry?)
- Performance monitoring
- E2E testing coverage
- Increase unit test coverage to 80%+

## 12. Related Documentation

- **Roadmap Feature:** `.docs/architecture/05-roadmap-feature-architecture.md`
- **Business Logic Flow:** `.docs/architecture/04-business-logic-flow.md`
- **Technical Stack:** `.docs/architecture/02-danh-gia-technical-stack.md`
- **Issues & Improvements:** `.docs/architecture/03-van-de-va-cai-tien.md`
- **Feature Specs:** `.kiro/specs/roadmap/`
- **Steering Rules:** `.kiro/steering/`
