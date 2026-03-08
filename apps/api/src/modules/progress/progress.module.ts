import { Module } from '@nestjs/common';

// Application Layer - Services
import { ProgressApplicationService } from './application/services/progress-application.service';

// Application Layer - Ports (Repository Interfaces)
import { PROGRESS_REPOSITORY } from './application/ports/progress.repository';

// Infrastructure Layer - Adapters (Repository Implementations)
import { ConvexProgressRepository } from './infrastructure/adapters/convex-progress.repository';

// Transport Layer - GraphQL Resolvers
import { ProgressResolver } from './transport/graphql/resolvers/progress.resolver';

/**
 * ProgressModule - Module for progress tracking
 *
 * This module implements the progress tracking feature using hexagonal architecture:
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
    ProgressResolver,

    // Application Services (Application Layer)
    ProgressApplicationService,

    // Repository Bindings (Infrastructure Layer)
    {
      provide: PROGRESS_REPOSITORY,
      useClass: ConvexProgressRepository,
    },
  ],
})
export class ProgressModule {}
