/**
 * Utility functions for roadmap visualization
 */

import type { RoadmapNode, Position } from '../types';

/**
 * Generate a unique ID for nodes or edges
 * 
 * @param prefix - Prefix for the ID
 * @returns Unique ID string
 */
export function generateId(prefix: string = 'item'): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Calculate distance between two positions
 * 
 * @param pos1 - First position
 * @param pos2 - Second position
 * @returns Euclidean distance
 */
export function calculateDistance(pos1: Position, pos2: Position): number {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Check if two nodes overlap
 * 
 * @param node1 - First node
 * @param node2 - Second node
 * @param nodeWidth - Width of nodes (default: 200)
 * @param nodeHeight - Height of nodes (default: 80)
 * @returns true if nodes overlap
 */
export function nodesOverlap(
    node1: RoadmapNode,
    node2: RoadmapNode,
    nodeWidth: number = 200,
    nodeHeight: number = 80
): boolean {
    const dx = Math.abs(node1.position.x - node2.position.x);
    const dy = Math.abs(node1.position.y - node2.position.y);

    return dx < nodeWidth && dy < nodeHeight;
}

/**
 * Group nodes by level
 * 
 * @param nodes - Array of nodes
 * @returns Map of level to nodes
 */
export function groupNodesByLevel(nodes: RoadmapNode[]): Map<number, RoadmapNode[]> {
    const groups = new Map<number, RoadmapNode[]>();

    for (const node of nodes) {
        const level = node.data.level;
        if (!groups.has(level)) {
            groups.set(level, []);
        }
        groups.get(level)!.push(node);
    }

    return groups;
}

/**
 * Calculate bounding box for a set of nodes
 * 
 * @param nodes - Array of nodes
 * @returns Bounding box { minX, minY, maxX, maxY }
 */
export function calculateBoundingBox(nodes: RoadmapNode[]): {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
} {
    if (nodes.length === 0) {
        return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const node of nodes) {
        minX = Math.min(minX, node.position.x);
        minY = Math.min(minY, node.position.y);
        maxX = Math.max(maxX, node.position.x);
        maxY = Math.max(maxY, node.position.y);
    }

    return { minX, minY, maxX, maxY };
}

/**
 * Normalize node positions to fit within a viewport
 * 
 * @param nodes - Array of nodes
 * @param viewportWidth - Viewport width
 * @param viewportHeight - Viewport height
 * @param padding - Padding around edges
 * @returns Normalized nodes
 */
export function normalizeNodePositions(
    nodes: RoadmapNode[],
    viewportWidth: number,
    viewportHeight: number,
    padding: number = 50
): RoadmapNode[] {
    const bbox = calculateBoundingBox(nodes);
    const graphWidth = bbox.maxX - bbox.minX;
    const graphHeight = bbox.maxY - bbox.minY;

    const availableWidth = viewportWidth - 2 * padding;
    const availableHeight = viewportHeight - 2 * padding;

    const scaleX = graphWidth > 0 ? availableWidth / graphWidth : 1;
    const scaleY = graphHeight > 0 ? availableHeight / graphHeight : 1;
    const scale = Math.min(scaleX, scaleY, 1); // Don't scale up

    return nodes.map(node => ({
        ...node,
        position: {
            x: (node.position.x - bbox.minX) * scale + padding,
            y: (node.position.y - bbox.minY) * scale + padding,
        },
    }));
}

/**
 * Format time duration for display
 * 
 * @param time - Time string (e.g., "2 hours", "3 weeks")
 * @returns Formatted time string
 */
export function formatTime(time: string | undefined): string {
    if (!time) {
        return 'N/A';
    }
    return time;
}

/**
 * Get difficulty color class
 * 
 * @param difficulty - Difficulty level
 * @returns Tailwind color class
 */
export function getDifficultyColor(difficulty: 'beginner' | 'intermediate' | 'advanced' | undefined): string {
    switch (difficulty) {
        case 'beginner':
            return 'text-success-600 bg-success-50 border-success-200';
        case 'intermediate':
            return 'text-warning-600 bg-warning-50 border-warning-200';
        case 'advanced':
            return 'text-error-600 bg-error-50 border-error-200';
        default:
            return 'text-neutral-600 bg-neutral-50 border-neutral-200';
    }
}

/**
 * Debounce function for performance optimization
 * 
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            timeout = null;
            func(...args);
        };

        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function for performance optimization
 * 
 * @param func - Function to throttle
 * @param limit - Time limit in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle: boolean = false;

    return function executedFunction(...args: Parameters<T>) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => {
                inThrottle = false;
            }, limit);
        }
    };
}
