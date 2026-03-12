'use client';

/**
 * ViewToggle component for switching between content and visualization views
 * 
 * Features:
 * - Modern toggle button group design with rounded-xl styling
 * - Primary/secondary button states with smooth transitions
 * - Icons for content (📄) and visualization (🗺️) modes
 * - State persistence and loading states
 * - Responsive design with proper spacing
 * - Accessibility support with ARIA labels
 * 
 * Design System:
 * - Uses primary-500 for active state with shadow-soft
 * - Neutral colors for inactive state with hover effects
 * - Smooth transitions with duration-300
 * - Scale transform on active state for visual feedback
 * 
 * Validates: Requirement 1.1 - View toggle functionality
 */

import React from 'react';
import { cn } from '@/lib/utils';

export type ViewMode = 'content' | 'visualization';

interface ViewToggleProps {
    /** Current active view mode */
    currentView: ViewMode;
    /** Callback when view changes */
    onViewChange: (view: ViewMode) => void;
    /** Loading state for visualization */
    isLoading?: boolean;
    /** Disabled state */
    disabled?: boolean;
    /** Additional CSS classes */
    className?: string;
}

/**
 * Toggle button component for switching between content and visualization views
 * Implements the design system specified in the requirements with proper styling
 */
export function ViewToggle({
    currentView,
    onViewChange,
    isLoading = false,
    disabled = false,
    className = '',
}: ViewToggleProps) {
    return (
        <div className={cn("flex justify-center", className)}>
            <div className="inline-flex rounded-xl border border-neutral-200 bg-white p-1 shadow-soft">
                <button
                    onClick={() => onViewChange('content')}
                    disabled={disabled}
                    aria-label="Switch to content view"
                    aria-pressed={currentView === 'content'}
                    className={cn(
                        "px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300",
                        "flex items-center gap-2",
                        currentView === 'content'
                            ? "bg-primary-500 text-white shadow-soft transform scale-105"
                            : "text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50"
                    )}
                >
                    <span className="text-base" role="img" aria-label="Content icon">📄</span>
                    <span>Nội dung</span>
                </button>

                <button
                    onClick={() => onViewChange('visualization')}
                    disabled={disabled || isLoading}
                    aria-label="Switch to visualization view"
                    aria-pressed={currentView === 'visualization'}
                    className={cn(
                        "px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300",
                        "flex items-center gap-2",
                        currentView === 'visualization'
                            ? "bg-primary-500 text-white shadow-soft transform scale-105"
                            : "text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50",
                        (disabled || isLoading) && "opacity-50 cursor-not-allowed"
                    )}
                >
                    {isLoading ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <span className="text-base" role="img" aria-label="Visualization icon">🗺️</span>
                    )}
                    <span>Sơ đồ roadmap</span>
                </button>
            </div>
        </div>
    );
}

/**
 * Compact view toggle for mobile or constrained spaces
 */
export function CompactViewToggle({
    currentView,
    onViewChange,
    isLoading = false,
    disabled = false,
    className = '',
}: ViewToggleProps) {
    return (
        <div className={cn("flex justify-center", className)}>
            <div className="inline-flex rounded-lg border border-neutral-200 bg-white p-0.5 shadow-soft">
                <button
                    onClick={() => onViewChange('content')}
                    disabled={disabled}
                    aria-label="Content view"
                    aria-pressed={currentView === 'content'}
                    className={cn(
                        "px-3 py-2 rounded-md text-xs font-medium transition-all duration-200",
                        "flex items-center gap-1.5",
                        currentView === 'content'
                            ? "bg-primary-500 text-white shadow-sm"
                            : "text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50"
                    )}
                >
                    <span className="text-sm" role="img" aria-label="Content">📄</span>
                    <span className="hidden sm:inline">Nội dung</span>
                </button>

                <button
                    onClick={() => onViewChange('visualization')}
                    disabled={disabled || isLoading}
                    aria-label="Visualization view"
                    aria-pressed={currentView === 'visualization'}
                    className={cn(
                        "px-3 py-2 rounded-md text-xs font-medium transition-all duration-200",
                        "flex items-center gap-1.5",
                        currentView === 'visualization'
                            ? "bg-primary-500 text-white shadow-sm"
                            : "text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50",
                        (disabled || isLoading) && "opacity-50 cursor-not-allowed"
                    )}
                >
                    {isLoading ? (
                        <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <span className="text-sm" role="img" aria-label="Visualization">🗺️</span>
                    )}
                    <span className="hidden sm:inline">Sơ đồ</span>
                </button>
            </div>
        </div>
    );
}

/**
 * Floating view toggle for overlay positioning
 * Used when the toggle needs to float over content
 */
export function FloatingViewToggle({
    currentView,
    onViewChange,
    isLoading = false,
    disabled = false,
}: Omit<ViewToggleProps, 'className'>) {
    return (
        <div className="fixed top-6 right-6 z-30 bg-white/90 backdrop-blur-sm border border-neutral-200 rounded-xl shadow-medium p-2">
            <CompactViewToggle
                currentView={currentView}
                onViewChange={onViewChange}
                isLoading={isLoading}
                disabled={disabled}
            />
        </div>
    );
}