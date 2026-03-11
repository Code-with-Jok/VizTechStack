/**
 * Grid layout algorithm
 * Arranges nodes in a simple grid pattern
 */

import type { RoadmapNode, RoadmapEdge } from '../types';
import type { LayoutOptions } from './types';

/**
 * Apply grid layout to nodes
 * 
 * @param nodes - Array of roadmap nodes
 * @param edges - Array of roadmap edges (not used in grid layout)
 * @param options - Layout configuration options
 * @returns Array of nodes with calculated positions
 */
export function applyGridLayout(
    nodes: RoadmapNode[],
    edges: RoadmapEdge[],
    options: LayoutOptions = {}
): RoadmapNode[] {
    const {
        nodeWidth = 200,
        nodeHeight = 80,
        horizontalSpacing = 50,
        verticalSpacing = 100,
    } = options;

    // Calculate grid dimensions
    const columns = Math.ceil(Math.sqrt(nodes.length));
    const cellWidth = nodeWidth + horizontalSpacing;
    const cellHeight = nodeHeight + verticalSpacing;

    // Calculate starting position to center the grid
    const totalWidth = columns * cellWidth;
    const startX = -totalWidth / 2;
    const startY = 0;

    // Position nodes in grid
    return nodes.map((node, index) => {
        const row = Math.floor(index / columns);
        const col = index % columns;

        return {
            ...node,
            position: {
                x: startX + col * cellWidth,
                y: startY + row * cellHeight,
            },
        };
    });
}
