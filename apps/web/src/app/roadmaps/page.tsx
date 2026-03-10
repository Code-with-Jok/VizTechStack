import { Suspense } from 'react';
import { RoadmapList } from '@/components/roadmap/roadmap-list';

/**
 * Public Roadmaps Page
 * 
 * This page displays all available technology roadmaps in a public listing.
 * Accessible to all users (guests, users, and admins).
 * 
 * Features:
 * - SEO-friendly heading structure
 * - Descriptive text about roadmaps
 * - Suspense boundary for loading states
 * - Responsive container layout
 * - Uses RoadmapList component for data fetching and display
 * 
 * Layout:
 * - Container with max-width and padding
 * - Header section with title and description
 * - RoadmapList wrapped in Suspense with fallback
 */
export default function RoadmapsPage() {
    return (
        <div className="container mx-auto max-w-5xl px-4 py-8">
            {/* Header section with title and description */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold tracking-tight">Technology Roadmaps</h1>
                <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
                    Explore curated learning paths for modern technologies
                </p>
            </div>

            {/* RoadmapList with Suspense boundary for loading state */}
            <Suspense fallback={<div>Loading roadmaps...</div>}>
                <RoadmapList />
            </Suspense>
        </div>
    );
}