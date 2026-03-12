'use client';

/**
 * Grid Layout Controls Component
 * Provides grid size adjustment controls, alignment options, and snap functionality
 * 
 * Validates: Requirement 3.4
 */

import React, { useState, useCallback } from 'react';
import type { GridLayoutOptions } from '@viztechstack/roadmap-visualization';

interface GridLayoutControlsProps {
    options: GridLayoutOptions;
    onOptionsChange: (options: Partial<GridLayoutOptions>) => void;
    snapToGrid: boolean;
    onSnapToGridChange: (snap: boolean) => void;
    showGridLines: boolean;
    onShowGridLinesChange: (show: boolean) => void;
    alignment: {
        horizontal: 'left' | 'center' | 'right';
        vertical: 'top' | 'center' | 'bottom';
    };
    onAlignmentChange: (alignment: Partial<{
        horizontal: 'left' | 'center' | 'right';
        vertical: 'top' | 'center' | 'bottom';
    }>) => void;
    onOptimizeForContent: () => void;
    className?: string;
}

export function GridLayoutControls({
    options,
    onOptionsChange,
    snapToGrid,
    onSnapToGridChange,
    showGridLines,
    onShowGridLinesChange,
    alignment,
    onAlignmentChange,
    onOptimizeForContent,
    className = '',
}: GridLayoutControlsProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeTab, setActiveTab] = useState<'size' | 'spacing' | 'alignment'>('size');

    // Handle grid size changes
    const handleGridSizeChange = useCallback((key: 'columns' | 'rows', value: number) => {
        const newOptions: Partial<GridLayoutOptions> = { [key]: value };

        // If setting manual dimensions, disable auto-size
        if (value > 0) {
            newOptions.autoSize = false;
        }

        onOptionsChange(newOptions);
    }, [onOptionsChange]);

    // Handle cell size changes
    const handleCellSizeChange = useCallback((key: 'cellWidth' | 'cellHeight', value: number) => {
        onOptionsChange({ [key]: Math.max(key === 'cellWidth' ? 80 : 60, value) });
    }, [onOptionsChange]);
    // Handle spacing changes
    const handleSpacingChange = useCallback((key: 'paddingX' | 'paddingY' | 'marginX' | 'marginY', value: number) => {
        onOptionsChange({ [key]: Math.max(0, value) });
    }, [onOptionsChange]);

    // Handle sorting and grouping changes
    const handleSortingChange = useCallback((key: keyof GridLayoutOptions, value: any) => {
        onOptionsChange({ [key]: value });
    }, [onOptionsChange]);

    // Reset to defaults
    const handleReset = useCallback(() => {
        onOptionsChange({
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
        });
        onSnapToGridChange(true);
        onShowGridLinesChange(false);
        onAlignmentChange({
            horizontal: 'center',
            vertical: 'center'
        });
    }, [onOptionsChange, onSnapToGridChange, onShowGridLinesChange, onAlignmentChange]);

    return (
        <div className={`bg-white border border-neutral-200 rounded-lg shadow-sm ${className}`}>
            {/* Header with toggle */}
            <div className="flex items-center justify-between p-3 border-b border-neutral-100">
                <h3 className="text-sm font-medium text-neutral-900">Điều khiển bố cục lưới</h3>
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
                            { key: 'size' as const, label: 'Kích thước', icon: '📐' },
                            { key: 'spacing' as const, label: 'Khoảng cách', icon: '📏' },
                            { key: 'alignment' as const, label: 'Căn chỉnh', icon: '🎯' },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${activeTab === tab.key
                                    ? 'bg-white text-primary-600 shadow-sm'
                                    : 'text-neutral-600 hover:text-neutral-900'
                                    }`}
                            >
                                <span className="mr-1">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    {/* Size controls */}
                    {activeTab === 'size' && (
                        <div className="space-y-4">
                            {/* Auto-size toggle */}
                            <div className="p-3 bg-neutral-50 rounded-md">
                                <label className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        checked={options.autoSize}
                                        onChange={(e) => onOptionsChange({ autoSize: e.target.checked })}
                                        className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                                    />
                                    <div>
                                        <span className="text-sm font-medium text-neutral-900">
                                            Tự động điều chỉnh kích thước
                                        </span>
                                        <p className="text-xs text-neutral-600 mt-1">
                                            Tự động tính toán số cột và hàng tối ưu
                                        </p>
                                    </div>
                                </label>
                            </div>

                            {/* Manual grid dimensions - only show when auto-size is disabled */}
                            {!options.autoSize && (
                                <>
                                    {/* Columns */}
                                    <div>
                                        <label className="block text-xs font-medium text-neutral-700 mb-2">
                                            Số cột: {options.columns || 'Tự động'}
                                        </label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="20"
                                            step="1"
                                            value={options.columns}
                                            onChange={(e) => handleGridSizeChange('columns', parseInt(e.target.value))}
                                            className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider"
                                        />
                                        <div className="flex justify-between text-xs text-neutral-500 mt-1">
                                            <span>Tự động</span>
                                            <span>20 cột</span>
                                        </div>
                                    </div>

                                    {/* Rows */}
                                    <div>
                                        <label className="block text-xs font-medium text-neutral-700 mb-2">
                                            Số hàng: {options.rows || 'Tự động'}
                                        </label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="20"
                                            step="1"
                                            value={options.rows}
                                            onChange={(e) => handleGridSizeChange('rows', parseInt(e.target.value))}
                                            className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider"
                                        />
                                        <div className="flex justify-between text-xs text-neutral-500 mt-1">
                                            <span>Tự động</span>
                                            <span>20 hàng</span>
                                        </div>
                                    </div>
                                </>
                            )}
                            {/* Cell width */}
                            <div>
                                <label className="block text-xs font-medium text-neutral-700 mb-2">
                                    Chiều rộng ô: {options.cellWidth}px
                                </label>
                                <input
                                    type="range"
                                    min="80"
                                    max="400"
                                    step="10"
                                    value={options.cellWidth}
                                    onChange={(e) => handleCellSizeChange('cellWidth', parseInt(e.target.value))}
                                    className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider"
                                />
                                <div className="flex justify-between text-xs text-neutral-500 mt-1">
                                    <span>Nhỏ</span>
                                    <span>Lớn</span>
                                </div>
                            </div>

                            {/* Cell height */}
                            <div>
                                <label className="block text-xs font-medium text-neutral-700 mb-2">
                                    Chiều cao ô: {options.cellHeight}px
                                </label>
                                <input
                                    type="range"
                                    min="60"
                                    max="300"
                                    step="10"
                                    value={options.cellHeight}
                                    onChange={(e) => handleCellSizeChange('cellHeight', parseInt(e.target.value))}
                                    className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider"
                                />
                                <div className="flex justify-between text-xs text-neutral-500 mt-1">
                                    <span>Nhỏ</span>
                                    <span>Lớn</span>
                                </div>
                            </div>

                            {/* Aspect ratio */}
                            <div>
                                <label className="block text-xs font-medium text-neutral-700 mb-2">
                                    Tỷ lệ khung hình: {options.aspectRatio.toFixed(1)}
                                </label>
                                <input
                                    type="range"
                                    min="0.5"
                                    max="3.0"
                                    step="0.1"
                                    value={options.aspectRatio}
                                    onChange={(e) => onOptionsChange({ aspectRatio: parseFloat(e.target.value) })}
                                    className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider"
                                />
                                <div className="flex justify-between text-xs text-neutral-500 mt-1">
                                    <span>Cao</span>
                                    <span>Rộng</span>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Spacing controls */}
                    {activeTab === 'spacing' && (
                        <div className="space-y-4">
                            {/* Padding X */}
                            <div>
                                <label className="block text-xs font-medium text-neutral-700 mb-2">
                                    Khoảng cách ngang: {options.paddingX}px
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    step="5"
                                    value={options.paddingX}
                                    onChange={(e) => handleSpacingChange('paddingX', parseInt(e.target.value))}
                                    className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider"
                                />
                                <div className="flex justify-between text-xs text-neutral-500 mt-1">
                                    <span>Gần</span>
                                    <span>Xa</span>
                                </div>
                            </div>

                            {/* Padding Y */}
                            <div>
                                <label className="block text-xs font-medium text-neutral-700 mb-2">
                                    Khoảng cách dọc: {options.paddingY}px
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    step="5"
                                    value={options.paddingY}
                                    onChange={(e) => handleSpacingChange('paddingY', parseInt(e.target.value))}
                                    className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider"
                                />
                                <div className="flex justify-between text-xs text-neutral-500 mt-1">
                                    <span>Gần</span>
                                    <span>Xa</span>
                                </div>
                            </div>

                            {/* Margin X */}
                            <div>
                                <label className="block text-xs font-medium text-neutral-700 mb-2">
                                    Lề ngang: {options.marginX}px
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="200"
                                    step="10"
                                    value={options.marginX}
                                    onChange={(e) => handleSpacingChange('marginX', parseInt(e.target.value))}
                                    className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider"
                                />
                                <div className="flex justify-between text-xs text-neutral-500 mt-1">
                                    <span>Nhỏ</span>
                                    <span>Lớn</span>
                                </div>
                            </div>
                            {/* Margin Y */}
                            <div>
                                <label className="block text-xs font-medium text-neutral-700 mb-2">
                                    Lề dọc: {options.marginY}px
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="200"
                                    step="10"
                                    value={options.marginY}
                                    onChange={(e) => handleSpacingChange('marginY', parseInt(e.target.value))}
                                    className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider"
                                />
                                <div className="flex justify-between text-xs text-neutral-500 mt-1">
                                    <span>Nhỏ</span>
                                    <span>Lớn</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Alignment controls */}
                    {activeTab === 'alignment' && (
                        <div className="space-y-4">
                            {/* Grid snap functionality */}
                            <div className="p-3 bg-neutral-50 rounded-md">
                                <label className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        checked={snapToGrid}
                                        onChange={(e) => onSnapToGridChange(e.target.checked)}
                                        className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                                    />
                                    <div>
                                        <span className="text-sm font-medium text-neutral-900">
                                            Bám dính lưới
                                        </span>
                                        <p className="text-xs text-neutral-600 mt-1">
                                            Tự động căn chỉnh các nút vào lưới
                                        </p>
                                    </div>
                                </label>
                            </div>

                            {/* Show grid lines */}
                            <div className="p-3 bg-neutral-50 rounded-md">
                                <label className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        checked={showGridLines}
                                        onChange={(e) => onShowGridLinesChange(e.target.checked)}
                                        className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                                    />
                                    <div>
                                        <span className="text-sm font-medium text-neutral-900">
                                            Hiển thị đường lưới
                                        </span>
                                        <p className="text-xs text-neutral-600 mt-1">
                                            Hiển thị các đường hướng dẫn lưới
                                        </p>
                                    </div>
                                </label>
                            </div>
                            {/* Horizontal alignment */}
                            <div>
                                <h4 className="text-xs font-medium text-neutral-700 mb-2">Căn chỉnh ngang</h4>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { key: 'left' as const, label: 'Trái', icon: '⬅️' },
                                        { key: 'center' as const, label: 'Giữa', icon: '↔️' },
                                        { key: 'right' as const, label: 'Phải', icon: '➡️' },
                                    ].map((align) => (
                                        <button
                                            key={align.key}
                                            onClick={() => onAlignmentChange({ horizontal: align.key })}
                                            className={`p-2 text-xs font-medium border rounded-md transition-all duration-200 ${alignment.horizontal === align.key
                                                ? 'border-primary-300 bg-primary-50 text-primary-700'
                                                : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                                                }`}
                                        >
                                            <div className="text-center">
                                                <div className="text-sm mb-1">{align.icon}</div>
                                                <div>{align.label}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Vertical alignment */}
                            <div>
                                <h4 className="text-xs font-medium text-neutral-700 mb-2">Căn chỉnh dọc</h4>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { key: 'top' as const, label: 'Trên', icon: '⬆️' },
                                        { key: 'center' as const, label: 'Giữa', icon: '↕️' },
                                        { key: 'bottom' as const, label: 'Dưới', icon: '⬇️' },
                                    ].map((align) => (
                                        <button
                                            key={align.key}
                                            onClick={() => onAlignmentChange({ vertical: align.key })}
                                            className={`p-2 text-xs font-medium border rounded-md transition-all duration-200 ${alignment.vertical === align.key
                                                ? 'border-primary-300 bg-primary-50 text-primary-700'
                                                : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                                                }`}
                                        >
                                            <div className="text-center">
                                                <div className="text-sm mb-1">{align.icon}</div>
                                                <div>{align.label}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {/* Sorting options */}
                            <div>
                                <h4 className="text-xs font-medium text-neutral-700 mb-2">Sắp xếp theo</h4>
                                <select
                                    value={options.sortBy}
                                    onChange={(e) => handleSortingChange('sortBy', e.target.value)}
                                    className="w-full input text-sm py-2 px-3"
                                >
                                    <option value="none">Không sắp xếp</option>
                                    <option value="level">Cấp độ</option>
                                    <option value="section">Phần</option>
                                    <option value="label">Tên</option>
                                    <option value="difficulty">Độ khó</option>
                                </select>
                            </div>

                            {/* Sort direction */}
                            {options.sortBy !== 'none' && (
                                <div>
                                    <h4 className="text-xs font-medium text-neutral-700 mb-2">Thứ tự</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => handleSortingChange('sortDirection', 'asc')}
                                            className={`p-2 text-xs font-medium border rounded-md transition-all duration-200 ${options.sortDirection === 'asc'
                                                ? 'border-primary-300 bg-primary-50 text-primary-700'
                                                : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                                                }`}
                                        >
                                            ⬆️ Tăng dần
                                        </button>
                                        <button
                                            onClick={() => handleSortingChange('sortDirection', 'desc')}
                                            className={`p-2 text-xs font-medium border rounded-md transition-all duration-200 ${options.sortDirection === 'desc'
                                                ? 'border-primary-300 bg-primary-50 text-primary-700'
                                                : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                                                }`}
                                        >
                                            ⬇️ Giảm dần
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Grouping options */}
                            <div>
                                <h4 className="text-xs font-medium text-neutral-700 mb-2">Nhóm theo</h4>
                                <select
                                    value={options.groupBy}
                                    onChange={(e) => handleSortingChange('groupBy', e.target.value)}
                                    className="w-full input text-sm py-2 px-3"
                                >
                                    <option value="none">Không nhóm</option>
                                    <option value="level">Cấp độ</option>
                                    <option value="section">Phần</option>
                                    <option value="difficulty">Độ khó</option>
                                </select>
                            </div>
                        </div>
                    )}
                    {/* Layout options */}
                    <div className="mt-4 pt-3 border-t border-neutral-100 space-y-2">
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={options.centerGrid}
                                onChange={(e) => onOptionsChange({ centerGrid: e.target.checked })}
                                className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-xs text-neutral-700">Căn giữa lưới</span>
                        </label>
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={options.preventOverlaps}
                                onChange={(e) => onOptionsChange({ preventOverlaps: e.target.checked })}
                                className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-xs text-neutral-700">Ngăn chồng lấp</span>
                        </label>
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={options.enableOptimization}
                                onChange={(e) => onOptionsChange({ enableOptimization: e.target.checked })}
                                className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-xs text-neutral-700">Tối ưu hóa bố cục</span>
                        </label>
                    </div>

                    {/* Action buttons */}
                    <div className="mt-4 pt-3 border-t border-neutral-100 space-y-2">
                        <button
                            onClick={onOptimizeForContent}
                            className="w-full px-3 py-2 text-xs font-medium text-primary-600 bg-primary-50 border border-primary-200 rounded-md hover:bg-primary-100 transition-colors"
                        >
                            🎯 Tối ưu cho nội dung
                        </button>
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