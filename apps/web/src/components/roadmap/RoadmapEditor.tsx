/**
 * RoadmapEditor Component
 * 
 * Extends RoadmapViewer with editing capabilities for admin users.
 * 
 * Features:
 * - All RoadmapViewer features (visualization, progress tracking)
 * - Drop target for skill nodes from NodeSidebar
 * - Node position updates (drag nodes to reposition)
 * - Edge creation and deletion
 * - Auto-save with debounced mutations
 * - Real-time sync with Convex (Validates Requirement: 11.6)
 * - Concurrent edit notifications
 * - Validates Requirements: 11.3, 11.4, 11.6
 * 
 * Architecture:
 * - Uses Convex useQuery for real-time roadmap data subscriptions
 * - Uses Apollo useMutation for write operations (maintains consistency with API layer)
 * - Convex broadcasts changes instantly to all connected clients
 * - Last-write-wins conflict resolution
 * 
 * Usage:
 * ```tsx
 * import { RoadmapEditor } from '@/components/roadmap/RoadmapEditor';
 * 
 * function EditRoadmapPage() {
 *   return (
 *     <div className="flex h-screen">
 *       <NodeSidebar />
 *       <RoadmapEditor slug="frontend-developer" />
 *     </div>
 *   );
 * }
 * ```
 * 
 * @param slug - The roadmap slug to edit
 * @param onSave - Optional callback when roadmap is saved
 * @param onError - Optional callback when save fails
 */
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { gql, useMutation } from '@apollo/client';
import { useQuery as useConvexQuery } from 'convex/react';
import { api } from 'convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  type Node,
  type Edge,
  type NodeTypes,
  type Connection,
  type OnConnect,
  type OnNodesChange,
  type OnEdgesChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { RoadmapNode, type ProgressStatus } from './RoadmapNode';
import { ProgressTracker } from './ProgressTracker';
import { CreateTopicForm } from './CreateTopicForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Save, Loader2, AlertCircle, Users, Plus } from 'lucide-react';
import type { Id } from 'convex/_generated/dataModel';

const UPDATE_ROADMAP_MUTATION = gql`
  mutation UpdateRoadmap($id: ID!, $input: UpdateRoadmapInput!) {
    updateRoadmap(id: $id, input: $input) {
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

interface RoadmapEditorProps {
  slug: string;
  onSave?: () => void;
  onError?: (error: Error) => void;
}

const nodeTypes: NodeTypes = {
  topic: RoadmapNode,
  default: RoadmapNode,
};

export function RoadmapEditor({ slug, onSave, onError }: RoadmapEditorProps) {
  const { isSignedIn, user } = useUser();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showConcurrentEditNotification, setShowConcurrentEditNotification] = useState(false);
  const [showTopicDialog, setShowTopicDialog] = useState(false);
  const [topicCreationNodeId, setTopicCreationNodeId] = useState<string | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastLocalUpdateRef = useRef<number>(0);
  const isLocalUpdateRef = useRef(false);
  const lastExternalUpdateRef = useRef<number>(0);

  // Check if user is admin
  const isAdmin = user?.publicMetadata?.role === 'admin';

  // Real-time subscription to roadmap data via Convex
  // Validates Requirement 11.6: Subscribe to roadmap changes
  const roadmap = useConvexQuery(api.roadmaps.getBySlug, { slug });
  const roadmapId = roadmap?._id;

  // Query user progress (only if authenticated)
  const progressData = useConvexQuery(
    api.progress.getProgressForRoadmap,
    roadmapId && isSignedIn ? { roadmapId: roadmapId as Id<'roadmaps'> } : 'skip'
  );

  // Update roadmap mutation (via Apollo/GraphQL for consistency with API layer)
  const [updateRoadmap, { loading: saving }] = useMutation(UPDATE_ROADMAP_MUTATION, {
    onCompleted: () => {
      setHasUnsavedChanges(false);
      setSaveError(null);
      lastLocalUpdateRef.current = Date.now();
      isLocalUpdateRef.current = true;
      onSave?.();
    },
    onError: (err) => {
      setSaveError(err.message);
      onError?.(err);
    },
  });

  // Create a map of nodeId -> progress status for quick lookup
  const progressMap = useMemo(() => {
    const map = new Map<string, ProgressStatus>();
    if (progressData) {
      progressData.forEach((progress) => {
        // Map Convex lowercase status to GraphQL uppercase status
        const statusMap: Record<string, ProgressStatus> = {
          'done': 'DONE',
          'in-progress': 'IN_PROGRESS',
          'skipped': 'SKIPPED',
        };
        const mappedStatus = statusMap[progress.status];
        if (mappedStatus) {
          map.set(progress.nodeId, mappedStatus);
        }
      });
    }
    return map;
  }, [progressData]);

  // Parse nodes and edges from roadmap data, enriching nodes with progress status
  const initialNodes: Node[] = useMemo(() => {
    if (!roadmap?.nodesJson) return [];

    try {
      const nodes = JSON.parse(roadmap.nodesJson);
      return nodes.map((node: Node) => ({
        ...node,
        data: {
          ...node.data,
          progressStatus: progressMap.get(node.id),
        },
      }));
    } catch (err) {
      console.error('Failed to parse nodesJson:', err);
      return [];
    }
  }, [roadmap, progressMap]);

  const initialEdges: Edge[] = useMemo(() => {
    if (!roadmap?.edgesJson) return [];

    try {
      return JSON.parse(roadmap.edgesJson);
    } catch (err) {
      console.error('Failed to parse edgesJson:', err);
      return [];
    }
  }, [roadmap]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Detect concurrent edits from other users
  // Validates Requirement 11.6: Show notification when other users make changes
  useEffect(() => {
    if (!roadmap) return;

    const currentTime = Date.now();
    const timeSinceLastLocalUpdate = currentTime - lastLocalUpdateRef.current;

    // If this is our own update (within 2 seconds), ignore it
    if (isLocalUpdateRef.current && timeSinceLastLocalUpdate < 2000) {
      isLocalUpdateRef.current = false;
      lastExternalUpdateRef.current = roadmap._creationTime;
      return;
    }

    // Check if this is an external update (not from us)
    const isExternalUpdate = lastExternalUpdateRef.current > 0 && roadmap._creationTime > lastExternalUpdateRef.current;

    // Update the last external update timestamp using ref
    lastExternalUpdateRef.current = roadmap._creationTime;

    // Show notification for external updates (scheduled asynchronously)
    if (isExternalUpdate) {
      const timeoutId = setTimeout(() => {
        setShowConcurrentEditNotification(true);
        setTimeout(() => setShowConcurrentEditNotification(false), 5000);
      }, 0);

      return () => clearTimeout(timeoutId);
    }
  }, [roadmap]);

  // Update nodes when roadmap or progress changes (real-time sync)
  // Validates Requirement 11.6: Update local state when Convex broadcasts changes
  useEffect(() => {
    if (roadmap?.nodesJson) {
      try {
        const parsedNodes = JSON.parse(roadmap.nodesJson);
        const updatedNodes = parsedNodes.map((node: Node) => ({
          ...node,
          data: {
            ...node.data,
            progressStatus: progressMap.get(node.id),
          },
        }));
        setNodes(updatedNodes);
      } catch (err) {
        console.error('Failed to parse nodesJson:', err);
      }
    }
  }, [roadmap, progressMap, setNodes]);

  // Update edges when roadmap changes (real-time sync)
  useEffect(() => {
    if (roadmap?.edgesJson) {
      try {
        const parsedEdges = JSON.parse(roadmap.edgesJson);
        setEdges(parsedEdges);
      } catch (err) {
        console.error('Failed to parse edgesJson:', err);
      }
    }
  }, [roadmap, setEdges]);

  // Debounced save function
  // Validates Requirement 11.6: Handle concurrent edits (last-write-wins)
  const debouncedSave = useCallback(() => {
    if (!roadmapId) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for 1 second
    saveTimeoutRef.current = setTimeout(() => {
      try {
        // Prepare nodes and edges for mutation (remove progress status)
        const nodesToSave = nodes.map((node) => ({
          id: node.id,
          type: node.type,
          position: {
            x: node.position.x,
            y: node.position.y,
          },
          data: {
            label: node.data.label,
            topicId: node.data.topicId,
            isReusedSkillNode: node.data.isReusedSkillNode,
            originalRoadmapId: node.data.originalRoadmapId,
          },
        }));

        const edgesToSave = edges.map((edge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: edge.type,
        }));

        // Validate JSON structure before save (Property 37: Node Addition Preserves JSON Validity)
        // This ensures the data can be serialized and parsed correctly
        const nodesJson = JSON.stringify(nodesToSave);
        const edgesJson = JSON.stringify(edgesToSave);

        // Verify the JSON can be parsed back
        JSON.parse(nodesJson);
        JSON.parse(edgesJson);

        updateRoadmap({
          variables: {
            id: roadmapId,
            input: {
              nodes: nodesToSave,
              edges: edgesToSave,
            },
          },
        });
      } catch (err) {
        console.error('Failed to validate or save roadmap data:', err);
        setSaveError(
          err instanceof Error
            ? `Invalid roadmap data: ${err.message}`
            : 'Failed to save roadmap. Invalid data structure.'
        );
        onError?.(err instanceof Error ? err : new Error('Invalid data structure'));
      }
    }, 1000);
  }, [roadmapId, nodes, edges, updateRoadmap, onError]);

  // Handle node changes with auto-save
  const handleNodesChange: OnNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);
      setHasUnsavedChanges(true);
      debouncedSave();
    },
    [onNodesChange, debouncedSave]
  );

  // Handle edge changes with auto-save
  const handleEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      onEdgesChange(changes);
      setHasUnsavedChanges(true);
      debouncedSave();
    },
    [onEdgesChange, debouncedSave]
  );

  // Handle edge creation
  const handleConnect: OnConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge(connection, eds));
      setHasUnsavedChanges(true);
      debouncedSave();
    },
    [setEdges, debouncedSave]
  );

  // Handle drop event for skill nodes from sidebar
  // Validates Requirements 11.3, 11.4:
  // - Adds node to canvas with proper metadata
  // - Sets isReusedSkillNode=true and originalRoadmapId
  // - JSON validation happens in debouncedSave before persisting
  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = event.currentTarget.getBoundingClientRect();
      const nodeData = event.dataTransfer.getData('application/reactflow');

      if (!nodeData) return;

      try {
        const droppedNode = JSON.parse(nodeData);

        // Calculate position relative to React Flow canvas
        const position = {
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        };

        // Create new node with unique ID
        // Property 38: Reused Node Metadata Presence
        // Ensures isReusedSkillNode=true and originalRoadmapId are set
        const newNode: Node = {
          id: `node-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          type: droppedNode.type || 'default',
          position,
          data: {
            label: droppedNode.data.label,
            topicId: droppedNode.data.topicId,
            isReusedSkillNode: true,
            originalRoadmapId: droppedNode.data.originalRoadmapId,
          },
        };

        setNodes((nds) => [...nds, newNode]);
        setHasUnsavedChanges(true);
        debouncedSave();
      } catch (err) {
        console.error('Failed to parse dropped node data:', err);
        setSaveError('Failed to add node. Please try again.');
      }
    },
    [setNodes, debouncedSave]
  );

  // Handle drag over to allow drop
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle node click events
  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setSelectedNodeId(node.id);
    },
    []
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

  // Handle opening topic creation dialog
  const handleAddTopic = useCallback((nodeId: string) => {
    setTopicCreationNodeId(nodeId);
    setShowTopicDialog(true);
  }, []);

  // Handle topic creation success
  const handleTopicCreated = useCallback(
    (topicId: string) => {
      if (!topicCreationNodeId) return;

      // Update node data with topicId
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === topicCreationNodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                topicId,
              },
            };
          }
          return node;
        })
      );

      // Trigger save
      setHasUnsavedChanges(true);
      debouncedSave();

      // Close dialog
      setShowTopicDialog(false);
      setTopicCreationNodeId(null);
    },
    [topicCreationNodeId, setNodes, debouncedSave]
  );

  // Handle topic dialog cancel
  const handleTopicDialogCancel = useCallback(() => {
    setShowTopicDialog(false);
    setTopicCreationNodeId(null);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  if (roadmap === undefined) {
    return (
      <div className="flex items-center justify-center w-full h-[600px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Loading roadmap...</p>
        </div>
      </div>
    );
  }

  if (roadmap === null) {
    return (
      <div className="flex items-center justify-center w-full h-[600px]">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Roadmap not found
          </h3>
          <p className="text-sm text-gray-600">
            The roadmap you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to edit it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Editor toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Editing: {roadmap.title}
          </h2>
          {hasUnsavedChanges && !saving && (
            <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Unsaved changes
            </span>
          )}
          {saving && (
            <span className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              Saving...
            </span>
          )}
          {!hasUnsavedChanges && !saving && (
            <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
              <Save className="w-3 h-3" />
              All changes saved
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {nodes.length} nodes, {edges.length} edges
          </span>
        </div>
      </div>

      {/* Concurrent edit notification */}
      {showConcurrentEditNotification && (
        <div className="m-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-start gap-3">
          <Users className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">Roadmap Updated</p>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Another user made changes to this roadmap. Your view has been updated automatically.
            </p>
          </div>
        </div>
      )}

      {/* Error alert */}
      {saveError && (
        <div className="m-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-800 dark:text-red-200 font-medium">Save Error</p>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">{saveError}</p>
          </div>
        </div>
      )}

      {/* React Flow canvas */}
      <div
        className="flex-1 bg-white dark:bg-zinc-950 relative"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={handleConnect}
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
          nodesDraggable={true}
          nodesConnectable={true}
          elementsSelectable={true}
        >
          <Controls
            showZoom
            showFitView
            showInteractive
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
        {selectedNodeId && roadmapId && isSignedIn && (
          <div className="absolute bottom-4 left-4 z-10 bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-4 border border-zinc-200 dark:border-zinc-800 max-w-md">
            <div className="mb-2">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Selected Node: {(() => {
                  const node = nodes.find(n => n.id === selectedNodeId);
                  const label = node?.data?.label;
                  return String(typeof label === 'string' ? label : '');
                })()}
              </h3>
            </div>

            {/* Add Topic button - shown only for admin users and nodes without topic */}
            {isAdmin && (() => {
              const node = nodes.find(n => n.id === selectedNodeId);
              const topicId = node?.data?.topicId;
              return !topicId;
            })() && (
                <div className="mb-3">
                  <Button
                    onClick={() => handleAddTopic(selectedNodeId)}
                    size="sm"
                    variant="outline"
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Topic Content
                  </Button>
                </div>
              )}

            {/* Show topic status if topic exists */}
            {(() => {
              const node = nodes.find(n => n.id === selectedNodeId);
              const topicId = node?.data?.topicId;
              return !!topicId;
            })() && (
                <div className="mb-3 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-xs text-green-700 dark:text-green-300">
                  ✓ Topic content available
                </div>
              )}

            <ProgressTracker
              roadmapId={String(roadmapId)}
              nodeId={selectedNodeId}
              currentStatus={progressMap.get(selectedNodeId)}
              onStatusChange={handleProgressChange}
            />
          </div>
        )}

        {/* Drop zone hint */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg px-4 py-2 shadow-sm">
            <p className="text-xs text-purple-700 dark:text-purple-300">
              💡 Drag skill nodes from the sidebar to add them to the canvas
            </p>
          </div>
        </div>
      </div>

      {/* Topic Creation Dialog */}
      <Dialog open={showTopicDialog} onOpenChange={setShowTopicDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Topic Content</DialogTitle>
            <DialogDescription>
              Create detailed content and learning resources for this node.
              {topicCreationNodeId && (
                <span className="block mt-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Node: {(() => {
                    const node = nodes.find(n => n.id === topicCreationNodeId);
                    const label = node?.data?.label;
                    return typeof label === 'string' ? label : topicCreationNodeId;
                  })()}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          {roadmapId && topicCreationNodeId && (
            <CreateTopicForm
              roadmapId={String(roadmapId)}
              nodeId={topicCreationNodeId}
              onSuccess={handleTopicCreated}
              onCancel={handleTopicDialogCancel}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
