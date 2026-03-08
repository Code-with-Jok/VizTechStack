/**
 * BookmarkedRoadmapsList Component
 * 
 * Displays a list of roadmaps bookmarked by the authenticated user.
 * 
 * Features:
 * - Queries user bookmarks via GraphQL
 * - Fetches roadmap summaries for bookmarked roadmaps
 * - Displays roadmap cards with bookmark button
 * - Reuses RoadmapCard component for consistent UI
 * - Shows loading and error states
 * - Shows empty state when no bookmarks exist
 * - Only accessible to authenticated users
 * 
 * Usage:
 * ```tsx
 * import { BookmarkedRoadmapsList } from '@/features/bookmark/components/BookmarkedRoadmapsList';
 * 
 * function BookmarksPage() {
 *   return (
 *     <div>
 *       <h1>My Bookmarks</h1>
 *       <BookmarkedRoadmapsList />
 *     </div>
 *   );
 * }
 * ```
 * 
 * Note: This component uses a workaround to fetch roadmap data for each bookmark.
 * In production, the backend should be modified to return roadmap summaries
 * directly in the getUserBookmarks query to avoid N+1 query problems.
 */
'use client';

import { useUser } from '@clerk/nextjs';
import { RoadmapCard } from '@/features/roadmap/components/RoadmapCard';
import { BookmarkButton } from './BookmarkButton';
import { BookmarkX } from 'lucide-react';
import { useBookmarks } from '../hooks';

export function BookmarkedRoadmapsList() {
    const { isSignedIn } = useUser();

    const { bookmarkedRoadmaps, loading, error } = useBookmarks(!isSignedIn);
    // Show sign-in prompt if not authenticated
    if (!isSignedIn) {
        return (
            <div className="flex flex-col items-center justify-center py-12 px-4">
                <BookmarkX className="w-16 h-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Sign in to view bookmarks
                </h3>
                <p className="text-sm text-gray-600 text-center max-w-md">
                    You need to be signed in to bookmark roadmaps and view your saved learning paths.
                </p>
            </div>
        );
    }

    // Loading state
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="h-64 bg-gray-100 rounded-lg animate-pulse"
                    />
                ))}
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-red-600 mb-2">
                        Error loading bookmarks
                    </h3>
                    <p className="text-sm text-gray-600">{error.message}</p>
                </div>
            </div>
        );
    }

    const bookmarks = bookmarkedRoadmaps || [];

    // Empty state
    if (bookmarks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 px-4">
                <BookmarkX className="w-16 h-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No bookmarks yet
                </h3>
                <p className="text-sm text-gray-600 text-center max-w-md">
                    Start exploring roadmaps and bookmark the ones you want to learn.
                    Your bookmarked roadmaps will appear here.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                    My Bookmarks
                </h2>
                <p className="text-sm text-gray-600">
                    {bookmarks.length} {bookmarks.length === 1 ? 'roadmap' : 'roadmaps'}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookmarks.map((roadmap) => (
                    <div key={roadmap.id} className="relative">
                        <RoadmapCard roadmap={roadmap} />
                        <div className="absolute top-4 right-4 z-10">
                            <BookmarkButton
                                roadmapId={roadmap.id}
                                isBookmarked={true}
                                variant="icon"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
