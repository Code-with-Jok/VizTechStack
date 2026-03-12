'use client';

/**
 * NodeTooltip component for roadmap visualization
 * Shows topic preview on hover with metadata (difficulty, time estimate)
 * Features smooth show/hide animations and smart positioning
 * 
 * Task 4.1.1: Implement NodeTooltip component
 * - Show topic preview on hover
 * - Display metadata (difficulty, time estimate)
 * - Add smooth show/hide animations
 * - Validates: Requirement 4.1
 */

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import type { NodeData, Resource } from '@viztechstack/roadmap-visualization';
import {
    getCategoryIcon,
    getCategoryDisplayName,
} from '@viztechstack/roadmap-visualization';
import { useTooltipPositioning } from '../../hooks/useTooltipCollisionDetection';
import type { TooltipDimensions } from '../../services/tooltip-positioning';

interface NodeTooltipProps {
    nodeData: NodeData;
    isVisible: boolean;
    mousePosition: { x: number; y: number };
    className?: string;
    onClose?: () => void;
    tooltipId?: string;
    priority?: number;
    maxWidth?: number;
    maxHeight?: number;
    collisionSelectors?: string[];
}

/**
 * Get difficulty badge color classes
 */
function getDifficultyColor(difficulty?: string): string {
    switch (difficulty) {
        case 'beginner':
            return 'bg-success-100 text-success-800 border-success-200 dark:bg-success-900/30 dark:text-success-300 dark:border-success-700';
        case 'intermediate':
            return 'bg-warning-100 text-warning-800 border-warning-200 dark:bg-warning-900/30 dark:text-warning-300 dark:border-warning-700';
        case 'advanced':
            return 'bg-error-100 text-error-800 border-error-200 dark:bg-error-900/30 dark:text-error-300 dark:border-error-700';
        default:
            return 'bg-neutral-100 text-neutral-800 border-neutral-200 dark:bg-neutral-800/30 dark:text-neutral-300 dark:border-neutral-700';
    }
}

/**
 * Get difficulty display name
 */
function getDifficultyName(difficulty?: string): string {
    switch (difficulty) {
        case 'beginner':
            return 'Cơ bản';
        case 'intermediate':
            return 'Trung bình';
        case 'advanced':
            return 'Nâng cao';
        default:
            return 'Chưa xác định';
    }
}

/**
 * Get resource type icon
 */
function getResourceIcon(type: string): string {
    switch (type) {
        case 'article':
            return '📄';
        case 'video':
            return '🎥';
        case 'course':
            return '🎓';
        case 'documentation':
            return '📚';
        case 'book':
            return '📖';
        default:
            return '🔗';
    }
}

/**
 * Get resource type label
 */
function getResourceTypeLabel(type: string): string {
    switch (type) {
        case 'article':
            return 'Bài viết';
        case 'video':
            return 'Video';
        case 'course':
            return 'Khóa học';
        case 'documentation':
            return 'Tài liệu';
        case 'book':
            return 'Sách';
        default:
            return 'Liên kết';
    }
}

/**
 * Calculate optimal tooltip position to avoid viewport edges
 */
function calculateTooltipPosition(
    mouseX: number,
    mouseY: number,
    tooltipWidth: number,
    tooltipHeight: number,
    viewportWidth: number,
    viewportHeight: number,
    offset: number = 12
): { x: number; y: number; placement: 'top' | 'bottom' | 'left' | 'right' } {
    let x = mouseX + offset;
    let y = mouseY + offset;
    let placement: 'top' | 'bottom' | 'left' | 'right' = 'bottom';

    // Check if tooltip would overflow right edge
    if (x + tooltipWidth > viewportWidth - 20) {
        x = mouseX - tooltipWidth - offset;
        placement = 'left';
    }

    // Check if tooltip would overflow bottom edge
    if (y + tooltipHeight > viewportHeight - 20) {
        y = mouseY - tooltipHeight - offset;
        placement = placement === 'left' ? 'left' : 'top';
    }

    // Check if tooltip would overflow left edge
    if (x < 20) {
        x = 20;
        placement = 'right';
    }

    // Check if tooltip would overflow top edge
    if (y < 20) {
        y = 20;
        placement = 'bottom';
    }

    return { x, y, placement };
}

/**
 * NodeTooltip component with smart positioning and collision detection
 */
export function NodeTooltip({
    nodeData,
    isVisible,
    mousePosition,
    className = '',
    onClose,
    tooltipId = 'node-tooltip',
    priority = 0,
    maxWidth = 320,
    maxHeight = 400,
    collisionSelectors = []
}: NodeTooltipProps) {
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState<{ x: number; y: number; placement: 'top' | 'bottom' | 'left' | 'right' }>({ x: 0, y: 0, placement: 'bottom' });
    const [isAnimating, setIsAnimating] = useState(false);
    const [dimensions, setDimensions] = useState<TooltipDimensions>({ width: maxWidth, height: maxHeight });

    // Initialize collision detection system
    const positioning = useTooltipPositioning({
        enabled: isVisible,
        collisionSelectors,
        positioningOptions: {
            maxWidth,
            maxHeight,
            preferredPlacement: 'bottom',
            allowFlip: true,
            avoidCollisions: true,
        }
    });

    // Memoize tooltip content to prevent unnecessary re-renders
    const tooltipContent = useMemo(() => {
        const categoryIcon = getCategoryIcon(nodeData.category);
        const categoryName = getCategoryDisplayName(nodeData.category);

        return {
            categoryIcon,
            categoryName,
            hasCategory: !!nodeData.category,
            hasResources: nodeData.resources && nodeData.resources.length > 0,
            resourceCount: nodeData.resources?.length || 0,
            displayResources: nodeData.resources?.slice(0, 2) || [],
            hasMoreResources: (nodeData.resources?.length || 0) > 2,
            extraResourceCount: Math.max(0, (nodeData.resources?.length || 0) - 2),
        };
    }, [nodeData]);

    // Update tooltip dimensions when DOM changes
    const updateDimensions = useCallback(() => {
        if (!tooltipRef.current) return;

        const rect = tooltipRef.current.getBoundingClientRect();
        const newDimensions = {
            width: Math.min(rect.width || maxWidth, maxWidth),
            height: Math.min(rect.height || maxHeight, maxHeight),
        };

        setDimensions(prev => {
            if (prev.width !== newDimensions.width || prev.height !== newDimensions.height) {
                return newDimensions;
            }
            return prev;
        });
    }, [maxWidth, maxHeight]);

    // Calculate and update position using advanced positioning system
    const updatePosition = useCallback(() => {
        if (!isVisible || !tooltipRef.current) return;

        // Use the advanced positioning system
        const newPosition = positioning.calculatePosition(
            mousePosition.x,
            mousePosition.y,
            dimensions,
            tooltipId
        );

        setPosition(newPosition);
    }, [isVisible, mousePosition, dimensions, tooltipId, positioning]);

    // Update position when dependencies change
    useEffect(() => {
        if (isVisible) {
            // Small delay to allow DOM to render before calculating position
            const timer = setTimeout(() => {
                updateDimensions();
                updatePosition();
            }, 10);
            return () => clearTimeout(timer);
        } else {
            // Cleanup when tooltip becomes invisible
            positioning.cleanup(tooltipId);
        }
    }, [isVisible, updateDimensions, updatePosition, positioning, tooltipId]);

    // Handle window resize with debouncing
    useEffect(() => {
        let resizeTimeout: NodeJS.Timeout;

        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (isVisible) {
                    updateDimensions();
                    updatePosition();
                }
            }, 100);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(resizeTimeout);
        };
    }, [isVisible, updateDimensions, updatePosition]);

    // Animation lifecycle with performance optimization
    useEffect(() => {
        if (isVisible) {
            setIsAnimating(true);
            const timer = setTimeout(() => setIsAnimating(false), 200);
            return () => clearTimeout(timer);
        } else {
            setIsAnimating(false);
        }
    }, [isVisible]);

    // Handle escape key with cleanup
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isVisible && onClose) {
                onClose();
            }
        };

        if (isVisible) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [isVisible, onClose]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            positioning.cleanup(tooltipId);
        };
    }, [positioning, tooltipId]);

    // Don't render if not visible
    if (!isVisible) {
        return null;
    }

    return (
        <div
            ref={tooltipRef}
            className={`
                fixed z-50 max-w-sm w-80 pointer-events-none
                transition-all duration-200 ease-out
                ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
                animate-fade-in
                ${className}
            `}
            style={{
                left: position.x,
                top: position.y,
                transformOrigin: position.placement === 'top' ? 'bottom center' :
                    position.placement === 'bottom' ? 'top center' :
                        position.placement === 'left' ? 'right center' : 'left center'
            }}
            role="tooltip"
            aria-live="polite"
        >
            <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-large backdrop-blur-md">
                {/* Header with category badge */}
                {tooltipContent.hasCategory && (
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-100 dark:border-neutral-700 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-t-xl">
                        <span className="text-lg animate-bounce-gentle">{tooltipContent.categoryIcon}</span>
                        <span className="text-xs font-medium text-primary-700 dark:text-primary-300 px-2 py-1 bg-white/50 dark:bg-black/20 rounded-md backdrop-blur-sm">
                            {tooltipContent.categoryName}
                        </span>
                    </div>
                )}

                {/* Main content */}
                <div className="p-4 space-y-3">
                    {/* Title */}
                    <h3 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 line-clamp-2 leading-tight">
                        {nodeData.label}
                    </h3>

                    {/* Description preview */}
                    {nodeData.description && (
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-3 leading-relaxed">
                            {nodeData.description}
                        </p>
                    )}

                    {/* Metadata row */}
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Completion status */}
                        {nodeData.completed && (
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-success-50 dark:bg-success-900/30 border border-success-200 dark:border-success-700 rounded-md">
                                <svg className="w-3 h-3 text-success-600 dark:text-success-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <span className="text-xs font-medium text-success-700 dark:text-success-300">Hoàn thành</span>
                            </div>
                        )}

                        {/* Difficulty badge */}
                        {nodeData.difficulty && (
                            <div className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getDifficultyColor(nodeData.difficulty)}`}>
                                <div className="flex gap-0.5 mr-1.5">
                                    {Array.from({ length: 3 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className={`w-1 h-1 rounded-full transition-all duration-200 ${i < (nodeData.difficulty === 'beginner' ? 1 : nodeData.difficulty === 'intermediate' ? 2 : 3)
                                                ? 'bg-current opacity-100'
                                                : 'bg-current opacity-30'
                                                }`}
                                        />
                                    ))}
                                </div>
                                {getDifficultyName(nodeData.difficulty)}
                            </div>
                        )}

                        {/* Estimated time */}
                        {nodeData.estimatedTime && (
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-md">
                                <svg className="w-3 h-3 text-neutral-500 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">{nodeData.estimatedTime}</span>
                            </div>
                        )}
                    </div>

                    {/* Section info */}
                    {nodeData.section && (
                        <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                />
                            </svg>
                            <span>Phần: {nodeData.section}</span>
                        </div>
                    )}

                    {/* Resources preview */}
                    {tooltipContent.hasResources && (
                        <div className="pt-2 border-t border-neutral-100 dark:border-neutral-700">
                            <div className="flex items-center gap-1.5 mb-2">
                                <svg className="w-3 h-3 text-neutral-500 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                    />
                                </svg>
                                <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                                    Tài nguyên ({tooltipContent.resourceCount})
                                </span>
                            </div>
                            <div className="space-y-1.5">
                                {tooltipContent.displayResources.map((resource: Resource, index: number) => (
                                    <div key={index} className="flex items-center gap-2 text-xs">
                                        <span className="text-sm">{getResourceIcon(resource.type)}</span>
                                        <span className="text-neutral-600 dark:text-neutral-400 truncate flex-1">
                                            {resource.title}
                                        </span>
                                        <span className="text-neutral-400 dark:text-neutral-500 text-xs">
                                            {getResourceTypeLabel(resource.type)}
                                        </span>
                                    </div>
                                ))}
                                {tooltipContent.hasMoreResources && (
                                    <div className="text-xs text-neutral-400 dark:text-neutral-500 text-center py-1">
                                        +{tooltipContent.extraResourceCount} tài nguyên khác
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Learning level indicator */}
                    {nodeData.level !== undefined && (
                        <div className="pt-2 border-t border-neutral-100 dark:border-neutral-700">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Cấp độ:</span>
                                <div className="flex items-center gap-1.5 flex-1">
                                    <span className="text-xs font-semibold text-primary-600 dark:text-primary-400">
                                        {nodeData.level}
                                    </span>
                                    <div className="flex-1 bg-neutral-200 dark:bg-neutral-700 rounded-full h-1">
                                        <div
                                            className="bg-primary-500 dark:bg-primary-400 h-1 rounded-full transition-all duration-300"
                                            style={{ width: `${Math.min((nodeData.level / 10) * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer with interaction hint */}
                <div className="px-4 py-3 border-t border-neutral-100 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 rounded-b-xl">
                    <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                                />
                            </svg>
                            <span>Nhấp để xem chi tiết</span>
                        </div>
                        {/* Navigation hint based on category */}
                        {nodeData.category === 'role' && nodeData.targetRoadmapId && (
                            <div className="flex items-center gap-1 text-primary-600 dark:text-primary-400">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                                    />
                                </svg>
                                <span>Roadmap</span>
                            </div>
                        )}
                        {nodeData.category === 'skill' && nodeData.targetArticleId && (
                            <div className="flex items-center gap-1 text-secondary-600 dark:text-secondary-400">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                    />
                                </svg>
                                <span>Bài viết</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tooltip arrow */}
                <div
                    className={`absolute w-3 h-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 transform rotate-45 ${position.placement === 'top' ? 'bottom-0 left-4 translate-y-1/2 border-t-0 border-l-0' :
                        position.placement === 'bottom' ? 'top-0 left-4 -translate-y-1/2 border-b-0 border-r-0' :
                            position.placement === 'left' ? 'right-0 top-4 translate-x-1/2 border-l-0 border-b-0' :
                                'left-0 top-4 -translate-x-1/2 border-r-0 border-t-0'
                        }`}
                />
            </div>
        </div>
    );
}