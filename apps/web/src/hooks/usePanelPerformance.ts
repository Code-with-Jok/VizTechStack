'use client';

/**
 * Hook tối ưu hóa performance cho panels
 * Hỗ trợ virtualization, lazy loading và memory management
 * 
 * Task 4.2.2: Performance optimization cho NodeDetailsPanel
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

interface UsePanelPerformanceOptions {
    // Virtualization options
    enableVirtualization?: boolean;
    itemHeight?: number;
    containerHeight?: number;
    overscan?: number; // Số items render thêm ngoài viewport

    // Lazy loading options
    enableLazyLoading?: boolean;
    loadThreshold?: number; // Khoảng cách từ bottom để trigger load

    // Memory management
    enableMemoryOptimization?: boolean;
    maxCacheSize?: number;
    cleanupInterval?: number; // ms

    // Performance monitoring
    enablePerformanceMonitoring?: boolean;
}

interface VirtualizedItem {
    index: number;
    top: number;
    height: number;
    isVisible: boolean;
}

interface PerformanceMetrics {
    renderTime: number;
    memoryUsage: number;
    visibleItems: number;
    totalItems: number;
    cacheHitRate: number;
}

interface PanelPerformanceState {
    // Virtualization
    virtualizedItems: VirtualizedItem[];
    scrollTop: number;
    containerHeight: number;
    totalHeight: number;

    // Lazy loading
    isLoading: boolean;
    hasMore: boolean;
    loadedCount: number;

    // Performance
    metrics: PerformanceMetrics;
    isOptimized: boolean;

    // Actions
    handleScroll: (scrollTop: number) => void;
    loadMore: () => Promise<void>;
    invalidateCache: () => void;
    updateContainerHeight: (height: number) => void;
}

export function usePanelPerformance<T>(
    items: T[],
    options: UsePanelPerformanceOptions = {}
): PanelPerformanceState {
    const {
        enableVirtualization = true,
        itemHeight = 60,
        containerHeight: initialContainerHeight = 400,
        overscan = 5,
        enableLazyLoading = false,
        loadThreshold = 100,
        enableMemoryOptimization = true,
        maxCacheSize = 100,
        cleanupInterval = 30000, // 30 seconds
        enablePerformanceMonitoring = true,
    } = options;

    // State
    const [scrollTop, setScrollTop] = useState(0);
    const [containerHeight, setContainerHeight] = useState(initialContainerHeight);
    const [isLoading, setIsLoading] = useState(false);
    const [loadedCount, setLoadedCount] = useState(items.length);
    const [hasMore, setHasMore] = useState(false);

    // Refs
    const cacheRef = useRef<Map<string, any>>(new Map());
    const metricsRef = useRef<PerformanceMetrics>({
        renderTime: 0,
        memoryUsage: 0,
        visibleItems: 0,
        totalItems: items.length,
        cacheHitRate: 0,
    });
    const renderStartTimeRef = useRef<number>(0);
    const cacheHitsRef = useRef(0);
    const cacheAccessesRef = useRef(0);

    // Calculate virtualized items
    const virtualizedItems = useMemo(() => {
        if (!enableVirtualization) {
            return items.map((_, index) => ({
                index,
                top: index * itemHeight,
                height: itemHeight,
                isVisible: true,
            }));
        }

        const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
        const endIndex = Math.min(
            items.length - 1,
            Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
        );

        const virtualItems: VirtualizedItem[] = [];

        for (let i = startIndex; i <= endIndex; i++) {
            virtualItems.push({
                index: i,
                top: i * itemHeight,
                height: itemHeight,
                isVisible: i >= Math.floor(scrollTop / itemHeight) &&
                    i <= Math.ceil((scrollTop + containerHeight) / itemHeight),
            });
        }

        // Update metrics
        metricsRef.current.visibleItems = virtualItems.filter(item => item.isVisible).length;
        metricsRef.current.totalItems = items.length;

        return virtualItems;
    }, [items.length, scrollTop, containerHeight, itemHeight, overscan, enableVirtualization]);

    // Calculate total height for virtualization
    const totalHeight = useMemo(() => {
        return items.length * itemHeight;
    }, [items.length, itemHeight]);

    // Handle scroll with performance optimization
    const handleScroll = useCallback((newScrollTop: number) => {
        if (enablePerformanceMonitoring) {
            renderStartTimeRef.current = performance.now();
        }

        setScrollTop(newScrollTop);

        // Lazy loading trigger
        if (enableLazyLoading && hasMore && !isLoading) {
            const scrollBottom = newScrollTop + containerHeight;
            const triggerPoint = totalHeight - loadThreshold;

            if (scrollBottom >= triggerPoint) {
                loadMore();
            }
        }

        if (enablePerformanceMonitoring) {
            const renderTime = performance.now() - renderStartTimeRef.current;
            metricsRef.current.renderTime = renderTime;
        }
    }, [containerHeight, totalHeight, loadThreshold, enableLazyLoading, hasMore, isLoading, enablePerformanceMonitoring]);

    // Load more items (for lazy loading)
    const loadMore = useCallback(async () => {
        if (isLoading || !hasMore) return;

        setIsLoading(true);

        try {
            // Simulate loading delay
            await new Promise(resolve => setTimeout(resolve, 500));

            // In real implementation, this would load more data
            setLoadedCount(prev => prev + 20);

            // Check if there are more items to load
            if (loadedCount >= items.length) {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Failed to load more items:', error);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, hasMore, loadedCount, items.length]);

    // Cache management
    const getCachedItem = useCallback((key: string) => {
        cacheAccessesRef.current++;

        if (cacheRef.current.has(key)) {
            cacheHitsRef.current++;
            return cacheRef.current.get(key);
        }

        return null;
    }, []);

    const setCachedItem = useCallback((key: string, value: any) => {
        if (!enableMemoryOptimization) return;

        // Clean cache if it exceeds max size
        if (cacheRef.current.size >= maxCacheSize) {
            const firstKey = cacheRef.current.keys().next().value;
            cacheRef.current.delete(firstKey);
        }

        cacheRef.current.set(key, value);
    }, [enableMemoryOptimization, maxCacheSize]);

    const invalidateCache = useCallback(() => {
        cacheRef.current.clear();
        cacheHitsRef.current = 0;
        cacheAccessesRef.current = 0;
    }, []);

    // Update container height
    const updateContainerHeight = useCallback((height: number) => {
        setContainerHeight(height);
    }, []);

    // Memory cleanup
    useEffect(() => {
        if (!enableMemoryOptimization) return;

        const interval = setInterval(() => {
            // Calculate cache hit rate
            const hitRate = cacheAccessesRef.current > 0
                ? (cacheHitsRef.current / cacheAccessesRef.current) * 100
                : 0;

            metricsRef.current.cacheHitRate = hitRate;

            // Clean up old cache entries if hit rate is low
            if (hitRate < 50 && cacheRef.current.size > maxCacheSize / 2) {
                const keysToDelete = Array.from(cacheRef.current.keys()).slice(0, Math.floor(maxCacheSize / 4));
                keysToDelete.forEach(key => cacheRef.current.delete(key));
            }

            // Estimate memory usage (rough calculation)
            metricsRef.current.memoryUsage = cacheRef.current.size * 1024; // Rough estimate in bytes
        }, cleanupInterval);

        return () => clearInterval(interval);
    }, [enableMemoryOptimization, maxCacheSize, cleanupInterval]);

    // Performance monitoring
    useEffect(() => {
        if (!enablePerformanceMonitoring) return;

        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry) => {
                if (entry.name.includes('panel-render')) {
                    metricsRef.current.renderTime = entry.duration;
                }
            });
        });

        observer.observe({ entryTypes: ['measure'] });

        return () => observer.disconnect();
    }, [enablePerformanceMonitoring]);

    // Determine if panel is optimized
    const isOptimized = useMemo(() => {
        const { renderTime, cacheHitRate, visibleItems, totalItems } = metricsRef.current;

        return (
            renderTime < 16 && // Under 16ms for 60fps
            (cacheHitRate > 70 || !enableMemoryOptimization) &&
            (visibleItems < totalItems || !enableVirtualization)
        );
    }, [enableMemoryOptimization, enableVirtualization]);

    return {
        // Virtualization
        virtualizedItems,
        scrollTop,
        containerHeight,
        totalHeight,

        // Lazy loading
        isLoading,
        hasMore,
        loadedCount,

        // Performance
        metrics: metricsRef.current,
        isOptimized,

        // Actions
        handleScroll,
        loadMore,
        invalidateCache,
        updateContainerHeight,
    };
}

/**
 * Hook đơn giản cho performance monitoring
 */
export function usePerformanceMonitor(componentName: string) {
    const renderCountRef = useRef(0);
    const lastRenderTimeRef = useRef(0);

    useEffect(() => {
        renderCountRef.current++;
        const now = performance.now();

        if (lastRenderTimeRef.current > 0) {
            const timeSinceLastRender = now - lastRenderTimeRef.current;

            if (timeSinceLastRender > 100) { // Log if render took more than 100ms
                console.warn(`${componentName} slow render: ${timeSinceLastRender.toFixed(2)}ms`);
            }
        }

        lastRenderTimeRef.current = now;
    });

    return {
        renderCount: renderCountRef.current,
    };
}