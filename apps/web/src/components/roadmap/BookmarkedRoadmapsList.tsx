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
 * import { BookmarkedRoadmapsList } from '@/components/roadmap/BookmarkedRoadmapsList';
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

import { gql, useQuery } from '@apollo/client';
import { useUser } from '@clerk/nextjs';
import { RoadmapCategory, RoadmapDifficulty } from '@viztechstack/graphql-generated';
import { RoadmapCard } from './RoadmapCard';
import { BookmarkButton } from './BookmarkButton';
import { BookmarkX } from 'lucide-react';

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

interface Bookmark {
    id: string;
    userId: string;
    roadmapId: string;
}

interface RoadmapSummary {
    id: string;
    slug: string;
    title: string;
    description: string;
    category: RoadmapCategory;
    difficulty: RoadmapDifficulty;
    topicCount: number;
}

export function BookmarkedRoadmapsList() {
    const { isSignedIn } = useUser();

    const { data: bookmarksData, loading: bookmarksLoading, error: bookmarksError } = useQuery<{
        getUserBookmarks: Bookmark[]
    }>(
        GET_USER_BOOKMARKS,
        {
            skip: !isSignedIn,
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
            skip: !isSignedIn || !bookmarksData?.getUserBookmarks,
            fetchPolicy: 'cache-and-network',
        }
    );

    const loading = bookmarksLoading || roadmapsLoading;
    const error = bookmarksError;

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

    const bookmarks = bookmarksData?.getUserBookmarks || [];
    const allRoadmaps = roadmapsData?.listRoadmaps.items || [];

    // Filter roadmaps to only show bookmarked ones
    const bookmarkedRoadmapIds = new Set(bookmarks.map(b => b.roadmapId));
    const bookmarkedRoadmaps = allRoadmaps.filter(roadmap =>
        bookmarkedRoadmapIds.has(roadmap.id)
    );

    // Empty state
    if (bookmarkedRoadmaps.length === 0) {
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
                    {bookmarkedRoadmaps.length} {bookmarkedRoadmaps.length === 1 ? 'roadmap' : 'roadmaps'}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookmarkedRoadmaps.map((roadmap) => (
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
