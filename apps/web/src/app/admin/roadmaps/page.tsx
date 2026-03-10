"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { RoadmapTable } from '@/components/admin/roadmap-table';

export default function AdminRoadmapsPage() {
    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Roadmap Management</h1>
                    <p className="text-zinc-600 dark:text-zinc-400 mt-1">
                        Create, edit, and manage technology roadmaps
                    </p>
                </div>
                <Button asChild>
                    <Link href="/admin/roadmaps/new">
                        <Plus className="mr-2 h-4 w-4" />
                        New Roadmap
                    </Link>
                </Button>
            </div>

            <RoadmapTable />
        </div>
    );
}