/**
 * Hook for tooltip collision detection and management
 * 
 * Task 4.1.2: Implement tooltip positioning system
 * - Handle tooltip collisions with other UI elements
 * - Support multiple tooltip instances
 * - Performance optimized collision detection
 * - Validates: Requirement 4.1
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
    getCollisionElementsFromDOM,
    tooltipPositionManager,
    type CollisionRect,
    type TooltipDimensions,
    type PositioningOptions,
    type TooltipPosition,
} from '../services/tooltip-positioning';

interface TooltipInstance {
    id: string;
    position: TooltipPosition;
    dimensions: TooltipDimensions;
    mousePosition: { x: number; y: number };
    priority: number;
    timestamp: number;
}

interface UseTooltipCollisionDetectionOptions {
    enabled?: boolean;
    updateInterval?: number;
    maxTooltips?: number;
    collisionSelectors?: string[];
    positioningOptions?: Partial<PositioningOptions>;
}

interface TooltipCollisionState {
    activeTooltips: Map<string, TooltipInstance>;
    collisionElements: CollisionRect[];
    lastUpdate: number;
}

/**
 * Hook for managing tooltip collision detection and positioning
 */
export function useTooltipCollisionDetection(
    options: UseTooltipCollisionDetectionOptions = {}
) {
    const {
        enabled = true,
        updateInterval = 100,
        maxTooltips = 5,
        collisionSelectors = [],
        positioningOptions = {},
    } = options;

    const [state, setState] = useState<TooltipCollisionState>({
        activeTooltips: new Map(),
        collisionElements: [],
        lastUpdate: 0,
    });

    const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const observerRef = useRef<MutationObserver | null>(null);

    /**
     * Update collision elements from DOM
     */
    const updateCollisionElements = useCallback(() => {
        if (!enabled) return;

        const elements = getCollisionElementsFromDOM(collisionSelectors);
        const now = Date.now();

        setState(prev => ({
            ...prev,
            collisionElements: elements,
            lastUpdate: now,
        }));
    }, [enabled, collisionSelectors]);

    /**
     * Register a new tooltip instance
     */
    const registerTooltip = useCallback((
        id: string,
        mouseX: number,
        mouseY: number,
        dimensions: TooltipDimensions,
        priority: number = 0
    ): TooltipPosition => {
        if (!enabled) {
            return {
                x: mouseX + 12,
                y: mouseY + 12,
                placement: 'bottom',
            };
        }

        const now = Date.now();

        // Get current collision elements including other tooltips
        const otherTooltips = Array.from(state.activeTooltips.values())
            .filter(tooltip => tooltip.id !== id)
            .map(tooltip => ({
                x: tooltip.position.x,
                y: tooltip.position.y,
                width: tooltip.dimensions.width,
                height: tooltip.dimensions.height,
                id: tooltip.id,
            }));

        const allCollisionElements = [
            ...state.collisionElements,
            ...otherTooltips,
        ];

        // Calculate optimal position
        const position = tooltipPositionManager.calculatePosition(
            mouseX,
            mouseY,
            dimensions,
            {
                ...positioningOptions,
                collisionElements: allCollisionElements,
                avoidCollisions: true,
            }
        );

        // Create tooltip instance
        const instance: TooltipInstance = {
            id,
            position,
            dimensions,
            mousePosition: { x: mouseX, y: mouseY },
            priority,
            timestamp: now,
        };

        // Update state with new tooltip
        setState(prev => {
            const newTooltips = new Map(prev.activeTooltips);
            newTooltips.set(id, instance);

            // Limit number of active tooltips
            if (newTooltips.size > maxTooltips) {
                // Remove oldest tooltip with lowest priority
                let oldestId: string | null = null;
                let oldestTimestamp = Infinity;
                let lowestPriority = Infinity;

                for (const [tooltipId, tooltip] of newTooltips) {
                    if (tooltip.priority < lowestPriority ||
                        (tooltip.priority === lowestPriority && tooltip.timestamp < oldestTimestamp)) {
                        oldestId = tooltipId;
                        oldestTimestamp = tooltip.timestamp;
                        lowestPriority = tooltip.priority;
                    }
                }

                if (oldestId) {
                    newTooltips.delete(oldestId);
                }
            }

            return {
                ...prev,
                activeTooltips: newTooltips,
            };
        });

        return position;
    }, [enabled, state.activeTooltips, state.collisionElements, maxTooltips, positioningOptions]);

    /**
     * Unregister a tooltip instance
     */
    const unregisterTooltip = useCallback((id: string) => {
        setState(prev => {
            const newTooltips = new Map(prev.activeTooltips);
            newTooltips.delete(id);

            return {
                ...prev,
                activeTooltips: newTooltips,
            };
        });
    }, []);

    /**
     * Update tooltip position
     */
    const updateTooltipPosition = useCallback((
        id: string,
        mouseX: number,
        mouseY: number
    ): TooltipPosition | null => {
        const tooltip = state.activeTooltips.get(id);
        if (!tooltip || !enabled) return null;

        // Get collision elements excluding this tooltip
        const otherTooltips = Array.from(state.activeTooltips.values())
            .filter(t => t.id !== id)
            .map(t => ({
                x: t.position.x,
                y: t.position.y,
                width: t.dimensions.width,
                height: t.dimensions.height,
                id: t.id,
            }));

        const allCollisionElements = [
            ...state.collisionElements,
            ...otherTooltips,
        ];

        // Calculate new position
        const position = tooltipPositionManager.calculatePosition(
            mouseX,
            mouseY,
            tooltip.dimensions,
            {
                ...positioningOptions,
                collisionElements: allCollisionElements,
                avoidCollisions: true,
            }
        );

        // Update tooltip instance
        const updatedInstance: TooltipInstance = {
            ...tooltip,
            position,
            mousePosition: { x: mouseX, y: mouseY },
            timestamp: Date.now(),
        };

        setState(prev => {
            const newTooltips = new Map(prev.activeTooltips);
            newTooltips.set(id, updatedInstance);

            return {
                ...prev,
                activeTooltips: newTooltips,
            };
        });

        return position;
    }, [enabled, state.activeTooltips, state.collisionElements, positioningOptions]);

    /**
     * Get all active tooltip positions for debugging
     */
    const getActiveTooltips = useCallback(() => {
        return Array.from(state.activeTooltips.values());
    }, [state.activeTooltips]);

    /**
     * Clear all tooltips
     */
    const clearAllTooltips = useCallback(() => {
        setState(prev => ({
            ...prev,
            activeTooltips: new Map(),
        }));
    }, []);

    /**
     * Get collision statistics
     */
    const getCollisionStats = useCallback(() => {
        return {
            activeTooltips: state.activeTooltips.size,
            collisionElements: state.collisionElements.length,
            lastUpdate: state.lastUpdate,
            cacheStats: tooltipPositionManager.getCacheStats(),
        };
    }, [state]);

    // Setup DOM mutation observer for dynamic collision detection
    useEffect(() => {
        if (!enabled) return;

        // Initial update
        updateCollisionElements();

        // Setup mutation observer to detect DOM changes
        observerRef.current = new MutationObserver(() => {
            // Debounce updates
            if (updateTimeoutRef.current) {
                clearTimeout(updateTimeoutRef.current);
            }

            updateTimeoutRef.current = setTimeout(() => {
                updateCollisionElements();
            }, updateInterval);
        });

        // Observe document changes
        observerRef.current.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'style'],
        });

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
            if (updateTimeoutRef.current) {
                clearTimeout(updateTimeoutRef.current);
            }
        };
    }, [enabled, updateCollisionElements, updateInterval]);

    // Setup window resize handler
    useEffect(() => {
        if (!enabled) return;

        const handleResize = () => {
            updateCollisionElements();
            // Clear position cache on resize
            tooltipPositionManager.clearCache();
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [enabled, updateCollisionElements]);

    // Setup scroll handler
    useEffect(() => {
        if (!enabled) return;

        const handleScroll = () => {
            updateCollisionElements();
        };

        // Throttle scroll updates
        let scrollTimeout: NodeJS.Timeout | null = null;
        const throttledScroll = () => {
            if (scrollTimeout) return;

            scrollTimeout = setTimeout(() => {
                handleScroll();
                scrollTimeout = null;
            }, 50);
        };

        window.addEventListener('scroll', throttledScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', throttledScroll);
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
            }
        };
    }, [enabled, updateCollisionElements]);

    return {
        registerTooltip,
        unregisterTooltip,
        updateTooltipPosition,
        getActiveTooltips,
        clearAllTooltips,
        getCollisionStats,
        collisionElements: state.collisionElements,
        activeTooltipCount: state.activeTooltips.size,
        isEnabled: enabled,
    };
}

/**
 * Simplified hook for single tooltip collision detection
 */
export function useTooltipPositioning(
    options: Omit<UseTooltipCollisionDetectionOptions, 'maxTooltips'> = {}
) {
    const collision = useTooltipCollisionDetection({ ...options, maxTooltips: 1 });

    const calculatePosition = useCallback((
        mouseX: number,
        mouseY: number,
        dimensions: TooltipDimensions,
        tooltipId: string = 'default'
    ) => {
        return collision.registerTooltip(tooltipId, mouseX, mouseY, dimensions);
    }, [collision]);

    const updatePosition = useCallback((
        mouseX: number,
        mouseY: number,
        tooltipId: string = 'default'
    ) => {
        return collision.updateTooltipPosition(tooltipId, mouseX, mouseY);
    }, [collision]);

    const cleanup = useCallback((tooltipId: string = 'default') => {
        collision.unregisterTooltip(tooltipId);
    }, [collision]);

    return {
        calculatePosition,
        updatePosition,
        cleanup,
        collisionElements: collision.collisionElements,
        isEnabled: collision.isEnabled,
        getStats: collision.getCollisionStats,
    };
}