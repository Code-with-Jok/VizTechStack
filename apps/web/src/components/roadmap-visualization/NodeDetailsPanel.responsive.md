# NodeDetailsPanel Responsive Design

## Tổng Quan

NodeDetailsPanel đã được nâng cấp với responsive design hoàn chỉnh, collapse/expand functionality và performance optimization cho Task 4.2.2. Component này thích ứng với mọi kích thước màn hình từ mobile đến desktop với trải nghiệm người dùng tối ưu.

## Tính Năng Responsive

### 1. Adaptive Layout System

#### Breakpoints
- **Mobile (< 768px)**: Layout compact, controls touch-friendly
- **Tablet (768px - 1024px)**: Layout trung bình với adaptive controls  
- **Desktop (> 1024px)**: Layout đầy đủ với tất cả tính năng

#### Panel States
- **Expanded**: Hiển thị đầy đủ nội dung với tất cả tabs
- **Collapsed**: Chỉ hiển thị header với thông tin cơ bản
- **Minimized**: Hiển thị thông tin tóm tắt trong không gian nhỏ

### 2. Responsive Components

#### Header Section
```typescript
// Responsive spacing và typography
className="p-4 sm:p-6 pb-3 sm:pb-4"
className="text-base sm:text-lg font-semibold"
className="text-xs sm:text-sm text-neutral-600"
```

#### Tab Navigation
```typescript
// Mobile: Icons only, Desktop: Text + Icons
<span className="hidden sm:inline">Chi tiết</span>
<span className="sm:hidden">📋</span>
```

#### Content Areas
```typescript
// Adaptive padding và spacing
className="p-4 sm:p-6 space-y-4 sm:space-y-6"
className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
```

### 3. Performance Optimization

#### Virtualization
- Tự động kích hoạt khi có > 10 related nodes
- Chỉ render visible items trong viewport
- Smooth scrolling với performance monitoring

#### Memory Management
- Intelligent caching với automatic cleanup
- Memory usage monitoring
- Cache hit rate optimization

#### Lazy Loading
- Load content on demand
- Progressive rendering cho large datasets
- Performance metrics tracking

## API Reference

### Props Interface

```typescript
interface NodeDetailsPanelProps {
    // ... existing props
    
    // Task 4.2.2: Responsive design props
    initialPanelState?: 'collapsed' | 'expanded' | 'minimized';
    enableAutoResize?: boolean;
    maxHeight?: number;
    enablePerformanceOptimization?: boolean;
    onPanelStateChange?: (state: 'collapsed' | 'expanded' | 'minimized') => void;
}
```

### Responsive Hooks

#### useResponsivePanel
```typescript
const responsivePanel = useResponsivePanel({
    defaultState: 'expanded',
    persistKey: 'node-details',
    autoCollapseOnMobile: true,
    autoExpandOnDesktop: true,
});

// Available properties
responsivePanel.panelState        // Current state
responsivePanel.breakpoint        // Current breakpoint
responsivePanel.isMobile         // Boolean flags
responsivePanel.isTablet
responsivePanel.isDesktop
responsivePanel.togglePanel()    // Actions
responsivePanel.expandPanel()
responsivePanel.collapsePanel()
```

#### usePanelPerformance
```typescript
const panelPerformance = usePanelPerformance(items, {
    enableVirtualization: true,
    itemHeight: 80,
    containerHeight: 400,
    enableMemoryOptimization: true,
});

// Available properties
panelPerformance.virtualizedItems  // Virtualized items
panelPerformance.metrics          // Performance metrics
panelPerformance.handleScroll()   // Scroll handler
```

## Usage Examples

### Basic Responsive Usage

```typescript
<NodeDetailsPanel
    nodeId="example-node"
    nodeData={nodeData}
    onClose={handleClose}
    // Responsive props
    initialPanelState="expanded"
    enableAutoResize={true}
    enablePerformanceOptimization={true}
    onPanelStateChange={handleStateChange}
/>
```

### Mobile-Optimized Configuration

```typescript
<NodeDetailsPanel
    nodeId="example-node"
    nodeData={nodeData}
    onClose={handleClose}
    // Mobile-first configuration
    initialPanelState="minimized"
    enableAutoResize={true}
    maxHeight={400}
    enablePerformanceOptimization={true}
/>
```

### Performance-Optimized for Large Datasets

```typescript
<NodeDetailsPanel
    nodeId="example-node"
    nodeData={nodeData}
    allNodes={largeNodeArray}        // > 100 nodes
    allEdges={largeEdgeArray}        // > 200 edges
    onClose={handleClose}
    // Performance optimization
    enablePerformanceOptimization={true}
    onPanelStateChange={handleStateChange}
/>
```

## Responsive Behavior

### Mobile Devices (< 768px)

#### Layout Adaptations
- Panel width: `w-full max-w-sm` (384px max)
- Compact padding: `p-4` instead of `p-6`
- Smaller typography: `text-xs` instead of `text-sm`
- Touch-friendly button sizes: minimum 44px touch targets

#### Interaction Changes
- Auto-minimize on open để save screen space
- Swipe gestures support (future enhancement)
- Limited related nodes display (3 max với "show more")
- Click outside to close functionality

#### Content Prioritization
- Essential information first
- Collapsible sections
- Icon-only navigation tabs
- Abbreviated text labels

### Tablet Devices (768px - 1024px)

#### Layout Adaptations
- Panel width: `w-full max-w-md` (448px max)
- Medium padding: `p-4 sm:p-6`
- Adaptive typography: responsive text sizes
- Balanced touch và mouse interaction

#### Feature Availability
- Full tab navigation
- Complete related nodes list
- All action buttons visible
- Moderate performance optimization

### Desktop Devices (> 1024px)

#### Layout Adaptations
- Panel width: `w-full max-w-lg` (512px max)
- Full padding: `p-6`
- Optimal typography sizes
- Mouse-optimized interactions

#### Full Feature Set
- All tabs và content visible
- Complete statistics display
- Full performance metrics (dev mode)
- Advanced keyboard shortcuts

## Performance Metrics

### Virtualization Thresholds
- **Enable when**: > 10 related nodes
- **Item height**: 80px default
- **Overscan**: 5 items above/below viewport
- **Container height**: 40% of panel height

### Memory Management
- **Cache size**: 100 items maximum
- **Cleanup interval**: 30 seconds
- **Hit rate target**: > 70%
- **Memory threshold**: Monitor và alert

### Render Performance
- **Target frame rate**: 60fps (< 16ms per frame)
- **Interaction response**: < 100ms
- **Initial render**: < 3 seconds for large datasets
- **Scroll performance**: Smooth 60fps scrolling

## Accessibility Features

### Keyboard Navigation
- **Escape**: Collapse panel hoặc close
- **Ctrl + Tab**: Switch between tabs
- **Ctrl + Space**: Toggle panel state
- **Arrow keys**: Navigate through related nodes
- **Enter**: Activate selected item

### Screen Reader Support
- ARIA labels cho all interactive elements
- Role definitions cho dialog và tabs
- Live regions cho dynamic content updates
- Descriptive text cho visual elements

### High Contrast Support
- Respect system high contrast settings
- Alternative visual indicators beyond color
- Sufficient color contrast ratios (WCAG AA)
- Focus indicators clearly visible

## Browser Support

### Modern Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Mobile Browsers
- iOS Safari 14+
- Chrome Mobile 90+
- Samsung Internet 14+
- Firefox Mobile 88+

### Fallback Support
- Graceful degradation cho older browsers
- Progressive enhancement approach
- Core functionality available without advanced features
- Polyfills cho essential features only

## Migration Guide

### From Previous Version

#### Breaking Changes
- None - fully backward compatible

#### New Optional Props
```typescript
// Add these props for enhanced functionality
initialPanelState?: 'collapsed' | 'expanded' | 'minimized';
enableAutoResize?: boolean;
maxHeight?: number;
enablePerformanceOptimization?: boolean;
onPanelStateChange?: (state) => void;
```

#### Recommended Updates
```typescript
// Before
<NodeDetailsPanel
    nodeId={nodeId}
    nodeData={nodeData}
    onClose={onClose}
/>

// After - with responsive enhancements
<NodeDetailsPanel
    nodeId={nodeId}
    nodeData={nodeData}
    onClose={onClose}
    enableAutoResize={true}
    enablePerformanceOptimization={true}
    onPanelStateChange={handleStateChange}
/>
```

## Testing

### Responsive Testing
```bash
# Test different screen sizes
npm run test:responsive

# Visual regression testing
npm run test:visual

# Performance testing
npm run test:performance
```

### Manual Testing Checklist
- [ ] Panel adapts correctly to screen size changes
- [ ] Touch interactions work on mobile devices
- [ ] Keyboard navigation functions properly
- [ ] Performance remains smooth with large datasets
- [ ] All states (collapsed/expanded/minimized) work correctly
- [ ] Accessibility features function as expected

## Troubleshooting

### Common Issues

#### Panel Not Responsive
- Check if responsive hooks are properly imported
- Verify breakpoint detection is working
- Ensure CSS classes are applied correctly

#### Performance Issues
- Enable performance optimization
- Check virtualization thresholds
- Monitor memory usage in dev tools
- Verify cleanup intervals are running

#### Layout Problems
- Check container dimensions
- Verify CSS grid/flexbox support
- Test with different content lengths
- Validate responsive breakpoints

### Debug Mode
```typescript
// Enable debug mode for development
<NodeDetailsPanel
    // ... other props
    enablePerformanceOptimization={true}
    // Performance metrics will show in dev mode
/>
```

## Future Enhancements

### Planned Features
- Swipe gestures cho mobile navigation
- Drag-to-resize functionality
- Custom breakpoint configuration
- Advanced virtualization options
- Offline support với caching

### Performance Improvements
- Web Workers cho heavy computations
- Service Worker caching
- Advanced memory management
- Predictive loading algorithms

---

**Version**: 1.0.0  
**Last Updated**: 2026-03-12  
**Task**: 4.2.2 - Implement panel responsive design