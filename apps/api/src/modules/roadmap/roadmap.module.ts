import { Module } from '@nestjs/common';

// Application Layer - Services
import { RoadmapApplicationService } from './application/services/roadmap-application.service';
import { TopicApplicationService } from './application/services/topic-application.service';
import { ProgressApplicationService } from './application/services/progress-application.service';
import { BookmarkApplicationService } from './application/services/bookmark-application.service';

// Application Layer - Ports (Repository Interfaces)
import { ROADMAP_REPOSITORY } from './application/ports/roadmap.repository';
import { TOPIC_REPOSITORY } from './application/ports/topic.repository';
import { PROGRESS_REPOSITORY } from './application/ports/progress.repository';
import { BOOKMARK_REPOSITORY } from './application/ports/bookmark.repository';

// Domain Layer - Policies
import { RoadmapInputPolicy } from './domain/policies/roadmap-input.policy';

// Infrastructure Layer - Adapters (Repository Implementations)
import { ConvexRoadmapRepository } from './infrastructure/adapters/convex-roadmap.repository';
import { ConvexTopicRepository } from './infrastructure/adapters/convex-topic.repository';
import { ConvexProgressRepository } from './infrastructure/adapters/convex-progress.repository';
import { ConvexBookmarkRepository } from './infrastructure/adapters/convex-bookmark.repository';

// Transport Layer - GraphQL Resolvers
import { RoadmapResolver } from './transport/graphql/resolvers/roadmap.resolver';
import { TopicResolver } from './transport/graphql/resolvers/topic.resolver';
import { ProgressResolver } from './transport/graphql/resolvers/progress.resolver';
import { BookmarkResolver } from './transport/graphql/resolvers/bookmark.resolver';

/**
 * RoadmapModule - Core module for roadmap feature
 *
 * This module implements the roadmap feature using hexagonal architecture:
 * - Transport Layer: GraphQL resolvers handle API requests
 * - Application Layer: Services orchestrate use cases
 * - Domain Layer: Entities and policies contain business logic
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
    RoadmapResolver,
    TopicResolver,
    ProgressResolver,
    BookmarkResolver,

    // Application Services (Application Layer)
    RoadmapApplicationService,
    TopicApplicationService,
    ProgressApplicationService,
    BookmarkApplicationService,

    // Domain Policies (Domain Layer)
    RoadmapInputPolicy,

    // Repository Bindings (Infrastructure Layer)
    // Bind repository interfaces to Convex implementations using DI tokens
    {
      provide: ROADMAP_REPOSITORY,
      useClass: ConvexRoadmapRepository,
    },
    {
      provide: TOPIC_REPOSITORY,
      useClass: ConvexTopicRepository,
    },
    {
      provide: PROGRESS_REPOSITORY,
      useClass: ConvexProgressRepository,
    },
    {
      provide: BOOKMARK_REPOSITORY,
      useClass: ConvexBookmarkRepository,
    },
  ],
})
export class RoadmapModule {}
