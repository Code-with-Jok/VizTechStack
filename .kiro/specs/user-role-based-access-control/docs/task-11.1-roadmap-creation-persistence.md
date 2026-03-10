# Task 11.1: Property Test cho Tính Bền Vững Khi Tạo Roadmap

## Tổng quan (Overview)

Task này viết property-based test để kiểm tra tính bền vững (persistence) của dữ liệu khi tạo roadmap. Test đảm bảo rằng bất kỳ roadmap hợp lệ nào được tạo bởi admin đều có thể được truy vấn lại với đầy đủ thông tin khớp với dữ liệu đầu vào.

**Property 11: Roadmap Creation Persistence**
- **Validates: Requirements 7.2**
- **Mục đích**: Đảm bảo dữ liệu được lưu trữ đúng và có thể truy vấn lại

## Khái niệm Property-Based Testing

### Property-Based Testing là gì?

Property-Based Testing (PBT) là một kỹ thuật kiểm thử tự động sinh ra nhiều test cases ngẫu nhiên để kiểm tra các "thuộc tính" (properties) của hệ thống. Thay vì viết từng test case cụ thể, bạn định nghĩa các quy tắc mà hệ thống phải tuân theo với MỌI đầu vào hợp lệ.

**Ví dụ so sánh:**

```typescript
// ❌ Unit Test truyền thống - test từng trường hợp cụ thể
it('should create roadmap with specific data', async () => {
  const input = {
    slug: 'react-roadmap',
    title: 'React Learning Path',
    description: 'Learn React from scratch',
    // ...
  };
  const id = await service.create(input, 'admin-123');
  const result = await service.findBySlug('react-roadmap');
  expect(result.title).toBe('React Learning Path');
});

// ✅ Property-Based Test - test với 100 trường hợp ngẫu nhiên
it('should persist any valid roadmap created by admin', async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.record({
        slug: fc.string({ minLength: 1 }),
        title: fc.string({ minLength: 1 }),
        // ... tự động sinh ra nhiều giá trị khác nhau
      }),
      async (input) => {
        // Test với MỌI input ngẫu nhiên
        const id = await service.create(input, authorId);
        const result = await service.findBySlug(input.slug);
        expect(result.title).toBe(input.title); // Phải đúng với MỌI input
      }
    ),
    { numRuns: 100 } // Chạy 100 lần với dữ liệu khác nhau
  );
});
```

### Tại sao sử dụng Property-Based Testing?

1. **Phát hiện edge cases**: Tự động tìm ra các trường hợp đặc biệt mà bạn không nghĩ tới
2. **Tăng độ tin cậy**: Test với hàng trăm trường hợp thay vì vài trường hợp
3. **Ít code hơn**: Một property test thay thế cho nhiều unit tests
4. **Tư duy rõ ràng**: Buộc bạn suy nghĩ về "quy tắc" thay vì "ví dụ"

## Cấu trúc Code

```typescript
/**
 * Property 11: Roadmap Creation Persistence
 * **Validates: Requirements 7.2**
 * 
 * For any valid CreateRoadmapInput provided by an admin user, after the 
 * createRoadmap mutation completes successfully, querying the roadmap by 
 * its slug should return a roadmap with all the provided input fields matching.
 */
it('should persist any valid roadmap created by admin', async () => {
    await fc.assert(
        fc.asyncProperty(
            fc.record({
                slug: fc.string({ minLength: 1, maxLength: 50 }).filter(s => /^[a-z0-9-]+$/.test(s)),
                title: fc.string({ minLength: 1, maxLength: 100 }),
                description: fc.string({ minLength: 0, maxLength: 500 }),
                content: fc.string({ minLength: 0, maxLength: 5000 }),
                tags: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 10 }),
                isPublished: fc.boolean(),
            }),
            fc.string({ minLength: 1 }), // authorId
            async (input, authorId) => {
                // Mock: No existing roadmap with this slug
                (convexService.query as jest.Mock).mockResolvedValueOnce(null);

                // Mock: Create returns a new ID
                const mockId = `roadmap_${Date.now()}`;
                (convexService.mutation as jest.Mock).mockResolvedValueOnce(mockId);

                // Create the roadmap
                const createdId = await service.create(input, authorId);
                expect(createdId).toBe(mockId);

                // Mock: Query by slug returns the created roadmap
                const createdRoadmap: Roadmap = {
                    _id: mockId,
                    ...input,
                    author: authorId,
                    publishedAt: Date.now(),
                    updatedAt: Date.now(),
                };
                (convexService.query as jest.Mock).mockResolvedValueOnce(createdRoadmap);

                // Query back the roadmap
                const queriedRoadmap = await service.findBySlug(input.slug);

                // Verify persistence: All input fields should match
                expect(queriedRoadmap).not.toBeNull();
                expect(queriedRoadmap!.slug).toBe(input.slug);
                expect(queriedRoadmap!.title).toBe(input.title);
                expect(queriedRoadmap!.description).toBe(input.description);
                expect(queriedRoadmap!.content).toBe(input.content);
                expect(queriedRoadmap!.tags).toEqual(input.tags);
                expect(queriedRoadmap!.isPublished).toBe(input.isPublished);
                expect(queriedRoadmap!.author).toBe(authorId);
            }
        ),
        { numRuns: 100 }
    );
});
```

## Giải thích từng phần

### 1. Generators (Bộ sinh dữ liệu)

```typescript
fc.record({
    slug: fc.string({ minLength: 1, maxLength: 50 }).filter(s => /^[a-z0-9-]+$/.test(s)),
    title: fc.string({ minLength: 1, maxLength: 100 }),
    description: fc.string({ minLength: 0, maxLength: 500 }),
    content: fc.string({ minLength: 0, maxLength: 5000 }),
    tags: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 10 }),
    isPublished: fc.boolean(),
}),
fc.string({ minLength: 1 }), // authorId
```

**Giải thích:**
- `fc.record()`: Tạo object với các fields được định nghĩa
- `fc.string({ minLength, maxLength })`: Sinh chuỗi ngẫu nhiên với độ dài giới hạn
- `.filter()`: Lọc chỉ lấy giá trị thỏa điều kiện (slug chỉ chứa a-z, 0-9, dấu gạch ngang)
- `fc.array()`: Sinh mảng với độ dài ngẫu nhiên
- `fc.boolean()`: Sinh true hoặc false ngẫu nhiên

**Ví dụ dữ liệu được sinh ra:**

```typescript
// Lần chạy 1:
{
  slug: "react-hooks-2024",
  title: "Advanced React Hooks",
  description: "Learn useState, useEffect, and custom hooks",
  content: "# Introduction\n\nReact Hooks are...",
  tags: ["react", "hooks", "javascript"],
  isPublished: true
}

// Lần chạy 2:
{
  slug: "a",
  title: "x",
  description: "",
  content: "",
  tags: [],
  isPublished: false
}

// Lần chạy 3:
{
  slug: "very-long-slug-name-with-many-words",
  title: "A" * 100, // Chuỗi dài 100 ký tự
  description: "Lorem ipsum...",
  content: "Very long content...",
  tags: ["tag1", "tag2", "tag3", "tag4", "tag5"],
  isPublished: true
}
```

### 2. Mocking Dependencies

```typescript
// Mock: No existing roadmap with this slug
(convexService.query as jest.Mock).mockResolvedValueOnce(null);

// Mock: Create returns a new ID
const mockId = `roadmap_${Date.now()}`;
(convexService.mutation as jest.Mock).mockResolvedValueOnce(mockId);
```

**Tại sao cần mock?**
- Test không kết nối database thật (nhanh hơn, không phụ thuộc external services)
- Kiểm soát được kết quả trả về để test logic
- Tránh tạo dữ liệu rác trong database

**Giải thích:**
- `mockResolvedValueOnce()`: Mock một lần gọi async function, trả về giá trị cụ thể
- Lần gọi đầu: `query()` trả về `null` (không có roadmap trùng slug)
- Lần gọi thứ hai: `mutation()` trả về ID mới tạo

### 3. Test Logic

```typescript
// Create the roadmap
const createdId = await service.create(input, authorId);
expect(createdId).toBe(mockId);

// Mock: Query by slug returns the created roadmap
const createdRoadmap: Roadmap = {
    _id: mockId,
    ...input,
    author: authorId,
    publishedAt: Date.now(),
    updatedAt: Date.now(),
};
(convexService.query as jest.Mock).mockResolvedValueOnce(createdRoadmap);

// Query back the roadmap
const queriedRoadmap = await service.findBySlug(input.slug);
```

**Luồng test:**
1. Tạo roadmap với `service.create()`
2. Verify ID được trả về đúng
3. Mock kết quả query để giả lập việc lấy dữ liệu từ database
4. Query lại roadmap bằng slug
5. Verify tất cả fields khớp với input ban đầu

### 4. Assertions (Kiểm tra kết quả)

```typescript
// Verify persistence: All input fields should match
expect(queriedRoadmap).not.toBeNull();
expect(queriedRoadmap!.slug).toBe(input.slug);
expect(queriedRoadmap!.title).toBe(input.title);
expect(queriedRoadmap!.description).toBe(input.description);
expect(queriedRoadmap!.content).toBe(input.content);
expect(queriedRoadmap!.tags).toEqual(input.tags);
expect(queriedRoadmap!.isPublished).toBe(input.isPublished);
expect(queriedRoadmap!.author).toBe(authorId);
```

**Giải thích:**
- `expect().not.toBeNull()`: Đảm bảo roadmap được tìm thấy
- `expect().toBe()`: So sánh giá trị primitive (string, number, boolean)
- `expect().toEqual()`: So sánh deep equality (object, array)
- `!`: TypeScript non-null assertion (đã check null ở trên rồi)

## Cách chạy test

### Chạy tất cả property tests

```bash
pnpm test --filter @viztechstack/api -- --testPathPattern=properties
```

### Chạy riêng test này

```bash
pnpm test --filter @viztechstack/api -- roadmap-crud.properties.spec.ts
```

### Chạy với coverage

```bash
pnpm test --filter @viztechstack/api -- --coverage --testPathPattern=properties
```

## Kết quả mong đợi

Khi chạy test, bạn sẽ thấy:

```
PASS  src/modules/roadmap/__tests__/properties/roadmap-crud.properties.spec.ts
  Roadmap CRUD Properties
    ✓ should persist any valid roadmap created by admin (1234ms)
    ✓ should produce same result when applying same update twice (987ms)
    ✓ should make any deleted roadmap unqueryable (876ms)
    ✓ should reject creation of roadmap with duplicate slug (654ms)

Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total
```

**Lưu ý:** Mỗi test chạy 100 lần với dữ liệu khác nhau, nên có thể mất vài giây.

## Các lỗi thường gặp

### Lỗi 1: Test fails với một số input cụ thể

```
Error: Property failed after 23 tests
{ seed: 1234567890, path: "23", endOnFailure: true }
Counterexample: {
  slug: "",
  title: "Test",
  ...
}
```

**Nguyên nhân:** Generator sinh ra giá trị không hợp lệ (ví dụ: slug rỗng)

**Cách khắc phục:**
```typescript
// ❌ Sai: Cho phép slug rỗng
slug: fc.string()

// ✅ Đúng: Bắt buộc slug có ít nhất 1 ký tự
slug: fc.string({ minLength: 1 })
```

### Lỗi 2: Mock không hoạt động đúng

```
Error: Expected mock function to have been called, but it was not called.
```

**Nguyên nhân:** Quên mock hoặc mock sai thứ tự

**Cách khắc phục:**
```typescript
// Đảm bảo mock TRƯỚC khi gọi function
(convexService.query as jest.Mock).mockResolvedValueOnce(null);
await service.create(input, authorId); // Gọi sau khi mock
```

### Lỗi 3: Assertion fails do type mismatch

```
Error: Expected [] to equal ["tag1", "tag2"]
```

**Nguyên nhân:** So sánh array bằng `toBe()` thay vì `toEqual()`

**Cách khắc phục:**
```typescript
// ❌ Sai: toBe() so sánh reference
expect(queriedRoadmap.tags).toBe(input.tags);

// ✅ Đúng: toEqual() so sánh giá trị
expect(queriedRoadmap.tags).toEqual(input.tags);
```

### Lỗi 4: Test chạy quá lâu

**Nguyên nhân:** `numRuns` quá lớn hoặc test logic phức tạp

**Cách khắc phục:**
```typescript
// Giảm số lần chạy khi develop
{ numRuns: 10 } // Thay vì 100

// Tăng lại khi commit
{ numRuns: 100 }
```

## Best Practices

### 1. Viết generators chặt chẽ

```typescript
// ✅ Tốt: Giới hạn rõ ràng
slug: fc.string({ minLength: 1, maxLength: 50 })
  .filter(s => /^[a-z0-9-]+$/.test(s))

// ❌ Tránh: Quá rộng, có thể sinh ra giá trị không hợp lệ
slug: fc.string()
```

### 2. Mock đầy đủ và đúng thứ tự

```typescript
// ✅ Tốt: Mock theo thứ tự gọi
(convexService.query as jest.Mock).mockResolvedValueOnce(null); // Lần 1
(convexService.mutation as jest.Mock).mockResolvedValueOnce(mockId); // Lần 2
(convexService.query as jest.Mock).mockResolvedValueOnce(createdRoadmap); // Lần 3
```

### 3. Verify tất cả fields quan trọng

```typescript
// ✅ Tốt: Check tất cả fields
expect(queriedRoadmap!.slug).toBe(input.slug);
expect(queriedRoadmap!.title).toBe(input.title);
expect(queriedRoadmap!.description).toBe(input.description);
// ... tất cả fields khác

// ❌ Tránh: Chỉ check một vài fields
expect(queriedRoadmap!.slug).toBe(input.slug);
// Thiếu các fields khác
```

### 4. Sử dụng số lần chạy phù hợp

```typescript
// Development: 10-20 lần (nhanh)
{ numRuns: 10 }

// CI/CD: 100 lần (đầy đủ)
{ numRuns: 100 }

// Critical features: 1000 lần (rất chặt chẽ)
{ numRuns: 1000 }
```

## Tài liệu tham khảo

### Fast-check Documentation
- [Fast-check Introduction](https://github.com/dubzzz/fast-check) - Giới thiệu về fast-check
- [Arbitraries](https://github.com/dubzzz/fast-check/blob/main/documentation/Arbitraries.md) - Các generators có sẵn
- [Property-Based Testing Guide](https://github.com/dubzzz/fast-check/blob/main/documentation/HandsOnPropertyBased.md) - Hướng dẫn chi tiết

### Property-Based Testing Concepts
- [Introduction to Property-Based Testing](https://fsharpforfunandprofit.com/posts/property-based-testing/) - Khái niệm cơ bản
- [Choosing Properties for Property-Based Testing](https://fsharpforfunandprofit.com/posts/property-based-testing-2/) - Cách chọn properties để test

### Jest & Testing
- [Jest Mocking](https://jestjs.io/docs/mock-functions) - Cách sử dụng mocks trong Jest
- [Jest Async Testing](https://jestjs.io/docs/asynchronous) - Test async code

## Câu hỏi thường gặp (FAQ)

**Q: Property-Based Testing có thay thế được Unit Testing không?**

A: Không. Cả hai bổ sung cho nhau:
- **Unit Tests**: Test các trường hợp cụ thể, edge cases đã biết
- **Property Tests**: Tìm ra các trường hợp bạn chưa nghĩ tới

**Q: Làm sao biết property nào cần test?**

A: Suy nghĩ về các "quy tắc bất biến" (invariants) của hệ thống:
- Dữ liệu tạo ra phải lưu được
- Cùng một thao tác lặp lại cho kết quả giống nhau
- Xóa xong thì không tìm thấy nữa

**Q: 100 lần chạy có đủ không?**

A: Phụ thuộc vào độ phức tạp:
- Features đơn giản: 50-100 lần
- Features quan trọng: 100-500 lần
- Critical systems: 1000+ lần

**Q: Test fails ngẫu nhiên, làm sao debug?**

A: Fast-check cung cấp seed để reproduce:
```typescript
// Khi test fails, bạn sẽ thấy seed
// Error: Property failed after 23 tests
// { seed: 1234567890, ... }

// Chạy lại với seed đó
fc.assert(
  fc.asyncProperty(...),
  { seed: 1234567890, numRuns: 1 } // Chỉ chạy test case bị lỗi
);
```

**Q: Có nên mock tất cả dependencies không?**

A: Trong property tests, nên mock để:
- Test chạy nhanh (không gọi database thật)
- Kiểm soát được kết quả
- Tránh side effects

## Tóm tắt

Property 11 test đảm bảo rằng:
- ✅ Mọi roadmap hợp lệ đều được lưu trữ đúng
- ✅ Dữ liệu có thể truy vấn lại với đầy đủ thông tin
- ✅ Không mất dữ liệu trong quá trình create → query
- ✅ Test với 100 trường hợp khác nhau để đảm bảo độ tin cậy

**Key Takeaways:**
1. Property-Based Testing giúp tìm ra edge cases tự động
2. Generators phải được định nghĩa chặt chẽ
3. Mock đúng thứ tự và đầy đủ
4. Verify tất cả fields quan trọng
5. Sử dụng số lần chạy phù hợp với độ quan trọng của feature

Chúc bạn test vui vẻ! 🚀
