'use client';

/**
 * Force Layout Controls Component
 * Provides force strength adjustments, simulation speed controls, and manual positioning
 * 
 * Validates: Requirement 3.2
 */

import React, { useState, useCallback } from 'react';
import type { ForceDirectedLayoutOptions } from '../../hooks/useForceLayout';

interface ForceLayoutControlsProps {
    options: ForceDirectedLayoutOptions;
    onOptionsChange: (options: Partial<ForceDirectedLayoutOptions>) => void;
    manualPositioning: boolean;
    onManualPositioningChange: (enabled: boolean) => void;
    simulationSpeed: number;
    onSimulationSpeedChange: (speed: number) => void;
    className?: string;
}

export function ForceLayoutControls({
    options,
    onOptionsChange,
    manualPositioning,
    onManualPositioningChange,
    simulationSpeed,
    onSimulationSpeedChange,
    className = '',
}: ForceLayoutControlsProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeTab, setActiveTab] = useState<'forces' | 'simulation' | 'positioning'>('forces');

    // Handle force strength changes
    const handleForceChange = useCallback((key: keyof ForceDirectedLayoutOptions, value: number) => {
        onOptionsChange({ [key]: value });
    }, [onOptionsChange]);

    // Handle relationship strength changes
    const handleRelationshipStrengthChange = useCallback((
        type: keyof ForceDirectedLayoutOptions['strengthByType'],
        value: number
    ) => {
        onOptionsChange({
            strengthByType: {
                ...options.strengthByType,
                [type]: value
            }
        });
    }, [options.strengthByType, onOptionsChange]);

    // Reset to defaults
    const handleReset = useCallback(() => {
        onOptionsChange({
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
        });
        onManualPositioningChange(false);
        onSimulationSpeedChange(1);
    }, [onOptionsChange, onManualPositioningChange, onSimulationSpeedChange]);
    return (
        <div className={`bg-white border border-neutral-200 rounded-lg shadow-sm ${className}`}>
            {/* Header with toggle */}
            <div className="flex items-center justify-between p-3 border-b border-neutral-100">
                <h3 className="text-sm font-medium text-neutral-900">Điều khiển bố cục lực hút</h3>
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
                            { key: 'forces' as const, label: 'Lực' },
                            { key: 'simulation' as const, label: 'Mô phỏng' },
                            { key: 'positioning' as const, label: 'Vị trí' },
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
                    {/* Forces controls */}
                    {activeTab === 'forces' && (
                        <div className="space-y-4">
                            {/* Charge force (repulsion) */}
                            <div>
                                <label className="block text-xs font-medium text-neutral-700 mb-2">
                                    Lực đẩy: {Math.abs(options.chargeStrength)}
                                </label>
                                <input
                                    type="range"
                                    min="100"
                                    max="800"
                                    step="50"
                                    value={Math.abs(options.chargeStrength)}
                                    onChange={(e) => handleForceChange('chargeStrength', -parseInt(e.target.value))}
                                    className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider"
                                />
                                <div className="flex justify-between text-xs text-neutral-500 mt-1">
                                    <span>Yếu</span>
                                    <span>Mạnh</span>
                                </div>
                            </div>

                            {/* Link force (attraction) */}
                            <div>
                                <label className="block text-xs font-medium text-neutral-700 mb-2">
                                    Lực hút liên kết: {options.linkStrength.toFixed(2)}
                                </label>
                                <input
                                    type="range"
                                    min="0.1"
                                    max="1.0"
                                    step="0.1"
                                    value={options.linkStrength}
                                    onChange={(e) => handleForceChange('linkStrength', parseFloat(e.target.value))}
                                    className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider"
                                />
                                <div className="flex justify-between text-xs text-neutral-500 mt-1">
                                    <span>Yếu</span>
                                    <span>Mạnh</span>
                                </div>
                            </div>

                            {/* Link distance */}
                            <div>
                                <label className="block text-xs font-medium text-neutral-700 mb-2">
                                    Khoảng cách liên kết: {options.linkDistance}px
                                </label>
                                <input
                                    type="range"
                                    min="50"
                                    max="200"
                                    step="10"
                                    value={options.linkDistance}
                                    onChange={(e) => handleForceChange('linkDistance', parseInt(e.target.value))}
                                    className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider"
                                />
                                <div className="flex justify-between text-xs text-neutral-500 mt-1">
                                    <span>Gần</span>
                                    <span>Xa</span>
                                </div>
                            </div>

                            {/* Collision radius */}
                            <div>
                                <label className="block text-xs font-medium text-neutral-700 mb-2">
                                    Bán kính va chạm: {options.collisionRadius}px
                                </label>
                                <input
                                    type="range"
                                    min="20"
                                    max="80"
                                    step="5"
                                    value={options.collisionRadius}
                                    onChange={(e) => handleForceChange('collisionRadius', parseInt(e.target.value))}
                                    className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider"
                                />
                                <div className="flex justify-between text-xs text-neutral-500 mt-1">
                                    <span>Nhỏ</span>
                                    <span>Lớn</span>
                                </div>
                            </div>

                            {/* Center force */}
                            <div>
                                <label className="block text-xs font-medium text-neutral-700 mb-2">
                                    Lực trung tâm: {options.centerStrength.toFixed(2)}
                                </label>
                                <input
                                    type="range"
                                    min="0.0"
                                    max="0.5"
                                    step="0.05"
                                    value={options.centerStrength}
                                    onChange={(e) => handleForceChange('centerStrength', parseFloat(e.target.value))}
                                    className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider"
                                />
                                <div className="flex justify-between text-xs text-neutral-500 mt-1">
                                    <span>Tự do</span>
                                    <span>Tập trung</span>
                                </div>
                            </div>

                            {/* Force toggles */}
                            <div className="space-y-2">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={options.enableCollision}
                                        onChange={(e) => onOptionsChange({ enableCollision: e.target.checked })}
                                        className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                                    />
                                    <span className="text-xs text-neutral-700">Bật phát hiện va chạm</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={options.enableCentering}
                                        onChange={(e) => onOptionsChange({ enableCentering: e.target.checked })}
                                        className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                                    />
                                    <span className="text-xs text-neutral-700">Bật lực trung tâm</span>
                                </label>
                            </div>
                        </div>
                    )}
                    {/* Simulation controls */}
                    {activeTab === 'simulation' && (
                        <div className="space-y-4">
                            {/* Simulation speed */}
                            <div>
                                <label className="block text-xs font-medium text-neutral-700 mb-2">
                                    Tốc độ mô phỏng: {simulationSpeed.toFixed(1)}x
                                </label>
                                <input
                                    type="range"
                                    min="0.1"
                                    max="3.0"
                                    step="0.1"
                                    value={simulationSpeed}
                                    onChange={(e) => onSimulationSpeedChange(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider"
                                />
                                <div className="flex justify-between text-xs text-neutral-500 mt-1">
                                    <span>Chậm</span>
                                    <span>Nhanh</span>
                                </div>
                            </div>

                            {/* Iterations */}
                            <div>
                                <label className="block text-xs font-medium text-neutral-700 mb-2">
                                    Số lần lặp: {Math.round(options.iterations * simulationSpeed)}
                                </label>
                                <input
                                    type="range"
                                    min="100"
                                    max="1000"
                                    step="50"
                                    value={options.iterations}
                                    onChange={(e) => handleForceChange('iterations', parseInt(e.target.value))}
                                    className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider"
                                />
                                <div className="flex justify-between text-xs text-neutral-500 mt-1">
                                    <span>Ít</span>
                                    <span>Nhiều</span>
                                </div>
                            </div>

                            {/* Alpha decay */}
                            <div>
                                <label className="block text-xs font-medium text-neutral-700 mb-2">
                                    Tốc độ giảm năng lượng: {options.alphaDecay.toFixed(3)}
                                </label>
                                <input
                                    type="range"
                                    min="0.005"
                                    max="0.1"
                                    step="0.005"
                                    value={options.alphaDecay}
                                    onChange={(e) => handleForceChange('alphaDecay', parseFloat(e.target.value))}
                                    className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider"
                                />
                                <div className="flex justify-between text-xs text-neutral-500 mt-1">
                                    <span>Chậm</span>
                                    <span>Nhanh</span>
                                </div>
                            </div>

                            {/* Velocity decay */}
                            <div>
                                <label className="block text-xs font-medium text-neutral-700 mb-2">
                                    Giảm vận tốc: {options.velocityDecay.toFixed(2)}
                                </label>
                                <input
                                    type="range"
                                    min="0.1"
                                    max="0.9"
                                    step="0.1"
                                    value={options.velocityDecay}
                                    onChange={(e) => handleForceChange('velocityDecay', parseFloat(e.target.value))}
                                    className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider"
                                />
                                <div className="flex justify-between text-xs text-neutral-500 mt-1">
                                    <span>Ít</span>
                                    <span>Nhiều</span>
                                </div>
                            </div>

                            {/* Relationship strength controls */}
                            <div>
                                <h4 className="text-xs font-medium text-neutral-700 mb-2">Cường độ theo loại liên kết</h4>
                                <div className="space-y-3">
                                    {Object.entries(options.strengthByType).map(([type, strength]) => (
                                        <div key={type}>
                                            <label className="block text-xs text-neutral-600 mb-1">
                                                {type === 'dependency' ? 'Phụ thuộc' :
                                                    type === 'progression' ? 'Tiến triển' :
                                                        type === 'related' ? 'Liên quan' : 'Tùy chọn'}: {strength.toFixed(2)}
                                            </label>
                                            <input
                                                type="range"
                                                min="0.1"
                                                max="1.0"
                                                step="0.1"
                                                value={strength}
                                                onChange={(e) => handleRelationshipStrengthChange(
                                                    type as keyof ForceDirectedLayoutOptions['strengthByType'],
                                                    parseFloat(e.target.value)
                                                )}
                                                className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Positioning controls */}
                    {activeTab === 'positioning' && (
                        <div className="space-y-4">
                            {/* Manual positioning toggle */}
                            <div className="p-3 bg-neutral-50 rounded-md">
                                <label className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        checked={manualPositioning}
                                        onChange={(e) => onManualPositioningChange(e.target.checked)}
                                        className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                                    />
                                    <div>
                                        <span className="text-sm font-medium text-neutral-900">
                                            Định vị thủ công
                                        </span>
                                        <p className="text-xs text-neutral-600 mt-1">
                                            Cho phép kéo thả nút để định vị thủ công, ghi đè lực vật lý
                                        </p>
                                    </div>
                                </label>
                            </div>

                            {/* Manual positioning instructions */}
                            {manualPositioning && (
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                                    <div className="flex items-start space-x-2">
                                        <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div>
                                            <h4 className="text-xs font-medium text-blue-900 mb-1">
                                                Hướng dẫn định vị thủ công
                                            </h4>
                                            <ul className="text-xs text-blue-800 space-y-1">
                                                <li>• Kéo thả nút để di chuyển</li>
                                                <li>• Giữ Shift + kéo để di chuyển nhiều nút</li>
                                                <li>• Nhấp đúp để cố định/bỏ cố định nút</li>
                                                <li>• Nút được cố định sẽ không bị ảnh hưởng bởi lực vật lý</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Position reset options */}
                            <div className="space-y-2">
                                <h4 className="text-xs font-medium text-neutral-700">Đặt lại vị trí</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => {
                                            // Reset to physics simulation
                                            onManualPositioningChange(false);
                                        }}
                                        className="px-3 py-2 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
                                    >
                                        Về vật lý
                                    </button>
                                    <button
                                        onClick={() => {
                                            // This would trigger a layout reset in the parent component
                                            // For now, just show the action is available
                                        }}
                                        className="px-3 py-2 text-xs font-medium text-neutral-700 bg-neutral-50 border border-neutral-200 rounded-md hover:bg-neutral-100 transition-colors"
                                    >
                                        Xóa cố định
                                    </button>
                                </div>
                            </div>

                            {/* Layout presets */}
                            <div className="space-y-2">
                                <h4 className="text-xs font-medium text-neutral-700">Bố cục mẫu</h4>
                                <div className="grid grid-cols-1 gap-2">
                                    <button
                                        onClick={() => {
                                            handleForceChange('chargeStrength', -200);
                                            handleForceChange('linkStrength', 0.5);
                                            handleForceChange('linkDistance', 80);
                                        }}
                                        className="px-3 py-2 text-xs font-medium text-neutral-700 bg-neutral-50 border border-neutral-200 rounded-md hover:bg-neutral-100 transition-colors text-left"
                                    >
                                        <div>
                                            <div className="font-medium">Tập trung</div>
                                            <div className="text-neutral-500">Nút gần nhau, liên kết mạnh</div>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleForceChange('chargeStrength', -500);
                                            handleForceChange('linkStrength', 0.2);
                                            handleForceChange('linkDistance', 150);
                                        }}
                                        className="px-3 py-2 text-xs font-medium text-neutral-700 bg-neutral-50 border border-neutral-200 rounded-md hover:bg-neutral-100 transition-colors text-left"
                                    >
                                        <div>
                                            <div className="font-medium">Phân tán</div>
                                            <div className="text-neutral-500">Nút xa nhau, liên kết yếu</div>
                                        </div>
                                    </button>
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