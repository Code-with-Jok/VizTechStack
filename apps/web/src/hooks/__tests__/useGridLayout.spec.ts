/**
 * @jest-environment jsdom
 */

import { renderHook, act } from '@testing-library/react';
import { useGridLayout } from '../useGridLayout';
import type { GridLayoutOptions } from '@viztechstack/roadmap-visualization';

describe('useGridLayout', () => {
    describe('initialization', () => {
        it('should initialize with default options', () => {
            const { result } = renderHook(() => useGridLayout());

            expect(result.current.options).toEqual(expect.objectContaining({
                width: 1200,
                height: 800,
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
            }));
        });

        it('should initialize with custom options', () => {
            const customOptions: Partial<GridLayoutOptions> = {
                cellWidth: 300,
                cellHeight: 200,
                autoSize: false
            };

            const { result } = renderHook(() => useGridLayout(customOptions));

            expect(result.current.options.cellWidth).toBe(300);
            expect(result.current.options.cellHeight).toBe(200);
            expect(result.current.options.autoSize).toBe(false);
        });

        it('should initialize with default alignment and snap settings', () => {
            const { result } = renderHook(() => useGridLayout());

            expect(result.current.alignment).toEqual({
                horizontal: 'center',
                vertical: 'center'
            });
            expect(result.current.snapToGrid).toBe(true);
            expect(result.current.showGridLines).toBe(false);
            expect(result.current.isAnimating).toBe(false);
        });
    });

    describe('updateOptions', () => {
        it('should update options correctly', () => {
            const { result } = renderHook(() => useGridLayout());

            act(() => {
                result.current.updateOptions({ cellWidth: 250, cellHeight: 150 });
            });

            expect(result.current.options.cellWidth).toBe(250);
            expect(result.current.options.cellHeight).toBe(150);
        });

        it('should validate cell dimensions', () => {
            const { result } = renderHook(() => useGridLayout());
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

            act(() => {
                result.current.updateOptions({ cellWidth: -10, cellHeight: 0 });
            });

            expect(consoleSpy).toHaveBeenCalledWith('Cell dimensions must be positive');
            expect(result.current.options.cellWidth).toBe(200); // Should remain unchanged
            expect(result.current.options.cellHeight).toBe(120); // Should remain unchanged

            consoleSpy.mockRestore();
        });

        it('should validate grid dimensions', () => {
            const { result } = renderHook(() => useGridLayout());
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

            act(() => {
                result.current.updateOptions({ columns: -5, rows: -3 });
            });

            expect(consoleSpy).toHaveBeenCalledWith('Grid dimensions must be non-negative');
            expect(result.current.options.columns).toBe(0); // Should remain unchanged
            expect(result.current.options.rows).toBe(0); // Should remain unchanged

            consoleSpy.mockRestore();
        });
    });
    describe('adjustGridSize', () => {
        it('should adjust grid size and disable auto-size when setting manual dimensions', () => {
            const { result } = renderHook(() => useGridLayout());

            act(() => {
                result.current.adjustGridSize(5, 4);
            });

            expect(result.current.options.columns).toBe(5);
            expect(result.current.options.rows).toBe(4);
            expect(result.current.options.autoSize).toBe(false);
        });

        it('should enable auto-size when both dimensions are 0', () => {
            const { result } = renderHook(() => useGridLayout({ autoSize: false }));

            act(() => {
                result.current.adjustGridSize(0, 0);
            });

            expect(result.current.options.columns).toBe(0);
            expect(result.current.options.rows).toBe(0);
            expect(result.current.options.autoSize).toBe(true);
        });

        it('should handle negative values', () => {
            const { result } = renderHook(() => useGridLayout());
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

            act(() => {
                result.current.adjustGridSize(-2, -3);
            });

            expect(consoleSpy).toHaveBeenCalledWith('Grid dimensions must be non-negative');
            expect(result.current.options.columns).toBe(0); // Should remain unchanged
            expect(result.current.options.rows).toBe(0); // Should remain unchanged

            consoleSpy.mockRestore();
        });
    });

    describe('adjustCellSize', () => {
        it('should adjust cell size with minimum constraints', () => {
            const { result } = renderHook(() => useGridLayout());

            act(() => {
                result.current.adjustCellSize(300, 250);
            });

            expect(result.current.options.cellWidth).toBe(300);
            expect(result.current.options.cellHeight).toBe(250);
        });

        it('should enforce minimum cell width and height', () => {
            const { result } = renderHook(() => useGridLayout());

            act(() => {
                result.current.adjustCellSize(50, 40); // Below minimum
            });

            expect(result.current.options.cellWidth).toBe(80); // Minimum width
            expect(result.current.options.cellHeight).toBe(60); // Minimum height
        });

        it('should handle invalid dimensions', () => {
            const { result } = renderHook(() => useGridLayout());
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

            act(() => {
                result.current.adjustCellSize(-100, 0);
            });

            expect(consoleSpy).toHaveBeenCalledWith('Cell dimensions must be positive');
            expect(result.current.options.cellWidth).toBe(200); // Should remain unchanged
            expect(result.current.options.cellHeight).toBe(120); // Should remain unchanged

            consoleSpy.mockRestore();
        });
    });
    describe('adjustSpacing', () => {
        it('should adjust spacing correctly', () => {
            const { result } = renderHook(() => useGridLayout());

            act(() => {
                result.current.adjustSpacing(30, 25);
            });

            expect(result.current.options.paddingX).toBe(30);
            expect(result.current.options.paddingY).toBe(25);
        });

        it('should enforce non-negative spacing', () => {
            const { result } = renderHook(() => useGridLayout());

            act(() => {
                result.current.adjustSpacing(-10, -5);
            });

            expect(result.current.options.paddingX).toBe(0); // Should be clamped to 0
            expect(result.current.options.paddingY).toBe(0); // Should be clamped to 0
        });
    });

    describe('adjustMargins', () => {
        it('should adjust margins correctly', () => {
            const { result } = renderHook(() => useGridLayout());

            act(() => {
                result.current.adjustMargins(60, 50);
            });

            expect(result.current.options.marginX).toBe(60);
            expect(result.current.options.marginY).toBe(50);
        });

        it('should enforce non-negative margins', () => {
            const { result } = renderHook(() => useGridLayout());

            act(() => {
                result.current.adjustMargins(-20, -15);
            });

            expect(result.current.options.marginX).toBe(0); // Should be clamped to 0
            expect(result.current.options.marginY).toBe(0); // Should be clamped to 0
        });
    });

    describe('alignment', () => {
        it('should update alignment correctly', () => {
            const { result } = renderHook(() => useGridLayout());

            act(() => {
                result.current.updateAlignment({ horizontal: 'left', vertical: 'top' });
            });

            expect(result.current.alignment).toEqual({
                horizontal: 'left',
                vertical: 'top'
            });
        });

        it('should update partial alignment', () => {
            const { result } = renderHook(() => useGridLayout());

            act(() => {
                result.current.updateAlignment({ horizontal: 'right' });
            });

            expect(result.current.alignment).toEqual({
                horizontal: 'right',
                vertical: 'center' // Should remain unchanged
            });
        });
    });
    describe('toggleAutoSize', () => {
        it('should toggle auto-size mode', () => {
            const { result } = renderHook(() => useGridLayout({ autoSize: true }));

            act(() => {
                result.current.toggleAutoSize();
            });

            expect(result.current.options.autoSize).toBe(false);

            act(() => {
                result.current.toggleAutoSize();
            });

            expect(result.current.options.autoSize).toBe(true);
        });
    });

    describe('optimizeForContent', () => {
        it('should apply content optimization settings', () => {
            const { result } = renderHook(() => useGridLayout({
                autoSize: false,
                enableOptimization: false,
                preventOverlaps: false,
                centerGrid: false,
                sortBy: 'none',
                groupBy: 'none'
            }));

            act(() => {
                result.current.optimizeForContent();
            });

            expect(result.current.options).toEqual(expect.objectContaining({
                autoSize: true,
                enableOptimization: true,
                preventOverlaps: true,
                centerGrid: true,
                sortBy: 'level',
                groupBy: 'level'
            }));
        });
    });

    describe('resetOptions', () => {
        it('should reset all options to defaults', () => {
            const { result } = renderHook(() => useGridLayout());

            // Modify some options
            act(() => {
                result.current.updateOptions({ cellWidth: 300, cellHeight: 200 });
                result.current.updateAlignment({ horizontal: 'left', vertical: 'top' });
                result.current.setSnapToGrid(false);
                result.current.setShowGridLines(true);
                result.current.setIsAnimating(true);
            });

            // Reset
            act(() => {
                result.current.resetOptions();
            });

            expect(result.current.options.cellWidth).toBe(200);
            expect(result.current.options.cellHeight).toBe(120);
            expect(result.current.alignment).toEqual({
                horizontal: 'center',
                vertical: 'center'
            });
            expect(result.current.snapToGrid).toBe(true);
            expect(result.current.showGridLines).toBe(false);
            expect(result.current.isAnimating).toBe(false);
        });

        it('should preserve initial options when resetting', () => {
            const initialOptions = { cellWidth: 250, cellHeight: 180 };
            const { result } = renderHook(() => useGridLayout(initialOptions));

            // Modify options
            act(() => {
                result.current.updateOptions({ cellWidth: 300, cellHeight: 200 });
            });

            // Reset
            act(() => {
                result.current.resetOptions();
            });

            expect(result.current.options.cellWidth).toBe(250); // Should use initial value
            expect(result.current.options.cellHeight).toBe(180); // Should use initial value
        });
    });

    describe('state management', () => {
        it('should manage snap to grid state', () => {
            const { result } = renderHook(() => useGridLayout());

            expect(result.current.snapToGrid).toBe(true);

            act(() => {
                result.current.setSnapToGrid(false);
            });

            expect(result.current.snapToGrid).toBe(false);
        });

        it('should manage show grid lines state', () => {
            const { result } = renderHook(() => useGridLayout());

            expect(result.current.showGridLines).toBe(false);

            act(() => {
                result.current.setShowGridLines(true);
            });

            expect(result.current.showGridLines).toBe(true);
        });

        it('should manage animation state', () => {
            const { result } = renderHook(() => useGridLayout());

            expect(result.current.isAnimating).toBe(false);

            act(() => {
                result.current.setIsAnimating(true);
            });

            expect(result.current.isAnimating).toBe(true);
        });
    });
});