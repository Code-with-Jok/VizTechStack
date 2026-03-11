'use client';

/**
 * Article preview tooltip component
 * Displays article metadata on hover for skill nodes
 */

import React from 'react';
import type { ArticleMetadata } from '@viztechstack/roadmap-visualization';

interface ArticlePreviewTooltipProps {
    metadata: ArticleMetadata;
    className?: string;
}

/**
 * Get difficulty badge color classes
 */
function getDifficultyColor(difficulty?: string): string {
    switch (difficulty) {
        case 'beginner':
            return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
        case 'intermediate':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
        case 'advanced':
            return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300';
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
 * Article preview tooltip component
 */
export function ArticlePreviewTooltip({ metadata, className = '' }: ArticlePreviewTooltipProps) {
    return (
        <div
            className={`
                absolute z-50 p-4 bg-white dark:bg-gray-800 
                border border-gray-200 dark:border-gray-700 
                rounded-lg shadow-xl max-w-sm
                -bottom-2 left-0 transform translate-y-full
                pointer-events-none
                ${className}
            `}
        >
            {/* External link indicator */}
            {metadata.isExternal && (
                <div className="flex items-center gap-1 mb-2 text-xs text-blue-600 dark:text-blue-400">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                    </svg>
                    <span className="font-medium">Liên kết ngoài</span>
                </div>
            )}

            {/* Title */}
            <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                {metadata.title}
            </h4>

            {/* Description */}
            {metadata.description && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
                    {metadata.description}
                </p>
            )}

            {/* Metadata row */}
            <div className="flex flex-wrap items-center gap-2">
                {/* Difficulty badge */}
                {metadata.difficulty && (
                    <span
                        className={`
                            inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                            ${getDifficultyColor(metadata.difficulty)}
                        `}
                    >
                        {getDifficultyName(metadata.difficulty)}
                    </span>
                )}

                {/* Read time */}
                {metadata.readTime && (
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        {metadata.readTime}
                    </span>
                )}

                {/* Author */}
                {metadata.author && (
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                        </svg>
                        {metadata.author}
                    </span>
                )}
            </div>

            {/* Tags */}
            {metadata.tags && metadata.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                    {metadata.tags.slice(0, 3).map((tag: string, index: number) => (
                        <span
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                        >
                            #{tag}
                        </span>
                    ))}
                    {metadata.tags.length > 3 && (
                        <span className="inline-flex items-center px-2 py-0.5 text-xs text-gray-500 dark:text-gray-400">
                            +{metadata.tags.length - 3}
                        </span>
                    )}
                </div>
            )}

            {/* Click hint */}
            <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                        />
                    </svg>
                    {metadata.isExternal ? 'Nhấp để mở trong tab mới' : 'Nhấp để xem bài viết'}
                </p>
            </div>

            {/* Tooltip arrow */}
            <div className="absolute -top-2 left-4 w-4 h-4 bg-white dark:bg-gray-800 border-l border-t border-gray-200 dark:border-gray-700 transform rotate-45" />
        </div>
    );
}
