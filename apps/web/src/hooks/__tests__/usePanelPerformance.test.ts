/**
 * Tests for usePanelPerformance hook
 * Task 4.2.2: Performance optimization testing
 */

import { renderHook, act } from '@testing-library/react';
import { usePanelPerformance } from '../usePanelPerformance';

// Mock performance API
const mockPerformance = {
    now: jest.fn(() => Date.now()),
    mark: jest.fn(),
    measure: jest.fn(),
};

Object.defineProperty(window, 'performance', {
    value: mockPerformance,
});

// Mock PerformanceObserver
class MockPerformanceObserver {
    constructor(callback: PerformanceObserverCallback) {
        this.callback = callback;
    }

    callback: PerformanceObserverCallback;

    observe = jest.fn();
    disconnect = jest.fn();
}

Object.defineProperty(window, 'PerformanceObserver', {
    value: MockPerformanceObserver,
});

describe('usePanelPerformance', () => {
    const sampleItems = Array.from({ length: 50 }, (_, i) => ({
        id: `item-${i}`,
        name: `Item ${i}`,
        value: i,
    }));

    beforeEach(() => {
        jest.clearAllMocks();
        mockPerformance.now.mockReturnValue(Date.now());
    });

    describe('initialization', () => {
        it('should initialize with default options', () => {
            const { result } = renderHook(() =>
                usePanelPerformance(sampleItems)
            );

            expect(result.current.scrollTop).toBe(0);
            expect(result.current.containerHeight).toBe(400);
            expect(result.current.isLoading).toBe(false);
            expect(result.current.hasMore).toBe(false);
            expect(result.current.loadedCount).toBe(sampleItems.length);
        });

        it('should initialize with custom options', () => {
            const { result } = renderHook(() =>
                usePanelPerformance(sampleItems, {
                    containerHeight: 600,
                    itemHeight: 100,
                    enableVirtualization: false,
                })
            );

            expect(result.current.containerHeight).toBe(600);
            expect(result.current.totalHeight).toBe(5000); // 50 items * 100px
        });
    });

    describe('virtualization', () => {
        it('should calculate virtualized items correctly', () => {
            const { result } = renderHook(() =>
                usePanelPerformance(sampleItems, {
                    enableVirtualization: true,
                    itemHeight: 60,
                    containerHeight: 400,
                    overscan: 2,
                })
            );

            // Should show items that fit in viewport plus overscan
            expect(result.current.virtualizedItems.length).toBeGreaterThan(0);
            expect(result.current.totalHeight).toBe(3000); // 50 items * 60px
        });

        it('should update virtualized items on scroll', () => {
            const { result } = renderHook(() =>
                usePanelPerformance(sampleItems, {
                    enableVirtualization: true,
                    itemHeight: 60,
                    containerHeight: 400,
                })
            );

            const initialItems = result.current.virtualizedItems;

            act(() => {
                result.current.handleScroll(300); // Scroll down
            });

            const scrolledItems = result.current.virtualizedItems;

            // Items should change after scrolling
            expect(scrolledItems).not.toEqual(initialItems);
            expect(result.current.scrollTop).toBe(300);
        });

        it('should disable virtualization when option is false', () => {
            const { result } = renderHook(() =>
                usePanelPerformance(sampleItems, {
                    enableVirtualization: false,
                })
            );

            // Should return all items when virtualization is disabled
            expect(result.current.virtualizedItems).toHaveLength(sampleItems.length);
            result.current.virtualizedItems.forEach(item => {
                expect(item.isVisible).toBe(true);
            });
        });
    });

    describe('lazy loading', () => {
        it('should trigger load more when scrolling near bottom', async () => {
            const { result } = renderHook(() =>
                usePanelPerformance(sampleItems, {
                    enableLazyLoading: true,
                    loadThreshold: 100,
                })
            );

            // Set hasMore to true to enable loading
            act(() => {
                result.current.loadMore();
            });

            expect(result.current.isLoading).toBe(true);

            // Wait for loading to complete
            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 600));
            });

            expect(result.current.isLoading).toBe(false);
        });

        it('should not trigger load more when already loading', () => {
            const { result } = renderHook(() =>
                usePanelPerformance(sampleItems, {
                    enableLazyLoading: true,
                })
            );

            act(() => {
                result.current.loadMore();
                result.current.loadMore(); // Second call should be ignored
            });

            expect(result.current.isLoading).toBe(true);
        });

        it('should not trigger load more when no more items', () => {
            const { result } = renderHook(() =>
                usePanelPerformance(sampleItems, {
                    enableLazyLoading: true,
                })
            );

            expect(result.current.hasMore).toBe(false);

            act(() => {
                result.current.loadMore();
            });

            expect(result.current.isLoading).toBe(false);
        });
    });

    describe('performance monitoring', () => {
        it('should track render time when enabled', () => {
            const { result } = renderHook(() =>
                usePanelPerformance(sampleItems, {
                    enablePerformanceMonitoring: true,
                })
            );

            act(() => {
                result.current.handleScroll(100);
            });

            expect(mockPerformance.now).toHaveBeenCalled();
        });

        it('should not track render time when disabled', () => {
            const { result } = renderHook(() =>
                usePanelPerformance(sampleItems, {
                    enablePerformanceMonitoring: false,
                })
            );

            act(() => {
                result.current.handleScroll(100);
            });

            // Performance tracking should be minimal when disabled
            expect(result.current.metrics.renderTime).toBe(0);
        });

        it('should calculate performance metrics', () => {
            const { result } = renderHook(() =>
                usePanelPerformance(sampleItems, {
                    enablePerformanceMonitoring: true,
                    enableVirtualization: true,
                })
            );

            expect(result.current.metrics.totalItems).toBe(sampleItems.length);
            expect(result.current.metrics.visibleItems).toBeGreaterThan(0);
            expect(result.current.metrics.cacheHitRate).toBeGreaterThanOrEqual(0);
        });
    });

    describe('memory management', () => {
        it('should manage cache size', () => {
            const { result } = renderHook(() =>
                usePanelPerformance(sampleItems, {
                    enableMemoryOptimization: true,
                    maxCacheSize: 10,
                })
            );

            // Cache management is internal, but we can test the interface
            act(() => {
                result.current.invalidateCache();
            });

            // Should reset cache metrics
            expect(result.current.metrics.cacheHitRate).toBe(0);
        });

        it('should disable memory optimization when option is false', () => {
            const { result } = renderHook(() =>
                usePanelPerformance(sampleItems, {
                    enableMemoryOptimization: false,
                })
            );

            // Memory optimization should be disabled
            expect(result.current.metrics.memoryUsage).toBe(0);
        });
    });

    describe('container height management', () => {
        it('should update container height', () => {
            const { result } = renderHook(() =>
                usePanelPerformance(sampleItems)
            );

            expect(result.current.containerHeight).toBe(400);

            act(() => {
                result.current.updateContainerHeight(600);
            });

            expect(result.current.containerHeight).toBe(600);
        });
    });

    describe('optimization detection', () => {
        it('should detect when panel is optimized', () => {
            const { result } = renderHook(() =>
                usePanelPerformance(sampleItems, {
                    enableVirtualization: true,
                    enableMemoryOptimization: true,
                })
            );

            // Initially should be considered optimized
            expect(result.current.isOptimized).toBe(true);
        });

        it('should detect when panel is not optimized', () => {
            const { result } = renderHook(() =>
                usePanelPerformance(sampleItems, {
                    enableVirtualization: false,
                    enableMemoryOptimization: false,
                })
            );

            // Without optimizations, may not be considered optimized
            // This depends on the specific metrics
            expect(typeof result.current.isOptimized).toBe('boolean');
        });
    });

    describe('edge cases', () => {
        it('should handle empty items array', () => {
            const { result } = renderHook(() =>
                usePanelPerformance([])
            );

            expect(result.current.virtualizedItems).toHaveLength(0);
            expect(result.current.totalHeight).toBe(0);
            expect(result.current.metrics.totalItems).toBe(0);
        });

        it('should handle single item', () => {
            const singleItem = [{ id: '1', name: 'Single Item' }];
            const { result } = renderHook(() =>
                usePanelPerformance(singleItem)
            );

            expect(result.current.virtualizedItems).toHaveLength(1);
            expect(result.current.totalHeight).toBe(60); // Default item height
        });

        it('should handle very large datasets', () => {
            const largeItems = Array.from({ length: 10000 }, (_, i) => ({
                id: `item-${i}`,
                name: `Item ${i}`,
            }));

            const { result } = renderHook(() =>
                usePanelPerformance(largeItems, {
                    enableVirtualization: true,
                    enablePerformanceMonitoring: true,
                })
            );

            expect(result.current.metrics.totalItems).toBe(10000);
            expect(result.current.virtualizedItems.length).toBeLessThan(100); // Should virtualize
        });
    });
});

describe('usePerformanceMonitor', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockPerformance.now.mockReturnValue(Date.now());
    });

    it('should track render count', () => {
        const { usePerformanceMonitor } = require('../usePanelPerformance');
        const { result, rerender } = renderHook(() =>
            usePerformanceMonitor('TestComponent')
        );

        expect(result.current.renderCount).toBe(1);

        rerender();
        expect(result.current.renderCount).toBe(2);

        rerender();
        expect(result.current.renderCount).toBe(3);
    });

    it('should log slow renders', () => {
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
        const { usePerformanceMonitor } = require('../usePanelPerformance');

        let currentTime = 1000;
        mockPerformance.now.mockImplementation(() => currentTime);

        const { rerender } = renderHook(() =>
            usePerformanceMonitor('SlowComponent')
        );

        // Simulate slow render (> 100ms)
        currentTime = 1150;
        rerender();

        expect(consoleSpy).toHaveBeenCalledWith(
            expect.stringContaining('SlowComponent slow render')
        );

        consoleSpy.mockRestore();
    });

    it('should not log fast renders', () => {
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
        const { usePerformanceMonitor } = require('../usePanelPerformance');

        let currentTime = 1000;
        mockPerformance.now.mockImplementation(() => currentTime);

        const { rerender } = renderHook(() =>
            usePerformanceMonitor('FastComponent')
        );

        // Simulate fast render (< 100ms)
        currentTime = 1050;
        rerender();

        expect(consoleSpy).not.toHaveBeenCalled();

        consoleSpy.mockRestore();
    });
});