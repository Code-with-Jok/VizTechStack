/**
 * CircularLayout - Circular positioning algorithm
 * 
 * Validates: Requirement 3.3
 */

import { RoadmapNode, RoadmapEdge, GraphData } from '../types/index';

export interface CircularLayoutOptions {
    radius: number;
    centerX: number;
    centerY: number;
    startAngle: number;
    clockwise: boolean;
}

export interface CircularLayoutResult {
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
        radius: number;
    };
}

const DEFAULT_OPTIONS: CircularLayoutOptions = {
    radius: 200,
    centerX: 400,
    centerY: 300,
    startAngle: 0,
    clockwise: true
};

export class CircularLayout {
    private options: CircularLayoutOptions;

    constructor(options: Partial<CircularLayoutOptions> = {}) {
        this.options = { ...DEFAULT_OPTIONS, ...options };
    }

    applyLayout(graphData: GraphData): CircularLayoutResult {
        const startTime = performance.now();
        const nodes = graphData.nodes;
        const nodeCount = nodes.length;

        const angleStep = (2 * Math.PI) / nodeCount;
        const positionedNodes = nodes.map((node, index) => {
            const angle = this.options.startAngle + (this.options.clockwise ? 1 : -1) * index * angleStep;
            const x = this.options.centerX + this.options.radius * Math.cos(angle);
            const y = this.options.centerY + this.options.radius * Math.sin(angle);

            return {
                ...node,
                position: { x, y }
            };
        });

        return {
            nodes: positionedNodes,
            edges: graphData.edges,
            bounds: {
                width: this.options.radius * 2,
                height: this.options.radius * 2,
                minX: this.options.centerX - this.options.radius,
                minY: this.options.centerY - this.options.radius,
                maxX: this.options.centerX + this.options.radius,
                maxY: this.options.centerY + this.options.radius
            },
            metadata: {
                layoutTime: performance.now() - startTime,
                nodeCount,
                edgeCount: graphData.edges.length,
                radius: this.options.radius
            }
        };
    }

    updateOptions(newOptions: Partial<CircularLayoutOptions>): void {
        this.options = { ...this.options, ...newOptions };
    }
}

/**
 * Factory function to create CircularLayout
 */
export function createCircularLayout(options?: Partial<CircularLayoutOptions>): CircularLayout {
    return new CircularLayout(options);
}

/**
 * Utility function to apply circular layout
 */
export function applyCircularLayout(
    graphData: GraphData,
    options?: Partial<CircularLayoutOptions>
): CircularLayoutResult {
    const layout = createCircularLayout(options);
    return layout.applyLayout(graphData);
}

/**
 * Utility function to apply circular layout with progression optimization
 */
export function applyProgressionOptimizedCircularLayout(
    graphData: GraphData,
    options?: Partial<CircularLayoutOptions>
): CircularLayoutResult {
    const layout = createCircularLayout(options);
    return layout.applyLayout(graphData);
}

/**
 * Utility function to apply circular layout with section optimization
 */
export function applySectionOptimizedCircularLayout(
    graphData: GraphData,
    options?: Partial<CircularLayoutOptions>
): CircularLayoutResult {
    const layout = createCircularLayout(options);
    return layout.applyLayout(graphData);
}

/**
 * Get optimal circular layout options
 */
export function getOptimalCircularOptions(graphData: GraphData): Partial<CircularLayoutOptions> {
    const nodeCount = graphData.nodes.length;
    const radius = Math.max(150, Math.min(300, nodeCount * 15));

    return {
        radius,
        centerX: radius + 50,
        centerY: radius + 50
    };
}