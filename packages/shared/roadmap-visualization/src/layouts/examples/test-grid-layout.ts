/**
 * Simple test runner for GridLayout examples
 * This file can be used to verify the GridLayout implementation works correctly
 */

import { runAllGridLayoutExamples } from './grid-layout-example';

/**
 * Run the grid layout examples to test functionality
 */
export function testGridLayout(): void {
    console.log('Testing GridLayout implementation...\n');

    try {
        runAllGridLayoutExamples();
        console.log('\n✅ GridLayout tests completed successfully!');
    } catch (error) {
        console.error('\n❌ GridLayout tests failed:', error);
        throw error;
    }
}

// Export for external testing
export { testGridLayout as default };

// If this file is run directly, execute the tests
if (require.main === module) {
    testGridLayout();
}