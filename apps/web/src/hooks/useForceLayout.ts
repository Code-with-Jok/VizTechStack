'use client';

/**
 * Hook for managing force-directed layout state and controls
 * 
 * Validates: Requirement 3.2
 */

import { useState, useCallback, useMemo } from 'react';
import type { GraphData } from '@viztechstack/roadmap-visualization';

export interface ForceDirectedLayoutOptions {
    width: number;
    height: number;
    centerStrength: number;
    linkStrength: number;
    linkDistance: number;
    chargeStrength: number;
    collisionRadius: number;
    alphaDecay: number;
    velocityDecay: number;
    iterations: number;
    enableCollision: boolean;
    enableCentering: boolean;
    strengthByType: {
        dependency: number;
        progression: number;
        related: number;
        optional: number;
    };
}

interface UseForceLayoutProps {
    initialOptions?: Partial<ForceDirectedLayoutOptions>;
    graphData?: GraphData;
}

interface UseForceLayoutReturn {
    options: ForceDirectedLayoutOptions;
    updateOptions: (newOptions: Partial<ForceDirectedLayoutOptions>) => void;
    resetOptions: () => void;
    manualPositioning: boolean;
    setManualPositioning: (enabled: boolean) => void;
    simulationSpeed: number;
    setSimulationSpeed: (speed: number) => void;
}

const DEFAULT_OPTIONS: ForceDirectedLayoutOptions = {
    width: 1200,
    height: 800,
    centerStrength: 0.1,
    linkStrength: 0.3,
    linkDistance: 100,
    chargeStrength: -300,
    collisionRadius: 40,
    alphaDecay: 0.02,
    velocityDecay: 0.4,
    iterations: 300,
    enableCollision: true,
    enableCentering: true,
    strengthByType: {
        dependency: 0.8,
        progression: 0.6,
        related: 0.3,
        optional: 0.2
    }
};
export function useForceLayout({
    initialOptions = {},
    graphData
}: UseForceLayoutProps = {}): UseForceLayoutReturn {
    // Merge initial options with defaults
    const [options, setOptions] = useState<ForceDirectedLayoutOptions>(() => ({
        ...DEFAULT_OPTIONS,
        ...initialOptions
    }));

    // Manual positioning mode
    const [manualPositioning, setManualPositioning] = useState(false);

    // Simulation speed multiplier (affects iterations and alpha decay)
    const [simulationSpeed, setSimulationSpeed] = useState(1);

    // Update layout options
    const updateOptions = useCallback((newOptions: Partial<ForceDirectedLayoutOptions>) => {
        setOptions(prev => ({ ...prev, ...newOptions }));
    }, []);

    // Reset options to defaults
    const resetOptions = useCallback(() => {
        setOptions({ ...DEFAULT_OPTIONS, ...initialOptions });
        setManualPositioning(false);
        setSimulationSpeed(1);
    }, [initialOptions]);

    return {
        options,
        updateOptions,
        resetOptions,
        manualPositioning,
        setManualPositioning,
        simulationSpeed,
        setSimulationSpeed,
    };
}