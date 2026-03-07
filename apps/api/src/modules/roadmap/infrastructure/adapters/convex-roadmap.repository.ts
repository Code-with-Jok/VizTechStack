import { Injectable } from '@nestjs/common';
import { ConvexService } from '../../../../common/convex/convex.service';
import { api } from '@viztechstack/convex';
import type { Id } from '@viztechstack/convex/dataModel';
import type {
  RoadmapRepository,
  RoadmapFilters,
  PaginationInput,
} from '../../application/ports/roadmap.repository';
import type {
  RoadmapEntity,
  RoadmapPageEntity,
} from '../../domain/entities/roadmap.entity';

/**
 * Convex implementation of RoadmapRepository
 * Handles serialization/deserialization of nodesJson and edgesJson
 * Automatically creates roadmapSummary when creating a roadmap
 */
@Injectable()
export class ConvexRoadmapRepository implements RoadmapRepository {
  constructor(private readonly convexService: ConvexService) {}

  async create(roadmap: Omit<RoadmapEntity, 'id'>): Promise<RoadmapEntity> {
    const roadmapId = await this.convexService.client.mutation(
      api.roadmaps.createRoadmap,
      {
        slug: roadmap.slug,
        title: roadmap.title,
        description: roadmap.description,
        category: roadmap.category,
        difficulty: roadmap.difficulty,
        topicCount: roadmap.topicCount,
        nodesJson: roadmap.nodesJson,
        edgesJson: roadmap.edgesJson,
        status: roadmap.status,
      },
    );

    // Fetch the created roadmap to return complete entity
    const created = await this.convexService.client.query(
      api.roadmaps.getById,
      {
        id: roadmapId as Id<'roadmaps'>,
      },
    );

    if (!created) {
      throw new Error('Failed to retrieve created roadmap');
    }

    return this.mapToEntity(created);
  }

  async update(
    id: string,
    roadmap: Partial<Omit<RoadmapEntity, 'id'>>,
  ): Promise<RoadmapEntity> {
    await this.convexService.client.mutation(api.roadmaps.updateRoadmap, {
      id: id as Id<'roadmaps'>,
      slug: roadmap.slug,
      title: roadmap.title,
      description: roadmap.description,
      category: roadmap.category,
      difficulty: roadmap.difficulty,
      topicCount: roadmap.topicCount,
      nodesJson: roadmap.nodesJson,
      edgesJson: roadmap.edgesJson,
      status: roadmap.status,
    });

    // Fetch the updated roadmap
    const updated = await this.convexService.client.query(
      api.roadmaps.getById,
      {
        id: id as Id<'roadmaps'>,
      },
    );

    if (!updated) {
      throw new Error(`Roadmap with id '${id}' not found after update`);
    }

    return this.mapToEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await this.convexService.client.mutation(api.roadmaps.deleteRoadmap, {
      id: id as Id<'roadmaps'>,
    });
  }

  async findBySlug(slug: string): Promise<RoadmapEntity | null> {
    const roadmap = await this.convexService.client.query(
      api.roadmaps.getBySlug,
      {
        slug,
      },
    );

    if (!roadmap) {
      return null;
    }

    return this.mapToEntity(roadmap);
  }

  async findById(id: string): Promise<RoadmapEntity | null> {
    const roadmap = await this.convexService.client.query(
      api.roadmaps.getById,
      {
        id: id as Id<'roadmaps'>,
      },
    );

    if (!roadmap) {
      return null;
    }

    return this.mapToEntity(roadmap);
  }

  async list(
    filters: RoadmapFilters,
    pagination: PaginationInput,
    isAdmin: boolean,
  ): Promise<RoadmapPageEntity> {
    const result = await this.convexService.client.query(api.roadmaps.list, {
      category: filters.category,
      paginationOpts: {
        numItems: pagination.limit ?? 24,
        cursor: pagination.cursor ?? null,
      },
    });

    // Map roadmap summaries to full roadmap entities
    // Note: The list query returns summaries, so we need to fetch full data if needed
    // For now, we'll construct minimal entities from summaries
    const items: RoadmapEntity[] = result.page.map(
      (summary: {
        _id: string;
        slug: string;
        title: string;
        description: string;
        category: 'role' | 'skill' | 'best-practice';
        difficulty: 'beginner' | 'intermediate' | 'advanced';
        topicCount: number;
        status: 'public' | 'draft' | 'private';
      }) => ({
        id: summary._id,
        slug: summary.slug,
        title: summary.title,
        description: summary.description,
        category: summary.category,
        difficulty: summary.difficulty,
        topicCount: summary.topicCount,
        status: summary.status,
        nodesJson: '[]', // Not included in summary
        edgesJson: '[]', // Not included in summary
        createdAt: 0, // Not included in summary response
      }),
    );

    return {
      items,
      nextCursor: result.continueCursor ?? null,
      isDone: result.isDone,
    };
  }

  async findSkillRoadmaps(isAdmin: boolean): Promise<RoadmapEntity[]> {
    const roadmaps = await this.convexService.client.query(
      api.roadmaps.listSkillRoadmaps,
      {},
    );

    return roadmaps.map(
      (roadmap: {
        _id: string;
        slug: string;
        title: string;
        description: string;
        category: 'role' | 'skill' | 'best-practice';
        difficulty: 'beginner' | 'intermediate' | 'advanced';
        nodesJson: string;
        edgesJson: string;
        topicCount: number;
        status?: 'public' | 'draft' | 'private';
        createdAt?: number;
        _creationTime: number;
      }) => this.mapToEntity(roadmap),
    );
  }

  /**
   * Maps Convex document to RoadmapEntity
   * Handles the conversion of Convex _id to entity id
   */
  private mapToEntity(doc: {
    _id: string;
    slug: string;
    title: string;
    description: string;
    category: 'role' | 'skill' | 'best-practice';
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    nodesJson: string;
    edgesJson: string;
    topicCount: number;
    status?: 'public' | 'draft' | 'private';
    createdAt?: number;
    _creationTime: number;
  }): RoadmapEntity {
    return {
      id: doc._id,
      slug: doc.slug,
      title: doc.title,
      description: doc.description,
      category: doc.category,
      difficulty: doc.difficulty,
      nodesJson: doc.nodesJson,
      edgesJson: doc.edgesJson,
      topicCount: doc.topicCount,
      status: doc.status ?? 'public',
      createdAt: doc.createdAt ?? doc._creationTime,
    };
  }
}
