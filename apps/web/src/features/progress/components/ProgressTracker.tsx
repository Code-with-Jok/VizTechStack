/**
 * ProgressTracker Component
 * 
 * Manages user progress tracking for roadmap nodes.
 * 
 * Features:
 * - Queries user progress for a roadmap using GraphQL
 * - Displays status buttons (Done, In Progress, Skipped)
 * - Updates progress via GraphQL mutation
 * - Updates Apollo cache after mutation for instant UI updates
 * - Only visible to authenticated users
 * - Optimistic UI updates for better UX
 * 
 * Usage:
 * ```tsx
 * import { ProgressTracker } from '@/features/progress/components/ProgressTracker';
 * 
 * function RoadmapPage() {
 *   return (
 *     <ProgressTracker 
 *       roadmapId="roadmap-123" 
 *       nodeId="node-456"
 *       currentStatus="IN_PROGRESS"
 *     />
 *   );
 * }
 * ```
 * 
 * @param roadmapId - The roadmap ID
 * @param nodeId - The node ID to track progress for
 * @param currentStatus - The current progress status (optional)
 */
'use client';

import { useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import type { ProgressStatus } from '../types';
import { useUpdateProgress } from '../hooks';

interface ProgressTrackerProps {
    roadmapId: string;
    nodeId: string;
    currentStatus?: ProgressStatus;
    onStatusChange?: (status: ProgressStatus) => void;
}

/**
 * Status button configuration
 */
const statusButtons = [
    {
        status: 'DONE' as ProgressStatus,
        label: 'Done',
        icon: CheckCircle2,
        variant: 'default' as const,
        activeClass: 'bg-green-600 hover:bg-green-700 text-white',
        inactiveClass: 'bg-white hover:bg-green-50 text-green-600 border-green-600',
    },
    {
        status: 'IN_PROGRESS' as ProgressStatus,
        label: 'In Progress',
        icon: Clock,
        variant: 'default' as const,
        activeClass: 'bg-yellow-600 hover:bg-yellow-700 text-white',
        inactiveClass: 'bg-white hover:bg-yellow-50 text-yellow-600 border-yellow-600',
    },
    {
        status: 'SKIPPED' as ProgressStatus,
        label: 'Skipped',
        icon: XCircle,
        variant: 'default' as const,
        activeClass: 'bg-gray-600 hover:bg-gray-700 text-white',
        inactiveClass: 'bg-white hover:bg-gray-50 text-gray-600 border-gray-600',
    },
] as const;

export function ProgressTracker({
    roadmapId,
    nodeId,
    currentStatus,
    onStatusChange,
}: ProgressTrackerProps) {
    const { isSignedIn } = useUser();
    const { updateProgress, loading } = useUpdateProgress({
        roadmapId,
        onStatusChange,
    });

    const handleStatusClick = useCallback(
        async (status: ProgressStatus) => {
            await updateProgress(nodeId, status);
        },
        [updateProgress, nodeId]
    );

    // Don't render if user is not authenticated
    if (!isSignedIn) {
        return null;
    }

    return (
        <div className="flex flex-col gap-3">
            <div className="text-sm font-semibold text-gray-700">
                Track your progress:
            </div>
            <div className="flex flex-wrap gap-2">
                {statusButtons.map(({ status, label, icon: Icon, activeClass, inactiveClass }) => {
                    const isActive = currentStatus === status;
                    const buttonClass = isActive ? activeClass : inactiveClass;

                    return (
                        <Button
                            key={status}
                            onClick={() => handleStatusClick(status)}
                            disabled={loading}
                            className={`
                                ${buttonClass}
                                border-2 transition-all duration-200
                                disabled:opacity-50 disabled:cursor-not-allowed
                                flex items-center gap-2
                            `}
                            size="sm"
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                        </Button>
                    );
                })}
            </div>
            {loading && (
                <div className="text-xs text-gray-500 animate-pulse">
                    Updating progress...
                </div>
            )}
        </div>
    );
}
