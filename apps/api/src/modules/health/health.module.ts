import { Module } from '@nestjs/common';
import { HealthCheckService } from './application/services/health-check.service';
import { HealthResolver } from './transport/graphql/resolvers/health.resolver';
import { HealthDocsController } from './transport/rest/controllers/health-docs.controller';

@Module({
  controllers: [HealthDocsController],
  providers: [HealthResolver, HealthCheckService],
  exports: [HealthCheckService],
})
export class HealthModule {}
