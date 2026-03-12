# React Flow Setup Guide for VizTechStack

## Overview

This document outlines the React Flow configuration and setup for the VizTechStack roadmap visualization feature. The setup follows the VizTechStack design system and provides enhanced TypeScript support.

## Dependencies

### Core Dependencies
- `@xyflow/react` (^12.0.0) - Main React Flow library
- `react` (19.2.3) - React framework
- `typescript` (^5.7) - TypeScript support

### Supporting Dependencies
- `@viztechstack/roadmap-visualization` - Core visualization logic
- Custom styling via Tailwind CSS 4

## Configuration Files

### 1. React Flow Configuration (`/lib/react-flow-config.ts`)

Central configuration file containing:
- Default viewport settings
- Edge styling based on VizTechStack design system
- Background and control configurations
- Performance optimizations
- Accessibility settings

### 2. TypeScript Types (`/types/react-flow.ts`)

Enhanced type definitions providing:
- Type-safe React Flow components
- Custom node and edge interfaces
- Event handler types
- State management interfaces

## Key Features

### 1. Enhanced Type Safety
```typescript
// Before (using any)
const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

// After (type-safe)
const [reactFlowInstance, setReactFlowInstance] = useState<RoadmapFlowInstance | null>(null);
```

### 2. Design System Integration
```typescript
// Automatic styling based on node difficulty
const getEdgeStyle = (edgeType: string) => {
  switch (edgeType) {
    case 'dependency':
      return { stroke: 'var(--color-error-500)' };
    case 'progression':
      return { stroke: 'var(--color-primary-500)' };
    // ... more cases
  }
};
```

### 3. Performance Optimizations
- Node virtualization for large graphs
- Optimized rendering settings
- Memory management configurations

### 4. Accessibility Support
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility

## Usage Examples

### Basic Setup
```typescript
import { RoadmapVisualization } from '@/components/roadmap-visualization';
import type { GraphData } from '@viztechstack/roadmap-visualization';

function MyComponent({ graphData }: { graphData: GraphData }) {
  return (
    <RoadmapVisualization
      graphData={graphData}
      onNodeClick={(nodeId) => console.log('Node clicked:', nodeId)}
      className="h-96"
    />
  );
}
```

### Advanced Configuration
```typescript
import { reactFlowConfig, defaultFitViewOptions } from '@/lib/react-flow-config';
import type { RoadmapFlowInstance } from '@/types/react-flow';

function AdvancedVisualization() {
  const [instance, setInstance] = useState<RoadmapFlowInstance | null>(null);
  
  const handleInit = useCallback((flowInstance: RoadmapFlowInstance) => {
    setInstance(flowInstance);
    flowInstance.fitView(defaultFitViewOptions);
  }, []);
  
  return (
    <ReactFlow
      {...reactFlowConfig}
      onInit={handleInit}
      // ... other props
    />
  );
}
```

## Styling Integration

### CSS Variables
The configuration uses CSS variables from the VizTechStack design system:
```css
--color-primary-500: #ed7c47;
--color-success-500: #22c55e;
--color-warning-500: #f59e0b;
--color-error-500: #ef4444;
```

### Node Styling Classes
```css
.node-beginner { /* Green styling for beginner nodes */ }
.node-intermediate { /* Yellow styling for intermediate nodes */ }
.node-advanced { /* Red styling for advanced nodes */ }
.node-completed { /* Success styling for completed nodes */ }
```

### Dark Mode Support
All styling includes dark mode variants:
```css
.dark .node-beginner {
  background-color: rgba(20, 83, 45, 0.3);
  border-color: var(--color-success-700);
  color: var(--color-success-300);
}
```

## Performance Considerations

### Large Graph Optimization
- Virtualization enabled for 100+ nodes
- Progressive loading for 500+ nodes
- Memory usage monitoring
- Optimized rendering pipeline

### Interaction Performance
- Debounced layout calculations
- Throttled zoom/pan operations
- Efficient event handling
- Minimal re-renders

## Error Handling

### Type Safety
- Comprehensive TypeScript interfaces
- Runtime type validation
- Error boundaries for React Flow components

### Graceful Degradation
- Fallback layouts for calculation failures
- Error recovery mechanisms
- User-friendly error messages

## Testing Strategy

### Unit Tests
- Component rendering tests
- Type safety validation
- Configuration correctness

### Integration Tests
- React Flow interaction tests
- Layout algorithm tests
- Performance benchmarks

### Property-Based Tests
- Graph structure validation
- Layout consistency tests
- Performance property verification

## Migration Guide

### From Previous Setup
1. Update imports to use new type definitions
2. Replace `any` types with specific interfaces
3. Use centralized configuration instead of inline props
4. Update styling to use CSS variables

### Breaking Changes
- `NodeProps<any>` → `RoadmapNodeProps`
- Inline styling → Configuration-based styling
- Manual type assertions → Automatic type inference

## Best Practices

### 1. Type Safety
- Always use provided TypeScript interfaces
- Avoid `any` types
- Leverage type inference where possible

### 2. Performance
- Use configuration objects instead of inline props
- Implement proper memoization for expensive operations
- Monitor performance metrics in development

### 3. Accessibility
- Include ARIA labels for all interactive elements
- Support keyboard navigation
- Test with screen readers

### 4. Styling
- Use CSS variables for consistent theming
- Follow VizTechStack design system guidelines
- Support both light and dark modes

## Troubleshooting

### Common Issues

1. **Type Errors**
   - Ensure all imports use correct type definitions
   - Check for version compatibility between packages

2. **Styling Issues**
   - Verify CSS variables are properly defined
   - Check for conflicting Tailwind classes

3. **Performance Problems**
   - Enable virtualization for large graphs
   - Check for memory leaks in event handlers

4. **Layout Problems**
   - Verify graph data structure
   - Check layout algorithm configuration

### Debug Tools
- React Flow DevTools
- Performance profiler
- Type checking in IDE
- Browser developer tools

## Future Enhancements

### Planned Features
- Advanced layout algorithms
- Real-time collaboration
- Enhanced accessibility features
- Performance monitoring dashboard

### Extension Points
- Custom node types
- Plugin system
- Theme customization
- Analytics integration

## Resources

- [React Flow Documentation](https://reactflow.dev/)
- [VizTechStack Design System](../design-system.md)
- [TypeScript Best Practices](../typescript-guide.md)
- [Performance Optimization Guide](../performance.md)