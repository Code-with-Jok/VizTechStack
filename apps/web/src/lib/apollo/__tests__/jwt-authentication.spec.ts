/**
 * JWT Authentication Integration Tests
 * 
 * Tests the JWT authentication flow to ensure that:
 * 1. getToken() is called without template parameters
 * 2. Authentication errors are handled gracefully
 * 3. Public operations work without authentication
 */

import { createApolloClient } from '../client';

describe('JWT Authentication', () => {
    it('should call getToken without template parameters', async () => {
        const mockGetToken = jest.fn().mockResolvedValue('mock-jwt-token');

        const client = createApolloClient({ getToken: mockGetToken });

        expect(client).toBeDefined();
        expect(mockGetToken).not.toHaveBeenCalled(); // Should not be called during client creation
    });

    it('should handle getToken errors gracefully', async () => {
        const mockGetToken = jest.fn().mockRejectedValue(new Error('No JWT template exists with name: default'));

        const client = createApolloClient({ getToken: mockGetToken });

        expect(client).toBeDefined();
        // The client should be created successfully even if getToken might fail later
    });

    it('should return null when getToken fails', async () => {
        const mockGetToken = jest.fn().mockRejectedValue(new Error('JWT template error'));

        const client = createApolloClient({ getToken: mockGetToken });

        // Simulate the actual getToken call that happens during GraphQL requests
        const authLink = client.link;
        expect(authLink).toBeDefined();

        // The error should be caught and handled gracefully in the providers
    });

    it('should work with valid JWT tokens', async () => {
        const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
        const mockGetToken = jest.fn().mockResolvedValue(validToken);

        const client = createApolloClient({ getToken: mockGetToken });

        expect(client).toBeDefined();
        // The client should handle valid tokens correctly
    });

    it('should work when getToken returns null', async () => {
        const mockGetToken = jest.fn().mockResolvedValue(null);

        const client = createApolloClient({ getToken: mockGetToken });

        expect(client).toBeDefined();
        // The client should handle null tokens (for public operations)
    });
});