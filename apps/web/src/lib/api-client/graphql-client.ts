interface GraphqlErrorItem {
  message?: unknown;
}

interface GraphqlEnvelope<TData> {
  data?: TData;
  errors?: GraphqlErrorItem[];
}

interface GraphqlRequestOptions<TVariables> {
  query: string;
  variables?: TVariables;
  token?: string;
  cache?: RequestCache;
  next?: {
    revalidate?: number;
    tags?: string[];
  };
}

export class GraphqlRequestError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'GraphqlRequestError';
    this.status = status;
  }
}

export async function executeServerGraphql<TData, TVariables = undefined>(
  options: GraphqlRequestOptions<TVariables>,
): Promise<TData> {
  const endpoints = resolveServerGraphqlEndpoints();
  let lastError: unknown;

  for (const endpoint of endpoints) {
    try {
      return await executeGraphql(endpoint, options);
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError instanceof Error) {
    throw lastError;
  }

  throw new GraphqlRequestError('GraphQL request failed for all configured server endpoints.');
}

export async function executeClientGraphql<TData, TVariables = undefined>(
  options: GraphqlRequestOptions<TVariables>,
): Promise<TData> {
  const endpoint = resolveClientGraphqlEndpoint();
  return executeGraphql(endpoint, options);
}

async function executeGraphql<TData, TVariables>(
  endpoint: string,
  options: GraphqlRequestOptions<TVariables>,
): Promise<TData> {
  const requestInit: RequestInit & {
    next?: {
      revalidate?: number;
      tags?: string[];
    };
  } = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: JSON.stringify({
      query: options.query,
      variables: options.variables,
    }),
    cache: options.cache,
    next: options.next,
  };

  let response: Response;

  try {
    response = await fetch(endpoint, requestInit);
  } catch (error) {
    // Handle network failures (ECONNREFUSED, fetch failed, etc.)
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isNetworkError =
      errorMessage.includes('ECONNREFUSED') ||
      errorMessage.includes('fetch failed') ||
      errorMessage.includes('ENOTFOUND') ||
      errorMessage.includes('network');

    if (isNetworkError && process.env.NODE_ENV === 'development') {
      throw new GraphqlRequestError(
        `Failed to connect to GraphQL API at ${endpoint}. ` +
        `API server not running. Start it with: pnpm dev --filter @viztechstack/api`,
      );
    }

    throw new GraphqlRequestError(
      `Network error connecting to GraphQL API at ${endpoint}: ${errorMessage}`,
    );
  }

  if (!response.ok) {
    throw new GraphqlRequestError(
      `GraphQL request failed: ${response.status} ${response.statusText}`,
      response.status,
    );
  }

  const envelope = (await response.json()) as GraphqlEnvelope<TData>;

  if (Array.isArray(envelope.errors) && envelope.errors.length > 0) {
    const message = envelope.errors
      .map((error) =>
        typeof error.message === 'string' ? error.message : 'Unknown GraphQL error',
      )
      .join(', ');

    throw new GraphqlRequestError(`GraphQL error: ${message}`, response.status);
  }

  if (!('data' in envelope) || envelope.data === undefined) {
    throw new GraphqlRequestError('GraphQL response did not include data.');
  }

  return envelope.data;
}

function resolveServerGraphqlEndpoints(): string[] {
  const endpoints = new Set<string>();
  const configuredEndpoint = process.env.GRAPHQL_URL;
  const publicConfiguredEndpoint = process.env.NEXT_PUBLIC_GRAPHQL_URL;
  const explicitFallbackEndpoint = process.env.GRAPHQL_URL_FALLBACK;

  if (configuredEndpoint) {
    endpoints.add(configuredEndpoint);
  }

  if (publicConfiguredEndpoint) {
    endpoints.add(publicConfiguredEndpoint);
  }

  if (explicitFallbackEndpoint) {
    endpoints.add(explicitFallbackEndpoint);
  }

  // Safety fallback for Vercel previews where preview API URLs may be protected.
  if (process.env.VERCEL === '1') {
    endpoints.add('https://viz-tech-stack-api.vercel.app/graphql');
  }

  if (endpoints.size > 0) {
    return Array.from(endpoints);
  }

  if (process.env.NODE_ENV === 'development') {
    return ['http://localhost:4000/graphql'];
  }

  throw new GraphqlRequestError('GRAPHQL_URL is required in non-development environments.');
}

function resolveClientGraphqlEndpoint(): string {
  if (process.env.NEXT_PUBLIC_GRAPHQL_URL) {
    return process.env.NEXT_PUBLIC_GRAPHQL_URL;
  }

  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:4000/graphql';
  }

  throw new GraphqlRequestError(
    'NEXT_PUBLIC_GRAPHQL_URL is required in non-development environments.',
  );
}
