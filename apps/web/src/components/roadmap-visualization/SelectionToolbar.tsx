'use client';

/**
 * Selection toolbar component cho roadmap visualization
 * Cung cấp UI controls cho selection operations
 * Tích hợp với VizTechStack design system
 */

import React from 'react';
import type { SelectionMode } from '@/hooks/useSelectionState';

/**
 * Selection toolbar props
 */
export interface SelectionToolbarProps {
    // Selection state
    selectedCount: { nodes: number; edges: number; total: number };
    selectionMode: SelectionMode;

    // Actions
    onSelectAll: () => void;
    onClearSelection: () => void;
    onInvertSelection: () => void;
    onSetSelectionMode: (mode: SelectionMode) => void;

    // Configuration
    enableMultiSelection?: boolean;
    enableRangeSelection?: boolean;
    maxSelections?: number;

    // Styling
    className?: string;
    position?: 'top' | 'bottom' | 'floating';
}

/**
 * Selection mode button component
 */
interface SelectionModeButtonProps {
    mode: SelectionMode;
    currentMode: SelectionMode;
    onClick: (mode: SelectionMode) => void;
    disabled?: boolean;
}

function SelectionModeButton({ mode, currentMode, onClick, disabled = false }: SelectionModeButtonProps) {
    const isActive = currentMode === mode;

    const getModeIcon = (mode: SelectionMode) => {
        switch (mode) {
            case 'single':
                return (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                );
            case 'multi':
                return (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                );
            case 'range':
                return (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                );
        }
    };

    const getModeLabel = (mode: SelectionMode) => {
        switch (mode) {
            case 'single':
                return 'Chọn đơn';
            case 'multi':
                return 'Chọn nhiều';
            case 'range':
                return 'Chọn vùng';
        }
    };

    return (
        <button
            onClick={() => onClick(mode)}
            disabled={disabled}
            className={`
                flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${isActive
                    ? 'bg-primary-500 text-white shadow-soft'
                    : 'bg-white text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800 border border-neutral-200'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            title={getModeLabel(mode)}
        >
            {getModeIcon(mode)}
            <span className="hidden sm:inline">{getModeLabel(mode)}</span>
        </button>
    );
}

/**
 * Selection toolbar component
 */
export function SelectionToolbar({
    selectedCount,
    selectionMode,
    onSelectAll,
    onClearSelection,
    onInvertSelection,
    onSetSelectionMode,
    enableMultiSelection = true,
    enableRangeSelection = true,
    maxSelections = 0,
    className = '',
    position = 'floating',
}: SelectionToolbarProps) {

    const hasSelection = selectedCount.total > 0;
    const isMaxSelectionReached = maxSelections > 0 && selectedCount.total >= maxSelections;

    // Position-specific styling
    const getPositionClasses = () => {
        switch (position) {
            case 'top':
                return 'top-6 left-1/2 transform -translate-x-1/2';
            case 'bottom':
                return 'bottom-6 left-1/2 transform -translate-x-1/2';
            case 'floating':
            default:
                return 'top-20 left-6';
        }
    };

    return (
        <div className={`absolute z-30 ${getPositionClasses()} ${className}`}>
            <div className="glass rounded-xl p-3 shadow-medium border border-white/20 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    {/* Selection mode controls */}
                    <div className="flex items-center gap-1 border-r border-neutral-200 pr-3">
                        <SelectionModeButton
                            mode="single"
                            currentMode={selectionMode}
                            onClick={onSetSelectionMode}
                        />

                        {enableMultiSelection && (
                            <SelectionModeButton
                                mode="multi"
                                currentMode={selectionMode}
                                onClick={onSetSelectionMode}
                            />
                        )}

                        {enableRangeSelection && (
                            <SelectionModeButton
                                mode="range"
                                currentMode={selectionMode}
                                onClick={onSetSelectionMode}
                            />
                        )}
                    </div>

                    {/* Selection actions */}
                    <div className="flex items-center gap-2">
                        {/* Select All */}
                        <button
                            onClick={onSelectAll}
                            disabled={isMaxSelectionReached}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-white text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800 border border-neutral-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Chọn tất cả (Ctrl+A)"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                            </svg>
                            <span className="hidden sm:inline">Chọn tất cả</span>
                        </button>

                        {/* Invert Selection */}
                        {hasSelection && (
                            <button
                                onClick={onInvertSelection}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-white text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800 border border-neutral-200 transition-all duration-200"
                                title="Đảo ngược lựa chọn"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                                </svg>
                                <span className="hidden sm:inline">Đảo ngược</span>
                            </button>
                        )}

                        {/* Clear Selection */}
                        {hasSelection && (
                            <button
                                onClick={onClearSelection}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-error-50 text-error-600 hover:bg-error-100 hover:text-error-700 border border-error-200 transition-all duration-200"
                                title="Bỏ chọn tất cả (Escape)"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                                <span className="hidden sm:inline">Bỏ chọn</span>
                            </button>
                        )}
                    </div>

                    {/* Selection count indicator */}
                    {hasSelection && (
                        <div className="flex items-center gap-2 border-l border-neutral-200 pl-3">
                            <div className="flex items-center gap-1 text-sm text-neutral-600">
                                <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                                <span className="font-medium">
                                    {selectedCount.total} đã chọn
                                </span>
                            </div>

                            {/* Detailed count tooltip */}
                            {(selectedCount.nodes > 0 && selectedCount.edges > 0) && (
                                <div className="text-xs text-neutral-500 hidden lg:block">
                                    ({selectedCount.nodes} nodes, {selectedCount.edges} kết nối)
                                </div>
                            )}

                            {/* Selection limit indicator */}
                            {maxSelections > 0 && (
                                <div className="text-xs text-neutral-500">
                                    / {maxSelections}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Keyboard shortcuts hint */}
                {!hasSelection && (
                    <div className="mt-2 pt-2 border-t border-neutral-200">
                        <div className="text-xs text-neutral-500 space-y-1">
                            <div className="flex items-center justify-between">
                                <span>Ctrl+Click:</span>
                                <span>Chọn nhiều</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Shift+Click:</span>
                                <span>Chọn vùng</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Ctrl+A:</span>
                                <span>Chọn tất cả</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Escape:</span>
                                <span>Bỏ chọn</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Selection limit warning */}
                {isMaxSelectionReached && (
                    <div className="mt-2 pt-2 border-t border-warning-200">
                        <div className="flex items-center gap-2 text-xs text-warning-700 bg-warning-50 px-2 py-1 rounded">
                            <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span>Đã đạt giới hạn chọn tối đa</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}