/**
 * Integration tests for edge interaction workflow
 * Kiểm tra toàn bộ flow từ edge click đến panel display
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RoadmapVisualization } from '../RoadmapVisualization';
import type { GraphData } from '@viztechstack/roadmap-visualization';

// Mock React Flow
jest.mock('@xyflow/react', () => ({
    ReactFlow: ({ children, onEdgeClick }: any) => (
        <div data-testid="react-flow">
            <button
                data-testid="mock-edge-1"
                onClick={() => onEdgeClick?.({}, { id: 'edge-1', source: 'node-1', target: 'node-2' })}
            >
                Mock Edge 1
            </button>
            {children}
        </div>
    ),
    Background: () => <div data-testid="background" />,
    Controls: () => <div data-testid="controls" />,
    MiniMap: () => <div data-testid="minimap" />,
    useNodesState: () => [[], jest.fn(), jest.fn()],
    useEdgesState: () => [[], jest.fn(), jest.fn()],
    getBezierPath: () => ['M0,0 L100,100', 50, 50],
    BaseEdge: ({ onClick }: any) => (
        <div data-testid="base-edge" onClick={onClick}>Base Edge</div>
    ),
    EdgeLabelRenderer: ({ children }: any) => <div>{children}</div>,
}));

// Mock data
const mockGraphData: GraphData = {
    nodes: [
        {
            id: 'node-1',
            type: 'topic',
            position: { x: 0, y: 0 },
            data: {
                label: 'HTML Basics',
                description: 'Learn HTML fundamentals',
                level: 1,
                section: 'Frontend',
                difficulty: 'beginner',
                estimatedTime: '2 weeks',
            }
        },
        {
            id: 'node-2',
            type: 'topic',
            position: { x: 200, y: 0 },
            data: {
                label: 'CSS Fundamentals',
                description: 'Learn CSS styling',
                level: 2,
                section: 'Frontend',
                difficulty: 'intermediate',
                estimatedTime: '3 weeks',
            }
        }
    ],
    edges: [
        {
            id: 'edge-1',
            source: 'node-1',
            target: 'node-2',
            type: 'dependency',
            data: {
                relationship: 'prerequisite',
                strength: 0.8,
                bidirectional: false,
                label: 'Prerequisite'
            }
        }
    ],
    metadata: {
        totalNodes: 2,
        totalEdges: 1,
        maxDepth: 2,
        layoutType: 'hierarchical',
        generatedAt: new Date(),
    }
};

describe('Edge Interaction Integration', () => {
    const defaultProps = {
        graphData: mockGraphData,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should show EdgeDetailsPanel when edge is clicked', async () => {
        render(<RoadmapVisualization {...defaultProps} />);

        // Click on mock edge
        const mockEdge = screen.getByTestId('mock-edge-1');
        fireEvent.click(mockEdge);

        // Wait for panel to appear
        await waitFor(() => {
            expect(screen.getByText('Điều kiện tiên quyết')).toBeInTheDocument();
        });

        // Verify panel content
        expect(screen.getByText('HTML Basics')).toBeInTheDocument();
        expect(screen.getByText('CSS Fundamentals')).toBeInTheDocument();
        expect(screen.getByText('80%')).toBeInTheDocument(); // strength
    });

    it('should close EdgeDetailsPanel when close button is clicked', async () => {
        render(<RoadmapVisualization {...defaultProps} />);

        // Click edge to open panel
        const mockEdge = screen.getByTestId('mock-edge-1');
        fireEvent.click(mockEdge);

        await waitFor(() => {
            expect(screen.getByText('Điều kiện tiên quyết')).toBeInTheDocument();
        });

        // Click close button
        const closeButton = screen.getByLabelText('Đóng panel chi tiết edge');
        fireEvent.click(closeButton);

        // Panel should be closed
        await waitFor(() => {
            expect(screen.queryByText('Điều kiện tiên quyết')).not.toBeInTheDocument();
        });
    });

    it('should call onEdgeClick callback when provided', async () => {
        const onEdgeClick = jest.fn();
        render(<RoadmapVisualization {...defaultProps} onEdgeClick={onEdgeClick} />);

        const mockEdge = screen.getByTestId('mock-edge-1');
        fireEvent.click(mockEdge);

        await waitFor(() => {
            expect(onEdgeClick).toHaveBeenCalledWith('edge-1');
        });
    });
});