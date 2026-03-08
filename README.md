# VizTechStack

> Nền tảng học tập tương tác cho technology roadmaps với visualization dạng graph

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11.0.1-red)](https://nestjs.com/)
[![React](https://img.shields.io/badge/React-19.2.3-blue)](https://react.dev/)
[![pnpm](https://img.shields.io/badge/pnpm-9.15.0-orange)](https://pnpm.io/)
[![Turbo](https://img.shields.io/badge/Turbo-2.4.0-blue)](https://turbo.build/)

## 📖 Giới Thiệu

VizTechStack là nền tảng học tập tương tác giúp người dùng khám phá và theo dõi technology learning roadmaps. Platform visualize learning paths dưới dạng interactive graphs, cho phép người dùng điều hướng qua các topics, theo dõi tiến độ, và truy cập nội dung giáo dục.

### Tính Năng Chính

- 🗺️ **Interactive Roadmap Visualization** - Graph-based UI với React Flow
- 📊 **Progress Tracking** - Theo dõi tiến độ học tập của bạn
- 📚 **Content Management** - Quản lý guides và topics với markdown
- 🔐 **Authentication & Authorization** - User management với Clerk và role-based access
- ⭐ **Bookmark System** - Lưu và tổ chức roadmaps yêu thích
- 👨‍💼 **Admin Dashboard** - Tạo và quản lý roadmaps, topics, và content
- 🎨 **Modern UI** - Tailwind CSS 4 với shadcn/ui components
- ⚡ **Real-time Sync** - Convex database với real-time capabilities

### Vai Trò Người Dùng

- **User**: Xem roadmaps, theo dõi tiến độ, bookmark content (read-only)
- **Admin**: Full CRUD access để tạo và quản lý roadmaps, topics, và content

## 🚀 Quick Start

### Yêu Cầu Hệ Thống

- **Node.js**: >= 20.11.0
- **pnpm**: 9.15.0
- **Git**: Latest version

### Cài Đặt

```bash
# Clone repository
git clone <repository-url>
cd viztechstack

# Cài đặt dependencies
pnpm install

# Copy environment files
cp .env.example .env.local

# Cấu hình environment variables trong .env.local
# - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
# - CLERK_SECRET_KEY
# - CONVEX_DEPLOYMENT
# - NEXT_PUBLIC_CONVEX_URL

# Khởi động development servers
pnpm dev
```

### Truy Cập Ứng Dụng

- **Frontend**: http://localhost:3000
- **API GraphQL Playground**: http://localhost:4000/graphql
- **Convex Dashboard**: https://dashboard.convex.dev

## 📚 Tài Liệu

Tài liệu toàn diện có sẵn trong thư mục [`.docs/`](.docs/README.md):

### Tài Liệu Theo Cấp Độ

1. **[Getting Started](.docs/01-getting-started/README.md)** - Cài đặt và setup
   - [Installation Guide](.docs/01-getting-started/installation.md)
   - [Development Workflow](.docs/01-getting-started/development.md)
   - [Admin Setup](.docs/01-getting-started/admin-setup.md)

2. **[Architecture](.docs/02-architecture/README.md)** - System design và tech stack
   - [Overview](.docs/02-architecture/overview.md)
   - [Tech Stack](.docs/02-architecture/tech-stack.md)
   - [Business Logic](.docs/02-architecture/business-logic.md)
   - [Improvements](.docs/02-architecture/improvements.md)

3. **[Features](.docs/03-features/README.md)** - Feature documentation
   - [Roadmap Feature](.docs/03-features/roadmap.md)
   - [Topic Feature](.docs/03-features/topic.md)
   - [Progress Tracking](.docs/03-features/progress.md)
   - [Bookmark Feature](.docs/03-features/bookmark.md)
   - [Authentication](.docs/03-features/authentication.md)

4. **[Implementation](.docs/04-implementation/README.md)** - Development guides
   - [Hexagonal Architecture](.docs/04-implementation/hexagonal-architecture.md)
   - [GraphQL Code Generation](.docs/04-implementation/graphql-codegen.md)
   - [Git Hooks](.docs/04-implementation/git-hooks.md)

5. **[Deployment](.docs/05-deployment/README.md)** - Deployment procedures
   - [Deployment Guide](.docs/05-deployment/deployment-guide.md)
   - [Vercel Setup](.docs/05-deployment/vercel.md)
   - [Convex Setup](.docs/05-deployment/convex.md)

6. **[Analysis](.docs/06-analysis/README.md)** - Codebase analysis
   - [Codebase Analysis](.docs/06-analysis/codebase-analysis.md)
   - [Completed Tasks](.docs/06-analysis/completed-tasks.md)

### Dành Cho Team Members Mới

👉 **Bắt đầu tại đây**: [Team Onboarding Guide](.docs/TEAM-ONBOARDING.md)

Guide này giải thích cấu trúc codebase và giúp bạn productive nhanh chóng.

## 🏗️ Cấu Trúc Project

### Tổng Quan Monorepo

```
viztechstack/
├── apps/                          # Applications
│   ├── web/                      # Next.js 16 Frontend
│   │   └── src/
│   │       ├── app/             # App Router pages
│   │       ├── components/      # Shared components
│   │       ├── features/        # Feature-based organization
│   │       └── lib/            # Utilities
│   └── api/                      # NestJS 11 Backend
│       └── src/
│           ├── modules/         # Domain modules (DDD)
│           └── common/          # Shared utilities
│
├── packages/                      # Shared Packages
│   └── shared/
│       ├── api-client/          # GraphQL client + hooks
│       ├── graphql-generated/   # Auto-generated types
│       ├── graphql-schema/      # Schema definitions
│       ├── types/               # Zod schemas
│       └── validation/          # Validation utilities
│
├── tooling/                       # Development Tools
│   ├── configs/                  # Shared configs (ESLint, TS, Tailwind)
│   ├── env/                     # Environment validation
│   └── scripts/                 # Utility scripts
│
├── convex/                        # Convex Database
│   ├── schema.ts                 # Database schema
│   ├── roadmaps.ts              # Roadmap queries/mutations
│   ├── topics.ts                # Topic queries/mutations
│   ├── progress.ts              # Progress tracking
│   └── bookmarks.ts             # Bookmark management
│
├── content/                       # Content files
├── .docs/                         # Documentation (6 levels)
└── .kiro/                         # Kiro AI configuration
    ├── specs/                    # Feature specs
    └── steering/                 # Steering rules
```

### Backend Modules (6 modules)

```
apps/api/src/modules/
├── health/          # Health checks và monitoring
├── ping/            # Simple ping endpoint
├── roadmap/         # Roadmap management (DDD)
├── topic/           # Topic content management
├── progress/        # User progress tracking
└── bookmark/        # Bookmark functionality
```

Mỗi module tuân theo **Hexagonal Architecture**:

```
module-name/
├── application/       # Application Layer
│   ├── commands/     # Write operations (CQRS)
│   ├── queries/      # Read operations (CQRS)
│   ├── services/     # Use case orchestration
│   └── ports/        # Repository interfaces (Ports)
├── domain/           # Domain Layer
│   ├── entities/     # Domain models
│   ├── errors/       # Domain exceptions
│   └── policies/     # Business rules
├── infrastructure/   # Infrastructure Layer
│   └── adapters/     # Repository implementations (Adapters)
└── transport/        # Transport Layer
    └── graphql/      # GraphQL API
        ├── resolvers/
        ├── schemas/
        ├── mappers/
        └── filters/
```

### Frontend Features (5 features)

```
apps/web/src/features/
├── roadmap/         # Roadmap viewing và listing
│   ├── components/  # Roadmap components
│   ├── hooks/       # Custom hooks
│   └── types/       # TypeScript types
├── topic/           # Topic display và content
├── progress/        # Progress tracking UI
├── bookmark/        # Bookmark management
└── editor/          # Admin roadmap editor
```

## 🛠️ Tech Stack

### Frontend (apps/web)

- **Framework**: Next.js 16.1.6 với App Router
- **React**: 19.2.3 (Server và Client Components)
- **TypeScript**: 5.7
- **Styling**: Tailwind CSS 4 với shadcn/ui components
- **Visualization**: React Flow (@xyflow/react) cho graph rendering
- **Authentication**: Clerk cho user management
- **GraphQL Client**: Apollo Client 3.8.8

### Backend (apps/api)

- **Framework**: NestJS 11.0.1
- **GraphQL**: Apollo Server 5.4.0 với code-first approach
- **Authentication**: Clerk JWT validation với @clerk/backend
- **Testing**: Jest 30.0.0
- **Architecture**: Hexagonal Architecture + Domain-Driven Design + CQRS

### Database

- **Platform**: Convex (serverless database với real-time sync)
- **Schema**: TypeScript-first với built-in validation

### Monorepo Tools

- **Package Manager**: pnpm 9.15.0 với workspaces
- **Build System**: Turbo 2.4.0 cho build orchestration và caching
- **Node Version**: >= 20.11.0

### Code Generation

- **GraphQL Codegen**: Generates TypeScript types và Zod schemas từ GraphQL schema
- **Config**: codegen.ts trong root directory
- **Source**: packages/shared/graphql-schema/src/\*_/_.graphql

## 🔧 Commands

### Development

```bash
# Khởi động tất cả services
pnpm dev

# Khởi động frontend only
pnpm dev --filter @viztechstack/web

# Khởi động backend only
pnpm dev --filter @viztechstack/api
```

### Building

```bash
# Build tất cả packages và apps
pnpm build

# Build web app only
pnpm build --filter @viztechstack/web

# Build API only
pnpm build --filter @viztechstack/api
```

### Code Quality

```bash
# Lint tất cả packages
pnpm lint

# Type check tất cả packages
pnpm typecheck

# Format code với Prettier
pnpm format

# Check for 'any' types
pnpm check:no-any
```

### GraphQL Code Generation

```bash
# Generate types và schemas
pnpm codegen

# Watch mode cho development
pnpm codegen:watch

# Verify generated files up to date
pnpm codegen:check
```

### Testing

```bash
# Run tất cả tests
pnpm test

# Run API tests only
pnpm test --filter @viztechstack/api

# Run web tests only
pnpm test --filter @viztechstack/web

# Watch mode
pnpm test --watch
```

**Coverage Requirements**: ≥ 25% cho tất cả packages

### Code Generation Scripts

```bash
# Generate backend module với hexagonal architecture
pnpm generate:module <module-name>

# Generate frontend feature với components/hooks/types
pnpm generate:feature <feature-name>
```

### Utility Scripts

```bash
# Check circular dependencies
pnpm validate:deps

# Analyze bundle size và dependencies
pnpm analyze:bundle

# Clean build artifacts
pnpm clean

# Smoke tests
pnpm test:smoke:staging
pnpm test:smoke:production
```

## 🏛️ Architecture Patterns

### Hexagonal Architecture (Backend)

Backend modules tuân theo **Ports & Adapters pattern**:

- **Domain Layer**: Business logic thuần túy, không phụ thuộc infrastructure
- **Application Layer**: Use cases và orchestration
- **Infrastructure Layer**: External adapters (database, APIs)
- **Transport Layer**: API layer (GraphQL resolvers)

**Benefits**:

- ✅ Testability: Dễ mock dependencies
- ✅ Flexibility: Swap implementations dễ dàng
- ✅ Maintainability: Clear separation of concerns
- ✅ Independence: Business logic độc lập với frameworks

### CQRS Pattern

Tách biệt read và write operations:

- **Commands**: Write operations (Create, Update, Delete)
- **Queries**: Read operations (Get, List)

**Benefits**:

- ✅ Clear intent
- ✅ Different optimization strategies
- ✅ Scalability

### Feature-Based Structure (Frontend)

Frontend code tổ chức theo feature thay vì type:

- Related code lives together
- Easier to find và maintain
- Better code organization
- Improved HMR performance

## 🧪 Testing Strategy

### Unit Tests

- Domain policies (validation logic)
- Application services (use case orchestration)
- Repository adapters (data transformation)
- GraphQL mappers (DTO ↔ Domain)

### Integration Tests

- GraphQL resolvers với real database
- Authentication/authorization flows
- Error handling

### E2E Tests

- Complete user journeys
- Admin workflows
- Cross-browser testing

### Coverage Goals

- Unit Tests: 80%+ coverage
- Integration Tests: Critical paths
- E2E Tests: User journeys
- Current: ≥ 25% maintained

## 🚢 Deployment

### Platforms

- **Frontend & API**: Vercel
- **Database**: Convex Cloud (managed)

### Deployment Process

1. **Code Push**: Developer pushes to GitHub
2. **CI/CD**: GitHub Actions runs tests
3. **Build**: Turbo builds all packages
4. **Deploy Web**: Vercel deploys Next.js app
5. **Deploy API**: Vercel deploys NestJS as serverless functions
6. **Database**: Convex automatically syncs schema

### Environment Variables

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Convex Database
CONVEX_DEPLOYMENT=...
NEXT_PUBLIC_CONVEX_URL=https://...

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:4000/graphql
```

Xem [Deployment Guide](.docs/05-deployment/README.md) để biết chi tiết.

## 🤝 Contributing

### Commit Message Format

Chúng tôi tuân theo [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

Types:
- feat: Tính năng mới
- fix: Sửa bug
- docs: Thay đổi documentation
- style: Code style changes (formatting)
- refactor: Code refactoring
- test: Thêm hoặc cập nhật tests
- chore: Maintenance tasks

Examples:
feat(roadmap): add bookmark functionality
fix(api): resolve circular dependency in modules
docs(readme): update installation instructions
refactor(web): extract hooks from components
```

### Development Workflow

1. **Create feature branch**: `git checkout -b feature/feature-name`
2. **Make changes**: Implement your feature
3. **Commit**: `git commit -m "feat(scope): description"`
4. **Push**: `git push origin feature/feature-name`
5. **Create PR**: Open pull request on GitHub
6. **Review**: Wait for code review và CI checks
7. **Merge**: Merge to main after approval

### Code Quality Standards

- ✅ Pre-commit hooks run linting và type checking
- ✅ Commit messages validated với commitlint
- ✅ All tests must pass
- ✅ Maintain test coverage ≥ 25%
- ✅ No circular dependencies allowed
- ✅ TypeScript strict mode enabled
- ✅ ESLint errors must be fixed

### Git Hooks

- **pre-commit**: Runs `turbo lint typecheck`
- **commit-msg**: Validates commit message format

## 📊 Project Status

### Metrics

- **Backend Modules**: 6 modules (health, ping, roadmap, topic, progress, bookmark)
- **Frontend Features**: 5 features (roadmap, topic, progress, bookmark, editor)
- **Shared Packages**: 5 packages
- **Test Coverage**: ≥ 25%
- **Build Time**: ~1m 15s
- **Lines of Code**: ~9,000+ lines

### Recent Updates

- ✅ **2026-03-08**: Codebase restructuring completed
  - Backend split into 6 independent modules
  - Frontend organized into 5 feature-based directories
  - Documentation reorganized into 6-level hierarchy
  - Tooling consolidated with utility scripts
  - All tests passing (67/67)

Xem [Migration Summary](.docs/MIGRATION-COMPLETE.md) để biết chi tiết.

## 📖 Additional Resources

### Documentation

- **[Team Onboarding](.docs/TEAM-ONBOARDING.md)** - Guide cho team members mới
- **[Training Materials](.docs/TRAINING-MATERIALS.md)** - Training session materials
- **[Migration Complete](.docs/MIGRATION-COMPLETE.md)** - Recent codebase restructuring
- **[Documentation Audit](.docs/DOCUMENTATION-AUDIT.md)** - Documentation accuracy report

### Guides

- **[Hexagonal Architecture](.docs/04-implementation/hexagonal-architecture.md)** - Backend patterns
- **[GraphQL Codegen](.docs/04-implementation/graphql-codegen.md)** - Type generation
- **[Git Hooks](.docs/04-implementation/git-hooks.md)** - Code quality automation

### Specs

- **[Codebase Restructuring](.kiro/specs/codebase-restructuring/)** - Restructuring spec
- **[Roadmap Feature](.kiro/specs/roadmap/)** - Roadmap feature spec

## 🐛 Troubleshooting

### Common Issues

**Port Already in Use**

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <process_id> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

**pnpm Install Fails**

```bash
pnpm store prune
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

**TypeScript Errors**

```bash
# Restart TypeScript server trong VS Code
# Ctrl+Shift+P → "TypeScript: Restart TS Server"

# Hoặc rebuild
pnpm clean
pnpm build
```

**Convex Connection Issues**

- Verify Convex deployment URL trong `.env.local`
- Check Convex dashboard cho deployment status
- Restart Convex dev server

Xem [Troubleshooting Guide](.docs/01-getting-started/installation.md#troubleshooting) để biết thêm.

## 🔒 Security

- **Authentication**: Clerk với JWT tokens
- **Authorization**: Role-based access control (User/Admin)
- **API Security**: Guards và decorators cho protected endpoints
- **Environment Variables**: Sensitive data trong `.env.local` (not committed)
- **Dependencies**: Regular security audits với `pnpm audit`

## 📈 Performance

- **Build Time**: ~1m 15s với Turbo caching
- **HMR**: 20-30% faster với feature-based structure
- **Bundle Size**: Optimized với code splitting
- **Database**: Real-time sync với Convex
- **Caching**: Turbo remote caching enabled

## 🙏 Acknowledgments

- **Next.js Team** - Amazing React framework
- **NestJS Team** - Powerful Node.js framework
- **Convex Team** - Serverless database platform
- **Clerk Team** - Authentication solution
- **Vercel Team** - Deployment platform

---

**Last Updated**: 2026-03-08  
**Version**: 1.0.0  
**Status**: ✅ Production Ready

**Maintainers**: VizTechStack Team

Để biết câu hỏi hoặc support, check [documentation](.docs/README.md) hoặc liên hệ team.

---

<div align="center">

**Made with ❤️ by VizTechStack Team**

[Documentation](.docs/README.md) • [Contributing](#-contributing) • [License](#-license)

</div>
