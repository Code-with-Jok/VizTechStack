/**
 * useBookmarks Hook
 * 
 * Custom hook for fetching user bookmarks and associated roadmap data.
 * 
 * Features:
 * - Fetches user bookmarks via GraphQL
 * - Fetches roadmap summaries for bookmarked roadmaps
 * - Returns filtered list of bookmarked roadmaps
 * - Handles loading and error states
 * 
 * Note: This uses a workaround to fetch roadmap data for each bookmark.
 * In production, the backend should return roadmap summaries directly
 * in the getUserBookmarks query to avoid N+1 query problems.
 * 
 * @returns Bookmarked roadmaps, loading state, and error
 */
'use client';

import { useMemo } from 'react';
import { gql, useQuery } from '@apollo/client';
import type { Bookmark, RoadmapSummary } from '../types';

const GET_USER_BOOKMARKS = gql`
  query GetUserBookmarks {
    getUserBookmarks {
      id
      userId
      roadmapId
    }
  }
`;

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
      }
      nextCursor
      isDone
    }
  }
`;

export function useBookmarks(skip = false) {
  const { data: bookmarksData, loading: bookmarksLoading, error: bookmarksError } = useQuery<{
    getUserBookmarks: Bookmark[]
  }>(
    GET_USER_BOOKMARKS,
    {
      skip,
      fetchPolicy: 'cache-and-network',
    }
  );

  // Fetch all roadmaps to match with bookmarks
  // Note: This is a workaround. Ideally, getUserBookmarks should return roadmap summaries.
  const { data: roadmapsData, loading: roadmapsLoading } = useQuery<{
    listRoadmaps: {
      items: RoadmapSummary[];
    };
  }>(
    LIST_ROADMAPS,
    {
      variables: {
        pagination: { limit: 100 }, // Fetch enough to cover bookmarks
      },
      skip: skip || !bookmarksData?.getUserBookmarks,
      fetchPolicy: 'cache-and-network',
    }
  );

  const loading = bookmarksLoading || roadmapsLoading;
  const error = bookmarksError;

  const bookmarks = bookmarksData?.getUserBookmarks || [];
  const allRoadmaps = roadmapsData?.listRoadmaps.items || [];

  // Filter roadmaps to only show bookmarked ones
  const bookmarkedRoadmaps = useMemo(() => {
    const bookmarkedRoadmapIds = new Set(bookmarks.map(b => b.roadmapId));
    return allRoadmaps.filter(roadmap => bookmarkedRoadmapIds.has(roadmap.id));
  }, [bookmarks, allRoadmaps]);

  return {
    bookmarks,
    bookmarkedRoadmaps,
    loading,
    error,
  };
}
