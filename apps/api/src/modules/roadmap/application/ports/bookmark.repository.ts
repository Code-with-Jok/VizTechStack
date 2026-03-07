import type { BookmarkEntity } from '../../domain/entities/bookmark.entity';

/**
 * Repository interface for Bookmark entity operations
 * Defines the contract for bookmark data access without implementation details
 */
export interface BookmarkRepository {
  /**
   * Creates a new bookmark
   * Ensures uniqueness per user-roadmap combination (idempotent operation)
   * @param bookmark - The bookmark entity to create
   * @returns The created bookmark with generated ID
   */
  create(bookmark: Omit<BookmarkEntity, 'id'>): Promise<BookmarkEntity>;

  /**
   * Deletes a bookmark for a specific user and roadmap
   * @param userId - The user ID
   * @param roadmapId - The roadmap ID
   */
  delete(userId: string, roadmapId: string): Promise<void>;

  /**
   * Finds all bookmarks for a specific user
   * @param userId - The user ID
   * @returns Array of bookmark entities
   */
  findByUserId(userId: string): Promise<BookmarkEntity[]>;
}

/**
 * Dependency injection token for BookmarkRepository
 */
export const BOOKMARK_REPOSITORY = Symbol('BOOKMARK_REPOSITORY');
