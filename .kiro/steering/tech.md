---
inclusion: always
---

# Tech Stack

## Monorepo Setup

- **Package Manager**: pnpm 9.15.0 with workspaces
- **Build System**: Turbo 2.4.0 for build orchestration and caching
- **Node Version**: >= 20.11.0

## Frontend (apps/web)

- **Framework**: Next.js 16.1.6 with App Router
- **React**: 19.2.3 (Server and Client Components)
- **TypeScript**: 5.7
- **Styling**: Tailwind CSS 4 with shadcn/ui components
- **Visualization**: React Flow (@xyflow/react) for graph rendering
- **Authentication**: Clerk for user management
- **GraphQL Client**: Apollo Client 3.8.8

## Backend (apps/api)

- **Framework**: NestJS 11.0.1
- **GraphQL**: Apollo Server 5.4.0 with code-first approach
- **Authentication**: Clerk JWT validation with @clerk/backend
- **Testing**: Jest 30.0.0

## Database

- **Platform**: Convex (serverless database with real-time sync)
- **Schema**: TypeScript-first with built-in validation

## Shared Packages

- **@viztechstack/types**: Zod schemas and type definitions
- **@viztechstack/validation**: Runtime validation utilities
- **@viztechstack/graphql-schema**: GraphQL schema definitions
- **@viztechstack/graphql-generated**: Auto-generated types and Zod schemas
- **@viztechstack/api-client**: Type-safe GraphQL client with hooks
- **@viztechstack/env**: Environment variable validation

## Code Generation

- **GraphQL Codegen**: Generates TypeScript types and Zod schemas from GraphQL schema
- **Config**: codegen.ts in root directory
- **Source**: packages/shared/graphql-schema/src/**/*.graphql

## Common Commands

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

# Cleanup
pnpm clean                  # Clean build artifacts
```

## Git Hooks

- **pre-commit**: Runs linting and type checking
- **commit-msg**: Validates commit messages using commitlint (conventional commits)

## Deployment

- **Platform**: Vercel
- **Web App**: Automatic deployment from main branch
- **API**: Serverless functions on Vercel
- **Database**: Convex Cloud (managed)
