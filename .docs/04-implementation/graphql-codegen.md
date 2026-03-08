# GraphQL Code Generation

## Tổng Quan

VizTechStack sử dụng GraphQL Code Generator để tự động tạo TypeScript types và Zod validation schemas từ GraphQL schema definitions, đảm bảo type safety và runtime validation trên toàn stack.

## Kiến Trúc

```
GraphQL Schema (Source of Truth)
    ↓
GraphQL Code Generator
    ↓
    ├─→ TypeScript Types (Compile-time)
    └─→ Zod Schemas (Runtime validation)
```

## Cấu Hình

Nằm trong `codegen.ts` ở thư mục root:

```typescript
const config: CodegenConfig = {
  schema: 'http://localhost:4000/graphql',
  documents: ['apps/web/src/**/*.{ts,tsx}'],
  generates: {
    // TypeScript types
    'packages/shared/graphql-generated/src/types.ts': {
      plugins: ['typescript'],
    },
    // Zod schemas
    'packages/shared/graphql-generated/src/zod-schemas.ts': {
      plugins: ['typescript', 'typescript-validation-schema'],
      config: { schema: 'zod' },
    },
    // React hooks
    'packages/shared/graphql-generated/src/hooks.ts': {
      plugins: ['typescript', 'typescript-operations', 'typescript-react-apollo'],
    },
  },
};
```

## Sử Dụng

### Generate Types

```bash
# Generate một lần
pnpm codegen

# Watch mode (development)
pnpm codegen:watch

# Kiểm tra file generated có up to date không
pnpm codegen:check
```

### Sử Dụng Generated Types

```typescript
import { Roadmap, RoadmapSchema } from '@viztechstack/graphql-generated'

// TypeScript type checking
const roadmap: Roadmap = { ... }

// Runtime validation
const validated = RoadmapSchema.parse(data)
```

## Lợi Ích

- **Single Source of Truth**: GraphQL schema điều khiển tất cả types
- **Type Safety**: Compile-time checking với TypeScript
- **Runtime Validation**: Zod schemas bắt runtime errors
- **Auto-sync**: Types tự động cập nhật khi schema thay đổi
- **Zero Duplication**: Không cần định nghĩa type thủ công

## Quy Trình

1. Định nghĩa GraphQL schema trong file `.graphql`
2. Chạy `pnpm codegen` để generate types và schemas
3. Import generated types trong code của bạn
4. Sử dụng Zod schemas cho runtime validation

## Xem Thêm

- [GraphQL Schema Package](../../packages/shared/graphql-schema/)
- [Generated Types Package](../../packages/shared/graphql-generated/)
- [API Client Package](../../packages/shared/api-client/)
