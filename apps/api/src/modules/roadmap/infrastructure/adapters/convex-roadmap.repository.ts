import { Injectable } from '@nestjs/common';
import { api } from '@viztechstack/convex';
import type { Doc } from '@viztechstack/convex/dataModel';
import { ConvexService } from '../../../../common/convex/convex.service';
import { CreateRoadmapCommand } from '../../application/commands/create-roadmap.command';
import { RoadmapRepository } from '../../application/ports/roadmap.repository';
import { GetRoadmapBySlugQuery } from '../../application/queries/get-roadmap-by-slug.query';
import { ListRoadmapsQuery } from '../../application/queries/list-roadmaps.query';
import {
  RoadmapEntity,
  RoadmapPageEntity,
} from '../../domain/entities/roadmap.entity';
import {
  RoadmapAuthorizationDomainError,
  RoadmapDomainError,
  RoadmapInfrastructureDomainError,
  RoadmapValidationDomainError,
} from '../../domain/errors/roadmap-domain-error';

interface RoadmapSummaryPayload {
  _id: string;
  slug: string;
  title: string;
  description: string;
  category: 'role' | 'skill' | 'best-practice';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  topicCount: number;
  status: 'public' | 'draft' | 'private';
}

interface RoadmapPaginatedPayload {
  page: RoadmapSummaryPayload[];
  continueCursor: string;
  isDone: boolean;
}

@Injectable()
export class ConvexRoadmapRepository implements RoadmapRepository {
  constructor(private readonly convexService: ConvexService) {}

  async listRoadmaps(query: ListRoadmapsQuery): Promise<RoadmapPageEntity> {
    try {
      const result: unknown = await this.convexService.client.query(
        api.roadmaps.list,
        {
          category: query.category,
          paginationOpts: {
            numItems: query.limit ?? 24,
            cursor: query.cursor ?? null,
          },
        },
      );

      if (!this.isRoadmapPaginatedPayload(result)) {
        throw new RoadmapInfrastructureDomainError(
          'Convex listRoadmaps returned an invalid paginated payload.',
          'listRoadmaps',
        );
      }

      return {
        items: result.page.map((item) =>
          this.mapRoadmapSummary(item, 'listRoadmaps'),
        ),
        nextCursor: result.isDone ? null : result.continueCursor,
        isDone: result.isDone,
      };
    } catch (error) {
      throw this.mapInfrastructureError(error, 'listRoadmaps');
    }
  }

  async getRoadmapBySlug(
    query: GetRoadmapBySlugQuery,
  ): Promise<RoadmapEntity | null> {
    try {
      const result: unknown = await this.convexService.client.query(
        api.roadmaps.getBySlug,
        {
          slug: query.slug,
        },
      );

      if (result === null) {
        return null;
      }

      return this.mapRoadmapDetail(result, 'getRoadmapBySlug');
    } catch (error) {
      throw this.mapInfrastructureError(error, 'getRoadmapBySlug');
    }
  }

  async createRoadmap(command: CreateRoadmapCommand): Promise<string> {
    try {
      const result: unknown = await this.convexService.client.mutation(
        api.roadmaps.createRoadmap,
        {
          slug: command.slug,
          title: command.title,
          description: command.description,
          category: command.category,
          difficulty: command.difficulty,
          topicCount: command.topicCount,
          nodesJson: command.nodesJson,
          edgesJson: command.edgesJson,
          status: command.status,
        },
      );

      if (typeof result !== 'string') {
        throw new RoadmapInfrastructureDomainError(
          'Convex createRoadmap returned an invalid identifier.',
          'createRoadmap',
        );
      }

      return result;
    } catch (error) {
      throw this.mapInfrastructureError(error, 'createRoadmap');
    }
  }

  private mapRoadmapDetail(payload: unknown, operation: string): RoadmapEntity {
    if (!this.isRoadmapRecord(payload)) {
      throw new RoadmapInfrastructureDomainError(
        `Convex ${operation} returned malformed roadmap data.`,
        operation,
      );
    }

    return {
      id: payload._id,
      slug: payload.slug,
      title: payload.title,
      description: payload.description,
      category: payload.category,
      difficulty: payload.difficulty,
      nodesJson: payload.nodesJson,
      edgesJson: payload.edgesJson,
      topicCount: payload.topicCount,
      status: payload.status,
    };
  }

  private mapRoadmapSummary(
    payload: unknown,
    operation: string,
  ): RoadmapEntity {
    if (!this.isRoadmapSummary(payload)) {
      throw new RoadmapInfrastructureDomainError(
        `Convex ${operation} returned malformed roadmap summary data.`,
        operation,
      );
    }

    return {
      id: payload._id,
      slug: payload.slug,
      title: payload.title,
      description: payload.description,
      category: payload.category,
      difficulty: payload.difficulty,
      topicCount: payload.topicCount,
      status: payload.status,
    };
  }

  private isRoadmapPaginatedPayload(
    payload: unknown,
  ): payload is RoadmapPaginatedPayload {
    if (typeof payload !== 'object' || payload === null) {
      return false;
    }

    const record = payload as Record<string, unknown>;
    if (
      !Array.isArray(record.page) ||
      typeof record.continueCursor !== 'string' ||
      typeof record.isDone !== 'boolean'
    ) {
      return false;
    }

    return record.page.every((item) => this.isRoadmapSummary(item));
  }

  private isRoadmapSummary(payload: unknown): payload is RoadmapSummaryPayload {
    if (typeof payload !== 'object' || payload === null) {
      return false;
    }

    const record = payload as Record<string, unknown>;

    return (
      typeof record._id === 'string' &&
      typeof record.slug === 'string' &&
      typeof record.title === 'string' &&
      typeof record.description === 'string' &&
      (record.category === 'role' ||
        record.category === 'skill' ||
        record.category === 'best-practice') &&
      (record.difficulty === 'beginner' ||
        record.difficulty === 'intermediate' ||
        record.difficulty === 'advanced') &&
      typeof record.topicCount === 'number' &&
      (record.status === 'public' ||
        record.status === 'draft' ||
        record.status === 'private')
    );
  }

  private isRoadmapRecord(payload: unknown): payload is Doc<'roadmaps'> {
    if (typeof payload !== 'object' || payload === null) {
      return false;
    }

    const record = payload as Record<string, unknown>;

    return (
      typeof record._id === 'string' &&
      typeof record.slug === 'string' &&
      typeof record.title === 'string' &&
      typeof record.description === 'string' &&
      (record.category === 'role' ||
        record.category === 'skill' ||
        record.category === 'best-practice') &&
      (record.difficulty === 'beginner' ||
        record.difficulty === 'intermediate' ||
        record.difficulty === 'advanced') &&
      typeof record.nodesJson === 'string' &&
      typeof record.edgesJson === 'string' &&
      typeof record.topicCount === 'number' &&
      (record.status === 'public' ||
        record.status === 'draft' ||
        record.status === 'private')
    );
  }

  private mapInfrastructureError(
    error: unknown,
    operation: string,
  ): RoadmapDomainError {
    if (error instanceof RoadmapDomainError) {
      return error;
    }

    const message = error instanceof Error ? error.message : String(error);

    if (message.includes('already exists')) {
      return new RoadmapValidationDomainError(message, operation);
    }

    if (
      message.includes('Unauthorized') ||
      message.includes('Unauthenticated')
    ) {
      return new RoadmapAuthorizationDomainError(message, operation);
    }

    return new RoadmapInfrastructureDomainError(message, operation);
  }
}
