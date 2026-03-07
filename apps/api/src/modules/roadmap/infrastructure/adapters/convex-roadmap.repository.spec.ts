import { api } from '@viztechstack/convex';
import { ConvexRoadmapRepository } from './convex-roadmap.repository';
import type { ConvexService } from '../../../../common/convex/convex.service';

interface MockConvexClient {
  query: jest.Mock<Promise<unknown>, [unknown, Record<string, unknown>]>;
  mutation: jest.Mock<Promise<unknown>, [unknown, Record<string, unknown>]>;
}

interface MockConvexService {
  client: MockConvexClient;
}

describe('ConvexRoadmapRepository', () => {
  let repository: ConvexRoadmapRepository;
  let convexService: MockConvexService;

  const summaryPayload = {
    _id: 'roadmap_1',
    slug: 'frontend-engineer',
    title: 'Frontend Engineer',
    description: 'Frontend roadmap',
    category: 'role' as const,
    difficulty: 'beginner' as const,
    topicCount: 10,
    status: 'public' as const,
  };

  beforeEach(() => {
    convexService = {
      client: {
        query: jest.fn<Promise<unknown>, [unknown, Record<string, unknown>]>(),
        mutation: jest.fn<
          Promise<unknown>,
          [unknown, Record<string, unknown>]
        >(),
      },
    };

    repository = new ConvexRoadmapRepository(
      convexService as unknown as ConvexService,
    );
  });

  describe('list', () => {
    it('maps paginated Convex payload into roadmap page entity', async () => {
      convexService.client.query.mockResolvedValue({
        page: [summaryPayload],
        continueCursor: 'cursor_1',
        isDone: false,
      });

      await expect(
        repository.list(
          { category: 'role' },
          { limit: 24, cursor: null },
          false,
        ),
      ).resolves.toEqual({
        items: [
          {
            id: 'roadmap_1',
            slug: 'frontend-engineer',
            title: 'Frontend Engineer',
            description: 'Frontend roadmap',
            category: 'role',
            difficulty: 'beginner',
            topicCount: 10,
            status: 'public',
            nodesJson: '[]',
            edgesJson: '[]',
            createdAt: 0,
          },
        ],
        nextCursor: 'cursor_1',
        isDone: false,
      });

      expect(convexService.client.query).toHaveBeenCalledWith(
        api.roadmaps.list,
        {
          category: 'role',
          paginationOpts: {
            numItems: 24,
            cursor: null,
          },
        },
      );
    });
  });

  describe('findBySlug', () => {
    it('returns null when Convex payload is null', async () => {
      convexService.client.query.mockResolvedValue(null);

      await expect(
        repository.findBySlug('frontend-engineer'),
      ).resolves.toBeNull();
    });
  });

  describe('create', () => {
    it('creates roadmap and returns entity', async () => {
      const roadmapId = 'roadmap_1';
      convexService.client.mutation.mockResolvedValue(roadmapId);
      convexService.client.query.mockResolvedValue({
        _id: roadmapId,
        slug: 'frontend-engineer',
        title: 'Frontend Engineer',
        description: 'Frontend roadmap',
        category: 'role',
        difficulty: 'advanced',
        nodesJson: '[]',
        edgesJson: '[]',
        topicCount: 20,
        status: 'public',
        _creationTime: Date.now(),
      });

      await expect(
        repository.create({
          slug: 'frontend-engineer',
          title: 'Frontend Engineer',
          description: 'Frontend roadmap',
          category: 'role',
          difficulty: 'advanced',
          nodesJson: '[]',
          edgesJson: '[]',
          topicCount: 20,
          status: 'public',
          createdAt: Date.now(),
        }),
      ).resolves.toMatchObject({
        id: roadmapId,
        slug: 'frontend-engineer',
        title: 'Frontend Engineer',
      });
    });
  });
});
