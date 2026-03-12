/**
 * Tests for useCircularLayout hook
 * Validates: Requirement 3.3
 */

import { renderHook, act } from '@testing-library/react';
import { useCircularLayout } from '../useCircularLayout';

describe('useCircularLayout', () => {
    it('should initialize with default options', () => {
        const { result } = renderHook(() => useCircularLayout());

        expect(result.current.options).toEqual({
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
        });
    });

    it('should update options correctly', () => {
        const { result } = renderHook(() => useCircularLayout());

        act(() => {
            result.current.updateOptions({ innerRadius: 150 });
        });

        expect(result.current.options.innerRadius).toBe(150);
    });

    it('should validate radius constraints', () => {
        const { result } = renderHook(() => useCircularLayout());
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

        act(() => {
            result.current.updateOptions({ innerRadius: 400, outerRadius: 300 });
        });

        expect(consoleSpy).toHaveBeenCalledWith('Inner radius must be less than outer radius');
        expect(result.current.options.innerRadius).toBe(100); // Should remain unchanged

        consoleSpy.mockRestore();
    });

    it('should handle rotation correctly', () => {
        const { result } = renderHook(() => useCircularLayout());

        act(() => {
            result.current.rotateTo(Math.PI / 2); // 90 degrees
        });

        expect(result.current.options.startAngle).toBe(Math.PI / 2);
    });

    it('should adjust radius range', () => {
        const { result } = renderHook(() => useCircularLayout());

        act(() => {
            result.current.adjustRadius(120, 400);
        });

        expect(result.current.options.innerRadius).toBe(120);
        expect(result.current.options.outerRadius).toBe(400);
    });

    it('should handle sector highlight', () => {
        const { result } = renderHook(() => useCircularLayout());

        act(() => {
            result.current.updateSectorHighlight({ enabled: true, color: '#ff0000' });
        });

        expect(result.current.sectorHighlight.enabled).toBe(true);
        expect(result.current.sectorHighlight.color).toBe('#ff0000');
    });

    it('should toggle sector highlight', () => {
        const { result } = renderHook(() => useCircularLayout());

        act(() => {
            result.current.toggleSectorHighlight();
        });

        expect(result.current.sectorHighlight.enabled).toBe(true);

        act(() => {
            result.current.toggleSectorHighlight();
        });

        expect(result.current.sectorHighlight.enabled).toBe(false);
    });

    it('should reset to defaults', () => {
        const { result } = renderHook(() => useCircularLayout());

        // Make some changes
        act(() => {
            result.current.updateOptions({ innerRadius: 200 });
            result.current.setRotationSpeed(2);
            result.current.updateSectorHighlight({ enabled: true });
        });

        // Reset
        act(() => {
            result.current.resetOptions();
        });

        expect(result.current.options.innerRadius).toBe(100);
        expect(result.current.rotationSpeed).toBe(1);
        expect(result.current.sectorHighlight.enabled).toBe(false);
    });

    it('should handle animation state', () => {
        const { result } = renderHook(() => useCircularLayout());

        act(() => {
            result.current.setIsAnimating(true);
        });

        expect(result.current.isAnimating).toBe(true);

        act(() => {
            result.current.setIsAnimating(false);
        });

        expect(result.current.isAnimating).toBe(false);
    });

    it('should handle rotation speed changes', () => {
        const { result } = renderHook(() => useCircularLayout());

        act(() => {
            result.current.setRotationSpeed(2.5);
        });

        expect(result.current.rotationSpeed).toBe(2.5);
    });

    it('should initialize with custom options', () => {
        const customOptions = {
            innerRadius: 150,
            outerRadius: 400,
            width: 1000,
            height: 600
        };

        const { result } = renderHook(() => useCircularLayout(customOptions));

        expect(result.current.options.innerRadius).toBe(150);
        expect(result.current.options.outerRadius).toBe(400);
        expect(result.current.options.width).toBe(1000);
        expect(result.current.options.height).toBe(600);
    });

    it('should validate dimension constraints', () => {
        const { result } = renderHook(() => useCircularLayout());
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

        act(() => {
            result.current.updateOptions({ width: -100, height: 0 });
        });

        expect(consoleSpy).toHaveBeenCalledWith('Width and height must be positive');
        expect(result.current.options.width).toBe(1200); // Should remain unchanged

        consoleSpy.mockRestore();
    });

    it('should validate angle constraints', () => {
        const { result } = renderHook(() => useCircularLayout());
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

        act(() => {
            result.current.updateOptions({ startAngle: Math.PI, endAngle: Math.PI / 2 });
        });

        expect(consoleSpy).toHaveBeenCalledWith('Start angle must be less than end angle');
        expect(result.current.options.startAngle).toBe(0); // Should remain unchanged

        consoleSpy.mockRestore();
    });
});