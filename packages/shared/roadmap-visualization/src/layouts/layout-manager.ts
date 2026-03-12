/**
 * LayoutManager - Service for managing switching between layout algorithms
 * 
 * Validates: Requirement 3.5
 */

import type { RoadmapNode, RoadmapEdge, GraphData, LayoutType, Position } from '../types';
import type { LayoutOptions } from './types';
import {
    HierarchicalLayout,
    type HierarchicalLayoutOptions,
    type HierarchicalLayoutResult
} from './hierarchical-layout';
import {
    ForceDirectedLayout,
    type ForceDirectedLayoutOptions,
    type ForceDirectedLayoutResult
} from './force-directed-layout';
import {
    CircularLayout,
    type CircularLayoutOptions,
    type CircularLayoutResult
} from './circular-layout';
import {
    GridLayout,
    type GridLayoutOptions,
    type GridLayoutResult
} from './grid-layout';

export interface LayoutManagerOptions {
    enableAnimations: boolean;
    animationDuration: number;
    animationEasing: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
    preserveSelection: boolean;
    preserveViewport: boolean;
    fallbackLayout: LayoutType;
    transitionSteps: number;
    enableInterpolation: boolean;
    maxTransitionTime: number;
    onTransitionStart?: (fromLayout: LayoutType, toLayout: LayoutType) => void;
    onTransitionProgress?: (progress: number) => void;
    onTransitionComplete?: (layout: LayoutType) => void;
    onTransitionError?: (error: Error, layout: LayoutType) => void;
}

export interface LayoutTransition {
    id: string;
    fromLayout: LayoutType;
    toLayout: LayoutType;
    startTime: number;
    duration: number;
    progress: number;
    isActive: boolean;
    fromNodes: RoadmapNode[];
    toNodes: RoadmapNode[];
    currentNodes: RoadmapNode[];
}

export interface LayoutManagerState {
    currentLayout: LayoutType;
    previousLayout: LayoutType | null;
    isTransitioning: boolean;
    activeTransition: LayoutTransition | null;
    selectedNodeIds: Set<string>;
    viewportState: {
        zoom: number;
        centerX: number;
        centerY: number;
    } | null;
    layoutHistory: LayoutType[];
    lastLayoutOptions: Record<LayoutType, any>;
}

export interface LayoutManagerResult {
    nodes: RoadmapNode[];
    edges: RoadmapEdge[];
    layout: LayoutType;
    transitionId?: string;
    metadata: {
        layoutTime: number;
        transitionTime?: number;
        isTransitioning: boolean;
        preservedSelections: string[];
        layoutHistory: LayoutType[];
    };
}

const DEFAULT_OPTIONS: LayoutManagerOptions = {
    enableAnimations: true,
    animationDuration: 800,
    animationEasing: 'ease-in-out',
    preserveSelection: true,
    preserveViewport: true,
    fallbackLayout: 'grid',
    transitionSteps: 60,
    enableInterpolation: true,
    maxTransitionTime: 2000
};

export class LayoutManager {
    private options: LayoutManagerOptions;
    private state: LayoutManagerState;
    private layouts: {
        hierarchical: HierarchicalLayout;
        force: ForceDirectedLayout;
        circular: CircularLayout;
        grid: GridLayout;
    };
    private transitionTimer: number | null = null;
    private animationFrameId: number | null = null;

    constructor(options: Partial<LayoutManagerOptions> = {}) {
        this.options = { ...DEFAULT_OPTIONS, ...options };

        // Initialize state
        this.state = {
            currentLayout: 'hierarchical',
            previousLayout: null,
            isTransitioning: false,
            activeTransition: null,
            selectedNodeIds: new Set(),
            viewportState: null,
            layoutHistory: ['hierarchical'],
            lastLayoutOptions: {
                hierarchical: {},
                force: {},
                circular: {},
                grid: {}
            }
        };

        // Initialize layout instances
        this.layouts = {
            hierarchical: new HierarchicalLayout(),
            force: new ForceDirectedLayout(),
            circular: new CircularLayout(),
            grid: new GridLayout()
        };
    }

    /**
     * Switch to a different layout algorithm with smooth transition
     */
    async switchLayout(
        graphData: GraphData,
        targetLayout: LayoutType,
        layoutOptions: any = {}
    ): Promise<LayoutManagerResult> {
        const startTime = performance.now();

        try {
            // Validate inputs
            this.validateSwitchInputs(graphData, targetLayout);

            // If already using target layout, just reapply with new options
            if (this.state.currentLayout === targetLayout && !this.state.isTransitioning) {
                return this.applyLayout(graphData, targetLayout, layoutOptions);
            }

            // Cancel any active transition
            if (this.state.isTransitioning) {
                this.cancelActiveTransition();
            }

            // Store current state
            const fromLayout = this.state.currentLayout;
            const fromNodes = await this.getCurrentLayoutNodes(graphData);

            // Calculate target layout
            const toNodes = await this.calculateTargetLayout(graphData, targetLayout, layoutOptions);

            // Preserve selection and viewport if enabled
            if (this.options.preserveSelection) {
                this.preserveNodeSelection(fromNodes, toNodes);
            }

            if (this.options.preserveViewport) {
                this.preserveViewportState();
            }

            // Create transition if animations are enabled
            if (this.options.enableAnimations && fromLayout !== targetLayout) {
                const transition = this.createTransition(fromLayout, targetLayout, fromNodes, toNodes);
                return this.executeTransition(graphData, transition);
            } else {
                // Direct switch without animation
                return this.directSwitch(graphData, targetLayout, toNodes, startTime);
            }

        } catch (error) {
            return this.handleSwitchError(error, graphData, targetLayout, startTime);
        }
    }

    /**
     * Apply layout without transition (direct application)
     */
    async applyLayout(
        graphData: GraphData,
        layoutType: LayoutType,
        layoutOptions: any = {}
    ): Promise<LayoutManagerResult> {
        const startTime = performance.now();

        try {
            // Store layout options
            this.state.lastLayoutOptions[layoutType] = layoutOptions;

            // Apply the layout
            const result = await this.calculateLayout(graphData, layoutType, layoutOptions);

            // Update state
            this.updateStateAfterLayout(layoutType);

            const layoutTime = performance.now() - startTime;

            return {
                nodes: result.nodes,
                edges: graphData.edges,
                layout: layoutType,
                metadata: {
                    layoutTime,
                    isTransitioning: false,
                    preservedSelections: Array.from(this.state.selectedNodeIds),
                    layoutHistory: [...this.state.layoutHistory]
                }
            };

        } catch (error) {
            return this.handleLayoutError(error, graphData, layoutType, startTime);
        }
    }

    /**
     * Get current layout type
     */
    getCurrentLayout(): LayoutType {
        return this.state.currentLayout;
    }

    /**
     * Get layout history
     */
    getLayoutHistory(): LayoutType[] {
        return [...this.state.layoutHistory];
    }

    /**
     * Check if currently transitioning
     */
    isTransitioning(): boolean {
        return this.state.isTransitioning;
    }

    /**
     * Get current transition progress (0-1)
     */
    getTransitionProgress(): number {
        return this.state.activeTransition?.progress || 0;
    }

    /**
     * Cancel active transition
     */
    cancelTransition(): void {
        if (this.state.isTransitioning) {
            this.cancelActiveTransition();
        }
    }

    /**
     * Set selected node IDs for preservation during transitions
     */
    setSelectedNodes(nodeIds: string[]): void {
        this.state.selectedNodeIds = new Set(nodeIds);
    }

    /**
     * Get preserved selected node IDs
     */
    getSelectedNodes(): string[] {
        return Array.from(this.state.selectedNodeIds);
    }

    /**
     * Set viewport state for preservation during transitions
     */
    setViewportState(zoom: number, centerX: number, centerY: number): void {
        this.state.viewportState = { zoom, centerX, centerY };
    }

    /**
     * Get preserved viewport state
     */
    getViewportState(): { zoom: number; centerX: number; centerY: number } | null {
        return this.state.viewportState ? { ...this.state.viewportState } : null;
    }

    /**
     * Update layout manager options
     */
    updateOptions(newOptions: Partial<LayoutManagerOptions>): void {
        this.options = { ...this.options, ...newOptions };
    }

    /**
     * Get current options
     */
    getOptions(): LayoutManagerOptions {
        return { ...this.options };
    }

    /**
     * Get layout-specific options for a layout type
     */
    getLayoutOptions(layoutType: LayoutType): any {
        return { ...this.state.lastLayoutOptions[layoutType] };
    }

    /**
     * Update layout-specific options
     */
    updateLayoutOptions(layoutType: LayoutType, options: any): void {
        this.state.lastLayoutOptions[layoutType] = { ...options };

        // Update the layout instance options
        switch (layoutType) {
            case 'hierarchical':
                this.layouts.hierarchical.updateOptions(options);
                break;
            case 'force':
                this.layouts.force.updateOptions(options);
                break;
            case 'circular':
                this.layouts.circular.updateOptions(options);
                break;
            case 'grid':
                this.layouts.grid.updateOptions(options);
                break;
        }
    }

    /**
     * Validate switch inputs
     */
    private validateSwitchInputs(graphData: GraphData, targetLayout: LayoutType): void {
        if (!graphData) {
            throw new Error('GraphData is required');
        }

        if (!graphData.nodes || graphData.nodes.length === 0) {
            throw new Error('Graph must have at least one node');
        }

        if (!['hierarchical', 'force', 'circular', 'grid'].includes(targetLayout)) {
            throw new Error(`Invalid layout type: ${targetLayout}`);
        }
    }

    /**
     * Get current layout nodes
     */
    private async getCurrentLayoutNodes(graphData: GraphData): Promise<RoadmapNode[]> {
        const currentOptions = this.state.lastLayoutOptions[this.state.currentLayout];
        const result = await this.calculateLayout(graphData, this.state.currentLayout, currentOptions);
        return result.nodes;
    }

    /**
     * Calculate target layout nodes
     */
    private async calculateTargetLayout(
        graphData: GraphData,
        targetLayout: LayoutType,
        layoutOptions: any
    ): Promise<RoadmapNode[]> {
        const result = await this.calculateLayout(graphData, targetLayout, layoutOptions);
        return result.nodes;
    }

    /**
     * Calculate layout using appropriate algorithm
     */
    private async calculateLayout(
        graphData: GraphData,
        layoutType: LayoutType,
        options: any = {}
    ): Promise<{ nodes: RoadmapNode[] }> {
        switch (layoutType) {
            case 'hierarchical':
                const hierarchicalResult = this.layouts.hierarchical.applyLayout({
                    ...graphData,
                    metadata: graphData.metadata || { totalNodes: graphData.nodes.length, totalEdges: graphData.edges.length, maxDepth: 0, layoutType: 'hierarchical', generatedAt: new Date() }
                });
                return { nodes: hierarchicalResult.nodes };

            case 'force':
                const forceResult = this.layouts.force.applyLayout({
                    ...graphData,
                    metadata: graphData.metadata || { totalNodes: graphData.nodes.length, totalEdges: graphData.edges.length, maxDepth: 0, layoutType: 'force', generatedAt: new Date() }
                });
                return { nodes: forceResult.nodes };

            case 'circular':
                const circularResult = this.layouts.circular.applyLayout({
                    ...graphData,
                    metadata: graphData.metadata || { totalNodes: graphData.nodes.length, totalEdges: graphData.edges.length, maxDepth: 0, layoutType: 'circular', generatedAt: new Date() }
                });
                return { nodes: circularResult.nodes };

            case 'grid':
                const gridResult = this.layouts.grid.applyLayout({
                    ...graphData,
                    metadata: graphData.metadata || { totalNodes: graphData.nodes.length, totalEdges: graphData.edges.length, maxDepth: 0, layoutType: 'grid', generatedAt: new Date() }
                });
                return { nodes: gridResult.nodes };

            default:
                throw new Error(`Unsupported layout type: ${layoutType}`);
        }
    }

    /**
     * Preserve node selection across layout transitions
     */
    private preserveNodeSelection(fromNodes: RoadmapNode[], toNodes: RoadmapNode[]): void {
        // Ensure selected nodes exist in both layouts
        const fromNodeIds = new Set(fromNodes.map(n => n.id));
        const toNodeIds = new Set(toNodes.map(n => n.id));

        // Remove selected nodes that don't exist in target layout
        this.state.selectedNodeIds.forEach(nodeId => {
            if (!toNodeIds.has(nodeId)) {
                this.state.selectedNodeIds.delete(nodeId);
            }
        });
    }

    /**
     * Preserve viewport state
     */
    private preserveViewportState(): void {
        // Viewport state is maintained in this.state.viewportState
        // This method can be extended to perform additional viewport preservation logic
    }

    /**
     * Create transition object
     */
    private createTransition(
        fromLayout: LayoutType,
        toLayout: LayoutType,
        fromNodes: RoadmapNode[],
        toNodes: RoadmapNode[]
    ): LayoutTransition {
        return {
            id: `transition-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            fromLayout,
            toLayout,
            startTime: performance.now(),
            duration: this.options.animationDuration,
            progress: 0,
            isActive: true,
            fromNodes: [...fromNodes],
            toNodes: [...toNodes],
            currentNodes: [...fromNodes] // Start with from nodes
        };
    }

    /**
     * Execute transition with animation
     */
    private async executeTransition(
        graphData: GraphData,
        transition: LayoutTransition
    ): Promise<LayoutManagerResult> {
        return new Promise((resolve, reject) => {
            // Set transition state
            this.state.isTransitioning = true;
            this.state.activeTransition = transition;

            // Notify transition start
            if (this.options.onTransitionStart) {
                this.options.onTransitionStart(transition.fromLayout, transition.toLayout);
            }

            // Start animation
            const animate = () => {
                if (!this.state.activeTransition || !this.state.activeTransition.isActive) {
                    return; // Transition was cancelled
                }

                const currentTime = performance.now();
                const elapsed = currentTime - transition.startTime;
                const progress = Math.min(elapsed / transition.duration, 1);

                // Update transition progress
                transition.progress = progress;

                // Calculate interpolated positions
                if (this.options.enableInterpolation) {
                    transition.currentNodes = this.interpolateNodePositions(
                        transition.fromNodes,
                        transition.toNodes,
                        progress
                    );
                }

                // Notify progress
                if (this.options.onTransitionProgress) {
                    this.options.onTransitionProgress(progress);
                }

                if (progress >= 1) {
                    // Transition complete
                    this.completeTransition(graphData, transition, resolve);
                } else {
                    // Continue animation
                    this.animationFrameId = requestAnimationFrame(animate);
                }
            };

            // Start animation
            this.animationFrameId = requestAnimationFrame(animate);

            // Set maximum transition time safety
            this.transitionTimer = window.setTimeout(() => {
                if (this.state.isTransitioning) {
                    console.warn('Transition exceeded maximum time, forcing completion');
                    this.completeTransition(graphData, transition, resolve);
                }
            }, this.options.maxTransitionTime);
        });
    }

    /**
     * Interpolate node positions between layouts
     */
    private interpolateNodePositions(
        fromNodes: RoadmapNode[],
        toNodes: RoadmapNode[],
        progress: number
    ): RoadmapNode[] {
        const nodeMap = new Map(toNodes.map(node => [node.id, node]));
        const easedProgress = this.applyEasing(progress);

        return fromNodes.map(fromNode => {
            const toNode = nodeMap.get(fromNode.id);

            if (!toNode) {
                // Node doesn't exist in target layout, fade out
                return {
                    ...fromNode,
                    style: {
                        ...fromNode.style,
                        opacity: 1 - easedProgress
                    }
                };
            }

            // Interpolate position
            const interpolatedPosition: Position = {
                x: fromNode.position.x + (toNode.position.x - fromNode.position.x) * easedProgress,
                y: fromNode.position.y + (toNode.position.y - fromNode.position.y) * easedProgress
            };

            return {
                ...toNode,
                position: interpolatedPosition,
                style: {
                    ...toNode.style,
                    opacity: toNode.style?.opacity || 1
                }
            };
        });
    }

    /**
     * Apply easing function to progress
     */
    private applyEasing(progress: number): number {
        switch (this.options.animationEasing) {
            case 'linear':
                return progress;
            case 'ease':
                return progress < 0.5
                    ? 2 * progress * progress
                    : 1 - Math.pow(-2 * progress + 2, 2) / 2;
            case 'ease-in':
                return progress * progress;
            case 'ease-out':
                return 1 - (1 - progress) * (1 - progress);
            case 'ease-in-out':
                return progress < 0.5
                    ? 2 * progress * progress
                    : 1 - Math.pow(-2 * progress + 2, 2) / 2;
            default:
                return progress;
        }
    }

    /**
     * Complete transition
     */
    private completeTransition(
        graphData: GraphData,
        transition: LayoutTransition,
        resolve: (result: LayoutManagerResult) => void
    ): void {
        // Clean up timers
        this.cleanupTransition();

        // Update state
        this.updateStateAfterTransition(transition.toLayout);

        // Calculate final result
        const transitionTime = performance.now() - transition.startTime;

        const result: LayoutManagerResult = {
            nodes: transition.toNodes,
            edges: graphData.edges,
            layout: transition.toLayout,
            transitionId: transition.id,
            metadata: {
                layoutTime: 0, // Layout was already calculated
                transitionTime,
                isTransitioning: false,
                preservedSelections: Array.from(this.state.selectedNodeIds),
                layoutHistory: [...this.state.layoutHistory]
            }
        };

        // Notify completion
        if (this.options.onTransitionComplete) {
            this.options.onTransitionComplete(transition.toLayout);
        }

        resolve(result);
    }

    /**
     * Direct switch without animation
     */
    private async directSwitch(
        graphData: GraphData,
        targetLayout: LayoutType,
        targetNodes: RoadmapNode[],
        startTime: number
    ): Promise<LayoutManagerResult> {
        // Update state
        this.updateStateAfterLayout(targetLayout);

        const layoutTime = performance.now() - startTime;

        return {
            nodes: targetNodes,
            edges: graphData.edges,
            layout: targetLayout,
            metadata: {
                layoutTime,
                isTransitioning: false,
                preservedSelections: Array.from(this.state.selectedNodeIds),
                layoutHistory: [...this.state.layoutHistory]
            }
        };
    }

    /**
     * Update state after layout application
     */
    private updateStateAfterLayout(layoutType: LayoutType): void {
        this.state.previousLayout = this.state.currentLayout;
        this.state.currentLayout = layoutType;

        // Add to history if different from last
        if (this.state.layoutHistory[this.state.layoutHistory.length - 1] !== layoutType) {
            this.state.layoutHistory.push(layoutType);

            // Limit history size
            if (this.state.layoutHistory.length > 10) {
                this.state.layoutHistory.shift();
            }
        }
    }

    /**
     * Update state after transition
     */
    private updateStateAfterTransition(layoutType: LayoutType): void {
        this.state.isTransitioning = false;
        this.state.activeTransition = null;
        this.updateStateAfterLayout(layoutType);
    }

    /**
     * Cancel active transition
     */
    private cancelActiveTransition(): void {
        if (this.state.activeTransition) {
            this.state.activeTransition.isActive = false;
        }

        this.cleanupTransition();
        this.state.isTransitioning = false;
        this.state.activeTransition = null;
    }

    /**
     * Clean up transition timers and animation frames
     */
    private cleanupTransition(): void {
        if (this.transitionTimer) {
            clearTimeout(this.transitionTimer);
            this.transitionTimer = null;
        }

        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    /**
     * Handle switch error with fallback
     */
    private async handleSwitchError(
        error: Error,
        graphData: GraphData,
        targetLayout: LayoutType,
        startTime: number
    ): Promise<LayoutManagerResult> {
        console.error(`Error switching to ${targetLayout} layout:`, error);

        // Notify error
        if (this.options.onTransitionError) {
            this.options.onTransitionError(error, targetLayout);
        }

        // Try fallback layout
        try {
            const fallbackLayout = this.options.fallbackLayout;
            console.warn(`Falling back to ${fallbackLayout} layout`);

            const fallbackResult = await this.calculateLayout(graphData, fallbackLayout, {});
            this.updateStateAfterLayout(fallbackLayout);

            const layoutTime = performance.now() - startTime;

            return {
                nodes: fallbackResult.nodes,
                edges: graphData.edges,
                layout: fallbackLayout,
                metadata: {
                    layoutTime,
                    isTransitioning: false,
                    preservedSelections: Array.from(this.state.selectedNodeIds),
                    layoutHistory: [...this.state.layoutHistory]
                }
            };

        } catch (fallbackError) {
            console.error('Fallback layout also failed:', fallbackError);

            // Last resort: return original nodes
            return {
                nodes: graphData.nodes,
                edges: graphData.edges,
                layout: this.state.currentLayout,
                metadata: {
                    layoutTime: performance.now() - startTime,
                    isTransitioning: false,
                    preservedSelections: [],
                    layoutHistory: [...this.state.layoutHistory]
                }
            };
        }
    }

    /**
     * Handle layout error with fallback
     */
    private async handleLayoutError(
        error: Error,
        graphData: GraphData,
        layoutType: LayoutType,
        startTime: number
    ): Promise<LayoutManagerResult> {
        console.error(`Error applying ${layoutType} layout:`, error);

        // Try fallback layout
        try {
            const fallbackLayout = this.options.fallbackLayout;
            const fallbackResult = await this.calculateLayout(graphData, fallbackLayout, {});

            const layoutTime = performance.now() - startTime;

            return {
                nodes: fallbackResult.nodes,
                edges: graphData.edges,
                layout: fallbackLayout,
                metadata: {
                    layoutTime,
                    isTransitioning: false,
                    preservedSelections: Array.from(this.state.selectedNodeIds),
                    layoutHistory: [...this.state.layoutHistory]
                }
            };

        } catch (fallbackError) {
            console.error('Fallback layout also failed:', fallbackError);

            // Return original nodes as last resort
            return {
                nodes: graphData.nodes,
                edges: graphData.edges,
                layout: layoutType,
                metadata: {
                    layoutTime: performance.now() - startTime,
                    isTransitioning: false,
                    preservedSelections: [],
                    layoutHistory: [...this.state.layoutHistory]
                }
            };
        }
    }

    /**
     * Dispose of the layout manager and clean up resources
     */
    dispose(): void {
        this.cancelActiveTransition();
        this.state.selectedNodeIds.clear();
        this.state.viewportState = null;
    }
}

/**
 * Factory function to create LayoutManager
 */
export function createLayoutManager(options?: Partial<LayoutManagerOptions>): LayoutManager {
    return new LayoutManager(options);
}

/**
 * Utility function to switch layouts with transition
 */
export async function switchLayoutWithTransition(
    graphData: GraphData,
    targetLayout: LayoutType,
    layoutOptions: any = {},
    managerOptions?: Partial<LayoutManagerOptions>
): Promise<LayoutManagerResult> {
    const manager = createLayoutManager(managerOptions);
    return manager.switchLayout(graphData, targetLayout, layoutOptions);
}

/**
 * Utility function to apply layout without transition
 */
export async function applyLayoutDirect(
    graphData: GraphData,
    layoutType: LayoutType,
    layoutOptions: any = {},
    managerOptions?: Partial<LayoutManagerOptions>
): Promise<LayoutManagerResult> {
    const manager = createLayoutManager(managerOptions);
    return manager.applyLayout(graphData, layoutType, layoutOptions);
}

/**
 * Get optimal layout manager options for smooth transitions
 */
export function getOptimalTransitionOptions(graphData: GraphData): Partial<LayoutManagerOptions> {
    const nodeCount = graphData.nodes.length;

    // Adjust animation settings based on graph size
    let animationDuration = 800;
    let transitionSteps = 60;
    let enableInterpolation = true;

    if (nodeCount > 100) {
        // Faster transitions for large graphs
        animationDuration = 600;
        transitionSteps = 30;
    } else if (nodeCount > 50) {
        animationDuration = 700;
        transitionSteps = 45;
    } else if (nodeCount < 20) {
        // Slower, smoother transitions for small graphs
        animationDuration = 1000;
        transitionSteps = 80;
    }

    // Disable interpolation for very large graphs to improve performance
    if (nodeCount > 200) {
        enableInterpolation = false;
    }

    return {
        animationDuration,
        transitionSteps,
        enableInterpolation,
        animationEasing: 'ease-in-out',
        preserveSelection: true,
        preserveViewport: true
    };
}