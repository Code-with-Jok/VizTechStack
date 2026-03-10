"use client";

import { useRoadmaps } from '@/lib/hooks/use-roadmap';
import { RoadmapCard } from './roadmap-card';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * RoadmapList component displays a list of roadmaps in a responsive grid layout.
 * 
 * Features:
 * - Fetches roadmaps using useRoadmaps hook
 * - Shows 6 skeleton cards during loading
 * - Displays error alert if fetch fails
 * - Shows empty state if no roadmaps available
 * - Renders RoadmapCard for each roadmap
 * - Responsive grid: 1 column on mobile, 2 on tablet, 3 on desktop
 * 
 * States handled:
 * - Loading: Shows skeleton placeholders
 * - Error: Shows destructive alert with error message
 * - Empty: Shows message when no roadmaps exist
 * - Success: Renders roadmap cards in grid layout
 */
export function RoadmapList() {
    const { roadmaps, loading, error } = useRoadmaps();

    // Loading state: Show 6 skeleton cards in grid layout
    if (loading) {
        return (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" data-testid="roadmap-grid">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="h-48 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800"
                        data-testid="roadmap-loading"
                    />
                ))}
            </div>
        );
    }

    // Error state: Show alert with detailed error message
    if (error) {
        console.error('Roadmaps query error:', error);

        // Check if it's a backend connection issue
        const isBackendDown = error.networkError ||
            error.message.includes('Unknown type') ||
            error.message.includes('status code 400');

        if (isBackendDown) {
            return (
                <div className="text-center py-12 space-y-6">
                    <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-zinc-900">Backend Service Unavailable</h3>
                        <p className="text-zinc-600 max-w-md mx-auto">
                            The roadmap service is currently being set up. Please check back later or contact the development team.
                        </p>
                    </div>
                    <div className="space-y-3">
                        <div className="text-sm text-zinc-500">
                            <p>For developers:</p>
                            <code className="bg-zinc-100 px-2 py-1 rounded text-xs">
                                pnpm dev --filter @viztechstack/api
                            </code>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Retry Connection
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <Alert variant="destructive" data-testid="error-alert">
                <AlertDescription>
                    <div className="space-y-2">
                        <p>Failed to load roadmaps. Please try again later.</p>
                        {process.env.NODE_ENV === 'development' && (
                            <details className="text-xs">
                                <summary className="cursor-pointer">Debug Info</summary>
                                <pre className="mt-2 whitespace-pre-wrap">
                                    {error.message}
                                </pre>
                            </details>
                        )}
                    </div>
                </AlertDescription>
            </Alert>
        );
    }

    // Empty state: Show message when no roadmaps available
    if (roadmaps.length === 0) {
        return (
            <div className="text-center py-12" data-testid="empty-state">
                <p className="text-zinc-600 dark:text-zinc-400">
                    No roadmaps available yet.
                </p>
            </div>
        );
    }

    // Success state: Render roadmap cards in responsive grid
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" data-testid="roadmap-grid">
            {roadmaps.map((roadmap) => (
                <RoadmapCard key={roadmap.id} roadmap={roadmap} />
            ))}
        </div>
    );
}