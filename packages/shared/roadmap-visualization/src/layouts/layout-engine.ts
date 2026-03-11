/**
 * Layout engine - Main entry point for applying layouts
 * Provides a unified interface for all layout algorithms
 */

import type { RoadmapNode, RoadmapEdge, LayoutType } from '../types';
import type { LayoutOptions } from './types';
import { applyHierarchicalLayout } from './hierarchical-layout';
import { applyForceDirectedLayout } from './force-directed-layout';
import { applyCircularLayout } from './circular-layout';
import { applyGridLayout } from './grid-layout';

/**
 * Apply the specified layout algorithm to nodes
 * 
 * @param nodes - Array of roadmap nodes
 * @param edges - Array of roadmap edges
 * @param layoutType - Type of layout to apply
 * @param options - Layout configuration options
 * @returns Array of nodes with calculated positions
 */
export function applyLayoutAlgorithm(
    nodes: RoadmapNode[],
    edges: RoadmapEdge[],
    layoutType: LayoutType,
    options: LayoutOptions = {}
): RoadmapNode[] {
    // Validate inputs
    if (!nodes || nodes.length === 0) {
        return [];
    }

    try {
        switch (layoutType) {
            case 'hierarchical':
                return applyHierarchicalLayout(nodes, edges, options);

            case 'force':
                return applyForceDirectedLayout(nodes, edges, options);

            case 'circular':
                return applyCircularLayout(nodes, edges, options);

            case 'grid':
                return applyGridLayout(nodes, edges, options);

            default:
                // Fallback to hierarchical layout
                console.warn(`Unknown layout type: ${layoutType}. Falling back to hierarchical.`);
                return applyHierarchicalLayout(nodes, edges, options);
        }
    } catch (error) {
        console.error(`Error applying ${layoutType} layout:`, error);
        // Fallback to simple grid layout on error
        return applyGridLayout(nodes, edges, options);
    }
}
