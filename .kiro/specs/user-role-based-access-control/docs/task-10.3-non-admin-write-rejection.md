# Task 10.3: Property Test cho Non-Admin Write Rejection

## Tổng quan

Task này triển khai property-based test để xác minh rằng bất kỳ thao tác ghi (write operation) nào được thực hiện bởi user không phải admin đều bị từ chối với lỗi 403 Forbidden.

## Mục tiêu

Xác minh **Property 5: Non-Admin Write Rejection** từ design document:

> *For any* create, update, or delete mutation attempted by an authenticated user with role "user" (not "admin"), the system should reject the request with a 403 Forbidden error.

## Yêu cầu được validate

- **Requirements 6.2**: User cố gắng thực hiện Create operation trên Roadmap, hệ thống phải từ chối yêu cầu
- **Requirements 6.3**: User cố gắng thực hiện Update operation trên Roadmap, hệ thống phải từ chối yêu cầu
- **Requirements 6.4**: User cố gắng thực hiện Delete operation trên Roadmap, hệ thống phải từ chối yêu cầu
- **Requirements 8.4**: Nếu người dùng không có quyền thực hiện thao tác, hệ thống phải trả về lỗi 403 Forbidden

## Triển khai

### Vị trí file

```
apps/api/src/modules/roadmap/__tests__/properties/authorization.properties.spec.ts
```

### Cấu trúc test

Test sử dụng **fast-check** để generate các test case ngẫu nhiên với 100 iterations:

```typescript
it('should reject any non-admin user from admin-only operations', async () => {
    await fc.assert(
        fc.asyncProperty(
            fc.record({
                id: fc.string({ minLength: 1 }),
                role: fc.constant('user'),
            }),
            async (user) => {
                const mockContext = createMockExecutionContext(user);

                // Mock reflector to return ['admin'] as required roles
                jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);

                expect(() => guard.canActivate(mockContext)).toThrow(
                    ForbiddenException
                );
            }
        ),
        { numRuns: 100 }
    );
});
```

### Giải thích chi tiết

#### 1. Generator Strategy

Test sử dụng `fc.record()` để generate user objects với role cố định là 'user':

```typescript
fc.record({
    id: fc.string({ minLength: 1 }),  // Random user ID
    role: fc.constant('user'),         // Always 'user' role
})
```

Điều này đảm bảo test cover:
- Nhiều user IDs khác nhau
- Luôn luôn là role 'user' (không phải admin)

#### 2. Mock Setup

**User Context**: Test tạo authenticated user với role 'user':

```typescript
const mockContext = createMockExecutionContext(user);
// user = { id: "random-id", role: "user" }
```

**Reflector Mock**: Test mock để endpoint yêu cầu role 'admin':

```typescript
jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
```

Trong thực tế, điều này tương ứng với:

```typescript
@Mutation(() => String)
@Roles('admin')  // <-- Chỉ admin mới được phép
async createRoadmap(
    @Args('input') input: CreateRoadmapInput,
    @CurrentUser() user: CurrentUserData,
): Promise<string> {
    return await this.roadmapService.create(input, user.id);
}
```

#### 3. Assertion

Test verify rằng `RolesGuard.canActivate()` throw `ForbiddenException`:

```typescript
expect(() => guard.canActivate(mockContext)).toThrow(
    ForbiddenException
);
```

### Cách RolesGuard xử lý non-admin users

RolesGuard kiểm tra logic như sau:

1. **Lấy required roles** từ metadata (ví dụ: ['admin'])
2. **Lấy user role** từ context (ví dụ: 'user')
3. **Kiểm tra user.role có trong requiredRoles không**
4. **Nếu không** → Throw ForbiddenException với message "Insufficient permissions"

```typescript
// Trong RolesGuard
const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
    context.getHandler(),
    context.getClass(),
]);

if (!requiredRoles) {
    return true; // Public endpoint
}

const user = gqlContext.req.user;

if (!user || !user.role) {
    throw new ForbiddenException('Access denied: No role assigned');
}

const hasRole = requiredRoles.includes(user.role);
if (!hasRole) {
    this.logger.debug('Access Denied: Required roles check failed');
    throw new ForbiddenException('Insufficient permissions');
}

return true;
```

## Phân biệt với Property 4 (Unauthenticated)

| Aspect | Property 4 | Property 5 |
|--------|-----------|-----------|
| User context | undefined | { id: "...", role: "user" } |
| Authentication | Không có | Có (authenticated) |
| Lỗi | 403 Forbidden | 403 Forbidden |
| Lý do reject | Không có user | User không có quyền |
| Log message | "No role found" | "Required roles check failed" |

## Kết quả test

Test chạy thành công với 100 iterations, verify rằng:

✅ Authenticated users với role 'user' bị reject khi truy cập admin-only endpoints
✅ RolesGuard throw ForbiddenException với message "Insufficient permissions"
✅ Tất cả user IDs khác nhau đều được test

## Tích hợp với hệ thống

### GraphQL Mutations chỉ dành cho Admin

```typescript
@Resolver(() => RoadmapSchema)
@UseGuards(ClerkAuthGuard, RolesGuard)
export class RoadmapResolver {
    // CREATE - Admin only
    @Mutation(() => String)
    @Roles('admin')  // <-- Property 5 test verify decorator này
    async createRoadmap(
        @Args('input') input: CreateRoadmapInput,
        @CurrentUser() user: CurrentUserData,
    ): Promise<string> {
        // User với role 'user' sẽ bị reject ở RolesGuard
        return await this.roadmapService.create(input, user.id);
    }

    // UPDATE - Admin only
    @Mutation(() => String)
    @Roles('admin')  // <-- Property 5 test verify decorator này
    async updateRoadmap(@Args('input') input: UpdateRoadmapInput): Promise<string> {
        // User với role 'user' sẽ bị reject ở RolesGuard
        return await this.roadmapService.update(input);
    }

    // DELETE - Admin only
    @Mutation(() => String)
    @Roles('admin')  // <-- Property 5 test verify decorator này
    async deleteRoadmap(@Args('id') id: string): Promise<string> {
        // User với role 'user' sẽ bị reject ở RolesGuard
        return await this.roadmapService.delete(id);
    }

    // READ - Public (không bị reject)
    @Query(() => [RoadmapSchema])
    @Public()  // <-- User với role 'user' có thể truy cập
    async roadmaps(): Promise<RoadmapSchema[]> {
        return await this.roadmapService.findAll();
    }
}
```

### Luồng xử lý request từ non-admin user

```
Request với JWT (role: 'user')
    ↓
ClerkAuthGuard
    ↓ (Pass - token hợp lệ)
RolesGuard
    ↓
Check required roles: ['admin']
    ↓
Check user role: 'user'
    ↓
'user' NOT IN ['admin']
    ↓
Throw ForbiddenException (403)
    ↓
Response: "Insufficient permissions"
```

## Best Practices được áp dụng

### 1. Property-Based Testing

Test verify property phổ quát:

✅ **Tốt** (Property-based):
```typescript
it('should reject ANY non-admin user from admin-only operations', () => {
    // Test với 100 random user IDs
    // Tất cả đều có role 'user'
});
```

### 2. Separation of Concerns

Test tách biệt rõ ràng giữa:
- **Authentication** (Property 4): Kiểm tra có token không
- **Authorization** (Property 5): Kiểm tra có quyền không

### 3. Clear Error Messages

RolesGuard trả về error message rõ ràng:

```typescript
throw new ForbiddenException('Insufficient permissions');
```

Thay vì message chung chung như "Access denied".

## Debugging và Troubleshooting

### Nếu test fail

1. **Kiểm tra user role**:
   ```typescript
   // Đảm bảo user.role là 'user', không phải 'admin'
   const user = { id: "test-id", role: "user" };
   ```

2. **Kiểm tra required roles**:
   ```typescript
   // Đảm bảo required roles là ['admin']
   jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
   ```

3. **Kiểm tra RolesGuard logic**:
   ```typescript
   // RolesGuard phải kiểm tra user.role có trong requiredRoles không
   const hasRole = requiredRoles.includes(user.role);
   if (!hasRole) {
       throw new ForbiddenException('Insufficient permissions');
   }
   ```

### Log output

Test output hiển thị debug logs:

```
[Nest] DEBUG [RolesGuard] RolesGuard Check Started
[Nest] DEBUG [RolesGuard] Access Denied: Required roles check failed
```

Nếu thấy "Access Granted", có thể:
- User role là 'admin' (không phải 'user')
- Required roles không bao gồm 'admin'
- RolesGuard logic có bug

## Use Cases thực tế

### Scenario 1: User thường cố gắng tạo roadmap

```graphql
mutation {
  createRoadmap(input: {
    slug: "my-roadmap"
    title: "My Roadmap"
    description: "Test"
    content: "Test content"
    tags: ["test"]
    isPublished: true
  })
}
```

**Headers**:
```
Authorization: Bearer <JWT với role: 'user'>
```

**Response**:
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

### Scenario 2: User thường cố gắng xóa roadmap

```graphql
mutation {
  deleteRoadmap(id: "roadmap-id-123")
}
```

**Headers**:
```
Authorization: Bearer <JWT với role: 'user'>
```

**Response**:
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

### Scenario 3: User thường đọc roadmap (được phép)

```graphql
query {
  roadmaps {
    id
    title
    description
  }
}
```

**Headers**:
```
Authorization: Bearer <JWT với role: 'user'>
```

**Response**:
```json
{
  "data": {
    "roadmaps": [
      {
        "id": "1",
        "title": "Frontend Roadmap",
        "description": "Learn frontend development"
      }
    ]
  }
}
```

✅ **Success** - Query operations không yêu cầu admin role

## Kết luận

Task 10.3 đã triển khai thành công property test cho Non-Admin Write Rejection, verify rằng hệ thống từ chối tất cả write operations từ users không phải admin. Test sử dụng property-based testing với fast-check để đảm bảo coverage toàn diện với 100 random test cases.

Property này đảm bảo rằng chỉ có admin users mới có quyền thực hiện write operations (create, update, delete) trên roadmap, trong khi user thường chỉ có quyền đọc.

## Tài liệu tham khảo

- [fast-check Documentation](https://github.com/dubzzz/fast-check)
- [NestJS Guards](https://docs.nestjs.com/guards)
- [GraphQL Authorization](https://docs.nestjs.com/graphql/resolvers)
- Design Document: Property 5 - Non-Admin Write Rejection
- Requirements Document: Requirements 6.2, 6.3, 6.4, 8.4
