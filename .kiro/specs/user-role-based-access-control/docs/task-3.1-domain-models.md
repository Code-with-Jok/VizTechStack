# Tài liệu Task 3.1: Domain Models (Mô hình Miền)

## Giới thiệu

Task này tạo ra các **domain model interfaces** cho module Roadmap. Domain models là các interface TypeScript định nghĩa cấu trúc dữ liệu cốt lõi của ứng dụng, đại diện cho các thực thể nghiệp vụ (business entities) và cách chúng được truyền tải giữa các lớp của hệ thống.

## Domain Models là gì?

**Domain Models** (Mô hình Miền) là các định nghĩa dữ liệu đại diện cho các khái niệm nghiệp vụ trong ứng dụng của bạn. Chúng mô tả:

- **Các thực thể** (entities): Đối tượng có định danh duy nhất (ví dụ: Roadmap với `_id`)
- **Dữ liệu đầu vào** (input DTOs): Dữ liệu cần thiết để tạo hoặc cập nhật thực thể
- **Quy tắc nghiệp vụ**: Các ràng buộc và quan hệ giữa các trường dữ liệu

### Tại sao cần Domain Models?

1. **Tách biệt logic nghiệp vụ**: Domain models tồn tại độc lập với cơ sở dữ liệu, API, hoặc UI
2. **Tái sử dụng**: Có thể dùng chung giữa nhiều lớp (service, resolver, database)
3. **Type safety**: TypeScript kiểm tra kiểu dữ liệu tại compile-time
4. **Tài liệu tự động**: Interface comments giải thích ý nghĩa của từng trường

## Các Interface đã tạo

### 1. `Roadmap` - Thực thể chính

```typescript
export interface Roadmap {
  _id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  author: string;
  tags: string[];
  publishedAt: number;
  updatedAt: number;
  isPublished: boolean;
}
```

**Mục đích**: Đại diện cho một roadmap hoàn chỉnh trong hệ thống.

**Các trường quan trọng**:
- `_id`: ID duy nhất do Convex tự động tạo
- `slug`: Định danh thân thiện với URL (ví dụ: "react-roadmap")
- `author`: ID người dùng từ Clerk
- `publishedAt`, `updatedAt`: Timestamps (số milliseconds từ Unix epoch)
- `isPublished`: Trạng thái công khai/nháp

**Khi nào dùng**: Khi bạn cần làm việc với dữ liệu roadmap đầy đủ từ database.

### 2. `CreateRoadmapInput` - Dữ liệu tạo mới

```typescript
export interface CreateRoadmapInput {
  slug: string;
  title: string;
  description: string;
  content: string;
  tags: string[];
  isPublished: boolean;
}
```

**Mục đích**: Định nghĩa dữ liệu cần thiết để tạo roadmap mới.

**Điểm khác biệt với `Roadmap`**:
- ❌ Không có `_id` (do hệ thống tự tạo)
- ❌ Không có `author` (lấy từ user đang đăng nhập)
- ❌ Không có `publishedAt`, `updatedAt` (tự động tạo)

**Khi nào dùng**: Trong GraphQL mutation `createRoadmap` và service method `create()`.

### 3. `UpdateRoadmapInput` - Dữ liệu cập nhật

```typescript
export interface UpdateRoadmapInput {
  id: string;
  slug?: string;
  title?: string;
  description?: string;
  content?: string;
  tags?: string[];
  isPublished?: boolean;
}
```

**Mục đích**: Định nghĩa dữ liệu có thể cập nhật trên roadmap hiện có.

**Đặc điểm**:
- ✅ `id` là bắt buộc (để xác định roadmap nào cần update)
- ✅ Tất cả các trường khác là **optional** (`?`), cho phép cập nhật từng phần
- ❌ Không cho phép thay đổi `author`, `publishedAt` (bảo vệ dữ liệu quan trọng)

**Khi nào dùng**: Trong GraphQL mutation `updateRoadmap` và service method `update()`.

## Interface vs Type trong TypeScript

### Interface

```typescript
interface User {
  id: string;
  name: string;
}
```

**Ưu điểm**:
- ✅ Có thể **extend** (kế thừa) từ interface khác
- ✅ Có thể **merge** (gộp) nhiều khai báo cùng tên
- ✅ Rõ ràng hơn khi định nghĩa object shapes
- ✅ Tốt hơn cho domain models và API contracts

**Khi nào dùng**: Cho domain models, DTOs, API responses.

### Type

```typescript
type UserId = string;
type Status = 'active' | 'inactive';
```

**Ưu điểm**:
- ✅ Linh hoạt hơn (union types, intersection types, mapped types)
- ✅ Có thể tạo type aliases cho primitive types
- ✅ Hỗ trợ conditional types và advanced type operations

**Khi nào dùng**: Cho union types, utility types, type aliases.

### Trong dự án này

Chúng ta dùng **interface** cho domain models vì:
1. Dễ đọc và hiểu hơn cho object structures
2. Có thể extend trong tương lai nếu cần
3. Phù hợp với convention của NestJS và GraphQL

## Cách sử dụng Domain Models

### 1. Trong Service Layer

```typescript
// apps/api/src/modules/roadmap/application/services/roadmap.service.ts
import { Injectable } from '@nestjs/common';
import type { Roadmap, CreateRoadmapInput, UpdateRoadmapInput } from '../../domain/models/roadmap.model';

@Injectable()
export class RoadmapService {
  async findAll(): Promise<Roadmap[]> {
    // Trả về mảng Roadmap
    return await this.convexService.query<Roadmap[]>('roadmaps:list');
  }

  async create(input: CreateRoadmapInput, authorId: string): Promise<string> {
    // Nhận CreateRoadmapInput, trả về ID
    return await this.convexService.mutation<string>('roadmaps:create', {
      ...input,
      author: authorId,
    });
  }

  async update(input: UpdateRoadmapInput): Promise<string> {
    // Nhận UpdateRoadmapInput, trả về ID
    return await this.convexService.mutation<string>('roadmaps:update', input);
  }
}
```

**Lợi ích**:
- TypeScript kiểm tra bạn truyền đúng dữ liệu
- Autocomplete gợi ý các trường có sẵn
- Refactoring an toàn khi thay đổi interface

### 2. Trong GraphQL Resolver

```typescript
// apps/api/src/modules/roadmap/transport/graphql/resolvers/roadmap.resolver.ts
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { RoadmapSchema } from '../schemas/roadmap.schema';
import { CreateRoadmapInput } from '../schemas/roadmap-input.schema';

@Resolver(() => RoadmapSchema)
export class RoadmapResolver {
  @Query(() => [RoadmapSchema])
  async roadmaps(): Promise<RoadmapSchema[]> {
    // Service trả về Roadmap[], map sang RoadmapSchema[]
    return await this.roadmapService.findAll();
  }

  @Mutation(() => String)
  async createRoadmap(
    @Args('input') input: CreateRoadmapInput,
    @CurrentUser() user: CurrentUserData,
  ): Promise<string> {
    // GraphQL input tự động validate theo CreateRoadmapInput
    return await this.roadmapService.create(input, user.id);
  }
}
```

**Lưu ý**: GraphQL schemas (`RoadmapSchema`, `CreateRoadmapInput`) là các class với decorators, nhưng chúng **tương ứng** với domain model interfaces.

### 3. Trong Tests

```typescript
// __tests__/unit/roadmap.service.spec.ts
import type { CreateRoadmapInput, Roadmap } from '../../domain/models/roadmap.model';

describe('RoadmapService', () => {
  it('should create a roadmap', async () => {
    const input: CreateRoadmapInput = {
      slug: 'test-roadmap',
      title: 'Test Roadmap',
      description: 'Test description',
      content: 'Test content',
      tags: ['test'],
      isPublished: true,
    };

    const result = await service.create(input, 'user-123');
    expect(result).toBeDefined();
  });
});
```

**Lợi ích**: Test data có type safety, dễ phát hiện lỗi khi interface thay đổi.

## Best Practices

### 1. Sử dụng `type` import

```typescript
// ✅ Tốt - chỉ import type, không import runtime code
import type { Roadmap } from '../../domain/models/roadmap.model';

// ❌ Tránh - import cả runtime code (không cần thiết cho interface)
import { Roadmap } from '../../domain/models/roadmap.model';
```

**Lý do**: `type` import bị xóa hoàn toàn khi compile, giảm bundle size.

### 2. Đặt tên rõ ràng

```typescript
// ✅ Tốt - rõ ràng đây là input để tạo
CreateRoadmapInput

// ❌ Tránh - không rõ mục đích
RoadmapCreate, NewRoadmap
```

### 3. Document các trường

```typescript
export interface Roadmap {
  /** Unique identifier generated by Convex */
  _id: string;
  
  /** URL-friendly identifier for the roadmap */
  slug: string;
}
```

**Lợi ích**: VSCode hiển thị comments khi hover, giúp developer hiểu rõ hơn.

### 4. Tách biệt domain models và GraphQL schemas

```
domain/models/roadmap.model.ts     → Interface (domain layer)
transport/graphql/schemas/         → Class với decorators (transport layer)
```

**Lý do**: Domain models không phụ thuộc vào GraphQL, có thể tái sử dụng cho REST API, gRPC, etc.

## Kiến trúc Layered

```
┌─────────────────────────────────────┐
│  Transport Layer (GraphQL)          │
│  - RoadmapResolver                  │
│  - RoadmapSchema (GraphQL classes)  │
└──────────────┬──────────────────────┘
               │ uses
┌──────────────▼──────────────────────┐
│  Application Layer                  │
│  - RoadmapService                   │
└──────────────┬──────────────────────┘
               │ uses
┌──────────────▼──────────────────────┐
│  Domain Layer                       │
│  - Roadmap (interface)              │ ← Task 3.1 tạo layer này
│  - CreateRoadmapInput (interface)   │
│  - UpdateRoadmapInput (interface)   │
└──────────────┬──────────────────────┘
               │ maps to
┌──────────────▼──────────────────────┐
│  Infrastructure Layer               │
│  - ConvexService                    │
│  - Convex Database                  │
└─────────────────────────────────────┘
```

**Domain Layer** là trung tâm, không phụ thuộc vào các layer khác. Các layer khác phụ thuộc vào domain models.

## Tóm tắt

Task 3.1 đã tạo ra 3 domain model interfaces:

1. **`Roadmap`**: Thực thể đầy đủ từ database
2. **`CreateRoadmapInput`**: Dữ liệu để tạo roadmap mới
3. **`UpdateRoadmapInput`**: Dữ liệu để cập nhật roadmap (partial)

Các interface này:
- ✅ Cung cấp type safety cho toàn bộ module
- ✅ Tách biệt domain logic khỏi infrastructure
- ✅ Dễ test và maintain
- ✅ Tài liệu hóa cấu trúc dữ liệu

**Bước tiếp theo**: Task 4 sẽ tạo GraphQL schemas tương ứng với các domain models này.
