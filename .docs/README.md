# VizTechStack Documentation

Chào mừng đến với documentation VizTechStack! Tài liệu này sẽ giúp bạn hiểu, phát triển, và deploy nền tảng học tập tương tác.

## 📚 Cấu Trúc Documentation

### [01. Getting Started](./01-getting-started/README.md)
Hướng dẫn bắt đầu nhanh, cài đặt, và quy trình development.

- [Hướng Dẫn Cài Đặt](./01-getting-started/installation.md)
- [Quy Trình Development](./01-getting-started/development.md)
- [Cài Đặt Admin](./01-getting-started/admin-setup.md)

### [02. Architecture](./02-architecture/README.md)
Kiến trúc hệ thống, quyết định thiết kế, và technical stack.

- [Tổng Quan](./02-architecture/overview.md)
- [Tech Stack](./02-architecture/tech-stack.md)
- [Business Logic](./02-architecture/business-logic.md)
- [Cải Tiến](./02-architecture/improvements.md)

### [03. Features](./03-features/README.md)
Các features chính và chi tiết implementation.

- [Roadmap Feature](./03-features/roadmap.md)
- [Hướng Dẫn Implementation Roadmap](./03-features/roadmap-implementation.md)
- [Quản Lý Topic](./03-features/topic.md)
- [Theo Dõi Progress](./03-features/progress.md)
- [Hệ Thống Bookmark](./03-features/bookmark.md)
- [Authentication](./03-features/authentication.md)

### [04. Implementation](./04-implementation/README.md)
Hướng dẫn implementation và technical patterns.

- [Hexagonal Architecture](./04-implementation/hexagonal-architecture.md)
- [GraphQL Code Generation](./04-implementation/graphql-codegen.md)
- [Git Hooks](./04-implementation/git-hooks.md)

### [05. Deployment](./05-deployment/README.md)
Quy trình deployment và cấu hình.

- [Convex Database](./05-deployment/convex.md)
- [Hướng Dẫn Deployment](./05-deployment/deployment-guide.md)
- [Checklist Deployment](./05-deployment/deployment-checklist.md)
- [Vercel Deployment](./05-deployment/vercel.md)
- [Cấu Hình Environment](./05-deployment/environment.md)

### [06. Analysis](./06-analysis/README.md)
Phân tích codebase và performance metrics.

- [Phân Tích Codebase](./06-analysis/codebase-analysis.md)
- [Tasks Đã Hoàn Thành](./06-analysis/completed-tasks.md)

### [Archive](./archive/README.md)
Documentation lịch sử từ các giai đoạn development và migration.

- Tài liệu development đã archive
- Files theo dõi tasks cũ
- Build logs và summaries

## 🚀 Links Nhanh

### Cho Developers Mới
1. [Hướng Dẫn Cài Đặt](./01-getting-started/installation.md) - Cài đặt môi trường development
2. [Quy Trình Development](./01-getting-started/development.md) - Học quy trình development
3. [Tổng Quan Architecture](./02-architecture/README.md) - Hiểu kiến trúc hệ thống

### Cho Contributors
1. [Hexagonal Architecture](./04-implementation/hexagonal-architecture.md) - Backend patterns
2. [GraphQL Code Generation](./04-implementation/graphql-codegen.md) - Type generation
3. [Git Hooks](./04-implementation/git-hooks.md) - Tự động hóa code quality

### Cho Administrators
1. [Hướng Dẫn Cài Đặt Admin](./01-getting-started/admin-setup.md) - Cấu hình admin access
2. [Hướng Dẫn Deployment](./05-deployment/README.md) - Deploy lên production

## 🏗️ Tổng Quan Project

**VizTechStack** là nền tảng học tập tương tác giúp users khám phá và theo dõi technology learning roadmaps thông qua graph-based visualization.

### Features Chính
- 🗺️ Visualization roadmap tương tác
- 📊 Theo dõi progress
- 📚 Quản lý content
- 🔐 Authentication & authorization
- ⭐ Hệ thống bookmark

### Tech Stack
- **Frontend**: Next.js 16.1.6, React 19.2.3, TypeScript 5.7
- **Backend**: NestJS 11.0.1, GraphQL (Apollo Server 5.4.0)
- **Database**: Convex (serverless)
- **Monorepo**: pnpm workspaces với Turbo 2.4.0

## 📖 Commands Thường Dùng

```bash
# Development
pnpm dev                    # Start tất cả services
pnpm dev --filter @viztechstack/web    # Chỉ Frontend
pnpm dev --filter @viztechstack/api    # Chỉ Backend

# Code Quality
pnpm lint                   # Lint tất cả packages
pnpm typecheck              # Type check
pnpm format                 # Format code
pnpm test                   # Chạy tests

# Code Generation
pnpm codegen                # Generate GraphQL types
pnpm codegen:watch          # Watch mode

# Utility Scripts
pnpm generate:module <name>    # Generate backend module
pnpm generate:feature <name>   # Generate frontend feature
pnpm validate:deps             # Kiểm tra circular dependencies
pnpm analyze:bundle            # Phân tích bundle size

# Building
pnpm build                  # Build tất cả packages
```

## 🤝 Contributing

### Format Commit Message

Tuân theo [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

Ví dụ:
feat(roadmap): add bookmark functionality
fix(api): resolve circular dependency
docs(readme): update installation instructions
```

### Quy Trình Development

1. Tạo feature branch: `git checkout -b feature/feature-name`
2. Thực hiện changes và commit: `git commit -m "feat: description"`
3. Push và tạo PR: `git push origin feature/feature-name`
4. Đợi review và CI checks
5. Merge vào main

### Code Quality

- Pre-commit hooks chạy linting và type checking
- Commit messages được validate
- Tất cả tests phải pass
- Duy trì test coverage ≥ 25%

## 📞 Hỗ Trợ

- **Issues**: Báo cáo bugs hoặc request features qua GitHub Issues
- **Discussions**: Đặt câu hỏi trong GitHub Discussions
- **Documentation**: Kiểm tra documentation này trước

## 📄 License

[Thêm thông tin license ở đây]

---

**Cập Nhật Lần Cuối**: 2026-03-08  
**Phiên Bản**: 1.0.0
