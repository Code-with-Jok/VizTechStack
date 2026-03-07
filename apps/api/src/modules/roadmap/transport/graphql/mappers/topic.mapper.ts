import type {
  TopicEntity,
  ResourceEntity,
} from '../../../domain/entities/topic.entity';
import type { Topic, Resource, ResourceType } from '../schemas/topic.schema';

/**
 * Maps a TopicEntity to GraphQL Topic type
 */
export function mapTopicEntityToGraphQL(entity: TopicEntity): Topic {
  return {
    id: entity.id,
    roadmapId: entity.roadmapId,
    nodeId: entity.nodeId,
    title: entity.title,
    content: entity.content,
    resources: mapResourceEntitiesToGraphQL(entity.resources),
  };
}

/**
 * Maps an array of ResourceEntity to GraphQL Resource array
 */
function mapResourceEntitiesToGraphQL(entities: ResourceEntity[]): Resource[] {
  return entities.map(mapResourceEntityToGraphQL);
}

/**
 * Maps a ResourceEntity to GraphQL Resource type
 */
function mapResourceEntityToGraphQL(entity: ResourceEntity): Resource {
  return {
    title: entity.title,
    url: entity.url,
    type: entity.type as ResourceType,
  };
}
