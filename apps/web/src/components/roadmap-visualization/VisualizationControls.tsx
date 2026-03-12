'use client';

/**
 * Visualization controls component
 * Provides zoom, pan, fit-view, and layout switching controls
 */

import React from 'react';
import type { LayoutType, HierarchicalLayoutOptions, CircularLayoutOptions, GridLayoutOptions } from '@viztechstack/roadmap-visualization';
import { HierarchicalLayoutControls } from './HierarchicalLayoutControls';
import { ForceLayoutControls } from './ForceLayoutControls';
import { CircularLayoutControls } from './CircularLayoutControls';
import { GridLayoutControls } from './GridLayoutControls';
import type { ForceDirectedLayoutOptions } from '../../hooks/useForceLayout';

interface VisualizationControlsProps {
    onZoomIn: () => void;
    onZoomOut: () => void;
    onFitView: () => void;
    onPanReset: () => void;
    onLayoutChange: (layout: LayoutType) => void;
    currentLayout: LayoutType;
    zoomLevel?: number;
    className?: string;

    // Hierarchical layout specific props
    hierarchicalOptions?: HierarchicalLayoutOptions;
    onHierarchicalOptionsChange?: (options: Partial<HierarchicalLayoutOptions>) => void;
    onCollapseLevel?: (level: number) => void;
    onExpandLevel?: (level: number) => void;
    onCollapseAll?: () => void;
    onExpandAll?: () => void;
    collapsedLevels?: Set<number>;
    totalLevels?: number;

    // Force layout specific props
    forceOptions?: ForceDirectedLayoutOptions;
    onForceOptionsChange?: (options: Partial<ForceDirectedLayoutOptions>) => void;
    manualPositioning?: boolean;
    onManualPositioningChange?: (enabled: boolean) => void;
    simulationSpeed?: number;
    onSimulationSpeedChange?: (speed: number) => void;

    // Circular layout specific props
    circularOptions?: CircularLayoutOptions;
    onCircularOptionsChange?: (options: Partial<CircularLayoutOptions>) => void;
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
    gridOptions?: GridLayoutOptions;
    onGridOptionsChange?: (options: Partial<GridLayoutOptions>) => void;
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
}

export function VisualizationControls({
    onZoomIn,
    onZoomOut,
    onFitView,
    onPanReset,
    onLayoutChange,
    currentLayout,
    zoomLevel = 1,
    className = '',
    hierarchicalOptions,
    onHierarchicalOptionsChange,
    onCollapseLevel,
    onExpandLevel,
    onCollapseAll,
    onExpandAll,
    collapsedLevels = new Set(),
    totalLevels = 0,
    forceOptions,
    onForceOptionsChange,
    manualPositioning = false,
    onManualPositioningChange,
    simulationSpeed = 1,
    onSimulationSpeedChange,
    circularOptions,
    onCircularOptionsChange,
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
    gridOptions,
    onGridOptionsChange,
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
}: VisualizationControlsProps) {
    return (
        <div className={`space-y-3 ${className}`}>
            {/* Main controls */}
            <div className="flex items-center gap-3">
                {/* Zoom controls with enhanced styling */}
                <button
                    onClick={onZoomIn}
                    className="viz-button group"
                    title="Phóng to (Ctrl + +)"
                    aria-label="Zoom in"
                >
                    <svg
                        className="w-5 h-5 transition-transform duration-200 group-hover:scale-110"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                    </svg>
                </button>

                <button
                    onClick={onZoomOut}
                    className="viz-button group"
                    title="Thu nhỏ (Ctrl + -)"
                    aria-label="Zoom out"
                >
                    <svg
                        className="w-5 h-5 transition-transform duration-200 group-hover:scale-110"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 12H4"
                        />
                    </svg>
                </button>

                {/* Zoom level indicator */}
                <div className="px-3 py-1 bg-neutral-50 border border-neutral-200 rounded-md text-xs font-medium text-neutral-700 min-w-[60px] text-center">
                    {Math.round(zoomLevel * 100)}%
                </div>

                <button
                    onClick={onFitView}
                    className="viz-button group"
                    title="Vừa màn hình (Ctrl + 0)"
                    aria-label="Fit to view"
                >
                    <svg
                        className="w-5 h-5 transition-transform duration-200 group-hover:scale-110"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                        />
                    </svg>
                </button>

                <button
                    onClick={onPanReset}
                    className="viz-button group"
                    title="Đặt lại vị trí (Ctrl + R)"
                    aria-label="Reset pan position"
                >
                    <svg
                        className="w-5 h-5 transition-transform duration-200 group-hover:scale-110"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                    </svg>
                </button>

                {/* Enhanced divider */}
                <div className="w-px h-6 bg-neutral-200"></div>

                {/* Enhanced layout selector */}
                <div className="relative">
                    <select
                        value={currentLayout}
                        onChange={(e) => onLayoutChange(e.target.value as LayoutType)}
                        className="input text-sm py-2 px-3 pr-8 min-w-[120px] appearance-none cursor-pointer bg-white border-neutral-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all duration-200"
                        aria-label="Select layout type"
                    >
                        <option value="hierarchical">Phân cấp</option>
                        <option value="force">Lực hút</option>
                        <option value="circular">Vòng tròn</option>
                        <option value="grid">Lưới</option>
                    </select>
                    {/* Custom dropdown arrow */}
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
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
                    </div>
                </div>
            </div>

            {/* Hierarchical layout controls - only show when hierarchical layout is selected */}
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

            {/* Force layout controls - only show when force layout is selected */}
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

            {/* Circular layout controls - only show when circular layout is selected */}
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

            {/* Grid layout controls - only show when grid layout is selected */}
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
        </div>
    );
}
