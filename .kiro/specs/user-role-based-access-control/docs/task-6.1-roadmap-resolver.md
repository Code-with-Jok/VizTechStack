# Task 6.1: Tạo RoadmapResolver với Queries và Mutations

## Tổng quan

Task này triển khai GraphQL resolver cho roadmap với đầy đủ các queries và mutations, kèm theo kiểm soát truy cập dựa trên vai trò người dùng. Resolver này là điểm cuối (endpoint) của API GraphQL, xử lý các yêu cầu từ client và áp dụng các guards để bảo mật.

## File đã tạo

### `apps/api/src/modules/roadmap/transport/graphql/resolvers/roadmap.resolver.ts`

File này chứa RoadmapResolver - một NestJS GraphQL resolver với các tính năng:

1. **Queries công khai** (không yêu cầu xác thực):
   - `roadmaps`: Lấy danh sách tất cả roadmap đã xuất bản
   - `roadmap(slug)`: Lấy một roadmap theo slug

2. **Mutations chỉ dành cho Admin** (yêu cầu xác thực và role admin):
   - `createRoadmap`: Tạo roadmap mới
   - `updateRoadmap`: Cập nhật roadmap hiện có
   - `deleteRoadmap`: Xóa roadmap

## Cấu trúc Code

### 1. Imports và Dependencies

```typescript
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
```

- `@nestjs/graphql`: Các decorators để định nghĩa GraphQL resolver
- `@nestjs/common`: Decorator UseGuards để áp dụng guards

### 2. Guards và Decorators

```typescript
@Resolver(() => RoadmapSchema)
@UseGuards(ClerkAuthGuard, RolesGuard)
export class RoadmapResolver {
```

**Guards được áp dụng ở cấp class:**
- `ClerkAuthGuard`: Xác thực JWT token từ Clerk
- `RolesGuard`: Kiểm tra vai trò người dùng

**Thứ tự thực thi:**
1. ClerkAuthGuard chạy trước → xác thực token và trích xuất thông tin user
2. RolesGuard chạy sau → kiểm tra role của user

### 3. Public Queries

#### Query: roadmaps

```typescript
@Query(() => [RoadmapSchema])
@Public()
async roadmaps(): Promise<RoadmapSchema[]> {
    const roadmaps = await this.roadmapService.findAll();
    return roadmaps.map(roadmap => ({
        ...roadmap,
        id: roadmap._id,
    }));
}
```

**Giải thích:**
- `@Public()`: Decorator đánh dấu endpoint này là công khai, bỏ qua ClerkAuthGuard
- Trả về mảng các roadmap đã xuất bản
- **Mapping `_id` → `id`**: Convex sử dụng `_id` nhưng GraphQL schema sử dụng `id`

**Ai có thể truy cập:**
- ✅ Guest (chưa đăng nhập)
- ✅ User (đã đăng nhập, role "user")
- ✅ Admin (đã đăng nhập, role "admin")

#### Query: roadmap

```typescript
@Query(() => RoadmapSchema, { nullable: true })
@Public()
async roadmap(@Args('slug') slug: string): Promise<RoadmapSchema | null> {
    const roadmap = await this.roadmapService.findBySlug(slug);
    if (!roadmap) {
        return null;
    }
    return {
        ...roadmap,
        id: roadmap._id,
    };
}
```

**Giải thích:**
- `@Args('slug')`: Nhận tham số slug từ GraphQL query
- `{ nullable: true }`: Cho phép trả về null nếu không tìm thấy
- Kiểm tra null trước khi mapping để tránh lỗi

**Ai có thể truy cập:**
- ✅ Guest, User, Admin (giống như roadmaps query)

### 4. Admin-Only Mutations

#### Mutation: createRoadmap

```typescript
@Mutation(() => String)
@Roles('admin')
async createRoadmap(
    @Args('input') input: CreateRoadmapInput,
    @CurrentUser() user: CurrentUserData,
): Promise<string> {
    return await this.roadmapService.create(input, user.id);
}
```

**Giải thích:**
- `@Roles('admin')`: Chỉ cho phép user có role "admin"
- `@CurrentUser()`: Decorator trích xuất thông tin user từ request context
- `user.id`: ID của user được tự động gán làm author của roadmap
- Trả về ID của roadmap vừa tạo

**Luồng xác thực:**
1. ClerkAuthGuard kiểm tra JWT token → nếu không hợp lệ → 401 Unauthorized
2. RolesGuard kiểm tra role → nếu không phải "admin" → 403 Forbidden
3. Nếu pass cả 2 guards → thực thi mutation

**Ai có thể truy cập:**
- ❌ Guest → 401 Unauthorized (không có token)
- ❌ User → 403 Forbidden (không có role admin)
- ✅ Admin → Thành công

#### Mutation: updateRoadmap

```typescript
@Mutation(() => String)
@Roles('admin')
async updateRoadmap(@Args('input') input: UpdateRoadmapInput): Promise<string> {
    return await this.roadmapService.update(input);
}
```

**Giải thích:**
- Tương tự createRoadmap nhưng không cần @CurrentUser vì không cần author
- UpdateRoadmapInput chứa ID của roadmap cần update
- Trả về ID của roadmap đã update

#### Mutation: deleteRoadmap

```typescript
@Mutation(() => String)
@Roles('admin')
async deleteRoadmap(@Args('id') id: string): Promise<string> {
    return await this.roadmapService.delete(id);
}
```

**Giải thích:**
- Nhận ID trực tiếp thay vì input object
- Trả về ID của roadmap đã xóa

## Luồng Xác thực và Phân quyền

### Sơ đồ Luồng

```
Client Request
    ↓
ClerkAuthGuard
    ├─ @Public? → Skip guard → Execute resolver
    └─ Not @Public
        ├─ No token? → 401 Unauthorized
        ├─ Invalid token? → 401 Unauthorized
        └─ Valid token → Extract user info → Continue
            ↓
        RolesGuard
            ├─ No @Roles? → Skip guard → Execute resolver
            └─ Has @Roles
                ├─ User has required role? → Execute resolver
                └─ User lacks role? → 403 Forbidden
```

### Ví dụ Thực tế

#### Ví dụ 1: Guest truy cập roadmaps query

```graphql
query {
  roadmaps {
    id
    title
    slug
  }
}
```

**Kết quả:** ✅ Thành công
- ClerkAuthGuard thấy @Public → bỏ qua
- RolesGuard không có @Roles → bỏ qua
- Resolver thực thi và trả về danh sách roadmaps

#### Ví dụ 2: User cố gắng tạo roadmap

```graphql
mutation {
  createRoadmap(input: {
    slug: "new-roadmap"
    title: "New Roadmap"
    description: "Description"
    content: "Content"
    tags: ["tag1"]
    isPublished: true
  })
}
```

**Headers:**
```
Authorization: Bearer <valid_user_token>
```

**Kết quả:** ❌ 403 Forbidden
- ClerkAuthGuard xác thực token → thành công, user.role = "user"
- RolesGuard kiểm tra @Roles('admin') → user.role không phải "admin"
- Throw ForbiddenException: "Insufficient permissions"

#### Ví dụ 3: Admin tạo roadmap

```graphql
mutation {
  createRoadmap(input: {
    slug: "new-roadmap"
    title: "New Roadmap"
    description: "Description"
    content: "Content"
    tags: ["tag1"]
    isPublished: true
  })
}
```

**Headers:**
```
Authorization: Bearer <valid_admin_token>
```

**Kết quả:** ✅ Thành công
- ClerkAuthGuard xác thực token → thành công, user.role = "admin"
- RolesGuard kiểm tra @Roles('admin') → user.role = "admin" → pass
- Resolver thực thi, gọi roadmapService.create()
- Trả về ID của roadmap mới

## Xử lý Lỗi

### 1. 401 Unauthorized

**Nguyên nhân:**
- Không có Authorization header
- Token không hợp lệ hoặc hết hạn
- Token bị giả mạo

**Response:**
```json
{
  "errors": [
    {
      "message": "Invalid token",
      "extensions": {
        "code": "UNAUTHENTICATED"
      }
    }
  ]
}
```

### 2. 403 Forbidden

**Nguyên nhân:**
- User đã xác thực nhưng không có role phù hợp
- User có role "user" cố gắng thực hiện admin operations

**Response:**
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

### 3. 400 Bad Request

**Nguyên nhân:**
- Slug đã tồn tại (từ RoadmapService)
- Input data không hợp lệ

**Response:**
```json
{
  "errors": [
    {
      "message": "Roadmap với slug \"example\" đã tồn tại",
      "extensions": {
        "code": "BAD_REQUEST"
      }
    }
  ]
}
```

### 4. 404 Not Found

**Nguyên nhân:**
- Roadmap ID không tồn tại khi update/delete

**Response:**
```json
{
  "errors": [
    {
      "message": "Không tìm thấy roadmap với ID: abc123",
      "extensions": {
        "code": "NOT_FOUND"
      }
    }
  ]
}
```

## Mapping _id → id

### Tại sao cần mapping?

**Convex convention:**
- Convex database sử dụng `_id` làm primary key
- Domain model (Roadmap interface) có field `_id: string`

**GraphQL convention:**
- GraphQL best practice sử dụng `id` cho unique identifier
- GraphQL schema (RoadmapSchema) có field `id: string`

### Cách thực hiện

```typescript
const roadmaps = await this.roadmapService.findAll();
return roadmaps.map(roadmap => ({
    ...roadmap,  // Spread tất cả fields từ Roadmap
    id: roadmap._id,  // Thêm field id với giá trị từ _id
}));
```

**Kết quả:**
- Object trả về có cả `_id` và `id` với cùng giá trị
- GraphQL schema chỉ expose field `id`
- Client không thấy field `_id`

## Tích hợp với RoadmapService

Resolver không chứa business logic, chỉ:
1. Nhận input từ GraphQL request
2. Trích xuất user context (nếu cần)
3. Gọi methods từ RoadmapService
4. Map kết quả từ domain model sang GraphQL schema
5. Trả về response

**Separation of Concerns:**
- **Resolver**: Transport layer - xử lý GraphQL requests/responses
- **Service**: Application layer - chứa business logic
- **Guards**: Security layer - xác thực và phân quyền

## Yêu cầu đã đáp ứng

Task này đáp ứng các yêu cầu sau:

- **1.3**: Landing page có thể truy cập mà không yêu cầu xác thực (public queries)
- **4.1, 4.2, 4.3, 4.4**: Guest, User, Admin đều có thể xem roadmaps
- **5.1**: Guest có thể xem roadmap
- **5.2**: Guest không thể thực hiện CRUD operations (bị chặn bởi guards)
- **6.1**: User có thể xem roadmap
- **6.2, 6.3, 6.4**: User không thể Create/Update/Delete (bị chặn bởi RolesGuard)
- **7.2, 7.3, 7.4, 7.5**: Admin có đầy đủ quyền CRUD
- **8.1**: Backend xác thực JWT token (ClerkAuthGuard)
- **8.2**: Trích xuất role từ token (ClerkAuthGuard)
- **8.3**: Kiểm tra role cho CRUD operations (RolesGuard)
- **8.4**: Trả về 403 nếu không có quyền (RolesGuard)
- **8.5**: Trả về 401 nếu token không hợp lệ (ClerkAuthGuard)

## Bước tiếp theo

Sau khi hoàn thành task này:

1. **Task 7.1**: Tạo RoadmapModule để đăng ký resolver và service
2. **Task 7.2**: Đăng ký RoadmapModule trong AppModule
3. **Task 9-11**: Viết property-based tests để kiểm tra các correctness properties
4. **Task 12-13**: Viết unit tests cho resolver và service
5. **Task 14**: Viết E2E tests cho toàn bộ workflow

## Ghi chú cho Người mới

### GraphQL Resolver là gì?

Resolver là function xử lý GraphQL queries và mutations. Nó giống như controller trong REST API, nhưng cho GraphQL.

### Decorators trong NestJS

- `@Resolver()`: Đánh dấu class là GraphQL resolver
- `@Query()`: Định nghĩa GraphQL query (đọc dữ liệu)
- `@Mutation()`: Định nghĩa GraphQL mutation (thay đổi dữ liệu)
- `@Args()`: Nhận tham số từ GraphQL request
- `@UseGuards()`: Áp dụng guards cho bảo mật
- `@Public()`: Đánh dấu endpoint công khai
- `@Roles()`: Chỉ định roles được phép truy cập
- `@CurrentUser()`: Trích xuất thông tin user hiện tại

### Guards là gì?

Guards là middleware kiểm tra điều kiện trước khi cho phép request đến resolver. Ví dụ:
- Kiểm tra user đã đăng nhập chưa
- Kiểm tra user có quyền thực hiện action không

### Tại sao cần 2 guards?

- **ClerkAuthGuard**: Xác thực identity (ai bạn là?)
- **RolesGuard**: Xác thực authorization (bạn có quyền làm gì?)

Tách biệt 2 concerns này giúp code dễ maintain và reuse.
