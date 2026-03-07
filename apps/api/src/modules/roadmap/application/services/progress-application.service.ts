import { Inject, Injectable } from '@nestjs/common';
import { UpdateProgressCommand } from '../commands/update-progress.command';
import { GetProgressQuery } from '../queries/get-progress.query';
import { PROGRESS_REPOSITORY } from '../ports/progress.repository';
import type { ProgressRepository } from '../ports/progress.repository';
import { ProgressEntity } from '../../domain/entities/progress.entity';
import { RoadmapValidationDomainError } from '../../domain/errors/roadmap-domain-error';

/**
 * Application service for progress tracking operations
 * Orchestrates progress-related use cases using repositories
 * Implements use cases: update progress, retrieve progress for roadmap
 */
@Injectable()
export class ProgressApplicationService {
  constructor(
    @Inject(PROGRESS_REPOSITORY)
    private readonly progressRepository: ProgressRepository,
  ) {}

  /**
   * Updates user progress for a specific node in a roadmap
   * Creates a new progress record or updates existing one (upsert)
   * @param command - Update progress command with user ID, roadmap ID, node ID, and status
   * @returns Updated or created progress entity
   * @throws RoadmapValidationDomainError if validation fails
   */
  async updateProgress(
    command: UpdateProgressCommand,
  ): Promise<ProgressEntity> {
    // Validate required fields
    if (!command.userId || command.userId.trim().length === 0) {
      throw new RoadmapValidationDomainError(
        'User ID is required and cannot be empty.',
        'updateProgress',
      );
    }

    if (!command.roadmapId || command.roadmapId.trim().length === 0) {
      throw new RoadmapValidationDomainError(
        'Roadmap ID is required and cannot be empty.',
        'updateProgress',
      );
    }

    if (!command.nodeId || command.nodeId.trim().length === 0) {
      throw new RoadmapValidationDomainError(
        'Node ID is required and cannot be empty.',
        'updateProgress',
      );
    }

    // Validate status
    const validStatuses = ['done', 'in-progress', 'skipped'];
    if (!validStatuses.includes(command.status)) {
      throw new RoadmapValidationDomainError(
        `Invalid progress status: must be one of ${validStatuses.join(', ')}`,
        'updateProgress',
      );
    }

    // Normalize string fields and create progress entity
    const progressToUpsert: Omit<ProgressEntity, 'id'> = {
      userId: command.userId.trim(),
      roadmapId: command.roadmapId.trim(),
      nodeId: command.nodeId.trim(),
      status: command.status,
    };

    return this.progressRepository.upsert(progressToUpsert);
  }

  /**
   * Retrieves all progress records for a specific user and roadmap
   * @param query - Query with user ID and roadmap ID
   * @returns Array of progress entities
   * @throws RoadmapValidationDomainError if validation fails
   */
  async getProgressForRoadmap(
    query: GetProgressQuery,
  ): Promise<ProgressEntity[]> {
    // Validate required fields
    if (!query.userId || query.userId.trim().length === 0) {
      throw new RoadmapValidationDomainError(
        'User ID is required and cannot be empty.',
        'getProgressForRoadmap',
      );
    }

    if (!query.roadmapId || query.roadmapId.trim().length === 0) {
      throw new RoadmapValidationDomainError(
        'Roadmap ID is required and cannot be empty.',
        'getProgressForRoadmap',
      );
    }

    return this.progressRepository.findByUserAndRoadmap(
      query.userId.trim(),
      query.roadmapId.trim(),
    );
  }
}
