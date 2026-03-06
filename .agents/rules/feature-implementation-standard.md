# Feature Implementation Standard

## 📋 Overview

Quy tắc tổng quát cho việc implement, fix và refactor các tính năng trong dự án VizTechStack. Áp dụng cho tất cả AI agents khi làm việc với codebase.

---

## 🎯 Core Principles

### 1. Documentation First
- **RULE:** Luôn đọc và hiểu documentation trước khi code
- **DO:** 
  - Đọc `.docs/architecture/` để hiểu kiến trúc
  - Đọc existing code để hiểu patterns
  - Đọc `.agents/rules/` và `.agents/workflows/` liên quan
- **DON'T:** 
  - Bắt đầu code ngay mà không hiểu context
  - Ignore existing patterns và conventions
- **WHY:** Đảm bảo consistency và avoid breaking changes

### 2. Incremental Implementation
- **RULE:** Chia nhỏ task thành các bước có thể verify
- **DO:**
  - Implement từng bước một
  - Verify sau mỗi bước (build, typecheck, test)
  - Commit sau mỗi milestone
- **DON'T:**
  - Implement toàn bộ feature một lúc
  - Skip verification steps
  - Make large commits without testing
- **WHY:** Dễ debug, dễ rollback, dễ review

### 3. Type Safety First
- **RULE:** TypeScript strict mode là bắt buộc
- **DO:**
  - Enable strict mode trong tsconfig.json
  - Use proper types, không dùng `any`
  - Leverage type inference
- **DON'T:**
  - Use `any` type (trừ khi absolutely necessary)
  - Use type assertions without validation
  - Disable strict checks
- **WHY:** Catch errors at compile time, better IDE support

### 4. Test Coverage
- **RULE:** Mọi feature phải có tests
- **DO:**
  - Write unit tests cho business logic
  - Write integration tests cho API endpoints
  - Test edge cases và error scenarios
- **DON'T:**
  - Skip tests vì "thiếu thời gian"
  - Only test happy path
  - Write tests sau khi deploy
- **WHY:** Prevent regressions, document behavior

### 5. Error Handling
- **RULE:** Handle errors gracefully
- **DO:**
  - Validate external data
  - Provide user-friendly error messages
  - Log errors với sufficient context
- **DON'T:**
  - Let errors crash the app
  - Show technical errors to users
  - Swallow errors silently
- **WHY:** Better UX, easier debugging

---

## 📁 Project Structure Rules

### Monorepo Organization

```
VizTechStack/
├── apps/                    # Applications
│   ├── web/                # Next.js frontend
│   └── api/                # NestJS backend
├── packages/               # Shared packages
│   └── shared/
│       ├── types/          # Shared TypeScript types
│       ├── validation/     # Validation utilities
│       ├── api-client/     # API client
│       └── ...
├── tooling/                # Development tools
│   └── env/                # Environment config
├── .docs/                  # Documentation
│   └── architecture/       # Architecture docs
├── .agents/                # AI agent instructions
│   ├── rules/              # Implementation rules
│   └── workflows/          # Step-by-step workflows
└── .github/                # CI/CD workflows
```

### Package Naming Convention

**Format:** `@viztechstack/<package-name>`

**Examples:**
- `@viztechstack/types`
- `@viztechstack/validation`
- `@viztechstack/api-client`

### File Naming Convention

**TypeScript/JavaScript:**
- Components: `PascalCase.tsx` (e.g., `UserProfile.tsx`)
- Utilities: `kebab-case.ts` (e.g., `format-date.ts`)
- Hooks: `camelCase.ts` with `use` prefix (e.g., `useAuth.ts`)
- Types: `PascalCase.types.ts` (e.g., `User.types.ts`)
- Tests: `*.test.ts` or `*.spec.ts`

**Documentation:**
- Architecture: `kebab-case.md` (e.g., `graphql-zod-architecture.md`)
- Rules: `kebab-case.md` (e.g., `feature-implementation-standard.md`)
- Workflows: `kebab-case.md` (e.g., `feature-development-workflow.md`)

---

## 🔄 Development Workflow

### Phase 1: Planning

#### Step 1: Understand Requirements
```markdown
Questions to answer:
- [ ] What problem are we solving?
- [ ] Who are the users?
- [ ] What are the acceptance criteria?
- [ ] What are the constraints?
- [ ] What are the dependencies?
```

#### Step 2: Research Existing Code
```bash
# Search for similar implementations
grep -r "similar-feature" apps/ packages/

# Check existing patterns
ls -la packages/shared/

# Read related documentation
cat .docs/architecture/*.md
```

#### Step 3: Design Solution
```markdown
Design checklist:
- [ ] Identify affected packages/apps
- [ ] Plan data models
- [ ] Design API contracts
- [ ] Consider error scenarios
- [ ] Plan testing strategy
- [ ] Estimate complexity
```

#### Step 4: Create Implementation Plan
```markdown
# Implementation Plan

## Packages to Create/Modify
- [ ] Package 1: Description
- [ ] Package 2: Description

## Files to Create/Modify
- [ ] File 1: Purpose
- [ ] File 2: Purpose

## Dependencies to Add
- [ ] Dependency 1: Version
- [ ] Dependency 2: Version

## Testing Strategy
- [ ] Unit tests for X
- [ ] Integration tests for Y

## Rollout Plan
- [ ] Step 1
- [ ] Step 2
```

### Phase 2: Implementation

#### Step 1: Setup Package Structure
```bash
# Create package if needed
mkdir -p packages/shared/new-package/src
cd packages/shared/new-package

# Create package.json
cat > package.json << EOF
{
  "name": "@viztechstack/new-package",
  "version": "0.0.1",
  "main": "./src/index.ts",
  "types": "./src/index.ts"
}
EOF

# Create tsconfig.json
cat > tsconfig.json << EOF
{
  "extends": "@viztechstack/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["src"]
}
EOF
```

#### Step 2: Implement Core Logic
```typescript
// Start with types
export interface Entity {
  id: string;
  name: string;
}

// Then implement logic
export class EntityService {
  // Implementation
}

// Export from index
export * from './types';
export * from './service';
```

#### Step 3: Add Validation
```typescript
import { z } from 'zod';

// Define schema
export const EntitySchema = z.object({
  id: z.string(),
  name: z.string().min(1),
});

// Use in code
export function validateEntity(data: unknown): Entity {
  return EntitySchema.parse(data);
}
```

#### Step 4: Add Error Handling
```typescript
export class EntityError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'EntityError';
  }
}

export function handleEntityError(error: unknown): EntityError {
  if (error instanceof EntityError) {
    return error;
  }
  return new EntityError('Unknown error', 'UNKNOWN', error);
}
```

#### Step 5: Write Tests
```typescript
describe('EntityService', () => {
  describe('create', () => {
    it('should create entity with valid data', () => {
      // Test implementation
    });
    
    it('should throw error with invalid data', () => {
      // Test implementation
    });
  });
});
```

#### Step 6: Add Documentation
```typescript
/**
 * Service for managing entities
 * 
 * @example
 * ```typescript
 * const service = new EntityService();
 * const entity = await service.create({ name: 'Test' });
 * ```
 */
export class EntityService {
  /**
   * Create a new entity
   * 
   * @param data - Entity data
   * @returns Created entity
   * @throws {EntityError} If validation fails
   */
  async create(data: CreateEntityInput): Promise<Entity> {
    // Implementation
  }
}
```

### Phase 3: Integration

#### Step 1: Update Dependencies
```bash
# Add to consuming package
cd apps/web
pnpm add @viztechstack/new-package
```

#### Step 2: Integrate with Existing Code
```typescript
// Import and use
import { EntityService } from '@viztechstack/new-package';

const service = new EntityService();
const entity = await service.create(data);
```

#### Step 3: Update Types
```typescript
// Ensure type compatibility
import type { Entity } from '@viztechstack/new-package';

interface ExtendedEntity extends Entity {
  // Additional fields
}
```

### Phase 4: Verification

#### Step 1: Build All Packages
```bash
pnpm turbo build --filter='./packages/**'
```

**Expected:** ✅ All packages build successfully

#### Step 2: Run Linting
```bash
pnpm turbo lint
```

**Expected:** ✅ No linting errors

#### Step 3: Run Type Checking
```bash
pnpm turbo typecheck
```

**Expected:** ✅ No type errors

#### Step 4: Run Tests
```bash
pnpm turbo test
```

**Expected:** ✅ All tests pass

#### Step 5: Build Apps
```bash
pnpm turbo build --filter='./apps/**'
```

**Expected:** ✅ Apps build successfully

#### Step 6: Manual Testing
```markdown
Manual testing checklist:
- [ ] Feature works as expected
- [ ] Error handling works
- [ ] UI/UX is acceptable
- [ ] Performance is acceptable
- [ ] No console errors
```

### Phase 5: Documentation

#### Step 1: Update Architecture Docs
```bash
# Create or update architecture doc
vim .docs/architecture/new-feature.md
```

#### Step 2: Create Implementation Guide
```bash
# Create implementation guide
vim .docs/architecture/new-feature/implementation-guide.md
```

#### Step 3: Update README (if needed)
```bash
# Update package README
vim packages/shared/new-package/README.md
```

#### Step 4: Create Rule File (if needed)
```bash
# Create rule file for AI agents
vim .agents/rules/new-feature-rules.md
```

#### Step 5: Create Workflow File (if needed)
```bash
# Create workflow file for AI agents
vim .agents/workflows/new-feature-workflow.md
```

---

## 🚨 Error Handling Standards

### Error Types

#### 1. Validation Errors
```typescript
export class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public value: unknown
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}
```

#### 2. Business Logic Errors
```typescript
export class BusinessError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = 'BusinessError';
  }
}
```

#### 3. External Service Errors
```typescript
export class ExternalServiceError extends Error {
  constructor(
    message: string,
    public service: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'ExternalServiceError';
  }
}
```

### Error Handling Pattern

```typescript
export async function performOperation(): Promise<Result> {
  try {
    // Validate input
    const validated = schema.parse(input);
    
    // Perform operation
    const result = await operation(validated);
    
    // Validate output
    return outputSchema.parse(result);
    
  } catch (error) {
    // Handle specific errors
    if (error instanceof ValidationError) {
      throw new BusinessError('Invalid input', 'INVALID_INPUT');
    }
    
    if (error instanceof ExternalServiceError) {
      throw new BusinessError('Service unavailable', 'SERVICE_ERROR');
    }
    
    // Handle unknown errors
    throw new BusinessError('Operation failed', 'UNKNOWN_ERROR');
  }
}
```

---

## 🧪 Testing Standards

### Test Structure

```typescript
describe('Feature/Component Name', () => {
  // Setup
  beforeEach(() => {
    // Setup code
  });
  
  // Teardown
  afterEach(() => {
    // Cleanup code
  });
  
  // Happy path tests
  describe('when conditions are met', () => {
    it('should perform expected action', () => {
      // Test
    });
  });
  
  // Error cases
  describe('when conditions are not met', () => {
    it('should throw appropriate error', () => {
      // Test
    });
  });
  
  // Edge cases
  describe('edge cases', () => {
    it('should handle edge case X', () => {
      // Test
    });
  });
});
```

### Test Coverage Requirements

**Minimum coverage:**
- Unit tests: 80%
- Integration tests: 60%
- E2E tests: Critical paths only

**What to test:**
- ✅ Business logic
- ✅ Validation logic
- ✅ Error handling
- ✅ Edge cases
- ✅ Integration points

**What NOT to test:**
- ❌ Third-party libraries
- ❌ Generated code (unless custom logic added)
- ❌ Simple getters/setters
- ❌ Type definitions

---

## 📦 Dependency Management

### Adding Dependencies

#### Step 1: Evaluate Necessity
```markdown
Questions:
- [ ] Is this dependency really needed?
- [ ] Can we implement it ourselves?
- [ ] What's the bundle size impact?
- [ ] Is it actively maintained?
- [ ] What's the license?
```

#### Step 2: Check Compatibility
```bash
# Check version compatibility
pnpm info <package-name> versions

# Check peer dependencies
pnpm info <package-name> peerDependencies
```

#### Step 3: Add to Correct Location
```bash
# Workspace root (for tools)
pnpm add -D <package-name> -w

# Specific package
pnpm add <package-name> --filter @viztechstack/package-name

# Specific app
pnpm add <package-name> --filter @viztechstack/web
```

#### Step 4: Document Usage
```markdown
# In package README or architecture doc

## Dependencies

### @package/name (version)
- **Purpose:** Why we use this
- **Usage:** Where it's used
- **Alternatives:** What we considered
```

### Updating Dependencies

```bash
# Check outdated packages
pnpm outdated

# Update specific package
pnpm update <package-name>

# Update all packages (carefully!)
pnpm update --latest
```

---

## 🔒 Security Standards

### Input Validation
- ✅ Validate all external input
- ✅ Sanitize user input
- ✅ Use parameterized queries
- ❌ Never trust client data
- ❌ Never execute user input as code

### Authentication & Authorization
- ✅ Use Clerk for authentication
- ✅ Verify JWT tokens
- ✅ Check user roles/permissions
- ❌ Never store passwords in plain text
- ❌ Never expose sensitive data in logs

### Data Protection
- ✅ Use environment variables for secrets
- ✅ Encrypt sensitive data
- ✅ Use HTTPS for all communications
- ❌ Never commit secrets to Git
- ❌ Never log sensitive information

---

## 🚀 Performance Standards

### Code Performance
- ✅ Use memoization for expensive computations
- ✅ Lazy load components when possible
- ✅ Optimize database queries
- ❌ Don't block the main thread
- ❌ Don't make unnecessary re-renders

### Bundle Size
- ✅ Code split large features
- ✅ Tree-shake unused code
- ✅ Use dynamic imports
- ❌ Don't import entire libraries
- ❌ Don't bundle dev dependencies

### Monitoring
- ✅ Log performance metrics
- ✅ Monitor error rates
- ✅ Track user interactions
- ❌ Don't log PII
- ❌ Don't spam logs

---

## 📝 Code Style Standards

### TypeScript

```typescript
// ✅ GOOD: Explicit types for public APIs
export function processUser(user: User): ProcessedUser {
  return { ... };
}

// ✅ GOOD: Type inference for internal logic
const result = calculateTotal(items); // Type inferred

// ❌ BAD: Using any
function process(data: any) { ... }

// ❌ BAD: Unnecessary type annotations
const name: string = "John"; // Type obvious from value
```

### Naming Conventions

```typescript
// ✅ GOOD: Descriptive names
const userProfile = getUserProfile(userId);
const isAuthenticated = checkAuth();

// ❌ BAD: Unclear names
const data = get(id);
const flag = check();

// ✅ GOOD: Consistent naming
class UserService { ... }
class OrderService { ... }

// ❌ BAD: Inconsistent naming
class UserManager { ... }
class OrderHandler { ... }
```

### Comments

```typescript
// ✅ GOOD: Explain WHY, not WHAT
// Use exponential backoff to avoid overwhelming the API
await retryWithBackoff(apiCall);

// ❌ BAD: Stating the obvious
// Increment counter by 1
counter++;

// ✅ GOOD: Document complex logic
/**
 * Calculate discount based on user tier and order total
 * 
 * Tier 1: 5% discount on orders > $100
 * Tier 2: 10% discount on orders > $50
 * Tier 3: 15% discount on all orders
 */
function calculateDiscount(tier: number, total: number): number {
  // Implementation
}
```

---

## 🔄 Git Workflow

### Commit Messages

**Format:** `<type>(<scope>): <subject>`

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```bash
feat(api): add user authentication endpoint
fix(web): resolve navigation bug on mobile
docs(architecture): update GraphQL integration guide
refactor(validation): extract common schemas
test(api-client): add validation error tests
```

### Branch Naming

**Format:** `<type>/<short-description>`

**Examples:**
```bash
feature/user-authentication
fix/navigation-bug
refactor/validation-logic
docs/architecture-update
```

### Pull Request Process

1. Create feature branch
2. Implement changes
3. Write tests
4. Update documentation
5. Run all checks locally
6. Create PR with description
7. Address review comments
8. Merge after approval

---

## ✅ Pre-commit Checklist

```markdown
Before committing:
- [ ] Code builds successfully
- [ ] All tests pass
- [ ] No linting errors
- [ ] No type errors
- [ ] No console.log statements
- [ ] Documentation updated
- [ ] Commit message is clear
```

---

## 🚨 Production Incident Response

### When Production Webapp Crashes

**CRITICAL PRIORITY - Immediate Action Required**

#### Prerequisites
- Vercel CLI installed: `pnpm add -g vercel`
- Vercel account authenticated: `vercel login`
- Access to production logs and monitoring

#### Phase 1: Immediate Assessment (0-5 minutes)

**Step 1: Check Vercel Dashboard**
```bash
# Open Vercel dashboard
open https://vercel.com/viztechstack/dashboard

# Or use CLI to check deployment status
vercel ls
```

**Quick Assessment Checklist:**
- [ ] Is the entire site down or specific pages?
- [ ] When did the crash start?
- [ ] What was the last deployment?
- [ ] Are there any error messages visible?

**Step 2: Check Vercel Logs**
```bash
# View real-time logs
vercel logs --follow

# View logs for specific deployment
vercel logs [deployment-url]

# Filter logs by type
vercel logs --output=json | grep "ERROR"
```

**Step 3: Check Monitoring & Alerts**
```bash
# Check error rate
vercel inspect [deployment-url]

# View analytics
open https://vercel.com/viztechstack/analytics
```

#### Phase 2: Identify Root Cause (5-15 minutes)

**Step 1: Review Recent Changes**
```bash
# Check recent deployments
vercel ls --limit 10

# View deployment details
vercel inspect [deployment-url]

# Check git history
git log --oneline -10
```

**Step 2: Analyze Error Logs**
```bash
# Download logs for analysis
vercel logs [deployment-url] > crash-logs.txt

# Search for common errors
grep -i "error\|exception\|crash\|fatal" crash-logs.txt

# Check for specific patterns
grep -i "out of memory\|timeout\|connection" crash-logs.txt
```

**Common Crash Causes:**
- ❌ Build failure
- ❌ Runtime error (uncaught exception)
- ❌ Memory limit exceeded
- ❌ Environment variable missing
- ❌ Dependency issue
- ❌ API endpoint down
- ❌ Database connection failed

**Step 3: Reproduce Locally (if time permits)**
```bash
# Pull latest code
git pull origin main

# Install dependencies
pnpm install

# Run production build locally
pnpm turbo build --filter @viztechstack/web

# Start production server
cd apps/web
pnpm start
```

#### Phase 3: Immediate Mitigation (5-20 minutes)

**Option A: Rollback to Last Working Deployment (FASTEST)**
```bash
# List recent deployments
vercel ls

# Identify last working deployment
# Look for deployment before the crash

# Rollback using Vercel CLI
vercel rollback [previous-deployment-url]

# Or rollback via dashboard
open https://vercel.com/viztechstack/deployments

# Verify rollback
curl -I https://your-domain.com
```

**Option B: Quick Hotfix (if rollback not possible)**
```bash
# Create hotfix branch
git checkout -b hotfix/production-crash

# Make minimal fix
# (e.g., comment out broken code, add error boundary)

# Test locally
pnpm turbo build --filter @viztechstack/web
pnpm turbo test --filter @viztechstack/web

# Commit and push
git add .
git commit -m "hotfix: resolve production crash"
git push origin hotfix/production-crash

# Deploy hotfix immediately
vercel --prod

# Or deploy specific branch
vercel --prod --branch hotfix/production-crash
```

**Option C: Environment Variable Fix**
```bash
# If crash is due to missing env var

# Add env var via CLI
vercel env add MISSING_VAR production

# Or via dashboard
open https://vercel.com/viztechstack/settings/environment-variables

# Redeploy to apply changes
vercel --prod --force
```

**Option D: Enable Maintenance Mode**
```bash
# If fix will take time, show maintenance page

# Create maintenance page
cat > apps/web/pages/maintenance.tsx << 'EOF'
export default function Maintenance() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column'
    }}>
      <h1>We'll be right back</h1>
      <p>We're performing maintenance. Please check back soon.</p>
    </div>
  );
}
EOF

# Update middleware to redirect to maintenance
# Then deploy
vercel --prod
```

#### Phase 4: Verification (5-10 minutes)

**Step 1: Verify Fix**
```bash
# Check deployment status
vercel ls

# Test production URL
curl -I https://your-domain.com

# Check logs for errors
vercel logs --follow

# Monitor for 5 minutes
watch -n 10 'curl -s -o /dev/null -w "%{http_code}" https://your-domain.com'
```

**Step 2: Smoke Testing**
```markdown
Critical path testing:
- [ ] Homepage loads
- [ ] User can login
- [ ] Main features work
- [ ] No console errors
- [ ] API calls succeed
```

**Step 3: Monitor Metrics**
```bash
# Check error rate
vercel inspect [deployment-url]

# Monitor real-time logs
vercel logs --follow

# Check analytics
open https://vercel.com/viztechstack/analytics
```

#### Phase 5: Communication (Throughout incident)

**Step 1: Notify Stakeholders**
```markdown
## Incident Notification Template

**Status:** 🔴 INCIDENT - Production Down
**Time:** [Current time]
**Impact:** [Description of impact]
**Affected:** [Who/what is affected]
**ETA:** [Estimated time to resolution]

**Current Actions:**
- [ ] Investigating root cause
- [ ] Implementing fix
- [ ] Testing solution

**Updates:** Will provide updates every 15 minutes
```

**Step 2: Update Status Page (if available)**
```bash
# Update status page or create status tweet
# Keep users informed
```

**Step 3: Internal Communication**
```markdown
# Post in team channel

🚨 PRODUCTION INCIDENT 🚨

**What:** Web app crashed
**When:** [Time]
**Status:** [Investigating/Fixing/Resolved]
**Owner:** [Your name]

**Timeline:**
- [Time] - Incident detected
- [Time] - Root cause identified
- [Time] - Fix deployed
- [Time] - Verified resolved

**Next Steps:**
- [ ] Monitor for 1 hour
- [ ] Post-mortem scheduled
```

#### Phase 6: Post-Incident (After resolution)

**Step 1: Document Incident**
```bash
# Create incident report
vim .docs/incidents/YYYY-MM-DD-production-crash.md
```

```markdown
# Production Incident Report - [Date]

## Summary
Brief description of what happened

## Timeline
- **[Time]** - Incident detected
- **[Time]** - Root cause identified  
- **[Time]** - Fix deployed
- **[Time]** - Incident resolved

## Root Cause
Detailed explanation of what caused the crash

## Impact
- **Duration:** X minutes
- **Users Affected:** Estimate
- **Revenue Impact:** If applicable

## Resolution
How was it fixed?

## Prevention
What can we do to prevent this in the future?

## Action Items
- [ ] Action 1
- [ ] Action 2
- [ ] Action 3

## Lessons Learned
What did we learn?
```

**Step 2: Create Prevention Tasks**
```bash
# Create GitHub issues for prevention
gh issue create --title "Add error boundary for X" --body "..."
gh issue create --title "Add monitoring for Y" --body "..."
gh issue create --title "Improve logging for Z" --body "..."
```

**Step 3: Update Runbooks**
```bash
# Update this document with new learnings
vim .agents/rules/feature-implementation-standard.md

# Add specific incident response for this type of crash
vim .agents/workflows/incident-response-[type].md
```

**Step 4: Schedule Post-Mortem**
```markdown
## Post-Mortem Meeting

**When:** Within 24-48 hours
**Who:** Engineering team + stakeholders
**Agenda:**
1. Timeline review
2. Root cause analysis
3. What went well
4. What could be improved
5. Action items
6. Prevention strategies
```

### Vercel CLI Quick Reference

**Essential Commands:**
```bash
# Authentication
vercel login
vercel whoami

# Deployment
vercel                    # Deploy to preview
vercel --prod            # Deploy to production
vercel --force           # Force new deployment

# Logs & Monitoring
vercel logs              # View logs
vercel logs --follow     # Real-time logs
vercel logs [url]        # Logs for specific deployment

# Deployment Management
vercel ls                # List deployments
vercel inspect [url]     # Inspect deployment
vercel rollback [url]    # Rollback to deployment
vercel rm [url]          # Remove deployment

# Environment Variables
vercel env ls            # List env vars
vercel env add           # Add env var
vercel env rm            # Remove env var
vercel env pull          # Pull env vars to .env

# Project Management
vercel link              # Link local project
vercel project ls        # List projects
vercel domains ls        # List domains

# Troubleshooting
vercel dev               # Run dev server with Vercel env
vercel build             # Build locally
```

**Advanced Debugging:**
```bash
# Enable debug mode
vercel --debug

# Check build logs
vercel logs [deployment-url] --output=json | jq '.[] | select(.type=="build")'

# Check runtime logs
vercel logs [deployment-url] --output=json | jq '.[] | select(.type=="runtime")'

# Download all logs
vercel logs [deployment-url] > full-logs.txt
```

### Prevention Checklist

**Before Every Production Deploy:**
- [ ] All tests pass locally
- [ ] Build succeeds locally
- [ ] Environment variables verified
- [ ] Dependencies up to date
- [ ] No console errors
- [ ] Error boundaries in place
- [ ] Monitoring configured
- [ ] Rollback plan ready

**Monitoring Setup:**
- [ ] Error tracking (Sentry, etc.)
- [ ] Performance monitoring
- [ ] Uptime monitoring
- [ ] Log aggregation
- [ ] Alert configuration

**Emergency Contacts:**
- [ ] Team lead contact
- [ ] DevOps contact
- [ ] Vercel support (if needed)
- [ ] Stakeholder contacts

---

## 🎓 Best Practices Summary

### DO
1. ✅ Read documentation first
2. ✅ Follow existing patterns
3. ✅ Write tests
4. ✅ Handle errors gracefully
5. ✅ Use TypeScript strictly
6. ✅ Validate external data
7. ✅ Document complex logic
8. ✅ Keep functions small
9. ✅ Use meaningful names
10. ✅ Commit frequently

### DON'T
1. ❌ Use `any` type
2. ❌ Skip tests
3. ❌ Ignore errors
4. ❌ Commit secrets
5. ❌ Make large PRs
6. ❌ Break existing APIs
7. ❌ Duplicate code
8. ❌ Ignore warnings
9. ❌ Skip documentation
10. ❌ Rush implementation

---

## 🔗 Related Documents

- Workflows: `.agents/workflows/feature-development-workflow.md`
- Architecture: `.docs/architecture/`
- Specific Rules: `.agents/rules/` (domain-specific rules)

---

**Last Updated:** 2026-03-07  
**Version:** 1.0.0  
**Status:** Active
