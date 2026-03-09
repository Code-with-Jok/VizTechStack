# VizTechStack API Documentation

## Overview

VizTechStack API là một GraphQL API được xây dựng với NestJS và Apollo Server, cung cấp các tính năng quản lý roadmap công nghệ với hệ thống phân quyền dựa trên vai trò người dùng.

## Base URL

- **Development**: `http://localhost:3001`
- **GraphQL Endpoint**: `/graphql`
- **API Documentation**: `/api` (Swagger UI)

## Authentication

API sử dụng Clerk JWT authentication. Để truy cập các protected endpoints, bạn cần include JWT token trong Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Roles

- **Guest** (Không xác thực): Chỉ đọc roadmaps đã publish
- **User** (Đã xác thực): Chỉ đọc roadmaps đã publish
- **Admin** (Đã xác thực): Toàn quyền CRUD trên roadmaps

## GraphQL Schema

### Types

#### Roadmap

```graphql
type Roadmap {
  id: ID!
  slug: String!
  title: String!
  description: String!
  content: String!
  author: String!
  tags: [String!]!
  publishedAt: Float!
  updatedAt: Float!
  isPublished: Boolean!
}
```

#### CreateRoadmapInput

```graphql
input CreateRoadmapInput {
  slug: String!
  title: String!
  description: String!
  content: String!
  tags: [String!]!
  isPublished: Boolean!
}
```

#### UpdateRoadmapInput

```graphql
input UpdateRoadmapInput {
  id: String!
  slug: String
  title: String
  description: String
  content: String
  tags: [String!]
  isPublished: Boolean
}
```

## Queries

### 1. Get All Roadmaps

Lấy danh sách tất cả roadmaps đã publish.

**Access**: Public (không cần authentication)

```graphql
query {
  roadmaps {
    id
    slug
    title
    description
    content
    author
    tags
    publishedAt
    updatedAt
    isPublished
  }
}
```

**Response**:

```json
{
  "data": {
    "roadmaps": [
      {
        "id": "roadmap_123",
        "slug": "frontend-developer",
        "title": "Frontend Developer Roadmap",
        "description": "Complete guide to becoming a frontend developer",
        "content": "# Frontend Developer Roadmap\n\n...",
        "author": "user_456",
        "tags": ["frontend", "javascript", "react"],
        "publishedAt": 1704067200000,
        "updatedAt": 1704067200000,
        "isPublished": true
      }
    ]
  }
}
```

### 2. Get Roadmap by Slug

Lấy thông tin chi tiết của một roadmap theo slug.

**Access**: Public (không cần authentication)

```graphql
query GetRoadmap($slug: String!) {
  roadmap(slug: $slug) {
    id
    slug
    title
    description
    content
    author
    tags
    publishedAt
    updatedAt
    isPublished
  }
}
```

**Variables**:

```json
{
  "slug": "frontend-developer"
}
```

**Response**:

```json
{
  "data": {
    "roadmap": {
      "id": "roadmap_123",
      "slug": "frontend-developer",
      "title": "Frontend Developer Roadmap",
      "description": "Complete guide to becoming a frontend developer",
      "content": "# Frontend Developer Roadmap\n\n...",
      "author": "user_456",
      "tags": ["frontend", "javascript", "react"],
      "publishedAt": 1704067200000,
      "updatedAt": 1704067200000,
      "isPublished": true
    }
  }
}
```

**Error Response** (Not Found):

```json
{
  "data": {
    "roadmap": null
  }
}
```

## Mutations

### 1. Create Roadmap

Tạo một roadmap mới.

**Access**: Admin only (requires authentication with admin role)

```graphql
mutation CreateRoadmap($input: CreateRoadmapInput!) {
  createRoadmap(input: $input)
}
```

**Variables**:

```json
{
  "input": {
    "slug": "backend-developer",
    "title": "Backend Developer Roadmap",
    "description": "Complete guide to becoming a backend developer",
    "content": "# Backend Developer Roadmap\n\n## Introduction\n\n...",
    "tags": ["backend", "nodejs", "database"],
    "isPublished": true
  }
}
```

**Response**:

```json
{
  "data": {
    "createRoadmap": "roadmap_789"
  }
}
```

**Error Responses**:

401 Unauthorized (No authentication):

```json
{
  "errors": [
    {
      "message": "Missing or malformed Authorization header",
      "extensions": {
        "code": "UNAUTHENTICATED"
      }
    }
  ]
}
```

403 Forbidden (Non-admin user):

```json
{
  "errors": [
    {
      "message": "Insufficient permissions",
      "extensions": {
        "code": "FORBIDDEN"
      }
    }
  ]
}
```

400 Bad Request (Duplicate slug):

```json
{
  "errors": [
    {
      "message": "Roadmap với slug \"backend-developer\" đã tồn tại",
      "extensions": {
        "code": "BAD_REQUEST"
      }
    }
  ]
}
```

### 2. Update Roadmap

Cập nhật thông tin của một roadmap.

**Access**: Admin only (requires authentication with admin role)

```graphql
mutation UpdateRoadmap($input: UpdateRoadmapInput!) {
  updateRoadmap(input: $input)
}
```

**Variables** (partial update):

```json
{
  "input": {
    "id": "roadmap_789",
    "title": "Updated Backend Developer Roadmap",
    "description": "Updated description"
  }
}
```

**Response**:

```json
{
  "data": {
    "updateRoadmap": "roadmap_789"
  }
}
```

**Error Responses**:

404 Not Found:

```json
{
  "errors": [
    {
      "message": "Không tìm thấy roadmap với ID: roadmap_789",
      "extensions": {
        "code": "NOT_FOUND"
      }
    }
  ]
}
```

### 3. Delete Roadmap

Xóa một roadmap.

**Access**: Admin only (requires authentication with admin role)

```graphql
mutation DeleteRoadmap($id: String!) {
  deleteRoadmap(id: $id)
}
```

**Variables**:

```json
{
  "id": "roadmap_789"
}
```

**Response**:

```json
{
  "data": {
    "deleteRoadmap": "roadmap_789"
  }
}
```

**Error Responses**:

404 Not Found:

```json
{
  "errors": [
    {
      "message": "Không tìm thấy roadmap với ID: roadmap_789",
      "extensions": {
        "code": "NOT_FOUND"
      }
    }
  ]
}
```

## Error Codes

| Code                    | HTTP Status | Description                                |
| ----------------------- | ----------- | ------------------------------------------ |
| `UNAUTHENTICATED`       | 401         | Missing or invalid JWT token               |
| `FORBIDDEN`             | 403         | Insufficient permissions for the operation |
| `BAD_REQUEST`           | 400         | Invalid input data (e.g., duplicate slug)  |
| `NOT_FOUND`             | 404         | Resource not found                         |
| `INTERNAL_SERVER_ERROR` | 500         | Server error                               |

## Testing with GraphQL Playground

1. Start the API server:

   ```bash
   pnpm dev --filter @viztechstack/api
   ```

2. Open GraphQL Playground:

   ```
   http://localhost:3001/graphql
   ```

3. For protected mutations, add the Authorization header in the HTTP HEADERS section:
   ```json
   {
     "Authorization": "Bearer <your-jwt-token>"
   }
   ```

## Testing with cURL

### Query Roadmaps (Public)

```bash
curl -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ roadmaps { id slug title description } }"
  }'
```

### Create Roadmap (Admin)

```bash
curl -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "query": "mutation CreateRoadmap($input: CreateRoadmapInput!) { createRoadmap(input: $input) }",
    "variables": {
      "input": {
        "slug": "devops-engineer",
        "title": "DevOps Engineer Roadmap",
        "description": "Complete guide to becoming a DevOps engineer",
        "content": "# DevOps Engineer Roadmap\n\n...",
        "tags": ["devops", "docker", "kubernetes"],
        "isPublished": true
      }
    }
  }'
```

## Rate Limiting

Currently, there is no rate limiting implemented. This may be added in future versions.

## Versioning

Current API version: **v1.0**

The API uses GraphQL schema evolution instead of traditional versioning. Breaking changes will be communicated in advance.

## Support

For issues or questions, please contact the development team or create an issue in the repository.
