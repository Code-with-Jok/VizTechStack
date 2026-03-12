/**
 * ForceDirectedLayout - Physics-based positioning algorithm using d3-force
 * 
 * Validates: Requirement 3.2
 */

import {
    forceSimulation,
    forceLink,
    forceCenter,
    forceManyBody,
    forceCollide,
    forceX,
    forceY,
    SimulationNodeDatum,
    SimulationLinkDatum,
    Simulation
} from 'd3-force';
import { RoadmapNode, RoadmapEdge, GraphData, Position } from '../types/index';

export interface ForceDirectedLayoutOptions {
    width: number;
    height: number;
    centerStrength: number;
    linkStrength: number;
    linkDistance: number;
    chargeStrength: number;
    collisionRadius: number;
    alphaDecay: number;
    velocityDecay: number;
    iterations: number;
    enableCollision: boolean;
    enableCentering: boolean;
    strengthByType: {
        dependency: number;
        progression: number;
        related: number;
        optional: number;
    };
}

export interface ForceDirectedLayoutResult {
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
        iterations: number;
        finalAlpha: number;
    };
}

const DEFAULT_OPTIONS: ForceDirectedLayoutOptions = {
    width: 1200,
    height: 800,
    centerStrength: 0.1,
    linkStrength: 0.3,
    linkDistance: 100,
    chargeStrength: -300,
    collisionRadius: 40,
    alphaDecay: 0.02,
    velocityDecay: 0.4,
    iterations: 300,
    enableCollision: true,
    enableCentering: true,
    strengthByType: {
        dependency: 0.8,
        progression: 0.6,
        related: 0.3,
        optional: 0.2
    }
};
interface ForceNode extends SimulationNodeDatum {
    id: string;
    originalNode: RoadmapNode;
    radius: number;
    level: number;
}

interface ForceLink extends SimulationLinkDatum<ForceNode> {
    id: string;
    originalEdge: RoadmapEdge;
    strength: number;
    distance: number;
}

export class ForceDirectedLayout {
    private options: ForceDirectedLayoutOptions;
    private simulation: Simulation<ForceNode, ForceLink> | null = null;

    constructor(options: Partial<ForceDirectedLayoutOptions> = {}) {
        this.options = { ...DEFAULT_OPTIONS, ...options };
    }

    /**
     * Apply force-directed layout to graph data
     * Uses physics simulation for dynamic positioning with configurable forces
     */
    applyLayout(graphData: GraphData): ForceDirectedLayoutResult {
        const startTime = performance.now();

        // Validate input
        this.validateInput(graphData);

        // Prepare nodes and links for d3-force
        const forceNodes = this.prepareNodes(graphData.nodes);
        const forceLinks = this.prepareLinks(graphData.edges, forceNodes);

        // Create and configure simulation
        this.simulation = this.createSimulation(forceNodes, forceLinks);

        // Run simulation
        const finalAlpha = this.runSimulation();

        // Extract positioned nodes
        const positionedNodes = this.extractPositionedNodes(forceNodes);

        // Calculate bounds
        const bounds = this.calculateBounds(positionedNodes);

        const layoutTime = performance.now() - startTime;

        return {
            nodes: positionedNodes,
            edges: graphData.edges,
            bounds,
            metadata: {
                layoutTime,
                nodeCount: graphData.nodes.length,
                edgeCount: graphData.edges.length,
                iterations: this.options.iterations,
                finalAlpha
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

        if (graphData.nodes.length > 1000) {
            console.warn('Large graph detected. Consider using hierarchical layout for better performance.');
        }
    }
    /**
     * Prepare nodes for d3-force simulation
     */
    private prepareNodes(nodes: RoadmapNode[]): ForceNode[] {
        return nodes.map(node => {
            const radius = this.calculateNodeRadius(node);
            const level = node.data.level || 0;

            return {
                id: node.id,
                originalNode: node,
                radius,
                level,
                // Initialize position if available, otherwise let d3 handle it
                x: node.position?.x,
                y: node.position?.y
            };
        });
    }

    /**
     * Prepare links for d3-force simulation
     */
    private prepareLinks(edges: RoadmapEdge[], nodes: ForceNode[]): ForceLink[] {
        const nodeMap = new Map(nodes.map(n => [n.id, n]));

        return edges
            .filter(edge => nodeMap.has(edge.source) && nodeMap.has(edge.target))
            .map(edge => {
                const strength = this.calculateLinkStrength(edge);
                const distance = this.calculateLinkDistance(edge, nodeMap);

                return {
                    id: edge.id,
                    originalEdge: edge,
                    source: nodeMap.get(edge.source)!,
                    target: nodeMap.get(edge.target)!,
                    strength,
                    distance
                };
            });
    }

    /**
     * Calculate node radius based on content and type
     */
    private calculateNodeRadius(node: RoadmapNode): number {
        const baseRadius = this.options.collisionRadius;

        // Adjust radius based on node type
        switch (node.type) {
            case 'milestone':
                return baseRadius * 1.3;
            case 'topic':
                return baseRadius * 1.1;
            case 'skill':
                return baseRadius;
            case 'resource':
                return baseRadius * 0.8;
            case 'prerequisite':
                return baseRadius * 0.9;
            default:
                return baseRadius;
        }
    }

    /**
     * Calculate link strength based on relationship type
     */
    private calculateLinkStrength(edge: RoadmapEdge): number {
        const baseStrength = this.options.linkStrength;
        const typeStrength = this.options.strengthByType[edge.type] || 1;
        const edgeStrength = edge.data?.strength || 1;

        return baseStrength * typeStrength * edgeStrength;
    }

    /**
     * Calculate link distance based on relationship and node levels
     */
    private calculateLinkDistance(edge: RoadmapEdge, nodeMap: Map<string, ForceNode>): number {
        const baseDistance = this.options.linkDistance;
        const sourceNode = nodeMap.get(edge.source);
        const targetNode = nodeMap.get(edge.target);

        if (!sourceNode || !targetNode) {
            return baseDistance;
        }

        // Adjust distance based on level difference
        const levelDiff = Math.abs(targetNode.level - sourceNode.level);
        const levelMultiplier = 1 + (levelDiff * 0.2);

        // Adjust distance based on relationship type
        let typeMultiplier = 1;
        switch (edge.type) {
            case 'dependency':
                typeMultiplier = 0.8; // Closer for dependencies
                break;
            case 'progression':
                typeMultiplier = 0.9; // Slightly closer for progression
                break;
            case 'related':
                typeMultiplier = 1.2; // Further for related topics
                break;
            case 'optional':
                typeMultiplier = 1.5; // Furthest for optional connections
                break;
        }

        return baseDistance * levelMultiplier * typeMultiplier;
    }
    /**
     * Create and configure d3-force simulation
     */
    private createSimulation(nodes: ForceNode[], links: ForceLink[]): Simulation<ForceNode, ForceLink> {
        const simulation = forceSimulation<ForceNode>(nodes);

        // Configure simulation parameters
        simulation
            .alphaDecay(this.options.alphaDecay)
            .velocityDecay(this.options.velocityDecay);

        // Add centering force
        if (this.options.enableCentering) {
            simulation.force('center', forceCenter(
                this.options.width / 2,
                this.options.height / 2
            ).strength(this.options.centerStrength));
        }

        // Add link force for attraction/repulsion
        simulation.force('link', forceLink<ForceNode, ForceLink>(links)
            .id(d => d.id)
            .strength(d => d.strength)
            .distance(d => d.distance));

        // Add charge force for repulsion between nodes
        simulation.force('charge', forceManyBody<ForceNode>()
            .strength(this.options.chargeStrength));

        // Add collision detection
        if (this.options.enableCollision) {
            simulation.force('collision', forceCollide<ForceNode>()
                .radius(d => d.radius)
                .strength(0.8));
        }

        // Add level-based positioning forces
        this.addLevelForces(simulation, nodes);

        return simulation;
    }

    /**
     * Add level-based positioning forces for better topic progression layout
     */
    private addLevelForces(simulation: Simulation<ForceNode, ForceLink>, nodes: ForceNode[]): void {
        // Group nodes by level
        const nodesByLevel = new Map<number, ForceNode[]>();
        nodes.forEach(node => {
            const level = node.level;
            if (!nodesByLevel.has(level)) {
                nodesByLevel.set(level, []);
            }
            nodesByLevel.get(level)!.push(node);
        });

        // Add Y-positioning force based on level (for vertical progression)
        const levels = Array.from(nodesByLevel.keys()).sort((a, b) => a - b);
        const levelHeight = this.options.height / (levels.length + 1);

        simulation.force('levelY', forceY<ForceNode>()
            .y(d => {
                const levelIndex = levels.indexOf(d.level);
                return (levelIndex + 1) * levelHeight;
            })
            .strength(0.3));

        // Add weak X-centering to prevent extreme horizontal spread
        simulation.force('levelX', forceX<ForceNode>()
            .x(this.options.width / 2)
            .strength(0.1));
    }
    /**
     * Run the simulation for specified iterations
     */
    private runSimulation(): number {
        if (!this.simulation) {
            throw new Error('Simulation not initialized');
        }

        // Run simulation for specified iterations
        for (let i = 0; i < this.options.iterations; i++) {
            this.simulation.tick();
        }

        const finalAlpha = this.simulation.alpha();

        // Stop the simulation
        this.simulation.stop();

        return finalAlpha;
    }

    /**
     * Extract positioned nodes from simulation
     */
    private extractPositionedNodes(forceNodes: ForceNode[]): RoadmapNode[] {
        return forceNodes.map(forceNode => ({
            ...forceNode.originalNode,
            position: {
                x: forceNode.x || 0,
                y: forceNode.y || 0
            }
        }));
    }

    /**
     * Calculate layout bounds
     */
    private calculateBounds(nodes: RoadmapNode[]): ForceDirectedLayoutResult['bounds'] {
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
            const radius = this.calculateNodeRadius(node);

            minX = Math.min(minX, x - radius);
            minY = Math.min(minY, y - radius);
            maxX = Math.max(maxX, x + radius);
            maxY = Math.max(maxY, y + radius);
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
     * Update layout options
     */
    updateOptions(newOptions: Partial<ForceDirectedLayoutOptions>): void {
        this.options = { ...this.options, ...newOptions };
    }

    /**
     * Get current layout options
     */
    getOptions(): ForceDirectedLayoutOptions {
        return { ...this.options };
    }
    /**
     * Calculate optimal options for relationship exploration
     */
    calculateRelationshipOptimizedLayout(graphData: GraphData): Partial<ForceDirectedLayoutOptions> {
        const nodeCount = graphData.nodes.length;
        const edgeCount = graphData.edges.length;
        const density = edgeCount / (nodeCount * (nodeCount - 1) / 2);

        // Adjust forces based on graph density
        let chargeStrength = this.options.chargeStrength;
        let linkStrength = this.options.linkStrength;
        let linkDistance = this.options.linkDistance;
        let collisionRadius = this.options.collisionRadius;

        if (density > 0.3) {
            // High density - increase repulsion, reduce link strength
            chargeStrength *= 1.5;
            linkStrength *= 0.7;
            linkDistance *= 1.2;
        } else if (density < 0.1) {
            // Low density - reduce repulsion, increase link strength
            chargeStrength *= 0.7;
            linkStrength *= 1.3;
            linkDistance *= 0.8;
        }

        // Adjust for node count
        if (nodeCount > 100) {
            chargeStrength *= 0.8;
            collisionRadius *= 0.9;
        } else if (nodeCount < 20) {
            chargeStrength *= 1.2;
            collisionRadius *= 1.1;
        }

        // Analyze relationship types
        const relationshipTypes = new Set(graphData.edges.map(e => e.type));
        const strengthByType = { ...this.options.strengthByType };

        if (relationshipTypes.has('dependency')) {
            strengthByType.dependency = Math.min(1.0, strengthByType.dependency * 1.2);
        }

        if (relationshipTypes.has('progression')) {
            strengthByType.progression = Math.min(0.8, strengthByType.progression * 1.1);
        }

        return {
            chargeStrength,
            linkStrength,
            linkDistance,
            collisionRadius,
            strengthByType,
            iterations: Math.max(200, Math.min(500, nodeCount * 2))
        };
    }

    /**
     * Apply clustering force to group related nodes
     */
    applyClustering(nodes: ForceNode[], clusterKey: keyof RoadmapNode['data'] = 'section'): void {
        if (!this.simulation) return;

        // Group nodes by cluster key
        const clusters = new Map<string, ForceNode[]>();
        nodes.forEach(node => {
            const clusterValue = String(node.originalNode.data[clusterKey] || 'default');
            if (!clusters.has(clusterValue)) {
                clusters.set(clusterValue, []);
            }
            clusters.get(clusterValue)!.push(node);
        });

        // Add clustering force
        this.simulation.force('cluster', () => {
            clusters.forEach(clusterNodes => {
                if (clusterNodes.length < 2) return;

                // Calculate cluster center
                const centerX = clusterNodes.reduce((sum, n) => sum + (n.x || 0), 0) / clusterNodes.length;
                const centerY = clusterNodes.reduce((sum, n) => sum + (n.y || 0), 0) / clusterNodes.length;

                // Apply clustering force
                clusterNodes.forEach(node => {
                    const dx = centerX - (node.x || 0);
                    const dy = centerY - (node.y || 0);
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance > 0) {
                        const strength = 0.1;
                        node.vx = (node.vx || 0) + dx * strength;
                        node.vy = (node.vy || 0) + dy * strength;
                    }
                });
            });
        });
    }

    /**
     * Stop the simulation
     */
    stop(): void {
        if (this.simulation) {
            this.simulation.stop();
        }
    }

    /**
     * Restart the simulation with new parameters
     */
    restart(nodes?: ForceNode[], links?: ForceLink[]): void {
        if (!this.simulation) return;

        if (nodes) {
            this.simulation.nodes(nodes);
        }

        if (links) {
            const linkForce = this.simulation.force('link') as any;
            if (linkForce) {
                linkForce.links(links);
            }
        }

        this.simulation.alpha(1).restart();
    }
}
/**
 * Factory function to create ForceDirectedLayout
 */
export function createForceDirectedLayout(options?: Partial<ForceDirectedLayoutOptions>): ForceDirectedLayout {
    return new ForceDirectedLayout(options);
}

/**
 * Utility function to apply force-directed layout
 */
export function applyForceDirectedLayout(
    graphData: GraphData,
    options?: Partial<ForceDirectedLayoutOptions>
): ForceDirectedLayoutResult {
    const layout = createForceDirectedLayout(options);
    return layout.applyLayout(graphData);
}

/**
 * Utility function to apply force-directed layout with relationship optimization
 */
export function applyRelationshipOptimizedLayout(
    graphData: GraphData,
    options?: Partial<ForceDirectedLayoutOptions>
): ForceDirectedLayoutResult {
    const layout = createForceDirectedLayout();

    // Get optimal options for relationship exploration
    const optimalOptions = layout.calculateRelationshipOptimizedLayout(graphData);

    // Merge with user-provided options (user options take precedence)
    const finalOptions = {
        ...optimalOptions,
        ...options
    };

    layout.updateOptions(finalOptions);
    return layout.applyLayout(graphData);
}

/**
 * Get optimal force-directed options for relationship exploration
 */
export function getOptimalForceDirectedOptions(graphData: GraphData): Partial<ForceDirectedLayoutOptions> {
    const layout = new ForceDirectedLayout();
    return layout.calculateRelationshipOptimizedLayout(graphData);
}

/**
 * Create force-directed layout with clustering
 */
export function applyClusteredForceLayout(
    graphData: GraphData,
    clusterKey: keyof RoadmapNode['data'] = 'section',
    options?: Partial<ForceDirectedLayoutOptions>
): ForceDirectedLayoutResult {
    const layout = createForceDirectedLayout(options);

    // Apply basic layout first
    const result = layout.applyLayout(graphData);

    // Apply clustering if simulation is available
    // Note: This would require a more complex implementation for real-time clustering
    // For now, we return the basic result
    return result;
}