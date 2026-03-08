/**
 * useUpdateProgress Hook
 * 
 * Custom hook for updating user progress on roadmap nodes.
 * 
 * Features:
 * - Updates progress status via GraphQL mutation
 * - Optimistic UI updates for instant feedback
 * - Automatically updates Apollo cache
 * - Provides callback for status changes
 * 
 * @returns Mutation function, loading state, and error
 */
'use client';

import { useCallback } from 'react';
import { gql, useMutation } from '@apollo/client';
import { useUser } from '@clerk/nextjs';
import type { ProgressStatus } from '../types';

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

interface UpdateProgressOptions {
    roadmapId: string;
    onStatusChange?: (status: ProgressStatus) => void;
}

export function useUpdateProgress({ roadmapId, onStatusChange }: UpdateProgressOptions) {
    const { user } = useUser();

    const [updateProgressMutation, { loading, error }] = useMutation(UPDATE_PROGRESS, {
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
                            (p) => p.nodeId !== data.updateProgress.nodeId
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

    const updateProgress = useCallback(
        async (nodeId: string, status: ProgressStatus) => {
            if (!user) {
                console.warn('User must be authenticated to update progress');
                return;
            }

            try {
                await updateProgressMutation({
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
        [user, updateProgressMutation, roadmapId, onStatusChange]
    );

    return {
        updateProgress,
        loading,
        error,
    };
}
