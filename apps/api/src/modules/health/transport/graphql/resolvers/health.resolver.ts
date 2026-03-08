import { Query, Resolver } from '@nestjs/graphql';
import { Public } from '../../../../../common/decorators/public.decorator';
import { HealthCheckService } from '../../../application/services/health-check.service';
import { HealthStatus } from '../schemas/health.schema';

@Resolver(() => HealthStatus)
export class HealthResolver {
  constructor(private readonly healthCheckService: HealthCheckService) {}

  @Query(() => HealthStatus)
  @Public()
  async health(): Promise<HealthStatus> {
    return this.healthCheckService.checkHealth();
  }
}
