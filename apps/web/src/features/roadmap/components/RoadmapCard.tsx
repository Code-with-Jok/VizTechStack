'use client';

import Link from 'next/link';
import { RoadmapCategory, RoadmapDifficulty } from '@viztechstack/graphql-generated';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface RoadmapCardProps {
    roadmap: {
        id: string;
        slug: string;
        title: string;
        description: string;
        category: RoadmapCategory;
        difficulty: RoadmapDifficulty;
        topicCount: number;
    };
}

const categoryLabels: Partial<Record<RoadmapCategory, string>> = {
    ROLE: 'Role',
    SKILL: 'Skill',
    BEST_PRACTICE: 'Best Practice',
};

const difficultyLabels: Partial<Record<RoadmapDifficulty, string>> = {
    BEGINNER: 'Beginner',
    INTERMEDIATE: 'Intermediate',
    ADVANCED: 'Advanced',
};

const categoryColors: Partial<Record<RoadmapCategory, string>> = {
    ROLE: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    SKILL: 'bg-green-100 text-green-800 hover:bg-green-200',
    BEST_PRACTICE: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
};

const difficultyColors: Partial<Record<RoadmapDifficulty, string>> = {
    BEGINNER: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200',
    INTERMEDIATE: 'bg-amber-100 text-amber-800 hover:bg-amber-200',
    ADVANCED: 'bg-red-100 text-red-800 hover:bg-red-200',
};

export function RoadmapCard({ roadmap }: RoadmapCardProps) {
    return (
        <Link href={`/roadmaps/${roadmap.slug}`}>
            <Card className="h-full p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="space-y-4">
                    {/* Header with badges */}
                    <div className="flex items-start justify-between gap-2">
                        <Badge className={categoryColors[roadmap.category] || ''} variant="secondary">
                            {categoryLabels[roadmap.category] || roadmap.category}
                        </Badge>
                        <Badge className={difficultyColors[roadmap.difficulty] || ''} variant="secondary">
                            {difficultyLabels[roadmap.difficulty] || roadmap.difficulty}
                        </Badge>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-semibold line-clamp-2">{roadmap.title}</h3>

                    {/* Description */}
                    <p className="text-sm text-gray-600 line-clamp-3">{roadmap.description}</p>

                    {/* Footer with topic count */}
                    <div className="pt-2 border-t">
                        <p className="text-sm text-gray-500">
                            {roadmap.topicCount} {roadmap.topicCount === 1 ? 'topic' : 'topics'}
                        </p>
                    </div>
                </div>
            </Card>
        </Link>
    );
}
