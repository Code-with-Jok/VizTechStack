# GraphQL + Zod Validation Rules

## 📋 Overview

Quy tắc này định nghĩa các nguyên tắc và constraints khi làm việc với GraphQL Code Generator và Zod validation trong dự án VizTechStack.

---

## 🎯 Core Principles

### 1. Schema First Development

- **RULE:** GraphQL schema là single source of truth
- **DO:** Luôn bắt đầu với GraphQL schema definition
- **DON'T:** Viết TypeScript types hoặc Zod schemas thủ công
- **WHY:** Đảm bảo consistency giữa schema, types, và validation

### 2. Automatic Code Generation

- **RULE:** Tất cả types và schemas phải được generate tự động
- **DO:** Chạy `pnpm codegen` sau mỗi thay đổi schema
- **DON'T:** Edit generated files (`types.ts`, `zod-schemas.ts`)
- **WHY:** Tránh drift giữa schema và implementation

### 3. Runtime Validation

- **RULE:** Validate tất cả external data với Zod
- **DO:** Sử dụng generated Zod schemas
- **DON'T:** Trust external data without validation
- **WHY:** Đảm bảo data integrity tại runtime

---

## 📁 Package Structure Rules

### GraphQL Schema Package (`@viztechstack/graphql-schema`)

**Location:** `packages/shared/graphql-schema/`

**Purpose:** Chứa GraphQL schema definitions

**Rules:**

- ✅ Chỉ chứa `.graphql` files
- ✅ Organize theo domain (roadmap.graphql, user.graphql, etc.)
- ✅ Sử dụng GraphQL best practices (naming conventions, descriptions)
- ❌ Không chứa TypeScript code
- ❌ Không chứa business logic

**Example Structure:**

```
packages/shared/graphql-schema/
├── package.json
├── tsconfig.json
└── src/
    ├── roadmap.graphql
    ├── user.graphql
    └── common.graphql
```

### GraphQL Generated Package (`@viztechstack/graphql-generated`)

**Location:** `packages/shared/graphql-generated/`

**Purpose:** Chứa generated code từ GraphQL schema

**Rules:**

- ✅ Tất cả files trong `src/` là auto-generated
- ✅ Chỉ edit `index.ts` để control exports
- ✅ Commit generated files vào Git
- ❌ KHÔNG edit `types.ts` hoặc `zod-schemas.ts` manually
- ❌ Không thêm custom logic vào package này

**Generated Files:**

- `types.ts` - TypeScript types
- `zod-schemas.ts` - Zod validation schemas
- `operations.ts` - Generated operations (khi có GraphQL operations)
- `hooks.ts` - Generated React hooks (khi có GraphQL operations)

**Export Rules:**

```typescript
// ✅ GOOD: Export all types
export * from "./types";

// ✅ GOOD: Export only existing schemas
export {
  RoadmapCategorySchema,
  RoadmapDifficultySchema,
  // ... only schemas that exist
} from "./zod-schemas";

// ❌ BAD: Export non-existent schemas
export { NonExistentSchema } from "./zod-schemas";
```

### Validation Package (`@viztechstack/validation`)

**Location:** `packages/shared/validation/`

**Purpose:** Validation utilities và error handling

**Rules:**

- ✅ Chứa reusable validation utilities
- ✅ Custom error classes
- ✅ Error formatting helpers
- ❌ Không chứa domain-specific logic
- ❌ Không depend on GraphQL generated types

**Required Exports:**

- `ValidationError` class
- `handleValidationError()` function
- `safeParse()` function

### API Client Package (`@viztechstack/api-client`)

**Location:** `packages/shared/api-client/`

**Purpose:** GraphQL client với Zod validation

**Rules:**

- ✅ Wrap Apollo Client với validation layer
- ✅ Provide validated hooks
- ✅ Handle validation errors gracefully
- ❌ Không bypass validation
- ❌ Không expose unvalidated data

**Required Exports:**

- `ValidatedGraphQLClient` class
- Validated React hooks (useRoadmaps, etc.)

---

## 🔧 Code Generation Rules

### codegen.ts Configuration

**Location:** `codegen.ts` (root level)

**Rules:**

- ✅ Use local schema files (not remote server)
- ✅ Generate to `packages/shared/graphql-generated/src/`
- ✅ Enable both TypeScript and Zod plugins
- ✅ Configure proper scalars mapping
- ❌ Không generate vào multiple locations
- ❌ Không mix local và remote schemas

**Required Plugins:**

```typescript
{
  plugins: [
    "typescript", // Generate TS types
    "typescript-validation-schema", // Generate Zod schemas
    // 'typescript-operations',                // Uncomment when needed
    // 'typescript-react-apollo',              // Uncomment when needed
  ];
}
```

**Scalars Configuration:**

```typescript
{
  scalars: {
    ID: 'string',
    String: 'string',
    Boolean: 'boolean',
    Int: 'number',
    Float: 'number',
  }
}
```

### Generation Workflow

**MUST follow this order:**

1. **Edit GraphQL Schema**

   ```bash
   # Edit: packages/shared/graphql-schema/src/*.graphql
   ```

2. **Run Code Generator**

   ```bash
   pnpm codegen
   ```

3. **Verify Generated Files**

   ```bash
   # Check: packages/shared/graphql-generated/src/types.ts
   # Check: packages/shared/graphql-generated/src/zod-schemas.ts
   ```

4. **Update Exports (if needed)**

   ```bash
   # Edit: packages/shared/graphql-generated/src/index.ts
   # Only export schemas that exist
   ```

5. **Build Packages**

   ```bash
   pnpm turbo build --filter='./packages/**'
   ```

6. **Run Typecheck**
   ```bash
   pnpm turbo typecheck
   ```

---

## ✅ Validation Rules

### When to Validate

**MUST validate:**

- ✅ All GraphQL API responses
- ✅ External API data
- ✅ User input from forms
- ✅ Data from localStorage/sessionStorage
- ✅ WebSocket messages
- ✅ File uploads content

**DON'T validate:**

- ❌ Internal function parameters (use TypeScript types)
- ❌ Constants and hardcoded values
- ❌ Data already validated in the same request cycle

### How to Validate

**Option 1: Using ValidatedGraphQLClient**

```typescript
// ✅ GOOD: Automatic validation
const client = new ValidatedGraphQLClient(apolloClient);
const data = await client.query({
  query: GET_ROADMAP,
  schema: RoadmapSchema,
});
```

**Option 2: Using Validated Hooks**

```typescript
// ✅ GOOD: Hook with built-in validation
const { data, loading, error } = useRoadmaps();
```

**Option 3: Manual Validation**

```typescript
// ✅ GOOD: Manual validation with error handling
try {
  const validated = RoadmapSchema.parse(data);
  return validated;
} catch (error) {
  const validationError = new ValidationError(error);
  console.error(validationError.getUserMessage());
  throw validationError;
}
```

**❌ BAD: No validation**

```typescript
// ❌ BAD: Trusting external data
const data = await apolloClient.query({ query: GET_ROADMAP });
return data.roadmap; // No validation!
```

---

## 🚨 Error Handling Rules

### ValidationError Usage

**MUST use ValidationError class:**

```typescript
import { ValidationError } from "@viztechstack/validation";

try {
  schema.parse(data);
} catch (error) {
  // ✅ GOOD: Wrap Zod error
  throw new ValidationError(error);
}
```

**Available Methods:**

- `getUserMessage()` - User-friendly error message
- `getFieldErrors()` - Field-level errors for forms
- `getDetailedErrors()` - Detailed errors for debugging
- `toJSON()` - Serializable error object

### Error Handling in Components

```typescript
// ✅ GOOD: Handle validation errors
function MyComponent() {
  const { data, error } = useRoadmaps();

  if (error instanceof ValidationError) {
    return <ErrorMessage>{error.getUserMessage()}</ErrorMessage>;
  }

  return <div>{data?.roadmaps.map(...)}</div>;
}
```

---

## 🔒 Type Safety Rules

### TypeScript Configuration

**MUST enable strict mode:**

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}
```

### Type Usage

**✅ DO:**

```typescript
// Use generated types
import { Roadmap, RoadmapCategory } from '@viztechstack/graphql-generated';

const roadmap: Roadmap = { ... };
const category: RoadmapCategory = "ROLE";
```

**❌ DON'T:**

```typescript
// Don't use any
const roadmap: any = { ... };

// Don't redefine types
type Roadmap = { ... }; // Already generated!

// Don't use type assertions without validation
const roadmap = data as Roadmap; // Unsafe!
```

---

## 📦 Dependency Rules

### Package Dependencies

**GraphQL Schema Package:**

- ✅ No dependencies (pure schema)

**GraphQL Generated Package:**

- ✅ `zod` (for Zod schemas)
- ❌ No other dependencies

**Validation Package:**

- ✅ `zod` (peer dependency)
- ❌ No GraphQL dependencies

**API Client Package:**

- ✅ `@apollo/client`
- ✅ `@viztechstack/graphql-generated`
- ✅ `@viztechstack/validation`
- ✅ `zod`

### Version Constraints

**MUST use compatible versions:**

- `zod`: ^3.24.1 or higher
- `@apollo/client`: ^3.11.0 or higher
- `@graphql-codegen/cli`: ^5.0.0 or higher

---

## 🧪 Testing Rules

### What to Test

**MUST test:**

- ✅ Validation logic với invalid data
- ✅ Error handling và error messages
- ✅ Schema parsing với edge cases
- ✅ ValidatedGraphQLClient behavior

**Example Test:**

```typescript
describe('RoadmapSchema', () => {
  it('should validate valid roadmap data', () => {
    const validData = { ... };
    expect(() => RoadmapSchema.parse(validData)).not.toThrow();
  });

  it('should reject invalid roadmap data', () => {
    const invalidData = { ... };
    expect(() => RoadmapSchema.parse(invalidData)).toThrow(ValidationError);
  });
});
```

---

## 🔄 Refactoring Rules

### When to Regenerate Code

**MUST regenerate when:**

- ✅ GraphQL schema changes
- ✅ Adding new types/queries/mutations
- ✅ Changing field types
- ✅ Adding/removing fields

**Steps:**

1. Edit GraphQL schema
2. Run `pnpm codegen`
3. Update exports in `index.ts` if needed
4. Run `pnpm turbo typecheck`
5. Fix any type errors
6. Run tests

### When to Update Validation

**MUST update when:**

- ✅ Business rules change
- ✅ New validation requirements
- ✅ Error messages need improvement

**DON'T:**

- ❌ Modify generated Zod schemas
- ❌ Add custom validation to generated files

**Instead:**

- ✅ Create custom schemas that extend generated ones
- ✅ Add validation in business logic layer

---

## 📊 Performance Rules

### Validation Performance

**DO:**

- ✅ Validate once at API boundary
- ✅ Cache validated data
- ✅ Use `.safeParse()` for non-critical paths

**DON'T:**

- ❌ Validate same data multiple times
- ❌ Validate in render loops
- ❌ Validate internal data structures

### Code Generation Performance

**DO:**

- ✅ Run codegen in development only
- ✅ Commit generated files to Git
- ✅ Use CI to verify generated files are up-to-date

**DON'T:**

- ❌ Run codegen in production builds
- ❌ Generate code on every file change

---

## 🚀 CI/CD Rules

### Pre-commit Checks

**MUST pass:**

- ✅ `pnpm turbo lint`
- ✅ `pnpm turbo typecheck`

### CI Pipeline Checks

**MUST pass:**

- ✅ Build shared packages
- ✅ Lint
- ✅ Check no-any
- ✅ Typecheck
- ✅ Build apps
- ✅ Run tests

### Generated Files

**MUST:**

- ✅ Commit generated files to Git
- ✅ Verify generated files are up-to-date in CI
- ✅ Fail CI if generated files are outdated

---

## 📝 Documentation Rules

### Code Comments

**MUST document:**

- ✅ Custom validation logic
- ✅ Complex error handling
- ✅ Non-obvious type transformations

**Example:**

```typescript
// Validate roadmap data from external API
// This ensures data integrity before storing in database
const validated = RoadmapSchema.parse(externalData);
```

### Schema Documentation

**MUST document in GraphQL schema:**

```graphql
"""
Represents a learning roadmap with topics and connections
"""
type Roadmap {
  """
  Unique identifier for the roadmap
  """
  _id: ID!

  """
  Human-readable title (max 100 characters)
  """
  title: String!
}
```

---

## ⚠️ Common Pitfalls

### 1. Editing Generated Files

**Problem:** Manually editing `types.ts` or `zod-schemas.ts`  
**Solution:** Edit GraphQL schema và regenerate

### 2. Missing Validation

**Problem:** Trusting external data without validation  
**Solution:** Always validate với Zod schemas

### 3. Duplicate Type Definitions

**Problem:** Defining types manually khi đã có generated types  
**Solution:** Import từ `@viztechstack/graphql-generated`

### 4. Outdated Generated Files

**Problem:** Schema thay đổi nhưng quên regenerate  
**Solution:** Run `pnpm codegen` sau mỗi schema change

### 5. Wrong Export in index.ts

**Problem:** Export schemas không tồn tại  
**Solution:** Chỉ export schemas có trong `zod-schemas.ts`

---

## 🎓 Best Practices Summary

1. **Schema First:** GraphQL schema là source of truth
2. **Auto Generate:** Luôn generate code, không viết tay
3. **Validate Everything:** Validate tất cả external data
4. **Handle Errors:** Sử dụng ValidationError class
5. **Type Safe:** Enable strict TypeScript mode
6. **Test Validation:** Test với invalid data
7. **Document Schema:** Thêm descriptions vào GraphQL schema
8. **Commit Generated:** Commit generated files vào Git
9. **CI Verification:** Verify generated files trong CI
10. **Performance:** Validate once tại API boundary

---

## 🔗 Related Documents

- Architecture: `.docs/architecture/05-graphql-zod-architecture.md`
- Implementation: `.docs/architecture/graphql-zod/01-implementation-guide.md`
- Workflow: `.agents/workflows/graphql-zod-workflow.md`
- Complete Guide: `.docs/architecture/graphql-zod/IMPLEMENTATION-COMPLETE.md`

---

**Last Updated:** 2026-03-07  
**Version:** 1.0.0  
**Status:** Active
