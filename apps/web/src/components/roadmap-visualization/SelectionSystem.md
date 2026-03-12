# Hệ Thống Quản Lý Selection - Roadmap Visualization

## Tổng Quan

Hệ thống quản lý selection cho roadmap visualization cung cấp khả năng chọn và tương tác với nodes và edges một cách toàn diện. Hệ thống hỗ trợ single selection, multi-selection, range selection và keyboard navigation với đầy đủ accessibility features.

## Kiến Trúc

### Core Components

```
SelectionManager (useSelectionManager)
├── SelectionState (useSelectionState)
│   ├── Node Selection Management
│   ├── Edge Selection Management
│   ├── Highlighting System
│   └── Connected Elements Tracking
├── EdgeInteraction (useEdgeInteraction)
│   ├── Edge Selection Logic
│   ├── Relationship Details
│   └── Path Highlighting
├── SelectionToolbar (Component)
│   ├── Selection Mode Controls
│   ├── Bulk Actions
│   └── Keyboard Shortcuts Display
└── SelectionIndicator (Component)
    ├── Visual Selection Feedback
    ├── Highlighting Effects
    └── Connection Path Display
```

## Hooks

### useSelectionState

Hook cơ bản quản lý trạng thái selection cho nodes và edges.

**Features:**
- Single/Multi/Range selection modes
- Connected elements tracking
- Selection limits validation
- Keyboard navigation support
- Accessibility announcements

**Usage:**
```typescript
const selectionState = useSelectionState({
    nodes: roadmapNodes,
    edges: roadmapEdges,
    maxSelections: 10,
    enableMultiSelection: true,
    enableRangeSelection: true,
    onSelectionChange: (state) => {
        console.log('Selection changed:', state);
    },
});
```

### useSelectionManager

Hook tổng hợp quản lý toàn bộ selection system với tích hợp edge interaction.

**Features:**
- Unified selection management
- Keyboard shortcuts handling
- Hover interactions
- Double-click behaviors
- Accessibility features

**Usage:**
```typescript
const selectionManager = useSelectionManager({
    nodes: roadmapNodes,
    edges: roadmapEdges,
    config: {
        enableMultiSelection: true,
        enableKeyboardNavigation: true,
        clearOnBackgroundClick: true,
        announceSelections: true,
    },
    onNodeSelect: (nodeId, selected) => {
        console.log('Node selection:', nodeId, selected);
    },
});
```

## Components

### SelectionToolbar

Thanh công cụ cung cấp UI controls cho selection operations.

**Props:**
```typescript
interface SelectionToolbarProps {
    selectedCount: { nodes: number; edges: number; total: number };
    selectionMode: SelectionMode;
    onSelectAll: () => void;
    onClearSelection: () => void;
    onInvertSelection: () => void;
    onSetSelectionMode: (mode: SelectionMode) => void;
    enableMultiSelection?: boolean;
    enableRangeSelection?: boolean;
    maxSelections?: number;
    position?: 'top' | 'bottom' | 'floating';
}
```

**Features:**
- Selection mode switching (Single/Multi/Range)
- Bulk operations (Select All, Clear, Invert)
- Selection count display
- Keyboard shortcuts hints
- Selection limit warnings

### SelectionIndicator

Component hiển thị visual feedback cho selected và highlighted elements.

**Props:**
```typescript
interface SelectionIndicatorProps {
    selectedNodes: Set<string>;
    selectedEdges: Set<string>;
    highlightedNodes: Set<string>;
    highlightedEdges: Set<string>;
    primarySelectedNode: string | null;
    primarySelectedEdge: string | null;
    nodes: RoadmapNode[];
    edges: RoadmapEdge[];
    showConnections?: boolean;
    showLabels?: boolean;
    animateSelection?: boolean;
}
```

**Features:**
- Visual selection indicators
- Highlighting effects
- Connection path display
- Primary selection markers
- Animated feedback
- Selection summary overlay

## Selection Modes

### Single Selection
- Chỉ cho phép chọn một element tại một thời điểm
- Click vào element khác sẽ deselect element hiện tại
- Phù hợp cho basic interactions

### Multi Selection
- Cho phép chọn nhiều elements cùng lúc
- Ctrl+Click để toggle selection
- Shift+Click để range selection
- Phù hợp cho bulk operations

### Range Selection
- Chọn một dải elements liên tiếp
- Shift+Click để chọn từ element đầu đến element cuối
- Hoạt động với cả nodes và edges
- Phù hợp cho selecting connected paths

## Keyboard Shortcuts

### Selection Navigation
- **Arrow Keys**: Navigate giữa các selected nodes
- **Tab/Shift+Tab**: Cycle through selected elements
- **Enter/Space**: Activate selected element (double-click behavior)

### Selection Operations
- **Ctrl+A**: Select all elements
- **Escape**: Clear all selections
- **Ctrl+Click**: Toggle multi-selection
- **Shift+Click**: Range selection

### Zoom & Pan (Integrated)
- **Ctrl + +/-**: Zoom in/out
- **Ctrl + 0**: Fit to view
- **Ctrl + R**: Reset pan position

## Accessibility Features

### Screen Reader Support
- ARIA labels cho tất cả interactive elements
- Live regions cho selection announcements
- Proper focus management
- Semantic markup

### Keyboard Navigation
- Full keyboard accessibility
- Focus indicators
- Logical tab order
- Keyboard shortcuts help

### Visual Accessibility
- High contrast support
- Color-blind friendly indicators
- Clear visual feedback
- Customizable highlighting

## Integration với React Flow

### Node Data Enhancement
```typescript
// Nodes được enhance với selection state
const enhancedNode = {
    ...originalNode,
    data: {
        ...originalNode.data,
        selected: isSelected,
        highlighted: isHighlighted,
        dimmed: isDimmed,
    }
};
```

### Edge Styling
```typescript
// Edges được style dựa trên selection state
const edgeStyle = {
    stroke: isHighlighted ? 'var(--color-primary-500)' : defaultStroke,
    strokeWidth: isHighlighted ? 3 : 2,
    opacity: isDimmed ? 0.3 : 1,
    animated: isHighlighted,
};
```

## Performance Optimizations

### Connected Elements Caching
- Pre-calculate connected elements cho mỗi node/edge
- Cache results để tránh recalculation
- Update cache khi graph structure thay đổi

### Selection State Batching
- Batch multiple selection changes
- Debounce rapid selection updates
- Optimize re-renders với React.memo

### Event Handling
- Use event delegation cho keyboard shortcuts
- Throttle hover events
- Optimize selection validation

## Configuration Options

### SelectionManagerConfig
```typescript
interface SelectionManagerConfig {
    // Selection limits
    maxSelections?: number;
    maxNodeSelections?: number;
    maxEdgeSelections?: number;
    
    // Features
    enableMultiSelection?: boolean;
    enableRangeSelection?: boolean;
    enableKeyboardNavigation?: boolean;
    enableConnectedHighlighting?: boolean;
    
    // Behavior
    clearOnBackgroundClick?: boolean;
    selectConnectedOnDoubleClick?: boolean;
    highlightOnHover?: boolean;
    
    // Accessibility
    announceSelections?: boolean;
    focusSelectedElements?: boolean;
}
```

## Error Handling

### Selection Limits
- Validate selection limits trước khi apply
- Show warning khi đạt giới hạn
- Graceful fallback khi vượt quá limit

### Invalid Selections
- Validate node/edge IDs exist
- Handle missing elements gracefully
- Clear invalid selections automatically

### Keyboard Conflicts
- Prevent conflicts với browser shortcuts
- Handle focus management properly
- Fallback cho unsupported keys

## Testing Strategy

### Unit Tests
- Selection state logic
- Keyboard event handling
- Connected elements calculation
- Validation functions

### Integration Tests
- Component interactions
- React Flow integration
- Accessibility features
- Performance benchmarks

### E2E Tests
- Complete user workflows
- Keyboard navigation flows
- Multi-device testing
- Screen reader compatibility

## Best Practices

### Performance
- Use Set cho selection tracking (O(1) lookups)
- Memoize expensive calculations
- Batch state updates
- Optimize re-renders

### Accessibility
- Always provide keyboard alternatives
- Use semantic HTML elements
- Implement proper ARIA attributes
- Test với screen readers

### User Experience
- Provide clear visual feedback
- Show selection counts
- Display keyboard shortcuts
- Handle edge cases gracefully

### Code Organization
- Separate concerns (state, UI, logic)
- Use TypeScript cho type safety
- Document complex algorithms
- Follow consistent naming conventions

## Future Enhancements

### Advanced Features
- Selection history (undo/redo)
- Selection persistence
- Custom selection filters
- Selection-based operations

### Performance
- Virtual selection cho large graphs
- Web Workers cho heavy calculations
- Selection streaming
- Progressive enhancement

### Accessibility
- Voice control support
- Eye tracking integration
- Custom accessibility modes
- Enhanced screen reader support

---

**Ghi chú**: Hệ thống selection được thiết kế để mở rộng và tích hợp dễ dàng với các tính năng khác của roadmap visualization. Tất cả components và hooks đều tuân theo VizTechStack design patterns và accessibility guidelines.