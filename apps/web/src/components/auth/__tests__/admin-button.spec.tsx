import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock @clerk/nextjs to avoid module resolution issues
jest.mock('@clerk/nextjs', () => {
    const ReactMock = require('react'); // eslint-disable-line @typescript-eslint/no-require-imports

    return {
        useUser: jest.fn(),
        ClerkProvider: ({ children }: { children: React.ReactNode }) =>
            ReactMock.createElement('div', { 'data-testid': 'clerk-provider' }, children),
    };
});

// Mock the useAuth hook
jest.mock('@/lib/hooks/use-auth');

// Mock Next.js Link component
jest.mock('next/link', () => {
    return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
        return <a href={href}>{children}</a>;
    };
});

// Import after mocking
import { AdminButton } from '../admin-button';
import { useAuth } from '@/lib/hooks/use-auth';
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('AdminButton', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render admin button when user is admin and not loading', () => {
        mockUseAuth.mockReturnValue({
            isSignedIn: true,
            isAdmin: true,
            isUser: false,
            userId: 'user-123',
            role: 'admin',
            isLoading: false,
        });

        render(<AdminButton />);

        const adminButton = screen.getByRole('link', { name: /admin/i });
        expect(adminButton).toBeInTheDocument();
        expect(adminButton).toHaveAttribute('href', '/admin/roadmaps');

        // Check for Shield icon and text
        expect(screen.getByText('Admin')).toBeInTheDocument();
    });

    it('should return null when user is not admin', () => {
        mockUseAuth.mockReturnValue({
            isSignedIn: true,
            isAdmin: false,
            isUser: true,
            userId: 'user-123',
            role: 'user',
            isLoading: false,
        });

        const { container } = render(<AdminButton />);
        expect(container.firstChild).toBeNull();
    });

    it('should return null when auth is loading', () => {
        mockUseAuth.mockReturnValue({
            isSignedIn: false,
            isAdmin: false,
            isUser: false,
            userId: null,
            role: null,
            isLoading: true,
        });

        const { container } = render(<AdminButton />);
        expect(container.firstChild).toBeNull();
    });

    it('should return null when user is not signed in', () => {
        mockUseAuth.mockReturnValue({
            isSignedIn: false,
            isAdmin: false,
            isUser: false,
            userId: null,
            role: null,
            isLoading: false,
        });

        const { container } = render(<AdminButton />);
        expect(container.firstChild).toBeNull();
    });

    it('should have correct button styling', () => {
        mockUseAuth.mockReturnValue({
            isSignedIn: true,
            isAdmin: true,
            isUser: false,
            userId: 'user-123',
            role: 'admin',
            isLoading: false,
        });

        render(<AdminButton />);

        const adminButton = screen.getByRole('link', { name: /admin/i });

        // Check that it's rendered as a link (asChild prop working)
        expect(adminButton.tagName).toBe('A');
        expect(adminButton).toHaveAttribute('href', '/admin/roadmaps');
    });
});