'use client';

/**
 * useGridLayout Hook
 * Manages grid layout state and options
 * 
 * Validates: Requirement 3.4
 */

import { useState, useCallback, useMemo } from 'react';
import type { GridLayoutOptions } from '@viztechstack/roadmap-visualization';

export interface GridLayoutState {
    options: GridLayoutOptions;
    isAnimating: boolean;
    snapToGrid: boolean;
    showGridLines: boolean;
    alignment: {
        horizontal: 'left' | 'center' | 'right';
        vertical: 'top' | 'center' | 'bottom';
    };
}

export interface UseGridLayoutReturn {
    options: GridLayoutOptions;
    updateOptions: (newOptions: Partial<GridLayoutOptions>) => void;
    resetOptions: () => void;
    isAnimating: boolean;
    setIsAnimating: (animating: boolean) => void;
    snapToGrid: boolean;
    setSnapToGrid: (snap: boolean) => void;
    showGridLines: boolean;
    setShowGridLines: (show: boolean) => void;
    alignment: GridLayoutState['alignment'];
    updateAlignment: (alignment: Partial<GridLayoutState['alignment']>) => void;
    adjustGridSize: (columns: number, rows: number) => void;
    adjustCellSize: (width: number, height: number) => void;
    adjustSpacing: (paddingX: number, paddingY: number) => void;
    adjustMargins: (marginX: number, marginY: number) => void;
    toggleAutoSize: () => void;
    optimizeForContent: () => void;
}

const DEFAULT_OPTIONS: GridLayoutOptions = {
    width: 1200,
    height: 800,
    columns: 0, // Auto-calculate
    rows: 0, // Auto-calculate
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

const DEFAULT_ALIGNMENT = {
    horizontal: 'center' as const,
    vertical: 'center' as const
};

export function useGridLayout(
    initialOptions: Partial<GridLayoutOptions> = {}
): UseGridLayoutReturn {
    // Initialize options with defaults
    const [options, setOptions] = useState<GridLayoutOptions>(() => ({
        ...DEFAULT_OPTIONS,
        ...initialOptions
    }));

    const [isAnimating, setIsAnimating] = useState(false);
    const [snapToGrid, setSnapToGrid] = useState(true);
    const [showGridLines, setShowGridLines] = useState(false);
    const [alignment, setAlignment] = useState(DEFAULT_ALIGNMENT);

    // Update options with validation
    const updateOptions = useCallback((newOptions: Partial<GridLayoutOptions>) => {
        setOptions(prev => {
            const updated = { ...prev, ...newOptions };

            // Validate cell dimensions
            if (updated.cellWidth <= 0 || updated.cellHeight <= 0) {
                console.warn('Cell dimensions must be positive');
                return prev;
            }

            // Validate grid dimensions
            if (updated.columns < 0 || updated.rows < 0) {
                console.warn('Grid dimensions must be non-negative');
                return prev;
            }

            // Validate spacing and margins
            if (updated.paddingX < 0 || updated.paddingY < 0 ||
                updated.marginX < 0 || updated.marginY < 0) {
                console.warn('Spacing and margins must be non-negative');
                return prev;
            }

            // Validate aspect ratio
            if (updated.aspectRatio <= 0) {
                console.warn('Aspect ratio must be positive');
                return prev;
            }

            // Validate canvas dimensions
            if (updated.width <= 0 || updated.height <= 0) {
                console.warn('Canvas dimensions must be positive');
                return prev;
            }

            return updated;
        });
    }, []);

    // Reset to default options
    const resetOptions = useCallback(() => {
        setOptions({ ...DEFAULT_OPTIONS, ...initialOptions });
        setAlignment(DEFAULT_ALIGNMENT);
        setSnapToGrid(true);
        setShowGridLines(false);
        setIsAnimating(false);
    }, [initialOptions]);

    // Update alignment
    const updateAlignment = useCallback((
        newAlignment: Partial<GridLayoutState['alignment']>
    ) => {
        setAlignment(prev => ({ ...prev, ...newAlignment }));
    }, []);

    // Adjust grid size (columns and rows)
    const adjustGridSize = useCallback((columns: number, rows: number) => {
        if (columns < 0 || rows < 0) {
            console.warn('Grid dimensions must be non-negative');
            return;
        }

        updateOptions({
            columns: Math.max(0, columns),
            rows: Math.max(0, rows),
            autoSize: columns === 0 && rows === 0 // Enable auto-size if both are 0
        });
    }, [updateOptions]);

    // Adjust cell size
    const adjustCellSize = useCallback((width: number, height: number) => {
        if (width <= 0 || height <= 0) {
            console.warn('Cell dimensions must be positive');
            return;
        }

        updateOptions({
            cellWidth: Math.max(80, width), // Minimum cell width
            cellHeight: Math.max(60, height) // Minimum cell height
        });
    }, [updateOptions]);

    // Adjust spacing between cells
    const adjustSpacing = useCallback((paddingX: number, paddingY: number) => {
        updateOptions({
            paddingX: Math.max(0, paddingX),
            paddingY: Math.max(0, paddingY)
        });
    }, [updateOptions]);

    // Adjust margins around the grid
    const adjustMargins = useCallback((marginX: number, marginY: number) => {
        updateOptions({
            marginX: Math.max(0, marginX),
            marginY: Math.max(0, marginY)
        });
    }, [updateOptions]);

    // Toggle auto-size mode
    const toggleAutoSize = useCallback(() => {
        updateOptions({ autoSize: !options.autoSize });
    }, [options.autoSize, updateOptions]);

    // Optimize layout for content
    const optimizeForContent = useCallback(() => {
        // This would analyze the content and adjust settings accordingly
        // For now, we'll apply some sensible defaults for content optimization
        updateOptions({
            autoSize: true,
            enableOptimization: true,
            preventOverlaps: true,
            centerGrid: true,
            sortBy: 'level',
            groupBy: 'level'
        });
    }, [updateOptions]);

    // Memoized return value
    const returnValue = useMemo(() => ({
        options,
        updateOptions,
        resetOptions,
        isAnimating,
        setIsAnimating,
        snapToGrid,
        setSnapToGrid,
        showGridLines,
        setShowGridLines,
        alignment,
        updateAlignment,
        adjustGridSize,
        adjustCellSize,
        adjustSpacing,
        adjustMargins,
        toggleAutoSize,
        optimizeForContent
    }), [
        options,
        updateOptions,
        resetOptions,
        isAnimating,
        setIsAnimating,
        snapToGrid,
        setSnapToGrid,
        showGridLines,
        setShowGridLines,
        alignment,
        updateAlignment,
        adjustGridSize,
        adjustCellSize,
        adjustSpacing,
        adjustMargins,
        toggleAutoSize,
        optimizeForContent
    ]);

    return returnValue;
}