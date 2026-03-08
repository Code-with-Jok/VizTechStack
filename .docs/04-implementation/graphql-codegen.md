# GraphQL Code Generation

## Overview

VizTechStack uses GraphQL Code Generator to automatically generate TypeScript types and Zod validation schemas from GraphQL schema definitions, ensuring type safety and runtime validation across the stack.

## Architecture

```
GraphQL Schema (Source of Truth)
    ↓
GraphQL Code Generator
    ↓
    ├─→ TypeScript Types (Compile-time)
    └─→ Zod Schemas (Runtime validation)
```

## Configuration

Located in `codegen.ts` at project root:

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

## Usage

### Generate Types

```bash
# Generate once
pnpm codegen

# Watch mode (development)
pnpm codegen:watch

# Check if generated files are up to date
pnpm codegen:check
```

### Using Generated Types

```typescript
import { Roadmap, RoadmapSchema } from '@viztechstack/graphql-generated'

// TypeScript type checking
const roadmap: Roadmap = { ... }

// Runtime validation
const validated = RoadmapSchema.parse(data)
```

## Benefits

- **Single Source of Truth**: GraphQL schema drives all types
- **Type Safety**: Compile-time checking with TypeScript
- **Runtime Validation**: Zod schemas catch runtime errors
- **Auto-sync**: Types update automatically when schema changes
- **Zero Duplication**: No manual type definitions needed

## Workflow

1. Define GraphQL schema in `.graphql` files
2. Run `pnpm codegen` to generate types and schemas
3. Import generated types in your code
4. Use Zod schemas for runtime validation

## See Also

- [GraphQL Schema Package](../../packages/shared/graphql-schema/)
- [Generated Types Package](../../packages/shared/graphql-generated/)
- [API Client Package](../../packages/shared/api-client/)
