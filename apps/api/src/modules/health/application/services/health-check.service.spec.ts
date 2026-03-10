import { Test, TestingModule } from '@nestjs/testing';
import { HealthCheckService } from './health-check.service';
import {
  HealthStatusEnum,
  ServiceStatus,
} from '../../transport/graphql/schemas/health.schema';

describe('HealthCheckService', () => {
  let service: HealthCheckService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HealthCheckService],
    }).compile();

    service = module.get<HealthCheckService>(HealthCheckService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkHealth', () => {
    it('should return healthy API status', () => {
      const result = service.checkHealth();

      expect(result.status).toBe(HealthStatusEnum.HEALTHY);
      expect(result.services).toHaveLength(1);
      expect(result.services[0].name).toBe('api');
      expect(result.services[0].status).toBe(ServiceStatus.UP);
      expect(result.services[0].responseTime).toBe(0);
      expect(result.timestamp).toBeDefined();
    });

    it('should return ISO timestamp', () => {
      const result = service.checkHealth();

      expect(result.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );
    });
  });
});
