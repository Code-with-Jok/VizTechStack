import type { EdgeEntity } from '../../../domain/entities/edge.entity';
import type { Edge } from '../schemas/edge.schema';

/**
 * Maps an EdgeEntity to GraphQL Edge type
 */
export function mapEdgeEntityToGraphQL(entity: EdgeEntity): Edge {
  return {
    id: entity.id,
    source: entity.source,
    target: entity.target,
    type: entity.type ?? undefined,
  };
}

/**
 * Maps an array of EdgeEntity to GraphQL Edge array
 */
export function mapEdgeEntitiesToGraphQL(entities: EdgeEntity[]): Edge[] {
  return entities.map(mapEdgeEntityToGraphQL);
}
