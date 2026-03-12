'use client';

/**
 * Grid Layout Example
 * Demonstrates usage of GridLayoutControls with useGridLayout hook
 */

import React, { useState } from 'react';
import { GridLayoutControls } from '../GridLayoutControls';
import { useGridLayout } from '../../../hooks/useGridLayout';
import type { GridLayoutOptions } from '@viztechstack/roadmap-visualization';

// Mock roadmap data for demonstration
const mockRoadmapData = {
    nodes: [
        { id: '1', data: { label: 'HTML Basics', level: 1, section: 'Frontend', difficulty: 'beginner' as const } },
        { id: '2', data: { label: 'CSS Fundamentals', level: 1, section: 'Frontend', difficulty: 'beginner' as const } },
        { id: '3', data: { label: 'JavaScript Basics', level: 2, section: 'Frontend', difficulty: 'intermediate' as const } },
        { id: '4', data: { label: 'React Introduction', level: 3, section: 'Frontend', difficulty: 'intermediate' as const } },
        { id: '5', data: { label: 'Node.js Basics', level: 2, section: 'Backend', difficulty: 'intermediate' as const } },
        { id: '6', data: { label: 'Database Design', level: 3, section: 'Backend', difficulty: 'advanced' as const } },
    ],
    edges: []
};

export function GridLayoutExample() {
    const {
        options,
        updateOptions,
        snapToGrid,
        setSnapToGrid,
        showGridLines,
        setShowGridLines,
        alignment,
        updateAlignment,
        optimizeForContent,
        resetOptions
    } = useGridLayout({
        cellWidth: 220,
        cellHeight: 140,
        autoSize: true
    });

    const [selectedPreset, setSelectedPreset] = useState<string>('default');

    // Preset configurations
    const presets: Record<string, Partial<GridLayoutOptions>> = {
        default: {
            cellWidth: 200,
            cellHeight: 120,
            paddingX: 20,
            paddingY: 20,
            autoSize: true
        },
        compact: {
            cellWidth: 160,
            cellHeight: 100,
            paddingX: 10,
            paddingY: 10,
            autoSize: true
        },
        spacious: {
            cellWidth: 280,
            cellHeight: 160,
            paddingX: 40,
            paddingY: 30,
            autoSize: true
        },
        manual: {
            columns: 3,
            rows: 2,
            cellWidth: 200,
            cellHeight: 120,
            autoSize: false
        }
    };

    const handlePresetChange = (preset: string) => {
        setSelectedPreset(preset);
        updateOptions(presets[preset]);
    };
    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                <h1 className="text-2xl font-bold text-neutral-900 mb-4">
                    Grid Layout Controls Example
                </h1>
                <p className="text-neutral-600 mb-6">
                    This example demonstrates the GridLayoutControls component with various configuration options.
                </p>

                {/* Preset selector */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Quick Presets
                    </label>
                    <select
                        value={selectedPreset}
                        onChange={(e) => handlePresetChange(e.target.value)}
                        className="input text-sm py-2 px-3 w-48"
                    >
                        <option value="default">Default Layout</option>
                        <option value="compact">Compact Layout</option>
                        <option value="spacious">Spacious Layout</option>
                        <option value="manual">Manual Grid (3x2)</option>
                    </select>
                </div>

                {/* Grid Layout Controls */}
                <GridLayoutControls
                    options={options}
                    onOptionsChange={updateOptions}
                    snapToGrid={snapToGrid}
                    onSnapToGridChange={setSnapToGrid}
                    showGridLines={showGridLines}
                    onShowGridLinesChange={setShowGridLines}
                    alignment={alignment}
                    onAlignmentChange={updateAlignment}
                    onOptimizeForContent={optimizeForContent}
                    className="mb-6"
                />

                {/* Current Configuration Display */}
                <div className="bg-neutral-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-neutral-900 mb-3">Current Configuration</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                        <div>
                            <span className="font-medium">Grid Size:</span>
                            <div className="text-neutral-600">
                                {options.autoSize ? 'Auto' : `${options.columns}x${options.rows}`}
                            </div>
                        </div>
                        <div>
                            <span className="font-medium">Cell Size:</span>
                            <div className="text-neutral-600">
                                {options.cellWidth}x{options.cellHeight}px
                            </div>
                        </div>
                        <div>
                            <span className="font-medium">Padding:</span>
                            <div className="text-neutral-600">
                                {options.paddingX}x{options.paddingY}px
                            </div>
                        </div>
                        <div>
                            <span className="font-medium">Margins:</span>
                            <div className="text-neutral-600">
                                {options.marginX}x{options.marginY}px
                            </div>
                        </div>
                        <div>
                            <span className="font-medium">Alignment:</span>
                            <div className="text-neutral-600">
                                {alignment.horizontal}-{alignment.vertical}
                            </div>
                        </div>
                        <div>
                            <span className="font-medium">Features:</span>
                            <div className="text-neutral-600">
                                {snapToGrid ? '📌' : ''} {showGridLines ? '📏' : ''}
                            </div>
                        </div>
                    </div>
                </div>
                {/* Mock Grid Visualization */}
                <div className="mt-6">
                    <h3 className="text-sm font-medium text-neutral-900 mb-3">Grid Preview</h3>
                    <div
                        className="border border-neutral-200 rounded-lg bg-neutral-50 relative overflow-hidden"
                        style={{
                            height: '300px',
                            backgroundImage: showGridLines ?
                                `linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                                 linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)` : 'none',
                            backgroundSize: showGridLines ?
                                `${options.cellWidth + options.paddingX}px ${options.cellHeight + options.paddingY}px` : 'auto'
                        }}
                    >
                        {/* Mock nodes positioned in grid */}
                        {mockRoadmapData.nodes.slice(0, options.autoSize ? 6 : options.columns * options.rows).map((node, index) => {
                            const cols = options.autoSize ? 3 : options.columns;
                            const row = Math.floor(index / cols);
                            const col = index % cols;

                            const x = options.marginX + (col * (options.cellWidth + options.paddingX));
                            const y = options.marginY + (row * (options.cellHeight + options.paddingY));

                            return (
                                <div
                                    key={node.id}
                                    className={`absolute rounded-lg border-2 p-3 text-xs font-medium transition-all duration-200 ${node.data.difficulty === 'beginner' ? 'bg-green-50 border-green-200 text-green-800' :
                                            node.data.difficulty === 'intermediate' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
                                                'bg-red-50 border-red-200 text-red-800'
                                        }`}
                                    style={{
                                        left: `${x}px`,
                                        top: `${y}px`,
                                        width: `${options.cellWidth}px`,
                                        height: `${options.cellHeight}px`,
                                        transform: snapToGrid ? 'none' : `translate(${Math.random() * 10 - 5}px, ${Math.random() * 10 - 5}px)`
                                    }}
                                >
                                    <div className="font-medium">{node.data.label}</div>
                                    <div className="text-xs opacity-75 mt-1">
                                        Level {node.data.level} • {node.data.section}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Action buttons */}
                <div className="mt-6 flex gap-3">
                    <button
                        onClick={optimizeForContent}
                        className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium"
                    >
                        🎯 Optimize for Content
                    </button>
                    <button
                        onClick={resetOptions}
                        className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors text-sm font-medium"
                    >
                        Reset to Defaults
                    </button>
                </div>
            </div>
        </div>
    );
}