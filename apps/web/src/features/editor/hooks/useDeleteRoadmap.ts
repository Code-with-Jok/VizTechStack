/**
 * useDeleteRoadmap Hook
 * 
 * Custom hook for deleting roadmaps (admin only).
 * 
 * Features:
 * - Deletes roadmap via API client
 * - Manages loading and error states
 * - Provides callback for successful deletion
 * 
 * @returns Delete function, loading state, and error
 */
'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { deleteRoadmapClient } from '@/lib/api-client/roadmaps';
import type { UseDeleteRoadmapOptions } from '../types';

export function useDeleteRoadmap({ onCompleted, onError }: UseDeleteRoadmapOptions = {}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const { getToken } = useAuth();

    const deleteRoadmap = useCallback(
        async (roadmapId: string) => {
            try {
                setLoading(true);
                setError(null);

                const token = await getToken();
                await deleteRoadmapClient(roadmapId, token ?? undefined);

                if (onCompleted) {
                    onCompleted();
                }
            } catch (err) {
                const error = err instanceof Error ? err : new Error('Failed to delete roadmap');
                setError(error);

                if (onError) {
                    onError(error);
                } else {
                    console.error('Failed to delete roadmap:', error);
                }
            } finally {
                setLoading(false);
            }
        },
        [getToken, onCompleted, onError]
    );

    return {
        deleteRoadmap,
        loading,
        error,
    };
}
