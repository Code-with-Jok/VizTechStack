import type { Metadata } from 'next';
import { RoadmapList } from '@/features/roadmap/components/RoadmapList';

export const metadata: Metadata = {
    title: 'Explore Roadmaps | VizTechStack',
    description: 'Browse and explore technology learning roadmaps. Find the perfect learning path for your career goals.',
    openGraph: {
        title: 'Explore Roadmaps | VizTechStack',
        description: 'Browse and explore technology learning roadmaps.',
        type: 'website',
    },
};

// Disable static generation for this page since it uses Apollo Client
export const dynamic = 'force-dynamic';

export default function RoadmapsPage() {
    return (
        <main className="container mx-auto px-4 py-8">
            <RoadmapList />
        </main>
    );
}
