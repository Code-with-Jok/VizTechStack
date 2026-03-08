import { Test, TestingModule } from '@nestjs/testing';
import { HealthCheckService } from './health-check.service';
import { ConvexService } from '../../../../common/convex/convex.service';
import {
  ServiceStatus,
  HealthStatusEnum,
} from '../../transport/graphql/schemas/health.schema';

describe('HealthCheckService', () => {
  let service: HealthCheckService;
  let convexService: ConvexService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthCheckService,
        {
          provide: ConvexService,
          useValue: {
            client: {
              query: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<HealthCheckService>(HealthCheckService);
    convexService = module.get<ConvexService>(ConvexService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkHealth', () => {
    it('should return healthy status when Convex is up', async () => {
      jest.spyOn(convexService.client, 'query').mockResolvedValue(undefined);

      const result = await service.checkHealth();

      expect(result.status).toBe(HealthStatusEnum.HEALTHY);
      expect(result.services).toHaveLength(1);
      expect(result.services[0].name).toBe('convex');
      expect(result.services[0].status).toBe(ServiceStatus.UP);
      expect(result.services[0].responseTime).toBeGreaterThanOrEqual(0);
      expect(result.timestamp).toBeDefined();
    });

    it('should return unhealthy status when Convex is down', async () => {
      jest
        .spyOn(convexService.client, 'query')
        .mockRejectedValue(new Error('Connection failed'));

      const result = await service.checkHealth();

      expect(result.status).toBe(HealthStatusEnum.UNHEALTHY);
      expect(result.services).toHaveLength(1);
      expect(result.services[0].name).toBe('convex');
      expect(result.services[0].status).toBe(ServiceStatus.DOWN);
      expect(result.services[0].responseTime).toBeUndefined();
      expect(result.timestamp).toBeDefined();
    });

    it('should return ISO timestamp', async () => {
      jest.spyOn(convexService.client, 'query').mockResolvedValue(undefined);

      const result = await service.checkHealth();

      expect(result.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );
    });
  });
});
