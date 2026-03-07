import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { RoadmapEditor } from '@/components/roadmap/RoadmapEditor';
import { NodeSidebar } from '@/components/roadmap/NodeSidebar';

interface EditRoadmapPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export const metadata: Metadata = {
    title: 'Edit Roadmap | VizTechStack Admin',
    description: 'Edit and manage roadmap content',
};

// Disable static generation for admin pages
export const dynamic = 'force-dynamic';

export default async function EditRoadmapPage({ params }: EditRoadmapPageProps) {
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

    const { slug } = await params;

    if (!slug) {
        notFound();
    }

    return (
        <main className="h-screen flex flex-col">
            {/* Header */}
            <div className="border-b bg-white px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Edit Roadmap</h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Drag nodes to reposition, add skill nodes from sidebar
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Auto-save enabled</span>
                    </div>
                </div>
            </div>

            {/* Editor Layout */}
            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <div className="w-80 border-r bg-gray-50 overflow-y-auto">
                    <NodeSidebar />
                </div>

                {/* Editor Canvas */}
                <div className="flex-1 p-4">
                    <RoadmapEditor slug={slug} />
                </div>
            </div>
        </main>
    );
}
