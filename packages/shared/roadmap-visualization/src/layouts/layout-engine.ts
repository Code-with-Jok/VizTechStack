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
 * Apply the specified layout algorithm to graph data
 * 
 * @param graphData - Graph data containing nodes and edges
 * @param layoutType - Type of layout to apply
 * @param options - Layout configuration options
 * @returns Layout result with positioned nodes
 */
export function applyLayoutAlgorithm(
    graphData: { nodes: RoadmapNode[]; edges: RoadmapEdge[] },
    layoutType: LayoutType,
    options: LayoutOptions = {}
): RoadmapNode[] {
    // Validate inputs
    if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
        return [];
    }

    try {
        switch (layoutType) {
            case 'hierarchical':
                const hierarchicalResult = applyHierarchicalLayout(graphData, options);
                return hierarchicalResult.nodes;

            case 'force':
                const forceResult = applyForceDirectedLayout(graphData, options);
                return forceResult.nodes;

            case 'circular':
                const circularResult = applyCircularLayout(graphData, options);
                return circularResult.nodes;

            case 'grid':
                const gridResult = applyGridLayout(graphData, options);
                return gridResult.nodes;

            default:
                // Fallback to hierarchical layout
                console.warn(`Unknown layout type: ${layoutType}. Falling back to hierarchical.`);
                const fallbackResult = applyHierarchicalLayout(graphData, options);
                return fallbackResult.nodes;
        }
    } catch (error) {
        console.error(`Error applying ${layoutType} layout:`, error);
        // Fallback to simple grid layout on error
        try {
            const fallbackResult = applyGridLayout(graphData, options);
            return fallbackResult.nodes;
        } catch (fallbackError) {
            console.error('Fallback grid layout also failed:', fallbackError);
            return graphData.nodes; // Return original nodes as last resort
        }
    }
}
