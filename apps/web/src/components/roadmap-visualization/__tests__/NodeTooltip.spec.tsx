/**
 * Tests for NodeTooltip component
 * 
 * Task 4.1.1: Implement NodeTooltip component
 * - Test tooltip visibility and positioning
 * - Test metadata display
 * - Test animations and interactions
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NodeTooltip } from '../NodeTooltip';
import type { NodeData } from '@viztechstack/roadmap-visualization';

// Mock the positioning services
jest.mock('../../hooks/useTooltipCollisionDetection', () => ({
    useTooltipPositioning: jest.fn(() => ({
        calculatePosition: jest.fn(() => ({
            x: 100,
            y: 100,
            placement: 'bottom' as const,
        })),
        updatePosition: jest.fn(() => ({
            x: 100,
            y: 100,
            placement: 'bottom' as const,
        })),
        cleanup: jest.fn(),
        isEnabled: true,
        getStats: jest.fn(() => ({
            activeTooltips: 0,
            collisionElements: 0,
            cacheStats: { size: 0, maxSize: 100 },
        })),
    })),
}));
// Mock the shared package functions
jest.mock('@viztechstack/roadmap-visualization', () => ({
    getCategoryIcon: (category?: string) => {
        switch (category) {
            case 'role': return '👤';
            case 'skill': return '🎯';
            default: return '📌';
        }
    },
    getCategoryDisplayName: (category?: string) => {
        switch (category) {
            case 'role': return 'Vai trò';
            case 'skill': return 'Kỹ năng';
            default: return 'Chủ đề';
        }
    }
}));

const mockNodeData: NodeData = {
    label: 'Test Node',
    description: 'This is a test node description',
    level: 3,
    section: 'Test Section',
    estimatedTime: '2 hours',
    difficulty: 'intermediate' as const,
    completed: false,
    resources: [
        {
            title: 'Test Article',
            url: 'https://example.com/article',
            type: 'article' as const
        },
        {
            title: 'Test Video',
            url: 'https://example.com/video',
            type: 'video' as const
        }
    ],
    category: 'skill' as const,
    targetArticleId: 'test-article'
};

describe('NodeTooltip', () => {
    const defaultProps = {
        nodeData: mockNodeData,
        isVisible: true,
        mousePosition: { x: 100, y: 100 }
    };

    beforeEach(() => {
        // Mock window dimensions
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 1024
        });
        Object.defineProperty(window, 'innerHeight', {
            writable: true,
            configurable: true,
            value: 768
        });
    });

    it('renders tooltip when visible', () => {
        render(<NodeTooltip {...defaultProps} />);

        expect(screen.getByRole('tooltip')).toBeInTheDocument();
        expect(screen.getByText('Test Node')).toBeInTheDocument();
        expect(screen.getByText('This is a test node description')).toBeInTheDocument();
    });

    it('does not render when not visible', () => {
        render(<NodeTooltip {...defaultProps} isVisible={false} />);

        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('displays category badge for categorized nodes', () => {
        render(<NodeTooltip {...defaultProps} />);

        expect(screen.getByText('🎯')).toBeInTheDocument();
        expect(screen.getByText('Kỹ năng')).toBeInTheDocument();
    });

    it('displays difficulty badge correctly', () => {
        render(<NodeTooltip {...defaultProps} />);

        expect(screen.getByText('Trung bình')).toBeInTheDocument();
    });

    it('displays estimated time', () => {
        render(<NodeTooltip {...defaultProps} />);

        expect(screen.getByText('2 hours')).toBeInTheDocument();
    });

    it('displays completion status for completed nodes', () => {
        const completedNodeData = { ...mockNodeData, completed: true };
        render(<NodeTooltip {...defaultProps} nodeData={completedNodeData} />);

        expect(screen.getByText('Hoàn thành')).toBeInTheDocument();
    });

    it('displays section information', () => {
        render(<NodeTooltip {...defaultProps} />);

        expect(screen.getByText('Phần: Test Section')).toBeInTheDocument();
    });

    it('displays resources preview', () => {
        render(<NodeTooltip {...defaultProps} />);

        expect(screen.getByText('Tài nguyên (2)')).toBeInTheDocument();
        expect(screen.getByText('Test Article')).toBeInTheDocument();
        expect(screen.getByText('Test Video')).toBeInTheDocument();
    });

    it('displays learning level indicator', () => {
        render(<NodeTooltip {...defaultProps} />);

        expect(screen.getByText('Cấp độ:')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('shows navigation hint for skill nodes', () => {
        render(<NodeTooltip {...defaultProps} />);

        expect(screen.getByText('Bài viết')).toBeInTheDocument();
    });

    it('shows navigation hint for role nodes', () => {
        const roleNodeData = {
            ...mockNodeData,
            category: 'role' as const,
            targetRoadmapId: 'test-roadmap',
            targetArticleId: undefined
        };
        render(<NodeTooltip {...defaultProps} nodeData={roleNodeData} />);

        expect(screen.getByText('Roadmap')).toBeInTheDocument();
    });

    it('handles nodes without category', () => {
        const noCategoryNodeData = {
            ...mockNodeData,
            category: undefined
        };
        render(<NodeTooltip {...defaultProps} nodeData={noCategoryNodeData} />);

        expect(screen.getByText('Test Node')).toBeInTheDocument();
        expect(screen.queryByText('🎯')).not.toBeInTheDocument();
    });

    it('handles nodes without resources', () => {
        const noResourcesNodeData = {
            ...mockNodeData,
            resources: undefined
        };
        render(<NodeTooltip {...defaultProps} nodeData={noResourcesNodeData} />);

        expect(screen.queryByText('Tài nguyên')).not.toBeInTheDocument();
    });

    it('handles escape key to close', () => {
        const onClose = jest.fn();
        render(<NodeTooltip {...defaultProps} onClose={onClose} />);

        fireEvent.keyDown(document, { key: 'Escape' });

        expect(onClose).toHaveBeenCalled();
    });

    it('positions tooltip correctly', async () => {
        const { container } = render(<NodeTooltip {...defaultProps} />);

        await waitFor(() => {
            const tooltip = container.querySelector('[role="tooltip"]');
            expect(tooltip).toHaveStyle({
                left: '100px',
                top: '100px'
            });
        });
    });

    it('truncates long resource lists', () => {
        const manyResourcesNodeData = {
            ...mockNodeData,
            resources: [
                { title: 'Resource 1', url: 'url1', type: 'article' as const },
                { title: 'Resource 2', url: 'url2', type: 'video' as const },
                { title: 'Resource 3', url: 'url3', type: 'course' as const },
                { title: 'Resource 4', url: 'url4', type: 'book' as const }
            ]
        };
        render(<NodeTooltip {...defaultProps} nodeData={manyResourcesNodeData} />);

        expect(screen.getByText('Resource 1')).toBeInTheDocument();
        expect(screen.getByText('Resource 2')).toBeInTheDocument();
        expect(screen.getByText('+2 tài nguyên khác')).toBeInTheDocument();
        expect(screen.queryByText('Resource 3')).not.toBeInTheDocument();
    });
});