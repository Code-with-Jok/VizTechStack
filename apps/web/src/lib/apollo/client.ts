import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

interface CreateApolloClientOptions {
    getToken: () => Promise<string | null>;
}

export function createApolloClient({ getToken }: CreateApolloClientOptions) {
    // HTTP connection to the GraphQL API
    const httpLink = new HttpLink({
        uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql',
    });

    // Authentication link - adds JWT token to headers
    const authLink = setContext(async (_, { headers }) => {
        const token = await getToken();

        return {
            headers: {
                ...headers,
                authorization: token ? `Bearer ${token}` : '',
            },
        };
    });

    // Error handling link
    const errorLink = onError(({ graphQLErrors, networkError }) => {
        if (graphQLErrors) {
            graphQLErrors.forEach(({ message, extensions }) => {
                if (extensions?.code === 'UNAUTHENTICATED') {
                    console.error('[Auth Error]:', message);
                    // Token is invalid, expired, or JWT template issue
                    // The frontend will handle this gracefully by showing login UI
                } else if (extensions?.code === 'FORBIDDEN') {
                    console.error('[Permission Error]:', message);
                    // User doesn't have required permissions
                } else {
                    console.error('[GraphQL Error]:', message, extensions);
                }
            });
        }

        if (networkError) {
            console.error('[Network Error]:', networkError);
            console.error('GraphQL endpoint:', process.env.NEXT_PUBLIC_GRAPHQL_URL);

            // Check if it's a connection error
            if (networkError.message.includes('fetch')) {
                console.error('Possible causes:');
                console.error('1. Backend API is not running');
                console.error('2. GraphQL endpoint URL is incorrect');
                console.error('3. CORS configuration issue');
                console.error('4. JWT authentication failure');
            }
        }
    });

    // Create Apollo Client with combined links
    return new ApolloClient({
        link: from([errorLink, authLink, httpLink]),
        cache: new InMemoryCache({
            typePolicies: {
                Query: {
                    fields: {
                        roadmaps: {
                            // Replace existing data instead of appending
                            merge(_, incoming) {
                                return incoming;
                            },
                        },
                    },
                },
            },
        }),
        defaultOptions: {
            watchQuery: {
                // Use cache-and-network to ensure fresh data while showing cached data immediately
                fetchPolicy: 'cache-and-network',
            },
        },
    });
}