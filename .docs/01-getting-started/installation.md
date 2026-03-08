# Installation Guide

This guide provides detailed instructions for setting up the VizTechStack development environment.

## Prerequisites

### Required Software

- **Node.js**: >= 20.11.0
  - Download from [nodejs.org](https://nodejs.org/)
  - Verify: `node --version`

- **pnpm**: 9.15.0
  - Install: `npm install -g pnpm@9.15.0`
  - Verify: `pnpm --version`

- **Git**: Latest version
  - Download from [git-scm.com](https://git-scm.com/)
  - Verify: `git --version`

### Optional Tools

- **VS Code**: Recommended IDE with extensions:
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features
  - GraphQL: Language Feature Support

## Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd viztechstack
```

### 2. Install Dependencies

```bash
pnpm install
```

This will:
- Install all workspace dependencies
- Set up Git hooks (Husky)
- Link workspace packages

### 3. Environment Configuration

Create environment files:

```bash
# Copy example environment files
cp .env.example .env.local
```

Configure the following variables in `.env.local`:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Convex Database
CONVEX_DEPLOYMENT=your_convex_deployment_url
NEXT_PUBLIC_CONVEX_URL=your_convex_url

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:4000/graphql
```

### 4. Database Setup

Initialize Convex database:

```bash
cd convex
pnpm convex dev
```

This will:
- Create a new Convex project (if needed)
- Set up the database schema
- Run migrations

### 5. Verify Installation

Run the following commands to verify everything is set up correctly:

```bash
# Type checking
pnpm typecheck

# Linting
pnpm lint

# Build
pnpm build
```

All commands should complete without errors.

## Development Workflow

### Start Development Servers

```bash
# Start all services (recommended)
pnpm dev

# Or start individual services
pnpm dev --filter @viztechstack/web    # Frontend only
pnpm dev --filter @viztechstack/api    # Backend only
```

### Access the Application

- **Frontend**: http://localhost:3000
- **API GraphQL Playground**: http://localhost:4000/graphql
- **Convex Dashboard**: https://dashboard.convex.dev

## Troubleshooting

### Port Already in Use

If ports 3000 or 4000 are already in use:

```bash
# Find and kill the process using the port
# On Windows
netstat -ano | findstr :3000
taskkill /PID <process_id> /F

# On macOS/Linux
lsof -ti:3000 | xargs kill -9
```

### pnpm Install Fails

1. Clear pnpm cache:
   ```bash
   pnpm store prune
   ```

2. Delete node_modules and lockfile:
   ```bash
   rm -rf node_modules pnpm-lock.yaml
   pnpm install
   ```

### TypeScript Errors

1. Restart TypeScript server in VS Code:
   - Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS)
   - Type "TypeScript: Restart TS Server"

2. Rebuild packages:
   ```bash
   pnpm clean
   pnpm build
   ```

### Convex Connection Issues

1. Verify Convex deployment URL in `.env.local`
2. Check Convex dashboard for deployment status
3. Restart Convex dev server:
   ```bash
   cd convex
   pnpm convex dev
   ```

## Next Steps

- [Development Workflow](./development.md) - Learn about development best practices
- [Admin Setup](./admin-setup.md) - Set up admin access
- [Architecture Overview](../02-architecture/README.md) - Understand the system architecture
