/**
 * BookmarkButton Component
 * 
 * Manages roadmap bookmarking for authenticated users.
 * 
 * Features:
 * - Adds/removes bookmarks via GraphQL mutations
 * - Toggles bookmark state with visual feedback
 * - Shows bookmarked state with filled/outlined icon
 * - Only visible to authenticated users
 * - Optimistic UI updates for instant feedback
 * - Updates Apollo cache after mutations
 * 
 * Usage:
 * ```tsx
 * import { BookmarkButton } from '@/components/roadmap/BookmarkButton';
 * 
 * function RoadmapCard({ roadmap }) {
 *   return (
 *     <div>
 *       <h3>{roadmap.title}</h3>
 *       <BookmarkButton 
 *         roadmapId={roadmap.id} 
 *         isBookmarked={false}
 *       />
 *     </div>
 *   );
 * }
 * ```
 * 
 * @param roadmapId - The roadmap ID to bookmark
 * @param isBookmarked - Whether the roadmap is currently bookmarked
 * @param onBookmarkChange - Optional callback when bookmark state changes
 */
'use client';

import { useCallback } from 'react';
import { gql, useMutation } from '@apollo/client';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck } from 'lucide-react';

const ADD_BOOKMARK = gql`
  mutation AddBookmark($roadmapId: ID!) {
    addBookmark(roadmapId: $roadmapId) {
      id
      userId
      roadmapId
    }
  }
`;

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

interface BookmarkButtonProps {
    roadmapId: string;
    isBookmarked?: boolean;
    onBookmarkChange?: (isBookmarked: boolean) => void;
    variant?: 'default' | 'icon';
    size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function BookmarkButton({
    roadmapId,
    isBookmarked = false,
    onBookmarkChange,
    variant = 'default',
    size = 'default',
}: BookmarkButtonProps) {
    const { isSignedIn, user } = useUser();

    const [addBookmark, { loading: addLoading }] = useMutation(ADD_BOOKMARK, {
        update(cache, { data }) {
            if (!data?.addBookmark) return;

            // Read existing bookmarks from cache
            const existingData = cache.readQuery<{
                getUserBookmarks: Array<{
                    id: string;
                    userId: string;
                    roadmapId: string;
                }>;
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
        onCompleted() {
            if (onBookmarkChange) {
                onBookmarkChange(true);
            }
        },
        onError(error) {
            console.error('Failed to add bookmark:', error);
        },
    });

    const [removeBookmark, { loading: removeLoading }] = useMutation(REMOVE_BOOKMARK, {
        update(cache) {
            // Read existing bookmarks from cache
            const existingData = cache.readQuery<{
                getUserBookmarks: Array<{
                    id: string;
                    userId: string;
                    roadmapId: string;
                }>;
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
        onCompleted() {
            if (onBookmarkChange) {
                onBookmarkChange(false);
            }
        },
        onError(error) {
            console.error('Failed to remove bookmark:', error);
        },
    });

    const handleToggleBookmark = useCallback(
        async (e: React.MouseEvent) => {
            // Prevent event bubbling (e.g., if button is inside a clickable card)
            e.stopPropagation();
            e.preventDefault();

            if (!isSignedIn || !user) {
                console.warn('User must be authenticated to bookmark roadmaps');
                return;
            }

            try {
                if (isBookmarked) {
                    await removeBookmark({
                        variables: { roadmapId },
                        optimisticResponse: {
                            removeBookmark: true,
                        },
                    });
                } else {
                    await addBookmark({
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
                }
            } catch (error) {
                console.error('Error toggling bookmark:', error);
            }
        },
        [isSignedIn, user, isBookmarked, roadmapId, addBookmark, removeBookmark]
    );

    // Don't render if user is not authenticated
    if (!isSignedIn) {
        return null;
    }

    const loading = addLoading || removeLoading;

    if (variant === 'icon') {
        return (
            <Button
                onClick={handleToggleBookmark}
                disabled={loading}
                size={size}
                variant="ghost"
                className="transition-all duration-200"
                title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
            >
                {isBookmarked ? (
                    <BookmarkCheck className="w-5 h-5 text-yellow-600 fill-yellow-600" />
                ) : (
                    <Bookmark className="w-5 h-5 text-gray-600 hover:text-yellow-600" />
                )}
            </Button>
        );
    }

    return (
        <Button
            onClick={handleToggleBookmark}
            disabled={loading}
            size={size}
            variant={isBookmarked ? 'default' : 'outline'}
            className={`
                transition-all duration-200
                ${isBookmarked
                    ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                    : 'border-yellow-600 text-yellow-600 hover:bg-yellow-50'
                }
            `}
        >
            {isBookmarked ? (
                <>
                    <BookmarkCheck className="w-4 h-4 mr-2" />
                    Bookmarked
                </>
            ) : (
                <>
                    <Bookmark className="w-4 h-4 mr-2" />
                    Bookmark
                </>
            )}
        </Button>
    );
}
