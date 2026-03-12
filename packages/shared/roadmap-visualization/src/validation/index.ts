/**
 * Validation utilities and functions
 */

import type { GraphData, RoadmapNode, RoadmapEdge, NodeData, NodeCategory } from '../types';
import { GraphDataSchema, RoadmapNodeSchema, RoadmapEdgeSchema } from './schemas';

/**
 * Validation error details
 */
export interface ValidationError {
    field: string;
    message: string;
    code: string;
}

/**
 * Validation result
 */
export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
}

/**
 * Validate graph data structure
 * @param data - Graph data to validate
 * @returns true if valid, throws ZodError if invalid
 */
export function validateGraphData(data: unknown): data is GraphData {
    GraphDataSchema.parse(data);
    return true;
}

/**
 * Validate a single node
 * @param node - Node to validate
 * @returns true if valid, throws ZodError if invalid
 */
export function validateNode(node: unknown): node is RoadmapNode {
    RoadmapNodeSchema.parse(node);
    return true;
}

/**
 * Validate a single edge
 * @param edge - Edge to validate
 * @returns true if valid, throws ZodError if invalid
 */
export function validateEdge(edge: unknown): edge is RoadmapEdge {
    RoadmapEdgeSchema.parse(edge);
    return true;
}

/**
 * Validate graph structure integrity
 * Checks for:
 * - At least one node exists
 * - All edges reference existing nodes
 * - No circular dependencies in hierarchical layouts
 * - Node IDs are unique
 * 
 * @param graphData - Graph data to validate
 * @returns true if structure is valid
 */
export function validateGraphStructure(graphData: GraphData): boolean {
    // Check minimum nodes
    if (graphData.nodes.length === 0) {
        return false;
    }

    // Check node ID uniqueness
    const nodeIds = new Set<string>();
    for (const node of graphData.nodes) {
        if (nodeIds.has(node.id)) {
            return false;
        }
        nodeIds.add(node.id);
    }

    // Check edge references
    for (const edge of graphData.edges) {
        if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) {
            return false;
        }

        // Check no self-referencing edges
        if (edge.source === edge.target) {
            return false;
        }
    }

    // Check for circular dependencies if hierarchical layout
    if (graphData.metadata.layoutType === 'hierarchical') {
        if (hasCircularDependencies(graphData.nodes, graphData.edges)) {
            return false;
        }
    }

    return true;
}

/**
 * Check for circular dependencies in the graph
 * Uses depth-first search to detect cycles
 * 
 * @param nodes - Array of nodes
 * @param edges - Array of edges
 * @returns true if circular dependencies exist
 */
function hasCircularDependencies(nodes: RoadmapNode[], edges: RoadmapEdge[]): boolean {
    const adjacencyList = new Map<string, string[]>();

    // Build adjacency list
    for (const node of nodes) {
        adjacencyList.set(node.id, []);
    }

    for (const edge of edges) {
        const neighbors = adjacencyList.get(edge.source);
        if (neighbors) {
            neighbors.push(edge.target);
        }
    }

    // DFS to detect cycles
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    function hasCycle(nodeId: string): boolean {
        visited.add(nodeId);
        recursionStack.add(nodeId);

        const neighbors = adjacencyList.get(nodeId) || [];
        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                if (hasCycle(neighbor)) {
                    return true;
                }
            } else if (recursionStack.has(neighbor)) {
                return true;
            }
        }

        recursionStack.delete(nodeId);
        return false;
    }

    for (const node of nodes) {
        if (!visited.has(node.id)) {
            if (hasCycle(node.id)) {
                return true;
            }
        }
    }

    return false;
}

/**
 * Validate node category and navigation data
 * 
 * @param nodeData - Node data to validate
 * @returns Validation result with errors if any
 */
export function validateNodeCategory(nodeData: NodeData): ValidationResult {
    const errors: ValidationError[] = [];

    // If category is set, validate navigation targets
    if (nodeData.category) {
        if (nodeData.category === 'role') {
            if (!nodeData.targetRoadmapId || nodeData.targetRoadmapId.trim() === '') {
                const code = !nodeData.targetRoadmapId ? 'MISSING_TARGET_ROADMAP' : 'INVALID_TARGET_ROADMAP';
                const message = !nodeData.targetRoadmapId
                    ? 'Role node phải có targetRoadmapId'
                    : 'targetRoadmapId phải là string không rỗng';
                errors.push({
                    field: 'targetRoadmapId',
                    message,
                    code,
                });
            }
        }

        if (nodeData.category === 'skill') {
            if (!nodeData.targetArticleId || nodeData.targetArticleId.trim() === '') {
                const code = !nodeData.targetArticleId ? 'MISSING_TARGET_ARTICLE' : 'INVALID_TARGET_ARTICLE';
                const message = !nodeData.targetArticleId
                    ? 'Skill node phải có targetArticleId'
                    : 'targetArticleId phải là string không rỗng';
                errors.push({
                    field: 'targetArticleId',
                    message,
                    code,
                });
            }
        }

        // Validate category value
        const validCategories: NodeCategory[] = ['role', 'skill'];
        if (!validCategories.includes(nodeData.category as NodeCategory)) {
            errors.push({
                field: 'category',
                message: `Category phải là 'role' hoặc 'skill', nhận được: ${nodeData.category}`,
                code: 'INVALID_CATEGORY',
            });
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Validate node prerequisites
 * Checks if all prerequisite IDs exist in the graph
 * 
 * @param nodeData - Node data to validate
 * @param allNodeIds - Set of all node IDs in the graph
 * @returns Validation result with errors if any
 */
export function validateNodePrerequisites(
    nodeData: NodeData,
    allNodeIds: Set<string>
): ValidationResult {
    const errors: ValidationError[] = [];

    if (nodeData.prerequisites && nodeData.prerequisites.length > 0) {
        for (const prereqId of nodeData.prerequisites) {
            if (!allNodeIds.has(prereqId)) {
                errors.push({
                    field: 'prerequisites',
                    message: `Prerequisite node không tồn tại: ${prereqId}`,
                    code: 'INVALID_PREREQUISITE',
                });
            }
        }

        // Check for duplicates
        const uniquePrereqs = new Set(nodeData.prerequisites);
        if (uniquePrereqs.size !== nodeData.prerequisites.length) {
            errors.push({
                field: 'prerequisites',
                message: 'Prerequisites chứa ID trùng lặp',
                code: 'DUPLICATE_PREREQUISITES',
            });
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Validate complete node with all rules
 * 
 * @param node - Node to validate
 * @param allNodeIds - Set of all node IDs in the graph (for prerequisite validation)
 * @returns Validation result with all errors
 */
export function validateNodeComplete(
    node: RoadmapNode,
    allNodeIds?: Set<string>
): ValidationResult {
    const allErrors: ValidationError[] = [];

    // Basic schema validation
    try {
        validateNode(node);
    } catch (error) {
        allErrors.push({
            field: 'node',
            message: 'Node không đúng schema',
            code: 'INVALID_SCHEMA',
        });
        return { valid: false, errors: allErrors };
    }

    // Category validation
    const categoryResult = validateNodeCategory(node.data);
    allErrors.push(...categoryResult.errors);

    // Prerequisites validation (if node IDs provided)
    if (allNodeIds) {
        const prereqResult = validateNodePrerequisites(node.data, allNodeIds);
        allErrors.push(...prereqResult.errors);
    }

    // Label validation
    if (!node.data.label || node.data.label.trim() === '') {
        allErrors.push({
            field: 'label',
            message: 'Node label không được rỗng',
            code: 'EMPTY_LABEL',
        });
    }

    // Estimated time format validation (if provided)
    if (node.data.estimatedTime) {
        const timePattern = /^\d+(-\d+)?\s*(weeks?|months?|days?|hours?)$/i;
        if (!timePattern.test(node.data.estimatedTime)) {
            allErrors.push({
                field: 'estimatedTime',
                message: 'Estimated time format không hợp lệ (ví dụ: "2-4 weeks", "3 months")',
                code: 'INVALID_TIME_FORMAT',
            });
        }
    }

    return {
        valid: allErrors.length === 0,
        errors: allErrors,
    };
}

/**
 * Validate that roadmap has at least one node
 * 
 * @param graphData - Graph data to validate
 * @returns Validation result
 */
export function validateMinimumNodes(graphData: GraphData): ValidationResult {
    const errors: ValidationError[] = [];

    if (graphData.nodes.length === 0) {
        errors.push({
            field: 'nodes',
            message: 'Roadmap phải có ít nhất 1 node',
            code: 'NO_NODES',
        });
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Validate all nodes in graph with complete rules
 * 
 * @param graphData - Graph data to validate
 * @returns Validation result with all errors from all nodes
 */
export function validateAllNodes(graphData: GraphData): ValidationResult {
    const allErrors: ValidationError[] = [];
    const nodeIds = new Set(graphData.nodes.map(n => n.id));

    for (let i = 0; i < graphData.nodes.length; i++) {
        const node = graphData.nodes[i];
        const result = validateNodeComplete(node, nodeIds);

        // Add node index to error messages for clarity
        result.errors.forEach(error => {
            allErrors.push({
                ...error,
                field: `nodes[${i}].${error.field}`,
            });
        });
    }

    return {
        valid: allErrors.length === 0,
        errors: allErrors,
    };
}

export * from './schemas';
export * from './edge-validation';
