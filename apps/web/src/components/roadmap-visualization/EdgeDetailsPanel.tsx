'use client';

/**
 * Panel hiển thị chi tiết về edge relationships
 * Hiển thị thông tin về mối quan hệ giữa các nodes
 * Tích hợp với VizTechStack design system và warm color palette
 */

import React from 'react';
import type { EdgeRelationshipDetails } from '@/hooks/useEdgeInteraction';

/**
 * Props cho EdgeDetailsPanel component
 */
export interface EdgeDetailsPanelProps {
    relationshipDetails: EdgeRelationshipDetails;
    onClose: () => void;
    onNavigateToNode: (nodeId: string) => void;
    className?: string;
}

/**
 * Lấy icon cho relationship type
 */
function getRelationshipIcon(relationship: string): string {
    switch (relationship) {
        case 'prerequisite':
            return '🔒';
        case 'leads-to':
            return '➡️';
        case 'related-to':
            return '🔗';
        case 'part-of':
            return '📦';
        default:
            return '↔️';
    }
}

/**
 * Lấy màu sắc cho relationship type
 */
function getRelationshipColor(relationship: string): {
    bg: string;
    border: string;
    text: string;
    accent: string;
} {
    switch (relationship) {
        case 'prerequisite':
            return {
                bg: 'bg-error-50 dark:bg-error-950',
                border: 'border-error-200 dark:border-error-800',
                text: 'text-error-800 dark:text-error-200',
                accent: 'text-error-600 dark:text-error-400',
            };
        case 'leads-to':
            return {
                bg: 'bg-primary-50 dark:bg-primary-950',
                border: 'border-primary-200 dark:border-primary-800',
                text: 'text-primary-800 dark:text-primary-200',
                accent: 'text-primary-600 dark:text-primary-400',
            };
        case 'related-to':
            return {
                bg: 'bg-secondary-50 dark:bg-secondary-950',
                border: 'border-secondary-200 dark:border-secondary-800',
                text: 'text-secondary-800 dark:text-secondary-200',
                accent: 'text-secondary-600 dark:text-secondary-400',
            };
        case 'part-of':
            return {
                bg: 'bg-success-50 dark:bg-success-950',
                border: 'border-success-200 dark:border-success-800',
                text: 'text-success-800 dark:text-success-200',
                accent: 'text-success-600 dark:text-success-400',
            };
        default:
            return {
                bg: 'bg-neutral-50 dark:bg-neutral-950',
                border: 'border-neutral-200 dark:border-neutral-800',
                text: 'text-neutral-800 dark:text-neutral-200',
                accent: 'text-neutral-600 dark:text-neutral-400',
            };
    }
}

/**
 * Lấy display name cho relationship type
 */
function getRelationshipDisplayName(relationship: string): string {
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
 * Lấy strength indicator
 */
function getStrengthIndicator(strength?: number): {
    level: string;
    color: string;
    description: string;
} {
    if (!strength) {
        return {
            level: 'Không xác định',
            color: 'text-neutral-500',
            description: 'Độ mạnh kết nối chưa được xác định',
        };
    }

    if (strength >= 0.8) {
        return {
            level: 'Rất mạnh',
            color: 'text-success-600',
            description: 'Mối quan hệ rất quan trọng và cần thiết',
        };
    }

    if (strength >= 0.5) {
        return {
            level: 'Trung bình',
            color: 'text-warning-600',
            description: 'Mối quan hệ có ý nghĩa nhưng không bắt buộc',
        };
    }

    if (strength >= 0.2) {
        return {
            level: 'Yếu',
            color: 'text-neutral-600',
            description: 'Mối quan hệ tham khảo hoặc hỗ trợ',
        };
    }

    return {
        level: 'Rất yếu',
        color: 'text-neutral-400',
        description: 'Mối quan hệ gián tiếp hoặc tùy chọn',
    };
}

/**
 * Component hiển thị difficulty badge
 */
function DifficultyBadge({ difficulty }: { difficulty?: string }) {
    if (!difficulty) return null;

    const getDifficultyStyle = (level: string) => {
        switch (level) {
            case 'beginner':
                return {
                    bg: 'bg-success-100 dark:bg-success-900',
                    text: 'text-success-800 dark:text-success-200',
                    label: 'Cơ bản',
                };
            case 'intermediate':
                return {
                    bg: 'bg-warning-100 dark:bg-warning-900',
                    text: 'text-warning-800 dark:text-warning-200',
                    label: 'Trung cấp',
                };
            case 'advanced':
                return {
                    bg: 'bg-error-100 dark:bg-error-900',
                    text: 'text-error-800 dark:text-error-200',
                    label: 'Nâng cao',
                };
            default:
                return {
                    bg: 'bg-neutral-100 dark:bg-neutral-900',
                    text: 'text-neutral-800 dark:text-neutral-200',
                    label: difficulty,
                };
        }
    };

    const style = getDifficultyStyle(difficulty);

    return (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
            {style.label}
        </span>
    );
}

/**
 * EdgeDetailsPanel component chính
 */
export function EdgeDetailsPanel({
    relationshipDetails,
    onClose,
    onNavigateToNode,
    className = '',
}: EdgeDetailsPanelProps) {
    const { sourceNode, targetNode, relationship, strength, bidirectional, description, reasoning } = relationshipDetails;

    const relationshipIcon = getRelationshipIcon(relationship);
    const relationshipColors = getRelationshipColor(relationship);
    const relationshipName = getRelationshipDisplayName(relationship);
    const strengthInfo = getStrengthIndicator(strength);

    return (
        <div className={`
            glass rounded-xl shadow-large border border-white/20 
            backdrop-blur-md overflow-hidden
            animate-slide-down
            ${className}
        `}>
            {/* Header */}
            <div className={`
                px-6 py-4 border-b border-white/10
                ${relationshipColors.bg} ${relationshipColors.border}
            `}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">{relationshipIcon}</span>
                        <div>
                            <h3 className={`font-semibold text-lg ${relationshipColors.text}`}>
                                {relationshipName}
                            </h3>
                            <p className={`text-sm ${relationshipColors.accent}`}>
                                Chi tiết mối quan hệ
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className={`
                            p-2 rounded-lg transition-colors duration-200
                            hover:bg-white/20 dark:hover:bg-black/20
                            ${relationshipColors.accent}
                        `}
                        aria-label="Đóng panel chi tiết edge"
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
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 bg-white/90 dark:bg-neutral-900/90">
                {/* Relationship Description */}
                <div className="space-y-2">
                    <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                        Mô tả mối quan hệ
                    </h4>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                        {description}
                    </p>
                </div>

                {/* Reasoning */}
                {reasoning && (
                    <div className="space-y-2">
                        <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                            Lý do kết nối
                        </h4>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                            {reasoning}
                        </p>
                    </div>
                )}

                {/* Connection Strength */}
                {strength !== undefined && (
                    <div className="space-y-3">
                        <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                            Độ mạnh kết nối
                        </h4>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className={`text-sm font-medium ${strengthInfo.color}`}>
                                    {strengthInfo.level}
                                </span>
                                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                    {Math.round(strength * 100)}%
                                </span>
                            </div>
                            <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full transition-all duration-300 ${strength >= 0.8 ? 'bg-success-500' :
                                            strength >= 0.5 ? 'bg-warning-500' :
                                                strength >= 0.2 ? 'bg-neutral-500' : 'bg-neutral-400'
                                        }`}
                                    style={{ width: `${strength * 100}%` }}
                                />
                            </div>
                            <p className="text-xs text-neutral-600 dark:text-neutral-400">
                                {strengthInfo.description}
                            </p>
                        </div>
                    </div>
                )}

                {/* Bidirectional Indicator */}
                {bidirectional && (
                    <div className="flex items-center gap-2 p-3 bg-primary-50 dark:bg-primary-950 rounded-lg border border-primary-200 dark:border-primary-800">
                        <span className="text-primary-600 dark:text-primary-400">↔️</span>
                        <span className="text-sm text-primary-800 dark:text-primary-200">
                            Kết nối hai chiều - có thể học theo cả hai hướng
                        </span>
                    </div>
                )}

                {/* Connected Nodes */}
                <div className="space-y-4">
                    <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                        Các chủ đề được kết nối
                    </h4>

                    {/* Source Node */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                            <span>Từ:</span>
                            {relationship === 'prerequisite' && <span className="text-error-600">🔒</span>}
                            {relationship === 'leads-to' && <span className="text-primary-600">📍</span>}
                        </div>
                        <button
                            onClick={() => onNavigateToNode(sourceNode.id)}
                            className="w-full p-4 text-left bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-200 group"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <h5 className="font-medium text-neutral-900 dark:text-neutral-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
                                        {sourceNode.data.label}
                                    </h5>
                                    {sourceNode.data.description && (
                                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-2">
                                            {sourceNode.data.description}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-2 mt-2">
                                        <DifficultyBadge difficulty={sourceNode.data.difficulty} />
                                        {sourceNode.data.estimatedTime && (
                                            <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                                ⏱️ {sourceNode.data.estimatedTime}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <svg className="w-5 h-5 text-neutral-400 group-hover:text-primary-500 transition-colors duration-200 flex-shrink-0 ml-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </button>
                    </div>

                    {/* Relationship Arrow */}
                    <div className="flex justify-center">
                        <div className={`
                            flex items-center gap-2 px-3 py-1 rounded-full text-sm
                            ${relationshipColors.bg} ${relationshipColors.border} ${relationshipColors.text}
                        `}>
                            <span>{relationshipIcon}</span>
                            <span>{relationshipName}</span>
                            {bidirectional && <span>↔️</span>}
                        </div>
                    </div>

                    {/* Target Node */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                            <span>Đến:</span>
                            {relationship === 'leads-to' && <span className="text-primary-600">🎯</span>}
                            {relationship === 'part-of' && <span className="text-success-600">📦</span>}
                        </div>
                        <button
                            onClick={() => onNavigateToNode(targetNode.id)}
                            className="w-full p-4 text-left bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-200 group"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <h5 className="font-medium text-neutral-900 dark:text-neutral-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
                                        {targetNode.data.label}
                                    </h5>
                                    {targetNode.data.description && (
                                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-2">
                                            {targetNode.data.description}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-2 mt-2">
                                        <DifficultyBadge difficulty={targetNode.data.difficulty} />
                                        {targetNode.data.estimatedTime && (
                                            <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                                ⏱️ {targetNode.data.estimatedTime}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <svg className="w-5 h-5 text-neutral-400 group-hover:text-primary-500 transition-colors duration-200 flex-shrink-0 ml-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Navigation Controls */}
                <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
                    <div className="flex gap-3">
                        <button
                            onClick={() => onNavigateToNode(sourceNode.id)}
                            className="flex-1 px-4 py-2 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors duration-200 text-sm font-medium"
                        >
                            Đi đến nguồn
                        </button>
                        <button
                            onClick={() => onNavigateToNode(targetNode.id)}
                            className="flex-1 px-4 py-2 bg-secondary-100 dark:bg-secondary-900 text-secondary-800 dark:text-secondary-200 rounded-lg hover:bg-secondary-200 dark:hover:bg-secondary-800 transition-colors duration-200 text-sm font-medium"
                        >
                            Đi đến đích
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}