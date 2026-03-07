/**
 * TopicPanel Component
 * 
 * Displays detailed topic content in a modal dialog when a node is clicked.
 * 
 * Features:
 * - Queries topic data using GraphQL getTopicByNodeId
 * - Displays topic title and markdown content
 * - Shows learning resources list
 * - Modal UI with close button
 * - Loading and error states
 * - Handles cases where topic doesn't exist
 * 
 * Usage:
 * ```tsx
 * import { TopicPanel } from '@/components/roadmap/TopicPanel';
 * 
 * function RoadmapPage() {
 *   const [selectedNode, setSelectedNode] = useState<{roadmapId: string, nodeId: string} | null>(null);
 * 
 *   return (
 *     <>
 *       <RoadmapViewer onNodeClick={(nodeId) => setSelectedNode({roadmapId: "...", nodeId})} />
 *       <TopicPanel
 *         roadmapId={selectedNode?.roadmapId}
 *         nodeId={selectedNode?.nodeId}
 *         isOpen={!!selectedNode}
 *         onClose={() => setSelectedNode(null)}
 *       />
 *     </>
 *   );
 * }
 * ```
 * 
 * @param roadmapId - The roadmap ID containing the topic
 * @param nodeId - The node ID to fetch topic for
 * @param isOpen - Whether the panel is open
 * @param onClose - Callback when panel is closed
 */
'use client';

import { gql, useQuery } from '@apollo/client';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { MarkdownRenderer } from './MarkdownRenderer';
import { ResourceList } from './ResourceList';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, BookOpen } from 'lucide-react';

const GET_TOPIC_BY_NODE_ID = gql`
  query GetTopicByNodeId($roadmapId: ID!, $nodeId: String!) {
    getTopicByNodeId(roadmapId: $roadmapId, nodeId: $nodeId) {
      id
      roadmapId
      nodeId
      title
      content
      resources {
        title
        url
        type
      }
    }
  }
`;

interface TopicPanelProps {
    roadmapId?: string;
    nodeId?: string;
    isOpen: boolean;
    onClose: () => void;
}

export function TopicPanel({ roadmapId, nodeId, isOpen, onClose }: TopicPanelProps) {
    const { data, loading, error } = useQuery(GET_TOPIC_BY_NODE_ID, {
        variables: { roadmapId: roadmapId || '', nodeId: nodeId || '' },
        skip: !isOpen || !roadmapId || !nodeId,
        fetchPolicy: 'cache-and-network',
    });

    const topic = data?.getTopicByNodeId;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mx-auto mb-3"></div>
                            <p className="text-sm text-gray-600">Loading topic...</p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center max-w-md">
                            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Error loading topic
                            </h3>
                            <p className="text-sm text-gray-600">{error.message}</p>
                        </div>
                    </div>
                )}

                {!loading && !error && !topic && (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center max-w-md">
                            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                No content available
                            </h3>
                            <p className="text-sm text-gray-600">
                                This topic doesn&apos;t have any content yet. Check back later or contact an administrator.
                            </p>
                        </div>
                    </div>
                )}

                {!loading && !error && topic && (
                    <>
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold text-gray-900">
                                {topic.title}
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-6 mt-4">
                            {/* Topic Content */}
                            <div>
                                <MarkdownRenderer content={topic.content} />
                            </div>

                            {/* Learning Resources Section */}
                            {topic.resources && topic.resources.length > 0 && (
                                <>
                                    <Separator />
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                            Learning Resources
                                        </h3>
                                        <ResourceList resources={topic.resources} />
                                    </div>
                                </>
                            )}
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
