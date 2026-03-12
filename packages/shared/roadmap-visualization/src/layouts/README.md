# Layout Algorithms

This directory contains layout algorithms for positioning nodes in roadmap visualizations.

## HierarchicalLayout

The `HierarchicalLayout` class implements a hierarchical positioning algorithm using the dagre library, specifically optimized for topic progression levels with enhanced spacing and alignment.

### Features

- **Topic Progression Positioning**: Positions nodes based on their progression levels in the learning path
- **Optimized Spacing**: Automatically calculates optimal spacing based on content density and node count
- **Smart Alignment**: Aligns nodes within levels for better visual organization
- **Cycle Detection**: Detects and handles circular dependencies in the graph
- **Performance Optimized**: Efficient layout calculation for large graphs
- **Customizable Options**: Extensive configuration options for different use cases

### Basic Usage

```typescript
import { applyHierarchicalLayout } from '@viztechstack/roadmap-visualization';

const result = applyHierarchicalLayout(graphData);
console.log('Positioned nodes:', result.nodes);
```

## ForceDirectedLayout

The `ForceDirectedLayout` class implements a physics-based positioning algorithm using d3-force, optimized for dynamic positioning with configurable attraction/repulsion forces and collision detection.

### Features

- **Physics-Based Simulation**: Uses d3-force for realistic node positioning
- **Configurable Forces**: Attraction, repulsion, centering, and collision forces
- **Relationship-Aware**: Different force strengths based on edge types
- **Level-Based Positioning**: Maintains topic progression structure
- **Collision Detection**: Prevents node overlaps with configurable radii
- **Clustering Support**: Groups related nodes together
- **Performance Optimized**: Efficient simulation for medium-sized graphs

### Basic Usage

```typescript
import { applyForceDirectedLayout } from '@viztechstack/roadmap-visualization';

const result = applyForceDirectedLayout(graphData, {
    width: 1200,
    height: 800,
    iterations: 300
});
console.log('Positioned nodes:', result.nodes);
```

### Advanced Usage

```typescript
import { 
    ForceDirectedLayout,
    applyRelationshipOptimizedLayout,
    getOptimalForceDirectedOptions 
} from '@viztechstack/roadmap-visualization';

// Get optimal options for your graph
const optimalOptions = getOptimalForceDirectedOptions(graphData);

// Apply relationship-optimized layout
const result = applyRelationshipOptimizedLayout(graphData, {
    chargeStrength: -400,
    linkStrength: 0.5
});

// Or use the class directly for more control
const layout = new ForceDirectedLayout({
    width: 1200,
    height: 800,
    chargeStrength: -300,
    linkStrength: 0.3,
    enableCollision: true
});

const result = layout.applyLayout(graphData);
```

### Advanced Usage

```typescript
import { 
    HierarchicalLayout,
    applyProgressionOptimizedLayout,
    getOptimalHierarchicalOptions 
} from '@viztechstack/roadmap-visualization';

// Get optimal options for your graph
const optimalOptions = getOptimalHierarchicalOptions(graphData);

// Apply progression-optimized layout
const result = applyProgressionOptimizedLayout(graphData, {
    direction: 'TB',
    nodeWidth: 250
});

// Or use the class directly for more control
const layout = new HierarchicalLayout({
    direction: 'TB',
    nodeSep: 60,
    rankSep: 120
});

const result = layout.applyLayout(graphData);
```

### Configuration Options

#### HierarchicalLayout Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `direction` | `'TB' \| 'BT' \| 'LR' \| 'RL'` | `'TB'` | Layout direction |
| `nodeWidth` | `number` | `200` | Default node width |
| `nodeHeight` | `number` | `80` | Default node height |
| `nodeSep` | `number` | `50` | Separation between nodes |
| `edgeSep` | `number` | `10` | Separation between edges |
| `rankSep` | `number` | `100` | Separation between ranks/levels |
| `marginX` | `number` | `20` | Horizontal margin |
| `marginY` | `number` | `20` | Vertical margin |
| `align` | `'UL' \| 'UR' \| 'DL' \| 'DR'` | `'UL'` | Node alignment |
| `ranker` | `'network-simplex' \| 'tight-tree' \| 'longest-path'` | `'network-simplex'` | Ranking algorithm |

#### ForceDirectedLayout Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `width` | `number` | `1200` | Layout canvas width |
| `height` | `number` | `800` | Layout canvas height |
| `centerStrength` | `number` | `0.1` | Centering force strength |
| `linkStrength` | `number` | `0.3` | Link attraction strength |
| `linkDistance` | `number` | `100` | Default link distance |
| `chargeStrength` | `number` | `-300` | Node repulsion strength |
| `collisionRadius` | `number` | `40` | Base collision radius |
| `alphaDecay` | `number` | `0.02` | Simulation cooling rate |
| `velocityDecay` | `number` | `0.4` | Velocity damping |
| `iterations` | `number` | `300` | Simulation iterations |
| `enableCollision` | `boolean` | `true` | Enable collision detection |
| `enableCentering` | `boolean` | `true` | Enable centering force |
| `strengthByType` | `object` | See below | Force strength by edge type |

**strengthByType Default Values:**
```typescript
{
    dependency: 0.8,    // Strong attraction for dependencies
    progression: 0.6,   // Medium attraction for progression
    related: 0.3,       // Weak attraction for related topics
    optional: 0.2       // Very weak attraction for optional connections
}
```

### Topic Progression Features

#### HierarchicalLayout

The hierarchical layout is specifically optimized for educational roadmaps with topic progression:

1. **Level-based Positioning**: Nodes are positioned based on their `level` property
2. **Prerequisite Handling**: Considers prerequisite relationships for optimal ordering
3. **Section Grouping**: Groups nodes by section within each level
4. **Progressive Spacing**: Adjusts spacing based on content complexity
5. **Alignment Optimization**: Aligns nodes within levels for visual consistency

#### ForceDirectedLayout

The force-directed layout is optimized for relationship exploration:

1. **Physics-Based Positioning**: Natural node positioning through force simulation
2. **Relationship Strength**: Different forces based on edge types and strengths
3. **Level Awareness**: Maintains vertical progression while allowing horizontal flexibility
4. **Collision Prevention**: Prevents node overlaps with type-based radii
5. **Clustering Support**: Groups related nodes by section or other properties

### Performance Characteristics

#### HierarchicalLayout
- **Small graphs** (< 20 nodes): ~1-2ms layout time
- **Medium graphs** (20-100 nodes): ~5-15ms layout time  
- **Large graphs** (100+ nodes): ~20-50ms layout time

#### ForceDirectedLayout
- **Small graphs** (< 20 nodes): ~10-30ms layout time
- **Medium graphs** (20-100 nodes): ~50-200ms layout time
- **Large graphs** (100+ nodes): ~200-800ms layout time (consider hierarchical for better performance)

### Error Handling

Both layout algorithms include comprehensive error handling:

- Validates input graph data
- Detects circular dependencies (HierarchicalLayout)
- Handles missing nodes/edges gracefully
- Provides meaningful error messages
- Warns about performance implications for large graphs

### Integration with React Flow

The positioned nodes are compatible with React Flow:

```typescript
import { ReactFlow } from '@xyflow/react';

// Hierarchical layout
const hierarchicalResult = applyHierarchicalLayout(graphData);

// Force-directed layout
const forceResult = applyForceDirectedLayout(graphData);

<ReactFlow
    nodes={hierarchicalResult.nodes}
    edges={hierarchicalResult.edges}
    fitView
/>
```

### Examples

See `hierarchical-layout.example.ts` and `force-directed-layout.example.ts` for comprehensive usage examples including:

- Basic layout application
- Custom configuration
- Optimization for different graph types
- Dynamic layout adjustment
- Performance testing
- Error handling

### Algorithm Details

#### HierarchicalLayout

The hierarchical layout uses the dagre library with the following enhancements:

1. **Preprocessing**: Groups nodes by progression level
2. **Ranking**: Assigns ranks based on level and prerequisites
3. **Edge Weighting**: Weights edges based on relationship type
4. **Layout Calculation**: Uses dagre's network-simplex algorithm
5. **Post-processing**: Optimizes alignment within levels
6. **Bounds Calculation**: Calculates final layout bounds

#### ForceDirectedLayout

The force-directed layout uses d3-force with the following configuration:

1. **Node Preparation**: Converts nodes to force simulation format with radii
2. **Link Preparation**: Configures links with type-based strengths and distances
3. **Force Configuration**: Sets up attraction, repulsion, centering, and collision forces
4. **Level Forces**: Adds vertical positioning based on topic progression levels
5. **Simulation**: Runs physics simulation for specified iterations
6. **Position Extraction**: Converts simulation results back to node positions

### Validation Requirements

- **HierarchicalLayout**: Validates **Requirement 3.1** - Hierarchical layout algorithm using dagre library for topic progression positioning with optimized spacing and alignment.
- **ForceDirectedLayout**: Validates **Requirement 3.2** - Force-directed layout algorithm using d3-force for dynamic positioning with attraction/repulsion forces and collision detection.