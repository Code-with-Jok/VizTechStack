/**
 * Test suite for RoadmapTable component
 * 
 * Tests different data states:
 * - Loading state
 * - Error state  
 * - Empty state
 * - Success state with data
 */

import { render, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { RoadmapTable } from '../roadmap-table';
import { GET_ROADMAPS } from '@/features/roadmap/queries';
import type { Roadmap } from '@/features/roadmap/types';

// Mock Next.js Link component
jest.mock('next/link', () => {
    return function MockLink({ children, href, ...props }: { children: React.ReactNode; href: string;[key: string]: unknown }) {
        return <a href={href} {...props}>{children}</a>;
    };
});

// Mock the delete dialog component
jest.mock('../delete-roadmap-dialog', () => {
    return {
        DeleteRoadmapDialog: ({ roadmap, open }: { roadmap?: Roadmap; open: boolean }) => (
            <div data-testid="delete-dialog" data-open={open}>
                {roadmap && `Delete ${roadmap.title}`}
            </div>
        ),
    };
});

const mockRoadmaps: Roadmap[] = [
    {
        id: '1',
        slug: 'react-roadmap',
        title: 'React Development Roadmap',
        description: 'Complete guide to React development',
        content: '# React Roadmap\n\nLearn React step by step...',
        author: 'user_123',
        tags: ['react', 'javascript', 'frontend', 'web'],
        publishedAt: Date.now() - 86400000, // 1 day ago
        updatedAt: Date.now() - 3600000, // 1 hour ago
        isPublished: true,
    },
    {
        id: '2',
        slug: 'vue-roadmap',
        title: 'Vue.js Learning Path',
        description: 'Master Vue.js framework',
        content: '# Vue.js Roadmap\n\nStart with Vue basics...',
        author: 'user_456',
        tags: ['vue', 'javascript'],
        publishedAt: Date.now() - 172800000, // 2 days ago
        updatedAt: Date.now() - 7200000, // 2 hours ago
        isPublished: false,
    },
];

const successMock = {
    request: {
        query: GET_ROADMAPS,
    },
    result: {
        data: {
            roadmaps: mockRoadmaps.map(roadmap => ({
                ...roadmap,
                __typename: 'Roadmap'
            })),
        },
    },
};

const errorMock = {
    request: {
        query: GET_ROADMAPS,
    },
    error: new Error('Failed to fetch roadmaps'),
};

const emptyMock = {
    request: {
        query: GET_ROADMAPS,
    },
    result: {
        data: {
            roadmaps: [],
        },
    },
};

describe('RoadmapTable', () => {
    it('shows loading state', () => {
        render(
            <MockedProvider mocks={[]}>
                <RoadmapTable />
            </MockedProvider>
        );

        expect(screen.getByText('Loading roadmaps...')).toBeInTheDocument();
    });

    it('shows error state', async () => {
        render(
            <MockedProvider mocks={[errorMock]}>
                <RoadmapTable />
            </MockedProvider>
        );

        expect(await screen.findByText(/Error loading roadmaps/)).toBeInTheDocument();
        expect(screen.getByText(/Failed to fetch roadmaps/)).toBeInTheDocument();
    });

    it('shows empty state with create button', async () => {
        render(
            <MockedProvider mocks={[emptyMock]}>
                <RoadmapTable />
            </MockedProvider>
        );

        expect(await screen.findByText('No roadmaps created yet.')).toBeInTheDocument();
        expect(screen.getByText('Create your first roadmap')).toBeInTheDocument();

        const createButton = screen.getByRole('link', { name: 'Create your first roadmap' });
        expect(createButton).toHaveAttribute('href', '/admin/roadmaps/new');
    });

    it('renders roadmap table with data', async () => {
        render(
            <MockedProvider mocks={[successMock]}>
                <RoadmapTable />
            </MockedProvider>
        );

        // Wait for data to load
        expect(await screen.findByText('React Development Roadmap')).toBeInTheDocument();
        expect(screen.getByText('Vue.js Learning Path')).toBeInTheDocument();

        // Check table headers
        expect(screen.getByText('Title')).toBeInTheDocument();
        expect(screen.getByText('Slug')).toBeInTheDocument();
        expect(screen.getByText('Tags')).toBeInTheDocument();
        expect(screen.getByText('Status')).toBeInTheDocument();
        expect(screen.getByText('Updated')).toBeInTheDocument();
        expect(screen.getByText('Actions')).toBeInTheDocument();

        // Check roadmap data
        expect(screen.getByText('react-roadmap')).toBeInTheDocument();
        expect(screen.getByText('vue-roadmap')).toBeInTheDocument();

        // Check status badges
        expect(screen.getByText('Published')).toBeInTheDocument();
        expect(screen.getByText('Draft')).toBeInTheDocument();

        // Check tags (max 2 displayed)
        expect(screen.getByText('react')).toBeInTheDocument();
        expect(screen.getAllByText('javascript')).toHaveLength(2); // Both roadmaps have javascript tag
        expect(screen.getByText('+2')).toBeInTheDocument(); // React roadmap has 4 tags, so +2 more
    });
});