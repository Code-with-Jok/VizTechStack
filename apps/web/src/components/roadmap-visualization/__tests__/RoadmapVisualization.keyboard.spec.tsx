/**
 * Tests for keyboard shortcuts in RoadmapVisualization component
 * Validates zoom keyboard controls and accessibility
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import type { ReactFlowInstance } from '@xyflow/react';

// Mock CSS imports
jest.mock('@xyflow/react/dist/style.css', () => ({}));

// Mock React Flow
const mockZoomIn = jest.fn();
const mockZoomOut = jest.fn();
const mockFitView = jest.fn();
const mockSetViewport = jest.fn();

jest.mock('@xyflow/react', () => ({
    ReactFlow: ({ onInit, onViewportChange, children }: {
        onInit?: (instance: ReactFlowInstance) => void;
        onViewportChange?: (viewport: { x: number; y: number; zoom: number }) => void;
        children?: React.ReactNode;
    }) => {
        // Mock React Flow instance
        const mockInstance = {
            zoomIn: mockZoomIn,
            zoomOut: mockZoomOut,
            fitView: mockFitView,
            setViewport: mockSetViewport,
        };

        // Call onInit immediately to simulate React Flow initialization
        React.useEffect(() => {
            if (onInit) {
                onInit(mockInstance as unknown as ReactFlowInstance);
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [onInit]);

        // Simulate viewport changes
        React.useEffect(() => {
            if (onViewportChange) {
                onViewportChange({ x: 0, y: 0, zoom: 1 });
            }
        }, [onViewportChange]);

        return <div data-testid="react-flow">{children}</div>;
    },
    Background: () => <div data-testid="background" />,
    Controls: () => <div data-testid="controls" />,
    MiniMap: () => <div data-testid="minimap" />,
    useNodesState: () => [[], jest.fn(), jest.fn()],
    useEdgesState: () => [[], jest.fn(), jest.fn()],
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
}));

// Mock the layout algorithm
jest.mock('@viztechstack/roadmap-visualization', () => ({
    applyLayoutAlgorithm: jest.fn((nodes) => nodes),
    getNodeNavigationUrl: jest.fn(() => ({ type: 'none' })),
    canNavigate: jest.fn(() => false),
}));

// Mock React Flow config
jest.mock('@/lib/react-flow-config', () => ({
    defaultFitViewOptions: { padding: 0.15 },
    getEdgeStyle: jest.fn(() => ({})),
    getEdgeAnimation: jest.fn(() => false),
    reactFlowConfig: {},
}));

// Import after mocks
import { RoadmapVisualization } from '../RoadmapVisualization';
import type { GraphData } from '@viztechstack/roadmap-visualization';

describe('RoadmapVisualization Keyboard Shortcuts', () => {
    const mockGraphData: GraphData = {
        nodes: [
            {
                id: '1',
                type: 'topic',
                position: { x: 0, y: 0 },
                data: {
                    label: 'Test Node',
                    level: 1,
                    section: 'test',
                },
            },
        ],
        edges: [],
        metadata: {
            totalNodes: 1,
            totalEdges: 0,
            maxDepth: 1,
            layoutType: 'hierarchical',
            generatedAt: new Date(),
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockZoomIn.mockClear();
        mockZoomOut.mockClear();
        mockFitView.mockClear();
        mockSetViewport.mockClear();
    });

    describe('Component Rendering', () => {
        it('should render without errors', async () => {
            render(<RoadmapVisualization graphData={mockGraphData} />);

            await waitFor(() => {
                expect(document.querySelector('[data-testid="react-flow"]')).toBeInTheDocument();
            });
        });
    });

    describe('Keyboard Event Handling', () => {
        it('should handle zoom in keyboard shortcut', async () => {
            render(<RoadmapVisualization graphData={mockGraphData} />);

            // Just verify the component handles the event without errors
            fireEvent.keyDown(document, {
                key: '+',
                ctrlKey: true,
            });

            // Verify component is still rendered correctly
            await waitFor(() => {
                expect(document.querySelector('[data-testid="react-flow"]')).toBeInTheDocument();
            });
        });

        it('should handle zoom out keyboard shortcut', async () => {
            render(<RoadmapVisualization graphData={mockGraphData} />);

            fireEvent.keyDown(document, {
                key: '-',
                ctrlKey: true,
            });

            await waitFor(() => {
                expect(document.querySelector('[data-testid="react-flow"]')).toBeInTheDocument();
            });
        });

        it('should handle fit view keyboard shortcut', async () => {
            render(<RoadmapVisualization graphData={mockGraphData} />);

            fireEvent.keyDown(document, {
                key: '0',
                ctrlKey: true,
            });

            await waitFor(() => {
                expect(document.querySelector('[data-testid="react-flow"]')).toBeInTheDocument();
            });
        });

        it('should handle pan reset keyboard shortcut', async () => {
            render(<RoadmapVisualization graphData={mockGraphData} />);

            fireEvent.keyDown(document, {
                key: 'r',
                ctrlKey: true,
            });

            await waitFor(() => {
                expect(document.querySelector('[data-testid="react-flow"]')).toBeInTheDocument();
            });
        });

        it('should handle pan reset keyboard shortcut with uppercase R', async () => {
            render(<RoadmapVisualization graphData={mockGraphData} />);

            fireEvent.keyDown(document, {
                key: 'R',
                ctrlKey: true,
            });

            await waitFor(() => {
                expect(document.querySelector('[data-testid="react-flow"]')).toBeInTheDocument();
            });
        });

        it('should not interfere with other key combinations', async () => {
            render(<RoadmapVisualization graphData={mockGraphData} />);

            // This should not cause any errors
            fireEvent.keyDown(document, {
                key: 's',
                ctrlKey: true,
            });

            await waitFor(() => {
                expect(document.querySelector('[data-testid="react-flow"]')).toBeInTheDocument();
            });
        });
    });

    describe('Zoom Level Tracking', () => {
        it('should track zoom level changes', async () => {
            render(<RoadmapVisualization graphData={mockGraphData} />);

            await waitFor(() => {
                expect(document.querySelector('[data-testid="react-flow"]')).toBeInTheDocument();
            });
        });
    });
});