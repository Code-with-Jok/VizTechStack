# Edge Validation and Relationship Management

## Overview

This module provides comprehensive edge validation, circular dependency detection, and relationship strength calculation for roadmap visualization graphs.

## Features

- **Edge Validation**: Validate individual edges and entire edge collections
- **Circular Dependency Detection**: Detect cycles in directed graphs using DFS
- **Relationship Strength Calculation**: Calculate relationship strength based on multiple factors
- **Graph Structure Validation**: Comprehensive validation of graph integrity

## API Reference

### Edge Validation

#### `validateEdge(edge, nodes)`

Validates a single edge against a set of nodes.

**Parameters:**
- `edge: RoadmapEdge` - The edge to validate
- `nodes: RoadmapNode[]` - Array of all nodes in the graph

**Returns:** `ValidationResult`
- `valid: boolean` - Whether the edge is valid
- `errors: string[]` - Array of error messages

**Validation Rules:**
- Edge must have non-empty ID, source, and target
- Source and target must reference existing nodes
- Edge cannot be self-referencing (source !== target)
- Relationship strength (if present) must be between 0 and 1

**Example:**
```typescript
import { validateEdge } from '@viztechstack/roadmap-visualization';

const edge = {
  id: 'edge1',
  source: 'nodeA',
  target: 'nodeB',
  type: 'progression',
  data: {
    relationship: 'leads-to',
    strength: 0.8,
  },
};

const nodes = [
  { id: 'nodeA', /* ... */ },
  { id: 'nodeB', /* ... */ },
];

const result = validateEdge(edge, nodes);
if (!result.valid) {
  console.error('Validation errors:', result.errors);
}
```

#### `validateEdges(edges, nodes)`

Validates all edges in a collection.

**Parameters:**
- `edges: RoadmapEdge[]` - Array of edges to validate
- `nodes: RoadmapNode[]` - Array of all nodes in the graph

**Returns:** `ValidationResult`

**Additional Checks:**
- Detects duplicate edge IDs
- Validates each edge individually
- Collects all validation errors

**Example:**
```typescript
import { validateEdges } from '@viztechstack/roadmap-visualization';

const edges = [
  { id: 'edge1', source: 'A', target: 'B', /* ... */ },
  { id: 'edge2', source: 'B', target: 'C', /* ... */ },
];

const result = validateEdges(edges, nodes);
console.log(`Valid: ${result.valid}`);
```

### Circular Dependency Detection

#### `detectCircularDependencies(nodes, edges)`

Detects circular dependencies in a directed graph using depth-first search.

**Parameters:**
- `nodes: RoadmapNode[]` - Array of all nodes
- `edges: RoadmapEdge[]` - Array of all edges

**Returns:** `CircularDependencyResult`
- `hasCircularDependency: boolean` - Whether cycles exist
- `cycles: string[][]` - Array of node ID paths forming cycles

**Algorithm:**
Uses three-color marking DFS:
- White (0): Unvisited node
- Gray (1): Currently being processed (in DFS stack)
- Black (2): Fully processed

A back edge (edge to a gray node) indicates a cycle.

**Example:**
```typescript
import { detectCircularDependencies } from '@viztechstack/roadmap-visualization';

const nodes = [
  { id: 'A', /* ... */ },
  { id: 'B', /* ... */ },
  { id: 'C', /* ... */ },
];

const edges = [
  { id: 'e1', source: 'A', target: 'B', /* ... */ },
  { id: 'e2', source: 'B', target: 'C', /* ... */ },
  { id: 'e3', source: 'C', target: 'A', /* ... */ }, // Creates cycle
];

const result = detectCircularDependencies(nodes, edges);
if (result.hasCircularDependency) {
  console.log('Cycles found:', result.cycles);
  // Output: [['A', 'B', 'C', 'A']]
}
```

### Relationship Strength Calculation

#### `calculateRelationshipStrength(sourceNode, targetNode, edge)`

Calculates relationship strength between two nodes based on multiple factors.

**Parameters:**
- `sourceNode: RoadmapNode` - Source node
- `targetNode: RoadmapNode` - Target node
- `edge: RoadmapEdge` - Edge connecting the nodes

**Returns:** `number` - Strength value between 0 and 1

**Calculation Factors:**

1. **Level Difference** (max 0.3 contribution)
   - Closer levels = stronger relationship
   - Formula: `0.3 - (levelDiff * 0.1)`

2. **Edge Type** (max 0.2 contribution)
   - `dependency`: 0.2
   - `progression`: 0.15
   - `related`: 0.1
   - `optional`: 0.05

3. **Relationship Type** (max 0.15 contribution)
   - `prerequisite`: 0.15
   - `part-of`: 0.12
   - `leads-to`: 0.1
   - `related-to`: 0.08

4. **Bidirectional Bonus** (0.1 contribution)
   - Added if `edge.data.bidirectional === true`

**Example:**
```typescript
import { calculateRelationshipStrength } from '@viztechstack/roadmap-visualization';

const sourceNode = {
  id: 'A',
  data: { level: 0, /* ... */ },
  /* ... */
};

const targetNode = {
  id: 'B',
  data: { level: 1, /* ... */ },
  /* ... */
};

const edge = {
  id: 'e1',
  source: 'A',
  target: 'B',
  type: 'dependency',
  data: {
    relationship: 'prerequisite',
    bidirectional: false,
  },
};

const strength = calculateRelationshipStrength(sourceNode, targetNode, edge);
console.log(`Relationship strength: ${strength.toFixed(2)}`);
// Output: Relationship strength: 0.85
```

#### `calculateAllRelationshipStrengths(graphData)`

Calculates relationship strengths for all edges in a graph.

**Parameters:**
- `graphData: GraphData` - Complete graph data

**Returns:** `GraphData` - New graph data with updated edge strengths

**Notes:**
- Does not mutate original graph data
- Handles edges with non-existent nodes gracefully
- All calculated strengths are in [0, 1] range

**Example:**
```typescript
import { calculateAllRelationshipStrengths } from '@viztechstack/roadmap-visualization';

const graphData = {
  nodes: [/* ... */],
  edges: [/* ... */],
  metadata: {/* ... */},
};

const updatedGraph = calculateAllRelationshipStrengths(graphData);
console.log('Updated edges:', updatedGraph.edges);
```

### Graph Structure Validation

#### `validateGraphStructure(graphData, checkCircularDeps)`

Performs comprehensive validation of graph structure integrity.

**Parameters:**
- `graphData: GraphData` - Graph data to validate
- `checkCircularDeps: boolean` - Whether to check for circular dependencies (default: true for hierarchical layouts)

**Returns:** `ValidationResult`

**Validation Checks:**
1. Graph has at least one node
2. Node IDs are unique
3. All edges are valid (via `validateEdges`)
4. No circular dependencies (for hierarchical layouts)

**Example:**
```typescript
import { validateGraphStructure } from '@viztechstack/roadmap-visualization';

const graphData = {
  nodes: [/* ... */],
  edges: [/* ... */],
  metadata: {
    layoutType: 'hierarchical',
    /* ... */
  },
};

const result = validateGraphStructure(graphData);
if (!result.valid) {
  console.error('Graph validation failed:');
  result.errors.forEach(error => console.error(`  - ${error}`));
}
```

## Usage Examples

### Complete Validation Workflow

```typescript
import {
  validateGraphStructure,
  detectCircularDependencies,
  calculateAllRelationshipStrengths,
} from '@viztechstack/roadmap-visualization';

// 1. Validate graph structure
const validationResult = validateGraphStructure(graphData);
if (!validationResult.valid) {
  throw new Error(`Invalid graph: ${validationResult.errors.join(', ')}`);
}

// 2. Check for circular dependencies
const circularCheck = detectCircularDependencies(
  graphData.nodes,
  graphData.edges
);
if (circularCheck.hasCircularDependency) {
  console.warn('Circular dependencies detected:', circularCheck.cycles);
}

// 3. Calculate relationship strengths
const enhancedGraph = calculateAllRelationshipStrengths(graphData);

// 4. Use enhanced graph for visualization
renderVisualization(enhancedGraph);
```

### Custom Edge Validation

```typescript
import { validateEdge } from '@viztechstack/roadmap-visualization';

function validateCustomEdge(edge, nodes) {
  // Basic validation
  const basicResult = validateEdge(edge, nodes);
  if (!basicResult.valid) {
    return basicResult;
  }

  // Custom validation rules
  const errors = [];
  
  // Example: Ensure dependency edges have strength > 0.5
  if (edge.type === 'dependency' && edge.data?.strength) {
    if (edge.data.strength < 0.5) {
      errors.push('Dependency edges must have strength >= 0.5');
    }
  }

  return {
    valid: errors.length === 0,
    errors: [...basicResult.errors, ...errors],
  };
}
```

### Cycle Detection for Different Layouts

```typescript
import { detectCircularDependencies } from '@viztechstack/roadmap-visualization';

function validateLayoutCompatibility(graphData) {
  const { layoutType } = graphData.metadata;
  
  if (layoutType === 'hierarchical') {
    // Hierarchical layouts require acyclic graphs
    const result = detectCircularDependencies(
      graphData.nodes,
      graphData.edges
    );
    
    if (result.hasCircularDependency) {
      throw new Error(
        `Hierarchical layout requires acyclic graph. Found ${result.cycles.length} cycle(s).`
      );
    }
  }
  
  // Force-directed and circular layouts can handle cycles
  return true;
}
```

## Performance Considerations

### Edge Validation
- **Time Complexity**: O(E) where E is the number of edges
- **Space Complexity**: O(N) for node ID set

### Circular Dependency Detection
- **Time Complexity**: O(N + E) where N is nodes, E is edges
- **Space Complexity**: O(N) for color marking and recursion stack

### Relationship Strength Calculation
- **Time Complexity**: O(E) for all edges
- **Space Complexity**: O(N) for node lookup map

## Best Practices

1. **Always validate before rendering**: Run `validateGraphStructure` before passing data to visualization components

2. **Check circular dependencies for hierarchical layouts**: Hierarchical layouts require acyclic graphs

3. **Calculate strengths after parsing**: Use `calculateAllRelationshipStrengths` after content parsing to enhance edge data

4. **Handle validation errors gracefully**: Provide user-friendly error messages and fallback options

5. **Cache validation results**: For large graphs, cache validation results to avoid repeated calculations

## Error Handling

```typescript
import { validateGraphStructure } from '@viztechstack/roadmap-visualization';

try {
  const result = validateGraphStructure(graphData);
  
  if (!result.valid) {
    // Handle validation errors
    const errorMessage = result.errors.join('\n');
    console.error('Graph validation failed:', errorMessage);
    
    // Show user-friendly message
    showErrorToUser('Unable to display roadmap visualization. Please check the roadmap content.');
    
    // Fallback to content view
    switchToContentView();
  }
} catch (error) {
  console.error('Unexpected validation error:', error);
  // Handle unexpected errors
}
```

## Testing

The module includes comprehensive unit tests covering:
- Edge validation with various invalid inputs
- Circular dependency detection in different graph structures
- Relationship strength calculation with different factors
- Graph structure validation with multiple error scenarios

Run tests:
```bash
pnpm test edge-validation
```

## Related Documentation

- [Validation Guide](../../../.docs/roadmap-visualization/validation-guide.md)
- [Graph Data Models](./types.md)
- [Content Parser](./content-parser.md)
