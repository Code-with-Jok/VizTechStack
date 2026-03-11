'use client';

/**
 * Enhanced NodeDetailsPanel component - Hiển thị thông tin chi tiết của node được chọn
 * Tích hợp với VizTechStack design system và warm color palette
 * Hỗ trợ keyboard navigation, accessibility, related nodes và comprehensive actions
 * 
 * Enhancements for Task 1.5.2:
 * - Comprehensive node information display
 * - Related nodes và connections visualization
 * - Action buttons (navigate, bookmark, share, etc.)
 * - Progress tracking information
 * - Improved responsive design
 * - Enhanced interactive features
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { NodeData, Resource, RoadmapEdge, RoadmapNode } from '@viztechstack/roadmap-visualization';
import {
    getCategoryIcon,
    getCategoryDisplayName,
    getNodeNavigationUrl,
    canNavigate,
} from '@viztechstack/roadmap-visualization';

interface NodeDetailsPanelProps {
    nodeId: string;
    nodeData: NodeData;
    onClose: () => void;
    onNavigate?: (url: string, openInNewTab?: boolean) => void;
    onNodeSelect?: (nodeId: string) => void; // For navigating to related nodes
    className?: string;

    // Enhanced props for comprehensive functionality
    allNodes?: RoadmapNode[]; // All nodes in the graph for finding related nodes
    allEdges?: RoadmapEdge[]; // All edges for finding connections
    highlightedNodes?: Set<string>; // Currently highlighted nodes
    highlightedEdges?: Set<string>; // Currently highlighted edges
    onBookmark?: (nodeId: string) => void; // Bookmark functionality
    onShare?: (nodeId: string) => void; // Share functionality
    onMarkComplete?: (nodeId: string, completed: boolean) => void; // Progress tracking
    isBookmarked?: boolean; // Whether node is bookmarked
    userProgress?: {
        completedNodes: Set<string>;
        totalNodes: number;
        progressPercentage: number;
    };
}

/**
 * Lấy màu sắc theo độ khó
 */
function getDifficultyColor(difficulty?: string): string {
    switch (difficulty) {
        case 'beginner':
            return 'text-success-600 bg-success-50 border-success-200';
        case 'intermediate':
            return 'text-warning-600 bg-warning-50 border-warning-200';
        case 'advanced':
            return 'text-error-600 bg-error-50 border-error-200';
        default:
            return 'text-neutral-600 bg-neutral-50 border-neutral-200';
    }
}

/**
 * Lấy tên hiển thị cho độ khó
 */
function getDifficultyLabel(difficulty?: string): string {
    switch (difficulty) {
        case 'beginner':
            return 'Cơ bản';
        case 'intermediate':
            return 'Trung bình';
        case 'advanced':
            return 'Nâng cao';
        default:
            return 'Không xác định';
    }
}

/**
 * Component hiển thị related node item
 */
function RelatedNodeItem({
    node,
    relationship,
    isHighlighted,
    onSelect
}: {
    node: RoadmapNode;
    relationship: string;
    isHighlighted: boolean;
    onSelect: (nodeId: string) => void;
}) {
    const handleClick = () => {
        onSelect(node.id);
    };

    const getRelationshipIcon = (rel: string) => {
        switch (rel) {
            case 'prerequisite':
                return '⬅️';
            case 'leads-to':
                return '➡️';
            case 'related-to':
                return '🔗';
            case 'part-of':
                return '📁';
            default:
                return '🔗';
        }
    };

    const getRelationshipLabel = (rel: string) => {
        switch (rel) {
            case 'prerequisite':
                return 'Yêu cầu trước';
            case 'leads-to':
                return 'Dẫn đến';
            case 'related-to':
                return 'Liên quan';
            case 'part-of':
                return 'Thuộc về';
            default:
                return 'Kết nối';
        }
    };

    return (
        <button
            onClick={handleClick}
            className={`w-full text-left p-3 rounded-lg border transition-all duration-200 group ${isHighlighted
                ? 'border-primary-300 bg-primary-50 shadow-soft'
                : 'border-neutral-200 hover:border-primary-300 hover:bg-primary-50'
                }`}
        >
            <div className="flex items-start gap-3">
                <span className="text-lg flex-shrink-0 group-hover:animate-bounce-gentle">
                    {getRelationshipIcon(relationship)}
                </span>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm text-neutral-900 line-clamp-1 group-hover:text-primary-700">
                            {node.data.label}
                        </h4>
                        {node.data.completed && (
                            <svg className="w-3 h-3 text-success-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        )}
                    </div>
                    <p className="text-xs text-neutral-500">
                        {getRelationshipLabel(relationship)}
                    </p>
                    {node.data.difficulty && (
                        <div className="mt-1">
                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getDifficultyColor(node.data.difficulty)}`}>
                                {getDifficultyLabel(node.data.difficulty)}
                            </span>
                        </div>
                    )}
                </div>
                <svg
                    className="w-4 h-4 text-neutral-400 group-hover:text-primary-500 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                    />
                </svg>
            </div>
        </button>
    );
}

/**
 * Component hiển thị progress indicator
 */
function ProgressIndicator({
    progress,
    total,
    percentage
}: {
    progress: number;
    total: number;
    percentage: number;
}) {
    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-neutral-700">Tiến độ học tập</span>
                <span className="text-sm font-semibold text-neutral-900">{progress}/{total}</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2.5">
                <div
                    className="bg-gradient-to-r from-primary-400 to-primary-500 h-2.5 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <div className="flex justify-between text-xs text-neutral-500">
                <span>{percentage.toFixed(0)}% hoàn thành</span>
                <span>{total - progress} còn lại</span>
            </div>
        </div>
    );
}

/**
 * Component hiển thị action buttons
 */
function ActionButtons({
    nodeId,
    nodeData,
    isBookmarked,
    onBookmark,
    onShare,
    onMarkComplete,
    onNavigate,
    navigationInfo
}: {
    nodeId: string;
    nodeData: NodeData;
    isBookmarked?: boolean;
    onBookmark?: (nodeId: string) => void;
    onShare?: (nodeId: string) => void;
    onMarkComplete?: (nodeId: string, completed: boolean) => void;
    onNavigate?: (url: string, openInNewTab?: boolean) => void;
    navigationInfo?: {
        type: 'none' | 'article' | 'roadmap' | 'external';
        url: string;
        openInNewTab?: boolean;
        isExternal?: boolean;
    };
}) {
    const [isSharing, setIsSharing] = useState(false);
    const [isTogglingComplete, setIsTogglingComplete] = useState(false);

    const handleBookmark = useCallback(() => {
        if (onBookmark) {
            onBookmark(nodeId);
        }
    }, [nodeId, onBookmark]);

    const handleShare = useCallback(async () => {
        if (onShare) {
            setIsSharing(true);
            try {
                onShare(nodeId);
                // Copy to clipboard as fallback
                if (navigator.clipboard) {
                    const url = `${window.location.origin}${window.location.pathname}?node=${nodeId}`;
                    await navigator.clipboard.writeText(url);
                }
            } catch (error) {
                console.error('Share failed:', error);
            } finally {
                setIsSharing(false);
            }
        }
    }, [nodeId, onShare]);

    const handleToggleComplete = useCallback(() => {
        if (onMarkComplete) {
            setIsTogglingComplete(true);
            try {
                onMarkComplete(nodeId, !nodeData.completed);
            } catch (error) {
                console.error('Toggle complete failed:', error);
            } finally {
                setIsTogglingComplete(false);
            }
        }
    }, [nodeId, nodeData.completed, onMarkComplete]);

    const handleNavigateClick = useCallback(() => {
        if (navigationInfo && navigationInfo.type !== 'none' && onNavigate) {
            onNavigate(navigationInfo.url, navigationInfo.openInNewTab || navigationInfo.isExternal);
        }
    }, [navigationInfo, onNavigate]);

    return (
        <div className="space-y-3">
            {/* Primary navigation button */}
            {navigationInfo && navigationInfo.type !== 'none' && (
                <button
                    onClick={handleNavigateClick}
                    className="w-full btn-primary flex items-center justify-center gap-2"
                >
                    <span>
                        {navigationInfo?.type === 'roadmap' && 'Xem roadmap'}
                        {navigationInfo?.type === 'article' && 'Đọc bài viết'}
                        {navigationInfo?.type === 'external' && 'Mở liên kết'}
                    </span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                    </svg>
                </button>
            )}

            {/* Secondary action buttons */}
            <div className="grid grid-cols-3 gap-2">
                {/* Mark as complete/incomplete */}
                {onMarkComplete && (
                    <button
                        onClick={handleToggleComplete}
                        disabled={isTogglingComplete}
                        className={`btn-secondary text-xs py-2 px-3 flex items-center justify-center gap-1 ${nodeData.completed
                            ? 'bg-success-50 border-success-200 text-success-700 hover:bg-success-100'
                            : 'hover:bg-primary-50 hover:border-primary-300'
                            }`}
                        title={nodeData.completed ? 'Đánh dấu chưa hoàn thành' : 'Đánh dấu hoàn thành'}
                    >
                        {isTogglingComplete ? (
                            <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        )}
                        <span className="hidden sm:inline">
                            {nodeData.completed ? 'Hoàn thành' : 'Đánh dấu'}
                        </span>
                    </button>
                )}

                {/* Bookmark */}
                {onBookmark && (
                    <button
                        onClick={handleBookmark}
                        className={`btn-secondary text-xs py-2 px-3 flex items-center justify-center gap-1 ${isBookmarked
                            ? 'bg-warning-50 border-warning-200 text-warning-700 hover:bg-warning-100'
                            : 'hover:bg-primary-50 hover:border-primary-300'
                            }`}
                        title={isBookmarked ? 'Bỏ bookmark' : 'Thêm bookmark'}
                    >
                        <svg className="w-3 h-3" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                            />
                        </svg>
                        <span className="hidden sm:inline">
                            {isBookmarked ? 'Đã lưu' : 'Lưu'}
                        </span>
                    </button>
                )}

                {/* Share */}
                {onShare && (
                    <button
                        onClick={handleShare}
                        disabled={isSharing}
                        className="btn-secondary text-xs py-2 px-3 flex items-center justify-center gap-1 hover:bg-primary-50 hover:border-primary-300"
                        title="Chia sẻ node này"
                    >
                        {isSharing ? (
                            <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                                />
                            </svg>
                        )}
                        <span className="hidden sm:inline">Chia sẻ</span>
                    </button>
                )}
            </div>
        </div>
    );
}
function ResourceItem({ resource }: { resource: Resource }) {
    const getResourceIcon = (type: string) => {
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
    };

    const getResourceTypeLabel = (type: string) => {
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
    };

    return (
        <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 p-3 rounded-lg border border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 group"
        >
            <span className="text-lg flex-shrink-0 group-hover:animate-bounce-gentle">
                {getResourceIcon(resource.type)}
            </span>
            <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-neutral-900 line-clamp-2 group-hover:text-primary-700">
                    {resource.title}
                </h4>
                <p className="text-xs text-neutral-500 mt-1">
                    {getResourceTypeLabel(resource.type)}
                </p>
            </div>
            <svg
                className="w-4 h-4 text-neutral-400 group-hover:text-primary-500 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
            </svg>
        </a>
    );
}

/**
 * Enhanced NodeDetailsPanel component chính
 */
export function NodeDetailsPanel({
    nodeId,
    nodeData,
    onClose,
    onNavigate,
    onNodeSelect,
    className = '',
    allNodes = [],
    allEdges = [],
    highlightedNodes = new Set(),
    highlightedEdges = new Set(),
    onBookmark,
    onShare,
    onMarkComplete,
    isBookmarked = false,
    userProgress,
}: NodeDetailsPanelProps) {
    const panelRef = useRef<HTMLDivElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const [activeTab, setActiveTab] = useState<'details' | 'connections' | 'progress'>('details');

    // Find related nodes and connections
    const relatedNodesData = React.useMemo(() => {
        const related: Array<{ node: RoadmapNode; relationship: string; edgeId: string }> = [];

        allEdges.forEach(edge => {
            let targetNodeId: string | null = null;
            let relationship = '';

            if (edge.source === nodeId) {
                targetNodeId = edge.target;
                relationship = edge.data?.relationship || edge.type || 'related-to';
            } else if (edge.target === nodeId) {
                targetNodeId = edge.source;
                // Reverse relationship for incoming edges
                switch (edge.data?.relationship || edge.type) {
                    case 'leads-to':
                        relationship = 'prerequisite';
                        break;
                    case 'prerequisite':
                        relationship = 'leads-to';
                        break;
                    default:
                        relationship = edge.data?.relationship || edge.type || 'related-to';
                }
            }

            if (targetNodeId) {
                const targetNode = allNodes.find(n => n.id === targetNodeId);
                if (targetNode) {
                    related.push({
                        node: targetNode,
                        relationship,
                        edgeId: edge.id
                    });
                }
            }
        });

        return related;
    }, [nodeId, allNodes, allEdges]);

    // Group related nodes by relationship type
    const groupedRelatedNodes = React.useMemo(() => {
        const groups: Record<string, Array<{ node: RoadmapNode; relationship: string; edgeId: string }>> = {};

        relatedNodesData.forEach(item => {
            if (!groups[item.relationship]) {
                groups[item.relationship] = [];
            }
            groups[item.relationship].push(item);
        });

        return groups;
    }, [relatedNodesData]);

    // Focus management cho accessibility
    useEffect(() => {
        if (closeButtonRef.current) {
            closeButtonRef.current.focus();
        }
    }, []);

    // Keyboard event handling
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
            // Tab navigation between tabs
            if (event.key === 'Tab' && event.ctrlKey) {
                event.preventDefault();
                const tabs = ['details', 'connections', 'progress'] as const;
                const currentIndex = tabs.indexOf(activeTab);
                const nextIndex = (currentIndex + 1) % tabs.length;
                setActiveTab(tabs[nextIndex]);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose, activeTab]);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    // Handle related node selection
    const handleRelatedNodeSelect = useCallback((selectedNodeId: string) => {
        if (onNodeSelect) {
            onNodeSelect(selectedNodeId);
        }
    }, [onNodeSelect]);

    // Lấy thông tin navigation
    const navigationInfo = canNavigate(nodeData) ? getNodeNavigationUrl(nodeData) : {
        type: 'none' as const,
        url: '',
        openInNewTab: false,
        isExternal: false,
    };

    // Lấy category info
    const categoryIcon = getCategoryIcon(nodeData.category);
    const categoryName = getCategoryDisplayName(nodeData.category);

    return (
        <div
            ref={panelRef}
            className={`bg-white rounded-xl shadow-large border border-neutral-200 overflow-hidden animate-slide-down max-w-md w-full ${className}`}
            role="dialog"
            aria-labelledby="node-details-title"
            aria-describedby="node-details-description"
        >
            {/* Enhanced Header với tabs */}
            <div className="border-b border-neutral-100 bg-gradient-soft">
                <div className="flex items-center justify-between p-6 pb-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        {nodeData.category && (
                            <span className="text-2xl animate-bounce-gentle flex-shrink-0">{categoryIcon}</span>
                        )}
                        <div className="min-w-0 flex-1">
                            <h2
                                id="node-details-title"
                                className="text-lg font-semibold text-neutral-900 line-clamp-2"
                            >
                                {nodeData.label}
                            </h2>
                            {nodeData.category && (
                                <p className="text-sm text-neutral-600 mt-1">
                                    {categoryName}
                                </p>
                            )}
                        </div>
                    </div>
                    <button
                        ref={closeButtonRef}
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-neutral-100 transition-colors duration-200 text-neutral-500 hover:text-neutral-700 flex-shrink-0"
                        aria-label="Đóng panel chi tiết"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="px-6 pb-4">
                    <div className="flex space-x-1 bg-white/50 rounded-lg p-1">
                        <button
                            onClick={() => setActiveTab('details')}
                            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${activeTab === 'details'
                                ? 'bg-white text-primary-600 shadow-soft'
                                : 'text-neutral-600 hover:text-neutral-800 hover:bg-white/50'
                                }`}
                        >
                            Chi tiết
                        </button>
                        <button
                            onClick={() => setActiveTab('connections')}
                            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 relative ${activeTab === 'connections'
                                ? 'bg-white text-primary-600 shadow-soft'
                                : 'text-neutral-600 hover:text-neutral-800 hover:bg-white/50'
                                }`}
                        >
                            Kết nối
                            {relatedNodesData.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {relatedNodesData.length}
                                </span>
                            )}
                        </button>
                        {userProgress && (
                            <button
                                onClick={() => setActiveTab('progress')}
                                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${activeTab === 'progress'
                                    ? 'bg-white text-primary-600 shadow-soft'
                                    : 'text-neutral-600 hover:text-neutral-800 hover:bg-white/50'
                                    }`}
                            >
                                Tiến độ
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Enhanced Content với tabs */}
            <div className="max-h-96 overflow-y-auto">
                {/* Details Tab */}
                {activeTab === 'details' && (
                    <div className="p-6 space-y-6 animate-fade-in">
                        {/* Status và metadata */}
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Completion status */}
                            {nodeData.completed && (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-success-50 border border-success-200 rounded-lg">
                                    <svg className="w-4 h-4 text-success-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    <span className="text-sm font-medium text-success-700">Đã hoàn thành</span>
                                </div>
                            )}

                            {/* Difficulty level */}
                            {nodeData.difficulty && (
                                <div className={`px-3 py-1.5 rounded-lg border text-sm font-medium ${getDifficultyColor(nodeData.difficulty)}`}>
                                    {getDifficultyLabel(nodeData.difficulty)}
                                </div>
                            )}

                            {/* Estimated time */}
                            {nodeData.estimatedTime && (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg">
                                    <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    <span className="text-sm font-medium text-neutral-700">{nodeData.estimatedTime}</span>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        {nodeData.description && (
                            <div>
                                <h3 className="text-sm font-semibold text-neutral-900 mb-2">Mô tả</h3>
                                <p
                                    id="node-details-description"
                                    className="text-sm text-neutral-700 leading-relaxed"
                                >
                                    {nodeData.description}
                                </p>
                            </div>
                        )}

                        {/* Section info */}
                        {nodeData.section && (
                            <div>
                                <h3 className="text-sm font-semibold text-neutral-900 mb-2">Phần</h3>
                                <p className="text-sm text-neutral-600 px-3 py-2 bg-neutral-50 rounded-lg">
                                    {nodeData.section}
                                </p>
                            </div>
                        )}

                        {/* Learning objectives (if available) */}
                        {nodeData.level !== undefined && (
                            <div>
                                <h3 className="text-sm font-semibold text-neutral-900 mb-2">Cấp độ học tập</h3>
                                <div className="flex items-center gap-2 px-3 py-2 bg-primary-50 border border-primary-200 rounded-lg">
                                    <span className="text-primary-600 font-medium">Cấp {nodeData.level}</span>
                                    <div className="flex-1 bg-primary-200 rounded-full h-1.5">
                                        <div
                                            className="bg-primary-500 h-1.5 rounded-full transition-all duration-300"
                                            style={{ width: `${Math.min((nodeData.level / 10) * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Resources */}
                        {nodeData.resources && nodeData.resources.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-neutral-900 mb-3">
                                    Tài nguyên ({nodeData.resources.length})
                                </h3>
                                <div className="space-y-2">
                                    {nodeData.resources.map((resource, index) => (
                                        <ResourceItem key={index} resource={resource} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Prerequisites */}
                        {nodeData.prerequisites && nodeData.prerequisites.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-neutral-900 mb-2">Yêu cầu trước</h3>
                                <div className="space-y-1">
                                    {nodeData.prerequisites.map((prereqId, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-2 text-sm text-neutral-600 px-3 py-2 bg-neutral-50 rounded-lg"
                                        >
                                            <span className="w-1.5 h-1.5 bg-primary-400 rounded-full"></span>
                                            <span>{prereqId}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Connections Tab */}
                {activeTab === 'connections' && (
                    <div className="p-6 space-y-6 animate-fade-in">
                        {relatedNodesData.length > 0 ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                                        />
                                    </svg>
                                    <h3 className="text-sm font-semibold text-neutral-900">
                                        Nodes liên quan ({relatedNodesData.length})
                                    </h3>
                                </div>

                                {Object.entries(groupedRelatedNodes).map(([relationship, nodes]) => (
                                    <div key={relationship} className="space-y-2">
                                        <h4 className="text-xs font-medium text-neutral-600 uppercase tracking-wide">
                                            {nodes[0].relationship === 'prerequisite' && 'Yêu cầu trước'}
                                            {nodes[0].relationship === 'leads-to' && 'Dẫn đến'}
                                            {nodes[0].relationship === 'related-to' && 'Liên quan'}
                                            {nodes[0].relationship === 'part-of' && 'Thuộc về'}
                                            {!['prerequisite', 'leads-to', 'related-to', 'part-of'].includes(nodes[0].relationship) && 'Kết nối khác'}
                                        </h4>
                                        <div className="space-y-2">
                                            {nodes.map((item, index) => (
                                                <RelatedNodeItem
                                                    key={`${item.node.id}-${index}`}
                                                    node={item.node}
                                                    relationship={item.relationship}
                                                    isHighlighted={highlightedNodes.has(item.node.id) || highlightedEdges.has(item.edgeId)}
                                                    onSelect={handleRelatedNodeSelect}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                {/* Connection statistics */}
                                <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
                                    <h4 className="text-sm font-medium text-neutral-900 mb-2">Thống kê kết nối</h4>
                                    <div className="grid grid-cols-2 gap-4 text-xs">
                                        <div className="text-center">
                                            <div className="text-lg font-semibold text-primary-600">{relatedNodesData.length}</div>
                                            <div className="text-neutral-600">Tổng kết nối</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-lg font-semibold text-success-600">
                                                {relatedNodesData.filter(item => item.node.data.completed).length}
                                            </div>
                                            <div className="text-neutral-600">Đã hoàn thành</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <svg className="w-12 h-12 text-neutral-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                                    />
                                </svg>
                                <p className="text-sm text-neutral-500">Không có kết nối nào được tìm thấy</p>
                                <p className="text-xs text-neutral-400 mt-1">Node này không kết nối với nodes khác</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Progress Tab */}
                {activeTab === 'progress' && userProgress && (
                    <div className="p-6 space-y-6 animate-fade-in">
                        <div className="flex items-center gap-2 mb-4">
                            <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                />
                            </svg>
                            <h3 className="text-sm font-semibold text-neutral-900">Tiến độ học tập</h3>
                        </div>

                        <ProgressIndicator
                            progress={userProgress.completedNodes.size}
                            total={userProgress.totalNodes}
                            percentage={userProgress.progressPercentage}
                        />

                        {/* Node status in context */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-medium text-neutral-900">Trạng thái node này</h4>
                            <div className={`p-4 rounded-lg border ${nodeData.completed
                                ? 'bg-success-50 border-success-200'
                                : 'bg-warning-50 border-warning-200'
                                }`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${nodeData.completed ? 'bg-success-500' : 'bg-warning-500'
                                        }`} />
                                    <div className="flex-1">
                                        <p className={`text-sm font-medium ${nodeData.completed ? 'text-success-800' : 'text-warning-800'
                                            }`}>
                                            {nodeData.completed ? 'Đã hoàn thành' : 'Chưa hoàn thành'}
                                        </p>
                                        <p className={`text-xs ${nodeData.completed ? 'text-success-600' : 'text-warning-600'
                                            }`}>
                                            {nodeData.completed
                                                ? 'Bạn đã hoàn thành node này'
                                                : 'Đánh dấu hoàn thành khi bạn đã học xong'
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Related progress */}
                        {relatedNodesData.length > 0 && (
                            <div className="space-y-3">
                                <h4 className="text-sm font-medium text-neutral-900">Tiến độ nodes liên quan</h4>
                                <div className="space-y-2">
                                    {relatedNodesData.slice(0, 3).map((item, index) => (
                                        <div key={index} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                                            <div className={`w-2 h-2 rounded-full ${item.node.data.completed ? 'bg-success-500' : 'bg-neutral-300'
                                                }`} />
                                            <span className="text-sm text-neutral-700 flex-1 line-clamp-1">
                                                {item.node.data.label}
                                            </span>
                                            {item.node.data.completed && (
                                                <svg className="w-4 h-4 text-success-600" fill="currentColor" viewBox="0 0 20 20">
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            )}
                                        </div>
                                    ))}
                                    {relatedNodesData.length > 3 && (
                                        <p className="text-xs text-neutral-500 text-center">
                                            +{relatedNodesData.length - 3} nodes khác
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Enhanced Footer với action buttons */}
            <div className="border-t border-neutral-100 bg-neutral-50 p-6">
                <ActionButtons
                    nodeId={nodeId}
                    nodeData={nodeData}
                    isBookmarked={isBookmarked}
                    onBookmark={onBookmark}
                    onShare={onShare}
                    onMarkComplete={onMarkComplete}
                    onNavigate={onNavigate}
                    navigationInfo={navigationInfo}
                />
            </div>
        </div>
    );
}
