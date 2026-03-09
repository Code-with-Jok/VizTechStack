import { Module } from '@nestjs/common';
import { HealthCheckService } from './application/services/health-check.service';
import { HealthResolver } from './transport/graphql/resolvers/health.resolver';

@Module({
  providers: [HealthResolver, HealthCheckService],
  exports: [HealthCheckService],
})
export class HealthModule {}
