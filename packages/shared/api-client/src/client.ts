import { ApolloClient, InMemoryCache, HttpLink, from, ApolloLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

/**
 * Create Apollo Client instance
 * @param uri - GraphQL endpoint URL
 * @param getToken - Optional function to get authentication token
 * @returns Configured Apollo Client
 */
export function createApolloClient(uri?: string, getToken?: () => Promise<string | null>) {
  const httpLink = new HttpLink({
    uri: uri || process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql',
  });

  // Auth link to add JWT token to headers
  const authLink = setContext(async (_, { headers }) => {
    let token: string | null = null;

    if (getToken) {
      token = await getToken();
    }

    return {
      headers: {
        ...headers,
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
    };
  });

  return new ApolloClient({
    link: from([authLink, httpLink]),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            getRoadmapsPage: {
              // Merge paginated results
              keyArgs: ['input', ['category']],
              merge(existing, incoming) {
                if (!existing) return incoming;

                return {
                  ...incoming,
                  items: [...(existing.items || []), ...(incoming.items || [])],
                };
              },
            },
          },
        },
      },
    }),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network',
        errorPolicy: 'all',
      },
      query: {
        fetchPolicy: 'network-only',
        errorPolicy: 'all',
      },
      mutate: {
        errorPolicy: 'all',
      },
    },
  });
}

/**
 * Default Apollo Client instance
 * Can be used directly or create custom instance with createApolloClient
 */
export const apolloClient = createApolloClient();
