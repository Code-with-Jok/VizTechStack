'use client';

/**
 * Hook quản lý responsive behavior cho panels
 * Hỗ trợ collapse/expand functionality và responsive breakpoints
 * 
 * Task 4.2.2: Responsive design hooks cho NodeDetailsPanel
 */

import { useState, useEffect, useCallback } from 'react';

export type BreakpointSize = 'mobile' | 'tablet' | 'desktop';
export type PanelState = 'collapsed' | 'expanded' | 'minimized';

interface UseResponsivePanelOptions {
    defaultState?: PanelState;
    persistKey?: string; // Key để lưu state trong localStorage
    autoCollapseOnMobile?: boolean;
    autoExpandOnDesktop?: boolean;
}

interface ResponsivePanelState {
    // Current state
    panelState: PanelState;
    breakpoint: BreakpointSize;
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;

    // Dimensions
    screenWidth: number;
    screenHeight: number;

    // Actions
    togglePanel: () => void;
    expandPanel: () => void;
    collapsePanel: () => void;
    minimizePanel: () => void;
    setPanelState: (state: PanelState) => void;

    // Responsive utilities
    shouldShowFullContent: boolean;
    shouldUseCompactLayout: boolean;
    maxPanelHeight: number;
    panelWidth: string;
}

/**
 * Xác định breakpoint dựa trên screen width
 */
function getBreakpoint(width: number): BreakpointSize {
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
}

/**
 * Tính toán max height cho panel dựa trên screen size
 */
function calculateMaxPanelHeight(height: number, breakpoint: BreakpointSize): number {
    switch (breakpoint) {
        case 'mobile':
            return Math.min(height * 0.8, 600); // 80% của screen height, max 600px
        case 'tablet':
            return Math.min(height * 0.7, 700); // 70% của screen height, max 700px
        case 'desktop':
            return Math.min(height * 0.6, 800); // 60% của screen height, max 800px
        default:
            return 600;
    }
}

/**
 * Tính toán width cho panel dựa trên breakpoint
 */
function calculatePanelWidth(breakpoint: BreakpointSize): string {
    switch (breakpoint) {
        case 'mobile':
            return 'w-full max-w-sm'; // Full width trên mobile, max 384px
        case 'tablet':
            return 'w-full max-w-md'; // Full width trên tablet, max 448px
        case 'desktop':
            return 'w-full max-w-lg'; // Full width trên desktop, max 512px
        default:
            return 'w-full max-w-md';
    }
}

export function useResponsivePanel(options: UseResponsivePanelOptions = {}): ResponsivePanelState {
    const {
        defaultState = 'expanded',
        persistKey,
        autoCollapseOnMobile = true,
        autoExpandOnDesktop = true,
    } = options;

    // State management
    const [panelState, setPanelStateInternal] = useState<PanelState>(() => {
        if (typeof window === 'undefined') return defaultState;

        // Load từ localStorage nếu có persistKey
        if (persistKey) {
            const saved = localStorage.getItem(`panel-state-${persistKey}`);
            if (saved && ['collapsed', 'expanded', 'minimized'].includes(saved)) {
                return saved as PanelState;
            }
        }

        return defaultState;
    });

    const [screenWidth, setScreenWidth] = useState(() => {
        if (typeof window === 'undefined') return 1024;
        return window.innerWidth;
    });

    const [screenHeight, setScreenHeight] = useState(() => {
        if (typeof window === 'undefined') return 768;
        return window.innerHeight;
    });

    // Derived state
    const breakpoint = getBreakpoint(screenWidth);
    const isMobile = breakpoint === 'mobile';
    const isTablet = breakpoint === 'tablet';
    const isDesktop = breakpoint === 'desktop';

    // Handle window resize
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleResize = () => {
            setScreenWidth(window.innerWidth);
            setScreenHeight(window.innerHeight);
        };

        // Debounce resize events
        let timeoutId: NodeJS.Timeout;
        const debouncedResize = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(handleResize, 150);
        };

        window.addEventListener('resize', debouncedResize);

        // Initial call
        handleResize();

        return () => {
            window.removeEventListener('resize', debouncedResize);
            clearTimeout(timeoutId);
        };
    }, []);

    // Auto-adjust panel state based on breakpoint changes
    useEffect(() => {
        if (autoCollapseOnMobile && isMobile && panelState === 'expanded') {
            setPanelStateInternal('minimized');
        } else if (autoExpandOnDesktop && isDesktop && panelState === 'minimized') {
            setPanelStateInternal('expanded');
        }
    }, [breakpoint, isMobile, isDesktop, autoCollapseOnMobile, autoExpandOnDesktop, panelState]);

    // Persist state changes
    useEffect(() => {
        if (persistKey && typeof window !== 'undefined') {
            localStorage.setItem(`panel-state-${persistKey}`, panelState);
        }
    }, [panelState, persistKey]);

    // Actions
    const setPanelState = useCallback((state: PanelState) => {
        setPanelStateInternal(state);
    }, []);

    const togglePanel = useCallback(() => {
        setPanelStateInternal(current => {
            if (current === 'collapsed') return 'expanded';
            if (current === 'expanded') return isMobile ? 'minimized' : 'collapsed';
            if (current === 'minimized') return 'expanded';
            return 'expanded';
        });
    }, [isMobile]);

    const expandPanel = useCallback(() => {
        setPanelStateInternal('expanded');
    }, []);

    const collapsePanel = useCallback(() => {
        setPanelStateInternal('collapsed');
    }, []);

    const minimizePanel = useCallback(() => {
        setPanelStateInternal('minimized');
    }, []);

    // Responsive utilities
    const shouldShowFullContent = panelState === 'expanded';
    const shouldUseCompactLayout = isMobile || panelState === 'minimized';
    const maxPanelHeight = calculateMaxPanelHeight(screenHeight, breakpoint);
    const panelWidth = calculatePanelWidth(breakpoint);

    return {
        // Current state
        panelState,
        breakpoint,
        isMobile,
        isTablet,
        isDesktop,

        // Dimensions
        screenWidth,
        screenHeight,

        // Actions
        togglePanel,
        expandPanel,
        collapsePanel,
        minimizePanel,
        setPanelState,

        // Responsive utilities
        shouldShowFullContent,
        shouldUseCompactLayout,
        maxPanelHeight,
        panelWidth,
    };
}

/**
 * Hook đơn giản cho responsive breakpoints
 */
export function useBreakpoint() {
    const [screenWidth, setScreenWidth] = useState(() => {
        if (typeof window === 'undefined') return 1024;
        return window.innerWidth;
    });

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleResize = () => {
            setScreenWidth(window.innerWidth);
        };

        let timeoutId: NodeJS.Timeout;
        const debouncedResize = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(handleResize, 150);
        };

        window.addEventListener('resize', debouncedResize);
        handleResize();

        return () => {
            window.removeEventListener('resize', debouncedResize);
            clearTimeout(timeoutId);
        };
    }, []);

    const breakpoint = getBreakpoint(screenWidth);

    return {
        screenWidth,
        breakpoint,
        isMobile: breakpoint === 'mobile',
        isTablet: breakpoint === 'tablet',
        isDesktop: breakpoint === 'desktop',
    };
}