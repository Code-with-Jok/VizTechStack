# VizTechStack API

GraphQL API backend cho VizTechStack - nền tảng trực quan hóa roadmap công nghệ.

## Tech Stack

- **Framework**: NestJS 11.0.1
- **GraphQL**: Apollo Server 5.4.0 (code-first approach)
- **Authentication**: Clerk JWT validation
- **Database**: Convex (serverless database)
- **Testing**: Jest 30.0.0

## Quick Start

```bash
# Install dependencies
pnpm install

# Development
pnpm dev --filter @viztechstack/api

# Build
pnpm build --filter @viztechstack/api

# Run tests
pnpm test --filter @viztechstack/api
```

## API Endpoints

- **GraphQL API**: `http://localhost:3001/graphql`
- **GraphQL Playground**: `http://localhost:3001/graphql` (dev only)
- **Swagger Documentation**: `http://localhost:3001/api` (dev only)

## Documentation

Xem [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) để biết chi tiết về:

- GraphQL Schema
- Queries và Mutations
- Authentication & Authorization
- Error Handling
- Examples

## Features

### Roadmap Management

- ✅ CRUD operations cho roadmaps
- ✅ Role-based access control (Admin/User/Guest)
- ✅ Public read access cho published roadmaps
- ✅ Admin-only write operations

### Authentication & Authorization

- ✅ Clerk JWT authentication
- ✅ ClerkAuthGuard cho protected endpoints
- ✅ RolesGuard cho role-based authorization
- ✅ @Public decorator cho public endpoints
- ✅ @CurrentUser decorator để extract user context

## Project Structure

```
apps/api/
├── src/
│   ├── common/
│   │   ├── convex/          # Convex service wrapper
│   │   ├── decorators/      # Custom decorators (@Public, @Roles, @CurrentUser)
│   │   └── guards/          # Auth guards (ClerkAuthGuard, RolesGuard)
│   ├── modules/
│   │   ├── health/          # Health check module
│   │   ├── ping/            # Ping module
│   │   └── roadmap/         # Roadmap CRUD module
│   │       ├── domain/      # Domain models
│   │       ├── application/ # Services
│   │       └── transport/   # GraphQL resolvers & schemas
│   ├── app.module.ts
│   └── main.ts
├── test/
│   └── e2e/                 # E2E tests
└── API_DOCUMENTATION.md     # Detailed API docs
```

## Testing

```bash
# Unit tests
pnpm test --filter @viztechstack/api

# E2E tests
pnpm test:e2e --filter @viztechstack/api

# Test coverage
pnpm test:cov --filter @viztechstack/api
```

### Test Coverage

- ✅ 69 unit tests (RoadmapService, RoadmapResolver)
- ✅ 13 property-based tests (100 iterations each)
- ✅ 18 E2E tests (CRUD workflows, access control)

## Environment Variables

```env
# Server
PORT=3001
NODE_ENV=development

# Clerk Authentication
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_JWT_ISSUER_DOMAIN=https://your-domain.clerk.accounts.dev

# Convex Database
CONVEX_URL=https://your-convex-url.convex.cloud

# CORS
WEB_APP_ORIGIN=http://localhost:3000
```

## GraphQL Schema

### Queries (Public)

```graphql
roadmaps: [Roadmap!]!
roadmap(slug: String!): Roadmap
```

### Mutations (Admin Only)

```graphql
createRoadmap(input: CreateRoadmapInput!): String!
updateRoadmap(input: UpdateRoadmapInput!): String!
deleteRoadmap(id: String!): String!
```

## Development

### Adding New Features

1. Create module in `src/modules/`
2. Define domain models in `domain/models/`
3. Implement service in `application/services/`
4. Create GraphQL schemas in `transport/graphql/schemas/`
5. Implement resolver in `transport/graphql/resolvers/`
6. Register module in `app.module.ts`
7. Write tests

### Code Quality

```bash
# Linting
pnpm lint --filter @viztechstack/api

# Type checking
pnpm typecheck --filter @viztechstack/api

# Format code
pnpm format --filter @viztechstack/api
```

## Deployment

API được deploy trên Vercel as serverless functions.

```bash
# Build for production
pnpm build --filter @viztechstack/api

# Start production server
pnpm start --filter @viztechstack/api
```

## Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [GraphQL Documentation](https://graphql.org/learn/)
- [Apollo Server Documentation](https://www.apollographql.com/docs/apollo-server/)
- [Clerk Documentation](https://clerk.com/docs)
- [Convex Documentation](https://docs.convex.dev)

## License

MIT
