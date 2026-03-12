'use client';

/**
 * Example component demonstrating EdgeDetailsPanel usage
 * Hiển thị các trường hợp sử dụng khác nhau của EdgeDetailsPanel
 */

import React, { useState } from 'react';
import { EdgeDetailsPanel } from '../EdgeDetailsPanel';
import type { EdgeRelationshipDetails } from '@/hooks/useEdgeInteraction';
import type { RoadmapNode } from '@viztechstack/roadmap-visualization';

/**
 * Mock data cho examples
 */
const mockNodes: RoadmapNode[] = [
    {
        id: 'html-basics',
        type: 'topic',
        position: { x: 0, y: 0 },
        data: {
            label: 'HTML Cơ Bản',
            description: 'Học các thẻ HTML cơ bản và cấu trúc trang web',
            level: 1,
            section: 'Frontend Fundamentals',
            difficulty: 'beginner',
            estimatedTime: '2 tuần',
            learningObjectives: [
                'Hiểu cấu trúc HTML document',
                'Sử dụng các thẻ HTML phổ biến',
                'Tạo forms và tables'
            ]
        }
    },
    {
        id: 'css-fundamentals',
        type: 'topic',
        position: { x: 200, y: 0 },
        data: {
            label: 'CSS Fundamentals',
            description: 'Styling và layout với CSS',
            level: 2,
            section: 'Frontend Fundamentals',
            difficulty: 'intermediate',
            estimatedTime: '3 tuần',
            learningObjectives: [
                'Hiểu CSS selectors và properties',
                'Làm chủ Flexbox và Grid',
                'Responsive design principles'
            ]
        }
    },
    {
        id: 'javascript-basics',
        type: 'topic',
        position: { x: 400, y: 0 },
        data: {
            label: 'JavaScript Cơ Bản',
            description: 'Lập trình JavaScript từ cơ bản đến nâng cao',
            level: 3,
            section: 'Programming',
            difficulty: 'advanced',
            estimatedTime: '4 tuần',
            learningObjectives: [
                'Variables, functions, và control flow',
                'DOM manipulation',
                'Event handling và async programming'
            ]
        }
    }
];

/**
 * Mock relationship details cho different scenarios
 */
const mockRelationshipDetails: Record<string, EdgeRelationshipDetails> = {
    prerequisite: {
        edgeId: 'html-to-css',
        sourceNode: mockNodes[0],
        targetNode: mockNodes[1],
        relationship: 'prerequisite',
        strength: 0.9,
        bidirectional: false,
        description: '"HTML Cơ Bản" là điều kiện tiên quyết để học "CSS Fundamentals"',
        reasoning: 'Cần nắm vững kiến thức HTML trước khi có thể styling hiệu quả với CSS'
    },
    'leads-to': {
        edgeId: 'css-to-js',
        sourceNode: mockNodes[1],
        targetNode: mockNodes[2],
        relationship: 'leads-to',
        strength: 0.7,
        bidirectional: false,
        description: 'Hoàn thành "CSS Fundamentals" sẽ dẫn đến "JavaScript Cơ Bản"',
        reasoning: 'Tiến trình học tập tự nhiên từ styling sang programming logic'
    },
    'related-to': {
        edgeId: 'html-js-related',
        sourceNode: mockNodes[0],
        targetNode: mockNodes[2],
        relationship: 'related-to',
        strength: 0.5,
        bidirectional: true,
        description: '"HTML Cơ Bản" có liên quan đến "JavaScript Cơ Bản"',
        reasoning: 'JavaScript thường được sử dụng để manipulate HTML elements'
    },
    'part-of': {
        edgeId: 'css-part-of-frontend',
        sourceNode: mockNodes[1],
        targetNode: mockNodes[0],
        relationship: 'part-of',
        strength: 0.8,
        bidirectional: false,
        description: '"CSS Fundamentals" là một phần của "HTML Cơ Bản"',
        reasoning: 'CSS là extension của HTML trong frontend development stack'
    }
};

/**
 * EdgeDetailsPanelExample component
 */
export function EdgeDetailsPanelExample() {
    const [selectedExample, setSelectedExample] = useState<string | null>(null);
    const [showPanel, setShowPanel] = useState(false);

    const handleExampleSelect = (exampleKey: string) => {
        setSelectedExample(exampleKey);
        setShowPanel(true);
    };

    const handleClose = () => {
        setShowPanel(false);
        setSelectedExample(null);
    };

    const handleNavigateToNode = (nodeId: string) => {
        console.log('Navigate to node:', nodeId);
        // In real app, this would trigger node selection
        alert(`Navigating to node: ${nodeId}`);
    };

    return (
        <div className="p-8 bg-background-primary min-h-screen">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                        EdgeDetailsPanel Examples
                    </h1>
                    <p className="text-lg text-neutral-600 dark:text-neutral-400">
                        Demonstrating different relationship types and their details
                    </p>
                </div>

                {/* Example Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(mockRelationshipDetails).map(([key, details]) => (
                        <button
                            key={key}
                            onClick={() => handleExampleSelect(key)}
                            className="p-6 text-left bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:border-primary-300 dark:hover:border-primary-600 transition-colors duration-200 group"
                        >
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">
                                        {key === 'prerequisite' && '🔒'}
                                        {key === 'leads-to' && '➡️'}
                                        {key === 'related-to' && '🔗'}
                                        {key === 'part-of' && '📦'}
                                    </span>
                                    <h3 className="font-semibold text-lg text-neutral-900 dark:text-neutral-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
                                        {key === 'prerequisite' && 'Prerequisite Relationship'}
                                        {key === 'leads-to' && 'Progression Relationship'}
                                        {key === 'related-to' && 'Related Relationship'}
                                        {key === 'part-of' && 'Hierarchical Relationship'}
                                    </h3>
                                </div>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                    {details.description}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-500">
                                    <span>Strength: {Math.round((details.strength || 0) * 100)}%</span>
                                    {details.bidirectional && <span>↔️ Bidirectional</span>}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Instructions */}
                <div className="bg-primary-50 dark:bg-primary-950 rounded-xl p-6 border border-primary-200 dark:border-primary-800">
                    <h3 className="font-semibold text-primary-900 dark:text-primary-100 mb-3">
                        How to Use
                    </h3>
                    <ul className="space-y-2 text-sm text-primary-800 dark:text-primary-200">
                        <li>• Click on any relationship type above to see the EdgeDetailsPanel</li>
                        <li>• Each example shows different relationship characteristics</li>
                        <li>• Notice the different colors, icons, and strength indicators</li>
                        <li>• Try the navigation buttons to see the interaction behavior</li>
                    </ul>
                </div>

                {/* Panel Display Area */}
                {showPanel && selectedExample && (
                    <div className="relative">
                        <div className="bg-neutral-100 dark:bg-neutral-900 rounded-xl p-8 border-2 border-dashed border-neutral-300 dark:border-neutral-700">
                            <div className="text-center mb-6">
                                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                                    EdgeDetailsPanel Preview
                                </h3>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                    This is how the panel would appear in the visualization
                                </p>
                            </div>

                            <div className="flex justify-center">
                                <div className="w-96">
                                    <EdgeDetailsPanel
                                        relationshipDetails={mockRelationshipDetails[selectedExample]}
                                        onClose={handleClose}
                                        onNavigateToNode={handleNavigateToNode}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Code Example */}
                <div className="bg-neutral-900 rounded-xl p-6 overflow-x-auto">
                    <h3 className="font-semibold text-white mb-4">Usage Example</h3>
                    <pre className="text-sm text-neutral-300">
                        {`// Basic usage with useEdgeInteraction hook
const edgeInteraction = useEdgeInteraction({
    nodes: graphData.nodes,
    edges: graphData.edges,
});

// Render panel when relationship details are available
{edgeInteraction.relationshipDetails && (
    <EdgeDetailsPanel
        relationshipDetails={edgeInteraction.relationshipDetails}
        onClose={() => edgeInteraction.clearSelection()}
        onNavigateToNode={(nodeId) => {
            edgeInteraction.clearSelection();
            handleNodeSelection(nodeId);
        }}
    />
)}`}
                    </pre>
                </div>
            </div>
        </div>
    );
}