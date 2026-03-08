import { Test, TestingModule } from '@nestjs/testing';
import { HealthResolver } from './health.resolver';
import { HealthCheckService } from '../../../application/services/health-check.service';
import { HealthStatusEnum, ServiceStatus } from '../schemas/health.schema';

describe('HealthResolver', () => {
  let resolver: HealthResolver;
  let healthCheckService: HealthCheckService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthResolver,
        {
          provide: HealthCheckService,
          useValue: {
            checkHealth: jest.fn(),
          },
        },
      ],
    }).compile();

    resolver = module.get<HealthResolver>(HealthResolver);
    healthCheckService = module.get<HealthCheckService>(HealthCheckService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('health', () => {
    it('should return health status', async () => {
      const mockHealthStatus = {
        status: HealthStatusEnum.HEALTHY,
        timestamp: new Date().toISOString(),
        services: [
          {
            name: 'convex',
            status: ServiceStatus.UP,
            responseTime: 50,
          },
        ],
      };

      const checkHealthSpy = jest
        .spyOn(healthCheckService, 'checkHealth')
        .mockResolvedValue(mockHealthStatus);

      const result = await resolver.health();

      expect(result).toEqual(mockHealthStatus);
      expect(checkHealthSpy).toHaveBeenCalledTimes(1);
    });

    it('should return unhealthy status when services are down', async () => {
      const mockHealthStatus = {
        status: HealthStatusEnum.UNHEALTHY,
        timestamp: new Date().toISOString(),
        services: [
          {
            name: 'convex',
            status: ServiceStatus.DOWN,
            responseTime: undefined,
          },
        ],
      };

      const checkHealthSpy = jest
        .spyOn(healthCheckService, 'checkHealth')
        .mockResolvedValue(mockHealthStatus);

      const result = await resolver.health();

      expect(result.status).toBe(HealthStatusEnum.UNHEALTHY);
      expect(result.services[0].status).toBe(ServiceStatus.DOWN);
      expect(checkHealthSpy).toHaveBeenCalled();
    });
  });
});
