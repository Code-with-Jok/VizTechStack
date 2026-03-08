# Features

This section documents the core features of VizTechStack and their implementation details.

## Overview

VizTechStack provides an interactive learning platform with the following core features:

1. **Roadmap Management** - Create, view, and manage learning roadmaps
2. **Topic Management** - Manage topic content and resources
3. **Progress Tracking** - Track user learning progress
4. **Bookmark System** - Save and organize favorite roadmaps
5. **Authentication & Authorization** - User management and role-based access

## Contents

- [Roadmap Feature](./roadmap.md) - Roadmap architecture and implementation
- [Roadmap Implementation Guide](./roadmap-implementation.md) - Detailed implementation guide
- [Topic Feature](./topic.md) - Topic management
- [Progress Tracking](./progress.md) - Progress tracking system
- [Bookmark Feature](./bookmark.md) - Bookmark functionality
- [Authentication](./authentication.md) - Auth and authorization

## Feature Overview

### Roadmap Feature

**Purpose**: Manage learning roadmaps with graph-based visualization

**Key Capabilities**:
- Create/update/delete roadmaps (Admin only)
- View roadmaps with interactive graph
- Filter by category and difficulty
- Public/draft/private status management

**Tech Stack**:
- Backend: NestJS module with hexagonal architecture
- Frontend: React Flow for graph visualization
- Database: Convex for real-time sync

### Topic Feature

**Purpose**: Manage topic content and learning resources

**Key Capabilities**:
- Create/update/delete topics (Admin only)
- View topic details with markdown content
- Manage learning resources (links, videos, articles)
- Associate topics with roadmap nodes

**Tech Stack**:
- Backend: NestJS topic module
- Frontend: Markdown renderer for content
- Database: Convex topics table

### Progress Tracking

**Purpose**: Track user learning progress across roadmaps

**Key Capabilities**:
- Mark topics as not-started/in-progress/completed
- View progress statistics
- Track completion history
- Progress visualization on roadmap graph

**Tech Stack**:
- Backend: NestJS progress module
- Frontend: Progress indicators on nodes
- Database: Convex progress table

### Bookmark Feature

**Purpose**: Allow users to save favorite roadmaps

**Key Capabilities**:
- Add/remove bookmarks
- View bookmarked roadmaps
- Quick access to saved content

**Tech Stack**:
- Backend: NestJS bookmark module
- Frontend: Bookmark button component
- Database: Convex bookmarks table

### Authentication & Authorization

**Purpose**: Secure user management and role-based access control

**Key Capabilities**:
- User authentication via Clerk
- Role-based access (User/Admin)
- JWT token validation
- Protected routes and endpoints

**Tech Stack**:
- Auth Provider: Clerk
- Backend: JWT validation with @clerk/backend
- Frontend: Clerk React components

## User Roles

### User Role

**Permissions**:
- ✅ View public roadmaps
- ✅ Track progress
- ✅ Bookmark roadmaps
- ✅ View topics and resources
- ❌ Create/edit/delete content

**Use Cases**:
- Browse learning roadmaps
- Track learning progress
- Save favorite roadmaps
- Access learning resources

### Admin Role

**Permissions**:
- ✅ All User permissions
- ✅ Create roadmaps
- ✅ Edit roadmaps
- ✅ Delete roadmaps
- ✅ Manage topics
- ✅ Publish/unpublish content

**Use Cases**:
- Create new learning paths
- Update existing content
- Manage roadmap visibility
- Curate learning resources

## Data Models

### Roadmap

```typescript
interface Roadmap {
  id: string
  title: string
  slug: string
  description: string
  category: 'role' | 'skill' | 'best-practice'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  status: 'public' | 'draft' | 'private'
  nodes: Node[]
  edges: Edge[]
  createdAt: Date
  updatedAt: Date
}
```

### Topic

```typescript
interface Topic {
  id: string
  nodeId: string
  roadmapId: string
  title: string
  description: string
  content: string  // Markdown
  resources: Resource[]
  createdAt: Date
  updatedAt: Date
}
```

### Progress

```typescript
interface Progress {
  id: string
  userId: string
  nodeId: string
  roadmapId: string
  status: 'not-started' | 'in-progress' | 'completed'
  completedAt?: Date
  updatedAt: Date
}
```

### Bookmark

```typescript
interface Bookmark {
  id: string
  userId: string
  roadmapId: string
  createdAt: Date
}
```

## API Endpoints

### GraphQL Queries

```graphql
# Roadmaps
query GetRoadmaps($filters: RoadmapFilters)
query GetRoadmapBySlug($slug: String!)

# Topics
query GetTopicByNodeId($nodeId: ID!)
query GetTopicsByRoadmap($roadmapId: ID!)

# Progress
query GetUserProgress($userId: ID!)
query GetProgressByRoadmap($userId: ID!, $roadmapId: ID!)

# Bookmarks
query GetUserBookmarks($userId: ID!)
```

### GraphQL Mutations

```graphql
# Roadmaps (Admin only)
mutation CreateRoadmap($input: CreateRoadmapInput!)
mutation UpdateRoadmap($id: ID!, $input: UpdateRoadmapInput!)
mutation DeleteRoadmap($id: ID!)

# Topics (Admin only)
mutation CreateTopic($input: CreateTopicInput!)
mutation UpdateTopic($id: ID!, $input: UpdateTopicInput!)
mutation DeleteTopic($id: ID!)

# Progress
mutation UpdateProgress($nodeId: ID!, $status: ProgressStatus!)

# Bookmarks
mutation AddBookmark($roadmapId: ID!)
mutation RemoveBookmark($roadmapId: ID!)
```

## Feature Dependencies

```
Authentication
    ↓
Roadmap ← Topic
    ↓       ↓
Progress  Bookmark
```

- **Authentication** is required for all features
- **Topic** depends on **Roadmap** (topics belong to roadmap nodes)
- **Progress** depends on **Roadmap** (tracks progress on roadmap nodes)
- **Bookmark** depends on **Roadmap** (bookmarks reference roadmaps)

## Navigation

← [Previous: Architecture](../02-architecture/README.md)  
→ [Next: Implementation](../04-implementation/README.md)  
↑ [Documentation Index](../README.md)
