/**
 * LayoutManager Tests
 * 
 * Tests for the LayoutManager service functionality including
 * layout switching, transitions, state preservation, and error handling.
 */

import {
    LayoutManager,
    createLayoutManager,
    switchLayoutWithTransition,
    getOptimalTransitionOptions,
    type LayoutManagerOptions
} from '../layout-manager';
import type { GraphData, LayoutType } from '../../types';

// Mock graph data for testing
const mockGraphData: GraphData = {
    nodes: [
        {
            id: 'node1',
            type: 'topic',
            position: { x: 0, y: 0 },
            data: {
                label: 'Node 1',
                level: 1,
                section: 'Section A',
                difficulty: 'beginner'
            }
        },
        {
            id: 'node2',
            type: 'skill',
            position: { x: 100, y: 0 },
            data: {
                label: 'Node 2',
                level: 2,
                section: 'Section A',
                difficulty: 'intermediate'
            }
        },
        {
            id: 'node3',
            type: 'milestone',
            position: { x: 200, y: 0 },
            data: {
                label: 'Node 3',
                level: 3,
                section: 'Section B',
                difficulty: 'advanced'
            }
        }
    ],
    edges: [
        {
            id: 'edge1',
            source: 'node1',
            target: 'node2',
            type: 'dependency',
            data: { relationship: 'prerequisite', strength: 0.8 }
        },
        {
            id: 'edge2',
            source: 'node2',
            target: 'node3',
            type: 'progression',
            data: { relationship: 'leads-to', strength: 0.9 }
        }
    ],
    metadata: {
        totalNodes: 3,
        totalEdges: 2,
        maxDepth: 3,
        layoutType: 'hierarchical',
        generatedAt: new Date()
    }
};

describe('LayoutManager', () => {
    let layoutManager: LayoutManager;

    beforeEach(() => {
        layoutManager = createLayoutManager();
    });

    afterEach(() => {
        layoutManager.dispose();
    });

    describe('Basic Functionality', () => {
        test('should create layout manager with default options', () => {
            expect(layoutManager).toBeInstanceOf(LayoutManager);
            expect(layoutManager.getCurrentLayout()).toBe('hierarchical');
            expect(layoutManager.isTransitioning()).toBe(false);
        });

        test('should apply layout directly', async () => {
            const result = await layoutManager.applyLayout(mockGraphData, 'grid');

            expect(result.layout).toBe('grid');
            expect(result.nodes).toHaveLength(3);
            expect(result.metadata.isTransitioning).toBe(false);
            expect(layoutManager.getCurrentLayout()).toBe('grid');
        });

        test('should switch between layouts', async () => {
            // Start with hierarchical
            await layoutManager.applyLayout(mockGraphData, 'hierarchical');
            expect(layoutManager.getCurrentLayout()).toBe('hierarchical');

            // Switch to force
            const result = await layoutManager.switchLayout(mockGraphData, 'force');
            expect(result.layout).toBe('force');
            expect(layoutManager.getCurrentLayout()).toBe('force');
        });

        test('should maintain layout history', async () => {
            await layoutManager.applyLayout(mockGraphData, 'hierarchical');
            await layoutManager.switchLayout(mockGraphData, 'force');
            await layoutManager.switchLayout(mockGraphData, 'circular');

            const history = layoutManager.getLayoutHistory();
            expect(history).toEqual(['hierarchical', 'hierarchical', 'force', 'circular']);
        });
    });

    describe('State Preservation', () => {
        test('should preserve selected nodes', async () => {
            const selectedNodes = ['node1', 'node3'];
            layoutManager.setSelectedNodes(selectedNodes);

            const result = await layoutManager.switchLayout(mockGraphData, 'grid');

            expect(result.metadata.preservedSelections).toEqual(selectedNodes);
            expect(layoutManager.getSelectedNodes()).toEqual(selectedNodes);
        });

        test('should preserve viewport state', () => {
            const zoom = 1.5;
            const centerX = 400;
            const centerY = 300;

            layoutManager.setViewportState(zoom, centerX, centerY);
            const viewportState = layoutManager.getViewportState();

            expect(viewportState).toEqual({ zoom, centerX, centerY });
        });

        test('should filter out non-existent selected nodes', async () => {
            // Set selected nodes including one that doesn't exist
            layoutManager.setSelectedNodes(['node1', 'nonexistent', 'node2']);

            const result = await layoutManager.switchLayout(mockGraphData, 'grid');

            // Should only preserve existing nodes
            expect(result.metadata.preservedSelections).toEqual(['node1', 'node2']);
        });
    });

    describe('Layout Options', () => {
        test('should store and retrieve layout-specific options', () => {
            const hierarchicalOptions = { direction: 'TB', nodeWidth: 200 };
            const gridOptions = { columns: 3, rows: 2 };

            layoutManager.updateLayoutOptions('hierarchical', hierarchicalOptions);
            layoutManager.updateLayoutOptions('grid', gridOptions);

            expect(layoutManager.getLayoutOptions('hierarchical')).toEqual(hierarchicalOptions);
            expect(layoutManager.getLayoutOptions('grid')).toEqual(gridOptions);
        });

        test('should apply layout with custom options', async () => {
            const customOptions = { columns: 2, rows: 2 };

            const result = await layoutManager.switchLayout(mockGraphData, 'grid', customOptions);

            expect(result.layout).toBe('grid');
            expect(layoutManager.getLayoutOptions('grid')).toEqual(customOptions);
        });
    });

    describe('Animation and Transitions', () => {
        test('should handle transitions with animations disabled', async () => {
            const manager = createLayoutManager({ enableAnimations: false });

            await manager.applyLayout(mockGraphData, 'hierarchical');
            const result = await manager.switchLayout(mockGraphData, 'force');

            expect(result.layout).toBe('force');
            expect(result.metadata.transitionTime).toBeUndefined();
            expect(result.transitionId).toBeUndefined();

            manager.dispose();
        });

        test('should handle transitions with animations enabled', async () => {
            const manager = createLayoutManager({
                enableAnimations: true,
                animationDuration: 100 // Short duration for testing
            });

            await manager.applyLayout(mockGraphData, 'hierarchical');
            const result = await manager.switchLayout(mockGraphData, 'force');

            expect(result.layout).toBe('force');
            expect(result.metadata.transitionTime).toBeGreaterThan(0);
            expect(result.transitionId).toBeDefined();

            manager.dispose();
        });

        test('should track transition progress', async () => {
            let progressUpdates: number[] = [];

            const manager = createLayoutManager({
                enableAnimations: true,
                animationDuration: 100,
                onTransitionProgress: (progress) => {
                    progressUpdates.push(progress);
                }
            });

            await manager.applyLayout(mockGraphData, 'hierarchical');
            await manager.switchLayout(mockGraphData, 'force');

            expect(progressUpdates.length).toBeGreaterThan(0);
            expect(progressUpdates[progressUpdates.length - 1]).toBe(1);

            manager.dispose();
        });

        test('should cancel active transitions', async () => {
            const manager = createLayoutManager({
                enableAnimations: true,
                animationDuration: 1000 // Long duration
            });

            await manager.applyLayout(mockGraphData, 'hierarchical');

            // Start transition but don't wait
            const transitionPromise = manager.switchLayout(mockGraphData, 'force');

            // Cancel transition
            manager.cancelTransition();
            expect(manager.isTransitioning()).toBe(false);

            // Wait for promise to resolve
            await transitionPromise;

            manager.dispose();
        });
    });

    describe('Error Handling', () => {
        test('should handle invalid layout type', async () => {
            const result = await layoutManager.switchLayout(mockGraphData, 'invalid' as LayoutType);

            // Should fallback to grid layout
            expect(result.layout).toBe('grid');
        });

        test('should handle empty graph data', async () => {
            const emptyGraphData: GraphData = {
                nodes: [],
                edges: [],
                metadata: {
                    totalNodes: 0,
                    totalEdges: 0,
                    maxDepth: 0,
                    layoutType: 'hierarchical',
                    generatedAt: new Date()
                }
            };

            const result = await layoutManager.switchLayout(emptyGraphData, 'force');

            // Should handle gracefully and return empty nodes
            expect(result.nodes).toHaveLength(0);
        });

        test('should use fallback layout on error', async () => {
            const manager = createLayoutManager({
                fallbackLayout: 'grid',
                onTransitionError: jest.fn()
            });

            // This should trigger fallback
            const result = await manager.switchLayout(mockGraphData, 'invalid' as LayoutType);

            expect(result.layout).toBe('grid');
            expect(manager.getOptions().onTransitionError).toHaveBeenCalled();

            manager.dispose();
        });
    });

    describe('Utility Functions', () => {
        test('should create layout manager with factory function', () => {
            const manager = createLayoutManager({ enableAnimations: false });
            expect(manager).toBeInstanceOf(LayoutManager);
            expect(manager.getOptions().enableAnimations).toBe(false);
            manager.dispose();
        });

        test('should switch layout with transition utility', async () => {
            const result = await switchLayoutWithTransition(
                mockGraphData,
                'grid',
                { columns: 2 },
                { enableAnimations: false }
            );

            expect(result.layout).toBe('grid');
            expect(result.nodes).toHaveLength(3);
        });

        test('should get optimal transition options', () => {
            const options = getOptimalTransitionOptions(mockGraphData);

            expect(options).toHaveProperty('animationDuration');
            expect(options).toHaveProperty('transitionSteps');
            expect(options).toHaveProperty('enableInterpolation');
            expect(options.preserveSelection).toBe(true);
            expect(options.preserveViewport).toBe(true);
        });

        test('should adjust optimal options based on graph size', () => {
            // Small graph
            const smallGraph = { ...mockGraphData, nodes: mockGraphData.nodes.slice(0, 1) };
            const smallOptions = getOptimalTransitionOptions(smallGraph);

            // Large graph
            const largeNodes = Array.from({ length: 150 }, (_, i) => ({
                ...mockGraphData.nodes[0],
                id: `node${i}`
            }));
            const largeGraph = { ...mockGraphData, nodes: largeNodes };
            const largeOptions = getOptimalTransitionOptions(largeGraph);

            expect(smallOptions.animationDuration).toBeGreaterThan(largeOptions.animationDuration!);
            expect(largeOptions.enableInterpolation).toBe(false);
        });
    });

    describe('Manager Options', () => {
        test('should update manager options', () => {
            const newOptions: Partial<LayoutManagerOptions> = {
                animationDuration: 1200,
                preserveSelection: false
            };

            layoutManager.updateOptions(newOptions);
            const currentOptions = layoutManager.getOptions();

            expect(currentOptions.animationDuration).toBe(1200);
            expect(currentOptions.preserveSelection).toBe(false);
        });

        test('should call lifecycle callbacks', async () => {
            const onTransitionStart = jest.fn();
            const onTransitionComplete = jest.fn();

            const manager = createLayoutManager({
                enableAnimations: true,
                animationDuration: 50,
                onTransitionStart,
                onTransitionComplete
            });

            await manager.applyLayout(mockGraphData, 'hierarchical');
            await manager.switchLayout(mockGraphData, 'force');

            expect(onTransitionStart).toHaveBeenCalledWith('hierarchical', 'force');
            expect(onTransitionComplete).toHaveBeenCalledWith('force');

            manager.dispose();
        });
    });

    describe('Resource Cleanup', () => {
        test('should dispose resources properly', () => {
            layoutManager.setSelectedNodes(['node1', 'node2']);
            layoutManager.setViewportState(1.0, 100, 100);

            layoutManager.dispose();

            expect(layoutManager.getSelectedNodes()).toHaveLength(0);
            expect(layoutManager.getViewportState()).toBeNull();
        });

        test('should cancel transitions on dispose', async () => {
            const manager = createLayoutManager({
                enableAnimations: true,
                animationDuration: 1000
            });

            await manager.applyLayout(mockGraphData, 'hierarchical');

            // Start long transition
            const transitionPromise = manager.switchLayout(mockGraphData, 'force');

            // Dispose should cancel transition
            manager.dispose();

            await transitionPromise;
            expect(manager.isTransitioning()).toBe(false);
        });
    });
});