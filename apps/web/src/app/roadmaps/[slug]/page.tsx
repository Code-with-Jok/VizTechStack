import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { RoadmapDetailClient } from './RoadmapDetailClient';

interface RoadmapDetailPageProps {
    params: Promise<{
        slug: string;
    }>;
}

// Disable static generation for this page since it uses Apollo Client and Convex
export const dynamic = 'force-dynamic';

// Generate metadata for SEO
export async function generateMetadata(
    { params }: RoadmapDetailPageProps
): Promise<Metadata> {
    const { slug } = await params;

    // In a real app, you might fetch roadmap data here for accurate metadata
    const title = slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    return {
        title: `${title} Roadmap | VizTechStack`,
        description: `Explore the ${title} learning roadmap. Track your progress and master the skills you need.`,
        openGraph: {
            title: `${title} Roadmap | VizTechStack`,
            description: `Explore the ${title} learning roadmap.`,
            type: 'website',
        },
    };
}

export default async function RoadmapDetailPage({ params }: RoadmapDetailPageProps) {
    const { slug } = await params;

    if (!slug) {
        notFound();
    }

    return (
        <main className="container mx-auto px-4 py-8">
            <RoadmapDetailClient slug={slug} />
        </main>
    );
}
