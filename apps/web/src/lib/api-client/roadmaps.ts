import {
  CreateRoadmapInputSchema,
  type RoadmapDifficulty,
  RoadmapDetailSchema,
  RoadmapPageInputSchema,
  RoadmapPageSchema,
  type RoadmapStatus,
  type CreateRoadmapInput,
  type RoadmapCategory,
  type RoadmapDetail,
  type RoadmapPage,
} from '@viztechstack/types';
import {
  executeClientGraphql,
  executeServerGraphql,
  GraphqlRequestError,
} from './graphql-client';

const GET_ROADMAPS_PAGE_QUERY = `
  query GetRoadmapsPage($input: RoadmapPageInput) {
    listRoadmaps(input: $input) {
      items {
        id
        slug
        title
        description
        category
        difficulty
        topicCount
        status
      }
      nextCursor
      isDone
    }
  }
`;

const GET_ROADMAPS_LEGACY_QUERY = `
  query GetRoadmapsLegacy {
    listRoadmaps(input: {limit: 100}) {
      items {
        id
        slug
        title
        description
        category
        difficulty
        topicCount
        status
      }
      isDone
    }
  }
`;

const GET_ROADMAP_BY_SLUG_QUERY = `
  query GetRoadmapBySlug($slug: String!) {
    getRoadmapBySlug(slug: $slug) {
      id
      slug
      title
      description
      category
      difficulty
      topicCount
      status
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
    }
  }
`;

const CREATE_ROADMAP_MUTATION = `
  mutation CreateRoadmap($input: CreateRoadmapInput!) {
    createRoadmap(input: $input) {
      id
      slug
      title
      description
      category
      difficulty
      topicCount
      status
    }
  }
`;

const DELETE_ROADMAP_MUTATION = `
  mutation DeleteRoadmap($id: ID!) {
    deleteRoadmap(id: $id)
  }
`;

interface GetRoadmapsPageResponse {
  listRoadmaps: unknown;
}

interface GetRoadmapsLegacyResponse {
  listRoadmaps: unknown;
}

interface GetRoadmapBySlugResponse {
  getRoadmapBySlug: unknown;
}

interface CreateRoadmapResponse {
  createRoadmap: {
    id: string;
    slug: string;
    title: string;
    description: string;
    category: string;
    difficulty: string;
    topicCount: number;
    status: string;
  };
}

interface DeleteRoadmapResponse {
  deleteRoadmap: boolean;
}

interface GetRoadmapsPageVariables {
  input: {
    category?: GraphqlRoadmapCategory;
    cursor?: string | null;
    limit: number;
  };
}

interface GetRoadmapBySlugVariables {
  slug: string;
}

interface CreateRoadmapVariables {
  input: GraphqlCreateRoadmapInput;
}

interface DeleteRoadmapVariables {
  id: string;
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

  try {
    const response = await executeServerGraphql<
      GetRoadmapsPageResponse,
      GetRoadmapsPageVariables
    >({
      query: GET_ROADMAPS_PAGE_QUERY,
      variables: {
        input: {
          category: mapCategoryToGraphql(input.category),
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

    return RoadmapPageSchema.parse(
      normalizeRoadmapPageResponse(response.listRoadmaps),
    );
  } catch (error) {
    if (!(error instanceof GraphqlRequestError)) {
      throw error;
    }

    const legacyResponse = await executeServerGraphql<
      GetRoadmapsLegacyResponse,
      undefined
    >({
      query: GET_ROADMAPS_LEGACY_QUERY,
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

    return RoadmapPageSchema.parse(
      normalizeRoadmapPageResponse(legacyResponse.listRoadmaps),
    );
  }
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

  return RoadmapDetailSchema.parse(normalizeRoadmapRecord(response.getRoadmapBySlug));
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
      input: mapCreateRoadmapInputToGraphql(parsedInput),
    },
    token,
    cache: 'no-store',
  });

  return response.createRoadmap.slug;
}

export async function deleteRoadmapClient(
  id: string,
  token?: string,
): Promise<boolean> {
  const response = await executeClientGraphql<
    DeleteRoadmapResponse,
    DeleteRoadmapVariables
  >({
    query: DELETE_ROADMAP_MUTATION,
    variables: { id },
    token,
    cache: 'no-store',
  });

  return response.deleteRoadmap;
}

type GraphqlRoadmapCategory = 'ROLE' | 'SKILL' | 'BEST_PRACTICE';
type GraphqlRoadmapDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
type GraphqlRoadmapStatus = 'PUBLIC' | 'DRAFT' | 'PRIVATE';

interface GraphqlCreateRoadmapInput {
  slug: string;
  title: string;
  description: string;
  category: GraphqlRoadmapCategory;
  difficulty: GraphqlRoadmapDifficulty;
  status: GraphqlRoadmapStatus;
  nodes: unknown[];
  edges: unknown[];
  topicCount: number;
}

function mapCreateRoadmapInputToGraphql(input: CreateRoadmapInput): GraphqlCreateRoadmapInput {
  // Parse nodesJson and edgesJson strings into arrays for GraphQL
  const nodes = JSON.parse(input.nodesJson || '[]');
  const edges = JSON.parse(input.edgesJson || '[]');

  return {
    slug: input.slug,
    title: input.title,
    description: input.description,
    category: mapRequiredCategoryToGraphql(input.category),
    difficulty: mapDifficultyToGraphql(input.difficulty),
    status: mapStatusToGraphql(input.status),
    nodes,
    edges,
    topicCount: input.topicCount,
  };
}

function mapRequiredCategoryToGraphql(category: RoadmapCategory): GraphqlRoadmapCategory {
  switch (category) {
    case 'role':
      return 'ROLE';
    case 'skill':
      return 'SKILL';
    case 'best-practice':
      return 'BEST_PRACTICE';
  }
}

function mapCategoryToGraphql(category?: RoadmapCategory): GraphqlRoadmapCategory | undefined {
  if (!category) {
    return undefined;
  }
  return mapRequiredCategoryToGraphql(category);
}

function mapDifficultyToGraphql(difficulty: RoadmapDifficulty): GraphqlRoadmapDifficulty {
  switch (difficulty) {
    case 'beginner':
      return 'BEGINNER';
    case 'intermediate':
      return 'INTERMEDIATE';
    case 'advanced':
      return 'ADVANCED';
  }
}

function mapStatusToGraphql(status: RoadmapStatus): GraphqlRoadmapStatus {
  switch (status) {
    case 'public':
      return 'PUBLIC';
    case 'draft':
      return 'DRAFT';
    case 'private':
      return 'PRIVATE';
  }
}

function mapCategoryFromGraphql(category: unknown): unknown {
  switch (category) {
    case 'ROLE':
      return 'role';
    case 'SKILL':
      return 'skill';
    case 'BEST_PRACTICE':
      return 'best-practice';
    default:
      return category;
  }
}

function mapDifficultyFromGraphql(difficulty: unknown): unknown {
  switch (difficulty) {
    case 'BEGINNER':
      return 'beginner';
    case 'INTERMEDIATE':
      return 'intermediate';
    case 'ADVANCED':
      return 'advanced';
    default:
      return difficulty;
  }
}

function mapStatusFromGraphql(status: unknown): unknown {
  switch (status) {
    case 'PUBLIC':
      return 'public';
    case 'DRAFT':
      return 'draft';
    case 'PRIVATE':
      return 'private';
    default:
      return status;
  }
}

function normalizeRoadmapPageResponse(payload: unknown): unknown {
  if (!isRecord(payload) || !Array.isArray(payload.items)) {
    return payload;
  }

  return {
    ...payload,
    items: payload.items.map((item) => normalizeRoadmapRecord(item)),
  };
}

function normalizeRoadmapRecord(payload: unknown): unknown {
  if (!isRecord(payload)) {
    return payload;
  }

  const normalized: Record<string, unknown> = {
    ...payload,
    category: mapCategoryFromGraphql(payload.category),
    difficulty: mapDifficultyFromGraphql(payload.difficulty),
    status: mapStatusFromGraphql(payload.status),
  };

  // Transform nodes array to nodesJson string if present
  if (Array.isArray(payload.nodes)) {
    normalized.nodesJson = JSON.stringify(payload.nodes);
    delete normalized.nodes;
  }

  // Transform edges array to edgesJson string if present
  if (Array.isArray(payload.edges)) {
    normalized.edgesJson = JSON.stringify(payload.edges);
    delete normalized.edges;
  }

  return normalized;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
