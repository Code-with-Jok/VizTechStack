/**
 * Tests for tooltip positioning service
 * 
 * Task 4.1.2: Implement tooltip positioning system
 * - Test smart positioning algorithms
 * - Test collision detection
 * - Test performance optimizations
 * - Validates: Requirement 4.1
 */

import {
    calculateTooltipPosition,
    getViewportInfo,
    isWithinViewport,
    checkCollision,
    getCollisionElementsFromDOM,
    TooltipPositionManager,
    tooltipPositionManager,
    createDebouncedPositionCalculator,
    type TooltipDimensions,
    type ViewportInfo,
    type CollisionRect,
    type PositioningOptions,
} from '../tooltip-positioning';

// Mock window dimensions
const mockViewport: ViewportInfo = {
    width: 1024,
    height: 768,
    scrollX: 0,
    scrollY: 0,
};

// Mock window object
Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: mockViewport.width,
});

Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: mockViewport.height,
});

Object.defineProperty(window, 'scrollX', {
    writable: true,
    configurable: true,
    value: mockViewport.scrollX,
});

Object.defineProperty(window, 'scrollY', {
    writable: true,
    configurable: true,
    value: mockViewport.scrollY,
});

describe('tooltip-positioning', () => {
    const defaultDimensions: TooltipDimensions = {
        width: 300,
        height: 200,
    };

    describe('getViewportInfo', () => {
        it('returns current viewport information', () => {
            const viewport = getViewportInfo();

            expect(viewport).toEqual(mockViewport);
        });
    });

    describe('isWithinViewport', () => {
        it('returns true for rect within viewport', () => {
            const rect: CollisionRect = {
                x: 100,
                y: 100,
                width: 200,
                height: 150,
            };

            expect(isWithinViewport(rect, mockViewport)).toBe(true);
        });

        it('returns false for rect outside viewport', () => {
            const rect: CollisionRect = {
                x: 1000,
                y: 100,
                width: 200,
                height: 150,
            };

            expect(isWithinViewport(rect, mockViewport)).toBe(false);
        });

        it('respects padding parameter', () => {
            const rect: CollisionRect = {
                x: 10,
                y: 10,
                width: 200,
                height: 150,
            };

            expect(isWithinViewport(rect, mockViewport, 5)).toBe(true);
            expect(isWithinViewport(rect, mockViewport, 15)).toBe(false);
        });
    });
});
describe('checkCollision', () => {
    it('detects collision between overlapping rects', () => {
        const rect1: CollisionRect = {
            x: 100,
            y: 100,
            width: 200,
            height: 150,
        };

        const rect2: CollisionRect = {
            x: 150,
            y: 120,
            width: 100,
            height: 100,
        };

        expect(checkCollision(rect1, rect2)).toBe(true);
    });

    it('returns false for non-overlapping rects', () => {
        const rect1: CollisionRect = {
            x: 100,
            y: 100,
            width: 200,
            height: 150,
        };

        const rect2: CollisionRect = {
            x: 400,
            y: 300,
            width: 100,
            height: 100,
        };

        expect(checkCollision(rect1, rect2)).toBe(false);
    });

    it('handles edge-touching rects correctly', () => {
        const rect1: CollisionRect = {
            x: 100,
            y: 100,
            width: 200,
            height: 150,
        };

        const rect2: CollisionRect = {
            x: 300,
            y: 100,
            width: 100,
            height: 100,
        };

        expect(checkCollision(rect1, rect2)).toBe(false);
    });
});

describe('calculateTooltipPosition', () => {
    it('calculates basic bottom placement', () => {
        const position = calculateTooltipPosition(
            500,
            300,
            defaultDimensions
        );

        expect(position.placement).toBe('bottom');
        expect(position.x).toBeCloseTo(350); // mouseX - width/2
        expect(position.y).toBeCloseTo(312); // mouseY + offset
    });

    it('flips to top when bottom would overflow', () => {
        const position = calculateTooltipPosition(
            500,
            700, // Near bottom of viewport
            defaultDimensions
        );

        expect(position.placement).toBe('top');
        expect(position.y).toBeLessThan(700);
    });

    it('flips to left when right would overflow', () => {
        const position = calculateTooltipPosition(
            900, // Near right edge
            300,
            defaultDimensions
        );

        expect(position.placement).toBe('left');
        expect(position.x).toBeLessThan(900);
    });

    it('respects preferred placement when possible', () => {
        const position = calculateTooltipPosition(
            500,
            300,
            defaultDimensions,
            { preferredPlacement: 'top' }
        );

        expect(position.placement).toBe('top');
    });

    it('avoids collision elements', () => {
        const collisionElement: CollisionRect = {
            x: 350,
            y: 312,
            width: 300,
            height: 200,
        };

        const position = calculateTooltipPosition(
            500,
            300,
            defaultDimensions,
            {
                avoidCollisions: true,
                collisionElements: [collisionElement],
            }
        );

        // Should choose a different placement to avoid collision
        expect(position.placement).not.toBe('bottom');
    });

    it('applies max dimensions', () => {
        const largeDimensions: TooltipDimensions = {
            width: 500,
            height: 400,
        };

        const position = calculateTooltipPosition(
            500,
            300,
            largeDimensions,
            {
                maxWidth: 300,
                maxHeight: 200,
            }
        );

        // Position should be calculated with constrained dimensions
        expect(position.x).toBeCloseTo(350); // 500 - 300/2
    });
});

describe('TooltipPositionManager', () => {
    let manager: TooltipPositionManager;

    beforeEach(() => {
        manager = new TooltipPositionManager();
    });

    it('caches position calculations', () => {
        const position1 = manager.calculatePosition(
            500,
            300,
            defaultDimensions
        );

        const position2 = manager.calculatePosition(
            500,
            300,
            defaultDimensions
        );

        expect(position1).toEqual(position2);
        expect(manager.getCacheStats().size).toBeGreaterThan(0);
    });

    it('returns different positions for different inputs', () => {
        const position1 = manager.calculatePosition(
            500,
            300,
            defaultDimensions
        );

        const position2 = manager.calculatePosition(
            600,
            400,
            defaultDimensions
        );

        expect(position1).not.toEqual(position2);
    });

    it('clears cache when requested', () => {
        manager.calculatePosition(500, 300, defaultDimensions);
        expect(manager.getCacheStats().size).toBeGreaterThan(0);

        manager.clearCache();
        expect(manager.getCacheStats().size).toBe(0);
    });

    it('provides cache statistics', () => {
        const stats = manager.getCacheStats();

        expect(stats).toHaveProperty('size');
        expect(stats).toHaveProperty('maxSize');
        expect(typeof stats.size).toBe('number');
        expect(typeof stats.maxSize).toBe('number');
    });
});

describe('createDebouncedPositionCalculator', () => {
    jest.useFakeTimers();

    afterEach(() => {
        jest.clearAllTimers();
    });

    it('debounces position calculations', async () => {
        const calculator = createDebouncedPositionCalculator(100);

        const promise1 = calculator(500, 300, defaultDimensions);
        const promise2 = calculator(510, 310, defaultDimensions);

        // Fast-forward time
        jest.advanceTimersByTime(100);

        const position = await promise2;
        expect(position).toBeDefined();
        expect(position.x).toBeCloseTo(360); // 510 - 300/2
    });

    it('cancels previous calculations', async () => {
        const calculator = createDebouncedPositionCalculator(100);

        const promise1 = calculator(500, 300, defaultDimensions);
        const promise2 = calculator(600, 400, defaultDimensions);

        // Only advance time for the second calculation
        jest.advanceTimersByTime(100);

        const position = await promise2;
        expect(position.x).toBeCloseTo(450); // 600 - 300/2
    });
});

describe('getCollisionElementsFromDOM', () => {
    beforeEach(() => {
        // Clear document body
        document.body.innerHTML = '';
    });

    it('finds elements by default selectors', () => {
        // Create mock elements
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.style.width = '200px';
        tooltip.style.height = '100px';
        document.body.appendChild(tooltip);

        // Mock getBoundingClientRect
        jest.spyOn(tooltip, 'getBoundingClientRect').mockReturnValue({
            left: 100,
            top: 50,
            width: 200,
            height: 100,
            right: 300,
            bottom: 150,
            x: 100,
            y: 50,
            toJSON: () => ({}),
        });

        const elements = getCollisionElementsFromDOM();

        expect(elements).toHaveLength(1);
        expect(elements[0]).toEqual({
            x: 100,
            y: 50,
            width: 200,
            height: 100,
            id: '.tooltip-0',
        });
    });

    it('includes custom selectors', () => {
        const customElement = document.createElement('div');
        customElement.className = 'custom-element';
        customElement.style.width = '150px';
        customElement.style.height = '75px';
        document.body.appendChild(customElement);

        jest.spyOn(customElement, 'getBoundingClientRect').mockReturnValue({
            left: 200,
            top: 100,
            width: 150,
            height: 75,
            right: 350,
            bottom: 175,
            x: 200,
            y: 100,
            toJSON: () => ({}),
        });

        const elements = getCollisionElementsFromDOM(['.custom-element']);

        expect(elements.length).toBeGreaterThan(0);
        expect(elements.some(el => el.id?.includes('custom-element'))).toBe(true);
    });

    it('ignores elements with zero dimensions', () => {
        const hiddenElement = document.createElement('div');
        hiddenElement.className = 'tooltip';
        document.body.appendChild(hiddenElement);

        jest.spyOn(hiddenElement, 'getBoundingClientRect').mockReturnValue({
            left: 0,
            top: 0,
            width: 0,
            height: 0,
            right: 0,
            bottom: 0,
            x: 0,
            y: 0,
            toJSON: () => ({}),
        });

        const elements = getCollisionElementsFromDOM();

        expect(elements).toHaveLength(0);
    });
});

describe('global tooltipPositionManager', () => {
    it('provides a global instance', () => {
        expect(tooltipPositionManager).toBeInstanceOf(TooltipPositionManager);
    });

    it('maintains state across calls', () => {
        tooltipPositionManager.clearCache();
        expect(tooltipPositionManager.getCacheStats().size).toBe(0);

        tooltipPositionManager.calculatePosition(500, 300, defaultDimensions);
        expect(tooltipPositionManager.getCacheStats().size).toBeGreaterThan(0);
    });
});
});