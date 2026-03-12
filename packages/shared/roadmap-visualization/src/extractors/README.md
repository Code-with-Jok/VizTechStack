# NodeExtractor

The NodeExtractor service converts markdown headers into graph nodes for roadmap visualization.

## Features

- **Convert markdown headers to graph nodes**: Extracts structured data from markdown content
- **Extract node metadata**: Automatically determines title, content, level, and type
- **Generate unique node IDs**: Creates URL-friendly unique identifiers
- **Determine node types**: Automatically categorizes nodes as topic, skill, resource, milestone, or prerequisite
- **Detect difficulty levels**: Uses keyword analysis to determine beginner, intermediate, or advanced difficulty
- **Extract tags**: Identifies technology tags and hashtags from content
- **Extract resources**: Finds and categorizes links as articles, videos, courses, documentation, or books
- **Calculate reading time**: Estimates reading time based on word count
- **Configurable options**: Supports various extraction options for different use cases

## Usage

### Basic Usage

```typescript
import { NodeExtractor } from '@viztechstack/roadmap-visualization';

const extractor = new NodeExtractor();

const markdown = `
# Frontend Development

Learn the basics of frontend development.

## HTML Fundamentals

HTML is the foundation of web pages.

### Basic Tags

Learn about basic HTML tags.

## CSS Styling

CSS is used for styling web pages.
`;

const result = extractor.extract(markdown);

console.log(result.nodes.length); // 4
console.log(result.metadata.totalNodes); // 4
```

### With Options

```typescript
import { NodeExtractor, type NodeExtractionOptions } from '@viztechstack/roadmap-visualization';

const options: NodeExtractionOptions = {
    maxDepth: 3,
    includeResources: true,
    autoDetectDifficulty: true,
    extractTags: true
};

const extractor = new NodeExtractor(options);
const result = extractor.extract(markdown);
```

### Factory Functions

```typescript
import { 
    createNodeExtractor,
    extractNodesFromMarkdown,
    extractRoadmapNodesFromMarkdown 
} from '@viztechstack/roadmap-visualization';

// Create extractor with options
const extractor = createNodeExtractor({ maxDepth: 4 });

// Extract nodes directly
const nodes = extractNodesFromMarkdown(markdown);

// Extract as RoadmapNode format (compatible with React Flow)
const roadmapNodes = extractRoadmapNodesFromMarkdown(markdown);
```

### Convert to RoadmapNode Format

```typescript
const extractor = new NodeExtractor();
const result = extractor.extract(markdown);

// Convert individual node
const roadmapNode = extractor.convertToRoadmapNode(result.nodes[0]);

// Or extract directly as RoadmapNodes
const roadmapNodes = extractor.extractAsRoadmapNodes(markdown);
```

## Node Types

The NodeExtractor automatically determines node types based on content:

- **topic**: Main sections and general topics
- **skill**: Sections containing "skill", "ability", "competency"
- **resource**: Sections with "resource", "tool", "library", "documentation" or containing links
- **milestone**: Sections with "milestone", "checkpoint", "goal", "objective"
- **prerequisite**: Sections with "prerequisite", "requirement", "before", "needed"

## Difficulty Detection

Difficulty levels are determined using keyword analysis:

- **beginner**: "basic", "intro", "fundamentals", "getting started", etc.
- **advanced**: "advanced", "expert", "complex", "optimization", "architecture", etc.
- **intermediate**: Default when no specific keywords are found

## Tag Extraction

The extractor identifies technology tags from:

- **Hashtags**: `#javascript`, `#react`
- **Technology terms**: Extensive list of frontend, backend, database, and DevOps technologies
- **Case-insensitive matching**: Automatically normalizes to lowercase

## Resource Extraction

Links in markdown are automatically categorized:

- **video**: YouTube, Vimeo, or URLs/titles containing "video"
- **course**: Udemy, Coursera, edX, or URLs/titles containing "course"
- **book**: URLs/titles containing "book", "ebook", or "pdf"
- **documentation**: Official docs, MDN, W3Schools, or URLs/titles containing "docs"
- **article**: Default category for other links

## Options

```typescript
interface NodeExtractionOptions {
    includeResources?: boolean;     // Extract resources from links (default: true)
    maxDepth?: number;              // Maximum header depth to process (default: 6)
    autoDetectDifficulty?: boolean; // Auto-detect difficulty levels (default: true)
    extractTags?: boolean;          // Extract technology tags (default: true)
}
```

## Output Format

### GraphNode

```typescript
interface GraphNode {
    id: string;                    // Unique identifier
    title: string;                 // Header text
    content: string;               // Section content
    level: number;                 // Header level (1-6)
    type: NodeType;                // Node category
    metadata: {
        wordCount: number;         // Word count in content
        estimatedReadTime: number; // Reading time in minutes
        difficulty?: DifficultyLevel;
        tags: string[];            // Technology tags
        resources?: Resource[];    // Extracted links
    };
    position?: Position;           // Optional position coordinates
}
```

### ExtractedNodes

```typescript
interface ExtractedNodes {
    nodes: GraphNode[];
    metadata: {
        totalNodes: number;
        nodesByLevel: Record<number, number>;
        nodesByType: Record<string, number>;
        averageReadTime: number;
        totalWordCount: number;
    };
}
```

## Validation

The NodeExtractor validates input and provides helpful error messages:

- **Empty content**: Throws error for null, undefined, or empty strings
- **No headers**: Throws error when no markdown headers are found
- **Invalid depth**: Respects maxDepth option to prevent processing overly nested content

## Performance

- **Efficient processing**: Handles large markdown files (tested with 50+ sections)
- **Memory conscious**: Processes content in a single pass
- **Fast execution**: Completes extraction within 1 second for typical roadmaps

## Integration

The NodeExtractor integrates seamlessly with:

- **MarkdownParser**: Uses the parser for initial content processing
- **React Flow**: Output format is compatible with React Flow nodes
- **Type system**: Full TypeScript support with strict typing
- **Validation system**: Works with the package's validation utilities

## Examples

### Complete Frontend Roadmap

```typescript
const frontendRoadmap = `
# Frontend Development Roadmap

Complete guide to becoming a frontend developer.

## Prerequisites

Before starting, you should know:
- Basic computer skills
- Text editor usage

## HTML Fundamentals

### Basic Structure
Learn about HTML document structure.

### Semantic HTML
Use semantic elements for better accessibility.

## CSS Styling

### CSS Basics
Learn selectors, properties, and values.

### Advanced CSS
- Flexbox
- Grid
- Animations

## JavaScript Programming

### ES6+ Features
Modern JavaScript features and syntax.

### DOM Manipulation
Interact with web page elements.

## Frameworks & Libraries

### React.js
Popular library for building user interfaces.

### Vue.js
Progressive framework for building UIs.

## Tools & Workflow

### Version Control
Learn Git and GitHub for code management.

### Build Tools
Webpack, Vite, and other build tools.
`;

const extractor = new NodeExtractor();
const result = extractor.extract(frontendRoadmap);

console.log(`Extracted ${result.metadata.totalNodes} nodes`);
console.log(`Average reading time: ${result.metadata.averageReadTime} minutes`);
console.log(`Total word count: ${result.metadata.totalWordCount} words`);
```

This will extract a comprehensive node structure with proper categorization, difficulty levels, and metadata for visualization.

# EdgeGenerator

The EdgeGenerator service converts relationship analysis results into graph edges for roadmap visualization.

## Features

- **Convert relationships to graph edges**: Transforms analyzed relationships into RoadmapEdge objects
- **Assign edge types**: Categorizes edges as dependency, progression, related, or optional
- **Generate edge metadata**: Creates comprehensive metadata including strength and relationship type
- **Apply custom styling**: Automatically styles edges based on relationship strength and type
- **Support bidirectional edges**: Creates reverse edges for appropriate relationship types
- **Edge validation**: Ensures all edges reference existing nodes and have valid properties
- **Performance optimization**: Filters weak edges and limits edges per node for better visualization
- **Duplicate removal**: Eliminates duplicate edges between the same nodes

## Usage

### Basic Usage

```typescript
import { EdgeGenerator, RelationshipAnalyzer } from '@viztechstack/roadmap-visualization';

// First analyze relationships
const analyzer = new RelationshipAnalyzer();
const analyzedRelationships = analyzer.analyze(nodes, originalContent);

// Then generate edges
const generator = new EdgeGenerator();
const result = generator.generate(analyzedRelationships);

console.log(result.edges.length); // Number of generated edges
console.log(result.metadata.totalEdges); // Same as above
console.log(result.metadata.edgesByType); // Breakdown by edge type
```

### With Options

```typescript
import { EdgeGenerator, type EdgeGenerationOptions } from '@viztechstack/roadmap-visualization';

const options: EdgeGenerationOptions = {
    includeWeakEdges: false,
    minimumStrength: 0.4,
    maxEdgesPerNode: 10,
    enableBidirectional: true,
    customStyling: true
};

const generator = new EdgeGenerator(options);
const result = generator.generate(analyzedRelationships);
```

### Factory Functions

```typescript
import { 
    createEdgeGenerator,
    generateEdges,
    generateAndValidateEdges 
} from '@viztechstack/roadmap-visualization';

// Create generator with options
const generator = createEdgeGenerator({ minimumStrength: 0.5 });

// Generate edges directly
const result = generateEdges(analyzedRelationships);

// Generate and validate edges
const nodeIds = new Set(nodes.map(n => n.id));
const validatedResult = generateAndValidateEdges(analyzedRelationships, nodeIds);
```

### Edge Validation

```typescript
const generator = new EdgeGenerator();
const result = generator.generate(analyzedRelationships);

// Validate edges against node IDs
const nodeIds = new Set(nodes.map(node => node.id));
const isValid = generator.validateEdges(result.edges, nodeIds);

if (!isValid) {
    console.error('Generated edges failed validation');
}
```

## Edge Types

The EdgeGenerator assigns edge types based on relationship analysis:

- **dependency**: Prerequisite relationships (styled in red)
- **progression**: Learning progression paths (styled in green)
- **related**: Related topics and cross-references (styled in blue)
- **optional**: Optional connections and weak relationships (styled in gray)

## Edge Styling

### Automatic Styling Features

- **Stroke width**: Based on relationship strength (1-4px)
- **Color coding**: Different colors for each edge type
- **Opacity**: Reflects confidence level of the relationship
- **Dash patterns**: Dotted lines for optional and related edges

### Color Scheme

```typescript
const edgeColors = {
    dependency: '#dc2626',  // Red - indicates prerequisites
    progression: '#16a34a', // Green - shows learning path
    related: '#2563eb',     // Blue - related topics
    optional: '#6b7280'     // Gray - optional connections
};
```

### Strength-Based Styling

- **Strength 0.0-0.3**: Thin line, low opacity (weak relationship)
- **Strength 0.3-0.6**: Medium line, medium opacity (moderate relationship)
- **Strength 0.6-1.0**: Thick line, high opacity (strong relationship)

## Bidirectional Edges

For certain relationship types, the generator can create bidirectional edges:

```typescript
// Enable bidirectional edges
const options = { enableBidirectional: true };
const generator = new EdgeGenerator(options);

// Only creates reverse edges for 'related-to' relationships with strength >= 0.6
const result = generator.generate(analyzedRelationships);
```

## Options

```typescript
interface EdgeGenerationOptions {
    includeWeakEdges?: boolean;     // Include edges below minimum strength (default: false)
    minimumStrength?: number;       // Minimum relationship strength (default: 0.3)
    maxEdgesPerNode?: number;       // Maximum edges per node (default: 15)
    enableBidirectional?: boolean;  // Create reverse edges (default: false)
    customStyling?: boolean;        // Apply automatic styling (default: true)
}
```

## Output Format

### GeneratedEdges

```typescript
interface GeneratedEdges {
    edges: RoadmapEdge[];
    metadata: {
        totalEdges: number;
        edgesByType: Record<EdgeType, number>;
        averageStrength: number;
        strongestEdge: number;
        weakestEdge: number;
    };
}
```

### RoadmapEdge

```typescript
interface RoadmapEdge {
    id: string;                    // Unique edge identifier
    source: string;                // Source node ID
    target: string;                // Target node ID
    type: EdgeType;                // Edge category
    data?: EdgeData;               // Edge metadata
    style?: EdgeStyle;             // Visual styling
}

interface EdgeData {
    label?: string;                // Edge label (e.g., "requires", "leads to")
    relationship: RelationshipType; // Relationship type
    strength?: number;             // Relationship strength (0-1)
    bidirectional?: boolean;       // Is this a bidirectional edge
}

interface EdgeStyle {
    stroke?: string;               // Edge color
    strokeWidth?: number;          // Line thickness
    strokeDasharray?: string;      // Dash pattern
}
```

## Performance Optimization

### Edge Filtering

The generator optimizes performance by:

- **Strength filtering**: Removes weak relationships below threshold
- **Node limits**: Limits maximum edges per node to prevent overcrowding
- **Duplicate removal**: Eliminates duplicate edges between same nodes
- **Sorting**: Orders edges by strength for better visual hierarchy

### Memory Management

- **Efficient processing**: Single-pass conversion from relationships to edges
- **Minimal memory footprint**: Reuses objects where possible
- **Garbage collection friendly**: Avoids creating unnecessary intermediate objects

## Integration

The EdgeGenerator integrates with:

- **RelationshipAnalyzer**: Consumes analyzed relationships as input
- **React Flow**: Output format is compatible with React Flow edges
- **Validation system**: Provides comprehensive edge validation
- **Styling system**: Automatic styling based on design system colors

## Examples

### Complete Edge Generation Pipeline

```typescript
import { 
    NodeExtractor, 
    RelationshipAnalyzer, 
    EdgeGenerator 
} from '@viztechstack/roadmap-visualization';

const markdown = `
# Frontend Development

## HTML Basics
Learn HTML fundamentals before moving to CSS.

## CSS Styling  
CSS builds on HTML knowledge. Learn selectors and properties.

## JavaScript Programming
JavaScript adds interactivity. Requires HTML and CSS knowledge.
`;

// Extract nodes
const nodeExtractor = new NodeExtractor();
const nodeResult = nodeExtractor.extract(markdown);

// Analyze relationships
const relationshipAnalyzer = new RelationshipAnalyzer();
const relationships = relationshipAnalyzer.analyze(nodeResult.nodes, markdown);

// Generate edges
const edgeGenerator = new EdgeGenerator({
    minimumStrength: 0.4,
    customStyling: true,
    enableBidirectional: false
});

const edgeResult = edgeGenerator.generate(relationships);

console.log(`Generated ${edgeResult.metadata.totalEdges} edges`);
console.log('Edge distribution:', edgeResult.metadata.edgesByType);
console.log(`Average strength: ${edgeResult.metadata.averageStrength.toFixed(2)}`);

// The edges will show:
// HTML Basics -> CSS Styling (dependency)
// HTML Basics -> JavaScript Programming (dependency)  
// CSS Styling -> JavaScript Programming (dependency)
```

### Custom Styling Example

```typescript
const generator = new EdgeGenerator({ customStyling: true });
const result = generator.generate(analyzedRelationships);

// Each edge will have styling like:
// {
//   id: "edge-html-css",
//   source: "html-basics",
//   target: "css-styling", 
//   type: "dependency",
//   data: {
//     label: "requires",
//     relationship: "prerequisite",
//     strength: 0.8
//   },
//   style: {
//     stroke: "rgba(220, 38, 38, 0.8)", // Red with 80% opacity
//     strokeWidth: 3.4,                  // Thick line for strong relationship
//     strokeDasharray: undefined         // Solid line for dependency
//   }
// }
```

This comprehensive edge generation system ensures that roadmap visualizations have meaningful, well-styled connections that accurately represent the learning relationships between topics.

# HierarchyProcessor

The HierarchyProcessor service processes nested subsections and creates parent-child node relationships while maintaining hierarchy depth information.

## Features

- **Process nested subsections**: Analyzes hierarchical structure from markdown headers
- **Create parent-child relationships**: Establishes direct and implicit hierarchical connections
- **Maintain hierarchy depth**: Tracks depth information and hierarchy paths
- **Validate hierarchy structure**: Ensures consistency and detects potential issues
- **Generate hierarchy metadata**: Provides comprehensive statistics about the hierarchy
- **Support implicit relationships**: Optionally includes ancestor-descendant connections
- **Configurable processing**: Various options for different hierarchy processing needs
- **Path generation**: Creates full paths from root to each node

## Usage

### Basic Usage

```typescript
import { HierarchyProcessor, NodeExtractor } from '@viztechstack/roadmap-visualization';

const markdown = `
# Frontend Development

## HTML Fundamentals
Learn the basics of HTML.

### Basic Tags
Understanding HTML elements.

#### Semantic Elements
Using semantic HTML for better structure.

## CSS Styling
Learn CSS for styling web pages.

### CSS Selectors
Understanding different selector types.
`;

// First extract nodes
const nodeExtractor = new NodeExtractor();
const nodeResult = nodeExtractor.extract(markdown);

// Then process hierarchy
const hierarchyProcessor = new HierarchyProcessor();
const hierarchyResult = hierarchyProcessor.process(nodeResult.nodes);

console.log(`Created ${hierarchyResult.metadata.totalRelationships} hierarchical relationships`);
console.log(`Maximum depth: ${hierarchyResult.metadata.maxDepth}`);
console.log(`Root nodes: ${hierarchyResult.metadata.rootNodes.length}`);
```

### With Options

```typescript
import { HierarchyProcessor, type HierarchyProcessingOptions } from '@viztechstack/roadmap-visualization';

const options: HierarchyProcessingOptions = {
    maxDepth: 5,
    includeImplicitHierarchy: true,
    strengthByDepth: true,
    validateHierarchy: true
};

const processor = new HierarchyProcessor(options);
const result = processor.process(nodes);
```

### Factory Functions

```typescript
import { 
    createHierarchyProcessor,
    processNodeHierarchy,
    validateHierarchyStructure 
} from '@viztechstack/roadmap-visualization';

// Create processor with options
const processor = createHierarchyProcessor({ maxDepth: 4 });

// Process hierarchy directly
const result = processNodeHierarchy(nodes);

// Validate hierarchy structure
const validation = validateHierarchyStructure(nodes);
if (!validation.isValid) {
    console.error('Hierarchy validation errors:', validation.errors);
}
```

### Hierarchy Analysis

```typescript
const processor = new HierarchyProcessor();
const result = processor.process(nodes);

// Get hierarchy statistics
const stats = processor.getHierarchyStatistics(result);
console.log(`Average depth: ${stats.averageDepth}`);
console.log(`Hierarchy balance: ${stats.hierarchyBalance}`);
console.log(`Branching factor: ${stats.branchingFactor}`);

// Find descendants and ancestors
const descendants = processor.findDescendants('node-id', result.relationships);
const ancestors = processor.findAncestors('node-id', result.relationships);
```

## Relationship Types

The HierarchyProcessor creates different types of hierarchical relationships:

- **Direct relationships**: Parent-child connections between adjacent levels (strength: 0.9)
- **Implicit relationships**: Ancestor-descendant connections across multiple levels (strength: 0.6)
- **Content-based adjustments**: Strength adjustments based on content similarity

## Hierarchy Processing

### Direct Parent-Child Relationships

```typescript
// For this structure:
// # Level 1
// ## Level 2
// ### Level 3

// Creates relationships:
// Level 1 -> Level 2 (direct, strength: 0.9)
// Level 2 -> Level 3 (direct, strength: 0.9)
```

### Implicit Hierarchy Relationships

```typescript
// For this structure:
// # Level 1
// ### Level 3 (skipped level 2)

// Creates relationships:
// Level 1 -> Level 3 (implicit, strength: 0.6)
```

### Hierarchy Paths

Each node gets a full path from root to itself:

```typescript
// For node "Semantic Elements" in:
// Frontend Development > HTML Fundamentals > Basic Tags > Semantic Elements

const hierarchyPaths = result.metadata.hierarchyPaths;
console.log(hierarchyPaths['semantic-elements']);
// Output: ['Frontend Development', 'HTML Fundamentals', 'Basic Tags', 'Semantic Elements']
```

## Options

```typescript
interface HierarchyProcessingOptions {
    maxDepth?: number;              // Maximum hierarchy depth to process (default: 10)
    includeImplicitHierarchy?: boolean; // Include ancestor-descendant relationships (default: true)
    strengthByDepth?: boolean;      // Adjust strength based on depth (default: true)
    validateHierarchy?: boolean;    // Validate hierarchy consistency (default: true)
}
```

## Output Format

### ProcessedHierarchy

```typescript
interface ProcessedHierarchy {
    relationships: HierarchyRelationship[];
    metadata: {
        totalRelationships: number;
        maxDepth: number;
        nodesByDepth: Record<number, number>;
        hierarchyPaths: Record<string, string[]>;
        rootNodes: string[];        // Nodes with no parents
        leafNodes: string[];        // Nodes with no children
    };
}
```

### HierarchyRelationship

```typescript
interface HierarchyRelationship {
    parentId: string;               // Parent node ID
    childId: string;                // Child node ID
    depth: number;                  // Hierarchy depth
    type: RelationshipType;         // Always 'part-of' for hierarchy
    edgeType: EdgeType;             // 'dependency' for direct, 'optional' for implicit
    strength: number;               // Relationship strength (0-1)
    hierarchyPath: string[];        // Full path from root to child
}
```

## Validation

The HierarchyProcessor includes comprehensive validation:

### Automatic Validation

- **Duplicate ID detection**: Ensures all node IDs are unique
- **Level validation**: Checks for valid level numbers
- **Depth limits**: Warns about nodes exceeding maximum depth
- **Level progression**: Warns about large level jumps

### Manual Validation

```typescript
const validation = validateHierarchyStructure(nodes, { maxDepth: 5 });

if (!validation.isValid) {
    console.error('Validation errors:', validation.errors);
}

if (validation.warnings.length > 0) {
    console.warn('Validation warnings:', validation.warnings);
}
```

## Hierarchy Statistics

### Balance Analysis

```typescript
const stats = processor.getHierarchyStatistics(result);

// Hierarchy balance (0-1, higher is more balanced)
console.log(`Balance: ${stats.hierarchyBalance}`);

// Average depth across all nodes
console.log(`Average depth: ${stats.averageDepth}`);

// Average number of children per parent
console.log(`Branching factor: ${stats.branchingFactor}`);
```

### Node Distribution

```typescript
const metadata = result.metadata;

// Nodes at each depth level
console.log('Nodes by depth:', metadata.nodesByDepth);
// Output: { 1: 1, 2: 2, 3: 2, 4: 1 }

// Root nodes (top-level)
console.log('Root nodes:', metadata.rootNodes);

// Leaf nodes (no children)
console.log('Leaf nodes:', metadata.leafNodes);
```

## Integration

The HierarchyProcessor integrates seamlessly with:

- **NodeExtractor**: Processes extracted nodes to create hierarchy
- **RelationshipAnalyzer**: Provides additional relationship context
- **EdgeGenerator**: Hierarchy relationships can be converted to edges
- **React Flow**: Output format is compatible with graph visualization
- **Validation system**: Comprehensive validation and error handling

## Performance

- **Efficient processing**: O(n²) complexity for relationship detection
- **Memory conscious**: Processes relationships in a single pass
- **Scalable**: Handles large hierarchies (tested with 100+ nodes)
- **Optimized algorithms**: Smart parent-finding and path generation

## Examples

### Complete Hierarchy Processing Pipeline

```typescript
import { 
    NodeExtractor, 
    HierarchyProcessor,
    RelationshipAnalyzer,
    EdgeGenerator 
} from '@viztechstack/roadmap-visualization';

const markdown = `
# Web Development

## Frontend Development
Client-side development technologies.

### HTML
Markup language for web pages.

#### Semantic HTML
Using meaningful HTML elements.

### CSS
Styling language for web pages.

#### CSS Grid
Advanced layout system.

#### Flexbox
Flexible box layout.

### JavaScript
Programming language for web.

## Backend Development
Server-side development.

### Node.js
JavaScript runtime for servers.

### Databases
Data storage solutions.
`;

// 1. Extract nodes
const nodeExtractor = new NodeExtractor();
const nodeResult = nodeExtractor.extract(markdown);

// 2. Process hierarchy
const hierarchyProcessor = new HierarchyProcessor({
    includeImplicitHierarchy: true,
    strengthByDepth: true
});
const hierarchyResult = hierarchyProcessor.process(nodeResult.nodes);

// 3. Analyze additional relationships
const relationshipAnalyzer = new RelationshipAnalyzer();
const relationshipResult = relationshipAnalyzer.analyze(nodeResult.nodes, markdown);

// 4. Generate edges (combining hierarchy and other relationships)
const edgeGenerator = new EdgeGenerator();
const edgeResult = edgeGenerator.generate(relationshipResult);

console.log('Processing complete:');
console.log(`- ${nodeResult.metadata.totalNodes} nodes extracted`);
console.log(`- ${hierarchyResult.metadata.totalRelationships} hierarchy relationships`);
console.log(`- ${relationshipResult.metadata.totalRelationships} total relationships`);
console.log(`- ${edgeResult.metadata.totalEdges} edges generated`);

// Hierarchy analysis
const stats = hierarchyProcessor.getHierarchyStatistics(hierarchyResult);
console.log(`\nHierarchy Statistics:`);
console.log(`- Average depth: ${stats.averageDepth.toFixed(2)}`);
console.log(`- Balance score: ${stats.hierarchyBalance.toFixed(2)}`);
console.log(`- Branching factor: ${stats.branchingFactor.toFixed(2)}`);

// Show hierarchy paths
console.log(`\nHierarchy Paths:`);
for (const [nodeId, path] of Object.entries(hierarchyResult.metadata.hierarchyPaths)) {
    console.log(`${nodeId}: ${path.join(' > ')}`);
}
```

This comprehensive hierarchy processing system ensures that roadmap visualizations accurately represent the nested structure and relationships inherent in markdown content, providing a solid foundation for hierarchical graph layouts and navigation.

# ResourceExtractor

The ResourceExtractor service extracts links, references, and resources from markdown content to create resource nodes for roadmap visualization.

## Features

- **Extract multiple link formats**: Markdown links, HTML links, and plain URLs
- **Automatic resource type detection**: Identifies articles, videos, courses, books, tools, documentation, tutorials, examples, GitHub repos, blogs, and podcasts
- **Resource metadata extraction**: Domain, protocol, path, query parameters, and file extensions
- **Cost and difficulty detection**: Automatically determines if resources are free, paid, or subscription-based
- **URL validation**: Validates URL format and detects suspicious links
- **Duplicate removal**: Eliminates duplicate resources based on normalized URLs
- **Context extraction**: Captures surrounding text context for each resource
- **Resource categorization**: Creates structured resource nodes with comprehensive metadata
- **Performance optimization**: Efficient regex-based extraction with configurable options

## Usage

### Basic Usage

```typescript
import { ResourceExtractor } from '@viztechstack/roadmap-visualization';

const markdown = `
# Learning Resources

## Documentation
- [React Documentation](https://react.dev/) - Official React docs
- [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web) - Web development reference

## Video Courses
- [React Course on YouTube](https://www.youtube.com/watch?v=abc123) - Free React tutorial
- [Advanced React on Udemy](https://www.udemy.com/course/react-advanced) - Paid comprehensive course

## Tools
- [Create React App](https://github.com/facebook/create-react-app) - React project scaffolding
- [Vite](https://vitejs.dev/) - Fast build tool

## Books
- [Learning React](https://www.oreilly.com/library/view/learning-react/9781491954614/) - O'Reilly book

Plain URL example: https://css-tricks.com/react-hooks-guide/
`;

const extractor = new ResourceExtractor();
const result = extractor.extract(markdown);

console.log(`Found ${result.statistics.totalResources} resources`);
console.log('Resource types:', result.statistics.resourcesByType);
console.log(`Created ${result.resourceNodes.length} resource nodes`);
```

### With Options

```typescript
import { ResourceExtractor, type ResourceExtractionOptions } from '@viztechstack/roadmap-visualization';

const options: ResourceExtractionOptions = {
    includeInternalLinks: false,    // Skip internal links
    includeImages: true,            // Include images
    includeDownloads: true,         // Include downloadable files
    maxContextLength: 150,          // Longer context
    detectResourceType: true,       // Auto-detect types
    validateUrls: true,             // Validate URL format
    extractMetadata: true           // Extract detailed metadata
};

const extractor = new ResourceExtractor(options);
const result = extractor.extract(markdown);
```

### Factory Functions

```typescript
import { 
    createResourceExtractor,
    extractResourcesFromContent,
    getResourceStatistics 
} from '@viztechstack/roadmap-visualization';

// Create extractor with options
const extractor = createResourceExtractor({ detectResourceType: true });

// Extract resources directly
const result = extractResourcesFromContent(markdown);

// Get resource statistics
const stats = getResourceStatistics(result.resources);
console.log(`Total: ${stats.totalCount}`);
console.log('Type distribution:', stats.typeDistribution);
```

## Resource Types

The ResourceExtractor automatically detects these resource types:

- **article**: Blog posts, news articles, general content
- **video**: YouTube, Vimeo, educational videos
- **course**: Udemy, Coursera, online courses
- **book**: Physical/digital books, eBooks, PDFs
- **tool**: Development tools, editors, frameworks
- **documentation**: Official docs, API references
- **tutorial**: Step-by-step guides, how-tos
- **example**: Code examples, demos, CodePen
- **github**: GitHub repositories
- **website**: General websites
- **blog**: Personal/company blogs
- **podcast**: Audio content, Spotify podcasts
- **reference**: Reference materials, cheatsheets

## Automatic Detection Features

### Type Detection Based on URL Patterns

```typescript
// Examples of automatic type detection:
'https://github.com/facebook/react' → 'github'
'https://www.youtube.com/watch?v=abc' → 'video'
'https://www.udemy.com/course/react' → 'course'
'https://react.dev/docs' → 'documentation'
'https://medium.com/@author/article' → 'blog'
```

### Cost Detection

```typescript
// Automatic cost detection:
'https://github.com/...' → 'free'
'https://www.udemy.com/...' → 'paid'
'https://linkedin.com/learning/...' → 'subscription'
```

### Difficulty Detection

```typescript
// Based on title and context keywords:
'React Basics Tutorial' → 'beginner'
'Advanced React Patterns' → 'advanced'
'React Development Guide' → 'intermediate' (default)
```

## Options

```typescript
interface ResourceExtractionOptions {
    includeInternalLinks?: boolean;     // Include relative/internal links (default: true)
    includeExternalLinks?: boolean;     // Include external HTTP(S) links (default: true)
    includeImages?: boolean;            // Include image references (default: false)
    includeDownloads?: boolean;         // Include downloadable files (default: true)
    maxContextLength?: number;          // Context text length (default: 100)
    detectResourceType?: boolean;       // Auto-detect resource types (default: true)
    validateUrls?: boolean;             // Validate URL format (default: true)
    extractMetadata?: boolean;          // Extract detailed metadata (default: true)
}
```

## Output Format

### ResourceExtractionResult

```typescript
interface ResourceExtractionResult {
    resources: ExtractedResource[];     // Raw extracted resources
    resourceNodes: ResourceNode[];      // Graph nodes for visualization
    statistics: {
        totalResources: number;
        resourcesByType: Record<ResourceType, number>;
        internalLinks: number;
        externalLinks: number;
        brokenLinks: number;
        duplicateResources: number;
    };
    errors: string[];                   // Validation errors
    warnings: string[];                 // Non-critical issues
}
```

### ExtractedResource

```typescript
interface ExtractedResource {
    url: string;                        // Resource URL
    title: string;                      // Resource title
    type: ResourceType;                 // Detected resource type
    context: string;                    // Surrounding text context
    position: number;                   // Position in content
    metadata?: ResourceMetadata;        // Detailed metadata
}
```

### ResourceNode

```typescript
interface ResourceNode extends GraphNode {
    resourceType: ResourceType;         // Type of resource
    url?: string;                       // Resource URL
    author?: string;                    // Resource author
    duration?: string;                  // Estimated duration
    cost?: ResourceCost;                // Cost type (free/paid/subscription)
    difficulty?: DifficultyLevel;       // Difficulty level
    language?: string;                  // Content language
    publishedDate?: Date;               // Publication date
    lastUpdated?: Date;                 // Last update date
    rating?: number;                    // Rating (1-5)
    reviews?: number;                   // Number of reviews
    tags?: string[];                    // Resource tags
    description?: string;               // Resource description
}
```

## Validation and Error Handling

### URL Validation

```typescript
// The extractor validates URLs and provides detailed error reporting:
const result = extractor.extract(contentWithBadUrls);

console.log('Errors:', result.errors);
// Output: ['Invalid URL: not-a-valid-url', 'Invalid URL: javascript:alert("xss")']

console.log('Warnings:', result.warnings);
// Output: ['Suspicious URL detected: http://bit.ly/suspicious']
```

### Suspicious URL Detection

The extractor detects potentially suspicious URLs:
- URL shorteners (bit.ly, tinyurl, t.co, goo.gl, ow.ly)
- JavaScript URLs
- Data URLs
- File URLs

## Performance Features

### Efficient Processing

- **Single-pass extraction**: Processes content once for all resource types
- **Regex optimization**: Efficient pattern matching for different link formats
- **Memory conscious**: Minimal memory footprint during processing
- **Duplicate removal**: Efficient deduplication using normalized URLs

### Configurable Performance

```typescript
// For better performance on large content:
const options = {
    validateUrls: false,        // Skip URL validation
    extractMetadata: false,     // Skip detailed metadata
    maxContextLength: 50        // Shorter context
};
```

## Integration

The ResourceExtractor integrates seamlessly with other extractors:

```typescript
import { 
    NodeExtractor, 
    ResourceExtractor,
    RelationshipAnalyzer,
    EdgeGenerator 
} from '@viztechstack/roadmap-visualization';

// Complete extraction pipeline
const nodeExtractor = new NodeExtractor();
const resourceExtractor = new ResourceExtractor();
const relationshipAnalyzer = new RelationshipAnalyzer();
const edgeGenerator = new EdgeGenerator();

// Extract content nodes
const nodeResult = nodeExtractor.extract(markdown);

// Extract resource nodes
const resourceResult = resourceExtractor.extract(markdown);

// Combine all nodes
const allNodes = [...nodeResult.nodes, ...resourceResult.resourceNodes];

// Analyze relationships (including resource connections)
const relationships = relationshipAnalyzer.analyze(allNodes, markdown);

// Generate edges
const edges = edgeGenerator.generate(relationships);

console.log(`Total nodes: ${allNodes.length}`);
console.log(`Resource nodes: ${resourceResult.resourceNodes.length}`);
console.log(`Total edges: ${edges.metadata.totalEdges}`);
```

## Examples

### Complete Resource Processing

```typescript
const learningContent = `
# Frontend Development Learning Path

## Getting Started
Before diving in, check out these resources:
- [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web) - Comprehensive reference
- [freeCodeCamp](https://www.freecodecamp.org/) - Free interactive learning

## HTML & CSS
### Documentation
- [HTML Living Standard](https://html.spec.whatwg.org/) - Official HTML specification
- [CSS Specification](https://www.w3.org/Style/CSS/) - W3C CSS docs

### Video Tutorials
- [HTML Crash Course](https://www.youtube.com/watch?v=UB1O30fR-EE) - Free YouTube tutorial
- [CSS Grid Course](https://cssgrid.io/) - Free course by Wes Bos

### Tools
- [VS Code](https://code.visualstudio.com/) - Popular code editor
- [Chrome DevTools](https://developers.google.com/web/tools/chrome-devtools) - Browser debugging

## JavaScript
### Books
- [Eloquent JavaScript](https://eloquentjavascript.net/) - Free online book
- [You Don't Know JS](https://github.com/getify/You-Dont-Know-JS) - GitHub book series

### Courses
- [JavaScript30](https://javascript30.com/) - 30 day vanilla JS challenge
- [Complete JavaScript Course](https://www.udemy.com/course/the-complete-javascript-course/) - Paid Udemy course

### Examples
- [JavaScript Examples](https://www.w3schools.com/js/js_examples.asp) - W3Schools examples
- [CodePen JavaScript](https://codepen.io/tag/javascript) - Interactive examples

Plain URLs:
https://javascript.info/ - Modern JavaScript tutorial
https://github.com/airbnb/javascript - Airbnb style guide
`;

const extractor = new ResourceExtractor({
    detectResourceType: true,
    extractMetadata: true,
    validateUrls: true
});

const result = extractor.extract(learningContent);

console.log('=== Resource Extraction Results ===');
console.log(`Total resources: ${result.statistics.totalResources}`);
console.log(`External links: ${result.statistics.externalLinks}`);
console.log(`Duplicates removed: ${result.statistics.duplicateResources}`);

console.log('\n=== Resource Type Distribution ===');
Object.entries(result.statistics.resourcesByType).forEach(([type, count]) => {
    console.log(`${type}: ${count}`);
});

console.log('\n=== Sample Resource Nodes ===');
result.resourceNodes.slice(0, 5).forEach(node => {
    console.log(`\n${node.title}:`);
    console.log(`  Type: ${node.resourceType}`);
    console.log(`  Cost: ${node.cost}`);
    console.log(`  Difficulty: ${node.difficulty}`);
    console.log(`  URL: ${node.url}`);
});

if (result.errors.length > 0) {
    console.log('\n=== Errors ===');
    result.errors.forEach(error => console.log(`❌ ${error}`));
}

if (result.warnings.length > 0) {
    console.log('\n=== Warnings ===');
    result.warnings.forEach(warning => console.log(`⚠️ ${warning}`));
}
```

This comprehensive resource extraction system ensures that roadmap visualizations can include rich learning materials and external references, providing learners with direct access to relevant resources within the visualization context.