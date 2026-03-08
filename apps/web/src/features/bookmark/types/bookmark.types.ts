/**
 * Bookmark Types
 *
 * Shared type definitions for the bookmark feature.
 */

import type { RoadmapCategory, RoadmapDifficulty } from '@viztechstack/graphql-generated';

/**
 * Bookmark entity representing a user's saved roadmap
 */
export interface Bookmark {
    id: string;
    userId: string;
    roadmapId: string;
}

/**
 * Roadmap summary data used in bookmark displays
 */
export interface RoadmapSummary {
    id: string;
    slug: string;
    title: string;
    description: string;
    category: RoadmapCategory;
    difficulty: RoadmapDifficulty;
    topicCount: number;
}

/**
 * Options for useAddBookmark hook
 */
export interface UseAddBookmarkOptions {
    onCompleted?: () => void;
}

/**
 * Options for useRemoveBookmark hook
 */
export interface UseRemoveBookmarkOptions {
    onCompleted?: () => void;
}

/**
 * Options for useToggleBookmark hook
 */
export interface UseToggleBookmarkOptions {
    onBookmarkChange?: (isBookmarked: boolean) => void;
}

/**
 * Props for BookmarkButton component
 */
export interface BookmarkButtonProps {
    roadmapId: string;
    isBookmarked?: boolean;
    onBookmarkChange?: (isBookmarked: boolean) => void;
    variant?: 'default' | 'icon';
    size?: 'default' | 'sm' | 'lg' | 'icon';
}
