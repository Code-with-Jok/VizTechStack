import type { ProgressEntity } from '../../domain/entities/progress.entity';

/**
 * Repository interface for Progress entity operations
 * Defines the contract for progress tracking data access without implementation details
 */
export interface ProgressRepository {
  /**
   * Creates or updates a progress record (upsert operation)
   * If a progress record exists for the same user, roadmap, and node, it updates the status
   * Otherwise, it creates a new progress record
   * @param progress - The progress entity to upsert
   * @returns The created or updated progress entity
   */
  upsert(progress: Omit<ProgressEntity, 'id'>): Promise<ProgressEntity>;

  /**
   * Finds all progress records for a specific user and roadmap
   * @param userId - The user ID
   * @param roadmapId - The roadmap ID
   * @returns Array of progress entities
   */
  findByUserAndRoadmap(
    userId: string,
    roadmapId: string,
  ): Promise<ProgressEntity[]>;
}

/**
 * Dependency injection token for ProgressRepository
 */
export const PROGRESS_REPOSITORY = Symbol('PROGRESS_REPOSITORY');
