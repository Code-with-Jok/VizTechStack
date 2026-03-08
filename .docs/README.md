# VizTechStack Documentation

Welcome to the VizTechStack documentation! This guide will help you understand, develop, and deploy the interactive learning platform.

## 📚 Documentation Structure

### [01. Getting Started](./01-getting-started/README.md)
Quick start guide, installation, and development workflow.

- [Installation Guide](./01-getting-started/installation.md)
- [Development Workflow](./01-getting-started/development.md)
- [Admin Setup](./01-getting-started/admin-setup.md)

### [02. Architecture](./02-architecture/README.md)
System architecture, design decisions, and technical stack.

- [Overview](./02-architecture/overview.md)
- [Tech Stack](./02-architecture/tech-stack.md)
- [Business Logic](./02-architecture/business-logic.md)
- [Improvements](./02-architecture/improvements.md)

### [03. Features](./03-features/README.md)
Core features and their implementation details.

- [Roadmap Feature](./03-features/roadmap.md)
- [Roadmap Implementation Guide](./03-features/roadmap-implementation.md)
- [Topic Management](./03-features/topic.md)
- [Progress Tracking](./03-features/progress.md)
- [Bookmark System](./03-features/bookmark.md)
- [Authentication](./03-features/authentication.md)

### [04. Implementation](./04-implementation/README.md)
Implementation guides and technical patterns.

- [Hexagonal Architecture](./04-implementation/hexagonal-architecture.md)
- [GraphQL Code Generation](./04-implementation/graphql-codegen.md)
- [Git Hooks](./04-implementation/git-hooks.md)

### [05. Deployment](./05-deployment/README.md)
Deployment procedures and configuration.

- [Convex Database](./05-deployment/convex.md)

### [06. Analysis](./06-analysis/README.md)
Codebase analysis and performance metrics.

- [Codebase Analysis](./06-analysis/codebase-analysis.md)
- [Completed Tasks](./06-analysis/completed-tasks.md)

## 🚀 Quick Links

### For New Developers
1. [Installation Guide](./01-getting-started/installation.md) - Set up your development environment
2. [Development Workflow](./01-getting-started/development.md) - Learn the development process
3. [Architecture Overview](./02-architecture/README.md) - Understand the system architecture

### For Contributors
1. [Hexagonal Architecture](./04-implementation/hexagonal-architecture.md) - Backend patterns
2. [GraphQL Code Generation](./04-implementation/graphql-codegen.md) - Type generation
3. [Git Hooks](./04-implementation/git-hooks.md) - Code quality automation

### For Administrators
1. [Admin Setup Guide](./01-getting-started/admin-setup.md) - Configure admin access
2. [Deployment Guide](./05-deployment/README.md) - Deploy to production

## 🏗️ Project Overview

**VizTechStack** is an interactive learning platform that helps users explore and track technology learning roadmaps through graph-based visualization.

### Core Features
- 🗺️ Interactive roadmap visualization
- 📊 Progress tracking
- 📚 Content management
- 🔐 Authentication & authorization
- ⭐ Bookmark system

### Tech Stack
- **Frontend**: Next.js 16.1.6, React 19.2.3, TypeScript 5.7
- **Backend**: NestJS 11.0.1, GraphQL (Apollo Server 5.4.0)
- **Database**: Convex (serverless)
- **Monorepo**: pnpm workspaces with Turbo 2.4.0

## 📖 Common Commands

```bash
# Development
pnpm dev                    # Start all services
pnpm dev --filter @viztechstack/web    # Frontend only
pnpm dev --filter @viztechstack/api    # Backend only

# Code Quality
pnpm lint                   # Lint all packages
pnpm typecheck              # Type check
pnpm format                 # Format code
pnpm test                   # Run tests

# Code Generation
pnpm codegen                # Generate GraphQL types
pnpm codegen:watch          # Watch mode

# Utility Scripts
pnpm generate:module <name>    # Generate backend module
pnpm generate:feature <name>   # Generate frontend feature
pnpm validate:deps             # Check circular dependencies
pnpm analyze:bundle            # Analyze bundle size

# Building
pnpm build                  # Build all packages
```

## 🤝 Contributing

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

Examples:
feat(roadmap): add bookmark functionality
fix(api): resolve circular dependency
docs(readme): update installation instructions
```

### Development Workflow

1. Create feature branch: `git checkout -b feature/feature-name`
2. Make changes and commit: `git commit -m "feat: description"`
3. Push and create PR: `git push origin feature/feature-name`
4. Wait for review and CI checks
5. Merge to main

### Code Quality

- Pre-commit hooks run linting and type checking
- Commit messages are validated
- All tests must pass
- Maintain test coverage ≥ 25%

## 📞 Support

- **Issues**: Report bugs or request features via GitHub Issues
- **Discussions**: Ask questions in GitHub Discussions
- **Documentation**: Check this documentation first

## 📄 License

[Add license information here]

---

**Last Updated**: 2026-03-08  
**Version**: 1.0.0
