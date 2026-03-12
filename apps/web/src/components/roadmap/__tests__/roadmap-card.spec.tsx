import { render, screen } from '@testing-library/react';
import { RoadmapCard } from '../roadmap-card';
import type { Roadmap, NodeCategory } from '@/features/roadmap/types';

// Mock Next.js Link component
jest.mock('next/link', () => {
    return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
        return <a href={href}>{children}</a>;
    };
});

const mockRoadmap: Roadmap = {
    id: '1',
    slug: 'react-fundamentals',
    title: 'React Fundamentals: A Complete Guide to Modern React Development',
    description: 'Learn React from the ground up with this comprehensive guide covering hooks, components, state management, and modern React patterns. Perfect for beginners and intermediate developers.',
    content: '# React Fundamentals\n\nThis is a comprehensive guide...',
    nodeCategory: 'TOPIC',
    author: 'user_789',
    tags: ['React', 'JavaScript', 'Frontend', 'Web Development', 'Hooks'],
    publishedAt: 1640995200000, // January 1, 2022
    updatedAt: 1640995200000,
    isPublished: true,
};

describe('RoadmapCard', () => {
    it('renders roadmap information correctly', () => {
        render(<RoadmapCard roadmap={mockRoadmap} />);

        // Check title is displayed
        expect(screen.getByText(mockRoadmap.title)).toBeInTheDocument();

        // Check description is displayed
        expect(screen.getByText(mockRoadmap.description)).toBeInTheDocument();

        // Check published date is formatted correctly
        expect(screen.getByText('Published Jan 1, 2022')).toBeInTheDocument();
    });

    it('displays maximum 3 tags with overflow indicator', () => {
        render(<RoadmapCard roadmap={mockRoadmap} />);

        // Should show first 3 tags
        expect(screen.getByText('React')).toBeInTheDocument();
        expect(screen.getByText('JavaScript')).toBeInTheDocument();
        expect(screen.getByText('Frontend')).toBeInTheDocument();

        // Should show +2 indicator for remaining tags
        expect(screen.getByText('+2')).toBeInTheDocument();

        // Should not show the 4th and 5th tags directly
        expect(screen.queryByText('Web Development')).not.toBeInTheDocument();
        expect(screen.queryByText('Hooks')).not.toBeInTheDocument();
    });

    it('displays all tags when there are 3 or fewer', () => {
        const roadmapWithFewTags: Roadmap = {
            ...mockRoadmap,
            tags: ['React', 'JavaScript', 'Frontend'],
        };

        render(<RoadmapCard roadmap={roadmapWithFewTags} />);

        // Should show all 3 tags
        expect(screen.getByText('React')).toBeInTheDocument();
        expect(screen.getByText('JavaScript')).toBeInTheDocument();
        expect(screen.getByText('Frontend')).toBeInTheDocument();

        // Should not show overflow indicator
        expect(screen.queryByText(/^\+\d+$/)).not.toBeInTheDocument();
    });

    it('creates correct link to roadmap detail page', () => {
        render(<RoadmapCard roadmap={mockRoadmap} />);

        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', `/roadmaps/${mockRoadmap.slug}`);
    });

    it('applies correct CSS classes for styling', () => {
        const { container } = render(<RoadmapCard roadmap={mockRoadmap} />);

        // Check card has hover effect classes
        const card = container.querySelector('[class*="transition-shadow"][class*="hover:shadow-lg"]');
        expect(card).toBeInTheDocument();
    });
});