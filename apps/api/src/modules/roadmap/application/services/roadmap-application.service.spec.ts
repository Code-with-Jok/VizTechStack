import { RoadmapApplicationService } from './roadmap-application.service';
import type { RoadmapRepository } from '../ports/roadmap.repository';
import type {
  RoadmapEntity,
  RoadmapPageEntity,
} from '../../domain/entities/roadmap.entity';
import {
  RoadmapValidationDomainError,
  RoadmapNotFoundDomainError,
} from '../../domain/errors/roadmap-domain-error';

describe('RoadmapApplicationService', () => {
  let service: RoadmapApplicationService;
  let repository: jest.Mocked<RoadmapRepository>;

  const roadmapEntity: RoadmapEntity = {
    id: 'roadmap_1',
    slug: 'frontend-engineer',
    title: 'Frontend Engineer',
    description: 'Frontend roadmap',
    category: 'role',
    difficulty: 'beginner',
    nodesJson: '[]',
    edgesJson: '[]',
    topicCount: 12,
    status: 'public',
    createdAt: Date.now(),
  };

  beforeEach(() => {
    repository = {
      list: jest.fn(),
      findBySlug: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findSkillRoadmaps: jest.fn(),
    } as jest.Mocked<RoadmapRepository>;

    service = new RoadmapApplicationService(repository);
  });

  describe('listRoadmaps', () => {
    it('uses default pagination when limit/cursor are missing', async () => {
      const page: RoadmapPageEntity = {
        items: [roadmapEntity],
        nextCursor: 'next_cursor',
        isDone: false,
      };
      repository.list.mockResolvedValue(page);

      await expect(service.listRoadmaps({ category: 'role' })).resolves.toEqual(
        page,
      );

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repository.list).toHaveBeenCalledWith(
        { category: 'role' },
        { limit: 24, cursor: null },
        false,
      );
    });

    it('passes isAdmin flag to repository', async () => {
      const page: RoadmapPageEntity = {
        items: [roadmapEntity],
        nextCursor: null,
        isDone: true,
      };
      repository.list.mockResolvedValue(page);

      await service.listRoadmaps({ category: 'role', isAdmin: true });

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repository.list).toHaveBeenCalledWith(
        { category: 'role' },
        { limit: 24, cursor: null },
        true,
      );
    });

    it('throws validation error when limit is out of range', async () => {
      await expect(service.listRoadmaps({ limit: 0 })).rejects.toThrow(
        RoadmapValidationDomainError,
      );
    });

    it('throws validation error when cursor is blank', async () => {
      await expect(service.listRoadmaps({ cursor: '   ' })).rejects.toThrow(
        RoadmapValidationDomainError,
      );
    });
  });

  describe('getRoadmapBySlug', () => {
    it('trims slug before delegating to repository', async () => {
      repository.findBySlug.mockResolvedValue(roadmapEntity);

      await expect(
        service.getRoadmapBySlug({ slug: ' frontend-engineer ' }),
      ).resolves.toEqual(roadmapEntity);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repository.findBySlug).toHaveBeenCalledWith('frontend-engineer');
    });

    it('throws validation error for invalid slug format', async () => {
      await expect(
        service.getRoadmapBySlug({ slug: 'Frontend Engineer' }),
      ).rejects.toThrow(RoadmapValidationDomainError);
    });

    it('returns null when roadmap not found', async () => {
      repository.findBySlug.mockResolvedValue(null);

      await expect(
        service.getRoadmapBySlug({ slug: 'nonexistent' }),
      ).resolves.toBeNull();
    });
  });

  describe('createRoadmap', () => {
    it('normalizes create command and delegates to repository', async () => {
      repository.create.mockResolvedValue(roadmapEntity);

      const result = await service.createRoadmap({
        slug: ' frontend-engineer ',
        title: ' Frontend Engineer ',
        description: ' Frontend roadmap ',
        category: 'role',
        difficulty: 'intermediate',
        nodesJson: '[]',
        edgesJson: '[]',
        topicCount: 20,
        status: 'public',
      });

      expect(result).toEqual(roadmapEntity);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          slug: 'frontend-engineer',
          title: 'Frontend Engineer',
          description: 'Frontend roadmap',
          category: 'role',
          difficulty: 'intermediate',
          nodesJson: '[]',
          edgesJson: '[]',
          topicCount: 20,
          status: 'public',
        }),
      );
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

  describe('updateRoadmap', () => {
    it('updates roadmap with provided fields', async () => {
      repository.findById.mockResolvedValue(roadmapEntity);
      repository.update.mockResolvedValue({
        ...roadmapEntity,
        title: 'Updated Title',
      });

      const result = await service.updateRoadmap({
        id: 'roadmap_1',
        title: 'Updated Title',
      });

      expect(result.title).toBe('Updated Title');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repository.update).toHaveBeenCalledWith('roadmap_1', {
        title: 'Updated Title',
      });
    });

    it('throws error when roadmap not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.updateRoadmap({
          id: 'nonexistent',
          title: 'Updated Title',
        }),
      ).rejects.toThrow(RoadmapNotFoundDomainError);
    });

    it('validates updated fields', async () => {
      repository.findById.mockResolvedValue(roadmapEntity);

      await expect(
        service.updateRoadmap({
          id: 'roadmap_1',
          category: 'invalid' as 'role' | 'skill' | 'best-practice',
        }),
      ).rejects.toThrow(RoadmapValidationDomainError);
    });
  });

  describe('deleteRoadmap', () => {
    it('deletes roadmap by id', async () => {
      repository.findById.mockResolvedValue(roadmapEntity);
      repository.delete.mockResolvedValue(undefined);

      await service.deleteRoadmap({ id: 'roadmap_1' });

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repository.delete).toHaveBeenCalledWith('roadmap_1');
    });

    it('throws error when roadmap not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.deleteRoadmap({ id: 'nonexistent' }),
      ).rejects.toThrow(RoadmapNotFoundDomainError);
    });
  });

  describe('getSkillNodesForRoleRoadmap', () => {
    it('extracts nodes from skill roadmaps', async () => {
      const skillRoadmap: RoadmapEntity = {
        id: 'skill_1',
        slug: 'react',
        title: 'React',
        description: 'React skill',
        category: 'skill',
        difficulty: 'intermediate',
        nodesJson: JSON.stringify([
          {
            id: 'node_1',
            type: 'default',
            position: { x: 0, y: 0 },
            data: { label: 'React Basics' },
          },
        ]),
        edgesJson: '[]',
        topicCount: 5,
        status: 'public',
        createdAt: Date.now(),
      };

      repository.findSkillRoadmaps.mockResolvedValue([skillRoadmap]);

      const nodes = await service.getSkillNodesForRoleRoadmap({});

      expect(nodes).toHaveLength(1);
      expect(nodes[0].data.label).toBe('React Basics');
      expect(nodes[0].data.originalRoadmapId).toBe('skill_1');
    });

    it('handles invalid JSON gracefully', async () => {
      const invalidRoadmap: RoadmapEntity = {
        id: 'skill_1',
        slug: 'react',
        title: 'React',
        description: 'React skill',
        category: 'skill',
        difficulty: 'intermediate',
        nodesJson: 'invalid json',
        edgesJson: '[]',
        topicCount: 5,
        status: 'public',
        createdAt: Date.now(),
      };

      repository.findSkillRoadmaps.mockResolvedValue([invalidRoadmap]);

      const nodes = await service.getSkillNodesForRoleRoadmap({});

      expect(nodes).toHaveLength(0);
    });
  });
});
