'use client';

/**
 * Custom edge component cho roadmap visualization
 * Hiển thị relationships với styling theo relationship types
 * Tích hợp với VizTechStack design system và warm color palette
 * Hỗ trợ edge labels, tooltips và interactive states
 */

import React, { useState } from 'react';
import {
    BaseEdge,
    EdgeLabelRenderer,
    getBezierPath,
    type EdgeProps,
} from '@xyflow/react';
import type { EdgeData } from '@viztechstack/roadmap-visualization';

/**
 * Lấy CSS classes và styling theo relationship type
 * Sử dụng VizTechStack warm color palette
 */
function getRelationshipStyle(relationship?: string): {
    stroke: string;
    strokeWidth: number;
    strokeDasharray?: string;
    markerEnd: string;
    className: string;
} {
    switch (relationship) {
        case 'prerequisite':
            return {
                stroke: '#dc2626', // error-600 - đỏ cho dependency quan trọng
                strokeWidth: 3,
                markerEnd: 'url(#prerequisite-arrow)',
                className: 'animate-pulse',
            };
        case 'leads-to':
            return {
                stroke: '#ed7c47', // primary-500 - cam chính cho progression
                strokeWidth: 2.5,
                markerEnd: 'url(#progression-arrow)',
                className: 'transition-all duration-300',
            };
        case 'related-to':
            return {
                stroke: '#0ea5e9', // secondary-500 - xanh cho related
                strokeWidth: 2,
                strokeDasharray: '8,4',
                markerEnd: 'url(#related-arrow)',
                className: 'opacity-75 hover:opacity-100 transition-opacity duration-200',
            };
        case 'part-of':
            return {
                stroke: '#22c55e', // success-500 - xanh lá cho containment
                strokeWidth: 2,
                strokeDasharray: '4,2',
                markerEnd: 'url(#part-of-arrow)',
                className: 'opacity-60 hover:opacity-90 transition-opacity duration-200',
            };
        default:
            return {
                stroke: '#78716c', // neutral-500 - xám cho default
                strokeWidth: 1.5,
                markerEnd: 'url(#default-arrow)',
                className: 'opacity-50',
            };
    }
}

/**
 * Lấy display name cho relationship type
 */
function getRelationshipDisplayName(relationship?: string): string {
    switch (relationship) {
        case 'prerequisite':
            return 'Điều kiện tiên quyết';
        case 'leads-to':
            return 'Dẫn đến';
        case 'related-to':
            return 'Liên quan';
        case 'part-of':
            return 'Thuộc về';
        default:
            return 'Kết nối';
    }
}

/**
 * Lấy icon cho relationship type
 */
function getRelationshipIcon(relationship?: string): string {
    switch (relationship) {
        case 'prerequisite':
            return '🔒'; // Lock icon cho prerequisite
        case 'leads-to':
            return '➡️'; // Arrow cho progression
        case 'related-to':
            return '🔗'; // Link cho related
        case 'part-of':
            return '📦'; // Box cho containment
        default:
            return '↔️'; // Bidirectional arrow
    }
}

/**
 * Lấy strength indicator dựa trên strength value
 */
function getStrengthIndicator(strength?: number): string {
    if (!strength) return '';

    if (strength >= 0.8) return '●●●'; // Strong
    if (strength >= 0.5) return '●●○'; // Medium
    if (strength >= 0.2) return '●○○'; // Weak
    return '○○○'; // Very weak
}

/**
 * Custom roadmap edge component với enhanced type safety và VizTechStack design
 * Hỗ trợ different relationship types, hover states và interactive tooltips
 * Tích hợp với edge click handlers và selection state
 */
export function CustomRoadmapEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    data,
    selected,
}: EdgeProps) {
    // Type assertion cho custom edge data
    const edgeData = data as EdgeData | undefined;

    // State cho tooltip visibility và interaction
    const [showTooltip, setShowTooltip] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // Check if edge is highlighted (from external state)
    const isHighlighted = edgeData?.highlighted || false;
    const isDimmed = edgeData?.dimmed || false;

    // Lấy styling dựa trên relationship type
    const relationshipStyle = getRelationshipStyle(edgeData?.relationship);
    const relationshipName = getRelationshipDisplayName(edgeData?.relationship);
    const relationshipIcon = getRelationshipIcon(edgeData?.relationship);
    const strengthIndicator = getStrengthIndicator(edgeData?.strength);

    // Tính toán bezier path
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    // Merge styles với enhanced selection và highlighting
    const finalStyle = {
        ...relationshipStyle,
        ...style,
        ...(selected && {
            stroke: '#f59e0b', // warning-500 cho selected state
            strokeWidth: (relationshipStyle.strokeWidth || 2) + 1,
            filter: 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.4))',
        }),
        ...(isHighlighted && !selected && {
            stroke: '#ed7c47', // primary-500 cho highlighted state
            strokeWidth: (relationshipStyle.strokeWidth || 2) + 0.5,
            filter: 'drop-shadow(0 0 6px rgba(237, 124, 71, 0.3))',
        }),
        ...(isDimmed && !selected && !isHighlighted && {
            opacity: 0.3,
            strokeWidth: Math.max((relationshipStyle.strokeWidth || 2) - 0.5, 1),
        }),
        ...(isHovered && {
            strokeWidth: (relationshipStyle.strokeWidth || 2) + 0.5,
            filter: 'drop-shadow(0 0 6px rgba(0, 0, 0, 0.2))',
        }),
    };

    return (
        <>
            {/* SVG Marker Definitions */}
            <defs>
                {/* Prerequisite Arrow - Red */}
                <marker
                    id="prerequisite-arrow"
                    markerWidth="12"
                    markerHeight="12"
                    refX="10"
                    refY="6"
                    orient="auto"
                    markerUnits="strokeWidth"
                >
                    <path
                        d="M2,2 L2,10 L8,6 z"
                        fill="#dc2626"
                        stroke="#dc2626"
                        strokeWidth="1"
                    />
                </marker>

                {/* Progression Arrow - Orange */}
                <marker
                    id="progression-arrow"
                    markerWidth="10"
                    markerHeight="10"
                    refX="9"
                    refY="5"
                    orient="auto"
                    markerUnits="strokeWidth"
                >
                    <path
                        d="M2,2 L2,8 L7,5 z"
                        fill="#ed7c47"
                        stroke="#ed7c47"
                        strokeWidth="1"
                    />
                </marker>

                {/* Related Arrow - Blue */}
                <marker
                    id="related-arrow"
                    markerWidth="8"
                    markerHeight="8"
                    refX="7"
                    refY="4"
                    orient="auto"
                    markerUnits="strokeWidth"
                >
                    <circle
                        cx="4"
                        cy="4"
                        r="2"
                        fill="#0ea5e9"
                        stroke="#0ea5e9"
                        strokeWidth="1"
                    />
                </marker>

                {/* Part-of Arrow - Green */}
                <marker
                    id="part-of-arrow"
                    markerWidth="8"
                    markerHeight="8"
                    refX="7"
                    refY="4"
                    orient="auto"
                    markerUnits="strokeWidth"
                >
                    <rect
                        x="2"
                        y="2"
                        width="4"
                        height="4"
                        fill="#22c55e"
                        stroke="#22c55e"
                        strokeWidth="1"
                    />
                </marker>

                {/* Default Arrow - Gray */}
                <marker
                    id="default-arrow"
                    markerWidth="6"
                    markerHeight="6"
                    refX="5"
                    refY="3"
                    orient="auto"
                    markerUnits="strokeWidth"
                >
                    <path
                        d="M1,1 L1,5 L4,3 z"
                        fill="#78716c"
                        stroke="#78716c"
                        strokeWidth="1"
                    />
                </marker>
            </defs>

            {/* Main Edge Path với enhanced interactivity */}
            <BaseEdge
                path={edgePath}
                style={finalStyle}
                className={`
                    ${relationshipStyle.className} 
                    cursor-pointer transition-all duration-200
                    ${selected ? 'animate-pulse' : ''}
                    ${isHighlighted ? 'animate-pulse' : ''}
                `}
                onMouseEnter={() => {
                    setShowTooltip(true);
                    setIsHovered(true);
                }}
                onMouseLeave={() => {
                    setShowTooltip(false);
                    setIsHovered(false);
                }}
            />

            {/* Edge Label */}
            <EdgeLabelRenderer>
                {edgeData?.label && (
                    <div
                        style={{
                            position: 'absolute',
                            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                            pointerEvents: 'all',
                        }}
                        className="nodrag nopan"
                        onMouseEnter={() => {
                            setShowTooltip(true);
                            setIsHovered(true);
                        }}
                        onMouseLeave={() => {
                            setShowTooltip(false);
                            setIsHovered(false);
                        }}
                    >
                        {/* Enhanced Label Badge với selection state */}
                        <div
                            className={`
                                px-3 py-1.5 rounded-full text-xs font-medium
                                bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm
                                border border-neutral-200 dark:border-neutral-700
                                shadow-soft hover:shadow-medium
                                transition-all duration-200
                                ${selected ? 'ring-2 ring-warning-400 ring-offset-1 bg-warning-50 dark:bg-warning-950' : ''}
                                ${isHighlighted ? 'ring-2 ring-primary-400 ring-offset-1 bg-primary-50 dark:bg-primary-950' : ''}
                                ${isHovered ? 'scale-105 -translate-y-0.5' : ''}
                                ${isDimmed ? 'opacity-50' : ''}
                                cursor-pointer
                            `}
                            style={{
                                color: selected ? '#f59e0b' : isHighlighted ? '#ed7c47' : relationshipStyle.stroke,
                            }}
                        >
                            <span className="flex items-center gap-1.5">
                                <span className="text-sm">{relationshipIcon}</span>
                                <span>{edgeData.label}</span>
                                {strengthIndicator && (
                                    <span className="text-xs opacity-75 ml-1">
                                        {strengthIndicator}
                                    </span>
                                )}
                            </span>
                        </div>

                        {/* Enhanced Tooltip */}
                        {showTooltip && (
                            <div
                                className={`
                                    absolute z-50 p-4 rounded-xl shadow-large max-w-xs
                                    bg-neutral-900/95 dark:bg-neutral-800/95 text-white
                                    backdrop-blur-md border border-white/10
                                    pointer-events-none
                                    top-full mt-2
                                    animate-fade-in
                                `}
                                style={{
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                }}
                            >
                                <div className="space-y-3">
                                    {/* Relationship Type */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">{relationshipIcon}</span>
                                        <div>
                                            <p className="font-medium text-sm">{relationshipName}</p>
                                            <p className="text-xs opacity-75">Loại kết nối</p>
                                        </div>
                                    </div>

                                    {/* Strength Indicator */}
                                    {edgeData?.strength !== undefined && (
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-xs">
                                                <span className="opacity-75">Độ mạnh kết nối</span>
                                                <span className="font-medium">
                                                    {Math.round((edgeData.strength || 0) * 100)}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-white/20 rounded-full h-1.5">
                                                <div
                                                    className="h-1.5 rounded-full transition-all duration-300"
                                                    style={{
                                                        width: `${(edgeData.strength || 0) * 100}%`,
                                                        backgroundColor: relationshipStyle.stroke,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Bidirectional Indicator */}
                                    {edgeData?.bidirectional && (
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className="text-primary-400">↔️</span>
                                            <span className="opacity-75">Kết nối hai chiều</span>
                                        </div>
                                    )}

                                    {/* Edge ID for debugging (only in development) */}
                                    {process.env.NODE_ENV === 'development' && (
                                        <div className="pt-2 border-t border-white/20">
                                            <p className="text-xs opacity-50 font-mono">ID: {id}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Tooltip Arrow */}
                                <div
                                    className="absolute w-3 h-3 bg-neutral-900/95 dark:bg-neutral-800/95 transform rotate-45"
                                    style={{
                                        top: '-6px',
                                        left: '50%',
                                        marginLeft: '-6px',
                                    }}
                                />
                            </div>
                        )}
                    </div>
                )}
            </EdgeLabelRenderer>
        </>
    );
}