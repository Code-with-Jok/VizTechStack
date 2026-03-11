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
 * - Integrates ViewToggle for switching between content and visualization views
 * - State persistence for view preferences
 * - Responsive design with proper typography
 * - Accessible markup structure
 * 
 * Used in: /roadmaps/[slug] page for public roadmap viewing
 * 
 * Validates: Requirement 1.1 - View toggle integration with existing layout
 */

import { useRoadmapBySlug } from '@/lib/hooks/use-roadmap';
import { RoadmapContent } from './roadmap-content';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ViewToggle } from '@/components/roadmap-visualization/ViewToggle';
import { useViewToggle } from '@/hooks/use-view-toggle';
import { RoadmapVisualization } from '@/components/roadmap-visualization/RoadmapVisualization';
import type { GraphData, NodeType, EdgeType, RoadmapNode, RoadmapEdge, DifficultyLevel, NodeCategory, RelationshipType, LayoutType } from '@viztechstack/roadmap-visualization';
import { Suspense, useMemo } from 'react';

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

            {/* View toggle skeleton */}
            <div className="flex justify-center">
                <div className="h-12 w-80 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
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
 * Generate mock graph data from roadmap content for visualization
 * This is a temporary solution until we implement proper content parsing
 */
function generateMockGraphData(roadmap: { title: string; content: string; slug: string; id?: string }): GraphData {
    // Create mock nodes based on roadmap content
    const nodes: RoadmapNode[] = [
        {
            id: 'start',
            type: 'milestone' as NodeType,
            position: { x: 100, y: 100 },
            data: {
                label: 'Bắt đầu',
                description: 'Điểm khởi đầu của roadmap',
                level: 1,
                section: 'Giới thiệu',
                difficulty: 'beginner' as DifficultyLevel,
                estimatedTime: '1 tuần',
                resources: [],
                completed: false,
                category: 'skill' as NodeCategory,
            },
        },
        {
            id: 'html-css',
            type: 'topic' as NodeType,
            position: { x: 300, y: 100 },
            data: {
                label: 'HTML & CSS',
                description: 'Học HTML và CSS cơ bản',
                level: 2,
                section: 'Cơ bản',
                difficulty: 'beginner' as DifficultyLevel,
                estimatedTime: '4 tuần',
                resources: [
                    { type: 'article', title: 'HTML Tutorial', url: '#' },
                    { type: 'video', title: 'CSS Basics', url: '#' },
                ],
                completed: false,
                category: 'skill' as NodeCategory,
            },
        },
        {
            id: 'javascript',
            type: 'topic' as NodeType,
            position: { x: 500, y: 100 },
            data: {
                label: 'JavaScript',
                description: 'Học JavaScript cơ bản và nâng cao',
                level: 3,
                section: 'Lập trình',
                difficulty: 'intermediate' as DifficultyLevel,
                estimatedTime: '8 tuần',
                resources: [
                    { type: 'course', title: 'JavaScript Complete Course', url: '#' },
                    { type: 'book', title: 'You Don\'t Know JS', url: '#' },
                ],
                completed: false,
                category: 'skill' as NodeCategory,
            },
        },
        {
            id: 'react',
            type: 'topic' as NodeType,
            position: { x: 300, y: 300 },
            data: {
                label: 'React',
                description: 'Học React framework',
                level: 4,
                section: 'Framework',
                difficulty: 'intermediate' as DifficultyLevel,
                estimatedTime: '6 tuần',
                resources: [
                    { type: 'documentation', title: 'React Docs', url: '#' },
                    { type: 'course', title: 'React Tutorial', url: '#' },
                ],
                completed: false,
                category: 'skill' as NodeCategory,
                prerequisites: ['javascript'],
            },
        },
        {
            id: 'nextjs',
            type: 'topic' as NodeType,
            position: { x: 500, y: 300 },
            data: {
                label: 'Next.js',
                description: 'Học Next.js framework',
                level: 5,
                section: 'Framework nâng cao',
                difficulty: 'advanced' as DifficultyLevel,
                estimatedTime: '4 tuần',
                resources: [
                    { type: 'documentation', title: 'Next.js Docs', url: '#' },
                ],
                completed: false,
                category: 'skill' as NodeCategory,
                prerequisites: ['react'],
            },
        },
        {
            id: 'frontend-dev',
            type: 'milestone' as NodeType,
            position: { x: 400, y: 500 },
            data: {
                label: 'Frontend Developer',
                description: 'Trở thành Frontend Developer',
                level: 6,
                section: 'Mục tiêu nghề nghiệp',
                difficulty: 'advanced' as DifficultyLevel,
                estimatedTime: '6 tháng',
                resources: [],
                completed: false,
                category: 'role' as NodeCategory,
                targetRoadmapId: roadmap.id || roadmap.slug,
                prerequisites: ['react', 'nextjs'],
            },
        },
    ];

    // Create mock edges showing relationships
    const edges: RoadmapEdge[] = [
        {
            id: 'start-html',
            source: 'start',
            target: 'html-css',
            type: 'dependency' as EdgeType,
            data: {
                label: 'Bắt đầu với',
                relationship: 'leads-to' as RelationshipType,
                strength: 1.0,
            },
        },
        {
            id: 'html-js',
            source: 'html-css',
            target: 'javascript',
            type: 'dependency' as EdgeType,
            data: {
                label: 'Tiếp theo',
                relationship: 'leads-to' as RelationshipType,
                strength: 0.9,
            },
        },
        {
            id: 'js-react',
            source: 'javascript',
            target: 'react',
            type: 'dependency' as EdgeType,
            data: {
                label: 'Yêu cầu',
                relationship: 'prerequisite' as RelationshipType,
                strength: 1.0,
            },
        },
        {
            id: 'react-next',
            source: 'react',
            target: 'nextjs',
            type: 'dependency' as EdgeType,
            data: {
                label: 'Nâng cao',
                relationship: 'leads-to' as RelationshipType,
                strength: 0.8,
            },
        },
        {
            id: 'next-frontend',
            source: 'nextjs',
            target: 'frontend-dev',
            type: 'dependency' as EdgeType,
            data: {
                label: 'Mục tiêu',
                relationship: 'leads-to' as RelationshipType,
                strength: 0.9,
            },
        },
        {
            id: 'react-frontend',
            source: 'react',
            target: 'frontend-dev',
            type: 'dependency' as EdgeType,
            data: {
                label: 'Liên quan',
                relationship: 'related-to' as RelationshipType,
                strength: 0.7,
            },
        },
    ];

    return {
        nodes,
        edges,
        metadata: {
            totalNodes: nodes.length,
            totalEdges: edges.length,
            maxDepth: 6,
            layoutType: 'hierarchical' as LayoutType,
            generatedAt: new Date(),
        }
    };
}

export function RoadmapDetail({ slug }: RoadmapDetailProps) {
    const { roadmap, loading, error } = useRoadmapBySlug(slug);
    const { currentView, setView, isLoading, setIsLoading } = useViewToggle({
        defaultView: 'content',
        persist: true,
        syncWithUrl: true,
    });

    // Generate mock graph data for visualization
    const graphData = useMemo(() => {
        if (!roadmap) return {
            nodes: [],
            edges: [],
            metadata: {
                totalNodes: 0,
                totalEdges: 0,
                maxDepth: 0,
                layoutType: 'hierarchical' as LayoutType,
                generatedAt: new Date(),
            }
        };
        return generateMockGraphData(roadmap);
    }, [roadmap]);

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

    // Handle view change with loading state
    const handleViewChange = async (view: typeof currentView) => {
        if (view === 'visualization') {
            setIsLoading(true);
            // Simulate loading time for visualization
            setTimeout(() => {
                setIsLoading(false);
            }, 1000);
        }
        setView(view);
    };

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

            {/* View Toggle */}
            <div className="py-4">
                <ViewToggle
                    currentView={currentView}
                    onViewChange={handleViewChange}
                    isLoading={isLoading}
                    className="mb-8"
                />
            </div>

            {/* Content Area with smooth transitions */}
            <div className="transition-all duration-500 ease-in-out">
                {currentView === 'content' ? (
                    <div className="animate-fade-in">
                        <RoadmapContent content={roadmap.content} />
                    </div>
                ) : (
                    <div className="animate-fade-in">
                        <Suspense fallback={
                            <div className="h-[calc(100vh-280px)] bg-neutral-100 rounded-2xl animate-pulse flex items-center justify-center">
                                <div className="text-neutral-500">Loading visualization...</div>
                            </div>
                        }>
                            <div className="h-[calc(100vh-280px)] bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-2xl border border-neutral-200 overflow-hidden">
                                <RoadmapVisualization
                                    graphData={graphData}
                                    onNodeClick={(nodeId) => {
                                        console.log('Node clicked:', nodeId);
                                    }}
                                    onEdgeClick={(edgeId) => {
                                        console.log('Edge clicked:', edgeId);
                                    }}
                                    className="w-full h-full"
                                />
                            </div>
                        </Suspense>
                    </div>
                )}
            </div>
        </article>
    );
}