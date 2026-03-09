# GraphQL + Zod Validation Workflow

## 📋 Overview

Workflow này hướng dẫn AI agents cách thực hiện các tác vụ liên quan đến GraphQL Code Generator và Zod validation trong dự án VizTechStack.

---

## 🎯 Workflow Types

### 1. Add New GraphQL Type

### 2. Modify Existing GraphQL Type

### 3. Add New Query/Mutation

### 4. Create Validated Hook

### 5. Fix Validation Errors

### 6. Refactor Validation Logic

### 7. Update Generated Code

---

## 1️⃣ Workflow: Add New GraphQL Type

### Context

Khi cần thêm một entity mới vào hệ thống (ví dụ: User, Course, Project)

### Prerequisites

- ✅ Hiểu business requirements
- ✅ Biết relationships với existing types
- ✅ Có GraphQL schema knowledge

### Steps

#### Step 1: Create/Update GraphQL Schema File

```bash
# Location: packages/shared/graphql-schema/src/
# File: <domain>.graphql (e.g., user.graphql)
```

**Action:**

```graphql
"""
User account in the system
"""
type User {
  """
  Unique user identifier
  """
  _id: ID!

  """
  User email address
  """
  email: String!

  """
  User display name
  """
  name: String!

  """
  User role in the system
  """
  role: UserRole!

  """
  Account creation timestamp
  """
  createdAt: String!
}

"""
Available user roles
"""
enum UserRole {
  ADMIN
  USER
  GUEST
}
```

**Checklist:**

- [ ] Add type description
- [ ] Add field descriptions
- [ ] Define proper types (ID, String, Int, etc.)
- [ ] Mark required fields with `!`
- [ ] Define enums if needed
- [ ] Consider nullable fields carefully

#### Step 2: Run Code Generator

```bash
pnpm codegen
```

**Expected Output:**

```
✔ Parse Configuration
✔ Generate outputs
```

**Verify:**

- [ ] `packages/shared/graphql-generated/src/types.ts` updated
- [ ] `packages/shared/graphql-generated/src/zod-schemas.ts` updated
- [ ] New types exported: `User`, `UserRole`
- [ ] New schemas exported: `UserRoleSchema`

#### Step 3: Update Exports

```typescript
// File: packages/shared/graphql-generated/src/index.ts

// Add new schema exports
export {
  // ... existing exports
  UserRoleSchema, // Add this
} from "./zod-schemas";
```

**Checklist:**

- [ ] Only export schemas that exist in `zod-schemas.ts`
- [ ] Don't export output type schemas (User, UserPage, etc.)
- [ ] Only export input type and enum schemas

#### Step 4: Build and Verify

```bash
# Build packages
pnpm turbo build --filter='./packages/**'

# Run typecheck
pnpm turbo typecheck
```

**Expected:**

- [ ] ✅ All packages build successfully
- [ ] ✅ No TypeScript errors

#### Step 5: Create Validation Schemas (if needed)

```typescript
// File: packages/shared/api-client/src/schemas/user.ts

import { z } from "zod";
import { User, UserRoleSchema } from "@viztechstack/graphql-generated";

// Schema for User output type
export const UserSchema = z.object({
  _id: z.string(),
  email: z.string().email(),
  name: z.string().min(1),
  role: UserRoleSchema,
  createdAt: z.string(),
}) satisfies z.ZodType<User>;
```

**Checklist:**

- [ ] Import generated types
- [ ] Use generated enum schemas
- [ ] Add custom validation rules
- [ ] Use `satisfies` for type checking

#### Step 6: Test

```bash
pnpm turbo test
```

**Checklist:**

- [ ] Write tests for schema validation
- [ ] Test with valid data
- [ ] Test with invalid data
- [ ] Test edge cases

### Success Criteria

- ✅ GraphQL schema updated
- ✅ Code generated successfully
- ✅ Exports updated correctly
- ✅ Build passes
- ✅ Typecheck passes
- ✅ Tests pass

---

## 2️⃣ Workflow: Modify Existing GraphQL Type

### Context

Khi cần thay đổi existing type (add/remove/modify fields)

### Prerequisites

- ✅ Understand impact on existing code
- ✅ Check for breaking changes
- ✅ Plan migration if needed

### Steps

#### Step 1: Analyze Impact

```bash
# Search for usage of the type
grep -r "TypeName" apps/ packages/
```

**Questions to answer:**

- [ ] Có bao nhiêu places sử dụng type này?
- [ ] Thay đổi có breaking không?
- [ ] Cần migration data không?

#### Step 2: Update GraphQL Schema

```graphql
# File: packages/shared/graphql-schema/src/<domain>.graphql

type Roadmap {
  _id: ID!
  title: String!

  # ✅ ADD: New field
  author: User!

  # ✅ MODIFY: Change type
  topicCount: Int! # was: String!

  # ❌ REMOVE: Deprecated field
  # oldField: String
}
```

**Checklist:**

- [ ] Add descriptions for new fields
- [ ] Mark breaking changes in comments
- [ ] Consider deprecation instead of removal

#### Step 3: Regenerate Code

```bash
pnpm codegen
```

#### Step 4: Fix TypeScript Errors

```bash
# Find errors
pnpm turbo typecheck

# Fix each error location
```

**Common fixes:**

- Update type annotations
- Add new required fields
- Remove references to deleted fields
- Update validation schemas

#### Step 5: Update Validation Schemas

```typescript
// Update custom schemas to match new type
export const RoadmapSchema = z.object({
  _id: z.string(),
  title: z.string(),
  author: UserSchema, // New field
  topicCount: z.number(), // Changed from string
  // oldField removed
});
```

#### Step 6: Update Tests

```typescript
// Update test data
const mockRoadmap: Roadmap = {
  _id: "1",
  title: "Test",
  author: mockUser, // New field
  topicCount: 10, // Changed type
  // oldField removed
};
```

#### Step 7: Run Full CI Pipeline

```bash
pnpm turbo build
pnpm turbo lint
pnpm turbo typecheck
pnpm turbo test
```

### Success Criteria

- ✅ Schema updated
- ✅ Code regenerated
- ✅ All TypeScript errors fixed
- ✅ Validation schemas updated
- ✅ Tests updated and passing
- ✅ No breaking changes (or documented)

---

## 3️⃣ Workflow: Add New Query/Mutation

### Context

Khi cần thêm GraphQL operation mới

### Steps

#### Step 1: Define in GraphQL Schema

```graphql
# File: packages/shared/graphql-schema/src/<domain>.graphql

type Query {
  # Existing queries...

  """
  Get user by ID
  """
  getUserById(id: ID!): User

  """
  Search users by name
  """
  searchUsers(query: String!, limit: Int): [User!]!
}

type Mutation {
  # Existing mutations...

  """
  Create new user account
  """
  createUser(input: CreateUserInput!): ID!

  """
  Update user profile
  """
  updateUser(id: ID!, input: UpdateUserInput!): User!
}

"""
Input for creating a new user
"""
input CreateUserInput {
  email: String!
  name: String!
  role: UserRole!
}

"""
Input for updating user profile
"""
input UpdateUserInput {
  name: String
  role: UserRole
}
```

**Checklist:**

- [ ] Add descriptions
- [ ] Define input types
- [ ] Consider pagination
- [ ] Mark required fields

#### Step 2: Regenerate Code

```bash
pnpm codegen
```

**Verify:**

- [ ] New input types generated
- [ ] New input schemas generated
- [ ] Query/Mutation types updated

#### Step 3: Update Exports

```typescript
// File: packages/shared/graphql-generated/src/index.ts

export {
  // ... existing
  CreateUserInputSchema,
  UpdateUserInputSchema,
} from "./zod-schemas";
```

#### Step 4: Create GraphQL Operation Files

```typescript
// File: apps/web/src/graphql/user.graphql

query GetUserById($id: ID!) {
  getUserById(id: $id) {
    _id
    email
    name
    role
    createdAt
  }
}

mutation CreateUser($input: CreateUserInput!) {
  createUser(input: $input)
}
```

#### Step 5: Regenerate with Operations

```bash
# Uncomment operations plugin in codegen.ts
# Then regenerate
pnpm codegen
```

**Expected:**

- [ ] `operations.ts` generated
- [ ] `hooks.ts` generated (if using React Apollo plugin)

#### Step 6: Create Validated Hook

```typescript
// File: packages/shared/api-client/src/hooks/useUser.ts

import { useQuery } from "@apollo/client";
import { GET_USER_BY_ID } from "../operations";
import { UserSchema } from "../schemas/user";
import { ValidationError } from "@viztechstack/validation";

export function useUser(id: string) {
  const { data, loading, error } = useQuery(GET_USER_BY_ID, {
    variables: { id },
  });

  // Validate response
  let validatedData;
  let validationError;

  if (data?.getUserById) {
    try {
      validatedData = UserSchema.parse(data.getUserById);
    } catch (err) {
      validationError = new ValidationError(err);
    }
  }

  return {
    user: validatedData,
    loading,
    error: error || validationError,
  };
}
```

#### Step 7: Test

```typescript
// File: packages/shared/api-client/src/hooks/useUser.test.ts

describe("useUser", () => {
  it("should fetch and validate user data", async () => {
    // Test implementation
  });

  it("should handle validation errors", async () => {
    // Test implementation
  });
});
```

### Success Criteria

- ✅ Query/Mutation defined in schema
- ✅ Input types created
- ✅ Code regenerated
- ✅ Operations created
- ✅ Validated hook created
- ✅ Tests passing

---

## 4️⃣ Workflow: Create Validated Hook

### Context

Khi cần tạo React hook với validation tích hợp

### Steps

#### Step 1: Define Schema

```typescript
// File: packages/shared/api-client/src/schemas/<domain>.ts

import { z } from "zod";
import { EntityType } from "@viztechstack/graphql-generated";

export const EntitySchema = z.object({
  // Define schema based on generated type
}) satisfies z.ZodType<EntityType>;
```

#### Step 2: Create Hook

```typescript
// File: packages/shared/api-client/src/hooks/useEntity.ts

import { useQuery } from "@apollo/client";
import { EntitySchema } from "../schemas/entity";
import { ValidationError } from "@viztechstack/validation";

export function useEntity(id: string) {
  const { data, loading, error } = useQuery(GET_ENTITY, {
    variables: { id },
  });

  let validated;
  let validationError;

  if (data?.entity) {
    try {
      validated = EntitySchema.parse(data.entity);
    } catch (err) {
      validationError = new ValidationError(err);
    }
  }

  return {
    entity: validated,
    loading,
    error: error || validationError,
  };
}
```

#### Step 3: Export Hook

```typescript
// File: packages/shared/api-client/src/hooks/index.ts

export { useEntity } from "./useEntity";
```

#### Step 4: Write Tests

```typescript
describe("useEntity", () => {
  it("validates successful response", () => {
    // Test
  });

  it("handles validation errors", () => {
    // Test
  });
});
```

#### Step 5: Document Usage

````typescript
/**
 * Fetch and validate entity data
 *
 * @param id - Entity ID
 * @returns Validated entity data with loading and error states
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { entity, loading, error } = useEntity('123');
 *
 *   if (loading) return <Spinner />;
 *   if (error) return <Error message={error.message} />;
 *
 *   return <div>{entity.name}</div>;
 * }
 * ```
 */
export function useEntity(id: string) {
  // Implementation
}
````

### Success Criteria

- ✅ Schema defined
- ✅ Hook created with validation
- ✅ Hook exported
- ✅ Tests written
- ✅ Documentation added

---

## 5️⃣ Workflow: Fix Validation Errors

### Context

Khi validation errors xảy ra trong production hoặc development

### Steps

#### Step 1: Identify Error Source

```typescript
// Check error details
if (error instanceof ValidationError) {
  console.log("User message:", error.getUserMessage());
  console.log("Field errors:", error.getFieldErrors());
  console.log("Detailed errors:", error.getDetailedErrors());
}
```

**Questions:**

- [ ] Error từ đâu? (API response, user input, etc.)
- [ ] Field nào bị lỗi?
- [ ] Expected vs actual value?

#### Step 2: Analyze Root Cause

**Common causes:**

1. **Schema mismatch:** API trả về data không match schema
2. **Missing validation:** Schema quá loose
3. **Type mismatch:** String vs Number, etc.
4. **Null handling:** Unexpected null values
5. **Enum values:** Invalid enum value

#### Step 3: Fix Based on Root Cause

**Case 1: Schema Mismatch**

```typescript
// ❌ Problem: API returns string, schema expects number
const schema = z.object({
  count: z.number(),
});

// ✅ Solution: Update schema or transform data
const schema = z.object({
  count: z.string().transform(Number),
});
```

**Case 2: Missing Validation**

```typescript
// ❌ Problem: No email validation
const schema = z.object({
  email: z.string(),
});

// ✅ Solution: Add validation
const schema = z.object({
  email: z.string().email(),
});
```

**Case 3: Null Handling**

```typescript
// ❌ Problem: Unexpected null
const schema = z.object({
  name: z.string(),
});

// ✅ Solution: Allow null or provide default
const schema = z.object({
  name: z.string().nullable(),
  // or
  name: z.string().default("Unknown"),
});
```

#### Step 4: Update Schema

```typescript
// Update the validation schema
export const UpdatedSchema = z.object({
  // Fixed fields
});
```

#### Step 5: Add Tests for Edge Case

```typescript
describe("Schema validation", () => {
  it("handles the edge case that caused error", () => {
    const problematicData = {
      /* data that caused error */
    };
    expect(() => schema.parse(problematicData)).not.toThrow();
  });
});
```

#### Step 6: Verify Fix

```bash
pnpm turbo test
pnpm turbo typecheck
```

### Success Criteria

- ✅ Root cause identified
- ✅ Schema updated
- ✅ Tests added for edge case
- ✅ All tests passing
- ✅ Error no longer occurs

---

## 6️⃣ Workflow: Refactor Validation Logic

### Context

Khi validation logic trở nên complex hoặc duplicate

### Steps

#### Step 1: Identify Duplication

```bash
# Search for duplicate validation patterns
grep -r "z.string().email()" packages/
```

#### Step 2: Extract Common Schemas

```typescript
// File: packages/shared/validation/src/common-schemas.ts

import { z } from "zod";

// Common field schemas
export const EmailSchema = z.string().email();
export const UrlSchema = z.string().url();
export const DateSchema = z.string().datetime();
export const PositiveIntSchema = z.number().int().positive();

// Common patterns
export const PaginationSchema = z.object({
  cursor: z.string().nullable(),
  limit: PositiveIntSchema.default(10),
});
```

#### Step 3: Create Reusable Validators

```typescript
// File: packages/shared/validation/src/validators.ts

import { z } from "zod";

export function createEnumSchema<T extends string>(values: readonly T[]) {
  return z.enum(values as [T, ...T[]]);
}

export function createPageSchema<T>(itemSchema: z.ZodType<T>) {
  return z.object({
    items: z.array(itemSchema),
    nextCursor: z.string().nullable(),
    hasMore: z.boolean(),
  });
}
```

#### Step 4: Update Existing Schemas

```typescript
// Before
const UserPageSchema = z.object({
  items: z.array(UserSchema),
  nextCursor: z.string().nullable(),
  hasMore: z.boolean(),
});

// After
const UserPageSchema = createPageSchema(UserSchema);
```

#### Step 5: Export from Package

```typescript
// File: packages/shared/validation/src/index.ts

export * from "./common-schemas";
export * from "./validators";
```

#### Step 6: Update Documentation

````typescript
/**
 * Common validation schemas and utilities
 *
 * @example
 * ```typescript
 * import { EmailSchema, createPageSchema } from '@viztechstack/validation';
 *
 * const UserSchema = z.object({
 *   email: EmailSchema,
 * });
 *
 * const UserPageSchema = createPageSchema(UserSchema);
 * ```
 */
````

### Success Criteria

- ✅ Duplication identified
- ✅ Common schemas extracted
- ✅ Reusable validators created
- ✅ Existing code updated
- ✅ Documentation updated
- ✅ Tests passing

---

## 7️⃣ Workflow: Update Generated Code

### Context

Khi cần update generated code sau khi thay đổi codegen config

### Steps

#### Step 1: Backup Current State

```bash
# Create backup branch
git checkout -b backup/before-codegen-update
git add .
git commit -m "Backup before codegen update"
git checkout main
```

#### Step 2: Update codegen.ts

```typescript
// File: codegen.ts

const config: CodegenConfig = {
  // Update configuration
  generates: {
    "packages/shared/graphql-generated/src/": {
      plugins: [
        "typescript",
        "typescript-validation-schema",
        "typescript-operations", // ✅ Added
        "typescript-react-apollo", // ✅ Added
      ],
      config: {
        // Update config
      },
    },
  },
};
```

#### Step 3: Clean Generated Files

```bash
# Remove old generated files
rm -rf packages/shared/graphql-generated/src/*.ts
```

#### Step 4: Regenerate

```bash
pnpm codegen
```

#### Step 5: Update Exports

```typescript
// File: packages/shared/graphql-generated/src/index.ts

// Update exports based on new generated files
export * from "./types";
export * from "./operations"; // ✅ New
export * from "./hooks"; // ✅ New
export {} from // Schemas
"./zod-schemas";
```

#### Step 6: Fix Breaking Changes

```bash
# Find errors
pnpm turbo typecheck

# Fix each location
```

#### Step 7: Update Tests

```typescript
// Update imports and usage
import { useGetRoadmapsQuery } from "@viztechstack/graphql-generated";
```

#### Step 8: Verify Everything

```bash
pnpm turbo build
pnpm turbo lint
pnpm turbo typecheck
pnpm turbo test
```

### Success Criteria

- ✅ Config updated
- ✅ Code regenerated
- ✅ Exports updated
- ✅ Breaking changes fixed
- ✅ Tests updated
- ✅ All checks passing

---

## 🚨 Emergency Workflows

### Emergency: Generated Files Corrupted

**Steps:**

1. Delete generated files: `rm -rf packages/shared/graphql-generated/src/*.ts`
2. Regenerate: `pnpm codegen`
3. Verify: `pnpm turbo typecheck`

### Emergency: Validation Breaking Production

**Steps:**

1. Identify failing validation
2. Add `.catch()` to temporarily bypass
3. Log error for investigation
4. Create hotfix PR
5. Fix root cause in separate PR

```typescript
// Temporary bypass
try {
  return schema.parse(data);
} catch (error) {
  console.error("Validation failed:", error);
  // Temporarily return unvalidated data
  return data;
}
```

### Emergency: Circular Dependency

**Steps:**

1. Identify circular import
2. Extract shared types to separate file
3. Update imports
4. Verify build

---

## 📊 Workflow Checklist Template

Use this for any GraphQL + Zod task:

```markdown
## Task: [Task Name]

### Pre-flight Checks

- [ ] Understand requirements
- [ ] Check existing code
- [ ] Plan changes
- [ ] Identify impacts

### Implementation

- [ ] Update GraphQL schema
- [ ] Run codegen
- [ ] Update exports
- [ ] Create/update validation schemas
- [ ] Create/update hooks
- [ ] Update tests

### Verification

- [ ] Build passes
- [ ] Lint passes
- [ ] Typecheck passes
- [ ] Tests pass
- [ ] Manual testing done

### Documentation

- [ ] Code comments added
- [ ] Schema descriptions added
- [ ] Usage examples added
- [ ] README updated (if needed)

### Cleanup

- [ ] Remove debug code
- [ ] Remove unused imports
- [ ] Format code
- [ ] Commit with clear message
```

---

## 🔗 Related Documents

- Rules: `.agents/rules/graphql-zod-validation.md`
- Architecture: `.docs/architecture/05-graphql-zod-architecture.md`
- Implementation: `.docs/architecture/graphql-zod/IMPLEMENTATION-COMPLETE.md`

---

**Last Updated:** 2026-03-07  
**Version:** 1.0.0  
**Status:** Active
