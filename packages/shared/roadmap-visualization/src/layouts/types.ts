/**
 * Types for layout algorithms
 */

import type { RoadmapNode, RoadmapEdge } from '../types';

/**
 * Options for layout algorithms
 */
export interface LayoutOptions {
    nodeWidth?: number;
    nodeHeight?: number;
    horizontalSpacing?: number;
    verticalSpacing?: number;
    rankDirection?: 'TB' | 'BT' | 'LR' | 'RL';
}

/**
 * Layout algorithm function signature
 */
export type LayoutAlgorithm = (
    nodes: RoadmapNode[],
    edges: RoadmapEdge[],
    options?: LayoutOptions
) => RoadmapNode[];
