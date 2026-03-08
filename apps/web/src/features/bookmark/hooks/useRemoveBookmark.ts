/**
 * useRemoveBookmark Hook
 * 
 * Custom hook for removing roadmap bookmarks.
 * 
 * Features:
 * - Removes bookmark via GraphQL mutation
 * - Optimistic UI updates for instant feedback
 * - Automatically updates Apollo cache
 * - Provides callback for bookmark changes
 * 
 * @returns Mutation function, loading state, and error
 */
'use client';

import { gql, useMutation } from '@apollo/client';
import type { Bookmark, UseRemoveBookmarkOptions } from '../types';

const REMOVE_BOOKMARK = gql`
  mutation RemoveBookmark($roadmapId: ID!) {
    removeBookmark(roadmapId: $roadmapId)
  }
`;

const GET_USER_BOOKMARKS = gql`
  query GetUserBookmarks {
    getUserBookmarks {
      id
      userId
      roadmapId
    }
  }
`;

export function useRemoveBookmark({ onCompleted }: UseRemoveBookmarkOptions = {}) {
    const [removeBookmarkMutation, { loading, error }] = useMutation(REMOVE_BOOKMARK, {
        update(cache, { data }, { variables }) {
            if (!data?.removeBookmark || !variables) return;

            const roadmapId = variables.roadmapId;

            // Read existing bookmarks from cache
            const existingData = cache.readQuery<{
                getUserBookmarks: Bookmark[];
            }>({
                query: GET_USER_BOOKMARKS,
            });

            if (!existingData) return;

            // Remove the bookmark from cache
            cache.writeQuery({
                query: GET_USER_BOOKMARKS,
                data: {
                    getUserBookmarks: existingData.getUserBookmarks.filter(
                        (bookmark) => bookmark.roadmapId !== roadmapId
                    ),
                },
            });
        },
        onCompleted,
        onError(error) {
            console.error('Failed to remove bookmark:', error);
        },
    });

    const removeBookmark = async (roadmapId: string) => {
        try {
            await removeBookmarkMutation({
                variables: { roadmapId },
                optimisticResponse: {
                    removeBookmark: true,
                },
            });
        } catch (error) {
            console.error('Error removing bookmark:', error);
        }
    };

    return {
        removeBookmark,
        loading,
        error,
    };
}
