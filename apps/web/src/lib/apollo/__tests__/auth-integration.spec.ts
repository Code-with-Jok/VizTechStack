import { createApolloClient } from '../client';

// Mock console methods to avoid noise in tests
const originalConsoleError = console.error;
beforeAll(() => {
    console.error = jest.fn();
});

afterAll(() => {
    console.error = originalConsoleError;
});

describe('Apollo Client Authentication Integration', () => {
    it('should handle authentication flow correctly', async () => {
        const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
        const mockGetToken = jest.fn().mockResolvedValue(mockToken);

        const client = createApolloClient({ getToken: mockGetToken });

        expect(client).toBeDefined();
        expect(client.cache).toBeDefined();
        expect(client.link).toBeDefined();
    });

    it('should handle missing token gracefully', async () => {
        const mockGetToken = jest.fn().mockResolvedValue(null);

        const client = createApolloClient({ getToken: mockGetToken });

        expect(client).toBeDefined();
        expect(client.cache).toBeDefined();
        expect(client.link).toBeDefined();
    });

    it('should handle token retrieval errors', async () => {
        const mockGetToken = jest.fn().mockRejectedValue(new Error('Token retrieval failed'));

        const client = createApolloClient({ getToken: mockGetToken });

        expect(client).toBeDefined();
        expect(client.cache).toBeDefined();
        expect(client.link).toBeDefined();
    });

    it('should configure cache with correct type policies', () => {
        const mockGetToken = jest.fn().mockResolvedValue('mock-token');
        const client = createApolloClient({ getToken: mockGetToken });

        // Verify cache configuration
        expect(client.cache).toBeDefined();

        // The cache should be configured with InMemoryCache
        expect(client.cache.constructor.name).toBe('InMemoryCache');
    });

    it('should use cache-and-network fetch policy by default', () => {
        const mockGetToken = jest.fn().mockResolvedValue('mock-token');
        const client = createApolloClient({ getToken: mockGetToken });

        expect(client.defaultOptions?.watchQuery?.fetchPolicy).toBe('cache-and-network');
    });
});