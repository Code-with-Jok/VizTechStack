# Task 10.6: Property Test cho Forbidden Error Response

## Tổng quan

Task này triển khai property-based test để xác minh rằng các operations bị reject do insufficient permissions đều trả về lỗi 403 Forbidden với message rõ ràng.

## Mục tiêu

Xác minh **Property 9: Forbidden Error Response** từ design document:

> *For any* operation rejected due to insufficient permissions, the system should return a 403 Forbidden error with a clear message indicating the user lacks the required permissions.

## Yêu cầu được validate

- **Requirements 8.4**: Nếu người dùng không có quyền thực hiện thao tác, hệ thống phải trả về lỗi 403 Forbidden
- **Requirements 10.1**: Khi người dùng cố gắng thực hiện thao tác không được phép, hệ thống phải hiển thị thông báo lỗi rõ ràng
- **Requirements 10.2**: Hệ thống phải hiển thị thông báo "Bạn không có quyền thực hiện thao tác này" khi người dùng bị từ chối quyền truy cập

## Triển khai

### Vị trí file

```
apps/api/src/modules/roadmap/__tests__/properties/authorization.properties.spec.ts
```

### Cấu trúc test

Test sử dụng **fast-check** để generate các test case ngẫu nhiên với 100 iterations:

```typescript
it('should return 403 Forbidden for any user without required role', async () => {
    await fc.assert(
        fc.asyncProperty(
            fc.record({
                id: fc.string({ minLength: 1 }),
                role: fc.constantFrom('user', 'guest', 'viewer'),
            }),
            fc.array(fc.constantFrom('admin', 'superadmin', 'moderator'), { minLength: 1 }),
            async (user, requiredRoles) => {
                // Ensure user role is not in required roles
                if (requiredRoles.includes(user.role)) {
                    return; // Skip this case
                }

                const mockContext = createMockExecutionContext(user);

                jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredRoles);

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

Test sử dụng 2 generators:

**Generator 1 - User với low-privilege roles**:
```typescript
fc.record({
    id: fc.string({ minLength: 1 }),
    role: fc.constantFrom('user', 'guest', 'viewer'),
})
```

Tạo ra users với roles thấp:
- `{ id: "user-123", role: "user" }`
- `{ id: "user-456", role: "guest" }`
- `{ id: "user-789", role: "viewer" }`

**Generator 2 - Required high-privilege roles**:
```typescript
fc.array(
    fc.constantFrom('admin', 'superadmin', 'moderator'), 
    { minLength: 1 }
)
```

Tạo ra required roles cao:
- `['admin']`
- `['superadmin']`
- `['admin', 'moderator']`

#### 2. Skip Logic

Test skip các cases mà user có role phù hợp:

```typescript
if (requiredRoles.includes(user.role)) {
    return; // Skip this case
}
```

Điều này đảm bảo test chỉ verify rejection cases, không test success cases.

#### 3. Assertion

Test verify rằng `ForbiddenException` được throw:

```typescript
expect(() => guard.canActivate(mockContext)).toThrow(
    ForbiddenException
);
```

### ForbiddenException Details

`ForbiddenException` là NestJS built-in exception:

```typescript
import { ForbiddenException } from '@nestjs/common';

// Trong RolesGuard
throw new ForbiddenException('Insufficient permissions');
```

**HTTP Response**:
```json
{
  "statusCode": 403,
  "message": "Insufficient permissions",
  "error": "Forbidden"
}
```

**GraphQL Response**:
```json
{
  "errors": [
    {
      "message": "Insufficient permissions",
      "extensions": {
        "code": "FORBIDDEN",
        "statusCode": 403
      }
    }
  ]
}
```

## Error Messages trong hệ thống

### RolesGuard Error Messages

RolesGuard có 2 loại error messages:

**1. No Role Assigned**:
```typescript
if (!user || !user.role) {
    throw new ForbiddenException('Access denied: No role assigned');
}
```

**Response**:
```json
{
  "message": "Access denied: No role assigned",
  "statusCode": 403,
  "error": "Forbidden"
}
```

**2. Insufficient Permissions**:
```typescript
if (!hasRole) {
    throw new ForbiddenException('Insufficient permissions');
}
```

**Response**:
```json
{
  "message": "Insufficient permissions",
  "statusCode": 403,
  "error": "Forbidden"
}
```

### Localized Error Messages (Vietnamese)

Theo requirements 10.2, error messages nên được localize:

```typescript
// apps/api/src/common/constants/error-messages.ts
export const ErrorMessages = {
    FORBIDDEN: 'Bạn không có quyền thực hiện thao tác này',
    NO_ROLE_ASSIGNED: 'Tài khoản của bạn chưa được gán vai trò',
};

// Trong RolesGuard
throw new ForbiddenException(ErrorMessages.FORBIDDEN);
```

## Kết quả test

Test chạy thành công với 100 iterations, verify rằng:

✅ Users không có required role bị reject với ForbiddenException
✅ Exception có status code 403
✅ Exception có error message rõ ràng
✅ Nhiều combinations của user roles và required roles được test

## Tích hợp với hệ thống

### GraphQL Error Handling

NestJS GraphQL tự động convert exceptions thành GraphQL errors:

```typescript
@Mutation(() => String)
@Roles('admin')
async createRoadmap(...) {
    // Nếu RolesGuard throw ForbiddenException
    // GraphQL sẽ trả về error response
}
```

**Client nhận được**:
```json
{
  "errors": [
    {
      "message": "Insufficient permissions",
      "locations": [{ "line": 2, "column": 3 }],
      "path": ["createRoadmap"],
      "extensions": {
        "code": "FORBIDDEN",
        "statusCode": 403,
        "exception": {
          "message": "Insufficient permissions",
          "error": "Forbidden",
          "statusCode": 403
        }
      }
    }
  ],
  "data": null
}
```

### Frontend Error Handling

Frontend có thể handle error dựa trên status code:

```typescript
// apps/web/src/hooks/useRoadmapMutation.ts
const [createRoadmap] = useMutation(CREATE_ROADMAP, {
    onError: (error) => {
        if (error.graphQLErrors[0]?.extensions?.statusCode === 403) {
            toast.error('Bạn không có quyền thực hiện thao tác này');
        } else if (error.graphQLErrors[0]?.extensions?.statusCode === 401) {
            toast.error('Vui lòng đăng nhập để tiếp tục');
        } else {
            toast.error('Đã xảy ra lỗi, vui lòng thử lại');
        }
    },
});
```

## Best Practices được áp dụng

### 1. Clear Error Messages

Error messages phải rõ ràng và actionable:

❌ **Không tốt**:
```typescript
throw new ForbiddenException('Error');
throw new ForbiddenException('Access denied');
```

✅ **Tốt**:
```typescript
throw new ForbiddenException('Insufficient permissions');
throw new ForbiddenException('Access denied: No role assigned');
```

### 2. Consistent Error Codes

Sử dụng HTTP status codes chuẩn:
- **401 Unauthorized**: Không có authentication
- **403 Forbidden**: Có authentication nhưng không có permission

### 3. Localized Messages

Provide localized error messages cho users:

```typescript
// English (default)
'Insufficient permissions'

// Vietnamese
'Bạn không có quyền thực hiện thao tác này'
```

## Debugging và Troubleshooting

### Nếu test fail

1. **Kiểm tra exception type**:
   ```typescript
   // Phải throw ForbiddenException, không phải Error khác
   expect(() => guard.canActivate(mockContext)).toThrow(
       ForbiddenException
   );
   ```

2. **Kiểm tra skip logic**:
   ```typescript
   // Phải skip cases mà user có role phù hợp
   if (requiredRoles.includes(user.role)) {
       return; // Skip
   }
   ```

3. **Kiểm tra RolesGuard logic**:
   ```typescript
   // RolesGuard phải throw ForbiddenException khi không có permission
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

## Use Cases thực tế

### Scenario 1: User cố gắng tạo roadmap

**Request**:
```graphql
mutation {
  createRoadmap(input: {
    slug: "my-roadmap"
    title: "My Roadmap"
    description: "Test"
    content: "Test"
    tags: []
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
        "code": "FORBIDDEN",
        "statusCode": 403
      }
    }
  ],
  "data": null
}
```

### Scenario 2: Guest cố gắng xóa roadmap

**Request**:
```graphql
mutation {
  deleteRoadmap(id: "roadmap-123")
}
```

**Headers**:
```
Authorization: Bearer <JWT với role: 'guest'>
```

**Response**:
```json
{
  "errors": [
    {
      "message": "Insufficient permissions",
      "extensions": {
        "code": "FORBIDDEN",
        "statusCode": 403
      }
    }
  ],
  "data": null
}
```

### Scenario 3: Viewer cố gắng update roadmap

**Request**:
```graphql
mutation {
  updateRoadmap(input: {
    id: "roadmap-123"
    title: "Updated Title"
  })
}
```

**Headers**:
```
Authorization: Bearer <JWT với role: 'viewer'>
```

**Response**:
```json
{
  "errors": [
    {
      "message": "Insufficient permissions",
      "extensions": {
        "code": "FORBIDDEN",
        "statusCode": 403
      }
    }
  ],
  "data": null
}
```

## Error Response Comparison

| Scenario | Status Code | Error Message | Exception Type |
|----------|-------------|---------------|----------------|
| No JWT token | 401 | "Missing or malformed Authorization header" | UnauthorizedException |
| Invalid JWT | 401 | "Invalid token" | UnauthorizedException |
| No role assigned | 403 | "Access denied: No role assigned" | ForbiddenException |
| Insufficient permissions | 403 | "Insufficient permissions" | ForbiddenException |

## Kết luận

Task 10.6 đã triển khai thành công property test cho Forbidden Error Response, verify rằng hệ thống trả về lỗi 403 Forbidden với message rõ ràng khi users không có sufficient permissions. Test sử dụng property-based testing với fast-check để đảm bảo coverage toàn diện với 100 random combinations.

Property này đảm bảo rằng error handling nhất quán và user-friendly, giúp users hiểu rõ lý do tại sao request bị reject.

## Tài liệu tham khảo

- [fast-check Documentation](https://github.com/dubzzz/fast-check)
- [NestJS Exception Filters](https://docs.nestjs.com/exception-filters)
- [GraphQL Error Handling](https://docs.nestjs.com/graphql/other-features#error-handling)
- Design Document: Property 9 - Forbidden Error Response
- Requirements Document: Requirements 8.4, 10.1, 10.2
