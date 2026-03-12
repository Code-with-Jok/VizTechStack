/**
 * Example usage of CircularLayout algorithm
 * Demonstrates various ways to use the circular positioning system
 */

import {
    CircularLayout,
    createCircularLayout,
    applyCircularLayout,
    applyProgressionOptimizedCircularLayout,
    applySectionOptimizedCircularLayout,
    getOptimalCircularOptions
} from '../circular-layout';
import type { GraphData, RoadmapNode, RoadmapEdge } from '../../types';

/**
 * Example 1: Basic circular layout usage
 */
export function basicCircularLayoutExample(): void {
    // Sample graph data
    const graphData: GraphData = {
        nodes: [
            {
                id: '1',
                type: 'topic',
                position: { x: 0, y: 0 },
                data: {
                    label: 'HTML Basics',
                    level: 0,
                    section: 'Frontend',
                    description: 'Learn HTML fundamentals'
                }
            },
            {
                id: '2',
                type: 'topic',
                position: { x: 0, y: 0 },
                data: {
                    label: 'CSS Fundamentals',
                    level: 1,
                    section: 'Frontend',
                    description: 'Master CSS styling'
                }
            },
            {
                id: '3',
                type: 'topic',
                position: { x: 0, y: 0 },
                data: {
                    label: 'JavaScript Basics',
                    level: 1,
                    section: 'Frontend',
                    description: 'Learn JavaScript programming'
                }
            },
            {
                id: '4',
                type: 'topic',
                position: { x: 0, y: 0 },
                data: {
                    label: 'React Framework',
                    level: 2,
                    section: 'Frontend',
                    description: 'Build with React'
                }
            }
        ],
        edges: [
            {
                id: 'e1',
                source: '1',
                target: '2',
                type: 'dependency',
                data: { relationship: 'prerequisite', strength: 0.8 }
            },
            {
                id: 'e2',
                source: '1',
                target: '3',
                type: 'dependency',
                data: { relationship: 'prerequisite', strength: 0.7 }
            },
            {
                id: 'e3',
                source: '2',
                target: '4',
                type: 'progression',
                data: { relationship: 'leads-to', strength: 0.9 }
            },
            {
                id: 'e4',
                source: '3',
                target: '4',
                type: 'progression',
                data: { relationship: 'leads-to', strength: 0.9 }
            }
        ],
        metadata: {
            totalNodes: 4,
            totalEdges: 4,
            maxDepth: 2,
            layoutType: 'circular',
            generatedAt: new Date()
        }
    };

    // Apply basic circular layout
    const result = applyCircularLayout(graphData);

    console.log('Basic Circular Layout Result:');
    console.log(`- Layout time: ${result.metadata.layoutTime.toFixed(2)}ms`);
    console.log(`- Nodes positioned: ${result.metadata.nodeCount}`);
    console.log(`- Levels: ${result.metadata.levels}`);
    console.log(`- Rings: ${result.metadata.rings}`);
    console.log(`- Average radius: ${result.metadata.averageRadius.toFixed(2)}`);

    // Print node positions
    result.nodes.forEach(node => {
        console.log(`Node ${node.data.label}: (${node.position.x.toFixed(1)}, ${node.position.y.toFixed(1)})`);
    });
}

/**
 * Example 2: Custom circular layout options
 */
export function customCircularLayoutExample(): void {
    const graphData = createSampleGraphData();

    // Create layout with custom options
    const layout = createCircularLayout({
        width: 1000,
        height: 800,
        innerRadius: 80,
        outerRadius: 300,
        startAngle: Math.PI / 4, // Start at 45 degrees
        endAngle: 7 * Math.PI / 4, // End at 315 degrees (270 degree arc)
        levelSpacing: 60,
        angularSpacing: 0.15,
        preventOverlaps: true,
        sortByLevel: true
    });

    const result = layout.applyLayout(graphData);

    console.log('\nCustom Circular Layout Result:');
    console.log(`- Custom arc from 45° to 315°`);
    console.log(`- Inner radius: 80, Outer radius: 300`);
    console.log(`- Bounds: ${result.bounds.width.toFixed(0)} x ${result.bounds.height.toFixed(0)}`);
}

/**
 * Example 3: Progression-optimized circular layout
 */
export function progressionOptimizedExample(): void {
    const graphData = createComplexGraphData();

    // Get optimal options for this graph
    const optimalOptions = getOptimalCircularOptions(graphData);
    console.log('\nOptimal Circular Options:');
    console.log(JSON.stringify(optimalOptions, null, 2));

    // Apply progression-optimized layout
    const result = applyProgressionOptimizedCircularLayout(graphData);

    console.log('\nProgression-Optimized Circular Layout:');
    console.log(`- Optimized for ${result.metadata.nodeCount} nodes across ${result.metadata.levels} levels`);
    console.log(`- Average radius: ${result.metadata.averageRadius.toFixed(2)}`);
    console.log(`- Layout bounds: ${result.bounds.width.toFixed(0)} x ${result.bounds.height.toFixed(0)}`);
}

/**
 * Example 4: Section-based circular layout
 */
export function sectionOptimizedExample(): void {
    const graphData = createMultiSectionGraphData();

    // Apply section-optimized layout
    const result = applySectionOptimizedCircularLayout(graphData);

    console.log('\nSection-Optimized Circular Layout:');
    console.log(`- Organized by sections for better grouping`);
    console.log(`- ${result.metadata.rings} concentric rings`);

    // Group results by section
    const nodesBySection = new Map<string, typeof result.nodes>();
    result.nodes.forEach(node => {
        const section = node.data.section;
        if (!nodesBySection.has(section)) {
            nodesBySection.set(section, []);
        }
        nodesBySection.get(section)!.push(node);
    });

    nodesBySection.forEach((nodes, section) => {
        console.log(`\nSection "${section}": ${nodes.length} nodes`);
        nodes.forEach(node => {
            const angle = Math.atan2(
                node.position.y - 400, // Assuming center Y = 400
                node.position.x - 600  // Assuming center X = 600
            );
            const degrees = (angle * 180 / Math.PI + 360) % 360;
            console.log(`  - ${node.data.label}: ${degrees.toFixed(0)}°`);
        });
    });
}

/**
 * Example 5: Dynamic layout updates
 */
export function dynamicLayoutExample(): void {
    const graphData = createSampleGraphData();
    const layout = createCircularLayout();

    console.log('\nDynamic Layout Updates:');

    // Initial layout
    let result = layout.applyLayout(graphData);
    console.log(`Initial: ${result.metadata.rings} rings, avg radius ${result.metadata.averageRadius.toFixed(2)}`);

    // Update options and re-layout
    layout.updateOptions({
        innerRadius: 150,
        outerRadius: 400,
        angularSpacing: 0.05
    });

    result = layout.applyLayout(graphData);
    console.log(`Updated: ${result.metadata.rings} rings, avg radius ${result.metadata.averageRadius.toFixed(2)}`);

    // Show current options
    const currentOptions = layout.getOptions();
    console.log(`Current inner radius: ${currentOptions.innerRadius}`);
    console.log(`Current outer radius: ${currentOptions.outerRadius}`);
}

/**
 * Example 6: Error handling and validation
 */
export function errorHandlingExample(): void {
    console.log('\nError Handling Examples:');

    try {
        // Invalid options
        const layout = createCircularLayout({
            innerRadius: 200,
            outerRadius: 100 // Invalid: inner > outer
        });

        const graphData = createSampleGraphData();
        layout.applyLayout(graphData);
    } catch (error) {
        console.log(`Caught expected error: ${error.message}`);
    }

    try {
        // Empty graph
        const emptyGraph: GraphData = {
            nodes: [],
            edges: [],
            metadata: {
                totalNodes: 0,
                totalEdges: 0,
                maxDepth: 0,
                layoutType: 'circular',
                generatedAt: new Date()
            }
        };

        applyCircularLayout(emptyGraph);
    } catch (error) {
        console.log(`Caught expected error: ${error.message}`);
    }
}

/**
 * Helper function to create sample graph data
 */
function createSampleGraphData(): GraphData {
    return {
        nodes: [
            {
                id: 'n1',
                type: 'topic',
                position: { x: 0, y: 0 },
                data: { label: 'Node 1', level: 0, section: 'A' }
            },
            {
                id: 'n2',
                type: 'topic',
                position: { x: 0, y: 0 },
                data: { label: 'Node 2', level: 1, section: 'A' }
            },
            {
                id: 'n3',
                type: 'topic',
                position: { x: 0, y: 0 },
                data: { label: 'Node 3', level: 1, section: 'B' }
            },
            {
                id: 'n4',
                type: 'topic',
                position: { x: 0, y: 0 },
                data: { label: 'Node 4', level: 2, section: 'B' }
            }
        ],
        edges: [
            {
                id: 'e1',
                source: 'n1',
                target: 'n2',
                type: 'dependency',
                data: { relationship: 'prerequisite' }
            },
            {
                id: 'e2',
                source: 'n1',
                target: 'n3',
                type: 'dependency',
                data: { relationship: 'prerequisite' }
            },
            {
                id: 'e3',
                source: 'n3',
                target: 'n4',
                type: 'progression',
                data: { relationship: 'leads-to' }
            }
        ],
        metadata: {
            totalNodes: 4,
            totalEdges: 3,
            maxDepth: 2,
            layoutType: 'circular',
            generatedAt: new Date()
        }
    };
}

/**
 * Helper function to create complex graph data for optimization testing
 */
function createComplexGraphData(): GraphData {
    const nodes: RoadmapNode[] = [];
    const edges: RoadmapEdge[] = [];

    // Create 15 nodes across 4 levels
    for (let level = 0; level < 4; level++) {
        const nodesInLevel = level === 0 ? 1 : level === 1 ? 3 : level === 2 ? 5 : 6;

        for (let i = 0; i < nodesInLevel; i++) {
            const nodeId = `L${level}N${i}`;
            nodes.push({
                id: nodeId,
                type: 'topic',
                position: { x: 0, y: 0 },
                data: {
                    label: `Level ${level} Node ${i}`,
                    level,
                    section: `Section ${Math.floor(i / 2)}`,
                    description: `Description for node at level ${level}`
                }
            });

            // Create edges to previous level
            if (level > 0) {
                const prevLevelNodes = Math.floor(i / 2); // Connect to fewer nodes in previous level
                const targetId = `L${level - 1}N${prevLevelNodes}`;
                edges.push({
                    id: `${targetId}-${nodeId}`,
                    source: targetId,
                    target: nodeId,
                    type: 'dependency',
                    data: { relationship: 'prerequisite', strength: 0.8 }
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
            layoutType: 'circular',
            generatedAt: new Date()
        }
    };
}

/**
 * Helper function to create multi-section graph data
 */
function createMultiSectionGraphData(): GraphData {
    const sections = ['Frontend', 'Backend', 'Database', 'DevOps'];
    const nodes: RoadmapNode[] = [];
    const edges: RoadmapEdge[] = [];

    sections.forEach((section, sectionIndex) => {
        for (let level = 0; level < 3; level++) {
            for (let i = 0; i < 2; i++) {
                const nodeId = `${section}L${level}N${i}`;
                nodes.push({
                    id: nodeId,
                    type: 'topic',
                    position: { x: 0, y: 0 },
                    data: {
                        label: `${section} L${level} N${i}`,
                        level,
                        section,
                        description: `${section} topic at level ${level}`
                    }
                });

                // Create intra-section dependencies
                if (level > 0) {
                    const prevNodeId = `${section}L${level - 1}N${i}`;
                    edges.push({
                        id: `${prevNodeId}-${nodeId}`,
                        source: prevNodeId,
                        target: nodeId,
                        type: 'progression',
                        data: { relationship: 'leads-to' }
                    });
                }
            }
        }
    });

    // Add some cross-section relationships
    edges.push({
        id: 'cross1',
        source: 'FrontendL2N0',
        target: 'BackendL1N0',
        type: 'related',
        data: { relationship: 'related-to', strength: 0.5 }
    });

    return {
        nodes,
        edges,
        metadata: {
            totalNodes: nodes.length,
            totalEdges: edges.length,
            maxDepth: 2,
            layoutType: 'circular',
            generatedAt: new Date()
        }
    };
}

/**
 * Run all examples
 */
export function runAllCircularLayoutExamples(): void {
    console.log('=== Circular Layout Examples ===\n');

    basicCircularLayoutExample();
    customCircularLayoutExample();
    progressionOptimizedExample();
    sectionOptimizedExample();
    dynamicLayoutExample();
    errorHandlingExample();

    console.log('\n=== All examples completed ===');
}

// Export for easy testing
export const examples = {
    basic: basicCircularLayoutExample,
    custom: customCircularLayoutExample,
    progressionOptimized: progressionOptimizedExample,
    sectionOptimized: sectionOptimizedExample,
    dynamic: dynamicLayoutExample,
    errorHandling: errorHandlingExample,
    runAll: runAllCircularLayoutExamples
};