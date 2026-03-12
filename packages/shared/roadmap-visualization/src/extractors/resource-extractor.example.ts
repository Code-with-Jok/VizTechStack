/**
 * ResourceExtractor Usage Examples
 * 
 * Demonstrates cách sử dụng ResourceExtractor để extract links và resources từ markdown content
 */

import {
    ResourceExtractor,
    createResourceExtractor,
    extractResourcesFromContent,
    getResourceStatistics,
    type ResourceExtractionOptions,
    type ResourceExtractionResult
} from './resource-extractor';

// Example markdown content với various types of resources
const sampleMarkdownContent = `
# Frontend Development Roadmap

## Learning Resources

### Documentation
- [React Documentation](https://react.dev/) - Official React docs
- [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web) - Comprehensive web development reference
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - Learn TypeScript

### Video Courses
- [React Course on YouTube](https://www.youtube.com/watch?v=abc123) - Free React tutorial
- [Advanced React on Udemy](https://www.udemy.com/course/react-advanced) - Paid comprehensive course
- [Frontend Masters](https://frontendmasters.com/courses/react/) - Subscription-based learning

### Tools và Libraries
- [Create React App](https://github.com/facebook/create-react-app) - React project scaffolding
- [Vite](https://vitejs.dev/) - Fast build tool
- [ESLint](https://eslint.org/) - JavaScript linting utility

### Books
- [Learning React](https://www.oreilly.com/library/view/learning-react/9781491954614/) - O'Reilly book
- [React Patterns](https://reactpatterns.com/) - Free online book

### Examples và Demos
- [React Examples](https://codepen.io/collection/DYpwPE) - CodePen collection
- [Todo App Demo](https://codesandbox.io/s/react-todo-app) - Interactive demo

### Blogs và Articles
- [React Blog](https://react.dev/blog) - Official React blog
- [Dan Abramov's Blog](https://overreacted.io/) - Insights from React team member
- https://css-tricks.com/react-hooks-guide/ - Plain URL example

### Images và Assets
![React Logo](https://react.dev/logo.svg)
![Architecture Diagram](./assets/react-architecture.png)

### Downloads
- [React Cheatsheet PDF](https://reactcheatsheet.com/react-cheatsheet.pdf)
- [Project Template](https://github.com/user/template/archive/main.zip)
`;

/**
 * Example 1: Basic resource extraction
 */
export function basicResourceExtractionExample(): void {
    console.log('=== Basic Resource Extraction Example ===');

    const extractor = new ResourceExtractor();
    const result = extractor.extract(sampleMarkdownContent);

    console.log(`Total resources found: ${result.statistics.totalResources}`);
    console.log(`Internal links: ${result.statistics.internalLinks}`);
    console.log(`External links: ${result.statistics.externalLinks}`);
    console.log(`Duplicate resources removed: ${result.statistics.duplicateResources}`);

    // Show first few resources
    console.log('\nFirst 5 resources:');
    result.resources.slice(0, 5).forEach((resource, index) => {
        console.log(`${index + 1}. ${resource.title} (${resource.type})`);
        console.log(`   URL: ${resource.url}`);
        console.log(`   Context: ${resource.context.substring(0, 50)}...`);
    });
}

/**
 * Example 2: Resource extraction với custom options
 */
export function customOptionsExample(): void {
    console.log('\n=== Custom Options Example ===');

    const options: ResourceExtractionOptions = {
        includeInternalLinks: false, // Skip internal links
        includeImages: true, // Include images
        includeDownloads: true, // Include downloadable files
        maxContextLength: 150, // Longer context
        detectResourceType: true, // Auto-detect types
        validateUrls: true, // Validate URL format
        extractMetadata: true // Extract detailed metadata
    };

    const result = extractResourcesFromContent(sampleMarkdownContent, options);

    console.log('Resource types distribution:');
    Object.entries(result.statistics.resourcesByType).forEach(([type, count]) => {
        console.log(`  ${type}: ${count}`);
    });

    // Show resources với metadata
    console.log('\nResources với detailed metadata:');
    result.resources.slice(0, 3).forEach(resource => {
        console.log(`\n${resource.title}:`);
        console.log(`  Type: ${resource.type}`);
        console.log(`  Domain: ${resource.metadata?.domain || 'N/A'}`);
        console.log(`  Is Download: ${resource.metadata?.isDownload || false}`);
        console.log(`  File Extension: ${resource.metadata?.fileExtension || 'N/A'}`);
    });
}

/**
 * Example 3: Resource node creation
 */
export function resourceNodeCreationExample(): void {
    console.log('\n=== Resource Node Creation Example ===');

    const extractor = createResourceExtractor({
        detectResourceType: true,
        extractMetadata: true
    });

    const result = extractor.extract(sampleMarkdownContent);

    console.log(`Created ${result.resourceNodes.length} resource nodes`);

    // Show resource nodes
    result.resourceNodes.slice(0, 3).forEach(node => {
        console.log(`\nNode: ${node.title}`);
        console.log(`  ID: ${node.id}`);
        console.log(`  Type: ${node.resourceType}`);
        console.log(`  Cost: ${node.cost}`);
        console.log(`  Difficulty: ${node.difficulty}`);
        console.log(`  URL: ${node.url}`);
    });
}

/**
 * Example 4: Error handling và validation
 */
export function errorHandlingExample(): void {
    console.log('\n=== Error Handling Example ===');

    const contentWithErrors = `
# Broken Links Example

- [Invalid URL](not-a-valid-url)
- [Suspicious Link](http://bit.ly/suspicious)
- [Good Link](https://react.dev/)
- [Another Bad URL](javascript:alert('xss'))
`;

    const extractor = createResourceExtractor({
        validateUrls: true
    });

    const result = extractor.extract(contentWithErrors);

    console.log(`Errors found: ${result.errors.length}`);
    result.errors.forEach(error => {
        console.log(`  Error: ${error}`);
    });

    console.log(`Warnings: ${result.warnings.length}`);
    result.warnings.forEach(warning => {
        console.log(`  Warning: ${warning}`);
    });

    console.log(`Valid resources: ${result.resources.length}`);
}

/**
 * Example 5: Resource statistics analysis
 */
export function resourceStatisticsExample(): void {
    console.log('\n=== Resource Statistics Example ===');

    const result = extractResourcesFromContent(sampleMarkdownContent, {
        detectResourceType: true
    });

    const stats = getResourceStatistics(result.resources);

    console.log(`Total resources: ${stats.totalCount}`);

    console.log('\nResource type distribution:');
    Object.entries(stats.typeDistribution).forEach(([type, count]) => {
        const percentage = ((count / stats.totalCount) * 100).toFixed(1);
        console.log(`  ${type}: ${count} (${percentage}%)`);
    });
}

/**
 * Example 6: Integration với other extractors
 */
export function integrationExample(): void {
    console.log('\n=== Integration Example ===');

    // This would typically integrate với NodeExtractor và other services
    const resourceExtractor = createResourceExtractor({
        detectResourceType: true,
        extractMetadata: true
    });

    const resourceResult = resourceExtractor.extract(sampleMarkdownContent);

    console.log('Integration points:');
    console.log(`- Resource nodes can be added to graph: ${resourceResult.resourceNodes.length} nodes`);
    console.log(`- Resources can be linked to content nodes based on context`);
    console.log(`- Resource metadata can enhance node information`);

    // Example of how resources might be integrated
    resourceResult.resourceNodes.forEach(resourceNode => {
        console.log(`\nResource Node Integration:`);
        console.log(`  Node ID: ${resourceNode.id}`);
        console.log(`  Can be connected to content nodes mentioning: "${resourceNode.title}"`);
        console.log(`  Provides additional learning material of type: ${resourceNode.resourceType}`);
    });
}

/**
 * Example 7: Performance considerations
 */
export function performanceExample(): void {
    console.log('\n=== Performance Example ===');

    // Large content simulation
    const largeContent = sampleMarkdownContent.repeat(10);

    console.log(`Processing large content (${largeContent.length} characters)...`);

    const startTime = performance.now();

    const result = extractResourcesFromContent(largeContent, {
        detectResourceType: true,
        extractMetadata: true,
        validateUrls: false // Skip validation for performance
    });

    const endTime = performance.now();
    const processingTime = endTime - startTime;

    console.log(`Processing completed in ${processingTime.toFixed(2)}ms`);
    console.log(`Resources found: ${result.resources.length}`);
    console.log(`Performance: ${(result.resources.length / processingTime * 1000).toFixed(0)} resources/second`);
}

/**
 * Run all examples
 */
export function runAllResourceExtractorExamples(): void {
    console.log('🔗 ResourceExtractor Examples\n');

    try {
        basicResourceExtractionExample();
        customOptionsExample();
        resourceNodeCreationExample();
        errorHandlingExample();
        resourceStatisticsExample();
        integrationExample();
        performanceExample();

        console.log('\n✅ All ResourceExtractor examples completed successfully!');
    } catch (error) {
        console.error('❌ Error running examples:', error);
    }
}

// Export for use in other files
export {
    sampleMarkdownContent
};

// Run examples if this file is executed directly
if (require.main === module) {
    runAllResourceExtractorExamples();
}