import { Module } from '@nestjs/common';
import { RoadmapResolver } from './transport/graphql/resolvers/roadmap.resolver';
import { RoadmapDocsController } from './transport/rest/controllers/roadmap-docs.controller';
import { RoadmapService } from './application/services/roadmap.service';
import { ConvexService } from '../../common/convex/convex.service';
import { ClerkService } from '../../common/clerk/clerk.service';

/**
 * RoadmapModule - NestJS module for roadmap feature
 *
 * This module encapsulates all roadmap-related functionality including:
 * - GraphQL resolver for queries and mutations
 * - REST controller for Swagger documentation
 * - Application service for business logic
 * - Convex service for database operations
 *
 * The module exports RoadmapService to allow other modules to use roadmap
 * functionality if needed in the future.
 *
 * Providers:
 * - RoadmapResolver: Handles GraphQL requests with role-based authorization
 * - RoadmapDocsController: Provides Swagger documentation for GraphQL operations
 * - RoadmapService: Implements CRUD operations with validation and error handling
 * - ConvexService: Provides connection to Convex database
 *
 * Requirements: 7.2, 7.3, 7.4, 7.5
 */
@Module({
  controllers: [RoadmapDocsController],
  providers: [RoadmapResolver, RoadmapService, ConvexService, ClerkService],
  exports: [RoadmapService],
})
export class RoadmapModule {}
