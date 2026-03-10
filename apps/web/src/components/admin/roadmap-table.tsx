"use client";

import { useState } from 'react';
import { useRoadmapsForAdmin } from '@/lib/hooks/use-roadmap';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';
import { DeleteRoadmapDialog } from './delete-roadmap-dialog';
import type { Roadmap } from '@/features/roadmap/types';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

export function RoadmapTable() {
    const { roadmaps, loading, error } = useRoadmapsForAdmin();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedRoadmap, setSelectedRoadmap] = useState<Roadmap | null>(null);

    const handleDeleteClick = (roadmap: Roadmap) => {
        setSelectedRoadmap(roadmap);
        setDeleteDialogOpen(true);
    };

    if (loading) {
        return <div>Loading roadmaps...</div>;
    }

    if (error) {
        return <div>Error loading roadmaps: {error.message}</div>;
    }

    if (roadmaps.length === 0) {
        return (
            <div className="text-center py-12 border rounded-lg">
                <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                    No roadmaps created yet.
                </p>
                <Button asChild>
                    <Link href="/admin/roadmaps/new">Create your first roadmap</Link>
                </Button>
            </div>
        );
    }

    return (
        <>
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead>Author</TableHead>
                            <TableHead>Tags</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Updated</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {roadmaps.map((roadmap) => (
                            <TableRow key={roadmap.id}>
                                <TableCell className="font-medium">{roadmap.title}</TableCell>
                                <TableCell className="font-mono text-sm">{roadmap.slug}</TableCell>
                                <TableCell className="text-sm text-zinc-600">
                                    {`User ${roadmap.author?.slice(-8) || 'Unknown'}`}
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-1">
                                        {roadmap.tags?.slice(0, 2).map((tag) => (
                                            <Badge key={tag} variant="secondary" className="text-xs">
                                                {tag}
                                            </Badge>
                                        ))}
                                        {roadmap.tags && roadmap.tags.length > 2 && (
                                            <Badge variant="outline" className="text-xs">
                                                +{roadmap.tags.length - 2}
                                            </Badge>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={roadmap.isPublished ? 'default' : 'secondary'}>
                                        {roadmap.isPublished ? 'Published' : 'Draft'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-sm text-zinc-600">
                                    {new Date(roadmap.updatedAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit',
                                    })}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button asChild variant="ghost" size="sm">
                                            <Link href={`/roadmaps/${roadmap.slug}`} target="_blank">
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button asChild variant="ghost" size="sm">
                                            <Link href={`/admin/roadmaps/${roadmap.id}/edit`}>
                                                <Pencil className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteClick(roadmap)}
                                        >
                                            <Trash2 className="h-4 w-4 text-red-600" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {selectedRoadmap && (
                <DeleteRoadmapDialog
                    roadmap={selectedRoadmap}
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                />
            )}
        </>
    );
}