/**
 * LayoutManager Usage Examples
 * 
 * Demonstrates how to use the LayoutManager service for orchestrating
 * layout switches with smooth transitions and state preservation.
 */

import type { GraphData, LayoutType } from '../../types';
import {
    LayoutManager,
    createLayoutManager,
    switchLayoutWithTransition,
    getOptimalTransitionOptions,
    type LayoutManagerOptions
} from '../layout-manager';

// Example graph data for demonstrations
const exampleGraphData: GraphData = {
    nodes: [
        {
            id: 'frontend-basics',
            type: 'topic',
            position: { x: 0, y: 0 },
            data: {
                label: 'Frontend Basics',
                description: 'Learn the fundamentals of frontend development',
                level: 1,
                section: 'Frontend',
                difficulty: 'beginner',
                estimatedTime: '2 weeks'
            }
        },
        {
            id: 'html-css',
            type: 'skill',
            position: { x: 0, y: 0 },
            data: {
                label: 'HTML & CSS',
                description: 'Master HTML structure and CSS styling',
                level: 1,
                section: 'Frontend',
                difficulty: 'beginner',
                estimatedTime: '1 week'
            }
        },
        {
            id: 'javascript',
            type: 'skill',
            position: { x: 0, y: 0 },
            data: {
                label: 'JavaScript',
                description: 'Learn JavaScript programming fundamentals',
                level: 2,
                section: 'Frontend',
                difficulty: 'intermediate',
                estimatedTime: '3 weeks'
            }
        },
        {
            id: 'react',
            type: 'skill',
            position: { x: 0, y: 0 },
            data: {
                label: 'React',
                description: 'Build interactive UIs with React',
                level: 3,
                section: 'Frontend',
                difficulty: 'intermediate',
                estimatedTime: '4 weeks'
            }
        }
    ],
    edges: [
        {
            id: 'frontend-basics-to-html-css',
            source: 'frontend-basics',
            target: 'html-css',
            type: 'dependency',
            data: { relationship: 'prerequisite', strength: 0.9 }
        },
        {
            id: 'html-css-to-javascript',
            source: 'html-css',
            target: 'javascript',
            type: 'progression',
            data: { relationship: 'leads-to', strength: 0.8 }
        },
        {
            id: 'javascript-to-react',
            source: 'javascript',
            target: 'react',
            type: 'progression',
            data: { relationship: 'leads-to', strength: 0.9 }
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

/**
 * Example 1: Basic Layout Manager Usage
 * Demonstrates creating a layout manager and switching between layouts
 */
export async function basicLayoutManagerExample(): Promise<void> {
    console.log('=== Basic Layout Manager Example ===');

    // Create layout manager with default options
    const layoutManager = createLayoutManager();

    try {
        // Apply initial hierarchical layout
        console.log('Applying hierarchical layout...');
        let result = await layoutManager.applyLayout(exampleGraphData, 'hierarchical');
        console.log(`Layout applied: ${result.layout}, nodes positioned: ${result.nodes.length}`);

        // Switch to force-directed layout with transition
        console.log('Switching to force-directed layout...');
        result = await layoutManager.switchLayout(exampleGraphData, 'force');
        console.log(`Layout switched: ${result.layout}, transition time: ${result.metadata.transitionTime}ms`);

        // Switch to circular layout
        console.log('Switching to circular layout...');
        result = await layoutManager.switchLayout(exampleGraphData, 'circular');
        console.log(`Layout switched: ${result.layout}`);

        // Switch to grid layout
        console.log('Switching to grid layout...');
        result = await layoutManager.switchLayout(exampleGraphData, 'grid');
        console.log(`Layout switched: ${result.layout}`);

        console.log('Layout history:', layoutManager.getLayoutHistory());

    } catch (error) {
        console.error('Error in basic layout manager example:', error);
    }
}

/**
 * Example 2: Layout Manager with Custom Options
 * Demonstrates using custom animation and transition options
 */
export async function customOptionsExample(): Promise<void> {
    console.log('\n=== Custom Options Example ===');

    // Create layout manager with custom options
    const customOptions: Partial<LayoutManagerOptions> = {
        enableAnimations: true,
        animationDuration: 1200,
        animationEasing: 'ease-in-out',
        preserveSelection: true,
        preserveViewport: true,
        onTransitionStart: (from, to) => {
            console.log(`Transition started: ${from} → ${to}`);
        },
        onTransitionProgress: (progress) => {
            if (progress % 0.25 === 0) { // Log every 25%
                console.log(`Transition progress: ${Math.round(progress * 100)}%`);
            }
        },
        onTransitionComplete: (layout) => {
            console.log(`Transition completed to: ${layout}`);
        }
    };

    const layoutManager = createLayoutManager(customOptions);

    try {
        // Set some selected nodes
        layoutManager.setSelectedNodes(['html-css', 'javascript']);
        console.log('Selected nodes:', layoutManager.getSelectedNodes());

        // Set viewport state
        layoutManager.setViewportState(1.5, 400, 300);
        console.log('Viewport state:', layoutManager.getViewportState());

        // Apply initial layout
        await layoutManager.applyLayout(exampleGraphData, 'hierarchical');

        // Switch with preserved state
        const result = await layoutManager.switchLayout(exampleGraphData, 'force');
        console.log('Preserved selections:', result.metadata.preservedSelections);

    } catch (error) {
        console.error('Error in custom options example:', error);
    }
}

/**
 * Example 3: Layout-Specific Options
 * Demonstrates using different options for different layout types
 */
export async function layoutSpecificOptionsExample(): Promise<void> {
    console.log('\n=== Layout-Specific Options Example ===');

    const layoutManager = createLayoutManager();

    try {
        // Configure hierarchical layout options
        const hierarchicalOptions = {
            direction: 'TB' as const,
            nodeWidth: 220,
            nodeHeight: 100,
            rankSep: 120
        };

        // Configure force-directed layout options
        const forceOptions = {
            width: 1000,
            height: 700,
            linkStrength: 0.4,
            chargeStrength: -400
        };

        // Configure grid layout options
        const gridOptions = {
            columns: 2,
            rows: 2,
            cellWidth: 250,
            cellHeight: 150,
            sortBy: 'level' as const
        };

        // Apply layouts with specific options
        console.log('Applying hierarchical layout with custom options...');
        await layoutManager.switchLayout(exampleGraphData, 'hierarchical', hierarchicalOptions);

        console.log('Switching to force-directed layout with custom options...');
        await layoutManager.switchLayout(exampleGraphData, 'force', forceOptions);

        console.log('Switching to grid layout with custom options...');
        await layoutManager.switchLayout(exampleGraphData, 'grid', gridOptions);

        // Show stored options
        console.log('Stored hierarchical options:', layoutManager.getLayoutOptions('hierarchical'));
        console.log('Stored force options:', layoutManager.getLayoutOptions('force'));
        console.log('Stored grid options:', layoutManager.getLayoutOptions('grid'));

    } catch (error) {
        console.error('Error in layout-specific options example:', error);
    }
}

/**
 * Example 4: Optimal Transition Options
 * Demonstrates using optimal transition options based on graph characteristics
 */
export async function optimalTransitionExample(): Promise<void> {
    console.log('\n=== Optimal Transition Example ===');

    // Get optimal transition options for the graph
    const optimalOptions = getOptimalTransitionOptions(exampleGraphData);
    console.log('Optimal transition options:', optimalOptions);

    // Create layout manager with optimal options
    const layoutManager = createLayoutManager(optimalOptions);

    try {
        // Perform transitions with optimal settings
        await layoutManager.applyLayout(exampleGraphData, 'hierarchical');
        await layoutManager.switchLayout(exampleGraphData, 'circular');
        await layoutManager.switchLayout(exampleGraphData, 'grid');

        console.log('Transitions completed with optimal settings');

    } catch (error) {
        console.error('Error in optimal transition example:', error);
    }
}

/**
 * Example 5: Error Handling and Fallbacks
 * Demonstrates error handling and fallback mechanisms
 */
export async function errorHandlingExample(): Promise<void> {
    console.log('\n=== Error Handling Example ===');

    // Create layout manager with error handling
    const layoutManager = createLayoutManager({
        fallbackLayout: 'grid',
        onTransitionError: (error, layout) => {
            console.log(`Transition error for ${layout}:`, error.message);
        }
    });

    try {
        // Apply initial layout
        await layoutManager.applyLayout(exampleGraphData, 'hierarchical');

        // Try to switch to an invalid layout (this will trigger fallback)
        // Note: In real usage, this would be caught by validation, but demonstrates fallback
        console.log('Testing error handling...');

        // Simulate error by passing invalid data
        const invalidGraphData = { ...exampleGraphData, nodes: [] };
        const result = await layoutManager.switchLayout(invalidGraphData, 'force');

        console.log(`Fallback applied: ${result.layout}`);

    } catch (error) {
        console.error('Error in error handling example:', error);
    }
}

/**
 * Example 6: Utility Functions
 * Demonstrates using utility functions for quick layout operations
 */
export async function utilityFunctionsExample(): Promise<void> {
    console.log('\n=== Utility Functions Example ===');

    try {
        // Use utility function for quick layout switch with transition
        console.log('Using switchLayoutWithTransition utility...');
        const result1 = await switchLayoutWithTransition(
            exampleGraphData,
            'force',
            { linkStrength: 0.5 },
            { animationDuration: 600 }
        );
        console.log(`Switched to: ${result1.layout}`);

        // Use utility function for direct layout application
        console.log('Using applyLayoutDirect utility...');
        const result2 = await switchLayoutWithTransition(
            exampleGraphData,
            'grid',
            { columns: 2, rows: 2 },
            { enableAnimations: false }
        );
        console.log(`Applied: ${result2.layout}`);

    } catch (error) {
        console.error('Error in utility functions example:', error);
    }
}

/**
 * Run all examples
 */
export async function runAllLayoutManagerExamples(): Promise<void> {
    console.log('🚀 Running Layout Manager Examples...\n');

    await basicLayoutManagerExample();
    await customOptionsExample();
    await layoutSpecificOptionsExample();
    await optimalTransitionExample();
    await errorHandlingExample();
    await utilityFunctionsExample();

    console.log('\n✅ All Layout Manager examples completed!');
}

// Export for individual example usage
export {
    exampleGraphData,
    basicLayoutManagerExample,
    customOptionsExample,
    layoutSpecificOptionsExample,
    optimalTransitionExample,
    errorHandlingExample,
    utilityFunctionsExample
};