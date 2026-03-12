'use client';

/**
 * useCircularLayout Hook
 * Manages circular layout state and options
 * 
 * Validates: Requirement 3.3
 */

import { useState, useCallback, useMemo } from 'react';
import type { CircularLayoutOptions } from '@viztechstack/roadmap-visualization';

export interface CircularLayoutState {
    options: CircularLayoutOptions;
    isAnimating: boolean;
    rotationSpeed: number;
    sectorHighlight: {
        enabled: boolean;
        startAngle: number;
        endAngle: number;
        color: string;
    };
}

export interface UseCircularLayoutReturn {
    options: CircularLayoutOptions;
    updateOptions: (newOptions: Partial<CircularLayoutOptions>) => void;
    resetOptions: () => void;
    isAnimating: boolean;
    setIsAnimating: (animating: boolean) => void;
    rotationSpeed: number;
    setRotationSpeed: (speed: number) => void;
    sectorHighlight: CircularLayoutState['sectorHighlight'];
    updateSectorHighlight: (highlight: Partial<CircularLayoutState['sectorHighlight']>) => void;
    toggleSectorHighlight: () => void;
    rotateTo: (angle: number) => void;
    adjustRadius: (inner: number, outer: number) => void;
}

const DEFAULT_OPTIONS: CircularLayoutOptions = {
    width: 1200,
    height: 800,
    centerX: 600,
    centerY: 400,
    innerRadius: 100,
    outerRadius: 350,
    startAngle: 0,
    endAngle: 2 * Math.PI,
    levelSpacing: 80,
    angularSpacing: 0.1,
    enableOptimization: true,
    sortByLevel: true,
    preventOverlaps: true,
    minNodeSpacing: 40
};

const DEFAULT_SECTOR_HIGHLIGHT = {
    enabled: false,
    startAngle: 0,
    endAngle: Math.PI / 2,
    color: '#3b82f6'
};

export function useCircularLayout(
    initialOptions: Partial<CircularLayoutOptions> = {}
): UseCircularLayoutReturn {
    // Initialize options with defaults
    const [options, setOptions] = useState<CircularLayoutOptions>(() => ({
        ...DEFAULT_OPTIONS,
        ...initialOptions
    }));

    const [isAnimating, setIsAnimating] = useState(false);
    const [rotationSpeed, setRotationSpeed] = useState(1);
    const [sectorHighlight, setSectorHighlight] = useState(DEFAULT_SECTOR_HIGHLIGHT);

    // Update options with validation
    const updateOptions = useCallback((newOptions: Partial<CircularLayoutOptions>) => {
        setOptions(prev => {
            const updated = { ...prev, ...newOptions };

            // Validate radius constraints
            if (updated.innerRadius >= updated.outerRadius) {
                console.warn('Inner radius must be less than outer radius');
                return prev;
            }

            // Validate angle constraints
            if (updated.startAngle >= updated.endAngle) {
                console.warn('Start angle must be less than end angle');
                return prev;
            }

            // Validate dimensions
            if (updated.width <= 0 || updated.height <= 0) {
                console.warn('Width and height must be positive');
                return prev;
            }

            return updated;
        });
    }, []);

    // Reset to default options
    const resetOptions = useCallback(() => {
        setOptions({ ...DEFAULT_OPTIONS, ...initialOptions });
        setSectorHighlight(DEFAULT_SECTOR_HIGHLIGHT);
        setRotationSpeed(1);
        setIsAnimating(false);
    }, [initialOptions]);

    // Update sector highlight
    const updateSectorHighlight = useCallback((
        highlight: Partial<CircularLayoutState['sectorHighlight']>
    ) => {
        setSectorHighlight(prev => ({ ...prev, ...highlight }));
    }, []);

    // Toggle sector highlight
    const toggleSectorHighlight = useCallback(() => {
        setSectorHighlight(prev => ({ ...prev, enabled: !prev.enabled }));
    }, []);

    // Rotate to specific angle
    const rotateTo = useCallback((angle: number) => {
        const normalizedAngle = angle % (2 * Math.PI);
        const rotation = normalizedAngle - options.startAngle;

        updateOptions({
            startAngle: normalizedAngle,
            endAngle: options.endAngle + rotation
        });
    }, [options.startAngle, options.endAngle, updateOptions]);

    // Adjust radius range
    const adjustRadius = useCallback((inner: number, outer: number) => {
        if (inner >= outer) {
            console.warn('Inner radius must be less than outer radius');
            return;
        }

        updateOptions({
            innerRadius: Math.max(0, inner),
            outerRadius: Math.max(inner + 10, outer)
        });
    }, [updateOptions]);

    // Memoized return value
    const returnValue = useMemo(() => ({
        options,
        updateOptions,
        resetOptions,
        isAnimating,
        setIsAnimating,
        rotationSpeed,
        setRotationSpeed,
        sectorHighlight,
        updateSectorHighlight,
        toggleSectorHighlight,
        rotateTo,
        adjustRadius
    }), [
        options,
        updateOptions,
        resetOptions,
        isAnimating,
        setIsAnimating,
        rotationSpeed,
        setRotationSpeed,
        sectorHighlight,
        updateSectorHighlight,
        toggleSectorHighlight,
        rotateTo,
        adjustRadius
    ]);

    return returnValue;
}