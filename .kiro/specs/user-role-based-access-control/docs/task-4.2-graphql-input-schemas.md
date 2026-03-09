# Task 4.2: Tạo GraphQL Input Schemas

## Tổng quan

Task này tạo các GraphQL input schemas cho việc tạo mới và cập nhật roadmap. Input schemas định nghĩa cấu trúc dữ liệu mà client sẽ gửi lên server khi thực hiện các mutations.

## Yêu cầu liên quan

- **Yêu cầu 7.2**: Admin có thể tạo roadmap mới
- **Yêu cầu 7.4**: Admin có thể cập nhật roadmap

## File đã tạo

### `apps/api/src/modules/roadmap/transport/graphql/schemas/roadmap-input.schema.ts`

File này chứa hai input schemas:

#### 1. CreateRoadmapInput

Input schema cho việc tạo roadmap mới. Tất cả các trường đều bắt buộc (required).

**Các trường:**

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| `slug` | `string` | Định danh thân thiện với URL, phải là duy nhất |
| `title` | `string` | Tiêu đề hiển thị của roadmap |
| `description` | `string` | Mô tả ngắn gọn về roadmap |
| `content` | `string` | Nội dung đầy đủ của roadmap (định dạng markdown) |
| `tags` | `string[]` | Mảng các tag để phân loại roadmap |
| `isPublished` | `boolean` | Trạng thái xuất bản (true = công khai, false = nháp) |

**Lưu ý:** Trường `author` không có trong input vì nó sẽ được tự động lấy từ thông tin người dùng đã xác thực.

#### 2. UpdateRoadmapInput

Input schema cho việc cập nhật roadmap. Chỉ có trường `id` là bắt buộc, các trường khác đều là tùy chọn (optional) để hỗ trợ cập nhật từng phần (partial update).

**Các trường:**

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|----------|-------|
| `id` | `string` | ✅ | ID của roadmap cần cập nhật |
| `slug` | `string` | ❌ | Định danh mới (nếu muốn thay đổi) |
| `title` | `string` | ❌ | Tiêu đề mới (nếu muốn thay đổi) |
| `description` | `string` | ❌ | Mô tả mới (nếu muốn thay đổi) |
| `content` | `string` | ❌ | Nội dung mới (nếu muốn thay đổi) |
| `tags` | `string[]` | ❌ | Tags mới (nếu muốn thay đổi) |
| `isPublished` | `boolean` | ❌ | Trạng thái xuất bản mới (nếu muốn thay đổi) |

## Giải thích kỹ thuật

### Decorators sử dụng

#### `@InputType()`

Decorator này đánh dấu class là một GraphQL input type. Input types được sử dụng làm tham số cho mutations và queries.

```typescript
@InputType()
export class CreateRoadmapInput {
  // ...
}
```

#### `@Field()`

Decorator này đánh dấu một property là một field trong GraphQL schema.

**Cú pháp cơ bản:**
```typescript
@Field()
slug!: string;
```

**Với kiểu dữ liệu phức tạp (array):**
```typescript
@Field(() => [String])
tags!: string[];
```

**Với field tùy chọn:**
```typescript
@Field({ nullable: true })
title?: string;
```

### Definite Assignment Assertion (`!`)

Dấu `!` sau tên property là "definite assignment assertion" trong TypeScript. Nó cho TypeScript biết rằng property này sẽ được gán giá trị bởi GraphQL framework, không cần khởi tạo trong constructor.

```typescript
@Field()
slug!: string;  // TypeScript sẽ không báo lỗi "not definitely assigned"
```

### Nullable vs Optional

- **Optional (`?`)**: Property có thể không tồn tại trong object
- **Nullable (`{ nullable: true }`)**: Property tồn tại nhưng giá trị có thể là `null`

```typescript
// Optional - có thể không có trong input
@Field({ nullable: true })
title?: string;

// Khi sử dụng:
{ id: "123" }  // OK - không có title
{ id: "123", title: "New Title" }  // OK - có title
{ id: "123", title: null }  // OK - title là null
```

## Cách sử dụng

### Tạo roadmap mới

```graphql
mutation {
  createRoadmap(input: {
    slug: "frontend-roadmap"
    title: "Frontend Developer Roadmap"
    description: "Complete guide to becoming a frontend developer"
    content: "# Frontend Roadmap\n\n..."
    tags: ["frontend", "javascript", "react"]
    isPublished: true
  })
}
```

### Cập nhật roadmap

```graphql
mutation {
  updateRoadmap(input: {
    id: "j97abc123def456"
    title: "Updated Frontend Roadmap"
    isPublished: false
  })
}
```

Lưu ý: Trong ví dụ trên, chỉ `title` và `isPublished` được cập nhật, các trường khác giữ nguyên giá trị cũ.

## Kiểm tra

Sau khi tạo file, đã kiểm tra:

1. ✅ Không có lỗi TypeScript
2. ✅ Tất cả decorators được import đúng từ `@nestjs/graphql`
3. ✅ Các trường bắt buộc và tùy chọn được định nghĩa đúng
4. ✅ Comments giải thích rõ ràng cho từng trường

## Bước tiếp theo

Sau khi hoàn thành task này, các input schemas sẽ được sử dụng trong:

- **Task 5.1**: RoadmapService sẽ nhận các input này làm tham số
- **Task 6.1**: RoadmapResolver sẽ sử dụng các input này trong mutations

## Tài liệu tham khảo

- [NestJS GraphQL Input Types](https://docs.nestjs.com/graphql/resolvers#input-types)
- [GraphQL Input Types](https://graphql.org/graphql-js/mutations-and-input-types/)
- [TypeScript Definite Assignment Assertion](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-7.html#definite-assignment-assertions)
