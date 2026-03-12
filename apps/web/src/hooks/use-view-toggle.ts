/**
 * Custom hook for managing view toggle state between content and visualization
 * 
 * Features:
 * - State persistence in localStorage
 * - URL synchronization
 * - Loading state management
 * - TypeScript support
 * 
 * Validates: Requirement 1.1 - View state management
 */

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export type ViewMode = 'content' | 'visualization';

interface UseViewToggleOptions {
    /** Default view mode */
    defaultView?: ViewMode;
    /** Whether to persist view preference in localStorage */
    persist?: boolean;
    /** Whether to sync view state with URL parameters */
    syncWithUrl?: boolean;
    /** Storage key for localStorage persistence */
    storageKey?: string;
    /** URL parameter name for view state */
    urlParam?: string;
}

interface UseViewToggleReturn {
    /** Current active view mode */
    currentView: ViewMode;
    /** Function to change view mode */
    setView: (view: ViewMode) => void;
    /** Loading state for view transitions */
    isLoading: boolean;
    /** Function to set loading state */
    setIsLoading: (loading: boolean) => void;
    /** Function to toggle between views */
    toggleView: () => void;
}

/**
 * Hook for managing view toggle state with persistence and URL sync
 */
export function useViewToggle({
    defaultView = 'content',
    persist = false,
    syncWithUrl = false,
    storageKey = 'roadmap-view-preference',
    urlParam = 'view',
}: UseViewToggleOptions = {}): UseViewToggleReturn {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Initialize view state from URL or localStorage
    const getInitialView = useCallback((): ViewMode => {
        let initialView = defaultView;

        // Check URL parameter first (highest priority)
        if (syncWithUrl) {
            const urlView = searchParams.get(urlParam) as ViewMode;
            if (urlView === 'content' || urlView === 'visualization') {
                initialView = urlView;
            }
        }

        // Check localStorage if no URL parameter (lower priority)
        if (persist && initialView === defaultView) {
            try {
                const storedView = localStorage.getItem(storageKey) as ViewMode;
                if (storedView === 'content' || storedView === 'visualization') {
                    initialView = storedView;
                }
            } catch (error) {
                console.warn('Failed to read view preference from localStorage:', error);
            }
        }

        return initialView;
    }, [defaultView, persist, syncWithUrl, storageKey, urlParam, searchParams]);

    const [currentView, setCurrentView] = useState<ViewMode>(getInitialView);
    const [isLoading, setIsLoading] = useState(false);

    // Function to change view with persistence and URL sync
    const setView = useCallback((view: ViewMode) => {
        setCurrentView(view);

        // Persist to localStorage if enabled
        if (persist) {
            try {
                localStorage.setItem(storageKey, view);
            } catch (error) {
                console.warn('Failed to save view preference to localStorage:', error);
            }
        }

        // Sync with URL if enabled
        if (syncWithUrl) {
            try {
                const params = new URLSearchParams(searchParams.toString());
                params.set(urlParam, view);

                // Use replace to avoid adding to browser history
                router.replace(`?${params.toString()}`, { scroll: false });
            } catch (error) {
                console.warn('Failed to sync view state with URL:', error);
            }
        }
    }, [persist, syncWithUrl, storageKey, urlParam, searchParams, router]);

    // Function to toggle between views
    const toggleView = useCallback(() => {
        const newView = currentView === 'content' ? 'visualization' : 'content';
        setView(newView);
    }, [currentView, setView]);

    return {
        currentView,
        setView,
        isLoading,
        setIsLoading,
        toggleView,
    };
}

/**
 * Simple hook for basic view toggle without persistence
 */
export function useSimpleViewToggle(defaultView: ViewMode = 'content') {
    const [currentView, setCurrentView] = useState<ViewMode>(defaultView);
    const [isLoading, setIsLoading] = useState(false);

    const toggleView = useCallback(() => {
        const newView = currentView === 'content' ? 'visualization' : 'content';
        setCurrentView(newView);
    }, [currentView]);

    return {
        currentView,
        setView: setCurrentView,
        isLoading,
        setIsLoading,
        toggleView,
    };
}