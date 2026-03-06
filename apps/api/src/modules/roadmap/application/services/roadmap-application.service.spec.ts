import { RoadmapApplicationService } from './roadmap-application.service';
import type { RoadmapRepository } from '../ports/roadmap.repository';
import type {
  RoadmapEntity,
  RoadmapPageEntity,
} from '../../domain/entities/roadmap.entity';
import { RoadmapValidationDomainError } from '../../domain/errors/roadmap-domain-error';

describe('RoadmapApplicationService', () => {
  let service: RoadmapApplicationService;
  let repository: jest.Mocked<RoadmapRepository>;
  let listRoadmapsMock: jest.MockedFunction<RoadmapRepository['listRoadmaps']>;
  let getRoadmapBySlugMock: jest.MockedFunction<
    RoadmapRepository['getRoadmapBySlug']
  >;
  let createRoadmapMock: jest.MockedFunction<
    RoadmapRepository['createRoadmap']
  >;

  const roadmapSummary: RoadmapEntity = {
    id: 'roadmap_1',
    slug: 'frontend-engineer',
    title: 'Frontend Engineer',
    description: 'Frontend roadmap',
    category: 'role',
    difficulty: 'beginner',
    topicCount: 12,
    status: 'public',
  };

  beforeEach(() => {
    listRoadmapsMock = jest.fn();
    getRoadmapBySlugMock = jest.fn();
    createRoadmapMock = jest.fn();

    repository = {
      listRoadmaps: listRoadmapsMock,
      getRoadmapBySlug: getRoadmapBySlugMock,
      createRoadmap: createRoadmapMock,
    };
    service = new RoadmapApplicationService(repository);
  });

  describe('listRoadmaps', () => {
    it('uses default pagination when limit/cursor are missing', async () => {
      const page: RoadmapPageEntity = {
        items: [roadmapSummary],
        nextCursor: 'next_cursor',
        isDone: false,
      };
      listRoadmapsMock.mockResolvedValue(page);

      await expect(service.listRoadmaps({ category: 'role' })).resolves.toEqual(
        page,
      );
      expect(listRoadmapsMock).toHaveBeenCalledWith({
        category: 'role',
        limit: 24,
        cursor: null,
      });
    });

    it('throws validation error when limit is out of range', () => {
      expect(() => service.listRoadmaps({ limit: 0 })).toThrow(
        RoadmapValidationDomainError,
      );
    });

    it('throws validation error when cursor is blank', () => {
      expect(() => service.listRoadmaps({ cursor: '   ' })).toThrow(
        RoadmapValidationDomainError,
      );
    });
  });

  describe('getRoadmapBySlug', () => {
    it('trims slug before delegating to repository', async () => {
      getRoadmapBySlugMock.mockResolvedValue(roadmapSummary);

      await expect(
        service.getRoadmapBySlug({ slug: ' frontend-engineer ' }),
      ).resolves.toEqual(roadmapSummary);
      expect(getRoadmapBySlugMock).toHaveBeenCalledWith({
        slug: 'frontend-engineer',
      });
    });

    it('throws validation error for invalid slug format', async () => {
      await expect(
        service.getRoadmapBySlug({ slug: 'Frontend Engineer' }),
      ).rejects.toThrow(RoadmapValidationDomainError);
    });
  });

  describe('createRoadmap', () => {
    it('normalizes create command and delegates to repository', async () => {
      createRoadmapMock.mockResolvedValue('roadmap_1');

      await expect(
        service.createRoadmap({
          slug: ' frontend-engineer ',
          title: ' Frontend Engineer ',
          description: ' Frontend roadmap ',
          category: 'role',
          difficulty: 'intermediate',
          nodesJson: '[]',
          edgesJson: '[]',
          topicCount: 20,
          status: 'public',
        }),
      ).resolves.toBe('roadmap_1');

      expect(createRoadmapMock).toHaveBeenCalledWith({
        slug: 'frontend-engineer',
        title: 'Frontend Engineer',
        description: 'Frontend roadmap',
        category: 'role',
        difficulty: 'intermediate',
        nodesJson: '[]',
        edgesJson: '[]',
        topicCount: 20,
        status: 'public',
      });
    });

    it('throws validation error when nodesJson is not a JSON array', async () => {
      await expect(
        service.createRoadmap({
          slug: 'frontend-engineer',
          title: 'Frontend Engineer',
          description: 'Frontend roadmap',
          category: 'role',
          difficulty: 'intermediate',
          nodesJson: '{}',
          edgesJson: '[]',
          topicCount: 20,
          status: 'public',
        }),
      ).rejects.toThrow(RoadmapValidationDomainError);
    });
  });
});
