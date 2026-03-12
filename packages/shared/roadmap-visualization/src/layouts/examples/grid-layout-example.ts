/**
 * Example usage of GridLayout algorithm
 * Demonstrates various ways to use the structured grid positioning system
 */

import {
    GridLayout,
    createGridLayout,
    applyGridLayout,
    applyContentOptimizedGridLayout,
    applyAutoSizedGridLayout,
    getOptimalGridOptions
} from '../grid-layout';
import type { GraphData, RoadmapNode, RoadmapEdge } from '../../types';

/**
 * Example 1: Basic grid layout usage
 */
export function basicGridLayoutExample(): void {
    // Sample graph data
    const graphData: GraphData = {
        nodes: [
            {
                id: 'html-basics',
                type: 'topic',
                position: { x: 0, y: 0 },
                data: {
                    label: 'HTML Basics',
                    level: 1,
                    section: 'Frontend Fundamentals',
                    difficulty: 'beginner',
                    estimatedTime: '2 weeks'
                }
            },
            {
                id: 'css-fundamentals',
                type: 'topic',
                position: { x: 0, y: 0 },
                data: {
                    label: 'CSS Fundamentals',
                    level: 1,
                    section: 'Frontend Fundamentals',
                    difficulty: 'beginner',
                    estimatedTime: '3 weeks'
                }
            },
            {
                id: 'javascript-basics',
                type: 'topic',
                position: { x: 0, y: 0 },
                data: {
                    label: 'JavaScript Basics',
                    level: 2,
                    section: 'Programming',
                    difficulty: 'intermediate',
                    estimatedTime: '4 weeks'
                }
            },
            {
                id: 'react-fundamentals',
                type: 'topic',
                position: { x: 0, y: 0 },
                data: {
                    label: 'React Fundamentals',
                    level: 3,
                    section: 'Frameworks',
                    difficulty: 'intermediate',
                    estimatedTime: '6 weeks'
                }
            },
            {
                id: 'nodejs-basics',
                type: 'topic',
                position: { x: 0, y: 0 },
                data: {
                    label: 'Node.js Basics',
                    level: 2,
                    section: 'Backend',
                    difficulty: 'intermediate',
                    estimatedTime: '4 weeks'
                }
            },
            {
                id: 'database-design',
                type: 'topic',
                position: { x: 0, y: 0 },
                data: {
                    label: 'Database Design',
                    level: 3,
                    section: 'Backend',
                    difficulty: 'advanced',
                    estimatedTime: '5 weeks'
                }
            }
        ],
        edges: [
            {
                id: 'html-to-css',
                source: 'html-basics',
                target: 'css-fundamentals',
                type: 'progression',
                data: { relationship: 'leads-to', strength: 0.8 }
            },
            {
                id: 'css-to-js',
                source: 'css-fundamentals',
                target: 'javascript-basics',
                type: 'progression',
                data: { relationship: 'leads-to', strength: 0.7 }
            },
            {
                id: 'js-to-react',
                source: 'javascript-basics',
                target: 'react-fundamentals',
                type: 'dependency',
                data: { relationship: 'prerequisite', strength: 0.9 }
            },
            {
                id: 'js-to-node',
                source: 'javascript-basics',
                target: 'nodejs-basics',
                type: 'related',
                data: { relationship: 'related-to', strength: 0.6 }
            },
            {
                id: 'node-to-db',
                source: 'nodejs-basics',
                target: 'database-design',
                type: 'progression',
                data: { relationship: 'leads-to', strength: 0.8 }
            }
        ],
        metadata: {
            totalNodes: 6,
            totalEdges: 5,
            maxDepth: 3,
            layoutType: 'grid',
            generatedAt: new Date()
        }
    };

    // Apply basic grid layout
    const result = applyGridLayout(graphData);

    console.log('Basic Grid Layout Result:');
    console.log(`- Layout time: ${result.metadata.layoutTime.toFixed(2)}ms`);
    console.log(`- Grid dimensions: ${result.metadata.actualColumns}x${result.metadata.actualRows}`);
    console.log(`- Cell size: ${result.metadata.cellWidth}x${result.metadata.cellHeight}`);
    console.log(`- Grid utilization: ${result.metadata.gridUtilization.toFixed(1)}%`);
    console.log(`- Bounds: ${result.bounds.width}x${result.bounds.height}`);

    // Display node positions
    result.nodes.forEach(node => {
        console.log(`  ${node.data.label}: (${node.position.x.toFixed(0)}, ${node.position.y.toFixed(0)})`);
    });
}

/**
 * Example 2: Custom grid layout options
 */
export function customGridLayoutExample(): void {
    const graphData = createSampleGraphData();

    // Create layout with custom options
    const layout = createGridLayout({
        width: 1000,
        height: 600,
        columns: 3,
        rows: 2,
        cellWidth: 250,
        cellHeight: 150,
        paddingX: 30,
        paddingY: 40,
        sortBy: 'difficulty',
        groupBy: 'section',
        enableOptimization: true,
        centerGrid: true
    });

    const result = layout.applyLayout(graphData);

    console.log('\nCustom Grid Layout Result:');
    console.log(`- Custom dimensions: ${result.metadata.actualColumns}x${result.metadata.actualRows}`);
    console.log(`- Custom cell size: ${result.metadata.cellWidth}x${result.metadata.cellHeight}`);
    console.log(`- Grid utilization: ${result.metadata.gridUtilization.toFixed(1)}%`);

    // Show how nodes are organized
    const nodesByPosition = new Map<string, RoadmapNode>();
    result.nodes.forEach(node => {
        const gridPos = `(${Math.floor(node.position.x / result.metadata.cellWidth)}, ${Math.floor(node.position.y / result.metadata.cellHeight)})`;
        nodesByPosition.set(gridPos, node);
    });

    console.log('Node organization:');
    nodesByPosition.forEach((node, position) => {
        console.log(`  ${position}: ${node.data.label} [${node.data.difficulty}]`);
    });
}

/**
 * Example 3: Content-optimized grid layout
 */
export function contentOptimizedExample(): void {
    const graphData = createSampleGraphData();

    // Apply content-optimized layout
    const result = applyContentOptimizedGridLayout(graphData);

    console.log('\nContent-Optimized Grid Layout:');
    console.log(`- Optimized dimensions: ${result.metadata.actualColumns}x${result.metadata.actualRows}`);
    console.log(`- Optimized cell size: ${result.metadata.cellWidth}x${result.metadata.cellHeight}`);
    console.log(`- Grid utilization: ${result.metadata.gridUtilization.toFixed(1)}%`);

    // Show optimal options that were calculated
    const optimalOptions = getOptimalGridOptions(graphData);
    console.log('Optimal options calculated:');
    console.log(`  - Cell size: ${optimalOptions.cellWidth}x${optimalOptions.cellHeight}`);
    console.log(`  - Group by: ${optimalOptions.groupBy}`);
    console.log(`  - Sort by: ${optimalOptions.sortBy}`);
    console.log(`  - Aspect ratio: ${optimalOptions.aspectRatio}`);
    console.log(`  - Auto size: ${optimalOptions.autoSize}`);
}

/**
 * Example 4: Auto-sized grid layout
 */
export function autoSizedExample(): void {
    const graphData = createSampleGraphData();

    // Apply auto-sized layout with different aspect ratios
    console.log('\nAuto-Sized Grid Layouts:');

    const aspectRatios = [1.0, 1.5, 2.0];
    aspectRatios.forEach(ratio => {
        const result = applyAutoSizedGridLayout(graphData, ratio);
        console.log(`Aspect ratio ${ratio}:`);
        console.log(`  - Dimensions: ${result.metadata.actualColumns}x${result.metadata.actualRows}`);
        console.log(`  - Actual ratio: ${(result.metadata.actualColumns / result.metadata.actualRows).toFixed(2)}`);
        console.log(`  - Grid utilization: ${result.metadata.gridUtilization.toFixed(1)}%`);
    });
}

/**
 * Example 5: Dynamic layout updates
 */
export function dynamicLayoutExample(): void {
    const graphData = createSampleGraphData();
    const layout = createGridLayout();

    console.log('\nDynamic Layout Updates:');

    // Initial layout
    let result = layout.applyLayout(graphData);
    console.log(`Initial: ${result.metadata.actualColumns}x${result.metadata.actualRows} grid`);

    // Update to sort by difficulty
    layout.updateOptions({ sortBy: 'difficulty', sortDirection: 'asc' });
    result = layout.applyLayout(graphData);
    console.log('After sorting by difficulty:');
    result.nodes.slice(0, 3).forEach((node, index) => {
        console.log(`  ${index + 1}. ${node.data.label} [${node.data.difficulty}]`);
    });

    // Update to group by section
    layout.updateOptions({ groupBy: 'section', sortBy: 'section' });
    result = layout.applyLayout(graphData);
    console.log('After grouping by section:');
    const sections = new Set(result.nodes.map(n => n.data.section));
    sections.forEach(section => {
        const sectionNodes = result.nodes.filter(n => n.data.section === section);
        console.log(`  ${section}: ${sectionNodes.length} nodes`);
    });

    // Update grid dimensions
    layout.updateOptions({ columns: 2, rows: 3, autoSize: false });
    result = layout.applyLayout(graphData);
    console.log(`After setting fixed dimensions: ${result.metadata.actualColumns}x${result.metadata.actualRows}`);
}

/**
 * Example 6: Error handling and edge cases
 */
export function errorHandlingExample(): void {
    console.log('\nError Handling Examples:');

    try {
        // Invalid options
        const layout = createGridLayout({
            cellWidth: -100, // Invalid: negative width
            cellHeight: 0,   // Invalid: zero height
            aspectRatio: -1  // Invalid: negative ratio
        });

        const emptyGraph: GraphData = {
            nodes: [],
            edges: [],
            metadata: {
                totalNodes: 0,
                totalEdges: 0,
                maxDepth: 0,
                layoutType: 'grid',
                generatedAt: new Date()
            }
        };

        applyGridLayout(emptyGraph);
    } catch (error) {
        console.log(`Caught expected error: ${error.message}`);
    }

    try {
        // Very large grid
        const largeGraphData = createLargeGraphData(1000);
        const result = applyGridLayout(largeGraphData);
        console.log(`Large graph handled: ${result.nodes.length} nodes in ${result.metadata.actualColumns}x${result.metadata.actualRows} grid`);
    } catch (error) {
        console.log(`Error with large graph: ${error.message}`);
    }

    // Test with minimal valid data
    const minimalGraph: GraphData = {
        nodes: [{
            id: 'single-node',
            type: 'topic',
            position: { x: 0, y: 0 },
            data: { label: 'Single Node', level: 1, section: 'test' }
        }],
        edges: [],
        metadata: {
            totalNodes: 1,
            totalEdges: 0,
            maxDepth: 1,
            layoutType: 'grid',
            generatedAt: new Date()
        }
    };

    const minimalResult = applyGridLayout(minimalGraph);
    console.log(`Minimal graph: 1 node positioned at (${minimalResult.nodes[0].position.x}, ${minimalResult.nodes[0].position.y})`);
}

/**
 * Helper function to create sample graph data
 */
function createSampleGraphData(): GraphData {
    return {
        nodes: [
            {
                id: 'html',
                type: 'topic',
                position: { x: 0, y: 0 },
                data: {
                    label: 'HTML',
                    level: 1,
                    section: 'Frontend',
                    difficulty: 'beginner',
                    description: 'HyperText Markup Language fundamentals'
                }
            },
            {
                id: 'css',
                type: 'topic',
                position: { x: 0, y: 0 },
                data: {
                    label: 'CSS',
                    level: 1,
                    section: 'Frontend',
                    difficulty: 'beginner',
                    description: 'Cascading Style Sheets for styling'
                }
            },
            {
                id: 'javascript',
                type: 'topic',
                position: { x: 0, y: 0 },
                data: {
                    label: 'JavaScript',
                    level: 2,
                    section: 'Programming',
                    difficulty: 'intermediate',
                    description: 'Dynamic programming language for web'
                }
            },
            {
                id: 'react',
                type: 'topic',
                position: { x: 0, y: 0 },
                data: {
                    label: 'React',
                    level: 3,
                    section: 'Frameworks',
                    difficulty: 'intermediate',
                    description: 'Component-based UI library'
                }
            },
            {
                id: 'nodejs',
                type: 'topic',
                position: { x: 0, y: 0 },
                data: {
                    label: 'Node.js',
                    level: 2,
                    section: 'Backend',
                    difficulty: 'intermediate',
                    description: 'Server-side JavaScript runtime'
                }
            },
            {
                id: 'database',
                type: 'topic',
                position: { x: 0, y: 0 },
                data: {
                    label: 'Database Design',
                    level: 3,
                    section: 'Backend',
                    difficulty: 'advanced',
                    description: 'Relational database design principles'
                }
            }
        ],
        edges: [
            {
                id: 'html-css',
                source: 'html',
                target: 'css',
                type: 'progression',
                data: { relationship: 'leads-to', strength: 0.8 }
            },
            {
                id: 'css-js',
                source: 'css',
                target: 'javascript',
                type: 'progression',
                data: { relationship: 'leads-to', strength: 0.7 }
            },
            {
                id: 'js-react',
                source: 'javascript',
                target: 'react',
                type: 'dependency',
                data: { relationship: 'prerequisite', strength: 0.9 }
            },
            {
                id: 'js-node',
                source: 'javascript',
                target: 'nodejs',
                type: 'related',
                data: { relationship: 'related-to', strength: 0.6 }
            }
        ],
        metadata: {
            totalNodes: 6,
            totalEdges: 4,
            maxDepth: 3,
            layoutType: 'grid',
            generatedAt: new Date()
        }
    };
}

/**
 * Helper function to create large graph data for testing
 */
function createLargeGraphData(nodeCount: number): GraphData {
    const nodes: RoadmapNode[] = [];
    const edges: RoadmapEdge[] = [];

    const sections = ['Frontend', 'Backend', 'Database', 'DevOps', 'Testing'];
    const difficulties = ['beginner', 'intermediate', 'advanced'] as const;

    for (let i = 0; i < nodeCount; i++) {
        const section = sections[i % sections.length];
        const difficulty = difficulties[i % difficulties.length];
        const level = Math.floor(i / 10) + 1;

        nodes.push({
            id: `node-${i}`,
            type: 'topic',
            position: { x: 0, y: 0 },
            data: {
                label: `Topic ${i + 1}`,
                level,
                section,
                difficulty,
                description: `Description for topic ${i + 1}`
            }
        });

        // Add some edges
        if (i > 0 && i % 5 === 0) {
            edges.push({
                id: `edge-${i}`,
                source: `node-${i - 1}`,
                target: `node-${i}`,
                type: 'progression',
                data: { relationship: 'leads-to', strength: 0.7 }
            });
        }
    }

    return {
        nodes,
        edges,
        metadata: {
            totalNodes: nodeCount,
            totalEdges: edges.length,
            maxDepth: Math.max(...nodes.map(n => n.data.level || 0)),
            layoutType: 'grid',
            generatedAt: new Date()
        }
    };
}

/**
 * Run all examples
 */
export function runAllGridLayoutExamples(): void {
    console.log('=== Grid Layout Examples ===\n');

    basicGridLayoutExample();
    customGridLayoutExample();
    contentOptimizedExample();
    autoSizedExample();
    dynamicLayoutExample();
    errorHandlingExample();

    console.log('\n=== Grid Layout Examples Complete ===');
}

// Export for easy testing
export const examples = {
    basic: basicGridLayoutExample,
    custom: customGridLayoutExample,
    contentOptimized: contentOptimizedExample,
    autoSized: autoSizedExample,
    dynamic: dynamicLayoutExample,
    errorHandling: errorHandlingExample,
    runAll: runAllGridLayoutExamples
};