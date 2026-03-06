# Setup & Code Generation - Clarification Document

## ✅ Những Gì Đã Hoàn Thành

### 1. Dependencies Installed

**GraphQL Code Generator:**
```json
{
  "devDependencies": {
    "@graphql-codegen/cli": "^6.1.3",
    "@graphql-codegen/typescript": "^5.0.9",
    "@graphql-codegen/typescript-operations": "^5.0.9",
    "@graphql-codegen/typescript-react-apollo": "^4.4.0",
    "graphql-codegen-typescript-validation-schema": "^0.18.1"
  }
}
```

**Runtime Dependencies:**
```json
{
  "dependencies": {
    "graphql": "^16.13.0",
    "zod": "^3.25.76"
  }
}
```

### 2. Packages Created

**✅ packages/shared/graphql-schema/**
- `package.json` - Package configuration
- `tsconfig.json` - TypeScript configuration
- `src/roadmap.graphql` - GraphQL schema definition
- `src/index.ts` - Entry point

**Purpose:** Chứa GraphQL schema definitions (source of truth)

**✅ packages/shared/graphql-generated/**
- `package.json` - Package configuration
- `tsconfig.json` - TypeScript configuration
- `src/index.ts` - Export all generated code
- `src/types.ts` - ✨ Generated TypeScript types
- `src/zod-schemas.ts` - ✨ Generated Zod validation schemas

**Purpose:** Chứa code được auto-generate từ GraphQL schema

### 3. Configuration Files

**✅ codegen.ts**
- GraphQL Code Generator configuration
- Schema source: Local files (`packages/shared/graphql-schema/src/**/*.graphql`)
- Generates: TypeScript types + Zod schemas
- Operations & Hooks: Commented out (sẽ enable sau khi có GraphQL operations)

**✅ package.json scripts**
```json
{
  "scripts": {
    "codegen": "graphql-codegen --config codegen.ts",
    "codegen:watch": "graphql-codegen --config codegen.ts --watch",
    "codegen:check": "graphql-codegen --config codegen.ts --check"
  }
}
```

---

## 📚 Giải Thích Chi Tiết

### Tại Sao Cần GraphQL Code Generator?

**Problem:**
```typescript
// ❌ Without codegen: Manual type definitions
type Roadmap = {
  _id: string;
  slug: string;
  title: string;
  // ... must manually sync with GraphQL schema
};

const RoadmapSchema = z.object({
  _id: z.string(),
  slug: z.string(),
  title: z.string(),
  // ... must manually sync with GraphQL schema
});
```

**Solution:**
```typescript
// ✅ With codegen: Auto-generated from GraphQL schema
import { Roadmap } from '@viztechstack/graphql-generated/types';
import { RoadmapSchema } from '@viztechstack/graphql-generated/zod-schemas';

// Types and schemas are always in sync with GraphQL schema!
```

### Luồng Code Generation

```
┌─────────────────────────────────────────┐
│ 1. GraphQL Schema (Source of Truth)     │
│    packages/shared/graphql-schema/      │
│    src/roadmap.graphql                  │
│                                         │
│    type Roadmap {                       │
│      _id: ID!                           │
│      slug: String!                      │
│      title: String!                     │
│    }                                    │
└─────────────────────────────────────────┘
                  ↓
        pnpm codegen
                  ↓
┌─────────────────────────────────────────┐
│ 2. GraphQL Code Generator               │
│    Reads: roadmap.graphql               │
│    Plugins:                             │
│    - typescript                         │
│    - typescript-validation-schema       │
└─────────────────────────────────────────┘
                  ↓
        ┌─────────┴─────────┐
        ↓                   ↓
┌──────────────────┐  ┌──────────────────┐
│ 3a. types.ts     │  │ 3b. zod-schemas  │
│ (TypeScript)     │  │ (Zod)            │
│                  │  │                  │
│ export type      │  │ export const     │
│ Roadmap = {      │  │ RoadmapSchema =  │
│   _id: string;   │  │ z.object({       │
│   slug: string;  │  │   _id: z.string()│
│   title: string; │  │   slug: z.string()│
│ };               │  │   title: z.string()│
│                  │  │ });              │
└──────────────────┘  └──────────────────┘
        ↓                   ↓
        └─────────┬─────────┘
                  ↓
┌─────────────────────────────────────────┐
│ 4. Usage in Application                 │
│                                         │
│ import { Roadmap, RoadmapSchema }       │
│   from '@viztechstack/graphql-generated'│
│                                         │
│ // Type-safe at compile time            │
│ const roadmap: Roadmap = { ... };      │
│                                         │
│ // Validated at runtime                 │
│ const validated = RoadmapSchema.parse(  │
│   apiResponse                           │
│ );                                      │
└─────────────────────────────────────────┘
```

### Generated Files Explained

**1. types.ts - TypeScript Types**

```typescript
// Scalars mapping
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Int: { input: number; output: number };
  // ...
};

// Enums
export type RoadmapCategory = 'ROLE' | 'SKILL' | 'BEST_PRACTICE';
export type RoadmapDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type RoadmapStatus = 'PUBLIC' | 'DRAFT' | 'PRIVATE';

// Types
export type Roadmap = {
  __typename?: 'Roadmap';
  _id: Scalars['ID']['output'];
  slug: Scalars['String']['output'];
  title: Scalars['String']['output'];
  description: Scalars['String']['output'];
  category: RoadmapCategory;
  difficulty: RoadmapDifficulty;
  topicCount: Scalars['Int']['output'];
  status: RoadmapStatus;
  nodesJson?: Maybe<Scalars['String']['output']>;
  edgesJson?: Maybe<Scalars['String']['output']>;
};

// Input types
export type CreateRoadmapInput = {
  slug: Scalars['String']['input'];
  title: Scalars['String']['input'];
  description: Scalars['String']['input'];
  category: RoadmapCategory;
  difficulty: RoadmapDifficulty;
  topicCount: Scalars['Int']['input'];
  nodesJson?: InputMaybe<Scalars['String']['input']>;
  edgesJson?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<RoadmapStatus>;
};
```

**Purpose:**
- ✅ Compile-time type checking
- ✅ IDE autocomplete
- ✅ Catch type errors early

**2. zod-schemas.ts - Zod Validation Schemas**

```typescript
import { z } from 'zod';
import type { RoadmapCategory, RoadmapDifficulty, RoadmapStatus } from './types';

// Enum schemas
export const RoadmapCategorySchema = z.enum(['ROLE', 'SKILL', 'BEST_PRACTICE']);
export const RoadmapDifficultySchema = z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']);
export const RoadmapStatusSchema = z.enum(['PUBLIC', 'DRAFT', 'PRIVATE']);

// Object schemas
export const RoadmapSchema = z.object({
  __typename: z.literal('Roadmap').optional(),
  _id: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  category: RoadmapCategorySchema,
  difficulty: RoadmapDifficultySchema,
  topicCount: z.number().int(),
  status: RoadmapStatusSchema,
  nodesJson: z.string().nullable().optional(),
  edgesJson: z.string().nullable().optional(),
});

// Input schemas
export const CreateRoadmapInputSchema = z.object({
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  category: RoadmapCategorySchema,
  difficulty: RoadmapDifficultySchema,
  topicCount: z.number().int(),
  nodesJson: z.string().optional(),
  edgesJson: z.string().optional(),
  status: RoadmapStatusSchema.optional(),
});

// Type inference
export type Roadmap = z.infer<typeof RoadmapSchema>;
export type CreateRoadmapInput = z.infer<typeof CreateRoadmapInputSchema>;
```

**Purpose:**
- ✅ Runtime validation
- ✅ Catch data inconsistencies
- ✅ Prevent runtime errors

---

## 🎯 Tại Sao Operations & Hooks Bị Comment Out?

### Current State

```typescript
// codegen.ts
generates: {
  'types.ts': { ... },           // ✅ Generated
  'zod-schemas.ts': { ... },     // ✅ Generated
  // 'operations.ts': { ... },   // ❌ Commented out
  // 'hooks.ts': { ... },         // ❌ Commented out
}
```

### Reason

**Operations & Hooks require GraphQL operations (queries/mutations) in your code:**

```typescript
// Example: apps/web/src/hooks/useRoadmaps.ts
import { gql } from '@apollo/client';

const GET_ROADMAPS = gql`
  query GetRoadmaps {
    getRoadmaps {
      _id
      slug
      title
    }
  }
`;
```

**Without operations in code:**
- ❌ Codegen cannot find any operations to generate
- ❌ Error: "Unable to find any GraphQL type definitions"

**Solution:**
- ✅ Generate types & schemas first (done!)
- ✅ Create GraphQL operations in code (next step)
- ✅ Uncomment operations & hooks generation
- ✅ Run codegen again

---

## 🔄 Next Steps

### Step 1: Verify Generated Files

```bash
# Check generated files
ls packages/shared/graphql-generated/src/

# Should show:
# - index.ts
# - types.ts
# - zod-schemas.ts
```

### Step 2: Test Type Imports

```typescript
// Test in any TypeScript file
import { Roadmap, RoadmapSchema } from '@viztechstack/graphql-generated';

// TypeScript should recognize these types
const roadmap: Roadmap = {
  _id: '123',
  slug: 'frontend',
  title: 'Frontend Developer',
  description: 'Learn frontend',
  category: 'ROLE',
  difficulty: 'INTERMEDIATE',
  topicCount: 50,
  status: 'PUBLIC',
};

// Zod validation should work
const validated = RoadmapSchema.parse(roadmap);
console.log(validated);
```

### Step 3: Create Validation Package (Next)

We'll create `packages/shared/validation` with:
- Error handling utilities
- Validation helpers
- Custom error classes

### Step 4: Create API Client Package (After Validation)

We'll create `packages/shared/api-client` with:
- Apollo Client setup
- Validated GraphQL client
- React hooks with validation

---

## 🐛 Troubleshooting

### Issue 1: "Cannot find module '@viztechstack/graphql-generated'"

**Solution:**
```bash
# Install dependencies
pnpm install

# Build packages
pnpm build
```

### Issue 2: "Module has no exported member 'Roadmap'"

**Solution:**
```bash
# Regenerate code
pnpm codegen

# Check if types.ts exists
cat packages/shared/graphql-generated/src/types.ts
```

### Issue 3: Codegen fails with schema errors

**Solution:**
```bash
# Check GraphQL schema syntax
cat packages/shared/graphql-schema/src/roadmap.graphql

# Validate schema
pnpm codegen:check
```

---

## 📊 Summary

### What We Have Now

✅ **GraphQL Schema Package**
- Source of truth for all types
- Located in `packages/shared/graphql-schema`

✅ **Generated Code Package**
- Auto-generated TypeScript types
- Auto-generated Zod schemas
- Located in `packages/shared/graphql-generated`

✅ **Code Generator Configuration**
- Configured to use local schema files
- Generates types and Zod schemas
- Ready to add operations & hooks later

### Benefits

1. **Single Source of Truth**: GraphQL schema drives everything
2. **Type Safety**: TypeScript types from schema
3. **Runtime Validation**: Zod schemas from schema
4. **Zero Duplication**: No manual type definitions
5. **Always in Sync**: Regenerate when schema changes

### What's Next

1. ✅ Setup & Code Generation (DONE!)
2. 📝 Create Validation Package
3. 📝 Create API Client Package
4. 📝 Update Web App
5. 📝 Add GraphQL Operations
6. 📝 Enable Operations & Hooks Generation

---

**Status:** ✅ Setup & Code Generation Complete  
**Next:** Create Validation Package  
**Estimated Time:** 15-20 minutes
