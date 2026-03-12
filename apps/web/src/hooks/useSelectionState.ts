'use client';

/**
 * Hook quản lý trạng thái selection cho roadmap visualization
 * Hỗ trợ single và multi-selection cho nodes và edges
 * Tích hợp với keyboard modifiers và highlighting system
 */

import { useCallback, useState, useEffect } from 'react';
import type { RoadmapNode, RoadmapEdge } from '@viztechstack/roadmap-visualization';

/**
 * Selection mode types
 */
export type SelectionMode = 'single' | 'multi' | 'range';

/**
 * Selection state cho nodes và edges
 */
export interface SelectionState {
    // Node selection
    selectedNodes: Set<string>;
    primarySelectedNode: string | null; // Node được chọn cuối cùng (cho keyboard navigation)

    // Edge selection
    selectedEdges: Set<string>;
    primarySelectedEdge: string | null;

    // Highlighting
    highlightedNodes: Set<string>;
    highlightedEdges: Set<string>;

    // Selection mode
    mode: SelectionMode;

    // Connected elements
    connectedElements: Map<string, { nodes: Set<string>; edges: Set<string> }>;
}

/**
 * Selection event data
 */
export interface SelectionEvent {
    type: 'node' | 'edge';
    id: string;
    selected: boolean;
    modifiers: {
        ctrl: boolean;
        shift: boolean;
        alt: boolean;
    };
}

/**
 * Options cho selection hook
 */
export interface UseSelectionStateOptions {
    nodes: RoadmapNode[];
    edges: RoadmapEdge[];
    maxSelections?: number; // Giới hạn số lượng selections (0 = unlimited)
    enableMultiSelection?: boolean;
    enableRangeSelection?: boolean;
    onSelectionChange?: (state: SelectionState) => void;
    onHighlightChange?: (highlightedNodes: Set<string>, highlightedEdges: Set<string>) => void;
}

/**
 * Hook return type
 */
export interface UseSelectionStateReturn {
    // Current state
    selectionState: SelectionState;

    // Node selection actions
    selectNode: (nodeId: string, modifiers?: { ctrl?: boolean; shift?: boolean; alt?: boolean }) => void;
    deselectNode: (nodeId: string) => void;
    toggleNodeSelection: (nodeId: string, modifiers?: { ctrl?: boolean; shift?: boolean; alt?: boolean }) => void;

    // Edge selection actions
    selectEdge: (edgeId: string, modifiers?: { ctrl?: boolean; shift?: boolean; alt?: boolean }) => void;
    deselectEdge: (edgeId: string) => void;
    toggleEdgeSelection: (edgeId: string, modifiers?: { ctrl?: boolean; shift?: boolean; alt?: boolean }) => void;

    // Bulk actions
    selectAll: () => void;
    selectAllNodes: () => void;
    selectAllEdges: () => void;
    clearSelection: () => void;
    clearNodeSelection: () => void;
    clearEdgeSelection: () => void;

    // Range selection
    selectNodeRange: (startNodeId: string, endNodeId: string) => void;
    selectEdgeRange: (startEdgeId: string, endEdgeId: string) => void;

    // Connected elements
    selectConnectedElements: (elementId: string, elementType: 'node' | 'edge') => void;
    highlightConnectedElements: (elementId: string, elementType: 'node' | 'edge') => void;
    clearHighlighting: () => void;

    // Utilities
    isNodeSelected: (nodeId: string) => boolean;
    isEdgeSelected: (edgeId: string) => boolean;
    isNodeHighlighted: (nodeId: string) => boolean;
    isEdgeHighlighted: (edgeId: string) => boolean;
    getSelectedCount: () => { nodes: number; edges: number; total: number };

    // Keyboard navigation
    selectNextNode: (direction: 'up' | 'down' | 'left' | 'right') => void;
    selectPreviousNode: () => void;

    // Selection mode
    setSelectionMode: (mode: SelectionMode) => void;
}

/**
 * Hook chính cho selection state management
 */
export function useSelectionState({
    nodes,
    edges,
    maxSelections = 0,
    enableMultiSelection = true,
    enableRangeSelection = true,
    onSelectionChange,
    onHighlightChange,
}: UseSelectionStateOptions): UseSelectionStateReturn {

    // Core selection state
    const [selectionState, setSelectionState] = useState<SelectionState>({
        selectedNodes: new Set(),
        primarySelectedNode: null,
        selectedEdges: new Set(),
        primarySelectedEdge: null,
        highlightedNodes: new Set(),
        highlightedEdges: new Set(),
        mode: enableMultiSelection ? 'multi' : 'single',
        connectedElements: new Map(),
    });

    // Selection history cho undo/redo (có thể mở rộng sau)
    const [selectionHistory, setSelectionHistory] = useState<SelectionState[]>([]);

    /**
     * Tính toán connected elements cho một node hoặc edge
     */
    const calculateConnectedElements = useCallback((elementId: string, elementType: 'node' | 'edge') => {
        const connectedNodes = new Set<string>();
        const connectedEdges = new Set<string>();

        if (elementType === 'node') {
            // Tìm tất cả edges kết nối với node này
            edges.forEach(edge => {
                if (edge.source === elementId || edge.target === elementId) {
                    connectedEdges.add(edge.id);
                    connectedNodes.add(edge.source);
                    connectedNodes.add(edge.target);
                }
            });
        } else {
            // Tìm nodes kết nối với edge này
            const edge = edges.find(e => e.id === elementId);
            if (edge) {
                connectedNodes.add(edge.source);
                connectedNodes.add(edge.target);
                connectedEdges.add(edge.id);
            }
        }

        return { nodes: connectedNodes, edges: connectedEdges };
    }, [edges]);

    /**
     * Update connected elements cache
     */
    const updateConnectedElementsCache = useCallback(() => {
        const newConnectedElements = new Map<string, { nodes: Set<string>; edges: Set<string> }>();

        // Cache cho tất cả nodes
        nodes.forEach(node => {
            newConnectedElements.set(node.id, calculateConnectedElements(node.id, 'node'));
        });

        // Cache cho tất cả edges
        edges.forEach(edge => {
            newConnectedElements.set(edge.id, calculateConnectedElements(edge.id, 'edge'));
        });

        setSelectionState(prev => ({
            ...prev,
            connectedElements: newConnectedElements,
        }));
    }, [nodes, edges, calculateConnectedElements]);

    // Update cache khi nodes hoặc edges thay đổi
    useEffect(() => {
        updateConnectedElementsCache();
    }, [updateConnectedElementsCache]);

    /**
     * Validate selection limits
     */
    const validateSelectionLimits = useCallback((newSelectedNodes: Set<string>, newSelectedEdges: Set<string>): boolean => {
        if (maxSelections === 0) return true;
        return (newSelectedNodes.size + newSelectedEdges.size) <= maxSelections;
    }, [maxSelections]);

    /**
     * Update selection state với validation
     */
    const updateSelectionState = useCallback((updates: Partial<SelectionState>) => {
        setSelectionState(prev => {
            const newState = { ...prev, ...updates };

            // Validate selection limits
            if (!validateSelectionLimits(newState.selectedNodes, newState.selectedEdges)) {
                return prev; // Không update nếu vượt quá giới hạn
            }

            // Call external handlers
            onSelectionChange?.(newState);
            onHighlightChange?.(newState.highlightedNodes, newState.highlightedEdges);

            return newState;
        });
    }, [validateSelectionLimits, onSelectionChange, onHighlightChange]);

    /**
     * Select node với support cho modifiers
     */
    const selectNode = useCallback((nodeId: string, modifiers: { ctrl?: boolean; shift?: boolean; alt?: boolean } = {}) => {
        const { ctrl = false, shift = false } = modifiers;

        setSelectionState(prev => {
            let newSelectedNodes = new Set(prev.selectedNodes);
            let newSelectedEdges = new Set(prev.selectedEdges);
            let newPrimaryNode = nodeId;

            if (shift && enableRangeSelection && prev.primarySelectedNode) {
                // Range selection
                const startIndex = nodes.findIndex(n => n.id === prev.primarySelectedNode);
                const endIndex = nodes.findIndex(n => n.id === nodeId);

                if (startIndex !== -1 && endIndex !== -1) {
                    const start = Math.min(startIndex, endIndex);
                    const end = Math.max(startIndex, endIndex);

                    for (let i = start; i <= end; i++) {
                        newSelectedNodes.add(nodes[i].id);
                    }
                }
            } else if (ctrl && enableMultiSelection) {
                // Multi-selection toggle
                if (newSelectedNodes.has(nodeId)) {
                    newSelectedNodes.delete(nodeId);
                    // Update primary node nếu node hiện tại bị deselect
                    if (prev.primarySelectedNode === nodeId) {
                        newPrimaryNode = newSelectedNodes.size > 0 ? Array.from(newSelectedNodes)[0] : null;
                    } else {
                        newPrimaryNode = prev.primarySelectedNode;
                    }
                } else {
                    newSelectedNodes.add(nodeId);
                }
            } else {
                // Single selection (clear others)
                newSelectedNodes = new Set([nodeId]);
                newSelectedEdges = new Set(); // Clear edge selection
            }

            // Validate limits
            if (!validateSelectionLimits(newSelectedNodes, newSelectedEdges)) {
                return prev;
            }

            // Calculate highlighting
            const highlightedNodes = new Set<string>();
            const highlightedEdges = new Set<string>();

            newSelectedNodes.forEach(selectedNodeId => {
                const connected = prev.connectedElements.get(selectedNodeId);
                if (connected) {
                    connected.nodes.forEach(nodeId => highlightedNodes.add(nodeId));
                    connected.edges.forEach(edgeId => highlightedEdges.add(edgeId));
                }
            });

            const newState = {
                ...prev,
                selectedNodes: newSelectedNodes,
                selectedEdges: newSelectedEdges,
                primarySelectedNode: newPrimaryNode,
                primarySelectedEdge: newSelectedEdges.size > 0 ? Array.from(newSelectedEdges)[0] : null,
                highlightedNodes,
                highlightedEdges,
            };

            // Call external handlers
            onSelectionChange?.(newState);
            onHighlightChange?.(highlightedNodes, highlightedEdges);

            return newState;
        });
    }, [nodes, enableRangeSelection, enableMultiSelection, validateSelectionLimits, onSelectionChange, onHighlightChange]);

    /**
     * Deselect node
     */
    const deselectNode = useCallback((nodeId: string) => {
        updateSelectionState({
            selectedNodes: new Set([...selectionState.selectedNodes].filter(id => id !== nodeId)),
            primarySelectedNode: selectionState.primarySelectedNode === nodeId ? null : selectionState.primarySelectedNode,
        });
    }, [selectionState, updateSelectionState]);

    /**
     * Toggle node selection
     */
    const toggleNodeSelection = useCallback((nodeId: string, modifiers: { ctrl?: boolean; shift?: boolean; alt?: boolean } = {}) => {
        if (selectionState.selectedNodes.has(nodeId)) {
            deselectNode(nodeId);
        } else {
            selectNode(nodeId, modifiers);
        }
    }, [selectionState.selectedNodes, selectNode, deselectNode]);

    /**
     * Select edge với support cho modifiers
     */
    const selectEdge = useCallback((edgeId: string, modifiers: { ctrl?: boolean; shift?: boolean; alt?: boolean } = {}) => {
        const { ctrl = false, shift = false } = modifiers;

        setSelectionState(prev => {
            let newSelectedEdges = new Set(prev.selectedEdges);
            let newSelectedNodes = new Set(prev.selectedNodes);
            let newPrimaryEdge = edgeId;

            if (shift && enableRangeSelection && prev.primarySelectedEdge) {
                // Range selection cho edges
                const startIndex = edges.findIndex(e => e.id === prev.primarySelectedEdge);
                const endIndex = edges.findIndex(e => e.id === edgeId);

                if (startIndex !== -1 && endIndex !== -1) {
                    const start = Math.min(startIndex, endIndex);
                    const end = Math.max(startIndex, endIndex);

                    for (let i = start; i <= end; i++) {
                        newSelectedEdges.add(edges[i].id);
                    }
                }
            } else if (ctrl && enableMultiSelection) {
                // Multi-selection toggle
                if (newSelectedEdges.has(edgeId)) {
                    newSelectedEdges.delete(edgeId);
                    if (prev.primarySelectedEdge === edgeId) {
                        newPrimaryEdge = newSelectedEdges.size > 0 ? Array.from(newSelectedEdges)[0] : null;
                    } else {
                        newPrimaryEdge = prev.primarySelectedEdge;
                    }
                } else {
                    newSelectedEdges.add(edgeId);
                }
            } else {
                // Single selection
                newSelectedEdges = new Set([edgeId]);
                newSelectedNodes = new Set(); // Clear node selection
            }

            // Validate limits
            if (!validateSelectionLimits(newSelectedNodes, newSelectedEdges)) {
                return prev;
            }

            // Calculate highlighting
            const highlightedNodes = new Set<string>();
            const highlightedEdges = new Set<string>();

            newSelectedEdges.forEach(selectedEdgeId => {
                const connected = prev.connectedElements.get(selectedEdgeId);
                if (connected) {
                    connected.nodes.forEach(nodeId => highlightedNodes.add(nodeId));
                    connected.edges.forEach(edgeId => highlightedEdges.add(edgeId));
                }
            });

            const newState = {
                ...prev,
                selectedNodes: newSelectedNodes,
                selectedEdges: newSelectedEdges,
                primarySelectedNode: newSelectedNodes.size > 0 ? Array.from(newSelectedNodes)[0] : null,
                primarySelectedEdge: newPrimaryEdge,
                highlightedNodes,
                highlightedEdges,
            };

            // Call external handlers
            onSelectionChange?.(newState);
            onHighlightChange?.(highlightedNodes, highlightedEdges);

            return newState;
        });
    }, [edges, enableRangeSelection, enableMultiSelection, validateSelectionLimits, onSelectionChange, onHighlightChange]);

    /**
     * Deselect edge
     */
    const deselectEdge = useCallback((edgeId: string) => {
        updateSelectionState({
            selectedEdges: new Set([...selectionState.selectedEdges].filter(id => id !== edgeId)),
            primarySelectedEdge: selectionState.primarySelectedEdge === edgeId ? null : selectionState.primarySelectedEdge,
        });
    }, [selectionState, updateSelectionState]);

    /**
     * Toggle edge selection
     */
    const toggleEdgeSelection = useCallback((edgeId: string, modifiers: { ctrl?: boolean; shift?: boolean; alt?: boolean } = {}) => {
        if (selectionState.selectedEdges.has(edgeId)) {
            deselectEdge(edgeId);
        } else {
            selectEdge(edgeId, modifiers);
        }
    }, [selectionState.selectedEdges, selectEdge, deselectEdge]);

    /**
     * Select all elements
     */
    const selectAll = useCallback(() => {
        const allNodeIds = new Set(nodes.map(n => n.id));
        const allEdgeIds = new Set(edges.map(e => e.id));

        if (!validateSelectionLimits(allNodeIds, allEdgeIds)) {
            return; // Không thể select all nếu vượt quá giới hạn
        }

        updateSelectionState({
            selectedNodes: allNodeIds,
            selectedEdges: allEdgeIds,
            primarySelectedNode: nodes.length > 0 ? nodes[0].id : null,
            primarySelectedEdge: edges.length > 0 ? edges[0].id : null,
        });
    }, [nodes, edges, validateSelectionLimits, updateSelectionState]);

    /**
     * Select all nodes
     */
    const selectAllNodes = useCallback(() => {
        const allNodeIds = new Set(nodes.map(n => n.id));

        if (!validateSelectionLimits(allNodeIds, new Set())) {
            return;
        }

        updateSelectionState({
            selectedNodes: allNodeIds,
            selectedEdges: new Set(),
            primarySelectedNode: nodes.length > 0 ? nodes[0].id : null,
            primarySelectedEdge: null,
        });
    }, [nodes, validateSelectionLimits, updateSelectionState]);

    /**
     * Select all edges
     */
    const selectAllEdges = useCallback(() => {
        const allEdgeIds = new Set(edges.map(e => e.id));

        if (!validateSelectionLimits(new Set(), allEdgeIds)) {
            return;
        }

        updateSelectionState({
            selectedNodes: new Set(),
            selectedEdges: allEdgeIds,
            primarySelectedNode: null,
            primarySelectedEdge: edges.length > 0 ? edges[0].id : null,
        });
    }, [edges, validateSelectionLimits, updateSelectionState]);

    /**
     * Clear all selections
     */
    const clearSelection = useCallback(() => {
        updateSelectionState({
            selectedNodes: new Set(),
            selectedEdges: new Set(),
            primarySelectedNode: null,
            primarySelectedEdge: null,
            highlightedNodes: new Set(),
            highlightedEdges: new Set(),
        });
    }, [updateSelectionState]);

    /**
     * Clear node selection only
     */
    const clearNodeSelection = useCallback(() => {
        updateSelectionState({
            selectedNodes: new Set(),
            primarySelectedNode: null,
        });
    }, [updateSelectionState]);

    /**
     * Clear edge selection only
     */
    const clearEdgeSelection = useCallback(() => {
        updateSelectionState({
            selectedEdges: new Set(),
            primarySelectedEdge: null,
        });
    }, [updateSelectionState]);

    /**
     * Select node range
     */
    const selectNodeRange = useCallback((startNodeId: string, endNodeId: string) => {
        const startIndex = nodes.findIndex(n => n.id === startNodeId);
        const endIndex = nodes.findIndex(n => n.id === endNodeId);

        if (startIndex === -1 || endIndex === -1) return;

        const start = Math.min(startIndex, endIndex);
        const end = Math.max(startIndex, endIndex);
        const rangeNodeIds = new Set<string>();

        for (let i = start; i <= end; i++) {
            rangeNodeIds.add(nodes[i].id);
        }

        if (!validateSelectionLimits(rangeNodeIds, selectionState.selectedEdges)) {
            return;
        }

        updateSelectionState({
            selectedNodes: rangeNodeIds,
            primarySelectedNode: endNodeId,
        });
    }, [nodes, selectionState.selectedEdges, validateSelectionLimits, updateSelectionState]);

    /**
     * Select edge range
     */
    const selectEdgeRange = useCallback((startEdgeId: string, endEdgeId: string) => {
        const startIndex = edges.findIndex(e => e.id === startEdgeId);
        const endIndex = edges.findIndex(e => e.id === endEdgeId);

        if (startIndex === -1 || endIndex === -1) return;

        const start = Math.min(startIndex, endIndex);
        const end = Math.max(startIndex, endIndex);
        const rangeEdgeIds = new Set<string>();

        for (let i = start; i <= end; i++) {
            rangeEdgeIds.add(edges[i].id);
        }

        if (!validateSelectionLimits(selectionState.selectedNodes, rangeEdgeIds)) {
            return;
        }

        updateSelectionState({
            selectedEdges: rangeEdgeIds,
            primarySelectedEdge: endEdgeId,
        });
    }, [edges, selectionState.selectedNodes, validateSelectionLimits, updateSelectionState]);

    /**
     * Select connected elements
     */
    const selectConnectedElements = useCallback((elementId: string, elementType: 'node' | 'edge') => {
        const connected = selectionState.connectedElements.get(elementId);
        if (!connected) return;

        const newSelectedNodes = new Set([...selectionState.selectedNodes, ...connected.nodes]);
        const newSelectedEdges = new Set([...selectionState.selectedEdges, ...connected.edges]);

        if (!validateSelectionLimits(newSelectedNodes, newSelectedEdges)) {
            return;
        }

        updateSelectionState({
            selectedNodes: newSelectedNodes,
            selectedEdges: newSelectedEdges,
            primarySelectedNode: elementType === 'node' ? elementId : selectionState.primarySelectedNode,
            primarySelectedEdge: elementType === 'edge' ? elementId : selectionState.primarySelectedEdge,
        });
    }, [selectionState, validateSelectionLimits, updateSelectionState]);

    /**
     * Highlight connected elements without selecting
     */
    const highlightConnectedElements = useCallback((elementId: string, elementType: 'node' | 'edge') => {
        const connected = selectionState.connectedElements.get(elementId);
        if (!connected) return;

        updateSelectionState({
            highlightedNodes: new Set([...selectionState.highlightedNodes, ...connected.nodes]),
            highlightedEdges: new Set([...selectionState.highlightedEdges, ...connected.edges]),
        });
    }, [selectionState, updateSelectionState]);

    /**
     * Clear highlighting
     */
    const clearHighlighting = useCallback(() => {
        updateSelectionState({
            highlightedNodes: new Set(),
            highlightedEdges: new Set(),
        });
    }, [updateSelectionState]);

    /**
     * Utility functions
     */
    const isNodeSelected = useCallback((nodeId: string): boolean => {
        return selectionState.selectedNodes.has(nodeId);
    }, [selectionState.selectedNodes]);

    const isEdgeSelected = useCallback((edgeId: string): boolean => {
        return selectionState.selectedEdges.has(edgeId);
    }, [selectionState.selectedEdges]);

    const isNodeHighlighted = useCallback((nodeId: string): boolean => {
        return selectionState.highlightedNodes.has(nodeId);
    }, [selectionState.highlightedNodes]);

    const isEdgeHighlighted = useCallback((edgeId: string): boolean => {
        return selectionState.highlightedEdges.has(edgeId);
    }, [selectionState.highlightedEdges]);

    const getSelectedCount = useCallback(() => {
        return {
            nodes: selectionState.selectedNodes.size,
            edges: selectionState.selectedEdges.size,
            total: selectionState.selectedNodes.size + selectionState.selectedEdges.size,
        };
    }, [selectionState]);

    /**
     * Keyboard navigation
     */
    const selectNextNode = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
        if (!selectionState.primarySelectedNode) {
            // Nếu không có node nào được chọn, chọn node đầu tiên
            if (nodes.length > 0) {
                selectNode(nodes[0].id);
            }
            return;
        }

        const currentNode = nodes.find(n => n.id === selectionState.primarySelectedNode);
        if (!currentNode) return;

        // Tìm node tiếp theo theo hướng
        let bestNode: RoadmapNode | null = null;
        let bestDistance = Infinity;

        nodes.forEach(node => {
            if (node.id === currentNode.id) return;

            const dx = node.position.x - currentNode.position.x;
            const dy = node.position.y - currentNode.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            let isInDirection = false;
            switch (direction) {
                case 'up':
                    isInDirection = dy < -20 && Math.abs(dx) < Math.abs(dy);
                    break;
                case 'down':
                    isInDirection = dy > 20 && Math.abs(dx) < Math.abs(dy);
                    break;
                case 'left':
                    isInDirection = dx < -20 && Math.abs(dy) < Math.abs(dx);
                    break;
                case 'right':
                    isInDirection = dx > 20 && Math.abs(dy) < Math.abs(dx);
                    break;
            }

            if (isInDirection && distance < bestDistance) {
                bestDistance = distance;
                bestNode = node;
            }
        });

        if (bestNode) {
            selectNode(bestNode.id);
        }
    }, [selectionState.primarySelectedNode, nodes, selectNode]);

    const selectPreviousNode = useCallback(() => {
        if (selectionHistory.length > 0) {
            const previousState = selectionHistory[selectionHistory.length - 1];
            setSelectionState(previousState);
            setSelectionHistory(prev => prev.slice(0, -1));
        }
    }, [selectionHistory]);

    /**
     * Set selection mode
     */
    const setSelectionMode = useCallback((mode: SelectionMode) => {
        updateSelectionState({ mode });
    }, [updateSelectionState]);

    return {
        // Current state
        selectionState,

        // Node selection actions
        selectNode,
        deselectNode,
        toggleNodeSelection,

        // Edge selection actions
        selectEdge,
        deselectEdge,
        toggleEdgeSelection,

        // Bulk actions
        selectAll,
        selectAllNodes,
        selectAllEdges,
        clearSelection,
        clearNodeSelection,
        clearEdgeSelection,

        // Range selection
        selectNodeRange,
        selectEdgeRange,

        // Connected elements
        selectConnectedElements,
        highlightConnectedElements,
        clearHighlighting,

        // Utilities
        isNodeSelected,
        isEdgeSelected,
        isNodeHighlighted,
        isEdgeHighlighted,
        getSelectedCount,

        // Keyboard navigation
        selectNextNode,
        selectPreviousNode,

        // Selection mode
        setSelectionMode,
    };
}