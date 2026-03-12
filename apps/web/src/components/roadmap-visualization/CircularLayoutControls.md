# CircularLayoutControls Component

## Overview

The `CircularLayoutControls` component provides comprehensive UI controls for managing circular layout parameters in the roadmap visualization. It implements task 3.3.2 requirements for circular layout controls including radius adjustment, rotation controls, and sector highlighting functionality.

**Validates: Requirement 3.3**

## Features

### Radius Controls
- **Inner Radius**: Adjustable inner radius for concentric circles (0-200px)
- **Outer Radius**: Adjustable outer radius with automatic constraint validation (100-500px)
- **Level Spacing**: Distance between concentric levels (40-120px)
- **Angular Spacing**: Angular spacing between nodes (0.05-0.5 radians)
- **Node Spacing**: Minimum spacing between nodes to prevent overlaps (20-80px)

### Rotation Controls
- **Start Angle**: Adjustable starting angle for the circular layout (0-360°)
- **Rotation Speed**: Animation speed for rotations (0.1x-3.0x)
- **Quick Rotation**: Preset buttons for 0°, 90°, 180°, 270° rotations
- **Arc Range**: Adjustable arc range from partial circles to full 360° layouts

### Sector Highlighting
- **Toggle Highlighting**: Enable/disable sector highlighting
- **Sector Angles**: Adjustable start and end angles for highlighted sectors
- **Color Selection**: Color picker for sector highlight color
- **Preset Sectors**: Quick selection for quarters and halves

### Layout Options
- **Sort by Level**: Organize nodes by hierarchical levels
- **Prevent Overlaps**: Automatic overlap prevention
- **Enable Optimization**: Performance optimization for large graphs

## Usage

```tsx
import { CircularLayoutControls } from '@/components/roadmap-visualization';
import { useCircularLayout } from '@/hooks/useCircularLayout';

function MyVisualization() {
  const {
    options,
    updateOptions,
    rotationSpeed,
    setRotationSpeed,
    sectorHighlight,
    updateSectorHighlight,
    rotateTo
  } = useCircularLayout();

  return (
    <CircularLayoutControls
      options={options}
      onOptionsChange={updateOptions}
      rotationSpeed={rotationSpeed}
      onRotationSpeedChange={setRotationSpeed}
      sectorHighlight={sectorHighlight}
      onSectorHighlightChange={updateSectorHighlight}
      onRotateTo={rotateTo}
    />
  );
}
```

## Props Interface

```typescript
interface CircularLayoutControlsProps {
  options: CircularLayoutOptions;
  onOptionsChange: (options: Partial<CircularLayoutOptions>) => void;
  rotationSpeed: number;
  onRotationSpeedChange: (speed: number) => void;
  sectorHighlight: {
    enabled: boolean;
    startAngle: number;
    endAngle: number;
    color: string;
  };
  onSectorHighlightChange: (highlight: Partial<{
    enabled: boolean;
    startAngle: number;
    endAngle: number;
    color: string;
  }>) => void;
  onRotateTo: (angle: number) => void;
  className?: string;
}
```

## Integration

The component integrates with the main `VisualizationControls` component and is automatically shown when the circular layout is selected. It follows the same design patterns as `HierarchicalLayoutControls` and `ForceLayoutControls` for consistency.

```typescript
{currentLayout === 'circular' && (
    <CircularLayoutControls {...props} />
)}
```

## Validation

The component includes built-in validation for:
- **Radius Constraints**: Inner radius must be less than outer radius
- **Angle Constraints**: Start angle must be less than end angle
- **Dimension Validation**: Width and height must be positive values
- **Automatic Adjustments**: Auto-adjusts conflicting values to maintain validity

## Accessibility

- **ARIA Labels**: All controls have proper ARIA labels
- **Keyboard Navigation**: Full keyboard support for all controls
- **Screen Reader Support**: Descriptive labels and help text
- **Color Contrast**: High contrast colors for visibility
- **Focus Management**: Proper focus indicators and tab order

## Styling

The component uses the established design system:
- **Consistent Colors**: Primary, neutral, and semantic color palette
- **Smooth Animations**: Transition effects for state changes
- **Responsive Design**: Adapts to different screen sizes
- **Visual Hierarchy**: Clear information hierarchy with proper spacing

## Error Handling

- **Graceful Validation**: Invalid inputs are corrected automatically
- **User Feedback**: Clear visual feedback for invalid states
- **Fallback Values**: Safe defaults when validation fails
- **Console Warnings**: Development warnings for constraint violations

## Performance

- **Optimized Rendering**: Memoized callbacks to prevent unnecessary re-renders
- **Efficient Updates**: Batched option updates for better performance
- **Lazy Evaluation**: Complex calculations only when needed
- **Memory Management**: Proper cleanup of event listeners and timers

## Testing

The component can be tested with:

```typescript
import { render, fireEvent, screen } from '@testing-library/react';
import { CircularLayoutControls } from './CircularLayoutControls';

test('adjusts radius controls', () => {
  const mockOnOptionsChange = jest.fn();
  render(
    <CircularLayoutControls
      options={defaultOptions}
      onOptionsChange={mockOnOptionsChange}
      // ... other props
    />
  );
  
  const innerRadiusSlider = screen.getByLabelText(/bán kính trong/i);
  fireEvent.change(innerRadiusSlider, { target: { value: '150' } });
  
  expect(mockOnOptionsChange).toHaveBeenCalledWith({ innerRadius: 150 });
});
```

## Related Components

- **useCircularLayout**: Hook for managing circular layout state
- **CircularLayout**: Core layout algorithm implementation
- **VisualizationControls**: Parent container component
- **HierarchicalLayoutControls**: Similar pattern for hierarchical layouts
- **ForceLayoutControls**: Similar pattern for force-directed layouts