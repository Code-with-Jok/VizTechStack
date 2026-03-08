import { Module } from '@nestjs/common';

// Application Layer - Services
import { TopicApplicationService } from './application/services/topic-application.service';

// Application Layer - Ports (Repository Interfaces)
import { TOPIC_REPOSITORY } from './application/ports/topic.repository';

// Infrastructure Layer - Adapters (Repository Implementations)
import { ConvexTopicRepository } from './infrastructure/adapters/convex-topic.repository';

// Transport Layer - GraphQL Resolvers
import { TopicResolver } from './transport/graphql/resolvers/topic.resolver';

/**
 * TopicModule - Module for topic content management
 *
 * This module implements the topic feature using hexagonal architecture:
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
    TopicResolver,

    // Application Services (Application Layer)
    TopicApplicationService,

    // Repository Bindings (Infrastructure Layer)
    {
      provide: TOPIC_REPOSITORY,
      useClass: ConvexTopicRepository,
    },
  ],
})
export class TopicModule {}
