/**
 * ProgressTracker Component
 * 
 * Manages user progress tracking for roadmap nodes.
 * 
 * Features:
 * - Queries user progress for a roadmap using GraphQL
 * - Displays status buttons (Done, In Progress, Skipped)
 * - Updates progress via GraphQL mutation
 * - Updates Apollo cache after mutation for instant UI updates
 * - Only visible to authenticated users
 * - Optimistic UI updates for better UX
 * 
 * Usage:
 * ```tsx
 * import { ProgressTracker } from '@/components/roadmap/ProgressTracker';
 * 
 * function RoadmapPage() {
 *   return (
 *     <ProgressTracker 
 *       roadmapId="roadmap-123" 
 *       nodeId="node-456"
 *       currentStatus="IN_PROGRESS"
 *     />
 *   );
 * }
 * ```
 * 
 * @param roadmapId - The roadmap ID
 * @param nodeId - The node ID to track progress for
 * @param currentStatus - The current progress status (optional)
 */
'use client';

import { useCallback } from 'react';
import { gql, useMutation } from '@apollo/client';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import type { ProgressStatus } from '@/components/roadmap/RoadmapNode';

const UPDATE_PROGRESS = gql`
  mutation UpdateProgress($input: UpdateProgressInput!) {
    updateProgress(input: $input) {
      id
      userId
      roadmapId
      nodeId
      status
    }
  }
`;

const GET_PROGRESS_FOR_ROADMAP = gql`
  query GetProgressForRoadmap($roadmapId: ID!) {
    getProgressForRoadmap(roadmapId: $roadmapId) {
      id
      userId
      roadmapId
      nodeId
      status
    }
  }
`;

interface ProgressTrackerProps {
    roadmapId: string;
    nodeId: string;
    currentStatus?: ProgressStatus;
    onStatusChange?: (status: ProgressStatus) => void;
}

/**
 * Status button configuration
 */
const statusButtons = [
    {
        status: 'DONE' as ProgressStatus,
        label: 'Done',
        icon: CheckCircle2,
        variant: 'default' as const,
        activeClass: 'bg-green-600 hover:bg-green-700 text-white',
        inactiveClass: 'bg-white hover:bg-green-50 text-green-600 border-green-600',
    },
    {
        status: 'IN_PROGRESS' as ProgressStatus,
        label: 'In Progress',
        icon: Clock,
        variant: 'default' as const,
        activeClass: 'bg-yellow-600 hover:bg-yellow-700 text-white',
        inactiveClass: 'bg-white hover:bg-yellow-50 text-yellow-600 border-yellow-600',
    },
    {
        status: 'SKIPPED' as ProgressStatus,
        label: 'Skipped',
        icon: XCircle,
        variant: 'default' as const,
        activeClass: 'bg-gray-600 hover:bg-gray-700 text-white',
        inactiveClass: 'bg-white hover:bg-gray-50 text-gray-600 border-gray-600',
    },
] as const;

export function ProgressTracker({
    roadmapId,
    nodeId,
    currentStatus,
    onStatusChange,
}: ProgressTrackerProps) {
    const { isSignedIn, user } = useUser();

    const [updateProgress, { loading }] = useMutation(UPDATE_PROGRESS, {
        // Update the cache after mutation
        update(cache, { data }) {
            if (!data?.updateProgress) return;

            // Read the existing progress data from cache
            const existingData = cache.readQuery<{
                getProgressForRoadmap: Array<{
                    id: string;
                    userId: string;
                    roadmapId: string;
                    nodeId: string;
                    status: ProgressStatus;
                }>;
            }>({
                query: GET_PROGRESS_FOR_ROADMAP,
                variables: { roadmapId },
            });

            if (!existingData) return;

            // Update the cache with the new progress
            cache.writeQuery({
                query: GET_PROGRESS_FOR_ROADMAP,
                variables: { roadmapId },
                data: {
                    getProgressForRoadmap: [
                        // Filter out the old progress for this node
                        ...(existingData.getProgressForRoadmap || []).filter(
                            (p) => p.nodeId !== nodeId
                        ),
                        // Add the updated progress
                        data.updateProgress,
                    ],
                },
            });
        },
        onError(error) {
            console.error('Failed to update progress:', error);
        },
    });

    const handleStatusClick = useCallback(
        async (status: ProgressStatus) => {
            if (!isSignedIn || !user) {
                console.warn('User must be authenticated to update progress');
                return;
            }

            try {
                await updateProgress({
                    variables: {
                        input: {
                            roadmapId,
                            nodeId,
                            status,
                        },
                    },
                    // Optimistic response for instant UI update
                    optimisticResponse: {
                        updateProgress: {
                            __typename: 'Progress',
                            id: `temp-${Date.now()}`,
                            userId: user.id,
                            roadmapId,
                            nodeId,
                            status,
                        },
                    },
                });

                // Call the optional callback
                if (onStatusChange) {
                    onStatusChange(status);
                }
            } catch (error) {
                console.error('Error updating progress:', error);
            }
        },
        [isSignedIn, user, updateProgress, roadmapId, nodeId, onStatusChange]
    );

    // Don't render if user is not authenticated
    if (!isSignedIn) {
        return null;
    }

    return (
        <div className="flex flex-col gap-3">
            <div className="text-sm font-semibold text-gray-700">
                Track your progress:
            </div>
            <div className="flex flex-wrap gap-2">
                {statusButtons.map(({ status, label, icon: Icon, activeClass, inactiveClass }) => {
                    const isActive = currentStatus === status;
                    const buttonClass = isActive ? activeClass : inactiveClass;

                    return (
                        <Button
                            key={status}
                            onClick={() => handleStatusClick(status)}
                            disabled={loading}
                            className={`
                                ${buttonClass}
                                border-2 transition-all duration-200
                                disabled:opacity-50 disabled:cursor-not-allowed
                                flex items-center gap-2
                            `}
                            size="sm"
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                        </Button>
                    );
                })}
            </div>
            {loading && (
                <div className="text-xs text-gray-500 animate-pulse">
                    Updating progress...
                </div>
            )}
        </div>
    );
}
