"use client";

import { useState } from 'react';
import { useDeleteRoadmap } from '@/lib/hooks/use-roadmap';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Roadmap } from '@/features/roadmap/types';

interface DeleteRoadmapDialogProps {
    roadmap: Roadmap;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function DeleteRoadmapDialog({
    roadmap,
    open,
    onOpenChange,
}: DeleteRoadmapDialogProps) {
    const { deleteRoadmap, loading } = useDeleteRoadmap();
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async () => {
        try {
            setError(null);
            await deleteRoadmap(roadmap.id);
            onOpenChange(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete roadmap');
        }
    };

    const handleCancel = () => {
        setError(null);
        onOpenChange(false);
    };

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            // Only allow closing if not loading and clear any error
            if (!loading) {
                setError(null);
                onOpenChange(false);
            }
        } else {
            onOpenChange(true);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={handleOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Roadmap</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete &ldquo;{roadmap.title}&rdquo;? This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading} onClick={handleCancel}>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                    >
                        {loading ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}