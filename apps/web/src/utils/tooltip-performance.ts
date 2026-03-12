/**
 * Performance utilities for tooltip positioning system
 * 
 * Task 4.1.2: Implement tooltip positioning system
 * - Performance monitoring and optimization
 * - Benchmarking utilities
 * - Memory usage tracking
 * - Validates: Requirement 4.1
 */

export interface PerformanceMetrics {
    positionCalculationTime: number;
    collisionDetectionTime: number;
    renderTime: number;
    memoryUsage: number;
    cacheHitRate: number;
    totalTooltips: number;
    activeTooltips: number;
}

export interface BenchmarkResult {
    averageTime: number;
    minTime: number;
    maxTime: number;
    standardDeviation: number;
    iterations: number;
    operationsPerSecond: number;
}

/**
 * Performance monitor for tooltip operations
 */
export class TooltipPerformanceMonitor {
    private metrics: PerformanceMetrics[] = [];
    private maxMetricsHistory = 100;

    /**
     * Start timing an operation
     */
    startTiming(operationName: string): () => number {
        const startTime = performance.now();

        return () => {
            const endTime = performance.now();
            const duration = endTime - startTime;

            this.recordMetric(operationName, duration);
            return duration;
        };
    }

    /**
     * Record a performance metric
     */
    private recordMetric(operationName: string, duration: number): void {
        // Implementation would depend on specific metric type
        console.debug(`Tooltip ${operationName}: ${duration.toFixed(2)}ms`);
    }

    /**
     * Measure memory usage
     */
    measureMemoryUsage(): number {
        if ('memory' in performance) {
            const memory = (performance as any).memory;
            return memory.usedJSHeapSize / 1024 / 1024; // MB
        }
        return 0;
    }

    /**
     * Get current performance metrics
     */
    getCurrentMetrics(): Partial<PerformanceMetrics> {
        return {
            memoryUsage: this.measureMemoryUsage(),
            // Other metrics would be populated by the tooltip system
        };
    }

    /**
     * Clear metrics history
     */
    clearMetrics(): void {
        this.metrics = [];
    }

    /**
     * Get metrics summary
     */
    getMetricsSummary(): {
        averageMemoryUsage: number;
        peakMemoryUsage: number;
        metricsCount: number;
    } {
        if (this.metrics.length === 0) {
            return {
                averageMemoryUsage: 0,
                peakMemoryUsage: 0,
                metricsCount: 0,
            };
        }

        const memoryUsages = this.metrics.map(m => m.memoryUsage);
        const averageMemoryUsage = memoryUsages.reduce((a, b) => a + b, 0) / memoryUsages.length;
        const peakMemoryUsage = Math.max(...memoryUsages);

        return {
            averageMemoryUsage,
            peakMemoryUsage,
            metricsCount: this.metrics.length,
        };
    }
}

/**
 * Benchmark tooltip positioning performance
 */
export async function benchmarkTooltipPositioning(
    positioningFunction: (mouseX: number, mouseY: number) => any,
    iterations: number = 1000
): Promise<BenchmarkResult> {
    const times: number[] = [];

    // Warm up
    for (let i = 0; i < 10; i++) {
        positioningFunction(Math.random() * 1000, Math.random() * 1000);
    }

    // Benchmark
    for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();

        positioningFunction(
            Math.random() * 1000,
            Math.random() * 1000
        );

        const endTime = performance.now();
        times.push(endTime - startTime);
    }

    // Calculate statistics
    const averageTime = times.reduce((a, b) => a + b, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);

    const variance = times.reduce((acc, time) => {
        return acc + Math.pow(time - averageTime, 2);
    }, 0) / times.length;

    const standardDeviation = Math.sqrt(variance);
    const operationsPerSecond = 1000 / averageTime;

    return {
        averageTime,
        minTime,
        maxTime,
        standardDeviation,
        iterations,
        operationsPerSecond,
    };
}

/**
 * Test collision detection performance
 */
export async function benchmarkCollisionDetection(
    collisionFunction: (elements: any[]) => boolean,
    elementCounts: number[] = [10, 50, 100, 500],
    iterations: number = 100
): Promise<Map<number, BenchmarkResult>> {
    const results = new Map<number, BenchmarkResult>();

    for (const elementCount of elementCounts) {
        // Generate test elements
        const elements = Array.from({ length: elementCount }, (_, i) => ({
            x: Math.random() * 1000,
            y: Math.random() * 1000,
            width: 50 + Math.random() * 200,
            height: 30 + Math.random() * 100,
            id: `element-${i}`,
        }));

        const times: number[] = [];

        // Benchmark collision detection
        for (let i = 0; i < iterations; i++) {
            const startTime = performance.now();
            collisionFunction(elements);
            const endTime = performance.now();
            times.push(endTime - startTime);
        }

        // Calculate statistics
        const averageTime = times.reduce((a, b) => a + b, 0) / times.length;
        const minTime = Math.min(...times);
        const maxTime = Math.max(...times);

        const variance = times.reduce((acc, time) => {
            return acc + Math.pow(time - averageTime, 2);
        }, 0) / times.length;

        const standardDeviation = Math.sqrt(variance);
        const operationsPerSecond = 1000 / averageTime;

        results.set(elementCount, {
            averageTime,
            minTime,
            maxTime,
            standardDeviation,
            iterations,
            operationsPerSecond,
        });
    }

    return results;
}

/**
 * Monitor tooltip rendering performance
 */
export function createRenderPerformanceObserver(
    callback: (metrics: PerformanceMetrics) => void
): PerformanceObserver | null {
    if (!('PerformanceObserver' in window)) {
        console.warn('PerformanceObserver not supported');
        return null;
    }

    const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();

        entries.forEach((entry) => {
            if (entry.name.includes('tooltip')) {
                const metrics: Partial<PerformanceMetrics> = {
                    renderTime: entry.duration,
                    // Other metrics would be populated from entry details
                };

                callback(metrics as PerformanceMetrics);
            }
        });
    });

    try {
        observer.observe({ entryTypes: ['measure', 'navigation', 'paint'] });
        return observer;
    } catch (error) {
        console.warn('Failed to start performance observer:', error);
        return null;
    }
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
    func: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout | null = null;
    let lastExecTime = 0;

    return (...args: Parameters<T>) => {
        const currentTime = Date.now();

        if (currentTime - lastExecTime > delay) {
            func(...args);
            lastExecTime = currentTime;
        } else {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            timeoutId = setTimeout(() => {
                func(...args);
                lastExecTime = Date.now();
            }, delay - (currentTime - lastExecTime));
        }
    };
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout | null = null;

    return (...args: Parameters<T>) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(() => {
            func(...args);
        }, delay);
    };
}

/**
 * Request animation frame wrapper for smooth animations
 */
export function requestAnimationFrameThrottle<T extends (...args: any[]) => any>(
    func: T
): (...args: Parameters<T>) => void {
    let rafId: number | null = null;

    return (...args: Parameters<T>) => {
        if (rafId) {
            cancelAnimationFrame(rafId);
        }

        rafId = requestAnimationFrame(() => {
            func(...args);
        });
    };
}

/**
 * Global performance monitor instance
 */
export const tooltipPerformanceMonitor = new TooltipPerformanceMonitor();

/**
 * Performance testing utilities
 */
export const performanceUtils = {
    monitor: tooltipPerformanceMonitor,
    benchmark: {
        positioning: benchmarkTooltipPositioning,
        collision: benchmarkCollisionDetection,
    },
    optimize: {
        throttle,
        debounce,
        rafThrottle: requestAnimationFrameThrottle,
    },
    observe: {
        render: createRenderPerformanceObserver,
    },
};