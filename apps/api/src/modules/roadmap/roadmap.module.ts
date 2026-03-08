import { Module } from '@nestjs/common';

// Application Layer - Services
import { RoadmapApplicationService } from './application/services/roadmap-application.service';

// Application Layer - Ports (Repository Interfaces)
import { ROADMAP_REPOSITORY } from './application/ports/roadmap.repository';

// Domain Layer - Policies
import { RoadmapInputPolicy } from './domain/policies/roadmap-input.policy';

// Infrastructure Layer - Adapters (Repository Implementations)
import { ConvexRoadmapRepository } from './infrastructure/adapters/convex-roadmap.repository';

// Transport Layer - GraphQL Resolvers
import { RoadmapResolver } from './transport/graphql/resolvers/roadmap.resolver';

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

    // Application Services (Application Layer)
    RoadmapApplicationService,

    // Domain Policies (Domain Layer)
    RoadmapInputPolicy,

    // Repository Bindings (Infrastructure Layer)
    // Bind repository interfaces to Convex implementations using DI tokens
    {
      provide: ROADMAP_REPOSITORY,
      useClass: ConvexRoadmapRepository,
    },
  ],
})
export class RoadmapModule {}
