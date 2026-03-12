'use client';

/**
 * Custom node component cho roadmap visualization
 * Hiển thị nodes với styling theo độ khó và trạng thái hoàn thành
 * Tích hợp với VizTechStack design system và warm color palette
 */

import React, { useState, useRef, useCallback } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { NodeData } from '@viztechstack/roadmap-visualization';
import {
    getCategoryIcon,
    getCategoryDisplayName,
    getArticlePreview,
} from '@viztechstack/roadmap-visualization';
import { ArticlePreviewTooltip } from './ArticlePreviewTooltip';
import { NodeTooltip } from './NodeTooltip';

/**
 * Lấy CSS classes theo độ khó cho styling node
 * Sử dụng VizTechStack warm color palette
 */
function getDifficultyStyle(difficulty?: string): string {
    switch (difficulty) {
        case 'beginner':
            return 'node-beginner';
        case 'intermediate':
            return 'node-intermediate';
        case 'advanced':
            return 'node-advanced';
        default:
            return 'bg-neutral-50 border-2 border-neutral-200 text-neutral-800 dark:bg-neutral-800/30 dark:border-neutral-700 dark:text-neutral-300';
    }
}

/**
 * Lấy CSS classes theo category cho styling node
 * Hỗ trợ ROLE và SKILL categories với warm colors
 */
function getCategoryStyle(category?: string): string {
    switch (category) {
        case 'ROLE':
            return 'bg-gradient-to-br from-primary-50 to-primary-100 border-primary-300 text-primary-900 dark:from-primary-900/30 dark:to-primary-800/30 dark:border-primary-700 dark:text-primary-200';
        case 'SKILL':
            return 'bg-gradient-to-br from-secondary-50 to-secondary-100 border-secondary-300 text-secondary-900 dark:from-secondary-900/30 dark:to-secondary-800/30 dark:border-secondary-700 dark:text-secondary-200';
        default:
            return '';
    }
}

/**
 * Custom roadmap node component với enhanced type safety và VizTechStack design
 * Hỗ trợ hover states, visual feedback và smooth animations
 */
export function CustomRoadmapNode({ data }: NodeProps) {
    // Type assertion cho custom node data
    const nodeData = data as NodeData & {
        selected?: boolean;
        highlighted?: boolean;
        dimmed?: boolean;
    };

    // State cho tooltip visibility
    const [showTooltip, setShowTooltip] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const nodeRef = useRef<HTMLDivElement>(null);

    // Handle mouse events for tooltip
    const handleMouseEnter = useCallback((event: React.MouseEvent) => {
        if (!nodeData.dimmed) {
            const rect = event.currentTarget.getBoundingClientRect();
            setMousePosition({
                x: event.clientX,
                y: event.clientY
            });
            setShowTooltip(true);
            setIsHovered(true);
        }
    }, [nodeData.dimmed]);

    const handleMouseMove = useCallback((event: React.MouseEvent) => {
        if (showTooltip) {
            setMousePosition({
                x: event.clientX,
                y: event.clientY
            });
        }
    }, [showTooltip]);

    const handleMouseLeave = useCallback(() => {
        setShowTooltip(false);
        setIsHovered(false);
    }, []);

    // Lấy styling dựa trên category (priority) hoặc difficulty
    const categoryStyle = getCategoryStyle(nodeData.category);
    const difficultyStyle = categoryStyle || getDifficultyStyle(nodeData.difficulty);
    const completedStyle = nodeData.completed ? 'node-completed' : '';

    // Selection and highlighting styles
    const selectionStyle = nodeData.selected ? 'ring-2 ring-primary-400 ring-offset-2 dark:ring-primary-500 dark:ring-offset-neutral-900 scale-105' : '';
    const highlightStyle = nodeData.highlighted && !nodeData.selected ? 'ring-1 ring-primary-300 dark:ring-primary-600' : '';
    const dimmedStyle = nodeData.dimmed ? 'opacity-40 scale-95' : '';

    // Lấy category icon và display name
    const categoryIcon = getCategoryIcon(nodeData.category);
    const categoryName = getCategoryDisplayName(nodeData.category);

    // Lấy article preview metadata cho skill nodes
    const articlePreview = getArticlePreview(nodeData);

    return (
        <div
            ref={nodeRef}
            className={`
                px-4 py-3 rounded-xl min-w-[200px] max-w-[280px] transition-all duration-300 ease-out
                ${difficultyStyle}
                ${completedStyle}
                ${selectionStyle}
                ${highlightStyle}
                ${dimmedStyle}
                ${isHovered && !nodeData.dimmed ? 'shadow-large -translate-y-2 scale-102' : 'shadow-soft'}
                cursor-pointer transform-gpu
                ${nodeData.category ? 'border-2' : ''}
                relative group
                backdrop-blur-sm
            `}
            onMouseEnter={handleMouseEnter}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                willChange: 'transform, box-shadow',
            }}
        >
            {/* Connection handles với improved styling */}
            <Handle
                type="target"
                position={Position.Top}
                className="!bg-neutral-400 !w-3 !h-3 !border-2 !border-white dark:!border-neutral-800 !rounded-full !transition-all !duration-200 hover:!scale-125 hover:!bg-primary-500"
            />

            {/* Category badge với enhanced styling */}
            {nodeData.category && (
                <div className="flex items-center gap-2 mb-3 text-xs font-medium opacity-90">
                    <span className="text-lg animate-bounce-gentle">{categoryIcon}</span>
                    <span className="px-2 py-1 rounded-md bg-white/20 dark:bg-black/20 backdrop-blur-sm">
                        {categoryName}
                    </span>
                </div>
            )}

            {/* Node content với improved typography */}
            <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-sm leading-tight line-clamp-2 flex-1 pr-2">
                    {nodeData.label}
                </h3>
                {nodeData.completed && (
                    <div className="flex-shrink-0 ml-2 p-1 rounded-full bg-success-100 dark:bg-success-900/30">
                        <svg
                            className="w-4 h-4 text-success-600 dark:text-success-400 animate-scale-in"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                )}
            </div>

            {/* Description preview cho hover state */}
            {nodeData.description && (
                <p className="text-xs opacity-75 line-clamp-2 mb-2 leading-relaxed">
                    {nodeData.description}
                </p>
            )}

            {/* Metadata section với icons */}
            <div className="flex items-center justify-between text-xs opacity-80">
                {/* Estimated time với icon */}
                {nodeData.estimatedTime && (
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/10 dark:bg-black/10 backdrop-blur-sm">
                        <svg
                            className="w-3 h-3 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <span className="font-medium">{nodeData.estimatedTime}</span>
                    </div>
                )}

                {/* Difficulty indicator */}
                {nodeData.difficulty && (
                    <div className="flex items-center gap-1">
                        <div className="flex gap-0.5">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${i < (nodeData.difficulty === 'beginner' ? 1 : nodeData.difficulty === 'intermediate' ? 2 : 3)
                                        ? 'bg-current opacity-100'
                                        : 'bg-current opacity-30'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Enhanced NodeTooltip for all node types */}
            {showTooltip && (
                <NodeTooltip
                    nodeData={nodeData}
                    isVisible={showTooltip}
                    mousePosition={mousePosition}
                    onClose={() => setShowTooltip(false)}
                />
            )}

            <Handle
                type="source"
                position={Position.Bottom}
                className="!bg-neutral-400 !w-3 !h-3 !border-2 !border-white dark:!border-neutral-800 !rounded-full !transition-all !duration-200 hover:!scale-125 hover:!bg-primary-500"
            />
        </div>
    );
}
