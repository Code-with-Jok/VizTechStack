'use client';

/**
 * Hook quản lý tổng thể selection state cho roadmap visualization
 * Tích hợp với existing node và edge interaction systems
 * Hỗ trợ keyboard shortcuts và accessibility features
 */

import { useCallback, useEffect, useState } from 'react';
import type { RoadmapNode, RoadmapEdge } from '@viztechstack/roadmap-visualization';
import { useSelectionState, type SelectionState, type SelectionMode } from './useSelectionState';
import { useEdgeInteraction, type UseEdgeInteractionOptions } from './useEdgeInteraction';

/**
 * Selection manager configuration
 */
export interface SelectionManagerConfig {
    // Selection limits
    maxSelections?: number;
    maxNodeSelections?: number;
    maxEdgeSelections?: number;

    // Features
    enableMultiSelection?: boolean;
    enableRangeSelection?: boolean;
    enableKeyboardNavigation?: boolean;
    enableConnectedHighlighting?: boolean;

    // Behavior
    clearOnBackgroundClick?: boolean;
    selectConnectedOnDoubleClick?: boolean;
    highlightOnHover?: boolean;

    // Accessibility
    announceSelections?: boolean;
    focusSelectedElements?: boolean;
}

/**
 * Selection manager options
 */
export interface UseSelectionManagerOptions {
    nodes: RoadmapNode[];
    edges: RoadmapEdge[];
    config?: SelectionManagerConfig;

    // Event handlers
    onNodeSelect?: (nodeId: string, selected: boolean) => void;
    onEdgeSelect?: (edgeId: string, selected: boolean) => void;
    onSelectionChange?: (state: SelectionState) => void;
    onHighlightChange?: (highlightedNodes: Set<string>, highlightedEdges: Set<string>) => void;
}

/**
 * Selection manager return type
 */
export interface UseSelectionManagerReturn {
    // Current state
    selectionState: SelectionState;
    selectedCount: { nodes: number; edges: number; total: number };

    // Primary selection (for keyboard navigation)
    primarySelectedNode: string | null;
    primarySelectedEdge: string | null;

    // Selection actions
    handleNodeClick: (nodeId: string, event?: { ctrlKey?: boolean; shiftKey?: boolean; altKey?: boolean }) => void;
    handleEdgeClick: (edgeId: string, event?: { ctrlKey?: boolean; shiftKey?: boolean; altKey?: boolean }) => void;
    handleNodeDoubleClick: (nodeId: string) => void;
    handleEdgeDoubleClick: (edgeId: string) => void;

    // Hover actions
    handleNodeHover: (nodeId: string | null) => void;
    handleEdgeHover: (edgeId: string | null) => void;

    // Keyboard actions
    handleKeyDown: (event: KeyboardEvent) => boolean; // Returns true if handled

    // Bulk actions
    selectAll: () => void;
    clearSelection: () => void;
    invertSelection: () => void;

    // Utilities
    isNodeSelected: (nodeId: string) => boolean;
    isEdgeSelected: (edgeId: string) => boolean;
    isNodeHighlighted: (nodeId: string) => boolean;
    isEdgeHighlighted: (edgeId: string) => boolean;

    // Selection mode
    selectionMode: SelectionMode;
    setSelectionMode: (mode: SelectionMode) => void;

    // Edge interaction integration
    edgeInteraction: ReturnType<typeof useEdgeInteraction>;
}

/**
 * Default configuration
 */
const defaultConfig: Required<SelectionManagerConfig> = {
    maxSelections: 0, // Unlimited
    maxNodeSelections: 0,
    maxEdgeSelections: 0,
    enableMultiSelection: true,
    enableRangeSelection: true,
    enableKeyboardNavigation: true,
    enableConnectedHighlighting: true,
    clearOnBackgroundClick: true,
    selectConnectedOnDoubleClick: true,
    highlightOnHover: true,
    announceSelections: true,
    focusSelectedElements: true,
};

/**
 * Hook chính cho selection management
 */
export function useSelectionManager({
    nodes,
    edges,
    config = {},
    onNodeSelect,
    onEdgeSelect,
    onSelectionChange,
    onHighlightChange,
}: UseSelectionManagerOptions): UseSelectionManagerReturn {

    const finalConfig = { ...defaultConfig, ...config };

    // Hover state
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);
    const [hoveredEdge, setHoveredEdge] = useState<string | null>(null);

    // Selection state management
    const selectionState = useSelectionState({
        nodes,
        edges,
        maxSelections: finalConfig.maxSelections,
        enableMultiSelection: finalConfig.enableMultiSelection,
        enableRangeSelection: finalConfig.enableRangeSelection,
        onSelectionChange: (state) => {
            onSelectionChange?.(state);

            // Announce selections for accessibility
            if (finalConfig.announceSelections) {
                announceSelection(state);
            }
        },
        onHighlightChange,
    });

    // Edge interaction integration
    const edgeInteraction = useEdgeInteraction({
        nodes,
        edges,
        onEdgeSelect: (edgeId) => {
            if (edgeId) {
                // Clear node selection when edge is selected (unless multi-select)
                if (!finalConfig.enableMultiSelection) {
                    selectionState.clearNodeSelection();
                }
                onEdgeSelect?.(edgeId, true);
            } else {
                onEdgeSelect?.(edgeId || '', false);
            }
        },
        onPathHighlight: (nodeIds) => {
            // Update highlighting from edge interaction
            const highlightedNodes = new Set(nodeIds);
            const highlightedEdges = new Set<string>();

            // Find edges in the path
            edges.forEach(edge => {
                if (nodeIds.includes(edge.source) && nodeIds.includes(edge.target)) {
                    highlightedEdges.add(edge.id);
                }
            });

            onHighlightChange?.(highlightedNodes, highlightedEdges);
        },
    });

    /**
     * Announce selection changes for screen readers
     */
    const announceSelection = useCallback((state: SelectionState) => {
        if (!finalConfig.announceSelections) return;

        const nodeCount = state.selectedNodes.size;
        const edgeCount = state.selectedEdges.size;

        let message = '';
        if (nodeCount > 0 && edgeCount > 0) {
            message = `Đã chọn ${nodeCount} node và ${edgeCount} kết nối`;
        } else if (nodeCount > 0) {
            message = `Đã chọn ${nodeCount} node`;
        } else if (edgeCount > 0) {
            message = `Đã chọn ${edgeCount} kết nối`;
        } else {
            message = 'Đã bỏ chọn tất cả';
        }

        // Create and announce via aria-live region
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;

        document.body.appendChild(announcement);
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }, [finalConfig.announceSelections]);

    /**
     * Handle node click với modifier support
     */
    const handleNodeClick = useCallback((nodeId: string, event: { ctrlKey?: boolean; shiftKey?: boolean; altKey?: boolean } = {}) => {
        const modifiers = {
            ctrl: event.ctrlKey || false,
            shift: event.shiftKey || false,
            alt: event.altKey || false,
        };

        // Clear edge selection if not multi-selecting
        if (!modifiers.ctrl && !finalConfig.enableMultiSelection) {
            edgeInteraction.clearSelection();
        }

        selectionState.selectNode(nodeId, modifiers);
        onNodeSelect?.(nodeId, true);
    }, [selectionState, edgeInteraction, finalConfig.enableMultiSelection, onNodeSelect]);

    /**
     * Handle edge click với modifier support
     */
    const handleEdgeClick = useCallback((edgeId: string, event: { ctrlKey?: boolean; shiftKey?: boolean; altKey?: boolean } = {}) => {
        const modifiers = {
            ctrl: event.ctrlKey || false,
            shift: event.shiftKey || false,
            alt: event.altKey || false,
        };

        // Clear node selection if not multi-selecting
        if (!modifiers.ctrl && !finalConfig.enableMultiSelection) {
            selectionState.clearNodeSelection();
        }

        selectionState.selectEdge(edgeId, modifiers);
        onEdgeSelect?.(edgeId, true);
    }, [selectionState, finalConfig.enableMultiSelection, onEdgeSelect]);

    /**
     * Handle node double click
     */
    const handleNodeDoubleClick = useCallback((nodeId: string) => {
        if (finalConfig.selectConnectedOnDoubleClick) {
            selectionState.selectConnectedElements(nodeId, 'node');
        }
    }, [selectionState, finalConfig.selectConnectedOnDoubleClick]);

    /**
     * Handle edge double click
     */
    const handleEdgeDoubleClick = useCallback((edgeId: string) => {
        if (finalConfig.selectConnectedOnDoubleClick) {
            selectionState.selectConnectedElements(edgeId, 'edge');
        }
    }, [selectionState, finalConfig.selectConnectedOnDoubleClick]);

    /**
     * Handle node hover
     */
    const handleNodeHover = useCallback((nodeId: string | null) => {
        setHoveredNode(nodeId);

        if (finalConfig.highlightOnHover && nodeId) {
            selectionState.highlightConnectedElements(nodeId, 'node');
        } else if (!nodeId) {
            // Clear hover highlighting but keep selection highlighting
            const currentHighlighted = new Set<string>();
            const currentHighlightedEdges = new Set<string>();

            // Keep highlighting for selected elements
            selectionState.selectionState.selectedNodes.forEach(selectedNodeId => {
                const connected = selectionState.selectionState.connectedElements.get(selectedNodeId);
                if (connected) {
                    connected.nodes.forEach(id => currentHighlighted.add(id));
                    connected.edges.forEach(id => currentHighlightedEdges.add(id));
                }
            });

            onHighlightChange?.(currentHighlighted, currentHighlightedEdges);
        }
    }, [selectionState, finalConfig.highlightOnHover, onHighlightChange]);

    /**
     * Handle edge hover
     */
    const handleEdgeHover = useCallback((edgeId: string | null) => {
        setHoveredEdge(edgeId);
        edgeInteraction.handleEdgeHover(edgeId ? { id: edgeId } as any : null);
    }, [edgeInteraction]);

    /**
     * Handle keyboard events
     */
    const handleKeyDown = useCallback((event: KeyboardEvent): boolean => {
        if (!finalConfig.enableKeyboardNavigation) return false;

        const { key, ctrlKey, metaKey, shiftKey, altKey } = event;
        const isCtrlPressed = ctrlKey || metaKey;

        // Handle keyboard shortcuts
        switch (key) {
            case 'Escape':
                selectionState.clearSelection();
                edgeInteraction.clearSelection();
                return true;

            case 'a':
            case 'A':
                if (isCtrlPressed) {
                    event.preventDefault();
                    selectionState.selectAll();
                    return true;
                }
                break;

            case 'ArrowUp':
            case 'ArrowDown':
            case 'ArrowLeft':
            case 'ArrowRight':
                if (selectionState.selectionState.primarySelectedNode) {
                    event.preventDefault();
                    const direction = key.replace('Arrow', '').toLowerCase() as 'up' | 'down' | 'left' | 'right';
                    selectionState.selectNextNode(direction);
                    return true;
                }
                break;

            case 'Enter':
            case ' ':
                if (selectionState.selectionState.primarySelectedNode) {
                    event.preventDefault();
                    // Trigger double click behavior
                    handleNodeDoubleClick(selectionState.selectionState.primarySelectedNode);
                    return true;
                }
                break;

            case 'Tab':
                // Navigate through selected elements
                if (selectionState.selectionState.selectedNodes.size > 0) {
                    const selectedNodes = Array.from(selectionState.selectionState.selectedNodes);
                    const currentIndex = selectionState.selectionState.primarySelectedNode
                        ? selectedNodes.indexOf(selectionState.selectionState.primarySelectedNode)
                        : -1;

                    const nextIndex = shiftKey
                        ? (currentIndex - 1 + selectedNodes.length) % selectedNodes.length
                        : (currentIndex + 1) % selectedNodes.length;

                    const nextNodeId = selectedNodes[nextIndex];
                    if (nextNodeId) {
                        // Update primary selection without changing selection set
                        selectionState.selectNode(nextNodeId, { ctrl: true });
                        return true;
                    }
                }
                break;

            case 'Delete':
            case 'Backspace':
                // Could be used for deletion functionality in the future
                if (selectionState.getSelectedCount().total > 0) {
                    // For now, just clear selection
                    selectionState.clearSelection();
                    return true;
                }
                break;

            default:
                return false;
        }

        return false;
    }, [
        finalConfig.enableKeyboardNavigation,
        selectionState,
        edgeInteraction,
        handleNodeDoubleClick,
    ]);

    /**
     * Invert selection
     */
    const invertSelection = useCallback(() => {
        const allNodeIds = new Set(nodes.map(n => n.id));
        const allEdgeIds = new Set(edges.map(e => e.id));

        const currentSelectedNodes = selectionState.selectionState.selectedNodes;
        const currentSelectedEdges = selectionState.selectionState.selectedEdges;

        // Calculate inverted selection
        const newSelectedNodes = new Set<string>();
        const newSelectedEdges = new Set<string>();

        allNodeIds.forEach(nodeId => {
            if (!currentSelectedNodes.has(nodeId)) {
                newSelectedNodes.add(nodeId);
            }
        });

        allEdgeIds.forEach(edgeId => {
            if (!currentSelectedEdges.has(edgeId)) {
                newSelectedEdges.add(edgeId);
            }
        });

        // Apply inverted selection
        selectionState.clearSelection();
        newSelectedNodes.forEach(nodeId => selectionState.selectNode(nodeId, { ctrl: true }));
        newSelectedEdges.forEach(edgeId => selectionState.selectEdge(edgeId, { ctrl: true }));
    }, [nodes, edges, selectionState]);

    /**
     * Setup keyboard event listeners
     */
    useEffect(() => {
        if (!finalConfig.enableKeyboardNavigation) return;

        const handleGlobalKeyDown = (event: KeyboardEvent) => {
            // Only handle if no input is focused
            const activeElement = document.activeElement;
            const isInputFocused = activeElement && (
                activeElement.tagName === 'INPUT' ||
                activeElement.tagName === 'TEXTAREA' ||
                activeElement.getAttribute('contenteditable') === 'true'
            );

            if (!isInputFocused) {
                handleKeyDown(event);
            }
        };

        document.addEventListener('keydown', handleGlobalKeyDown);
        return () => {
            document.removeEventListener('keydown', handleGlobalKeyDown);
        };
    }, [finalConfig.enableKeyboardNavigation, handleKeyDown]);

    return {
        // Current state
        selectionState: selectionState.selectionState,
        selectedCount: selectionState.getSelectedCount(),

        // Primary selection
        primarySelectedNode: selectionState.selectionState.primarySelectedNode,
        primarySelectedEdge: selectionState.selectionState.primarySelectedEdge,

        // Selection actions
        handleNodeClick,
        handleEdgeClick,
        handleNodeDoubleClick,
        handleEdgeDoubleClick,

        // Hover actions
        handleNodeHover,
        handleEdgeHover,

        // Keyboard actions
        handleKeyDown,

        // Bulk actions
        selectAll: selectionState.selectAll,
        clearSelection: selectionState.clearSelection,
        invertSelection,

        // Utilities
        isNodeSelected: selectionState.isNodeSelected,
        isEdgeSelected: selectionState.isEdgeSelected,
        isNodeHighlighted: selectionState.isNodeHighlighted,
        isEdgeHighlighted: selectionState.isEdgeHighlighted,

        // Selection mode
        selectionMode: selectionState.selectionState.mode,
        setSelectionMode: selectionState.setSelectionMode,

        // Edge interaction integration
        edgeInteraction,
    };
}