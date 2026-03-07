import type {
  RoadmapCategory,
  RoadmapDifficulty,
  RoadmapStatus,
} from '@viztechstack/types';
import type { NodeEntity } from './node.entity';
import type { EdgeEntity } from './edge.entity';

export type { RoadmapCategory, RoadmapDifficulty, RoadmapStatus };

export interface RoadmapEntity {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: RoadmapCategory;
  difficulty: RoadmapDifficulty;
  nodesJson: string;
  edgesJson: string;
  topicCount: number;
  status: RoadmapStatus;
  createdAt: number;
}

export interface RoadmapPageEntity {
  items: RoadmapEntity[];
  nextCursor: string | null;
  isDone: boolean;
}

/**
 * Serializes an array of nodes to a JSON string
 * @param nodes - Array of NodeEntity objects
 * @returns JSON string representation of nodes
 */
export function serializeNodes(nodes: NodeEntity[]): string {
  return JSON.stringify(nodes);
}

/**
 * Parses a JSON string into an array of nodes
 * @param nodesJson - JSON string containing node data
 * @returns Array of NodeEntity objects
 * @throws Error if JSON is invalid
 */
export function parseNodes(nodesJson: string): NodeEntity[] {
  try {
    return JSON.parse(nodesJson) as NodeEntity[];
  } catch (error) {
    throw new Error(
      `Failed to parse nodesJson: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Serializes an array of edges to a JSON string
 * @param edges - Array of EdgeEntity objects
 * @returns JSON string representation of edges
 */
export function serializeEdges(edges: EdgeEntity[]): string {
  return JSON.stringify(edges);
}

/**
 * Parses a JSON string into an array of edges
 * @param edgesJson - JSON string containing edge data
 * @returns Array of EdgeEntity objects
 * @throws Error if JSON is invalid
 */
export function parseEdges(edgesJson: string): EdgeEntity[] {
  try {
    return JSON.parse(edgesJson) as EdgeEntity[];
  } catch (error) {
    throw new Error(
      `Failed to parse edgesJson: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}
