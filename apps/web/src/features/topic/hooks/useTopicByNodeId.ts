/**
 * useTopicByNodeId Hook
 * 
 * Custom hook for fetching topic content by node ID.
 * 
 * Features:
 * - Fetches topic with content and resources
 * - Skips query when not needed (e.g., modal closed)
 * - Cache-and-network fetch policy for fresh data
 * 
 * @param roadmapId - The roadmap ID containing the topic
 * @param nodeId - The node ID to fetch topic for
 * @param skip - Whether to skip the query (default: false)
 * @returns Query result with topic data, loading state, and error
 */
'use client';

import { gql, useQuery } from '@apollo/client';

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

interface UseTopicByNodeIdOptions {
    roadmapId: string;
    nodeId: string;
    skip?: boolean;
}

export function useTopicByNodeId({ roadmapId, nodeId, skip = false }: UseTopicByNodeIdOptions) {
    const { data, loading, error } = useQuery(GET_TOPIC_BY_NODE_ID, {
        variables: { roadmapId, nodeId },
        skip,
        fetchPolicy: 'cache-and-network',
    });

    return {
        topic: data?.getTopicByNodeId ?? null,
        loading,
        error,
    };
}
