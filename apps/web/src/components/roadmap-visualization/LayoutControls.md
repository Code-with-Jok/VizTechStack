# LayoutControls Component

The LayoutControls component provides a unified interface for managing all layout functionality in the roadmap visualization system. It integrates with the LayoutManager service to provide smooth transitions between different layout algorithms.

## Features

- **Unified Layout Management**: Single component that handles all layout types
- **Layout Selection**: Dropdown with layout information and performance indicators
- **Smooth Transitions**: Integration with LayoutManager for animated transitions
- **Layout-Specific Controls**: Conditional rendering of appropriate controls for each layout
- **State Preservation**: Maintains layout history and transition state
- **Performance Optimization**: Provides layout recommendations based on graph size
- **Accessibility**: Full keyboard navigation and screen reader support

## Usage

### Basic Usage

```tsx
import { LayoutControls } from '@/components/roadmap-visualization/LayoutControls';

function RoadmapVisualization() {
    const [currentLayout, setCurrentLayout] = useState<LayoutType>('hierarchical');
    const [layoutOptions, setLayoutOptions] = useState({});
    
    return (
        <LayoutControls
            currentLayout={currentLayout}
            onLayoutChange={(layout, options) => {
                setCurrentLayout(layout);
                setLayoutOptions(options);
            }}
            graphData={graphData}
        />
    );
}
```

### With LayoutManager Integration

```tsx
import { LayoutControls } from '@/components/roadmap-visualization/LayoutControls';
import { createLayoutManager } from '@viztechstack/roadmap-visualization';

function RoadmapVisualization() {
    const [layoutManager] = useState(() => createLayoutManager({
        enableAnimations: true,
        animationDuration: 800,
        preserveSelection: true
    }));
    
    const [currentLayout, setCurrentLayout] = useState<LayoutType>('hierarchical');
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [transitionProgress, setTransitionProgress] = useState(0);
    
    const handleLayoutChange = async (layout: LayoutType, options: any) => {
        try {
            const result = await layoutManager.switchLayout(graphData, layout, options);
            setCurrentLayout(result.layout);
            // Update visualization with result.nodes
        } catch (error) {
            console.error('Layout transition failed:', error);
        }
    };
    
    return (
        <LayoutControls
            currentLayout={currentLayout}
            onLayoutChange={handleLayoutChange}
            isTransitioning={isTransitioning}
            transitionProgress={transitionProgress}
            layoutHistory={layoutManager.getLayoutHistory()}
            graphData={graphData}
            onTransitionStart={(from, to) => {
                setIsTransitioning(true);
                setTransitionProgress(0);
            }}
            onTransitionComplete={(layout) => {
                setIsTransitioning(false);
                setTransitionProgress(1);
            }}
        />
    );
}
```

### With All Layout Options

```tsx
function AdvancedLayoutControls() {
    const [hierarchicalOptions, setHierarchicalOptions] = useState<HierarchicalLayoutOptions>({
        direction: 'TB',
        nodeWidth: 200,
        nodeHeight: 80,
        // ... other options
    });
    
    const [forceOptions, setForceOptions] = useState<ForceDirectedLayoutOptions>({
        linkStrength: 0.3,
        chargeStrength: -300,
        // ... other options
    });
    
    // ... other layout options
    
    return (
        <LayoutControls
            currentLayout={currentLayout}
            onLayoutChange={handleLayoutChange}
            
            // Hierarchical options
            hierarchicalOptions={hierarchicalOptions}
            onHierarchicalOptionsChange={(options) => 
                setHierarchicalOptions(prev => ({ ...prev, ...options }))
            }
            onCollapseLevel={handleCollapseLevel}
            onExpandLevel={handleExpandLevel}
            onCollapseAll={handleCollapseAll}
            onExpandAll={handleExpandAll}
            collapsedLevels={collapsedLevels}
            totalLevels={totalLevels}
            
            // Force options
            forceOptions={forceOptions}
            onForceOptionsChange={(options) =>
                setForceOptions(prev => ({ ...prev, ...options }))
            }
            manualPositioning={manualPositioning}
            onManualPositioningChange={setManualPositioning}
            simulationSpeed={simulationSpeed}
            onSimulationSpeedChange={setSimulationSpeed}
            
            // ... other layout options
            
            showAdvanced={true}
        />
    );
}
```

## Props

### Core Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `currentLayout` | `LayoutType` | ✅ | Current active layout type |
| `onLayoutChange` | `(layout: LayoutType, options?: any) => void` | ✅ | Callback when layout changes |
| `isTransitioning` | `boolean` | ❌ | Whether layout is currently transitioning |
| `transitionProgress` | `number` | ❌ | Transition progress (0-1) |
| `layoutHistory` | `LayoutType[]` | ❌ | History of layout changes |
| `graphData` | `GraphData` | ❌ | Graph data for optimization recommendations |

### Layout-Specific Props

#### Hierarchical Layout
| Prop | Type | Description |
|------|------|-------------|
| `hierarchicalOptions` | `HierarchicalLayoutOptions` | Hierarchical layout configuration |
| `onHierarchicalOptionsChange` | `(options: Partial<HierarchicalLayoutOptions>) => void` | Options change callback |
| `onCollapseLevel` | `(level: number) => void` | Collapse specific level |
| `onExpandLevel` | `(level: number) => void` | Expand specific level |
| `onCollapseAll` | `() => void` | Collapse all levels |
| `onExpandAll` | `() => void` | Expand all levels |
| `collapsedLevels` | `Set<number>` | Set of collapsed level numbers |
| `totalLevels` | `number` | Total number of levels |

#### Force Layout
| Prop | Type | Description |
|------|------|-------------|
| `forceOptions` | `ForceDirectedLayoutOptions` | Force layout configuration |
| `onForceOptionsChange` | `(options: Partial<ForceDirectedLayoutOptions>) => void` | Options change callback |
| `manualPositioning` | `boolean` | Enable manual node positioning |
| `onManualPositioningChange` | `(enabled: boolean) => void` | Manual positioning toggle |
| `simulationSpeed` | `number` | Simulation speed multiplier |
| `onSimulationSpeedChange` | `(speed: number) => void` | Speed change callback |

#### Circular Layout
| Prop | Type | Description |
|------|------|-------------|
| `circularOptions` | `CircularLayoutOptions` | Circular layout configuration |
| `onCircularOptionsChange` | `(options: Partial<CircularLayoutOptions>) => void` | Options change callback |
| `circularRotationSpeed` | `number` | Rotation animation speed |
| `onCircularRotationSpeedChange` | `(speed: number) => void` | Rotation speed callback |
| `circularSectorHighlight` | `SectorHighlight` | Sector highlighting configuration |
| `onCircularSectorHighlightChange` | `(highlight: Partial<SectorHighlight>) => void` | Sector highlight callback |
| `onCircularRotateTo` | `(angle: number) => void` | Rotate to specific angle |

#### Grid Layout
| Prop | Type | Description |
|------|------|-------------|
| `gridOptions` | `GridLayoutOptions` | Grid layout configuration |
| `onGridOptionsChange` | `(options: Partial<GridLayoutOptions>) => void` | Options change callback |
| `gridSnapToGrid` | `boolean` | Enable grid snapping |
| `onGridSnapToGridChange` | `(snap: boolean) => void` | Grid snap toggle |
| `gridShowGridLines` | `boolean` | Show grid guide lines |
| `onGridShowGridLinesChange` | `(show: boolean) => void` | Grid lines toggle |
| `gridAlignment` | `GridAlignment` | Grid alignment configuration |
| `onGridAlignmentChange` | `(alignment: Partial<GridAlignment>) => void` | Alignment change callback |
| `onGridOptimizeForContent` | `() => void` | Optimize grid for content |

### Transition Callbacks

| Prop | Type | Description |
|------|------|-------------|
| `onTransitionStart` | `(fromLayout: LayoutType, toLayout: LayoutType) => void` | Transition start callback |
| `onTransitionComplete` | `(layout: LayoutType) => void` | Transition complete callback |
| `onTransitionError` | `(error: Error, layout: LayoutType) => void` | Transition error callback |

### UI Props

| Prop | Type | Description |
|------|------|-------------|
| `className` | `string` | Additional CSS classes |
| `showAdvanced` | `boolean` | Show advanced quick-switch controls |

## Layout Information

The component provides detailed information about each layout type:

### Hierarchical Layout
- **Best for**: Structured learning paths with clear progression
- **Performance**: Fast
- **Features**: Level-based organization, collapse/expand functionality

### Force-Directed Layout
- **Best for**: Exploring complex relationships between topics
- **Performance**: Slow (physics simulation)
- **Features**: Dynamic positioning, manual node placement, relationship strength

### Circular Layout
- **Best for**: Overview of connections and topic grouping
- **Performance**: Medium
- **Features**: Concentric circles, rotation controls, sector highlighting

### Grid Layout
- **Best for**: Organized, structured topic arrangement
- **Performance**: Fast
- **Features**: Automatic sizing, alignment options, grid snapping

## Performance Recommendations

The component automatically provides layout recommendations based on graph size:

- **< 20 nodes**: Circular layout for better overview
- **20-50 nodes**: Force-directed for relationship exploration
- **50-100 nodes**: Hierarchical for structured viewing
- **> 100 nodes**: Grid layout for performance

## Accessibility Features

- **Keyboard Navigation**: Full keyboard support for all controls
- **Screen Reader Support**: ARIA labels and semantic markup
- **Focus Management**: Proper focus handling during transitions
- **High Contrast**: Supports system high contrast settings

## Integration with LayoutManager

The component is designed to work seamlessly with the LayoutManager service:

```tsx
// Create layout manager with optimal settings
const layoutManager = createLayoutManager({
    enableAnimations: true,
    animationDuration: 800,
    preserveSelection: true,
    preserveViewport: true,
    onTransitionStart: (from, to) => {
        // Handle transition start
    },
    onTransitionComplete: (layout) => {
        // Handle transition complete
    }
});

// Use with LayoutControls
<LayoutControls
    currentLayout={layoutManager.getCurrentLayout()}
    onLayoutChange={(layout, options) => {
        layoutManager.switchLayout(graphData, layout, options);
    }}
    isTransitioning={layoutManager.isTransitioning()}
    transitionProgress={layoutManager.getTransitionProgress()}
    layoutHistory={layoutManager.getLayoutHistory()}
/>
```

## Styling

The component uses Tailwind CSS classes and follows the design system:

- **Colors**: Primary colors for active states, neutral for inactive
- **Spacing**: Consistent padding and margins
- **Typography**: Appropriate font sizes and weights
- **Animations**: Smooth transitions and hover effects

## Error Handling

The component handles various error scenarios:

- **Invalid Layout Types**: Graceful fallback to default layout
- **Missing Options**: Uses sensible defaults
- **Transition Failures**: Error callbacks and fallback states
- **Performance Issues**: Automatic optimization recommendations

## Best Practices

1. **Always provide `graphData`** for optimal layout recommendations
2. **Use transition callbacks** to provide user feedback
3. **Implement error handling** for layout changes
4. **Preserve user preferences** across sessions
5. **Test with different graph sizes** for performance
6. **Provide loading states** during transitions
7. **Use appropriate layout types** based on content structure

## Examples

See the `examples/` directory for complete implementation examples:
- Basic layout switching
- Advanced configuration
- LayoutManager integration
- Custom styling
- Error handling