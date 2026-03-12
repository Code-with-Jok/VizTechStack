/**
 * GraphValidator - Validate graph data integrity
 * 
 * Validates: Requirement 2.5
 */

import { GraphNode } from './node-extractor';
import { RoadmapNode, RoadmapEdge, GraphData } from '../types';

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

export interface OrphanedNodeResult {
    hasOrphanedNodes: boolean;
    orphanedNodes: string[];
    details: OrphanedNodeDetails[];
}

export interface OrphanedNodeDetails {
    nodeId: string;
    nodeTitle: string;
    reason: 'no_incoming_edges' | 'no_outgoing_edges' | 'isolated';
    severity: 'warning' | 'error';
}

export interface CircularDependencyResult {
    hasCircularDependencies: boolean;
    cycles: CircularDependency[];
    affectedNodes: string[];
}

export interface CircularDependency {
    path: string[];
    length: number;
    strength: number; // Average strength of edges in the cycle
    type: 'direct' | 'indirect';
}

export interface GraphValidationResult {
    isValid: boolean;
    edgeValidation: ValidationResult;
    orphanedNodeValidation: OrphanedNodeResult;
    circularDependencyValidation: CircularDependencyResult;
    summary: {
        totalErrors: number;
        totalWarnings: number;
        criticalIssues: string[];
    };
}

export interface GraphValidationOptions {
    allowOrphanedNodes?: boolean;
    allowCircularDependencies?: boolean;
    strictEdgeValidation?: boolean;
    maxCycleLength?: number;
    ignoreWeakCycles?: boolean;
    minimumCycleStrength?: number;
}

export class GraphValidator {
    private options: GraphValidationOptions;

    constructor(options: GraphValidationOptions = {}) {
        this.options = {
            allowOrphanedNodes: false,
            allowCircularDependencies: false,
            strictEdgeValidation: true,
            maxCycleLength: 10,
            ignoreWeakCycles: true,
            minimumCycleStrength: 0.3,
            ...options
        };
    }

    /**
     * Validate complete graph data structure
     */
    validateGraph(graphData: GraphData): GraphValidationResult {
        if (!graphData) {
            throw new Error('GraphData cannot be null or undefined');
        }

        const { nodes, edges } = graphData;

        if (!nodes || !Array.isArray(nodes)) {
            throw new Error('Nodes must be a non-empty array');
        }

        if (!edges || !Array.isArray(edges)) {
            throw new Error('Edges must be an array');
        }

        // Validate all edges reference existing nodes
        const edgeValidation = this.validateEdgeReferences(edges, nodes);

        // Check for orphaned nodes
        const orphanedNodeValidation = this.checkOrphanedNodes(nodes, edges);

        // Detect circular dependencies
        const circularDependencyValidation = this.detectCircularDependencies(nodes, edges);

        // Generate summary
        const summary = this.generateValidationSummary(
            edgeValidation,
            orphanedNodeValidation,
            circularDependencyValidation
        );

        const isValid = edgeValidation.isValid &&
            (this.options.allowOrphanedNodes || !orphanedNodeValidation.hasOrphanedNodes) &&
            (this.options.allowCircularDependencies || !circularDependencyValidation.hasCircularDependencies);

        return {
            isValid,
            edgeValidation,
            orphanedNodeValidation,
            circularDependencyValidation,
            summary
        };
    }

    /**
     * Validate that all edges reference existing nodes
     */
    validateEdgeReferences(edges: RoadmapEdge[], nodes: RoadmapNode[]): ValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];

        if (nodes.length === 0) {
            errors.push('Cannot validate edges: no nodes provided');
            return { isValid: false, errors, warnings };
        }

        // Create set of valid node IDs for efficient lookup
        const nodeIds = new Set(nodes.map(node => node.id));

        for (const edge of edges) {
            // Validate edge structure
            if (!edge.id || typeof edge.id !== 'string') {
                errors.push(`Edge has invalid ID: ${edge.id}`);
                continue;
            }

            if (!edge.source || typeof edge.source !== 'string') {
                errors.push(`Edge ${edge.id} has invalid source: ${edge.source}`);
                continue;
            }

            if (!edge.target || typeof edge.target !== 'string') {
                errors.push(`Edge ${edge.id} has invalid target: ${edge.target}`);
                continue;
            }

            // Check if source node exists
            if (!nodeIds.has(edge.source)) {
                errors.push(`Edge ${edge.id} references non-existent source node: ${edge.source}`);
            }

            // Check if target node exists
            if (!nodeIds.has(edge.target)) {
                errors.push(`Edge ${edge.id} references non-existent target node: ${edge.target}`);
            }

            // Check for self-referencing edges
            if (edge.source === edge.target) {
                if (this.options.strictEdgeValidation) {
                    errors.push(`Edge ${edge.id} is self-referencing (source equals target): ${edge.source}`);
                } else {
                    warnings.push(`Edge ${edge.id} is self-referencing: ${edge.source}`);
                }
            }

            // Validate edge data if present
            if (edge.data) {
                if (edge.data.strength !== undefined) {
                    const strength = edge.data.strength;
                    if (typeof strength !== 'number' || strength < 0 || strength > 1) {
                        warnings.push(`Edge ${edge.id} has invalid strength value: ${strength}`);
                    }
                }
            }
        }

        // Check for duplicate edges
        const edgeKeys = new Set<string>();
        for (const edge of edges) {
            const key = `${edge.source}-${edge.target}`;
            if (edgeKeys.has(key)) {
                warnings.push(`Duplicate edge detected between ${edge.source} and ${edge.target}`);
            } else {
                edgeKeys.add(key);
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Check for orphaned nodes (nodes with no connections)
     */
    checkOrphanedNodes(nodes: RoadmapNode[], edges: RoadmapEdge[]): OrphanedNodeResult {
        const orphanedNodes: string[] = [];
        const details: OrphanedNodeDetails[] = [];

        if (nodes.length === 0) {
            return {
                hasOrphanedNodes: false,
                orphanedNodes: [],
                details: []
            };
        }

        // Build sets of nodes with incoming and outgoing edges
        const nodesWithIncomingEdges = new Set<string>();
        const nodesWithOutgoingEdges = new Set<string>();

        for (const edge of edges) {
            nodesWithOutgoingEdges.add(edge.source);
            nodesWithIncomingEdges.add(edge.target);
        }

        // Check each node for orphaned status
        for (const node of nodes) {
            const hasIncoming = nodesWithIncomingEdges.has(node.id);
            const hasOutgoing = nodesWithOutgoingEdges.has(node.id);

            if (!hasIncoming && !hasOutgoing) {
                // Completely isolated node
                orphanedNodes.push(node.id);
                details.push({
                    nodeId: node.id,
                    nodeTitle: node.data.label || node.id,
                    reason: 'isolated',
                    severity: 'error'
                });
            } else if (!hasIncoming && nodes.length > 1) {
                // Node with no incoming edges (potential root node)
                // Only consider this an issue if there are multiple nodes
                const isRootNode = this.isLikelyRootNode(node, nodes);
                if (!isRootNode) {
                    orphanedNodes.push(node.id);
                    details.push({
                        nodeId: node.id,
                        nodeTitle: node.data.label || node.id,
                        reason: 'no_incoming_edges',
                        severity: 'warning'
                    });
                }
            } else if (!hasOutgoing && nodes.length > 1) {
                // Node with no outgoing edges (potential leaf node)
                const isLeafNode = this.isLikelyLeafNode(node, nodes);
                if (!isLeafNode) {
                    details.push({
                        nodeId: node.id,
                        nodeTitle: node.data.label || node.id,
                        reason: 'no_outgoing_edges',
                        severity: 'warning'
                    });
                }
            }
        }

        return {
            hasOrphanedNodes: orphanedNodes.length > 0,
            orphanedNodes,
            details
        };
    }

    /**
     * Detect circular dependencies in the graph
     */
    detectCircularDependencies(nodes: RoadmapNode[], edges: RoadmapEdge[]): CircularDependencyResult {
        const cycles: CircularDependency[] = [];
        const affectedNodes = new Set<string>();

        if (nodes.length === 0 || edges.length === 0) {
            return {
                hasCircularDependencies: false,
                cycles: [],
                affectedNodes: []
            };
        }

        // Build adjacency list for dependency edges
        const adjacencyList = new Map<string, Array<{ target: string; strength: number }>>();

        for (const node of nodes) {
            adjacencyList.set(node.id, []);
        }

        for (const edge of edges) {
            // Only consider dependency and progression edges for circular dependency detection
            if (edge.type === 'dependency' || edge.type === 'progression') {
                const sourceConnections = adjacencyList.get(edge.source) || [];
                const strength = edge.data?.strength || 0.5;

                sourceConnections.push({ target: edge.target, strength });
                adjacencyList.set(edge.source, sourceConnections);
            }
        }

        // Use DFS to detect cycles
        const visited = new Set<string>();
        const recursionStack = new Set<string>();
        const pathStack: Array<{ nodeId: string; strength: number }> = [];

        for (const node of nodes) {
            if (!visited.has(node.id)) {
                this.detectCyclesFromNode(
                    node.id,
                    adjacencyList,
                    visited,
                    recursionStack,
                    pathStack,
                    cycles,
                    affectedNodes
                );
            }
        }

        // Filter cycles based on options
        const filteredCycles = this.filterCycles(cycles);

        return {
            hasCircularDependencies: filteredCycles.length > 0,
            cycles: filteredCycles,
            affectedNodes: Array.from(affectedNodes)
        };
    }

    /**
     * Detect cycles starting from a specific node using DFS
     */
    private detectCyclesFromNode(
        nodeId: string,
        adjacencyList: Map<string, Array<{ target: string; strength: number }>>,
        visited: Set<string>,
        recursionStack: Set<string>,
        pathStack: Array<{ nodeId: string; strength: number }>,
        cycles: CircularDependency[],
        affectedNodes: Set<string>
    ): void {
        visited.add(nodeId);
        recursionStack.add(nodeId);

        const connections = adjacencyList.get(nodeId) || [];

        for (const connection of connections) {
            const targetId = connection.target;
            pathStack.push({ nodeId: targetId, strength: connection.strength });

            if (!visited.has(targetId)) {
                this.detectCyclesFromNode(
                    targetId,
                    adjacencyList,
                    visited,
                    recursionStack,
                    pathStack,
                    cycles,
                    affectedNodes
                );
            } else if (recursionStack.has(targetId)) {
                // Found a cycle
                const cycleStartIndex = pathStack.findIndex(item => item.nodeId === targetId);
                if (cycleStartIndex !== -1) {
                    const cyclePath = pathStack.slice(cycleStartIndex);
                    const cycleNodeIds = cyclePath.map(item => item.nodeId);
                    const cycleStrengths = cyclePath.map(item => item.strength);
                    const averageStrength = cycleStrengths.reduce((sum, s) => sum + s, 0) / cycleStrengths.length;

                    const cycle: CircularDependency = {
                        path: cycleNodeIds,
                        length: cyclePath.length,
                        strength: averageStrength,
                        type: cyclePath.length === 2 ? 'direct' : 'indirect'
                    };

                    cycles.push(cycle);

                    // Add all nodes in the cycle to affected nodes
                    cycleNodeIds.forEach(id => affectedNodes.add(id));
                }
            }

            pathStack.pop();
        }

        recursionStack.delete(nodeId);
    }

    /**
     * Filter cycles based on validation options
     */
    private filterCycles(cycles: CircularDependency[]): CircularDependency[] {
        let filtered = [...cycles];

        // Filter by maximum cycle length
        if (this.options.maxCycleLength !== undefined) {
            filtered = filtered.filter(cycle => cycle.length <= this.options.maxCycleLength!);
        }

        // Filter weak cycles if option is enabled
        if (this.options.ignoreWeakCycles && this.options.minimumCycleStrength !== undefined) {
            filtered = filtered.filter(cycle => cycle.strength >= this.options.minimumCycleStrength!);
        }

        // Remove duplicate cycles (same nodes, different starting point)
        const uniqueCycles: CircularDependency[] = [];
        const seenCycles = new Set<string>();

        for (const cycle of filtered) {
            // Create a normalized representation of the cycle
            const sortedPath = [...cycle.path].sort();
            const cycleKey = sortedPath.join('-');

            if (!seenCycles.has(cycleKey)) {
                seenCycles.add(cycleKey);
                uniqueCycles.push(cycle);
            }
        }

        return uniqueCycles;
    }

    /**
     * Check if a node is likely a root node (should have no incoming edges)
     */
    private isLikelyRootNode(node: RoadmapNode, allNodes: RoadmapNode[]): boolean {
        // Check if it's at the highest level (lowest level number)
        const minLevel = Math.min(...allNodes.map(n => n.data.level || 0));
        const nodeLevel = node.data.level || 0;

        if (nodeLevel === minLevel) {
            return true;
        }

        // Check if the node type suggests it's a root
        const rootTypes = ['milestone', 'prerequisite'];
        if (rootTypes.includes(node.type)) {
            return true;
        }

        // Check if the title suggests it's a root
        const title = node.data.label?.toLowerCase() || '';
        const rootKeywords = ['introduction', 'overview', 'getting started', 'basics', 'fundamentals'];

        return rootKeywords.some(keyword => title.includes(keyword));
    }

    /**
     * Check if a node is likely a leaf node (should have no outgoing edges)
     */
    private isLikelyLeafNode(node: RoadmapNode, allNodes: RoadmapNode[]): boolean {
        // Check if it's at the lowest level (highest level number)
        const maxLevel = Math.max(...allNodes.map(n => n.data.level || 0));
        const nodeLevel = node.data.level || 0;

        if (nodeLevel === maxLevel) {
            return true;
        }

        // Check if the node type suggests it's a leaf
        const leafTypes = ['resource', 'skill'];
        if (leafTypes.includes(node.type)) {
            return true;
        }

        // Check if the title suggests it's a leaf
        const title = node.data.label?.toLowerCase() || '';
        const leafKeywords = ['advanced', 'mastery', 'expert', 'final', 'conclusion'];

        return leafKeywords.some(keyword => title.includes(keyword));
    }

    /**
     * Generate validation summary
     */
    private generateValidationSummary(
        edgeValidation: ValidationResult,
        orphanedNodeValidation: OrphanedNodeResult,
        circularDependencyValidation: CircularDependencyResult
    ): GraphValidationResult['summary'] {
        const totalErrors = edgeValidation.errors.length +
            orphanedNodeValidation.details.filter(d => d.severity === 'error').length;

        const totalWarnings = edgeValidation.warnings.length +
            orphanedNodeValidation.details.filter(d => d.severity === 'warning').length;

        const criticalIssues: string[] = [];

        // Add critical edge validation issues
        if (edgeValidation.errors.length > 0) {
            criticalIssues.push(`${edgeValidation.errors.length} edge reference errors`);
        }

        // Add critical orphaned node issues
        const isolatedNodes = orphanedNodeValidation.details.filter(d => d.reason === 'isolated');
        if (isolatedNodes.length > 0) {
            criticalIssues.push(`${isolatedNodes.length} completely isolated nodes`);
        }

        // Add circular dependency issues
        if (circularDependencyValidation.hasCircularDependencies) {
            const directCycles = circularDependencyValidation.cycles.filter(c => c.type === 'direct').length;
            const indirectCycles = circularDependencyValidation.cycles.filter(c => c.type === 'indirect').length;

            if (directCycles > 0) {
                criticalIssues.push(`${directCycles} direct circular dependencies`);
            }
            if (indirectCycles > 0) {
                criticalIssues.push(`${indirectCycles} indirect circular dependencies`);
            }
        }

        return {
            totalErrors,
            totalWarnings,
            criticalIssues
        };
    }

    /**
     * Validate GraphNode array (for use with extractor output)
     */
    validateGraphNodes(nodes: GraphNode[]): ValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];

        if (!nodes || !Array.isArray(nodes)) {
            errors.push('Nodes must be an array');
            return { isValid: false, errors, warnings };
        }

        if (nodes.length === 0) {
            warnings.push('No nodes provided for validation');
            return { isValid: true, errors, warnings };
        }

        // Check for duplicate IDs
        const ids = nodes.map(node => node.id);
        const uniqueIds = new Set(ids);
        if (ids.length !== uniqueIds.size) {
            const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
            errors.push(`Duplicate node IDs found: ${duplicates.join(', ')}`);
        }

        // Validate each node
        for (const node of nodes) {
            if (!node.id || typeof node.id !== 'string') {
                errors.push(`Node has invalid ID: ${node.id}`);
            }

            if (!node.title || typeof node.title !== 'string') {
                errors.push(`Node ${node.id} has invalid title: ${node.title}`);
            }

            if (typeof node.level !== 'number' || node.level < 1) {
                errors.push(`Node ${node.id} has invalid level: ${node.level}`);
            }

            if (!node.type || typeof node.type !== 'string') {
                errors.push(`Node ${node.id} has invalid type: ${node.type}`);
            }

            if (!node.content || typeof node.content !== 'string') {
                warnings.push(`Node ${node.id} has empty or invalid content`);
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Get validation statistics
     */
    getValidationStatistics(result: GraphValidationResult): {
        nodeCount: number;
        edgeCount: number;
        errorRate: number;
        warningRate: number;
        healthScore: number; // 0-100, higher is better
    } {
        const nodeCount = result.orphanedNodeValidation.details.length || 0;
        const edgeCount = result.edgeValidation.errors.length + result.edgeValidation.warnings.length || 0;

        const totalIssues = result.summary.totalErrors + result.summary.totalWarnings;
        const totalElements = nodeCount + edgeCount;

        const errorRate = totalElements > 0 ? (result.summary.totalErrors / totalElements) * 100 : 0;
        const warningRate = totalElements > 0 ? (result.summary.totalWarnings / totalElements) * 100 : 0;

        // Calculate health score (100 - percentage of issues)
        const issueRate = totalElements > 0 ? (totalIssues / totalElements) * 100 : 0;
        const healthScore = Math.max(0, Math.min(100, 100 - issueRate));

        return {
            nodeCount,
            edgeCount,
            errorRate,
            warningRate,
            healthScore
        };
    }
}

/**
 * Factory function to create GraphValidator with options
 */
export function createGraphValidator(options?: GraphValidationOptions): GraphValidator {
    return new GraphValidator(options);
}

/**
 * Utility function to validate graph data
 */
export function validateGraphData(
    graphData: GraphData,
    options?: GraphValidationOptions
): GraphValidationResult {
    const validator = createGraphValidator(options);
    return validator.validateGraph(graphData);
}

/**
 * Utility function to validate edges reference existing nodes
 */
export function validateEdgeReferences(
    edges: RoadmapEdge[],
    nodes: RoadmapNode[],
    options?: GraphValidationOptions
): ValidationResult {
    const validator = createGraphValidator(options);
    return validator.validateEdgeReferences(edges, nodes);
}

/**
 * Utility function to check for orphaned nodes
 */
export function checkOrphanedNodes(
    nodes: RoadmapNode[],
    edges: RoadmapEdge[],
    options?: GraphValidationOptions
): OrphanedNodeResult {
    const validator = createGraphValidator(options);
    return validator.checkOrphanedNodes(nodes, edges);
}

/**
 * Utility function to detect circular dependencies
 */
export function detectCircularDependencies(
    nodes: RoadmapNode[],
    edges: RoadmapEdge[],
    options?: GraphValidationOptions
): CircularDependencyResult {
    const validator = createGraphValidator(options);
    return validator.detectCircularDependencies(nodes, edges);
}