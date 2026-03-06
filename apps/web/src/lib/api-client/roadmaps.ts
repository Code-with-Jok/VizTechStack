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

const GET_ROADMAPS_LEGACY_QUERY = `
  query GetRoadmapsLegacy {
    getRoadmaps {
      _id
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

interface GetRoadmapsLegacyResponse {
  getRoadmaps: unknown;
}

interface GetRoadmapBySlugResponse {
  getRoadmapBySlug: unknown;
}

interface CreateRoadmapResponse {
  createRoadmap: string;
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
      normalizeRoadmapPageResponse(response.getRoadmapsPage),
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

    const normalizedItems = Array.isArray(legacyResponse.getRoadmaps)
      ? legacyResponse.getRoadmaps.map((item) => normalizeRoadmapRecord(item))
      : legacyResponse.getRoadmaps;

    return RoadmapPageSchema.parse({
      items: normalizedItems,
      nextCursor: null,
      hasMore: false,
    });
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

  return response.createRoadmap;
}

type GraphqlRoadmapCategory = 'ROLE' | 'SKILL' | 'BEST_PRACTICE';
type GraphqlRoadmapDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
type GraphqlRoadmapStatus = 'PUBLIC' | 'DRAFT' | 'PRIVATE';

interface GraphqlCreateRoadmapInput extends Omit<CreateRoadmapInput, 'category' | 'difficulty' | 'status'> {
  category: GraphqlRoadmapCategory;
  difficulty: GraphqlRoadmapDifficulty;
  status: GraphqlRoadmapStatus;
}

function mapCreateRoadmapInputToGraphql(input: CreateRoadmapInput): GraphqlCreateRoadmapInput {
  return {
    ...input,
    category: mapRequiredCategoryToGraphql(input.category),
    difficulty: mapDifficultyToGraphql(input.difficulty),
    status: mapStatusToGraphql(input.status),
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

  return {
    ...payload,
    category: mapCategoryFromGraphql(payload.category),
    difficulty: mapDifficultyFromGraphql(payload.difficulty),
    status: mapStatusFromGraphql(payload.status),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
