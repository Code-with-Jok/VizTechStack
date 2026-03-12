/**
 * HierarchyProcessor - Process nested subsections và create parent-child node relationships
 * 
 * Validates: Requirement 2.3
 */

import { GraphNode } from './node-extractor';
import { RelationshipType, EdgeType } from '../types/index';

export interface HierarchyRelationship {
    parentId: string;
    childId: string;
    depth: number;
    type: RelationshipType;
    edgeType: EdgeType;
    strength: number;
    hierarchyPath: string[]; // Path from root to child
}

export interface ProcessedHierarchy {
    relationships: HierarchyRelationship[];
    metadata: {
        totalRelationships: number;
        maxDepth: number;
        nodesByDepth: Record<number, number>;
        hierarchyPaths: Record<string, string[]>; // nodeId -> path from root
        rootNodes: string[]; // Nodes with no parents
        leafNodes: string[]; // Nodes with no children
    };
}

export interface HierarchyValidationResult {
    isValid: boolean;
    criticalErrors: string[];
    warnings: string[];
    malformedStructures: MalformedStructure[];
    suggestedFixes: HierarchyFix[];
}

export interface MalformedStructure {
    type: 'orphaned_node' | 'level_gap' | 'circular_dependency' | 'invalid_progression' | 'missing_parent';
    nodeIds: string[];
    description: string;
    severity: 'critical' | 'warning' | 'info';
}

export interface HierarchyFix {
    type: 'insert_intermediate_level' | 'adjust_level' | 'create_parent' | 'remove_node' | 'merge_nodes';
    targetNodeIds: string[];
    description: string;
    autoApplicable: boolean;
}

export interface HierarchyFallbackOptions {
    createMissingParents: boolean;
    adjustLevelGaps: boolean;
    removeOrphanedNodes: boolean;
    flattenDeepHierarchy: boolean;
    maxFallbackDepth: number;
}

export interface HierarchyProcessingOptions {
    maxDepth?: number;
    includeImplicitHierarchy?: boolean;
    strengthByDepth?: boolean;
    validateHierarchy?: boolean;
    fallbackOptions?: HierarchyFallbackOptions;
}

export interface HierarchyProcessingOptions {
    maxDepth?: number;
    includeImplicitHierarchy?: boolean;
    strengthByDepth?: boolean;
    validateHierarchy?: boolean;
    fallbackOptions?: HierarchyFallbackOptions;
}

export class HierarchyProcessor {
    private options: HierarchyProcessingOptions;

    constructor(options: HierarchyProcessingOptions = {}) {
        this.options = {
            maxDepth: 10,
            includeImplicitHierarchy: true,
            strengthByDepth: true,
            validateHierarchy: true,
            ...options
        };
    }

    /**
     * Process nodes để create hierarchical relationships
     */
    process(nodes: GraphNode[]): ProcessedHierarchy {
        if (!nodes || nodes.length === 0) {
            throw new Error('Nodes array cannot be empty');
        }

        // Validate nodes if enabled
        if (this.options.validateHierarchy) {
            this.validateNodeHierarchy(nodes);
        }

        // Sort nodes by level để ensure proper processing order
        const sortedNodes = this.sortNodesByLevel(nodes);

        // Build hierarchy relationships
        const relationships = this.buildHierarchyRelationships(sortedNodes);

        // Generate hierarchy paths
        const hierarchyPaths = this.generateHierarchyPaths(relationships, sortedNodes);

        // Generate metadata
        const metadata = this.generateHierarchyMetadata(relationships, sortedNodes, hierarchyPaths);

        return {
            relationships,
            metadata
        };
    }

    /**
     * Sort nodes by level để ensure proper hierarchy processing
     */
    private sortNodesByLevel(nodes: GraphNode[]): GraphNode[] {
        return [...nodes].sort((a, b) => {
            // Primary sort by level
            if (a.level !== b.level) {
                return a.level - b.level;
            }
            // Secondary sort by title for consistency
            return a.title.localeCompare(b.title);
        });
    }

    /**
     * Build hierarchical relationships between nodes
     */
    private buildHierarchyRelationships(sortedNodes: GraphNode[]): HierarchyRelationship[] {
        const relationships: HierarchyRelationship[] = [];

        for (let i = 0; i < sortedNodes.length; i++) {
            const currentNode = sortedNodes[i];

            // Skip if depth exceeds maximum
            if (currentNode.level > (this.options.maxDepth || 10)) {
                continue;
            }

            // Find direct parent (immediate higher level)
            const directParent = this.findDirectParent(currentNode, sortedNodes.slice(0, i));

            if (directParent) {
                const relationship = this.createHierarchyRelationship(
                    directParent,
                    currentNode,
                    currentNode.level
                );
                relationships.push(relationship);
            }

            // Include implicit hierarchy if enabled
            if (this.options.includeImplicitHierarchy) {
                const implicitParents = this.findImplicitParents(currentNode, sortedNodes.slice(0, i));
                for (const implicitParent of implicitParents) {
                    const implicitRelationship = this.createImplicitHierarchyRelationship(
                        implicitParent,
                        currentNode,
                        currentNode.level
                    );
                    relationships.push(implicitRelationship);
                }
            }
        }

        return relationships;
    }

    /**
     * Find direct parent node (immediate higher level)
     */
    private findDirectParent(currentNode: GraphNode, previousNodes: GraphNode[]): GraphNode | null {
        // Find the most recent node with level exactly one less than current
        for (let i = previousNodes.length - 1; i >= 0; i--) {
            const candidate = previousNodes[i];
            if (candidate.level === currentNode.level - 1) {
                return candidate;
            }
        }
        return null;
    }

    /**
     * Find implicit parent nodes (ancestors at various levels)
     */
    private findImplicitParents(currentNode: GraphNode, previousNodes: GraphNode[]): GraphNode[] {
        const implicitParents: GraphNode[] = [];

        // Find all ancestors (nodes with lower levels)
        for (let i = previousNodes.length - 1; i >= 0; i--) {
            const candidate = previousNodes[i];

            // Skip direct parent (already handled)
            if (candidate.level === currentNode.level - 1) {
                continue;
            }

            // Include nodes with significantly lower levels as implicit parents
            if (candidate.level < currentNode.level - 1) {
                implicitParents.push(candidate);

                // Only include the most recent ancestor at each level
                break;
            }
        }

        return implicitParents;
    }

    /**
     * Create hierarchy relationship between parent và child
     */
    private createHierarchyRelationship(
        parent: GraphNode,
        child: GraphNode,
        depth: number
    ): HierarchyRelationship {
        const strength = this.calculateHierarchyStrength(parent, child, depth);

        return {
            parentId: parent.id,
            childId: child.id,
            depth,
            type: 'part-of',
            edgeType: 'dependency',
            strength,
            hierarchyPath: [] // Will be populated later
        };
    }

    /**
     * Create implicit hierarchy relationship
     */
    private createImplicitHierarchyRelationship(
        ancestor: GraphNode,
        descendant: GraphNode,
        depth: number
    ): HierarchyRelationship {
        const levelDifference = descendant.level - ancestor.level;
        const strength = this.calculateImplicitHierarchyStrength(levelDifference, depth);

        return {
            parentId: ancestor.id,
            childId: descendant.id,
            depth,
            type: 'part-of',
            edgeType: 'optional', // Implicit relationships are optional
            strength,
            hierarchyPath: [] // Will be populated later
        };
    }

    /**
     * Calculate hierarchy strength based on level difference và depth
     */
    private calculateHierarchyStrength(parent: GraphNode, child: GraphNode, depth: number): number {
        let baseStrength = 0.9; // High confidence for direct hierarchy

        // Adjust strength based on depth if enabled
        if (this.options.strengthByDepth) {
            // Deeper nodes have slightly lower strength
            const depthPenalty = Math.min(0.2, depth * 0.02);
            baseStrength -= depthPenalty;
        }

        // Adjust based on content similarity
        const contentSimilarity = this.calculateContentSimilarity(parent, child);
        baseStrength += contentSimilarity * 0.1;

        return Math.max(0.1, Math.min(1.0, baseStrength));
    }

    /**
     * Calculate implicit hierarchy strength
     */
    private calculateImplicitHierarchyStrength(levelDifference: number, depth: number): number {
        let baseStrength = 0.6; // Lower confidence for implicit relationships

        // Reduce strength based on level difference
        const levelPenalty = Math.min(0.3, (levelDifference - 2) * 0.1);
        baseStrength -= levelPenalty;

        // Adjust based on depth
        if (this.options.strengthByDepth) {
            const depthPenalty = Math.min(0.2, depth * 0.03);
            baseStrength -= depthPenalty;
        }

        return Math.max(0.1, Math.min(0.8, baseStrength));
    }

    /**
     * Calculate content similarity between parent và child nodes
     */
    private calculateContentSimilarity(parent: GraphNode, child: GraphNode): number {
        const parentWords = this.extractKeywords(parent.title + ' ' + parent.content);
        const childWords = this.extractKeywords(child.title + ' ' + child.content);

        if (parentWords.length === 0 || childWords.length === 0) {
            return 0;
        }

        const commonWords = parentWords.filter(word => childWords.includes(word));
        const similarity = commonWords.length / Math.max(parentWords.length, childWords.length);

        return Math.min(1.0, similarity);
    }

    /**
     * Extract keywords từ text content
     */
    private extractKeywords(text: string): string[] {
        if (!text || typeof text !== 'string') {
            return [];
        }

        // Convert to lowercase và split into words
        const words = text.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 2); // Filter out short words

        // Remove common stop words
        const stopWords = new Set([
            'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
            'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before',
            'after', 'above', 'below', 'between', 'among', 'this', 'that', 'these',
            'those', 'you', 'your', 'we', 'our', 'they', 'their', 'will', 'can',
            'should', 'would', 'could', 'may', 'might', 'must', 'shall'
        ]);

        const keywords = words.filter(word => !stopWords.has(word));

        // Return unique keywords
        return [...new Set(keywords)];
    }

    /**
     * Generate hierarchy paths từ root to each node
     */
    private generateHierarchyPaths(
        relationships: HierarchyRelationship[],
        nodes: GraphNode[]
    ): Record<string, string[]> {
        const hierarchyPaths: Record<string, string[]> = {};
        const nodeMap = new Map(nodes.map(node => [node.id, node]));

        // Build parent-child mapping
        const childrenMap = new Map<string, string[]>();
        const parentMap = new Map<string, string>();

        for (const rel of relationships) {
            // Only use direct relationships (not implicit)
            if (rel.edgeType === 'dependency') {
                // Add to children map
                if (!childrenMap.has(rel.parentId)) {
                    childrenMap.set(rel.parentId, []);
                }
                childrenMap.get(rel.parentId)!.push(rel.childId);

                // Add to parent map
                parentMap.set(rel.childId, rel.parentId);
            }
        }

        // Generate paths for each node
        for (const node of nodes) {
            const path = this.buildPathToRoot(node.id, parentMap, nodeMap);
            hierarchyPaths[node.id] = path;

            // Update relationship hierarchy paths
            for (const rel of relationships) {
                if (rel.childId === node.id) {
                    rel.hierarchyPath = path;
                }
            }
        }

        return hierarchyPaths;
    }

    /**
     * Build path từ node to root
     */
    private buildPathToRoot(
        nodeId: string,
        parentMap: Map<string, string>,
        nodeMap: Map<string, GraphNode>
    ): string[] {
        const path: string[] = [];
        let currentId: string | undefined = nodeId;

        // Prevent infinite loops
        const visited = new Set<string>();

        while (currentId && !visited.has(currentId)) {
            visited.add(currentId);
            const node = nodeMap.get(currentId);

            if (node) {
                path.unshift(node.title); // Add to beginning để get root-to-node path
            }

            currentId = parentMap.get(currentId);
        }

        return path;
    }

    /**
     * Generate metadata về processed hierarchy
     */
    private generateHierarchyMetadata(
        relationships: HierarchyRelationship[],
        nodes: GraphNode[],
        hierarchyPaths: Record<string, string[]>
    ): ProcessedHierarchy['metadata'] {
        const nodesByDepth: Record<number, number> = {};
        let maxDepth = 0;

        // Count nodes by depth
        for (const node of nodes) {
            const depth = node.level;
            nodesByDepth[depth] = (nodesByDepth[depth] || 0) + 1;
            maxDepth = Math.max(maxDepth, depth);
        }

        // Find root nodes (nodes with no parents)
        const childIds = new Set(relationships.map(rel => rel.childId));
        const rootNodes = nodes
            .filter(node => !childIds.has(node.id))
            .map(node => node.id);

        // Find leaf nodes (nodes with no children)
        const parentIds = new Set(relationships.map(rel => rel.parentId));
        const leafNodes = nodes
            .filter(node => !parentIds.has(node.id))
            .map(node => node.id);

        return {
            totalRelationships: relationships.length,
            maxDepth,
            nodesByDepth,
            hierarchyPaths,
            rootNodes,
            leafNodes
        };
    }

    /**
     * Validate node hierarchy consistency with comprehensive checks
     */
    private validateNodeHierarchy(nodes: GraphNode[]): void {
        const validationResult = this.performComprehensiveValidation(nodes);

        if (validationResult.criticalErrors.length > 0) {
            throw new Error(`Critical hierarchy validation errors: ${validationResult.criticalErrors.join(', ')}`);
        }

        // Log warnings for non-critical issues
        validationResult.warnings.forEach(warning => {
            console.warn(`Hierarchy validation warning: ${warning}`);
        });
    }

    /**
     * Perform comprehensive hierarchy validation with malformed structure detection
     */
    private performComprehensiveValidation(nodes: GraphNode[]): HierarchyValidationResult {
        const criticalErrors: string[] = [];
        const warnings: string[] = [];
        const malformedStructures: MalformedStructure[] = [];
        const suggestedFixes: HierarchyFix[] = [];

        // 1. Basic validation checks
        this.validateBasicStructure(nodes, criticalErrors, warnings);

        // 2. Detect malformed structures
        this.detectMalformedStructures(nodes, malformedStructures, warnings);

        // 3. Generate suggested fixes
        this.generateSuggestedFixes(nodes, malformedStructures, suggestedFixes);

        // 4. Validate hierarchy consistency
        this.validateHierarchyConsistency(nodes, criticalErrors, warnings);

        return {
            isValid: criticalErrors.length === 0,
            criticalErrors,
            warnings,
            malformedStructures,
            suggestedFixes
        };
    }

    /**
     * Validate basic node structure requirements
     */
    private validateBasicStructure(nodes: GraphNode[], criticalErrors: string[], warnings: string[]): void {
        // Check for empty nodes array
        if (!nodes || nodes.length === 0) {
            criticalErrors.push('Nodes array cannot be empty');
            return;
        }

        // Check for duplicate IDs
        const ids = nodes.map(node => node.id);
        const uniqueIds = new Set(ids);
        if (ids.length !== uniqueIds.size) {
            const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
            criticalErrors.push(`Duplicate node IDs found: ${duplicates.join(', ')}`);
        }

        // Check for valid node properties
        for (const node of nodes) {
            if (!node.id || typeof node.id !== 'string') {
                criticalErrors.push(`Invalid node ID: ${node.id}`);
            }

            if (!node.title || typeof node.title !== 'string') {
                criticalErrors.push(`Invalid node title for node ${node.id}`);
            }

            if (typeof node.level !== 'number' || node.level < 1) {
                criticalErrors.push(`Invalid level ${node.level} for node ${node.id}`);
            }

            if (node.level > (this.options.maxDepth || 10)) {
                warnings.push(`Node ${node.id} exceeds maximum depth ${this.options.maxDepth}`);
            }
        }
    }

    /**
     * Detect various types of malformed hierarchy structures
     */
    private detectMalformedStructures(nodes: GraphNode[], malformedStructures: MalformedStructure[], warnings: string[]): void {
        // Sort nodes by level for analysis
        const sortedNodes = [...nodes].sort((a, b) => a.level - b.level);

        // 1. Detect level gaps
        this.detectLevelGaps(sortedNodes, malformedStructures);

        // 2. Detect orphaned nodes
        this.detectOrphanedNodes(sortedNodes, malformedStructures);

        // 3. Detect invalid progressions
        this.detectInvalidProgressions(sortedNodes, malformedStructures);

        // 4. Detect missing parents
        this.detectMissingParents(sortedNodes, malformedStructures);

        // 5. Detect potential circular dependencies
        this.detectCircularDependencies(nodes, malformedStructures);
    }

    /**
     * Detect gaps in hierarchy levels
     */
    private detectLevelGaps(sortedNodes: GraphNode[], malformedStructures: MalformedStructure[]): void {
        const levels = [...new Set(sortedNodes.map(node => node.level))].sort((a, b) => a - b);

        for (let i = 1; i < levels.length; i++) {
            const currentLevel = levels[i];
            const previousLevel = levels[i - 1];
            const gap = currentLevel - previousLevel;

            if (gap > 1) {
                const affectedNodes = sortedNodes.filter(node => node.level === currentLevel);
                malformedStructures.push({
                    type: 'level_gap',
                    nodeIds: affectedNodes.map(node => node.id),
                    description: `Level gap detected: jump from level ${previousLevel} to ${currentLevel} (gap of ${gap - 1})`,
                    severity: gap > 2 ? 'critical' : 'warning'
                });
            }
        }
    }

    /**
     * Detect nodes that appear to be orphaned (no logical parent)
     */
    private detectOrphanedNodes(sortedNodes: GraphNode[], malformedStructures: MalformedStructure[]): void {
        for (let i = 1; i < sortedNodes.length; i++) {
            const currentNode = sortedNodes[i];
            const potentialParents = sortedNodes.slice(0, i).filter(node => node.level < currentNode.level);

            if (potentialParents.length === 0 && currentNode.level > 1) {
                malformedStructures.push({
                    type: 'orphaned_node',
                    nodeIds: [currentNode.id],
                    description: `Node "${currentNode.title}" at level ${currentNode.level} has no potential parents`,
                    severity: 'warning'
                });
            }
        }
    }

    /**
     * Detect invalid hierarchy progressions
     */
    private detectInvalidProgressions(sortedNodes: GraphNode[], malformedStructures: MalformedStructure[]): void {
        for (let i = 1; i < sortedNodes.length; i++) {
            const currentNode = sortedNodes[i];
            const previousNode = sortedNodes[i - 1];

            // Check for nodes at the same level that might be duplicates
            if (currentNode.level === previousNode.level) {
                const similarity = this.calculateContentSimilarity(currentNode, previousNode);
                if (similarity > 0.8) {
                    malformedStructures.push({
                        type: 'invalid_progression',
                        nodeIds: [previousNode.id, currentNode.id],
                        description: `Nodes "${previousNode.title}" and "${currentNode.title}" are very similar and might be duplicates`,
                        severity: 'info'
                    });
                }
            }
        }
    }

    /**
     * Detect nodes that should have parents but don't
     */
    private detectMissingParents(sortedNodes: GraphNode[], malformedStructures: MalformedStructure[]): void {
        for (const node of sortedNodes) {
            if (node.level > 1) {
                const hasDirectParent = sortedNodes.some(potentialParent =>
                    potentialParent.level === node.level - 1 &&
                    sortedNodes.indexOf(potentialParent) < sortedNodes.indexOf(node)
                );

                if (!hasDirectParent) {
                    malformedStructures.push({
                        type: 'missing_parent',
                        nodeIds: [node.id],
                        description: `Node "${node.title}" at level ${node.level} is missing a direct parent at level ${node.level - 1}`,
                        severity: 'warning'
                    });
                }
            }
        }
    }

    /**
     * Detect potential circular dependencies in content references
     */
    private detectCircularDependencies(nodes: GraphNode[], malformedStructures: MalformedStructure[]): void {
        // Build a simple reference graph based on content mentions
        const references = new Map<string, string[]>();

        for (const node of nodes) {
            const nodeRefs: string[] = [];
            const content = (node.title + ' ' + node.content).toLowerCase();

            for (const otherNode of nodes) {
                if (otherNode.id !== node.id) {
                    const otherTitle = otherNode.title.toLowerCase();
                    if (content.includes(otherTitle) && otherTitle.length > 3) {
                        nodeRefs.push(otherNode.id);
                    }
                }
            }

            if (nodeRefs.length > 0) {
                references.set(node.id, nodeRefs);
            }
        }

        // Check for circular references
        for (const [nodeId, refs] of references) {
            for (const refId of refs) {
                const refRefs = references.get(refId) || [];
                if (refRefs.includes(nodeId)) {
                    malformedStructures.push({
                        type: 'circular_dependency',
                        nodeIds: [nodeId, refId],
                        description: `Potential circular reference between "${nodes.find(n => n.id === nodeId)?.title}" and "${nodes.find(n => n.id === refId)?.title}"`,
                        severity: 'info'
                    });
                }
            }
        }
    }

    /**
     * Generate suggested fixes for detected issues
     */
    private generateSuggestedFixes(nodes: GraphNode[], malformedStructures: MalformedStructure[], suggestedFixes: HierarchyFix[]): void {
        for (const structure of malformedStructures) {
            switch (structure.type) {
                case 'level_gap':
                    suggestedFixes.push({
                        type: 'insert_intermediate_level',
                        targetNodeIds: structure.nodeIds,
                        description: `Insert intermediate level nodes to bridge the gap`,
                        autoApplicable: false
                    });
                    break;

                case 'orphaned_node':
                    suggestedFixes.push({
                        type: 'create_parent',
                        targetNodeIds: structure.nodeIds,
                        description: `Create a parent node or adjust the level of orphaned nodes`,
                        autoApplicable: true
                    });
                    break;

                case 'missing_parent':
                    suggestedFixes.push({
                        type: 'adjust_level',
                        targetNodeIds: structure.nodeIds,
                        description: `Adjust node level or create missing parent node`,
                        autoApplicable: true
                    });
                    break;

                case 'invalid_progression':
                    suggestedFixes.push({
                        type: 'merge_nodes',
                        targetNodeIds: structure.nodeIds,
                        description: `Consider merging similar nodes or differentiating their content`,
                        autoApplicable: false
                    });
                    break;

                case 'circular_dependency':
                    suggestedFixes.push({
                        type: 'remove_node',
                        targetNodeIds: structure.nodeIds,
                        description: `Review and resolve circular references in content`,
                        autoApplicable: false
                    });
                    break;
            }
        }
    }

    /**
     * Validate overall hierarchy consistency
     */
    private validateHierarchyConsistency(nodes: GraphNode[], criticalErrors: string[], warnings: string[]): void {
        const sortedNodes = [...nodes].sort((a, b) => a.level - b.level);

        // Check for reasonable hierarchy depth
        const maxLevel = Math.max(...nodes.map(node => node.level));
        const minLevel = Math.min(...nodes.map(node => node.level));

        if (maxLevel - minLevel > 8) {
            warnings.push(`Very deep hierarchy detected (${maxLevel - minLevel + 1} levels). Consider flattening.`);
        }

        // Check for balanced distribution
        const levelCounts = new Map<number, number>();
        for (const node of nodes) {
            levelCounts.set(node.level, (levelCounts.get(node.level) || 0) + 1);
        }

        const counts = Array.from(levelCounts.values());
        const maxCount = Math.max(...counts);
        const minCount = Math.min(...counts);

        if (maxCount / minCount > 10) {
            warnings.push(`Unbalanced hierarchy detected. Some levels have significantly more nodes than others.`);
        }

        // Check for reasonable progression
        for (let i = 1; i < sortedNodes.length; i++) {
            const prevLevel = sortedNodes[i - 1].level;
            const currentLevel = sortedNodes[i].level;

            if (currentLevel - prevLevel > 3) {
                warnings.push(
                    `Large level jump from ${prevLevel} to ${currentLevel} ` +
                    `between nodes "${sortedNodes[i - 1].title}" and "${sortedNodes[i].title}"`
                );
            }
        }
    }

    /**
     * Get hierarchy statistics
     */
    getHierarchyStatistics(processedHierarchy: ProcessedHierarchy): {
        averageDepth: number;
        hierarchyBalance: number; // 0-1, higher means more balanced
        branchingFactor: number; // Average children per parent
    } {
        const { relationships, metadata } = processedHierarchy;

        // Calculate average depth
        let totalDepth = 0;
        let nodeCount = 0;
        for (const [depth, count] of Object.entries(metadata.nodesByDepth)) {
            totalDepth += parseInt(depth) * count;
            nodeCount += count;
        }
        const averageDepth = nodeCount > 0 ? totalDepth / nodeCount : 0;

        // Calculate hierarchy balance (how evenly distributed nodes are across levels)
        const depthCounts = Object.values(metadata.nodesByDepth);
        const maxCount = Math.max(...depthCounts);
        const minCount = Math.min(...depthCounts);
        const hierarchyBalance = maxCount > 0 ? minCount / maxCount : 1;

        // Calculate branching factor
        const parentChildCount = new Map<string, number>();
        for (const rel of relationships) {
            if (rel.edgeType === 'dependency') { // Only direct relationships
                parentChildCount.set(
                    rel.parentId,
                    (parentChildCount.get(rel.parentId) || 0) + 1
                );
            }
        }
        const totalChildren = Array.from(parentChildCount.values()).reduce((sum, count) => sum + count, 0);
        const branchingFactor = parentChildCount.size > 0 ? totalChildren / parentChildCount.size : 0;

        return {
            averageDepth,
            hierarchyBalance,
            branchingFactor
        };
    }

    /**
     * Find all descendants of a node
     */
    findDescendants(nodeId: string, relationships: HierarchyRelationship[]): string[] {
        const descendants: string[] = [];
        const visited = new Set<string>();

        const findChildren = (parentId: string) => {
            if (visited.has(parentId)) return; // Prevent cycles
            visited.add(parentId);

            for (const rel of relationships) {
                if (rel.parentId === parentId && rel.edgeType === 'dependency') {
                    descendants.push(rel.childId);
                    findChildren(rel.childId); // Recursive search
                }
            }
        };

        findChildren(nodeId);
        return descendants;
    }

    /**
     * Find all ancestors of a node
     */
    findAncestors(nodeId: string, relationships: HierarchyRelationship[]): string[] {
        const ancestors: string[] = [];
        const visited = new Set<string>();

        const findParents = (childId: string) => {
            if (visited.has(childId)) return; // Prevent cycles
            visited.add(childId);

            for (const rel of relationships) {
                if (rel.childId === childId && rel.edgeType === 'dependency') {
                    ancestors.push(rel.parentId);
                    findParents(rel.parentId); // Recursive search
                }
            }
        };

        findParents(nodeId);
        return ancestors;
    }
}

/**
 * Factory function để create HierarchyProcessor với options
 */
export function createHierarchyProcessor(options?: HierarchyProcessingOptions): HierarchyProcessor {
    return new HierarchyProcessor(options);
}

/**
 * Utility function để process hierarchy từ nodes
 */
export function processNodeHierarchy(
    nodes: GraphNode[],
    options?: HierarchyProcessingOptions
): ProcessedHierarchy {
    const processor = createHierarchyProcessor(options);
    return processor.process(nodes);
}

/**
 * Utility function để validate hierarchy structure
 */
export function validateHierarchyStructure(
    nodes: GraphNode[],
    options?: HierarchyProcessingOptions
): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
        const processor = createHierarchyProcessor({ ...options, validateHierarchy: true });
        processor.process(nodes);
    } catch (error) {
        errors.push(error instanceof Error ? error.message : String(error));
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}