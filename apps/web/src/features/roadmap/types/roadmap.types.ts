/**
 * Roadmap Feature Types
 * 
 * Shared TypeScript types and interfaces for the roadmap feature.
 * These types are used across components and hooks.
 */

import { RoadmapCategory, RoadmapDifficulty, RoadmapStatus } from '@viztechstack/graphql-generated';
import type { ProgressStatus } from '@/features/progress/types';

/**
 * Node data structure matching GraphQL schema
 * Used by React Flow nodes in roadmap visualization
 */
export interface RoadmapNodeData {
    label: string;
    topicId?: string;
    isReusedSkillNode?: boolean;
    originalRoadmapId?: string;
    progressStatus?: ProgressStatus;
}

/**
 * Roadmap item structure for list views
 * Represents a roadmap in list/grid displays
 */
export interface RoadmapItem {
    id: string;
    slug: string;
    title: string;
    description: string;
    category: RoadmapCategory;
    difficulty: RoadmapDifficulty;
    topicCount: number;
    status: RoadmapStatus;
    createdAt: number;
}
