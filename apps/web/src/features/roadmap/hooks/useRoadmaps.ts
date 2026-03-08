/**
 * useRoadmaps Hook
 * 
 * Custom hook for fetching and managing roadmap lists with filtering and pagination.
 * 
 * Features:
 * - Fetches roadmaps with optional category filter
 * - Supports pagination with cursor-based loading
 * - Provides loadMore function for infinite scroll
 * - Cache-and-network fetch policy for fresh data
 * 
 * @param filters - Optional filters (category)
 * @param limit - Number of items per page (default: 24)
 * @returns Query result with roadmaps, loading state, error, and loadMore function
 */
'use client';

import { gql, useQuery } from '@apollo/client';
import { RoadmapCategory } from '@viztechstack/graphql-generated';
import type { RoadmapItem } from '../types';

const LIST_ROADMAPS = gql`
  query ListRoadmaps($filters: RoadmapFilters, $pagination: PaginationInput) {
    listRoadmaps(filters: $filters, pagination: $pagination) {
      items {
        id
        slug
        title
        description
        category
        difficulty
        topicCount
        status
        createdAt
      }
      nextCursor
      isDone
    }
  }
`;

interface UseRoadmapsOptions {
    category?: RoadmapCategory | null;
    limit?: number;
}

export function useRoadmaps({ category = null, limit = 24 }: UseRoadmapsOptions = {}) {
    const { data, loading, error, fetchMore } = useQuery<{
        listRoadmaps: {
            items: RoadmapItem[];
            nextCursor?: string;
            isDone: boolean;
        };
    }>(LIST_ROADMAPS, {
        variables: {
            filters: category ? { category } : undefined,
            pagination: { limit },
        },
        fetchPolicy: 'cache-and-network',
    });

    const roadmaps = data?.listRoadmaps?.items ?? [];
    const nextCursor = data?.listRoadmaps?.nextCursor;
    const isDone = data?.listRoadmaps?.isDone ?? true;

    const loadMore = async () => {
        if (!nextCursor || isDone) return;

        await fetchMore({
            variables: {
                filters: category ? { category } : undefined,
                pagination: {
                    limit,
                    cursor: nextCursor,
                },
            },
            updateQuery: (prev, { fetchMoreResult }) => {
                if (!fetchMoreResult) return prev;

                return {
                    listRoadmaps: {
                        ...fetchMoreResult.listRoadmaps,
                        items: [
                            ...(prev.listRoadmaps?.items ?? []),
                            ...(fetchMoreResult.listRoadmaps?.items ?? []),
                        ],
                    },
                };
            },
        });
    };

    return {
        roadmaps,
        loading,
        error,
        nextCursor,
        isDone,
        loadMore,
    };
}
