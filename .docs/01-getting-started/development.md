# Quy Trình Development

Tài liệu này bao gồm các best practices, workflows, và conventions để đóng góp vào VizTechStack.

## Commands Development

### Commands Thường Dùng

```bash
# Development
pnpm dev                    # Start tất cả apps ở dev mode
pnpm dev --filter @viztechstack/web    # Start chỉ web app
pnpm dev --filter @viztechstack/api    # Start chỉ API

# Building
pnpm build                  # Build tất cả packages và apps
pnpm build --filter @viztechstack/web  # Build chỉ web app

# Code Quality
pnpm lint                   # Lint tất cả packages
pnpm typecheck              # Type check tất cả packages
pnpm format                 # Format code với Prettier
pnpm check:no-any           # Kiểm tra 'any' types

# GraphQL Code Generation
pnpm codegen                # Generate types và schemas
pnpm codegen:watch          # Watch mode cho development
pnpm codegen:check          # Verify generated files up to date

# Testing
pnpm test                   # Chạy tất cả tests
pnpm test --filter @viztechstack/api   # Chạy chỉ API tests

# Utility Scripts
pnpm generate:module <name>    # Generate backend module mới
pnpm generate:feature <name>   # Generate frontend feature mới
pnpm validate:deps             # Kiểm tra circular dependencies
pnpm analyze:bundle            # Phân tích bundle size

# Cleanup
pnpm clean                  # Xóa build artifacts
```

## Cấu Trúc Project

### Tổ Chức Monorepo

```
viztechstack/
├── apps/
│   ├── web/               # Next.js frontend
│   └── api/               # NestJS backend
├── packages/shared/       # Shared packages
│   ├── graphql-schema/   # GraphQL schema definitions
│   ├── graphql-generated/# Auto-generated types
│   ├── api-client/       # GraphQL client với hooks
│   ├── validation/       # Validation utilities
│   └── types/            # Shared types
├── tooling/
│   ├── configs/          # Shared configurations
│   ├── env/              # Environment validation
│   └── scripts/          # Utility scripts
└── convex/               # Convex database functions
```

### Cấu Trúc Backend Module

Mỗi backend module tuân theo hexagonal architecture:

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

### Cấu Trúc Frontend Feature

Frontend code được tổ chức theo feature:

```
apps/web/src/features/{feature-name}/
├── components/          # React components
├── hooks/               # Custom hooks
└── types/               # Feature-specific types
```

## Conventions Coding

### Naming Conventions

- **Files**: kebab-case (`roadmap-application.service.ts`)
- **Classes**: PascalCase (`RoadmapApplicationService`)
- **Functions/Variables**: camelCase (`getRoadmapBySlug`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`)
- **Interfaces**: PascalCase với tên mô tả (`RoadmapRepository`)
- **Types**: PascalCase (`RoadmapEntity`)

### Backend Patterns

- **Commands**: `{Verb}{Entity}Command` (ví dụ: `CreateRoadmapCommand`)
- **Queries**: `Get{Entity}By{Criteria}Query` (ví dụ: `GetRoadmapBySlugQuery`)
- **Entities**: `{Entity}Entity` (ví dụ: `RoadmapEntity`)
- **Errors**: `{Entity}{Type}DomainError` (ví dụ: `RoadmapNotFoundDomainError`)
- **Repositories**: `{Entity}Repository` interface, `Convex{Entity}Repository` implementation

### Tổ Chức Import

Nhóm imports theo thứ tự này:

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

### Đặt Tên Branch

- **Feature**: `feature/feature-name`
- **Bugfix**: `bugfix/issue-description`
- **Hotfix**: `hotfix/critical-issue`
- **Chore**: `chore/task-description`

### Commit Messages

Tuân theo [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types:
- `feat`: Feature mới
- `fix`: Bug fix
- `docs`: Thay đổi documentation
- `style`: Thay đổi code style (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Thêm hoặc update tests
- `chore`: Maintenance tasks

Ví dụ:
```bash
feat(roadmap): add bookmark functionality
fix(api): resolve circular dependency in modules
docs(readme): update installation instructions
refactor(web): extract hooks from components
```

### Git Hooks

Pre-commit hooks tự động chạy:
- ESLint
- TypeScript type checking
- Prettier formatting

Commit message validation đảm bảo conventional commit format.

## Testing

### Chạy Tests

```bash
# Chạy tất cả tests
pnpm test

# Chạy tests cho package cụ thể
pnpm test --filter @viztechstack/api

# Chạy tests ở watch mode
pnpm test --watch

# Chạy tests với coverage
pnpm test --coverage
```

### Viết Tests

- Co-locate unit tests với source files (`.spec.ts`)
- Đặt integration tests trong thư mục `test/` (`.e2e-spec.ts`)
- Duy trì test coverage ≥ 25%
- Sử dụng tên test mô tả rõ ràng

Ví dụ:
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

1. Định nghĩa GraphQL schema trong `packages/shared/graphql-schema/src/**/*.graphql`
2. Chạy code generation: `pnpm codegen`
3. Implement resolvers sử dụng generated types

### Code Generation

GraphQL Codegen tự động generates:
- TypeScript types
- Zod validation schemas
- React hooks cho queries/mutations

Chạy `pnpm codegen:watch` trong quá trình development để tự động regeneration.

## Debugging

### VS Code Debug Configuration

Tạo `.vscode/launch.json`:

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

Sử dụng structured logging:

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

- Turbo caching tăng tốc builds
- Incremental builds chỉ rebuild các packages đã thay đổi
- Sử dụng `--filter` để build các packages cụ thể

### Development Performance

- Hot Module Replacement (HMR) cho fast refresh
- Feature-based structure cải thiện HMR performance
- Sử dụng `pnpm dev --filter` để chỉ chạy services cần thiết

## Troubleshooting

### Issues Thường Gặp

1. **TypeScript errors sau khi pull changes**
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
   - Frontend: Thay đổi port trong `apps/web/package.json`
   - Backend: Thay đổi port trong `apps/api/src/main.ts`

## Các Bước Tiếp Theo

- [Tổng Quan Architecture](../02-architecture/README.md) - Hiểu system architecture
- [Documentation Features](../03-features/README.md) - Tìm hiểu về features
- [Hướng Dẫn Implementation](../04-implementation/README.md) - Deep dive vào implementation
