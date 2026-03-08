/**
 * useToggleBookmark Hook
 * 
 * Combined hook for toggling bookmark state (add/remove).
 * 
 * Features:
 * - Combines add and remove bookmark functionality
 * - Single function to toggle bookmark state
 * - Optimistic UI updates for instant feedback
 * - Automatically updates Apollo cache
 * - Provides callback for bookmark changes
 * 
 * @returns Toggle function, loading state, and error
 */
'use client';

import { useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { useAddBookmark } from './useAddBookmark';
import { useRemoveBookmark } from './useRemoveBookmark';
import type { UseToggleBookmarkOptions } from '../types';

export function useToggleBookmark({ onBookmarkChange }: UseToggleBookmarkOptions = {}) {
    const { isSignedIn, user } = useUser();

    const { addBookmark, loading: addLoading } = useAddBookmark({
        onCompleted: () => {
            if (onBookmarkChange) {
                onBookmarkChange(true);
            }
        },
    });

    const { removeBookmark, loading: removeLoading } = useRemoveBookmark({
        onCompleted: () => {
            if (onBookmarkChange) {
                onBookmarkChange(false);
            }
        },
    });

    const toggleBookmark = useCallback(
        async (roadmapId: string, isBookmarked: boolean, e?: React.MouseEvent) => {
            // Prevent event bubbling (e.g., if button is inside a clickable card)
            if (e) {
                e.stopPropagation();
                e.preventDefault();
            }

            if (!isSignedIn || !user) {
                console.warn('User must be authenticated to bookmark roadmaps');
                return;
            }

            try {
                if (isBookmarked) {
                    await removeBookmark(roadmapId);
                } else {
                    await addBookmark(roadmapId);
                }
            } catch (error) {
                console.error('Error toggling bookmark:', error);
            }
        },
        [isSignedIn, user, addBookmark, removeBookmark]
    );

    return {
        toggleBookmark,
        loading: addLoading || removeLoading,
        isSignedIn,
    };
}
