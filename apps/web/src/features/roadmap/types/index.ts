/**
 * Roadmap Types
 *
 * Export all roadmap-related type definitions
 */

export type {
    RoadmapNodeData,
    RoadmapItem,
} from './roadmap.types';

// Re-export progress types for backward compatibility
export type { ProgressStatus, ProgressStatusConfig } from '@/features/progress/types';
export { progressStatusConfig } from '@/features/progress/types';
