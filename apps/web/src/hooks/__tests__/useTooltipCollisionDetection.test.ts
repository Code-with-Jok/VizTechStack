/**
 * Tests for useTooltipCollisionDetection hook
 * 
 * Task 4.1.2: Implement tooltip positioning system
 * - Test collision detection functionality
 * - Test multiple tooltip management
 * - Test performance optimizations
 * - Validates: Requirement 4.1
 */

import { renderHook, act } from '@testing-library/react';
import { useTooltipCollisionDetection, useTooltipPositioning } from '../useTooltipCollisionDetection';
import type { TooltipDimensions } from '../../services/tooltip-positioning';

// Mock the positioning service
jest.mock('../../services/tooltip-positioning', () => ({
    getCollisionElementsFromDOM: jest.fn(() => []),
    tooltipPositionManager: {
        calculatePosition: jest.fn((mouseX, mouseY, dimensions) => ({
            x: mouseX + 12,
            y: mouseY + 12,
            placement: 'bottom' as const,
        })),
        getCacheStats: jest.fn(() => ({ size: 0, maxSize: 100 })),
        clearCache: jest.fn(),
    },
}));

// Mock MutationObserver
const mockMutationObserver = jest.fn();
mockMutationObserver.prototype.observe = jest.fn();
mockMutationObserver.prototype.disconnect = jest.fn();
global.MutationObserver = mockMutationObserver;

const defaultDimensions: TooltipDimensions = {
    width: 300,
    height: 200,
};

describe('useTooltipCollisionDetection', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Reset window dimensions
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 1024,
        });
        Object.defineProperty(window, 'innerHeight', {
            writable: true,
            configurable: true,
            value: 768,
        });
    });

    it('initializes with correct default state', () => {
        const { result } = renderHook(() => useTooltipCollisionDetection());

        expect(result.current.activeTooltipCount).toBe(0);
        expect(result.current.collisionElements).toEqual([]);
        expect(result.current.isEnabled).toBe(true);
    });

    it('registers tooltip and returns position', () => {
        const { result } = renderHook(() => useTooltipCollisionDetection());

        let position;
        act(() => {
            position = result.current.registerTooltip(
                'test-tooltip',
                500,
                300,
                defaultDimensions,
                1
            );
        });

        expect(position).toEqual({
            x: 512,
            y: 312,
            placement: 'bottom',
        });
        expect(result.current.activeTooltipCount).toBe(1);
    });

    it('unregisters tooltip correctly', () => {
        const { result } = renderHook(() => useTooltipCollisionDetection());

        act(() => {
            result.current.registerTooltip('test-tooltip', 500, 300, defaultDimensions);
        });

        expect(result.current.activeTooltipCount).toBe(1);

        act(() => {
            result.current.unregisterTooltip('test-tooltip');
        });

        expect(result.current.activeTooltipCount).toBe(0);
    });

    it('updates tooltip position', () => {
        const { result } = renderHook(() => useTooltipCollisionDetection());

        act(() => {
            result.current.registerTooltip('test-tooltip', 500, 300, defaultDimensions);
        });

        let newPosition;
        act(() => {
            newPosition = result.current.updateTooltipPosition('test-tooltip', 600, 400);
        });

        expect(newPosition).toEqual({
            x: 612,
            y: 412,
            placement: 'bottom',
        });
    });

    it('limits number of active tooltips', () => {
        const { result } = renderHook(() =>
            useTooltipCollisionDetection({ maxTooltips: 2 })
        );

        act(() => {
            result.current.registerTooltip('tooltip-1', 100, 100, defaultDimensions, 1);
            result.current.registerTooltip('tooltip-2', 200, 200, defaultDimensions, 2);
            result.current.registerTooltip('tooltip-3', 300, 300, defaultDimensions, 3);
        });

        expect(result.current.activeTooltipCount).toBe(2);
    });

    it('removes lowest priority tooltip when limit exceeded', () => {
        const { result } = renderHook(() =>
            useTooltipCollisionDetection({ maxTooltips: 2 })
        );

        act(() => {
            result.current.registerTooltip('low-priority', 100, 100, defaultDimensions, 1);
            result.current.registerTooltip('high-priority', 200, 200, defaultDimensions, 10);
            result.current.registerTooltip('medium-priority', 300, 300, defaultDimensions, 5);
        });

        const activeTooltips = result.current.getActiveTooltips();
        expect(activeTooltips).toHaveLength(2);
        expect(activeTooltips.some(t => t.id === 'low-priority')).toBe(false);
        expect(activeTooltips.some(t => t.id === 'high-priority')).toBe(true);
        expect(activeTooltips.some(t => t.id === 'medium-priority')).toBe(true);
    });

    it('clears all tooltips', () => {
        const { result } = renderHook(() => useTooltipCollisionDetection());

        act(() => {
            result.current.registerTooltip('tooltip-1', 100, 100, defaultDimensions);
            result.current.registerTooltip('tooltip-2', 200, 200, defaultDimensions);
        });

        expect(result.current.activeTooltipCount).toBe(2);

        act(() => {
            result.current.clearAllTooltips();
        });

        expect(result.current.activeTooltipCount).toBe(0);
    });

    it('provides collision statistics', () => {
        const { result } = renderHook(() => useTooltipCollisionDetection());

        act(() => {
            result.current.registerTooltip('test-tooltip', 500, 300, defaultDimensions);
        });

        const stats = result.current.getCollisionStats();

        expect(stats).toHaveProperty('activeTooltips');
        expect(stats).toHaveProperty('collisionElements');
        expect(stats).toHaveProperty('lastUpdate');
        expect(stats).toHaveProperty('cacheStats');
        expect(stats.activeTooltips).toBe(1);
    });

    it('respects enabled option', () => {
        const { result } = renderHook(() =>
            useTooltipCollisionDetection({ enabled: false })
        );

        expect(result.current.isEnabled).toBe(false);

        let position;
        act(() => {
            position = result.current.registerTooltip('test-tooltip', 500, 300, defaultDimensions);
        });

        // Should return basic position without collision detection
        expect(position).toEqual({
            x: 512,
            y: 312,
            placement: 'bottom',
        });
    });

    it('handles window resize events', () => {
        const { result } = renderHook(() => useTooltipCollisionDetection());

        act(() => {
            result.current.registerTooltip('test-tooltip', 500, 300, defaultDimensions);
        });

        // Simulate window resize
        act(() => {
            Object.defineProperty(window, 'innerWidth', { value: 800 });
            Object.defineProperty(window, 'innerHeight', { value: 600 });
            window.dispatchEvent(new Event('resize'));
        });

        // Should update collision elements
        expect(result.current.collisionElements).toBeDefined();
    });

    it('sets up mutation observer for DOM changes', () => {
        renderHook(() => useTooltipCollisionDetection());

        expect(mockMutationObserver).toHaveBeenCalled();
        expect(mockMutationObserver.prototype.observe).toHaveBeenCalledWith(
            document.body,
            {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['class', 'style'],
            }
        );
    });

    it('cleans up on unmount', () => {
        const { unmount } = renderHook(() => useTooltipCollisionDetection());

        unmount();

        expect(mockMutationObserver.prototype.disconnect).toHaveBeenCalled();
    });
});

describe('useTooltipPositioning', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('provides simplified interface for single tooltip', () => {
        const { result } = renderHook(() => useTooltipPositioning());

        let position;
        act(() => {
            position = result.current.calculatePosition(500, 300, defaultDimensions);
        });

        expect(position).toEqual({
            x: 512,
            y: 312,
            placement: 'bottom',
        });
        expect(result.current.isEnabled).toBe(true);
    });

    it('updates position correctly', () => {
        const { result } = renderHook(() => useTooltipPositioning());

        act(() => {
            result.current.calculatePosition(500, 300, defaultDimensions);
        });

        let newPosition;
        act(() => {
            newPosition = result.current.updatePosition(600, 400);
        });

        expect(newPosition).toEqual({
            x: 612,
            y: 412,
            placement: 'bottom',
        });
    });

    it('cleans up tooltip', () => {
        const { result } = renderHook(() => useTooltipPositioning());

        act(() => {
            result.current.calculatePosition(500, 300, defaultDimensions);
            result.current.cleanup();
        });

        // Should not throw any errors
        expect(result.current.isEnabled).toBe(true);
    });

    it('provides statistics', () => {
        const { result } = renderHook(() => useTooltipPositioning());

        const stats = result.current.getStats();

        expect(stats).toHaveProperty('activeTooltips');
        expect(stats).toHaveProperty('collisionElements');
        expect(stats).toHaveProperty('cacheStats');
    });

    it('respects custom options', () => {
        const { result } = renderHook(() =>
            useTooltipPositioning({
                enabled: false,
                collisionSelectors: ['.custom-element'],
            })
        );

        expect(result.current.isEnabled).toBe(false);
    });
});