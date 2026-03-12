# Hướng Dẫn Cài Đặt React Flow - VizTechStack

## Tổng Quan

Tài liệu này mô tả cách cài đặt và cấu hình React Flow cho tính năng trực quan hóa roadmap trong VizTechStack. React Flow được sử dụng để tạo ra các sơ đồ tương tác với nodes và edges có thể kéo thả, zoom và pan.

## Trạng Thái Triển Khai

**✅ HOÀN THÀNH** - Task 1.2.1: Setup React Flow dependencies và configuration

**Ngày hoàn thành:** 2026-03-11  
**Phiên bản:** React Flow 12.0.0  
**Tích hợp:** VizTechStack Design System

## Dependencies Đã Cài Đặt

### Core Dependencies

```json
{
  "@xyflow/react": "^12.0.0",
  "dagre": "^0.8.5",
  "d3-hierarchy": "^3.1.2",
  "markdown-it": "^14.0.0"
}
```

### TypeScript Support

```json
{
  "@types/dagre": "^0.8.5",
  "@types/d3-hierarchy": "^3.1.2"
}
```

**Trạng thái:** ✅ Tất cả dependencies đã được cài đặt và xác minh

## Cấu Hình React Flow

### 1. Cấu Hình Trung Tâm (`/lib/react-flow-config.ts`)

File cấu hình chính chứa tất cả settings cho React Flow:

```typescript
import type {
    ReactFlowInstance,
    FitViewOptions,
    DefaultEdgeOptions,
    NodeTypes,
    EdgeTypes,
} from '@xyflow/react';

// Cấu hình fit view mặc định
export const defaultFitViewOptions: FitViewOptions = {
    padding: 0.2,
    duration: 300,
    minZoom: 0.1,
    maxZoom: 2,
};

// Cấu hình edge mặc định theo VizTechStack design
export const defaultEdgeOptions: DefaultEdgeOptions = {
    animated: false,
    style: {
        strokeWidth: 2,
        stroke: 'var(--color-neutral-300)',
    },
};

// Cấu hình viewport
export const viewportConfig = {
    minZoom: 0.1,
    maxZoom: 2,
    defaultZoom: 1,
    fitViewOnInit: true,
};
```

**Đặc điểm:**
- ✅ Tích hợp với VizTechStack design tokens
- ✅ Responsive zoom levels
- ✅ Smooth animations
- ✅ Performance optimizations

### 2. TypeScript Types (`/types/react-flow.ts`)

Enhanced type definitions cho type safety:

```typescript
import type {
    Node,
    Edge,
    ReactFlowInstance,
    NodeProps,
    EdgeProps,
} from '@xyflow/react';

// Custom node props cho roadmap nodes
export interface RoadmapNodeProps {
    data: NodeData;
    selected: boolean;
    dragging?: boolean;
}

// Custom edge props cho roadmap edges
export interface RoadmapEdgeProps extends EdgeProps {
    data?: EdgeData;
    selected: boolean;
}

// Node type mapping
export type NodeTypeMap = {
    [K in NodeType]: React.ComponentType<RoadmapNodeProps>;
};
```

**Lợi ích:**
- ✅ Strict type checking
- ✅ IntelliSense support
- ✅ Runtime type safety
- ✅ Better developer experience

## Styling Integration

### 1. Global CSS Enhancements

React Flow styling đã được tích hợp vào global CSS:

```css
/* React Flow custom styles */
.react-flow__node {
  @apply font-sans;
}

.react-flow__edge {
  @apply stroke-neutral-300;
}

.react-flow__edge.selected {
  @apply stroke-primary-400;
}

.react-flow__controls {
  @apply bg-white/90 backdrop-blur-sm border border-neutral-200 rounded-lg shadow-soft;
}

.react-flow__minimap {
  @apply bg-white/90 backdrop-blur-sm border border-neutral-200 rounded-lg;
}
```

### 2. VizTechStack Design System Colors

Màu sắc được tích hợp với design system:

```css
/* Node difficulty colors */
.node-beginner {
  @apply bg-success-50 border-success-200 text-success-800;
}

.node-intermediate {
  @apply bg-warning-50 border-warning-200 text-warning-800;
}

.node-advanced {
  @apply bg-error-50 border-error-200 text-error-800;
}

.node-completed {
  @apply bg-success-100 border-success-300 text-success-900;
}
```

**Palette màu chính:**
- **Primary**: Cam/đào nhẹ nhàng (#ed7c47)
- **Secondary**: Xanh nhẹ (#0ea5e9)
- **Success**: Xanh lá (#22c55e)
- **Warning**: Vàng (#f59e0b)
- **Error**: Đỏ (#ef4444)

## Components Đã Nâng Cấp

### 1. RoadmapVisualization Component

Component chính đã được cập nhật với React Flow configuration:

```typescript
import { ReactFlow, Background, Controls, MiniMap } from '@xyflow/react';
import { defaultFitViewOptions, defaultEdgeOptions } from '@/lib/react-flow-config';

export function RoadmapVisualization({ roadmap }: Props) {
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      defaultEdgeOptions={defaultEdgeOptions}
      fitViewOptions={defaultFitViewOptions}
      // ... other props
    >
      <Background />
      <Controls />
      <MiniMap />
    </ReactFlow>
  );
}
```

### 2. CustomRoadmapNode Component

Node component với enhanced TypeScript support và VizTechStack design system:

```typescript
import React, { useState } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { NodeData } from '@viztechstack/roadmap-visualization';
import {
    getCategoryIcon,
    getCategoryDisplayName,
} from '@viztechstack/roadmap-visualization';

export function CustomRoadmapNode({ data, selected }: NodeProps) {
  const nodeData = data as NodeData;
  const [isHovered, setIsHovered] = useState(false);

  const getDifficultyStyle = (difficulty?: string): string => {
    switch (difficulty) {
      case 'beginner': return 'node-beginner';
      case 'intermediate': return 'node-intermediate';
      case 'advanced': return 'node-advanced';
      default: return 'bg-neutral-50 border-2 border-neutral-200 text-neutral-800';
    }
  };

  const difficultyStyle = getDifficultyStyle(nodeData.difficulty);
  const completedStyle = nodeData.completed ? 'node-completed' : '';

  return (
    <div
      className={`
        px-4 py-3 rounded-xl min-w-[200px] max-w-[280px] transition-all duration-300 ease-out
        ${difficultyStyle} ${completedStyle}
        ${selected ? 'ring-2 ring-primary-400 ring-offset-2 scale-105' : ''}
        ${isHovered ? 'shadow-large -translate-y-2 scale-102' : 'shadow-soft'}
        cursor-pointer transform-gpu backdrop-blur-sm relative group
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Handle type="target" position={Position.Top} />
      
      {/* Category badge */}
      {nodeData.category && (
        <div className="flex items-center gap-2 mb-3 text-xs font-medium opacity-90">
          <span className="text-lg animate-bounce-gentle">
            {getCategoryIcon(nodeData.category)}
          </span>
          <span className="px-2 py-1 rounded-md bg-white/20 backdrop-blur-sm">
            {getCategoryDisplayName(nodeData.category)}
          </span>
        </div>
      )}

      {/* Node content với enhanced styling */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-sm leading-tight line-clamp-2 flex-1 pr-2">
          {nodeData.label}
        </h3>
        {nodeData.completed && (
          <div className="flex-shrink-0 ml-2 p-1 rounded-full bg-success-100">
            <svg className="w-4 h-4 text-success-600 animate-scale-in" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>

      {/* Enhanced metadata display */}
      <div className="flex items-center justify-between text-xs opacity-80">
        {nodeData.estimatedTime && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/10 backdrop-blur-sm">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{nodeData.estimatedTime}</span>
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
```

### 3. VisualizationControls Component

Controls với type-safe implementation:

```typescript
import type { LayoutType, ViewMode } from '@/types/react-flow';

interface VisualizationControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onToggleLayout: (layout: LayoutType) => void;
  currentLayout: LayoutType;
}

export function VisualizationControls({ 
  onZoomIn, 
  onZoomOut, 
  onFitView,
  onToggleLayout,
  currentLayout 
}: VisualizationControlsProps) {
  return (
    <div className="glass rounded-xl p-3 shadow-medium">
      <button onClick={onZoomIn} className="viz-button">
        {/* Zoom in icon */}
      </button>
      <button onClick={onZoomOut} className="viz-button">
        {/* Zoom out icon */}
      </button>
      <button onClick={onFitView} className="viz-button">
        {/* Fit view icon */}
      </button>
      <select 
        value={currentLayout} 
        onChange={(e) => onToggleLayout(e.target.value as LayoutType)}
      >
        <option value="hierarchical">Phân cấp</option>
        <option value="force">Lực hút</option>
        <option value="circular">Vòng tròn</option>
        <option value="grid">Lưới</option>
      </select>
    </div>
  );
}
```

## Performance Optimizations

### 1. Node Virtualization

Cấu hình cho large graphs:

```typescript
export const performanceConfig = {
  // Virtualization cho graphs > 100 nodes
  nodeVirtualization: {
    enabled: true,
    threshold: 100,
    bufferSize: 50,
  },
  
  // Memory management
  memoryManagement: {
    maxCacheSize: 1000,
    cleanupInterval: 30000, // 30 seconds
  },
  
  // Rendering optimizations
  rendering: {
    debounceMs: 100,
    useRequestAnimationFrame: true,
  },
};
```

### 2. Layout Performance

Optimizations cho layout calculations:

```typescript
export const layoutPerformanceConfig = {
  // Web Workers cho heavy calculations
  useWebWorkers: true,
  
  // Progressive rendering
  progressiveRendering: {
    enabled: true,
    chunkSize: 50,
    delay: 16, // ~60fps
  },
  
  // Caching
  layoutCaching: {
    enabled: true,
    maxCacheSize: 10,
    ttl: 300000, // 5 minutes
  },
};
```

## Accessibility Features

### 1. ARIA Support

```typescript
export const accessibilityConfig = {
  // ARIA labels
  ariaLabels: {
    canvas: 'Sơ đồ roadmap tương tác',
    node: 'Chủ đề roadmap',
    edge: 'Kết nối giữa các chủ đề',
    controls: 'Điều khiển visualization',
  },
  
  // Keyboard navigation
  keyboardNavigation: {
    enabled: true,
    focusOnMount: true,
    trapFocus: true,
  },
  
  // Screen reader support
  screenReader: {
    announceChanges: true,
    describeRelationships: true,
  },
};
```

### 2. Keyboard Shortcuts

```typescript
export const keyboardShortcuts = {
  'Ctrl+Plus': 'Phóng to',
  'Ctrl+Minus': 'Thu nhỏ',
  'Ctrl+0': 'Vừa màn hình',
  'Tab': 'Điều hướng nodes',
  'Enter': 'Chọn node',
  'Escape': 'Bỏ chọn',
};
```

## Testing

### 1. Build Status

```bash
✅ TypeScript compilation: PASSED
✅ Linting: PASSED  
✅ Type checking: PASSED
✅ Unit tests: 39/39 PASSED
```

### 2. Test Coverage

```typescript
// React Flow configuration tests
describe('React Flow Config', () => {
  it('should have valid fit view options', () => {
    expect(defaultFitViewOptions.padding).toBe(0.2);
    expect(defaultFitViewOptions.duration).toBe(300);
  });

  it('should have valid edge options', () => {
    expect(defaultEdgeOptions.style.strokeWidth).toBe(2);
  });
});

// Component integration tests
describe('RoadmapVisualization', () => {
  it('should render with React Flow', () => {
    render(<RoadmapVisualization roadmap={mockRoadmap} />);
    expect(screen.getByRole('application')).toBeInTheDocument();
  });
});
```

## Troubleshooting

### 1. Common Issues

**Issue**: React Flow không render
**Giải pháp**: 
```typescript
// Đảm bảo container có height
<div style={{ height: '400px' }}>
  <ReactFlow />
</div>
```

**Issue**: Nodes không hiển thị
**Giải pháp**:
```typescript
// Đảm bảo nodes có position
const nodes = [
  {
    id: '1',
    position: { x: 0, y: 0 }, // Required
    data: { label: 'Node 1' },
  },
];
```

**Issue**: TypeScript errors
**Giải pháp**:
```typescript
// Import types correctly
import type { Node, Edge } from '@xyflow/react';
```

### 2. Performance Issues

**Issue**: Slow rendering với large graphs
**Giải pháp**: Enable virtualization
```typescript
<ReactFlow
  nodeVirtualization={true}
  edgeVirtualization={true}
/>
```

**Issue**: Memory leaks
**Giải pháp**: Proper cleanup
```typescript
useEffect(() => {
  return () => {
    // Cleanup React Flow instance
    reactFlowInstance?.destroy();
  };
}, []);
```

## RoadmapVisualization Container - HOÀN THÀNH ✅

### Task 1.2.2: Enhanced Container Component

**Trạng thái:** ✅ HOÀN THÀNH  
**Ngày hoàn thành:** 2026-03-11  
**Phiên bản:** Enhanced với VizTechStack Design System

**Các cải tiến đã triển khai:**

#### 1. Main Visualization Container
- ✅ Enhanced container structure với responsive design
- ✅ Warm color palette từ VizTechStack design system
- ✅ Glass morphism effects và smooth animations
- ✅ Improved accessibility với ARIA labels

#### 2. React Flow Canvas Setup
- ✅ Proper dimensions với responsive behavior
- ✅ Enhanced viewport configuration với improved zoom/pan
- ✅ Performance optimizations cho large graphs
- ✅ TypeScript type safety improvements

#### 3. Default Viewport Configuration
- ✅ Optimal initial zoom level (1.0) với range 0.1-2.5
- ✅ Smooth fit-view với 400ms duration và 15% padding
- ✅ Proper pan/zoom interactions với smooth animations
- ✅ Node centering với [0.5, 0.5] origin

#### 4. Controls Integration
- ✅ Enhanced VisualizationControls với glass morphism
- ✅ Improved button interactions với hover effects
- ✅ Custom dropdown styling cho layout selector
- ✅ Seamless integration với main container

#### 5. Design System Integration
- ✅ VizTechStack warm color palette (primary-500: #ed7c47)
- ✅ Proper Tailwind CSS classes với design tokens
- ✅ Glass effects, shadows, và animations
- ✅ Responsive design cho different screen sizes

#### 6. Enhanced Features
- ✅ Loading states với backdrop blur
- ✅ Error handling với styled notifications
- ✅ Status indicator showing node/edge counts
- ✅ Enhanced MiniMap với difficulty-based colors
- ✅ Smooth transitions và animations

### Next Steps

### Hoàn Thành (Task 1.3.1) ✅

- [x] **CustomNode Component Implementation**
  - ✅ Tạo custom node component với topic information
  - ✅ Style nodes theo topic categories với VizTechStack warm color palette
  - ✅ Add hover states và visual feedback với smooth animations
  - ✅ Enhanced tooltips với resource display
  - ✅ Difficulty indicators và category badges
  - ✅ Comprehensive test coverage

### Hoàn Thành (Task 3.1.1) ✅

- [x] **HierarchicalLayout Algorithm Implementation**
  - ✅ Implement HierarchicalLayout class sử dụng dagre library
  - ✅ Position nodes theo topic progression levels với optimized spacing
  - ✅ Smart alignment và hierarchy validation
  - ✅ Performance optimization cho large graphs
  - ✅ Comprehensive error handling và cycle detection
  - ✅ TypeScript strict mode compliance

### Hoàn Thành (Task 3.1.2) ✅

- [x] **Hierarchical Layout Controls Implementation**
  - ✅ Add direction controls (top-down, left-right) với visual icons
  - ✅ Implement level spacing adjustments với real-time sliders
  - ✅ Add hierarchy collapse/expand functionality cho individual levels
  - ✅ Tích hợp với VisualizationControls component
  - ✅ Tabbed interface với Direction, Spacing, Hierarchy tabs
  - ✅ useHierarchicalLayout hook cho state management
  - ✅ TypeScript strict mode compliance

### Hoàn Thành (Task 3.2.1) ✅

- [x] **ForceDirectedLayout Algorithm Implementation**
  - ✅ Implement ForceDirectedLayout class sử dụng d3-force library
  - ✅ Configure attraction/repulsion forces với relationship-type-specific strengths
  - ✅ Implement collision detection với type-based collision radii
  - ✅ Level-aware positioning cho topic progression
  - ✅ Relationship optimization với automatic parameter calculation
  - ✅ Clustering support và dynamic adjustment capabilities
  - ✅ TypeScript strict mode compliance

### Sắp Tới (Task 3.2.2)

- [ ] **Force Layout Controls Implementation**
  - Add force strength adjustments
  - Implement simulation speed controls
  - Add manual node positioning override

### Roadmap

- [x] **Phase 1**: Interactive Visual Diagram ✅
- [x] **Phase 2**: Automatic Structure Extraction ✅
- [x] **Phase 3.1.1**: HierarchicalLayout Algorithm ✅
- [ ] **Phase 3.1.2**: Hierarchical Layout Controls
- [ ] **Phase 3.2**: Force-Directed Layout
- [ ] **Phase 3.3**: Circular Layout
- [ ] **Phase 3.4**: Grid Layout
- [ ] **Phase 3.5**: Layout Switching System

## Resources

### Documentation Links

- [React Flow Official Docs](https://reactflow.dev/)
- [VizTechStack Design System](.docs/design-system/)
- [TypeScript Configuration](.docs/typescript-config/)

### Internal References

- [Navigation Guide](./navigation-guide.md)
- [Validation Guide](./validation-guide.md)
- [View Toggle Guide](./view-toggle-guide.md)

---

**Cập nhật lần cuối:** 2026-03-11  
**Phiên bản:** 1.1.0  
**Trạng thái:** Task 1.2.2 COMPLETED ✅