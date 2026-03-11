/**
 * Enhanced TypeScript types for React Flow integration
 * Provides type safety for VizTechStack roadmap visualization
 */

import type {
    EdgeProps,
} from '@xyflow/react';

import type {
    NodeData,
    EdgeData,
} from '@viztechstack/roadmap-visualization';

/**
 * Custom node props for roadmap nodes
 */
export interface RoadmapNodeProps {
    data: NodeData;
    selected: boolean;
    dragging?: boolean;
}

/**
 * Custom edge props for roadmap edges
 */
export interface RoadmapEdgeProps extends EdgeProps {
    data?: EdgeData;
    selected: boolean;
}

/**
 * Export commonly used types for easy importing
 */
export type {
    Node,
    Edge,
    ReactFlowInstance,
    NodeProps,
    EdgeProps,
    Connection,
    OnNodesChange,
    OnEdgesChange,
    OnConnect,
    XYPosition,
} from '@xyflow/react';