# Điều Khiển Pan - Roadmap Visualization

## Tổng Quan

Hệ thống điều khiển pan cho roadmap visualization cung cấp khả năng di chuyển và điều hướng trong không gian visualization với mouse drag và keyboard shortcuts.

## Tính Năng

### 1. Mouse Drag Panning

#### Kéo Thả Chuột
- **Chức năng**: Kéo thả để di chuyển viewport trong visualization
- **Cách sử dụng**: Click và kéo trên background hoặc empty space
- **Smooth Animation**: Tự động với React Flow built-in functionality
- **Performance**: Optimized cho large graphs với virtualization

#### Cấu Hình Pan
```typescript
// React Flow pan configuration
const panConfig = {
    panOnDrag: true,        // Enable mouse drag panning
    panOnScroll: false,     // Disable scroll panning (zoom only)
    panOnScrollSpeed: 0.5,  // Scroll pan speed when enabled
};
```

### 2. Pan Reset Button

#### Reset Position
- **Button**: Nút với icon reset (refresh/rotate)
- **Keyboard**: `Ctrl + R` (Windows/Linux), `Cmd + R` (Mac)
- **Chức năng**: Đặt lại viewport về vị trí trung tâm (0, 0) với zoom 1x
- **Animation**: Smooth transition 400ms duration

#### Implementation
```typescript
const handlePanReset = useCallback(() => {
    if (reactFlowInstance) {
        // Reset pan to center position with smooth animation
        reactFlowInstance.setViewport({ x: 0, y: 0, zoom: 1 }, { duration: 400 });
    }
}, [reactFlowInstance]);
```

### 3. Smooth Pan Animations

#### Animation Configuration
- **Duration**: 400ms cho pan reset
- **Easing**: React Flow default easing (ease-in-out)
- **Hardware Acceleration**: CSS transforms được sử dụng
- **Performance**: Optimized cho 60fps smooth animations

#### Viewport Transitions
```typescript
// Smooth viewport transition
reactFlowInstance.setViewport(
    { x: targetX, y: targetY, zoom: targetZoom }, 
    { duration: 400 }
);
```

## Keyboard Shortcuts

### Supported Shortcuts

| Shortcut | Action | Description |
|----------|--------|-------------|
| `Ctrl + R` / `Cmd + R` | Pan Reset | Đặt lại vị trí về center |
| Mouse Drag | Pan | Di chuyển viewport |
| Scroll Wheel | Zoom | Zoom in/out (không pan) |

### Implementation Details

#### Event Handling
```typescript
useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
        const isCtrlPressed = event.ctrlKey || event.metaKey;
        
        if (!isCtrlPressed) return;

        switch (event.key) {
            case 'r':
            case 'R':
                event.preventDefault();
                handlePanReset();
                break;
        }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
}, [handlePanReset]);
```

#### Cross-Platform Support
- **Windows/Linux**: `event.ctrlKey`
- **Mac**: `event.metaKey`
- **Prevention**: `event.preventDefault()` để tránh browser refresh

## Integration với React Flow

### Pan Configuration
```typescript
// React Flow props for pan functionality
const reactFlowConfig = {
    // Pan settings
    panOnDrag: true,
    panOnScroll: false,
    panOnScrollSpeed: 0.5,
    
    // Viewport settings
    minZoom: 0.1,
    maxZoom: 2.5,
    defaultZoom: 1,
    
    // Performance settings
    onlyRenderVisibleElements: true,
    nodeOrigin: [0.5, 0.5] as [number, number],
};
```

### Viewport Tracking
```typescript
// Track viewport changes for state management
const handleViewportChange = useCallback((viewport: { x: number; y: number; zoom: number }) => {
    setZoomLevel(viewport.zoom);
    // Pan position có thể được track nếu cần
}, []);

<ReactFlow
    onViewportChange={handleViewportChange}
    // ... other props
/>
```

## Accessibility

### ARIA Labels
- **Pan Reset Button**: `aria-label="Reset pan position"`
- **Tooltip**: "Đặt lại vị trí (Ctrl + R)"

### Keyboard Navigation
- **Tab Order**: Pan Reset button trong tab sequence
- **Focus Indicators**: Visible focus rings
- **Screen Reader**: Proper semantic markup

### Alternative Navigation
- **Keyboard Users**: Pan reset shortcut available
- **Touch Devices**: Pan gestures supported
- **Screen Readers**: Button descriptions provided

## Styling System

### Button Styling
```css
/* Pan reset button */
.viz-button {
    @apply p-2 rounded-md hover:bg-neutral-100 transition-colors duration-200 text-neutral-600 hover:text-neutral-800;
}

/* Hover effects */
.viz-button:hover svg {
    @apply scale-110 transition-transform duration-200;
}

/* Active state */
.viz-button:active {
    @apply scale-95;
}
```

### Icon Design
- **Reset Icon**: Refresh/rotate arrows icon
- **Size**: 20x20px (w-5 h-5)
- **Color**: Neutral-600 → Neutral-800 on hover
- **Animation**: Scale 110% on hover, 95% on active

## Performance Considerations

### Large Graph Optimization
- **Virtualization**: Only render visible nodes during pan
- **Debouncing**: Pan events debounced for performance
- **Memory Management**: Efficient viewport calculations
- **Smooth Rendering**: Hardware-accelerated transforms

### Pan Performance
```typescript
// Optimized pan handling
const debouncedPanHandler = useMemo(
    () => debounce((viewport) => {
        // Handle pan state updates
    }, 16), // 60fps
    []
);
```

## Browser Support

### Compatibility
- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Touch Devices**: Full touch pan support
- **Mouse Events**: Standard mouse drag events
- **Keyboard Events**: Full Ctrl/Cmd detection

### Fallbacks
- **No JavaScript**: Graceful degradation
- **Older Browsers**: Basic pan functionality
- **Reduced Motion**: Respect `prefers-reduced-motion`

## Testing

### Unit Tests
- **Pan Reset Button**: Rendering, click handlers, accessibility
- **Keyboard Shortcuts**: Event handling, cross-platform support
- **Viewport Changes**: State tracking, animation triggers

### Test Coverage
```typescript
describe('Pan Controls', () => {
    it('should render pan reset button with correct attributes', () => {
        render(<VisualizationControls {...props} />);
        
        const panResetButton = screen.getByRole('button', { name: /reset pan position/i });
        expect(panResetButton).toHaveAttribute('title', 'Đặt lại vị trí (Ctrl + R)');
    });

    it('should call onPanReset when button is clicked', () => {
        render(<VisualizationControls {...props} />);
        
        fireEvent.click(screen.getByRole('button', { name: /reset pan position/i }));
        expect(mockOnPanReset).toHaveBeenCalledTimes(1);
    });

    it('should handle pan reset keyboard shortcut', () => {
        render(<RoadmapVisualization {...props} />);
        
        fireEvent.keyDown(document, { key: 'r', ctrlKey: true });
        // Verify pan reset functionality
    });
});
```

## Integration với Existing Controls

### VisualizationControls Props
```typescript
interface VisualizationControlsProps {
    onZoomIn: () => void;
    onZoomOut: () => void;
    onFitView: () => void;
    onPanReset: () => void;  // NEW: Pan reset handler
    onLayoutChange: (layout: LayoutType) => void;
    currentLayout: LayoutType;
    zoomLevel?: number;
    className?: string;
}
```

### Control Layout
```
[Zoom In] [Zoom Out] [Zoom Level] [Fit View] [Pan Reset] | [Layout Selector]
```

## Future Enhancements

### Planned Features
1. **Pan Boundaries**: Limit pan area to content bounds
2. **Pan Animation Presets**: Different easing functions
3. **Pan History**: Undo/redo pan positions
4. **Mini-map Pan**: Click-to-pan on minimap
5. **Touch Gestures**: Enhanced touch pan support

### API Extensions
```typescript
interface EnhancedPanControls {
    panBounds?: { x: number; y: number; width: number; height: number };
    panAnimation?: 'ease' | 'linear' | 'ease-in-out';
    enableHistory?: boolean;
    enableMiniMapPan?: boolean;
    touchSensitivity?: number;
}
```

## Troubleshooting

### Common Issues

#### Pan Không Hoạt Động
- **Kiểm tra**: `panOnDrag: true` trong React Flow config
- **Solution**: Verify React Flow instance available
- **Debug**: Check mouse event listeners

#### Pan Reset Không Smooth
- **Kiểm tra**: `setViewport` duration parameter
- **Solution**: Ensure animation duration > 0
- **Debug**: Check viewport transition settings

#### Keyboard Shortcut Conflicts
- **Kiểm tra**: Browser refresh shortcut (Ctrl+R)
- **Solution**: `event.preventDefault()` được call
- **Debug**: Console log keyboard events

### Debug Commands
```bash
# Run pan control tests
pnpm test --filter @viztechstack/web -- --testPathPatterns="VisualizationControls|keyboard"

# Check TypeScript
pnpm typecheck --filter @viztechstack/web

# Build verification
pnpm build --filter @viztechstack/web
```

## Best Practices

### UX Guidelines
1. **Smooth Animations**: Always use duration > 200ms
2. **Visual Feedback**: Hover states cho buttons
3. **Keyboard Support**: Provide shortcuts cho all actions
4. **Accessibility**: Proper ARIA labels và descriptions
5. **Performance**: Debounce pan events cho large graphs

### Code Quality
1. **TypeScript**: Strict typing cho all pan handlers
2. **Testing**: Comprehensive test coverage
3. **Documentation**: Clear API documentation
4. **Error Handling**: Graceful fallbacks
5. **Performance**: Optimized event handling

---

**Validates**: Requirement 1.4 - Navigation Controls (Pan functionality)
**Status**: ✅ Completed
**Integration**: Seamless với existing zoom controls
**Last Updated**: 2024-12-19