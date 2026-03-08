'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { RoadmapViewer } from '@/features/roadmap/components';
import { Button } from '@/components/ui/button';

interface RoadmapDetailClientProps {
    slug: string;
}

export function RoadmapDetailClient({ slug }: RoadmapDetailClientProps) {
    const router = useRouter();

    return (
        <div className="space-y-6">
            {/* Navigation Header */}
            <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" onClick={() => router.back()}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
            </div>

            {/* Roadmap Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold capitalize">
                    {slug.split('-').join(' ')} Roadmap
                </h1>
                <p className="text-gray-600">
                    Interactive learning path with progress tracking
                </p>
            </div>

            {/* Roadmap Viewer */}
            <RoadmapViewer slug={slug} showProgressTracker={true} />
        </div>
    );
}
