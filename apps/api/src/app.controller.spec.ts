import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConvexService } from './common/convex/convex.service';

describe('AppController', () => {
  let appController: AppController;
  let mockConvexService: Record<string, any>;

  beforeEach(async () => {
    mockConvexService = {
      client: {
        mutation: jest.fn(),
        query: jest.fn(),
      },
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        { provide: ConvexService, useValue: mockConvexService },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
