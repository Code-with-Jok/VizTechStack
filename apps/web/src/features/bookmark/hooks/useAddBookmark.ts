/**
 * useAddBookmark Hook
 * 
 * Custom hook for adding roadmap bookmarks.
 * 
 * Features:
 * - Adds bookmark via GraphQL mutation
 * - Optimistic UI updates for instant feedback
 * - Automatically updates Apollo cache
 * - Provides callback for bookmark changes
 * 
 * @returns Mutation function, loading state, and error
 */
'use client';

import { gql, useMutation } from '@apollo/client';
import { useUser } from '@clerk/nextjs';
import type { Bookmark, UseAddBookmarkOptions } from '../types';

const ADD_BOOKMARK = gql`
  mutation AddBookmark($roadmapId: ID!) {
    addBookmark(roadmapId: $roadmapId) {
      id
      userId
      roadmapId
    }
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

export function useAddBookmark({ onCompleted }: UseAddBookmarkOptions = {}) {
    const { user } = useUser();

    const [addBookmarkMutation, { loading, error }] = useMutation(ADD_BOOKMARK, {
        update(cache, { data }) {
            if (!data?.addBookmark) return;

            // Read existing bookmarks from cache
            const existingData = cache.readQuery<{
                getUserBookmarks: Bookmark[];
            }>({
                query: GET_USER_BOOKMARKS,
            });

            if (!existingData) return;

            // Add the new bookmark to cache
            cache.writeQuery({
                query: GET_USER_BOOKMARKS,
                data: {
                    getUserBookmarks: [
                        ...existingData.getUserBookmarks,
                        data.addBookmark,
                    ],
                },
            });
        },
        onCompleted,
        onError(error) {
            console.error('Failed to add bookmark:', error);
        },
    });

    const addBookmark = async (roadmapId: string) => {
        if (!user) {
            console.warn('User must be authenticated to add bookmarks');
            return;
        }

        try {
            await addBookmarkMutation({
                variables: { roadmapId },
                optimisticResponse: {
                    addBookmark: {
                        __typename: 'Bookmark',
                        id: `temp-${Date.now()}`,
                        userId: user.id,
                        roadmapId,
                    },
                },
            });
        } catch (error) {
            console.error('Error adding bookmark:', error);
        }
    };

    return {
        addBookmark,
        loading,
        error,
    };
}
