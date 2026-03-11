/**
 * Tests for useViewToggle hook
 * 
 * Validates: Requirement 1.1, 1.2 - View state management and persistence
 */

import { renderHook, act } from '@testing-library/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useViewToggle, useSimpleViewToggle } from '../use-view-toggle';

// Mock Next.js navigation hooks
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
    useSearchParams: jest.fn(),
}));

// Mock localStorage
const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
});

// Define mocks at top level for access in all describe blocks
const mockReplace = jest.fn();
const mockSearchParams = {
    get: jest.fn(),
    toString: jest.fn(() => ''),
};

describe('useViewToggle', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue({
            replace: mockReplace,
        });
        (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
        mockLocalStorage.getItem.mockReturnValue(null);
        mockSearchParams.get.mockReturnValue(null);
        mockSearchParams.toString.mockReturnValue('');
    });

    describe('Default behavior', () => {
        it('initializes with default view mode', () => {
            const { result } = renderHook(() => useViewToggle());

            expect(result.current.currentView).toBe('content');
            expect(result.current.isLoading).toBe(false);
        });

        it('initializes with custom default view', () => {
            const { result } = renderHook(() =>
                useViewToggle({ defaultView: 'visualization' })
            );

            expect(result.current.currentView).toBe('visualization');
        });
    });

    describe('View changing', () => {
        it('changes view when setView is called', () => {
            const { result } = renderHook(() => useViewToggle());

            act(() => {
                result.current.setView('visualization');
            });

            expect(result.current.currentView).toBe('visualization');
        });

        it('toggles between views when toggleView is called', () => {
            const { result } = renderHook(() => useViewToggle());

            // Initially content
            expect(result.current.currentView).toBe('content');

            // Toggle to visualization
            act(() => {
                result.current.toggleView();
            });
            expect(result.current.currentView).toBe('visualization');

            // Toggle back to content
            act(() => {
                result.current.toggleView();
            });
            expect(result.current.currentView).toBe('content');
        });
    });

    describe('Loading state', () => {
        it('manages loading state correctly', () => {
            const { result } = renderHook(() => useViewToggle());

            expect(result.current.isLoading).toBe(false);

            act(() => {
                result.current.setIsLoading(true);
            });
            expect(result.current.isLoading).toBe(true);

            act(() => {
                result.current.setIsLoading(false);
            });
            expect(result.current.isLoading).toBe(false);
        });
    });

    describe('localStorage persistence', () => {
        it('saves view mode to localStorage when persist is enabled', () => {
            const { result } = renderHook(() =>
                useViewToggle({ persist: true, storageKey: 'test-key' })
            );

            act(() => {
                result.current.setView('visualization');
            });

            expect(mockLocalStorage.setItem).toHaveBeenCalledWith('test-key', 'visualization');
        });

        it('does not save to localStorage when persist is disabled', () => {
            const { result } = renderHook(() =>
                useViewToggle({ persist: false })
            );

            act(() => {
                result.current.setView('visualization');
            });

            expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
        });

        it('loads initial view from localStorage', () => {
            mockLocalStorage.getItem.mockReturnValue('visualization');

            const { result } = renderHook(() =>
                useViewToggle({ persist: true, storageKey: 'test-key' })
            );

            expect(result.current.currentView).toBe('visualization');
            expect(mockLocalStorage.getItem).toHaveBeenCalledWith('test-key');
        });

        it('handles localStorage errors gracefully', () => {
            mockLocalStorage.setItem.mockImplementation(() => {
                throw new Error('Storage quota exceeded');
            });

            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

            const { result } = renderHook(() => useViewToggle({ persist: true }));

            act(() => {
                result.current.setView('visualization');
            });

            expect(consoleSpy).toHaveBeenCalledWith(
                'Failed to save view mode to localStorage:',
                expect.any(Error)
            );

            consoleSpy.mockRestore();
        });
    });

    describe('URL synchronization', () => {
        it('updates URL when view changes and syncWithUrl is enabled', () => {
            const { result } = renderHook(() =>
                useViewToggle({ syncWithUrl: true, urlParam: 'view' })
            );

            act(() => {
                result.current.setView('visualization');
            });

            expect(mockReplace).toHaveBeenCalledWith('?view=visualization', { scroll: false });
        });

        it('does not update URL when syncWithUrl is disabled', () => {
            const { result } = renderHook(() =>
                useViewToggle({ syncWithUrl: false })
            );

            act(() => {
                result.current.setView('visualization');
            });

            expect(mockReplace).not.toHaveBeenCalled();
        });

        it('loads initial view from URL parameter', () => {
            mockSearchParams.get.mockReturnValue('visualization');

            const { result } = renderHook(() =>
                useViewToggle({ syncWithUrl: true, urlParam: 'view' })
            );

            expect(result.current.currentView).toBe('visualization');
            expect(mockSearchParams.get).toHaveBeenCalledWith('view');
        });

        it('prioritizes URL parameter over localStorage', () => {
            mockSearchParams.get.mockReturnValue('visualization');
            mockLocalStorage.getItem.mockReturnValue('content');

            const { result } = renderHook(() =>
                useViewToggle({
                    syncWithUrl: true,
                    persist: true,
                    urlParam: 'view',
                    storageKey: 'test-key'
                })
            );

            expect(result.current.currentView).toBe('visualization');
        });

        it('handles existing URL parameters correctly', () => {
            mockSearchParams.toString.mockReturnValue('existing=param');

            const { result } = renderHook(() =>
                useViewToggle({ syncWithUrl: true, urlParam: 'view' })
            );

            act(() => {
                result.current.setView('visualization');
            });

            expect(mockReplace).toHaveBeenCalledWith('?existing=param&view=visualization', { scroll: false });
        });
    });

    describe('Input validation', () => {
        it('ignores invalid URL parameter values', () => {
            mockSearchParams.get.mockReturnValue('invalid-view');

            const { result } = renderHook(() =>
                useViewToggle({
                    syncWithUrl: true,
                    defaultView: 'content',
                    urlParam: 'view'
                })
            );

            expect(result.current.currentView).toBe('content');
        });

        it('ignores invalid localStorage values', () => {
            mockLocalStorage.getItem.mockReturnValue('invalid-view');

            const { result } = renderHook(() =>
                useViewToggle({
                    persist: true,
                    defaultView: 'content',
                    storageKey: 'test-key'
                })
            );

            expect(result.current.currentView).toBe('content');
        });
    });
});

describe('useSimpleViewToggle', () => {
    it('provides basic view toggle functionality without persistence', () => {
        const { result } = renderHook(() => useSimpleViewToggle());

        expect(result.current.currentView).toBe('content');
        expect(result.current.isLoading).toBe(false);

        act(() => {
            result.current.setView('visualization');
        });

        expect(result.current.currentView).toBe('visualization');
    });

    it('supports custom default view', () => {
        const { result } = renderHook(() => useSimpleViewToggle('visualization'));

        expect(result.current.currentView).toBe('visualization');
    });

    it('toggles between views correctly', () => {
        const { result } = renderHook(() => useSimpleViewToggle());

        act(() => {
            result.current.toggleView();
        });
        expect(result.current.currentView).toBe('visualization');

        act(() => {
            result.current.toggleView();
        });
        expect(result.current.currentView).toBe('content');
    });

    it('does not interact with localStorage or URL', () => {
        const { result } = renderHook(() => useSimpleViewToggle());

        act(() => {
            result.current.setView('visualization');
        });

        expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
        expect(mockReplace).not.toHaveBeenCalled();
    });
});