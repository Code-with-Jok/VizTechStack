import type { BookmarkEntity } from '../../../domain/entities/bookmark.entity';
import type { Bookmark } from '../schemas/bookmark.schema';

/**
 * Maps a BookmarkEntity to GraphQL Bookmark type
 */
export function mapBookmarkEntityToGraphQL(entity: BookmarkEntity): Bookmark {
  return {
    id: entity.id,
    userId: entity.userId,
    roadmapId: entity.roadmapId,
  };
}

/**
 * Maps an array of BookmarkEntity to GraphQL Bookmark array
 */
export function mapBookmarkEntitiesToGraphQL(
  entities: BookmarkEntity[],
): Bookmark[] {
  return entities.map(mapBookmarkEntityToGraphQL);
}
