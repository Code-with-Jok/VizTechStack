# Task 5.1: Tạo RoadmapService với các phương thức CRUD

## Tổng quan

Task này triển khai **RoadmapService** - một service layer trong NestJS chịu trách nhiệm xử lý logic nghiệp vụ cho các thao tác CRUD (Create, Read, Update, Delete) trên roadmap. Service này đóng vai trò trung gian giữa GraphQL resolver và Convex database.

## Mục tiêu

- ✅ Tạo service với 5 phương thức CRUD: `findAll`, `findBySlug`, `create`, `update`, `delete`
- ✅ Thêm validation cho slug trùng lặp khi tạo/cập nhật roadmap
- ✅ Thêm validation cho ID không tồn tại khi cập nhật/xóa roadmap
- ✅ Thêm error logging cho tất cả các thao tác
- ✅ Xử lý lỗi với thông báo tiếng Việt

## Kiến trúc

### Vị trí trong hệ thống

```
GraphQL Resolver (Transport Layer)
        ↓
RoadmapService (Application Layer) ← Task này
        ↓
ConvexService (Infrastructure Layer)
        ↓
Convex Database
```

### Vai trò của RoadmapService

1. **Business Logic**: Xử lý logic nghiệp vụ như validation, kiểm tra điều kiện
2. **Error Handling**: Bắt và xử lý lỗi từ Convex, trả về lỗi có ý nghĩa
3. **Logging**: Ghi log cho tất cả thao tác để debug và audit
4. **Data Transformation**: Chuyển đổi dữ liệu giữa domain models và Convex

## Triển khai

### File được tạo

```
apps/api/src/modules/roadmap/application/services/roadmap.service.ts
```

### Cấu trúc Service

```typescript
@Injectable()
export class RoadmapService {
    private readonly logger = new Logger(RoadmapService.name);

    constructor(private readonly convexService: ConvexService) {}

    // 5 phương thức CRUD
    async findAll(): Promise<Roadmap[]>
    async findBySlug(slug: string): Promise<Roadmap | null>
    async create(input: CreateRoadmapInput, authorId: string): Promise<string>
    async update(input: UpdateRoadmapInput): Promise<string>
    async delete(id: string): Promise<string>
}
```

## Chi tiết các phương thức

### 1. findAll() - Lấy tất cả roadmap

**Mục đích**: Trả về danh sách tất cả roadmap đã publish

**Đặc điểm**:
- Public operation (không cần authentication)
- Chỉ trả về roadmap có `isPublished = true`
- Sắp xếp theo `publishedAt` giảm dần (mới nhất trước)

**Error Handling**:
- Bắt lỗi từ Convex và throw `InternalServerErrorException`
- Log lỗi với stack trace để debug

**Ví dụ sử dụng**:
```typescript
const roadmaps = await roadmapService.findAll();
// Returns: [{ _id: '...', slug: 'react', title: 'React Roadmap', ... }, ...]
```

### 2. findBySlug(slug) - Tìm roadmap theo slug

**Mục đích**: Tìm một roadmap cụ thể bằng slug (URL-friendly identifier)

**Đặc điểm**:
- Public operation (không cần authentication)
- Trả về `null` nếu không tìm thấy (không throw error)
- Sử dụng index `by_slug` trong Convex để tìm kiếm nhanh

**Error Handling**:
- Bắt lỗi từ Convex và throw `InternalServerErrorException`
- Log cả trường hợp tìm thấy và không tìm thấy

**Ví dụ sử dụng**:
```typescript
const roadmap = await roadmapService.findBySlug('react');
// Returns: { _id: '...', slug: 'react', title: 'React Roadmap', ... }

const notFound = await roadmapService.findBySlug('nonexistent');
// Returns: null
```

### 3. create(input, authorId) - Tạo roadmap mới

**Mục đích**: Tạo một roadmap mới với validation

**Đặc điểm**:
- Admin-only operation (enforced by resolver guards)
- Validate slug không trùng lặp trước khi tạo
- Tự động thêm `authorId` từ JWT token
- Convex tự động tạo `_id`, `publishedAt`, `updatedAt`

**Validation**:
1. Kiểm tra slug đã tồn tại chưa bằng `findBySlug()`
2. Nếu tồn tại → throw `BadRequestException` với message tiếng Việt

**Error Handling**:
- `BadRequestException`: Slug trùng lặp
- `InternalServerErrorException`: Lỗi Convex khác
- Log warning cho duplicate slug, error cho lỗi khác

**Ví dụ sử dụng**:
```typescript
const input = {
    slug: 'react',
    title: 'React Roadmap',
    description: 'Learn React from scratch',
    content: '# React Roadmap\n...',
    tags: ['frontend', 'javascript'],
    isPublished: true
};

const roadmapId = await roadmapService.create(input, 'user_123');
// Returns: 'k17abc...' (Convex ID)

// Nếu slug đã tồn tại:
// Throws: BadRequestException('Roadmap với slug "react" đã tồn tại')
```

### 4. update(input) - Cập nhật roadmap

**Mục đích**: Cập nhật một roadmap hiện có với validation

**Đặc điểm**:
- Admin-only operation (enforced by resolver guards)
- Hỗ trợ partial update (chỉ cập nhật các field được cung cấp)
- Validate slug mới không trùng với roadmap khác
- Convex tự động cập nhật `updatedAt`

**Validation**:
1. Nếu `input.slug` được cung cấp:
   - Kiểm tra slug mới đã tồn tại chưa
   - Đảm bảo slug không thuộc về roadmap khác (cho phép giữ nguyên slug hiện tại)
2. Convex sẽ throw error nếu ID không tồn tại

**Error Handling**:
- `BadRequestException`: Slug mới trùng lặp
- `NotFoundException`: ID không tồn tại (detect từ Convex error message)
- `InternalServerErrorException`: Lỗi Convex khác
- Log warning cho validation errors, error cho lỗi khác

**Ví dụ sử dụng**:
```typescript
// Cập nhật một số field
const input = {
    id: 'k17abc...',
    title: 'React Roadmap 2024',
    tags: ['frontend', 'javascript', 'react']
};

const roadmapId = await roadmapService.update(input);
// Returns: 'k17abc...'

// Nếu ID không tồn tại:
// Throws: NotFoundException('Không tìm thấy roadmap với ID: k17abc...')

// Nếu slug mới trùng lặp:
// Throws: BadRequestException('Roadmap với slug "react" đã tồn tại')
```

### 5. delete(id) - Xóa roadmap

**Mục đích**: Xóa một roadmap khỏi database

**Đặc điểm**:
- Admin-only operation (enforced by resolver guards)
- Xóa vĩnh viễn (không có soft delete)
- Convex sẽ throw error nếu ID không tồn tại

**Error Handling**:
- `NotFoundException`: ID không tồn tại (detect từ Convex error message)
- `InternalServerErrorException`: Lỗi Convex khác
- Log warning cho not found, error cho lỗi khác

**Ví dụ sử dụng**:
```typescript
const roadmapId = await roadmapService.delete('k17abc...');
// Returns: 'k17abc...'

// Nếu ID không tồn tại:
// Throws: NotFoundException('Không tìm thấy roadmap với ID: k17abc...')
```

## Validation Logic

### 1. Duplicate Slug Validation (Create)

```typescript
// Trong create()
const existing = await this.findBySlug(input.slug);
if (existing) {
    throw new BadRequestException(`Roadmap với slug "${input.slug}" đã tồn tại`);
}
```

**Tại sao cần**: Slug là unique identifier trong URL, không được trùng lặp

### 2. Duplicate Slug Validation (Update)

```typescript
// Trong update()
if (input.slug) {
    const existing = await this.findBySlug(input.slug);
    if (existing && existing._id !== input.id) {
        throw new BadRequestException(`Roadmap với slug "${input.slug}" đã tồn tại`);
    }
}
```

**Tại sao cần**: Cho phép giữ nguyên slug hiện tại, nhưng không cho đổi sang slug của roadmap khác

### 3. Non-existent ID Validation (Update/Delete)

```typescript
// Trong update() và delete()
if (error instanceof Error && error.message.includes('Document not found')) {
    throw new NotFoundException(`Không tìm thấy roadmap với ID: ${id}`);
}
```

**Tại sao cần**: Convex không có built-in validation, phải detect từ error message

## Error Logging Strategy

### Log Levels

1. **LOG**: Thao tác thành công
   ```typescript
   this.logger.log('Creating roadmap: react by user: user_123');
   this.logger.log('Successfully created roadmap: k17abc...');
   ```

2. **WARN**: Validation errors (expected errors)
   ```typescript
   this.logger.warn('Duplicate slug detected: react');
   this.logger.warn('Roadmap not found for update: k17abc...');
   ```

3. **ERROR**: Unexpected errors (system errors)
   ```typescript
   this.logger.error('Failed to create roadmap: react', error.stack);
   ```

### Log Format

Mỗi log bao gồm:
- **Context**: Tên service (RoadmapService)
- **Operation**: Thao tác đang thực hiện
- **Identifier**: Slug hoặc ID của roadmap
- **User**: User ID (nếu có)
- **Stack trace**: Cho errors (để debug)

### Ví dụ Log Output

```
[RoadmapService] Creating roadmap: react by user: user_123
[RoadmapService] Successfully created roadmap: k17abc... with slug: react

[RoadmapService] Updating roadmap: k17abc...
[RoadmapService] Duplicate slug detected during update: vue
[RoadmapService] Failed to update roadmap: k17abc...
Error: Roadmap với slug "vue" đã tồn tại
    at RoadmapService.update (roadmap.service.ts:158)
    ...
```

## Error Messages (Tiếng Việt)

Theo yêu cầu 10.2, 10.3, tất cả error messages phải bằng tiếng Việt:

| Error Type | English | Vietnamese |
|------------|---------|------------|
| Duplicate slug | Roadmap with slug "X" already exists | Roadmap với slug "X" đã tồn tại |
| Not found | Roadmap with ID "X" not found | Không tìm thấy roadmap với ID: X |
| Failed to fetch | Failed to fetch roadmaps | Failed to fetch roadmaps |
| Failed to create | Failed to create roadmap | Failed to create roadmap |
| Failed to update | Failed to update roadmap | Failed to update roadmap |
| Failed to delete | Failed to delete roadmap | Failed to delete roadmap |

**Note**: Internal server errors giữ nguyên tiếng Anh vì đây là technical messages cho developers.

## Dependencies

### Injected Services

```typescript
constructor(private readonly convexService: ConvexService) {}
```

- **ConvexService**: Wrapper service để gọi Convex queries và mutations

### NestJS Decorators

```typescript
import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException, Logger } from '@nestjs/common';
```

- `@Injectable()`: Đánh dấu class là NestJS provider
- `BadRequestException`: HTTP 400 - Validation errors
- `NotFoundException`: HTTP 404 - Resource not found
- `InternalServerErrorException`: HTTP 500 - System errors
- `Logger`: NestJS logger với context

### Domain Models

```typescript
import type { Roadmap, CreateRoadmapInput, UpdateRoadmapInput } from '../../domain/models/roadmap.model';
```

- **Roadmap**: Interface cho roadmap entity
- **CreateRoadmapInput**: DTO cho tạo roadmap
- **UpdateRoadmapInput**: DTO cho cập nhật roadmap

## Testing Considerations

Service này sẽ được test trong các tasks sau:

1. **Unit Tests** (Task 12.1-12.4):
   - Mock ConvexService
   - Test từng phương thức riêng lẻ
   - Test validation logic
   - Test error handling

2. **Property-Based Tests** (Task 11.1-11.3):
   - Test persistence properties
   - Test idempotency
   - Test deletion completeness

3. **E2E Tests** (Task 14.1-14.2):
   - Test full CRUD workflow
   - Test với real Convex database

## Yêu cầu được đáp ứng

Task này đáp ứng các yêu cầu sau:

- **4.1, 4.2, 4.3, 4.4**: Quyền xem danh sách Roadmap (findAll, findBySlug)
- **7.2**: Quyền Create cho Admin (create method)
- **7.3**: Quyền Read cho Admin (findAll, findBySlug)
- **7.4**: Quyền Update cho Admin (update method)
- **7.5**: Quyền Delete cho Admin (delete method)
- **10.4**: Xử lý lỗi và logging (error logging cho tất cả operations)

## Kết luận

RoadmapService là tầng application layer quan trọng, chịu trách nhiệm:

1. ✅ **Business Logic**: Validation, kiểm tra điều kiện
2. ✅ **Error Handling**: Xử lý lỗi từ Convex, trả về lỗi có ý nghĩa
3. ✅ **Logging**: Ghi log đầy đủ cho debug và audit
4. ✅ **Data Access**: Gọi ConvexService để thao tác với database

Service này sẽ được sử dụng bởi RoadmapResolver (task 6.1) để xử lý GraphQL requests.
