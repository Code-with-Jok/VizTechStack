/**
 * useRoadmapBySlug Hook
 * 
 * Custom hook for fetching a single roadmap by its slug.
 * 
 * Features:
 * - Fetches roadmap with nodes and edges for visualization
 * - Cache-and-network fetch policy for fresh data
 * - Returns null if roadmap not found
 * 
 * @param slug - The roadmap slug to fetch
 * @returns Query result with roadmap data, loading state, and error
 */
'use client';

import { gql, useQuery } from '@apollo/client';

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

export function useRoadmapBySlug(slug: string) {
    const { data, loading, error } = useQuery(GET_ROADMAP_BY_SLUG, {
        variables: { slug },
        fetchPolicy: 'cache-and-network',
    });

    return {
        roadmap: data?.getRoadmapBySlug ?? null,
        loading,
        error,
    };
}
