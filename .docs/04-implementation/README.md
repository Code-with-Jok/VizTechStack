# Implementation Guides

This section provides detailed implementation guides for key technical patterns and practices used in VizTechStack.

## Contents

- [Hexagonal Architecture](./hexagonal-architecture.md) - Backend module architecture pattern
- [GraphQL Code Generation](./graphql-codegen.md) - Type generation and validation
- [Git Hooks](./git-hooks.md) - Code quality automation with Husky
- [Testing Strategy](./testing.md) - Testing approaches and best practices
- [Error Handling](./error-handling.md) - Error handling patterns

## Key Implementation Patterns

### Backend Patterns

1. **Hexagonal Architecture**
   - Clear layer separation
   - Dependency inversion
   - Testable business logic

2. **CQRS (Command Query Responsibility Segregation)**
   - Separate read and write operations
   - Commands for writes
   - Queries for reads

3. **Repository Pattern**
   - Abstract data access
   - Interface-based contracts
   - Swappable implementations

### Frontend Patterns

1. **Feature-Based Structure**
   - Organize by feature, not by type
   - Co-locate related code
   - Improved maintainability

2. **Custom Hooks**
   - Extract reusable logic
   - Separate concerns
   - Testable components

3. **Type-Safe API Calls**
   - Generated TypeScript types
   - Runtime validation with Zod
   - Error handling

### Shared Patterns

1. **Code Generation**
   - GraphQL schema as source of truth
   - Auto-generated types and schemas
   - Reduced duplication

2. **Monorepo Organization**
   - Shared packages
   - Workspace dependencies
   - Turbo caching

3. **Type Safety**
   - End-to-end TypeScript
   - Compile-time checking
   - Runtime validation

## Development Workflow

### 1. Define GraphQL Schema

```graphql
type Roadmap {
  id: ID!
  title: String!
  slug: String!
}
```

### 2. Generate Types

```bash
pnpm codegen
```

### 3. Implement Backend

```typescript
// Domain entity
export class RoadmapEntity { ... }

// Repository interface
export interface RoadmapRepository { ... }

// Application service
export class RoadmapApplicationService { ... }

// GraphQL resolver
export class RoadmapResolver { ... }
```

### 4. Implement Frontend

```typescript
// Custom hook
export function useRoadmaps() { ... }

// Component
export function RoadmapList() { ... }
```

### 5. Test

```bash
pnpm test
```

### 6. Commit

```bash
git commit -m "feat(roadmap): add roadmap listing"
```

## Best Practices

### Code Organization

- Keep modules small and focused
- Follow naming conventions
- Use barrel exports (index.ts)
- Co-locate related code

### Type Safety

- Use generated types
- Avoid `any` type
- Validate at boundaries
- Use Zod for runtime validation

### Testing

- Write unit tests for business logic
- Test edge cases
- Mock external dependencies
- Maintain coverage ≥ 25%

### Git Workflow

- Use conventional commits
- Keep commits atomic
- Write descriptive messages
- Review before pushing

## Navigation

← [Previous: Features](../03-features/README.md)  
→ [Next: Deployment](../05-deployment/README.md)  
↑ [Documentation Index](../README.md)
