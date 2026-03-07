import type { ProgressEntity } from '../../../domain/entities/progress.entity';
import type { Progress } from '../schemas/progress.schema';

/**
 * Maps a ProgressEntity to GraphQL Progress type
 */
export function mapProgressEntityToGraphQL(entity: ProgressEntity): Progress {
  return {
    id: entity.id,
    userId: entity.userId,
    roadmapId: entity.roadmapId,
    nodeId: entity.nodeId,
    status: entity.status as any,
  };
}

/**
 * Maps an array of ProgressEntity to GraphQL Progress array
 */
export function mapProgressEntitiesToGraphQL(
  entities: ProgressEntity[],
): Progress[] {
  return entities.map(mapProgressEntityToGraphQL);
}
