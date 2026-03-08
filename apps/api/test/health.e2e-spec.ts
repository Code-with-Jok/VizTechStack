import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Health (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('should return health status via GraphQL', () => {
        const query = `
      query {
        health {
          status
          timestamp
          services {
            name
            status
            responseTime
          }
        }
      }
    `;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        return request(app.getHttpServer())
            .post('/graphql')
            .send({ query })
            .expect(200)
            .expect((res: request.Response) => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                expect(res.body.data).toBeDefined();
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                expect(res.body.data.health).toBeDefined();
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                expect(res.body.data.health.status).toMatch(
                    /^(healthy|unhealthy|HEALTHY|UNHEALTHY)$/i,
                );
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                expect(res.body.data.health.timestamp).toBeDefined();
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                expect(res.body.data.health.services).toBeInstanceOf(Array);
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                expect(res.body.data.health.services.length).toBeGreaterThan(0);

                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
                const convexService = res.body.data.health.services.find(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
                    (s: any) => s.name === 'convex',
                );

                expect(convexService).toBeDefined();
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                expect(convexService.status).toMatch(/^(up|down|UP|DOWN)$/i);
            });
    });

    it('should be accessible without authentication (public endpoint)', () => {
        const query = `
      query {
        health {
          status
        }
      }
    `;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        return request(app.getHttpServer())
            .post('/graphql')
            .send({ query })
            .expect(200);
    });
});
