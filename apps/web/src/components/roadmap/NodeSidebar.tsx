/**
 * NodeSidebar Component
 * 
 * Displays available skill nodes from existing skill roadmaps for drag-and-drop composition.
 * 
 * Features:
 * - Queries skill nodes using GraphQL (getSkillNodesForRoleRoadmap)
 * - Displays searchable/filterable list of skill nodes
 * - Implements drag source for skill nodes
 * - Shows node preview with title and description
 * - Only visible when editing role roadmaps
 * - Requires admin authentication
 * 
 * Usage:
 * ```tsx
 * import { NodeSidebar } from '@/components/roadmap/NodeSidebar';
 * 
 * function RoadmapEditor() {
 *   return (
 *     <div className="flex">
 *       <NodeSidebar />
 *       <RoadmapCanvas />
 *     </div>
 *   );
 * }
 * ```
 */
'use client';

import { useState, useMemo } from 'react';
import { gql, useQuery } from '@apollo/client';
import { useUser } from '@clerk/nextjs';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, GripVertical, Loader2 } from 'lucide-react';

const GET_SKILL_NODES_QUERY = gql`
  query GetSkillNodesForRoleRoadmap {
    getSkillNodesForRoleRoadmap {
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
  }
`;

interface Position {
    x: number;
    y: number;
}

interface NodeData {
    label: string;
    topicId?: string;
    isReusedSkillNode?: boolean;
    originalRoadmapId?: string;
}

interface SkillNode {
    id: string;
    type: string;
    position: Position;
    data: NodeData;
}

interface GetSkillNodesResponse {
    getSkillNodesForRoleRoadmap: SkillNode[];
}

export function NodeSidebar() {
    const { isSignedIn } = useUser();
    const [searchQuery, setSearchQuery] = useState('');

    // Query skill nodes
    const { data, loading, error } = useQuery<GetSkillNodesResponse>(
        GET_SKILL_NODES_QUERY,
        {
            skip: !isSignedIn,
            fetchPolicy: 'cache-and-network',
        }
    );

    // Filter nodes based on search query
    const filteredNodes = useMemo(() => {
        if (!data?.getSkillNodesForRoleRoadmap) return [];

        const nodes = data.getSkillNodesForRoleRoadmap;

        if (!searchQuery.trim()) return nodes;

        const query = searchQuery.toLowerCase();
        return nodes.filter((node) =>
            node.data.label.toLowerCase().includes(query)
        );
    }, [data, searchQuery]);

    // Handle drag start
    const handleDragStart = (event: React.DragEvent<HTMLDivElement>, node: SkillNode) => {
        // Set the node data as drag data
        event.dataTransfer.setData('application/reactflow', JSON.stringify({
            ...node,
            data: {
                ...node.data,
                isReusedSkillNode: true,
                originalRoadmapId: node.data.originalRoadmapId || 'skill-roadmap',
            },
        }));
        event.dataTransfer.effectAllowed = 'move';
    };

    // Don't render if user is not authenticated
    if (!isSignedIn) {
        return null;
    }

    return (
        <div className="w-80 h-full bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                    Skill Nodes
                </h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                    Drag skill nodes to add them to your role roadmap
                </p>

                {/* Search input */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <Input
                        type="text"
                        placeholder="Search skill nodes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Node list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loading && (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
                    </div>
                )}

                {error && (
                    <div className="text-sm text-red-600 dark:text-red-400 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        Failed to load skill nodes. Please try again.
                    </div>
                )}

                {!loading && !error && filteredNodes.length === 0 && (
                    <div className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-8">
                        {searchQuery ? 'No skill nodes found' : 'No skill nodes available'}
                    </div>
                )}

                {!loading && !error && filteredNodes.map((node) => (
                    <Card
                        key={node.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, node)}
                        className="p-3 cursor-move hover:shadow-lg transition-all duration-200 hover:border-purple-500 group"
                    >
                        <div className="flex items-start gap-3">
                            {/* Drag handle */}
                            <div className="mt-1 text-zinc-400 group-hover:text-purple-500 transition-colors">
                                <GripVertical className="w-5 h-5" />
                            </div>

                            {/* Node content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2">
                                        {node.data.label}
                                    </h3>
                                    <Badge variant="secondary" className="text-xs shrink-0">
                                        Skill
                                    </Badge>
                                </div>

                                {node.data.topicId && (
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                                        Topic ID: {node.data.topicId}
                                    </p>
                                )}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Footer hint */}
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    💡 Tip: Drag nodes from this sidebar to the canvas to reuse skill nodes in your role roadmap
                </p>
            </div>
        </div>
    );
}
