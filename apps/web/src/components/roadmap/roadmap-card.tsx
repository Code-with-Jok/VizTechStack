import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Roadmap } from '@/features/roadmap/types';

interface RoadmapCardProps {
    /** The roadmap data to display in the card */
    roadmap: Roadmap;
}

/**
 * RoadmapCard component displays a roadmap preview in a card format.
 * 
 * Features:
 * - Displays roadmap title (truncated to 2 lines)
 * - Shows description (truncated to 3 lines)
 * - Shows up to 3 tags with overflow indicator
 * - Displays formatted published date
 * - Hover effects for better UX
 * - Responsive design
 * - Links to roadmap detail page
 */

export function RoadmapCard({ roadmap }: RoadmapCardProps) {
    const publishedDate = new Date(roadmap.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });

    return (
        <Link href={`/roadmaps/${roadmap.slug}`}>
            <Card className="h-full transition-shadow hover:shadow-lg" data-testid="roadmap-card">
                <CardHeader>
                    <CardTitle className="line-clamp-2">{roadmap.title}</CardTitle>
                    <CardDescription className="line-clamp-3">
                        {roadmap.description}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2 mb-3">
                        {roadmap.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary">
                                {tag}
                            </Badge>
                        ))}
                        {roadmap.tags.length > 3 && (
                            <Badge variant="outline">+{roadmap.tags.length - 3}</Badge>
                        )}
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Published {publishedDate}
                    </p>
                </CardContent>
            </Card>
        </Link>
    );
}