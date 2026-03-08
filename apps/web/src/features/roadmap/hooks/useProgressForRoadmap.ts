/**
 * useProgressForRoadmap Hook
 * 
 * Custom hook for fetching user progress for a specific roadmap.
 * 
 * Features:
 * - Fetches all progress entries for a roadmap
 * - Only queries when user is authenticated
 * - Returns a map of nodeId -> progress status for quick lookup
 * - Cache-and-network fetch policy for fresh data
 * 
 * @param roadmapId - The roadmap ID to fetch progress for
 * @param skip - Whether to skip the query (default: false)
 * @returns Query result with progress data and progress map
 */
'use client';

import { useMemo } from 'react';
import { gql, useQuery } from '@apollo/client';
import type { ProgressStatus } from '../types';

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

export function useProgressForRoadmap(roadmapId: string, skip = false) {
    const { data, loading, error } = useQuery(GET_PROGRESS_FOR_ROADMAP, {
        variables: { roadmapId },
        skip,
        fetchPolicy: 'cache-and-network',
    });

    // Create a map of nodeId -> progress status for quick lookup
    const progressMap = useMemo(() => {
        const map = new Map<string, ProgressStatus>();
        if (data?.getProgressForRoadmap) {
            data.getProgressForRoadmap.forEach((progress: {
                nodeId: string;
                status: ProgressStatus;
            }) => {
                map.set(progress.nodeId, progress.status);
            });
        }
        return map;
    }, [data]);

    return {
        progressData: data?.getProgressForRoadmap ?? [],
        progressMap,
        loading,
        error,
    };
}
