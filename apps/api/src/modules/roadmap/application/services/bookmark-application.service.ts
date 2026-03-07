import { Inject, Injectable } from '@nestjs/common';
import { AddBookmarkCommand } from '../commands/add-bookmark.command';
import { RemoveBookmarkCommand } from '../commands/remove-bookmark.command';
import { GetUserBookmarksQuery } from '../queries/get-user-bookmarks.query';
import { BOOKMARK_REPOSITORY } from '../ports/bookmark.repository';
import type { BookmarkRepository } from '../ports/bookmark.repository';
import { BookmarkEntity } from '../../domain/entities/bookmark.entity';
import { RoadmapValidationDomainError } from '../../domain/errors/roadmap-domain-error';

/**
 * Application service for bookmark operations
 * Orchestrates bookmark-related use cases using repositories
 * Implements use cases: add bookmark, remove bookmark, retrieve user bookmarks
 */
@Injectable()
export class BookmarkApplicationService {
  constructor(
    @Inject(BOOKMARK_REPOSITORY)
    private readonly bookmarkRepository: BookmarkRepository,
  ) {}

  /**
   * Adds a bookmark for a user and roadmap
   * Operation is idempotent - adding the same bookmark multiple times results in one record
   * @param command - Add bookmark command with user ID and roadmap ID
   * @returns Created bookmark entity
   * @throws RoadmapValidationDomainError if validation fails
   */
  async addBookmark(command: AddBookmarkCommand): Promise<BookmarkEntity> {
    // Validate required fields
    if (!command.userId || command.userId.trim().length === 0) {
      throw new RoadmapValidationDomainError(
        'User ID is required and cannot be empty.',
        'addBookmark',
      );
    }

    if (!command.roadmapId || command.roadmapId.trim().length === 0) {
      throw new RoadmapValidationDomainError(
        'Roadmap ID is required and cannot be empty.',
        'addBookmark',
      );
    }

    // Normalize string fields and create bookmark entity
    const bookmarkToCreate: Omit<BookmarkEntity, 'id'> = {
      userId: command.userId.trim(),
      roadmapId: command.roadmapId.trim(),
    };

    return this.bookmarkRepository.create(bookmarkToCreate);
  }

  /**
   * Removes a bookmark for a user and roadmap
   * @param command - Remove bookmark command with user ID and roadmap ID
   * @throws RoadmapValidationDomainError if validation fails
   */
  async removeBookmark(command: RemoveBookmarkCommand): Promise<void> {
    // Validate required fields
    if (!command.userId || command.userId.trim().length === 0) {
      throw new RoadmapValidationDomainError(
        'User ID is required and cannot be empty.',
        'removeBookmark',
      );
    }

    if (!command.roadmapId || command.roadmapId.trim().length === 0) {
      throw new RoadmapValidationDomainError(
        'Roadmap ID is required and cannot be empty.',
        'removeBookmark',
      );
    }

    await this.bookmarkRepository.delete(
      command.userId.trim(),
      command.roadmapId.trim(),
    );
  }

  /**
   * Retrieves all bookmarks for a specific user
   * @param query - Query with user ID
   * @returns Array of bookmark entities
   * @throws RoadmapValidationDomainError if validation fails
   */
  async getUserBookmarks(
    query: GetUserBookmarksQuery,
  ): Promise<BookmarkEntity[]> {
    // Validate required fields
    if (!query.userId || query.userId.trim().length === 0) {
      throw new RoadmapValidationDomainError(
        'User ID is required and cannot be empty.',
        'getUserBookmarks',
      );
    }

    return this.bookmarkRepository.findByUserId(query.userId.trim());
  }
}
