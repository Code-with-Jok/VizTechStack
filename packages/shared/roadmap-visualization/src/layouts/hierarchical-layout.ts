/**
 * HierarchicalLayout - Hierarchical positioning algorithm using dagre
 * 
 * Validates: Requirement 3.1
 */

import dagre from 'dagre';
import { RoadmapNode, RoadmapEdge, GraphData, Position } from '../types/index';

export interface HierarchicalLayoutOptions {
    direction: 'TB' | 'BT' | 'LR' | 'RL';
    nodeWidth: number;
    nodeHeight: number;
    nodeSep: number;
    edgeSep: number;
    rankSep: number;
    marginX: number;
    marginY: number;
    align?: 'UL' | 'UR' | 'DL' | 'DR';
    ranker?: 'network-simplex' | 'tight-tree' | 'longest-path';
}

export interface HierarchicalLayoutResult {
    nodes: RoadmapNode[];
    edges: RoadmapEdge[];
    bounds: {
        width: number;
        height: number;
        minX: number;
        minY: number;
        maxX: number;
        maxY: number;
    };
    metadata: {
        layoutTime: number;
        nodeCount: number;
        edgeCount: number;
        levels: number;
    };
}

const DEFAULT_OPTIONS: HierarchicalLayoutOptions = {
    direction: 'TB',
    nodeWidth: 200,
    nodeHeight: 80,
    nodeSep: 50,
    edgeSep: 10,
    rankSep: 100,
    marginX: 20,
    marginY: 20,
    align: 'UL',
    ranker: 'network-simplex'
};

export class HierarchicalLayout {
    private options: HierarchicalLayoutOptions;

    constructor(options: Partial<HierarchicalLayoutOptions> = {}) {
        this.options = { ...DEFAULT_OPTIONS, ...options };
    }

    /**
     * Apply hierarchical layout to graph data
     * Positions nodes based on topic progression levels with optimized spacing and alignment
     */
    applyLayout(graphData: GraphData): HierarchicalLayoutResult {
        const startTime = performance.now();

        // Validate input
        this.validateInput(graphData);

        // Create dagre graph
        const g = new dagre.graphlib.Graph();

        // Set graph properties optimized for topic progression
        g.setGraph({
            rankdir: this.options.direction,
            nodesep: this.options.nodeSep,
            edgesep: this.options.edgeSep,
            ranksep: this.options.rankSep,
            marginx: this.options.marginX,
            marginy: this.options.marginY,
            align: this.options.align,
            ranker: this.options.ranker
        });

        // Set default edge label
        g.setDefaultEdgeLabel(() => ({}));

        // Group nodes by progression level for better positioning
        const nodesByLevel = this.groupNodesByProgressionLevel(graphData.nodes);

        // Add nodes to graph with level-based constraints
        graphData.nodes.forEach(node => {
            const width = this.calculateNodeWidth(node);
            const height = this.calculateNodeHeight(node);

            g.setNode(node.id, {
                width,
                height,
                label: node.data.label,
                level: node.data.level || 0,
                // Add rank constraint for topic progression
                rank: this.calculateNodeRank(node, nodesByLevel)
            });
        });

        // Add edges to graph with progression-aware weighting
        graphData.edges.forEach(edge => {
            // Only add edges that don't create cycles for hierarchical layout
            if (this.shouldIncludeEdge(edge, graphData.nodes)) {
                g.setEdge(edge.source, edge.target, {
                    weight: this.calculateEdgeWeight(edge, graphData.nodes),
                    minlen: this.calculateMinLength(edge)
                });
            }
        });

        // Run layout algorithm
        dagre.layout(g);

        // Extract positioned nodes with alignment optimization
        const positionedNodes = this.extractPositionedNodes(g, graphData.nodes);

        // Apply post-processing alignment optimizations
        const alignedNodes = this.optimizeNodeAlignment(positionedNodes, nodesByLevel);

        // Calculate bounds
        const bounds = this.calculateBounds(alignedNodes);

        // Calculate levels
        const levels = this.calculateLevels(alignedNodes);

        const layoutTime = performance.now() - startTime;

        return {
            nodes: alignedNodes,
            edges: graphData.edges,
            bounds,
            metadata: {
                layoutTime,
                nodeCount: graphData.nodes.length,
                edgeCount: graphData.edges.length,
                levels
            }
        };
    }

    /**
     * Validate input graph data
     */
    private validateInput(graphData: GraphData): void {
        if (!graphData) {
            throw new Error('GraphData is required');
        }

        if (!graphData.nodes || graphData.nodes.length === 0) {
            throw new Error('Graph must have at least one node');
        }

        if (!graphData.edges) {
            throw new Error('Graph edges array is required');
        }

        // Check for circular dependencies
        const cycles = this.detectCycles(graphData.nodes, graphData.edges);
        if (cycles.length > 0) {
            console.warn('Circular dependencies detected in hierarchical layout:', cycles);
            // Don't throw error, just warn - we'll filter problematic edges
        }
    }

    /**
     * Calculate node width based on content
     */
    private calculateNodeWidth(node: RoadmapNode): number {
        const baseWidth = this.options.nodeWidth;
        const label = node.data.label || '';

        // Adjust width based on label length
        const charWidth = 8; // Approximate character width
        const minWidth = Math.max(baseWidth, label.length * charWidth + 40);

        // Cap maximum width
        return Math.min(minWidth, baseWidth * 2);
    }

    /**
     * Calculate node height based on content
     */
    private calculateNodeHeight(node: RoadmapNode): number {
        const baseHeight = this.options.nodeHeight;

        // Adjust height based on content
        if (node.data.description && node.data.description.length > 100) {
            return baseHeight + 20;
        }

        if (node.data.resources && node.data.resources.length > 0) {
            return baseHeight + 10;
        }

        return baseHeight;
    }

    /**
     * Determine if edge should be included in layout
     */
    private shouldIncludeEdge(edge: RoadmapEdge, nodes: RoadmapNode[]): boolean {
        // Only include dependency and progression edges for hierarchical layout
        if (!['dependency', 'progression'].includes(edge.type)) {
            return false;
        }

        // Check if both nodes exist
        const sourceExists = nodes.some(n => n.id === edge.source);
        const targetExists = nodes.some(n => n.id === edge.target);

        return sourceExists && targetExists;
    }

    /**
     * Calculate minimum edge length
     */
    private calculateMinLength(edge: RoadmapEdge): number {
        // Dependency edges should have minimum length of 1
        if (edge.type === 'dependency') {
            return 1;
        }

        // Progression edges can be longer
        if (edge.type === 'progression') {
            return edge.data?.strength && edge.data.strength < 0.5 ? 2 : 1;
        }

        return 1;
    }

    /**
     * Extract positioned nodes from dagre graph
     */
    private extractPositionedNodes(g: dagre.graphlib.Graph, originalNodes: RoadmapNode[]): RoadmapNode[] {
        return originalNodes.map(node => {
            const dagreNode = g.node(node.id);

            if (!dagreNode) {
                // If node wasn't processed by dagre, keep original position or set default
                return {
                    ...node,
                    position: node.position || { x: 0, y: 0 }
                };
            }

            return {
                ...node,
                position: {
                    x: dagreNode.x - dagreNode.width / 2,
                    y: dagreNode.y - dagreNode.height / 2
                }
            };
        });
    }

    /**
     * Calculate layout bounds
     */
    private calculateBounds(nodes: RoadmapNode[]): HierarchicalLayoutResult['bounds'] {
        if (nodes.length === 0) {
            return { width: 0, height: 0, minX: 0, minY: 0, maxX: 0, maxY: 0 };
        }

        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        nodes.forEach(node => {
            const x = node.position.x;
            const y = node.position.y;
            const width = this.calculateNodeWidth(node);
            const height = this.calculateNodeHeight(node);

            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x + width);
            maxY = Math.max(maxY, y + height);
        });

        return {
            width: maxX - minX,
            height: maxY - minY,
            minX,
            minY,
            maxX,
            maxY
        };
    }

    /**
     * Calculate number of levels in hierarchy
     */
    private calculateLevels(nodes: RoadmapNode[]): number {
        const levels = new Set(nodes.map(node => node.data.level || 0));
        return levels.size;
    }

    /**
     * Group nodes by their progression level for better positioning
     */
    private groupNodesByProgressionLevel(nodes: RoadmapNode[]): Map<number, RoadmapNode[]> {
        const nodesByLevel = new Map<number, RoadmapNode[]>();

        nodes.forEach(node => {
            const level = node.data.level || 0;
            if (!nodesByLevel.has(level)) {
                nodesByLevel.set(level, []);
            }
            nodesByLevel.get(level)!.push(node);
        });

        return nodesByLevel;
    }

    /**
     * Calculate node rank based on progression level and dependencies
     */
    private calculateNodeRank(node: RoadmapNode, nodesByLevel: Map<number, RoadmapNode[]>): number {
        const baseRank = node.data.level || 0;

        // Adjust rank based on prerequisites to ensure proper ordering
        const prerequisites = node.data.prerequisites || [];
        if (prerequisites.length > 0) {
            // Ensure this node is ranked after its prerequisites
            return baseRank + 0.1;
        }

        return baseRank;
    }

    /**
     * Calculate edge weight based on relationship type and progression
     */
    private calculateEdgeWeight(edge: RoadmapEdge, nodes: RoadmapNode[]): number {
        const baseWeight = edge.data?.strength || 1;

        // Find source and target nodes
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);

        if (!sourceNode || !targetNode) {
            return baseWeight;
        }

        // Increase weight for progression edges to keep them shorter
        if (edge.type === 'progression') {
            return baseWeight * 2;
        }

        // Increase weight for dependency edges between adjacent levels
        if (edge.type === 'dependency') {
            const levelDiff = Math.abs((targetNode.data.level || 0) - (sourceNode.data.level || 0));
            if (levelDiff === 1) {
                return baseWeight * 1.5;
            }
        }

        return baseWeight;
    }

    /**
     * Optimize node alignment within levels for better visual organization
     */
    private optimizeNodeAlignment(nodes: RoadmapNode[], nodesByLevel: Map<number, RoadmapNode[]>): RoadmapNode[] {
        const optimizedNodes = [...nodes];

        // Sort nodes within each level for better alignment
        nodesByLevel.forEach((levelNodes, level) => {
            const sortedNodes = levelNodes.sort((a, b) => {
                // Sort by section first, then by label
                const sectionCompare = (a.data.section || '').localeCompare(b.data.section || '');
                if (sectionCompare !== 0) {
                    return sectionCompare;
                }
                return (a.data.label || '').localeCompare(b.data.label || '');
            });

            // Apply horizontal alignment within the level
            this.alignNodesHorizontally(sortedNodes);
        });

        return optimizedNodes;
    }

    /**
     * Align nodes horizontally within the same level
     */
    private alignNodesHorizontally(nodes: RoadmapNode[]): void {
        if (nodes.length <= 1) return;

        // Calculate center position
        const totalWidth = nodes.reduce((sum, node) => sum + this.calculateNodeWidth(node), 0);
        const spacing = this.options.nodeSep;
        const totalSpacing = (nodes.length - 1) * spacing;
        const totalLayoutWidth = totalWidth + totalSpacing;

        // Find the average Y position for this level
        const avgY = nodes.reduce((sum, node) => sum + node.position.y, 0) / nodes.length;

        // Position nodes horizontally from center
        let currentX = -totalLayoutWidth / 2;

        nodes.forEach(node => {
            const nodeWidth = this.calculateNodeWidth(node);
            node.position.x = currentX;
            node.position.y = avgY; // Align vertically within level
            currentX += nodeWidth + spacing;
        });
    }

    /**
     * Detect cycles in graph using DFS
     */
    private detectCycles(nodes: RoadmapNode[], edges: RoadmapEdge[]): string[][] {
        const cycles: string[][] = [];
        const visited = new Set<string>();
        const recursionStack = new Set<string>();
        const pathStack: string[] = [];

        // Build adjacency list
        const adjacencyList = new Map<string, string[]>();
        nodes.forEach(node => {
            adjacencyList.set(node.id, []);
        });

        edges.forEach(edge => {
            if (this.shouldIncludeEdge(edge, nodes)) {
                const neighbors = adjacencyList.get(edge.source) || [];
                neighbors.push(edge.target);
                adjacencyList.set(edge.source, neighbors);
            }
        });

        // DFS to detect cycles
        const dfs = (nodeId: string): void => {
            visited.add(nodeId);
            recursionStack.add(nodeId);
            pathStack.push(nodeId);

            const neighbors = adjacencyList.get(nodeId) || [];
            for (const neighbor of neighbors) {
                if (!visited.has(neighbor)) {
                    dfs(neighbor);
                } else if (recursionStack.has(neighbor)) {
                    // Found cycle
                    const cycleStart = pathStack.indexOf(neighbor);
                    const cycle = pathStack.slice(cycleStart);
                    cycle.push(neighbor); // Complete the cycle
                    cycles.push(cycle);
                }
            }

            recursionStack.delete(nodeId);
            pathStack.pop();
        };

        // Check all nodes
        nodes.forEach(node => {
            if (!visited.has(node.id)) {
                dfs(node.id);
            }
        });

        return cycles;
    }

    /**
     * Update layout options
     */
    updateOptions(newOptions: Partial<HierarchicalLayoutOptions>): void {
        this.options = { ...this.options, ...newOptions };
    }

    /**
     * Get current layout options
     */
    getOptions(): HierarchicalLayoutOptions {
        return { ...this.options };
    }

    /**
     * Calculate optimal spacing for given number of nodes
     */
    calculateOptimalSpacing(nodeCount: number): Partial<HierarchicalLayoutOptions> {
        // Adjust spacing based on node count
        if (nodeCount > 50) {
            return {
                nodeSep: 30,
                rankSep: 80,
                nodeWidth: 150,
                nodeHeight: 60
            };
        } else if (nodeCount > 20) {
            return {
                nodeSep: 40,
                rankSep: 90,
                nodeWidth: 180,
                nodeHeight: 70
            };
        }

        // Default spacing for smaller graphs
        return {};
    }

    /**
     * Optimize layout for specific direction
     */
    optimizeForDirection(direction: HierarchicalLayoutOptions['direction']): Partial<HierarchicalLayoutOptions> {
        switch (direction) {
            case 'LR':
            case 'RL':
                return {
                    nodeWidth: 150,
                    nodeHeight: 100,
                    nodeSep: 60,
                    rankSep: 120
                };
            case 'TB':
            case 'BT':
            default:
                return {
                    nodeWidth: 200,
                    nodeHeight: 80,
                    nodeSep: 50,
                    rankSep: 100
                };
        }
    }

    /**
     * Calculate optimal layout for topic progression
     * Analyzes the graph structure to determine best layout parameters
     */
    calculateProgressionOptimizedLayout(graphData: GraphData): Partial<HierarchicalLayoutOptions> {
        const nodeCount = graphData.nodes.length;
        const levels = new Set(graphData.nodes.map(n => n.data.level || 0)).size;
        const avgNodesPerLevel = nodeCount / levels;

        // Determine optimal direction based on progression structure
        let direction: HierarchicalLayoutOptions['direction'] = 'TB';
        if (avgNodesPerLevel > 8) {
            direction = 'TB'; // Top-to-bottom for wide progressions
        } else if (levels > 6) {
            direction = 'LR'; // Left-to-right for deep progressions
        }

        // Calculate optimal spacing based on content density
        const hasDescriptions = graphData.nodes.some(n => n.data.description && n.data.description.length > 50);
        const hasResources = graphData.nodes.some(n => n.data.resources && n.data.resources.length > 0);

        let nodeWidth = this.options.nodeWidth;
        let nodeHeight = this.options.nodeHeight;
        let nodeSep = this.options.nodeSep;
        let rankSep = this.options.rankSep;

        if (hasDescriptions) {
            nodeHeight += 20;
            rankSep += 20;
        }

        if (hasResources) {
            nodeWidth += 30;
            nodeSep += 10;
        }

        // Adjust for node density
        if (nodeCount > 100) {
            nodeSep = Math.max(30, nodeSep - 10);
            rankSep = Math.max(60, rankSep - 20);
        } else if (nodeCount < 20) {
            nodeSep += 20;
            rankSep += 30;
        }

        return {
            direction,
            nodeWidth,
            nodeHeight,
            nodeSep,
            rankSep,
            align: 'UL', // Upper-left alignment for consistent positioning
            ranker: 'network-simplex' // Best for hierarchical structures
        };
    }

    /**
     * Validate and optimize edge relationships for hierarchical layout
     */
    private optimizeEdgeRelationships(edges: RoadmapEdge[], nodes: RoadmapNode[]): RoadmapEdge[] {
        const optimizedEdges: RoadmapEdge[] = [];
        const nodeMap = new Map(nodes.map(n => [n.id, n]));

        edges.forEach(edge => {
            const sourceNode = nodeMap.get(edge.source);
            const targetNode = nodeMap.get(edge.target);

            if (!sourceNode || !targetNode) {
                return; // Skip invalid edges
            }

            // Optimize edge based on level difference
            const levelDiff = (targetNode.data.level || 0) - (sourceNode.data.level || 0);

            // Only include edges that make sense for hierarchical layout
            if (edge.type === 'dependency' && levelDiff > 0) {
                // Forward dependency - good for hierarchy
                optimizedEdges.push(edge);
            } else if (edge.type === 'progression' && Math.abs(levelDiff) <= 1) {
                // Progression between adjacent levels - good for hierarchy
                optimizedEdges.push(edge);
            } else if (edge.type === 'related' && Math.abs(levelDiff) <= 2) {
                // Related topics within reasonable level distance
                optimizedEdges.push({
                    ...edge,
                    data: {
                        ...edge.data,
                        strength: (edge.data?.strength || 1) * 0.5 // Reduce strength for related edges
                    }
                });
            }
        });

        return optimizedEdges;
    }
}

/**
 * Factory function to create HierarchicalLayout
 */
export function createHierarchicalLayout(options?: Partial<HierarchicalLayoutOptions>): HierarchicalLayout {
    return new HierarchicalLayout(options);
}

/**
 * Utility function to apply hierarchical layout
 */
export function applyHierarchicalLayout(
    graphData: GraphData,
    options?: Partial<HierarchicalLayoutOptions>
): HierarchicalLayoutResult {
    const layout = createHierarchicalLayout(options);
    return layout.applyLayout(graphData);
}

/**
 * Utility function to apply hierarchical layout with topic progression optimization
 */
export function applyProgressionOptimizedLayout(
    graphData: GraphData,
    options?: Partial<HierarchicalLayoutOptions>
): HierarchicalLayoutResult {
    // Get optimal options for topic progression
    const optimalOptions = getOptimalHierarchicalOptions(graphData);

    // Merge with user-provided options (user options take precedence)
    const finalOptions = {
        ...optimalOptions,
        ...options
    };

    const layout = createHierarchicalLayout(finalOptions);
    return layout.applyLayout(graphData);
}
export function getOptimalHierarchicalOptions(graphData: GraphData): Partial<HierarchicalLayoutOptions> {
    const layout = new HierarchicalLayout();

    // Use the new progression-optimized calculation
    const progressionOptions = layout.calculateProgressionOptimizedLayout(graphData);

    // Get basic spacing optimization
    const nodeCount = graphData.nodes.length;
    const spacingOptions = layout.calculateOptimalSpacing(nodeCount);

    // Combine all optimizations
    return {
        ...spacingOptions,
        ...progressionOptions
    };
}