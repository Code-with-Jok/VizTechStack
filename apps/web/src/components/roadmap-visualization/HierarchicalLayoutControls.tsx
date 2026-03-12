'use client';

/**
 * Hierarchical Layout Controls Component
 * Provides direction controls, spacing adjustments, and hierarchy collapse/expand functionality
 * 
 * Validates: Requirement 3.1
 */

import React, { useState, useCallback } from 'react';
import type { HierarchicalLayoutOptions } from '@viztechstack/roadmap-visualization';

interface HierarchicalLayoutControlsProps {
    options: HierarchicalLayoutOptions;
    onOptionsChange: (options: Partial<HierarchicalLayoutOptions>) => void;
    onCollapseLevel: (level: number) => void;
    onExpandLevel: (level: number) => void;
    onCollapseAll: () => void;
    onExpandAll: () => void;
    collapsedLevels: Set<number>;
    totalLevels: number;
    className?: string;
}

interface DirectionOption {
    value: HierarchicalLayoutOptions['direction'];
    label: string;
    icon: React.ReactNode;
    description: string;
}

export function HierarchicalLayoutControls({
    options,
    onOptionsChange,
    onCollapseLevel,
    onExpandLevel,
    onCollapseAll,
    onExpandAll,
    collapsedLevels,
    totalLevels,
    className = '',
}: HierarchicalLayoutControlsProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeTab, setActiveTab] = useState<'direction' | 'spacing' | 'hierarchy'>('direction');

    // Direction options with icons and descriptions
    const directionOptions: DirectionOption[] = [
        {
            value: 'TB',
            label: 'Trên xuống',
            description: 'Bố cục từ trên xuống dưới',
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
            ),
        },
        {
            value: 'BT',
            label: 'Dưới lên',
            description: 'Bố cục từ dưới lên trên',
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
            ),
        },
        {
            value: 'LR',
            label: 'Trái sang phải',
            description: 'Bố cục từ trái sang phải',
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
            ),
        },
        {
            value: 'RL',
            label: 'Phải sang trái',
            description: 'Bố cục từ phải sang trái',
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
            ),
        },
    ];

    // Handle direction change
    const handleDirectionChange = useCallback((direction: HierarchicalLayoutOptions['direction']) => {
        onOptionsChange({ direction });
    }, [onOptionsChange]);

    // Handle spacing changes
    const handleSpacingChange = useCallback((key: keyof HierarchicalLayoutOptions, value: number) => {
        onOptionsChange({ [key]: value });
    }, [onOptionsChange]);

    // Handle level collapse/expand
    const handleLevelToggle = useCallback((level: number) => {
        if (collapsedLevels.has(level)) {
            onExpandLevel(level);
        } else {
            onCollapseLevel(level);
        }
    }, [collapsedLevels, onCollapseLevel, onExpandLevel]);

    // Reset to defaults
    const handleReset = useCallback(() => {
        onOptionsChange({
            direction: 'TB',
            nodeWidth: 200,
            nodeHeight: 80,
            nodeSep: 50,
            edgeSep: 10,
            rankSep: 100,
            marginX: 20,
            marginY: 20,
        });
    }, [onOptionsChange]);

    return (
        <div className={`bg-white border border-neutral-200 rounded-lg shadow-sm ${className}`}>
            {/* Header with toggle */}
            <div className="flex items-center justify-between p-3 border-b border-neutral-100">
                <h3 className="text-sm font-medium text-neutral-900">Điều khiển bố cục phân cấp</h3>
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

            {/* Expandable content */}
            {isExpanded && (
                <div className="p-3">
                    {/* Tab navigation */}
                    <div className="flex space-x-1 mb-4 bg-neutral-50 p-1 rounded-md">
                        {[
                            { key: 'direction' as const, label: 'Hướng' },
                            { key: 'spacing' as const, label: 'Khoảng cách' },
                            { key: 'hierarchy' as const, label: 'Cấp độ' },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${activeTab === tab.key
                                        ? 'bg-white text-primary-600 shadow-sm'
                                        : 'text-neutral-600 hover:text-neutral-900'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Direction controls */}
                    {activeTab === 'direction' && (
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                                {directionOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => handleDirectionChange(option.value)}
                                        className={`p-3 border rounded-md transition-all duration-200 ${options.direction === option.value
                                                ? 'border-primary-300 bg-primary-50 text-primary-700'
                                                : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                                            }`}
                                        title={option.description}
                                    >
                                        <div className="flex flex-col items-center space-y-1">
                                            <div className={`${options.direction === option.value ? 'text-primary-600' : 'text-neutral-500'
                                                }`}>
                                                {option.icon}
                                            </div>
                                            <span className="text-xs font-medium">{option.label}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Spacing controls */}
                    {activeTab === 'spacing' && (
                        <div className="space-y-4">
                            {/* Node spacing */}
                            <div>
                                <label className="block text-xs font-medium text-neutral-700 mb-2">
                                    Khoảng cách nút: {options.nodeSep}px
                                </label>
                                <input
                                    type="range"
                                    min="20"
                                    max="100"
                                    step="10"
                                    value={options.nodeSep}
                                    onChange={(e) => handleSpacingChange('nodeSep', parseInt(e.target.value))}
                                    className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider"
                                />
                                <div className="flex justify-between text-xs text-neutral-500 mt-1">
                                    <span>Gần</span>
                                    <span>Xa</span>
                                </div>
                            </div>

                            {/* Rank spacing */}
                            <div>
                                <label className="block text-xs font-medium text-neutral-700 mb-2">
                                    Khoảng cách cấp độ: {options.rankSep}px
                                </label>
                                <input
                                    type="range"
                                    min="60"
                                    max="200"
                                    step="20"
                                    value={options.rankSep}
                                    onChange={(e) => handleSpacingChange('rankSep', parseInt(e.target.value))}
                                    className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider"
                                />
                                <div className="flex justify-between text-xs text-neutral-500 mt-1">
                                    <span>Gần</span>
                                    <span>Xa</span>
                                </div>
                            </div>

                            {/* Node dimensions */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-neutral-700 mb-2">
                                        Chiều rộng: {options.nodeWidth}px
                                    </label>
                                    <input
                                        type="range"
                                        min="120"
                                        max="300"
                                        step="20"
                                        value={options.nodeWidth}
                                        onChange={(e) => handleSpacingChange('nodeWidth', parseInt(e.target.value))}
                                        className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-neutral-700 mb-2">
                                        Chiều cao: {options.nodeHeight}px
                                    </label>
                                    <input
                                        type="range"
                                        min="60"
                                        max="120"
                                        step="10"
                                        value={options.nodeHeight}
                                        onChange={(e) => handleSpacingChange('nodeHeight', parseInt(e.target.value))}
                                        className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Hierarchy controls */}
                    {activeTab === 'hierarchy' && (
                        <div className="space-y-4">
                            {/* Global controls */}
                            <div className="flex space-x-2">
                                <button
                                    onClick={onExpandAll}
                                    className="flex-1 px-3 py-2 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors"
                                >
                                    <div className="flex items-center justify-center space-x-1">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        <span>Mở rộng tất cả</span>
                                    </div>
                                </button>
                                <button
                                    onClick={onCollapseAll}
                                    className="flex-1 px-3 py-2 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
                                >
                                    <div className="flex items-center justify-center space-x-1">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                        </svg>
                                        <span>Thu gọn tất cả</span>
                                    </div>
                                </button>
                            </div>

                            {/* Level controls */}
                            <div>
                                <h4 className="text-xs font-medium text-neutral-700 mb-2">Điều khiển theo cấp độ</h4>
                                <div className="space-y-2 max-h-32 overflow-y-auto">
                                    {Array.from({ length: totalLevels }, (_, i) => i).map((level) => {
                                        const isCollapsed = collapsedLevels.has(level);
                                        return (
                                            <div
                                                key={level}
                                                className="flex items-center justify-between p-2 bg-neutral-50 rounded-md"
                                            >
                                                <span className="text-xs font-medium text-neutral-700">
                                                    Cấp độ {level + 1}
                                                </span>
                                                <button
                                                    onClick={() => handleLevelToggle(level)}
                                                    className={`p-1 rounded transition-colors ${isCollapsed
                                                            ? 'text-red-600 hover:bg-red-100'
                                                            : 'text-green-600 hover:bg-green-100'
                                                        }`}
                                                    title={isCollapsed ? 'Mở rộng cấp độ' : 'Thu gọn cấp độ'}
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        {isCollapsed ? (
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                        ) : (
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                                        )}
                                                    </svg>
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Reset button */}
                    <div className="mt-4 pt-3 border-t border-neutral-100">
                        <button
                            onClick={handleReset}
                            className="w-full px-3 py-2 text-xs font-medium text-neutral-600 bg-neutral-50 border border-neutral-200 rounded-md hover:bg-neutral-100 transition-colors"
                        >
                            Đặt lại mặc định
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}