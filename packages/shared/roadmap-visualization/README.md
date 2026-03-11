# @viztechstack/roadmap-visualization

Core library for roadmap visualization functionality in VizTechStack.

## Overview

This package provides the foundation for converting markdown roadmaps into interactive graph visualizations using React Flow. It includes:

- **Type definitions** for nodes, edges, and graph data structures
- **Validation schemas** using Zod for runtime type safety
- **Content parser** for extracting graph data from markdown
- **Utility functions** for graph manipulation and layout

## Installation

```bash
pnpm add @viztechstack/roadmap-visualization
```

## Usage

### Parsing Markdown Content

```typescript
import { createContentParser } from '@viztechstack/roadmap-visualization';

const parser = createContentParser();
const graphData = await parser.parseContent(markdownContent, {
  includeSubsections: true,
  maxDepth: 5,
  extractDependencies: true,
  autoLayout: true,
});
```

### Validating Graph Data

```typescript
import { validateGraphData, validateGraphStructure } from '@viztechstack/roadmap-visualization';

try {
  validateGraphData(graphData);
  const isValid = validateGraphStructure(graphData);
  console.log('Graph is valid:', isValid);
} catch (error) {
  console.error('Validation failed:', error);
}
```

### Working with Nodes

```typescript
import type { RoadmapNode } from '@viztechstack/roadmap-visualization';
import { groupNodesByLevel, calculateBoundingBox } from '@viztechstack/roadmap-visualization';

const nodes: RoadmapNode[] = graphData.nodes;

// Group nodes by level
const levelGroups = groupNodesByLevel(nodes);

// Calculate bounding box
const bbox = calculateBoundingBox(nodes);
```

## API Reference

### Types

- `NodeType`: 'topic' | 'skill' | 'milestone' | 'resource' | 'prerequisite'
- `DifficultyLevel`: 'beginner' | 'intermediate' | 'advanced'
- `LayoutType`: 'hierarchical' | 'force' | 'circular' | 'grid'
- `EdgeType`: 'dependency' | 'progression' | 'related' | 'optional'

### ContentParser

Main class for parsing markdown content into graph data.

#### Methods

- `parseContent(content: string, options?: ParseOptions): Promise<GraphData>`
  - Parse markdown content into graph data
  - Sanitizes content to prevent XSS
  - Extracts nodes, edges, and metadata

### Validation Functions

- `validateGraphData(data: unknown): boolean`
  - Validate complete graph data structure
  - Throws ZodError if invalid

- `validateGraphStructure(graphData: GraphData): boolean`
  - Check graph integrity (unique IDs, valid references, no cycles)
  - Returns boolean

### Utility Functions

- `generateId(prefix?: string): string`
  - Generate unique IDs for nodes/edges

- `groupNodesByLevel(nodes: RoadmapNode[]): Map<number, RoadmapNode[]>`
  - Group nodes by their level

- `calculateBoundingBox(nodes: RoadmapNode[]): BoundingBox`
  - Calculate bounding box for node positions

- `normalizeNodePositions(nodes, width, height, padding): RoadmapNode[]`
  - Normalize positions to fit viewport

- `debounce(func, wait): Function`
  - Debounce function for performance

- `throttle(func, limit): Function`
  - Throttle function for performance

## Features

### Content Parsing

- Extracts nodes from markdown headers
- Identifies node types (topic, skill, milestone, etc.)
- Extracts metadata (difficulty, estimated time, resources)
- Creates hierarchical relationships
- Detects dependencies and progressions

### Validation

- Runtime type checking with Zod
- Graph structure validation
- Circular dependency detection
- Unique ID enforcement
- Edge reference validation

### Security

- XSS protection through content sanitization
- Removes script tags and event handlers
- Validates all external inputs

## Development

### Build

```bash
pnpm build
```

### Type Check

```bash
pnpm typecheck
```

### Test

```bash
pnpm test
```

## Dependencies

- `@xyflow/react`: React Flow for graph visualization
- `dagre`: Graph layout algorithms
- `d3-hierarchy`: Hierarchical layout calculations
- `markdown-it`: Markdown parsing
- `zod`: Runtime validation

## License

Private - VizTechStack
