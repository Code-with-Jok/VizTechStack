import { Injectable } from '@nestjs/common';
import { ConvexService } from '../../../../common/convex/convex.service';
import { api } from '@viztechstack/convex';
import type { Id } from '@viztechstack/convex/dataModel';
import type { BookmarkRepository } from '../../application/ports/bookmark.repository';
import type { BookmarkEntity } from '../../domain/entities/bookmark.entity';

/**
 * Convex implementation of BookmarkRepository
 * Handles uniqueness constraint for user-roadmap combination
 */
@Injectable()
export class ConvexBookmarkRepository implements BookmarkRepository {
  constructor(private readonly convexService: ConvexService) {}

  async create(bookmark: Omit<BookmarkEntity, 'id'>): Promise<BookmarkEntity> {
    // The Convex addBookmark mutation already handles uniqueness (idempotent)
    await this.convexService.client.mutation(api.bookmarks.addBookmark, {
      roadmapId: bookmark.roadmapId as Id<'roadmaps'>,
    });

    // Fetch all bookmarks to find the created one
    const allBookmarks = await this.convexService.client.query(
      api.bookmarks.getUserBookmarks,
      {},
    );

    // Find the specific bookmark by roadmapId
    const created = allBookmarks.find(
      (b: { roadmapId: string }) => b.roadmapId === bookmark.roadmapId,
    );

    if (!created) {
      throw new Error('Failed to retrieve created bookmark');
    }

    return this.mapToEntity(created);
  }

  async delete(userId: string, roadmapId: string): Promise<void> {
    // Note: The Convex mutation uses authenticated user from context
    // The userId parameter is not directly used in the Convex mutation
    await this.convexService.client.mutation(api.bookmarks.removeBookmark, {
      roadmapId: roadmapId as Id<'roadmaps'>,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async findByUserId(_userId: string): Promise<BookmarkEntity[]> {
    // Note: The Convex query uses authenticated user from context
    // The userId parameter is not directly used in the Convex query
    const bookmarks = await this.convexService.client.query(
      api.bookmarks.getUserBookmarks,
      {},
    );

    return bookmarks.map(
      (bookmark: { _id: string; userId: string; roadmapId: string }) =>
        this.mapToEntity(bookmark),
    );
  }

  /**
   * Maps Convex document to BookmarkEntity
   * Handles the conversion of Convex _id to entity id
   */
  private mapToEntity(doc: {
    _id: string;
    userId: string;
    roadmapId: string;
  }): BookmarkEntity {
    return {
      id: doc._id,
      userId: doc.userId,
      roadmapId: doc.roadmapId,
    };
  }
}
