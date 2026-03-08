import { Module } from '@nestjs/common';

// Application Layer - Services
import { HealthCheckService } from './application/services/health-check.service';

// Transport Layer - GraphQL Resolvers
import { HealthResolver } from './transport/graphql/resolvers/health.resolver';

/**
 * HealthModule - Health check module for monitoring
 *
 * This module provides health check endpoints for monitoring and deployment:
 * - Transport Layer: GraphQL resolver handles health check queries
 * - Application Layer: Service checks connectivity to external services
 *
 * Dependencies:
 * - ConvexModule (global): Provides database access via ConvexService
 *
 * The health endpoint is public and does not require authentication.
 */
@Module({
  providers: [
    // GraphQL Resolver (Transport Layer)
    HealthResolver,

    // Application Service (Application Layer)
    HealthCheckService,
  ],
  exports: [HealthCheckService],
})
export class HealthModule {}
