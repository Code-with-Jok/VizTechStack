/**
 * RoadmapViewer Component
 * 
 * Interactive roadmap visualization using React Flow with progress tracking.
 * 
 * Features:
 * - Queries roadmap data by slug using GraphQL
 * - Queries user progress for the roadmap
 * - Renders nodes and edges as an interactive graph
 * - Displays progress status on nodes (colored indicators)
 * - Zoom, pan, and fit-to-view controls
 * - Custom node styling with progress status
 * - Node click handler for showing topic content
 * - Shows ProgressTracker UI when node is selected
 * - Loading and error states
 * 
 * Usage:
 * ```tsx
 * import { RoadmapViewer } from '@/components/roadmap/RoadmapViewer';
 * 
 * function RoadmapPage() {
 *   const handleNodeClick = (nodeId: string, topicId?: string) => {
 *     console.log('Node clicked:', nodeId, topicId);
 *     // Open topic panel, navigate to topic, etc.
 *   };
 * 
 *   return (
 *     <RoadmapViewer 
 *       slug="frontend-developer" 
 *       onNodeClick={handleNodeClick}
 *       showProgressTracker={true}
 *     />
 *   );
 * }
 * ```
 * 
 * @param slug - The roadmap slug to load
 * @param onNodeClick - Optional callback when a node is clicked
 * @param showProgressTracker - Whether to show the progress tracker UI (default: true)
 */
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import { useUser } from '@clerk/nextjs';
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    type Node,
    type Edge,
    type NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { RoadmapNode, type ProgressStatus } from './RoadmapNode';
import { ProgressTracker } from './ProgressTracker';

const GET_ROADMAP_BY_SLUG = gql`
  query GetRoadmapBySlug($slug: String!) {
    getRoadmapBySlug(slug: $slug) {
      id
      slug
      title
      description
      category
      difficulty
      nodes {
        id
        type
        position {
          x
          y
        }
        data {
          label
          topicId
          isReusedSkillNode
          originalRoadmapId
        }
      }
      edges {
        id
        source
        target
        type
      }
      topicCount
      status
      createdAt
    }
  }
`;

const GET_PROGRESS_FOR_ROADMAP = gql`
  query GetProgressForRoadmap($roadmapId: ID!) {
    getProgressForRoadmap(roadmapId: $roadmapId) {
      id
      userId
      roadmapId
      nodeId
      status
    }
  }
`;

interface RoadmapViewerProps {
    slug: string;
    onNodeClick?: (nodeId: string, topicId?: string) => void;
    showProgressTracker?: boolean;
}

const nodeTypes: NodeTypes = {
    topic: RoadmapNode,
    default: RoadmapNode,
};

export function RoadmapViewer({ slug, onNodeClick, showProgressTracker = true }: RoadmapViewerProps) {
    const { isSignedIn } = useUser();
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

    const { data, loading, error } = useQuery(GET_ROADMAP_BY_SLUG, {
        variables: { slug },
        fetchPolicy: 'cache-and-network',
    });

    const roadmap = data?.getRoadmapBySlug;
    const roadmapId = roadmap?.id;

    // Query user progress (only if authenticated)
    const { data: progressData } = useQuery(GET_PROGRESS_FOR_ROADMAP, {
        variables: { roadmapId: roadmapId || '' },
        skip: !isSignedIn || !roadmapId,
        fetchPolicy: 'cache-and-network',
    });

    // Create a map of nodeId -> progress status for quick lookup
    const progressMap = useMemo(() => {
        const map = new Map<string, ProgressStatus>();
        if (progressData?.getProgressForRoadmap) {
            progressData.getProgressForRoadmap.forEach((progress: {
                nodeId: string;
                status: ProgressStatus;
            }) => {
                map.set(progress.nodeId, progress.status);
            });
        }
        return map;
    }, [progressData]);

    // Parse nodes and edges from roadmap data, enriching nodes with progress status
    const initialNodes: Node[] = useMemo(() => {
        if (!roadmap?.nodes) return [];

        return roadmap.nodes.map((node: Node) => ({
            ...node,
            data: {
                ...node.data,
                progressStatus: progressMap.get(node.id),
            },
        }));
    }, [roadmap, progressMap]);

    const initialEdges: Edge[] = roadmap?.edges ?? [];

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, , onEdgesChange] = useEdgesState(initialEdges);

    // Update nodes when progress changes
    useEffect(() => {
        if (roadmap?.nodes) {
            const updatedNodes = roadmap.nodes.map((node: Node) => ({
                ...node,
                data: {
                    ...node.data,
                    progressStatus: progressMap.get(node.id),
                },
            }));
            setNodes(updatedNodes);
        }
    }, [roadmap?.nodes, progressMap, setNodes]);

    // Handle node click events
    const handleNodeClick = useCallback(
        (_event: React.MouseEvent, node: Node) => {
            setSelectedNodeId(node.id);

            if (onNodeClick) {
                const topicId = node.data?.topicId as string | undefined;
                onNodeClick(node.id, topicId);
            }
        },
        [onNodeClick]
    );

    // Handle progress status change
    const handleProgressChange = useCallback(
        (status: ProgressStatus) => {
            if (!selectedNodeId) return;

            // Update the node's progress status in the local state
            setNodes((nds) =>
                nds.map((node) => {
                    if (node.id === selectedNodeId) {
                        return {
                            ...node,
                            data: {
                                ...node.data,
                                progressStatus: status,
                            },
                        };
                    }
                    return node;
                })
            );
        },
        [selectedNodeId, setNodes]
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center w-full h-[600px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p className="text-sm text-gray-600">Loading roadmap...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center w-full h-[600px]">
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-red-600 mb-2">
                        Error loading roadmap
                    </h3>
                    <p className="text-sm text-gray-600">{error.message}</p>
                </div>
            </div>
        );
    }

    if (!roadmap) {
        return (
            <div className="flex items-center justify-center w-full h-[600px]">
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Roadmap not found
                    </h3>
                    <p className="text-sm text-gray-600">
                        The roadmap you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-[600px] border rounded-lg overflow-hidden bg-white relative">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={handleNodeClick}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{
                    padding: 0.2,
                    includeHiddenNodes: false,
                }}
                minZoom={0.1}
                maxZoom={2}
                defaultEdgeOptions={{
                    animated: true,
                    style: { stroke: '#94a3b8', strokeWidth: 2 },
                }}
            >
                <Controls
                    showZoom
                    showFitView
                    showInteractive={false}
                    position="top-right"
                />
                <MiniMap
                    nodeStrokeWidth={3}
                    zoomable
                    pannable
                    position="bottom-right"
                />
                <Background gap={16} size={1} />
            </ReactFlow>

            {/* Progress Tracker Panel - shown when a node is selected */}
            {showProgressTracker && selectedNodeId && roadmapId && isSignedIn && (
                <div className="absolute bottom-4 left-4 z-10 bg-white rounded-lg shadow-lg p-4 border border-gray-200 max-w-md">
                    <div className="mb-2">
                        <h3 className="text-sm font-semibold text-gray-900">
                            Selected Node: {String(nodes.find(n => n.id === selectedNodeId)?.data?.label || '')}
                        </h3>
                    </div>
                    <ProgressTracker
                        roadmapId={roadmapId}
                        nodeId={selectedNodeId}
                        currentStatus={progressMap.get(selectedNodeId)}
                        onStatusChange={handleProgressChange}
                    />
                </div>
            )}
        </div>
    );
}
