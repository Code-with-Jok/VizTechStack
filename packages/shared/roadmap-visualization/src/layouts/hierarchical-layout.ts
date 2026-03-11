/**
 * Hierarchical layout algorithm using dagre
 * Arranges nodes in a top-down hierarchy based on their relationships
 */

import dagre from 'dagre';
import type { RoadmapNode, RoadmapEdge } from '../types';
import type { LayoutOptions } from './types';

/**
 * Apply hierarchical layout to nodes using dagre
 * 
 * @param nodes - Array of roadmap nodes
 * @param edges - Array of roadmap edges
 * @param options - Layout configuration options
 * @returns Array of nodes with calculated positions
 */
export function applyHierarchicalLayout(
    nodes: RoadmapNode[],
    edges: RoadmapEdge[],
    options: LayoutOptions = {}
): RoadmapNode[] {
    const {
        nodeWidth = 200,
        nodeHeight = 80,
        horizontalSpacing = 50,
        verticalSpacing = 100,
        rankDirection = 'TB',
    } = options;

    // Create a new directed graph
    const graph = new dagre.graphlib.Graph();

    // Set graph configuration
    graph.setGraph({
        rankdir: rankDirection,
        nodesep: horizontalSpacing,
        ranksep: verticalSpacing,
        marginx: 50,
        marginy: 50,
    });

    // Set default edge configuration
    graph.setDefaultEdgeLabel(() => ({}));

    // Add nodes to the graph
    nodes.forEach((node) => {
        graph.setNode(node.id, {
            width: nodeWidth,
            height: nodeHeight,
            label: node.data.label,
        });
    });

    // Add edges to the graph
    edges.forEach((edge) => {
        graph.setEdge(edge.source, edge.target);
    });

    // Calculate layout
    dagre.layout(graph);

    // Update node positions based on dagre calculations
    const positionedNodes = nodes.map((node) => {
        const nodeWithPosition = graph.node(node.id);

        return {
            ...node,
            position: {
                // Center the node on the calculated position
                x: nodeWithPosition.x - nodeWidth / 2,
                y: nodeWithPosition.y - nodeHeight / 2,
            },
        };
    });

    return positionedNodes;
}
