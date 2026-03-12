'use client';

/**
 * Example component demonstrating selection state management system
 * Showcases all features của selection system
 */

import React, { useState } from 'react';
import type { RoadmapNode, RoadmapEdge } from '@viztechstack/roadmap-visualization';
import { useSelectionManager } from '@/hooks/useSelectionManager';
import { SelectionToolbar } from '../SelectionToolbar';
import { SelectionIndicator } from '../SelectionIndicator';

/**
 * Sample data cho demonstration
 */
const sampleNodes: RoadmapNode[] = [
    {
        id: 'node-1',
        type: 'topic',
        position: { x: 100, y: 100 },
        data: {
            label: 'Frontend Basics',
            description: 'Learn HTML, CSS, and JavaScript fundamentals',
            level: 1,
            section: 'Frontend Development',
            difficulty: 'beginner',
            estimatedTime: '2 weeks',
        },
    },
    {
        id: 'node-2',
        type: 'topic',
        position: { x: 300, y: 100 },
        data: {
            label: 'React Framework',
            description: 'Master React components and hooks',
            level: 2,
            section: 'Frontend Development',
            difficulty: 'intermediate',
            estimatedTime: '3 weeks',
        },
    },
    {
        id: 'node-3',
        type: 'topic',
        position: { x: 500, y: 100 },
        data: {
            label: 'State Management',
            description: 'Learn Redux and Context API',
            level: 3,
            section: 'Frontend Development',
            difficulty: 'advanced',
            estimatedTime: '2 weeks',
        },
    },
    {
        id: 'node-4',
        type: 'skill',
        position: { x: 200, y: 250 },
        data: {
            label: 'CSS Grid & Flexbox',
            description: 'Modern CSS layout techniques',
            level: 2,
            section: 'Styling',
            difficulty: 'intermediate',
            estimatedTime: '1 week',
        },
    },
];

const sampleEdges: RoadmapEdge[] = [
    {
        id: 'edge-1',
        source: 'node-1',
        target: 'node-2',
        type: 'progression',
        data: {
            relationship: 'leads-to',
            label: 'Next Step',
        },
    },
    {
        id: 'edge-2',
        source: 'node-2',
        target: 'node-3',
        type: 'progression',
        data: {
            relationship: 'leads-to',
            label: 'Advanced',
        },
    },
    {
        id: 'edge-3',
        source: 'node-1',
        target: 'node-4',
        type: 'related',
        data: {
            relationship: 'related-to',
            label: 'Related',
        },
    },
];

/**
 * Selection system example component
 */
export function SelectionSystemExample() {
    const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false);
    const [selectionConfig, setSelectionConfig] = useState({
        enableMultiSelection: true,
        enableRangeSelection: true,
        enableKeyboardNavigation: true,
        maxSelections: 0,
    });

    // Selection manager với full configuration
    const selectionManager = useSelectionManager({
        nodes: sampleNodes,
        edges: sampleEdges,
        config: {
            ...selectionConfig,
            enableConnectedHighlighting: true,
            clearOnBackgroundClick: true,
            selectConnectedOnDoubleClick: true,
            highlightOnHover: true,
            announceSelections: true,
        },
        onNodeSelect: (nodeId, selected) => {
            console.log(`Node ${nodeId} ${selected ? 'selected' : 'deselected'}`);
        },
        onEdgeSelect: (edgeId, selected) => {
            console.log(`Edge ${edgeId} ${selected ? 'selected' : 'deselected'}`);
        },
        onSelectionChange: (state) => {
            console.log('Selection state changed:', state);
        },
    });

    return (
        <div className="w-full h-screen bg-background-primary p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                        Selection System Demo
                    </h1>
                    <p className="text-neutral-600">
                        Demonstration của comprehensive selection management system
                    </p>
                </div>

                {/* Configuration Panel */}
                <div className="mb-6 p-4 bg-white rounded-xl shadow-soft border border-neutral-200">
                    <h2 className="text-lg font-semibold text-neutral-800 mb-4">
                        Configuration
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={selectionConfig.enableMultiSelection}
                                onChange={(e) => setSelectionConfig(prev => ({
                                    ...prev,
                                    enableMultiSelection: e.target.checked
                                }))}
                                className="rounded border-neutral-300 text-primary-500 focus:ring-primary-200"
                            />
                            <span className="text-sm text-neutral-700">Multi Selection</span>
                        </label>

                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={selectionConfig.enableRangeSelection}
                                onChange={(e) => setSelectionConfig(prev => ({
                                    ...prev,
                                    enableRangeSelection: e.target.checked
                                }))}
                                className="rounded border-neutral-300 text-primary-500 focus:ring-primary-200"
                            />
                            <span className="text-sm text-neutral-700">Range Selection</span>
                        </label>

                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={selectionConfig.enableKeyboardNavigation}
                                onChange={(e) => setSelectionConfig(prev => ({
                                    ...prev,
                                    enableKeyboardNavigation: e.target.checked
                                }))}
                                className="rounded border-neutral-300 text-primary-500 focus:ring-primary-200"
                            />
                            <span className="text-sm text-neutral-700">Keyboard Navigation</span>
                        </label>

                        <div className="flex items-center gap-2">
                            <label className="text-sm text-neutral-700">Max Selections:</label>
                            <input
                                type="number"
                                min="0"
                                max="10"
                                value={selectionConfig.maxSelections}
                                onChange={(e) => setSelectionConfig(prev => ({
                                    ...prev,
                                    maxSelections: parseInt(e.target.value) || 0
                                }))}
                                className="w-16 px-2 py-1 text-sm border border-neutral-300 rounded focus:ring-2 focus:ring-primary-200"
                            />
                        </div>
                    </div>

                    <div className="mt-4">
                        <button
                            onClick={() => setShowAdvancedFeatures(!showAdvancedFeatures)}
                            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                        >
                            {showAdvancedFeatures ? 'Hide' : 'Show'} Advanced Features
                        </button>
                    </div>
                </div>

                {/* Main Demo Area */}
                <div className="relative bg-white rounded-xl shadow-soft border border-neutral-200 h-96 overflow-hidden">
                    {/* Selection Toolbar */}
                    <SelectionToolbar
                        selectedCount={selectionManager.selectedCount}
                        selectionMode={selectionManager.selectionMode}
                        onSelectAll={selectionManager.selectAll}
                        onClearSelection={selectionManager.clearSelection}
                        onInvertSelection={selectionManager.invertSelection}
                        onSetSelectionMode={selectionManager.setSelectionMode}
                        enableMultiSelection={selectionConfig.enableMultiSelection}
                        enableRangeSelection={selectionConfig.enableRangeSelection}
                        maxSelections={selectionConfig.maxSelections}
                        position="top"
                    />

                    {/* Demo Nodes */}
                    <div className="absolute inset-0 p-8">
                        {sampleNodes.map((node) => {
                            const isSelected = selectionManager.isNodeSelected(node.id);
                            const isHighlighted = selectionManager.isNodeHighlighted(node.id);
                            const isPrimary = selectionManager.primarySelectedNode === node.id;

                            return (
                                <div
                                    key={node.id}
                                    className={`
                                        absolute w-48 h-16 rounded-lg border-2 p-3 cursor-pointer transition-all duration-200
                                        ${isSelected
                                            ? 'border-primary-500 bg-primary-50 shadow-medium'
                                            : isHighlighted
                                                ? 'border-secondary-300 bg-secondary-50'
                                                : 'border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-soft'
                                        }
                                        ${isPrimary ? 'ring-2 ring-primary-400 ring-opacity-50' : ''}
                                    `}
                                    style={{
                                        left: node.position.x,
                                        top: node.position.y,
                                    }}
                                    onClick={(e) => selectionManager.handleNodeClick(node.id, {
                                        ctrlKey: e.ctrlKey,
                                        shiftKey: e.shiftKey,
                                        altKey: e.altKey,
                                    })}
                                    onDoubleClick={() => selectionManager.handleNodeDoubleClick(node.id)}
                                    onMouseEnter={() => selectionManager.handleNodeHover(node.id)}
                                    onMouseLeave={() => selectionManager.handleNodeHover(null)}
                                >
                                    <div className="text-sm font-medium text-neutral-800 truncate">
                                        {node.data.label}
                                    </div>
                                    <div className="text-xs text-neutral-500 truncate">
                                        {node.data.difficulty} • {node.data.estimatedTime}
                                    </div>

                                    {isPrimary && (
                                        <div className="absolute -top-2 -right-2 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Demo Edges (simplified visualization) */}
                        <svg className="absolute inset-0 pointer-events-none">
                            {sampleEdges.map((edge) => {
                                const sourceNode = sampleNodes.find(n => n.id === edge.source);
                                const targetNode = sampleNodes.find(n => n.id === edge.target);

                                if (!sourceNode || !targetNode) return null;

                                const isHighlighted = selectionManager.isEdgeHighlighted(edge.id);
                                const startX = sourceNode.position.x + 96; // Node center
                                const startY = sourceNode.position.y + 32;
                                const endX = targetNode.position.x + 96;
                                const endY = targetNode.position.y + 32;

                                return (
                                    <line
                                        key={edge.id}
                                        x1={startX}
                                        y1={startY}
                                        x2={endX}
                                        y2={endY}
                                        stroke={isHighlighted ? 'var(--color-primary-500)' : 'var(--color-neutral-400)'}
                                        strokeWidth={isHighlighted ? 3 : 2}
                                        strokeDasharray="5,5"
                                        className="cursor-pointer"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            selectionManager.handleEdgeClick(edge.id, {
                                                ctrlKey: e.ctrlKey,
                                                shiftKey: e.shiftKey,
                                                altKey: e.altKey,
                                            });
                                        }}
                                    />
                                );
                            })}
                        </svg>
                    </div>

                    {/* Selection Indicator */}
                    <SelectionIndicator
                        selectedNodes={selectionManager.selectionState.selectedNodes}
                        selectedEdges={selectionManager.selectionState.selectedEdges}
                        highlightedNodes={selectionManager.selectionState.highlightedNodes}
                        highlightedEdges={selectionManager.selectionState.highlightedEdges}
                        primarySelectedNode={selectionManager.primarySelectedNode}
                        primarySelectedEdge={selectionManager.primarySelectedEdge}
                        nodes={sampleNodes}
                        edges={sampleEdges}
                        showConnections={true}
                        showLabels={false}
                        animateSelection={true}
                    />
                </div>

                {/* Advanced Features Panel */}
                {showAdvancedFeatures && (
                    <div className="mt-6 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                        <h3 className="text-lg font-semibold text-neutral-800 mb-4">
                            Advanced Features
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Selection Statistics */}
                            <div className="bg-white p-4 rounded-lg shadow-soft">
                                <h4 className="font-medium text-neutral-800 mb-2">Selection Stats</h4>
                                <div className="space-y-1 text-sm text-neutral-600">
                                    <div>Nodes: {selectionManager.selectedCount.nodes}</div>
                                    <div>Edges: {selectionManager.selectedCount.edges}</div>
                                    <div>Total: {selectionManager.selectedCount.total}</div>
                                    <div>Mode: {selectionManager.selectionMode}</div>
                                </div>
                            </div>

                            {/* Primary Selection Info */}
                            <div className="bg-white p-4 rounded-lg shadow-soft">
                                <h4 className="font-medium text-neutral-800 mb-2">Primary Selection</h4>
                                <div className="space-y-1 text-sm text-neutral-600">
                                    <div>Node: {selectionManager.primarySelectedNode || 'None'}</div>
                                    <div>Edge: {selectionManager.primarySelectedEdge || 'None'}</div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="bg-white p-4 rounded-lg shadow-soft">
                                <h4 className="font-medium text-neutral-800 mb-2">Actions</h4>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => {
                                            const randomNode = sampleNodes[Math.floor(Math.random() * sampleNodes.length)];
                                            selectionManager.handleNodeClick(randomNode.id);
                                        }}
                                        className="w-full px-3 py-1 text-sm bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors"
                                    >
                                        Random Select
                                    </button>

                                    <button
                                        onClick={() => {
                                            console.log('Current selection state:', selectionManager.selectionState);
                                        }}
                                        className="w-full px-3 py-1 text-sm bg-secondary-500 text-white rounded hover:bg-secondary-600 transition-colors"
                                    >
                                        Log State
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Instructions */}
                <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">
                        How to Use
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
                        <div>
                            <h4 className="font-medium mb-1">Mouse Interactions:</h4>
                            <ul className="space-y-1">
                                <li>• Click: Select single element</li>
                                <li>• Ctrl+Click: Toggle multi-selection</li>
                                <li>• Shift+Click: Range selection</li>
                                <li>• Double-click: Select connected elements</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-medium mb-1">Keyboard Shortcuts:</h4>
                            <ul className="space-y-1">
                                <li>• Ctrl+A: Select all</li>
                                <li>• Escape: Clear selection</li>
                                <li>• Arrow keys: Navigate selection</li>
                                <li>• Tab: Cycle through selected</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}