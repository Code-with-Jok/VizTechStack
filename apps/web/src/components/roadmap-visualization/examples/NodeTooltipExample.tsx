'use client';

/**
 * Example component demonstrating NodeTooltip usage
 * Shows different tooltip scenarios and configurations
 * 
 * Task 4.1.1: Implement NodeTooltip component
 * - Demonstrates tooltip with different node types
 * - Shows smart positioning behavior
 * - Illustrates performance optimizations
 */

import React, { useState } from 'react';
import { NodeTooltip } from '../NodeTooltip';
import { useNodeTooltip } from '../../../hooks/useNodeTooltip';
import type { NodeData } from '@viztechstack/roadmap-visualization';

// Sample node data for different scenarios
const sampleNodes: Record<string, NodeData> = {
    basicTopic: {
        label: 'JavaScript Fundamentals',
        description: 'Learn the core concepts of JavaScript programming language including variables, functions, and control structures.',
        level: 1,
        section: 'Programming Basics',
        estimatedTime: '4 hours',
        difficulty: 'beginner',
        completed: false
    },
    skillNode: {
        label: 'React Hooks',
        description: 'Master React Hooks including useState, useEffect, useContext, and custom hooks for modern React development.',
        level: 3,
        section: 'Frontend Development',
        estimatedTime: '6 hours',
        difficulty: 'intermediate',
        completed: true,
        category: 'skill',
        targetArticleId: 'react-hooks-guide',
        resources: [
            {
                title: 'React Hooks Documentation',
                url: 'https://reactjs.org/docs/hooks-intro.html',
                type: 'documentation'
            },
            {
                title: 'Hooks Tutorial Video',
                url: 'https://youtube.com/watch?v=hooks',
                type: 'video'
            },
            {
                title: 'Advanced Hooks Course',
                url: 'https://course.com/hooks',
                type: 'course'
            }
        ]
    },
    roleNode: {
        label: 'Frontend Developer',
        description: 'Complete roadmap for becoming a professional frontend developer with modern tools and frameworks.',
        level: 5,
        section: 'Career Paths',
        estimatedTime: '6 months',
        difficulty: 'advanced',
        completed: false,
        category: 'role',
        targetRoadmapId: 'frontend-developer-roadmap',
        resources: [
            {
                title: 'Frontend Developer Handbook',
                url: 'https://frontendmasters.com/books/front-end-handbook/',
                type: 'book'
            }
        ]
    },
    minimalNode: {
        label: 'CSS Grid',
        level: 2,
        section: 'Styling'
    }
};

export function NodeTooltipExample() {
    const [selectedNode, setSelectedNode] = useState<string>('basicTopic');
    const [mousePosition, setMousePosition] = useState({ x: 200, y: 200 });
    const [showTooltip, setShowTooltip] = useState(false);

    // Demonstrate the hook usage
    const tooltip = useNodeTooltip({
        showDelay: 200,
        hideDelay: 100,
        enabled: true
    });

    const handleMouseMove = (event: React.MouseEvent) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        setMousePosition({ x, y });

        if (showTooltip) {
            tooltip.updateMousePosition(x, y);
        }
    };

    const handleMouseEnter = (nodeKey: string) => {
        setSelectedNode(nodeKey);
        setShowTooltip(true);
        tooltip.showTooltip(sampleNodes[nodeKey], mousePosition.x, mousePosition.y, nodeKey);
    };

    const handleMouseLeave = (nodeKey: string) => {
        setShowTooltip(false);
        tooltip.hideTooltip(nodeKey);
    };

    return (
        <div className="p-8 bg-gradient-to-br from-neutral-50 to-neutral-100 min-h-screen">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-neutral-900 mb-4">
                        NodeTooltip Component Examples
                    </h1>
                    <p className="text-neutral-600 max-w-2xl mx-auto">
                        Hover over the nodes below to see different tooltip configurations.
                        The tooltips demonstrate smart positioning, metadata display, and smooth animations.
                    </p>
                </div>

                {/* Interactive demo area */}
                <div
                    className="relative bg-white rounded-2xl shadow-large p-8 min-h-96 border border-neutral-200"
                    onMouseMove={handleMouseMove}
                >
                    <h2 className="text-xl font-semibold text-neutral-900 mb-6">
                        Interactive Demo Area
                    </h2>

                    {/* Sample nodes */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {Object.entries(sampleNodes).map(([key, nodeData]) => (
                            <div
                                key={key}
                                className="relative group cursor-pointer"
                                onMouseEnter={() => handleMouseEnter(key)}
                                onMouseLeave={() => handleMouseLeave(key)}
                            >
                                <div className={`
                                    p-4 rounded-xl border-2 transition-all duration-200
                                    ${nodeData.completed
                                        ? 'bg-success-50 border-success-200 text-success-800'
                                        : nodeData.category === 'role'
                                            ? 'bg-primary-50 border-primary-200 text-primary-800'
                                            : nodeData.category === 'skill'
                                                ? 'bg-secondary-50 border-secondary-200 text-secondary-800'
                                                : 'bg-neutral-50 border-neutral-200 text-neutral-800'
                                    }
                                    group-hover:shadow-medium group-hover:-translate-y-1
                                    group-hover:scale-105
                                `}>
                                    {/* Category icon */}
                                    {nodeData.category && (
                                        <div className="text-lg mb-2">
                                            {nodeData.category === 'role' ? '👤' :
                                                nodeData.category === 'skill' ? '🎯' : '📌'}
                                        </div>
                                    )}

                                    {/* Node title */}
                                    <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                                        {nodeData.label}
                                    </h3>

                                    {/* Quick metadata */}
                                    <div className="flex items-center justify-between text-xs">
                                        {nodeData.difficulty && (
                                            <span className="px-2 py-1 bg-white/50 rounded">
                                                {nodeData.difficulty}
                                            </span>
                                        )}
                                        {nodeData.estimatedTime && (
                                            <span className="opacity-75">
                                                {nodeData.estimatedTime}
                                            </span>
                                        )}
                                    </div>

                                    {/* Completion indicator */}
                                    {nodeData.completed && (
                                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-success-500 rounded-full flex items-center justify-center">
                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Tooltip using direct component */}
                    <NodeTooltip
                        nodeData={sampleNodes[selectedNode]}
                        isVisible={showTooltip}
                        mousePosition={mousePosition}
                        onClose={() => setShowTooltip(false)}
                    />

                    {/* Tooltip using hook */}
                    {tooltip.tooltipState.isVisible && tooltip.tooltipState.nodeData && (
                        <NodeTooltip
                            nodeData={tooltip.tooltipState.nodeData}
                            isVisible={tooltip.tooltipState.isVisible}
                            mousePosition={tooltip.tooltipState.mousePosition}
                            onClose={tooltip.forceHide}
                            className="opacity-50" // Slightly transparent to show both tooltips
                        />
                    )}
                </div>

                {/* Configuration panel */}
                <div className="bg-white rounded-2xl shadow-large p-6 border border-neutral-200">
                    <h2 className="text-xl font-semibold text-neutral-900 mb-4">
                        Tooltip Features
                    </h2>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-medium text-neutral-800 mb-3">Smart Positioning</h3>
                            <ul className="space-y-2 text-sm text-neutral-600">
                                <li className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
                                    Automatically avoids viewport edges
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
                                    Dynamic arrow positioning
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
                                    Responsive to window resize
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-medium text-neutral-800 mb-3">Performance Features</h3>
                            <ul className="space-y-2 text-sm text-neutral-600">
                                <li className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-success-400 rounded-full"></div>
                                    Debounced show/hide for smooth UX
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-success-400 rounded-full"></div>
                                    Optimized for frequent hover events
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-success-400 rounded-full"></div>
                                    Minimal re-renders with smart state
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Node type examples */}
                <div className="bg-white rounded-2xl shadow-large p-6 border border-neutral-200">
                    <h2 className="text-xl font-semibold text-neutral-900 mb-4">
                        Node Type Examples
                    </h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-neutral-50 rounded-lg">
                            <div className="text-2xl mb-2">📌</div>
                            <h3 className="font-medium text-sm">Basic Topic</h3>
                            <p className="text-xs text-neutral-600 mt-1">
                                Standard learning topic with description and metadata
                            </p>
                        </div>

                        <div className="text-center p-4 bg-secondary-50 rounded-lg">
                            <div className="text-2xl mb-2">🎯</div>
                            <h3 className="font-medium text-sm">Skill Node</h3>
                            <p className="text-xs text-neutral-600 mt-1">
                                Links to articles with resources and navigation
                            </p>
                        </div>

                        <div className="text-center p-4 bg-primary-50 rounded-lg">
                            <div className="text-2xl mb-2">👤</div>
                            <h3 className="font-medium text-sm">Role Node</h3>
                            <p className="text-xs text-neutral-600 mt-1">
                                Career path linking to sub-roadmaps
                            </p>
                        </div>

                        <div className="text-center p-4 bg-warning-50 rounded-lg">
                            <div className="text-2xl mb-2">⚡</div>
                            <h3 className="font-medium text-sm">Minimal Node</h3>
                            <p className="text-xs text-neutral-600 mt-1">
                                Basic node with minimal information
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}