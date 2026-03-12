/**
 * Tests for useResponsivePanel hook
 * Task 4.2.2: Responsive design testing
 */

import { renderHook, act } from '@testing-library/react';
import { useResponsivePanel } from '../useResponsivePanel';

// Mock window object
const mockWindow = {
    innerWidth: 1024,
    innerHeight: 768,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
};

// Mock localStorage
const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
});

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

describe('useResponsivePanel', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockLocalStorage.getItem.mockReturnValue(null);
        window.innerWidth = 1024;
        window.innerHeight = 768;
    });

    describe('initialization', () => {
        it('should initialize with default state', () => {
            const { result } = renderHook(() => useResponsivePanel());

            expect(result.current.panelState).toBe('expanded');
            expect(result.current.breakpoint).toBe('desktop');
            expect(result.current.isDesktop).toBe(true);
            expect(result.current.isMobile).toBe(false);
            expect(result.current.isTablet).toBe(false);
        });

        it('should initialize with custom default state', () => {
            const { result } = renderHook(() =>
                useResponsivePanel({ defaultState: 'collapsed' })
            );

            expect(result.current.panelState).toBe('collapsed');
        });

        it('should load state from localStorage when persistKey is provided', () => {
            mockLocalStorage.getItem.mockReturnValue('minimized');

            const { result } = renderHook(() =>
                useResponsivePanel({ persistKey: 'test-panel' })
            );

            expect(result.current.panelState).toBe('minimized');
            expect(mockLocalStorage.getItem).toHaveBeenCalledWith('panel-state-test-panel');
        });
    });

    describe('breakpoint detection', () => {
        it('should detect mobile breakpoint', () => {
            window.innerWidth = 600;

            const { result } = renderHook(() => useResponsivePanel());

            expect(result.current.breakpoint).toBe('mobile');
            expect(result.current.isMobile).toBe(true);
            expect(result.current.isTablet).toBe(false);
            expect(result.current.isDesktop).toBe(false);
        });

        it('should detect tablet breakpoint', () => {
            window.innerWidth = 800;

            const { result } = renderHook(() => useResponsivePanel());

            expect(result.current.breakpoint).toBe('tablet');
            expect(result.current.isMobile).toBe(false);
            expect(result.current.isTablet).toBe(true);
            expect(result.current.isDesktop).toBe(false);
        });

        it('should detect desktop breakpoint', () => {
            window.innerWidth = 1200;

            const { result } = renderHook(() => useResponsivePanel());

            expect(result.current.breakpoint).toBe('desktop');
            expect(result.current.isMobile).toBe(false);
            expect(result.current.isTablet).toBe(false);
            expect(result.current.isDesktop).toBe(true);
        });
    });

    describe('panel state management', () => {
        it('should toggle panel state correctly', () => {
            const { result } = renderHook(() => useResponsivePanel());

            expect(result.current.panelState).toBe('expanded');

            act(() => {
                result.current.togglePanel();
            });

            expect(result.current.panelState).toBe('collapsed');

            act(() => {
                result.current.togglePanel();
            });

            expect(result.current.panelState).toBe('expanded');
        });

        it('should toggle to minimized on mobile', () => {
            window.innerWidth = 600;

            const { result } = renderHook(() => useResponsivePanel());

            act(() => {
                result.current.togglePanel();
            });

            expect(result.current.panelState).toBe('minimized');
        });

        it('should expand panel', () => {
            const { result } = renderHook(() =>
                useResponsivePanel({ defaultState: 'collapsed' })
            );

            act(() => {
                result.current.expandPanel();
            });

            expect(result.current.panelState).toBe('expanded');
        });

        it('should collapse panel', () => {
            const { result } = renderHook(() => useResponsivePanel());

            act(() => {
                result.current.collapsePanel();
            });

            expect(result.current.panelState).toBe('collapsed');
        });

        it('should minimize panel', () => {
            const { result } = renderHook(() => useResponsivePanel());

            act(() => {
                result.current.minimizePanel();
            });

            expect(result.current.panelState).toBe('minimized');
        });

        it('should set panel state directly', () => {
            const { result } = renderHook(() => useResponsivePanel());

            act(() => {
                result.current.setPanelState('minimized');
            });

            expect(result.current.panelState).toBe('minimized');
        });
    });

    describe('auto-resize behavior', () => {
        it('should auto-collapse on mobile when enabled', () => {
            const { result, rerender } = renderHook(() =>
                useResponsivePanel({
                    autoCollapseOnMobile: true,
                    defaultState: 'expanded'
                })
            );

            expect(result.current.panelState).toBe('expanded');

            // Simulate screen size change to mobile
            window.innerWidth = 600;
            rerender();

            // Should auto-minimize on mobile
            expect(result.current.panelState).toBe('minimized');
        });

        it('should auto-expand on desktop when enabled', () => {
            window.innerWidth = 600;

            const { result, rerender } = renderHook(() =>
                useResponsivePanel({
                    autoExpandOnDesktop: true,
                    defaultState: 'minimized'
                })
            );

            expect(result.current.panelState).toBe('minimized');

            // Simulate screen size change to desktop
            window.innerWidth = 1200;
            rerender();

            // Should auto-expand on desktop
            expect(result.current.panelState).toBe('expanded');
        });
    });

    describe('responsive utilities', () => {
        it('should calculate shouldShowFullContent correctly', () => {
            const { result } = renderHook(() => useResponsivePanel());

            expect(result.current.shouldShowFullContent).toBe(true);

            act(() => {
                result.current.collapsePanel();
            });

            expect(result.current.shouldShowFullContent).toBe(false);
        });

        it('should calculate shouldUseCompactLayout correctly', () => {
            const { result } = renderHook(() => useResponsivePanel());

            expect(result.current.shouldUseCompactLayout).toBe(false);

            act(() => {
                result.current.minimizePanel();
            });

            expect(result.current.shouldUseCompactLayout).toBe(true);
        });

        it('should calculate maxPanelHeight based on breakpoint', () => {
            window.innerHeight = 800;

            // Mobile
            window.innerWidth = 600;
            const { result: mobileResult } = renderHook(() => useResponsivePanel());
            expect(mobileResult.current.maxPanelHeight).toBe(600); // 80% of 800, max 600

            // Tablet
            window.innerWidth = 800;
            const { result: tabletResult } = renderHook(() => useResponsivePanel());
            expect(tabletResult.current.maxPanelHeight).toBe(560); // 70% of 800

            // Desktop
            window.innerWidth = 1200;
            const { result: desktopResult } = renderHook(() => useResponsivePanel());
            expect(desktopResult.current.maxPanelHeight).toBe(480); // 60% of 800
        });

        it('should calculate panelWidth based on breakpoint', () => {
            // Mobile
            window.innerWidth = 600;
            const { result: mobileResult } = renderHook(() => useResponsivePanel());
            expect(mobileResult.current.panelWidth).toBe('w-full max-w-sm');

            // Tablet
            window.innerWidth = 800;
            const { result: tabletResult } = renderHook(() => useResponsivePanel());
            expect(tabletResult.current.panelWidth).toBe('w-full max-w-md');

            // Desktop
            window.innerWidth = 1200;
            const { result: desktopResult } = renderHook(() => useResponsivePanel());
            expect(desktopResult.current.panelWidth).toBe('w-full max-w-lg');
        });
    });

    describe('persistence', () => {
        it('should persist state changes when persistKey is provided', () => {
            const { result } = renderHook(() =>
                useResponsivePanel({ persistKey: 'test-panel' })
            );

            act(() => {
                result.current.collapsePanel();
            });

            expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
                'panel-state-test-panel',
                'collapsed'
            );
        });

        it('should not persist state changes when persistKey is not provided', () => {
            const { result } = renderHook(() => useResponsivePanel());

            act(() => {
                result.current.collapsePanel();
            });

            expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
        });
    });

    describe('screen dimensions', () => {
        it('should track screen width and height', () => {
            window.innerWidth = 1200;
            window.innerHeight = 900;

            const { result } = renderHook(() => useResponsivePanel());

            expect(result.current.screenWidth).toBe(1200);
            expect(result.current.screenHeight).toBe(900);
        });
    });
});

describe('useBreakpoint', () => {
    beforeEach(() => {
        window.innerWidth = 1024;
    });

    it('should return current breakpoint information', () => {
        const { useBreakpoint } = require('../useResponsivePanel');
        const { result } = renderHook(() => useBreakpoint());

        expect(result.current.breakpoint).toBe('desktop');
        expect(result.current.isDesktop).toBe(true);
        expect(result.current.isMobile).toBe(false);
        expect(result.current.isTablet).toBe(false);
        expect(result.current.screenWidth).toBe(1024);
    });

    it('should update breakpoint on screen size change', () => {
        const { useBreakpoint } = require('../useResponsivePanel');
        const { result, rerender } = renderHook(() => useBreakpoint());

        expect(result.current.breakpoint).toBe('desktop');

        // Simulate screen size change
        window.innerWidth = 600;
        rerender();

        expect(result.current.breakpoint).toBe('mobile');
        expect(result.current.isMobile).toBe(true);
        expect(result.current.isDesktop).toBe(false);
    });
});