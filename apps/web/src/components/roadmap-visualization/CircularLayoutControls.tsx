'use client';

/**
 * Circular Layout Controls Component
 * Provides radius adjustment controls, rotation controls, and sector highlighting functionality
 * 
 * Validates: Requirement 3.3
 */

import React, { useState, useCallback } from 'react';
import type { CircularLayoutOptions } from '@viztechstack/roadmap-visualization';

interface CircularLayoutControlsProps {
    options: CircularLayoutOptions;
    onOptionsChange: (options: Partial<CircularLayoutOptions>) => void;
    rotationSpeed: number;
    onRotationSpeedChange: (speed: number) => void;
    sectorHighlight: {
        enabled: boolean;
        startAngle: number;
        endAngle: number;
        color: string;
    };
    onSectorHighlightChange: (highlight: Partial<{
        enabled: boolean;
        startAngle: number;
        endAngle: number;
        color: string;
    }>) => void;
    onRotateTo: (angle: number) => void;
    className?: string;
}

export function CircularLayoutControls({
    options,
    onOptionsChange,
    rotationSpeed,
    onRotationSpeedChange,
    sectorHighlight,
    onSectorHighlightChange,
    onRotateTo,
    className = '',
}: CircularLayoutControlsProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeTab, setActiveTab] = useState<'radius' | 'rotation' | 'sectors'>('radius');

    // Handle radius changes
    const handleRadiusChange = useCallback((key: 'innerRadius' | 'outerRadius', value: number) => {
        const newOptions: Partial<CircularLayoutOptions> = { [key]: value };

        // Validate radius constraints
        if (key === 'innerRadius' && value >= options.outerRadius) {
            newOptions.outerRadius = value + 50;
        } else if (key === 'outerRadius' && value <= options.innerRadius) {
            newOptions.innerRadius = Math.max(0, value - 50);
        }

        onOptionsChange(newOptions);
    }, [options.innerRadius, options.outerRadius, onOptionsChange]);

    // Handle spacing changes
    const handleSpacingChange = useCallback((key: keyof CircularLayoutOptions, value: number) => {
        onOptionsChange({ [key]: value });
    }, [onOptionsChange]);

    // Handle rotation
    const handleRotation = useCallback((degrees: number) => {
        const radians = (degrees * Math.PI) / 180;
        onRotateTo(radians);
    }, [onRotateTo]);

    // Handle sector angle changes
    const handleSectorAngleChange = useCallback((key: 'startAngle' | 'endAngle', degrees: number) => {
        const radians = (degrees * Math.PI) / 180;
        onSectorHighlightChange({ [key]: radians });
    }, [onSectorHighlightChange]);

    // Reset to defaults
    const handleReset = useCallback(() => {
        onOptionsChange({
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
        });
        onRotationSpeedChange(1);
        onSectorHighlightChange({
            enabled: false,
            startAngle: 0,
            endAngle: Math.PI / 2,
            color: '#3b82f6'
        });
    }, [onOptionsChange, onRotationSpeedChange, onSectorHighlightChange]);

    // Convert radians to degrees for display
    const toDegrees = (radians: number) => Math.round((radians * 180) / Math.PI);

    return (
        <div className={`bg-white border border-neutral-200 rounded-lg shadow-sm ${className}`}>
            {/* Header with toggle */}
            <div className="flex items-center justify-between p-3 border-b border-neutral-100">
                <h3 className="text-sm font-medium text-neutral-900">Điều khiển bố cục vòng tròn</h3>
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
                            { key: 'radius' as const, label: 'Bán kính', icon: '⭕' },
                            { key: 'rotation' as const, label: 'Xoay', icon: '🔄' },
                            { key: 'sectors' as const, label: 'Khu vực', icon: '🎯' },
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

                    {/* Radius controls */}
                    {activeTab === 'radius' && (
                        <div className="space-y-4">
                            {/* Inner radius */}
                            <div>
                                <label className="block text-xs font-medium text-neutral-700 mb-2">
                                    Bán kính trong: {options.innerRadius}px
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="200"
                                    step="10"
                                    value={options.innerRadius}
                                    onChange={(e) => handleRadiusChange('innerRadius', parseInt(e.target.value))}
                                    className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider"
                                />
                                <div className="flex justify-between text-xs text-neutral-500 mt-1">
                                    <span>Nhỏ</span>
                                    <span>Lớn</span>
                                </div>
                            </div>

                            {/* Outer radius */}
                            <div>
                                <label className="block text-xs font-medium text-neutral-700 mb-2">
                                    Bán kính ngoài: {options.outerRadius}px
                                </label>
                                <input
                                    type="range"
                                    min="100"
                                    max="500"
                                    step="10"
                                    value={options.outerRadius}
                                    onChange={(e) => handleRadiusChange('outerRadius', parseInt(e.target.value))}
                                    className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider"
                                />
                                <div className="flex justify-between text-xs text-neutral-500 mt-1">
                                    <span>Nhỏ</span>
                                    <span>Lớn</span>
                                </div>
                            </div>

                            {/* Level spacing */}
                            <div>
                                <label className="block text-xs font-medium text-neutral-700 mb-2">
                                    Khoảng cách cấp độ: {options.levelSpacing}px
                                </label>
                                <input
                                    type="range"
                                    min="40"
                                    max="120"
                                    step="10"
                                    value={options.levelSpacing}
                                    onChange={(e) => handleSpacingChange('levelSpacing', parseInt(e.target.value))}
                                    className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider"
                                />
                                <div className="flex justify-between text-xs text-neutral-500 mt-1">
                                    <span>Gần</span>
                                    <span>Xa</span>
                                </div>
                            </div>

                            {/* Angular spacing */}
                            <div>
                                <label className="block text-xs font-medium text-neutral-700 mb-2">
                                    Khoảng cách góc: {options.angularSpacing.toFixed(2)}
                                </label>
                                <input
                                    type="range"
                                    min="0.05"
                                    max="0.5"
                                    step="0.05"
                                    value={options.angularSpacing}
                                    onChange={(e) => handleSpacingChange('angularSpacing', parseFloat(e.target.value))}
                                    className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider"
                                />
                                <div className="flex justify-between text-xs text-neutral-500 mt-1">
                                    <span>Gần</span>
                                    <span>Xa</span>
                                </div>
                            </div>

                            {/* Node spacing */}
                            <div>
                                <label className="block text-xs font-medium text-neutral-700 mb-2">
                                    Khoảng cách nút tối thiểu: {options.minNodeSpacing}px
                                </label>
                                <input
                                    type="range"
                                    min="20"
                                    max="80"
                                    step="5"
                                    value={options.minNodeSpacing}
                                    onChange={(e) => handleSpacingChange('minNodeSpacing', parseInt(e.target.value))}
                                    className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider"
                                />
                                <div className="flex justify-between text-xs text-neutral-500 mt-1">
                                    <span>Gần</span>
                                    <span>Xa</span>
                                </div>
                            </div>

                            {/* Layout options */}
                            <div className="space-y-2">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={options.sortByLevel}
                                        onChange={(e) => onOptionsChange({ sortByLevel: e.target.checked })}
                                        className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                                    />
                                    <span className="text-xs text-neutral-700">Sắp xếp theo cấp độ</span>
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
                        </div>
                    )}

                    {/* Rotation controls */}
                    {activeTab === 'rotation' && (
                        <div className="space-y-4">
                            {/* Current rotation */}
                            <div>
                                <label className="block text-xs font-medium text-neutral-700 mb-2">
                                    Góc bắt đầu: {toDegrees(options.startAngle)}°
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="360"
                                    step="15"
                                    value={toDegrees(options.startAngle)}
                                    onChange={(e) => handleRotation(parseInt(e.target.value))}
                                    className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider"
                                />
                                <div className="flex justify-between text-xs text-neutral-500 mt-1">
                                    <span>0°</span>
                                    <span>180°</span>
                                    <span>360°</span>
                                </div>
                            </div>

                            {/* Rotation speed */}
                            <div>
                                <label className="block text-xs font-medium text-neutral-700 mb-2">
                                    Tốc độ xoay: {rotationSpeed.toFixed(1)}x
                                </label>
                                <input
                                    type="range"
                                    min="0.1"
                                    max="3.0"
                                    step="0.1"
                                    value={rotationSpeed}
                                    onChange={(e) => onRotationSpeedChange(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider"
                                />
                                <div className="flex justify-between text-xs text-neutral-500 mt-1">
                                    <span>Chậm</span>
                                    <span>Nhanh</span>
                                </div>
                            </div>

                            {/* Quick rotation buttons */}
                            <div>
                                <h4 className="text-xs font-medium text-neutral-700 mb-2">Xoay nhanh</h4>
                                <div className="grid grid-cols-4 gap-2">
                                    {[0, 90, 180, 270].map((degrees) => (
                                        <button
                                            key={degrees}
                                            onClick={() => handleRotation(degrees)}
                                            className={`p-2 text-xs font-medium border rounded-md transition-all duration-200 ${Math.abs(toDegrees(options.startAngle) - degrees) < 15
                                                    ? 'border-primary-300 bg-primary-50 text-primary-700'
                                                    : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                                                }`}
                                        >
                                            {degrees}°
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Arc range */}
                            <div>
                                <label className="block text-xs font-medium text-neutral-700 mb-2">
                                    Phạm vi cung: {toDegrees(options.endAngle - options.startAngle)}°
                                </label>
                                <input
                                    type="range"
                                    min="90"
                                    max="360"
                                    step="15"
                                    value={toDegrees(options.endAngle - options.startAngle)}
                                    onChange={(e) => {
                                        const arcDegrees = parseInt(e.target.value);
                                        const arcRadians = (arcDegrees * Math.PI) / 180;
                                        onOptionsChange({ endAngle: options.startAngle + arcRadians });
                                    }}
                                    className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider"
                                />
                                <div className="flex justify-between text-xs text-neutral-500 mt-1">
                                    <span>Một phần</span>
                                    <span>Toàn bộ</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Sector controls */}
                    {activeTab === 'sectors' && (
                        <div className="space-y-4">
                            {/* Sector highlighting toggle */}
                            <div className="p-3 bg-neutral-50 rounded-md">
                                <label className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        checked={sectorHighlight.enabled}
                                        onChange={(e) => onSectorHighlightChange({ enabled: e.target.checked })}
                                        className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                                    />
                                    <div>
                                        <span className="text-sm font-medium text-neutral-900">
                                            Làm nổi bật khu vực
                                        </span>
                                        <p className="text-xs text-neutral-600 mt-1">
                                            Tô sáng một phần của vòng tròn để nhấn mạnh
                                        </p>
                                    </div>
                                </label>
                            </div>

                            {/* Sector controls - only show when enabled */}
                            {sectorHighlight.enabled && (
                                <>
                                    {/* Sector start angle */}
                                    <div>
                                        <label className="block text-xs font-medium text-neutral-700 mb-2">
                                            Góc bắt đầu khu vực: {toDegrees(sectorHighlight.startAngle)}°
                                        </label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="360"
                                            step="15"
                                            value={toDegrees(sectorHighlight.startAngle)}
                                            onChange={(e) => handleSectorAngleChange('startAngle', parseInt(e.target.value))}
                                            className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider"
                                        />
                                    </div>

                                    {/* Sector end angle */}
                                    <div>
                                        <label className="block text-xs font-medium text-neutral-700 mb-2">
                                            Góc kết thúc khu vực: {toDegrees(sectorHighlight.endAngle)}°
                                        </label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="360"
                                            step="15"
                                            value={toDegrees(sectorHighlight.endAngle)}
                                            onChange={(e) => handleSectorAngleChange('endAngle', parseInt(e.target.value))}
                                            className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider"
                                        />
                                    </div>

                                    {/* Sector color */}
                                    <div>
                                        <label className="block text-xs font-medium text-neutral-700 mb-2">
                                            Màu khu vực
                                        </label>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="color"
                                                value={sectorHighlight.color}
                                                onChange={(e) => onSectorHighlightChange({ color: e.target.value })}
                                                className="w-8 h-8 rounded border border-neutral-300 cursor-pointer"
                                            />
                                            <span className="text-xs text-neutral-600">{sectorHighlight.color}</span>
                                        </div>
                                    </div>

                                    {/* Preset sectors */}
                                    <div>
                                        <h4 className="text-xs font-medium text-neutral-700 mb-2">Khu vực mẫu</h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => onSectorHighlightChange({
                                                    startAngle: 0,
                                                    endAngle: Math.PI / 2
                                                })}
                                                className="px-3 py-2 text-xs font-medium text-neutral-700 bg-neutral-50 border border-neutral-200 rounded-md hover:bg-neutral-100 transition-colors text-left"
                                            >
                                                <div>
                                                    <div className="font-medium">Phần tư 1</div>
                                                    <div className="text-neutral-500">0° - 90°</div>
                                                </div>
                                            </button>
                                            <button
                                                onClick={() => onSectorHighlightChange({
                                                    startAngle: Math.PI / 2,
                                                    endAngle: Math.PI
                                                })}
                                                className="px-3 py-2 text-xs font-medium text-neutral-700 bg-neutral-50 border border-neutral-200 rounded-md hover:bg-neutral-100 transition-colors text-left"
                                            >
                                                <div>
                                                    <div className="font-medium">Phần tư 2</div>
                                                    <div className="text-neutral-500">90° - 180°</div>
                                                </div>
                                            </button>
                                            <button
                                                onClick={() => onSectorHighlightChange({
                                                    startAngle: 0,
                                                    endAngle: Math.PI
                                                })}
                                                className="px-3 py-2 text-xs font-medium text-neutral-700 bg-neutral-50 border border-neutral-200 rounded-md hover:bg-neutral-100 transition-colors text-left"
                                            >
                                                <div>
                                                    <div className="font-medium">Nửa trên</div>
                                                    <div className="text-neutral-500">0° - 180°</div>
                                                </div>
                                            </button>
                                            <button
                                                onClick={() => onSectorHighlightChange({
                                                    startAngle: Math.PI,
                                                    endAngle: 2 * Math.PI
                                                })}
                                                className="px-3 py-2 text-xs font-medium text-neutral-700 bg-neutral-50 border border-neutral-200 rounded-md hover:bg-neutral-100 transition-colors text-left"
                                            >
                                                <div>
                                                    <div className="font-medium">Nửa dưới</div>
                                                    <div className="text-neutral-500">180° - 360°</div>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
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