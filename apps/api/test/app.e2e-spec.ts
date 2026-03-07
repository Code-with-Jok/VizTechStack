import { ExecutionContext, Injectable } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { GqlExecutionContext } from '@nestjs/graphql';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { ClerkAuthGuard } from '../src/common/guards/clerk-auth.guard';
import { ROADMAP_REPOSITORY } from '../src/modules/roadmap/application/ports/roadmap.repository';
import type { RoadmapRepository } from '../src/modules/roadmap/application/ports/roadmap.repository';

interface GraphQLRequestContext {
  req: {
    headers: Record<string, string | string[] | undefined>;
    user?: {
      id: string;
      role: string;
    };
  };
}

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

@Injectable()
class TestClerkAuthGuard {
  canActivate(context: ExecutionContext): boolean {
    const gqlContext =
      GqlExecutionContext.create(context).getContext<GraphQLRequestContext>();
    const roleHeader = gqlContext.req.headers['x-test-role'];
    const role = Array.isArray(roleHeader) ? roleHeader[0] : roleHeader;

    gqlContext.req.user = {
      id: 'test-user',
      role: typeof role === 'string' ? role : 'user',
    };

    return true;
  }
}

describe('Roadmap GraphQL (e2e)', () => {
  let app: INestApplication<App>;
  let repository: jest.Mocked<RoadmapRepository>;
  let listMock: jest.MockedFunction<RoadmapRepository['list']>;
  let findBySlugMock: jest.MockedFunction<RoadmapRepository['findBySlug']>;
  let createMock: jest.MockedFunction<RoadmapRepository['create']>;

  const roadmapEntity = {
    id: 'roadmap_1',
    slug: 'frontend-engineer',
    title: 'Frontend Engineer',
    description: 'Frontend roadmap',
    category: 'role' as const,
    difficulty: 'beginner' as const,
    nodesJson: '[]',
    edgesJson: '[]',
    topicCount: 12,
    status: 'public' as const,
    createdAt: Date.now(),
  };

  beforeAll(() => {
    process.env.NODE_ENV = 'test';
    process.env.CONVEX_DEPLOYMENT ??= 'dev:test-deployment';
    process.env.CONVEX_URL ??= 'https://dummy.convex.cloud';
    process.env.CLERK_JWT_ISSUER_DOMAIN ??= 'https://dummy.clerk.accounts.dev';
    process.env.WEB_APP_ORIGIN ??= 'http://localhost:3000';
  });

  beforeEach(async () => {
    listMock = jest.fn();
    findBySlugMock = jest.fn();
    createMock = jest.fn();

    repository = {
      list: listMock,
      findBySlug: findBySlugMock,
      create: createMock,
      update: jest.fn(),
      delete: jest.fn(),
      findById: jest.fn(),
      findSkillRoadmaps: jest.fn(),
    } as jest.Mocked<RoadmapRepository>;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ROADMAP_REPOSITORY)
      .useValue(repository)
      .overrideGuard(ClerkAuthGuard)
      .useClass(TestClerkAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('lists roadmaps through GraphQL page query', async () => {
    listMock.mockResolvedValue({
      items: [roadmapEntity],
      nextCursor: null,
      isDone: true,
    });

    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
        query ListRoadmaps($input: RoadmapPageInput) {
          getRoadmapsPage(input: $input) {
            items {
              _id
              slug
              title
            }
            nextCursor
            hasMore
          }
        }
      `,
        variables: {
          input: {
            limit: 1,
          },
        },
      });

    const body = toGraphQLResponse<{
      getRoadmapsPage: {
        items: Array<{ _id: string; slug: string; title: string }>;
        nextCursor: string | null;
        hasMore: boolean;
      };
    }>(response.body as unknown);

    expect(response.status).toBe(200);
    expect(body.errors).toBeUndefined();
    expect(body.data?.getRoadmapsPage).toEqual({
      items: [
        {
          _id: 'roadmap_1',
          slug: 'frontend-engineer',
          title: 'Frontend Engineer',
        },
      ],
      nextCursor: null,
      hasMore: false,
    });
  });

  it('gets roadmap detail by slug', async () => {
    findBySlugMock.mockResolvedValue(roadmapEntity);

    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
        query GetRoadmapBySlug($slug: String!) {
          getRoadmapBySlug(slug: $slug) {
            _id
            slug
            title
          }
        }
      `,
        variables: {
          slug: 'frontend-engineer',
        },
      });

    const body = toGraphQLResponse<{
      getRoadmapBySlug: { _id: string; slug: string; title: string } | null;
    }>(response.body as unknown);

    expect(response.status).toBe(200);
    expect(body.errors).toBeUndefined();
    expect(body.data?.getRoadmapBySlug).toEqual({
      _id: 'roadmap_1',
      slug: 'frontend-engineer',
      title: 'Frontend Engineer',
    });
  });

  it('creates roadmap when requester has admin role', async () => {
    createMock.mockResolvedValue(roadmapEntity);

    const response = await request(app.getHttpServer())
      .post('/graphql')
      .set('x-test-role', 'admin')
      .send({
        query: `
          mutation CreateRoadmap($input: CreateRoadmapInput!) {
            createRoadmap(input: $input)
          }
        `,
        variables: {
          input: {
            slug: 'frontend-engineer',
            title: 'Frontend Engineer',
            description: 'Frontend roadmap',
            category: 'ROLE',
            difficulty: 'INTERMEDIATE',
            topicCount: 12,
            status: 'PUBLIC',
          },
        },
      });

    const body = toGraphQLResponse<{ createRoadmap: string }>(
      response.body as unknown,
    );

    expect(response.status).toBe(200);
    expect(body.errors).toBeUndefined();
    expect(body.data?.createRoadmap).toBe('roadmap_1');
    expect(createMock).toHaveBeenCalledTimes(1);
  });

  it('rejects create roadmap when requester is not admin', async () => {
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .set('x-test-role', 'user')
      .send({
        query: `
          mutation CreateRoadmap($input: CreateRoadmapInput!) {
            createRoadmap(input: $input)
          }
        `,
        variables: {
          input: {
            slug: 'frontend-engineer',
            title: 'Frontend Engineer',
            description: 'Frontend roadmap',
            category: 'ROLE',
            difficulty: 'INTERMEDIATE',
            topicCount: 12,
            status: 'PUBLIC',
          },
        },
      });

    const body = toGraphQLResponse<{ createRoadmap: string }>(
      response.body as unknown,
    );

    expect(response.status).toBe(200);
    expect(body.data).toBeNull();
    expect(body.errors).toBeDefined();
    expect(body.errors?.[0]?.message).toContain('Insufficient permissions');
    expect(createMock).not.toHaveBeenCalled();
  });
});
