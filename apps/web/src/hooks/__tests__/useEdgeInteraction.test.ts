/**
 * Tests for useEdgeInteraction hook
 * Kiểm tra edge interaction functionality và state management
 */

import { renderHook, act } from '@testing-library/react';
import { useEdgeInteraction } from '../useEdgeInteraction';
import type { RoadmapNode, RoadmapEdge } from '@viztechstack/roadmap-visualization';
import type { Edge } from '@xyflow/react';

// Mock data cho testing
const mockNodes: RoadmapNode[] = [
    {
        id: 'node1',
        type: 'topic',
        position: { x: 0, y: 0 },
        data: {
            label: 'Node 1',
            description: 'First node',
            level: 1,
            section: 'Section A',
            difficulty: 'beginner',
        }
    },
    {
        id: 'node2',
        type: 'topic',
        position: { x: 100, y: 0 },
        data: {
            label: 'Node 2',
            description: 'Second node',
            level: 2,
            section: 'Section A',
            difficulty: 'intermediate',
        }
    },
    {
        id: 'node3',
        type: 'topic',
        position: { x: 200, y: 0 },
        data: {
            label: 'Node 3',
            description: 'Third node',
            level: 3,
            section: 'Section B',
            difficulty: 'advanced',
        }
    }
];

const mockEdges: RoadmapEdge[] = [
    {
        id: 'edge1',
        source: 'node1',
        target: 'node2',
        type: 'dependency',
        data: {
            relationship: 'prerequisite',
            strength: 0.8,
            bidirectional: false,
            label: 'Prerequisite'
        }
    },
    {
        id: 'edge2',
        source: 'node2',
        target: 'node3',
        type: 'progression',
        data: {
            relationship: 'leads-to',
            strength: 0.6,
            bidirectional: false,
            label: 'Leads to'
        }
    },
    {
        id: 'edge3',
        source: 'node1',
        target: 'node3',
        type: 'related',
        data: {
            relationship: 'related-to',
            strength: 0.4,
            bidirectional: true,
            label: 'Related'
        }
    }
];

// Mock React Flow Edge
const createMockReactFlowEdge = (edgeId: string): Edge => ({
    id: edgeId,
    source: mockEdges.find(e => e.id === edgeId)?.source || '',
    target: mockEdges.find(e => e.id === edgeId)?.target || '',
    type: 'default',
});

describe('useEdgeInteraction', () => {
    const defaultProps = {
        nodes: mockNodes,
        edges: mockEdges,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Initial State', () => {
        it('should initialize with empty state', () => {
            const { result } = renderHook(() => useEdgeInteraction(defaultProps));

            expect(result.current.selectedEdgeId).toBeNull();
            expect(result.current.highlightedPath).toEqual([]);
            expect(result.current.relationshipDetails).toBeNull();
        });
    });

    describe('Edge Selection', () => {
        it('should select edge when clicked', () => {
            const { result } = renderHook(() => useEdgeInteraction(defaultProps));
            const mockEdge = createMockReactFlowEdge('edge1');

            act(() => {
                result.current.handleEdgeClick(mockEdge);
            });

            expect(result.current.selectedEdgeId).toBe('edge1');
            expect(result.current.relationshipDetails).not.toBeNull();
            expect(result.current.relationshipDetails?.edgeId).toBe('edge1');
        });

        it('should toggle selection when clicking same edge', () => {
            const { result } = renderHook(() => useEdgeInteraction(defaultProps));
            const mockEdge = createMockReactFlowEdge('edge1');

            // First click - select
            act(() => {
                result.current.handleEdgeClick(mockEdge);
            });
            expect(result.current.selectedEdgeId).toBe('edge1');

            // Second click - deselect
            act(() => {
                result.current.handleEdgeClick(mockEdge);
            });
            expect(result.current.selectedEdgeId).toBeNull();
            expect(result.current.relationshipDetails).toBeNull();
        });

        it('should switch selection when clicking different edge', () => {
            const { result } = renderHook(() => useEdgeInteraction(defaultProps));
            const mockEdge1 = createMockReactFlowEdge('edge1');
            const mockEdge2 = createMockReactFlowEdge('edge2');

            // Select first edge
            act(() => {
                result.current.handleEdgeClick(mockEdge1);
            });
            expect(result.current.selectedEdgeId).toBe('edge1');

            // Select second edge
            act(() => {
                result.current.handleEdgeClick(mockEdge2);
            });
            expect(result.current.selectedEdgeId).toBe('edge2');
            expect(result.current.relationshipDetails?.edgeId).toBe('edge2');
        });
    });

    describe('Path Highlighting', () => {
        it('should highlight path for selected edge', () => {
            const { result } = renderHook(() => useEdgeInteraction(defaultProps));
            const mockEdge = createMockReactFlowEdge('edge1');

            act(() => {
                result.current.handleEdgeClick(mockEdge);
            });

            expect(result.current.highlightedPath).toContain('node1');
            expect(result.current.highlightedPath).toContain('node2');
        });

        it('should include additional nodes for bidirectional edges', () => {
            const { result } = renderHook(() => useEdgeInteraction(defaultProps));
            const mockEdge = createMockReactFlowEdge('edge3'); // bidirectional edge

            act(() => {
                result.current.handleEdgeClick(mockEdge);
            });

            expect(result.current.highlightedPath).toContain('node1');
            expect(result.current.highlightedPath).toContain('node3');
        });
    });

    describe('Relationship Details', () => {
        it('should create correct relationship details for prerequisite', () => {
            const { result } = renderHook(() => useEdgeInteraction(defaultProps));
            const mockEdge = createMockReactFlowEdge('edge1');

            act(() => {
                result.current.handleEdgeClick(mockEdge);
            });

            const details = result.current.relationshipDetails;
            expect(details).not.toBeNull();
            expect(details?.relationship).toBe('prerequisite');
            expect(details?.sourceNode.id).toBe('node1');
            expect(details?.targetNode.id).toBe('node2');
            expect(details?.strength).toBe(0.8);
            expect(details?.bidirectional).toBe(false);
        });

        it('should create correct relationship details for leads-to', () => {
            const { result } = renderHook(() => useEdgeInteraction(defaultProps));
            const mockEdge = createMockReactFlowEdge('edge2');

            act(() => {
                result.current.handleEdgeClick(mockEdge);
            });

            const details = result.current.relationshipDetails;
            expect(details?.relationship).toBe('leads-to');
            expect(details?.strength).toBe(0.6);
        });

        it('should create correct relationship details for bidirectional edge', () => {
            const { result } = renderHook(() => useEdgeInteraction(defaultProps));
            const mockEdge = createMockReactFlowEdge('edge3');

            act(() => {
                result.current.handleEdgeClick(mockEdge);
            });

            const details = result.current.relationshipDetails;
            expect(details?.relationship).toBe('related-to');
            expect(details?.bidirectional).toBe(true);
        });
    });

    describe('Utility Functions', () => {
        it('should correctly identify selected edge', () => {
            const { result } = renderHook(() => useEdgeInteraction(defaultProps));
            const mockEdge = createMockReactFlowEdge('edge1');

            act(() => {
                result.current.handleEdgeClick(mockEdge);
            });

            expect(result.current.isEdgeSelected('edge1')).toBe(true);
            expect(result.current.isEdgeSelected('edge2')).toBe(false);
        });

        it('should correctly identify nodes in path', () => {
            const { result } = renderHook(() => useEdgeInteraction(defaultProps));
            const mockEdge = createMockReactFlowEdge('edge1');

            act(() => {
                result.current.handleEdgeClick(mockEdge);
            });

            expect(result.current.isNodeInPath('node1')).toBe(true);
            expect(result.current.isNodeInPath('node2')).toBe(true);
            expect(result.current.isNodeInPath('node3')).toBe(false);
        });

        it('should get relationship details for specific edge', () => {
            const { result } = renderHook(() => useEdgeInteraction(defaultProps));

            const details = result.current.getEdgeRelationshipDetails('edge1');
            expect(details).not.toBeNull();
            expect(details?.edgeId).toBe('edge1');
            expect(details?.relationship).toBe('prerequisite');
        });
    });

    describe('Clear Selection', () => {
        it('should clear all selection state', () => {
            const { result } = renderHook(() => useEdgeInteraction(defaultProps));
            const mockEdge = createMockReactFlowEdge('edge1');

            // Select edge first
            act(() => {
                result.current.handleEdgeClick(mockEdge);
            });
            expect(result.current.selectedEdgeId).toBe('edge1');

            // Clear selection
            act(() => {
                result.current.clearSelection();
            });

            expect(result.current.selectedEdgeId).toBeNull();
            expect(result.current.highlightedPath).toEqual([]);
            expect(result.current.relationshipDetails).toBeNull();
        });
    });

    describe('Programmatic Selection', () => {
        it('should select edge programmatically', () => {
            const { result } = renderHook(() => useEdgeInteraction(defaultProps));

            act(() => {
                result.current.selectEdge('edge2');
            });

            expect(result.current.selectedEdgeId).toBe('edge2');
            expect(result.current.relationshipDetails?.edgeId).toBe('edge2');
            expect(result.current.highlightedPath).toContain('node2');
            expect(result.current.highlightedPath).toContain('node3');
        });

        it('should handle invalid edge ID gracefully', () => {
            const { result } = renderHook(() => useEdgeInteraction(defaultProps));

            act(() => {
                result.current.selectEdge('invalid-edge');
            });

            expect(result.current.selectedEdgeId).toBeNull();
            expect(result.current.relationshipDetails).toBeNull();
        });
    });

    describe('Callback Integration', () => {
        it('should call onEdgeSelect callback', () => {
            const onEdgeSelect = jest.fn();
            const { result } = renderHook(() =>
                useEdgeInteraction({ ...defaultProps, onEdgeSelect })
            );
            const mockEdge = createMockReactFlowEdge('edge1');

            act(() => {
                result.current.handleEdgeClick(mockEdge);
            });

            expect(onEdgeSelect).toHaveBeenCalledWith('edge1');
        });

        it('should call onPathHighlight callback', () => {
            const onPathHighlight = jest.fn();
            const { result } = renderHook(() =>
                useEdgeInteraction({ ...defaultProps, onPathHighlight })
            );
            const mockEdge = createMockReactFlowEdge('edge1');

            act(() => {
                result.current.handleEdgeClick(mockEdge);
            });

            expect(onPathHighlight).toHaveBeenCalledWith(['node1', 'node2']);
        });

        it('should call callbacks with null when clearing selection', () => {
            const onEdgeSelect = jest.fn();
            const onPathHighlight = jest.fn();
            const { result } = renderHook(() =>
                useEdgeInteraction({ ...defaultProps, onEdgeSelect, onPathHighlight })
            );

            act(() => {
                result.current.clearSelection();
            });

            expect(onEdgeSelect).toHaveBeenCalledWith(null);
            expect(onPathHighlight).toHaveBeenCalledWith([]);
        });
    });
});