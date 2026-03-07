import type {
  RoadmapEntity,
  RoadmapPageEntity,
} from '../../../domain/entities/roadmap.entity';
import {
  parseNodes,
  parseEdges,
} from '../../../domain/entities/roadmap.entity';
import { RoadmapParsingDomainError } from '../../../domain/errors/roadmap-domain-error';
import { mapNodeEntitiesToGraphQL } from './node.mapper';
import { mapEdgeEntitiesToGraphQL } from './edge.mapper';
import type {
  Roadmap,
  RoadmapPage,
  RoadmapCategory,
  RoadmapDifficulty,
  RoadmapStatus,
} from '../schemas/roadmap.schema';

/**
 * Maps a RoadmapEntity to GraphQL Roadmap type
 * Parses nodesJson and edgesJson strings into arrays
 *
 * @throws RoadmapParsingDomainError if JSON parsing fails
 */
export function mapRoadmapEntityToGraphQL(entity: RoadmapEntity): Roadmap {
  try {
    const nodes = parseNodes(entity.nodesJson);
    const edges = parseEdges(entity.edgesJson);

    return {
      id: entity.id,
      slug: entity.slug,
      title: entity.title,
      description: entity.description,
      category: entity.category as RoadmapCategory,
      difficulty: entity.difficulty as RoadmapDifficulty,
      nodes: mapNodeEntitiesToGraphQL(nodes),
      edges: mapEdgeEntitiesToGraphQL(edges),
      topicCount: entity.topicCount,
      status: entity.status as RoadmapStatus,
      createdAt: entity.createdAt,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new RoadmapParsingDomainError(
        `Failed to parse roadmap graph data for roadmap ${entity.slug} (${entity.id}): ${error.message}`,
        'mapRoadmapEntityToGraphQL',
      );
    }
    throw new RoadmapParsingDomainError(
      `Failed to parse roadmap graph data for roadmap ${entity.slug} (${entity.id}): Unknown error`,
      'mapRoadmapEntityToGraphQL',
    );
  }
}

/**
 * Maps a RoadmapPageEntity to GraphQL RoadmapPage type
 * Parses all roadmaps in the page
 *
 * @throws RoadmapParsingDomainError if any roadmap JSON parsing fails
 */
export function mapRoadmapPageEntityToGraphQL(
  entity: RoadmapPageEntity,
): RoadmapPage {
  return {
    items: entity.items.map(mapRoadmapEntityToGraphQL),
    nextCursor: entity.nextCursor,
    isDone: entity.isDone,
  };
}
