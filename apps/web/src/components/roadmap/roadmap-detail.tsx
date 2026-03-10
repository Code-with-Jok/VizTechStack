"use client";

/**
 * RoadmapDetail component displays the full details of a roadmap
 * 
 * Features:
 * - Fetches roadmap data by slug using useRoadmapBySlug hook
 * - Shows skeleton loading states while data is loading
 * - Displays error alert if roadmap not found or fetch fails
 * - Shows "Back to Roadmaps" navigation button
 * - Displays roadmap metadata (title, description, tags, published date)
 * - Renders roadmap content using RoadmapContent component
 * - Responsive design with proper typography
 * - Accessible markup structure
 * 
 * Used in: /roadmaps/[slug] page for public roadmap viewing
 */

import { useRoadmapBySlug } from '@/lib/hooks/use-roadmap';
import { RoadmapContent } from './roadmap-content';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface RoadmapDetailProps {
    /** The slug of the roadmap to display */
    slug: string;
}

/**
 * Skeleton loading component for roadmap detail
 */
function RoadmapDetailSkeleton() {
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

export function RoadmapDetail({ slug }: RoadmapDetailProps) {
    const { roadmap, loading, error } = useRoadmapBySlug(slug);

    // Show skeleton loading state while data is being fetched
    if (loading) {
        return <RoadmapDetailSkeleton />;
    }

    // Show error state if there's an error or roadmap not found
    if (error || !roadmap) {
        return (
            <div className="space-y-4">
                <Button asChild variant="ghost" className="mb-4">
                    <Link href="/roadmaps">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Roadmaps
                    </Link>
                </Button>

                <Alert variant="destructive">
                    <AlertDescription>
                        {error
                            ? `Failed to load roadmap: ${error.message}`
                            : 'Roadmap not found. The roadmap you are looking for does not exist or may have been removed.'
                        }
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    // Format the published date for display
    const publishedDate = new Date(roadmap.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <article className="space-y-6">
            {/* Back to Roadmaps button */}
            <Button asChild variant="ghost" className="mb-4">
                <Link href="/roadmaps">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Roadmaps
                </Link>
            </Button>

            {/* Roadmap header with metadata */}
            <header className="space-y-4">
                {/* Title */}
                <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                    {roadmap.title}
                </h1>

                {/* Description */}
                <p className="text-xl leading-8 text-zinc-600 dark:text-zinc-400">
                    {roadmap.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                    {roadmap.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-sm">
                            {tag}
                        </Badge>
                    ))}
                </div>

                {/* Published date and author */}
                <div className="flex flex-col gap-1 text-sm text-zinc-500 dark:text-zinc-400">
                    <p>Published on {publishedDate}</p>
                    {roadmap.author && (
                        <p>By User {roadmap.author.slice(-8)}</p>
                    )}
                </div>
            </header>

            {/* Roadmap content */}
            <div className="mt-8">
                <RoadmapContent content={roadmap.content} />
            </div>
        </article>
    );
}