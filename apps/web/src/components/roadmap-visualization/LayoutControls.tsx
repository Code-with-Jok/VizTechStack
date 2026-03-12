'use client';

/**
 * LayoutControls - Unified component that integrates all layout functionality
 * 
 * This component provides a unified interface for:
 * - Layout selection dropdown with current layout information
 * - Layout-specific controls (hierarchical, force, circular, grid)
 * - Integration with LayoutManager service for smooth transitions
 * - Layout transition animations and state preservation
 * 
 * Validates: Requirement 3.5
 */

import React, { useState, useCallback, useEffect } from 'react';
import type {
    LayoutType,
    HierarchicalLayoutOptions,
    CircularLayoutOptions,
    GridLayoutOptions,
    GraphData
} from '@viztechstack/roadmap-visualization';
import type { ForceDirectedLayoutOptions } from '../../hooks/useForceLayout';
import { HierarchicalLayoutControls } from './HierarchicalLayoutControls';
import { ForceLayoutControls } from './ForceLayoutControls';
import { CircularLayoutControls } from './CircularLayoutControls';
import { GridLayoutControls } from './GridLayoutControls';

interface LayoutInfo {
    name: string;
    description: string;
    icon: React.ReactNode;
    bestFor: string;
    performance: 'fast' | 'medium' | 'slow';
}

interface LayoutControlsProps {
    // Core layout management
    currentLayout: LayoutType;
    onLayoutChange: (layout: LayoutType, options?: any) => void;
    isTransitioning?: boolean;
    transitionProgress?: number;
    layoutHistory?: LayoutType[];

    // Graph data for optimization
    graphData?: GraphData;

    // Layout-specific options
    hierarchicalOptions?: HierarchicalLayoutOptions;
    onHierarchicalOptionsChange?: (options: Partial<HierarchicalLayoutOptions>) => void;

    forceOptions?: ForceDirectedLayoutOptions;
    onForceOptionsChange?: (options: Partial<ForceDirectedLayoutOptions>) => void;

    circularOptions?: CircularLayoutOptions;
    onCircularOptionsChange?: (options: Partial<CircularLayoutOptions>) => void;

    gridOptions?: GridLayoutOptions;
    onGridOptionsChange?: (options: Partial<GridLayoutOptions>) => void;

    // Hierarchical layout specific props
    onCollapseLevel?: (level: number) => void;
    onExpandLevel?: (level: number) => void;
    onCollapseAll?: () => void;
    onExpandAll?: () => void;
    collapsedLevels?: Set<number>;
    totalLevels?: number;

    // Force layout specific props
    manualPositioning?: boolean;
    onManualPositioningChange?: (enabled: boolean) => void;
    simulationSpeed?: number;
    onSimulationSpeedChange?: (speed: number) => void;

    // Circular layout specific props
    circularRotationSpeed?: number;
    onCircularRotationSpeedChange?: (speed: number) => void;
    circularSectorHighlight?: {
        enabled: boolean;
        startAngle: number;
        endAngle: number;
        color: string;
    };
    onCircularSectorHighlightChange?: (highlight: Partial<{
        enabled: boolean;
        startAngle: number;
        endAngle: number;
        color: string;
    }>) => void;
    onCircularRotateTo?: (angle: number) => void;

    // Grid layout specific props
    gridSnapToGrid?: boolean;
    onGridSnapToGridChange?: (snap: boolean) => void;
    gridShowGridLines?: boolean;
    onGridShowGridLinesChange?: (show: boolean) => void;
    gridAlignment?: {
        horizontal: 'left' | 'center' | 'right';
        vertical: 'top' | 'center' | 'bottom';
    };
    onGridAlignmentChange?: (alignment: Partial<{
        horizontal: 'left' | 'center' | 'right';
        vertical: 'top' | 'center' | 'bottom';
    }>) => void;
    onGridOptimizeForContent?: () => void;

    // Transition callbacks
    onTransitionStart?: (fromLayout: LayoutType, toLayout: LayoutType) => void;
    onTransitionComplete?: (layout: LayoutType) => void;
    onTransitionError?: (error: Error, layout: LayoutType) => void;

    // UI props
    className?: string;
    showAdvanced?: boolean;
}

const LAYOUT_INFO: Record<LayoutType, LayoutInfo> = {
    hierarchical: {
        name: 'Phân cấp',
        description: 'Bố cục theo cấp độ từ trên xuống hoặc trái sang phải',
        bestFor: 'Lộ trình học tập có cấu trúc rõ ràng',
        performance: 'fast',
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
        ),
    },
    force: {
        name: 'Lực hút',
        description: 'Bố cục động dựa trên lực vật lý và mối quan hệ',
        bestFor: 'Khám phá mối quan hệ phức tạp giữa các chủ đề',
        performance: 'slow',
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        ),
    },
    circular: {
        name: 'Vòng tròn',
        description: 'Bố cục tròn với các cấp độ đồng tâm',
        bestFor: 'Tổng quan về kết nối và phân nhóm chủ đề',
        performance: 'medium',
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
    grid: {
        name: 'Lưới',
        description: 'Bố cục lưới có cấu trúc và dễ đọc',
        bestFor: 'Tổ chức chủ đề một cách có trật tự',
        performance: 'fast',
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
        ),
    },
};

export function LayoutControls({
    currentLayout,
    onLayoutChange,
    isTransitioning = false,
    transitionProgress = 0,
    layoutHistory = [],
    graphData,
    hierarchicalOptions,
    onHierarchicalOptionsChange,
    forceOptions,
    onForceOptionsChange,
    circularOptions,
    onCircularOptionsChange,
    gridOptions,
    onGridOptionsChange,
    onCollapseLevel,
    onExpandLevel,
    onCollapseAll,
    onExpandAll,
    collapsedLevels = new Set(),
    totalLevels = 0,
    manualPositioning = false,
    onManualPositioningChange,
    simulationSpeed = 1,
    onSimulationSpeedChange,
    circularRotationSpeed = 1,
    onCircularRotationSpeedChange,
    circularSectorHighlight = {
        enabled: false,
        startAngle: 0,
        endAngle: Math.PI / 2,
        color: '#3b82f6'
    },
    onCircularSectorHighlightChange,
    onCircularRotateTo,
    gridSnapToGrid = true,
    onGridSnapToGridChange,
    gridShowGridLines = false,
    onGridShowGridLinesChange,
    gridAlignment = {
        horizontal: 'center',
        vertical: 'center'
    },
    onGridAlignmentChange,
    onGridOptimizeForContent,
    onTransitionStart,
    onTransitionComplete,
    onTransitionError,
    className = '',
    showAdvanced = false,
}: LayoutControlsProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [showLayoutInfo, setShowLayoutInfo] = useState(false);

    // Get current layout info
    const currentLayoutInfo = LAYOUT_INFO[currentLayout];

    // Handle layout change with transition support
    const handleLayoutChange = useCallback((newLayout: LayoutType) => {
        if (newLayout === currentLayout || isTransitioning) {
            return;
        }

        // Notify transition start
        if (onTransitionStart) {
            onTransitionStart(currentLayout, newLayout);
        }

        // Get layout-specific options
        let layoutOptions = {};
        switch (newLayout) {
            case 'hierarchical':
                layoutOptions = hierarchicalOptions || {};
                break;
            case 'force':
                layoutOptions = forceOptions || {};
                break;
            case 'circular':
                layoutOptions = circularOptions || {};
                break;
            case 'grid':
                layoutOptions = gridOptions || {};
                break;
        }

        // Trigger layout change
        onLayoutChange(newLayout, layoutOptions);
    }, [
        currentLayout,
        isTransitioning,
        onLayoutChange,
        onTransitionStart,
        hierarchicalOptions,
        forceOptions,
        circularOptions,
        gridOptions
    ]);

    // Handle transition completion
    useEffect(() => {
        if (!isTransitioning && transitionProgress >= 1 && onTransitionComplete) {
            onTransitionComplete(currentLayout);
        }
    }, [isTransitioning, transitionProgress, currentLayout, onTransitionComplete]);

    // Get performance indicator color
    const getPerformanceColor = (performance: 'fast' | 'medium' | 'slow') => {
        switch (performance) {
            case 'fast': return 'text-green-600';
            case 'medium': return 'text-yellow-600';
            case 'slow': return 'text-red-600';
            default: return 'text-neutral-600';
        }
    };

    // Get node count for optimization recommendations
    const nodeCount = graphData?.nodes.length || 0;
    const getRecommendedLayout = () => {
        if (nodeCount > 100) return 'grid';
        if (nodeCount > 50) return 'hierarchical';
        if (nodeCount < 20) return 'circular';
        return 'force';
    };

    return (
        <div className={`bg-white border border-neutral-200 rounded-lg shadow-sm ${className}`}>
            {/* Header with layout selector */}
            <div className="p-4 border-b border-neutral-100">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-neutral-900">Bố cục sơ đồ</h3>
                    <div className="flex items-center space-x-2">
                        {/* Layout history indicator */}
                        {layoutHistory.length > 1 && (
                            <div className="flex items-center space-x-1">
                                <span className="text-xs text-neutral-500">Lịch sử:</span>
                                <div className="flex space-x-1">
                                    {layoutHistory.slice(-3).map((layout, index) => (
                                        <div
                                            key={`${layout}-${index}`}
                                            className={`w-2 h-2 rounded-full ${layout === currentLayout
                                                    ? 'bg-primary-500'
                                                    : 'bg-neutral-300'
                                                }`}
                                            title={LAYOUT_INFO[layout].name}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Expand/collapse toggle */}
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="p-1 text-neutral-500 hover:text-neutral-700 transition-colors"
                            aria-label={isExpanded ? 'Thu gọn điều khiển' : 'Mở rộng điều khiển'}
                        >
                            <svg
                                className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Layout selector */}
                <div className="space-y-3">
                    <div className="relative">
                        <select
                            value={currentLayout}
                            onChange={(e) => handleLayoutChange(e.target.value as LayoutType)}
                            disabled={isTransitioning}
                            className={`w-full input text-sm py-3 px-4 pr-10 appearance-none cursor-pointer bg-white border-neutral-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all duration-200 ${isTransitioning ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            aria-label="Chọn loại bố cục"
                        >
                            {Object.entries(LAYOUT_INFO).map(([key, info]) => (
                                <option key={key} value={key}>
                                    {info.name} - {info.description}
                                </option>
                            ))}
                        </select>

                        {/* Custom dropdown arrow */}
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            {isTransitioning ? (
                                <div className="w-4 h-4 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                            ) : (
                                <svg
                                    className="w-4 h-4 text-neutral-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            )}
                        </div>
                    </div>

                    {/* Current layout info */}
                    <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-md">
                        <div className="flex items-center space-x-3">
                            <div className="text-primary-600">
                                {currentLayoutInfo.icon}
                            </div>
                            <div>
                                <div className="text-sm font-medium text-neutral-900">
                                    {currentLayoutInfo.name}
                                </div>
                                <div className="text-xs text-neutral-600">
                                    {currentLayoutInfo.bestFor}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            {/* Performance indicator */}
                            <div className={`text-xs font-medium ${getPerformanceColor(currentLayoutInfo.performance)}`}>
                                {currentLayoutInfo.performance === 'fast' && '⚡ Nhanh'}
                                {currentLayoutInfo.performance === 'medium' && '⚖️ Trung bình'}
                                {currentLayoutInfo.performance === 'slow' && '🐌 Chậm'}
                            </div>

                            {/* Info button */}
                            <button
                                onClick={() => setShowLayoutInfo(!showLayoutInfo)}
                                className="p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
                                title="Thông tin chi tiết"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Layout info panel */}
                    {showLayoutInfo && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                            <div className="text-xs text-blue-800 space-y-1">
                                <div><strong>Mô tả:</strong> {currentLayoutInfo.description}</div>
                                <div><strong>Phù hợp cho:</strong> {currentLayoutInfo.bestFor}</div>
                                <div><strong>Hiệu suất:</strong> {currentLayoutInfo.performance}</div>
                                {nodeCount > 0 && (
                                    <div>
                                        <strong>Khuyến nghị:</strong> {
                                            getRecommendedLayout() === currentLayout
                                                ? 'Bố cục hiện tại phù hợp với số lượng nút'
                                                : `Với ${nodeCount} nút, khuyến nghị dùng bố cục ${LAYOUT_INFO[getRecommendedLayout()].name}`
                                        }
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Transition progress */}
                    {isTransitioning && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs text-neutral-600">
                                <span>Đang chuyển đổi bố cục...</span>
                                <span>{Math.round(transitionProgress * 100)}%</span>
                            </div>
                            <div className="w-full bg-neutral-200 rounded-full h-1.5">
                                <div
                                    className="bg-primary-600 h-1.5 rounded-full transition-all duration-300 ease-out"
                                    style={{ width: `${transitionProgress * 100}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Layout-specific controls */}
            {isExpanded && !isTransitioning && (
                <div className="p-4 space-y-4">
                    {/* Hierarchical layout controls */}
                    {currentLayout === 'hierarchical' &&
                        hierarchicalOptions &&
                        onHierarchicalOptionsChange &&
                        onCollapseLevel &&
                        onExpandLevel &&
                        onCollapseAll &&
                        onExpandAll && (
                            <HierarchicalLayoutControls
                                options={hierarchicalOptions}
                                onOptionsChange={onHierarchicalOptionsChange}
                                onCollapseLevel={onCollapseLevel}
                                onExpandLevel={onExpandLevel}
                                onCollapseAll={onCollapseAll}
                                onExpandAll={onExpandAll}
                                collapsedLevels={collapsedLevels}
                                totalLevels={totalLevels}
                            />
                        )}

                    {/* Force layout controls */}
                    {currentLayout === 'force' &&
                        forceOptions &&
                        onForceOptionsChange &&
                        onManualPositioningChange &&
                        onSimulationSpeedChange && (
                            <ForceLayoutControls
                                options={forceOptions}
                                onOptionsChange={onForceOptionsChange}
                                manualPositioning={manualPositioning}
                                onManualPositioningChange={onManualPositioningChange}
                                simulationSpeed={simulationSpeed}
                                onSimulationSpeedChange={onSimulationSpeedChange}
                            />
                        )}

                    {/* Circular layout controls */}
                    {currentLayout === 'circular' &&
                        circularOptions &&
                        onCircularOptionsChange &&
                        onCircularRotationSpeedChange &&
                        onCircularSectorHighlightChange &&
                        onCircularRotateTo && (
                            <CircularLayoutControls
                                options={circularOptions}
                                onOptionsChange={onCircularOptionsChange}
                                rotationSpeed={circularRotationSpeed}
                                onRotationSpeedChange={onCircularRotationSpeedChange}
                                sectorHighlight={circularSectorHighlight}
                                onSectorHighlightChange={onCircularSectorHighlightChange}
                                onRotateTo={onCircularRotateTo}
                            />
                        )}

                    {/* Grid layout controls */}
                    {currentLayout === 'grid' &&
                        gridOptions &&
                        onGridOptionsChange &&
                        onGridSnapToGridChange &&
                        onGridShowGridLinesChange &&
                        onGridAlignmentChange &&
                        onGridOptimizeForContent && (
                            <GridLayoutControls
                                options={gridOptions}
                                onOptionsChange={onGridOptionsChange}
                                snapToGrid={gridSnapToGrid}
                                onSnapToGridChange={onGridSnapToGridChange}
                                showGridLines={gridShowGridLines}
                                onShowGridLinesChange={onGridShowGridLinesChange}
                                alignment={gridAlignment}
                                onAlignmentChange={onGridAlignmentChange}
                                onOptimizeForContent={onGridOptimizeForContent}
                            />
                        )}

                    {/* Quick layout switching */}
                    {showAdvanced && (
                        <div className="pt-4 border-t border-neutral-100">
                            <h4 className="text-xs font-medium text-neutral-700 mb-3">Chuyển đổi nhanh</h4>
                            <div className="grid grid-cols-2 gap-2">
                                {Object.entries(LAYOUT_INFO).map(([key, info]) => (
                                    <button
                                        key={key}
                                        onClick={() => handleLayoutChange(key as LayoutType)}
                                        disabled={key === currentLayout || isTransitioning}
                                        className={`p-3 text-xs font-medium border rounded-md transition-all duration-200 text-left ${key === currentLayout
                                                ? 'border-primary-300 bg-primary-50 text-primary-700 cursor-default'
                                                : isTransitioning
                                                    ? 'border-neutral-200 bg-neutral-50 text-neutral-400 cursor-not-allowed'
                                                    : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 cursor-pointer'
                                            }`}
                                    >
                                        <div className="flex items-center space-x-2 mb-1">
                                            <div className={key === currentLayout ? 'text-primary-600' : 'text-neutral-500'}>
                                                {info.icon}
                                            </div>
                                            <span className="font-medium">{info.name}</span>
                                        </div>
                                        <div className="text-neutral-600 text-xs">
                                            {info.bestFor}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}