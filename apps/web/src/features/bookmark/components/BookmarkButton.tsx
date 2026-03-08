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
 * import { BookmarkButton } from '@/features/bookmark/components/BookmarkButton';
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

import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useToggleBookmark } from '../hooks';
import type { BookmarkButtonProps } from '../types';

export function BookmarkButton({
    roadmapId,
    isBookmarked = false,
    onBookmarkChange,
    variant = 'default',
    size = 'default',
}: BookmarkButtonProps) {
    const { toggleBookmark, loading, isSignedIn } = useToggleBookmark({
        onBookmarkChange,
    });

    const handleToggleBookmark = (e: React.MouseEvent) => {
        toggleBookmark(roadmapId, isBookmarked, e);
    };

    // Don't render if user is not authenticated
    if (!isSignedIn) {
        return null;
    }

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
