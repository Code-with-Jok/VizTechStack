# Hướng Dẫn Triển Khai

Phần này cung cấp hướng dẫn triển khai chi tiết cho các pattern và practice kỹ thuật chính được sử dụng trong VizTechStack.

## Nội Dung

- [Hexagonal Architecture](./hexagonal-architecture.md) - Pattern kiến trúc backend module
- [GraphQL Code Generation](./graphql-codegen.md) - Tạo type và validation
- [Git Hooks](./git-hooks.md) - Tự động hóa chất lượng code với Husky
- [Testing Strategy](./testing.md) - Phương pháp testing và best practices
- [Error Handling](./error-handling.md) - Pattern xử lý lỗi

## Pattern Triển Khai Chính

### Backend Patterns

1. **Hexagonal Architecture**
   - Phân tách layer rõ ràng
   - Dependency inversion
   - Business logic có thể test được

2. **CQRS (Command Query Responsibility Segregation)**
   - Tách biệt thao tác đọc và ghi
   - Commands cho ghi
   - Queries cho đọc

3. **Repository Pattern**
   - Abstract data access
   - Contract dựa trên interface
   - Implementation có thể thay thế

### Frontend Patterns

1. **Feature-Based Structure**
   - Tổ chức theo feature, không theo type
   - Co-locate code liên quan
   - Cải thiện khả năng maintain

2. **Custom Hooks**
   - Trích xuất logic có thể tái sử dụng
   - Tách biệt concerns
   - Component có thể test được

3. **Type-Safe API Calls**
   - TypeScript types được generate
   - Runtime validation với Zod
   - Xử lý lỗi

### Shared Patterns

1. **Code Generation**
   - GraphQL schema là source of truth
   - Auto-generated types và schemas
   - Giảm duplication

2. **Monorepo Organization**
   - Shared packages
   - Workspace dependencies
   - Turbo caching

3. **Type Safety**
   - End-to-end TypeScript
   - Compile-time checking
   - Runtime validation

## Quy Trình Development

### 1. Định Nghĩa GraphQL Schema

```graphql
type Roadmap {
  id: ID!
  title: String!
  slug: String!
}
```

### 2. Generate Types

```bash
pnpm codegen
```

### 3. Triển Khai Backend

```typescript
// Domain entity
export class RoadmapEntity { ... }

// Repository interface
export interface RoadmapRepository { ... }

// Application service
export class RoadmapApplicationService { ... }

// GraphQL resolver
export class RoadmapResolver { ... }
```

### 4. Triển Khai Frontend

```typescript
// Custom hook
export function useRoadmaps() { ... }

// Component
export function RoadmapList() { ... }
```

### 5. Test

```bash
pnpm test
```

### 6. Commit

```bash
git commit -m "feat(roadmap): add roadmap listing"
```

## Best Practices

### Tổ Chức Code

- Giữ module nhỏ và tập trung
- Tuân theo naming conventions
- Sử dụng barrel exports (index.ts)
- Co-locate code liên quan

### Type Safety

- Sử dụng generated types
- Tránh type `any`
- Validate tại boundaries
- Sử dụng Zod cho runtime validation

### Testing

- Viết unit tests cho business logic
- Test edge cases
- Mock external dependencies
- Duy trì coverage ≥ 25%

### Git Workflow

- Sử dụng conventional commits
- Giữ commits atomic
- Viết message mô tả rõ ràng
- Review trước khi push

## Điều Hướng

← [Trước: Tính Năng](../03-features/README.md)  
→ [Tiếp: Deployment](../05-deployment/README.md)  
↑ [Mục Lục Tài Liệu](../README.md)
