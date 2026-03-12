'use client';

/**
 * Hook quản lý tương tác với edges trong roadmap visualization
 * Xử lý edge selection, highlighting và state management
 * Tích hợp với VizTechStack design patterns
 */

import { useCallback, useState } from 'react';
import type { Edge } from '@xyflow/react';
import type { EdgeData, RoadmapEdge, RoadmapNode } from '@viztechstack/roadmap-visualization';

/**
 * Edge selection state
 */
export interface EdgeSelectionState {
    selectedEdgeId: string | null;
    highlightedPath: string[]; // Array of node IDs in the highlighted path
    relationshipDetails: EdgeRelationshipDetails | null;
}

/**
 * Chi tiết về mối quan hệ của edge
 */
export interface EdgeRelationshipDetails {
    edgeId: string;
    sourceNode: RoadmapNode;
    targetNode: RoadmapNode;
    relationship: string;
    strength?: number;
    bidirectional?: boolean;
    description?: string;
    reasoning?: string;
}

/**
 * Options cho edge interaction hook
 */
export interface UseEdgeInteractionOptions {
    nodes: RoadmapNode[];
    edges: RoadmapEdge[];
    onEdgeSelect?: (edgeId: string | null) => void;
    onPathHighlight?: (nodeIds: string[]) => void;
}

/**
 * Hook return type
 */
export interface UseEdgeInteractionReturn {
    // State
    selectedEdgeId: string | null;
    highlightedPath: string[];
    relationshipDetails: EdgeRelationshipDetails | null;

    // Actions
    handleEdgeClick: (edge: Edge) => void;
    handleEdgeHover: (edge: Edge | null) => void;
    clearSelection: () => void;
    selectEdge: (edgeId: string) => void;

    // Utilities
    isEdgeSelected: (edgeId: string) => boolean;
    isNodeInPath: (nodeId: string) => boolean;
    getEdgeRelationshipDetails: (edgeId: string) => EdgeRelationshipDetails | null;
}

/**
 * Hook chính cho edge interaction management
 */
export function useEdgeInteraction({
    nodes,
    edges,
    onEdgeSelect,
    onPathHighlight,
}: UseEdgeInteractionOptions): UseEdgeInteractionReturn {
    // State management
    const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
    const [highlightedPath, setHighlightedPath] = useState<string[]>([]);
    const [relationshipDetails, setRelationshipDetails] = useState<EdgeRelationshipDetails | null>(null);
    const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);

    /**
     * Tìm node theo ID
     */
    const findNodeById = useCallback((nodeId: string): RoadmapNode | undefined => {
        return nodes.find(node => node.id === nodeId);
    }, [nodes]);

    /**
     * Tìm edge theo ID
     */
    const findEdgeById = useCallback((edgeId: string): RoadmapEdge | undefined => {
        return edges.find(edge => edge.id === edgeId);
    }, [edges]);

    /**
     * Tạo relationship details từ edge
     */
    const createRelationshipDetails = useCallback((edge: RoadmapEdge): EdgeRelationshipDetails | null => {
        const sourceNode = findNodeById(edge.source);
        const targetNode = findNodeById(edge.target);

        if (!sourceNode || !targetNode) {
            return null;
        }

        // Tạo description dựa trên relationship type
        const getRelationshipDescription = (relationship: string): string => {
            switch (relationship) {
                case 'prerequisite':
                    return `"${sourceNode.data.label}" là điều kiện tiên quyết để học "${targetNode.data.label}"`;
                case 'leads-to':
                    return `Hoàn thành "${sourceNode.data.label}" sẽ dẫn đến "${targetNode.data.label}"`;
                case 'related-to':
                    return `"${sourceNode.data.label}" có liên quan đến "${targetNode.data.label}"`;
                case 'part-of':
                    return `"${sourceNode.data.label}" là một phần của "${targetNode.data.label}"`;
                default:
                    return `"${sourceNode.data.label}" kết nối với "${targetNode.data.label}"`;
            }
        };

        // Tạo reasoning dựa trên node data
        const getRelationshipReasoning = (relationship: string): string => {
            const sourceDifficulty = sourceNode.data.difficulty || 'beginner';
            const targetDifficulty = targetNode.data.difficulty || 'beginner';
            const sourceLevel = sourceNode.data.level || 1;
            const targetLevel = targetNode.data.level || 1;

            switch (relationship) {
                case 'prerequisite':
                    return `Cần nắm vững kiến thức cấp độ ${sourceDifficulty} trước khi tiến tới cấp độ ${targetDifficulty}`;
                case 'leads-to':
                    return `Tiến trình học tập từ cấp độ ${sourceLevel} đến cấp độ ${targetLevel}`;
                case 'related-to':
                    return `Cả hai chủ đề đều thuộc cùng lĩnh vực và bổ sung cho nhau`;
                case 'part-of':
                    return `Chủ đề con thuộc về chủ đề cha trong cấu trúc phân cấp`;
                default:
                    return `Mối quan hệ được xác định dựa trên cấu trúc nội dung`;
            }
        };

        return {
            edgeId: edge.id,
            sourceNode,
            targetNode,
            relationship: edge.data?.relationship || 'related-to',
            strength: edge.data?.strength,
            bidirectional: edge.data?.bidirectional,
            description: getRelationshipDescription(edge.data?.relationship || 'related-to'),
            reasoning: getRelationshipReasoning(edge.data?.relationship || 'related-to'),
        };
    }, [findNodeById]);

    /**
     * Tìm tất cả nodes trong path của edge được chọn
     */
    const findHighlightedPath = useCallback((edge: RoadmapEdge): string[] => {
        const path = [edge.source, edge.target];

        // Nếu edge là bidirectional, highlight cả hai hướng
        if (edge.data?.bidirectional) {
            // Tìm các edges liên quan khác
            const relatedEdges = edges.filter(e =>
                (e.source === edge.source || e.target === edge.source ||
                    e.source === edge.target || e.target === edge.target) &&
                e.id !== edge.id
            );

            // Thêm các nodes liên quan vào path
            relatedEdges.forEach(relatedEdge => {
                if (!path.includes(relatedEdge.source)) {
                    path.push(relatedEdge.source);
                }
                if (!path.includes(relatedEdge.target)) {
                    path.push(relatedEdge.target);
                }
            });
        }

        return path;
    }, [edges]);

    /**
     * Handle edge click event
     */
    const handleEdgeClick = useCallback((edge: Edge) => {
        const roadmapEdge = findEdgeById(edge.id);
        if (!roadmapEdge) return;

        // Toggle selection nếu click vào edge đã được chọn
        const newSelectedId = selectedEdgeId === edge.id ? null : edge.id;

        setSelectedEdgeId(newSelectedId);

        if (newSelectedId) {
            // Tạo relationship details
            const details = createRelationshipDetails(roadmapEdge);
            setRelationshipDetails(details);

            // Tìm và highlight path
            const path = findHighlightedPath(roadmapEdge);
            setHighlightedPath(path);

            // Call external handlers
            onEdgeSelect?.(newSelectedId);
            onPathHighlight?.(path);
        } else {
            // Clear selection
            setRelationshipDetails(null);
            setHighlightedPath([]);
            onEdgeSelect?.(null);
            onPathHighlight?.([]);
        }
    }, [selectedEdgeId, findEdgeById, createRelationshipDetails, findHighlightedPath, onEdgeSelect, onPathHighlight]);

    /**
     * Handle edge hover event
     */
    const handleEdgeHover = useCallback((edge: Edge | null) => {
        if (edge) {
            setHoveredEdgeId(edge.id);

            // Nếu không có edge nào được chọn, tạm thời highlight path
            if (!selectedEdgeId) {
                const roadmapEdge = findEdgeById(edge.id);
                if (roadmapEdge) {
                    const path = findHighlightedPath(roadmapEdge);
                    setHighlightedPath(path);
                    onPathHighlight?.(path);
                }
            }
        } else {
            setHoveredEdgeId(null);

            // Nếu không có edge nào được chọn, clear highlight
            if (!selectedEdgeId) {
                setHighlightedPath([]);
                onPathHighlight?.([]);
            }
        }
    }, [selectedEdgeId, findEdgeById, findHighlightedPath, onPathHighlight]);

    /**
     * Clear tất cả selection
     */
    const clearSelection = useCallback(() => {
        setSelectedEdgeId(null);
        setRelationshipDetails(null);
        setHighlightedPath([]);
        setHoveredEdgeId(null);
        onEdgeSelect?.(null);
        onPathHighlight?.([]);
    }, [onEdgeSelect, onPathHighlight]);

    /**
     * Select edge programmatically
     */
    const selectEdge = useCallback((edgeId: string) => {
        const roadmapEdge = findEdgeById(edgeId);
        if (!roadmapEdge) return;

        setSelectedEdgeId(edgeId);

        const details = createRelationshipDetails(roadmapEdge);
        setRelationshipDetails(details);

        const path = findHighlightedPath(roadmapEdge);
        setHighlightedPath(path);

        onEdgeSelect?.(edgeId);
        onPathHighlight?.(path);
    }, [findEdgeById, createRelationshipDetails, findHighlightedPath, onEdgeSelect, onPathHighlight]);

    /**
     * Check if edge is selected
     */
    const isEdgeSelected = useCallback((edgeId: string): boolean => {
        return selectedEdgeId === edgeId;
    }, [selectedEdgeId]);

    /**
     * Check if node is in highlighted path
     */
    const isNodeInPath = useCallback((nodeId: string): boolean => {
        return highlightedPath.includes(nodeId);
    }, [highlightedPath]);

    /**
     * Get relationship details for specific edge
     */
    const getEdgeRelationshipDetails = useCallback((edgeId: string): EdgeRelationshipDetails | null => {
        if (selectedEdgeId === edgeId) {
            return relationshipDetails;
        }

        const roadmapEdge = findEdgeById(edgeId);
        if (!roadmapEdge) return null;

        return createRelationshipDetails(roadmapEdge);
    }, [selectedEdgeId, relationshipDetails, findEdgeById, createRelationshipDetails]);

    return {
        // State
        selectedEdgeId,
        highlightedPath,
        relationshipDetails,

        // Actions
        handleEdgeClick,
        handleEdgeHover,
        clearSelection,
        selectEdge,

        // Utilities
        isEdgeSelected,
        isNodeInPath,
        getEdgeRelationshipDetails,
    };
}