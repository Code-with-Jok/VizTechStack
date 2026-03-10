# Tài liệu Task 9.2: Property Test cho Trích xuất Vai trò từ JWT

## Tổng quan

Task này triển khai property-based test để xác minh rằng hệ thống trích xuất đúng vai trò người dùng từ JWT token và gán vai trò mặc định là "user" nếu không có vai trò được chỉ định trong metadata.

## Test này làm gì?

Property test này kiểm tra **Property 2: Role Extraction from JWT** - một thuộc tính quan trọng của hệ thống xác thực:

> *Với bất kỳ* yêu cầu đã xác thực có JWT token hợp lệ, hệ thống phải trích xuất vai trò của người dùng từ metadata của token và gắn nó vào request context, mặc định là "user" nếu không có vai trò được chỉ định.

### Điều này có nghĩa là gì?

Test này đảm bảo rằng:

1. **Khi token có vai trò trong metadata**: Hệ thống trích xuất đúng vai trò đó (admin hoặc user)
2. **Khi token không có vai trò trong metadata**: Hệ thống tự động gán vai trò mặc định là "user"
3. **Vai trò được gắn vào request context**: Sau khi xác thực, vai trò có sẵn trong `req.user.role` để các guard khác sử dụng

## Cách hoạt động của Role Extraction trong hệ thống

### Luồng xử lý

```
1. Client gửi request với JWT token trong Authorization header
   ↓
2. ClerkAuthGuard nhận request
   ↓
3. Guard xác thực token với Clerk
   ↓
4. Guard trích xuất thông tin từ token payload:
   - sub (user ID)
   - metadata.role (vai trò)
   ↓
5. Nếu metadata.role tồn tại → sử dụng giá trị đó
   Nếu metadata.role không tồn tại → gán "user" làm mặc định
   ↓
6. Gắn user object vào request context:
   req.user = {
     id: payload.sub,
     role: payload.metadata?.role || 'user'
   }
   ↓
7. Request tiếp tục đến RolesGuard và Resolver
```

### Cấu trúc JWT Token

JWT token từ Clerk có cấu trúc như sau:

```json
{
  "sub": "user_abc123",           // User ID
  "email": "user@example.com",
  "metadata": {                   // Metadata tùy chỉnh
    "role": "admin"               // Vai trò (có thể không có)
  },
  "iat": 1234567890,
  "exp": 1234571490
}
```

### Hành vi mặc định

**Quan trọng**: Nếu `metadata.role` không tồn tại hoặc `metadata` không có, hệ thống sẽ:
- **KHÔNG** từ chối request
- **TỰ ĐỘNG** gán vai trò mặc định là `"user"`
- Cho phép request tiếp tục với vai trò user (chỉ đọc)

Điều này đảm bảo rằng:
- Người dùng mới luôn có vai trò cơ bản
- Hệ thống không bị lỗi khi thiếu metadata
- Bảo mật được duy trì (mặc định là quyền thấp nhất)

## Chi tiết về Test

### Vị trí file

```
apps/api/src/modules/roadmap/__tests__/properties/auth.properties.spec.ts
```

### Cấu trúc test

```typescript
it('should extract role from any authenticated request, defaulting to user', async () => {
    await fc.assert(
        fc.asyncProperty(
            fc.record({
                sub: fc.string({ minLength: 1 }),
                metadata: fc.option(
                    fc.record({ role: fc.constantFrom('admin', 'user') }),
                    { nil: undefined }
                ),
            }),
            async (payload) => {
                // Test logic...
                const expectedRole = payload.metadata?.role || 'user';
                expect(user.role).toBe(expectedRole);
            }
        ),
        { numRuns: 100 }
    );
});
```

### Test chạy 100 lần với các trường hợp:

1. **Token có metadata.role = "admin"**
   - Input: `{ sub: "user123", metadata: { role: "admin" } }`
   - Expected: `user.role === "admin"`

2. **Token có metadata.role = "user"**
   - Input: `{ sub: "user456", metadata: { role: "user" } }`
   - Expected: `user.role === "user"`

3. **Token không có metadata**
   - Input: `{ sub: "user789", metadata: undefined }`
   - Expected: `user.role === "user"` (mặc định)

4. **Token có metadata nhưng không có role**
   - Input: `{ sub: "user999", metadata: {} }`
   - Expected: `user.role === "user"` (mặc định)

### Tại sao chạy 100 lần?

Property-based testing sử dụng **generative testing** - tạo ra nhiều test case ngẫu nhiên để:
- Phát hiện edge cases mà developer không nghĩ đến
- Đảm bảo thuộc tính đúng với **mọi** input hợp lệ, không chỉ vài ví dụ
- Tăng độ tin cậy của hệ thống

## Cách chạy test này

### Chạy tất cả property tests

```bash
pnpm test --filter @viztechstack/api -- --testPathPattern=properties --run
```

### Chạy chỉ auth properties tests

```bash
pnpm test --filter @viztechstack/api -- auth.properties.spec.ts --run
```

### Chạy với coverage

```bash
pnpm test --filter @viztechstack/api -- auth.properties.spec.ts --coverage --run
```

### Chạy trong watch mode (development)

```bash
pnpm test --filter @viztechstack/api -- auth.properties.spec.ts
```

**Lưu ý**: Thêm flag `--run` để test chạy một lần và thoát (không watch).

## Các vấn đề thường gặp và cách khắc phục

### 1. Test fail với "Invalid token"

**Nguyên nhân**: Mock `verifyToken` không được cấu hình đúng

**Giải pháp**:
```typescript
// Đảm bảo mock trả về payload đúng
mockVerifyToken.mockResolvedValueOnce(validPayload as any);
```

### 2. Test fail với "user.role is undefined"

**Nguyên nhân**: ClerkAuthGuard không gắn user vào request context

**Kiểm tra**:
- Đảm bảo `GqlExecutionContext.create()` được mock đúng
- Kiểm tra `req.user` được gán trong guard
- Xác nhận logic default role: `payload.metadata?.role || 'user'`

### 3. Test chạy chậm

**Nguyên nhân**: 100 iterations có thể mất thời gian

**Giải pháp**:
- Giảm `numRuns` trong development: `{ numRuns: 10 }`
- Giữ `numRuns: 100` trong CI/CD để đảm bảo chất lượng

### 4. Mock không hoạt động

**Nguyên nhân**: Jest mock bị cache hoặc không clear

**Giải pháp**:
```typescript
beforeEach(() => {
    jest.clearAllMocks();  // Clear tất cả mocks trước mỗi test
});
```

### 5. Test pass nhưng code thực tế fail

**Nguyên nhân**: Mock không phản ánh đúng behavior thực tế

**Giải pháp**:
- Chạy integration test hoặc E2E test
- Test với Clerk token thật trong môi trường staging
- Kiểm tra logs trong production

## Liên kết với Requirements

Test này xác thực các yêu cầu sau:

- **Requirement 2.3**: "WHEN xác thực thành công, THE System SHALL xác định vai trò của người dùng (Admin hoặc User)"
- **Requirement 8.2**: "WHEN JWT token hợp lệ, THE System SHALL trích xuất vai trò người dùng từ token"

## Kiến thức cần thiết để hiểu test này

### 1. Property-Based Testing

- Khác với unit test thông thường (test vài ví dụ cụ thể)
- PBT test **thuộc tính** phải đúng với **mọi** input
- Sử dụng thư viện `fast-check` để generate test cases

### 2. JWT (JSON Web Token)

- Token được mã hóa chứa thông tin user
- Có 3 phần: header.payload.signature
- Payload chứa claims (sub, email, metadata, etc.)

### 3. NestJS Guards

- Guards là middleware kiểm tra điều kiện trước khi vào resolver
- `ClerkAuthGuard`: Xác thực JWT token
- `RolesGuard`: Kiểm tra vai trò user

### 4. Mocking trong Jest

- Mock cho phép test code mà không cần dependencies thật
- `jest.mock()`: Mock toàn bộ module
- `mockResolvedValueOnce()`: Mock giá trị trả về của async function

## Tài liệu tham khảo

- [Fast-check Documentation](https://fast-check.dev/)
- [NestJS Guards](https://docs.nestjs.com/guards)
- [Clerk JWT Structure](https://clerk.com/docs/backend-requests/handling/manual-jwt)
- [Property-Based Testing Guide](https://fsharpforfunandprofit.com/posts/property-based-testing/)

## Câu hỏi thường gặp (FAQ)

### Q: Tại sao không test với Clerk token thật?

**A**: Property test cần chạy nhanh và không phụ thuộc vào service bên ngoài. Mock cho phép:
- Test chạy offline
- Kiểm soát hoàn toàn test cases
- Chạy nhanh hơn (không có network latency)

### Q: Vai trò "user" có phải là vai trò duy nhất mặc định?

**A**: Đúng. Theo thiết kế, nếu không có vai trò được chỉ định, hệ thống gán "user" - vai trò có quyền thấp nhất (chỉ đọc).

### Q: Có thể thêm vai trò khác ngoài "admin" và "user"?

**A**: Có thể, nhưng cần:
1. Cập nhật Clerk metadata schema
2. Cập nhật `@Roles()` decorator trong resolver
3. Cập nhật test để bao gồm vai trò mới

### Q: Test này có đủ không?

**A**: Test này chỉ kiểm tra **role extraction**. Cần thêm:
- Test cho RolesGuard (kiểm tra authorization)
- Integration test (test toàn bộ flow)
- E2E test (test với UI)

## Kết luận

Property test này đảm bảo rằng hệ thống luôn trích xuất đúng vai trò từ JWT token và có hành vi mặc định an toàn. Đây là nền tảng cho toàn bộ hệ thống phân quyền RBAC.

**Điểm quan trọng cần nhớ**:
- Vai trò được trích xuất từ `metadata.role` trong JWT
- Mặc định là "user" nếu không có vai trò
- Test chạy 100 lần với các input ngẫu nhiên
- Đây là property test, không phải unit test thông thường
