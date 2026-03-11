'use client';

/**
 * Visualization controls component
 * Provides zoom, pan, fit-view, and layout switching controls
 */

import React from 'react';
import type { LayoutType } from '@viztechstack/roadmap-visualization';

interface VisualizationControlsProps {
    onZoomIn: () => void;
    onZoomOut: () => void;
    onFitView: () => void;
    onPanReset: () => void;
    onLayoutChange: (layout: LayoutType) => void;
    currentLayout: LayoutType;
    zoomLevel?: number;
    className?: string;
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
}: VisualizationControlsProps) {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
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
    );
}
