import { Suspense } from 'react';
import { RoadmapDetail } from '@/components/roadmap/roadmap-detail';

/**
 * Dynamic route page for displaying individual roadmap details
 * 
 * Route: /roadmaps/[slug]
 * 
 * Features:
 * - Extracts slug from URL params (async in Next.js 15+)
 * - Renders RoadmapDetail component within Suspense boundary
 * - Provides fallback loading state while component loads
 * - Public page accessible to all users (guests, users, admins)
 * - Container layout consistent with roadmaps listing page
 * - Responsive design with proper spacing
 * 
 * Usage:
 * - /roadmaps/react-fundamentals -> displays React Fundamentals roadmap
 * - /roadmaps/invalid-slug -> shows "Roadmap not found" error
 * 
 * Dependencies:
 * - RoadmapDetail component handles data fetching and error states
 * - useRoadmapBySlug hook fetches roadmap data by slug
 * - Suspense provides loading boundary for async operations
 */

interface RoadmapPageProps {
    /** URL parameters containing the roadmap slug */
    params: Promise<{ slug: string }>;
}

/**
 * Loading fallback component displayed while RoadmapDetail is loading
 */
function RoadmapDetailLoading() {
    return (
        <div className="space-y-6">
            {/* Back button skeleton */}
            <div className="h-10 w-40 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />

            {/* Header skeleton */}
            <div className="space-y-4">
                {/* Title skeleton */}
                <div className="h-12 w-3/4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />

                {/* Description skeleton */}
                <div className="space-y-2">
                    <div className="h-6 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                    <div className="h-6 w-2/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                </div>

                {/* Tags skeleton */}
                <div className="flex gap-2">
                    <div className="h-6 w-16 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
                    <div className="h-6 w-20 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
                    <div className="h-6 w-14 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
                </div>

                {/* Published date skeleton */}
                <div className="h-4 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>

            {/* Content skeleton */}
            <div className="space-y-4">
                <div className="h-64 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>
        </div>
    );
}

/**
 * Roadmap detail page component
 * 
 * This is an async server component that extracts the slug from URL params
 * and passes it to the RoadmapDetail client component for data fetching.
 * 
 * The page uses Suspense to provide a loading boundary while the RoadmapDetail
 * component fetches data and renders the roadmap content.
 */
export default async function RoadmapPage({ params }: RoadmapPageProps) {
    // Extract slug from async params (Next.js 15+ requirement)
    const { slug } = await params;

    return (
        <div className="container mx-auto max-w-4xl px-4 py-8">
            <Suspense fallback={<RoadmapDetailLoading />}>
                <RoadmapDetail slug={slug} />
            </Suspense>
        </div>
    );
}

/**
 * Generate metadata for the page (optional enhancement)
 * This could be implemented to provide dynamic SEO metadata based on the roadmap
 */
// export async function generateMetadata({ params }: RoadmapPageProps): Promise<Metadata> {
//     const { slug } = await params;
//
//     // Fetch roadmap data to generate metadata
//     // This would require a server-side data fetching function
//
//     return {
//         title: `${roadmapTitle} | VizTechStack`,
//         description: roadmapDescription,
//     };
// }