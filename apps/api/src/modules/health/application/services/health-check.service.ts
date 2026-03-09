import { Injectable } from '@nestjs/common';
import {
  HealthStatus,
  HealthStatusEnum,
  ServiceHealth,
  ServiceStatus,
} from '../../transport/graphql/schemas/health.schema';

@Injectable()
export class HealthCheckService {
  checkHealth(): HealthStatus {
    return {
      status: HealthStatusEnum.HEALTHY,
      timestamp: new Date().toISOString(),
      services: [this.getApiHealth()],
    };
  }

  private getApiHealth(): ServiceHealth {
    return {
      name: 'api',
      status: ServiceStatus.UP,
      responseTime: 0,
    };
  }
}
