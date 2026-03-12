'use client';

/**
 * Example component demonstrating responsive NodeDetailsPanel
 * Task 4.2.2: Responsive design showcase
 */

import React, { useState } from 'react';
import { NodeDetailsPanel } from '../NodeDetailsPanel';
import type { NodeData, RoadmapNode, RoadmapEdge } from '@viztechstack/roadmap-visualization';

// Sample data for demonstration
const sampleNodeData: NodeData = {
    label: 'React Hooks và State Management',
    description: 'Học cách sử dụng React Hooks để quản lý state và side effects trong ứng dụng React hiện đại. Bao gồm useState, useEffect, useContext và custom hooks.',
    category: 'frontend',
    difficulty: 'intermediate',
    estimatedTime: '4-6 giờ',
    section: 'Frontend Development',
    level: 3,
    completed: false,
    learningObjectives: [
        'Hiểu và sử dụng thành thạo các React Hooks cơ bản',
        'Quản lý state phức tạp với useReducer',
        'Tối ưu hóa performance với useMemo và useCallback',
        'Tạo và sử dụng custom hooks hiệu quả'
    ],
    learningOutcomes: [
        'Có thể xây dựng ứng dụng React với state management hiệu quả',
        'Hiểu được lifecycle của components và cách tối ưu hóa',
        'Viết được custom hooks tái sử dụng',
        'Debug và troubleshoot các vấn đề về state'
    ],
    keyTopics: [
        'useState và useEffect',
        'useContext và Context API',
        'useReducer cho complex state',
        'useMemo và useCallback',
        'Custom Hooks',
        'Performance Optimization'
    ],
    skillsGained: [
        'React Hooks Mastery',
        'State Management',
        'Performance Optimization',
        'Component Architecture'
    ],
    resources: [
        {
            title: 'React Hooks Documentation',
            url: 'https://react.dev/reference/react',
            type: 'documentation'
        },
        {
            title: 'Complete Guide to React Hooks',
            url: 'https://example.com/react-hooks-guide',
            type: 'article'
        },
        {
            title: 'React Hooks Course',
            url: 'https://example.com/react-hooks-course',
            type: 'course'
        }
    ],
    prerequisites: ['react-basics', 'javascript-es6']
};

const sampleNodes: RoadmapNode[] = [
    {
        id: 'react-basics',
        type: 'topic',
        position: { x: 0, y: 0 },
        data: {
            label: 'React Basics',
            description: 'Học các khái niệm cơ bản của React',
            category: 'frontend',
            difficulty: 'beginner',
            completed: true,
            section: 'Frontend Development',
            level: 1
        }
    },
    {
        id: 'javascript-es6',
        type: 'topic',
        position: { x: 100, y: 0 },
        data: {
            label: 'JavaScript ES6+',
            description: 'Các tính năng hiện đại của JavaScript',
            category: 'programming',
            difficulty: 'intermediate',
            completed: true,
            section: 'Programming Fundamentals',
            level: 2
        }
    },
    {
        id: 'react-hooks',
        type: 'topic',
        position: { x: 50, y: 100 },
        data: sampleNodeData
    },
    {
        id: 'state-management',
        type: 'topic',
        position: { x: 150, y: 100 },
        data: {
            label: 'Advanced State Management',
            description: 'Redux, Zustand và các thư viện state management',
            category: 'frontend',
            difficulty: 'advanced',
            completed: false,
            section: 'Frontend Development',
            level: 4
        }
    },
    {
        id: 'react-testing',
        type: 'topic',
        position: { x: 200, y: 150 },
        data: {
            label: 'React Testing',
            description: 'Testing React components với Jest và Testing Library',
            category: 'testing',
            difficulty: 'intermediate',
            completed: false,
            section: 'Quality Assurance',
            level: 3
        }
    }
];

const sampleEdges: RoadmapEdge[] = [
    {
        id: 'edge-1',
        source: 'react-basics',
        target: 'react-hooks',
        type: 'dependency',
        data: { relationship: 'prerequisite' }
    },
    {
        id: 'edge-2',
        source: 'javascript-es6',
        target: 'react-hooks',
        type: 'dependency',
        data: { relationship: 'prerequisite' }
    },
    {
        id: 'edge-3',
        source: 'react-hooks',
        target: 'state-management',
        type: 'progression',
        data: { relationship: 'leads-to' }
    },
    {
        id: 'edge-4',
        source: 'react-hooks',
        target: 'react-testing',
        type: 'related',
        data: { relationship: 'related-to' }
    }
];

export function ResponsiveNodeDetailsPanelExample() {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedNodeId, setSelectedNodeId] = useState('react-hooks');
    const [panelState, setPanelState] = useState<'collapsed' | 'expanded' | 'minimized'>('expanded');
    const [bookmarkedNodes, setBookmarkedNodes] = useState<Set<string>>(new Set(['react-basics']));
    const [completedNodes, setCompletedNodes] = useState<Set<string>>(new Set(['react-basics', 'javascript-es6']));
    const [enablePerformanceOptimization, setEnablePerformanceOptimization] = useState(true);

    const selectedNode = sampleNodes.find(node => node.id === selectedNodeId);
    const userProgress = {
        completedNodes,
        totalNodes: sampleNodes.length,
        progressPercentage: (completedNodes.size / sampleNodes.length) * 100
    };

    const handleNodeSelect = (nodeId: string) => {
        setSelectedNodeId(nodeId);
    };

    const handleBookmark = (nodeId: string) => {
        setBookmarkedNodes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(nodeId)) {
                newSet.delete(nodeId);
            } else {
                newSet.add(nodeId);
            }
            return newSet;
        });
    };

    const handleMarkComplete = (nodeId: string, completed: boolean) => {
        setCompletedNodes(prev => {
            const newSet = new Set(prev);
            if (completed) {
                newSet.add(nodeId);
            } else {
                newSet.delete(nodeId);
            }
            return newSet;
        });
    };

    const handleShare = (nodeId: string) => {
        console.log('Sharing node:', nodeId);
        // In real implementation, this would handle sharing
    };

    const handleNavigate = (url: string, openInNewTab?: boolean) => {
        console.log('Navigating to:', url, 'New tab:', openInNewTab);
        // In real implementation, this would handle navigation
    };

    if (!selectedNode) {
        return <div>Node not found</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-soft p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-4">
                        Responsive NodeDetailsPanel Demo
                    </h1>
                    <p className="text-neutral-600 mb-6">
                        Demonstration của NodeDetailsPanel với responsive design, collapse/expand functionality và performance optimization.
                    </p>

                    {/* Controls */}
                    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-soft border border-neutral-200 mb-6">
                        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Controls</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Panel Visibility */}
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Panel Visibility
                                </label>
                                <button
                                    onClick={() => setIsOpen(!isOpen)}
                                    className={`w-full px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${isOpen
                                            ? 'bg-primary-50 border-primary-200 text-primary-700'
                                            : 'bg-neutral-50 border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                                        }`}
                                >
                                    {isOpen ? 'Hide Panel' : 'Show Panel'}
                                </button>
                            </div>

                            {/* Node Selection */}
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Selected Node
                                </label>
                                <select
                                    value={selectedNodeId}
                                    onChange={(e) => setSelectedNodeId(e.target.value)}
                                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                                >
                                    {sampleNodes.map(node => (
                                        <option key={node.id} value={node.id}>
                                            {node.data.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Panel State */}
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Panel State
                                </label>
                                <select
                                    value={panelState}
                                    onChange={(e) => setPanelState(e.target.value as any)}
                                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                                >
                                    <option value="expanded">Expanded</option>
                                    <option value="collapsed">Collapsed</option>
                                    <option value="minimized">Minimized</option>
                                </select>
                            </div>

                            {/* Performance Optimization */}
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Performance
                                </label>
                                <button
                                    onClick={() => setEnablePerformanceOptimization(!enablePerformanceOptimization)}
                                    className={`w-full px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${enablePerformanceOptimization
                                            ? 'bg-success-50 border-success-200 text-success-700'
                                            : 'bg-neutral-50 border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                                        }`}
                                >
                                    {enablePerformanceOptimization ? 'Optimized' : 'Standard'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Features Overview */}
                    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-soft border border-neutral-200 mb-6">
                        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Responsive Features</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-lg">📱</span>
                                    <h3 className="font-medium text-primary-800">Mobile Optimized</h3>
                                </div>
                                <p className="text-sm text-primary-700">
                                    Adaptive layout cho mobile devices với touch-friendly controls
                                </p>
                            </div>

                            <div className="p-4 bg-success-50 border border-success-200 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-lg">⚡</span>
                                    <h3 className="font-medium text-success-800">Performance</h3>
                                </div>
                                <p className="text-sm text-success-700">
                                    Virtualization và lazy loading cho large datasets
                                </p>
                            </div>

                            <div className="p-4 bg-warning-50 border border-warning-200 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-lg">🎛️</span>
                                    <h3 className="font-medium text-warning-800">Flexible States</h3>
                                </div>
                                <p className="text-sm text-warning-700">
                                    Collapsed, minimized và expanded states với smooth transitions
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Demo Area */}
                <div className="relative">
                    <div className="bg-neutral-100 rounded-xl p-8 min-h-[400px] flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-6xl mb-4">🗺️</div>
                            <h3 className="text-xl font-semibold text-neutral-700 mb-2">
                                Roadmap Visualization Area
                            </h3>
                            <p className="text-neutral-600">
                                NodeDetailsPanel sẽ xuất hiện ở đây khi được mở
                            </p>
                        </div>
                    </div>

                    {/* NodeDetailsPanel */}
                    {isOpen && (
                        <div className="absolute top-4 right-4 z-10">
                            <NodeDetailsPanel
                                nodeId={selectedNode.id}
                                nodeData={selectedNode.data}
                                onClose={() => setIsOpen(false)}
                                onNodeSelect={handleNodeSelect}
                                onNavigate={handleNavigate}
                                onBookmark={handleBookmark}
                                onShare={handleShare}
                                onMarkComplete={handleMarkComplete}
                                allNodes={sampleNodes}
                                allEdges={sampleEdges}
                                isBookmarked={bookmarkedNodes.has(selectedNode.id)}
                                userProgress={userProgress}
                                initialPanelState={panelState}
                                enablePerformanceOptimization={enablePerformanceOptimization}
                                onPanelStateChange={setPanelState}
                            />
                        </div>
                    )}
                </div>

                {/* Usage Instructions */}
                <div className="mt-8 bg-white rounded-xl p-4 sm:p-6 shadow-soft border border-neutral-200">
                    <h2 className="text-lg font-semibold text-neutral-900 mb-4">Usage Instructions</h2>

                    <div className="space-y-4">
                        <div>
                            <h3 className="font-medium text-neutral-800 mb-2">Responsive Breakpoints</h3>
                            <ul className="text-sm text-neutral-600 space-y-1 ml-4">
                                <li>• <strong>Mobile (&lt; 768px):</strong> Compact layout, minimized by default</li>
                                <li>• <strong>Tablet (768px - 1024px):</strong> Medium layout với adaptive controls</li>
                                <li>• <strong>Desktop (&gt; 1024px):</strong> Full layout với all features</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-medium text-neutral-800 mb-2">Keyboard Shortcuts</h3>
                            <ul className="text-sm text-neutral-600 space-y-1 ml-4">
                                <li>• <strong>Escape:</strong> Collapse panel hoặc close</li>
                                <li>• <strong>Ctrl + Tab:</strong> Switch between tabs</li>
                                <li>• <strong>Ctrl + Space:</strong> Toggle panel state</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-medium text-neutral-800 mb-2">Performance Features</h3>
                            <ul className="text-sm text-neutral-600 space-y-1 ml-4">
                                <li>• <strong>Virtualization:</strong> Chỉ render visible items trong large lists</li>
                                <li>• <strong>Memory Management:</strong> Automatic cleanup và caching</li>
                                <li>• <strong>Lazy Loading:</strong> Load content on demand</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}