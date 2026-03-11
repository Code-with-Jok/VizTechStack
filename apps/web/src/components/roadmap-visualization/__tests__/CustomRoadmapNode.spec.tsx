/**
 * Tests cho CustomRoadmapNode component
 * Kiểm tra rendering, styling và interactions
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Position } from '@xyflow/react';
import { CustomRoadmapNode } from '../CustomRoadmapNode';
import type { NodeProps } from '@xyflow/react';
import type { NodeData } from '@viztechstack/roadmap-visualization';

// Mock React Flow hooks
jest.mock('@xyflow/react', () => ({
    Handle: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <div data-testid="handle" {...props}>{children}</div>,
    Position: {
        Top: 'top',
        Bottom: 'bottom',
    },
}));

// Mock navigation functions
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
    },
    getArticlePreview: () => null,
}));

describe('CustomRoadmapNode', () => {
    const mockNodeData: NodeData = {
        label: 'Test Node',
        description: 'Test description',
        level: 1,
        section: 'Test Section',
        estimatedTime: '2 weeks',
        difficulty: 'beginner',
    };

    const mockProps: NodeProps = {
        id: 'test-node',
        data: mockNodeData,
        selected: false,
        type: 'custom',
        zIndex: 1,
        isConnectable: true,
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
        dragging: false,
        selectable: true,
        deletable: true,
        draggable: true,
        positionAbsoluteX: 0,
        positionAbsoluteY: 0,
    };

    it('should render node với basic information', () => {
        render(<CustomRoadmapNode {...mockProps} />);

        expect(screen.getByText('Test Node')).toBeInTheDocument();
        expect(screen.getByText('Test description')).toBeInTheDocument();
        expect(screen.getByText('2 weeks')).toBeInTheDocument();
    });

    it('should apply correct difficulty styling', () => {
        const { container } = render(<CustomRoadmapNode {...mockProps} />);
        const nodeElement = container.firstChild as HTMLElement;

        expect(nodeElement).toHaveClass('node-beginner');
    });

    it('should show completed state', () => {
        const completedProps = {
            ...mockProps,
            data: { ...mockNodeData, completed: true },
        };

        const { container } = render(<CustomRoadmapNode {...completedProps} />);

        // Check for checkmark SVG by looking for the path element
        const checkmarkPath = container.querySelector('path[fill-rule="evenodd"]');
        expect(checkmarkPath).toBeInTheDocument();

        // Check for completed styling
        const nodeElement = container.firstChild as HTMLElement;
        expect(nodeElement).toHaveClass('node-completed');
    });

    it('should show category badge cho role nodes', () => {
        const roleProps = {
            ...mockProps,
            data: { ...mockNodeData, category: 'role' as const },
        };

        render(<CustomRoadmapNode {...roleProps} />);

        expect(screen.getByText('👤')).toBeInTheDocument();
        expect(screen.getByText('Vai trò')).toBeInTheDocument();
    });

    it('should show category badge cho skill nodes', () => {
        const skillProps = {
            ...mockProps,
            data: { ...mockNodeData, category: 'skill' as const },
        };

        render(<CustomRoadmapNode {...skillProps} />);

        expect(screen.getByText('🎯')).toBeInTheDocument();
        expect(screen.getByText('Kỹ năng')).toBeInTheDocument();
    });

    it('should render connection handles', () => {
        render(<CustomRoadmapNode {...mockProps} />);

        const handles = screen.getAllByTestId('handle');
        expect(handles).toHaveLength(2); // Top and bottom handles
    });

    it('should apply selected styling', () => {
        const selectedProps = {
            ...mockProps,
            data: { ...mockNodeData, selected: true },
        };

        const { container } = render(<CustomRoadmapNode {...selectedProps} />);
        const nodeElement = container.firstChild as HTMLElement;

        expect(nodeElement).toHaveClass('ring-2', 'ring-primary-400');
    });

    it('should handle intermediate difficulty', () => {
        const intermediateProps = {
            ...mockProps,
            data: { ...mockNodeData, difficulty: 'intermediate' as const },
        };

        const { container } = render(<CustomRoadmapNode {...intermediateProps} />);
        const nodeElement = container.firstChild as HTMLElement;

        expect(nodeElement).toHaveClass('node-intermediate');
    });

    it('should handle advanced difficulty', () => {
        const advancedProps = {
            ...mockProps,
            data: { ...mockNodeData, difficulty: 'advanced' as const },
        };

        const { container } = render(<CustomRoadmapNode {...advancedProps} />);
        const nodeElement = container.firstChild as HTMLElement;

        expect(nodeElement).toHaveClass('node-advanced');
    });
});