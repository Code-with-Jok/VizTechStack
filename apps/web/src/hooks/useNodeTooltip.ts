'use client';

/**
 * Hook for managing node tooltip state and positioning with collision detection
 * Provides optimized hover detection and performance-friendly tooltip management
 * 
 * Task 4.1.2: Implement tooltip positioning system
 * - Smart positioning to avoid viewport edges
 * - Handle tooltip collisions
 * - Optimize tooltip performance
 * - Validates: Requirement 4.1
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import type { NodeData } from '@viztechstack/roadmap-visualization';
import { useTooltipCollisionDetection } from './useTooltipCollisionDetection';
import type { TooltipDimensions } from '../services/tooltip-positioning';

interface TooltipState {
    isVisible: boolean;
    nodeData: NodeData | null;
    mousePosition: { x: number; y: number };
    tooltipId: string | null;
}

interface UseNodeTooltipOptions {
    showDelay?: number;
    hideDelay?: number;
    enabled?: boolean;
    maxTooltips?: number;
    collisionSelectors?: string[];
    maxWidth?: number;
    maxHeight?: number;
    priority?: number;
}

export function useNodeTooltip(options: UseNodeTooltipOptions = {}) {
    const {
        showDelay = 300,
        hideDelay = 100,
        enabled = true,
        maxTooltips = 3,
        collisionSelectors = [],
        maxWidth = 320,
        maxHeight = 400,
        priority = 0
    } = options;

    const [tooltipState, setTooltipState] = useState<TooltipState>({
        isVisible: false,
        nodeData: null,
        mousePosition: { x: 0, y: 0 },
        tooltipId: null
    });

    const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const currentNodeRef = useRef<string | null>(null);
    const tooltipIdCounterRef = useRef(0);

    // Initialize collision detection system
    const collisionDetection = useTooltipCollisionDetection({
        enabled,
        maxTooltips,
        collisionSelectors,
        positioningOptions: {
            maxWidth,
            maxHeight,
            preferredPlacement: 'bottom',
            allowFlip: true,
            avoidCollisions: true,
        }
    });

    // Memoize default tooltip dimensions
    const defaultDimensions = useMemo<TooltipDimensions>(() => ({
        width: maxWidth,
        height: maxHeight
    }), [maxWidth, maxHeight]);

    // Clear all timeouts
    const clearTimeouts = useCallback(() => {
        if (showTimeoutRef.current) {
            clearTimeout(showTimeoutRef.current);
            showTimeoutRef.current = null;
        }
        if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current);
            hideTimeoutRef.current = null;
        }
    }, []);

    // Generate unique tooltip ID
    const generateTooltipId = useCallback(() => {
        return `tooltip-${Date.now()}-${++tooltipIdCounterRef.current}`;
    }, []);

    // Show tooltip with delay and collision detection
    const showTooltip = useCallback((
        nodeData: NodeData,
        mouseX: number,
        mouseY: number,
        nodeId?: string
    ) => {
        if (!enabled) return;

        clearTimeouts();
        currentNodeRef.current = nodeId || null;

        showTimeoutRef.current = setTimeout(() => {
            const tooltipId = generateTooltipId();

            // Register tooltip with collision detection system
            const position = collisionDetection.registerTooltip(
                tooltipId,
                mouseX,
                mouseY,
                defaultDimensions,
                priority
            );

            setTooltipState({
                isVisible: true,
                nodeData,
                mousePosition: { x: mouseX, y: mouseY },
                tooltipId
            });
        }, showDelay);
    }, [enabled, showDelay, clearTimeouts, generateTooltipId, collisionDetection, defaultDimensions, priority]);

    // Hide tooltip with delay
    const hideTooltip = useCallback((nodeId?: string) => {
        if (!enabled) return;

        // Only hide if we're leaving the same node we're showing tooltip for
        if (nodeId && currentNodeRef.current && nodeId !== currentNodeRef.current) {
            return;
        }

        clearTimeouts();

        hideTimeoutRef.current = setTimeout(() => {
            setTooltipState(prev => {
                // Unregister from collision detection system
                if (prev.tooltipId) {
                    collisionDetection.unregisterTooltip(prev.tooltipId);
                }

                return {
                    ...prev,
                    isVisible: false,
                    tooltipId: null
                };
            });
            currentNodeRef.current = null;
        }, hideDelay);
    }, [enabled, hideDelay, clearTimeouts, collisionDetection]);

    // Update mouse position for visible tooltip with collision detection
    const updateMousePosition = useCallback((mouseX: number, mouseY: number) => {
        if (tooltipState.isVisible && tooltipState.tooltipId) {
            // Update position through collision detection system
            const newPosition = collisionDetection.updateTooltipPosition(
                tooltipState.tooltipId,
                mouseX,
                mouseY
            );

            if (newPosition) {
                setTooltipState(prev => ({
                    ...prev,
                    mousePosition: { x: mouseX, y: mouseY }
                }));
            }
        }
    }, [tooltipState.isVisible, tooltipState.tooltipId, collisionDetection]);

    // Force hide tooltip immediately
    const forceHide = useCallback(() => {
        clearTimeouts();

        setTooltipState(prev => {
            // Unregister from collision detection system
            if (prev.tooltipId) {
                collisionDetection.unregisterTooltip(prev.tooltipId);
            }

            return {
                isVisible: false,
                nodeData: null,
                mousePosition: { x: 0, y: 0 },
                tooltipId: null
            };
        });

        currentNodeRef.current = null;
    }, [clearTimeouts, collisionDetection]);

    // Get collision statistics for debugging
    const getCollisionStats = useCallback(() => {
        return collisionDetection.getCollisionStats();
    }, [collisionDetection]);

    // Clear all tooltips managed by collision detection
    const clearAllTooltips = useCallback(() => {
        collisionDetection.clearAllTooltips();
        forceHide();
    }, [collisionDetection, forceHide]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            clearTimeouts();
            if (tooltipState.tooltipId) {
                collisionDetection.unregisterTooltip(tooltipState.tooltipId);
            }
        };
    }, [clearTimeouts, tooltipState.tooltipId, collisionDetection]);

    return {
        tooltipState,
        showTooltip,
        hideTooltip,
        updateMousePosition,
        forceHide,
        clearAllTooltips,
        getCollisionStats,
        isEnabled: enabled,
        activeTooltipCount: collisionDetection.activeTooltipCount,
        collisionElements: collisionDetection.collisionElements,
    };
}