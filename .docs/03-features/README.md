# Tính Năng

Phần này tài liệu hóa các tính năng cốt lõi của VizTechStack và chi tiết triển khai.

## Tổng Quan

VizTechStack cung cấp nền tảng học tập tương tác với các tính năng cốt lõi sau:

1. **Quản Lý Roadmap** - Tạo, xem và quản lý roadmap học tập
2. **Quản Lý Topic** - Quản lý nội dung topic và tài nguyên
3. **Theo Dõi Tiến Độ** - Theo dõi tiến độ học tập của người dùng
4. **Hệ Thống Bookmark** - Lưu và tổ chức roadmap yêu thích
5. **Authentication & Authorization** - Quản lý người dùng và kiểm soát truy cập dựa trên vai trò

## Nội Dung

- [Tính Năng Roadmap](./roadmap.md) - Kiến trúc và triển khai roadmap
- [Hướng Dẫn Triển Khai Roadmap](./roadmap-implementation.md) - Hướng dẫn triển khai chi tiết
- [Tính Năng Topic](./topic.md) - Quản lý topic
- [Theo Dõi Tiến Độ](./progress.md) - Hệ thống theo dõi tiến độ
- [Tính Năng Bookmark](./bookmark.md) - Chức năng bookmark
- [Authentication](./authentication.md) - Auth và authorization

## Tổng Quan Tính Năng

### Tính Năng Roadmap

**Mục Đích**: Quản lý roadmap học tập với visualization dạng graph

**Khả Năng Chính**:
- Tạo/cập nhật/xóa roadmap (Chỉ Admin)
- Xem roadmap với graph tương tác
- Lọc theo category và difficulty
- Quản lý trạng thái public/draft/private

**Tech Stack**:
- Backend: NestJS module với hexagonal architecture
- Frontend: React Flow cho graph visualization
- Database: Convex cho real-time sync

### Tính Năng Topic

**Mục Đích**: Quản lý nội dung topic và tài nguyên học tập

**Khả Năng Chính**:
- Tạo/cập nhật/xóa topic (Chỉ Admin)
- Xem chi tiết topic với nội dung markdown
- Quản lý tài nguyên học tập (links, videos, articles)
- Liên kết topic với roadmap node

**Tech Stack**:
- Backend: NestJS topic module
- Frontend: Markdown renderer cho nội dung
- Database: Convex topics table

### Theo Dõi Tiến Độ

**Mục Đích**: Theo dõi tiến độ học tập của người dùng trên các roadmap

**Khả Năng Chính**:
- Đánh dấu topic là not-started/in-progress/completed
- Xem thống kê tiến độ
- Theo dõi lịch sử hoàn thành
- Visualization tiến độ trên roadmap graph

**Tech Stack**:
- Backend: NestJS progress module
- Frontend: Progress indicators trên node
- Database: Convex progress table

### Tính Năng Bookmark

**Mục Đích**: Cho phép người dùng lưu roadmap yêu thích

**Khả Năng Chính**:
- Thêm/xóa bookmark
- Xem roadmap đã bookmark
- Truy cập nhanh vào nội dung đã lưu

**Tech Stack**:
- Backend: NestJS bookmark module
- Frontend: Bookmark button component
- Database: Convex bookmarks table

### Authentication & Authorization

**Mục Đích**: Quản lý người dùng bảo mật và kiểm soát truy cập dựa trên vai trò

**Khả Năng Chính**:
- Authentication người dùng qua Clerk
- Kiểm soát truy cập dựa trên vai trò (User/Admin)
- Xác thực JWT token
- Protected routes và endpoints

**Tech Stack**:
- Auth Provider: Clerk
- Backend: JWT validation với @clerk/backend
- Frontend: Clerk React components

## Vai Trò Người Dùng

### Vai Trò User

**Quyền**:
- ✅ Xem roadmap công khai
- ✅ Theo dõi tiến độ
- ✅ Bookmark roadmap
- ✅ Xem topic và tài nguyên
- ❌ Tạo/sửa/xóa nội dung

**Use Cases**:
- Duyệt roadmap học tập
- Theo dõi tiến độ học tập
- Lưu roadmap yêu thích
- Truy cập tài nguyên học tập

### Vai Trò Admin

**Quyền**:
- ✅ Tất cả quyền của User
- ✅ Tạo roadmap
- ✅ Sửa roadmap
- ✅ Xóa roadmap
- ✅ Quản lý topic
- ✅ Publish/unpublish nội dung

**Use Cases**:
- Tạo learning path mới
- Cập nhật nội dung hiện có
- Quản lý khả năng hiển thị roadmap
- Quản lý tài nguyên học tập

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
# Roadmaps (Chỉ Admin)
mutation CreateRoadmap($input: CreateRoadmapInput!)
mutation UpdateRoadmap($id: ID!, $input: UpdateRoadmapInput!)
mutation DeleteRoadmap($id: ID!)

# Topics (Chỉ Admin)
mutation CreateTopic($input: CreateTopicInput!)
mutation UpdateTopic($id: ID!, $input: UpdateTopicInput!)
mutation DeleteTopic($id: ID!)

# Progress
mutation UpdateProgress($nodeId: ID!, $status: ProgressStatus!)

# Bookmarks
mutation AddBookmark($roadmapId: ID!)
mutation RemoveBookmark($roadmapId: ID!)
```

## Phụ Thuộc Tính Năng

```
Authentication
    ↓
Roadmap ← Topic
    ↓       ↓
Progress  Bookmark
```

- **Authentication** là bắt buộc cho tất cả tính năng
- **Topic** phụ thuộc vào **Roadmap** (topic thuộc về roadmap node)
- **Progress** phụ thuộc vào **Roadmap** (theo dõi tiến độ trên roadmap node)
- **Bookmark** phụ thuộc vào **Roadmap** (bookmark tham chiếu đến roadmap)

## Điều Hướng

← [Trước: Kiến Trúc](../02-architecture/README.md)  
→ [Tiếp: Triển Khai](../04-implementation/README.md)  
↑ [Mục Lục Tài Liệu](../README.md)
