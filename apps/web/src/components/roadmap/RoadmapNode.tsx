/**
 * RoadmapNode Component
 * 
 * Custom node component for React Flow roadmap visualization.
 * 
 * Features:
 * - Displays node label prominently
 * - Shows progress status with colored indicators (done=green, in-progress=yellow, skipped=gray)
 * - Handles click events to show topic content
 * - Supports different node types (default, topic, reused skill nodes)
 * - Visual distinction for reused skill nodes
 * 
 * Progress Status Colors:
 * - done: Green border and badge
 * - in-progress: Yellow border and badge
 * - skipped: Gray border and badge
 * - no status: Default white border
 * 
 * Usage:
 * ```tsx
 * import { RoadmapNode } from '@/components/roadmap/RoadmapNode';
 * import { ReactFlow, type NodeTypes } from '@xyflow/react';
 * 
 * const nodeTypes: NodeTypes = {
 *   default: RoadmapNode,
 *   topic: RoadmapNode,
 * };
 * 
 * <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} />
 * ```
 */
'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

/**
 * Progress status type matching GraphQL enum
 */
export type ProgressStatus = 'DONE' | 'IN_PROGRESS' | 'SKIPPED';

/**
 * Node data structure matching GraphQL schema
 */
export interface RoadmapNodeData {
    label: string;
    topicId?: string;
    isReusedSkillNode?: boolean;
    originalRoadmapId?: string;
    progressStatus?: ProgressStatus;
}

/**
 * Progress status configuration for styling
 */
const progressStatusConfig = {
    DONE: {
        borderColor: 'border-green-500',
        badgeColor: 'bg-green-500',
        label: 'Done',
    },
    IN_PROGRESS: {
        borderColor: 'border-yellow-500',
        badgeColor: 'bg-yellow-500',
        label: 'In Progress',
    },
    SKIPPED: {
        borderColor: 'border-gray-400',
        badgeColor: 'bg-gray-400',
        label: 'Skipped',
    },
} as const;

/**
 * RoadmapNode component for React Flow
 * 
 * Renders a custom node with:
 * - Node label
 * - Progress status indicator (colored border and badge)
 * - Visual distinction for reused skill nodes
 * - Connection handles (top and bottom)
 */
export const RoadmapNode = memo(({ data, selected }: NodeProps) => {
    // Type assertion for data - React Flow passes data as Record<string, unknown>
    const nodeData = data as unknown as RoadmapNodeData;
    const progressStatus = nodeData.progressStatus;
    const isReusedSkillNode = nodeData.isReusedSkillNode ?? false;

    // Determine border color based on progress status
    const borderColor = progressStatus
        ? progressStatusConfig[progressStatus].borderColor
        : 'border-white/10';

    // Base classes for the node container
    const baseClasses = `
    px-4 py-3 shadow-xl rounded-xl border-2 transition-all duration-300 
    min-w-[150px] text-center relative
  `;

    // Selected state classes
    const selectedClasses = selected
        ? 'scale-105 shadow-purple-500/20'
        : '';

    // Reused skill node indicator classes
    const reusedNodeClasses = isReusedSkillNode
        ? 'ring-2 ring-blue-400 ring-offset-2'
        : '';

    return (
        <div className={`${baseClasses} ${borderColor} ${selectedClasses} ${reusedNodeClasses} glass-card`}>
            {/* Top connection handle */}
            <Handle
                type="target"
                position={Position.Top}
                className="w-3 h-3 bg-purple-500 border-2 border-white"
            />

            {/* Progress status badge */}
            {progressStatus && (
                <div className="absolute -top-2 -right-2 z-10">
                    <div
                        className={`
              ${progressStatusConfig[progressStatus].badgeColor}
              text-white text-[10px] font-bold px-2 py-0.5 rounded-full
              shadow-md
            `}
                        title={progressStatusConfig[progressStatus].label}
                    >
                        {progressStatus === 'DONE' && '✓'}
                        {progressStatus === 'IN_PROGRESS' && '⋯'}
                        {progressStatus === 'SKIPPED' && '⊘'}
                    </div>
                </div>
            )}

            {/* Reused skill node indicator */}
            {isReusedSkillNode && (
                <div className="absolute -top-2 -left-2 z-10">
                    <div
                        className="bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md"
                        title="Reused skill node"
                    >
                        ↻
                    </div>
                </div>
            )}

            {/* Node content */}
            <div className="flex flex-col items-center gap-2">
                <div className="text-sm font-bold tracking-wide text-zinc-900 dark:text-zinc-100 uppercase">
                    {nodeData.label}
                </div>
            </div>

            {/* Bottom connection handle */}
            <Handle
                type="source"
                position={Position.Bottom}
                className="w-3 h-3 bg-purple-500 border-2 border-white"
            />

            {/* Decorative hover effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl opacity-0 hover:opacity-10 transition-opacity pointer-events-none" />
        </div>
    );
});

RoadmapNode.displayName = 'RoadmapNode';
