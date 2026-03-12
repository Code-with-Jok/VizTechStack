'use client';

/**
 * Hook for managing hierarchical layout state and controls
 * 
 * Validates: Requirement 3.1
 */

import { useState, useCallback, useMemo } from 'react';
import type { HierarchicalLayoutOptions, GraphData } from '@viztechstack/roadmap-visualization';

interface UseHierarchicalLayoutProps {
    initialOptions?: Partial<HierarchicalLayoutOptions>;
    graphData?: GraphData;
}

interface UseHierarchicalLayoutReturn {
    options: HierarchicalLayoutOptions;
    collapsedLevels: Set<number>;
    totalLevels: number;
    updateOptions: (newOptions: Partial<HierarchicalLayoutOptions>) => void;
    collapseLevel: (level: number) => void;
    expandLevel: (level: number) => void;
    collapseAll: () => void;
    expandAll: () => void;
    resetOptions: () => void;
}

const DEFAULT_OPTIONS: HierarchicalLayoutOptions = {
    direction: 'TB',
    nodeWidth: 200,
    nodeHeight: 80,
    nodeSep: 50,
    edgeSep: 10,
    rankSep: 100,
    marginX: 20,
    marginY: 20,
    align: 'UL',
    ranker: 'network-simplex'
};

export function useHierarchicalLayout({
    initialOptions = {},
    graphData
}: UseHierarchicalLayoutProps = {}): UseHierarchicalLayoutReturn {
    // Merge initial options with defaults
    const [options, setOptions] = useState<HierarchicalLayoutOptions>(() => ({
        ...DEFAULT_OPTIONS,
        ...initialOptions
    }));

    // Track collapsed levels
    const [collapsedLevels, setCollapsedLevels] = useState<Set<number>>(new Set());

    // Calculate total levels from graph data
    const totalLevels = useMemo(() => {
        if (!graphData?.nodes) return 0;

        const levels = new Set(graphData.nodes.map(node => node.data.level || 0));
        return levels.size;
    }, [graphData]);

    // Update layout options
    const updateOptions = useCallback((newOptions: Partial<HierarchicalLayoutOptions>) => {
        setOptions(prev => ({ ...prev, ...newOptions }));
    }, []);

    // Collapse a specific level
    const collapseLevel = useCallback((level: number) => {
        setCollapsedLevels(prev => new Set([...prev, level]));
    }, []);

    // Expand a specific level
    const expandLevel = useCallback((level: number) => {
        setCollapsedLevels(prev => {
            const newSet = new Set(prev);
            newSet.delete(level);
            return newSet;
        });
    }, []);

    // Collapse all levels
    const collapseAll = useCallback(() => {
        const allLevels = Array.from({ length: totalLevels }, (_, i) => i);
        setCollapsedLevels(new Set(allLevels));
    }, [totalLevels]);

    // Expand all levels
    const expandAll = useCallback(() => {
        setCollapsedLevels(new Set());
    }, []);

    // Reset options to defaults
    const resetOptions = useCallback(() => {
        setOptions({ ...DEFAULT_OPTIONS, ...initialOptions });
        setCollapsedLevels(new Set());
    }, [initialOptions]);

    return {
        options,
        collapsedLevels,
        totalLevels,
        updateOptions,
        collapseLevel,
        expandLevel,
        collapseAll,
        expandAll,
        resetOptions,
    };
}