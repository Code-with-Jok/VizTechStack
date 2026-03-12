/**
 * ForceDirectedLayout Examples
 * 
 * Comprehensive examples showing how to use the ForceDirectedLayout class
 * for physics-based node positioning with configurable forces
 */

import {
    ForceDirectedLayout,
    createForceDirectedLayout,
    applyForceDirectedLayout,
    applyRelationshipOptimizedLayout,
    getOptimalForceDirectedOptions,
    applyClusteredForceLayout
} from './force-directed-layout';
import type { GraphData, RoadmapNode, RoadmapEdge } from '../types';

// Sample graph data for examples
const sampleGraphData: GraphData = {
    nodes: [
        {
            id: 'html-basics',
            type: 'topic',
            position: { x: 0, y: 0 },
            data: {
                label: 'HTML Basics',
                description: 'Learn the fundamentals of HTML',
                level: 0,
                section: 'Frontend Fundamentals',
                difficulty: 'beginner',
                estimatedTime: '2 hours'
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
                difficulty: 'beginner',
                estimatedTime: '3 hours',
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
                level: 1,
                section: 'Programming',
                difficulty: 'intermediate',
                estimatedTime: '8 hours',
                prerequisites: ['html-basics']
            }
        },
        {
            id: 'react-basics',
            type: 'topic',
            position: { x: 0, y: 0 },
            data: {
                label: 'React Basics',
                description: 'Learn React framework',
                level: 2,
                section: 'Frontend Frameworks',
                difficulty: 'intermediate',
                estimatedTime: '12 hours',
                prerequisites: ['javascript-basics', 'css-basics']
            }
        },
        {
            id: 'react-hooks',
            type: 'skill',
            position: { x: 0, y: 0 },
            data: {
                label: 'React Hooks',
                description: 'Master React Hooks',
                level: 3,
                section: 'Frontend Frameworks',
                difficulty: 'advanced',
                estimatedTime: '6 hours',
                prerequisites: ['react-basics']
            }
        }
    ],
    edges: [
        {
            id: 'html-to-css',
            source: 'html-basics',
            target: 'css-basics',
            type: 'dependency',
            data: { relationship: 'prerequisite', strength: 0.9 }
        },
        {
            id: 'html-to-js',
            source: 'html-basics',
            target: 'javascript-basics',
            type: 'dependency',
            data: { relationship: 'prerequisite', strength: 0.8 }
        },
        {
            id: 'css-to-react',
            source: 'css-basics',
            target: 'react-basics',
            type: 'dependency',
            data: { relationship: 'prerequisite', strength: 0.7 }
        },
        {
            id: 'js-to-react',
            source: 'javascript-basics',
            target: 'react-basics',
            type: 'dependency',
            data: { relationship: 'prerequisite', strength: 0.9 }
        },
        {
            id: 'react-to-hooks',
            source: 'react-basics',
            target: 'react-hooks',
            type: 'progression',
            data: { relationship: 'leads-to', strength: 0.8 }
        },
        {
            id: 'css-js-related',
            source: 'css-basics',
            target: 'javascript-basics',
            type: 'related',
            data: { relationship: 'related-to', strength: 0.4 }
        }
    ],
    metadata: {
        totalNodes: 5,
        totalEdges: 6,
        maxDepth: 3,
        layoutType: 'force',
        generatedAt: new Date()
    }
};

/**
 * Example 1: Basic Force-Directed Layout
 */
export function basicForceDirectedLayoutExample(): void {
    console.log('=== Basic Force-Directed Layout Example ===');

    // Apply basic force-directed layout
    const result = applyForceDirectedLayout(sampleGraphData);

    console.log('Layout completed in:', result.metadata.layoutTime.toFixed(2), 'ms');
    console.log('Final alpha:', result.metadata.finalAlpha.toFixed(4));
    console.log('Layout bounds:', result.bounds);

    // Display positioned nodes
    result.nodes.forEach(node => {
        console.log(`${node.data.label}: (${node.position.x.toFixed(1)}, ${node.position.y.toFixed(1)})`);
    });
}

/**
 * Example 2: Custom Configuration
 */
export function customConfigurationExample(): void {
    console.log('=== Custom Configuration Example ===');

    // Create layout with custom options
    const layout = createForceDirectedLayout({
        width: 1600,
        height: 1000,
        chargeStrength: -400,
        linkStrength: 0.5,
        linkDistance: 120,
        collisionRadius: 50,
        iterations: 500,
        strengthByType: {
            dependency: 1.0,
            progression: 0.8,
            related: 0.2,
            optional: 0.1
        }
    });

    const result = layout.applyLayout(sampleGraphData);

    console.log('Custom layout completed in:', result.metadata.layoutTime.toFixed(2), 'ms');
    console.log('Layout options:', layout.getOptions());

    // Show how forces affected positioning
    result.nodes.forEach(node => {
        const level = node.data.level || 0;
        console.log(`${node.data.label} (Level ${level}): (${node.position.x.toFixed(1)}, ${node.position.y.toFixed(1)})`);
    });
}

/**
 * Example 3: Relationship-Optimized Layout
 */
export function relationshipOptimizedExample(): void {
    console.log('=== Relationship-Optimized Layout Example ===');

    // Get optimal options for the graph
    const optimalOptions = getOptimalForceDirectedOptions(sampleGraphData);
    console.log('Optimal options:', optimalOptions);

    // Apply relationship-optimized layout
    const result = applyRelationshipOptimizedLayout(sampleGraphData, {
        iterations: 400 // Override iterations
    });

    console.log('Optimized layout completed in:', result.metadata.layoutTime.toFixed(2), 'ms');

    // Analyze relationship positioning
    const dependencyEdges = sampleGraphData.edges.filter(e => e.type === 'dependency');
    dependencyEdges.forEach(edge => {
        const sourceNode = result.nodes.find(n => n.id === edge.source);
        const targetNode = result.nodes.find(n => n.id === edge.target);

        if (sourceNode && targetNode) {
            const distance = Math.sqrt(
                Math.pow(targetNode.position.x - sourceNode.position.x, 2) +
                Math.pow(targetNode.position.y - sourceNode.position.y, 2)
            );
            console.log(`${sourceNode.data.label} → ${targetNode.data.label}: ${distance.toFixed(1)}px`);
        }
    });
}

/**
 * Example 4: Clustered Force Layout
 */
export function clusteredForceLayoutExample(): void {
    console.log('=== Clustered Force Layout Example ===');

    // Apply clustered layout grouping by section
    const result = applyClusteredForceLayout(sampleGraphData, 'section', {
        chargeStrength: -250,
        linkStrength: 0.4,
        iterations: 350
    });

    console.log('Clustered layout completed in:', result.metadata.layoutTime.toFixed(2), 'ms');

    // Group results by section
    const nodesBySection = new Map<string, typeof result.nodes>();
    result.nodes.forEach(node => {
        const section = node.data.section || 'Unknown';
        if (!nodesBySection.has(section)) {
            nodesBySection.set(section, []);
        }
        nodesBySection.get(section)!.push(node);
    });

    // Display clusters
    nodesBySection.forEach((nodes, section) => {
        console.log(`\n${section} cluster:`);
        nodes.forEach(node => {
            console.log(`  ${node.data.label}: (${node.position.x.toFixed(1)}, ${node.position.y.toFixed(1)})`);
        });
    });
}

/**
 * Example 5: Dynamic Layout Adjustment
 */
export function dynamicLayoutAdjustmentExample(): void {
    console.log('=== Dynamic Layout Adjustment Example ===');

    const layout = createForceDirectedLayout({
        iterations: 200,
        chargeStrength: -300
    });

    // Initial layout
    let result = layout.applyLayout(sampleGraphData);
    console.log('Initial layout completed in:', result.metadata.layoutTime.toFixed(2), 'ms');

    // Update options and re-apply
    layout.updateOptions({
        chargeStrength: -500,
        linkStrength: 0.6,
        iterations: 300
    });

    result = layout.applyLayout(sampleGraphData);
    console.log('Updated layout completed in:', result.metadata.layoutTime.toFixed(2), 'ms');

    // Show the difference in positioning
    console.log('Final positions with stronger forces:');
    result.nodes.forEach(node => {
        console.log(`${node.data.label}: (${node.position.x.toFixed(1)}, ${node.position.y.toFixed(1)})`);
    });
}

/**
 * Example 6: Performance Testing
 */
export function performanceTestingExample(): void {
    console.log('=== Performance Testing Example ===');

    // Test different iteration counts
    const iterationCounts = [100, 200, 300, 500, 1000];

    iterationCounts.forEach(iterations => {
        const startTime = performance.now();

        const result = applyForceDirectedLayout(sampleGraphData, {
            iterations,
            width: 1200,
            height: 800
        });

        const endTime = performance.now();
        const totalTime = endTime - startTime;

        console.log(`${iterations} iterations: ${totalTime.toFixed(2)}ms (final alpha: ${result.metadata.finalAlpha.toFixed(4)})`);
    });
}

/**
 * Example 7: Error Handling
 */
export function errorHandlingExample(): void {
    console.log('=== Error Handling Example ===');

    try {
        // Test with empty graph
        const emptyGraph: GraphData = {
            nodes: [],
            edges: [],
            metadata: {
                totalNodes: 0,
                totalEdges: 0,
                maxDepth: 0,
                layoutType: 'force',
                generatedAt: new Date()
            }
        };

        applyForceDirectedLayout(emptyGraph);
    } catch (error) {
        console.log('Caught expected error for empty graph:', (error as Error).message);
    }

    try {
        // Test with invalid graph data
        applyForceDirectedLayout(null as any);
    } catch (error) {
        console.log('Caught expected error for null graph:', (error as Error).message);
    }

    // Test with large graph warning
    const largeGraph: GraphData = {
        ...sampleGraphData,
        nodes: Array.from({ length: 1500 }, (_, i) => ({
            id: `node-${i}`,
            type: 'topic' as const,
            position: { x: 0, y: 0 },
            data: {
                label: `Node ${i}`,
                level: Math.floor(i / 100),
                section: `Section ${Math.floor(i / 300)}`
            }
        })),
        metadata: {
            ...sampleGraphData.metadata,
            totalNodes: 1500
        }
    };

    console.log('Testing large graph (should show warning):');
    const result = applyForceDirectedLayout(largeGraph, { iterations: 50 });
    console.log('Large graph layout completed in:', result.metadata.layoutTime.toFixed(2), 'ms');
}

/**
 * Example 8: Comparison with Different Force Configurations
 */
export function forceComparisonExample(): void {
    console.log('=== Force Configuration Comparison ===');

    const configurations = [
        {
            name: 'Weak Forces',
            options: { chargeStrength: -100, linkStrength: 0.1, collisionRadius: 30 }
        },
        {
            name: 'Balanced Forces',
            options: { chargeStrength: -300, linkStrength: 0.3, collisionRadius: 40 }
        },
        {
            name: 'Strong Forces',
            options: { chargeStrength: -600, linkStrength: 0.6, collisionRadius: 50 }
        }
    ];

    configurations.forEach(config => {
        console.log(`\n${config.name}:`);

        const result = applyForceDirectedLayout(sampleGraphData, {
            ...config.options,
            iterations: 300
        });

        console.log(`  Layout time: ${result.metadata.layoutTime.toFixed(2)}ms`);
        console.log(`  Final alpha: ${result.metadata.finalAlpha.toFixed(4)}`);
        console.log(`  Bounds: ${result.bounds.width.toFixed(0)} x ${result.bounds.height.toFixed(0)}`);

        // Calculate average node spacing
        const positions = result.nodes.map(n => n.position);
        let totalDistance = 0;
        let pairCount = 0;

        for (let i = 0; i < positions.length; i++) {
            for (let j = i + 1; j < positions.length; j++) {
                const distance = Math.sqrt(
                    Math.pow(positions[j].x - positions[i].x, 2) +
                    Math.pow(positions[j].y - positions[i].y, 2)
                );
                totalDistance += distance;
                pairCount++;
            }
        }

        const avgSpacing = totalDistance / pairCount;
        console.log(`  Average node spacing: ${avgSpacing.toFixed(1)}px`);
    });
}

/**
 * Run all examples
 */
export function runAllForceDirectedExamples(): void {
    console.log('🚀 Running Force-Directed Layout Examples\n');

    basicForceDirectedLayoutExample();
    console.log('\n' + '='.repeat(50) + '\n');

    customConfigurationExample();
    console.log('\n' + '='.repeat(50) + '\n');

    relationshipOptimizedExample();
    console.log('\n' + '='.repeat(50) + '\n');

    clusteredForceLayoutExample();
    console.log('\n' + '='.repeat(50) + '\n');

    dynamicLayoutAdjustmentExample();
    console.log('\n' + '='.repeat(50) + '\n');

    performanceTestingExample();
    console.log('\n' + '='.repeat(50) + '\n');

    errorHandlingExample();
    console.log('\n' + '='.repeat(50) + '\n');

    forceComparisonExample();

    console.log('\n✅ All Force-Directed Layout examples completed!');
}

// Export for use in other files
export { sampleGraphData };