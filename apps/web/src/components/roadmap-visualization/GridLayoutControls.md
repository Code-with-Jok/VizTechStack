# GridLayoutControls Component

## Overview

The `GridLayoutControls` component provides comprehensive controls for managing grid layout parameters in roadmap visualizations. It offers intuitive interfaces for adjusting grid size, cell dimensions, spacing, alignment, and snap functionality.

**Validates: Requirement 3.4**

## Features

### Grid Size Controls
- **Auto-size Toggle**: Automatically calculate optimal grid dimensions
- **Manual Dimensions**: Set specific number of columns and rows
- **Cell Size Adjustment**: Control individual cell width and height
- **Aspect Ratio**: Adjust the preferred width-to-height ratio

### Spacing Controls
- **Padding**: Control spacing between grid cells
- **Margins**: Adjust outer margins around the entire grid
- **Fine-tuned Control**: Separate horizontal and vertical spacing

### Alignment & Snap Features
- **Grid Snap**: Automatically align nodes to grid positions
- **Grid Lines**: Show/hide visual grid guidelines
- **Horizontal Alignment**: Left, center, or right alignment
- **Vertical Alignment**: Top, center, or bottom alignment

### Organization Options
- **Sorting**: Sort nodes by level, section, label, or difficulty
- **Grouping**: Group related nodes together
- **Sort Direction**: Ascending or descending order
- **Content Optimization**: One-click optimization for content layout

## Props Interface

```typescript
interface GridLayoutControlsProps {
    options: GridLayoutOptions;
    onOptionsChange: (options: Partial<GridLayoutOptions>) => void;
    snapToGrid: boolean;
    onSnapToGridChange: (snap: boolean) => void;
    showGridLines: boolean;
    onShowGridLinesChange: (show: boolean) => void;
    alignment: {
        horizontal: 'left' | 'center' | 'right';
        vertical: 'top' | 'center' | 'bottom';
    };
    onAlignmentChange: (alignment: Partial<{
        horizontal: 'left' | 'center' | 'right';
        vertical: 'top' | 'center' | 'bottom';
    }>) => void;
    onOptimizeForContent: () => void;
    className?: string;
}
```

## Usage Example

```tsx
import { GridLayoutControls } from './GridLayoutControls';
import { useGridLayout } from '../../hooks/useGridLayout';

function MyVisualization() {
    const {
        options,
        updateOptions,
        snapToGrid,
        setSnapToGrid,
        showGridLines,
        setShowGridLines,
        alignment,
        updateAlignment,
        optimizeForContent
    } = useGridLayout();

    return (
        <GridLayoutControls
            options={options}
            onOptionsChange={updateOptions}
            snapToGrid={snapToGrid}
            onSnapToGridChange={setSnapToGrid}
            showGridLines={showGridLines}
            onShowGridLinesChange={setShowGridLines}
            alignment={alignment}
            onAlignmentChange={updateAlignment}
            onOptimizeForContent={optimizeForContent}
        />
    );
}
```

## UI Structure

The component uses a tabbed interface with three main sections:

### 1. Size Tab (📐)
- Auto-size toggle with description
- Manual grid dimensions (columns/rows) when auto-size is disabled
- Cell width and height sliders
- Aspect ratio control

### 2. Spacing Tab (📏)
- Horizontal and vertical padding controls
- Horizontal and vertical margin controls
- Visual feedback with "Gần/Xa" and "Nhỏ/Lớn" labels

### 3. Alignment Tab (🎯)
- Grid snap functionality toggle
- Grid lines visibility toggle
- Horizontal alignment buttons (Left/Center/Right)
- Vertical alignment buttons (Top/Center/Bottom)
- Sorting and grouping options
- Sort direction controls

## Key Features

### Validation & Constraints
- Enforces minimum cell dimensions (80px width, 60px height)
- Validates non-negative spacing and margins
- Prevents invalid grid dimensions
- Provides user feedback for invalid inputs

### Smart Defaults
- Sensible default values for all parameters
- Content-aware optimization suggestions
- Automatic constraint handling

### Accessibility
- Proper ARIA labels for all controls
- Keyboard navigation support
- Screen reader friendly descriptions
- Clear visual feedback for active states

### Responsive Design
- Collapsible interface to save space
- Mobile-friendly touch targets
- Consistent with design system styling

## Integration with VisualizationControls

The component integrates seamlessly with the main `VisualizationControls` component:

```tsx
{currentLayout === 'grid' &&
    gridOptions &&
    onGridOptionsChange &&
    // ... other required props
    (
        <GridLayoutControls
            options={gridOptions}
            onOptionsChange={onGridOptionsChange}
            // ... other props
        />
    )}
```

## Styling

Uses the established design system with:
- Consistent color scheme (primary, neutral colors)
- Smooth transitions and hover effects
- Card-based layout with shadows
- Tabbed navigation with visual indicators
- Slider controls with custom styling

## Performance Considerations

- Debounced updates for smooth slider interactions
- Memoized callbacks to prevent unnecessary re-renders
- Efficient state management through the useGridLayout hook
- Minimal DOM updates through React's reconciliation

## Testing

The component is designed to work with the comprehensive test suite in `useGridLayout.spec.ts`, covering:
- Option validation and constraints
- State management
- User interactions
- Edge cases and error handling