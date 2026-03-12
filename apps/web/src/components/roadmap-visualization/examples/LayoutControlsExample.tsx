'use client';

/**
 * LayoutControls Example - Comprehensive example showing how to use the LayoutControls component
 * 
 * This example demonstrates:
 * - Basic layout switching
 * - LayoutManager integration
 * - All layout-specific options
 * - Transition handling
 * - Error handling
 * - Performance optimization
 */

import React, { useState, useCallback, useEffect } from 'react';
import { LayoutControls } from '../LayoutControls';
import type {
    LayoutType,
    GraphData,
    HierarchicalLayoutOptions,
    CircularLayoutOptions,
    GridLayoutOptions
} from '@viztechstack/roadmap-visualization';
import type { ForceDirectedLayoutOptions } from '../../../hooks/useForceLayout';

// Mock graph data for demonstration
const mockGraphData: GraphData = {
    nodes: [
        {
            id: '1',
            type: 'topic',
            position: { x: 0, y: 0 },
            data: {
                label: 'Frontend Basics',
                description: 'Learn the fundamentals of frontend development',
                level: 0,
                section: 'Introduction',
                difficulty: 'beginner',
                estimatedTime: '2 weeks'
            }
        },
        {
            id: '2',
            type: 'topic',
            position: { x: 200, y: 0 },
            data: {
                label: 'HTML & CSS',
                description: 'Master HTML structure and CSS styling',
                level: 1,
                section: 'Core Technologies',
                difficulty: 'beginner',
                estimatedTime: '3 weeks'
            }
        },
        {
            id: '3',
            type: 'topic',
            position: { x: 400, y: 0 },
            data: {
                label: 'JavaScript',
                description: 'Learn JavaScript programming fundamentals',
                level: 1,
                section: 'Core Technologies',
                difficulty: 'intermediate',
                estimatedTime: '4 weeks'
            }
        },
        {
            id: '4',
            type: 'topic',
            position: { x: 200, y: 150 },
            data: {
                label: 'React',
                description: 'Build modern web applications with React',
                level: 2,
                section: 'Frameworks',
                difficulty: 'intermediate',
                estimatedTime: '6 weeks'
            }
        },
        {
            id: '5',
            type: 'topic',
            position: { x: 400, y: 150 },
            data: {
                label: 'Advanced React',
                description: 'Master advanced React patterns and optimization',
                level: 3,
                section: 'Advanced',
                difficulty: 'advanced',
                estimatedTime: '4 weeks'
            }
        }
    ],
    edges: [
        {
            id: 'e1-2',
            source: '1',
            target: '2',
            type: 'progression',
            data: { relationship: 'leads-to' }
        },
        {
            id: 'e1-3',
            source: '1',
            target: '3',
            type: 'progression',
            data: { relationship: 'leads-to' }
        },
        {
            id: 'e2-4',
            source: '2',
            target: '4',
            type: 'dependency',
            data: { relationship: 'prerequisite' }
        },
        {
            id: 'e3-4',
            source: '3',
            target: '4',
            type: 'dependency',
            data: { relationship: 'prerequisite' }
        },
        {
            id: 'e4-5',
            source: '4',
            target: '5',
            type: 'progression',
            data: { relationship: 'leads-to' }
        }
    ],
    metadata: {
        totalNodes: 5,
        totalEdges: 5,
        maxDepth: 3,
        layoutType: 'hierarchical',
        generatedAt: new Date()
    }
};

export function LayoutControlsExample() {
    // Layout state
    const [currentLayout, setCurrentLayout] = useState<LayoutType>('hierarchical');
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [transitionProgress, setTransitionProgress] = useState(0);
    const [layoutHistory, setLayoutHistory] = useState<LayoutType[]>(['hierarchical']);

    // Layout options
    const [hierarchicalOptions, setHierarchicalOptions] = useState<HierarchicalLayoutOptions>({
        direction: 'TB',
        nodeWidth: 200,
        nodeHeight: 80,
        nodeSep: 50,
        edgeSep: 10,
        rankSep: 100,
        marginX: 20,
        marginY: 20,
    });

    const [forceOptions, setForceOptions] = useState<ForceDirectedLayoutOptions>({
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
    });

    const [circularOptions, setCircularOptions] = useState<CircularLayoutOptions>({
        innerRadius: 100,
        outerRadius: 350,
        startAngle: 0,
        endAngle: 2 * Math.PI,
        levelSpacing: 80,
        angularSpacing: 0.1,
        enableOptimization: true,
        sortByLevel: true,
        preventOverlaps: true,
        minNodeSpacing: 40
    });

    const [gridOptions, setGridOptions] = useState<GridLayoutOptions>({
        columns: 0,
        rows: 0,
        cellWidth: 200,
        cellHeight: 120,
        paddingX: 20,
        paddingY: 20,
        marginX: 40,
        marginY: 40,
        autoSize: true,
        sortBy: 'level',
        sortDirection: 'asc',
        groupBy: 'level',
        enableOptimization: true,
        preventOverlaps: true,
        centerGrid: true,
        aspectRatio: 1.5
    });

    // Hierarchical-specific state
    const [collapsedLevels, setCollapsedLevels] = useState<Set<number>>(new Set());
    const totalLevels = mockGraphData.metadata.maxDepth + 1;

    // Force-specific state
    const [manualPositioning, setManualPositioning] = useState(false);
    const [simulationSpeed, setSimulationSpeed] = useState(1);

    // Circular-specific state
    const [circularRotationSpeed, setCircularRotationSpeed] = useState(1);
    const [circularSectorHighlight, setCircularSectorHighlight] = useState({
        enabled: false,
        startAngle: 0,
        endAngle: Math.PI / 2,
        color: '#3b82f6'
    });

    // Grid-specific state
    const [gridSnapToGrid, setGridSnapToGrid] = useState(true);
    const [gridShowGridLines, setGridShowGridLines] = useState(false);
    const [gridAlignment, setGridAlignment] = useState({
        horizontal: 'center' as const,
        vertical: 'center' as const
    });

    // Error state
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Handle layout change with simulation
    const handleLayoutChange = useCallback(async (layout: LayoutType, options?: any) => {
        if (layout === currentLayout) return;

        setError(null);
        setSuccess(null);

        try {
            // Simulate transition start
            setIsTransitioning(true);
            setTransitionProgress(0);

            // Simulate transition progress
            const progressInterval = setInterval(() => {
                setTransitionProgress(prev => {
                    if (prev >= 1) {
                        clearInterval(progressInterval);
                        return 1;
                    }
                    return prev + 0.1;
                });
            }, 80);

            // Simulate layout calculation delay
            await new Promise(resolve => setTimeout(resolve, 800));

            // Update layout
            setCurrentLayout(layout);
            setLayoutHistory(prev => [...prev, layout]);

            // Complete transition
            setIsTransitioning(false);
            setTransitionProgress(1);
            setSuccess(`Successfully switched to ${layout} layout`);

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(null), 3000);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Layout change failed');
            setIsTransitioning(false);
            setTransitionProgress(0);
        }
    }, [currentLayout]);

    // Hierarchical layout handlers
    const handleCollapseLevel = useCallback((level: number) => {
        setCollapsedLevels(prev => new Set([...prev, level]));
    }, []);

    const handleExpandLevel = useCallback((level: number) => {
        setCollapsedLevels(prev => {
            const newSet = new Set(prev);
            newSet.delete(level);
            return newSet;
        });
    }, []);

    const handleCollapseAll = useCallback(() => {
        setCollapsedLevels(new Set(Array.from({ length: totalLevels }, (_, i) => i)));
    }, [totalLevels]);

    const handleExpandAll = useCallback(() => {
        setCollapsedLevels(new Set());
    }, []);

    // Circular layout handlers
    const handleCircularRotateTo = useCallback((angle: number) => {
        setCircularOptions(prev => ({ ...prev, startAngle: angle }));
    }, []);

    // Grid layout handlers
    const handleGridOptimizeForContent = useCallback(() => {
        // Simulate content optimization
        const nodeCount = mockGraphData.nodes.length;
        const optimalColumns = Math.ceil(Math.sqrt(nodeCount));
        const optimalRows = Math.ceil(nodeCount / optimalColumns);

        setGridOptions(prev => ({
            ...prev,
            columns: optimalColumns,
            rows: optimalRows,
            autoSize: false
        }));

        setSuccess('Grid optimized for content');
        setTimeout(() => setSuccess(null), 3000);
    }, []);

    // Transition callbacks
    const handleTransitionStart = useCallback((fromLayout: LayoutType, toLayout: LayoutType) => {
        console.log(`Transition started: ${fromLayout} → ${toLayout}`);
    }, []);

    const handleTransitionComplete = useCallback((layout: LayoutType) => {
        console.log(`Transition completed: ${layout}`);
    }, []);

    const handleTransitionError = useCallback((error: Error, layout: LayoutType) => {
        console.error(`Transition error for ${layout}:`, error);
        setError(`Transition to ${layout} failed: ${error.message}`);
    }, []);

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-neutral-900 mb-2">
                    LayoutControls Component Example
                </h1>
                <p className="text-neutral-600">
                    Comprehensive example showing all features of the LayoutControls component
                </p>
            </div>

            {/* Status messages */}
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-red-800 font-medium">Error:</span>
                        <span className="text-red-700">{error}</span>
                    </div>
                </div>
            )}

            {success && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-green-800 font-medium">Success:</span>
                        <span className="text-green-700">{success}</span>
                    </div>
                </div>
            )}

            {/* Main layout controls */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Layout controls */}
                <div className="lg:col-span-1">
                    <LayoutControls
                        currentLayout={currentLayout}
                        onLayoutChange={handleLayoutChange}
                        isTransitioning={isTransitioning}
                        transitionProgress={transitionProgress}
                        layoutHistory={layoutHistory}
                        graphData={mockGraphData}

                        // Hierarchical options
                        hierarchicalOptions={hierarchicalOptions}
                        onHierarchicalOptionsChange={setHierarchicalOptions}
                        onCollapseLevel={handleCollapseLevel}
                        onExpandLevel={handleExpandLevel}
                        onCollapseAll={handleCollapseAll}
                        onExpandAll={handleExpandAll}
                        collapsedLevels={collapsedLevels}
                        totalLevels={totalLevels}

                        // Force options
                        forceOptions={forceOptions}
                        onForceOptionsChange={setForceOptions}
                        manualPositioning={manualPositioning}
                        onManualPositioningChange={setManualPositioning}
                        simulationSpeed={simulationSpeed}
                        onSimulationSpeedChange={setSimulationSpeed}

                        // Circular options
                        circularOptions={circularOptions}
                        onCircularOptionsChange={setCircularOptions}
                        circularRotationSpeed={circularRotationSpeed}
                        onCircularRotationSpeedChange={setCircularRotationSpeed}
                        circularSectorHighlight={circularSectorHighlight}
                        onCircularSectorHighlightChange={setCircularSectorHighlight}
                        onCircularRotateTo={handleCircularRotateTo}

                        // Grid options
                        gridOptions={gridOptions}
                        onGridOptionsChange={setGridOptions}
                        gridSnapToGrid={gridSnapToGrid}
                        onGridSnapToGridChange={setGridSnapToGrid}
                        gridShowGridLines={gridShowGridLines}
                        onGridShowGridLinesChange={setGridShowGridLines}
                        gridAlignment={gridAlignment}
                        onGridAlignmentChange={setGridAlignment}
                        onGridOptimizeForContent={handleGridOptimizeForContent}

                        // Transition callbacks
                        onTransitionStart={handleTransitionStart}
                        onTransitionComplete={handleTransitionComplete}
                        onTransitionError={handleTransitionError}

                        // UI options
                        showAdvanced={true}
                    />
                </div>

                {/* Current state display */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Current layout info */}
                    <div className="bg-white border border-neutral-200 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-neutral-900 mb-3">Current State</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="font-medium text-neutral-700">Layout:</span>
                                <span className="ml-2 text-neutral-900">{currentLayout}</span>
                            </div>
                            <div>
                                <span className="font-medium text-neutral-700">Transitioning:</span>
                                <span className="ml-2 text-neutral-900">{isTransitioning ? 'Yes' : 'No'}</span>
                            </div>
                            <div>
                                <span className="font-medium text-neutral-700">Progress:</span>
                                <span className="ml-2 text-neutral-900">{Math.round(transitionProgress * 100)}%</span>
                            </div>
                            <div>
                                <span className="font-medium text-neutral-700">History:</span>
                                <span className="ml-2 text-neutral-900">{layoutHistory.length} layouts</span>
                            </div>
                        </div>
                    </div>

                    {/* Graph data info */}
                    <div className="bg-white border border-neutral-200 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-neutral-900 mb-3">Graph Data</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="font-medium text-neutral-700">Nodes:</span>
                                <span className="ml-2 text-neutral-900">{mockGraphData.nodes.length}</span>
                            </div>
                            <div>
                                <span className="font-medium text-neutral-700">Edges:</span>
                                <span className="ml-2 text-neutral-900">{mockGraphData.edges.length}</span>
                            </div>
                            <div>
                                <span className="font-medium text-neutral-700">Max Depth:</span>
                                <span className="ml-2 text-neutral-900">{mockGraphData.metadata.maxDepth}</span>
                            </div>
                            <div>
                                <span className="font-medium text-neutral-700">Generated:</span>
                                <span className="ml-2 text-neutral-900">
                                    {mockGraphData.metadata.generatedAt.toLocaleTimeString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Current options display */}
                    <div className="bg-white border border-neutral-200 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-neutral-900 mb-3">
                            {currentLayout.charAt(0).toUpperCase() + currentLayout.slice(1)} Options
                        </h3>
                        <div className="text-sm">
                            <pre className="bg-neutral-50 p-3 rounded text-xs overflow-auto">
                                {currentLayout === 'hierarchical' && JSON.stringify(hierarchicalOptions, null, 2)}
                                {currentLayout === 'force' && JSON.stringify(forceOptions, null, 2)}
                                {currentLayout === 'circular' && JSON.stringify(circularOptions, null, 2)}
                                {currentLayout === 'grid' && JSON.stringify(gridOptions, null, 2)}
                            </pre>
                        </div>
                    </div>

                    {/* Layout-specific state */}
                    {currentLayout === 'hierarchical' && (
                        <div className="bg-white border border-neutral-200 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-neutral-900 mb-3">Hierarchical State</h3>
                            <div className="text-sm space-y-2">
                                <div>
                                    <span className="font-medium text-neutral-700">Collapsed Levels:</span>
                                    <span className="ml-2 text-neutral-900">
                                        {collapsedLevels.size > 0 ? Array.from(collapsedLevels).join(', ') : 'None'}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-medium text-neutral-700">Total Levels:</span>
                                    <span className="ml-2 text-neutral-900">{totalLevels}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentLayout === 'force' && (
                        <div className="bg-white border border-neutral-200 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-neutral-900 mb-3">Force State</h3>
                            <div className="text-sm space-y-2">
                                <div>
                                    <span className="font-medium text-neutral-700">Manual Positioning:</span>
                                    <span className="ml-2 text-neutral-900">{manualPositioning ? 'Enabled' : 'Disabled'}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-neutral-700">Simulation Speed:</span>
                                    <span className="ml-2 text-neutral-900">{simulationSpeed}x</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentLayout === 'circular' && (
                        <div className="bg-white border border-neutral-200 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-neutral-900 mb-3">Circular State</h3>
                            <div className="text-sm space-y-2">
                                <div>
                                    <span className="font-medium text-neutral-700">Rotation Speed:</span>
                                    <span className="ml-2 text-neutral-900">{circularRotationSpeed}x</span>
                                </div>
                                <div>
                                    <span className="font-medium text-neutral-700">Sector Highlight:</span>
                                    <span className="ml-2 text-neutral-900">
                                        {circularSectorHighlight.enabled ? 'Enabled' : 'Disabled'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentLayout === 'grid' && (
                        <div className="bg-white border border-neutral-200 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-neutral-900 mb-3">Grid State</h3>
                            <div className="text-sm space-y-2">
                                <div>
                                    <span className="font-medium text-neutral-700">Snap to Grid:</span>
                                    <span className="ml-2 text-neutral-900">{gridSnapToGrid ? 'Enabled' : 'Disabled'}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-neutral-700">Show Grid Lines:</span>
                                    <span className="ml-2 text-neutral-900">{gridShowGridLines ? 'Enabled' : 'Disabled'}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-neutral-700">Alignment:</span>
                                    <span className="ml-2 text-neutral-900">
                                        {gridAlignment.horizontal} / {gridAlignment.vertical}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Usage instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">How to Use</h3>
                <div className="text-blue-800 text-sm space-y-1">
                    <p>• Select different layouts from the dropdown to see transitions</p>
                    <p>• Expand the controls to access layout-specific options</p>
                    <p>• Try the quick layout switching buttons in advanced mode</p>
                    <p>• Watch the transition progress and state updates</p>
                    <p>• Check the console for transition event logs</p>
                </div>
            </div>
        </div>
    );
}