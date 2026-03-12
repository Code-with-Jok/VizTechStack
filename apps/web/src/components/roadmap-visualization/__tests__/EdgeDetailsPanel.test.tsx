/**
 * Tests for EdgeDetailsPanel component
 * Kiểm tra rendering, interaction và accessibility
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EdgeDetailsPanel } from '../EdgeDetailsPanel';
import type { EdgeRelationshipDetails } from '@/hooks/useEdgeInteraction';
import type { RoadmapNode } from '@viztechstack/roadmap-visualization';

// Mock nodes cho testing
const mockSourceNode: RoadmapNode = {
    id: 'source-node',
    type: 'topic',
    position: { x: 0, y: 0 },
    data: {
        label: 'HTML Cơ Bản',
        description: 'Học các thẻ HTML cơ bản và cấu trúc trang web',
        level: 1,
        section: 'Frontend Fundamentals',
        difficulty: 'beginner',
        estimatedTime: '2 tuần',
    }
};

const mockTargetNode: RoadmapNode = {
    id: 'target-node',
    type: 'topic',
    position: { x: 100, y: 0 },
    data: {
        label: 'CSS Fundamentals',
        description: 'Styling và layout với CSS',
        level: 2,
        section: 'Frontend Fundamentals',
        difficulty: 'intermediate',
        estimatedTime: '3 tuần',
    }
};

// Mock relationship details cho different scenarios
const mockPrerequisiteDetails: EdgeRelationshipDetails = {
    edgeId: 'edge-1',
    sourceNode: mockSourceNode,
    targetNode: mockTargetNode,
    relationship: 'prerequisite',
    strength: 0.9,
    bidirectional: false,
    description: '"HTML Cơ Bản" là điều kiện tiên quyết để học "CSS Fundamentals"',
    reasoning: 'Cần nắm vững kiến thức HTML trước khi có thể styling hiệu quả với CSS'
};

const mockLeadsToDetails: EdgeRelationshipDetails = {
    edgeId: 'edge-2',
    sourceNode: mockSourceNode,
    targetNode: mockTargetNode,
    relationship: 'leads-to',
    strength: 0.7,
    bidirectional: false,
    description: 'Hoàn thành "HTML Cơ Bản" sẽ dẫn đến "CSS Fundamentals"',
    reasoning: 'Tiến trình học tập tự nhiên từ markup sang styling'
};

const mockBidirectionalDetails: EdgeRelationshipDetails = {
    edgeId: 'edge-3',
    sourceNode: mockSourceNode,
    targetNode: mockTargetNode,
    relationship: 'related-to',
    strength: 0.5,
    bidirectional: true,
    description: '"HTML Cơ Bản" có liên quan đến "CSS Fundamentals"',
    reasoning: 'Cả hai đều là fundamental skills cho frontend development'
};

describe('EdgeDetailsPanel', () => {
    const defaultProps = {
        relationshipDetails: mockPrerequisiteDetails,
        onClose: jest.fn(),
        onNavigateToNode: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render panel with relationship details', () => {
            render(<EdgeDetailsPanel {...defaultProps} />);

            expect(screen.getByText('Điều kiện tiên quyết')).toBeInTheDocument();
            expect(screen.getByText('Chi tiết mối quan hệ')).toBeInTheDocument();
            expect(screen.getByText(mockPrerequisiteDetails.description!)).toBeInTheDocument();
        });

        it('should render correct relationship icon and colors for prerequisite', () => {
            render(<EdgeDetailsPanel {...defaultProps} />);

            // Check for prerequisite icon
            expect(screen.getByText('🔒')).toBeInTheDocument();
            expect(screen.getByText('Điều kiện tiên quyết')).toBeInTheDocument();
        });

        it('should render correct relationship icon and colors for leads-to', () => {
            render(
                <EdgeDetailsPanel
                    {...defaultProps}
                    relationshipDetails={mockLeadsToDetails}
                />
            );

            expect(screen.getByText('➡️')).toBeInTheDocument();
            expect(screen.getByText('Dẫn đến')).toBeInTheDocument();
        });

        it('should render source and target node information', () => {
            render(<EdgeDetailsPanel {...defaultProps} />);

            expect(screen.getByText('HTML Cơ Bản')).toBeInTheDocument();
            expect(screen.getByText('CSS Fundamentals')).toBeInTheDocument();
            expect(screen.getByText('Học các thẻ HTML cơ bản và cấu trúc trang web')).toBeInTheDocument();
            expect(screen.getByText('Styling và layout với CSS')).toBeInTheDocument();
        });

        it('should render difficulty badges', () => {
            render(<EdgeDetailsPanel {...defaultProps} />);

            expect(screen.getByText('Cơ bản')).toBeInTheDocument();
            expect(screen.getByText('Trung cấp')).toBeInTheDocument();
        });

        it('should render estimated time', () => {
            render(<EdgeDetailsPanel {...defaultProps} />);

            expect(screen.getByText('⏱️ 2 tuần')).toBeInTheDocument();
            expect(screen.getByText('⏱️ 3 tuần')).toBeInTheDocument();
        });
    });

    describe('Strength Indicator', () => {
        it('should render strength indicator with correct percentage', () => {
            render(<EdgeDetailsPanel {...defaultProps} />);

            expect(screen.getByText('90%')).toBeInTheDocument();
            expect(screen.getByText('Rất mạnh')).toBeInTheDocument();
        });

        it('should render correct strength level for different values', () => {
            const mediumStrengthDetails = {
                ...mockPrerequisiteDetails,
                strength: 0.6
            };

            render(
                <EdgeDetailsPanel
                    {...defaultProps}
                    relationshipDetails={mediumStrengthDetails}
                />
            );

            expect(screen.getByText('60%')).toBeInTheDocument();
            expect(screen.getByText('Trung bình')).toBeInTheDocument();
        });

        it('should handle undefined strength gracefully', () => {
            const noStrengthDetails = {
                ...mockPrerequisiteDetails,
                strength: undefined
            };

            render(
                <EdgeDetailsPanel
                    {...defaultProps}
                    relationshipDetails={noStrengthDetails}
                />
            );

            expect(screen.getByText('Không xác định')).toBeInTheDocument();
        });
    });

    describe('Bidirectional Indicator', () => {
        it('should show bidirectional indicator when edge is bidirectional', () => {
            render(
                <EdgeDetailsPanel
                    {...defaultProps}
                    relationshipDetails={mockBidirectionalDetails}
                />
            );

            expect(screen.getByText('Kết nối hai chiều - có thể học theo cả hai hướng')).toBeInTheDocument();
            expect(screen.getByText('↔️')).toBeInTheDocument();
        });

        it('should not show bidirectional indicator for unidirectional edges', () => {
            render(<EdgeDetailsPanel {...defaultProps} />);

            expect(screen.queryByText('Kết nối hai chiều - có thể học theo cả hai hướng')).not.toBeInTheDocument();
        });
    });

    describe('Interactions', () => {
        it('should call onClose when close button is clicked', () => {
            render(<EdgeDetailsPanel {...defaultProps} />);

            const closeButton = screen.getByLabelText('Đóng panel chi tiết edge');
            fireEvent.click(closeButton);

            expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
        });

        it('should call onNavigateToNode when source node button is clicked', () => {
            render(<EdgeDetailsPanel {...defaultProps} />);

            const sourceButton = screen.getByRole('button', { name: /HTML Cơ Bản/i });
            fireEvent.click(sourceButton);

            expect(defaultProps.onNavigateToNode).toHaveBeenCalledWith('source-node');
        });

        it('should call onNavigateToNode when target node button is clicked', () => {
            render(<EdgeDetailsPanel {...defaultProps} />);

            const targetButton = screen.getByRole('button', { name: /CSS Fundamentals/i });
            fireEvent.click(targetButton);

            expect(defaultProps.onNavigateToNode).toHaveBeenCalledWith('target-node');
        });

        it('should call onNavigateToNode when navigation control buttons are clicked', () => {
            render(<EdgeDetailsPanel {...defaultProps} />);

            const sourceNavButton = screen.getByRole('button', { name: 'Đi đến nguồn' });
            const targetNavButton = screen.getByRole('button', { name: 'Đi đến đích' });

            fireEvent.click(sourceNavButton);
            expect(defaultProps.onNavigateToNode).toHaveBeenCalledWith('source-node');

            fireEvent.click(targetNavButton);
            expect(defaultProps.onNavigateToNode).toHaveBeenCalledWith('target-node');
        });
    });

    describe('Accessibility', () => {
        it('should have proper ARIA labels', () => {
            render(<EdgeDetailsPanel {...defaultProps} />);

            expect(screen.getByLabelText('Đóng panel chi tiết edge')).toBeInTheDocument();
        });

        it('should have proper heading structure', () => {
            render(<EdgeDetailsPanel {...defaultProps} />);

            const headings = screen.getAllByRole('heading');
            expect(headings.length).toBeGreaterThan(0);
        });

        it('should have keyboard accessible buttons', () => {
            render(<EdgeDetailsPanel {...defaultProps} />);

            const buttons = screen.getAllByRole('button');
            buttons.forEach(button => {
                expect(button).not.toHaveAttribute('disabled');
            });
        });
    });

    describe('Visual States', () => {
        it('should apply custom className', () => {
            const { container } = render(
                <EdgeDetailsPanel {...defaultProps} className="custom-class" />
            );

            expect(container.firstChild).toHaveClass('custom-class');
        });

        it('should show reasoning section when provided', () => {
            render(<EdgeDetailsPanel {...defaultProps} />);

            expect(screen.getByText('Lý do kết nối')).toBeInTheDocument();
            expect(screen.getByText(mockPrerequisiteDetails.reasoning!)).toBeInTheDocument();
        });

        it('should handle missing reasoning gracefully', () => {
            const noReasoningDetails = {
                ...mockPrerequisiteDetails,
                reasoning: undefined
            };

            render(
                <EdgeDetailsPanel
                    {...defaultProps}
                    relationshipDetails={noReasoningDetails}
                />
            );

            expect(screen.queryByText('Lý do kết nối')).not.toBeInTheDocument();
        });
    });

    describe('Different Relationship Types', () => {
        const relationshipTypes = [
            { type: 'prerequisite', icon: '🔒', name: 'Điều kiện tiên quyết' },
            { type: 'leads-to', icon: '➡️', name: 'Dẫn đến' },
            { type: 'related-to', icon: '🔗', name: 'Liên quan' },
            { type: 'part-of', icon: '📦', name: 'Thuộc về' }
        ];

        relationshipTypes.forEach(({ type, icon, name }) => {
            it(`should render correct styling for ${type} relationship`, () => {
                const details = {
                    ...mockPrerequisiteDetails,
                    relationship: type as any
                };

                render(
                    <EdgeDetailsPanel
                        {...defaultProps}
                        relationshipDetails={details}
                    />
                );

                expect(screen.getByText(icon)).toBeInTheDocument();
                expect(screen.getByText(name)).toBeInTheDocument();
            });
        });
    });
});