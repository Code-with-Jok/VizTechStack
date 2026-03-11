/**
 * Node metadata utilities and helpers
 */

import type { NodeData, DifficultyLevel } from '../types';

/**
 * Metadata summary for a node
 */
export interface NodeMetadataSummary {
    hasDifficulty: boolean;
    hasEstimatedTime: boolean;
    hasPrerequisites: boolean;
    prerequisiteCount: number;
    isComplete: boolean;
}

/**
 * Difficulty level information
 */
export interface DifficultyInfo {
    level: DifficultyLevel;
    displayName: string;
    color: string;
    icon: string;
    order: number;
}

/**
 * Time estimate information
 */
export interface TimeEstimate {
    raw: string;
    min: number;
    max?: number;
    unit: 'hours' | 'days' | 'weeks' | 'months';
    displayText: string;
}

/**
 * Get metadata summary for a node
 * 
 * @param nodeData - Node data to analyze
 * @returns Metadata summary
 */
export function getNodeMetadataSummary(nodeData: NodeData): NodeMetadataSummary {
    return {
        hasDifficulty: !!nodeData.difficulty,
        hasEstimatedTime: !!nodeData.estimatedTime,
        hasPrerequisites: !!nodeData.prerequisites && nodeData.prerequisites.length > 0,
        prerequisiteCount: nodeData.prerequisites?.length || 0,
        isComplete: nodeData.completed || false,
    };
}

/**
 * Get difficulty level information
 * 
 * @param difficulty - Difficulty level
 * @returns Difficulty information with display properties
 */
export function getDifficultyInfo(difficulty: DifficultyLevel): DifficultyInfo {
    const difficultyMap: Record<DifficultyLevel, DifficultyInfo> = {
        beginner: {
            level: 'beginner',
            displayName: 'Beginner',
            color: '#10B981', // Green
            icon: '🟢',
            order: 1,
        },
        intermediate: {
            level: 'intermediate',
            displayName: 'Intermediate',
            color: '#F59E0B', // Orange
            icon: '🟡',
            order: 2,
        },
        advanced: {
            level: 'advanced',
            displayName: 'Advanced',
            color: '#EF4444', // Red
            icon: '🔴',
            order: 3,
        },
    };

    return difficultyMap[difficulty];
}

/**
 * Parse estimated time string into structured data
 * 
 * @param estimatedTime - Time estimate string (e.g., "2-4 weeks", "3 months")
 * @returns Parsed time estimate or null if invalid
 */
export function parseEstimatedTime(estimatedTime: string): TimeEstimate | null {
    const pattern = /^(\d+)(?:-(\d+))?\s*(weeks?|months?|days?|hours?)$/i;
    const match = estimatedTime.match(pattern);

    if (!match) {
        return null;
    }

    const min = parseInt(match[1], 10);
    const max = match[2] ? parseInt(match[2], 10) : undefined;
    const unitRaw = match[3].toLowerCase();

    // Normalize unit
    let unit: TimeEstimate['unit'];
    if (unitRaw.startsWith('hour')) {
        unit = 'hours';
    } else if (unitRaw.startsWith('day')) {
        unit = 'days';
    } else if (unitRaw.startsWith('week')) {
        unit = 'weeks';
    } else {
        unit = 'months';
    }

    // Generate display text
    const displayText = max ? `${min}-${max} ${unit}` : `${min} ${unit}`;

    return {
        raw: estimatedTime,
        min,
        max,
        unit,
        displayText,
    };
}

/**
 * Format estimated time for display
 * 
 * @param estimatedTime - Time estimate string
 * @returns Formatted display string
 */
export function formatEstimatedTime(estimatedTime: string): string {
    const parsed = parseEstimatedTime(estimatedTime);
    return parsed ? parsed.displayText : estimatedTime;
}

/**
 * Compare difficulty levels
 * 
 * @param a - First difficulty level
 * @param b - Second difficulty level
 * @returns Negative if a < b, positive if a > b, 0 if equal
 */
export function compareDifficulty(a: DifficultyLevel, b: DifficultyLevel): number {
    const infoA = getDifficultyInfo(a);
    const infoB = getDifficultyInfo(b);
    return infoA.order - infoB.order;
}

/**
 * Check if node has complete metadata
 * 
 * @param nodeData - Node data to check
 * @returns True if node has all recommended metadata
 */
export function hasCompleteMetadata(nodeData: NodeData): boolean {
    return !!(
        nodeData.label &&
        nodeData.description &&
        nodeData.difficulty &&
        nodeData.estimatedTime &&
        nodeData.section
    );
}

/**
 * Get missing metadata fields
 * 
 * @param nodeData - Node data to check
 * @returns Array of missing field names
 */
export function getMissingMetadata(nodeData: NodeData): string[] {
    const missing: string[] = [];

    if (!nodeData.label) missing.push('label');
    if (!nodeData.description) missing.push('description');
    if (!nodeData.difficulty) missing.push('difficulty');
    if (!nodeData.estimatedTime) missing.push('estimatedTime');
    if (!nodeData.section) missing.push('section');

    return missing;
}

/**
 * Calculate total estimated time for multiple nodes
 * 
 * @param nodes - Array of node data
 * @returns Total time in hours, or null if cannot calculate
 */
export function calculateTotalTime(nodes: NodeData[]): number | null {
    let totalHours = 0;
    let hasInvalidTime = false;

    for (const node of nodes) {
        if (!node.estimatedTime) {
            continue;
        }

        const parsed = parseEstimatedTime(node.estimatedTime);
        if (!parsed) {
            hasInvalidTime = true;
            continue;
        }

        // Use average if range, otherwise use min
        const value = parsed.max ? (parsed.min + parsed.max) / 2 : parsed.min;

        // Convert to hours
        let hours: number;
        switch (parsed.unit) {
            case 'hours':
                hours = value;
                break;
            case 'days':
                hours = value * 8; // Assume 8 hours per day
                break;
            case 'weeks':
                hours = value * 40; // Assume 40 hours per week
                break;
            case 'months':
                hours = value * 160; // Assume 160 hours per month (4 weeks)
                break;
        }

        totalHours += hours;
    }

    return hasInvalidTime ? null : totalHours;
}

/**
 * Format total hours into human-readable string
 * 
 * @param hours - Total hours
 * @returns Formatted string (e.g., "2 weeks", "3 months")
 */
export function formatTotalTime(hours: number): string {
    if (hours < 8) {
        return `${Math.round(hours)} hours`;
    } else if (hours < 40) {
        const days = Math.round(hours / 8);
        return `${days} ${days === 1 ? 'day' : 'days'}`;
    } else if (hours < 160) {
        const weeks = Math.round(hours / 40);
        return `${weeks} ${weeks === 1 ? 'week' : 'weeks'}`;
    } else {
        const months = Math.round(hours / 160);
        return `${months} ${months === 1 ? 'month' : 'months'}`;
    }
}

/**
 * Get prerequisite chain for a node
 * 
 * @param nodeId - Node ID to get prerequisites for
 * @param allNodes - Map of all nodes by ID
 * @returns Array of prerequisite node IDs in order
 */
export function getPrerequisiteChain(
    nodeId: string,
    allNodes: Map<string, NodeData>
): string[] {
    const chain: string[] = [];
    const visited = new Set<string>();

    function traverse(id: string) {
        if (visited.has(id)) {
            return; // Prevent circular dependencies
        }

        visited.add(id);
        const node = allNodes.get(id);

        if (node?.prerequisites) {
            for (const prereqId of node.prerequisites) {
                traverse(prereqId);
                if (!chain.includes(prereqId)) {
                    chain.push(prereqId);
                }
            }
        }
    }

    traverse(nodeId);
    return chain;
}

/**
 * Check if node is ready (all prerequisites completed)
 * 
 * @param nodeData - Node to check
 * @param completedNodeIds - Set of completed node IDs
 * @returns True if all prerequisites are completed
 */
export function isNodeReady(
    nodeData: NodeData,
    completedNodeIds: Set<string>
): boolean {
    if (!nodeData.prerequisites || nodeData.prerequisites.length === 0) {
        return true;
    }

    return nodeData.prerequisites.every(prereqId => completedNodeIds.has(prereqId));
}

/**
 * Get nodes by difficulty level
 * 
 * @param nodes - Array of node data
 * @param difficulty - Difficulty level to filter by
 * @returns Filtered nodes
 */
export function getNodesByDifficulty(
    nodes: NodeData[],
    difficulty: DifficultyLevel
): NodeData[] {
    return nodes.filter(node => node.difficulty === difficulty);
}

/**
 * Sort nodes by difficulty
 * 
 * @param nodes - Array of node data
 * @param ascending - Sort order (default: true)
 * @returns Sorted nodes
 */
export function sortNodesByDifficulty(
    nodes: NodeData[],
    ascending: boolean = true
): NodeData[] {
    return [...nodes].sort((a, b) => {
        if (!a.difficulty && !b.difficulty) return 0;
        if (!a.difficulty) return ascending ? 1 : -1;
        if (!b.difficulty) return ascending ? -1 : 1;

        const comparison = compareDifficulty(a.difficulty, b.difficulty);
        return ascending ? comparison : -comparison;
    });
}
