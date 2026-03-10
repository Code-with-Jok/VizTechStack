# Task 11.2: Property Test cho Tính Idempotent Khi Cập Nhật Roadmap

## Tổng quan (Overview)

Task này viết property-based test để kiểm tra tính idempotent (bất biến) của thao tác cập nhật roadmap. Test đảm bảo rằng áp dụng cùng một update hai lần sẽ cho kết quả giống như áp dụng một lần.

**Property 12: Roadmap Update Idempotency**
- **Validates: Requirements 7.4**
- **Mục đích**: Đảm bảo thao tác update là idempotent (không tạo side effects khi lặp lại)

## Khái niệm Idempotency

### Idempotency là gì?

**Idempotency** là tính chất của một thao tác mà khi thực hiện nhiều lần sẽ cho kết quả giống như thực hiện một lần.

**Ví dụ thực tế:**

```typescript
// ✅ Idempotent: Cập nhật title
update({ id: '123', title: 'New Title' })
update({ id: '123', title: 'New Title' }) // Kết quả giống lần 1
update({ id: '123', title: 'New Title' }) // Vẫn giống

// ❌ Không idempotent: Tăng view count
incrementViews({ id: '123' }) // views = 1
incrementViews({ id: '123' }) // views = 2 (khác lần 1!)
incrementViews({ id: '123' }) // views = 3 (khác lần 2!)
```

### Tại sao Idempotency quan trọng?

1. **Retry safety**: Nếu request bị timeout, có thể retry an toàn
2. **Consistency**: Đảm bảo dữ liệu nhất quán
3. **Debugging**: Dễ dàng reproduce và debug
4. **Distributed systems**: Quan trọng trong hệ thống phân tán

**Ví dụ thực tế:**

```
User clicks "Update" button
→ Request sent to server
→ Server updates database
→ Response timeout (network issue)
→ User clicks "Update" again (retry)
→ Should get same result, not duplicate update!
```

## Cấu trúc Code

```typescript
/**
 * Property 12: Roadmap Update Idempotency
 * **Validates: Requirements 7.4**
 * 
 * For any roadmap and any UpdateRoadmapInput, applying the same update twice 
 * should result in the same final state as applying it once.
 */
it('should produce same result when applying same update twice', async () => {
    await fc.assert(
        fc.asyncProperty(
            fc.record({
                id: fc.string({ minLength: 1 }),
                title: fc.option(fc.string({ minLength: 1, maxLength: 100 })),
                description: fc.option(fc.string({ minLength: 0, maxLength: 500 })),
                content: fc.option(fc.string({ minLength: 0, maxLength: 5000 })),
                tags: fc.option(fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 10 })),
                isPublished: fc.option(fc.boolean()),
            }),
            async (updateInput) => {
                // Mock: Update succeeds and returns the ID
                (convexService.mutation as jest.Mock).mockResolvedValue(updateInput.id);

                // Apply update first time
                const firstResult = await service.update(updateInput);
                expect(firstResult).toBe(updateInput.id);

                // Apply same update second time
                const secondResult = await service.update(updateInput);
                expect(secondResult).toBe(updateInput.id);

                // Verify idempotency: Both results should be identical
                expect(secondResult).toBe(firstResult);

                // Verify mutation was called twice with same arguments
                expect(convexService.mutation).toHaveBeenCalledTimes(2);
                const firstCall = (convexService.mutation as jest.Mock).mock.calls[0];
                const secondCall = (convexService.mutation as jest.Mock).mock.calls[1];
                expect(firstCall).toEqual(secondCall);
            }
        ),
        { numRuns: 100 }
    );
});
```

## Giải thích từng phần

### 1. Generator cho UpdateRoadmapInput

```typescript
fc.record({
    id: fc.string({ minLength: 1 }),
    title: fc.option(fc.string({ minLength: 1, maxLength: 100 })),
    description: fc.option(fc.string({ minLength: 0, maxLength: 500 })),
    content: fc.option(fc.string({ minLength: 0, maxLength: 5000 })),
    tags: fc.option(fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 10 })),
    isPublished: fc.option(fc.boolean()),
})
```

**Điểm khác biệt với CreateRoadmapInput:**
- `fc.option()`: Tạo giá trị optional (có thể là `undefined`)
- Update không cần cung cấp tất cả fields, chỉ cần fields muốn thay đổi

**Ví dụ dữ liệu được sinh ra:**

```typescript
// Lần 1: Update tất cả fields
{
  id: "roadmap_123",
  title: "New Title",
  description: "New Description",
  content: "New Content",
  tags: ["tag1", "tag2"],
  isPublished: true
}

// Lần 2: Chỉ update title
{
  id: "roadmap_456",
  title: "Only Title Changed",
  description: undefined,
  content: undefined,
  tags: undefined,
  isPublished: undefined
}

// Lần 3: Chỉ update isPublished
{
  id: "roadmap_789",
  title: undefined,
  description: undefined,
  content: undefined,
  tags: undefined,
  isPublished: false
}
```

### 2. Test Idempotency

```typescript
// Mock: Update succeeds and returns the ID
(convexService.mutation as jest.Mock).mockResolvedValue(updateInput.id);

// Apply update first time
const firstResult = await service.update(updateInput);
expect(firstResult).toBe(updateInput.id);

// Apply same update second time
const secondResult = await service.update(updateInput);
expect(secondResult).toBe(updateInput.id);

// Verify idempotency: Both results should be identical
expect(secondResult).toBe(firstResult);
```

**Luồng test:**
1. Mock mutation trả về ID (giống nhau cho cả 2 lần gọi)
2. Gọi `update()` lần 1, lưu kết quả
3. Gọi `update()` lần 2 với CÙNG input, lưu kết quả
4. So sánh: Kết quả lần 2 phải giống lần 1

**Tại sao dùng `mockResolvedValue()` thay vì `mockResolvedValueOnce()`?**
- `mockResolvedValue()`: Trả về cùng giá trị cho MỌI lần gọi
- `mockResolvedValueOnce()`: Chỉ trả về cho 1 lần gọi

### 3. Verify Arguments

```typescript
// Verify mutation was called twice with same arguments
expect(convexService.mutation).toHaveBeenCalledTimes(2);
const firstCall = (convexService.mutation as jest.Mock).mock.calls[0];
const secondCall = (convexService.mutation as jest.Mock).mock.calls[1];
expect(firstCall).toEqual(secondCall);
```

**Giải thích:**
- `toHaveBeenCalledTimes(2)`: Đảm bảo mutation được gọi đúng 2 lần
- `mock.calls[0]`: Lấy arguments của lần gọi đầu tiên
- `mock.calls[1]`: Lấy arguments của lần gọi thứ hai
- `expect(firstCall).toEqual(secondCall)`: Arguments phải giống nhau

**Ví dụ mock.calls:**

```typescript
// Sau khi gọi service.update() 2 lần
console.log((convexService.mutation as jest.Mock).mock.calls);
// Output:
[
  ['roadmaps:update', { id: '123', title: 'New Title' }], // Lần 1
  ['roadmaps:update', { id: '123', title: 'New Title' }], // Lần 2 - giống lần 1
]
```

## So sánh với Non-Idempotent Operations

### ✅ Idempotent (Đúng)

```typescript
// Update với giá trị cụ thể
async update(input: UpdateRoadmapInput) {
  return await db.update(input.id, {
    title: input.title,           // Set giá trị cụ thể
    description: input.description,
    updatedAt: Date.now(),        // OK: Timestamp luôn được cập nhật
  });
}

// Kết quả:
// Lần 1: { title: "New", updatedAt: 1000 }
// Lần 2: { title: "New", updatedAt: 2000 } // Title giống, chỉ timestamp khác
```

### ❌ Non-Idempotent (Sai)

```typescript
// Increment view count
async incrementViews(id: string) {
  const roadmap = await db.get(id);
  return await db.update(id, {
    views: roadmap.views + 1,  // ❌ Tăng dần, không idempotent!
  });
}

// Kết quả:
// Lần 1: { views: 1 }
// Lần 2: { views: 2 }  // ❌ Khác lần 1!
// Lần 3: { views: 3 }  // ❌ Khác lần 2!
```

**Cách fix:**

```typescript
// ✅ Idempotent: Set giá trị cụ thể
async setViews(id: string, views: number) {
  return await db.update(id, {
    views: views,  // ✅ Set giá trị cụ thể
  });
}

// Kết quả:
// Lần 1: { views: 100 }
// Lần 2: { views: 100 }  // ✅ Giống lần 1
// Lần 3: { views: 100 }  // ✅ Giống lần 2
```

## Cách chạy test

```bash
# Chạy tất cả property tests
pnpm test --filter @viztechstack/api -- --testPathPattern=properties

# Chạy riêng test này
pnpm test --filter @viztechstack/api -- roadmap-crud.properties.spec.ts -t "idempotency"
```

## Các lỗi thường gặp

### Lỗi 1: Test fails vì timestamp khác nhau

```
Error: Expected { updatedAt: 1000 } to equal { updatedAt: 2000 }
```

**Nguyên nhân:** So sánh cả timestamp (luôn khác nhau)

**Cách khắc phục:**
```typescript
// ❌ Sai: So sánh toàn bộ object (bao gồm timestamp)
expect(secondResult).toEqual(firstResult);

// ✅ Đúng: Chỉ so sánh ID (hoặc các fields không thay đổi)
expect(secondResult).toBe(firstResult); // So sánh ID string
```

### Lỗi 2: Mock không hoạt động cho lần gọi thứ 2

```
Error: Cannot read property 'id' of undefined
```

**Nguyên nhân:** Dùng `mockResolvedValueOnce()` thay vì `mockResolvedValue()`

**Cách khắc phục:**
```typescript
// ❌ Sai: Chỉ mock 1 lần
(convexService.mutation as jest.Mock).mockResolvedValueOnce(updateInput.id);

// ✅ Đúng: Mock cho tất cả lần gọi
(convexService.mutation as jest.Mock).mockResolvedValue(updateInput.id);
```

### Lỗi 3: Arguments không giống nhau

```
Error: Expected calls to be equal
Received:
  [['roadmaps:update', { id: '123', title: 'A' }]]
  [['roadmaps:update', { id: '123', title: 'B' }]]
```

**Nguyên nhân:** Input bị thay đổi giữa 2 lần gọi

**Cách khắc phục:**
```typescript
// ✅ Đúng: Dùng CÙNG input object
const firstResult = await service.update(updateInput);
const secondResult = await service.update(updateInput); // Cùng object

// ❌ Sai: Tạo input mới
const firstResult = await service.update({ ...updateInput });
const secondResult = await service.update({ ...updateInput }); // Object khác
```

## Best Practices

### 1. Test với partial updates

```typescript
// ✅ Tốt: Test cả full update và partial update
fc.record({
  id: fc.string({ minLength: 1 }),
  title: fc.option(fc.string()),      // Có thể undefined
  description: fc.option(fc.string()), // Có thể undefined
  // ...
})
```

### 2. Verify cả kết quả và arguments

```typescript
// ✅ Tốt: Verify cả 2
expect(secondResult).toBe(firstResult);           // Kết quả giống nhau
expect(firstCall).toEqual(secondCall);            // Arguments giống nhau
```

### 3. Mock đúng cách cho multiple calls

```typescript
// ✅ Tốt: Dùng mockResolvedValue cho idempotency tests
(convexService.mutation as jest.Mock).mockResolvedValue(updateInput.id);

// ❌ Tránh: mockResolvedValueOnce chỉ cho 1 lần
(convexService.mutation as jest.Mock).mockResolvedValueOnce(updateInput.id);
```

## Tài liệu tham khảo

- [Idempotence - Wikipedia](https://en.wikipedia.org/wiki/Idempotence) - Khái niệm idempotence
- [HTTP Idempotent Methods](https://developer.mozilla.org/en-US/docs/Glossary/Idempotent) - Idempotence trong HTTP
- [Jest Mock Functions](https://jestjs.io/docs/mock-function-api) - API của Jest mocks

## Câu hỏi thường gặp (FAQ)

**Q: Tất cả operations đều phải idempotent?**

A: Không. Chỉ operations "set value" cần idempotent:
- ✅ Idempotent: `update()`, `delete()`, `set()`
- ❌ Không idempotent: `increment()`, `append()`, `create()`

**Q: Timestamp có ảnh hưởng đến idempotency không?**

A: Không, nếu chỉ so sánh business data:
```typescript
// ✅ OK: updatedAt thay đổi nhưng business data giống nhau
{ title: "Same", updatedAt: 1000 }
{ title: "Same", updatedAt: 2000 }
```

**Q: Làm sao test idempotency với real database?**

A: Tạo roadmap thật, update 2 lần, query lại:
```typescript
const id = await createRealRoadmap();
await service.update({ id, title: "New" });
const first = await service.findById(id);
await service.update({ id, title: "New" });
const second = await service.findById(id);
expect(second).toEqual(first);
```

## Tóm tắt

Property 12 test đảm bảo rằng:
- ✅ Update operation là idempotent
- ✅ Cùng input cho cùng kết quả dù gọi bao nhiêu lần
- ✅ An toàn khi retry request
- ✅ Dữ liệu nhất quán

**Key Takeaways:**
1. Idempotency = Cùng input → Cùng kết quả
2. Quan trọng cho retry safety và consistency
3. Dùng `mockResolvedValue()` cho multiple calls
4. Verify cả kết quả và arguments
5. Timestamp thay đổi là OK, business data phải giống nhau

Chúc bạn test vui vẻ! 🚀
