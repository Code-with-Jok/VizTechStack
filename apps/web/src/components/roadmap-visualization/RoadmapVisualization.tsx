'use client';

/**
 * Main roadmap visualization container component
 * Integrates React Flow with custom nodes and layout algorithms
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    type Node,
    type Edge,
    type ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import type {
    GraphData,
    LayoutType,
    NodeData,
    RoadmapNode,
    RoadmapEdge,
} from '@viztechstack/roadmap-visualization';
import {
    applyLayoutAlgorithm,
    getNodeNavigationUrl,
    canNavigate,
} from '@viztechstack/roadmap-visualization';

import {
    defaultFitViewOptions,
    getEdgeStyle,
    getEdgeAnimation,
    reactFlowConfig,
} from '@/lib/react-flow-config';

import { CustomRoadmapNode } from './CustomRoadmapNode';
import { CustomRoadmapEdge } from './CustomRoadmapEdge';
import { VisualizationControls } from './VisualizationControls';
import { NodeDetailsPanel } from './NodeDetailsPanel';
import { EdgeDetailsPanel } from './EdgeDetailsPanel';
import { SelectionToolbar } from './SelectionToolbar';
import { SelectionIndicator } from './SelectionIndicator';
import { useSelectionManager } from '@/hooks/useSelectionManager';

interface RoadmapVisualizationProps {
    graphData: GraphData;
    onNodeClick?: (nodeId: string) => void;
    onEdgeClick?: (edgeId: string) => void;
    className?: string;
}

// Define custom node types with proper typing
const nodeTypes = {
    topic: CustomRoadmapNode,
    skill: CustomRoadmapNode,
    milestone: CustomRoadmapNode,
    resource: CustomRoadmapNode,
    prerequisite: CustomRoadmapNode,
};

// Define custom edge types with proper typing
const edgeTypes = {
    dependency: CustomRoadmapEdge,
    progression: CustomRoadmapEdge,
    related: CustomRoadmapEdge,
    optional: CustomRoadmapEdge,
};

// Fit view options
const fitViewOptions = defaultFitViewOptions;

/**
 * Main roadmap visualization component
 */
export function RoadmapVisualization({
    graphData,
    onNodeClick,
    onEdgeClick,
    className = '',
}: RoadmapVisualizationProps) {
    const router = useRouter();
    const [layout, setLayout] = useState<LayoutType>('hierarchical');
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
    const [isNavigating, setIsNavigating] = useState(false);
    const [navigationError, setNavigationError] = useState<string | null>(null);
    const [zoomLevel, setZoomLevel] = useState(1);

    // Selection management system
    const selectionManager = useSelectionManager({
        nodes: graphData.nodes,
        edges: graphData.edges,
        config: {
            enableMultiSelection: true,
            enableRangeSelection: true,
            enableKeyboardNavigation: true,
            enableConnectedHighlighting: true,
            clearOnBackgroundClick: true,
            selectConnectedOnDoubleClick: true,
            highlightOnHover: true,
            announceSelections: true,
        },
        onNodeSelect: (nodeId, selected) => {
            if (onNodeClick && selected) {
                onNodeClick(nodeId);
            }
        },
        onEdgeSelect: (edgeId, selected) => {
            if (onEdgeClick && selected) {
                onEdgeClick(edgeId);
            }
        },
        onSelectionChange: (state) => {
            // Update React Flow nodes and edges with selection state
            const updatedNodes = convertToReactFlowNodes(graphData.nodes);
            const updatedEdges = convertToReactFlowEdges(graphData.edges);
            setNodes(updatedNodes);
            setEdges(updatedEdges);
        },
        onHighlightChange: (highlightedNodes, highlightedEdges) => {
            // Update React Flow nodes and edges with highlight state
            const updatedNodes = convertToReactFlowNodes(graphData.nodes);
            const updatedEdges = convertToReactFlowEdges(graphData.edges);
            setNodes(updatedNodes);
            setEdges(updatedEdges);
        },
    });

    // Legacy state for backward compatibility
    const selectedNodeId = selectionManager.primarySelectedNode;
    const highlightedNodes = selectionManager.selectionState.highlightedNodes;
    const highlightedEdges = selectionManager.selectionState.highlightedEdges;

    // Edge interaction state management
    const edgeInteraction = selectionManager.edgeInteraction;

    // Helper function to find next node in keyboard navigation direction
    const findNextNodeInDirection = useCallback((currentNode: Node, direction: string, allNodes: Node[]): Node | null => {
        const currentPos = currentNode.position;
        let bestNode: Node | null = null;
        let bestDistance = Infinity;

        allNodes.forEach(node => {
            if (node.id === currentNode.id) return;

            const nodePos = node.position;
            const dx = nodePos.x - currentPos.x;
            const dy = nodePos.y - currentPos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            let isInDirection = false;
            switch (direction) {
                case 'ArrowUp':
                    isInDirection = dy < -20 && Math.abs(dx) < Math.abs(dy);
                    break;
                case 'ArrowDown':
                    isInDirection = dy > 20 && Math.abs(dx) < Math.abs(dy);
                    break;
                case 'ArrowLeft':
                    isInDirection = dx < -20 && Math.abs(dy) < Math.abs(dx);
                    break;
                case 'ArrowRight':
                    isInDirection = dx > 20 && Math.abs(dy) < Math.abs(dx);
                    break;
            }

            if (isInDirection && distance < bestDistance) {
                bestDistance = distance;
                bestNode = node;
            }
        });

        return bestNode;
    }, []);

    // Find connected nodes and edges for highlighting (legacy support)
    const findConnectedElements = useCallback((nodeId: string) => {
        const connectedNodes = new Set<string>([nodeId]); // Include the selected node itself
        const connectedEdges = new Set<string>();

        // Find all edges connected to this node
        graphData.edges.forEach(edge => {
            if (edge.source === nodeId || edge.target === nodeId) {
                connectedEdges.add(edge.id);
                // Add connected nodes
                connectedNodes.add(edge.source);
                connectedNodes.add(edge.target);
            }
        });

        return { connectedNodes, connectedEdges };
    }, [graphData]);

    // Handle node selection and highlighting (legacy support)
    const handleNodeSelection = useCallback((nodeId: string | null) => {
        if (nodeId) {
            selectionManager.handleNodeClick(nodeId);
        } else {
            selectionManager.clearSelection();
        }
    }, [selectionManager]);

    // Convert RoadmapNode to React Flow Node format
    const convertToReactFlowNodes = useCallback(
        (roadmapNodes: RoadmapNode[]): Node[] => {
            return roadmapNodes.map((node) => ({
                id: node.id,
                type: node.type,
                position: node.position,
                data: {
                    ...node.data,
                    selected: selectionManager.isNodeSelected(node.id),
                    highlighted: selectionManager.isNodeHighlighted(node.id),
                    dimmed: selectionManager.selectedCount.total > 0 && !selectionManager.isNodeHighlighted(node.id) && !selectionManager.isNodeSelected(node.id),
                },
                style: node.style,
            }));
        },
        [selectionManager]
    );

    // Convert RoadmapEdge to React Flow Edge format với edge interaction support
    const convertToReactFlowEdges = useCallback(
        (roadmapEdges: RoadmapEdge[]): Edge[] => {
            return roadmapEdges.map((edge) => {
                const isHighlighted = selectionManager.isEdgeHighlighted(edge.id) || edgeInteraction.isEdgeSelected(edge.id);
                const isDimmed = (selectionManager.selectedCount.total > 0 && !selectionManager.isEdgeHighlighted(edge.id) && !selectionManager.isEdgeSelected(edge.id)) ||
                    (edgeInteraction.selectedEdgeId !== null && !edgeInteraction.isEdgeSelected(edge.id));

                return {
                    id: edge.id,
                    source: edge.source,
                    target: edge.target,
                    type: edge.type,
                    animated: getEdgeAnimation(edge.type) || isHighlighted,
                    style: {
                        ...getEdgeStyle(edge.type),
                        stroke: isHighlighted
                            ? 'var(--color-primary-500)'
                            : isDimmed
                                ? 'var(--color-neutral-300)'
                                : getEdgeStyle(edge.type)?.stroke,
                        strokeWidth: isHighlighted ? 3 : 2,
                        opacity: isDimmed ? 0.3 : 1,
                    },
                    label: edge.data?.label,
                    data: {
                        ...edge.data,
                        highlighted: isHighlighted,
                        dimmed: isDimmed,
                    },
                };
            });
        },
        [selectionManager, edgeInteraction]
    );

    // Apply layout and update nodes
    useEffect(() => {
        if (!graphData || graphData.nodes.length === 0) return;

        // Apply layout algorithm
        const positionedNodes = applyLayoutAlgorithm(
            graphData.nodes,
            graphData.edges,
            layout
        );

        // Convert to React Flow format
        const flowNodes = convertToReactFlowNodes(positionedNodes);
        const flowEdges = convertToReactFlowEdges(graphData.edges);

        setNodes(flowNodes);
        setEdges(flowEdges);

        // Fit view after layout is applied
        if (reactFlowInstance) {
            setTimeout(() => {
                reactFlowInstance.fitView(fitViewOptions);
            }, 50);
        }
    }, [
        graphData,
        layout,
        reactFlowInstance,
    ]);

    // Handle selection and highlight changes separately
    useEffect(() => {
        if (!graphData || graphData.nodes.length === 0) return;

        // Update nodes and edges with current selection/highlight state
        const updatedNodes = convertToReactFlowNodes(graphData.nodes);
        const updatedEdges = convertToReactFlowEdges(graphData.edges);

        setNodes(updatedNodes);
        setEdges(updatedEdges);
    }, [
        selectionManager.selectionState,
        selectionManager.primarySelectedNode,
        selectionManager.primarySelectedEdge,
        edgeInteraction.selectedEdgeId,
    ]);

    // Handle node click with navigation logic and selection
    const handleNodeClick = useCallback(
        async (event: React.MouseEvent, node: Node) => {
            const nodeData = node.data as NodeData;

            // Handle selection with modifiers
            selectionManager.handleNodeClick(node.id, {
                ctrlKey: event.ctrlKey,
                shiftKey: event.shiftKey,
                altKey: event.altKey,
            });

            // Handle navigation based on node category
            if (canNavigate(nodeData)) {
                const navResult = getNodeNavigationUrl(nodeData);

                if (navResult.type !== 'none') {
                    try {
                        // Clear any previous errors
                        setNavigationError(null);

                        if (navResult.openInNewTab || navResult.isExternal) {
                            // Open in new tab - no loading state needed
                            window.open(navResult.url, '_blank', 'noopener,noreferrer');
                        } else {
                            // Set loading state for same-page navigation
                            setIsNavigating(true);

                            // Navigate using Next.js router
                            router.push(navResult.url);

                            // Note: Loading state will be cleared when component unmounts
                            // or when navigation completes
                        }
                    } catch (error) {
                        // Handle navigation errors
                        console.error('Navigation error:', error);
                        const errorType = navResult.type === 'roadmap' ? 'roadmap' :
                            navResult.type === 'external' ? 'liên kết ngoài' : 'bài viết';
                        setNavigationError(
                            `Không thể điều hướng đến ${errorType}. Vui lòng thử lại.`
                        );
                        setIsNavigating(false);
                    }
                }
            }
        },
        [selectionManager, router]
    );

    // Handle edge click với enhanced interaction
    const handleEdgeClick = useCallback(
        (event: React.MouseEvent, edge: Edge) => {
            // Handle selection with modifiers
            selectionManager.handleEdgeClick(edge.id, {
                ctrlKey: event.ctrlKey,
                shiftKey: event.shiftKey,
                altKey: event.altKey,
            });
        },
        [selectionManager]
    );

    // Zoom controls with level tracking
    const handleZoomIn = useCallback(() => {
        if (reactFlowInstance) {
            reactFlowInstance.zoomIn({ duration: 300 });
        }
    }, [reactFlowInstance]);

    const handleZoomOut = useCallback(() => {
        if (reactFlowInstance) {
            reactFlowInstance.zoomOut({ duration: 300 });
        }
    }, [reactFlowInstance]);

    const handleFitView = useCallback(() => {
        if (reactFlowInstance) {
            reactFlowInstance.fitView(fitViewOptions);
        }
    }, [reactFlowInstance]);

    // Pan controls
    const handlePanReset = useCallback(() => {
        if (reactFlowInstance) {
            // Reset pan to center position with smooth animation
            reactFlowInstance.setViewport({ x: 0, y: 0, zoom: 1 }, { duration: 400 });
        }
    }, [reactFlowInstance]);

    // Track zoom level changes
    const handleViewportChange = useCallback((viewport: { x: number; y: number; zoom: number }) => {
        setZoomLevel(viewport.zoom);
    }, []);

    // Keyboard shortcuts for zoom, pan controls, and selection management
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Let selection manager handle keyboard events first
            const handled = selectionManager.handleKeyDown(event);
            if (handled) return;

            // Check if Ctrl (or Cmd on Mac) is pressed
            const isCtrlPressed = event.ctrlKey || event.metaKey;

            if (isCtrlPressed) {
                switch (event.key) {
                    case '=':
                    case '+':
                        event.preventDefault();
                        handleZoomIn();
                        break;
                    case '-':
                        event.preventDefault();
                        handleZoomOut();
                        break;
                    case '0':
                        event.preventDefault();
                        handleFitView();
                        break;
                    case 'r':
                    case 'R':
                        event.preventDefault();
                        handlePanReset();
                        break;
                    default:
                        break;
                }
            }
        };

        // Add event listener
        document.addEventListener('keydown', handleKeyDown);

        // Cleanup
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleZoomIn, handleZoomOut, handleFitView, handlePanReset, selectionManager]);

    // Layout change handler
    const handleLayoutChange = useCallback((newLayout: LayoutType) => {
        setLayout(newLayout);
    }, []);

    // Handle navigation from NodeDetailsPanel
    const handleNavigationFromPanel = useCallback((url: string, openInNewTab?: boolean) => {
        try {
            setNavigationError(null);

            if (openInNewTab) {
                window.open(url, '_blank', 'noopener,noreferrer');
            } else {
                setIsNavigating(true);
                router.push(url);
            }
        } catch (error) {
            console.error('Navigation error from panel:', error);
            setNavigationError('Không thể điều hướng. Vui lòng thử lại.');
            setIsNavigating(false);
        }
    }, [router]);

    // Get selected node data for details panel
    const selectedNodeData = selectedNodeId
        ? graphData.nodes.find(node => node.id === selectedNodeId)?.data
        : null;

    return (
        <div className={`relative w-full h-full bg-background-secondary overflow-hidden ${className}`}>
            {/* Loading overlay with enhanced styling */}
            {isNavigating && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-md">
                    <div className="flex flex-col items-center gap-4 p-8 bg-white/80 rounded-2xl shadow-large border border-neutral-100">
                        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
                        <p className="text-sm font-medium text-neutral-700">
                            Đang điều hướng...
                        </p>
                    </div>
                </div>
            )}

            {/* Enhanced error notification */}
            {navigationError && (
                <div className="absolute top-6 right-6 z-40 max-w-md animate-slide-down">
                    <div className="bg-error-50 border border-error-200 rounded-xl p-4 shadow-medium">
                        <div className="flex items-start gap-3">
                            <svg
                                className="w-5 h-5 text-error-600 flex-shrink-0 mt-0.5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-error-800">
                                    {navigationError}
                                </p>
                            </div>
                            <button
                                onClick={() => setNavigationError(null)}
                                className="text-error-600 hover:text-error-800 transition-colors duration-200 p-1 rounded-md hover:bg-error-100"
                                aria-label="Đóng thông báo lỗi"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Enhanced visualization controls with glass morphism */}
            <div className="absolute top-6 left-6 z-20">
                <div className="glass rounded-xl p-3 shadow-medium animate-fade-in">
                    <VisualizationControls
                        onZoomIn={handleZoomIn}
                        onZoomOut={handleZoomOut}
                        onFitView={handleFitView}
                        onPanReset={handlePanReset}
                        onLayoutChange={handleLayoutChange}
                        currentLayout={layout}
                        zoomLevel={zoomLevel}
                    />
                </div>
            </div>

            {/* Selection Toolbar */}
            <SelectionToolbar
                selectedCount={selectionManager.selectedCount}
                selectionMode={selectionManager.selectionMode}
                onSelectAll={selectionManager.selectAll}
                onClearSelection={selectionManager.clearSelection}
                onInvertSelection={selectionManager.invertSelection}
                onSetSelectionMode={selectionManager.setSelectionMode}
                enableMultiSelection={true}
                enableRangeSelection={true}
                position="top"
                className="animate-slide-down"
            />

            {/* Selection Visual Indicators */}
            <SelectionIndicator
                selectedNodes={selectionManager.selectionState.selectedNodes}
                selectedEdges={selectionManager.selectionState.selectedEdges}
                highlightedNodes={selectionManager.selectionState.highlightedNodes}
                highlightedEdges={selectionManager.selectionState.highlightedEdges}
                primarySelectedNode={selectionManager.primarySelectedNode}
                primarySelectedEdge={selectionManager.primarySelectedEdge}
                nodes={graphData.nodes}
                edges={graphData.edges}
                showConnections={true}
                showLabels={false}
                animateSelection={true}
            />

            {/* Enhanced Node Details Panel */}
            {selectedNodeId && selectedNodeData && (
                <div className="absolute top-6 right-6 w-96 z-30">
                    <NodeDetailsPanel
                        nodeId={selectedNodeId}
                        nodeData={selectedNodeData}
                        onClose={() => handleNodeSelection(null)}
                        onNavigate={handleNavigationFromPanel}
                        onNodeSelect={handleNodeSelection}
                        allNodes={graphData.nodes}
                        allEdges={graphData.edges}
                        highlightedNodes={highlightedNodes}
                        highlightedEdges={highlightedEdges}
                        onBookmark={(nodeId) => {
                            // TODO: Implement bookmark functionality
                            console.log('Bookmark node:', nodeId);
                        }}
                        onShare={(nodeId) => {
                            // TODO: Implement share functionality
                            console.log('Share node:', nodeId);
                        }}
                        onMarkComplete={(nodeId, completed) => {
                            // TODO: Implement progress tracking
                            console.log('Mark complete:', nodeId, completed);
                        }}
                        isBookmarked={false} // TODO: Get from user preferences
                        userProgress={{
                            completedNodes: new Set(graphData.nodes.filter(n => n.data.completed).map(n => n.id)),
                            totalNodes: graphData.nodes.length,
                            progressPercentage: (graphData.nodes.filter(n => n.data.completed).length / graphData.nodes.length) * 100
                        }}
                        className="animate-slide-down"
                    />
                </div>
            )}

            {/* Enhanced Edge Details Panel */}
            {edgeInteraction.relationshipDetails && (
                <div className="absolute top-6 right-6 w-96 z-30">
                    <EdgeDetailsPanel
                        relationshipDetails={edgeInteraction.relationshipDetails}
                        onClose={() => edgeInteraction.clearSelection()}
                        onNavigateToNode={(nodeId) => {
                            // Clear edge selection and select the target node
                            edgeInteraction.clearSelection();
                            handleNodeSelection(nodeId);
                        }}
                        className="animate-slide-down"
                    />
                </div>
            )}

            {/* React Flow canvas with enhanced configuration */}
            <div className="w-full h-full">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onNodeClick={handleNodeClick}
                    onEdgeClick={handleEdgeClick}
                    onInit={setReactFlowInstance}
                    onViewportChange={handleViewportChange}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    {...reactFlowConfig}
                    className="w-full h-full"
                    proOptions={{ hideAttribution: true }}
                >
                    {/* Enhanced background with warm design system colors */}
                    <Background
                        color="var(--color-neutral-300)"
                        gap={20}
                        size={1.5}
                        className="opacity-30"
                    />

                    {/* Hidden default controls - we use custom ones */}
                    <Controls
                        showZoom={false}
                        showFitView={false}
                        showInteractive={false}
                        className="hidden"
                    />

                    {/* Enhanced MiniMap with warm colors */}
                    <MiniMap
                        nodeColor={(node) => {
                            const data = node.data as NodeData;
                            switch (data.difficulty) {
                                case 'beginner':
                                    return 'var(--color-success-500)';
                                case 'intermediate':
                                    return 'var(--color-warning-500)';
                                case 'advanced':
                                    return 'var(--color-error-500)';
                                default:
                                    return 'var(--color-primary-400)';
                            }
                        }}
                        className="!bg-white/90 !backdrop-blur-sm !border !border-neutral-200 !rounded-lg !shadow-medium"
                        maskColor="rgba(237, 124, 71, 0.1)"
                        position="bottom-right"
                        pannable
                        zoomable
                    />
                </ReactFlow>
            </div>

            {/* Enhanced status indicator */}
            {nodes.length > 0 && (
                <div className="absolute bottom-6 left-6 z-10">
                    <div className="glass rounded-lg px-4 py-2 shadow-soft">
                        <div className="flex items-center gap-2 text-sm text-neutral-600">
                            <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                            <span>{nodes.length} nodes • {edges.length} connections</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
