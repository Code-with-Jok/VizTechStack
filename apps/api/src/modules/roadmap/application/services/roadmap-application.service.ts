import { Inject, Injectable } from '@nestjs/common';
import { CreateRoadmapCommand } from '../commands/create-roadmap.command';
import { ROADMAP_REPOSITORY } from '../ports/roadmap.repository';
import type { RoadmapRepository } from '../ports/roadmap.repository';
import { GetRoadmapBySlugQuery } from '../queries/get-roadmap-by-slug.query';
import { ListRoadmapsQuery } from '../queries/list-roadmaps.query';
import {
  RoadmapEntity,
  RoadmapPageEntity,
} from '../../domain/entities/roadmap.entity';
import { RoadmapValidationDomainError } from '../../domain/errors/roadmap-domain-error';
import {
  validateCreateRoadmapInput,
  validateRoadmapSlug,
} from '../../domain/policies/roadmap-input.policy';

@Injectable()
export class RoadmapApplicationService {
  constructor(
    @Inject(ROADMAP_REPOSITORY)
    private readonly roadmapRepository: RoadmapRepository,
  ) {}

  listRoadmaps(query: ListRoadmapsQuery): Promise<RoadmapPageEntity> {
    const limit = query.limit ?? 24;
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      throw new RoadmapValidationDomainError(
        'Limit must be an integer between 1 and 100.',
        'listRoadmaps',
      );
    }

    const cursor = query.cursor ?? null;
    if (cursor !== null && cursor.trim().length === 0) {
      throw new RoadmapValidationDomainError(
        'Cursor must not be an empty string.',
        'listRoadmaps',
      );
    }

    return this.roadmapRepository.listRoadmaps({
      category: query.category,
      limit,
      cursor,
    });
  }

  async getRoadmapBySlug(
    query: GetRoadmapBySlugQuery,
  ): Promise<RoadmapEntity | null> {
    const normalizedSlug = query.slug.trim();
    if (normalizedSlug.length === 0) {
      throw new RoadmapValidationDomainError(
        'Slug must not be empty.',
        'getRoadmapBySlug',
      );
    }

    validateRoadmapSlug(normalizedSlug, 'getRoadmapBySlug');
    return this.roadmapRepository.getRoadmapBySlug({ slug: normalizedSlug });
  }

  async createRoadmap(command: CreateRoadmapCommand): Promise<string> {
    const normalizedCommand: CreateRoadmapCommand = {
      ...command,
      slug: command.slug.trim(),
      title: command.title.trim(),
      description: command.description.trim(),
    };

    validateCreateRoadmapInput(normalizedCommand);

    return this.roadmapRepository.createRoadmap(normalizedCommand);
  }
}
