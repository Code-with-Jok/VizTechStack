/**
 * Circular layout algorithm using d3-hierarchy
 * Arranges nodes in a circular pattern
 */

import { hierarchy, tree } from 'd3-hierarchy';
import type { RoadmapNode, RoadmapEdge } from '../types';
import type { LayoutOptions } from './types';

interface HierarchyNode {
    id: string;
    children?: HierarchyNode[];
}

/**
 * Apply circular layout to nodes
 * 
 * @param nodes - Array of roadmap nodes
 * @param edges - Array of roadmap edges
 * @param options - Layout configuration options
 * @returns Array of nodes with calculated positions
 */
export function applyCircularLayout(
    nodes: RoadmapNode[],
    edges: RoadmapEdge[],
    options: LayoutOptions = {}
): RoadmapNode[] {
    if (nodes.length === 0) return nodes;

    const radius = 400;
    const centerX = 0;
    const centerY = 0;

    // Try to build a hierarchy if possible
    const hierarchyData = buildHierarchy(nodes, edges);

    if (hierarchyData) {
        // Use hierarchical circular layout
        return applyHierarchicalCircularLayout(nodes, hierarchyData, radius, centerX, centerY);
    }

    // Fallback to simple circular layout
    return applySimpleCircularLayout(nodes, radius, centerX, centerY);
}

/**
 * Build hierarchy from nodes and edges
 */
function buildHierarchy(
    nodes: RoadmapNode[],
    edges: RoadmapEdge[]
): HierarchyNode | null {
    // Find root nodes (nodes with no incoming edges)
    const targetIds = new Set(edges.map((e) => e.target));
    const rootNodes = nodes.filter((n) => !targetIds.has(n.id));

    if (rootNodes.length === 0) return null;

    // Build adjacency map
    const childrenMap = new Map<string, string[]>();
    edges.forEach((edge) => {
        if (!childrenMap.has(edge.source)) {
            childrenMap.set(edge.source, []);
        }
        childrenMap.get(edge.source)!.push(edge.target);
    });

    // Build hierarchy recursively
    function buildNode(nodeId: string, visited: Set<string>): HierarchyNode | null {
        if (visited.has(nodeId)) return null; // Prevent cycles
        visited.add(nodeId);

        const children = childrenMap.get(nodeId) || [];
        const childNodes = children
            .map((childId) => buildNode(childId, new Set(visited)))
            .filter((n): n is HierarchyNode => n !== null);

        return {
            id: nodeId,
            children: childNodes.length > 0 ? childNodes : undefined,
        };
    }

    // Use first root as the main root
    return buildNode(rootNodes[0].id, new Set());
}

/**
 * Apply hierarchical circular layout using d3-hierarchy
 */
function applyHierarchicalCircularLayout(
    nodes: RoadmapNode[],
    hierarchyData: HierarchyNode,
    radius: number,
    centerX: number,
    centerY: number
): RoadmapNode[] {
    // Create hierarchy
    const root = hierarchy(hierarchyData);

    // Create tree layout
    const treeLayout = tree<HierarchyNode>()
        .size([2 * Math.PI, radius])
        .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth);

    // Apply layout
    treeLayout(root);

    // Create position map
    const positionMap = new Map<string, { x: number; y: number }>();

    root.each((d) => {
        // Convert polar coordinates to Cartesian
        // d.x and d.y can be undefined in d3-hierarchy types
        const angle = d.x ?? 0;
        const r = d.y ?? 0;
        const x = centerX + r * Math.cos(angle - Math.PI / 2);
        const y = centerY + r * Math.sin(angle - Math.PI / 2);

        positionMap.set(d.data.id, { x, y });
    });

    // Update node positions
    return nodes.map((node) => {
        const position = positionMap.get(node.id);
        if (position) {
            return { ...node, position };
        }
        // Fallback for nodes not in hierarchy
        return node;
    });
}

/**
 * Apply simple circular layout (all nodes on one circle)
 */
function applySimpleCircularLayout(
    nodes: RoadmapNode[],
    radius: number,
    centerX: number,
    centerY: number
): RoadmapNode[] {
    const angleStep = (2 * Math.PI) / nodes.length;

    return nodes.map((node, index) => {
        const angle = index * angleStep;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        return {
            ...node,
            position: { x, y },
        };
    });
}
