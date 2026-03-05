import {
  CreateRoadmapInputSchema,
  RoadmapDetailSchema,
  RoadmapPageInputSchema,
  RoadmapPageSchema,
  type CreateRoadmapInput,
  type RoadmapCategory,
  type RoadmapDetail,
  type RoadmapPage,
} from '@viztechstack/types';
import {
  executeClientGraphql,
  executeServerGraphql,
} from './graphql-client';

const GET_ROADMAPS_PAGE_QUERY = `
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

const GET_ROADMAP_BY_SLUG_QUERY = `
  query GetRoadmapBySlug($slug: String!) {
    getRoadmapBySlug(slug: $slug) {
      _id
      slug
      title
      description
      category
      difficulty
      topicCount
      status
      nodesJson
      edgesJson
    }
  }
`;

const CREATE_ROADMAP_MUTATION = `
  mutation CreateRoadmap($input: CreateRoadmapInput!) {
    createRoadmap(input: $input)
  }
`;

interface GetRoadmapsPageResponse {
  getRoadmapsPage: unknown;
}

interface GetRoadmapBySlugResponse {
  getRoadmapBySlug: unknown;
}

interface CreateRoadmapResponse {
  createRoadmap: string;
}

interface GetRoadmapsPageVariables {
  input: {
    category?: RoadmapCategory;
    cursor?: string | null;
    limit: number;
  };
}

interface GetRoadmapBySlugVariables {
  slug: string;
}

interface CreateRoadmapVariables {
  input: CreateRoadmapInput;
}

interface ServerRoadmapsPageOptions {
  category?: RoadmapCategory;
  cursor?: string | null;
  limit?: number;
  token?: string;
  cache?: RequestCache;
  revalidate?: number;
  tags?: string[];
}

interface ServerRoadmapBySlugOptions {
  slug: string;
  cache?: RequestCache;
  revalidate?: number;
  tags?: string[];
}

export async function getRoadmapsPageServer(
  options: ServerRoadmapsPageOptions = {},
): Promise<RoadmapPage> {
  const input = RoadmapPageInputSchema.parse({
    category: options.category,
    cursor: options.cursor,
    limit: options.limit,
  });

  const response = await executeServerGraphql<
    GetRoadmapsPageResponse,
    GetRoadmapsPageVariables
  >({
    query: GET_ROADMAPS_PAGE_QUERY,
    variables: {
      input: {
        category: input.category,
        cursor: input.cursor ?? null,
        limit: input.limit,
      },
    },
    token: options.token,
    cache: options.cache,
    next:
      options.revalidate !== undefined || options.tags !== undefined
        ? {
            revalidate: options.revalidate,
            tags: options.tags,
          }
        : undefined,
  });

  return RoadmapPageSchema.parse(response.getRoadmapsPage);
}

export async function getRoadmapBySlugServer(
  options: ServerRoadmapBySlugOptions,
): Promise<RoadmapDetail | null> {
  const response = await executeServerGraphql<
    GetRoadmapBySlugResponse,
    GetRoadmapBySlugVariables
  >({
    query: GET_ROADMAP_BY_SLUG_QUERY,
    variables: { slug: options.slug },
    cache: options.cache,
    next:
      options.revalidate !== undefined || options.tags !== undefined
        ? {
            revalidate: options.revalidate,
            tags: options.tags,
          }
        : undefined,
  });

  if (response.getRoadmapBySlug === null) {
    return null;
  }

  return RoadmapDetailSchema.parse(response.getRoadmapBySlug);
}

export async function createRoadmapClient(
  input: CreateRoadmapInput,
  token?: string,
): Promise<string> {
  const parsedInput = CreateRoadmapInputSchema.parse(input);

  const response = await executeClientGraphql<
    CreateRoadmapResponse,
    CreateRoadmapVariables
  >({
    query: CREATE_ROADMAP_MUTATION,
    variables: {
      input: parsedInput,
    },
    token,
    cache: 'no-store',
  });

  return response.createRoadmap;
}
