# GraphQL + Zod Runtime Validation Architecture

## Executive Summary

Tài liệu này mô tả kiến trúc kết hợp **GraphQL Code Generator** và **Zod runtime validation** để đạt được:
- ✅ Compile-time type safety từ GraphQL schema
- ✅ Runtime validation với Zod
- ✅ Zero duplication trong type definitions
- ✅ Scalable cho monorepo architecture

---

## 1. System Architecture Overview

### 1.1 Component Relationship

```
┌─────────────────────────────────────────────────────────────┐
│                    GraphQL Schema (Source of Truth)          │
│                    apps/api/src/**/*.graphql                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
                  GraphQL Code Generator
                            ↓
        ┌───────────────────┴───────────────────┐
        ↓                                       ↓
┌──────────────────┐                  ┌──────────────────┐
│  TypeScript      │                  │  Zod Schemas     │
│  Types           │                  │  (Generated)     │
│  (Compile-time)  │                  │  (Runtime)       │
└──────────────────┘                  └──────────────────┘
        ↓                                       ↓
        └───────────────────┬───────────────────┘
                            ↓
                  ┌──────────────────┐
                  │  API Client      │
                  │  with Validation │
                  └──────────────────┘
                            ↓
                  ┌──────────────────┐
                  │  React App       │
                  │  (Type-safe)     │
                  └──────────────────┘
```

### 1.2 Key Principles

**Single Source of Truth:**
- GraphQL schema là source of truth duy nhất
- TypeScript types và Zod schemas đều generate từ GraphQL schema
- Không duplicate type definitions

**Layered Validation:**
```
Layer 1: GraphQL Schema Validation (Server-side)
    ↓
Layer 2: TypeScript Compile-time Checking (Build-time)
    ↓
Layer 3: Zod Runtime Validation (Client-side)
    ↓
Layer 4: UI Consumption (Type-safe)
```


---

## 2. Data Flow

### 2.1 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: Define GraphQL Schema                                │
│ apps/api/src/modules/roadmap/transport/graphql/schemas/     │
│                                                              │
│ type Roadmap {                                               │
│   _id: ID!                                                   │
│   slug: String!                                              │
│   title: String!                                             │
│   category: RoadmapCategory!                                 │
│ }                                                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Run Code Generator                                   │
│ $ pnpm codegen                                               │
│                                                              │
│ Generates:                                                   │
│ - packages/shared/graphql-generated/types.ts                │
│ - packages/shared/graphql-generated/zod-schemas.ts          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: Generated TypeScript Types                           │
│                                                              │
│ export type Roadmap = {                                      │
│   __typename?: 'Roadmap';                                    │
│   _id: Scalars['ID']['output'];                             │
│   slug: Scalars['String']['output'];                        │
│   title: Scalars['String']['output'];                       │
│   category: RoadmapCategory;                                 │
│ };                                                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: Generated Zod Schemas                                │
│                                                              │
│ export const RoadmapSchema = z.object({                      │
│   __typename: z.literal('Roadmap').optional(),              │
│   _id: z.string(),                                           │
│   slug: z.string(),                                          │
│   title: z.string(),                                         │
│   category: RoadmapCategorySchema,                           │
│ });                                                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 5: API Client with Validation                           │
│                                                              │
│ const { data } = await client.query({ query: GET_ROADMAPS });│
│ const validated = RoadmapSchema.array().parse(data.roadmaps);│
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 6: React Component (Type-safe)                          │
│                                                              │
│ function RoadmapList() {                                     │
│   const roadmaps = useRoadmaps(); // Type: Roadmap[]        │
│   return <div>{roadmaps.map(r => r.title)}</div>           │
│ }                                                            │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Error Handling Flow

```
API Response
    ↓
Zod Validation
    ↓
    ├─ Success → Type-safe data → UI
    │
    └─ Failure → ZodError
              ↓
        Error Handler
              ↓
        ├─ Log to Sentry
        ├─ Show user-friendly message
        └─ Fallback UI
```


---

## 3. Folder Structure (Monorepo)

### 3.1 Complete Structure

```
viztechstack/
├── apps/
│   ├── web/                          # Next.js frontend
│   │   ├── src/
│   │   │   ├── hooks/
│   │   │   │   └── useRoadmaps.ts   # React hooks with validation
│   │   │   └── lib/
│   │   │       └── graphql-client.ts # Apollo client setup
│   │   └── package.json
│   │
│   └── api/                          # NestJS backend
│       ├── src/
│       │   └── modules/
│       │       └── roadmap/
│       │           └── transport/
│       │               └── graphql/
│       │                   └── schemas/
│       │                       └── roadmap.schema.ts  # GraphQL schema
│       └── package.json
│
├── packages/
│   └── shared/
│       ├── graphql-schema/           # GraphQL schema files
│       │   ├── src/
│       │   │   ├── roadmap.graphql
│       │   │   ├── user.graphql
│       │   │   └── index.ts
│       │   ├── package.json
│       │   └── tsconfig.json
│       │
│       ├── graphql-generated/        # Generated code
│       │   ├── src/
│       │   │   ├── types.ts         # TypeScript types
│       │   │   ├── zod-schemas.ts   # Zod schemas
│       │   │   ├── operations.ts    # Query/Mutation types
│       │   │   └── index.ts
│       │   ├── package.json
│       │   └── tsconfig.json
│       │
│       ├── api-client/               # GraphQL client with validation
│       │   ├── src/
│       │   │   ├── client.ts        # Apollo client
│       │   │   ├── validated-client.ts  # Client with Zod validation
│       │   │   ├── hooks/           # React hooks
│       │   │   │   ├── useQuery.ts
│       │   │   │   └── useMutation.ts
│       │   │   └── index.ts
│       │   ├── package.json
│       │   └── tsconfig.json
│       │
│       ├── validation/               # Validation utilities
│       │   ├── src/
│       │   │   ├── error-handler.ts
│       │   │   ├── validators.ts
│       │   │   └── index.ts
│       │   ├── package.json
│       │   └── tsconfig.json
│       │
│       └── types/                    # Shared types (non-GraphQL)
│           ├── src/
│           │   └── common.ts
│           ├── package.json
│           └── tsconfig.json
│
├── codegen.ts                        # GraphQL Code Generator config
├── package.json
└── pnpm-workspace.yaml
```

### 3.2 Package Dependencies

```
┌─────────────────┐
│   apps/web      │
└────────┬────────┘
         │ depends on
         ↓
┌─────────────────┐
│  api-client     │
└────────┬────────┘
         │ depends on
         ↓
┌─────────────────┐     ┌─────────────────┐
│ graphql-        │ ←── │  validation     │
│ generated       │     └─────────────────┘
└─────────────────┘
         ↑
         │ generated from
         │
┌─────────────────┐
│ graphql-schema  │
└─────────────────┘
```


---

## 4. GraphQL Code Generator Configuration

### 4.1 Installation

```bash
# Root package.json
pnpm add -D @graphql-codegen/cli
pnpm add -D @graphql-codegen/typescript
pnpm add -D @graphql-codegen/typescript-operations
pnpm add -D @graphql-codegen/typescript-react-apollo
pnpm add -D @graphql-codegen/typescript-validation-schema

# Zod plugin
pnpm add -D @graphql-codegen/typescript-validation-schema

# Runtime dependencies
pnpm add zod graphql
```

### 4.2 Configuration File: `codegen.ts`

```typescript
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  // Chỉ định GraphQL schema source
  schema: 'http://localhost:4000/graphql',
  
  // Hoặc sử dụng local schema files
  // schema: 'packages/shared/graphql-schema/src/**/*.graphql',
  
  // Client-side operations (queries, mutations)
  documents: [
    'apps/web/src/**/*.{ts,tsx}',
    'packages/shared/api-client/src/**/*.{ts,tsx}',
  ],
  
  generates: {
    // ============================================
    // 1. TypeScript Types
    // ============================================
    'packages/shared/graphql-generated/src/types.ts': {
      plugins: [
        'typescript',
      ],
      config: {
        // Scalars mapping
        scalars: {
          ID: 'string',
          DateTime: 'string',
          JSON: 'Record<string, unknown>',
        },
        // Naming conventions
        enumsAsTypes: true,
        futureProofEnums: true,
        // Add __typename for all types
        addTypename: true,
        // Skip typename in input types
        skipTypename: false,
        // Make all fields optional by default
        maybeValue: 'T | null | undefined',
      },
    },

    // ============================================
    // 2. Zod Schemas (Runtime Validation)
    // ============================================
    'packages/shared/graphql-generated/src/zod-schemas.ts': {
      plugins: [
        'typescript',
        'typescript-validation-schema',
      ],
      config: {
        // Use Zod for validation
        schema: 'zod',
        // Import Zod
        importFrom: 'zod',
        // Validation schema suffix
        validationSchemaExportType: 'const',
        // Use TypeScript types from types.ts
        useTypeImports: true,
        // Scalars validation
        scalarSchemas: {
          ID: 'z.string()',
          DateTime: 'z.string().datetime()',
          JSON: 'z.record(z.unknown())',
        },
        // Directives for custom validation
        directives: {
          // @constraint directive support
          constraint: {
            minLength: 'min',
            maxLength: 'max',
            pattern: 'regex',
          },
        },
      },
    },

    // ============================================
    // 3. Operations (Queries & Mutations)
    // ============================================
    'packages/shared/graphql-generated/src/operations.ts': {
      plugins: [
        'typescript',
        'typescript-operations',
      ],
      config: {
        // Reuse types from types.ts
        avoidOptionals: false,
        // Add __typename
        addTypename: true,
      },
    },

    // ============================================
    // 4. React Apollo Hooks
    // ============================================
    'packages/shared/graphql-generated/src/hooks.ts': {
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-react-apollo',
      ],
      config: {
        // Generate React hooks
        withHooks: true,
        withComponent: false,
        withHOC: false,
        // Hook suffix
        reactApolloVersion: 3,
        // Add __typename
        addTypename: true,
      },
    },
  },

  // ============================================
  // Global Configuration
  // ============================================
  config: {
    // Avoid ESLint errors
    skipTypename: false,
    // Use type imports
    useTypeImports: true,
  },

  // Watch mode for development
  watch: process.env.NODE_ENV === 'development',
  
  // Hooks
  hooks: {
    afterAllFileWrite: [
      'prettier --write',
      'eslint --fix',
    ],
  },
};

export default config;
```

### 4.3 Package Scripts

```json
// Root package.json
{
  "scripts": {
    "codegen": "graphql-codegen --config codegen.ts",
    "codegen:watch": "graphql-codegen --config codegen.ts --watch",
    "codegen:check": "graphql-codegen --config codegen.ts --check"
  }
}
```


---

## 5. Zod Integration Strategy

### 5.1 Option A: Manual Zod Schemas (Not Recommended)

**Approach:**
- Manually write Zod schemas
- Use generated TypeScript types for type inference

**Example:**
```typescript
// packages/shared/graphql-generated/src/types.ts (Generated)
export type Roadmap = {
  _id: string;
  slug: string;
  title: string;
  category: RoadmapCategory;
};

// packages/shared/validation/src/roadmap.ts (Manual)
import { z } from 'zod';
import type { Roadmap } from '@viztechstack/graphql-generated';

export const RoadmapSchema = z.object({
  _id: z.string(),
  slug: z.string().min(3),
  title: z.string().min(5),
  category: z.enum(['role', 'skill', 'best-practice']),
}) satisfies z.ZodType<Roadmap>;
```

**Pros:**
- ✅ Full control over validation rules
- ✅ Can add custom validation logic

**Cons:**
- ❌ Duplication of type definitions
- ❌ Manual sync required when schema changes
- ❌ Error-prone

### 5.2 Option B: Auto-Generated Zod Schemas (Recommended)

**Approach:**
- Use `@graphql-codegen/typescript-validation-schema` plugin
- Automatically generate Zod schemas from GraphQL schema
- Extend with custom validation when needed

**Example:**
```typescript
// packages/shared/graphql-generated/src/zod-schemas.ts (Generated)
import { z } from 'zod';

export const RoadmapCategorySchema = z.enum([
  'role',
  'skill',
  'best-practice',
]);

export const RoadmapSchema = z.object({
  __typename: z.literal('Roadmap').optional(),
  _id: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  category: RoadmapCategorySchema,
  difficulty: RoadmapDifficultySchema,
  topicCount: z.number().int().nonnegative(),
  status: RoadmapStatusSchema,
});

export type Roadmap = z.infer<typeof RoadmapSchema>;
```

**Pros:**
- ✅ Zero duplication
- ✅ Auto-sync with GraphQL schema
- ✅ Type-safe by default
- ✅ Less maintenance

**Cons:**
- ⚠️ Limited custom validation (can be extended)

### 5.3 Hybrid Approach (Best Practice)

**Strategy:**
- Generate base Zod schemas automatically
- Extend with custom validation when needed

**Example:**
```typescript
// packages/shared/graphql-generated/src/zod-schemas.ts (Generated)
export const RoadmapSchemaBase = z.object({
  _id: z.string(),
  slug: z.string(),
  title: z.string(),
  // ... other fields
});

// packages/shared/validation/src/roadmap-extended.ts (Custom)
import { RoadmapSchemaBase } from '@viztechstack/graphql-generated';

export const RoadmapSchemaExtended = RoadmapSchemaBase.extend({
  // Add custom validation
  slug: z.string()
    .min(3, 'Slug must be at least 3 characters')
    .max(50, 'Slug must be at most 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens'),
  
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be at most 100 characters'),
  
  topicCount: z.number()
    .int()
    .min(1, 'Must have at least 1 topic')
    .max(1000, 'Cannot exceed 1000 topics'),
});

// Transform validation
export const RoadmapSchemaWithTransform = RoadmapSchemaExtended.transform((data) => ({
  ...data,
  slug: data.slug.toLowerCase(),
  title: data.title.trim(),
}));
```

**Recommendation:** Use Option B (Auto-generated) + Hybrid extensions when needed.


---

## 6. Example Implementation

### 6.1 GraphQL Schema

```graphql
# packages/shared/graphql-schema/src/roadmap.graphql

enum RoadmapCategory {
  ROLE
  SKILL
  BEST_PRACTICE
}

enum RoadmapDifficulty {
  BEGINNER
  INTERMEDIATE
  ADVANCED
}

enum RoadmapStatus {
  PUBLIC
  DRAFT
  PRIVATE
}

type Roadmap {
  _id: ID!
  slug: String!
  title: String!
  description: String!
  category: RoadmapCategory!
  difficulty: RoadmapDifficulty!
  topicCount: Int!
  status: RoadmapStatus!
  nodesJson: String
  edgesJson: String
}

type RoadmapPage {
  items: [Roadmap!]!
  nextCursor: String
  hasMore: Boolean!
}

input RoadmapPageInput {
  category: RoadmapCategory
  cursor: String
  limit: Int
}

type Query {
  getRoadmaps(category: RoadmapCategory): [Roadmap!]!
  getRoadmapsPage(input: RoadmapPageInput): RoadmapPage!
  getRoadmapBySlug(slug: String!): Roadmap
}

input CreateRoadmapInput {
  slug: String!
  title: String!
  description: String!
  category: RoadmapCategory!
  difficulty: RoadmapDifficulty!
  topicCount: Int!
  nodesJson: String
  edgesJson: String
  status: RoadmapStatus
}

type Mutation {
  createRoadmap(input: CreateRoadmapInput!): ID!
}
```

### 6.2 Generated TypeScript Types

```typescript
// packages/shared/graphql-generated/src/types.ts (Auto-generated)

export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
};

export enum RoadmapCategory {
  Role = 'ROLE',
  Skill = 'SKILL',
  BestPractice = 'BEST_PRACTICE',
}

export enum RoadmapDifficulty {
  Beginner = 'BEGINNER',
  Intermediate = 'INTERMEDIATE',
  Advanced = 'ADVANCED',
}

export enum RoadmapStatus {
  Public = 'PUBLIC',
  Draft = 'DRAFT',
  Private = 'PRIVATE',
}

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

export type RoadmapPage = {
  __typename?: 'RoadmapPage';
  items: Array<Roadmap>;
  nextCursor?: Maybe<Scalars['String']['output']>;
  hasMore: Scalars['Boolean']['output'];
};

export type RoadmapPageInput = {
  category?: InputMaybe<RoadmapCategory>;
  cursor?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
};

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

export type Query = {
  __typename?: 'Query';
  getRoadmaps: Array<Roadmap>;
  getRoadmapsPage: RoadmapPage;
  getRoadmapBySlug?: Maybe<Roadmap>;
};

export type Mutation = {
  __typename?: 'Mutation';
  createRoadmap: Scalars['ID']['output'];
};
```


### 6.3 Generated Zod Schemas

```typescript
// packages/shared/graphql-generated/src/zod-schemas.ts (Auto-generated)
import { z } from 'zod';

// Enums
export const RoadmapCategorySchema = z.enum([
  'ROLE',
  'SKILL',
  'BEST_PRACTICE',
]);

export const RoadmapDifficultySchema = z.enum([
  'BEGINNER',
  'INTERMEDIATE',
  'ADVANCED',
]);

export const RoadmapStatusSchema = z.enum([
  'PUBLIC',
  'DRAFT',
  'PRIVATE',
]);

// Types
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

export const RoadmapPageSchema = z.object({
  __typename: z.literal('RoadmapPage').optional(),
  items: z.array(RoadmapSchema),
  nextCursor: z.string().nullable().optional(),
  hasMore: z.boolean(),
});

// Input Types
export const RoadmapPageInputSchema = z.object({
  category: RoadmapCategorySchema.optional(),
  cursor: z.string().nullable().optional(),
  limit: z.number().int().optional(),
});

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
export type RoadmapPage = z.infer<typeof RoadmapPageSchema>;
export type RoadmapPageInput = z.infer<typeof RoadmapPageInputSchema>;
export type CreateRoadmapInput = z.infer<typeof CreateRoadmapInputSchema>;
```

### 6.4 API Client with Validation

```typescript
// packages/shared/api-client/src/validated-client.ts
import { ApolloClient, ApolloQueryResult, FetchResult } from '@apollo/client';
import { z } from 'zod';
import { ValidationError } from '@viztechstack/validation';

export class ValidatedGraphQLClient {
  constructor(private client: ApolloClient<any>) {}

  /**
   * Execute query with runtime validation
   */
  async query<TData, TVariables, TSchema extends z.ZodType<TData>>(
    options: {
      query: any;
      variables?: TVariables;
      schema: TSchema;
    }
  ): Promise<z.infer<TSchema>> {
    try {
      // Execute GraphQL query
      const result: ApolloQueryResult<TData> = await this.client.query({
        query: options.query,
        variables: options.variables,
      });

      // Validate response with Zod
      const validated = options.schema.parse(result.data);

      return validated;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError('GraphQL response validation failed', error);
      }
      throw error;
    }
  }

  /**
   * Execute mutation with runtime validation
   */
  async mutate<TData, TVariables, TSchema extends z.ZodType<TData>>(
    options: {
      mutation: any;
      variables?: TVariables;
      schema: TSchema;
    }
  ): Promise<z.infer<TSchema>> {
    try {
      // Execute GraphQL mutation
      const result: FetchResult<TData> = await this.client.mutate({
        mutation: options.mutation,
        variables: options.variables,
      });

      if (!result.data) {
        throw new Error('Mutation returned no data');
      }

      // Validate response with Zod
      const validated = options.schema.parse(result.data);

      return validated;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError('GraphQL response validation failed', error);
      }
      throw error;
    }
  }
}
```


### 6.5 React Hook with Validation

```typescript
// packages/shared/api-client/src/hooks/useRoadmaps.ts
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client';
import { RoadmapPageSchema } from '@viztechstack/graphql-generated/zod-schemas';
import type { RoadmapPage, RoadmapPageInput } from '@viztechstack/graphql-generated/types';
import { handleValidationError } from '@viztechstack/validation';

const GET_ROADMAPS_PAGE = gql`
  query GetRoadmapsPage($input: RoadmapPageInput) {
    getRoadmapsPage(input: $input) {
      items {
        _id
        slug
        title
        description
        category
        difficulty
        topicCount
        status
      }
      nextCursor
      hasMore
    }
  }
`;

export function useRoadmaps(input?: RoadmapPageInput) {
  const { data, loading, error, fetchMore } = useQuery(GET_ROADMAPS_PAGE, {
    variables: { input },
  });

  // Runtime validation
  let validatedData: RoadmapPage | undefined;
  let validationError: Error | undefined;

  if (data?.getRoadmapsPage) {
    try {
      validatedData = RoadmapPageSchema.parse(data.getRoadmapsPage);
    } catch (err) {
      validationError = handleValidationError(err);
    }
  }

  return {
    roadmaps: validatedData?.items ?? [],
    nextCursor: validatedData?.nextCursor,
    hasMore: validatedData?.hasMore ?? false,
    loading,
    error: error || validationError,
    fetchMore: async () => {
      if (!validatedData?.nextCursor) return;

      await fetchMore({
        variables: {
          input: {
            ...input,
            cursor: validatedData.nextCursor,
          },
        },
      });
    },
  };
}
```

### 6.6 React Component Usage

```typescript
// apps/web/src/components/RoadmapList.tsx
import { useRoadmaps } from '@viztechstack/api-client';
import { RoadmapCard } from './RoadmapCard';
import { ErrorBoundary } from './ErrorBoundary';

export function RoadmapList() {
  const { roadmaps, loading, error, hasMore, fetchMore } = useRoadmaps({
    category: 'ROLE',
    limit: 24,
  });

  if (loading) return <LoadingSpinner />;
  
  if (error) {
    return (
      <ErrorBoundary error={error}>
        <p>Failed to load roadmaps. Please try again.</p>
      </ErrorBoundary>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-4">
        {roadmaps.map((roadmap) => (
          // Type-safe: roadmap is validated Roadmap type
          <RoadmapCard
            key={roadmap._id}
            roadmap={roadmap}
          />
        ))}
      </div>

      {hasMore && (
        <button onClick={fetchMore}>
          Load More
        </button>
      )}
    </div>
  );
}
```

### 6.7 Mutation Example

```typescript
// packages/shared/api-client/src/hooks/useCreateRoadmap.ts
import { gql, useMutation } from '@apollo/client';
import { z } from 'zod';
import type { CreateRoadmapInput } from '@viztechstack/graphql-generated/types';
import { CreateRoadmapInputSchema } from '@viztechstack/graphql-generated/zod-schemas';

const CREATE_ROADMAP = gql`
  mutation CreateRoadmap($input: CreateRoadmapInput!) {
    createRoadmap(input: $input)
  }
`;

const CreateRoadmapResponseSchema = z.object({
  createRoadmap: z.string(),
});

export function useCreateRoadmap() {
  const [mutate, { loading, error }] = useMutation(CREATE_ROADMAP);

  const createRoadmap = async (input: CreateRoadmapInput) => {
    // Validate input before sending
    const validatedInput = CreateRoadmapInputSchema.parse(input);

    const result = await mutate({
      variables: { input: validatedInput },
    });

    // Validate response
    const validated = CreateRoadmapResponseSchema.parse(result.data);

    return validated.createRoadmap;
  };

  return {
    createRoadmap,
    loading,
    error,
  };
}

// Usage in component
function CreateRoadmapForm() {
  const { createRoadmap, loading } = useCreateRoadmap();

  const handleSubmit = async (formData: CreateRoadmapInput) => {
    try {
      const roadmapId = await createRoadmap(formData);
      console.log('Created roadmap:', roadmapId);
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle validation error
        console.error('Validation failed:', error.errors);
      }
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```


---

## 7. Error Handling Strategy

### 7.1 Error Types

```typescript
// packages/shared/validation/src/errors.ts
import { ZodError } from 'zod';

export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly zodError: ZodError,
  ) {
    super(message);
    this.name = 'ValidationError';
  }

  /**
   * Get user-friendly error messages
   */
  getUserFriendlyMessages(): string[] {
    return this.zodError.errors.map((err) => {
      const path = err.path.join('.');
      return `${path}: ${err.message}`;
    });
  }

  /**
   * Get field-specific errors for forms
   */
  getFieldErrors(): Record<string, string[]> {
    const fieldErrors: Record<string, string[]> = {};

    for (const err of this.zodError.errors) {
      const field = err.path.join('.');
      if (!fieldErrors[field]) {
        fieldErrors[field] = [];
      }
      fieldErrors[field].push(err.message);
    }

    return fieldErrors;
  }
}
```

### 7.2 Error Handler

```typescript
// packages/shared/validation/src/error-handler.ts
import { ZodError } from 'zod';
import { ValidationError } from './errors';
import * as Sentry from '@sentry/nextjs';

export function handleValidationError(error: unknown): Error {
  if (error instanceof ZodError) {
    const validationError = new ValidationError(
      'Data validation failed',
      error,
    );

    // Log to Sentry
    Sentry.captureException(validationError, {
      extra: {
        zodErrors: error.errors,
      },
    });

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Validation Error:', {
        errors: error.errors,
        formatted: validationError.getUserFriendlyMessages(),
      });
    }

    return validationError;
  }

  return error instanceof Error ? error : new Error(String(error));
}
```

### 7.3 React Error Boundary

```typescript
// apps/web/src/components/ErrorBoundary.tsx
import React from 'react';
import { ValidationError } from '@viztechstack/validation';
import * as Sentry from '@sentry/nextjs';

interface Props {
  children: React.ReactNode;
  error?: Error;
  fallback?: React.ReactNode;
}

export function ErrorBoundary({ children, error, fallback }: Props) {
  if (!error) return <>{children}</>;

  // Handle validation errors
  if (error instanceof ValidationError) {
    return (
      <div className="error-container">
        <h3>Data Validation Error</h3>
        <ul>
          {error.getUserFriendlyMessages().map((msg, i) => (
            <li key={i}>{msg}</li>
          ))}
        </ul>
        <button onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  // Handle other errors
  Sentry.captureException(error);

  return (
    <div className="error-container">
      {fallback || (
        <>
          <h3>Something went wrong</h3>
          <p>{error.message}</p>
          <button onClick={() => window.location.reload()}>
            Retry
          </button>
        </>
      )}
    </div>
  );
}
```

### 7.4 Form Validation

```typescript
// apps/web/src/components/CreateRoadmapForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateRoadmapInputSchema } from '@viztechstack/graphql-generated/zod-schemas';
import { useCreateRoadmap } from '@viztechstack/api-client';

export function CreateRoadmapForm() {
  const { createRoadmap, loading } = useCreateRoadmap();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(CreateRoadmapInputSchema),
  });

  const onSubmit = async (data: any) => {
    try {
      const roadmapId = await createRoadmap(data);
      console.log('Created:', roadmapId);
    } catch (error) {
      console.error('Failed to create roadmap:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>Slug</label>
        <input {...register('slug')} />
        {errors.slug && <span>{errors.slug.message}</span>}
      </div>

      <div>
        <label>Title</label>
        <input {...register('title')} />
        {errors.title && <span>{errors.title.message}</span>}
      </div>

      <button type="submit" disabled={loading}>
        Create Roadmap
      </button>
    </form>
  );
}
```


---

## 8. Performance Considerations

### 8.1 When to Validate

**✅ Always Validate:**
- API responses from external services
- Data from AI/ML services (unpredictable)
- User input before submission
- Data from localStorage/sessionStorage
- WebSocket messages
- Third-party integrations

**⚠️ Conditionally Validate:**
- Internal API responses (development only)
- Trusted backend responses (with feature flag)

**❌ Skip Validation:**
- Static data (constants, configs)
- Already validated data in same request cycle
- Performance-critical hot paths (after initial validation)

### 8.2 Validation Strategies

**Strategy 1: Always Validate (Safest)**
```typescript
export function useRoadmaps() {
  const { data } = useQuery(GET_ROADMAPS);
  
  // Always validate
  const validated = RoadmapPageSchema.parse(data?.getRoadmapsPage);
  
  return validated;
}
```

**Strategy 2: Conditional Validation (Performance)**
```typescript
const ENABLE_VALIDATION = process.env.NODE_ENV === 'development' 
  || process.env.ENABLE_RUNTIME_VALIDATION === 'true';

export function useRoadmaps() {
  const { data } = useQuery(GET_ROADMAPS);
  
  if (ENABLE_VALIDATION) {
    return RoadmapPageSchema.parse(data?.getRoadmapsPage);
  }
  
  // Skip validation in production (trust backend)
  return data?.getRoadmapsPage;
}
```

**Strategy 3: Lazy Validation (Best Balance)**
```typescript
export function useRoadmaps() {
  const { data } = useQuery(GET_ROADMAPS);
  
  // Validate only once, cache result
  const validated = useMemo(() => {
    if (!data?.getRoadmapsPage) return undefined;
    return RoadmapPageSchema.parse(data.getRoadmapsPage);
  }, [data]);
  
  return validated;
}
```

### 8.3 Performance Optimization

**1. Partial Validation**
```typescript
// Only validate critical fields
const RoadmapPartialSchema = RoadmapSchema.pick({
  _id: true,
  slug: true,
  title: true,
});

const validated = RoadmapPartialSchema.parse(data);
```

**2. Lazy Parsing**
```typescript
// Parse only when needed
const RoadmapLazySchema = z.lazy(() => RoadmapSchema);
```

**3. Caching**
```typescript
const validationCache = new Map<string, any>();

function validateWithCache<T>(key: string, data: unknown, schema: z.ZodType<T>): T {
  const cached = validationCache.get(key);
  if (cached) return cached;
  
  const validated = schema.parse(data);
  validationCache.set(key, validated);
  
  return validated;
}
```

**4. Async Validation (Non-blocking)**
```typescript
async function validateAsync<T>(data: unknown, schema: z.ZodType<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(schema.parse(data));
      } catch (error) {
        reject(error);
      }
    }, 0);
  });
}
```

### 8.4 Bundle Size Optimization

**Tree Shaking:**
```typescript
// ❌ Bad: Imports entire Zod library
import * as z from 'zod';

// ✅ Good: Import only what you need
import { z } from 'zod';
```

**Code Splitting:**
```typescript
// Lazy load validation schemas
const RoadmapSchema = lazy(() => 
  import('@viztechstack/graphql-generated/zod-schemas').then(m => m.RoadmapSchema)
);
```

**Conditional Loading:**
```typescript
// Load validation only in development
if (process.env.NODE_ENV === 'development') {
  const { RoadmapSchema } = await import('@viztechstack/graphql-generated/zod-schemas');
  RoadmapSchema.parse(data);
}
```


---

## 9. Best Practices

### 9.1 Type Safety Rules

**Rule 1: Single Source of Truth**
```typescript
// ✅ Good: GraphQL schema is the source of truth
// schema.graphql → codegen → types.ts + zod-schemas.ts

// ❌ Bad: Duplicate type definitions
type Roadmap = { ... };  // Manual type
const RoadmapSchema = z.object({ ... });  // Manual schema
```

**Rule 2: Use Generated Types**
```typescript
// ✅ Good: Use generated types
import type { Roadmap } from '@viztechstack/graphql-generated/types';

// ❌ Bad: Define types manually
type Roadmap = {
  _id: string;
  slug: string;
  // ...
};
```

**Rule 3: Validate at Boundaries**
```typescript
// ✅ Good: Validate at API boundary
const data = await fetch('/api/roadmaps');
const validated = RoadmapSchema.parse(data);

// ❌ Bad: Trust external data
const data = await fetch('/api/roadmaps');
return data;  // No validation!
```

### 9.2 Schema Organization

**Rule 4: Modular Schemas**
```typescript
// ✅ Good: Separate schemas by domain
// roadmap.graphql
// user.graphql
// topic.graphql

// ❌ Bad: One giant schema file
// schema.graphql (10,000 lines)
```

**Rule 5: Reusable Fragments**
```typescript
// ✅ Good: Use GraphQL fragments
fragment RoadmapFields on Roadmap {
  _id
  slug
  title
  category
}

query GetRoadmaps {
  getRoadmaps {
    ...RoadmapFields
  }
}

// ❌ Bad: Repeat fields everywhere
query GetRoadmaps {
  getRoadmaps {
    _id
    slug
    title
    category
  }
}
```

### 9.3 Validation Patterns

**Rule 6: Fail Fast**
```typescript
// ✅ Good: Validate immediately
const validated = RoadmapSchema.parse(data);
processRoadmap(validated);

// ❌ Bad: Validate later
processRoadmap(data);  // Might fail deep in the code
```

**Rule 7: Meaningful Error Messages**
```typescript
// ✅ Good: Custom error messages
const RoadmapSchema = z.object({
  slug: z.string()
    .min(3, 'Slug must be at least 3 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens'),
});

// ❌ Bad: Generic errors
const RoadmapSchema = z.object({
  slug: z.string().min(3),  // "String must contain at least 3 character(s)"
});
```

**Rule 8: Transform Data**
```typescript
// ✅ Good: Transform during validation
const RoadmapSchema = z.object({
  slug: z.string().transform(s => s.toLowerCase()),
  title: z.string().transform(s => s.trim()),
});

// ❌ Bad: Transform separately
const validated = RoadmapSchema.parse(data);
validated.slug = validated.slug.toLowerCase();
validated.title = validated.title.trim();
```

### 9.4 Code Generation

**Rule 9: Automate Everything**
```json
// ✅ Good: Auto-generate on schema change
{
  "scripts": {
    "dev": "concurrently \"pnpm codegen:watch\" \"pnpm dev:web\"",
    "codegen:watch": "graphql-codegen --watch"
  }
}

// ❌ Bad: Manual generation
// Developer forgets to run codegen → types out of sync
```

**Rule 10: Version Control Generated Files**
```gitignore
# ✅ Good: Commit generated files
# packages/shared/graphql-generated/src/

# ❌ Bad: Ignore generated files
packages/shared/graphql-generated/
```

**Why commit generated files?**
- Easier code review (see what changed)
- CI/CD doesn't need to run codegen
- Faster builds
- Reproducible builds

### 9.5 Testing

**Rule 11: Test Validation Logic**
```typescript
// ✅ Good: Test validation
describe('RoadmapSchema', () => {
  it('should validate valid roadmap', () => {
    const valid = {
      _id: '123',
      slug: 'frontend',
      title: 'Frontend Developer',
      // ...
    };
    
    expect(() => RoadmapSchema.parse(valid)).not.toThrow();
  });

  it('should reject invalid slug', () => {
    const invalid = {
      _id: '123',
      slug: 'AB',  // Too short
      // ...
    };
    
    expect(() => RoadmapSchema.parse(invalid)).toThrow();
  });
});
```

**Rule 12: Mock Validated Data**
```typescript
// ✅ Good: Use factories for test data
import { RoadmapSchema } from '@viztechstack/graphql-generated/zod-schemas';

function createMockRoadmap(overrides?: Partial<Roadmap>): Roadmap {
  const mock = {
    _id: '123',
    slug: 'frontend',
    title: 'Frontend Developer',
    description: 'Learn frontend development',
    category: 'ROLE',
    difficulty: 'INTERMEDIATE',
    topicCount: 50,
    status: 'PUBLIC',
    ...overrides,
  };
  
  // Ensure mock data is valid
  return RoadmapSchema.parse(mock);
}
```


---

## 10. Migration Guide

### 10.1 Step-by-Step Migration

**Phase 1: Setup (Week 1)**

1. Install dependencies
```bash
pnpm add -D @graphql-codegen/cli
pnpm add -D @graphql-codegen/typescript
pnpm add -D @graphql-codegen/typescript-operations
pnpm add -D @graphql-codegen/typescript-validation-schema
pnpm add zod
```

2. Create `codegen.ts` configuration
3. Run initial code generation
```bash
pnpm codegen
```

4. Verify generated files

**Phase 2: Create Packages (Week 1-2)**

1. Create `packages/shared/graphql-schema`
2. Create `packages/shared/graphql-generated`
3. Create `packages/shared/api-client`
4. Update package dependencies

**Phase 3: Implement Validation (Week 2-3)**

1. Create `ValidatedGraphQLClient`
2. Create validation error handlers
3. Create React hooks with validation
4. Add error boundaries

**Phase 4: Migrate Existing Code (Week 3-4)**

1. Replace manual types with generated types
2. Add validation to API calls
3. Update React components
4. Add tests

**Phase 5: Monitoring & Optimization (Week 4+)**

1. Add Sentry error tracking
2. Monitor validation errors
3. Optimize performance
4. Document patterns

### 10.2 Rollout Strategy

**Option A: Big Bang (Not Recommended)**
- Migrate everything at once
- High risk
- Difficult to debug

**Option B: Gradual Migration (Recommended)**
```
Week 1: Setup + Roadmap module
Week 2: User module
Week 3: Topic module
Week 4: Progress module
Week 5: Cleanup + optimization
```

**Option C: Feature Flag**
```typescript
const USE_VALIDATION = process.env.ENABLE_VALIDATION === 'true';

export function useRoadmaps() {
  const { data } = useQuery(GET_ROADMAPS);
  
  if (USE_VALIDATION) {
    return RoadmapPageSchema.parse(data?.getRoadmapsPage);
  }
  
  return data?.getRoadmapsPage;
}
```

### 10.3 Backward Compatibility

**Strategy 1: Parallel Implementation**
```typescript
// Old API (deprecated)
export function useRoadmapsLegacy() {
  const { data } = useQuery(GET_ROADMAPS);
  return data?.getRoadmapsPage;
}

// New API (with validation)
export function useRoadmaps() {
  const { data } = useQuery(GET_ROADMAPS);
  return RoadmapPageSchema.parse(data?.getRoadmapsPage);
}
```

**Strategy 2: Gradual Type Migration**
```typescript
// Step 1: Add validation, keep old types
export function useRoadmaps(): OldRoadmapType[] {
  const validated = RoadmapPageSchema.parse(data);
  return validated.items as OldRoadmapType[];
}

// Step 2: Update return type
export function useRoadmaps(): Roadmap[] {
  const validated = RoadmapPageSchema.parse(data);
  return validated.items;
}
```


---

## 11. Troubleshooting

### 11.1 Common Issues

**Issue 1: Codegen Not Generating Zod Schemas**

```bash
# Error: Plugin "typescript-validation-schema" not found
```

**Solution:**
```bash
pnpm add -D @graphql-codegen/typescript-validation-schema
```

**Issue 2: Type Mismatch Between GraphQL and Zod**

```typescript
// GraphQL: String!
// Zod: z.string().nullable()  ❌ Wrong!
```

**Solution:**
```typescript
// codegen.ts
config: {
  schema: 'zod',
  // Ensure non-nullable fields are required
  strictScalars: true,
}
```

**Issue 3: Circular Dependencies**

```
Error: Circular dependency detected
graphql-generated → api-client → graphql-generated
```

**Solution:**
```
Correct dependency order:
graphql-schema (no deps)
    ↓
graphql-generated (depends on: graphql-schema)
    ↓
validation (depends on: graphql-generated)
    ↓
api-client (depends on: graphql-generated, validation)
    ↓
apps/web (depends on: api-client)
```

**Issue 4: Performance Degradation**

```typescript
// Validation taking too long
const validated = HugeSchema.parse(data);  // 500ms!
```

**Solution:**
```typescript
// Use lazy validation
const validated = useMemo(() => 
  HugeSchema.parse(data),
  [data]
);

// Or conditional validation
if (process.env.NODE_ENV === 'development') {
  HugeSchema.parse(data);
}
```

### 11.2 Debugging Tips

**Tip 1: Enable Verbose Logging**
```typescript
import { z } from 'zod';

// Enable detailed error messages
z.setErrorMap((issue, ctx) => {
  console.log('Validation issue:', issue);
  return { message: ctx.defaultError };
});
```

**Tip 2: Inspect Generated Code**
```bash
# Check generated files
cat packages/shared/graphql-generated/src/zod-schemas.ts
```

**Tip 3: Test Validation in Isolation**
```typescript
// Test schema directly
const testData = { /* ... */ };
const result = RoadmapSchema.safeParse(testData);

if (!result.success) {
  console.error('Validation failed:', result.error.errors);
}
```

---

## 12. Summary & Recommendations

### 12.1 Architecture Benefits

✅ **Type Safety**
- Compile-time: TypeScript types from GraphQL
- Runtime: Zod validation
- End-to-end type safety

✅ **Single Source of Truth**
- GraphQL schema drives everything
- No duplicate type definitions
- Auto-sync types and validation

✅ **Developer Experience**
- Auto-completion in IDE
- Catch errors early
- Clear error messages

✅ **Reliability**
- Catch data inconsistencies
- Prevent runtime errors
- Better error handling

### 12.2 Recommended Approach

**For VizTechStack Project:**

1. **Use Auto-Generated Zod Schemas**
   - Plugin: `@graphql-codegen/typescript-validation-schema`
   - Extend with custom validation when needed

2. **Validate at API Boundaries**
   - Always validate external API responses
   - Conditionally validate internal APIs (dev only)

3. **Gradual Migration**
   - Start with Roadmap module
   - Migrate one module at a time
   - Use feature flags for safety

4. **Performance Strategy**
   - Use `useMemo` for validation caching
   - Conditional validation in production
   - Monitor validation performance

5. **Error Handling**
   - Centralized error handler
   - User-friendly error messages
   - Log to Sentry

### 12.3 Next Steps

**Immediate (This Week):**
1. ✅ Install GraphQL Code Generator
2. ✅ Create `codegen.ts` configuration
3. ✅ Generate initial types and schemas
4. ✅ Create `ValidatedGraphQLClient`

**Short-term (Next 2 Weeks):**
1. 📝 Migrate Roadmap module
2. 📝 Add validation to API calls
3. 📝 Update React hooks
4. 📝 Add error boundaries

**Long-term (Next Month):**
1. 📊 Monitor validation errors
2. 🔧 Optimize performance
3. 📚 Document patterns
4. 🧪 Increase test coverage

### 12.4 Success Metrics

**Technical Metrics:**
- Type coverage: 100%
- Validation coverage: 80%+
- Runtime errors: -50%
- Build time: < 2 minutes

**Developer Metrics:**
- Time to add new feature: -30%
- Bugs caught at compile-time: +50%
- Developer satisfaction: High

---

## 13. References

**Documentation:**
- GraphQL Code Generator: https://the-guild.dev/graphql/codegen
- Zod: https://zod.dev
- TypeScript: https://www.typescriptlang.org

**Plugins:**
- `@graphql-codegen/typescript`
- `@graphql-codegen/typescript-operations`
- `@graphql-codegen/typescript-validation-schema`
- `@graphql-codegen/typescript-react-apollo`

**Related Patterns:**
- Type-safe API clients
- Runtime validation
- Schema-first development
- Contract testing

---

**Document Version:** 1.0  
**Last Updated:** 2025-01-XX  
**Author:** Senior Software Architect  
**Status:** Ready for Implementation
