# HierarchicalLayoutControls Component

## Overview

The `HierarchicalLayoutControls` component provides a comprehensive interface for controlling hierarchical layout options in roadmap visualizations. It offers direction controls, spacing adjustments, and hierarchy collapse/expand functionality.

**Validates: Requirement 3.1**

## Features

### 1. Direction Controls
- **Top-Down (TB)**: Traditional hierarchical flow from top to bottom
- **Bottom-Up (BT)**: Reverse hierarchical flow from bottom to top  
- **Left-Right (LR)**: Horizontal flow from left to right
- **Right-Left (RL)**: Horizontal flow from right to left

### 2. Spacing Adjustments
- **Node Separation**: Control horizontal spacing between nodes at the same level
- **Rank Separation**: Control vertical spacing between different hierarchy levels
- **Node Dimensions**: Adjust width and height of individual nodes

### 3. Hierarchy Management
- **Level Collapse/Expand**: Hide or show specific hierarchy levels
- **Global Controls**: Collapse or expand all levels at once
- **Visual Indicators**: Clear status indicators for each level

## Props

```typescript
interface HierarchicalLayoutControlsProps {
    options: HierarchicalLayoutOptions;
    onOptionsChange: (options: Partial<HierarchicalLayoutOptions>) => void;
    onCollapseLevel: (level: number) => void;
    onExpandLevel: (level: number) => void;
    onCollapseAll: () => void;
    onExpandAll: () => void;
    collapsedLevels: Set<number>;
    totalLevels: number;
    className?: string;
}
```

### Required Props

- `options`: Current hierarchical layout options
- `onOptionsChange`: Callback for layout option changes
- `onCollapseLevel`: Callback to collapse a specific level
- `onExpandLevel`: Callback to expand a specific level
- `onCollapseAll`: Callback to collapse all levels
- `onExpandAll`: Callback to expand all levels
- `collapsedLevels`: Set of currently collapsed level numbers
- `totalLevels`: Total number of hierarchy levels

### Optional Props

- `className`: Additional CSS classes for styling

## Usage

### Basic Usage

```tsx
import { HierarchicalLayoutControls } from '@/components/roadmap-visualization';
import { useHierarchicalLayout } from '@/hooks/useHierarchicalLayout';

function MyVisualization({ graphData }) {
    const {
        options,
        collapsedLevels,
        totalLevels,
        updateOptions,
        collapseLevel,
        expandLevel,
        collapseAll,
        expandAll,
    } = useHierarchicalLayout({ graphData });

    return (
        <HierarchicalLayoutControls
            options={options}
            onOptionsChange={updateOptions}
            onCollapseLevel={collapseLevel}
            onExpandLevel={expandLevel}
            onCollapseAll={collapseAll}
            onExpandAll={expandAll}
            collapsedLevels={collapsedLevels}
            totalLevels={totalLevels}
        />
    );
}
```

### Integration with VisualizationControls

```tsx
import { VisualizationControls } from '@/components/roadmap-visualization';

function MyVisualization() {
    const hierarchicalLayout = useHierarchicalLayout({ graphData });
    
    return (
        <VisualizationControls
            // ... other props
            currentLayout="hierarchical"
            hierarchicalOptions={hierarchicalLayout.options}
            onHierarchicalOptionsChange={hierarchicalLayout.updateOptions}
            onCollapseLevel={hierarchicalLayout.collapseLevel}
            onExpandLevel={hierarchicalLayout.expandLevel}
            onCollapseAll={hierarchicalLayout.collapseAll}
            onExpandAll={hierarchicalLayout.expandAll}
            collapsedLevels={hierarchicalLayout.collapsedLevels}
            totalLevels={hierarchicalLayout.totalLevels}
        />
    );
}
```

## Layout Options

### Direction Options

```typescript
type Direction = 'TB' | 'BT' | 'LR' | 'RL';
```

- **TB (Top-Bottom)**: Best for traditional learning progressions
- **BT (Bottom-Top)**: Good for prerequisite visualization
- **LR (Left-Right)**: Suitable for wide hierarchies
- **RL (Right-Left)**: Alternative horizontal layout

### Spacing Controls

```typescript
interface SpacingOptions {
    nodeSep: number;     // 20-100px, horizontal node spacing
    rankSep: number;     // 60-200px, vertical level spacing
    nodeWidth: number;   // 120-300px, node width
    nodeHeight: number;  // 60-120px, node height
}
```

### Advanced Options

```typescript
interface AdvancedOptions {
    marginX: number;     // Horizontal margin
    marginY: number;     // Vertical margin
    align: 'UL' | 'UR' | 'DL' | 'DR';  // Alignment
    ranker: 'network-simplex' | 'tight-tree' | 'longest-path';
}
```

## User Interface

### Tab Navigation
The component uses a tabbed interface with three sections:

1. **Hướng (Direction)**: Visual direction selector with icons
2. **Khoảng cách (Spacing)**: Slider controls for spacing adjustments
3. **Cấp độ (Hierarchy)**: Level management controls

### Visual Design
- **Expandable Panel**: Collapsible interface to save space
- **Visual Icons**: Intuitive direction indicators
- **Slider Controls**: Smooth range inputs with real-time feedback
- **Level Indicators**: Clear status for each hierarchy level

### Accessibility
- **Keyboard Navigation**: Full keyboard support
- **ARIA Labels**: Screen reader compatibility
- **Focus Management**: Proper focus indicators
- **Tooltips**: Helpful descriptions for all controls

## Styling

### CSS Classes
The component uses VizTechStack design system classes:

```css
/* Primary colors for active states */
.border-primary-300
.bg-primary-50
.text-primary-700

/* Neutral colors for inactive states */
.border-neutral-200
.bg-neutral-50
.text-neutral-600

/* Interactive states */
.hover:border-neutral-300
.hover:bg-neutral-100
.transition-colors
```

### Custom Slider Styles
Custom slider styling is defined in `globals.css`:

```css
.slider {
    /* Custom slider appearance */
}

.slider::-webkit-slider-thumb {
    /* Custom thumb styling */
}
```

## Performance Considerations

### Debounced Updates
Spacing adjustments are debounced to prevent excessive re-renders:

```typescript
const debouncedUpdate = useMemo(
    () => debounce(onOptionsChange, 150),
    [onOptionsChange]
);
```

### Memoized Calculations
Level calculations are memoized to avoid unnecessary recalculations:

```typescript
const levelControls = useMemo(() => {
    return Array.from({ length: totalLevels }, (_, i) => i);
}, [totalLevels]);
```

## Best Practices

### 1. State Management
Use the `useHierarchicalLayout` hook for consistent state management:

```typescript
const hierarchicalLayout = useHierarchicalLayout({
    initialOptions: { direction: 'TB' },
    graphData
});
```

### 2. Responsive Design
The component adapts to different screen sizes:

```typescript
// Mobile-friendly grid layout
<div className="grid grid-cols-2 gap-2">
    {directionOptions.map(option => (
        // Direction buttons
    ))}
</div>
```

### 3. Error Handling
Always provide fallback values:

```typescript
collapsedLevels = new Set(),
totalLevels = 0,
```

### 4. Performance
Minimize re-renders by using callbacks:

```typescript
const handleDirectionChange = useCallback((direction) => {
    onOptionsChange({ direction });
}, [onOptionsChange]);
```

## Integration Notes

### With React Flow
The component integrates seamlessly with React Flow layouts:

```typescript
// Apply layout options to React Flow
const layoutedElements = applyHierarchicalLayout(graphData, options);
```

### With Other Layouts
The component only appears when hierarchical layout is selected:

```typescript
{currentLayout === 'hierarchical' && (
    <HierarchicalLayoutControls {...props} />
)}
```

## Troubleshooting

### Common Issues

1. **Controls not appearing**: Ensure `currentLayout === 'hierarchical'`
2. **Slider not working**: Check CSS slider styles are loaded
3. **Level controls empty**: Verify `totalLevels > 0`
4. **Options not updating**: Ensure `onOptionsChange` callback is provided

### Debug Tips

```typescript
// Log current state
console.log('Options:', options);
console.log('Collapsed levels:', Array.from(collapsedLevels));
console.log('Total levels:', totalLevels);
```

## Future Enhancements

### Planned Features
- **Preset Configurations**: Quick layout presets
- **Animation Controls**: Transition timing options
- **Export/Import**: Save and load layout configurations
- **Advanced Alignment**: More alignment options

### Extensibility
The component is designed to be extensible:

```typescript
// Add custom controls
interface ExtendedProps extends HierarchicalLayoutControlsProps {
    customControls?: React.ReactNode;
}
```