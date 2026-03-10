import { render, screen } from '@testing-library/react';
import { ApolloError } from '@apollo/client';
import { RoadmapDetail } from '../roadmap-detail';
import { useRoadmapBySlug } from '@/lib/hooks/use-roadmap';
import type { Roadmap } from '@/features/roadmap/types';

// Mock the useRoadmapBySlug hook
jest.mock('@/lib/hooks/use-roadmap', () => ({
    useRoadmapBySlug: jest.fn(),
}));

// Mock Next.js Link component
jest.mock('next/link', () => {
    return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
        return <a href={href}>{children}</a>;
    };
});

// Mock RoadmapContent component
jest.mock('../roadmap-content', () => ({
    RoadmapContent: ({ content }: { content: string }) => (
        <div data-testid="roadmap-content">{content}</div>
    ),
}));

const mockUseRoadmapBySlug = useRoadmapBySlug as jest.MockedFunction<typeof useRoadmapBySlug>;

const mockRoadmap: Roadmap = {
    id: '1',
    slug: 'react-fundamentals',
    title: 'React Fundamentals: A Complete Guide to Modern React Development',
    description: 'Learn React from the ground up with this comprehensive guide covering hooks, components, state management, and modern React patterns. Perfect for beginners and intermediate developers.',
    content: '# React Fundamentals\n\nThis is a comprehensive guide to learning React...',
    author: 'user_789',
    tags: ['React', 'JavaScript', 'Frontend', 'Web Development', 'Hooks'],
    publishedAt: 1640995200000, // January 1, 2022
    updatedAt: 1640995200000,
    isPublished: true,
};

describe('RoadmapDetail', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Loading State', () => {
        it('displays skeleton loading state when data is loading', () => {
            mockUseRoadmapBySlug.mockReturnValue({
                roadmap: null,
                loading: true,
                error: undefined,
            });

            render(<RoadmapDetail slug="react-fundamentals" />);

            // Check for skeleton elements (using animate-pulse class as indicator)
            const skeletonElements = document.querySelectorAll('.animate-pulse');
            expect(skeletonElements.length).toBeGreaterThan(0);

            // Should not show actual content during loading
            expect(screen.queryByText(mockRoadmap.title)).not.toBeInTheDocument();
        });
    });

    describe('Error State', () => {
        it('displays error alert when there is a fetch error', () => {
            const mockError = new ApolloError({
                errorMessage: 'Network error',
                networkError: new Error('Network error'),
            });
            mockUseRoadmapBySlug.mockReturnValue({
                roadmap: null,
                loading: false,
                error: mockError,
            });

            render(<RoadmapDetail slug="react-fundamentals" />);

            // Should show error message
            expect(screen.getByText(/Failed to load roadmap: Network error/)).toBeInTheDocument();

            // Should show back button
            expect(screen.getByText('Back to Roadmaps')).toBeInTheDocument();
        });

        it('displays not found message when roadmap is null without error', () => {
            mockUseRoadmapBySlug.mockReturnValue({
                roadmap: null,
                loading: false,
                error: undefined,
            });

            render(<RoadmapDetail slug="non-existent-slug" />);

            // Should show not found message
            expect(screen.getByText(/Roadmap not found/)).toBeInTheDocument();
            expect(screen.getByText(/does not exist or may have been removed/)).toBeInTheDocument();

            // Should show back button
            expect(screen.getByText('Back to Roadmaps')).toBeInTheDocument();
        });

        it('creates correct back link in error state', () => {
            mockUseRoadmapBySlug.mockReturnValue({
                roadmap: null,
                loading: false,
                error: new ApolloError({
                    errorMessage: 'Test error',
                    networkError: new Error('Test error'),
                }),
            });

            render(<RoadmapDetail slug="test-slug" />);

            const backLink = screen.getByRole('link', { name: /Back to Roadmaps/ });
            expect(backLink).toHaveAttribute('href', '/roadmaps');
        });
    });

    describe('Success State', () => {
        beforeEach(() => {
            mockUseRoadmapBySlug.mockReturnValue({
                roadmap: mockRoadmap,
                loading: false,
                error: undefined,
            });
        });

        it('displays roadmap title correctly', () => {
            render(<RoadmapDetail slug="react-fundamentals" />);

            const title = screen.getByRole('heading', { level: 1 });
            expect(title).toHaveTextContent(mockRoadmap.title);
        });

        it('displays roadmap description', () => {
            render(<RoadmapDetail slug="react-fundamentals" />);

            expect(screen.getByText(mockRoadmap.description)).toBeInTheDocument();
        });

        it('displays all tags as badges', () => {
            render(<RoadmapDetail slug="react-fundamentals" />);

            mockRoadmap.tags.forEach(tag => {
                expect(screen.getByText(tag)).toBeInTheDocument();
            });
        });

        it('displays formatted published date', () => {
            render(<RoadmapDetail slug="react-fundamentals" />);

            // Should format date as "January 1, 2022"
            expect(screen.getByText('Published on January 1, 2022')).toBeInTheDocument();
        });

        it('displays author when available', () => {
            render(<RoadmapDetail slug="react-fundamentals" />);

            expect(screen.getByText(`By User ${mockRoadmap.author.slice(-8)}`)).toBeInTheDocument();
        });

        it('does not display author section when author is empty', () => {
            const roadmapWithoutAuthor = { ...mockRoadmap, author: '' };
            mockUseRoadmapBySlug.mockReturnValue({
                roadmap: roadmapWithoutAuthor,
                loading: false,
                error: undefined,
            });

            render(<RoadmapDetail slug="react-fundamentals" />);

            expect(screen.queryByText(/^By /)).not.toBeInTheDocument();
        });

        it('renders RoadmapContent component with correct content', () => {
            render(<RoadmapDetail slug="react-fundamentals" />);

            const contentComponent = screen.getByTestId('roadmap-content');
            expect(contentComponent).toBeInTheDocument();
            // Check that the content contains the main parts (ignoring whitespace differences)
            expect(contentComponent).toHaveTextContent('# React Fundamentals');
            expect(contentComponent).toHaveTextContent('This is a comprehensive guide to learning React');
        });

        it('creates correct back link to roadmaps page', () => {
            render(<RoadmapDetail slug="react-fundamentals" />);

            const backLink = screen.getByRole('link', { name: /Back to Roadmaps/ });
            expect(backLink).toHaveAttribute('href', '/roadmaps');
        });

        it('calls useRoadmapBySlug with correct slug', () => {
            const testSlug = 'test-roadmap-slug';
            render(<RoadmapDetail slug={testSlug} />);

            expect(mockUseRoadmapBySlug).toHaveBeenCalledWith(testSlug);
        });
    });

    describe('Accessibility', () => {
        beforeEach(() => {
            mockUseRoadmapBySlug.mockReturnValue({
                roadmap: mockRoadmap,
                loading: false,
                error: undefined,
            });
        });

        it('uses semantic HTML structure', () => {
            render(<RoadmapDetail slug="react-fundamentals" />);

            // Should have article element
            expect(screen.getByRole('article')).toBeInTheDocument();

            // Should have proper heading hierarchy
            expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
        });

        it('has accessible back button with icon and text', () => {
            render(<RoadmapDetail slug="react-fundamentals" />);

            const backButton = screen.getByRole('link', { name: /Back to Roadmaps/ });
            expect(backButton).toBeInTheDocument();

            // Should contain both icon and text for accessibility
            expect(backButton).toHaveTextContent('Back to Roadmaps');
        });
    });

    describe('Edge Cases', () => {
        it('handles roadmap with no tags', () => {
            const roadmapWithoutTags = { ...mockRoadmap, tags: [] };
            mockUseRoadmapBySlug.mockReturnValue({
                roadmap: roadmapWithoutTags,
                loading: false,
                error: undefined,
            });

            render(<RoadmapDetail slug="react-fundamentals" />);

            // Should still render without errors
            expect(screen.getByText(roadmapWithoutTags.title)).toBeInTheDocument();

            // No tags should be displayed
            mockRoadmap.tags.forEach(tag => {
                expect(screen.queryByText(tag)).not.toBeInTheDocument();
            });
        });

        it('handles very long titles and descriptions', () => {
            const roadmapWithLongContent = {
                ...mockRoadmap,
                title: 'A'.repeat(200),
                description: 'B'.repeat(500),
            };

            mockUseRoadmapBySlug.mockReturnValue({
                roadmap: roadmapWithLongContent,
                loading: false,
                error: undefined,
            });

            render(<RoadmapDetail slug="react-fundamentals" />);

            // Should render without breaking
            expect(screen.getByText(roadmapWithLongContent.title)).toBeInTheDocument();
            expect(screen.getByText(roadmapWithLongContent.description)).toBeInTheDocument();
        });

        it('handles invalid date values gracefully', () => {
            const roadmapWithInvalidDate = {
                ...mockRoadmap,
                publishedAt: NaN,
            };

            mockUseRoadmapBySlug.mockReturnValue({
                roadmap: roadmapWithInvalidDate,
                loading: false,
                error: undefined,
            });

            render(<RoadmapDetail slug="react-fundamentals" />);

            // Should still render the component
            expect(screen.getByText(roadmapWithInvalidDate.title)).toBeInTheDocument();

            // Date should show "Invalid Date" or similar
            expect(screen.getByText(/Published on/)).toBeInTheDocument();
        });
    });
});