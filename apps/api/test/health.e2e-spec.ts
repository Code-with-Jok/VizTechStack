import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
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

describe('Health (e2e)', () => {
  let app: INestApplication;

  beforeAll(() => {
    process.env.NODE_ENV = 'test';
    process.env.CLERK_JWT_ISSUER_DOMAIN ??= 'https://dummy.clerk.accounts.dev';
    process.env.WEB_APP_ORIGIN ??= 'http://localhost:3000';
  });

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

  it('should return health status via GraphQL', async () => {
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

    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({ query })
      .expect(200);

    const body = toGraphQLResponse<{
      health: {
        status: string;
        timestamp: string;
        services: Array<{
          name: string;
          status: string;
          responseTime: number;
        }>;
      };
    }>(response.body);

    expect(body.errors).toBeUndefined();
    expect(body.data?.health.status).toBe('HEALTHY');
    expect(body.data?.health.timestamp).toBeDefined();
    expect(body.data?.health.services).toEqual([
      {
        name: 'api',
        status: 'UP',
        responseTime: 0,
      },
    ]);
  });

  it('should be accessible without authentication', async () => {
    const query = `
      query {
        health {
          status
        }
      }
    `;

    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({ query })
      .expect(200);

    const body = toGraphQLResponse<{ health: { status: string } }>(
      response.body,
    );

    expect(body.errors).toBeUndefined();
    expect(body.data?.health.status).toBe('HEALTHY');
  });
});
