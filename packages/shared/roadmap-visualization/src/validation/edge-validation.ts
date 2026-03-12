/**
 * Edge validation and relationship management
 * 
 * Implements edge validation, circular dependency detection,
 * and relationship strength calculation for graph structures.
 */

import type { RoadmapNode, RoadmapEdge, GraphData } from '../types';

/**
 * Validation result interface
 */
export interface ValidationResult {
    valid: boolean;
    errors: string[];
}

/**
 * Circular dependency detection result
 */
export interface CircularDependencyResult {
    hasCircularDependency: boolean;
    cycles: string[][]; // Array of node ID paths forming cycles
}

/**
 * Validate a single edge
 * 
 * Preconditions:
 * - edge is a valid RoadmapEdge object
 * - nodes is a non-empty array of RoadmapNode objects
 * 
 * Postconditions:
 * - Returns ValidationResult with valid=true if edge is valid
 * - Returns ValidationResult with valid=false and error messages if invalid
 * 
 * @param edge - Edge to validate
 * @param nodes - Array of all nodes in the graph
 * @returns Validation result
 */
export function validateEdge(
    edge: RoadmapEdge,
    nodes: RoadmapNode[]
): ValidationResult {
    const errors: string[] = [];

    // Check edge has required fields
    if (!edge.id || edge.id.trim() === '') {
        errors.push('Edge must have a non-empty ID');
    }

    if (!edge.source || edge.source.trim() === '') {
        errors.push('Edge must have a non-empty source ID');
    }

    if (!edge.target || edge.target.trim() === '') {
        errors.push('Edge must have a non-empty target ID');
    }

    // Check for self-referencing edge
    if (edge.source === edge.target) {
        errors.push(`Edge ${edge.id} cannot reference itself (source === target)`);
    }

    // Check that source and target reference existing nodes
    const nodeIds = new Set(nodes.map(n => n.id));

    if (!nodeIds.has(edge.source)) {
        errors.push(`Edge ${edge.id} source "${edge.source}" does not reference an existing node`);
    }

    if (!nodeIds.has(edge.target)) {
        errors.push(`Edge ${edge.id} target "${edge.target}" does not reference an existing node`);
    }

    // Validate relationship strength if present
    if (edge.data?.strength !== undefined) {
        if (edge.data.strength < 0 || edge.data.strength > 1) {
            errors.push(`Edge ${edge.id} strength must be between 0 and 1, got ${edge.data.strength}`);
        }
        if (!isFinite(edge.data.strength)) {
            errors.push(`Edge ${edge.id} strength must be a finite number`);
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Validate all edges in a graph
 * 
 * Preconditions:
 * - edges is an array of RoadmapEdge objects (can be empty)
 * - nodes is a non-empty array of RoadmapNode objects
 * 
 * Postconditions:
 * - Returns ValidationResult with valid=true if all edges are valid
 * - Returns ValidationResult with valid=false and all error messages if any edge is invalid
 * 
 * Loop Invariants:
 * - All previously validated edges maintain their validation state
 * - Error collection remains consistent throughout iteration
 * 
 * @param edges - Array of edges to validate
 * @param nodes - Array of all nodes in the graph
 * @returns Validation result
 */
export function validateEdges(
    edges: RoadmapEdge[],
    nodes: RoadmapNode[]
): ValidationResult {
    const allErrors: string[] = [];

    // Check for duplicate edge IDs
    const edgeIds = edges.map(e => e.id);
    const uniqueEdgeIds = new Set(edgeIds);
    if (edgeIds.length !== uniqueEdgeIds.size) {
        const duplicates = edgeIds.filter((id, index) => edgeIds.indexOf(id) !== index);
        const uniqueDuplicates = Array.from(new Set(duplicates));
        allErrors.push(`Duplicate edge IDs found: ${uniqueDuplicates.join(', ')}`);
    }

    // Validate each edge
    for (const edge of edges) {
        const result = validateEdge(edge, nodes);
        if (!result.valid) {
            allErrors.push(...result.errors);
        }
    }

    return {
        valid: allErrors.length === 0,
        errors: allErrors,
    };
}

/**
 * Detect circular dependencies in a directed graph using DFS
 * 
 * Preconditions:
 * - nodes is a non-empty array of RoadmapNode objects
 * - edges is an array of RoadmapEdge objects (can be empty)
 * - All edges reference existing nodes
 * 
 * Postconditions:
 * - Returns CircularDependencyResult with hasCircularDependency=true if cycles exist
 * - Returns all cycles found in the graph
 * - Returns CircularDependencyResult with hasCircularDependency=false if graph is acyclic
 * 
 * Algorithm:
 * Uses depth-first search with three-color marking:
 * - White (0): Unvisited node
 * - Gray (1): Currently being processed (in DFS stack)
 * - Black (2): Fully processed
 * 
 * A back edge (edge to a gray node) indicates a cycle.
 * 
 * @param nodes - Array of all nodes
 * @param edges - Array of all edges
 * @returns Circular dependency detection result
 */
export function detectCircularDependencies(
    nodes: RoadmapNode[],
    edges: RoadmapEdge[]
): CircularDependencyResult {
    // Build adjacency list
    const adjacencyList = new Map<string, string[]>();
    for (const node of nodes) {
        adjacencyList.set(node.id, []);
    }
    for (const edge of edges) {
        const neighbors = adjacencyList.get(edge.source);
        if (neighbors) {
            neighbors.push(edge.target);
        }
    }

    // Three-color marking: 0 = white (unvisited), 1 = gray (processing), 2 = black (done)
    const colors = new Map<string, number>();
    for (const node of nodes) {
        colors.set(node.id, 0);
    }

    const cycles: string[][] = [];
    const currentPath: string[] = [];

    /**
     * DFS helper function to detect cycles
     * 
     * @param nodeId - Current node being visited
     * @returns true if cycle detected from this node
     */
    function dfs(nodeId: string): boolean {
        colors.set(nodeId, 1); // Mark as gray (processing)
        currentPath.push(nodeId);

        const neighbors = adjacencyList.get(nodeId) || [];
        for (const neighbor of neighbors) {
            const neighborColor = colors.get(neighbor);

            if (neighborColor === 1) {
                // Back edge detected - cycle found
                const cycleStartIndex = currentPath.indexOf(neighbor);
                const cycle = currentPath.slice(cycleStartIndex);
                cycle.push(neighbor); // Complete the cycle
                cycles.push(cycle);
                return true;
            }

            if (neighborColor === 0) {
                // Unvisited node - continue DFS
                if (dfs(neighbor)) {
                    // Cycle detected in subtree
                    // Continue to find all cycles
                }
            }
        }

        currentPath.pop();
        colors.set(nodeId, 2); // Mark as black (done)
        return false;
    }

    // Run DFS from each unvisited node
    for (const node of nodes) {
        if (colors.get(node.id) === 0) {
            dfs(node.id);
        }
    }

    return {
        hasCircularDependency: cycles.length > 0,
        cycles,
    };
}

/**
 * Calculate relationship strength between two nodes
 * 
 * Relationship strength is calculated based on:
 * - Level difference (closer levels = stronger relationship)
 * - Edge type (dependency > progression > related > optional)
 * - Bidirectional relationships are stronger
 * 
 * Preconditions:
 * - sourceNode and targetNode are valid RoadmapNode objects
 * - edge is a valid RoadmapEdge connecting source and target
 * 
 * Postconditions:
 * - Returns a number between 0 and 1 (inclusive)
 * - Higher values indicate stronger relationships
 * - Returns finite number
 * 
 * @param sourceNode - Source node
 * @param targetNode - Target node
 * @param edge - Edge connecting the nodes
 * @returns Relationship strength (0-1)
 */
export function calculateRelationshipStrength(
    sourceNode: RoadmapNode,
    targetNode: RoadmapNode,
    edge: RoadmapEdge
): number {
    // If strength is explicitly set, use it
    if (edge.data?.strength !== undefined) {
        return Math.max(0, Math.min(1, edge.data.strength));
    }

    let strength = 0.5; // Base strength

    // Factor 1: Level difference (max 0.3 contribution)
    const levelDiff = Math.abs(sourceNode.data.level - targetNode.data.level);
    const levelFactor = Math.max(0, 0.3 - (levelDiff * 0.1));
    strength += levelFactor;

    // Factor 2: Edge type (max 0.2 contribution)
    const edgeTypeWeights: Record<string, number> = {
        dependency: 0.2,
        progression: 0.15,
        related: 0.1,
        optional: 0.05,
    };
    strength += edgeTypeWeights[edge.type] || 0.1;

    // Factor 3: Relationship type (max 0.15 contribution)
    if (edge.data?.relationship) {
        const relationshipWeights: Record<string, number> = {
            prerequisite: 0.15,
            'part-of': 0.12,
            'leads-to': 0.1,
            'related-to': 0.08,
        };
        strength += relationshipWeights[edge.data.relationship] || 0.08;
    }

    // Factor 4: Bidirectional bonus (0.1 contribution)
    if (edge.data?.bidirectional) {
        strength += 0.1;
    }

    // Normalize to [0, 1] range
    return Math.max(0, Math.min(1, strength));
}

/**
 * Calculate relationship strengths for all edges in a graph
 * 
 * Preconditions:
 * - graphData is a valid GraphData object
 * - All edges reference existing nodes
 * 
 * Postconditions:
 * - Returns new GraphData with updated edge strengths
 * - All edge strengths are in [0, 1] range
 * - Original graphData is not mutated
 * 
 * Loop Invariants:
 * - All previously processed edges have valid strength values
 * - Node lookup map remains consistent throughout iteration
 * 
 * @param graphData - Graph data to process
 * @returns New graph data with calculated relationship strengths
 */
export function calculateAllRelationshipStrengths(
    graphData: GraphData
): GraphData {
    // Create node lookup map for efficient access
    const nodeMap = new Map<string, RoadmapNode>();
    for (const node of graphData.nodes) {
        nodeMap.set(node.id, node);
    }

    // Calculate strength for each edge
    const updatedEdges: RoadmapEdge[] = graphData.edges.map(edge => {
        const sourceNode = nodeMap.get(edge.source);
        const targetNode = nodeMap.get(edge.target);

        if (!sourceNode || !targetNode) {
            // Edge references non-existent node, keep original
            return edge;
        }

        const strength = calculateRelationshipStrength(sourceNode, targetNode, edge);

        return {
            ...edge,
            data: {
                relationship: edge.data?.relationship || 'leads-to',
                ...edge.data,
                strength,
            },
        } as RoadmapEdge;
    });

    return {
        ...graphData,
        edges: updatedEdges,
    };
}

/**
 * Validate graph structure integrity
 * 
 * Performs comprehensive validation including:
 * - Edge validation (references, self-loops, strengths)
 * - Circular dependency detection for hierarchical layouts
 * - Node ID uniqueness
 * 
 * Preconditions:
 * - graphData is a valid GraphData object
 * 
 * Postconditions:
 * - Returns ValidationResult with valid=true if graph is valid
 * - Returns ValidationResult with valid=false and all errors if invalid
 * - Does not mutate graphData
 * 
 * @param graphData - Graph data to validate
 * @param checkCircularDeps - Whether to check for circular dependencies (default: true for hierarchical layouts)
 * @returns Validation result
 */
export function validateGraphStructure(
    graphData: GraphData,
    checkCircularDeps: boolean = true
): ValidationResult {
    const errors: string[] = [];

    // Validate nodes exist
    if (!graphData.nodes || graphData.nodes.length === 0) {
        errors.push('Graph must have at least one node');
        return { valid: false, errors };
    }

    // Validate node IDs are unique
    const nodeIds = graphData.nodes.map(n => n.id);
    const uniqueNodeIds = new Set(nodeIds);
    if (nodeIds.length !== uniqueNodeIds.size) {
        const duplicates = nodeIds.filter((id, index) => nodeIds.indexOf(id) !== index);
        const uniqueDuplicates = Array.from(new Set(duplicates));
        errors.push(`Duplicate node IDs found: ${uniqueDuplicates.join(', ')}`);
    }

    // Validate all edges
    const edgeValidation = validateEdges(graphData.edges, graphData.nodes);
    if (!edgeValidation.valid) {
        errors.push(...edgeValidation.errors);
    }

    // Check for circular dependencies if requested
    if (checkCircularDeps && graphData.metadata.layoutType === 'hierarchical') {
        const circularCheck = detectCircularDependencies(graphData.nodes, graphData.edges);
        if (circularCheck.hasCircularDependency) {
            errors.push(
                `Circular dependencies detected in hierarchical layout: ${circularCheck.cycles.length} cycle(s) found`
            );
            // Add details about first few cycles
            const cyclesToShow = circularCheck.cycles.slice(0, 3);
            for (const cycle of cyclesToShow) {
                errors.push(`  Cycle: ${cycle.join(' → ')}`);
            }
            if (circularCheck.cycles.length > 3) {
                errors.push(`  ... and ${circularCheck.cycles.length - 3} more cycle(s)`);
            }
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}
