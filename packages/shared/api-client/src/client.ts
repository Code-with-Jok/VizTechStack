import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';

/**
 * Create Apollo Client instance
 * @param uri - GraphQL endpoint URL
 * @returns Configured Apollo Client
 */
export function createApolloClient(uri?: string) {
  const httpLink = new HttpLink({
    uri: uri || process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql',
  });

  return new ApolloClient({
    link: from([httpLink]),
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
