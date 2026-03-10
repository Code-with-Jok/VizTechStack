import { renderHook } from '@testing-library/react';
import { useUser } from '@clerk/nextjs';
import { useAuth } from '../use-auth';

// Mock Clerk's useUser hook
jest.mock('@clerk/nextjs', () => ({
    useUser: jest.fn(),
}));

const mockUseUser = useUser as jest.MockedFunction<typeof useUser>;

// Mock types for testing
interface MockUser {
    id: string;
    publicMetadata: {
        role?: string;
    };
}

interface MockUseUserReturn {
    isSignedIn: boolean | undefined;
    user: MockUser | null;
    isLoaded: boolean;
}

describe('useAuth', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return loading state when Clerk is not loaded', () => {
        const mockReturn: MockUseUserReturn = {
            isSignedIn: false,
            user: null,
            isLoaded: false,
        };
        mockUseUser.mockReturnValue(mockReturn as ReturnType<typeof useUser>);

        const { result } = renderHook(() => useAuth());

        expect(result.current).toEqual({
            isSignedIn: false,
            isAdmin: false,
            isUser: true, // Default to user when no role
            userId: null,
            role: null,
            isLoading: true,
        });
    });

    it('should return signed out state when user is not signed in', () => {
        const mockReturn: MockUseUserReturn = {
            isSignedIn: false,
            user: null,
            isLoaded: true,
        };
        mockUseUser.mockReturnValue(mockReturn as ReturnType<typeof useUser>);

        const { result } = renderHook(() => useAuth());

        expect(result.current).toEqual({
            isSignedIn: false,
            isAdmin: false,
            isUser: true,
            userId: null,
            role: null,
            isLoading: false,
        });
    });

    it('should return admin state when user has admin role', () => {
        const mockReturn: MockUseUserReturn = {
            isSignedIn: true,
            user: {
                id: 'user_123',
                publicMetadata: {
                    role: 'admin',
                },
            },
            isLoaded: true,
        };
        mockUseUser.mockReturnValue(mockReturn as ReturnType<typeof useUser>);

        const { result } = renderHook(() => useAuth());

        expect(result.current).toEqual({
            isSignedIn: true,
            isAdmin: true,
            isUser: false,
            userId: 'user_123',
            role: 'admin',
            isLoading: false,
        });
    });

    it('should return user state when user has user role', () => {
        const mockReturn: MockUseUserReturn = {
            isSignedIn: true,
            user: {
                id: 'user_456',
                publicMetadata: {
                    role: 'user',
                },
            },
            isLoaded: true,
        };
        mockUseUser.mockReturnValue(mockReturn as ReturnType<typeof useUser>);

        const { result } = renderHook(() => useAuth());

        expect(result.current).toEqual({
            isSignedIn: true,
            isAdmin: false,
            isUser: true,
            userId: 'user_456',
            role: 'user',
            isLoading: false,
        });
    });

    it('should default to user role when no role is specified', () => {
        const mockReturn: MockUseUserReturn = {
            isSignedIn: true,
            user: {
                id: 'user_789',
                publicMetadata: {},
            },
            isLoaded: true,
        };
        mockUseUser.mockReturnValue(mockReturn as ReturnType<typeof useUser>);

        const { result } = renderHook(() => useAuth());

        expect(result.current).toEqual({
            isSignedIn: true,
            isAdmin: false,
            isUser: true,
            userId: 'user_789',
            role: null,
            isLoading: false,
        });
    });

    it('should handle undefined isSignedIn gracefully', () => {
        const mockReturn: MockUseUserReturn = {
            isSignedIn: undefined,
            user: null,
            isLoaded: true,
        };
        mockUseUser.mockReturnValue(mockReturn as ReturnType<typeof useUser>);

        const { result } = renderHook(() => useAuth());

        expect(result.current.isSignedIn).toBe(false);
    });
});