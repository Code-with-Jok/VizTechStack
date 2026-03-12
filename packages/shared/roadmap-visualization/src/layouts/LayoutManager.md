# LayoutManager

The LayoutManager service orchestrates switching between different layout algorithms with smooth transitions and state preservation.

## Features

- **Layout Switching**: Seamlessly switch between hierarchical, force-directed, circular, and grid layouts
- **Smooth Transitions**: Animated transitions with customizable duration and easing
- **State Preservation**: Maintains node selection and viewport state during transitions
- **Error Handling**: Robust fallback mechanisms for layout failures
- **Performance Optimization**: Adaptive settings based on graph size

## Basic Usage

```typescript
import { createLayoutManager } from '@viztechstack/roadmap-visualization';

const layoutManager = createLayoutManager();

// Apply initial layout
const result = await layoutManager.applyLayout(graphData, 'hierarchical');

// Switch to different layout with transition
const transitionResult = await layoutManager.switchLayout(graphData, 'force');
```

## Configuration Options

```typescript
const options: LayoutManagerOptions = {
    enableAnimations: true,
    animationDuration: 800,
    animationEasing: 'ease-in-out',
    preserveSelection: true,
    preserveViewport: true,
    fallbackLayout: 'grid'
};

const layoutManager = createLayoutManager(options);
```

## State Preservation

```typescript
// Set selected nodes
layoutManager.setSelectedNodes(['node1', 'node2']);

// Set viewport state
layoutManager.setViewportState(1.5, 400, 300);

// Selections and viewport are preserved during transitions
const result = await layoutManager.switchLayout(graphData, 'circular');
console.log(result.metadata.preservedSelections); // ['node1', 'node2']
```

## Layout-Specific Options

```typescript
// Configure different options for each layout
layoutManager.updateLayoutOptions('hierarchical', {
    direction: 'TB',
    nodeWidth: 200,
    rankSep: 120
});

layoutManager.updateLayoutOptions('force', {
    linkStrength: 0.4,
    chargeStrength: -400
});

// Apply layout with stored options
await layoutManager.switchLayout(graphData, 'hierarchical');
```
## Transition Callbacks

```typescript
const layoutManager = createLayoutManager({
    onTransitionStart: (from, to) => {
        console.log(`Starting transition: ${from} → ${to}`);
    },
    onTransitionProgress: (progress) => {
        console.log(`Progress: ${Math.round(progress * 100)}%`);
    },
    onTransitionComplete: (layout) => {
        console.log(`Completed transition to: ${layout}`);
    },
    onTransitionError: (error, layout) => {
        console.error(`Error transitioning to ${layout}:`, error);
    }
});
```

## Error Handling

The LayoutManager provides robust error handling with automatic fallbacks:

```typescript
// If a layout fails, it automatically falls back to the configured fallback layout
const layoutManager = createLayoutManager({
    fallbackLayout: 'grid', // Safe fallback
    onTransitionError: (error, layout) => {
        // Handle errors gracefully
        console.warn(`Layout ${layout} failed, using fallback`);
    }
});
```

## Performance Optimization

Get optimal settings based on graph characteristics:

```typescript
import { getOptimalTransitionOptions } from '@viztechstack/roadmap-visualization';

const optimalOptions = getOptimalTransitionOptions(graphData);
const layoutManager = createLayoutManager(optimalOptions);
```

## Utility Functions

Quick operations without managing a LayoutManager instance:

```typescript
import { switchLayoutWithTransition, applyLayoutDirect } from '@viztechstack/roadmap-visualization';

// Quick layout switch with transition
const result = await switchLayoutWithTransition(
    graphData,
    'force',
    { linkStrength: 0.5 },
    { animationDuration: 600 }
);

// Direct layout application without transition
const directResult = await applyLayoutDirect(
    graphData,
    'grid',
    { columns: 3, rows: 2 }
);
```

## API Reference

### LayoutManager Class

#### Methods

- `applyLayout(graphData, layoutType, options?)` - Apply layout directly
- `switchLayout(graphData, layoutType, options?)` - Switch layout with transition
- `getCurrentLayout()` - Get current layout type
- `getLayoutHistory()` - Get layout history
- `isTransitioning()` - Check if currently transitioning
- `getTransitionProgress()` - Get current transition progress (0-1)
- `cancelTransition()` - Cancel active transition
- `setSelectedNodes(nodeIds)` - Set selected nodes for preservation
- `getSelectedNodes()` - Get preserved selected nodes
- `setViewportState(zoom, centerX, centerY)` - Set viewport for preservation
- `getViewportState()` - Get preserved viewport state
- `updateOptions(options)` - Update manager options
- `getOptions()` - Get current options
- `updateLayoutOptions(layoutType, options)` - Update layout-specific options
- `getLayoutOptions(layoutType)` - Get layout-specific options
- `dispose()` - Clean up resources

### Types

#### LayoutManagerOptions
- `enableAnimations: boolean` - Enable transition animations
- `animationDuration: number` - Animation duration in milliseconds
- `animationEasing: string` - Easing function for animations
- `preserveSelection: boolean` - Preserve node selection during transitions
- `preserveViewport: boolean` - Preserve viewport state during transitions
- `fallbackLayout: LayoutType` - Fallback layout on errors
- `transitionSteps: number` - Number of animation steps
- `enableInterpolation: boolean` - Enable position interpolation
- `maxTransitionTime: number` - Maximum transition time before forcing completion

#### LayoutManagerResult
- `nodes: RoadmapNode[]` - Positioned nodes
- `edges: RoadmapEdge[]` - Graph edges
- `layout: LayoutType` - Applied layout type
- `transitionId?: string` - Transition identifier (if animated)
- `metadata: object` - Layout and transition metadata

## Best Practices

1. **Resource Management**: Always call `dispose()` when done with a LayoutManager
2. **Performance**: Use optimal transition options for large graphs
3. **Error Handling**: Configure appropriate fallback layouts
4. **State Preservation**: Set selected nodes and viewport before transitions
5. **Animation Tuning**: Adjust animation duration based on graph complexity

## Examples

See `layout-manager-example.ts` for comprehensive usage examples including:
- Basic layout switching
- Custom animation options
- State preservation
- Error handling
- Performance optimization