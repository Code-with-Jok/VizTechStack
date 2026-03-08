import { Injectable } from '@nestjs/common';
import { ConvexService } from '../../../../common/convex/convex.service';
import {
  HealthStatus,
  ServiceHealth,
  ServiceStatus,
  HealthStatusEnum,
} from '../../transport/graphql/schemas/health.schema';

@Injectable()
export class HealthCheckService {
  constructor(private readonly convexService: ConvexService) { }

  async checkHealth(): Promise<HealthStatus> {
    const services: ServiceHealth[] = [];
    let overallStatus: HealthStatusEnum = HealthStatusEnum.HEALTHY;

    // Check Convex database connectivity
    const convexHealth = await this.checkConvexHealth();
    services.push(convexHealth);

    if (convexHealth.status === ServiceStatus.DOWN) {
      overallStatus = HealthStatusEnum.UNHEALTHY;
    }

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      services,
    };
  }

  private async checkConvexHealth(): Promise<ServiceHealth> {
    const startTime = Date.now();

    try {
      // Attempt a simple query to verify Convex connectivity
      // Using a lightweight query that should always work
      await this.convexService.client.query('ping:ping' as never);

      const responseTime = Date.now() - startTime;

      return {
        name: 'convex',
        status: ServiceStatus.UP,
        responseTime,
      };
    } catch {
      return {
        name: 'convex',
        status: ServiceStatus.DOWN,
        responseTime: undefined,
      };
    }
  }
}
