/**
 * HierarchyProcessor Usage Examples
 * 
 * This file demonstrates how to use the HierarchyProcessor service
 * with various markdown structures and integration scenarios.
 */

import { NodeExtractor } from './node-extractor';
import { HierarchyProcessor, createHierarchyProcessor, processNodeHierarchy, validateHierarchyStructure } from './hierarchy-processor';
import { RelationshipAnalyzer } from './relationship-analyzer';
import { EdgeGenerator } from './edge-generator';

// Example 1: Basic Hierarchy Processing
export function basicHierarchyExample() {
    const markdown = `
# Frontend Development Roadmap

## Prerequisites
Basic computer skills and text editor knowledge.

## HTML Fundamentals
Learn the structure of web pages.

### Basic HTML Elements
Understanding tags, attributes, and document structure.

#### Semantic HTML
Using meaningful elements for better accessibility.

##### ARIA Attributes
Advanced accessibility features.

### HTML Forms
Creating interactive forms for user input.

#### Form Validation
Client-side and server-side validation techniques.

## CSS Styling
Learn to style web pages beautifully.

### CSS Basics
Selectors, properties, and values.

#### Box Model
Understanding margins, borders, padding, and content.

### Advanced CSS
Modern CSS features and techniques.

#### Flexbox Layout
Flexible box layout for responsive design.

#### CSS Grid
Two-dimensional layout system.

## JavaScript Programming
Add interactivity to web pages.

### JavaScript Basics
Variables, functions, and control structures.

### DOM Manipulation
Interacting with web page elements.

#### Event Handling
Responding to user interactions.
`;

    console.log('=== Basic Hierarchy Processing Example ===\n');

    // Extract nodes
    const nodeExtractor = new NodeExtractor();
    const nodeResult = nodeExtractor.extract(markdown);
    console.log(`Extracted ${nodeResult.metadata.totalNodes} nodes`);

    // Process hierarchy
    const hierarchyProcessor = new HierarchyProcessor();
    const hierarchyResult = hierarchyProcessor.process(nodeResult.nodes);

    console.log(`\nHierarchy Results:`);
    console.log(`- Total relationships: ${hierarchyResult.metadata.totalRelationships}`);
    console.log(`- Maximum depth: ${hierarchyResult.metadata.maxDepth}`);
    console.log(`- Root nodes: ${hierarchyResult.metadata.rootNodes.length}`);
    console.log(`- Leaf nodes: ${hierarchyResult.metadata.leafNodes.length}`);

    // Show nodes by depth
    console.log(`\nNodes by depth:`);
    for (const [depth, count] of Object.entries(hierarchyResult.metadata.nodesByDepth)) {
        console.log(`  Level ${depth}: ${count} nodes`);
    }

    // Show some hierarchy paths
    console.log(`\nSample hierarchy paths:`);
    const paths = hierarchyResult.metadata.hierarchyPaths;
    Object.entries(paths).slice(0, 5).forEach(([nodeId, path]) => {
        console.log(`  ${nodeId}: ${path.join(' > ')}`);
    });

    return { nodeResult, hierarchyResult };
}

// Example 2: Hierarchy with Custom Options
export function customOptionsExample() {
    const markdown = `
# Advanced Web Development

## Architecture Patterns
Learn about software architecture.

### MVC Pattern
Model-View-Controller architecture.

#### Model Layer
Data management and business logic.

##### Data Validation
Ensuring data integrity and consistency.

###### Schema Validation
Using schemas to validate data structure.

####### JSON Schema
Defining and validating JSON data structures.

## Performance Optimization
Techniques for faster web applications.

### Frontend Performance
Optimizing client-side performance.

#### Bundle Optimization
Reducing JavaScript bundle sizes.

### Backend Performance
Server-side optimization techniques.
`;

    console.log('\n=== Custom Options Example ===\n');

    const nodeExtractor = new NodeExtractor();
    const nodeResult = nodeExtractor.extract(markdown);

    // Use custom options
    const hierarchyProcessor = new HierarchyProcessor({
        maxDepth: 5, // Limit depth to prevent overly deep hierarchies
        includeImplicitHierarchy: false, // Only direct parent-child relationships
        strengthByDepth: true, // Adjust strength based on depth
        validateHierarchy: true // Enable validation
    });

    const hierarchyResult = hierarchyProcessor.process(nodeResult.nodes);

    console.log(`Processed with custom options:`);
    console.log(`- Max depth limit: 5`);
    console.log(`- Implicit hierarchy: disabled`);
    console.log(`- Total relationships: ${hierarchyResult.metadata.totalRelationships}`);

    // Get hierarchy statistics
    const stats = hierarchyProcessor.getHierarchyStatistics(hierarchyResult);
    console.log(`\nHierarchy Statistics:`);
    console.log(`- Average depth: ${stats.averageDepth.toFixed(2)}`);
    console.log(`- Balance score: ${stats.hierarchyBalance.toFixed(2)}`);
    console.log(`- Branching factor: ${stats.branchingFactor.toFixed(2)}`);

    return { nodeResult, hierarchyResult, stats };
}

// Example 3: Integration with Other Services
export function fullIntegrationExample() {
    const markdown = `
# Full-Stack Development

## Frontend Technologies
Client-side development stack.

### React Framework
Component-based UI library.

#### React Hooks
Modern state management in React.

##### useState Hook
Managing component state.

##### useEffect Hook
Handling side effects and lifecycle.

#### React Router
Client-side routing for SPAs.

### State Management
Managing application state.

#### Redux Toolkit
Predictable state container.

## Backend Technologies
Server-side development stack.

### Node.js Runtime
JavaScript server environment.

#### Express Framework
Web application framework for Node.js.

##### Middleware
Request/response processing pipeline.

##### Routing
Handling different HTTP endpoints.

### Database Integration
Data persistence solutions.

#### MongoDB
NoSQL document database.

##### Mongoose ODM
Object Document Mapping for MongoDB.
`;

    console.log('\n=== Full Integration Example ===\n');

    // 1. Extract nodes
    const nodeExtractor = new NodeExtractor({
        includeResources: true,
        autoDetectDifficulty: true,
        extractTags: true
    });
    const nodeResult = nodeExtractor.extract(markdown);

    // 2. Process hierarchy
    const hierarchyProcessor = createHierarchyProcessor({
        includeImplicitHierarchy: true,
        strengthByDepth: true
    });
    const hierarchyResult = hierarchyProcessor.process(nodeResult.nodes);

    // 3. Analyze all relationships
    const relationshipAnalyzer = new RelationshipAnalyzer({
        includeHierarchical: true,
        includeCrossReferences: true,
        includeImplicitDependencies: true
    });
    const relationshipResult = relationshipAnalyzer.analyze(nodeResult.nodes, markdown);

    // 4. Generate edges
    const edgeGenerator = new EdgeGenerator({
        minimumStrength: 0.3,
        customStyling: true,
        enableBidirectional: false
    });
    const edgeResult = edgeGenerator.generate(relationshipResult);

    console.log('Full processing pipeline results:');
    console.log(`- Nodes extracted: ${nodeResult.metadata.totalNodes}`);
    console.log(`- Hierarchy relationships: ${hierarchyResult.metadata.totalRelationships}`);
    console.log(`- Total relationships: ${relationshipResult.metadata.totalRelationships}`);
    console.log(`- Generated edges: ${edgeResult.metadata.totalEdges}`);

    // Show relationship breakdown
    console.log(`\nRelationship breakdown:`);
    for (const [type, count] of Object.entries(relationshipResult.metadata.relationshipsByType)) {
        console.log(`  ${type}: ${count}`);
    }

    // Show edge type breakdown
    console.log(`\nEdge type breakdown:`);
    for (const [type, count] of Object.entries(edgeResult.metadata.edgesByType)) {
        console.log(`  ${type}: ${count}`);
    }

    // Demonstrate hierarchy-specific features
    console.log(`\nHierarchy-specific analysis:`);

    // Find descendants of a root node
    const rootNodeId = hierarchyResult.metadata.rootNodes[0];
    if (rootNodeId) {
        const descendants = hierarchyProcessor.findDescendants(rootNodeId, hierarchyResult.relationships);
        console.log(`- Root node "${rootNodeId}" has ${descendants.length} descendants`);
    }

    // Find ancestors of a deep node
    const leafNodeId = hierarchyResult.metadata.leafNodes[0];
    if (leafNodeId) {
        const ancestors = hierarchyProcessor.findAncestors(leafNodeId, hierarchyResult.relationships);
        console.log(`- Leaf node "${leafNodeId}" has ${ancestors.length} ancestors`);
    }

    return {
        nodeResult,
        hierarchyResult,
        relationshipResult,
        edgeResult
    };
}

// Example 4: Hierarchy Validation
export function hierarchyValidationExample() {
    // Example with potential issues
    const problematicMarkdown = `
# Root Level

## Level 2

##### Level 5 (skipped levels 3 and 4)

# Another Root

### Level 3 (missing level 2)

## Level 2 (out of order)
`;

    console.log('\n=== Hierarchy Validation Example ===\n');

    const nodeExtractor = new NodeExtractor();
    const nodeResult = nodeExtractor.extract(problematicMarkdown);

    // Validate hierarchy structure
    const validation = validateHierarchyStructure(nodeResult.nodes, {
        maxDepth: 4,
        validateHierarchy: true
    });

    console.log('Validation results:');
    console.log(`- Is valid: ${validation.isValid}`);

    if (validation.errors.length > 0) {
        console.log('- Errors:');
        validation.errors.forEach((error: string) => console.log(`  • ${error}`));
    }

    if (validation.warnings.length > 0) {
        console.log('- Warnings:');
        validation.warnings.forEach((warning: string) => console.log(`  • ${warning}`));
    }

    // Process anyway (with warnings)
    try {
        const hierarchyResult = processNodeHierarchy(nodeResult.nodes, {
            validateHierarchy: false // Disable validation to allow processing
        });

        console.log(`\nProcessed despite issues:`);
        console.log(`- Total relationships: ${hierarchyResult.metadata.totalRelationships}`);
        console.log(`- Max depth: ${hierarchyResult.metadata.maxDepth}`);
    } catch (error) {
        console.log(`Processing failed: ${error instanceof Error ? error.message : error}`);
    }

    return { nodeResult, validation };
}

// Example 5: Factory Functions Usage
export function factoryFunctionsExample() {
    const markdown = `
# Simple Hierarchy

## Section A
First main section.

### Subsection A1
First subsection of A.

### Subsection A2
Second subsection of A.

## Section B
Second main section.

### Subsection B1
First subsection of B.
`;

    console.log('\n=== Factory Functions Example ===\n');

    const nodeExtractor = new NodeExtractor();
    const nodeResult = nodeExtractor.extract(markdown);

    // Using factory function
    const processor = createHierarchyProcessor({
        maxDepth: 3,
        includeImplicitHierarchy: false
    });

    // Using utility function
    const hierarchyResult = processNodeHierarchy(nodeResult.nodes, {
        strengthByDepth: false
    });

    console.log('Using factory functions:');
    console.log(`- Processor created with maxDepth: 3`);
    console.log(`- Hierarchy processed with ${hierarchyResult.metadata.totalRelationships} relationships`);

    // Show all relationships
    console.log(`\nAll hierarchy relationships:`);
    hierarchyResult.relationships.forEach(rel => {
        const parentNode = nodeResult.nodes.find(n => n.id === rel.parentId);
        const childNode = nodeResult.nodes.find(n => n.id === rel.childId);

        if (parentNode && childNode) {
            console.log(`  "${parentNode.title}" -> "${childNode.title}" (strength: ${rel.strength.toFixed(2)})`);
        }
    });

    return { nodeResult, hierarchyResult };
}

// Run all examples
export function runAllExamples() {
    console.log('🌳 HierarchyProcessor Examples\n');
    console.log('This demonstrates the HierarchyProcessor service capabilities.\n');

    try {
        basicHierarchyExample();
        customOptionsExample();
        fullIntegrationExample();
        hierarchyValidationExample();
        factoryFunctionsExample();

        console.log('\n✅ All examples completed successfully!');
    } catch (error) {
        console.error('\n❌ Example execution failed:', error);
    }
}

// Export validation function for external use
export { validateHierarchyStructure } from './hierarchy-processor';

// If running directly
if (require.main === module) {
    runAllExamples();
}