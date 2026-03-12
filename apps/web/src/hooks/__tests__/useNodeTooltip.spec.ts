/**
 * Tests for useNodeTooltip hook
 * 
 * Task 4.1.2: Implement tooltip positioning system
 * - Test enhanced tooltip state management
 * - Test collision detection integration
 * - Test performance optimizations
 * - Validates: Requirement 4.1
 */

import { renderHook, act } from '@testing-library/react';
import { useNodeTooltip } from '../useNodeTooltip';
import type { NodeData } from '@viztechstack/roadmap-visualization';

// Mock the collision detection system
const mockCollisionDetection = {
    registerTooltip: jest.fn(() => ({
        x: 100,
        y: 200,
        placement: 'bottom' as const,
    })),
    unregisterTooltip: jest.fn(),
    updateTooltipPosition: jest.fn(() => ({
        x: 150,
        y: 250,
        placement: 'bottom' as const,
    })),
    clearAllTooltips: jest.fn(),
    getCollisionStats: jest.fn(() => ({
        activeTooltips: 0,
        collisionElements: 0,
        lastUpdate: Date.now(),
        cacheStats: { size: 0, maxSize: 100 },
    })),
    activeTooltipCount: 0,
    collisionElements: [],
    isEnabled: true,
};

jest.mock('../useTooltipCollisionDetection', () => ({
    useTooltipCollisionDetection: jest.fn(() => mockCollisionDetection),
}));

const mockNodeData: NodeData = {
    label: 'Test Node',
    description: 'Test description',
    level: 1,
    section: 'Test Section'
};

// Mock timers
jest.useFakeTimers();

describe('useNodeTooltip', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    afterEach(() => {
        jest.clearAllTimers();
    });

    it('initializes with correct default state', () => {
        const { result } = renderHook(() => useNodeTooltip());

        expect(result.current.tooltipState.isVisible).toBe(false);
        expect(result.current.tooltipState.nodeData).toBe(null);
        expect(result.current.tooltipState.mousePosition).toEqual({ x: 0, y: 0 });
        expect(result.current.tooltipState.tooltipId).toBe(null);
        expect(result.current.isEnabled).toBe(true);
    });

    it('shows tooltip after delay with collision detection', () => {
        const { result } = renderHook(() => useNodeTooltip({ showDelay: 300 }));

        act(() => {
            result.current.showTooltip(mockNodeData, 100, 200);
        });

        // Should not be visible immediately
        expect(result.current.tooltipState.isVisible).toBe(false);

        // Fast-forward time
        act(() => {
            jest.advanceTimersByTime(300);
        });

        // Should be visible after delay and register with collision detection
        expect(result.current.tooltipState.isVisible).toBe(true);
        expect(result.current.tooltipState.nodeData).toBe(mockNodeData);
        expect(result.current.tooltipState.mousePosition).toEqual({ x: 100, y: 200 });
        expect(mockCollisionDetection.registerTooltip).toHaveBeenCalled();
    });

    it('hides tooltip after delay and unregisters from collision detection', () => {
        const { result } = renderHook(() => useNodeTooltip({ hideDelay: 100 }));

        // First show the tooltip
        act(() => {
            result.current.showTooltip(mockNodeData, 100, 200);
            jest.advanceTimersByTime(300);
        });

        expect(result.current.tooltipState.isVisible).toBe(true);

        // Then hide it
        act(() => {
            result.current.hideTooltip();
        });

        // Should still be visible immediately
        expect(result.current.tooltipState.isVisible).toBe(true);

        // Fast-forward time
        act(() => {
            jest.advanceTimersByTime(100);
        });

        // Should be hidden after delay and unregister from collision detection
        expect(result.current.tooltipState.isVisible).toBe(false);
        expect(mockCollisionDetection.unregisterTooltip).toHaveBeenCalled();
    });

    it('updates mouse position through collision detection', () => {
        const { result } = renderHook(() => useNodeTooltip());

        // Show tooltip first
        act(() => {
            result.current.showTooltip(mockNodeData, 100, 200);
            jest.advanceTimersByTime(300);
        });

        expect(result.current.tooltipState.isVisible).toBe(true);

        // Update position
        act(() => {
            result.current.updateMousePosition(150, 250);
        });

        expect(result.current.tooltipState.mousePosition).toEqual({ x: 150, y: 250 });
        expect(mockCollisionDetection.updateTooltipPosition).toHaveBeenCalled();
    });

    it('force hides tooltip immediately and cleans up collision detection', () => {
        const { result } = renderHook(() => useNodeTooltip());

        // Show tooltip
        act(() => {
            result.current.showTooltip(mockNodeData, 100, 200);
            jest.advanceTimersByTime(300);
        });

        expect(result.current.tooltipState.isVisible).toBe(true);

        // Force hide
        act(() => {
            result.current.forceHide();
        });

        // Should be hidden immediately
        expect(result.current.tooltipState.isVisible).toBe(false);
        expect(result.current.tooltipState.nodeData).toBe(null);
        expect(result.current.tooltipState.tooltipId).toBe(null);
        expect(mockCollisionDetection.unregisterTooltip).toHaveBeenCalled();
    });

    it('respects enabled option', () => {
        const { result } = renderHook(() => useNodeTooltip({ enabled: false }));

        expect(result.current.isEnabled).toBe(false);

        act(() => {
            result.current.showTooltip(mockNodeData, 100, 200);
            jest.advanceTimersByTime(300);
        });

        // Should not show when disabled
        expect(result.current.tooltipState.isVisible).toBe(false);
    });

    it('provides collision statistics', () => {
        const { result } = renderHook(() => useNodeTooltip());

        const stats = result.current.getCollisionStats();

        expect(stats).toHaveProperty('activeTooltips');
        expect(stats).toHaveProperty('collisionElements');
        expect(stats).toHaveProperty('cacheStats');
        expect(mockCollisionDetection.getCollisionStats).toHaveBeenCalled();
    });

    it('clears all tooltips', () => {
        const { result } = renderHook(() => useNodeTooltip());

        act(() => {
            result.current.clearAllTooltips();
        });

        expect(mockCollisionDetection.clearAllTooltips).toHaveBeenCalled();
    });

    it('handles node-specific hiding', () => {
        const { result } = renderHook(() => useNodeTooltip());

        // Show tooltip for node1
        act(() => {
            result.current.showTooltip(mockNodeData, 100, 200, 'node1');
            jest.advanceTimersByTime(300);
        });

        expect(result.current.tooltipState.isVisible).toBe(true);

        // Try to hide with different node ID
        act(() => {
            result.current.hideTooltip('node2');
            jest.advanceTimersByTime(100);
        });

        // Should still be visible
        expect(result.current.tooltipState.isVisible).toBe(true);

        // Hide with correct node ID
        act(() => {
            result.current.hideTooltip('node1');
            jest.advanceTimersByTime(100);
        });

        // Should be hidden
        expect(result.current.tooltipState.isVisible).toBe(false);
    });

    it('uses custom configuration options', () => {
        const { result } = renderHook(() => useNodeTooltip({
            showDelay: 500,
            hideDelay: 200,
            maxTooltips: 5,
            maxWidth: 400,
            maxHeight: 300,
            priority: 10,
        }));

        // Show tooltip
        act(() => {
            result.current.showTooltip(mockNodeData, 100, 200);
        });

        // Should not be visible after default delay
        act(() => {
            jest.advanceTimersByTime(300);
        });
        expect(result.current.tooltipState.isVisible).toBe(false);

        // Should be visible after custom delay
        act(() => {
            jest.advanceTimersByTime(200);
        });
        expect(result.current.tooltipState.isVisible).toBe(true);
    });

    it('provides active tooltip count and collision elements', () => {
        const { result } = renderHook(() => useNodeTooltip());

        expect(result.current.activeTooltipCount).toBe(0);
        expect(result.current.collisionElements).toEqual([]);
    });

    it('cancels show timeout when hiding', () => {
        const { result } = renderHook(() => useNodeTooltip({ showDelay: 300, hideDelay: 100 }));

        act(() => {
            result.current.showTooltip(mockNodeData, 100, 200);
        });

        // Hide before show delay completes
        act(() => {
            result.current.hideTooltip();
            jest.advanceTimersByTime(100);
        });

        // Should not be visible
        expect(result.current.tooltipState.isVisible).toBe(false);

        // Complete the original show delay
        act(() => {
            jest.advanceTimersByTime(300);
        });

        // Should still not be visible
        expect(result.current.tooltipState.isVisible).toBe(false);
    });

    it('cancels hide timeout when showing again', () => {
        const { result } = renderHook(() => useNodeTooltip({ showDelay: 100, hideDelay: 300 }));

        // Show tooltip
        act(() => {
            result.current.showTooltip(mockNodeData, 100, 200);
            jest.advanceTimersByTime(100);
        });

        expect(result.current.tooltipState.isVisible).toBe(true);

        // Start hiding
        act(() => {
            result.current.hideTooltip();
        });

        // Show again before hide delay completes
        act(() => {
            result.current.showTooltip(mockNodeData, 150, 250);
            jest.advanceTimersByTime(100);
        });

        // Should still be visible with updated position
        expect(result.current.tooltipState.isVisible).toBe(true);
        expect(result.current.tooltipState.mousePosition).toEqual({ x: 150, y: 250 });

        // Complete the original hide delay
        act(() => {
            jest.advanceTimersByTime(300);
        });

        // Should still be visible
        expect(result.current.tooltipState.isVisible).toBe(true);
    });
});