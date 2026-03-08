import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { auth } from '@clerk/nextjs/server';
import { CreateRoadmapForm } from '@/features/editor/components/CreateRoadmapForm';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
    title: 'Create New Roadmap | VizTechStack Admin',
    description: 'Create a new learning roadmap',
};

// Disable static generation for admin pages
export const dynamic = 'force-dynamic';

export default async function CreateRoadmapPage() {
    // Check authentication and admin role
    const { userId, sessionClaims } = await auth();

    if (!userId) {
        redirect('/sign-in');
    }

    // Check if user has admin role
    const metadata = sessionClaims?.metadata as { role?: string } | undefined;
    const userRole = metadata?.role;
    if (userRole !== 'admin') {
        redirect('/');
    }

    return (
        <main className="container mx-auto px-4 py-8 max-w-3xl">
            <div className="space-y-6">
                {/* Navigation */}
                <div className="flex items-center gap-4">
                    <Link href="/admin/roadmaps">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Dashboard
                        </Button>
                    </Link>
                </div>

                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold">Create New Roadmap</h1>
                    <p className="text-gray-600">
                        Fill in the details below to create a new learning roadmap. You can add nodes and content after creation.
                    </p>
                </div>

                {/* Form */}
                <div className="bg-white rounded-lg border p-6">
                    <CreateRoadmapForm />
                </div>
            </div>
        </main>
    );
}
