/**
 * Navigation utilities for roadmap nodes
 * Handles click behavior based on node category
 */

import type { NodeData, NodeCategory } from '../types';

/**
 * Navigation result containing target URL and type
 */
export interface NavigationResult {
    url: string;
    type: 'roadmap' | 'article' | 'external' | 'none';
    openInNewTab?: boolean;
    isExternal?: boolean;
}

/**
 * Article metadata for preview tooltips
 */
export interface ArticleMetadata {
    title: string;
    description?: string;
    author?: string;
    readTime?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    tags?: string[];
    url: string;
    isExternal: boolean;
}

/**
 * Get article preview metadata from node data
 * 
 * @param nodeData - Node data containing article information
 * @returns Article metadata for preview or null if not available
 */
export function getArticlePreview(nodeData: NodeData): ArticleMetadata | null {
    const { category, targetArticleId, label, description, difficulty } = nodeData;

    if (category !== 'skill' || !targetArticleId) {
        return null;
    }

    const isExternal = isExternalUrl(targetArticleId);

    return {
        title: label,
        description: description || 'Nhấp để xem chi tiết bài viết',
        difficulty,
        url: isExternal ? targetArticleId : `/articles/${targetArticleId}`,
        isExternal,
        // These could be populated from actual article data in the future
        readTime: undefined,
        author: undefined,
        tags: undefined,
    };
}

/**
 * Check if URL is external (starts with http:// or https://)
 * 
 * @param url - URL to check
 * @returns True if URL is external
 */
export function isExternalUrl(url: string): boolean {
    return /^https?:\/\//i.test(url);
}

/**
 * Get navigation URL based on node category and data
 * 
 * @param nodeData - Node data containing category and target IDs
 * @returns Navigation result with URL and type
 */
export function getNodeNavigationUrl(nodeData: NodeData): NavigationResult {
    const { category, targetRoadmapId, targetArticleId } = nodeData;

    // Handle role nodes - navigate to sub-roadmap
    if (category === 'role' && targetRoadmapId) {
        return {
            url: `/roadmaps/${targetRoadmapId}`,
            type: 'roadmap',
            openInNewTab: false,
            isExternal: false,
        };
    }

    // Handle skill nodes - navigate to article
    if (category === 'skill' && targetArticleId) {
        // Check if article link is external
        const isExternal = isExternalUrl(targetArticleId);

        return {
            url: isExternal ? targetArticleId : `/articles/${targetArticleId}`,
            type: isExternal ? 'external' : 'article',
            openInNewTab: isExternal, // Open external links in new tab
            isExternal,
        };
    }

    // No navigation available
    return {
        url: '#',
        type: 'none',
        openInNewTab: false,
        isExternal: false,
    };
}

/**
 * Check if node has valid navigation target
 * 
 * @param nodeData - Node data to check
 * @returns True if node can navigate
 */
export function canNavigate(nodeData: NodeData): boolean {
    const { category, targetRoadmapId, targetArticleId } = nodeData;

    if (category === 'role') {
        return Boolean(targetRoadmapId);
    }

    if (category === 'skill') {
        return Boolean(targetArticleId);
    }

    return false;
}

/**
 * Get node category display name
 * 
 * @param category - Node category
 * @returns Display name for category
 */
export function getCategoryDisplayName(category?: NodeCategory): string {
    switch (category) {
        case 'role':
            return 'Vai trò';
        case 'skill':
            return 'Kỹ năng';
        default:
            return 'Chủ đề';
    }
}

/**
 * Get node category icon
 * 
 * @param category - Node category
 * @returns Icon emoji for category
 */
export function getCategoryIcon(category?: NodeCategory): string {
    switch (category) {
        case 'role':
            return '👤';
        case 'skill':
            return '🎯';
        default:
            return '📌';
    }
}

/**
 * Validate node navigation data
 * 
 * @param nodeData - Node data to validate
 * @returns Validation errors or null if valid
 */
export function validateNodeNavigation(nodeData: NodeData): string | null {
    const { category, targetRoadmapId, targetArticleId } = nodeData;

    if (category === 'role' && !targetRoadmapId) {
        return 'Role node phải có targetRoadmapId';
    }

    if (category === 'skill' && !targetArticleId) {
        return 'Skill node phải có targetArticleId';
    }

    return null;
}
