# Feature Development Workflow

## 📋 Overview

Workflow tổng quát cho việc phát triển tính năng mới trong dự án VizTechStack. Áp dụng cho tất cả AI agents khi implement, fix hoặc refactor features.

---

## 🎯 Workflow Types

### 1. New Feature Development
### 2. Bug Fix
### 3. Refactoring
### 4. Performance Optimization
### 5. Documentation Update
### 6. Dependency Update
### 7. Architecture Change

---

## 1️⃣ Workflow: New Feature Development

### Context
Khi cần implement một tính năng hoàn toàn mới

### Input Requirements
- Feature requirements document
- Design mockups (if UI feature)
- API contracts (if backend feature)
- Acceptance criteria

### Output Deliverables
- Working code
- Tests
- Documentation
- Updated CI/CD (if needed)

### Steps

#### Phase 1: Discovery & Planning (30 minutes - 2 hours)

**Step 1.1: Read Existing Documentation**
```bash
# Read architecture docs
ls -la .docs/architecture/
cat .docs/architecture/*.md

# Read related rules
ls -la .agents/rules/
cat .agents/rules/*.md

# Read related workflows
ls -la .agents/workflows/
cat .agents/workflows/*.md
```

**Checklist:**
- [ ] Understand current architecture
- [ ] Identify existing patterns
- [ ] Find similar implementations
- [ ] Note constraints and rules

**Step 1.2: Analyze Requirements**
```markdown
## Feature Analysis

### What
- What is the feature?
- What problem does it solve?

### Who
- Who are the users?
- What are their needs?

### Why
- Why is this needed?
- What's the business value?

### How
- How will it work?
- What's the user flow?

### Constraints
- Technical constraints?
- Time constraints?
- Resource constraints?
```

**Step 1.3: Research Existing Code**
```bash
# Search for similar features
grep -r "similar-keyword" apps/ packages/

# Check package structure
tree packages/shared/ -L 2

# Review existing tests
find . -name "*.test.ts" -o -name "*.spec.ts"
```

**Step 1.4: Design Solution**
```markdown
## Solution Design

### Architecture
- Which packages will be affected?
- New packages needed?
- Integration points?

### Data Model
- What data structures?
- Database schema changes?
- API contracts?

### Components
- Frontend components needed?
- Backend services needed?
- Shared utilities needed?

### Dependencies
- New dependencies needed?
- Version constraints?

### Testing Strategy
- Unit tests for what?
- Integration tests for what?
- E2E tests needed?

### Risks
- What could go wrong?
- How to mitigate?
```

**Step 1.5: Create Implementation Plan**
```markdown
## Implementation Plan

### Phase 1: Foundation
- [ ] Task 1.1: Create package structure
- [ ] Task 1.2: Define types
- [ ] Task 1.3: Setup tests

### Phase 2: Core Logic
- [ ] Task 2.1: Implement service
- [ ] Task 2.2: Add validation
- [ ] Task 2.3: Add error handling

### Phase 3: Integration
- [ ] Task 3.1: Integrate with frontend
- [ ] Task 3.2: Integrate with backend
- [ ] Task 3.3: Update API

### Phase 4: Testing
- [ ] Task 4.1: Unit tests
- [ ] Task 4.2: Integration tests
- [ ] Task 4.3: Manual testing

### Phase 5: Documentation
- [ ] Task 5.1: Code documentation
- [ ] Task 5.2: Architecture docs
- [ ] Task 5.3: User guide

### Estimated Time
- Phase 1: X hours
- Phase 2: Y hours
- Phase 3: Z hours
- Total: N hours
```

#### Phase 2: Foundation Setup (30 minutes - 1 hour)

**Step 2.1: Create Package Structure (if needed)**
```bash
# Create new package
mkdir -p packages/shared/new-feature/src
cd packages/shared/new-feature

# Create package.json
cat > package.json << 'EOF'
{
  "name": "@viztechstack/new-feature",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "build": "tsc",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src/",
    "test": "jest"
  }
}
EOF

# Create tsconfig.json
cat > tsconfig.json << 'EOF'
{
  "extends": "@viztechstack/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
EOF

# Create src/index.ts
touch src/index.ts
```

**Step 2.2: Define Types**
```typescript
// File: packages/shared/new-feature/src/types.ts

/**
 * Core entity type
 */
export interface Entity {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Input for creating entity
 */
export interface CreateEntityInput {
  name: string;
}

/**
 * Input for updating entity
 */
export interface UpdateEntityInput {
  name?: string;
}

/**
 * Result of entity operation
 */
export interface EntityResult {
  success: boolean;
  entity?: Entity;
  error?: string;
}
```

**Step 2.3: Setup Test Infrastructure**
```typescript
// File: packages/shared/new-feature/src/__tests__/setup.ts

import '@testing-library/jest-dom';

// Global test setup
beforeAll(() => {
  // Setup code
});

afterAll(() => {
  // Cleanup code
});
```

**Verification:**
```bash
# Install dependencies
pnpm install

# Verify structure
tree packages/shared/new-feature/

# Expected output:
# packages/shared/new-feature/
# ├── package.json
# ├── tsconfig.json
# └── src/
#     ├── index.ts
#     ├── types.ts
#     └── __tests__/
#         └── setup.ts
```

#### Phase 3: Core Implementation (2-8 hours)

**Step 3.1: Implement Service Layer**
```typescript
// File: packages/shared/new-feature/src/service.ts

import type { Entity, CreateEntityInput, UpdateEntityInput } from './types';
import { EntityError } from './errors';
import { validateEntity } from './validation';

/**
 * Service for managing entities
 */
export class EntityService {
  /**
   * Create a new entity
   */
  async create(input: CreateEntityInput): Promise<Entity> {
    try {
      // Validate input
      const validated = validateEntity(input);
      
      // Business logic
      const entity: Entity = {
        id: generateId(),
        name: validated.name,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // Persist (if needed)
      await this.repository.save(entity);
      
      return entity;
    } catch (error) {
      throw new EntityError('Failed to create entity', 'CREATE_FAILED', error);
    }
  }
  
  /**
   * Update an entity
   */
  async update(id: string, input: UpdateEntityInput): Promise<Entity> {
    // Implementation
  }
  
  /**
   * Delete an entity
   */
  async delete(id: string): Promise<void> {
    // Implementation
  }
  
  /**
   * Get entity by ID
   */
  async getById(id: string): Promise<Entity | null> {
    // Implementation
  }
}
```

**Step 3.2: Add Validation**
```typescript
// File: packages/shared/new-feature/src/validation.ts

import { z } from 'zod';
import type { CreateEntityInput, UpdateEntityInput } from './types';

/**
 * Schema for creating entity
 */
export const CreateEntitySchema = z.object({
  name: z.string().min(1).max(100),
});

/**
 * Schema for updating entity
 */
export const UpdateEntitySchema = z.object({
  name: z.string().min(1).max(100).optional(),
});

/**
 * Validate entity creation input
 */
export function validateEntity(input: unknown): CreateEntityInput {
  return CreateEntitySchema.parse(input);
}

/**
 * Validate entity update input
 */
export function validateEntityUpdate(input: unknown): UpdateEntityInput {
  return UpdateEntitySchema.parse(input);
}
```

**Step 3.3: Add Error Handling**
```typescript
// File: packages/shared/new-feature/src/errors.ts

/**
 * Base error for entity operations
 */
export class EntityError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'EntityError';
  }
  
  /**
   * Get user-friendly error message
   */
  getUserMessage(): string {
    switch (this.code) {
      case 'CREATE_FAILED':
        return 'Failed to create entity. Please try again.';
      case 'NOT_FOUND':
        return 'Entity not found.';
      case 'VALIDATION_FAILED':
        return 'Invalid input. Please check your data.';
      default:
        return 'An error occurred. Please try again.';
    }
  }
}
```

**Step 3.4: Export Public API**
```typescript
// File: packages/shared/new-feature/src/index.ts

// Types
export type {
  Entity,
  CreateEntityInput,
  UpdateEntityInput,
  EntityResult,
} from './types';

// Service
export { EntityService } from './service';

// Validation
export {
  CreateEntitySchema,
  UpdateEntitySchema,
  validateEntity,
  validateEntityUpdate,
} from './validation';

// Errors
export { EntityError } from './errors';
```

**Verification:**
```bash
# Build package
pnpm turbo build --filter @viztechstack/new-feature

# Expected: ✅ Build successful
```

#### Phase 4: Testing (1-3 hours)

**Step 4.1: Write Unit Tests**
```typescript
// File: packages/shared/new-feature/src/__tests__/service.test.ts

import { EntityService } from '../service';
import { EntityError } from '../errors';

describe('EntityService', () => {
  let service: EntityService;
  
  beforeEach(() => {
    service = new EntityService();
  });
  
  describe('create', () => {
    it('should create entity with valid input', async () => {
      const input = { name: 'Test Entity' };
      const result = await service.create(input);
      
      expect(result).toMatchObject({
        name: 'Test Entity',
      });
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
    });
    
    it('should throw error with invalid input', async () => {
      const input = { name: '' };
      
      await expect(service.create(input)).rejects.toThrow(EntityError);
    });
    
    it('should throw error with missing name', async () => {
      const input = {};
      
      await expect(service.create(input as any)).rejects.toThrow();
    });
  });
  
  describe('update', () => {
    it('should update entity', async () => {
      // Test implementation
    });
  });
  
  describe('delete', () => {
    it('should delete entity', async () => {
      // Test implementation
    });
  });
});
```

**Step 4.2: Write Validation Tests**
```typescript
// File: packages/shared/new-feature/src/__tests__/validation.test.ts

import { validateEntity, validateEntityUpdate } from '../validation';
import { ZodError } from 'zod';

describe('Validation', () => {
  describe('validateEntity', () => {
    it('should validate correct input', () => {
      const input = { name: 'Test' };
      expect(() => validateEntity(input)).not.toThrow();
    });
    
    it('should reject empty name', () => {
      const input = { name: '' };
      expect(() => validateEntity(input)).toThrow(ZodError);
    });
    
    it('should reject too long name', () => {
      const input = { name: 'a'.repeat(101) };
      expect(() => validateEntity(input)).toThrow(ZodError);
    });
  });
});
```

**Step 4.3: Run Tests**
```bash
# Run tests
pnpm turbo test --filter @viztechstack/new-feature

# Expected: ✅ All tests pass

# Check coverage
pnpm turbo test --filter @viztechstack/new-feature -- --coverage

# Expected: Coverage > 80%
```

#### Phase 5: Integration (1-4 hours)

**Step 5.1: Add to Consuming Package**
```bash
# Add dependency
cd apps/web
pnpm add @viztechstack/new-feature
```

**Step 5.2: Create Frontend Hook (if needed)**
```typescript
// File: apps/web/src/hooks/useEntity.ts

import { useState, useCallback } from 'react';
import { EntityService, type Entity } from '@viztechstack/new-feature';

export function useEntity() {
  const [entity, setEntity] = useState<Entity | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const service = new EntityService();
  
  const create = useCallback(async (name: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await service.create({ name });
      setEntity(result);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  return {
    entity,
    loading,
    error,
    create,
  };
}
```

**Step 5.3: Create Backend Endpoint (if needed)**
```typescript
// File: apps/api/src/modules/entity/entity.controller.ts

import { Controller, Post, Body } from '@nestjs/common';
import { EntityService, type CreateEntityInput } from '@viztechstack/new-feature';

@Controller('entities')
export class EntityController {
  constructor(private readonly service: EntityService) {}
  
  @Post()
  async create(@Body() input: CreateEntityInput) {
    return this.service.create(input);
  }
}
```

**Step 5.4: Integration Testing**
```bash
# Build all packages
pnpm turbo build

# Run integration tests
pnpm turbo test --filter './apps/**'

# Expected: ✅ All tests pass
```

#### Phase 6: Documentation (30 minutes - 1 hour)

**Step 6.1: Add Code Documentation**
```typescript
// Already done in implementation phase
// Ensure all public APIs have JSDoc comments
```

**Step 6.2: Create Architecture Document**
```bash
# Create architecture doc
vim .docs/architecture/new-feature.md
```

```markdown
# New Feature Architecture

## Overview
Brief description of the feature

## Architecture
Diagram or description of architecture

## Components
- Component 1: Description
- Component 2: Description

## Data Flow
1. Step 1
2. Step 2
3. Step 3

## API
### Endpoints
- POST /entities - Create entity
- GET /entities/:id - Get entity

### Types
\`\`\`typescript
interface Entity {
  // Type definition
}
\`\`\`

## Usage
\`\`\`typescript
// Example usage
\`\`\`

## Testing
How to test the feature

## Troubleshooting
Common issues and solutions
```

**Step 6.3: Create Rule File (if needed)**
```bash
# Create rule file
vim .agents/rules/new-feature-rules.md
```

**Step 6.4: Create Workflow File (if needed)**
```bash
# Create workflow file
vim .agents/workflows/new-feature-workflow.md
```

**Step 6.5: Update README**
```bash
# Update package README
vim packages/shared/new-feature/README.md
```

#### Phase 7: Final Verification (15-30 minutes)

**Step 7.1: Run Full CI Pipeline**
```bash
# Build all
pnpm turbo build

# Lint all
pnpm turbo lint

# Typecheck all
pnpm turbo typecheck

# Test all
pnpm turbo test

# Check no-any
pnpm check:no-any
```

**Expected:**
- [ ] ✅ All builds successful
- [ ] ✅ No linting errors
- [ ] ✅ No type errors
- [ ] ✅ All tests pass
- [ ] ✅ No explicit `any` usage

**Step 7.2: Manual Testing**
```markdown
Manual testing checklist:
- [ ] Feature works as expected
- [ ] Error handling works
- [ ] UI/UX is acceptable
- [ ] Performance is acceptable
- [ ] No console errors
- [ ] Works on different browsers (if web)
- [ ] Works on different screen sizes (if web)
```

**Step 7.3: Create Pull Request**
```markdown
## PR Title
feat(scope): brief description

## Description
What does this PR do?

## Changes
- Change 1
- Change 2

## Testing
How was this tested?

## Screenshots (if UI)
[Add screenshots]

## Checklist
- [ ] Tests added
- [ ] Documentation updated
- [ ] CI passes
- [ ] Reviewed by self
```

### Success Criteria
- ✅ Feature implemented and working
- ✅ All tests passing
- ✅ Documentation complete
- ✅ CI/CD passing
- ✅ Code reviewed
- ✅ Ready to merge

---

## 2️⃣ Workflow: Bug Fix

### Context
Khi cần fix một bug trong production hoặc development

### Steps

#### Phase 1: Investigation (15 minutes - 2 hours)

**Step 1.1: Reproduce Bug**
```markdown
## Bug Reproduction

### Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

### Expected Behavior
What should happen?

### Actual Behavior
What actually happens?

### Environment
- Browser/OS:
- Version:
- User role:

### Error Messages
```
[Paste error messages]
```

### Screenshots
[Add screenshots if applicable]
```

**Step 1.2: Identify Root Cause**
```bash
# Check error logs
grep -r "error-message" logs/

# Check related code
grep -r "function-name" apps/ packages/

# Check git history
git log --all --full-history -- path/to/file

# Check recent changes
git log --since="1 week ago" --oneline
```

**Step 1.3: Analyze Impact**
```markdown
## Impact Analysis

### Severity
- [ ] Critical (production down)
- [ ] High (major feature broken)
- [ ] Medium (minor feature broken)
- [ ] Low (cosmetic issue)

### Affected Users
- [ ] All users
- [ ] Specific user group
- [ ] Edge case only

### Workaround Available?
- [ ] Yes: [describe workaround]
- [ ] No

### Related Issues
- Issue #123
- Issue #456
```

#### Phase 2: Fix Implementation (30 minutes - 4 hours)

**Step 2.1: Write Failing Test**
```typescript
// File: path/to/feature.test.ts

describe('Bug fix for issue #123', () => {
  it('should handle edge case correctly', () => {
    // Test that currently fails
    const result = functionWithBug(edgeCaseInput);
    expect(result).toBe(expectedOutput);
  });
});
```

**Step 2.2: Implement Fix**
```typescript
// File: path/to/feature.ts

export function functionWithBug(input: Input): Output {
  // ❌ Before: Bug
  // return input.value;
  
  // ✅ After: Fix
  return input.value ?? defaultValue;
}
```

**Step 2.3: Verify Fix**
```bash
# Run test
pnpm turbo test --filter affected-package

# Expected: ✅ Test now passes
```

**Step 2.4: Check for Regressions**
```bash
# Run all tests
pnpm turbo test

# Expected: ✅ All tests still pass
```

#### Phase 3: Verification (15-30 minutes)

**Step 3.1: Manual Testing**
```markdown
Manual testing checklist:
- [ ] Bug is fixed
- [ ] No new bugs introduced
- [ ] Edge cases handled
- [ ] Error messages clear
```

**Step 3.2: Run CI Pipeline**
```bash
pnpm turbo build
pnpm turbo lint
pnpm turbo typecheck
pnpm turbo test
```

**Step 3.3: Create PR**
```markdown
## PR Title
fix(scope): brief description of bug fix

## Description
Fixes #123

### Root Cause
What caused the bug?

### Solution
How was it fixed?

### Testing
- Added test for edge case
- Verified no regressions

## Checklist
- [ ] Bug reproduced
- [ ] Test added
- [ ] Fix implemented
- [ ] No regressions
- [ ] CI passes
```

### Success Criteria
- ✅ Bug fixed
- ✅ Test added
- ✅ No regressions
- ✅ CI passing
- ✅ Ready to deploy

---

## 3️⃣ Workflow: Refactoring

### Context
Khi cần cải thiện code quality mà không thay đổi behavior

### Steps

#### Phase 1: Planning (30 minutes - 1 hour)

**Step 1.1: Identify Refactoring Target**
```markdown
## Refactoring Target

### Current Issues
- [ ] Code duplication
- [ ] Complex logic
- [ ] Poor naming
- [ ] Tight coupling
- [ ] Low test coverage

### Goals
- [ ] Improve readability
- [ ] Reduce complexity
- [ ] Increase reusability
- [ ] Better testability
```

**Step 1.2: Ensure Test Coverage**
```bash
# Check current coverage
pnpm turbo test -- --coverage

# If coverage < 80%, add tests first
```

**Step 1.3: Plan Refactoring Steps**
```markdown
## Refactoring Plan

### Step 1: Extract function
- Extract complex logic to separate function

### Step 2: Rename variables
- Rename unclear variable names

### Step 3: Remove duplication
- Extract common code to utility

### Step 4: Simplify logic
- Reduce nesting, use early returns
```

#### Phase 2: Implementation (1-4 hours)

**Step 2.1: Refactor in Small Steps**
```typescript
// Step 1: Before
function processData(data: any) {
  if (data) {
    if (data.items) {
      return data.items.map(item => {
        if (item.valid) {
          return {
            id: item.id,
            name: item.name,
          };
        }
      }).filter(Boolean);
    }
  }
  return [];
}

// Step 1: After - Extract validation
function isValidItem(item: Item): boolean {
  return item.valid;
}

function transformItem(item: Item): TransformedItem {
  return {
    id: item.id,
    name: item.name,
  };
}

function processData(data: Data): TransformedItem[] {
  if (!data?.items) {
    return [];
  }
  
  return data.items
    .filter(isValidItem)
    .map(transformItem);
}
```

**Step 2.2: Run Tests After Each Step**
```bash
# After each refactoring step
pnpm turbo test --filter affected-package

# Expected: ✅ All tests still pass
```

**Step 2.3: Commit After Each Step**
```bash
git add .
git commit -m "refactor: extract validation logic"
```

#### Phase 3: Verification (15-30 minutes)

**Step 3.1: Run Full Test Suite**
```bash
pnpm turbo test
```

**Step 3.2: Check Code Quality**
```bash
# Lint
pnpm turbo lint

# Typecheck
pnpm turbo typecheck

# Check complexity (if tool available)
# pnpm complexity-check
```

**Step 3.3: Review Changes**
```bash
# Review diff
git diff main...HEAD

# Ensure no behavior changes
```

### Success Criteria
- ✅ Code improved
- ✅ All tests passing
- ✅ No behavior changes
- ✅ Better readability

---

## 4️⃣ Workflow: Performance Optimization

### Context
Khi cần cải thiện performance

### Steps

#### Phase 1: Measurement (30 minutes - 1 hour)

**Step 1.1: Identify Performance Issue**
```markdown
## Performance Issue

### Symptom
- Slow page load
- High memory usage
- Slow API response

### Measurement
- Current: X seconds
- Target: Y seconds

### Affected Area
- Component/Function name
- File path
```

**Step 1.2: Profile Performance**
```bash
# Frontend profiling
# Use browser DevTools Performance tab

# Backend profiling
# Use Node.js profiler or APM tool

# Bundle size analysis
pnpm analyze
```

**Step 1.3: Identify Bottleneck**
```markdown
## Bottleneck Analysis

### Root Cause
- Large bundle size
- Unnecessary re-renders
- N+1 queries
- Blocking operations

### Evidence
[Add profiling screenshots/data]
```

#### Phase 2: Optimization (1-4 hours)

**Step 2.1: Implement Optimization**
```typescript
// Example: Memoization
// Before
function ExpensiveComponent({ data }) {
  const processed = expensiveOperation(data);
  return <div>{processed}</div>;
}

// After
import { useMemo } from 'react';

function ExpensiveComponent({ data }) {
  const processed = useMemo(
    () => expensiveOperation(data),
    [data]
  );
  return <div>{processed}</div>;
}
```

**Step 2.2: Measure Improvement**
```bash
# Re-run profiling
# Compare before/after metrics
```

**Step 2.3: Verify No Regressions**
```bash
# Run tests
pnpm turbo test

# Manual testing
```

### Success Criteria
- ✅ Performance improved
- ✅ Target metrics achieved
- ✅ No regressions
- ✅ Tests passing

---

## 5️⃣ Workflow: Documentation Update

### Context
Khi cần update hoặc tạo documentation

### Steps

#### Step 1: Identify Documentation Need
```markdown
## Documentation Need

### Type
- [ ] Architecture document
- [ ] API documentation
- [ ] User guide
- [ ] Developer guide
- [ ] Rule file
- [ ] Workflow file

### Reason
- [ ] New feature
- [ ] Changed behavior
- [ ] Missing documentation
- [ ] Outdated information
```

#### Step 2: Create/Update Documentation
```bash
# Create new doc
vim .docs/architecture/new-doc.md

# Or update existing
vim .docs/architecture/existing-doc.md
```

#### Step 3: Review and Verify
```markdown
Documentation checklist:
- [ ] Clear and concise
- [ ] Examples included
- [ ] Up-to-date
- [ ] Properly formatted
- [ ] Links work
- [ ] Code examples tested
```

### Success Criteria
- ✅ Documentation complete
- ✅ Accurate and clear
- ✅ Examples work
- ✅ Properly formatted

---

## 🚨 Emergency Workflows

### Emergency: Production Webapp Crash

**Priority: CRITICAL - Immediate Action Required**

This workflow uses Vercel CLI for rapid diagnosis and recovery.

#### Prerequisites Check
```bash
# Verify Vercel CLI is installed
vercel --version

# If not installed
pnpm add -g vercel

# Login if needed
vercel login
```

#### Phase 1: Rapid Assessment (0-3 minutes)

**Step 1.1: Check Deployment Status**
```bash
# Quick status check
vercel ls

# Check latest deployment
vercel ls --limit 1

# Open Vercel dashboard
open https://vercel.com/viztechstack/dashboard
```

**Step 1.2: View Real-time Logs**
```bash
# Start monitoring logs immediately
vercel logs --follow

# In another terminal, check recent errors
vercel logs | grep -i "error\|exception\|crash"
```

**Step 1.3: Quick Impact Assessment**
```markdown
## Impact Assessment (30 seconds)

- [ ] Entire site down or specific pages?
- [ ] Error visible to users?
- [ ] When did it start? (check deployment time)
- [ ] How many users affected? (check analytics)
```

#### Phase 2: Identify Root Cause (3-10 minutes)

**Step 2.1: Check Recent Deployments**
```bash
# List last 10 deployments with status
vercel ls --limit 10

# Inspect specific deployment
vercel inspect [deployment-url]

# Compare with last working deployment
vercel ls | head -5
```

**Step 2.2: Analyze Error Logs**
```bash
# Download logs for analysis
vercel logs [deployment-url] > crash-analysis.log

# Search for critical errors
grep -i "fatal\|crash\|exception\|error" crash-analysis.log

# Check for specific issues
grep -i "memory\|timeout\|env\|undefined" crash-analysis.log

# View structured logs
vercel logs --output=json | jq '.[] | select(.level=="error")'
```

**Step 2.3: Check Build Logs**
```bash
# View build logs
vercel logs [deployment-url] --output=json | jq '.[] | select(.type=="build")'

# Check for build failures
vercel inspect [deployment-url] | grep -i "build"
```

**Common Crash Patterns:**
```markdown
## Error Pattern Recognition

### Build Failures
- Syntax errors
- Type errors
- Missing dependencies
- Build timeout

### Runtime Crashes
- Uncaught exceptions
- Memory leaks
- Infinite loops
- Unhandled promise rejections

### Environment Issues
- Missing env variables
- Wrong env values
- API keys expired
- Database connection failed

### Dependency Issues
- Version conflicts
- Breaking changes
- Missing peer dependencies
```

#### Phase 3: Immediate Recovery (5-15 minutes)

**Option A: Instant Rollback (FASTEST - 1 minute)**
```bash
# Find last working deployment
vercel ls

# Rollback immediately
vercel rollback [previous-working-deployment-url]

# Verify rollback
curl -I https://your-domain.com

# Monitor logs
vercel logs --follow
```

**Option B: Environment Variable Fix (2-3 minutes)**
```bash
# If crash is due to missing/wrong env var

# Check current env vars
vercel env ls

# Add missing variable
vercel env add VARIABLE_NAME production
# Enter value when prompted

# Or update existing
vercel env rm VARIABLE_NAME production
vercel env add VARIABLE_NAME production

# Force redeploy to apply
vercel --prod --force

# Monitor deployment
vercel logs --follow
```

**Option C: Quick Hotfix Deploy (5-10 minutes)**
```bash
# Create hotfix branch
git checkout -b hotfix/crash-$(date +%Y%m%d-%H%M)

# Make minimal fix (examples below)
# Fix 1: Add error boundary
# Fix 2: Comment out broken feature
# Fix 3: Revert problematic change

# Quick local verification
pnpm turbo build --filter @viztechstack/web

# Deploy hotfix immediately
vercel --prod

# Monitor deployment
vercel logs --follow

# Verify fix
curl -I https://your-domain.com
```

**Option D: Maintenance Mode (if fix needs time)**
```bash
# Create simple maintenance page
cat > apps/web/app/maintenance/page.tsx << 'EOF'
export default function Maintenance() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">
          We'll be right back
        </h1>
        <p className="text-lg text-gray-600">
          We're performing emergency maintenance.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Expected resolution: 15-30 minutes
        </p>
      </div>
    </div>
  );
}
EOF

# Update middleware to redirect
cat > apps/web/middleware.ts << 'EOF'
import { NextResponse } from 'next/server';

export function middleware() {
  return NextResponse.redirect(new URL('/maintenance', request.url));
}

export const config = {
  matcher: '/((?!maintenance|_next/static|_next/image|favicon.ico).*)',
};
EOF

# Deploy maintenance mode
vercel --prod

# Work on proper fix in parallel
```

#### Phase 4: Verification (3-5 minutes)

**Step 4.1: Deployment Verification**
```bash
# Check deployment status
vercel ls --limit 1

# Verify deployment is ready
vercel inspect [deployment-url]

# Test production URL
curl -I https://your-domain.com

# Expected: HTTP 200 OK
```

**Step 4.2: Functional Testing**
```bash
# Test critical paths
curl https://your-domain.com/
curl https://your-domain.com/api/health
curl https://your-domain.com/roadmap

# Check for JavaScript errors
# Open browser console
open https://your-domain.com
```

**Step 4.3: Monitor for Stability**
```bash
# Monitor logs for 5 minutes
vercel logs --follow

# Watch for errors
vercel logs --follow | grep -i "error"

# Check error rate
vercel inspect [deployment-url]

# Monitor uptime
watch -n 10 'curl -s -o /dev/null -w "%{http_code}\n" https://your-domain.com'
```

#### Phase 5: Communication (Throughout incident)

**Step 5.1: Initial Alert (Minute 0)**
```markdown
## 🚨 PRODUCTION INCIDENT ALERT

**Status:** 🔴 CRITICAL - Site Down
**Time Detected:** [HH:MM UTC]
**Impact:** [All users / Specific feature]
**Current Action:** Investigating

**Team:** @engineering
**Incident Commander:** [Your name]

**Updates:** Every 5 minutes
```

**Step 5.2: Progress Updates (Every 5 minutes)**
```markdown
## Update [HH:MM]

**Status:** 🟡 IN PROGRESS
**Action:** [Deploying rollback / Applying hotfix]
**ETA:** [X minutes]

**Root Cause:** [Brief description if known]
```

**Step 5.3: Resolution Notice**
```markdown
## ✅ INCIDENT RESOLVED

**Time Resolved:** [HH:MM UTC]
**Duration:** [X minutes]
**Resolution:** [What was done]

**Root Cause:** [Brief explanation]
**Prevention:** [What we'll do to prevent recurrence]

**Post-Mortem:** Scheduled for [Date/Time]
```

#### Phase 6: Post-Incident Analysis (Within 24 hours)

**Step 6.1: Create Incident Report**
```bash
# Create incident report
mkdir -p .docs/incidents
vim .docs/incidents/$(date +%Y-%m-%d)-webapp-crash.md
```

```markdown
# Production Incident Report - [Date]

## Executive Summary
[One paragraph summary]

## Incident Timeline

| Time (UTC) | Event |
|------------|-------|
| HH:MM | Incident detected |
| HH:MM | Root cause identified |
| HH:MM | Fix deployed |
| HH:MM | Incident resolved |
| HH:MM | Monitoring confirmed stable |

## Impact Analysis

### User Impact
- **Duration:** X minutes
- **Users Affected:** ~X users (estimate)
- **Functionality Lost:** [List]

### Business Impact
- **Revenue Impact:** $X (if applicable)
- **Support Tickets:** X tickets created
- **Reputation Impact:** [Assessment]

## Root Cause Analysis

### What Happened
[Detailed technical explanation]

### Why It Happened
[Underlying causes]

### Contributing Factors
- Factor 1
- Factor 2

## Resolution

### Immediate Fix
[What was done to restore service]

### Permanent Fix
[What needs to be done for long-term solution]

## Prevention Measures

### Immediate Actions (This Week)
- [ ] Action 1
- [ ] Action 2

### Short-term Actions (This Month)
- [ ] Action 1
- [ ] Action 2

### Long-term Actions (This Quarter)
- [ ] Action 1
- [ ] Action 2

## Lessons Learned

### What Went Well
- Item 1
- Item 2

### What Could Be Improved
- Item 1
- Item 2

### Action Items
- [ ] Update monitoring alerts
- [ ] Add error boundaries
- [ ] Improve logging
- [ ] Update runbooks
- [ ] Team training

## Appendix

### Error Logs
```
[Paste relevant error logs]
```

### Deployment Details
- Deployment URL: [url]
- Commit SHA: [sha]
- Deploy Time: [time]
```

**Step 6.2: Extract Logs for Analysis**
```bash
# Save logs for post-mortem
vercel logs [failed-deployment-url] > .docs/incidents/$(date +%Y-%m-%d)-logs.txt

# Save deployment details
vercel inspect [failed-deployment-url] > .docs/incidents/$(date +%Y-%m-%d)-deployment.json
```

**Step 6.3: Create Prevention Tasks**
```bash
# Create GitHub issues
gh issue create \
  --title "Add error boundary for [component]" \
  --label "bug,high-priority" \
  --body "Prevent crash from [specific error]"

gh issue create \
  --title "Add monitoring alert for [metric]" \
  --label "monitoring,high-priority" \
  --body "Alert when [condition] occurs"

gh issue create \
  --title "Improve error logging in [area]" \
  --label "logging,medium-priority" \
  --body "Add structured logging for better debugging"
```

**Step 6.4: Update Runbooks**
```bash
# Update this workflow with new learnings
vim .agents/workflows/feature-development-workflow.md

# Create specific runbook if needed
vim .agents/workflows/incident-[specific-type].md
```

### Vercel CLI Troubleshooting Commands

**Diagnostic Commands:**
```bash
# Check Vercel CLI version
vercel --version

# Check authentication
vercel whoami

# Check project link
vercel link --confirm

# Check environment
vercel env ls

# Pull environment variables
vercel env pull .env.local

# Check build settings
vercel inspect [deployment-url] | jq '.build'

# Check deployment regions
vercel inspect [deployment-url] | jq '.regions'
```

**Advanced Debugging:**
```bash
# Enable debug mode
DEBUG=* vercel --prod

# Check build cache
vercel inspect [deployment-url] | jq '.cache'

# Force clean build
vercel --prod --force --no-cache

# Check function logs
vercel logs [deployment-url] --output=json | jq '.[] | select(.type=="function")'

# Check edge function logs
vercel logs [deployment-url] --output=json | jq '.[] | select(.type=="edge-function")'
```

**Performance Analysis:**
```bash
# Check build time
vercel inspect [deployment-url] | jq '.buildingAt, .ready'

# Check function cold start
vercel logs --follow | grep "cold start"

# Analyze bundle size
vercel inspect [deployment-url] | jq '.output'
```

### Prevention Checklist

**Pre-Deployment Checks:**
```markdown
Before every production deploy:
- [ ] All tests pass locally
- [ ] Build succeeds locally
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Environment variables verified
- [ ] Dependencies audit clean
- [ ] Error boundaries in place
- [ ] Logging configured
- [ ] Monitoring alerts set
- [ ] Rollback plan ready
```

**Monitoring Setup:**
```markdown
Essential monitoring:
- [ ] Error tracking (Sentry/similar)
- [ ] Performance monitoring (Vercel Analytics)
- [ ] Uptime monitoring (external service)
- [ ] Log aggregation (Vercel Logs)
- [ ] Alert configuration (Slack/email)
- [ ] Status page (if applicable)
```

**Emergency Contacts:**
```markdown
Keep these handy:
- [ ] Team lead: [contact]
- [ ] DevOps: [contact]
- [ ] Vercel support: support@vercel.com
- [ ] Stakeholders: [contacts]
```

### Common Crash Scenarios & Solutions

**Scenario 1: Build Failure**
```bash
# Symptom: Deployment fails during build
# Solution: Check build logs
vercel logs [deployment-url] | grep "Build failed"

# Common causes:
# - TypeScript errors → Fix types
# - Missing dependencies → pnpm install
# - Build timeout → Optimize build
```

**Scenario 2: Runtime Error**
```bash
# Symptom: Site loads but crashes on interaction
# Solution: Check runtime logs
vercel logs --follow | grep "runtime"

# Common causes:
# - Uncaught exception → Add try-catch
# - Missing error boundary → Add error boundary
# - API call failure → Add error handling
```

**Scenario 3: Environment Variable Missing**
```bash
# Symptom: "undefined is not a function" or similar
# Solution: Check and add env vars
vercel env ls
vercel env add MISSING_VAR production

# Redeploy
vercel --prod --force
```

**Scenario 4: Memory Limit Exceeded**
```bash
# Symptom: "JavaScript heap out of memory"
# Solution: Optimize or upgrade plan

# Quick fix: Reduce bundle size
# Long-term: Upgrade Vercel plan or optimize code
```

**Scenario 5: API Route Timeout**
```bash
# Symptom: 504 Gateway Timeout
# Solution: Optimize API route or increase timeout

# Check function duration
vercel logs | grep "duration"

# Optimize slow queries or increase timeout in vercel.json
```

---

### Emergency: Security Vulnerability

**Priority: HIGH**

```markdown
## Immediate Actions (0-30 minutes)

1. [ ] Assess severity
   - CVSS score
   - Exploitability
   - Impact

2. [ ] Check exposure
   - Is it exploited?
   - Who has access?
   - Data at risk?

3. [ ] Implement mitigation
   - Update dependency
   - Apply patch
   - Disable feature

4. [ ] Verify fix
   - Security scan
   - Penetration test
   - Code review

5. [ ] Communicate
   - Security team
   - Affected users
   - Compliance team

6. [ ] Document
   - Incident report
   - Lessons learned
   - Prevention plan
```

### Emergency: Security Vulnerability

**Priority: HIGH**

```markdown
## Immediate Actions (0-30 minutes)

1. [ ] Assess severity
   - CVSS score
   - Exploitability
   - Impact

2. [ ] Check exposure
   - Is it exploited?
   - Who has access?
   - Data at risk?

3. [ ] Implement mitigation
   - Update dependency
   - Apply patch
   - Disable feature

4. [ ] Verify fix
   - Security scan
   - Penetration test
   - Code review

5. [ ] Communicate
   - Security team
   - Affected users
   - Compliance team

6. [ ] Document
   - Incident report
   - Lessons learned
   - Prevention plan
```

---

## 📊 Workflow Metrics

### Time Estimates

| Workflow Type | Planning | Implementation | Testing | Documentation | Total |
|--------------|----------|----------------|---------|---------------|-------|
| New Feature | 1-2h | 4-8h | 1-3h | 0.5-1h | 6-14h |
| Bug Fix | 0.5-2h | 0.5-4h | 0.5-1h | 0.25h | 1.75-7.25h |
| Refactoring | 0.5-1h | 1-4h | 0.5-1h | 0.25h | 2.25-6.25h |
| Performance | 0.5-1h | 1-4h | 0.5-1h | 0.25h | 2.25-6.25h |
| Documentation | 0.25h | 0.5-2h | 0.25h | - | 1-2.5h |

### Success Metrics

- ✅ Code quality: Linting passes, no `any` types
- ✅ Test coverage: > 80%
- ✅ Build time: < 30 seconds per package
- ✅ Test time: < 10 seconds per package
- ✅ Documentation: Complete and up-to-date

---

## 🔗 Related Documents

- Rules: `.agents/rules/feature-implementation-standard.md`
- Specific Workflows: `.agents/workflows/` (domain-specific)
- Architecture: `.docs/architecture/`

---

**Last Updated:** 2026-03-07  
**Version:** 1.0.0  
**Status:** Active
