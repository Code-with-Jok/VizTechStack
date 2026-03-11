# Hướng Dẫn Navigation trong Roadmap Visualization

## Tổng Quan

Tài liệu này mô tả cách hoạt động của hệ thống navigation trong roadmap visualization, bao gồm logic click behavior, node selection, connection highlighting và cách nodes điều hướng đến các trang khác nhau.

## Tính Năng Node Click Handlers - MỚI ✨

### Node Selection System

**Trạng thái:** ✅ HOÀN THÀNH (Task 1.5.1: Implement node click handlers)

**Đặc điểm đã triển khai:**
- ✅ Single click để chọn/bỏ chọn node
- ✅ Connection highlighting tự động cho nodes và edges liên quan
- ✅ NodeDetailsPanel hiển thị thông tin chi tiết
- ✅ Keyboard navigation với arrow keys, Enter, Escape
- ✅ Visual feedback với selection states (selected, highlighted, dimmed)
- ✅ Accessibility support với ARIA labels và screen reader compatibility

### Node Selection States

#### 1. Selected State (Được chọn)
```css
.ring-2.ring-primary-400.ring-offset-2.scale-105 {
  /* Node được chọn trực tiếp */
}
```

#### 2. Highlighted State (Được highlight)
```css
.ring-1.ring-primary-300 {
  /* Nodes kết nối với node được chọn */
}
```

#### 3. Dimmed State (Bị mờ)
```css
.opacity-40.scale-95 {
  /* Nodes không liên quan đến selection */
}
```

### NodeDetailsPanel Component

**Mục đích:** Hiển thị thông tin chi tiết của node được chọn trong side panel

**Đặc điểm:**
- **Comprehensive Info**: Hiển thị đầy đủ thông tin node (mô tả, độ khó, thời gian, tài nguyên)
- **Resource Links**: Liên kết đến tài nguyên bên ngoài với icons phân loại
- **Navigation Actions**: Buttons để điều hướng đến roadmap/article liên quan
- **Accessibility**: Hỗ trợ screen reader và keyboard navigation
- **Click Outside**: Tự động đóng khi click bên ngoài hoặc nhấn Escape

**Implementation:**
```typescript
import { NodeDetailsPanel } from '@/components/roadmap-visualization/NodeDetailsPanel';

function RoadmapVisualization({ graphData }: Props) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedNodeData, setSelectedNodeData] = useState<NodeData | null>(null);

  const handleNodeClick = useCallback((nodeId: string) => {
    // Toggle selection
    const newSelectedId = selectedNodeId === nodeId ? null : nodeId;
    setSelectedNodeId(newSelectedId);
    
    if (newSelectedId) {
      const nodeData = graphData.nodes.find(n => n.id === newSelectedId)?.data;
      setSelectedNodeData(nodeData || null);
    } else {
      setSelectedNodeData(null);
    }
  }, [selectedNodeId, graphData.nodes]);

  return (
    <div className="relative w-full h-full">
      <ReactFlow
        nodes={nodes}
        onNodeClick={handleNodeClick}
        // ...
      />
      
      {/* Node Details Panel */}
      {selectedNodeId && selectedNodeData && (
        <div className="absolute top-6 right-6 w-96 z-30">
          <NodeDetailsPanel
            nodeId={selectedNodeId}
            nodeData={selectedNodeData}
            onClose={() => setSelectedNodeId(null)}
            onNavigate={handleNavigationFromPanel}
          />
        </div>
      )}
    </div>
  );
}
```

### Connection Highlighting System

**Logic:** Khi một node được chọn, tất cả nodes và edges liên quan sẽ được highlight

```typescript
// Tìm connected elements
const findConnectedElements = useCallback((nodeId: string) => {
  const connectedNodes = new Set<string>([nodeId]); // Bao gồm node được chọn
  const connectedEdges = new Set<string>();

  // Tìm tất cả edges kết nối với node này
  graphData.edges.forEach(edge => {
    if (edge.source === nodeId || edge.target === nodeId) {
      connectedEdges.add(edge.id);
      // Thêm connected nodes
      connectedNodes.add(edge.source);
      connectedNodes.add(edge.target);
    }
  });

  return { connectedNodes, connectedEdges };
}, [graphData.edges]);
```

**Visual Effects:**
- **Selected Node**: Ring border màu primary với scale effect
- **Connected Nodes**: Ring border nhạt hơn
- **Connected Edges**: Stroke màu primary với increased width
- **Other Elements**: Opacity giảm và scale nhỏ lại

### Keyboard Navigation

**Keyboard Shortcuts mới:**
- **Arrow Keys**: Điều hướng giữa các nodes (tìm node gần nhất theo hướng)
- **Enter/Space**: Activate node được chọn (trigger click behavior)
- **Escape**: Bỏ chọn node hiện tại
- **Tab**: Focus navigation trong NodeDetailsPanel

**Implementation:**
```typescript
const handleKeyDown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'ArrowUp':
    case 'ArrowDown':
    case 'ArrowLeft':
    case 'ArrowRight':
      if (selectedNodeId) {
        event.preventDefault();
        const currentNode = nodes.find(n => n.id === selectedNodeId);
        if (currentNode) {
          const nextNode = findNextNodeInDirection(currentNode, event.key, nodes);
          if (nextNode) {
            handleNodeSelection(nextNode.id);
          }
        }
      }
      break;
    case 'Enter':
    case ' ':
      if (selectedNodeId) {
        event.preventDefault();
        const selectedNode = nodes.find(n => n.id === selectedNodeId);
        if (selectedNode) {
          handleNodeClick({} as React.MouseEvent, selectedNode);
        }
      }
      break;
    case 'Escape':
      event.preventDefault();
      handleNodeSelection(null);
      break;
  }
};
```

### Enhanced Node Data Structure

```typescript
interface EnhancedNodeData extends NodeData {
  // Selection states (được thêm bởi RoadmapVisualization)
  selected?: boolean;      // Node được chọn trực tiếp
  highlighted?: boolean;   // Node được highlight (connected)
  dimmed?: boolean;       // Node bị mờ (not connected)
}
```

## Phân Loại Node

### 1. Role Node (Vai Trò)

**Đặc điểm:**
- Đại diện cho một vai trò/chức danh trong ngành
- Chứa một roadmap con hoàn chỉnh
- Icon: 👤
- Màu sắc: Gradient xanh dương (blue-50 → blue-100)
- Border: Xanh dương đậm (blue-300)

**Styling:**
```css
/* Light mode */
background: linear-gradient(to bottom right, #eff6ff, #dbeafe);
border: 2px solid #93c5fd;
color: #1e3a8a;

/* Dark mode */
background: linear-gradient(to bottom right, rgba(30, 58, 138, 0.3), rgba(30, 64, 175, 0.3));
border: 2px solid #1d4ed8;
color: #bfdbfe;
```

**Hành vi khi click:**
- Navigate đến trang roadmap con
- URL format: `/roadmaps/{targetRoadmapId}`
- Mở trong cùng tab

**Ví dụ:**
```typescript
const roleNode: NodeData = {
  label: 'Frontend Developer',
  category: 'role',
  targetRoadmapId: 'frontend-developer-roadmap',
  // ... other properties
};
```

### 2. Skill Node (Kỹ Năng)

**Đặc điểm:**
- Đại diện cho một kỹ năng/chủ đề cụ thể
- Liên kết đến nội dung chi tiết (article)
- Icon: 🎯
- Màu sắc: Gradient xanh lá (green-50 → green-100)
- Border: Xanh lá đậm (green-300)

**Styling:**
```css
/* Light mode */
background: linear-gradient(to bottom right, #f0fdf4, #dcfce7);
border: 2px solid #86efac;
color: #14532d;

/* Dark mode */
background: linear-gradient(to bottom right, rgba(20, 83, 45, 0.3), rgba(22, 101, 52, 0.3));
border: 2px solid #15803d;
color: #bbf7d0;
```

**Hành vi khi click:**
- Navigate đến trang article
- URL format: `/articles/{targetArticleId}`
- Mở trong cùng tab

**Ví dụ:**
```typescript
const skillNode: NodeData = {
  label: 'React Hooks',
  category: 'skill',
  targetArticleId: 'react-hooks-guide',
  // ... other properties
};
```

### 3. Node không có Category

**Đặc điểm:**
- Sử dụng difficulty-based styling
- Icon: 📌
- Màu sắc: Theo difficulty level

**Difficulty Colors:**
- **Beginner**: Xanh lá nhạt
- **Intermediate**: Vàng cam
- **Advanced**: Đỏ

## API Reference

### Navigation Functions

#### `getNodeNavigationUrl(nodeData: NodeData): NavigationResult`

Lấy URL navigation dựa trên node category và data.

**Parameters:**
- `nodeData`: Node data chứa category và target IDs

**Returns:**
```typescript
interface NavigationResult {
    url: string;
    type: 'roadmap' | 'article' | 'none';
    openInNewTab?: boolean;
}
```

**Example:**
```typescript
import { getNodeNavigationUrl } from '@viztechstack/roadmap-visualization';

const nodeData = {
  label: 'Frontend Developer',
  category: 'role',
  targetRoadmapId: 'frontend-dev',
  // ...
};

const result = getNodeNavigationUrl(nodeData);
// { url: '/roadmaps/frontend-dev', type: 'roadmap', openInNewTab: false }
```

#### `canNavigate(nodeData: NodeData): boolean`

Kiểm tra xem node có thể navigate hay không.

**Parameters:**
- `nodeData`: Node data cần kiểm tra

**Returns:**
- `true` nếu node có target ID hợp lệ
- `false` nếu không thể navigate

**Example:**
```typescript
import { canNavigate } from '@viztechstack/roadmap-visualization';

if (canNavigate(nodeData)) {
  // Node có thể navigate
  const navResult = getNodeNavigationUrl(nodeData);
  router.push(navResult.url);
}
```

#### `getCategoryDisplayName(category?: NodeCategory): string`

Lấy tên hiển thị của node category.

**Returns:**
- `'Vai trò'` cho role nodes
- `'Kỹ năng'` cho skill nodes
- `'Chủ đề'` cho nodes không có category

#### `getCategoryIcon(category?: NodeCategory): string`

Lấy icon emoji cho node category.

**Returns:**
- `'👤'` cho role nodes
- `'🎯'` cho skill nodes
- `'📌'` cho nodes không có category

#### `validateNodeNavigation(nodeData: NodeData): string | null`

Validate node navigation data.

**Returns:**
- `null` nếu valid
- Error message string nếu invalid

**Example:**
```typescript
import { validateNodeNavigation } from '@viztechstack/roadmap-visualization';

const error = validateNodeNavigation(nodeData);
if (error) {
  console.error('Validation error:', error);
}
```

## Implementation trong Components

### CustomRoadmapNode Component

Component hiển thị node với category-based styling và enhanced features:

```typescript
import React, { useState } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { NodeData } from '@viztechstack/roadmap-visualization';
import { getCategoryIcon, getCategoryDisplayName } from '@viztechstack/roadmap-visualization';

export function CustomRoadmapNode({ data }: NodeProps<any>) {
  const nodeData = data as NodeData;
  const [isHovered, setIsHovered] = useState(false);
  
  // Lấy styling dựa trên difficulty và category
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
  
  // Lấy category icon và display name
  const categoryIcon = getCategoryIcon(nodeData.category);
  const categoryName = getCategoryDisplayName(nodeData.category);

  return (
    <div
      className={`
        px-4 py-3 rounded-xl min-w-[200px] max-w-[280px] transition-all duration-300 ease-out
        ${difficultyStyle} ${completedStyle}
        ${isHovered ? 'shadow-large -translate-y-2 scale-102' : 'shadow-soft'}
        cursor-pointer transform-gpu backdrop-blur-sm relative group
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Handle type="target" position={Position.Top} />
      
      {/* Category badge với enhanced styling */}
      {nodeData.category && (
        <div className="flex items-center gap-2 mb-3 text-xs font-medium opacity-90">
          <span className="text-lg animate-bounce-gentle">{categoryIcon}</span>
          <span className="px-2 py-1 rounded-md bg-white/20 backdrop-blur-sm">
            {categoryName}
          </span>
        </div>
      )}

      {/* Node content với enhanced typography */}
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
      {nodeData.estimatedTime && (
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/10 backdrop-blur-sm text-xs opacity-80">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">{nodeData.estimatedTime}</span>
        </div>
      )}

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
      {nodeData.category && (
        <div className="flex items-center gap-1 mb-2 text-xs opacity-75">
          <span className="text-base">{categoryIcon}</span>
          <span className="font-medium">{categoryName}</span>
        </div>
      )}
      
      {/* Node content */}
      <h3>{nodeData.label}</h3>
      {/* ... */}
    </div>
  );
}
```

**Styling Functions:**

```typescript
function getCategoryStyle(category?: string): string {
  switch (category) {
    case 'role':
      return 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300 text-blue-900';
    case 'skill':
      return 'bg-gradient-to-br from-green-50 to-green-100 border-green-300 text-green-900';
    default:
      return '';
  }
}
```

### RoadmapVisualization Component

Component chính đã tích hợp navigation logic:

```typescript
import { useRouter } from 'next/navigation';
import { 
  getNodeNavigationUrl, 
  canNavigate 
} from '@viztechstack/roadmap-visualization';

export function RoadmapVisualization({ graphData }: Props) {
  const router = useRouter();

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      const nodeData = node.data as unknown as NodeData;
      
      // Handle navigation based on node category
      if (canNavigate(nodeData)) {
        const navResult = getNodeNavigationUrl(nodeData);
        
        if (navResult.type !== 'none') {
          if (navResult.openInNewTab) {
            window.open(navResult.url, '_blank');
          } else {
            router.push(navResult.url);
          }
        }
      }
    },
    [router]
  );

  return (
    <ReactFlow
      nodes={nodes}
      onNodeClick={handleNodeClick}
      // ...
    />
  );
}
```

## Validation Rules

### Role Nodes
- **Bắt buộc**: Phải có `targetRoadmapId`
- **Format**: String không rỗng
- **Validation**: `validateNodeNavigation()` sẽ return error nếu thiếu

### Skill Nodes
- **Bắt buộc**: Phải có `targetArticleId`
- **Format**: String không rỗng
- **Validation**: `validateNodeNavigation()` sẽ return error nếu thiếu

**Chi tiết validation rules**: Xem [Validation Guide](.docs/roadmap-visualization/validation-guide.md) để biết thêm về:
- Node category validation
- Prerequisites validation
- Complete node validation
- Graph validation
- Error codes và handling

## Testing

### Unit Tests

```typescript
import { 
  getNodeNavigationUrl, 
  canNavigate,
  validateNodeNavigation 
} from '@viztechstack/roadmap-visualization';

describe('Navigation', () => {
  describe('getNodeNavigationUrl', () => {
    it('should return roadmap URL for role nodes', () => {
      const nodeData = {
        category: 'role',
        targetRoadmapId: 'test-roadmap',
        // ...
      };
      
      const result = getNodeNavigationUrl(nodeData);
      expect(result.url).toBe('/roadmaps/test-roadmap');
      expect(result.type).toBe('roadmap');
    });

    it('should return article URL for skill nodes', () => {
      const nodeData = {
        category: 'skill',
        targetArticleId: 'test-article',
        // ...
      };
      
      const result = getNodeNavigationUrl(nodeData);
      expect(result.url).toBe('/articles/test-article');
      expect(result.type).toBe('article');
    });
  });

  describe('canNavigate', () => {
    it('should return true for valid role node', () => {
      const nodeData = {
        category: 'role',
        targetRoadmapId: 'test',
        // ...
      };
      
      expect(canNavigate(nodeData)).toBe(true);
    });

    it('should return false for role node without targetRoadmapId', () => {
      const nodeData = {
        category: 'role',
        // ...
      };
      
      expect(canNavigate(nodeData)).toBe(false);
    });
  });
});
```

### NodeDetailsPanel Tests - MỚI ✨

```typescript
import { NodeDetailsPanel } from '@/components/roadmap-visualization/NodeDetailsPanel';

describe('NodeDetailsPanel', () => {
  const mockNodeData: NodeData = {
    label: 'Test Node',
    description: 'This is a test node description',
    level: 1,
    section: 'Test Section',
    estimatedTime: '2 hours',
    difficulty: 'intermediate',
    completed: false,
    category: 'skill',
    resources: [
      {
        title: 'Test Article',
        url: 'https://example.com/article',
        type: 'article',
      },
    ],
    prerequisites: ['node-1', 'node-2'],
  };

  describe('Basic Rendering', () => {
    it('should render node details correctly', () => {
      render(<NodeDetailsPanel nodeId="test" nodeData={mockNodeData} onClose={jest.fn()} />);

      expect(screen.getByText('Test Node')).toBeInTheDocument();
      expect(screen.getByText('This is a test node description')).toBeInTheDocument();
      expect(screen.getByText('Test Section')).toBeInTheDocument();
      expect(screen.getByText('2 hours')).toBeInTheDocument();
      expect(screen.getByText('Trung bình')).toBeInTheDocument();
    });

    it('should render resources section', () => {
      render(<NodeDetailsPanel nodeId="test" nodeData={mockNodeData} onClose={jest.fn()} />);

      expect(screen.getByText('Tài nguyên (1)')).toBeInTheDocument();
      expect(screen.getByText('Test Article')).toBeInTheDocument();
    });
  });

  describe('Interaction', () => {
    it('should call onClose when close button is clicked', () => {
      const onClose = jest.fn();
      render(<NodeDetailsPanel nodeId="test" nodeData={mockNodeData} onClose={onClose} />);

      const closeButton = screen.getByLabelText('Đóng panel chi tiết');
      fireEvent.click(closeButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onNavigate when navigation button is clicked', () => {
      const onNavigate = jest.fn();
      render(<NodeDetailsPanel nodeId="test" nodeData={mockNodeData} onClose={jest.fn()} onNavigate={onNavigate} />);

      const navigateButton = screen.getByText('Đọc bài viết');
      fireEvent.click(navigateButton);

      expect(onNavigate).toHaveBeenCalledWith('/articles/test-article', false);
    });
  });

  describe('Keyboard Navigation', () => {
    it('should close panel when Escape key is pressed', async () => {
      const onClose = jest.fn();
      render(<NodeDetailsPanel nodeId="test" nodeData={mockNodeData} onClose={onClose} />);

      fireEvent.keyDown(document, { key: 'Escape' });

      await waitFor(() => {
        expect(onClose).toHaveBeenCalledTimes(1);
      });
    });

    it('should focus close button on mount', async () => {
      render(<NodeDetailsPanel nodeId="test" nodeData={mockNodeData} onClose={jest.fn()} />);

      await waitFor(() => {
        const closeButton = screen.getByLabelText('Đóng panel chi tiết');
        expect(closeButton).toHaveFocus();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<NodeDetailsPanel nodeId="test" nodeData={mockNodeData} onClose={jest.fn()} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby', 'node-details-title');
      expect(dialog).toHaveAttribute('aria-describedby', 'node-details-description');
    });
  });
});
```

### Test Coverage Summary

**Tổng số tests:** 85 passing tests
- **CustomRoadmapNode**: 9 tests ✅
- **NodeDetailsPanel**: 21 tests ✅ (MỚI)
- **RoadmapVisualization**: 8 tests ✅
- **ViewToggle**: 19 tests ✅
- **VisualizationControls**: 28 tests ✅

**Coverage areas:**
- ✅ Component rendering và styling
- ✅ User interactions (click, hover, keyboard)
- ✅ State management (selection, highlighting)
- ✅ Navigation logic
- ✅ Accessibility features
- ✅ Error handling
- ✅ Edge cases và validation

## Troubleshooting

### Node không navigate khi click

**Nguyên nhân:**
1. Node thiếu `category` property
2. Role node thiếu `targetRoadmapId`
3. Skill node thiếu `targetArticleId`

**Giải pháp:**
```typescript
// Kiểm tra node data
console.log('Node data:', nodeData);
console.log('Can navigate:', canNavigate(nodeData));
console.log('Validation:', validateNodeNavigation(nodeData));
```

### Navigation đến wrong URL

**Nguyên nhân:**
- Target ID không đúng format
- URL routing không match

**Giải pháp:**
```typescript
// Debug navigation result
const navResult = getNodeNavigationUrl(nodeData);
console.log('Navigation result:', navResult);
```

## Best Practices

1. **Luôn validate node data** trước khi tạo nodes
2. **Sử dụng `canNavigate()`** để check trước khi navigate
3. **Handle navigation errors** gracefully
4. **Provide fallback** cho nodes không có navigation
5. **Test navigation logic** thoroughly

## Roadmap

### Đã hoàn thành ✅
- [x] Basic navigation logic
- [x] Role → Roadmap navigation
- [x] Skill → Article navigation
- [x] Validation functions
- [x] Helper utilities
- [x] Category-based styling
- [x] Category icons và display names
- [x] **Node click handlers với selection system** (Task 1.5.1) ✨
- [x] **NodeDetailsPanel component** ✨
- [x] **Connection highlighting system** ✨
- [x] **Keyboard navigation support** ✨
- [x] **Enhanced accessibility features** ✨

### Sắp tới 🚧
- [ ] Node metadata system (Task 1.5.2)
- [ ] Breadcrumb navigation
- [ ] Deep linking support
- [ ] Navigation history
- [ ] Back button handling

## Loading States và Error Handling

### Loading States

Khi navigate đến roadmap hoặc article, component hiển thị loading overlay:

```typescript
{isNavigating && (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Đang điều hướng...
            </p>
        </div>
    </div>
)}
```

**Đặc điểm:**
- Backdrop blur effect để tăng visibility
- Spinning loader animation
- Text "Đang điều hướng..." bằng tiếng Việt
- Chỉ hiển thị cho same-page navigation (không hiển thị khi mở tab mới)
- Z-index cao (z-50) để overlay lên trên tất cả elements

### Error Handling

Nếu navigation thất bại, hiển thị error notification:

```typescript
{navigationError && (
    <div className="absolute top-6 right-6 z-40 max-w-md">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 shadow-lg">
            <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">
                        {navigationError}
                    </p>
                </div>
                <button onClick={() => setNavigationError(null)} className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
        </div>
    </div>
)}
```

**Đặc điểm:**
- Red color scheme cho error state
- Error icon để visual clarity
- Dismissible với close button
- Vietnamese error messages
- Positioned ở top-right corner
- Auto-dismiss sau 5 giây (optional)

**Error Messages:**
- Role navigation failure: "Không thể điều hướng đến roadmap. Vui lòng thử lại."
- Skill navigation failure: "Không thể điều hướng đến bài viết. Vui lòng thử lại."

### Implementation trong RoadmapVisualization

```typescript
export function RoadmapVisualization({ graphData }: Props) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationError, setNavigationError] = useState<string | null>(null);

  const handleNodeClick = useCallback(
    async (_event: React.MouseEvent, node: Node) => {
      const nodeData = node.data as unknown as NodeData;
      
      if (canNavigate(nodeData)) {
        const navResult = getNodeNavigationUrl(nodeData);
        
        if (navResult.type !== 'none') {
          try {
            // Clear previous errors
            setNavigationError(null);
            
            if (navResult.openInNewTab) {
              // Open in new tab - no loading state
              window.open(navResult.url, '_blank');
            } else {
              // Set loading state for same-page navigation
              setIsNavigating(true);
              
              // Navigate using Next.js router
              await router.push(navResult.url);
              
              // Loading state will be cleared when component unmounts
            }
          } catch (error) {
            // Handle navigation errors
            console.error('Navigation error:', error);
            setNavigationError(
              `Không thể điều hướng đến ${navResult.type === 'roadmap' ? 'roadmap' : 'bài viết'}. Vui lòng thử lại.`
            );
            setIsNavigating(false);
          }
        }
      }
    },
    [router]
  );

  return (
    <div className="relative w-full h-full">
      {/* Loading overlay */}
      {isNavigating && <LoadingOverlay />}
      
      {/* Error notification */}
      {navigationError && (
        <ErrorNotification 
          message={navigationError}
          onDismiss={() => setNavigationError(null)}
        />
      )}
      
      {/* React Flow canvas */}
      <ReactFlow
        nodes={nodes}
        onNodeClick={handleNodeClick}
        // ...
      />
    </div>
  );
}
```

### Testing Loading States và Error Handling

```typescript
describe('Navigation Loading and Errors', () => {
  it('should show loading state during navigation', async () => {
    const { getByText } = render(<RoadmapVisualization graphData={mockData} />);
    
    // Click node to trigger navigation
    const node = screen.getByText('Frontend Developer');
    fireEvent.click(node);
    
    // Check loading state appears
    expect(getByText('Đang điều hướng...')).toBeInTheDocument();
  });

  it('should show error notification on navigation failure', async () => {
    // Mock router.push to throw error
    const mockRouter = {
      push: jest.fn().mockRejectedValue(new Error('Navigation failed')),
    };
    
    const { getByText } = render(
      <RoadmapVisualization graphData={mockData} />
    );
    
    // Click node to trigger navigation
    const node = screen.getByText('Frontend Developer');
    fireEvent.click(node);
    
    // Wait for error to appear
    await waitFor(() => {
      expect(getByText(/Không thể điều hướng/)).toBeInTheDocument();
    });
  });

  it('should dismiss error notification when close button clicked', async () => {
    const { getByText, queryByText, getByRole } = render(
      <RoadmapVisualization graphData={mockData} />
    );
    
    // Trigger error
    // ... (same as above)
    
    // Click close button
    const closeButton = getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    
    // Error should be dismissed
    expect(queryByText(/Không thể điều hướng/)).not.toBeInTheDocument();
  });
});
```

## React Flow Integration - HOÀN THÀNH ✅

### Tích Hợp React Flow Canvas

React Flow đã được cài đặt và cấu hình hoàn chỉnh cho roadmap visualization system.

**Trạng thái:** ✅ HOÀN THÀNH (Task 1.2.1: Setup React Flow dependencies và configuration)

**Đặc điểm đã triển khai:**
- ✅ React Flow 12.0.0 với TypeScript support
- ✅ Centralized configuration theo VizTechStack design system
- ✅ Enhanced type definitions cho type safety
- ✅ Custom styling integration với Tailwind CSS 4
- ✅ Performance optimizations cho large graphs
- ✅ Accessibility features với ARIA support
- ✅ Comprehensive testing và documentation

### ViewToggle Integration - HOÀN THÀNH ✅

### Tích Hợp với ViewToggle Component

ViewToggle component đã được tích hợp hoàn chỉnh vào RoadmapDetail page để cho phép chuyển đổi giữa content view và visualization view.

**Trạng thái:** ✅ HOÀN THÀNH (Tasks 1.1.1, 1.1.2)

**Đặc điểm đã triển khai:**
- ✅ Toggle button group với styling hiện đại (rounded-xl)
- ✅ Icons cho content (📄) và visualization (🗺️) modes
- ✅ State persistence trong localStorage và URL parameters
- ✅ Loading states với spinner animation
- ✅ Smooth transitions giữa các views
- ✅ Full accessibility support với ARIA labels
- ✅ Comprehensive testing (39 passing tests)
- ✅ TypeScript strict mode compliance
- ✅ Error handling và input validation

**Implementation:**
```typescript
import { ViewToggle } from '@/components/roadmap-visualization/ViewToggle';
import { useViewToggle } from '@/hooks/use-view-toggle';

function RoadmapDetailPage({ slug }: { slug: string }) {
  const { currentView, setView, isLoading } = useViewToggle({
    defaultView: 'content',
    persist: true,
    syncWithUrl: true,
  });

  const handleViewChange = async (view: typeof currentView) => {
    if (view === 'visualization') {
      setIsLoading(true);
      // Load visualization data
      setTimeout(() => setIsLoading(false), 1000);
    }
    setView(view);
  };

  return (
    <div>
      <ViewToggle
        currentView={currentView}
        onViewChange={handleViewChange}
        isLoading={isLoading}
      />
      
      {currentView === 'content' ? (
        <RoadmapContent content={roadmap.content} />
      ) : (
        <RoadmapVisualization roadmap={roadmap} />
      )}
    </div>
  );
}
```

**State Management đã triển khai:**
- **localStorage**: Lưu user preference với key `roadmap-view-mode`
- **URL Sync**: Sync với URL parameter `view` cho deep linking
- **Loading States**: Hiển thị spinner khi switching to visualization
- **Error Handling**: Fallback to content view nếu visualization fails
- **Input Validation**: Validate URL parameters và localStorage values

**Styling đã áp dụng:**
- Primary colors (primary-500) cho active state
- Neutral colors cho inactive state
- Shadow effects (shadow-soft, shadow-medium)
- Smooth transitions (duration-300)
- Scale transform (scale-105) cho active buttons

**Accessibility đã triển khai:**
- ARIA labels: `aria-label` và `aria-pressed` attributes
- Keyboard navigation: Full keyboard support
- Screen reader support: Semantic markup
- Focus indicators: Proper focus management

**Testing Coverage:**
- ✅ 19 passing tests cho ViewToggle component
- ✅ 20 passing tests cho useViewToggle hook
- ✅ Coverage cho all functionality, accessibility, và error handling
- ✅ Integration tests với RoadmapDetail component

**Variants có sẵn:**
- **ViewToggle**: Standard desktop version
- **CompactViewToggle**: Mobile/constrained spaces
- **FloatingViewToggle**: Overlay positioning

---

**Cập nhật lần cuối:** 2026-03-11  
**Phiên bản:** 2.2.0  
**Giai đoạn:** 1.2.2 - RoadmapVisualization Container COMPLETED ✅
