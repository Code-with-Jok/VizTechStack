import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

interface GraphQLErrorPayload {
  message: string;
}

interface GraphQLResponse<TData> {
  data: TData | null;
  errors?: GraphQLErrorPayload[];
}

function toGraphQLResponse<TData>(payload: unknown): GraphQLResponse<TData> {
  return payload as GraphQLResponse<TData>;
}

describe('Application (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(() => {
    process.env.NODE_ENV = 'test';
    process.env.CLERK_JWT_ISSUER_DOMAIN ??= 'https://dummy.clerk.accounts.dev';
    process.env.WEB_APP_ORIGIN ??= 'http://localhost:3000';
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('returns the hello message on GET /', async () => {
    const response = await request(app.getHttpServer()).get('/');

    expect(response.status).toBe(200);
    expect(response.text).toBe('Hello World!');
  });

  it('returns ping on GraphQL', async () => {
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
        query Ping {
          ping
        }
      `,
      });

    const body = toGraphQLResponse<{ ping: string }>(response.body as unknown);

    expect(response.status).toBe(200);
    expect(body.errors).toBeUndefined();
    expect(body.data?.ping).toBe('pong');
  });

  it('returns health on GraphQL', async () => {
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
        query Health {
          health {
            status
            services {
              name
              status
              responseTime
            }
          }
        }
      `,
      });

    const body = toGraphQLResponse<{
      health: {
        status: string;
        services: Array<{
          name: string;
          status: string;
          responseTime: number;
        }>;
      };
    }>(response.body as unknown);

    expect(response.status).toBe(200);
    expect(body.errors).toBeUndefined();
    expect(body.data?.health.status).toBe('HEALTHY');
    expect(body.data?.health.services).toEqual([
      {
        name: 'api',
        status: 'UP',
        responseTime: 0,
      },
    ]);
  });
});
