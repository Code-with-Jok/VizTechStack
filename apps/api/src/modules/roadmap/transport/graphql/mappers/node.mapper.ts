import type {
  NodeEntity,
  NodeData,
  NodePosition,
} from '../../../domain/entities/node.entity';
import type {
  Node,
  Position,
  NodeData as NodeDataGraphQL,
} from '../schemas/node.schema';

/**
 * Maps a NodeEntity to GraphQL Node type
 */
export function mapNodeEntityToGraphQL(entity: NodeEntity): Node {
  return {
    id: entity.id,
    type: entity.type,
    position: mapPositionToGraphQL(entity.position),
    data: mapNodeDataToGraphQL(entity.data),
  };
}

/**
 * Maps an array of NodeEntity to GraphQL Node array
 */
export function mapNodeEntitiesToGraphQL(entities: NodeEntity[]): Node[] {
  return entities.map(mapNodeEntityToGraphQL);
}

/**
 * Maps NodePosition to GraphQL Position type
 */
function mapPositionToGraphQL(position: NodePosition): Position {
  return {
    x: position.x,
    y: position.y,
  };
}

/**
 * Maps NodeData to GraphQL NodeData type
 */
function mapNodeDataToGraphQL(data: NodeData): NodeDataGraphQL {
  return {
    label: data.label,
    topicId: data.topicId ?? undefined,
    isReusedSkillNode: data.isReusedSkillNode ?? undefined,
    originalRoadmapId: data.originalRoadmapId ?? undefined,
  };
}
