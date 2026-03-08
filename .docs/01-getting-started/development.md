# Development Workflow

This guide covers development best practices, workflows, and conventions for contributing to VizTechStack.

## Development Commands

### Common Commands

```bash
# Development
pnpm dev                    # Start all apps in dev mode
pnpm dev --filter @viztechstack/web    # Start web app only
pnpm dev --filter @viztechstack/api    # Start API only

# Building
pnpm build                  # Build all packages and apps
pnpm build --filter @viztechstack/web  # Build web app only

# Code Quality
pnpm lint                   # Lint all packages
pnpm typecheck              # Type check all packages
pnpm format                 # Format code with Prettier
pnpm check:no-any           # Check for 'any' types

# GraphQL Code Generation
pnpm codegen                # Generate types and schemas
pnpm codegen:watch          # Watch mode for development
pnpm codegen:check          # Verify generated files are up to date

# Testing
pnpm test                   # Run all tests
pnpm test --filter @viztechstack/api   # Run API tests only

# Utility Scripts
pnpm generate:module <name>    # Generate new backend module
pnpm generate:feature <name>   # Generate new frontend feature
pnpm validate:deps             # Check for circular dependencies
pnpm analyze:bundle            # Analyze bundle size

# Cleanup
pnpm clean                  # Clean build artifacts
```

## Project Structure

### Monorepo Organization

```
viztechstack/
├── apps/
│   ├── web/               # Next.js frontend
│   └── api/               # NestJS backend
├── packages/shared/       # Shared packages
│   ├── graphql-schema/   # GraphQL schema definitions
│   ├── graphql-generated/# Auto-generated types
│   ├── api-client/       # GraphQL client with hooks
│   ├── validation/       # Validation utilities
│   └── types/            # Shared types
├── tooling/
│   ├── configs/          # Shared configurations
│   ├── env/              # Environment validation
│   └── scripts/          # Utility scripts
└── convex/               # Convex database functions
```

### Backend Module Structure

Each backend module follows hexagonal architecture:

```
apps/api/src/modules/{module-name}/
├── application/          # Application layer
│   ├── commands/        # Write operations
│   ├── queries/         # Read operations
│   ├── services/        # Use case orchestration
│   └── ports/           # Repository interfaces
├── domain/              # Domain layer
│   ├── entities/        # Domain models
│   ├── errors/          # Domain exceptions
│   └── policies/        # Business rules
├── infrastructure/      # Infrastructure layer
│   └── adapters/        # Repository implementations
└── transport/           # Transport layer
    └── graphql/         # GraphQL API
        ├── resolvers/   # GraphQL resolvers
        ├── schemas/     # GraphQL types
        └── mappers/     # DTO transformations
```

### Frontend Feature Structure

Frontend code is organized by feature:

```
apps/web/src/features/{feature-name}/
├── components/          # React components
├── hooks/               # Custom hooks
└── types/               # Feature-specific types
```

## Coding Conventions

### Naming Conventions

- **Files**: kebab-case (`roadmap-application.service.ts`)
- **Classes**: PascalCase (`RoadmapApplicationService`)
- **Functions/Variables**: camelCase (`getRoadmapBySlug`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`)
- **Interfaces**: PascalCase with descriptive names (`RoadmapRepository`)
- **Types**: PascalCase (`RoadmapEntity`)

### Backend Patterns

- **Commands**: `{Verb}{Entity}Command` (e.g., `CreateRoadmapCommand`)
- **Queries**: `Get{Entity}By{Criteria}Query` (e.g., `GetRoadmapBySlugQuery`)
- **Entities**: `{Entity}Entity` (e.g., `RoadmapEntity`)
- **Errors**: `{Entity}{Type}DomainError` (e.g., `RoadmapNotFoundDomainError`)
- **Repositories**: `{Entity}Repository` interface, `Convex{Entity}Repository` implementation

### Import Organization

Group imports in this order:

1. External dependencies
2. Internal workspace packages
3. Relative imports

```typescript
// External
import { Injectable } from '@nestjs/common'
import { GraphQLError } from 'graphql'

// Internal
import { RoadmapEntity } from '@viztechstack/types'

// Relative
import { RoadmapRepository } from '../ports/roadmap.repository'
```

## Git Workflow

### Branch Naming

- **Feature**: `feature/feature-name`
- **Bugfix**: `bugfix/issue-description`
- **Hotfix**: `hotfix/critical-issue`
- **Chore**: `chore/task-description`

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```bash
feat(roadmap): add bookmark functionality
fix(api): resolve circular dependency in modules
docs(readme): update installation instructions
refactor(web): extract hooks from components
```

### Git Hooks

Pre-commit hooks automatically run:
- ESLint
- TypeScript type checking
- Prettier formatting

Commit message validation ensures conventional commit format.

## Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm test --filter @viztechstack/api

# Run tests in watch mode
pnpm test --watch

# Run tests with coverage
pnpm test --coverage
```

### Writing Tests

- Co-locate unit tests with source files (`.spec.ts`)
- Place integration tests in `test/` directory (`.e2e-spec.ts`)
- Maintain test coverage ≥ 25%
- Use descriptive test names

Example:
```typescript
describe('RoadmapApplicationService', () => {
  describe('createRoadmap', () => {
    it('should create a roadmap with valid data', async () => {
      // Arrange
      const input = { title: 'Test Roadmap', ... }
      
      // Act
      const result = await service.createRoadmap(input)
      
      // Assert
      expect(result).toBeDefined()
      expect(result.title).toBe('Test Roadmap')
    })
  })
})
```

## GraphQL Development

### Schema-First Approach

1. Define GraphQL schema in `packages/shared/graphql-schema/src/**/*.graphql`
2. Run code generation: `pnpm codegen`
3. Implement resolvers using generated types

### Code Generation

GraphQL Codegen automatically generates:
- TypeScript types
- Zod validation schemas
- React hooks for queries/mutations

Run `pnpm codegen:watch` during development for automatic regeneration.

## Debugging

### VS Code Debug Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug API",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["dev", "--filter", "@viztechstack/api"],
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "name": "Debug Web",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["dev", "--filter", "@viztechstack/web"],
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

### Logging

Use structured logging:

```typescript
// Backend (NestJS)
this.logger.log('Creating roadmap', { title, userId })
this.logger.error('Failed to create roadmap', error.stack)

// Frontend (Next.js)
console.log('[Roadmap]', 'Loading roadmap', { slug })
console.error('[Roadmap]', 'Failed to load', error)
```

## Performance

### Build Performance

- Turbo caching speeds up builds
- Incremental builds only rebuild changed packages
- Use `--filter` to build specific packages

### Development Performance

- Hot Module Replacement (HMR) for fast refresh
- Feature-based structure improves HMR performance
- Use `pnpm dev --filter` to run only needed services

## Troubleshooting

### Common Issues

1. **TypeScript errors after pulling changes**
   ```bash
   pnpm clean
   pnpm install
   pnpm build
   ```

2. **GraphQL types out of sync**
   ```bash
   pnpm codegen
   ```

3. **Circular dependency errors**
   ```bash
   pnpm validate:deps
   ```

4. **Port conflicts**
   - Frontend: Change port in `apps/web/package.json`
   - Backend: Change port in `apps/api/src/main.ts`

## Next Steps

- [Architecture Overview](../02-architecture/README.md) - Understand system architecture
- [Features Documentation](../03-features/README.md) - Learn about features
- [Implementation Guides](../04-implementation/README.md) - Deep dive into implementation
