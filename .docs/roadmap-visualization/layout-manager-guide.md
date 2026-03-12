# 🎛️ Hướng Dẫn LayoutManager Service

## 📋 Tổng Quan

LayoutManager là service trung tâm để quản lý việc chuyển đổi giữa các thuật toán layout khác nhau với transitions mượt mà và bảo toàn trạng thái. Service này orchestrates việc switching giữa 4 thuật toán layout: Hierarchical, Force-Directed, Circular, và Grid.

## 🎯 Tính Năng Chính

### ✅ Layout Algorithm Management
- Hỗ trợ đầy đủ 4 thuật toán layout
- Seamless switching giữa các layouts
- Layout-specific options management
- Performance optimization cho từng algorithm

### ✅ Smooth Transitions
- Animated transitions với customizable duration
- Multiple easing functions (linear, ease, ease-in-out, etc.)
- Position interpolation cho smooth movement
- Configurable transition steps và timing

### ✅ State Preservation
- Node selection preservation qua transitions
- Viewport state preservation (zoom, pan position)
- Layout history tracking
- Layout-specific options storage

### ✅ Error Handling
- Robust fallback mechanisms
- Graceful degradation khi layout fails
- Comprehensive error callbacks
- Automatic recovery strategies

## 🚀 Cách Sử Dụng Cơ Bản

### 1. Tạo LayoutManager Instance

```typescript
import { createLayoutManager } from '@viztechstack/roadmap-visualization';

// Tạo với default options
const layoutManager = createLayoutManager();

// Hoặc với custom options
const layoutManager = createLayoutManager({
    enableAnimations: true,
    animationDuration: 800,
    animationEasing: 'ease-in-out',
    preserveSelection: true,
    preserveViewport: true,
    fallbackLayout: 'grid'
});
```

### 2. Apply Layout Trực Tiếp

```typescript
// Apply layout mà không có transition
const result = await layoutManager.applyLayout(graphData, 'hierarchical');

console.log(`Layout applied: ${result.layout}`);
console.log(`Nodes positioned: ${result.nodes.length}`);
console.log(`Layout time: ${result.metadata.layoutTime}ms`);
```

### 3. Switch Layout Với Transition

```typescript
// Switch với smooth transition
const result = await layoutManager.switchLayout(graphData, 'force');

console.log(`Layout switched: ${result.layout}`);
console.log(`Transition time: ${result.metadata.transitionTime}ms`);
console.log(`Transition ID: ${result.transitionId}`);
```

## ⚙️ Configuration Options

### LayoutManagerOptions

```typescript
interface LayoutManagerOptions {
    // Animation settings
    enableAnimations: boolean;          // Enable/disable transitions
    animationDuration: number;          // Duration in milliseconds
    animationEasing: string;            // Easing function
    transitionSteps: number;            // Number of animation frames
    enableInterpolation: boolean;       // Enable position interpolation
    maxTransitionTime: number;          // Maximum transition time
    
    // State preservation
    preserveSelection: boolean;         // Preserve selected nodes
    preserveViewport: boolean;          // Preserve zoom/pan state
    
    // Error handling
    fallbackLayout: LayoutType;         // Fallback layout on errors
    
    // Callbacks
    onTransitionStart?: (from: LayoutType, to: LayoutType) => void;
    onTransitionProgress?: (progress: number) => void;
    onTransitionComplete?: (layout: LayoutType) => void;
    onTransitionError?: (error: Error, layout: LayoutType) => void;
}
```

### Ví Dụ Configuration

```typescript
const customOptions: LayoutManagerOptions = {
    // Smooth animations
    enableAnimations: true,
    animationDuration: 1200,
    animationEasing: 'ease-in-out',
    transitionSteps: 60,
    enableInterpolation: true,
    maxTransitionTime: 3000,
    
    // State preservation
    preserveSelection: true,
    preserveViewport: true,
    
    // Error handling
    fallbackLayout: 'grid',
    
    // Callbacks
    onTransitionStart: (from, to) => {
        console.log(`🔄 Chuyển đổi: ${from} → ${to}`);
    },
    onTransitionProgress: (progress) => {
        console.log(`📊 Tiến độ: ${Math.round(progress * 100)}%`);
    },
    onTransitionComplete: (layout) => {
        console.log(`✅ Hoàn thành: ${layout}`);
    },
    onTransitionError: (error, layout) => {
        console.error(`❌ Lỗi ${layout}:`, error.message);
    }
};
```

## 🎨 State Preservation

### Node Selection Preservation

```typescript
// Set selected nodes trước khi switch layout
layoutManager.setSelectedNodes(['frontend-basics', 'javascript', 'react']);

// Switch layout - selections sẽ được preserve
const result = await layoutManager.switchLayout(graphData, 'circular');

// Check preserved selections
console.log('Preserved selections:', result.metadata.preservedSelections);
console.log('Current selections:', layoutManager.getSelectedNodes());
```

### Viewport State Preservation

```typescript
// Set viewport state (zoom level và center position)
layoutManager.setViewportState(1.5, 400, 300);

// Switch layout - viewport sẽ được preserve
await layoutManager.switchLayout(graphData, 'force');

// Get preserved viewport
const viewport = layoutManager.getViewportState();
console.log(`Zoom: ${viewport.zoom}, Center: (${viewport.centerX}, ${viewport.centerY})`);
```

## 🎛️ Layout-Specific Options

### Cấu Hình Options Cho Từng Layout

```typescript
// Hierarchical layout options
layoutManager.updateLayoutOptions('hierarchical', {
    direction: 'TB',
    nodeWidth: 220,
    nodeHeight: 100,
    rankSep: 120,
    nodeSep: 60
});

// Force-directed layout options
layoutManager.updateLayoutOptions('force', {
    width: 1200,
    height: 800,
    linkStrength: 0.4,
    chargeStrength: -400,
    collisionRadius: 45
});

// Circular layout options
layoutManager.updateLayoutOptions('circular', {
    radius: 250,
    startAngle: 0,
    clockwise: true
});

// Grid layout options
layoutManager.updateLayoutOptions('grid', {
    columns: 3,
    rows: 2,
    cellWidth: 200,
    cellHeight: 120,
    sortBy: 'level'
});
```

### Apply Layout Với Stored Options

```typescript
// Options sẽ được automatically applied
await layoutManager.switchLayout(graphData, 'hierarchical');

// Hoặc override với temporary options
await layoutManager.switchLayout(graphData, 'force', {
    linkStrength: 0.6  // Temporary override
});

// Get stored options
const hierarchicalOptions = layoutManager.getLayoutOptions('hierarchical');
console.log('Stored hierarchical options:', hierarchicalOptions);
```

## 📊 Performance Optimization

### Optimal Transition Options

```typescript
import { getOptimalTransitionOptions } from '@viztechstack/roadmap-visualization';

// Get optimal settings dựa trên graph characteristics
const optimalOptions = getOptimalTransitionOptions(graphData);

console.log('Optimal options:', optimalOptions);
// Output example:
// {
//   animationDuration: 600,     // Faster for large graphs
//   transitionSteps: 30,        // Fewer steps for performance
//   enableInterpolation: false, // Disabled for very large graphs
//   preserveSelection: true,
//   preserveViewport: true
// }

// Create manager với optimal settings
const optimizedManager = createLayoutManager(optimalOptions);
```

### Performance Guidelines

```typescript
// Small graphs (<20 nodes): Smooth, detailed animations
const smallGraphOptions = {
    animationDuration: 1000,
    transitionSteps: 80,
    enableInterpolation: true
};

// Medium graphs (20-100 nodes): Balanced performance
const mediumGraphOptions = {
    animationDuration: 700,
    transitionSteps: 45,
    enableInterpolation: true
};

// Large graphs (100+ nodes): Fast, efficient transitions
const largeGraphOptions = {
    animationDuration: 400,
    transitionSteps: 20,
    enableInterpolation: false
};

// Very large graphs (500+ nodes): Minimal animations
const veryLargeGraphOptions = {
    enableAnimations: false,  // Disable animations entirely
    preserveSelection: true,
    preserveViewport: true
};
```

## 🛠️ Advanced Usage

### Transition Control

```typescript
// Check if currently transitioning
if (layoutManager.isTransitioning()) {
    console.log('Transition in progress...');
    console.log(`Progress: ${layoutManager.getTransitionProgress() * 100}%`);
}

// Cancel active transition
layoutManager.cancelTransition();

// Get layout history
const history = layoutManager.getLayoutHistory();
console.log('Layout history:', history);
// Output: ['hierarchical', 'force', 'circular', 'grid']
```

### Error Handling Strategies

```typescript
const robustManager = createLayoutManager({
    fallbackLayout: 'grid',  // Safe fallback
    
    onTransitionError: (error, layout) => {
        // Log error
        console.error(`Layout ${layout} failed:`, error);
        
        // Show user notification
        showNotification(`Không thể áp dụng layout ${layout}. Đã chuyển sang layout lưới.`, 'warning');
        
        // Track error for analytics
        trackError('layout_transition_failed', { layout, error: error.message });
    }
});

// Graceful error handling
try {
    await robustManager.switchLayout(graphData, 'force');
} catch (error) {
    // This should rarely happen due to built-in fallbacks
    console.error('Critical layout error:', error);
    
    // Last resort: reload page or reset to default state
    window.location.reload();
}
```

## 🧪 Testing Strategies

### Unit Testing

```typescript
import { createLayoutManager } from '@viztechstack/roadmap-visualization';

describe('LayoutManager', () => {
    let layoutManager;
    
    beforeEach(() => {
        layoutManager = createLayoutManager();
    });
    
    afterEach(() => {
        layoutManager.dispose();
    });
    
    test('should switch layouts correctly', async () => {
        const result = await layoutManager.switchLayout(mockGraphData, 'force');
        
        expect(result.layout).toBe('force');
        expect(result.nodes).toHaveLength(mockGraphData.nodes.length);
        expect(layoutManager.getCurrentLayout()).toBe('force');
    });
    
    test('should preserve selections', async () => {
        layoutManager.setSelectedNodes(['node1', 'node2']);
        
        const result = await layoutManager.switchLayout(mockGraphData, 'circular');
        
        expect(result.metadata.preservedSelections).toEqual(['node1', 'node2']);
    });
});
```

### Integration Testing

```typescript
// Test với React components
import { render, fireEvent, waitFor } from '@testing-library/react';
import { LayoutControls } from './LayoutControls';

test('should switch layouts when user selects different option', async () => {
    const onLayoutChange = jest.fn();
    
    const { getByRole } = render(
        <LayoutControls onLayoutChange={onLayoutChange} />
    );
    
    // Select force-directed layout
    fireEvent.change(getByRole('combobox'), { target: { value: 'force' } });
    
    await waitFor(() => {
        expect(onLayoutChange).toHaveBeenCalledWith('force');
    });
});
```

## 🔧 Utility Functions

### Quick Operations

```typescript
import { 
    switchLayoutWithTransition, 
    applyLayoutDirect 
} from '@viztechstack/roadmap-visualization';

// Quick layout switch với transition
const result1 = await switchLayoutWithTransition(
    graphData,
    'force',
    { linkStrength: 0.5 },           // Layout options
    { animationDuration: 600 }       // Manager options
);

// Direct layout application (no transition)
const result2 = await applyLayoutDirect(
    graphData,
    'grid',
    { columns: 3, rows: 2 },         // Layout options
    { enableAnimations: false }      // Manager options
);
```

### Factory Functions

```typescript
// Create manager với specific configuration
const animatedManager = createLayoutManager({
    enableAnimations: true,
    animationDuration: 800
});

const staticManager = createLayoutManager({
    enableAnimations: false,
    preserveSelection: true
});

const performanceManager = createLayoutManager(
    getOptimalTransitionOptions(largeGraphData)
);
```

## 🧹 Resource Management

### Proper Cleanup

```typescript
// Always dispose when done
const layoutManager = createLayoutManager();

// Use the manager...
await layoutManager.switchLayout(graphData, 'force');

// Clean up resources
layoutManager.dispose();

// Or use with try-finally
const layoutManager = createLayoutManager();
try {
    await layoutManager.switchLayout(graphData, 'circular');
} finally {
    layoutManager.dispose();
}
```

### React Hook Pattern

```typescript
import { useEffect, useRef } from 'react';
import { createLayoutManager } from '@viztechstack/roadmap-visualization';

function useLayoutManager(options) {
    const managerRef = useRef(null);
    
    useEffect(() => {
        managerRef.current = createLayoutManager(options);
        
        return () => {
            if (managerRef.current) {
                managerRef.current.dispose();
            }
        };
    }, []);
    
    return managerRef.current;
}

// Usage trong component
function VisualizationComponent() {
    const layoutManager = useLayoutManager({
        enableAnimations: true,
        preserveSelection: true
    });
    
    const handleLayoutChange = async (layoutType) => {
        if (layoutManager) {
            await layoutManager.switchLayout(graphData, layoutType);
        }
    };
    
    return (
        <LayoutControls onLayoutChange={handleLayoutChange} />
    );
}
```

## 📚 Best Practices

### 1. Performance
- Sử dụng `getOptimalTransitionOptions()` cho large graphs
- Disable animations cho graphs >200 nodes
- Dispose managers khi không sử dụng
- Monitor memory usage trong long-running applications

### 2. User Experience
- Provide visual feedback during transitions
- Show progress indicators cho long transitions
- Handle errors gracefully với user-friendly messages
- Preserve user state (selections, viewport) across transitions

### 3. Error Handling
- Always configure fallback layout
- Implement error callbacks
- Log errors cho debugging
- Provide recovery mechanisms

### 4. Testing
- Test tất cả layout combinations
- Test error scenarios
- Test performance với different graph sizes
- Test state preservation

### 5. Integration
- Use proper cleanup trong React components
- Handle async operations correctly
- Provide loading states
- Implement proper error boundaries

## 🎛️ Tích Hợp Với LayoutControls Component

### Sử Dụng LayoutManager Với LayoutControls

LayoutControls component được thiết kế để tích hợp seamlessly với LayoutManager service:

```typescript
import { LayoutControls } from '@/components/roadmap-visualization/LayoutControls';
import { createLayoutManager } from '@viztechstack/roadmap-visualization';

function RoadmapVisualization() {
    const [layoutManager] = useState(() => createLayoutManager({
        enableAnimations: true,
        animationDuration: 800,
        preserveSelection: true,
        preserveViewport: true,
        onTransitionStart: (from, to) => {
            setIsTransitioning(true);
            setTransitionProgress(0);
        },
        onTransitionProgress: (progress) => {
            setTransitionProgress(progress);
        },
        onTransitionComplete: (layout) => {
            setIsTransitioning(false);
            setTransitionProgress(1);
        }
    }));
    
    const [currentLayout, setCurrentLayout] = useState<LayoutType>('hierarchical');
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [transitionProgress, setTransitionProgress] = useState(0);
    
    const handleLayoutChange = async (layout: LayoutType, options: any) => {
        try {
            const result = await layoutManager.switchLayout(graphData, layout, options);
            setCurrentLayout(result.layout);
            // Update visualization với result.nodes
        } catch (error) {
            console.error('Layout transition failed:', error);
        }
    };
    
    return (
        <LayoutControls
            currentLayout={currentLayout}
            onLayoutChange={handleLayoutChange}
            isTransitioning={isTransitioning}
            transitionProgress={transitionProgress}
            layoutHistory={layoutManager.getLayoutHistory()}
            graphData={graphData}
            // ... other props
        />
    );
}
```

### Unified Layout Management

LayoutControls component cung cấp:

- **Unified Interface**: Single component cho tất cả layout functionality
- **Layout Selection**: Dropdown với layout information và performance indicators
- **Smooth Transitions**: Integration với LayoutManager cho animated transitions
- **Layout-Specific Controls**: Conditional rendering của appropriate controls
- **State Preservation**: Maintains layout history và transition state
- **Performance Optimization**: Layout recommendations dựa trên graph size

### Advanced Integration Features

```typescript
// Với full layout options
<LayoutControls
    currentLayout={layoutManager.getCurrentLayout()}
    onLayoutChange={(layout, options) => {
        layoutManager.switchLayout(graphData, layout, options);
    }}
    isTransitioning={layoutManager.isTransitioning()}
    transitionProgress={layoutManager.getTransitionProgress()}
    layoutHistory={layoutManager.getLayoutHistory()}
    
    // Layout-specific options
    hierarchicalOptions={layoutManager.getLayoutOptions('hierarchical')}
    onHierarchicalOptionsChange={(options) => {
        layoutManager.updateLayoutOptions('hierarchical', options);
    }}
    
    // Transition callbacks
    onTransitionStart={(from, to) => {
        // Handle UI updates
    }}
    onTransitionComplete={(layout) => {
        // Handle completion
    }}
    onTransitionError={(error, layout) => {
        // Handle errors
    }}
    
    showAdvanced={true}
/>
```

## 🔗 Related Documentation

- **LayoutControls Component**: `apps/web/src/components/roadmap-visualization/LayoutControls.md`
- **Layout Algorithms**: Xem individual layout guides
- **Frontend Integration**: `view-toggle-guide.md`
- **Performance**: `integration-status-report.md`
- **Testing**: Test files trong `__tests__/` directories

---

**Tài liệu được tạo:** 2026-03-12  
**Cập nhật lần cuối:** 2026-03-12 (Thêm LayoutControls integration)  
**Version:** 1.1.0  
**Status:** ✅ Complete