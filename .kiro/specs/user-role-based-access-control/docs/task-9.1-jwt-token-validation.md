# Tài liệu Task 9.1: Property Test cho JWT Token Validation

## Tổng quan

Task này triển khai property-based test để kiểm tra tính đúng đắn của việc xác thực JWT token từ Clerk trong hệ thống backend. Test này đảm bảo rằng ClerkAuthGuard hoạt động chính xác với mọi JWT token hợp lệ.

## Property-Based Testing là gì?

### Khái niệm cơ bản

**Property-Based Testing (PBT)** là một phương pháp kiểm thử tự động trong đó bạn định nghĩa các "thuộc tính" (properties) mà code của bạn phải thỏa mãn, sau đó framework sẽ tự động sinh ra hàng trăm test cases ngẫu nhiên để kiểm tra xem thuộc tính đó có đúng không.

### So sánh với Unit Testing truyền thống

**Unit Testing truyền thống:**
```typescript
it('should verify a specific JWT token', () => {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
  const result = verifyToken(token);
  expect(result.sub).toBe('user_123');
});
```

**Property-Based Testing:**
```typescript
it('should verify ANY valid JWT token', async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.record({
        sub: fc.string({ minLength: 1 }),
        email: fc.emailAddress(),
        metadata: fc.record({
          role: fc.constantFrom('admin', 'user'),
        }),
      }),
      async (validPayload) => {
        // Test với 100 payloads ngẫu nhiên khác nhau
        const result = await verifyToken(validPayload);
        expect(result).toBeDefined();
      }
    ),
    { numRuns: 100 }
  );
});
```

### Ưu điểm của Property-Based Testing

1. **Phát hiện edge cases**: Tự động tìm ra các trường hợp đặc biệt mà bạn có thể không nghĩ tới
2. **Tăng độ tin cậy**: Chạy hàng trăm test cases thay vì chỉ vài cases cố định
3. **Tài liệu sống**: Properties mô tả rõ ràng hành vi mong đợi của hệ thống
4. **Shrinking**: Khi test fail, framework tự động thu nhỏ input để tìm ra ví dụ đơn giản nhất gây lỗi

## Property 1: JWT Token Validation

### Mô tả Property

**Property**: *Với bất kỳ JWT token hợp lệ nào được cấp bởi Clerk, khi backend nhận được token đó trong Authorization header, ClerkAuthGuard phải xác thực thành công và trích xuất thông tin người dùng.*

### Yêu cầu được kiểm tra

- **Requirement 2.2**: Khi người dùng đăng nhập thành công qua Clerk, hệ thống phải xác thực thông tin người dùng
- **Requirement 8.1**: Khi Backend nhận được yêu cầu API, hệ thống phải xác thực JWT token từ Clerk

### Cách hoạt động của test

```typescript
it('should verify any valid Clerk JWT token', async () => {
    await fc.assert(
        fc.asyncProperty(
            // 1. Định nghĩa cấu trúc dữ liệu ngẫu nhiên
            fc.record({
                sub: fc.string({ minLength: 1 }),        // User ID
                email: fc.emailAddress(),                 // Email hợp lệ
                metadata: fc.record({
                    role: fc.constantFrom('admin', 'user'), // Role: admin hoặc user
                }),
            }),
            // 2. Hàm test được chạy với mỗi payload ngẫu nhiên
            async (validPayload) => {
                // Mock verifyToken để trả về payload
                mockVerifyToken.mockResolvedValueOnce(validPayload as any);

                // Tạo mock token
                const mockToken = `valid.jwt.token-${validPayload.sub}`;
                const mockContext = createMockExecutionContext(mockToken);

                // Mock endpoint là protected (không public)
                jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

                // 3. Thực hiện test
                const result = await guard.canActivate(mockContext);
                
                // 4. Kiểm tra kết quả
                expect(result).toBe(true);
                expect(mockVerifyToken).toHaveBeenCalled();
                
                // Kiểm tra user được attach vào request
                const gqlContext = GqlExecutionContext.create(mockContext).getContext<{ req: any }>();
                expect(gqlContext.req.user).toBeDefined();
                expect(gqlContext.req.user.sub).toBe(validPayload.sub);
                expect(gqlContext.req.user.role).toBe(validPayload.metadata.role);
            }
        ),
        { numRuns: 100 } // Chạy 100 lần với dữ liệu ngẫu nhiên khác nhau
    );
});
```

### Giải thích từng bước

#### Bước 1: Định nghĩa generators

```typescript
fc.record({
    sub: fc.string({ minLength: 1 }),
    email: fc.emailAddress(),
    metadata: fc.record({
        role: fc.constantFrom('admin', 'user'),
    }),
})
```

- `fc.record()`: Tạo object với các fields cố định
- `fc.string({ minLength: 1 })`: Tạo string ngẫu nhiên có độ dài tối thiểu 1
- `fc.emailAddress()`: Tạo email hợp lệ ngẫu nhiên
- `fc.constantFrom('admin', 'user')`: Chọn ngẫu nhiên giữa 'admin' hoặc 'user'

#### Bước 2: Mock dependencies

```typescript
mockVerifyToken.mockResolvedValueOnce(validPayload as any);
```

Vì chúng ta không thể tạo JWT token thật từ Clerk trong test, chúng ta mock hàm `verifyToken` để trả về payload mong muốn.

#### Bước 3: Tạo mock context

```typescript
const mockContext = createMockExecutionContext(mockToken);
```

Tạo một ExecutionContext giả lập để test guard mà không cần khởi động toàn bộ NestJS application.

#### Bước 4: Assertions

```typescript
expect(result).toBe(true);
expect(gqlContext.req.user.sub).toBe(validPayload.sub);
expect(gqlContext.req.user.role).toBe(validPayload.metadata.role);
```

Kiểm tra rằng:
- Guard cho phép request đi qua (return true)
- User information được trích xuất đúng từ token
- Role được gán đúng vào request context

## Cấu trúc file test

```
apps/api/src/modules/roadmap/__tests__/properties/
└── auth.properties.spec.ts
```

### Các test cases trong file

1. **Property 1: JWT Token Validation** ✅
   - Kiểm tra xác thực token hợp lệ
   - Validates: Requirements 2.2, 8.1

2. **Property 2: Role Extraction from JWT** ✅
   - Kiểm tra trích xuất role từ token
   - Default role là 'user' nếu không có trong metadata
   - Validates: Requirements 2.3, 8.2

3. **Property 8: Invalid Token Error Response** ✅
   - Kiểm tra từ chối token không hợp lệ
   - Phải trả về 401 Unauthorized
   - Validates: Requirements 8.5

4. **Missing Authorization Header** ✅
   - Kiểm tra từ chối request không có Authorization header
   - Validates: Requirements 8.5

5. **Public Endpoints Bypass Authentication** ✅
   - Kiểm tra endpoints public không cần authentication
   - Validates: Requirements 1.3, 4.1

## Cách chạy test

### Chạy tất cả property tests

```bash
pnpm test --filter @viztechstack/api -- auth.properties.spec.ts
```

### Chạy chỉ test này

```bash
cd apps/api
pnpm jest auth.properties.spec.ts
```

### Chạy với verbose mode

```bash
pnpm jest auth.properties.spec.ts --verbose
```

### Chạy với coverage

```bash
pnpm jest auth.properties.spec.ts --coverage
```

## Kết quả mong đợi

Khi test chạy thành công, bạn sẽ thấy:

```
PASS  src/modules/roadmap/__tests__/properties/auth.properties.spec.ts
  Authentication Properties
    ✓ should verify any valid Clerk JWT token (75 ms)
    ✓ should extract role from any authenticated request, defaulting to user (16 ms)
    ✓ should reject any invalid JWT token format with 401 (165 ms)
    ✓ should reject any request without Authorization header (28 ms)
    ✓ should allow any request to public endpoints without authentication (17 ms)

Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total
```

## Các vấn đề thường gặp và cách khắc phục

### 1. Test fail với "Authentication is unavailable"

**Nguyên nhân**: `CLERK_SECRET_KEY` không được set trong test environment.

**Giải pháp**:
```typescript
beforeAll(() => {
    process.env.CLERK_SECRET_KEY = 'test-secret-key';
});
```

### 2. Mock không hoạt động

**Nguyên nhân**: Mock được định nghĩa sau khi module đã được import.

**Giải pháp**: Đảm bảo `jest.mock()` được gọi TRƯỚC khi import module:
```typescript
// Mock TRƯỚC
jest.mock('@clerk/backend', () => ({
    verifyToken: jest.fn(),
}));

// Import SAU
import { verifyToken } from '@clerk/backend';
```

### 3. Test chạy chậm

**Nguyên nhân**: Chạy quá nhiều iterations.

**Giải pháp**: Giảm `numRuns` trong quá trình development:
```typescript
{ numRuns: 10 } // Thay vì 100
```

### 4. Counterexample khó hiểu

**Nguyên nhân**: fast-check shrink input xuống quá nhỏ.

**Giải pháp**: Chạy với verbose mode để xem tất cả failing values:
```bash
pnpm jest auth.properties.spec.ts --verbose
```

### 5. Test fail ngẫu nhiên

**Nguyên nhân**: Mock không được reset giữa các test runs.

**Giải pháp**:
```typescript
beforeEach(() => {
    jest.clearAllMocks();
});
```

## Kiến thức cần có

### Trước khi đọc code

- **TypeScript**: Hiểu về async/await, Promises, generics
- **Jest**: Biết cách viết unit tests cơ bản
- **NestJS**: Hiểu về Guards, ExecutionContext
- **JWT**: Biết cấu trúc của JWT token

### Để hiểu sâu hơn

- **fast-check**: Đọc documentation tại https://fast-check.dev/
- **Property-Based Testing**: Đọc về khái niệm PBT
- **Mocking**: Hiểu về jest.mock(), jest.spyOn()
- **GraphQL Context**: Hiểu cách NestJS xử lý GraphQL requests

## Tài liệu tham khảo

### fast-check Documentation
- **Arbitraries**: https://fast-check.dev/docs/core-blocks/arbitraries/
- **Async Properties**: https://fast-check.dev/docs/core-blocks/properties/#async-properties
- **Shrinking**: https://fast-check.dev/docs/core-blocks/shrinking/

### NestJS Documentation
- **Guards**: https://docs.nestjs.com/guards
- **Testing**: https://docs.nestjs.com/fundamentals/testing

### Clerk Documentation
- **JWT Verification**: https://clerk.com/docs/backend-requests/handling/nodejs

## Câu hỏi thường gặp (FAQ)

### Q: Tại sao phải chạy 100 lần?

**A**: Số lần chạy càng nhiều, khả năng phát hiện bug càng cao. 100 là con số cân bằng giữa thời gian chạy và độ tin cậy.

### Q: Làm sao biết test có đủ tốt không?

**A**: Test tốt khi:
- Chạy nhanh (< 2 giây)
- Cover được nhiều edge cases
- Dễ hiểu và maintain
- Fail rõ ràng khi có bug

### Q: Khi nào nên dùng PBT thay vì unit test?

**A**: Dùng PBT khi:
- Logic phức tạp với nhiều edge cases
- Muốn test với nhiều inputs khác nhau
- Có thể định nghĩa được properties rõ ràng

Dùng unit test khi:
- Test cases cụ thể, quan trọng
- Test error handling với inputs đặc biệt
- Test integration với external services

### Q: Làm sao debug khi test fail?

**A**: 
1. Xem counterexample trong error message
2. Chạy lại test với seed cụ thể:
   ```typescript
   { seed: -644060918 }
   ```
3. Thêm console.log trong test function
4. Giảm numRuns xuống 1 để test với input cụ thể

## Kết luận

Property-based testing là một công cụ mạnh mẽ để đảm bảo tính đúng đắn của code. Test này kiểm tra rằng ClerkAuthGuard hoạt động chính xác với mọi JWT token hợp lệ, không chỉ với một vài test cases cố định.

Khi bạn hiểu rõ cách viết và chạy property tests, bạn có thể áp dụng kỹ thuật này cho các phần khác của hệ thống để tăng độ tin cậy và chất lượng code.
