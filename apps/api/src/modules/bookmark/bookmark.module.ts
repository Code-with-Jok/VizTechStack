import { Module } from '@nestjs/common';

// Application Layer - Services
import { BookmarkApplicationService } from './application/services/bookmark-application.service';

// Application Layer - Ports (Repository Interfaces)
import { BOOKMARK_REPOSITORY } from './application/ports/bookmark.repository';

// Infrastructure Layer - Adapters (Repository Implementations)
import { ConvexBookmarkRepository } from './infrastructure/adapters/convex-bookmark.repository';

// Transport Layer - GraphQL Resolvers
import { BookmarkResolver } from './transport/graphql/resolvers/bookmark.resolver';

/**
 * BookmarkModule - Module for bookmark management
 *
 * This module implements the bookmark feature using hexagonal architecture:
 * - Transport Layer: GraphQL resolvers handle API requests
 * - Application Layer: Services orchestrate use cases
 * - Domain Layer: Entities contain business logic
 * - Infrastructure Layer: Repositories handle data persistence
 *
 * Dependencies:
 * - ConvexModule (global): Provides database access via ConvexService
 * - ClerkAuthGuard: Applied at resolver level for authentication
 * - RolesGuard: Applied at resolver level for authorization
 * - RoadmapDomainExceptionFilter: Applied at resolver level for error handling
 */
@Module({
  providers: [
    // GraphQL Resolvers (Transport Layer)
    BookmarkResolver,

    // Application Services (Application Layer)
    BookmarkApplicationService,

    // Repository Bindings (Infrastructure Layer)
    {
      provide: BOOKMARK_REPOSITORY,
      useClass: ConvexBookmarkRepository,
    },
  ],
})
export class BookmarkModule {}
