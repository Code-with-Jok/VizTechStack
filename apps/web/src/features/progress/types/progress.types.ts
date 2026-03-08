/**
 * Progress Feature Types
 * 
 * Shared TypeScript types and interfaces for the progress tracking feature.
 * These types are used across components and hooks.
 */

/**
 * Progress status type matching GraphQL enum
 */
export type ProgressStatus = 'DONE' | 'IN_PROGRESS' | 'SKIPPED';

/**
 * Progress status configuration for styling
 * Maps progress status to visual properties
 */
export interface ProgressStatusConfig {
    borderColor: string;
    badgeColor: string;
    label: string;
}

/**
 * Progress status configuration map
 * Used for consistent styling across the application
 */
export const progressStatusConfig: Record<ProgressStatus, ProgressStatusConfig> = {
    DONE: {
        borderColor: 'border-green-500',
        badgeColor: 'bg-green-500',
        label: 'Done',
    },
    IN_PROGRESS: {
        borderColor: 'border-yellow-500',
        badgeColor: 'bg-yellow-500',
        label: 'In Progress',
    },
    SKIPPED: {
        borderColor: 'border-gray-400',
        badgeColor: 'bg-gray-400',
        label: 'Skipped',
    },
} as const;
