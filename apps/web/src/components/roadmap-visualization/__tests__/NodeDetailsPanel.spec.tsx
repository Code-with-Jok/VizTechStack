/**
 * Tests for NodeDetailsPanel component
 * Validates node details display, interaction, and accessibility
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NodeDetailsPanel } from '../NodeDetailsPanel';
import type { NodeData } from '@viztechstack/roadmap-visualization';

// Mock the roadmap-visualization utilities
jest.mock('@viztechstack/roadmap-visualization', () => ({
    getCategoryIcon: jest.fn((category?: string) => {
        switch (category) {
            case 'ROLE':
                return '👤';
            case 'SKILL':
                return '🛠️';
            default:
                return '📄';
        }
    }),
    getCategoryDisplayName: jest.fn((category?: string) => {
        switch (category) {
            case 'ROLE':
                return 'Vai trò';
            case 'SKILL':
                return 'Kỹ năng';
            default:
                return 'Chủ đề';
        }
    }),
    getNodeNavigationUrl: jest.fn(() => ({
        type: 'article',
        url: '/articles/test-article',
        openInNewTab: false,
        isExternal: false,
    })),
    canNavigate: jest.fn(() => true),
}));

describe('NodeDetailsPanel', () => {
    const mockNodeData: NodeData = {
        label: 'Test Node',
        description: 'This is a test node description',
        level: 1,
        section: 'Test Section',
        estimatedTime: '2 hours',
        difficulty: 'intermediate',
        completed: false,
        category: 'SKILL',
        learningObjectives: [
            'Understand the basics of testing',
            'Learn how to write effective test cases'
        ],
        learningOutcomes: [
            'Ability to create comprehensive test suites',
            'Understanding of testing best practices'
        ],
        keyTopics: [
            'Unit Testing',
            'Integration Testing',
            'Test-Driven Development'
        ],
        skillsGained: [
            'Jest Testing Framework',
            'Test Case Design',
            'Debugging Skills'
        ],
        resources: [
            {
                title: 'Test Article',
                url: 'https://example.com/article',
                type: 'article',
            },
            {
                title: 'Test Video',
                url: 'https://example.com/video',
                type: 'video',
            },
        ],
        prerequisites: ['node-1', 'node-2'],
    };

    const mockRelatedNodes = [
        {
            id: 'related-1',
            type: 'topic' as const,
            position: { x: 0, y: 0 },
            data: {
                label: 'Related Node 1',
                level: 1,
                section: 'Related Section',
                difficulty: 'beginner' as const,
                completed: true,
            },
        },
        {
            id: 'related-2',
            type: 'topic' as const,
            position: { x: 100, y: 100 },
            data: {
                label: 'Related Node 2',
                level: 2,
                section: 'Related Section',
                difficulty: 'advanced' as const,
                completed: false,
            },
        },
    ];

    const mockEdges = [
        {
            id: 'edge-1',
            source: 'test-node',
            target: 'related-1',
            type: 'dependency' as const,
            data: { relationship: 'leads-to' as const },
        },
        {
            id: 'edge-2',
            source: 'related-2',
            target: 'test-node',
            type: 'dependency' as const,
            data: { relationship: 'prerequisite' as const },
        },
    ];

    const defaultProps = {
        nodeId: 'test-node',
        nodeData: mockNodeData,
        onClose: jest.fn(),
        onNavigate: jest.fn(),
        onNodeSelect: jest.fn(),
        allNodes: mockRelatedNodes,
        allEdges: mockEdges,
        highlightedNodes: new Set<string>(),
        highlightedEdges: new Set<string>(),
        onBookmark: jest.fn(),
        onShare: jest.fn(),
        onMarkComplete: jest.fn(),
        isBookmarked: false,
        userProgress: {
            completedNodes: new Set(['related-1']),
            totalNodes: 3,
            progressPercentage: 33.33,
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Basic Rendering', () => {
        it('should render node details correctly', () => {
            render(<NodeDetailsPanel {...defaultProps} />);

            expect(screen.getByText('Test Node')).toBeInTheDocument();
            expect(screen.getByText('This is a test node description')).toBeInTheDocument();
            expect(screen.getByText('Test Section')).toBeInTheDocument();
            expect(screen.getByText('2 hours')).toBeInTheDocument();
            expect(screen.getByText('Trung bình')).toBeInTheDocument();
        });

        it('should render category information', () => {
            render(<NodeDetailsPanel {...defaultProps} />);

            expect(screen.getByText('🛠️')).toBeInTheDocument();
            expect(screen.getByText('Kỹ năng')).toBeInTheDocument();
        });

        it('should render resources section', () => {
            render(<NodeDetailsPanel {...defaultProps} />);

            expect(screen.getByText('Tài nguyên (2)')).toBeInTheDocument();
            expect(screen.getByText('Test Article')).toBeInTheDocument();
            expect(screen.getByText('Test Video')).toBeInTheDocument();
        });

        it('should render learning objectives section', () => {
            render(<NodeDetailsPanel {...defaultProps} />);

            expect(screen.getByText('🎯 Mục tiêu học tập (2)')).toBeInTheDocument();
            expect(screen.getByText('Understand the basics of testing')).toBeInTheDocument();
            expect(screen.getByText('Learn how to write effective test cases')).toBeInTheDocument();
        });

        it('should render learning outcomes section', () => {
            render(<NodeDetailsPanel {...defaultProps} />);

            expect(screen.getByText('✅ Kết quả học tập (2)')).toBeInTheDocument();
            expect(screen.getByText('Ability to create comprehensive test suites')).toBeInTheDocument();
            expect(screen.getByText('Understanding of testing best practices')).toBeInTheDocument();
        });

        it('should render key topics section', () => {
            render(<NodeDetailsPanel {...defaultProps} />);

            expect(screen.getByText('📚 Chủ đề chính (3)')).toBeInTheDocument();
            expect(screen.getByText('Unit Testing')).toBeInTheDocument();
            expect(screen.getByText('Integration Testing')).toBeInTheDocument();
            expect(screen.getByText('Test-Driven Development')).toBeInTheDocument();
        });

        it('should render skills gained section', () => {
            render(<NodeDetailsPanel {...defaultProps} />);

            expect(screen.getByText('🛠️ Kỹ năng đạt được (3)')).toBeInTheDocument();
            expect(screen.getByText('Jest Testing Framework')).toBeInTheDocument();
            expect(screen.getByText('Test Case Design')).toBeInTheDocument();
            expect(screen.getByText('Debugging Skills')).toBeInTheDocument();
        });

        it('should render comprehensive information summary', () => {
            render(<NodeDetailsPanel {...defaultProps} />);

            // Check the summary statistics
            expect(screen.getByText('2')).toBeInTheDocument(); // Learning objectives count
            expect(screen.getByText('Mục tiêu')).toBeInTheDocument();
            expect(screen.getByText('Kết quả')).toBeInTheDocument();
            expect(screen.getByText('Kỹ năng')).toBeInTheDocument();
            expect(screen.getByText('Tài nguyên')).toBeInTheDocument();
        });

        it('should render prerequisites section', () => {
            render(<NodeDetailsPanel {...defaultProps} />);

            expect(screen.getByText('Yêu cầu trước')).toBeInTheDocument();
            expect(screen.getByText('node-1')).toBeInTheDocument();
            expect(screen.getByText('node-2')).toBeInTheDocument();
        });
    });

    describe('Completion Status', () => {
        it('should show completed status when node is completed', () => {
            const completedNodeData = { ...mockNodeData, completed: true };
            render(
                <NodeDetailsPanel
                    {...defaultProps}
                    nodeData={completedNodeData}
                />
            );

            expect(screen.getByText('Đã hoàn thành')).toBeInTheDocument();
        });

        it('should not show completed status when node is not completed', () => {
            render(<NodeDetailsPanel {...defaultProps} />);

            expect(screen.queryByText('Đã hoàn thành')).not.toBeInTheDocument();
        });
    });

    describe('Difficulty Levels', () => {
        it('should render beginner difficulty correctly', () => {
            const beginnerNodeData = { ...mockNodeData, difficulty: 'beginner' as const };
            render(
                <NodeDetailsPanel
                    {...defaultProps}
                    nodeData={beginnerNodeData}
                />
            );

            expect(screen.getByText('Cơ bản')).toBeInTheDocument();
        });

        it('should render advanced difficulty correctly', () => {
            const advancedNodeData = { ...mockNodeData, difficulty: 'advanced' as const };
            render(
                <NodeDetailsPanel
                    {...defaultProps}
                    nodeData={advancedNodeData}
                />
            );

            expect(screen.getByText('Nâng cao')).toBeInTheDocument();
        });
    });

    describe('Resource Types', () => {
        it('should render different resource types with correct icons', () => {
            const nodeDataWithVariousResources = {
                ...mockNodeData,
                resources: [
                    { title: 'Test Article', url: 'https://example.com', type: 'article' as const },
                    { title: 'Test Video', url: 'https://example.com', type: 'video' as const },
                    { title: 'Test Course', url: 'https://example.com', type: 'course' as const },
                    { title: 'Test Documentation', url: 'https://example.com', type: 'documentation' as const },
                    { title: 'Test Book', url: 'https://example.com', type: 'book' as const },
                ],
            };

            render(
                <NodeDetailsPanel
                    {...defaultProps}
                    nodeData={nodeDataWithVariousResources}
                />
            );

            // Check for resource titles
            expect(screen.getByText('Test Article')).toBeInTheDocument();
            expect(screen.getByText('Test Video')).toBeInTheDocument();
            expect(screen.getByText('Test Course')).toBeInTheDocument();
            expect(screen.getByText('Test Documentation')).toBeInTheDocument();
            expect(screen.getByText('Test Book')).toBeInTheDocument();

            // Check for resource type labels
            expect(screen.getByText('Bài viết')).toBeInTheDocument();
            expect(screen.getByText('Video')).toBeInTheDocument();
            expect(screen.getByText('Khóa học')).toBeInTheDocument();
            expect(screen.getByText('Tài liệu')).toBeInTheDocument();
            expect(screen.getByText('Sách')).toBeInTheDocument();
        });
    });

    describe('Interaction', () => {
        it('should call onClose when close button is clicked', () => {
            const onClose = jest.fn();
            render(<NodeDetailsPanel {...defaultProps} onClose={onClose} />);

            const closeButton = screen.getByLabelText('Đóng panel chi tiết');
            fireEvent.click(closeButton);

            expect(onClose).toHaveBeenCalledTimes(1);
        });

        it('should call onNavigate when navigation button is clicked', () => {
            const onNavigate = jest.fn();
            render(<NodeDetailsPanel {...defaultProps} onNavigate={onNavigate} />);

            const navigateButton = screen.getByText('Đọc bài viết');
            fireEvent.click(navigateButton);

            expect(onNavigate).toHaveBeenCalledWith('/articles/test-article', false);
        });

        it('should open resource links in new tab', () => {
            // Mock window.open
            const mockOpen = jest.fn();
            Object.defineProperty(window, 'open', {
                value: mockOpen,
                writable: true,
            });

            render(<NodeDetailsPanel {...defaultProps} />);

            const resourceLink = screen.getByText('Test Article').closest('a');
            expect(resourceLink).toHaveAttribute('target', '_blank');
            expect(resourceLink).toHaveAttribute('rel', 'noopener noreferrer');
        });
    });

    describe('Keyboard Navigation', () => {
        it('should close panel when Escape key is pressed', async () => {
            const onClose = jest.fn();
            render(<NodeDetailsPanel {...defaultProps} onClose={onClose} />);

            fireEvent.keyDown(document, { key: 'Escape' });

            await waitFor(() => {
                expect(onClose).toHaveBeenCalledTimes(1);
            });
        });

        it('should focus close button on mount', async () => {
            render(<NodeDetailsPanel {...defaultProps} />);

            await waitFor(() => {
                const closeButton = screen.getByLabelText('Đóng panel chi tiết');
                expect(closeButton).toHaveFocus();
            });
        });
    });

    describe('Click Outside', () => {
        it('should close panel when clicking outside', async () => {
            const onClose = jest.fn();
            render(
                <div>
                    <div data-testid="outside">Outside element</div>
                    <NodeDetailsPanel {...defaultProps} onClose={onClose} />
                </div>
            );

            const outsideElement = screen.getByTestId('outside');
            fireEvent.mouseDown(outsideElement);

            await waitFor(() => {
                expect(onClose).toHaveBeenCalledTimes(1);
            });
        });

        it('should not close panel when clicking inside', async () => {
            const onClose = jest.fn();
            render(<NodeDetailsPanel {...defaultProps} onClose={onClose} />);

            const panel = screen.getByRole('dialog');
            fireEvent.mouseDown(panel);

            // Wait a bit to ensure no close call
            await new Promise(resolve => setTimeout(resolve, 100));
            expect(onClose).not.toHaveBeenCalled();
        });
    });

    describe('Accessibility', () => {
        it('should have proper ARIA attributes', () => {
            render(<NodeDetailsPanel {...defaultProps} />);

            const dialog = screen.getByRole('dialog');
            expect(dialog).toHaveAttribute('aria-labelledby', 'node-details-title');
            expect(dialog).toHaveAttribute('aria-describedby', 'node-details-description');
        });

        it('should have proper heading structure', () => {
            render(<NodeDetailsPanel {...defaultProps} />);

            const title = screen.getByRole('heading', { level: 2 });
            expect(title).toHaveTextContent('Test Node');
            expect(title).toHaveAttribute('id', 'node-details-title');
        });
    });

    describe('Optional Fields', () => {
        it('should handle missing optional fields gracefully', () => {
            const minimalNodeData: NodeData = {
                label: 'Minimal Node',
                level: 1,
                section: 'Test Section',
            };

            render(
                <NodeDetailsPanel
                    {...defaultProps}
                    nodeData={minimalNodeData}
                />
            );

            expect(screen.getByText('Minimal Node')).toBeInTheDocument();
            expect(screen.queryByText('Mô tả')).not.toBeInTheDocument();
            expect(screen.queryByText('Tài nguyên')).not.toBeInTheDocument();
            expect(screen.queryByText('Yêu cầu trước')).not.toBeInTheDocument();
        });

        it('should not render learning sections when data is not available', () => {
            const minimalNodeData: NodeData = {
                label: 'Minimal Node',
                level: 1,
                section: 'Test Section',
            };

            render(
                <NodeDetailsPanel
                    {...defaultProps}
                    nodeData={minimalNodeData}
                />
            );

            expect(screen.queryByText(/Mục tiêu học tập/)).not.toBeInTheDocument();
            expect(screen.queryByText(/Kết quả học tập/)).not.toBeInTheDocument();
            expect(screen.queryByText(/Chủ đề chính/)).not.toBeInTheDocument();
            expect(screen.queryByText(/Kỹ năng đạt được/)).not.toBeInTheDocument();
        });

        it('should not render navigation button when navigation is not available', () => {
            const nodeDataWithoutNavigation = {
                ...mockNodeData,
                nodeCategory: undefined,
                targetArticleId: undefined,
                targetRoadmapId: undefined,
            };

            // Override the mock for this test
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const mockCanNavigate = require('@viztechstack/roadmap-visualization').canNavigate;
            mockCanNavigate.mockReturnValueOnce(false);

            render(<NodeDetailsPanel nodeId="test-node" nodeData={nodeDataWithoutNavigation} onClose={jest.fn()} />);

            expect(screen.queryByText('Đọc bài viết')).not.toBeInTheDocument();
            expect(screen.queryByText('Xem roadmap')).not.toBeInTheDocument();
        });
    });

    describe('Enhanced Features', () => {
        it('should render tab navigation', () => {
            render(<NodeDetailsPanel {...defaultProps} />);

            expect(screen.getByText('Chi tiết')).toBeInTheDocument();
            expect(screen.getByText('Kết nối')).toBeInTheDocument();
            expect(screen.getByText('Tiến độ')).toBeInTheDocument();
        });

        it('should show connection count badge', () => {
            render(<NodeDetailsPanel {...defaultProps} />);

            // Should show badge with number of connections
            const connectionsTab = screen.getByText('Kết nối').closest('button');
            expect(connectionsTab).toBeInTheDocument();
            // Badge should show "2" for the 2 related nodes
            expect(screen.getByText('2')).toBeInTheDocument();
        });

        it('should switch between tabs', () => {
            render(<NodeDetailsPanel {...defaultProps} />);

            // Initially on details tab
            expect(screen.getByText('Mô tả')).toBeInTheDocument();

            // Click connections tab
            fireEvent.click(screen.getByText('Kết nối'));
            expect(screen.getByText('Nodes liên quan (2)')).toBeInTheDocument();

            // Click progress tab
            fireEvent.click(screen.getByText('Tiến độ'));
            // Use getAllByText to handle multiple elements with same text
            const progressHeaders = screen.getAllByText('Tiến độ học tập');
            expect(progressHeaders.length).toBeGreaterThan(0);
        });

        it('should render related nodes in connections tab', () => {
            render(<NodeDetailsPanel {...defaultProps} />);

            // Switch to connections tab
            fireEvent.click(screen.getByText('Kết nối'));

            expect(screen.getByText('Related Node 1')).toBeInTheDocument();
            expect(screen.getByText('Related Node 2')).toBeInTheDocument();
        });

        it('should call onNodeSelect when related node is clicked', () => {
            const onNodeSelect = jest.fn();
            render(<NodeDetailsPanel {...defaultProps} onNodeSelect={onNodeSelect} />);

            // Switch to connections tab
            fireEvent.click(screen.getByText('Kết nối'));

            // Click on related node
            fireEvent.click(screen.getByText('Related Node 1'));

            expect(onNodeSelect).toHaveBeenCalledWith('related-1');
        });

        it('should render progress information', () => {
            render(<NodeDetailsPanel {...defaultProps} />);

            // Switch to progress tab
            fireEvent.click(screen.getByText('Tiến độ'));

            expect(screen.getByText('1/3')).toBeInTheDocument();
            // Use a more flexible matcher for the percentage text
            expect(screen.getByText((content, element) => {
                return element?.textContent === '33% hoàn thành';
            })).toBeInTheDocument();
        });

        it('should render action buttons', () => {
            render(<NodeDetailsPanel {...defaultProps} />);

            expect(screen.getByTitle('Đánh dấu hoàn thành')).toBeInTheDocument();
            expect(screen.getByTitle('Thêm bookmark')).toBeInTheDocument();
            expect(screen.getByTitle('Chia sẻ node này')).toBeInTheDocument();
        });

        it('should call onMarkComplete when complete button is clicked', () => {
            const onMarkComplete = jest.fn();
            render(<NodeDetailsPanel {...defaultProps} onMarkComplete={onMarkComplete} />);

            fireEvent.click(screen.getByTitle('Đánh dấu hoàn thành'));

            expect(onMarkComplete).toHaveBeenCalledWith('test-node', true);
        });

        it('should call onBookmark when bookmark button is clicked', () => {
            const onBookmark = jest.fn();
            render(<NodeDetailsPanel {...defaultProps} onBookmark={onBookmark} />);

            fireEvent.click(screen.getByTitle('Thêm bookmark'));

            expect(onBookmark).toHaveBeenCalledWith('test-node');
        });

        it('should call onShare when share button is clicked', () => {
            const onShare = jest.fn();
            render(<NodeDetailsPanel {...defaultProps} onShare={onShare} />);

            fireEvent.click(screen.getByTitle('Chia sẻ node này'));

            expect(onShare).toHaveBeenCalledWith('test-node');
        });

        it('should show bookmarked state', () => {
            render(<NodeDetailsPanel {...defaultProps} isBookmarked={true} />);

            expect(screen.getByTitle('Bỏ bookmark')).toBeInTheDocument();
            expect(screen.getByText('Đã lưu')).toBeInTheDocument();
        });

        it('should show completed state in progress tab', () => {
            const completedNodeData = { ...mockNodeData, completed: true };
            render(<NodeDetailsPanel {...defaultProps} nodeData={completedNodeData} />);

            // Switch to progress tab
            fireEvent.click(screen.getByText('Tiến độ'));

            expect(screen.getByText('Đã hoàn thành')).toBeInTheDocument();
            expect(screen.getByText('Bạn đã hoàn thành node này')).toBeInTheDocument();
        });

        it('should handle keyboard navigation between tabs', () => {
            render(<NodeDetailsPanel {...defaultProps} />);

            // Simulate Ctrl+Tab
            fireEvent.keyDown(document, { key: 'Tab', ctrlKey: true });

            // Should switch to connections tab
            expect(screen.getByText('Nodes liên quan (2)')).toBeInTheDocument();
        });

        it('should show connection statistics', () => {
            render(<NodeDetailsPanel {...defaultProps} />);

            // Switch to connections tab
            fireEvent.click(screen.getByText('Kết nối'));

            expect(screen.getByText('Thống kê kết nối')).toBeInTheDocument();
            expect(screen.getByText('Tổng kết nối')).toBeInTheDocument();
            expect(screen.getByText('Đã hoàn thành')).toBeInTheDocument();
        });

        it('should show empty state when no connections', () => {
            const propsWithoutConnections = {
                ...defaultProps,
                allEdges: [],
            };
            render(<NodeDetailsPanel {...propsWithoutConnections} />);

            // Switch to connections tab
            fireEvent.click(screen.getByText('Kết nối'));

            expect(screen.getByText('Không có kết nối nào được tìm thấy')).toBeInTheDocument();
        });

        it('should highlight related nodes when they are highlighted in graph', () => {
            const propsWithHighlights = {
                ...defaultProps,
                highlightedNodes: new Set(['related-1']),
            };
            render(<NodeDetailsPanel {...propsWithHighlights} />);

            // Switch to connections tab
            fireEvent.click(screen.getByText('Kết nối'));

            // The highlighted node should have different styling
            const relatedNode1 = screen.getByText('Related Node 1').closest('button');
            expect(relatedNode1).toHaveClass('border-primary-300', 'bg-primary-50');
        });
    });

    describe('Responsive Design', () => {
        it('should apply responsive classes', () => {
            render(<NodeDetailsPanel {...defaultProps} />);

            const panel = screen.getByRole('dialog');
            expect(panel).toHaveClass('max-w-md', 'w-full');
        });

        it('should show abbreviated text on small screens', () => {
            render(<NodeDetailsPanel {...defaultProps} />);

            // Action buttons should show abbreviated text on small screens
            const completeButton = screen.getByTitle('Đánh dấu hoàn thành');
            expect(completeButton.querySelector('.hidden.sm\\:inline')).toBeInTheDocument();
        });
    });

    describe('Animation Classes', () => {
        it('should apply animation classes', () => {
            render(<NodeDetailsPanel {...defaultProps} className="test-class" />);

            const dialog = screen.getByRole('dialog');
            expect(dialog).toHaveClass('animate-slide-down', 'test-class');
        });
    });
});