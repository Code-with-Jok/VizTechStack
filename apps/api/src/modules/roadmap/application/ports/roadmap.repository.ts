import type {
  RoadmapEntity,
  RoadmapPageEntity,
} from '../../domain/entities/roadmap.entity';

export interface RoadmapFilters {
  category?: 'role' | 'skill' | 'best-practice';
  status?: 'public' | 'draft' | 'private';
}

export interface PaginationInput {
  limit?: number;
  cursor?: string | null;
}

/**
 * Repository interface for Roadmap entity operations
 * Defines the contract for roadmap data access without implementation details
 */
export interface RoadmapRepository {
  /**
   * Creates a new roadmap
   * @param roadmap - The roadmap entity to create
   * @returns The created roadmap with generated ID
   */
  create(roadmap: Omit<RoadmapEntity, 'id'>): Promise<RoadmapEntity>;

  /**
   * Updates an existing roadmap
   * @param id - The roadmap ID
   * @param roadmap - Partial roadmap data to update
   * @returns The updated roadmap entity
   */
  update(
    id: string,
    roadmap: Partial<Omit<RoadmapEntity, 'id'>>,
  ): Promise<RoadmapEntity>;

  /**
   * Deletes a roadmap by ID
   * @param id - The roadmap ID to delete
   */
  delete(id: string): Promise<void>;

  /**
   * Finds a roadmap by slug
   * @param slug - The unique slug identifier
   * @returns The roadmap entity or null if not found
   */
  findBySlug(slug: string): Promise<RoadmapEntity | null>;

  /**
   * Finds a roadmap by ID
   * @param id - The roadmap ID
   * @returns The roadmap entity or null if not found
   */
  findById(id: string): Promise<RoadmapEntity | null>;

  /**
   * Lists roadmaps with filtering and pagination
   * @param filters - Optional filters for category and status
   * @param pagination - Pagination options (limit and cursor)
   * @param isAdmin - Whether the requester is an admin (affects visibility)
   * @returns Paginated roadmap results
   */
  list(
    filters: RoadmapFilters,
    pagination: PaginationInput,
    isAdmin: boolean,
  ): Promise<RoadmapPageEntity>;

  /**
   * Finds all skill roadmaps
   * @param isAdmin - Whether the requester is an admin (affects visibility)
   * @returns Array of skill roadmap entities
   */
  findSkillRoadmaps(isAdmin: boolean): Promise<RoadmapEntity[]>;
}

/**
 * Dependency injection token for RoadmapRepository
 */
export const ROADMAP_REPOSITORY = Symbol('ROADMAP_REPOSITORY');
