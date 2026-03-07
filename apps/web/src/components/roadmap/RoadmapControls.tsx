/**
 * RoadmapControls Component
 * 
 * Custom controls for React Flow roadmap visualization.
 * 
 * Features:
 * - Zoom in/out buttons
 * - Fit to view button (centers and fits all nodes)
 * - Reset view button (returns to initial state)
 * - Styled with shadcn/ui Button components
 * - Tooltips for better UX
 * 
 * Usage:
 * ```tsx
 * import { RoadmapControls } from '@/components/roadmap/RoadmapControls';
 * 
 * function RoadmapViewer() {
 *   return (
 *     <ReactFlow>
 *       <RoadmapControls />
 *     </ReactFlow>
 *   );
 * }
 * ```
 */
'use client';

import { useReactFlow } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    ZoomIn,
    ZoomOut,
    Maximize2,
    RotateCcw,
} from 'lucide-react';

export function RoadmapControls() {
    const { zoomIn, zoomOut, fitView, setViewport } = useReactFlow();

    const handleZoomIn = () => {
        zoomIn({ duration: 200 });
    };

    const handleZoomOut = () => {
        zoomOut({ duration: 200 });
    };

    const handleFitView = () => {
        fitView({
            padding: 0.2,
            duration: 200,
            includeHiddenNodes: false,
        });
    };

    const handleResetView = () => {
        setViewport({ x: 0, y: 0, zoom: 1 }, { duration: 200 });
    };

    return (
        <TooltipProvider>
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 bg-white rounded-lg shadow-lg p-2 border">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon-sm"
                            onClick={handleZoomIn}
                            aria-label="Zoom in"
                        >
                            <ZoomIn />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                        <p>Zoom in</p>
                    </TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon-sm"
                            onClick={handleZoomOut}
                            aria-label="Zoom out"
                        >
                            <ZoomOut />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                        <p>Zoom out</p>
                    </TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon-sm"
                            onClick={handleFitView}
                            aria-label="Fit to view"
                        >
                            <Maximize2 />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                        <p>Fit to view</p>
                    </TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon-sm"
                            onClick={handleResetView}
                            aria-label="Reset view"
                        >
                            <RotateCcw />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                        <p>Reset view</p>
                    </TooltipContent>
                </Tooltip>
            </div>
        </TooltipProvider>
    );
}
