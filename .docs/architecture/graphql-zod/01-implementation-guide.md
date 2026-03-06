# GraphQL + Zod Implementation Guide - Step by Step

## Mục Lục

1. [Tổng Quan Dự Án](#1-tổng-quan-dự-án)
2. [Cấu Trúc Project](#2-cấu-trúc-project)
3. [Luồng Chạy Logic](#3-luồng-chạy-logic)
4. [Step-by-Step Implementation](#4-step-by-step-implementation)
5. [Testing & Verification](#5-testing--verification)
6. [Checklist](#6-checklist)

---

## 1. Tổng Quan Dự Án

### 1.1 Mục Tiêu

Xây dựng hệ thống kết hợp:
- ✅ GraphQL Code Generator → TypeScript types
- ✅ Zod runtime validation
- ✅ Type-safe API client
- ✅ React hooks với validation

### 1.2 Kiến Trúc Tổng Thể

```
GraphQL Schema (Source of Truth)
        ↓
GraphQL Code Generator
        ↓
    ┌───┴───┐
    ↓       ↓
TypeScript  Zod Schemas
  Types     (Runtime)
    ↓       ↓
    └───┬───┘
        ↓
  API Client
  (Validated)
        ↓
   React App
```

### 1.3 Tech Stack

- **GraphQL**: Schema definition
- **GraphQL Code Generator**: Type generation
- **Zod**: Runtime validation
- **Apollo Client**: GraphQL client
- **React**: UI framework
- **TypeScript**: Type safety

---

## 2. Cấu Trúc Project

### 2.1 Folder Structure

```
viztechstack/
├── apps/
│   ├── web/                                    # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/                           # App router pages
│   │   │   ├── components/                    # React components
│   │   │   ├── hooks/                         # Custom hooks
│   │   │   └── lib/
│   │   │       └── graphql-client.ts         # Apollo client setup
│   │   └── package.json
│   │
│   └── api/                                    # NestJS backend
│       ├── src/
│       │   └── modules/
│       │       └── roadmap/
│       │           └── transport/
│       │               └── graphql/
│       │                   └── schemas/
│       │                       └── roadmap.schema.ts
│       └── package.json
│
├── packages/shared/
│   ├── graphql-schema/                         # 📝 GraphQL schemas
│   │   ├── src/
│   │   │   ├── roadmap.graphql                # Roadmap schema
│   │   │   ├── user.graphql                   # User schema
│   │   │   ├── topic.graphql                  # Topic schema
│   │   │   └── index.ts                       # Export all schemas
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── graphql-generated/                      # 🤖 Generated code
│   │   ├── src/
│   │   │   ├── types.ts                       # TypeScript types
│   │   │   ├── zod-schemas.ts                 # Zod validation schemas
│   │   │   ├── operations.ts                  # Query/Mutation types
│   │   │   ├── hooks.ts                       # React Apollo hooks
│   │   │   └── index.ts                       # Exports
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── api-client/                             # 🔌 API client
│   │   ├── src/
│   │   │   ├── client.ts                      # Apollo client
│   │   │   ├── validated-client.ts            # Client with validation
│   │   │   ├── hooks/                         # React hooks
│   │   │   │   ├── useRoadmaps.ts
│   │   │   │   ├── useCreateRoadmap.ts
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── validation/                             # ✅ Validation utilities
│       ├── src/
│       │   ├── errors.ts                      # Custom error classes
│       │   ├── error-handler.ts               # Error handling
│       │   ├── validators.ts                  # Validation helpers
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
│
├── codegen.ts                                  # GraphQL codegen config
├── package.json
└── pnpm-workspace.yaml
```


### 2.2 Package Dependencies

```
Dependency Graph:

graphql-schema (no dependencies)
    ↓
graphql-generated (depends on: graphql-schema)
    ↓
validation (depends on: graphql-generated)
    ↓
api-client (depends on: graphql-generated, validation)
    ↓
apps/web (depends on: api-client)
```

### 2.3 Package Versions

```json
{
  "dependencies": {
    "zod": "^3.22.4",
    "graphql": "^16.8.1",
    "@apollo/client": "^3.8.8"
  },
  "devDependencies": {
    "@graphql-codegen/cli": "^5.0.0",
    "@graphql-codegen/typescript": "^4.0.1",
    "@graphql-codegen/typescript-operations": "^4.0.1",
    "@graphql-codegen/typescript-react-apollo": "^4.1.0",
    "@graphql-codegen/typescript-validation-schema": "^0.13.0"
  }
}
```

---

## 3. Luồng Chạy Logic

### 3.1 Development Flow

```
┌─────────────────────────────────────────────────────────┐
│ STEP 1: Developer defines GraphQL schema                │
│ File: packages/shared/graphql-schema/src/roadmap.graphql│
│                                                          │
│ type Roadmap {                                           │
│   _id: ID!                                               │
│   slug: String!                                          │
│   title: String!                                         │
│ }                                                        │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 2: Run GraphQL Code Generator                      │
│ Command: pnpm codegen                                    │
│                                                          │
│ Reads: GraphQL schema files                             │
│ Generates:                                               │
│   - types.ts (TypeScript types)                         │
│   - zod-schemas.ts (Zod validation)                     │
│   - operations.ts (Query/Mutation types)                │
│   - hooks.ts (React hooks)                              │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 3: Generated Files Available                       │
│ Location: packages/shared/graphql-generated/src/        │
│                                                          │
│ types.ts:                                                │
│   export type Roadmap = {                               │
│     _id: string;                                         │
│     slug: string;                                        │
│     title: string;                                       │
│   };                                                     │
│                                                          │
│ zod-schemas.ts:                                          │
│   export const RoadmapSchema = z.object({               │
│     _id: z.string(),                                     │
│     slug: z.string(),                                    │
│     title: z.string(),                                   │
│   });                                                    │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 4: Developer uses in API client                    │
│ File: packages/shared/api-client/src/hooks/             │
│       useRoadmaps.ts                                     │
│                                                          │
│ import { RoadmapPageSchema } from                       │
│   '@viztechstack/graphql-generated/zod-schemas';       │
│                                                          │
│ export function useRoadmaps() {                         │
│   const { data } = useQuery(GET_ROADMAPS);             │
│   const validated = RoadmapPageSchema.parse(data);     │
│   return validated;                                      │
│ }                                                        │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 5: React component uses hook                       │
│ File: apps/web/src/components/RoadmapList.tsx          │
│                                                          │
│ import { useRoadmaps } from '@viztechstack/api-client';│
│                                                          │
│ export function RoadmapList() {                         │
│   const { roadmaps } = useRoadmaps();                   │
│   // roadmaps is type-safe and validated!              │
│   return <div>{roadmaps.map(r => r.title)}</div>       │
│ }                                                        │
└─────────────────────────────────────────────────────────┘
```


### 3.2 Runtime Flow (User Request)

```
┌─────────────────────────────────────────────────────────┐
│ USER ACTION: User visits /roadmaps page                 │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ REACT COMPONENT: RoadmapList renders                    │
│ Calls: useRoadmaps() hook                               │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ HOOK: useRoadmaps()                                      │
│ Executes: Apollo useQuery(GET_ROADMAPS)                │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ APOLLO CLIENT: Sends GraphQL query to API              │
│ POST http://localhost:4000/graphql                      │
│ Body: { query: "query GetRoadmaps { ... }" }           │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ API SERVER: NestJS GraphQL resolver                     │
│ Executes: RoadmapResolver.getRoadmaps()                │
│ Returns: Raw data from Convex database                  │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ RESPONSE: API returns JSON                              │
│ {                                                        │
│   "data": {                                              │
│     "getRoadmaps": [                                     │
│       { "_id": "1", "slug": "frontend", ... }           │
│     ]                                                    │
│   }                                                      │
│ }                                                        │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ VALIDATION: Zod validates response                       │
│ RoadmapPageSchema.parse(data.getRoadmaps)              │
│                                                          │
│ ✅ Success: Returns validated data                      │
│ ❌ Failure: Throws ZodError                             │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ ERROR HANDLING (if validation fails)                    │
│ - Catch ZodError                                         │
│ - Log to Sentry                                          │
│ - Show user-friendly error message                      │
│ - Render fallback UI                                     │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ SUCCESS: Component receives validated data              │
│ - Type-safe: TypeScript knows exact shape              │
│ - Runtime-safe: Zod validated structure                │
│ - Render: Display roadmaps to user                      │
└─────────────────────────────────────────────────────────┘
```

### 3.3 Error Flow

```
API Response (Invalid Data)
    ↓
Zod Validation
    ↓
ZodError thrown
    ↓
    ├─ Caught by error handler
    │   ↓
    │   ├─ Log to Sentry
    │   ├─ Log to console (dev)
    │   └─ Create ValidationError
    │
    └─ Caught by React Error Boundary
        ↓
        ├─ Display user-friendly message
        ├─ Show retry button
        └─ Render fallback UI
```

---

## 4. Step-by-Step Implementation

### STEP 1: Install Dependencies

**Location:** Root directory

**Commands:**
```bash
# Navigate to project root
cd /path/to/viztechstack

# Install GraphQL Code Generator
pnpm add -D @graphql-codegen/cli
pnpm add -D @graphql-codegen/typescript
pnpm add -D @graphql-codegen/typescript-operations
pnpm add -D @graphql-codegen/typescript-react-apollo
pnpm add -D @graphql-codegen/typescript-validation-schema

# Install runtime dependencies
pnpm add zod graphql

# Install Apollo Client (if not already installed)
pnpm add @apollo/client
```

**Verification:**
```bash
# Check package.json
cat package.json | grep "@graphql-codegen"
cat package.json | grep "zod"
```

**Expected Output:**
```json
{
  "devDependencies": {
    "@graphql-codegen/cli": "^5.0.0",
    "@graphql-codegen/typescript": "^4.0.1",
    "@graphql-codegen/typescript-operations": "^4.0.1",
    "@graphql-codegen/typescript-react-apollo": "^4.1.0",
    "@graphql-codegen/typescript-validation-schema": "^0.13.0"
  },
  "dependencies": {
    "zod": "^3.22.4"
  }
}
```


---

### STEP 2: Create GraphQL Schema Package

**Location:** `packages/shared/graphql-schema/`

**2.1 Create package.json**
```bash
mkdir -p packages/shared/graphql-schema/src
cd packages/shared/graphql-schema
```

**File:** `packages/shared/graphql-schema/package.json`
```json
{
  "name": "@viztechstack/graphql-schema",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  },
  "scripts": {
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "graphql": "^16.8.1"
  },
  "devDependencies": {
    "@viztechstack/typescript-config": "workspace:*",
    "typescript": "^5.7.0"
  }
}
```

**2.2 Create tsconfig.json**
```json
{
  "extends": "@viztechstack/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**2.3 Create GraphQL schema file**

**File:** `packages/shared/graphql-schema/src/roadmap.graphql`
```graphql
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

**2.4 Create index file**

**File:** `packages/shared/graphql-schema/src/index.ts`
```typescript
// Export all GraphQL schema files
export * from './roadmap.graphql';
```

**Verification:**
```bash
# Check files exist
ls -la packages/shared/graphql-schema/src/
# Should show: roadmap.graphql, index.ts

# Install dependencies
cd packages/shared/graphql-schema
pnpm install
```


---

### STEP 3: Create GraphQL Generated Package

**Location:** `packages/shared/graphql-generated/`

**3.1 Create package.json**
```bash
mkdir -p packages/shared/graphql-generated/src
cd packages/shared/graphql-generated
```

**File:** `packages/shared/graphql-generated/package.json`
```json
{
  "name": "@viztechstack/graphql-generated",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./types": "./src/types.ts",
    "./zod-schemas": "./src/zod-schemas.ts",
    "./operations": "./src/operations.ts",
    "./hooks": "./src/hooks.ts"
  },
  "scripts": {
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "graphql": "^16.8.1",
    "zod": "^3.22.4",
    "@apollo/client": "^3.8.8"
  },
  "devDependencies": {
    "@viztechstack/typescript-config": "workspace:*",
    "typescript": "^5.7.0"
  }
}
```

**3.2 Create tsconfig.json**
```json
{
  "extends": "@viztechstack/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**3.3 Create placeholder index file**

**File:** `packages/shared/graphql-generated/src/index.ts`
```typescript
// This file will be populated by GraphQL Code Generator
// Export all generated types and schemas

export * from './types';
export * from './zod-schemas';
export * from './operations';
export * from './hooks';
```

**Verification:**
```bash
cd packages/shared/graphql-generated
pnpm install
```

---

### STEP 4: Create CodeGen Configuration

**Location:** Root directory

**File:** `codegen.ts`
```typescript
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  // GraphQL schema source
  schema: 'http://localhost:4000/graphql',
  
  // Alternative: Use local schema files
  // schema: 'packages/shared/graphql-schema/src/**/*.graphql',
  
  // Client-side operations (queries, mutations)
  documents: [
    'apps/web/src/**/*.{ts,tsx}',
    'packages/shared/api-client/src/**/*.{ts,tsx}',
  ],
  
  generates: {
    // 1. TypeScript Types
    'packages/shared/graphql-generated/src/types.ts': {
      plugins: ['typescript'],
      config: {
        scalars: {
          ID: 'string',
          DateTime: 'string',
          JSON: 'Record<string, unknown>',
        },
        enumsAsTypes: true,
        futureProofEnums: true,
        addTypename: true,
        maybeValue: 'T | null | undefined',
      },
    },

    // 2. Zod Schemas
    'packages/shared/graphql-generated/src/zod-schemas.ts': {
      plugins: ['typescript', 'typescript-validation-schema'],
      config: {
        schema: 'zod',
        importFrom: 'zod',
        validationSchemaExportType: 'const',
        useTypeImports: true,
        scalarSchemas: {
          ID: 'z.string()',
          DateTime: 'z.string().datetime()',
          JSON: 'z.record(z.unknown())',
        },
      },
    },

    // 3. Operations
    'packages/shared/graphql-generated/src/operations.ts': {
      plugins: ['typescript', 'typescript-operations'],
      config: {
        avoidOptionals: false,
        addTypename: true,
      },
    },

    // 4. React Apollo Hooks
    'packages/shared/graphql-generated/src/hooks.ts': {
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-react-apollo',
      ],
      config: {
        withHooks: true,
        withComponent: false,
        withHOC: false,
        reactApolloVersion: 3,
        addTypename: true,
      },
    },
  },

  config: {
    skipTypename: false,
    useTypeImports: true,
  },

  watch: process.env.NODE_ENV === 'development',
  
  hooks: {
    afterAllFileWrite: ['prettier --write', 'eslint --fix'],
  },
};

export default config;
```

**Verification:**
```bash
# Check file exists
ls -la codegen.ts
```

---

### STEP 5: Add Scripts to package.json

**Location:** Root `package.json`

**Add these scripts:**
```json
{
  "scripts": {
    "codegen": "graphql-codegen --config codegen.ts",
    "codegen:watch": "graphql-codegen --config codegen.ts --watch",
    "codegen:check": "graphql-codegen --config codegen.ts --check"
  }
}
```

**Verification:**
```bash
# Check scripts exist
cat package.json | grep "codegen"
```


---

### STEP 6: Run Code Generation

**Prerequisites:**
- API server must be running on `http://localhost:4000/graphql`
- Or use local schema files

**6.1 Start API Server (if using remote schema)**
```bash
# Terminal 1: Start API server
cd apps/api
pnpm dev
```

**6.2 Run Code Generator**
```bash
# Terminal 2: Run codegen
pnpm codegen
```

**Expected Output:**
```
✔ Parse Configuration
✔ Generate outputs
  ✔ Generate to packages/shared/graphql-generated/src/types.ts
  ✔ Generate to packages/shared/graphql-generated/src/zod-schemas.ts
  ✔ Generate to packages/shared/graphql-generated/src/operations.ts
  ✔ Generate to packages/shared/graphql-generated/src/hooks.ts
✔ Run prettier --write
✔ Run eslint --fix
```

**Verification:**
```bash
# Check generated files
ls -la packages/shared/graphql-generated/src/
# Should show: types.ts, zod-schemas.ts, operations.ts, hooks.ts, index.ts

# Check file content
head -n 20 packages/shared/graphql-generated/src/types.ts
head -n 20 packages/shared/graphql-generated/src/zod-schemas.ts
```

**Expected Content (types.ts):**
```typescript
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  // ...
};

export enum RoadmapCategory {
  Role = 'ROLE',
  Skill = 'SKILL',
  BestPractice = 'BEST_PRACTICE',
}

export type Roadmap = {
  __typename?: 'Roadmap';
  _id: Scalars['ID']['output'];
  slug: Scalars['String']['output'];
  title: Scalars['String']['output'];
  // ...
};
```

**Expected Content (zod-schemas.ts):**
```typescript
import { z } from 'zod';

export const RoadmapCategorySchema = z.enum([
  'ROLE',
  'SKILL',
  'BEST_PRACTICE',
]);

export const RoadmapSchema = z.object({
  __typename: z.literal('Roadmap').optional(),
  _id: z.string(),
  slug: z.string(),
  title: z.string(),
  // ...
});
```

---

### STEP 7: Create Validation Package

**Location:** `packages/shared/validation/`

**7.1 Create package.json**
```bash
mkdir -p packages/shared/validation/src
cd packages/shared/validation
```

**File:** `packages/shared/validation/package.json`
```json
{
  "name": "@viztechstack/validation",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  },
  "scripts": {
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "zod": "^3.22.4",
    "@viztechstack/graphql-generated": "workspace:*"
  },
  "devDependencies": {
    "@viztechstack/typescript-config": "workspace:*",
    "typescript": "^5.7.0"
  }
}
```

**7.2 Create error classes**

**File:** `packages/shared/validation/src/errors.ts`
```typescript
import { ZodError } from 'zod';

export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly zodError: ZodError,
  ) {
    super(message);
    this.name = 'ValidationError';
  }

  getUserFriendlyMessages(): string[] {
    return this.zodError.errors.map((err) => {
      const path = err.path.join('.');
      return `${path}: ${err.message}`;
    });
  }

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

**7.3 Create error handler**

**File:** `packages/shared/validation/src/error-handler.ts`
```typescript
import { ZodError } from 'zod';
import { ValidationError } from './errors';

export function handleValidationError(error: unknown): Error {
  if (error instanceof ZodError) {
    const validationError = new ValidationError(
      'Data validation failed',
      error,
    );

    // Log in development
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

**7.4 Create index file**

**File:** `packages/shared/validation/src/index.ts`
```typescript
export * from './errors';
export * from './error-handler';
```

**Verification:**
```bash
cd packages/shared/validation
pnpm install
pnpm typecheck
```


---

### STEP 8: Create API Client Package

**Location:** `packages/shared/api-client/`

**8.1 Create package.json**
```bash
mkdir -p packages/shared/api-client/src/hooks
cd packages/shared/api-client
```

**File:** `packages/shared/api-client/package.json`
```json
{
  "name": "@viztechstack/api-client",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  },
  "scripts": {
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@apollo/client": "^3.8.8",
    "graphql": "^16.8.1",
    "zod": "^3.22.4",
    "@viztechstack/graphql-generated": "workspace:*",
    "@viztechstack/validation": "workspace:*"
  },
  "devDependencies": {
    "@viztechstack/typescript-config": "workspace:*",
    "@types/react": "^18.2.0",
    "react": "^19.0.0",
    "typescript": "^5.7.0"
  },
  "peerDependencies": {
    "react": "^18.0.0 || ^19.0.0"
  }
}
```

**8.2 Create Apollo client**

**File:** `packages/shared/api-client/src/client.ts`
```typescript
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql',
});

export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});
```

**8.3 Create validated client**

**File:** `packages/shared/api-client/src/validated-client.ts`
```typescript
import { ApolloClient, ApolloQueryResult, FetchResult } from '@apollo/client';
import { z } from 'zod';
import { ValidationError, handleValidationError } from '@viztechstack/validation';

export class ValidatedGraphQLClient {
  constructor(private client: ApolloClient<any>) {}

  async query<TData, TVariables, TSchema extends z.ZodType<TData>>(
    options: {
      query: any;
      variables?: TVariables;
      schema: TSchema;
    }
  ): Promise<z.infer<TSchema>> {
    try {
      const result: ApolloQueryResult<TData> = await this.client.query({
        query: options.query,
        variables: options.variables,
      });

      const validated = options.schema.parse(result.data);
      return validated;
    } catch (error) {
      throw handleValidationError(error);
    }
  }

  async mutate<TData, TVariables, TSchema extends z.ZodType<TData>>(
    options: {
      mutation: any;
      variables?: TVariables;
      schema: TSchema;
    }
  ): Promise<z.infer<TSchema>> {
    try {
      const result: FetchResult<TData> = await this.client.mutate({
        mutation: options.mutation,
        variables: options.variables,
      });

      if (!result.data) {
        throw new Error('Mutation returned no data');
      }

      const validated = options.schema.parse(result.data);
      return validated;
    } catch (error) {
      throw handleValidationError(error);
    }
  }
}
```

**8.4 Create useRoadmaps hook**

**File:** `packages/shared/api-client/src/hooks/useRoadmaps.ts`
```typescript
import { gql, useQuery } from '@apollo/client';
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

**8.5 Create hooks index**

**File:** `packages/shared/api-client/src/hooks/index.ts`
```typescript
export * from './useRoadmaps';
```

**8.6 Create main index**

**File:** `packages/shared/api-client/src/index.ts`
```typescript
export * from './client';
export * from './validated-client';
export * from './hooks';
```

**Verification:**
```bash
cd packages/shared/api-client
pnpm install
pnpm typecheck
```


---

### STEP 9: Update Web App

**Location:** `apps/web/`

**9.1 Update package.json dependencies**

**File:** `apps/web/package.json`
```json
{
  "dependencies": {
    "@viztechstack/api-client": "workspace:*",
    "@viztechstack/graphql-generated": "workspace:*",
    "@viztechstack/validation": "workspace:*",
    "@apollo/client": "^3.8.8",
    "zod": "^3.22.4"
  }
}
```

**9.2 Setup Apollo Provider**

**File:** `apps/web/src/lib/graphql-client.ts`
```typescript
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql',
});

export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});
```

**9.3 Add Apollo Provider to layout**

**File:** `apps/web/src/app/layout.tsx`
```typescript
'use client';

import { ApolloProvider } from '@apollo/client';
import { apolloClient } from '@/lib/graphql-client';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ApolloProvider client={apolloClient}>
          {children}
        </ApolloProvider>
      </body>
    </html>
  );
}
```

**9.4 Create RoadmapList component**

**File:** `apps/web/src/components/RoadmapList.tsx`
```typescript
'use client';

import { useRoadmaps } from '@viztechstack/api-client';
import { RoadmapCard } from './RoadmapCard';

export function RoadmapList() {
  const { roadmaps, loading, error, hasMore, fetchMore } = useRoadmaps({
    limit: 24,
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <h3>Error loading roadmaps</h3>
        <p>{error.message}</p>
        <button onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-4">
        {roadmaps.map((roadmap) => (
          <RoadmapCard key={roadmap._id} roadmap={roadmap} />
        ))}
      </div>

      {hasMore && (
        <button onClick={fetchMore} className="mt-4">
          Load More
        </button>
      )}
    </div>
  );
}
```

**9.5 Create RoadmapCard component**

**File:** `apps/web/src/components/RoadmapCard.tsx`
```typescript
import type { Roadmap } from '@viztechstack/graphql-generated/types';
import Link from 'next/link';

interface Props {
  roadmap: Roadmap;
}

export function RoadmapCard({ roadmap }: Props) {
  return (
    <Link href={`/roadmaps/${roadmap.slug}`}>
      <div className="card">
        <h3>{roadmap.title}</h3>
        <p>{roadmap.description}</p>
        <div className="meta">
          <span>{roadmap.category}</span>
          <span>{roadmap.difficulty}</span>
          <span>{roadmap.topicCount} topics</span>
        </div>
      </div>
    </Link>
  );
}
```

**9.6 Use in page**

**File:** `apps/web/src/app/page.tsx`
```typescript
import { RoadmapList } from '@/components/RoadmapList';

export default function Home() {
  return (
    <main>
      <h1>Developer Roadmaps</h1>
      <RoadmapList />
    </main>
  );
}
```

**Verification:**
```bash
cd apps/web
pnpm install
pnpm typecheck
```

---

### STEP 10: Test the Implementation

**10.1 Start all services**

```bash
# Terminal 1: Start API server
cd apps/api
pnpm dev

# Terminal 2: Start web app
cd apps/web
pnpm dev

# Terminal 3: Watch for schema changes (optional)
pnpm codegen:watch
```

**10.2 Test in browser**

1. Open `http://localhost:3000`
2. Check browser console for errors
3. Verify roadmaps are displayed
4. Check Network tab for GraphQL requests

**10.3 Test validation**

**Simulate invalid data:**
```typescript
// Temporarily modify API response to return invalid data
// In apps/api/src/modules/roadmap/transport/graphql/resolvers/roadmap.resolver.ts

@Query(() => [Roadmap])
async getRoadmaps() {
  return [
    {
      _id: '123',
      slug: 'AB',  // Too short! Should fail validation
      title: 'Test',
      // ... missing required fields
    }
  ];
}
```

**Expected behavior:**
- Zod validation should catch the error
- Error should be logged to console
- User should see error message
- Fallback UI should be displayed

**10.4 Verify type safety**

```typescript
// In any component
import { useRoadmaps } from '@viztechstack/api-client';

function TestComponent() {
  const { roadmaps } = useRoadmaps();
  
  // TypeScript should autocomplete these fields:
  roadmaps[0].  // _id, slug, title, description, etc.
  
  // TypeScript should error on invalid fields:
  roadmaps[0].invalidField;  // ❌ Error!
  
  return null;
}
```


---

## 5. Testing & Verification

### 5.1 Unit Tests

**Test Zod Schemas:**

**File:** `packages/shared/graphql-generated/src/__tests__/zod-schemas.test.ts`
```typescript
import { describe, it, expect } from 'vitest';
import { RoadmapSchema, RoadmapCategorySchema } from '../zod-schemas';

describe('RoadmapSchema', () => {
  it('should validate valid roadmap', () => {
    const valid = {
      _id: '123',
      slug: 'frontend-developer',
      title: 'Frontend Developer',
      description: 'Learn frontend development',
      category: 'ROLE',
      difficulty: 'INTERMEDIATE',
      topicCount: 50,
      status: 'PUBLIC',
    };

    expect(() => RoadmapSchema.parse(valid)).not.toThrow();
  });

  it('should reject invalid slug', () => {
    const invalid = {
      _id: '123',
      slug: '',  // Empty slug
      title: 'Frontend Developer',
      description: 'Learn frontend development',
      category: 'ROLE',
      difficulty: 'INTERMEDIATE',
      topicCount: 50,
      status: 'PUBLIC',
    };

    expect(() => RoadmapSchema.parse(invalid)).toThrow();
  });

  it('should reject invalid category', () => {
    const invalid = {
      _id: '123',
      slug: 'frontend',
      title: 'Frontend Developer',
      description: 'Learn frontend development',
      category: 'INVALID',  // Invalid category
      difficulty: 'INTERMEDIATE',
      topicCount: 50,
      status: 'PUBLIC',
    };

    expect(() => RoadmapSchema.parse(invalid)).toThrow();
  });
});
```

**Test API Client:**

**File:** `packages/shared/api-client/src/__tests__/useRoadmaps.test.tsx`
```typescript
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { useRoadmaps } from '../hooks/useRoadmaps';

const mocks = [
  {
    request: {
      query: GET_ROADMAPS_PAGE,
      variables: { input: { limit: 24 } },
    },
    result: {
      data: {
        getRoadmapsPage: {
          items: [
            {
              _id: '1',
              slug: 'frontend',
              title: 'Frontend Developer',
              description: 'Learn frontend',
              category: 'ROLE',
              difficulty: 'INTERMEDIATE',
              topicCount: 50,
              status: 'PUBLIC',
            },
          ],
          nextCursor: null,
          hasMore: false,
        },
      },
    },
  },
];

describe('useRoadmaps', () => {
  it('should fetch and validate roadmaps', async () => {
    const wrapper = ({ children }: any) => (
      <MockedProvider mocks={mocks} addTypename={false}>
        {children}
      </MockedProvider>
    );

    const { result } = renderHook(() => useRoadmaps({ limit: 24 }), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.roadmaps).toHaveLength(1);
    expect(result.current.roadmaps[0].slug).toBe('frontend');
  });
});
```

### 5.2 Integration Tests

**Test End-to-End Flow:**

**File:** `apps/web/e2e/roadmaps.spec.ts` (Playwright)
```typescript
import { test, expect } from '@playwright/test';

test('should display roadmaps with validation', async ({ page }) => {
  await page.goto('/');

  // Wait for roadmaps to load
  await page.waitForSelector('[data-testid="roadmap-card"]');

  // Check if roadmaps are displayed
  const roadmaps = await page.locator('[data-testid="roadmap-card"]').count();
  expect(roadmaps).toBeGreaterThan(0);

  // Check if data is type-safe (no console errors)
  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  await page.waitForTimeout(1000);
  expect(consoleErrors).toHaveLength(0);
});

test('should handle validation errors gracefully', async ({ page }) => {
  // Mock API to return invalid data
  await page.route('**/graphql', (route) => {
    route.fulfill({
      status: 200,
      body: JSON.stringify({
        data: {
          getRoadmapsPage: {
            items: [
              {
                _id: '1',
                slug: 'AB',  // Invalid: too short
                // Missing required fields
              },
            ],
          },
        },
      }),
    });
  });

  await page.goto('/');

  // Should display error message
  await expect(page.locator('.error')).toBeVisible();
  await expect(page.locator('text=Error loading roadmaps')).toBeVisible();
});
```

### 5.3 Manual Testing Checklist

**✅ Type Safety:**
- [ ] TypeScript autocomplete works in IDE
- [ ] Invalid field access shows TypeScript error
- [ ] Enum values are type-safe

**✅ Runtime Validation:**
- [ ] Valid data passes validation
- [ ] Invalid data throws ZodError
- [ ] Error messages are user-friendly
- [ ] Validation errors are logged

**✅ Error Handling:**
- [ ] Validation errors show error UI
- [ ] Network errors show error UI
- [ ] Retry button works
- [ ] Errors are logged to Sentry (if configured)

**✅ Performance:**
- [ ] Validation doesn't cause noticeable lag
- [ ] Large datasets are handled efficiently
- [ ] Memoization works correctly

**✅ Developer Experience:**
- [ ] Code generation is fast
- [ ] Watch mode works
- [ ] Hot reload works
- [ ] Build succeeds


---

## 6. Checklist

### 6.1 Setup Checklist

**Dependencies:**
- [ ] Install `@graphql-codegen/cli`
- [ ] Install `@graphql-codegen/typescript`
- [ ] Install `@graphql-codegen/typescript-operations`
- [ ] Install `@graphql-codegen/typescript-react-apollo`
- [ ] Install `@graphql-codegen/typescript-validation-schema`
- [ ] Install `zod`
- [ ] Install `@apollo/client`

**Packages:**
- [ ] Create `packages/shared/graphql-schema`
- [ ] Create `packages/shared/graphql-generated`
- [ ] Create `packages/shared/validation`
- [ ] Create `packages/shared/api-client`

**Configuration:**
- [ ] Create `codegen.ts`
- [ ] Add codegen scripts to `package.json`
- [ ] Configure GraphQL schema source
- [ ] Configure output paths

**Code Generation:**
- [ ] Run `pnpm codegen`
- [ ] Verify `types.ts` generated
- [ ] Verify `zod-schemas.ts` generated
- [ ] Verify `operations.ts` generated
- [ ] Verify `hooks.ts` generated

### 6.2 Implementation Checklist

**Validation Package:**
- [ ] Create `ValidationError` class
- [ ] Create `handleValidationError` function
- [ ] Export from index

**API Client Package:**
- [ ] Create Apollo client
- [ ] Create `ValidatedGraphQLClient`
- [ ] Create `useRoadmaps` hook
- [ ] Create other hooks as needed
- [ ] Export from index

**Web App:**
- [ ] Add package dependencies
- [ ] Setup Apollo Provider
- [ ] Create components using hooks
- [ ] Add error boundaries
- [ ] Test in browser

### 6.3 Testing Checklist

**Unit Tests:**
- [ ] Test Zod schemas with valid data
- [ ] Test Zod schemas with invalid data
- [ ] Test API client hooks
- [ ] Test error handling

**Integration Tests:**
- [ ] Test end-to-end flow
- [ ] Test validation errors
- [ ] Test error boundaries
- [ ] Test retry functionality

**Manual Tests:**
- [ ] Verify type safety in IDE
- [ ] Test with valid API responses
- [ ] Test with invalid API responses
- [ ] Test error UI
- [ ] Test performance

### 6.4 Documentation Checklist

- [ ] Document architecture
- [ ] Document folder structure
- [ ] Document data flow
- [ ] Document error handling
- [ ] Document testing strategy
- [ ] Create implementation guide
- [ ] Add code examples
- [ ] Add troubleshooting guide

### 6.5 Deployment Checklist

**Pre-deployment:**
- [ ] Run `pnpm codegen` in CI/CD
- [ ] Run tests
- [ ] Run type checking
- [ ] Run linting
- [ ] Build succeeds

**Post-deployment:**
- [ ] Monitor validation errors
- [ ] Check Sentry for errors
- [ ] Verify performance
- [ ] Check user feedback

---

## 7. Troubleshooting

### Common Issues

**Issue 1: Codegen fails with "Schema not found"**

**Solution:**
```bash
# Make sure API server is running
cd apps/api
pnpm dev

# Or use local schema files
# In codegen.ts:
schema: 'packages/shared/graphql-schema/src/**/*.graphql'
```

**Issue 2: Zod schemas not generated**

**Solution:**
```bash
# Check plugin is installed
pnpm list @graphql-codegen/typescript-validation-schema

# Reinstall if needed
pnpm add -D @graphql-codegen/typescript-validation-schema
```

**Issue 3: Type errors in generated code**

**Solution:**
```bash
# Regenerate code
pnpm codegen

# Clear cache
rm -rf packages/shared/graphql-generated/dist
rm -rf .turbo

# Rebuild
pnpm build
```

**Issue 4: Validation always fails**

**Solution:**
```typescript
// Check schema matches API response
console.log('API Response:', data);
console.log('Schema:', RoadmapSchema);

// Use safeParse for debugging
const result = RoadmapSchema.safeParse(data);
if (!result.success) {
  console.error('Validation errors:', result.error.errors);
}
```

**Issue 5: Performance issues**

**Solution:**
```typescript
// Use memoization
const validated = useMemo(() => 
  RoadmapSchema.parse(data),
  [data]
);

// Or conditional validation
if (process.env.NODE_ENV === 'development') {
  RoadmapSchema.parse(data);
}
```

---

## 8. Next Steps

### Immediate (This Week)

1. ✅ Complete setup (Steps 1-5)
2. ✅ Run code generation (Step 6)
3. ✅ Create validation package (Step 7)
4. ✅ Create API client (Step 8)
5. ✅ Update web app (Step 9)
6. ✅ Test implementation (Step 10)

### Short-term (Next 2 Weeks)

1. 📝 Add more GraphQL schemas (User, Topic, Progress)
2. 📝 Create hooks for all entities
3. 📝 Add comprehensive error handling
4. 📝 Add unit tests
5. 📝 Add integration tests
6. 📝 Configure Sentry error tracking

### Long-term (Next Month)

1. 📊 Monitor validation errors in production
2. 🔧 Optimize performance
3. 📚 Document patterns and best practices
4. 🧪 Increase test coverage to 80%+
5. 🎨 Improve error UI/UX
6. 📈 Add analytics for validation failures

---

## 9. Summary

### What We Built

✅ **Type-Safe GraphQL Client**
- Compile-time type safety from GraphQL schema
- Runtime validation with Zod
- Zero duplication of type definitions

✅ **Scalable Architecture**
- Monorepo-friendly structure
- Clear separation of concerns
- Easy to maintain and extend

✅ **Developer Experience**
- Auto-generated types and schemas
- IDE autocomplete
- Clear error messages

✅ **Reliability**
- Catch data inconsistencies at runtime
- Prevent runtime errors
- Better error handling

### Key Benefits

1. **Single Source of Truth**: GraphQL schema drives everything
2. **Type Safety**: End-to-end TypeScript + Zod validation
3. **Maintainability**: Auto-generated code, no manual sync
4. **Scalability**: Works for large applications
5. **Developer Experience**: Fast feedback, clear errors

### Success Metrics

- ✅ Type coverage: 100%
- ✅ Validation coverage: 80%+
- ✅ Build time: < 2 minutes
- ✅ Zero runtime type errors
- ✅ Developer satisfaction: High

---

**Document Version:** 1.0  
**Last Updated:** 2025-01-XX  
**Status:** Ready for Implementation  
**Estimated Time:** 2-3 days for initial setup, 1-2 weeks for complete migration
