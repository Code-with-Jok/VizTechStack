import { gql, useQuery } from '@apollo/client';
import { z } from 'zod';
import { handleValidationError } from '@viztechstack/validation';

// Import generated types and schemas
// Note: These will be available after running codegen with operations
// For now, we'll define inline schemas based on generated types

// Temporary inline schema until we have operations generated
const RoadmapSchema = z.object({
  _id: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.enum(['ROLE', 'SKILL', 'BEST_PRACTICE']),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  topicCount: z.number().int(),
  status: z.enum(['PUBLIC', 'DRAFT', 'PRIVATE']),
  nodesJson: z.string().nullable().optional(),
  edgesJson: z.string().nullable().optional(),
});

const RoadmapPageSchema = z.object({
  items: z.array(RoadmapSchema),
  nextCursor: z.string().nullable().optional(),
  hasMore: z.boolean(),
});

type RoadmapPageInput = {
  category?: 'ROLE' | 'SKILL' | 'BEST_PRACTICE';
  cursor?: string | null;
  limit?: number;
};

type RoadmapPage = z.infer<typeof RoadmapPageSchema>;

const GET_ROADMAPS_PAGE = gql`
  query GetRoadmapsPage($input: RoadmapPageInput) {
    getRoadmapsPage(input: $input) {
      items {
        _id
        slug
        title
        description
        category
        difficulty
        topicCount
        status
      }
      nextCursor
      hasMore
    }
  }
`;

/**
 * Hook to fetch roadmaps with runtime validation
 * @param input - Query input parameters
 * @returns Roadmaps data with loading and error states
 */
export function useRoadmaps(input?: RoadmapPageInput) {
  const { data, loading, error, fetchMore, refetch } = useQuery(GET_ROADMAPS_PAGE, {
    variables: { input },
  });

  // Runtime validation
  let validatedData: RoadmapPage | undefined;
  let validationError: Error | undefined;

  if (data?.getRoadmapsPage) {
    try {
      validatedData = RoadmapPageSchema.parse(data.getRoadmapsPage);
    } catch (err) {
      validationError = handleValidationError(err);
    }
  }

  return {
    roadmaps: validatedData?.items ?? [],
    nextCursor: validatedData?.nextCursor,
    hasMore: validatedData?.hasMore ?? false,
    loading,
    error: error || validationError,
    refetch,
    fetchMore: async () => {
      if (!validatedData?.nextCursor) return;

      await fetchMore({
        variables: {
          input: {
            ...input,
            cursor: validatedData.nextCursor,
          },
        },
      });
    },
  };
}
