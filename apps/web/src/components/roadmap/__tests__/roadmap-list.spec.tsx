import { render, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { RoadmapList } from '../roadmap-list';

// Mock the useRoadmaps hook
const mockUseRoadmaps = jest.fn();
jest.mock('@/lib/hooks/use-roadmap', () => ({
    useRoadmaps: () => mockUseRoadmaps(),
}));

describe('RoadmapList', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('shows loading skeleton cards when loading', () => {
        mockUseRoadmaps.mockReturnValue({
            roadmaps: [],
            loading: true,
            error: null,
        });

        render(
            <MockedProvider>
                <RoadmapList />
            </MockedProvider>
        );

        // Should show 6 skeleton cards
        const skeletons = document.querySelectorAll('.animate-pulse');
        expect(skeletons).toHaveLength(6);
    });

    it('shows error alert when there is an error', () => {
        mockUseRoadmaps.mockReturnValue({
            roadmaps: [],
            loading: false,
            error: new Error('Network error'),
        });

        render(
            <MockedProvider>
                <RoadmapList />
            </MockedProvider>
        );

        expect(screen.getByText('Failed to load roadmaps. Please try again later.')).toBeInTheDocument();
    });

    it('shows empty state when no roadmaps available', () => {
        mockUseRoadmaps.mockReturnValue({
            roadmaps: [],
            loading: false,
            error: null,
        });

        render(
            <MockedProvider>
                <RoadmapList />
            </MockedProvider>
        );

        expect(screen.getByText('No roadmaps available yet.')).toBeInTheDocument();
    });

    it('renders roadmap cards when roadmaps are available', () => {
        const mockRoadmaps = [
            {
                id: '1',
                slug: 'react-roadmap',
                title: 'React Learning Path',
                description: 'Learn React from basics to advanced',
                content: 'Content here',
                author: 'John Doe',
                tags: ['react', 'javascript'],
                publishedAt: Date.now(),
                updatedAt: Date.now(),
                isPublished: true,
            },
            {
                id: '2',
                slug: 'vue-roadmap',
                title: 'Vue.js Roadmap',
                description: 'Master Vue.js framework',
                content: 'Content here',
                author: 'Jane Smith',
                tags: ['vue', 'javascript'],
                publishedAt: Date.now(),
                updatedAt: Date.now(),
                isPublished: true,
            },
        ];

        mockUseRoadmaps.mockReturnValue({
            roadmaps: mockRoadmaps,
            loading: false,
            error: null,
        });

        render(
            <MockedProvider>
                <RoadmapList />
            </MockedProvider>
        );

        expect(screen.getByText('React Learning Path')).toBeInTheDocument();
        expect(screen.getByText('Vue.js Roadmap')).toBeInTheDocument();
    });

    it('uses correct grid layout classes', () => {
        mockUseRoadmaps.mockReturnValue({
            roadmaps: [],
            loading: true,
            error: null,
        });

        render(
            <MockedProvider>
                <RoadmapList />
            </MockedProvider>
        );

        const gridContainer = document.querySelector('.grid');
        expect(gridContainer).toHaveClass('gap-6', 'md:grid-cols-2', 'lg:grid-cols-3');
    });
});