import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { BookmarkedRoadmapsList } from '@/components/roadmap/BookmarkedRoadmapsList';

export const metadata: Metadata = {
    title: 'My Bookmarks | VizTechStack',
    description: 'View your bookmarked roadmaps',
    openGraph: {
        title: 'My Bookmarks | VizTechStack',
        description: 'View your bookmarked roadmaps',
        type: 'website',
    },
};

// Disable static generation for authenticated pages
export const dynamic = 'force-dynamic';

export default async function BookmarksPage() {
    // Check authentication
    const { userId } = await auth();

    if (!userId) {
        redirect('/sign-in');
    }

    return (
        <main className="container mx-auto px-4 py-8">
            <div className="space-y-6">
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold">My Bookmarks</h1>
                    <p className="text-gray-600">
                        Roadmaps you&apos;ve saved for quick access
                    </p>
                </div>

                {/* Bookmarked Roadmaps List */}
                <BookmarkedRoadmapsList />
            </div>
        </main>
    );
}
