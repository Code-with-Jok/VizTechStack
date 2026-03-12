# NodeTooltip Component

## Overview

The `NodeTooltip` component provides rich hover tooltips for roadmap visualization nodes. It displays topic previews, metadata, and navigation hints with smooth animations and smart positioning to avoid viewport edges.

**Task 4.1.1**: Implement NodeTooltip component
- ✅ Show topic preview on hover
- ✅ Display metadata (difficulty, time estimate)
- ✅ Add smooth show/hide animations
- ✅ Smart positioning to avoid viewport edges
- ✅ Performance optimized for frequent hover events

## Features

### Core Functionality
- **Topic Preview**: Shows node title, description, and key metadata
- **Smart Positioning**: Automatically adjusts position to stay within viewport
- **Smooth Animations**: Fade-in/out with scale transitions
- **Performance Optimized**: Debounced hover events and minimal re-renders

### Metadata Display
- **Difficulty Level**: Visual indicators with color-coded badges
- **Estimated Time**: Learning time estimates with clock icon
- **Completion Status**: Visual completion indicators
- **Category Badges**: Role/Skill category identification
- **Resources Preview**: Shows first 2 resources with type icons
- **Learning Level**: Progress bar for skill level

### Navigation Hints
- **Skill Nodes**: Shows "Bài viết" hint for article navigation
- **Role Nodes**: Shows "Roadmap" hint for sub-roadmap navigation
- **Click Instructions**: Clear call-to-action for user interaction

## Usage

### Basic Usage

```tsx
import { NodeTooltip } from '@/components/roadmap-visualization/NodeTooltip';
import { useNodeTooltip } from '@/hooks/useNodeTooltip';

function MyComponent() {
  const [showTooltip, setShowTooltip] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  return (
    <div
      onMouseEnter={(e) => {
        setMousePos({ x: e.clientX, y: e.clientY });
        setShowTooltip(true);
      }}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <NodeTooltip
        nodeData={nodeData}
        isVisible={showTooltip}
        mousePosition={mousePos}
      />
    </div>
  );
}
```

### With Hook (Recommended)

```tsx
import { useNodeTooltip } from '@/hooks/useNodeTooltip';

function MyComponent() {
  const tooltip = useNodeTooltip({
    showDelay: 300,
    hideDelay: 100,
    enabled: true
  });

  const handleMouseEnter = (e: React.MouseEvent, nodeData: NodeData) => {
    tooltip.showTooltip(nodeData, e.clientX, e.clientY, nodeId);
  };

  const handleMouseLeave = () => {
    tooltip.hideTooltip(nodeId);
  };

  return (
    <div>
      {/* Your hoverable element */}
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        Node Content
      </div>

      {/* Tooltip */}
      {tooltip.tooltipState.isVisible && (
        <NodeTooltip
          nodeData={tooltip.tooltipState.nodeData!}
          isVisible={tooltip.tooltipState.isVisible}
          mousePosition={tooltip.tooltipState.mousePosition}
          onClose={tooltip.forceHide}
        />
      )}
    </div>
  );
}
```

## Props

### NodeTooltip Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `nodeData` | `NodeData` | ✅ | Node data containing all tooltip information |
| `isVisible` | `boolean` | ✅ | Controls tooltip visibility |
| `mousePosition` | `{ x: number; y: number }` | ✅ | Mouse position for tooltip placement |
| `className` | `string` | ❌ | Additional CSS classes |
| `onClose` | `() => void` | ❌ | Callback when tooltip should close (ESC key) |

### useNodeTooltip Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `showDelay` | `number` | `300` | Delay before showing tooltip (ms) |
| `hideDelay` | `number` | `100` | Delay before hiding tooltip (ms) |
| `enabled` | `boolean` | `true` | Whether tooltip functionality is enabled |

## NodeData Interface

The tooltip displays information based on the `NodeData` interface:

```typescript
interface NodeData {
  // Core information
  label: string;                    // Node title
  description?: string;             // Detailed description
  level: number;                    // Learning level (0-10)
  section: string;                  // Section/category name
  
  // Metadata
  estimatedTime?: string;           // Time estimate (e.g., "2 hours")
  difficulty?: DifficultyLevel;     // beginner | intermediate | advanced
  completed?: boolean;              // Completion status
  
  // Navigation (for categorized nodes)
  category?: NodeCategory;          // role | skill
  targetRoadmapId?: string;         // For role nodes
  targetArticleId?: string;         // For skill nodes
  
  // Resources
  resources?: Resource[];           // Learning resources
  prerequisites?: string[];        // Prerequisite node IDs
}
```

## Styling

### CSS Classes

The component uses Tailwind CSS with the VizTechStack design system:

```css
/* Main tooltip container */
.tooltip-container {
  @apply fixed z-50 max-w-sm w-80 pointer-events-none;
  @apply transition-all duration-200 ease-out;
  @apply animate-fade-in;
}

/* Difficulty badges */
.difficulty-beginner {
  @apply bg-success-100 text-success-800 border-success-200;
  @apply dark:bg-success-900/30 dark:text-success-300 dark:border-success-700;
}

.difficulty-intermediate {
  @apply bg-warning-100 text-warning-800 border-warning-200;
  @apply dark:bg-warning-900/30 dark:text-warning-300 dark:border-warning-700;
}

.difficulty-advanced {
  @apply bg-error-100 text-error-800 border-error-200;
  @apply dark:bg-error-900/30 dark:text-error-300 dark:border-error-700;
}
```

### Custom Animations

```css
@keyframes fade-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes bounce-gentle {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-2px);
  }
}
```

## Smart Positioning

The tooltip automatically calculates optimal positioning to avoid viewport edges:

### Positioning Logic

1. **Default**: Bottom-right of cursor with 12px offset
2. **Right Edge**: Switches to left side of cursor
3. **Bottom Edge**: Switches to top of cursor
4. **Left Edge**: Ensures minimum 20px margin
5. **Top Edge**: Ensures minimum 20px margin

### Arrow Placement

The tooltip arrow adjusts based on final position:
- **Bottom placement**: Arrow at top-left
- **Top placement**: Arrow at bottom-left
- **Left placement**: Arrow at right-top
- **Right placement**: Arrow at left-top

## Performance Optimizations

### Debounced Interactions
- **Show Delay**: 300ms default to prevent flickering on quick hovers
- **Hide Delay**: 100ms default for smooth transitions
- **Timeout Management**: Automatic cleanup of pending timeouts

### Render Optimizations
- **Conditional Rendering**: Only renders when visible
- **Position Caching**: Avoids unnecessary position calculations
- **Event Cleanup**: Proper cleanup of event listeners and timeouts

### Memory Management
- **Ref Usage**: Uses refs for DOM measurements to avoid re-renders
- **Callback Optimization**: Memoized callbacks to prevent unnecessary updates
- **State Minimization**: Minimal state updates for position changes

## Accessibility

### ARIA Support
- `role="tooltip"` for screen reader identification
- `aria-live="polite"` for dynamic content announcements
- `aria-labelledby` and `aria-describedby` for proper labeling

### Keyboard Support
- **Escape Key**: Closes tooltip when focused
- **Focus Management**: Proper focus handling for keyboard navigation
- **Screen Reader**: Descriptive content for non-visual users

### Visual Accessibility
- **High Contrast**: Supports dark mode and high contrast themes
- **Color Independence**: Information not conveyed by color alone
- **Text Scaling**: Responsive to user font size preferences

## Examples

### Basic Topic Node
```tsx
const basicNode: NodeData = {
  label: 'JavaScript Fundamentals',
  description: 'Learn core JavaScript concepts',
  level: 1,
  section: 'Programming Basics',
  estimatedTime: '4 hours',
  difficulty: 'beginner',
  completed: false
};
```

### Skill Node with Resources
```tsx
const skillNode: NodeData = {
  label: 'React Hooks',
  description: 'Master React Hooks for modern development',
  level: 3,
  section: 'Frontend Development',
  estimatedTime: '6 hours',
  difficulty: 'intermediate',
  completed: true,
  category: 'skill',
  targetArticleId: 'react-hooks-guide',
  resources: [
    {
      title: 'React Hooks Documentation',
      url: 'https://reactjs.org/docs/hooks-intro.html',
      type: 'documentation'
    }
  ]
};
```

### Role Node
```tsx
const roleNode: NodeData = {
  label: 'Frontend Developer',
  description: 'Complete frontend development roadmap',
  level: 5,
  section: 'Career Paths',
  estimatedTime: '6 months',
  difficulty: 'advanced',
  category: 'role',
  targetRoadmapId: 'frontend-developer-roadmap'
};
```

## Testing

### Unit Tests
- Component rendering with different node types
- Positioning calculations and edge cases
- Animation states and transitions
- Accessibility features and keyboard navigation

### Hook Tests
- State management and debounced behavior
- Timeout handling and cleanup
- Performance optimizations
- Error handling and edge cases

### Integration Tests
- Mouse interaction flows
- Tooltip positioning in different viewport sizes
- Performance under frequent hover events
- Cross-browser compatibility

## Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+
- **Features Used**: CSS Grid, Flexbox, CSS Custom Properties, Intersection Observer

## Migration Guide

### From ArticlePreviewTooltip

If migrating from the existing `ArticlePreviewTooltip`:

```tsx
// Before
<ArticlePreviewTooltip metadata={articleMetadata} />

// After
<NodeTooltip 
  nodeData={nodeData} 
  isVisible={isVisible}
  mousePosition={mousePosition}
/>
```

### Key Differences
- More comprehensive metadata display
- Smart positioning system
- Performance optimizations
- Better accessibility support
- Unified interface for all node types

## Related Components

- **CustomRoadmapNode**: Uses NodeTooltip for hover interactions
- **NodeDetailsPanel**: Detailed view when tooltip is clicked
- **ArticlePreviewTooltip**: Legacy tooltip for article-specific content
- **RoadmapVisualization**: Main container that manages tooltip state

## Future Enhancements

### Planned Features
- **Rich Content**: Support for markdown in descriptions
- **Interactive Elements**: Clickable links within tooltips
- **Customizable Themes**: User-selectable tooltip themes
- **Animation Presets**: Different animation styles

### Performance Improvements
- **Virtual Scrolling**: For tooltips with many resources
- **Lazy Loading**: Defer resource metadata loading
- **Caching**: Cache tooltip content for repeated hovers
- **Web Workers**: Offload positioning calculations

---

**Implementation Status**: ✅ Complete  
**Task**: 4.1.1 - Implement NodeTooltip component  
**Validates**: Requirement 4.1 - Hover Tooltips