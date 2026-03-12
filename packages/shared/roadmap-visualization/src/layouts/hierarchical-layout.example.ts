/**
 * Example usage of HierarchicalLayout algorithm
 * Demonstrates topic progression positioning with optimized spacing and alignment
 * 
 * Validates: Requirement 3.1
 */

import {
    HierarchicalLayout,
    createHierarchicalLayout,
    applyHierarchicalLayout,
    applyProgressionOptimizedLayout,
    getOptimalHierarchicalOptions,
    type HierarchicalLayoutOptions,
    type HierarchicalLayoutResult
} from './hierarchical-layout';
import type { GraphData, RoadmapNode, RoadmapEdge } from '../types/index';

/**
 * Example: Basic hierarchical layout usage
 */
export function basicHierarchicalLayoutExample(): HierarchicalLayoutResult {
    // Sample roadmap data with topic progression levels
    const sampleGraphData: GraphData = {
        nodes: [
            {
                id: 'html-basics',
                type: 'topic',
                position: { x: 0, y: 0 },
                data: {
                    label: 'HTML Basics',
                    description: 'Learn fundamental HTML concepts',
                    level: 0,
                    section: 'Frontend Fundamentals',
                    estimatedTime: '2 weeks',
                    difficulty: 'beginner'
                }
            },
            {
                id: 'css-basics',
                type: 'topic',
                position: { x: 0, y: 0 },
                data: {
                    label: 'CSS Basics',
                    description: 'Learn styling with CSS',
                    level: 1,
                    section: 'Frontend Fundamentals',
                    estimatedTime: '3 weeks',
                    difficulty: 'beginner',
                    prerequisites: ['html-basics']
                }
            },
            {
                id: 'javascript-basics',
                type: 'topic',
                position: { x: 0, y: 0 },
                data: {
                    label: 'JavaScript Basics',
                    description: 'Learn programming with JavaScript',
                    level: 2,
                    section: 'Frontend Fundamentals',
                    estimatedTime: '4 weeks',
                    difficulty: 'intermediate',
                    prerequisites: ['html-basics', 'css-basics']
                }
            },
            {
                id: 'react-basics',
                type: 'topic',
                position: { x: 0, y: 0 },
                data: {
                    label: 'React Basics',
                    description: 'Learn React framework',
                    level: 3,
                    section: 'Frontend Frameworks',
                    estimatedTime: '6 weeks',
                    difficulty: 'intermediate',
                    prerequisites: ['javascript-basics']
                }
            }
        ],
        edges: [
            {
                id: 'html-to-css',
                source: 'html-basics',
                target: 'css-basics',
                type: 'progression',
                data: {
                    relationship: 'leads-to',
                    strength: 0.9
                }
            },
            {
                id: 'css-to-js',
                source: 'css-basics',
                target: 'javascript-basics',
                type: 'progression',
                data: {
                    relationship: 'leads-to',
                    strength: 0.8
                }
            },
            {
                id: 'js-to-react',
                source: 'javascript-basics',
                target: 'react-basics',
                type: 'dependency',
                data: {
                    relationship: 'prerequisite',
                    strength: 1.0
                }
            }
        ],
        metadata: {
            totalNodes: 4,
            totalEdges: 3,
            maxDepth: 3,
            layoutType: 'hierarchical',
            generatedAt: new Date()
        }
    };

    // Apply basic hierarchical layout
    return applyHierarchicalLayout(sampleGraphData);
}

/**
 * Example: Custom hierarchical layout with specific options
 */
export function customHierarchicalLayoutExample(): HierarchicalLayoutResult {
    const graphData = basicHierarchicalLayoutExample().nodes.length > 0
        ? createSampleGraphData()
        : createSampleGraphData();

    // Custom layout options for topic progression
    const customOptions: Partial<HierarchicalLayoutOptions> = {
        direction: 'TB', // Top-to-bottom for clear progression
        nodeWidth: 250,
        nodeHeight: 100,
        nodeSep: 60,
        rankSep: 120,
        align: 'UL',
        ranker: 'network-simplex'
    };

    const layout = createHierarchicalLayout(customOptions);
    return layout.applyLayout(graphData);
}

/**
 * Example: Progression-optimized layout
 */
export function progressionOptimizedLayoutExample(): HierarchicalLayoutResult {
    const graphData = createComplexSampleGraphData();

    // Use progression-optimized layout that automatically determines best settings
    return applyProgressionOptimizedLayout(graphData);
}

/**
 * Example: Getting optimal layout options
 */
export function optimalLayoutOptionsExample(): HierarchicalLayoutOptions {
    const graphData = createComplexSampleGraphData();

    // Get optimal options for the graph structure
    const optimalOptions = getOptimalHierarchicalOptions(graphData);

    // Create layout with optimal options
    const layout = createHierarchicalLayout(optimalOptions);

    return layout.getOptions();
}

/**
 * Example: Dynamic layout adjustment based on content
 */
export function dynamicLayoutExample(): HierarchicalLayoutResult {
    const graphData = createComplexSampleGraphData();

    const layout = new HierarchicalLayout();

    // Analyze graph structure
    const nodeCount = graphData.nodes.length;
    const levels = new Set(graphData.nodes.map(n => n.data.level || 0)).size;

    // Adjust layout based on analysis
    if (nodeCount > 20) {
        layout.updateOptions({
            nodeSep: 40,
            rankSep: 80,
            nodeWidth: 180
        });
    }

    if (levels > 5) {
        layout.updateOptions({
            direction: 'LR', // Switch to left-right for deep hierarchies
            rankSep: 150
        });
    }

    return layout.applyLayout(graphData);
}

/**
 * Helper function to create sample graph data
 */
function createSampleGraphData(): GraphData {
    return {
        nodes: [
            {
                id: 'node-1',
                type: 'topic',
                position: { x: 0, y: 0 },
                data: {
                    label: 'Foundation Topic',
                    level: 0,
                    section: 'Basics'
                }
            },
            {
                id: 'node-2',
                type: 'topic',
                position: { x: 0, y: 0 },
                data: {
                    label: 'Intermediate Topic',
                    level: 1,
                    section: 'Intermediate'
                }
            }
        ],
        edges: [
            {
                id: 'edge-1',
                source: 'node-1',
                target: 'node-2',
                type: 'progression'
            }
        ],
        metadata: {
            totalNodes: 2,
            totalEdges: 1,
            maxDepth: 1,
            layoutType: 'hierarchical',
            generatedAt: new Date()
        }
    };
}

/**
 * Helper function to create complex sample graph data
 */
function createComplexSampleGraphData(): GraphData {
    const nodes: RoadmapNode[] = [];
    const edges: RoadmapEdge[] = [];

    // Create nodes across multiple levels
    for (let level = 0; level < 4; level++) {
        for (let i = 0; i < 3; i++) {
            const nodeId = `level-${level}-node-${i}`;
            nodes.push({
                id: nodeId,
                type: 'topic',
                position: { x: 0, y: 0 },
                data: {
                    label: `Level ${level} Topic ${i + 1}`,
                    description: `Description for topic at level ${level}`,
                    level,
                    section: `Section ${level}`,
                    estimatedTime: `${level + 1} weeks`,
                    difficulty: level < 2 ? 'beginner' : 'intermediate',
                    resources: level > 1 ? [
                        {
                            title: 'Documentation',
                            url: 'https://example.com',
                            type: 'documentation'
                        }
                    ] : undefined
                }
            });

            // Create progression edges to next level
            if (level > 0) {
                const prevNodeId = `level-${level - 1}-node-${i}`;
                edges.push({
                    id: `${prevNodeId}-to-${nodeId}`,
                    source: prevNodeId,
                    target: nodeId,
                    type: 'progression',
                    data: {
                        relationship: 'leads-to',
                        strength: 0.8
                    }
                });
            }
        }
    }

    return {
        nodes,
        edges,
        metadata: {
            totalNodes: nodes.length,
            totalEdges: edges.length,
            maxDepth: 3,
            layoutType: 'hierarchical',
            generatedAt: new Date()
        }
    };
}

/**
 * Example: Layout performance testing
 */
export function performanceTestExample(): {
    result: HierarchicalLayoutResult;
    performance: {
        layoutTime: number;
        nodesPerSecond: number;
        edgesPerSecond: number;
    };
} {
    const graphData = createComplexSampleGraphData();

    const startTime = performance.now();
    const result = applyProgressionOptimizedLayout(graphData);
    const endTime = performance.now();

    const totalTime = endTime - startTime;
    const nodesPerSecond = graphData.nodes.length / (totalTime / 1000);
    const edgesPerSecond = graphData.edges.length / (totalTime / 1000);

    return {
        result,
        performance: {
            layoutTime: totalTime,
            nodesPerSecond,
            edgesPerSecond
        }
    };
}

/**
 * Example: Error handling and validation
 */
export function errorHandlingExample(): {
    success: boolean;
    error?: string;
    result?: HierarchicalLayoutResult;
} {
    try {
        // Create invalid graph data
        const invalidGraphData: GraphData = {
            nodes: [], // Empty nodes array
            edges: [],
            metadata: {
                totalNodes: 0,
                totalEdges: 0,
                maxDepth: 0,
                layoutType: 'hierarchical',
                generatedAt: new Date()
            }
        };

        const result = applyHierarchicalLayout(invalidGraphData);

        return {
            success: true,
            result
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}