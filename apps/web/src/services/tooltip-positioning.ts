/**
 * Advanced tooltip positioning service
 * 
 * Task 4.1.2: Implement tooltip positioning system
 * - Smart positioning to avoid viewport edges
 * - Handle tooltip collisions with other UI elements
 * - Optimize tooltip performance
 * - Validates: Requirement 4.1
 */

export interface TooltipDimensions {
    width: number;
    height: number;
}

export interface ViewportInfo {
    width: number;
    height: number;
    scrollX: number;
    scrollY: number;
}

export interface TooltipPosition {
    x: number;
    y: number;
    placement: 'top' | 'bottom' | 'left' | 'right';
    adjustedX?: number;
    adjustedY?: number;
}

export interface CollisionRect {
    x: number;
    y: number;
    width: number;
    height: number;
    id?: string;
}

export interface PositioningOptions {
    offset: number;
    padding: number;
    preferredPlacement?: 'top' | 'bottom' | 'left' | 'right';
    allowFlip: boolean;
    avoidCollisions: boolean;
    collisionElements?: CollisionRect[];
    maxWidth?: number;
    maxHeight?: number;
}

/**
 * Default positioning options
 */
const DEFAULT_OPTIONS: PositioningOptions = {
    offset: 12,
    padding: 20,
    preferredPlacement: 'bottom',
    allowFlip: true,
    avoidCollisions: true,
    collisionElements: [],
};

/**
 * Get current viewport information
 */
export function getViewportInfo(): ViewportInfo {
    return {
        width: window.innerWidth,
        height: window.innerHeight,
        scrollX: window.scrollX,
        scrollY: window.scrollY,
    };
}

/**
 * Check if a rectangle is within viewport bounds
 */
export function isWithinViewport(
    rect: CollisionRect,
    viewport: ViewportInfo,
    padding: number = 0
): boolean {
    return (
        rect.x >= padding &&
        rect.y >= padding &&
        rect.x + rect.width <= viewport.width - padding &&
        rect.y + rect.height <= viewport.height - padding
    );
}

/**
 * Check if two rectangles collide
 */
export function checkCollision(rect1: CollisionRect, rect2: CollisionRect): boolean {
    return !(
        rect1.x + rect1.width < rect2.x ||
        rect2.x + rect2.width < rect1.x ||
        rect1.y + rect1.height < rect2.y ||
        rect2.y + rect2.height < rect1.y
    );
}

/**
 * Calculate tooltip position for a specific placement
 */
function calculatePositionForPlacement(
    mouseX: number,
    mouseY: number,
    tooltipDimensions: TooltipDimensions,
    placement: 'top' | 'bottom' | 'left' | 'right',
    offset: number
): { x: number; y: number } {
    switch (placement) {
        case 'top':
            return {
                x: mouseX - tooltipDimensions.width / 2,
                y: mouseY - tooltipDimensions.height - offset,
            };
        case 'bottom':
            return {
                x: mouseX - tooltipDimensions.width / 2,
                y: mouseY + offset,
            };
        case 'left':
            return {
                x: mouseX - tooltipDimensions.width - offset,
                y: mouseY - tooltipDimensions.height / 2,
            };
        case 'right':
            return {
                x: mouseX + offset,
                y: mouseY - tooltipDimensions.height / 2,
            };
    }
}

/**
 * Get all possible placements in order of preference
 */
function getPlacementOrder(preferredPlacement: 'top' | 'bottom' | 'left' | 'right'): Array<'top' | 'bottom' | 'left' | 'right'> {
    const placements: Array<'top' | 'bottom' | 'left' | 'right'> = ['top', 'bottom', 'left', 'right'];

    // Move preferred placement to front
    const filtered = placements.filter(p => p !== preferredPlacement);
    return [preferredPlacement, ...filtered];
}

/**
 * Adjust position to avoid viewport edges
 */
function adjustForViewport(
    position: { x: number; y: number },
    tooltipDimensions: TooltipDimensions,
    viewport: ViewportInfo,
    padding: number
): { x: number; y: number; adjustedX?: number; adjustedY?: number } {
    let { x, y } = position;
    let adjustedX: number | undefined;
    let adjustedY: number | undefined;

    // Adjust horizontal position
    if (x < padding) {
        adjustedX = x;
        x = padding;
    } else if (x + tooltipDimensions.width > viewport.width - padding) {
        adjustedX = x;
        x = viewport.width - tooltipDimensions.width - padding;
    }

    // Adjust vertical position
    if (y < padding) {
        adjustedY = y;
        y = padding;
    } else if (y + tooltipDimensions.height > viewport.height - padding) {
        adjustedY = y;
        y = viewport.height - tooltipDimensions.height - padding;
    }

    return { x, y, adjustedX, adjustedY };
}

/**
 * Check if position collides with any collision elements
 */
function hasCollisions(
    position: { x: number; y: number },
    tooltipDimensions: TooltipDimensions,
    collisionElements: CollisionRect[]
): boolean {
    const tooltipRect: CollisionRect = {
        x: position.x,
        y: position.y,
        width: tooltipDimensions.width,
        height: tooltipDimensions.height,
    };

    return collisionElements.some(element => checkCollision(tooltipRect, element));
}

/**
 * Find the best position that avoids collisions
 */
function findCollisionFreePosition(
    mouseX: number,
    mouseY: number,
    tooltipDimensions: TooltipDimensions,
    viewport: ViewportInfo,
    options: PositioningOptions
): TooltipPosition {
    const placements = getPlacementOrder(options.preferredPlacement || 'bottom');

    for (const placement of placements) {
        const position = calculatePositionForPlacement(
            mouseX,
            mouseY,
            tooltipDimensions,
            placement,
            options.offset
        );

        const adjusted = adjustForViewport(position, tooltipDimensions, viewport, options.padding);

        // Check if this position is within viewport
        const tooltipRect: CollisionRect = {
            x: adjusted.x,
            y: adjusted.y,
            width: tooltipDimensions.width,
            height: tooltipDimensions.height,
        };

        if (isWithinViewport(tooltipRect, viewport, options.padding)) {
            // Check for collisions if collision avoidance is enabled
            if (options.avoidCollisions && options.collisionElements) {
                if (!hasCollisions(adjusted, tooltipDimensions, options.collisionElements)) {
                    return {
                        x: adjusted.x,
                        y: adjusted.y,
                        placement,
                        adjustedX: adjusted.adjustedX,
                        adjustedY: adjusted.adjustedY,
                    };
                }
            } else {
                return {
                    x: adjusted.x,
                    y: adjusted.y,
                    placement,
                    adjustedX: adjusted.adjustedX,
                    adjustedY: adjusted.adjustedY,
                };
            }
        }
    }

    // Fallback: use preferred placement with viewport adjustment
    const fallbackPosition = calculatePositionForPlacement(
        mouseX,
        mouseY,
        tooltipDimensions,
        options.preferredPlacement || 'bottom',
        options.offset
    );

    const adjusted = adjustForViewport(fallbackPosition, tooltipDimensions, viewport, options.padding);

    return {
        x: adjusted.x,
        y: adjusted.y,
        placement: options.preferredPlacement || 'bottom',
        adjustedX: adjusted.adjustedX,
        adjustedY: adjusted.adjustedY,
    };
}

/**
 * Calculate optimal tooltip position with smart collision detection
 */
export function calculateTooltipPosition(
    mouseX: number,
    mouseY: number,
    tooltipDimensions: TooltipDimensions,
    options: Partial<PositioningOptions> = {}
): TooltipPosition {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
    const viewport = getViewportInfo();

    // Apply max dimensions if specified
    const adjustedDimensions = {
        width: mergedOptions.maxWidth
            ? Math.min(tooltipDimensions.width, mergedOptions.maxWidth)
            : tooltipDimensions.width,
        height: mergedOptions.maxHeight
            ? Math.min(tooltipDimensions.height, mergedOptions.maxHeight)
            : tooltipDimensions.height,
    };

    return findCollisionFreePosition(
        mouseX,
        mouseY,
        adjustedDimensions,
        viewport,
        mergedOptions
    );
}

/**
 * Performance-optimized position calculator with caching
 */
export class TooltipPositionManager {
    private cache = new Map<string, TooltipPosition>();
    private cacheTimeout = 100; // Cache for 100ms
    private lastCleanup = 0;

    /**
     * Get cache key for position calculation
     */
    private getCacheKey(
        mouseX: number,
        mouseY: number,
        tooltipDimensions: TooltipDimensions,
        options: PositioningOptions
    ): string {
        // Round mouse position to reduce cache misses for small movements
        const roundedX = Math.round(mouseX / 10) * 10;
        const roundedY = Math.round(mouseY / 10) * 10;

        return `${roundedX},${roundedY},${tooltipDimensions.width},${tooltipDimensions.height},${options.preferredPlacement}`;
    }

    /**
     * Clean up expired cache entries
     */
    private cleanupCache(): void {
        const now = Date.now();
        if (now - this.lastCleanup > 1000) { // Cleanup every second
            this.cache.clear();
            this.lastCleanup = now;
        }
    }

    /**
     * Calculate position with caching for performance
     */
    calculatePosition(
        mouseX: number,
        mouseY: number,
        tooltipDimensions: TooltipDimensions,
        options: Partial<PositioningOptions> = {}
    ): TooltipPosition {
        const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
        const cacheKey = this.getCacheKey(mouseX, mouseY, tooltipDimensions, mergedOptions);

        // Check cache first
        const cached = this.cache.get(cacheKey);
        if (cached) {
            return cached;
        }

        // Calculate new position
        const position = calculateTooltipPosition(mouseX, mouseY, tooltipDimensions, mergedOptions);

        // Cache the result
        this.cache.set(cacheKey, position);

        // Cleanup old entries periodically
        this.cleanupCache();

        return position;
    }

    /**
     * Clear the position cache
     */
    clearCache(): void {
        this.cache.clear();
    }

    /**
     * Get cache statistics for debugging
     */
    getCacheStats(): { size: number; maxSize: number } {
        return {
            size: this.cache.size,
            maxSize: 100, // Arbitrary max size for monitoring
        };
    }
}

/**
 * Global position manager instance
 */
export const tooltipPositionManager = new TooltipPositionManager();

/**
 * Utility function to get collision elements from DOM
 */
export function getCollisionElementsFromDOM(selectors: string[] = []): CollisionRect[] {
    const defaultSelectors = [
        '.tooltip',
        '.popover',
        '.dropdown-menu',
        '.modal',
        '.sidebar',
        '.header',
        '.footer',
    ];

    const allSelectors = [...defaultSelectors, ...selectors];
    const elements: CollisionRect[] = [];

    allSelectors.forEach(selector => {
        const domElements = document.querySelectorAll(selector);
        domElements.forEach((element, index) => {
            const rect = element.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
                elements.push({
                    x: rect.left,
                    y: rect.top,
                    width: rect.width,
                    height: rect.height,
                    id: `${selector}-${index}`,
                });
            }
        });
    });

    return elements;
}

/**
 * Debounced position calculation for performance
 */
export function createDebouncedPositionCalculator(
    delay: number = 16 // ~60fps
): (
    mouseX: number,
    mouseY: number,
    tooltipDimensions: TooltipDimensions,
    options?: Partial<PositioningOptions>
) => Promise<TooltipPosition> {
    let timeoutId: NodeJS.Timeout | null = null;

    return (mouseX, mouseY, tooltipDimensions, options = {}) => {
        return new Promise<TooltipPosition>((resolve) => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            timeoutId = setTimeout(() => {
                const position = tooltipPositionManager.calculatePosition(
                    mouseX,
                    mouseY,
                    tooltipDimensions,
                    options
                );
                resolve(position);
            }, delay);
        });
    };
}