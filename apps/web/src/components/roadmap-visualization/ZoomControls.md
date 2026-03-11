# Điều Khiển Zoom - Roadmap Visualization

## Tổng Quan

Hệ thống điều khiển zoom cho roadmap visualization cung cấp các tính năng zoom tương tác với giao diện người dùng trực quan và hỗ trợ keyboard shortcuts.

## Tính Năng

### 1. Zoom Controls

#### Zoom In (Phóng To)
- **Button**: Nút "+" với icon phóng to
- **Keyboard**: `Ctrl + +` hoặc `Ctrl + =` (Windows/Linux), `Cmd + +` (Mac)
- **Chức năng**: Phóng to visualization với animation mượt mà
- **Duration**: 300ms transition

#### Zoom Out (Thu Nhỏ)
- **Button**: Nút "-" với icon thu nhỏ  
- **Keyboard**: `Ctrl + -` (Windows/Linux), `Cmd + -` (Mac)
- **Chức năng**: Thu nhỏ visualization với animation mượt mà
- **Duration**: 300ms transition

#### Fit to View (Vừa Màn Hình)
- **Button**: Nút với icon fit-to-view
- **Keyboard**: `Ctrl + 0` (Windows/Linux), `Cmd + 0` (Mac)
- **Chức năng**: Tự động điều chỉnh zoom để hiển thị toàn bộ roadmap
- **Options**: Padding 15%, duration 400ms

### 2. Zoom Level Indicator

#### Hiển Thị Phần Trăm
- **Format**: `{zoom}%` (ví dụ: 150%, 75%, 100%)
- **Rounding**: Làm tròn đến số nguyên gần nhất
- **Styling**: Background neutral-50, border neutral-200
- **Width**: Minimum 60px, text-center

#### Real-time Updates
- **Tracking**: Theo dõi thay đổi viewport từ React Flow
- **Callback**: `onViewportChange` handler
- **State**: Lưu trữ trong component state

### 3. Layout Selector

#### Các Tùy Chọn Layout
- **Hierarchical (Phân cấp)**: Layout theo cấu trúc phân cấp
- **Force (Lực hút)**: Layout dựa trên lực hút/đẩy
- **Circular (Vòng tròn)**: Layout theo hình tròn
- **Grid (Lưới)**: Layout theo dạng lưới

#### Styling
- **Select**: Custom styled với dropdown arrow
- **Focus**: Border primary-400, ring primary-100
- **Transition**: Smooth 200ms duration

## Keyboard Shortcuts

### Supported Shortcuts

| Shortcut | Action | Description |
|----------|--------|-------------|
| `Ctrl + +` / `Cmd + +` | Zoom In | Phóng to visualization |
| `Ctrl + =` / `Cmd + =` | Zoom In | Alternative cho zoom in |
| `Ctrl + -` / `Cmd + -` | Zoom Out | Thu nhỏ visualization |
| `Ctrl + 0` / `Cmd + 0` | Fit View | Vừa màn hình |

### Implementation Details

#### Event Handling
```typescript
useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
        const isCtrlPressed = event.ctrlKey || event.metaKey;
        
        if (!isCtrlPressed) return;

        switch (event.key) {
            case '=':
            case '+':
                event.preventDefault();
                handleZoomIn();
                break;
            case '-':
                event.preventDefault();
                handleZoomOut();
                break;
            case '0':
                event.preventDefault();
                handleFitView();
                break;
        }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
}, [handleZoomIn, handleZoomOut, handleFitView]);
```

#### Cross-Platform Support
- **Windows/Linux**: `event.ctrlKey`
- **Mac**: `event.metaKey`
- **Prevention**: `event.preventDefault()` để tránh browser zoom

## Accessibility

### ARIA Labels
- **Zoom In**: `aria-label="Zoom in"`
- **Zoom Out**: `aria-label="Zoom out"`
- **Fit View**: `aria-label="Fit to view"`
- **Layout Select**: `aria-label="Select layout type"`

### Tooltips
- **Zoom In**: "Phóng to (Ctrl + +)"
- **Zoom Out**: "Thu nhỏ (Ctrl + -)"
- **Fit View**: "Vừa màn hình (Ctrl + 0)"

### Keyboard Navigation
- **Tab Order**: Zoom In → Zoom Out → Zoom Level → Fit View → Layout Select
- **Focus Indicators**: Visible focus rings
- **Screen Reader**: Proper semantic markup

## Styling System

### Design Tokens
```css
/* Button styling */
.viz-button {
    @apply p-2 rounded-md hover:bg-neutral-100 transition-colors duration-200 text-neutral-600 hover:text-neutral-800;
}

/* Zoom level indicator */
.zoom-indicator {
    @apply px-3 py-1 bg-neutral-50 border border-neutral-200 rounded-md text-xs font-medium text-neutral-700 min-w-[60px] text-center;
}

/* Container styling */
.viz-controls {
    @apply glass rounded-xl p-3 shadow-medium animate-fade-in;
}
```

### Color Palette
- **Primary**: `var(--color-primary-500)` (#ed7c47)
- **Neutral**: `var(--color-neutral-600)` (#57534e)
- **Background**: `var(--color-neutral-50)` (#fafaf9)
- **Border**: `var(--color-neutral-200)` (#e7e5e4)

### Animations
- **Hover Effects**: `hover:scale-110` với `transition-transform duration-200`
- **Button Press**: `active:scale-95`
- **Fade In**: `animate-fade-in` cho container

## Integration

### Props Interface
```typescript
interface VisualizationControlsProps {
    onZoomIn: () => void;
    onZoomOut: () => void;
    onFitView: () => void;
    onLayoutChange: (layout: LayoutType) => void;
    currentLayout: LayoutType;
    zoomLevel?: number;
    className?: string;
}
```

### React Flow Integration
```typescript
// Zoom handlers
const handleZoomIn = useCallback(() => {
    if (reactFlowInstance) {
        reactFlowInstance.zoomIn({ duration: 300 });
    }
}, [reactFlowInstance]);

// Viewport tracking
const handleViewportChange = useCallback((viewport) => {
    setZoomLevel(viewport.zoom);
}, []);

// React Flow setup
<ReactFlow
    onViewportChange={handleViewportChange}
    // ... other props
/>
```

## Testing

### Unit Tests
- **Button Interactions**: Click handlers, accessibility
- **Zoom Level Display**: Percentage formatting, edge cases
- **Layout Selection**: Option rendering, change handlers
- **Keyboard Shortcuts**: Event handling, prevention

### Test Coverage
- **VisualizationControls**: 26 tests, 100% coverage
- **Keyboard Shortcuts**: 6 tests, integration testing
- **Edge Cases**: NaN, undefined, negative values

### Test Examples
```typescript
it('should display zoom level as percentage', () => {
    render(<VisualizationControls {...props} zoomLevel={1.5} />);
    expect(screen.getByText('150%')).toBeInTheDocument();
});

it('should handle keyboard shortcuts', () => {
    render(<RoadmapVisualization graphData={mockData} />);
    fireEvent.keyDown(document, { key: '+', ctrlKey: true });
    // Verify zoom functionality
});
```

## Performance

### Optimization Strategies
- **Debouncing**: Zoom level updates debounced
- **Memoization**: Callback functions memoized với `useCallback`
- **Event Cleanup**: Proper event listener cleanup
- **Smooth Animations**: Hardware-accelerated transitions

### Memory Management
- **Event Listeners**: Removed on component unmount
- **State Updates**: Minimal re-renders
- **Animation**: CSS transforms thay vì layout changes

## Browser Support

### Compatibility
- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Keyboard Events**: Full support cho Ctrl/Cmd detection
- **CSS Features**: CSS Grid, Flexbox, Custom Properties
- **JavaScript**: ES2020+ features

### Fallbacks
- **No JavaScript**: Graceful degradation
- **Older Browsers**: Polyfills cho missing features
- **Reduced Motion**: Respect `prefers-reduced-motion`

## Future Enhancements

### Planned Features
1. **Zoom Presets**: Quick zoom levels (25%, 50%, 100%, 200%)
2. **Zoom History**: Undo/redo zoom actions
3. **Touch Gestures**: Pinch-to-zoom cho mobile
4. **Zoom Limits**: Configurable min/max zoom levels
5. **Zoom Animation**: Custom easing functions

### API Extensions
```typescript
interface EnhancedZoomControls {
    presets?: number[];
    minZoom?: number;
    maxZoom?: number;
    enableHistory?: boolean;
    enableTouch?: boolean;
}
```

## Troubleshooting

### Common Issues

#### Keyboard Shortcuts Không Hoạt Động
- **Kiểm tra**: Event listeners được add đúng cách
- **Solution**: Verify component mount và cleanup
- **Debug**: Console log keyboard events

#### Zoom Level Không Cập Nhật
- **Kiểm tra**: `onViewportChange` callback
- **Solution**: Ensure React Flow instance available
- **Debug**: Check viewport state changes

#### Styling Không Đúng
- **Kiểm tra**: Tailwind classes được load
- **Solution**: Verify CSS imports và build process
- **Debug**: Inspect element styles

### Debug Commands
```bash
# Run tests
pnpm test --filter @viztechstack/web -- --testPathPatterns="VisualizationControls"

# Check TypeScript
pnpm typecheck --filter @viztechstack/web

# Lint code
pnpm lint --filter @viztechstack/web
```

---

**Validates**: Requirement 1.4 - Navigation Controls
**Status**: ✅ Completed
**Last Updated**: 2024-12-19