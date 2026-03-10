import { createApolloClient } from '../client';

// Mock the Apollo Client dependencies
jest.mock('@apollo/client', () => ({
    ApolloClient: jest.fn(),
    InMemoryCache: jest.fn(() => ({})),
    HttpLink: jest.fn(() => ({})),
    from: jest.fn((links) => links),
}));

jest.mock('@apollo/client/link/context', () => ({
    setContext: jest.fn((fn) => ({ setContext: fn })),
}));

jest.mock('@apollo/client/link/error', () => ({
    onError: jest.fn((fn) => ({ onError: fn })),
}));

describe('createApolloClient', () => {
    const mockGetToken = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create Apollo Client with correct configuration', () => {
        createApolloClient({ getToken: mockGetToken });

        const { ApolloClient } = jest.requireMock('@apollo/client');
        expect(ApolloClient).toHaveBeenCalledWith({
            link: expect.any(Array),
            cache: {},
            defaultOptions: {
                watchQuery: {
                    fetchPolicy: 'cache-and-network',
                },
            },
        });
    });

    it('should use correct GraphQL endpoint from environment', () => {
        const originalEnv = process.env.NEXT_PUBLIC_GRAPHQL_URL;
        process.env.NEXT_PUBLIC_GRAPHQL_URL = 'https://api.example.com/graphql';

        createApolloClient({ getToken: mockGetToken });

        // Restore original env
        process.env.NEXT_PUBLIC_GRAPHQL_URL = originalEnv;

        const { HttpLink } = jest.requireMock('@apollo/client');
        expect(HttpLink).toHaveBeenCalledWith({
            uri: 'https://api.example.com/graphql',
        });
    });

    it('should fallback to localhost when no environment variable is set', () => {
        const originalEnv = process.env.NEXT_PUBLIC_GRAPHQL_URL;
        delete process.env.NEXT_PUBLIC_GRAPHQL_URL;

        createApolloClient({ getToken: mockGetToken });

        // Restore original env
        process.env.NEXT_PUBLIC_GRAPHQL_URL = originalEnv;

        const { HttpLink } = jest.requireMock('@apollo/client');
        expect(HttpLink).toHaveBeenCalledWith({
            uri: 'http://localhost:4000/graphql',
        });
    });

    it('should accept getToken function parameter', () => {
        const mockToken = 'mock-jwt-token';
        mockGetToken.mockResolvedValue(mockToken);

        const client = createApolloClient({ getToken: mockGetToken });

        expect(client).toBeDefined();
        expect(mockGetToken).not.toHaveBeenCalled(); // Should not be called during client creation
    });
});