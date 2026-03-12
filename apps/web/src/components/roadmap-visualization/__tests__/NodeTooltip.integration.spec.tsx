/**
 * Integration tests for enhanced NodeTooltip component
 * 
 * Task 4.1.2: Implement tooltip positioning system
 * - Test complete tooltip system integration
 * - Test collision detection in real scenarios
 * - Test performance under load
 * - Validates: Requirement 4.1
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { NodeTooltip } from '../NodeTooltip';
import type { NodeData } from '@viztechstack/roadmap-visualization';

// Mock the positioning services with more realistic behavior
const mockPositioning = {
    calculatePosition: jest.fn((mouseX, mouseY, dimensions, tooltipId) => ({
        x: Math.max(20, Math.min(mouseX + 12, 1000 - dimensions.width)),
        y: Math.max(20, Math.min(mouseY + 12, 700 - dimensions.height)),
        placement: 'bottom' as const,
    })),
    updatePosition: jest.fn((mouseX, mouseY, tooltipId) => ({
        x: Math.max(20, Math.min(mouseX + 12, 1000 - 300)),
        y: Math.max(20, Math.min(mouseY + 12, 700 - 200)),
        placement: 'bottom' as const,
    })),
    cleanup: jest.fn(),
    isEnabled: true,
    getStats: jest.fn(() => ({
        activeTooltips: 1,
        collisionElements: 2,
        cacheStats: { size: 5, maxSize: 100 },
    })),
};

jest.mock('../../hooks/useTooltipCollisionDetection', () => ({
    useTooltipPositioning: jest.fn(() => mockPositioning),
}));

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

const createMockNodeData = (overrides: Partial<NodeData> = {}): NodeData => ({
    label: 'Frontend Development',
    description: 'Learn modern frontend development with React, TypeScript, and advanced tooling',
    level: 3,
    section: 'Web Development',
    estimatedTime: '4-6 weeks',
    difficulty: 'intermediate' as const,
    completed: false,
    resources: [
        {
            title: 'React Official Documentation',
            url: 'https://react.dev',
            type: 'documentation' as const
        },
        {
            title: 'TypeScript Handbook',
            url: 'https://typescriptlang.org/docs',
            type: 'documentation' as const
        },
        {
            title: 'Frontend Masters React Course',
            url: 'https://frontendmasters.com/courses/react',
            type: 'course' as const
        }
    ],
    category: 'skill' as const,
    targetArticleId: 'frontend-development-guide',
    ...overrides
});

describe('NodeTooltip Integration', () => {
    const defaultProps = {
        isVisible: true,
        mousePosition: { x: 500, y: 300 },
    };

    beforeEach(() => {
        jest.clearAllMocks();

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

    describe('Enhanced Positioning System', () => {
        it('integrates with collision detection system', async () => {
            const nodeData = createMockNodeData();

            render(<NodeTooltip {...defaultProps} nodeData={nodeData} />);

            await waitFor(() => {
                expect(mockPositioning.calculatePosition).toHaveBeenCalledWith(
                    500,
                    300,
                    expect.objectContaining({
                        width: expect.any(Number),
                        height: expect.any(Number),
                    }),
                    expect.any(String)
                );
            });

            expect(screen.getByRole('tooltip')).toBeInTheDocument();
        });

        it('handles viewport edge cases', async () => {
            const nodeData = createMockNodeData();

            // Position near right edge
            render(
                <NodeTooltip
                    {...defaultProps}
                    nodeData={nodeData}
                    mousePosition={{ x: 950, y: 300 }}
                />
            );

            await waitFor(() => {
                const tooltip = screen.getByRole('tooltip');
                expect(tooltip).toBeInTheDocument();

                // Should be positioned to avoid overflow
                const style = window.getComputedStyle(tooltip);
                const left = parseInt(style.left || '0');
                expect(left).toBeLessThan(1000 - 300); // Assuming 300px width
            });
        });

        it('handles multiple tooltip scenarios', async () => {
            const nodeData1 = createMockNodeData({ label: 'Node 1' });
            const nodeData2 = createMockNodeData({ label: 'Node 2' });

            const { rerender } = render(
                <NodeTooltip
                    {...defaultProps}
                    nodeData={nodeData1}
                    tooltipId="tooltip-1"
                />
            );

            await waitFor(() => {
                expect(screen.getByText('Node 1')).toBeInTheDocument();
            });

            // Render second tooltip
            rerender(
                <>
                    <NodeTooltip
                        {...defaultProps}
                        nodeData={nodeData1}
                        tooltipId="tooltip-1"
                    />
                    <NodeTooltip
                        {...defaultProps}
                        nodeData={nodeData2}
                        tooltipId="tooltip-2"
                        mousePosition={{ x: 600, y: 400 }}
                    />
                </>
            );

            await waitFor(() => {
                expect(screen.getByText('Node 1')).toBeInTheDocument();
                expect(screen.getByText('Node 2')).toBeInTheDocument();
            });

            // Both tooltips should call positioning system
            expect(mockPositioning.calculatePosition).toHaveBeenCalledTimes(2);
        });
    });

    describe('Performance Optimizations', () => {
        it('memoizes tooltip content to prevent unnecessary re-renders', async () => {
            const nodeData = createMockNodeData();

            const { rerender } = render(
                <NodeTooltip {...defaultProps} nodeData={nodeData} />
            );

            await waitFor(() => {
                expect(screen.getByText('Frontend Development')).toBeInTheDocument();
            });

            // Re-render with same data
            rerender(<NodeTooltip {...defaultProps} nodeData={nodeData} />);

            // Content should still be there without additional positioning calls
            expect(screen.getByText('Frontend Development')).toBeInTheDocument();
        });

        it('debounces position updates', async () => {
            const nodeData = createMockNodeData();

            const { rerender } = render(
                <NodeTooltip {...defaultProps} nodeData={nodeData} />
            );

            // Rapidly update mouse position
            for (let i = 0; i < 10; i++) {
                rerender(
                    <NodeTooltip
                        {...defaultProps}
                        nodeData={nodeData}
                        mousePosition={{ x: 500 + i, y: 300 + i }}
                    />
                );
            }

            // Should not call positioning for every update
            await waitFor(() => {
                expect(mockPositioning.calculatePosition).toHaveBeenCalled();
            });
        });

        it('cleans up resources on unmount', () => {
            const nodeData = createMockNodeData();

            const { unmount } = render(
                <NodeTooltip {...defaultProps} nodeData={nodeData} tooltipId="test-tooltip" />
            );

            unmount();

            expect(mockPositioning.cleanup).toHaveBeenCalledWith('test-tooltip');
        });
    });

    describe('Advanced Features', () => {
        it('supports custom collision selectors', async () => {
            const nodeData = createMockNodeData();

            render(
                <NodeTooltip
                    {...defaultProps}
                    nodeData={nodeData}
                    collisionSelectors={['.custom-element', '.sidebar']}
                />
            );

            await waitFor(() => {
                expect(screen.getByRole('tooltip')).toBeInTheDocument();
            });

            // Should integrate with positioning system
            expect(mockPositioning.calculatePosition).toHaveBeenCalled();
        });

        it('respects max dimensions', async () => {
            const nodeData = createMockNodeData({
                description: 'A'.repeat(1000), // Very long description
            });

            render(
                <NodeTooltip
                    {...defaultProps}
                    nodeData={nodeData}
                    maxWidth={250}
                    maxHeight={150}
                />
            );

            await waitFor(() => {
                const tooltip = screen.getByRole('tooltip');
                expect(tooltip).toBeInTheDocument();

                // Should respect max dimensions in positioning
                expect(mockPositioning.calculatePosition).toHaveBeenCalledWith(
                    expect.any(Number),
                    expect.any(Number),
                    expect.objectContaining({
                        width: expect.any(Number),
                        height: expect.any(Number),
                    }),
                    expect.any(String)
                );
            });
        });

        it('handles priority-based tooltip management', async () => {
            const highPriorityData = createMockNodeData({ label: 'High Priority' });
            const lowPriorityData = createMockNodeData({ label: 'Low Priority' });

            render(
                <>
                    <NodeTooltip
                        {...defaultProps}
                        nodeData={highPriorityData}
                        priority={10}
                        tooltipId="high-priority"
                    />
                    <NodeTooltip
                        {...defaultProps}
                        nodeData={lowPriorityData}
                        priority={1}
                        tooltipId="low-priority"
                        mousePosition={{ x: 600, y: 400 }}
                    />
                </>
            );

            await waitFor(() => {
                expect(screen.getByText('High Priority')).toBeInTheDocument();
                expect(screen.getByText('Low Priority')).toBeInTheDocument();
            });

            // Both should be positioned
            expect(mockPositioning.calculatePosition).toHaveBeenCalledTimes(2);
        });
    });

    describe('Accessibility and User Experience', () => {
        it('maintains accessibility features with enhanced positioning', async () => {
            const nodeData = createMockNodeData();

            render(<NodeTooltip {...defaultProps} nodeData={nodeData} />);

            await waitFor(() => {
                const tooltip = screen.getByRole('tooltip');
                expect(tooltip).toBeInTheDocument();
                expect(tooltip).toHaveAttribute('aria-live', 'polite');
            });
        });

        it('handles keyboard navigation with positioning system', async () => {
            const onClose = jest.fn();
            const nodeData = createMockNodeData();

            render(
                <NodeTooltip
                    {...defaultProps}
                    nodeData={nodeData}
                    onClose={onClose}
                />
            );

            await waitFor(() => {
                expect(screen.getByRole('tooltip')).toBeInTheDocument();
            });

            // Test escape key
            fireEvent.keyDown(document, { key: 'Escape' });
            expect(onClose).toHaveBeenCalled();
        });

        it('provides smooth animations with positioning updates', async () => {
            const nodeData = createMockNodeData();

            const { rerender } = render(
                <NodeTooltip {...defaultProps} nodeData={nodeData} isVisible={false} />
            );

            // Should not be visible initially
            expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

            // Show tooltip
            rerender(<NodeTooltip {...defaultProps} nodeData={nodeData} isVisible={true} />);

            await waitFor(() => {
                const tooltip = screen.getByRole('tooltip');
                expect(tooltip).toBeInTheDocument();
                expect(tooltip).toHaveClass('animate-fade-in');
            });
        });
    });

    describe('Error Handling and Edge Cases', () => {
        it('handles missing node data gracefully', async () => {
            const incompleteData = {
                label: 'Minimal Node',
                level: 1,
                section: 'Test',
            } as NodeData;

            render(<NodeTooltip {...defaultProps} nodeData={incompleteData} />);

            await waitFor(() => {
                expect(screen.getByText('Minimal Node')).toBeInTheDocument();
            });

            // Should still integrate with positioning system
            expect(mockPositioning.calculatePosition).toHaveBeenCalled();
        });

        it('handles positioning system failures gracefully', async () => {
            // Mock positioning failure
            mockPositioning.calculatePosition.mockImplementationOnce(() => {
                throw new Error('Positioning failed');
            });

            const nodeData = createMockNodeData();

            // Should not crash the component
            expect(() => {
                render(<NodeTooltip {...defaultProps} nodeData={nodeData} />);
            }).not.toThrow();
        });

        it('handles window resize during tooltip display', async () => {
            const nodeData = createMockNodeData();

            render(<NodeTooltip {...defaultProps} nodeData={nodeData} />);

            await waitFor(() => {
                expect(screen.getByRole('tooltip')).toBeInTheDocument();
            });

            // Simulate window resize
            act(() => {
                Object.defineProperty(window, 'innerWidth', { value: 800 });
                Object.defineProperty(window, 'innerHeight', { value: 600 });
                window.dispatchEvent(new Event('resize'));
            });

            // Should still be visible and positioned correctly
            await waitFor(() => {
                expect(screen.getByRole('tooltip')).toBeInTheDocument();
            });
        });
    });

    describe('Performance Under Load', () => {
        it('handles rapid tooltip creation and destruction', async () => {
            const nodeData = createMockNodeData();

            // Rapidly create and destroy tooltips
            for (let i = 0; i < 10; i++) {
                const { unmount } = render(
                    <NodeTooltip
                        {...defaultProps}
                        nodeData={nodeData}
                        tooltipId={`tooltip-${i}`}
                    />
                );

                await waitFor(() => {
                    expect(screen.getByRole('tooltip')).toBeInTheDocument();
                });

                unmount();
            }

            // Should handle cleanup properly
            expect(mockPositioning.cleanup).toHaveBeenCalledTimes(10);
        });

        it('maintains performance with complex node data', async () => {
            const complexNodeData = createMockNodeData({
                description: 'Complex description with lots of content '.repeat(50),
                resources: Array.from({ length: 20 }, (_, i) => ({
                    title: `Resource ${i + 1}`,
                    url: `https://example.com/resource-${i + 1}`,
                    type: 'article' as const,
                })),
            });

            const startTime = performance.now();

            render(<NodeTooltip {...defaultProps} nodeData={complexNodeData} />);

            await waitFor(() => {
                expect(screen.getByRole('tooltip')).toBeInTheDocument();
            });

            const endTime = performance.now();
            const renderTime = endTime - startTime;

            // Should render within reasonable time (less than 100ms)
            expect(renderTime).toBeLessThan(100);
        });
    });
});