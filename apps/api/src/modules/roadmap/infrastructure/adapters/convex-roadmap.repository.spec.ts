import { api } from '@viztechstack/convex';
import { ConvexRoadmapRepository } from './convex-roadmap.repository';
import type { ConvexService } from '../../../../common/convex/convex.service';
import {
  RoadmapAuthorizationDomainError,
  RoadmapInfrastructureDomainError,
  RoadmapValidationDomainError,
} from '../../domain/errors/roadmap-domain-error';

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

  describe('listRoadmaps', () => {
    it('maps paginated Convex payload into roadmap page entity', async () => {
      convexService.client.query.mockResolvedValue({
        page: [summaryPayload],
        continueCursor: 'cursor_1',
        isDone: false,
      });

      await expect(
        repository.listRoadmaps({ category: 'role', limit: 24, cursor: null }),
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

    it('falls back to legacy list payload when pagination field is unsupported', async () => {
      convexService.client.query
        .mockRejectedValueOnce(
          new Error('extra field `paginationOpts` not in the validator'),
        )
        .mockResolvedValueOnce([
          summaryPayload,
          { ...summaryPayload, _id: '2' },
        ]);

      await expect(
        repository.listRoadmaps({ limit: 1, cursor: null }),
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
          },
        ],
        nextCursor: 'legacy:1',
        isDone: false,
      });
    });
  });

  describe('getRoadmapBySlug', () => {
    it('returns null when Convex payload is null', async () => {
      convexService.client.query.mockResolvedValue(null);

      await expect(
        repository.getRoadmapBySlug({ slug: 'frontend-engineer' }),
      ).resolves.toBeNull();
    });
  });

  describe('createRoadmap', () => {
    it('maps already-exists error to validation domain error', async () => {
      convexService.client.mutation.mockRejectedValue(
        new Error('roadmap already exists'),
      );

      await expect(
        repository.createRoadmap({
          slug: 'frontend-engineer',
          title: 'Frontend Engineer',
          description: 'Frontend roadmap',
          category: 'role',
          difficulty: 'advanced',
          nodesJson: '[]',
          edgesJson: '[]',
          topicCount: 20,
          status: 'public',
        }),
      ).rejects.toBeInstanceOf(RoadmapValidationDomainError);
    });

    it('maps unauthorized error to authorization domain error', async () => {
      convexService.client.mutation.mockRejectedValue(
        new Error('Unauthorized'),
      );

      await expect(
        repository.createRoadmap({
          slug: 'frontend-engineer',
          title: 'Frontend Engineer',
          description: 'Frontend roadmap',
          category: 'role',
          difficulty: 'advanced',
          nodesJson: '[]',
          edgesJson: '[]',
          topicCount: 20,
          status: 'public',
        }),
      ).rejects.toBeInstanceOf(RoadmapAuthorizationDomainError);
    });

    it('throws infrastructure error when Convex returns non-string id', async () => {
      convexService.client.mutation.mockResolvedValue({ id: 'roadmap_1' });

      await expect(
        repository.createRoadmap({
          slug: 'frontend-engineer',
          title: 'Frontend Engineer',
          description: 'Frontend roadmap',
          category: 'role',
          difficulty: 'advanced',
          nodesJson: '[]',
          edgesJson: '[]',
          topicCount: 20,
          status: 'public',
        }),
      ).rejects.toBeInstanceOf(RoadmapInfrastructureDomainError);
    });
  });
});
