# Task 4.1: Tạo GraphQL Object Type Schema

## Tổng quan

Task này tạo schema GraphQL cho entity Roadmap, định nghĩa cách dữ liệu roadmap sẽ được trả về qua GraphQL API. Schema này là lớp transport layer, chuyển đổi domain model thành định dạng GraphQL mà client có thể query.

## Mục tiêu

- Tạo file `roadmap.schema.ts` với class `RoadmapSchema`
- Sử dụng decorators của NestJS GraphQL để định nghĩa các field
- Đảm bảo tất cả các field từ domain model được expose qua GraphQL
- Tuân thủ best practices của GraphQL (sử dụng ID type cho identifier)

## Yêu cầu liên quan

Task này validate các yêu cầu sau:
- **4.1**: Cho phép Guest xem danh sách Roadmap
- **4.2**: Cho phép User xem danh sách Roadmap  
- **4.3**: Cho phép Admin xem danh sách Roadmap
- **4.4**: Hiển thị tất cả Roadmap có sẵn
- **7.2**: Admin có thể thực hiện Create operation
- **7.3**: Admin có thể thực hiện Read operation
- **7.4**: Admin có thể thực hiện Update operation
- **7.5**: Admin có thể thực hiện Delete operation

## Giải thích cho người mới bắt đầu

### GraphQL là gì?

GraphQL là một ngôn ngữ query cho API. Thay vì có nhiều endpoints REST khác nhau (như `/api/roadmaps`, `/api/roadmaps/:id`), GraphQL chỉ có một endpoint duy nhất và client có thể yêu cầu chính xác dữ liệu mà họ cần.

Ví dụ, client có thể query:
```graphql
query {
  roadmaps {
    id
    title
    slug
  }
}
```

Và chỉ nhận được 3 field này, không phải toàn bộ dữ liệu.

### Object Type là gì?

Trong GraphQL, **Object Type** định nghĩa cấu trúc của một entity. Nó giống như một "blueprint" mô tả entity có những field nào và kiểu dữ liệu của mỗi field.

Trong NestJS, chúng ta sử dụng decorators để định nghĩa Object Type:
- `@ObjectType()`: Đánh dấu class này là một GraphQL Object Type
- `@Field()`: Đánh dấu property này là một field trong GraphQL schema

### Tại sao cần Schema riêng?

Bạn có thể thắc mắc: "Chúng ta đã có domain model rồi, tại sao phải tạo schema riêng?"

**Lý do:**
1. **Separation of Concerns**: Domain model là business logic, schema là presentation layer
2. **Flexibility**: Có thể expose dữ liệu khác với cách lưu trữ trong database
3. **Type Safety**: GraphQL schema cung cấp type checking cho client
4. **Documentation**: Schema tự động generate documentation cho API

## Cấu trúc File

```typescript
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class RoadmapSchema {
  @Field(() => ID)
  id: string;

  @Field()
  slug: string;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field()
  content: string;

  @Field()
  author: string;

  @Field(() => [String])
  tags: string[];

  @Field()
  publishedAt: number;

  @Field()
  updatedAt: number;

  @Field()
  isPublished: boolean;
}
```

## Chi tiết Implementation

### 1. Imports

```typescript
import { ObjectType, Field, ID } from '@nestjs/graphql';
```

- `ObjectType`: Decorator để đánh dấu class là GraphQL Object Type
- `Field`: Decorator để đánh dấu property là GraphQL field
- `ID`: Type đặc biệt của GraphQL cho unique identifiers

### 2. Class Declaration

```typescript
@ObjectType()
export class RoadmapSchema {
```

- `@ObjectType()`: Báo cho NestJS biết class này là GraphQL type
- `RoadmapSchema`: Tên class, sẽ được expose trong GraphQL schema

### 3. ID Field

```typescript
@Field(() => ID)
id: string;
```

**Giải thích:**
- `@Field(() => ID)`: Sử dụng GraphQL ID type thay vì String
- ID type là best practice cho unique identifiers
- Giúp GraphQL client (như Apollo) cache dữ liệu hiệu quả hơn
- Trong database (Convex), field này là `_id`, nhưng chúng ta expose nó như `id` để tuân thủ GraphQL conventions

### 4. String Fields

```typescript
@Field()
slug: string;

@Field()
title: string;

@Field()
description: string;

@Field()
content: string;

@Field()
author: string;
```

**Giải thích:**
- `@Field()`: Decorator đơn giản cho các field cơ bản
- TypeScript type (`string`) được tự động map sang GraphQL String type
- Không cần chỉ định type explicitly vì NestJS có thể infer từ TypeScript

### 5. Array Field

```typescript
@Field(() => [String])
tags: string[];
```

**Giải thích:**
- `@Field(() => [String])`: Phải chỉ định type explicitly cho array
- `[String]` trong GraphQL nghĩa là "array of strings"
- TypeScript không thể tự động infer array element type cho GraphQL

### 6. Number Fields

```typescript
@Field()
publishedAt: number;

@Field()
updatedAt: number;
```

**Giải thích:**
- TypeScript `number` được map sang GraphQL `Float` type
- Lưu Unix timestamps (milliseconds since epoch)
- Client có thể convert sang Date object nếu cần

### 7. Boolean Field

```typescript
@Field()
isPublished: boolean;
```

**Giải thích:**
- TypeScript `boolean` được map sang GraphQL `Boolean` type
- Sử dụng để filter roadmaps (chỉ show published roadmaps cho public)

## So sánh với Domain Model

| Domain Model | GraphQL Schema | Khác biệt |
|--------------|----------------|-----------|
| `_id: string` | `id: string` | Đổi tên field theo GraphQL convention |
| `_id: string` | `@Field(() => ID)` | Sử dụng ID type thay vì String |
| `tags: string[]` | `@Field(() => [String])` | Phải chỉ định type explicitly |
| Các field khác | Giống nhau | Mapping trực tiếp |

## Generated GraphQL Schema

Khi NestJS build GraphQL schema, nó sẽ generate:

```graphql
type Roadmap {
  id: ID!
  slug: String!
  title: String!
  description: String!
  content: String!
  author: String!
  tags: [String!]!
  publishedAt: Float!
  updatedAt: Float!
  isPublished: Boolean!
}
```

**Giải thích ký hiệu:**
- `!`: Field này là required (không thể null)
- `[String!]!`: Array không thể null, và các element trong array cũng không thể null
- `Float`: GraphQL type cho numbers

## Cách sử dụng trong Resolver

Schema này sẽ được sử dụng trong Resolver (task tiếp theo):

```typescript
@Resolver(() => RoadmapSchema)
export class RoadmapResolver {
  @Query(() => [RoadmapSchema])
  async roadmaps(): Promise<RoadmapSchema[]> {
    // Return array of roadmaps
  }

  @Query(() => RoadmapSchema, { nullable: true })
  async roadmap(@Args('slug') slug: string): Promise<RoadmapSchema | null> {
    // Return single roadmap or null
  }
}
```

## Best Practices được áp dụng

### 1. Sử dụng ID Type

✅ **Đúng:**
```typescript
@Field(() => ID)
id: string;
```

❌ **Sai:**
```typescript
@Field()
id: string;
```

**Lý do:** ID type giúp GraphQL client cache dữ liệu tốt hơn.

### 2. Explicit Type cho Arrays

✅ **Đúng:**
```typescript
@Field(() => [String])
tags: string[];
```

❌ **Sai:**
```typescript
@Field()
tags: string[];
```

**Lý do:** NestJS không thể infer array element type từ TypeScript.

### 3. Documentation Comments

✅ **Đúng:**
```typescript
/**
 * Display title of the roadmap
 * Main heading shown to users
 */
@Field()
title: string;
```

**Lý do:** Comments này sẽ xuất hiện trong GraphQL schema documentation.

### 4. Consistent Naming

- Sử dụng camelCase cho field names (GraphQL convention)
- Tên field rõ ràng, mô tả đúng mục đích
- Tránh abbreviations không cần thiết

## Testing

Sau khi tạo schema, bạn có thể test bằng cách:

### 1. Type Checking

```bash
cd apps/api
pnpm typecheck
```

Đảm bảo không có TypeScript errors.

### 2. GraphQL Schema Generation

Khi chạy NestJS app, schema sẽ được auto-generate. Bạn có thể xem trong GraphQL Playground:

```
http://localhost:3000/graphql
```

### 3. Query trong Playground

```graphql
query {
  __type(name: "Roadmap") {
    name
    fields {
      name
      type {
        name
        kind
      }
    }
  }
}
```

Query này sẽ show tất cả fields của Roadmap type.

## Troubleshooting

### Lỗi: "Cannot determine GraphQL type for array"

**Nguyên nhân:** Quên chỉ định type cho array field

**Giải pháp:**
```typescript
// Sai
@Field()
tags: string[];

// Đúng
@Field(() => [String])
tags: string[];
```

### Lỗi: "Circular dependency"

**Nguyên nhân:** Import circular giữa các schema files

**Giải pháp:** Sử dụng forward reference:
```typescript
@Field(() => 'OtherSchema')
other: OtherSchema;
```

### Field không xuất hiện trong schema

**Nguyên nhân:** Quên decorator `@Field()`

**Giải pháp:** Đảm bảo mọi field đều có `@Field()` decorator.

## Kết nối với các Task khác

### Task trước (3.1): Domain Models
- Task 3.1 tạo domain model interfaces
- Task 4.1 tạo GraphQL schema dựa trên domain models
- Schema map từ domain model sang GraphQL types

### Task tiếp theo (4.2): Input Schemas
- Task 4.2 sẽ tạo Input types cho mutations
- Input types khác với Object types (dùng `@InputType()` thay vì `@ObjectType()`)
- Input types dùng cho create và update operations

### Task sau đó (6.1): Resolver
- Resolver sẽ sử dụng `RoadmapSchema` làm return type
- Resolver convert domain models sang schema objects
- Schema đảm bảo type safety giữa resolver và GraphQL API

## Tóm tắt

Task 4.1 tạo GraphQL Object Type Schema cho Roadmap entity:

✅ **Đã hoàn thành:**
- Tạo file `roadmap.schema.ts`
- Định nghĩa class `RoadmapSchema` với `@ObjectType()` decorator
- Thêm tất cả 10 fields với `@Field()` decorators
- Sử dụng ID type cho unique identifier
- Thêm documentation comments cho mọi field
- Tuân thủ GraphQL và NestJS best practices

🎯 **Kết quả:**
- Schema sẵn sàng để sử dụng trong Resolver
- Type-safe GraphQL API cho Roadmap entity
- Auto-generated documentation cho client developers
- Foundation cho các query và mutation operations

📚 **Kiến thức đã học:**
- GraphQL Object Types và cách định nghĩa chúng
- NestJS GraphQL decorators (`@ObjectType`, `@Field`, `ID`)
- Sự khác biệt giữa domain models và GraphQL schemas
- Best practices cho GraphQL schema design
- Cách map TypeScript types sang GraphQL types

## Tài liệu tham khảo

- [NestJS GraphQL Documentation](https://docs.nestjs.com/graphql/quick-start)
- [GraphQL Object Types](https://graphql.org/learn/schema/#object-types-and-fields)
- [Apollo GraphQL Best Practices](https://www.apollographql.com/docs/apollo-server/schema/schema/)
