# Roadmap Visualization Components

## Tổng Quan

Bộ components cho việc trực quan hóa roadmap với React Flow, tích hợp với VizTechStack design system và hỗ trợ đầy đủ tương tác người dùng.

## Components Chính

### RoadmapVisualization

Component container chính cho visualization với các tính năng:

- **Node Selection**: Click để chọn node, hiển thị chi tiết trong side panel
- **Connection Highlighting**: Tự động highlight các nodes và edges liên quan
- **Keyboard Navigation**: Hỗ trợ điều hướng bằng phím mũi tên, Enter, Escape
- **Zoom & Pan Controls**: Điều khiển zoom và pan với keyboard shortcuts
- **Layout Algorithms**: Hỗ trợ nhiều thuật toán bố cục (hierarchical, force, circular, grid)

#### Props

```typescript
interface RoadmapVisualizationProps {
    graphData: GraphData;
    onNodeClick?: (nodeId: string) => void;
    onEdgeClick?: (edgeId: string) => void;
    className?: string;
}
```

#### Keyboard Shortcuts

- **Ctrl + +/-**: Zoom in/out
- **Ctrl + 0**: Fit to view
- **Ctrl + R**: Reset pan position
- **Arrow Keys**: Navigate between selected nodes
- **Enter/Space**: Activate selected node
- **Escape**: Deselect current node

### NodeDetailsPanel

Panel hiển thị thông tin chi tiết của node được chọn với các tính năng nâng cao:

**Tính năng mới (Enhanced v2.0.0 - Task 1.5.2):**
- **Tab Navigation**: 3 tabs chính (Chi tiết, Kết nối, Tiến độ)
- **Related Nodes**: Hiển thị và điều hướng đến nodes liên quan
- **Connection Statistics**: Thống kê kết nối và relationship types
- **Action Buttons**: Mark complete, bookmark, share functionality
- **Progress Tracking**: Tiến độ học tập và visual indicators
- **Enhanced Accessibility**: Keyboard navigation và screen reader support
- **Responsive Design**: Tối ưu cho mobile, tablet, desktop

**Core Features:**
- **Comprehensive Info**: Hiển thị đầy đủ thông tin node (mô tả, độ khó, thời gian, tài nguyên)
- **Resource Links**: Liên kết đến tài nguyên bên ngoài
- **Navigation Actions**: Buttons để điều hướng đến roadmap/article liên quan
- **Accessibility**: Hỗ trợ screen reader và keyboard navigation
- **Click Outside**: Tự động đóng khi click bên ngoài

#### Enhanced Props

```typescript
interface NodeDetailsPanelProps {
    nodeId: string;
    nodeData: NodeData;
    onClose: () => void;
    onNavigate?: (url: string, openInNewTab?: boolean) => void;
    onNodeSelect?: (nodeId: string) => void;
    className?: string;
    
    // Enhanced props for comprehensive functionality
    allNodes?: RoadmapNode[];
    allEdges?: RoadmapEdge[];
    highlightedNodes?: Set<string>;
    highlightedEdges?: Set<string>;
    onBookmark?: (nodeId: string) => void;
    onShare?: (nodeId: string) => void;
    onMarkComplete?: (nodeId: string, completed: boolean) => void;
    isBookmarked?: boolean;
    userProgress?: {
        completedNodes: Set<string>;
        totalNodes: number;
        progressPercentage: number;
    };
}
```

**Keyboard Shortcuts:**
- **Escape**: Đóng panel
- **Ctrl+Tab**: Chuyển đổi tabs
- **Enter/Space**: Activate elements
- **Tab**: Navigate through elements

### CustomRoadmapNode

Custom node component với enhanced styling và states:

- **Selection States**: Visual feedback cho selected, highlighted, dimmed states
- **Difficulty Styling**: Màu sắc theo độ khó (beginner/intermediate/advanced)
- **Category Badges**: Hiển thị category icons và labels
- **Completion Status**: Visual indicator cho nodes đã hoàn thành
- **Hover Effects**: Smooth animations và tooltips

#### Enhanced Data Structure

```typescript
interface EnhancedNodeData extends NodeData {
    selected?: boolean;      // Node được chọn
    highlighted?: boolean;   // Node được highlight (connected)
    dimmed?: boolean;       // Node bị mờ (not connected)
}
```

## Tính Năng Mới (Task 1.5.1)

### Node Click Handlers

- **Single Click**: Chọn/bỏ chọn node
- **Connection Highlighting**: Tự động highlight tất cả nodes và edges liên quan
- **Side Panel**: Hiển thị NodeDetailsPanel với thông tin chi tiết
- **Navigation Integration**: Tích hợp với existing navigation system

### Selection State Management

```typescript
// State management trong RoadmapVisualization
const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
const [highlightedNodes, setHighlightedNodes] = useState<Set<string>>(new Set());
const [highlightedEdges, setHighlightedEdges] = useState<Set<string>>(new Set());

// Helper function để tìm connected elements
const findConnectedElements = useCallback((nodeId: string) => {
    const connectedNodes = new Set<string>([nodeId]);
    const connectedEdges = new Set<string>();
    
    graphData.edges.forEach(edge => {
        if (edge.source === nodeId || edge.target === nodeId) {
            connectedEdges.add(edge.id);
            connectedNodes.add(edge.source);
            connectedNodes.add(edge.target);
        }
    });
    
    return { connectedNodes, connectedEdges };
}, [graphData.edges]);
```

### Keyboard Navigation

Enhanced keyboard support cho accessibility:

```typescript
// Arrow key navigation
switch (event.key) {
    case 'ArrowUp':
    case 'ArrowDown':
    case 'ArrowLeft':
    case 'ArrowRight':
        if (selectedNodeId) {
            const nextNode = findNextNodeInDirection(currentNode, event.key, nodes);
            if (nextNode) {
                handleNodeSelection(nextNode.id);
            }
        }
        break;
    case 'Enter':
    case ' ':
        if (selectedNodeId) {
            // Activate selected node
            handleNodeClick({} as React.MouseEvent, selectedNode);
        }
        break;
    case 'Escape':
        // Deselect current node
        handleNodeSelection(null);
        break;
}
```

## Styling System

### VizTechStack Design Integration

Components sử dụng warm color palette và design tokens:

```css
/* Node difficulty colors */
.node-beginner { @apply bg-success-50 border-success-200 text-success-800; }
.node-intermediate { @apply bg-warning-50 border-warning-200 text-warning-800; }
.node-advanced { @apply bg-error-50 border-error-200 text-error-800; }
.node-completed { @apply bg-success-100 border-success-300 text-success-900; }

/* Selection states */
.ring-2.ring-primary-400 { /* Selected node */ }
.ring-1.ring-primary-300 { /* Highlighted node */ }
.opacity-40.scale-95 { /* Dimmed node */ }

/* Glass morphism effects */
.glass { @apply bg-white/80 backdrop-blur-md border border-white/20; }
```

### Animation Classes

```css
.animate-slide-down { /* Panel entrance animation */ }
.animate-fade-in { /* Smooth fade in */ }
.animate-bounce-gentle { /* Subtle bounce for icons */ }
.hover:-translate-y-2 { /* Hover lift effect */ }
.active:scale-95 { /* Click feedback */ }
```

## Testing

Comprehensive test coverage cho tất cả components:

- **Unit Tests**: Individual component behavior
- **Integration Tests**: Component interactions
- **Accessibility Tests**: ARIA labels, keyboard navigation
- **Visual Tests**: Styling và animations

### Test Files

- `CustomRoadmapNode.spec.tsx` - Node component tests
- `NodeDetailsPanel.spec.tsx` - Details panel tests  
- `RoadmapVisualization.keyboard.spec.tsx` - Keyboard navigation tests
- `ViewToggle.spec.tsx` - View toggle tests
- `VisualizationControls.spec.tsx` - Controls tests

## Usage Example

```typescript
import { RoadmapVisualization } from '@/components/roadmap-visualization';

function RoadmapPage({ roadmap }: { roadmap: Roadmap }) {
    const [graphData, setGraphData] = useState<GraphData | null>(null);
    
    useEffect(() => {
        // Parse roadmap content to graph data
        parseRoadmapContent(roadmap.content).then(setGraphData);
    }, [roadmap.content]);
    
    if (!graphData) return <LoadingSpinner />;
    
    return (
        <div className="h-screen">
            <RoadmapVisualization
                graphData={graphData}
                onNodeClick={(nodeId) => {
                    console.log('Node clicked:', nodeId);
                }}
                className="w-full h-full"
            />
        </div>
    );
}
```

## Accessibility Features

- **ARIA Labels**: Proper labeling cho screen readers
- **Keyboard Navigation**: Full keyboard support
- **Focus Management**: Proper focus handling trong panels
- **High Contrast**: Support cho high contrast mode
- **Screen Reader**: Compatible với popular screen readers

## Performance Considerations

- **Virtualization**: Support cho large graphs (>100 nodes)
- **Memoization**: React.memo cho expensive components
- **Debouncing**: Layout calculations during interactions
- **Lazy Loading**: Node details và resources

## Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+
- **Accessibility**: NVDA, JAWS, VoiceOver support