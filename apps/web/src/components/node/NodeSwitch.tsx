'use client';

import { useState, useEffect } from 'react';

/**
 * NodeSwitch Component
 *
 * A toggle component that allows users to switch between Article and Roadmap node types.
 * Supports keyboard navigation and accessibility features.
 *
 * Requirements: 1.2, 1.3, 15.1, 15.2
 */

export interface NodeSwitchProps {
    /**
     * Current selected node type
     */
    value?: 'article' | 'roadmap';

    /**
     * Callback when node type changes
     */
    onChange?: (nodeType: 'article' | 'roadmap') => void;

    /**
     * Optional CSS class name
     */
    className?: string;
}

export function NodeSwitch({ value = 'article', onChange, className = '' }: NodeSwitchProps) {
    const [selectedType, setSelectedType] = useState<'article' | 'roadmap'>(value);

    // Sync with external value changes
    useEffect(() => {
        setSelectedType(value);
    }, [value]);

    const handleSelect = (type: 'article' | 'roadmap') => {
        setSelectedType(type);
        onChange?.(type);
    };

    const handleKeyDown = (e: React.KeyboardEvent, type: 'article' | 'roadmap') => {
        // Support Enter and Space keys for accessibility
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleSelect(type);
        }

        // Support Arrow keys for navigation
        if (e.key === 'ArrowLeft' && type === 'roadmap') {
            handleSelect('article');
        }
        if (e.key === 'ArrowRight' && type === 'article') {
            handleSelect('roadmap');
        }
    };

    return (
        <div className={`flex gap-4 ${className}`} role="group" aria-label="Chọn loại node">
            <button
                onClick={() => handleSelect('article')}
                onKeyDown={(e) => handleKeyDown(e, 'article')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${selectedType === 'article'
                        ? 'bg-blue-600 text-white focus:ring-blue-500'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-400'
                    }`}
                aria-label="Chọn Article"
                aria-pressed={selectedType === 'article'}
                role="button"
                tabIndex={0}
            >
                Article
            </button>
            <button
                onClick={() => handleSelect('roadmap')}
                onKeyDown={(e) => handleKeyDown(e, 'roadmap')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${selectedType === 'roadmap'
                        ? 'bg-purple-600 text-white focus:ring-purple-500'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-400'
                    }`}
                aria-label="Chọn Roadmap"
                aria-pressed={selectedType === 'roadmap'}
                role="button"
                tabIndex={0}
            >
                Roadmap
            </button>
        </div>
    );
}
