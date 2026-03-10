/**
 * Usage Example: Delete Roadmap Dialog
 * 
 * This file demonstrates how to integrate the DeleteRoadmapDialog component
 * into a roadmap management table or list component.
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { DeleteRoadmapDialog } from '../delete-roadmap-dialog';
import type { Roadmap } from '@/features/roadmap/types';

interface RoadmapRowProps {
    roadmap: Roadmap;
}

/**
 * Example component showing how to use DeleteRoadmapDialog in a table row
 */
export function RoadmapRow({ roadmap }: RoadmapRowProps) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const handleDeleteClick = () => {
        setDeleteDialogOpen(true);
    };

    return (
        <>
            <tr>
                <td className="font-medium">{roadmap.title}</td>
                <td className="font-mono text-sm">{roadmap.slug}</td>
                <td>
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleDeleteClick}
                        >
                            <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                    </div>
                </td>
            </tr>

            {/* Delete confirmation dialog */}
            <DeleteRoadmapDialog
                roadmap={roadmap}
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
            />
        </>
    );
}

/**
 * Example usage in a roadmap management table
 */
export function RoadmapManagementTable({ roadmaps }: { roadmaps: Roadmap[] }) {
    return (
        <table className="w-full">
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Slug</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {roadmaps.map((roadmap) => (
                    <RoadmapRow key={roadmap.id} roadmap={roadmap} />
                ))}
            </tbody>
        </table>
    );
}

/**
 * Key Integration Points:
 * 
 * 1. State Management:
 *    - Use useState to control dialog open/close state
 *    - Pass roadmap object to dialog component
 * 
 * 2. Event Handling:
 *    - onClick handler opens dialog
 *    - onOpenChange prop handles dialog state changes
 * 
 * 3. Automatic Updates:
 *    - useDeleteRoadmap hook automatically refetches roadmaps query
 *    - No manual state updates needed in parent component
 * 
 * 4. Error Handling:
 *    - Dialog handles all error states internally
 *    - Shows error messages to user
 *    - Prevents dialog from closing on errors
 * 
 * 5. Loading States:
 *    - Dialog shows loading spinner during deletion
 *    - Disables buttons to prevent multiple submissions
 */