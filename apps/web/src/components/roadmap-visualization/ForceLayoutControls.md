# ForceLayoutControls Component

## Overview

The `ForceLayoutControls` component provides comprehensive UI controls for managing force-directed layout parameters in the roadmap visualization. It implements task 3.2.2 requirements for force layout controls.

## Features

### Force Strength Adjustments
- **Charge Force (Repulsion)**: Controls how strongly nodes repel each other
- **Link Force (Attraction)**: Controls the strength of connections between nodes
- **Link Distance**: Sets the ideal distance between connected nodes
- **Collision Radius**: Defines the collision detection radius for nodes
- **Center Force**: Controls how strongly nodes are pulled toward the center

### Simulation Speed Controls
- **Simulation Speed**: Multiplier for simulation iterations and convergence
- **Iterations**: Number of simulation steps to run
- **Alpha Decay**: Rate at which the simulation energy decreases
- **Velocity Decay**: Friction applied to node movement
- **Relationship Strength**: Individual strength settings for different edge types

### Manual Node Positioning
- **Manual Positioning Toggle**: Enables/disables drag-to-position mode
- **Position Override**: Allows manual positioning to override physics simulation
- **Fixed Node Support**: Nodes can be pinned in place
- **Layout Presets**: Quick settings for common layout configurations

## Usage

```tsx
import { ForceLayoutControls } from './ForceLayoutControls';
import { useForceLayout } from '../../hooks/useForceLayout';

function MyComponent() {
  const {
    options,
    updateOptions,
    manualPositioning,
    setManualPositioning,
    simulationSpeed,
    setSimulationSpeed,
  } = useForceLayout();

  return (
    <ForceLayoutControls
      options={options}
      onOptionsChange={updateOptions}
      manualPositioning={manualPositioning}
      onManualPositioningChange={setManualPositioning}
      simulationSpeed={simulationSpeed}
      onSimulationSpeedChange={setSimulationSpeed}
    />
  );
}
```

## Integration

The component integrates with the main `VisualizationControls` component and is automatically shown when the force layout is selected. It follows the same design patterns as `HierarchicalLayoutControls` for consistency.

## Validation

**Validates: Requirement 3.2** - Nhiều Tùy Chọn Bố Cục (Force-directed layout controls)

## Technical Details

- Uses controlled components pattern for all inputs
- Implements proper TypeScript typing with strict mode compliance
- Follows VizTechStack design system patterns
- Provides Vietnamese language labels for user interface
- Includes accessibility features (ARIA labels, keyboard navigation)
- Responsive design with proper spacing and visual hierarchy