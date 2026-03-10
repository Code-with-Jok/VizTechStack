"use client";

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { useRoadmapById } from '@/lib/hooks/use-roadmap';
import { RoadmapForm } from '@/components/admin/roadmap-form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

/**
 * Edit Roadmap Page Component
 * 
 * This component handles the edit roadmap functionality by:
 * 1. Extracting the roadmap ID from URL parameters
 * 2. Fetching the roadmap data using useRoadmapById hook
 * 3. Handling loading, error, and success states
 * 4. Rendering the RoadmapForm component in edit mode with initial data
 */
function EditRoadmapContent() {
    const params = useParams();
    const id = params.id as string;

    const { roadmap, loading, error } = useRoadmapById(id);

    // Show loading state while fetching roadmap data
    if (loading) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <div className="h-8 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800 mb-2" />
                    <div className="h-4 w-96 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                </div>
                <div className="space-y-6">
                    <div className="h-10 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                    <div className="h-10 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                    <div className="h-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                    <div className="h-40 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                </div>
            </div>
        );
    }

    // Show error state if roadmap not found or fetch failed
    if (error || !roadmap) {
        return (
            <div className="max-w-2xl mx-auto">
                <Button asChild variant="ghost" className="mb-4">
                    <Link href="/admin/roadmaps">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Roadmaps
                    </Link>
                </Button>

                <Alert variant="destructive">
                    <AlertDescription>
                        {error
                            ? `Failed to load roadmap: ${error.message}`
                            : 'Roadmap not found. It may have been deleted or the ID is invalid.'
                        }
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    // Render the form with roadmap data
    return <RoadmapForm mode="edit" initialData={roadmap} />;
}

/**
 * Edit Roadmap Page
 * 
 * Dynamic route page for editing existing roadmaps.
 * URL pattern: /admin/roadmaps/[id]/edit
 * 
 * Features:
 * - Extracts roadmap ID from URL parameters
 * - Fetches roadmap data by ID
 * - Shows loading state while fetching
 * - Shows error message if roadmap not found
 * - Renders RoadmapForm in edit mode with pre-filled data
 * - Handles form submission and navigation
 * 
 * Dependencies:
 * - useRoadmapById hook for data fetching
 * - RoadmapForm component for the edit interface
 * - Admin layout for authentication and authorization
 */
export default function EditRoadmapPage() {
    return (
        <div className="container mx-auto max-w-6xl px-4 py-8">
            <Suspense
                fallback={
                    <div className="max-w-2xl mx-auto">
                        <div className="text-center py-8">
                            <p>Loading roadmap...</p>
                        </div>
                    </div>
                }
            >
                <EditRoadmapContent />
            </Suspense>
        </div>
    );
}