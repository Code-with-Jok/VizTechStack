/**
 * LayoutControls Component Tests
 * 
 * Tests for the unified LayoutControls component that integrates
 * all layout functionality with the LayoutManager service.
 * 
 * Validates: Requirement 3.5
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LayoutControls } from '../LayoutControls';
import type {
    LayoutType,
    GraphData,
    HierarchicalLayoutOptions,
    CircularLayoutOptions,
    GridLayoutOptions
} from '@viztechstack/roadmap-visualization';
import type { ForceDirectedLayoutOptions } from '../../../hooks/useForceLayout';

// Mock graph data
const mockGraphData: GraphData = {
    nodes: [
        {
            id: '1',
            type: 'topic',
            position: { x: 0, y: 0 },
            data: {
                label: 'Test Node 1',
                level: 0,
                section: 'Test Section'
            }
        },
        {
            id: '2',
            type: 'topic',
            position: { x: 100, y: 0 },
            data: {
                label: 'Test Node 2',
                level: 1,
                section: 'Test Section'
            }
        }
    ],
    edges: [
        {
            id: 'e1-2',
            source: '1',
            target: '2',
            type: 'progression',
            data: { relationship: 'leads-to' }
        }
    ],
    metadata: {
        totalNodes: 2,
        totalEdges: 1,
        maxDepth: 1,
        layoutType: 'hierarchical',
        generatedAt: new Date()
    }
};

// Default layout options
const defaultHierarchicalOptions: HierarchicalLayoutOptions = {
    direction: 'TB',
    nodeWidth: 200,
    nodeHeight: 80,
    nodeSep: 50,
    edgeSep: 10,
    rankSep: 100,
    marginX: 20,
    marginY: 20,
};

const defaultForceOptions: ForceDirectedLayoutOptions = {
    centerStrength: 0.1,
    linkStrength: 0.3,
    linkDistance: 100,
    chargeStrength: -300,
    collisionRadius: 40,
    alphaDecay: 0.02,
    velocityDecay: 0.4,
    iterations: 300,
    enableCollision: true,
    enableCentering: true,
    strengthByType: {
        dependency: 0.8,
        progression: 0.6,
        related: 0.3,
        optional: 0.2
    }
};

const defaultCircularOptions: CircularLayoutOptions = {
    innerRadius: 100,
    outerRadius: 350,
    startAngle: 0,
    endAngle: 2 * Math.PI,
    levelSpacing: 80,
    angularSpacing: 0.1,
    enableOptimization: true,
    sortByLevel: true,
    preventOverlaps: true,
    minNodeSpacing: 40
};

const defaultGridOptions: GridLayoutOptions = {
    columns: 0,
    rows: 0,
    cellWidth: 200,
    cellHeight: 120,
    paddingX: 20,
    paddingY: 20,
    marginX: 40,
    marginY: 40,
    autoSize: true,
    sortBy: 'level',
    sortDirection: 'asc',
    groupBy: 'level',
    enableOptimization: true,
    preventOverlaps: true,
    centerGrid: true,
    aspectRatio: 1.5
};

describe('LayoutControls', () => {
    const mockOnLayoutChange = jest.fn();
    const mockOnHierarchicalOptionsChange = jest.fn();
    const mockOnForceOptionsChange = jest.fn();
    const mockOnCircularOptionsChange = jest.fn();
    const mockOnGridOptionsChange = jest.fn();
    const mockOnCollapseLevel = jest.fn();
    const mockOnExpandLevel = jest.fn();
    const mockOnCollapseAll = jest.fn();
    const mockOnExpandAll = jest.fn();
    const mockOnTransitionStart = jest.fn();
    const mockOnTransitionComplete = jest.fn();
    const mockOnTransitionError = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Basic Rendering', () => {
        it('renders with minimal props', () => {
            render(
                <LayoutControls
                    currentLayout="hierarchical"
                    onLayoutChange={mockOnLayoutChange}
                />
            );

            expect(screen.getByText('Bố cục sơ đồ')).toBeInTheDocument();
            expect(screen.getByDisplayValue(/Phân cấp/)).toBeInTheDocument();
        });

        it('renders with all layout options', () => {
            render(
                <LayoutControls
                    currentLayout="hierarchical"
                    onLayoutChange={mockOnLayoutChange}
                    graphData={mockGraphData}
                    hierarchicalOptions={defaultHierarchicalOptions}
                    onHierarchicalOptionsChange={mockOnHierarchicalOptionsChange}
                    forceOptions={defaultForceOptions}
                    onForceOptionsChange={mockOnForceOptionsChange}
                    circularOptions={defaultCircularOptions}
                    onCircularOptionsChange={mockOnCircularOptionsChange}
                    gridOptions={defaultGridOptions}
                    onGridOptionsChange={mockOnGridOptionsChange}
                    onCollapseLevel={mockOnCollapseLevel}
                    onExpandLevel={mockOnExpandLevel}
                    onCollapseAll={mockOnCollapseAll}
                    onExpandAll={mockOnExpandAll}
                    collapsedLevels={new Set()}
                    totalLevels={2}
                />
            );

            expect(screen.getByText('Bố cục sơ đồ')).toBeInTheDocument();
            expect(screen.getByText('Phân cấp')).toBeInTheDocument();
        });

        it('displays current layout information', () => {
            render(
                <LayoutControls
                    currentLayout="force"
                    onLayoutChange={mockOnLayoutChange}
                />
            );

            expect(screen.getByText('Lực hút')).toBeInTheDocument();
            expect(screen.getByText('Khám phá mối quan hệ phức tạp giữa các chủ đề')).toBeInTheDocument();
        });
    });

    describe('Layout Selection', () => {
        it('calls onLayoutChange when layout is selected', async () => {
            const user = userEvent.setup();

            render(
                <LayoutControls
                    currentLayout="hierarchical"
                    onLayoutChange={mockOnLayoutChange}
                />
            );

            const select = screen.getByRole('combobox');
            await user.selectOptions(select, 'force');

            expect(mockOnLayoutChange).toHaveBeenCalledWith('force', {});
        });

        it('does not call onLayoutChange when same layout is selected', async () => {
            const user = userEvent.setup();

            render(
                <LayoutControls
                    currentLayout="hierarchical"
                    onLayoutChange={mockOnLayoutChange}
                />
            );

            const select = screen.getByRole('combobox');
            await user.selectOptions(select, 'hierarchical');

            expect(mockOnLayoutChange).not.toHaveBeenCalled();
        });

        it('disables selection during transition', () => {
            render(
                <LayoutControls
                    currentLayout="hierarchical"
                    onLayoutChange={mockOnLayoutChange}
                    isTransitioning={true}
                />
            );

            const select = screen.getByRole('combobox');
            expect(select).toBeDisabled();
        });
    });

    describe('Transition State', () => {
        it('displays transition progress', () => {
            render(
                <LayoutControls
                    currentLayout="hierarchical"
                    onLayoutChange={mockOnLayoutChange}
                    isTransitioning={true}
                    transitionProgress={0.5}
                />
            );

            expect(screen.getByText('Đang chuyển đổi bố cục...')).toBeInTheDocument();
            expect(screen.getByText('50%')).toBeInTheDocument();
        });

        it('shows loading spinner during transition', () => {
            render(
                <LayoutControls
                    currentLayout="hierarchical"
                    onLayoutChange={mockOnLayoutChange}
                    isTransitioning={true}
                />
            );

            const spinner = screen.getByRole('combobox').parentElement?.querySelector('.animate-spin');
            expect(spinner).toBeInTheDocument();
        });

        it('hides layout-specific controls during transition', () => {
            render(
                <LayoutControls
                    currentLayout="hierarchical"
                    onLayoutChange={mockOnLayoutChange}
                    isTransitioning={true}
                    hierarchicalOptions={defaultHierarchicalOptions}
                    onHierarchicalOptionsChange={mockOnHierarchicalOptionsChange}
                    onCollapseLevel={mockOnCollapseLevel}
                    onExpandLevel={mockOnExpandLevel}
                    onCollapseAll={mockOnCollapseAll}
                    onExpandAll={mockOnExpandAll}
                    collapsedLevels={new Set()}
                    totalLevels={2}
                />
            );

            expect(screen.queryByText('Điều khiển bố cục phân cấp')).not.toBeInTheDocument();
        });
    });

    describe('Layout History', () => {
        it('displays layout history indicators', () => {
            render(
                <LayoutControls
                    currentLayout="force"
                    onLayoutChange={mockOnLayoutChange}
                    layoutHistory={['hierarchical', 'circular', 'force']}
                />
            );

            expect(screen.getByText('Lịch sử:')).toBeInTheDocument();
            const indicators = screen.getAllByTitle(/Phân cấp|Vòng tròn|Lực hút/);
            expect(indicators).toHaveLength(3);
        });

        it('highlights current layout in history', () => {
            render(
                <LayoutControls
                    currentLayout="force"
                    onLayoutChange={mockOnLayoutChange}
                    layoutHistory={['hierarchical', 'force']}
                />
            );

            const currentIndicator = screen.getByTitle('Lực hút');
            expect(currentIndicator).toHaveClass('bg-primary-500');
        });
    });

    describe('Layout-Specific Controls', () => {
        it('shows hierarchical controls when hierarchical layout is active', () => {
            render(
                <LayoutControls
                    currentLayout="hierarchical"
                    onLayoutChange={mockOnLayoutChange}
                    hierarchicalOptions={defaultHierarchicalOptions}
                    onHierarchicalOptionsChange={mockOnHierarchicalOptionsChange}
                    onCollapseLevel={mockOnCollapseLevel}
                    onExpandLevel={mockOnExpandLevel}
                    onCollapseAll={mockOnCollapseAll}
                    onExpandAll={mockOnExpandAll}
                    collapsedLevels={new Set()}
                    totalLevels={2}
                />
            );

            expect(screen.getByText('Điều khiển bố cục phân cấp')).toBeInTheDocument();
        });

        it('shows force controls when force layout is active', () => {
            render(
                <LayoutControls
                    currentLayout="force"
                    onLayoutChange={mockOnLayoutChange}
                    forceOptions={defaultForceOptions}
                    onForceOptionsChange={mockOnForceOptionsChange}
                    manualPositioning={false}
                    onManualPositioningChange={jest.fn()}
                    simulationSpeed={1}
                    onSimulationSpeedChange={jest.fn()}
                />
            );

            expect(screen.getByText('Điều khiển bố cục lực hút')).toBeInTheDocument();
        });

        it('shows circular controls when circular layout is active', () => {
            render(
                <LayoutControls
                    currentLayout="circular"
                    onLayoutChange={mockOnLayoutChange}
                    circularOptions={defaultCircularOptions}
                    onCircularOptionsChange={mockOnCircularOptionsChange}
                    circularRotationSpeed={1}
                    onCircularRotationSpeedChange={jest.fn()}
                    circularSectorHighlight={{
                        enabled: false,
                        startAngle: 0,
                        endAngle: Math.PI / 2,
                        color: '#3b82f6'
                    }}
                    onCircularSectorHighlightChange={jest.fn()}
                    onCircularRotateTo={jest.fn()}
                />
            );

            expect(screen.getByText('Điều khiển bố cục vòng tròn')).toBeInTheDocument();
        });

        it('shows grid controls when grid layout is active', () => {
            render(
                <LayoutControls
                    currentLayout="grid"
                    onLayoutChange={mockOnLayoutChange}
                    gridOptions={defaultGridOptions}
                    onGridOptionsChange={mockOnGridOptionsChange}
                    gridSnapToGrid={true}
                    onGridSnapToGridChange={jest.fn()}
                    gridShowGridLines={false}
                    onGridShowGridLinesChange={jest.fn()}
                    gridAlignment={{
                        horizontal: 'center',
                        vertical: 'center'
                    }}
                    onGridAlignmentChange={jest.fn()}
                    onGridOptimizeForContent={jest.fn()}
                />
            );

            expect(screen.getByText('Điều khiển bố cục lưới')).toBeInTheDocument();
        });
    });

    describe('Performance Recommendations', () => {
        it('shows performance indicator for current layout', () => {
            render(
                <LayoutControls
                    currentLayout="hierarchical"
                    onLayoutChange={mockOnLayoutChange}
                />
            );

            expect(screen.getByText('⚡ Nhanh')).toBeInTheDocument();
        });

        it('shows different performance indicators for different layouts', () => {
            const { rerender } = render(
                <LayoutControls
                    currentLayout="force"
                    onLayoutChange={mockOnLayoutChange}
                />
            );

            expect(screen.getByText('🐌 Chậm')).toBeInTheDocument();

            rerender(
                <LayoutControls
                    currentLayout="circular"
                    onLayoutChange={mockOnLayoutChange}
                />
            );

            expect(screen.getByText('⚖️ Trung bình')).toBeInTheDocument();
        });

        it('provides layout recommendations based on graph size', async () => {
            const user = userEvent.setup();

            // Large graph should recommend grid layout
            const largeGraphData = {
                ...mockGraphData,
                nodes: Array.from({ length: 150 }, (_, i) => ({
                    id: `node-${i}`,
                    type: 'topic' as const,
                    position: { x: 0, y: 0 },
                    data: {
                        label: `Node ${i}`,
                        level: 0,
                        section: 'Test'
                    }
                })),
                metadata: {
                    ...mockGraphData.metadata,
                    totalNodes: 150
                }
            };

            render(
                <LayoutControls
                    currentLayout="hierarchical"
                    onLayoutChange={mockOnLayoutChange}
                    graphData={largeGraphData}
                />
            );

            // Click info button to show recommendations
            const infoButton = screen.getByTitle('Thông tin chi tiết');
            await user.click(infoButton);

            expect(screen.getByText(/khuyến nghị dùng bố cục Lưới/)).toBeInTheDocument();
        });
    });

    describe('Advanced Features', () => {
        it('shows quick layout switching when showAdvanced is true', () => {
            render(
                <LayoutControls
                    currentLayout="hierarchical"
                    onLayoutChange={mockOnLayoutChange}
                    showAdvanced={true}
                />
            );

            expect(screen.getByText('Chuyển đổi nhanh')).toBeInTheDocument();
        });

        it('allows quick switching between layouts', async () => {
            const user = userEvent.setup();

            render(
                <LayoutControls
                    currentLayout="hierarchical"
                    onLayoutChange={mockOnLayoutChange}
                    showAdvanced={true}
                />
            );

            const forceButton = screen.getByText('Lực hút');
            await user.click(forceButton);

            expect(mockOnLayoutChange).toHaveBeenCalledWith('force', {});
        });

        it('disables current layout in quick switch', () => {
            render(
                <LayoutControls
                    currentLayout="hierarchical"
                    onLayoutChange={mockOnLayoutChange}
                    showAdvanced={true}
                />
            );

            const hierarchicalButton = screen.getByText('Phân cấp');
            expect(hierarchicalButton).toBeDisabled();
        });
    });

    describe('Expand/Collapse', () => {
        it('can be collapsed and expanded', async () => {
            const user = userEvent.setup();

            render(
                <LayoutControls
                    currentLayout="hierarchical"
                    onLayoutChange={mockOnLayoutChange}
                    hierarchicalOptions={defaultHierarchicalOptions}
                    onHierarchicalOptionsChange={mockOnHierarchicalOptionsChange}
                    onCollapseLevel={mockOnCollapseLevel}
                    onExpandLevel={mockOnExpandLevel}
                    onCollapseAll={mockOnCollapseAll}
                    onExpandAll={mockOnExpandAll}
                    collapsedLevels={new Set()}
                    totalLevels={2}
                />
            );

            // Initially expanded
            expect(screen.getByText('Điều khiển bố cục phân cấp')).toBeInTheDocument();

            // Collapse
            const toggleButton = screen.getByLabelText('Thu gọn điều khiển');
            await user.click(toggleButton);

            expect(screen.queryByText('Điều khiển bố cục phân cấp')).not.toBeInTheDocument();

            // Expand again
            const expandButton = screen.getByLabelText('Mở rộng điều khiển');
            await user.click(expandButton);

            expect(screen.getByText('Điều khiển bố cục phân cấp')).toBeInTheDocument();
        });
    });

    describe('Transition Callbacks', () => {
        it('calls transition callbacks when provided', async () => {
            const user = userEvent.setup();

            render(
                <LayoutControls
                    currentLayout="hierarchical"
                    onLayoutChange={mockOnLayoutChange}
                    onTransitionStart={mockOnTransitionStart}
                    onTransitionComplete={mockOnTransitionComplete}
                    onTransitionError={mockOnTransitionError}
                />
            );

            const select = screen.getByRole('combobox');
            await user.selectOptions(select, 'force');

            expect(mockOnTransitionStart).toHaveBeenCalledWith('hierarchical', 'force');
        });

        it('calls onTransitionComplete when transition finishes', () => {
            const { rerender } = render(
                <LayoutControls
                    currentLayout="hierarchical"
                    onLayoutChange={mockOnLayoutChange}
                    isTransitioning={true}
                    transitionProgress={0.5}
                    onTransitionComplete={mockOnTransitionComplete}
                />
            );

            rerender(
                <LayoutControls
                    currentLayout="hierarchical"
                    onLayoutChange={mockOnLayoutChange}
                    isTransitioning={false}
                    transitionProgress={1}
                    onTransitionComplete={mockOnTransitionComplete}
                />
            );

            expect(mockOnTransitionComplete).toHaveBeenCalledWith('hierarchical');
        });
    });

    describe('Accessibility', () => {
        it('has proper ARIA labels', () => {
            render(
                <LayoutControls
                    currentLayout="hierarchical"
                    onLayoutChange={mockOnLayoutChange}
                />
            );

            expect(screen.getByLabelText('Chọn loại bố cục')).toBeInTheDocument();
            expect(screen.getByLabelText('Thu gọn điều khiển')).toBeInTheDocument();
        });

        it('supports keyboard navigation', async () => {
            const user = userEvent.setup();

            render(
                <LayoutControls
                    currentLayout="hierarchical"
                    onLayoutChange={mockOnLayoutChange}
                />
            );

            const select = screen.getByRole('combobox');

            // Focus and navigate with keyboard
            await user.tab();
            expect(select).toHaveFocus();

            await user.keyboard('{ArrowDown}');
            await user.keyboard('{Enter}');

            // Should trigger layout change
            expect(mockOnLayoutChange).toHaveBeenCalled();
        });
    });

    describe('Error Handling', () => {
        it('handles missing layout options gracefully', () => {
            render(
                <LayoutControls
                    currentLayout="hierarchical"
                    onLayoutChange={mockOnLayoutChange}
                />
            );

            // Should render without crashing even without layout options
            expect(screen.getByText('Bố cục sơ đồ')).toBeInTheDocument();
        });

        it('handles invalid layout type gracefully', () => {
            render(
                <LayoutControls
                    currentLayout={'invalid' as LayoutType}
                    onLayoutChange={mockOnLayoutChange}
                />
            );

            // Should render without crashing
            expect(screen.getByText('Bố cục sơ đồ')).toBeInTheDocument();
        });
    });
});