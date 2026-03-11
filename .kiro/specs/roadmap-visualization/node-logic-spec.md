# Spec: Logic Node Roadmap Visualization - Giai Đoạn 3

## Tổng Quan

Đây là specification chi tiết về logic node trong hệ thống roadmap visualization, được thiết kế cho giai đoạn 3 của dự án. Node là thành phần cốt lõi không thể thiếu trong việc tạo và tương tác với roadmap trực quan.

## Định Nghĩa Node

### Node Là Gì?
Node là đơn vị cơ bản trong roadmap visualization, đại diện cho:
- **Vai trò (Role)**: Một roadmap con hoàn chỉnh
- **Kỹ năng (Skill)**: Một chủ đề/kỹ năng cụ thể

### Đặc Điểm Node
- **Bắt buộc**: Node là điều kiện tiên quyết khi tạo roadmap
- **Phân loại**: Mỗi node có category xác định hành vi
- **Tương tác**: Click node sẽ trigger hành động khác nhau tùy loại

## Phân Loại Node

### 1. Node Role (category: "role")

**Đặc điểm:**
- Đại diện cho một vai trò/chức danh trong ngành
- Chứa một roadmap con hoàn chỉnh
- Có thể có nhiều skills con bên trong

**Hành vi khi click:**
- Mở detail roadmap khác
- Navigation đến trang roadmap con
- Hiển thị cấu trúc phân cấp

**Ví dụ:**
- "Frontend Developer"
- "Backend Developer" 
- "DevOps Engineer"
- "Data Scientist"

### 2. Node Skill (category: "skill")

**Đặc điểm:**
- Đại diện cho một kỹ năng/chủ đề cụ thể
- Liên kết đến nội dung chi tiết (article)
- Là node lá trong cây roadmap

**Hành vi khi click:**
- Redirect đến article page
- Hiển thị nội dung học tập chi tiết
- Có thể track progress học tập

**Ví dụ:**
- "React Hooks"
- "Node.js APIs"
- "Docker Containers"
- "Machine Learning Algorithms"

## Data Model

### Node Interface

```typescript
interface RoadmapNode {
  id: string;
  title: string;
  description?: string;
  category: 'role' | 'skill';
  
  // Metadata
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime?: string;
  prerequisites?: string[];
  
  // Navigation
  targetRoadmapId?: string; // Cho role nodes
  targetArticleId?: string; // Cho skill nodes
  
  // Visualization
  position: { x: number; y: number };
  style?: NodeStyle;
  
  // Relationships
  parentId?: string;
  childrenIds?: string[];
}
```

### Node Category Enum

```typescript
enum NodeCategory {
  ROLE = 'role',
  SKILL = 'skill'
}
```

## Tương Tác Node

### Click Behavior Logic

```typescript
const handleNodeClick = (node: RoadmapNode) => {
  switch (node.category) {
    case 'role':
      // Navigate to sub-roadmap
      if (node.targetRoadmapId) {
        router.push(`/roadmaps/${node.targetRoadmapId}`);
      }
      break;
      
    case 'skill':
      // Navigate to article page
      if (node.targetArticleId) {
        router.push(`/articles/${node.targetArticleId}`);
      }
      break;
      
    default:
      console.warn('Unknown node category:', node.category);
  }
};
```

### Visual Differentiation

```typescript
const getNodeStyle = (category: NodeCategory) => {
  switch (category) {
    case NodeCategory.ROLE:
      return {
        backgroundColor: '#3B82F6', // Blue for roles
        borderColor: '#1E40AF',
        icon: '👤',
        shape: 'rounded-rectangle'
      };
      
    case NodeCategory.SKILL:
      return {
        backgroundColor: '#10B981', // Green for skills
        borderColor: '#047857',
        icon: '🎯',
        shape: 'circle'
      };
  }
};
```

## Drag & Drop Sidebar

### Sidebar Node Library

**Cấu trúc:**
```
📁 Node Library Sidebar
├── 🔍 Search/Filter
├── 📂 Roles
│   ├── 👤 Frontend Developer
│   ├── 👤 Backend Developer
│   ├── 👤 Full Stack Developer
│   └── 👤 DevOps Engineer
└── 📂 Skills
    ├── 🎯 JavaScript
    ├── 🎯 React
    ├── 🎯 Node.js
    └── 🎯 Docker
```

### Drag & Drop Functionality

```typescript
interface DragDropNode {
  id: string;
  title: string;
  category: 'role' | 'skill';
  isTemplate: boolean; // Từ sidebar
}

const handleDragStart = (node: DragDropNode) => {
  // Set drag data
  setDraggedNode(node);
};

const handleDrop = (position: { x: number; y: number }) => {
  if (draggedNode) {
    // Create new node instance
    const newNode: RoadmapNode = {
      ...draggedNode,
      id: generateUniqueId(),
      position,
      isTemplate: false
    };
    
    // Add to roadmap
    addNodeToRoadmap(newNode);
  }
};
```

## Workflow Tạo Roadmap

### Bước 1: Khởi Tạo
1. User tạo roadmap mới
2. **Bắt buộc**: Phải có ít nhất 1 node
3. Chọn node từ sidebar hoặc tạo mới

### Bước 2: Thêm Nodes
1. Kéo node từ sidebar vào canvas
2. Node được tự động phân loại theo category
3. Thiết lập properties và relationships

### Bước 3: Cấu Hình
1. **Role nodes**: Liên kết với roadmap con
2. **Skill nodes**: Liên kết với articles
3. Thiết lập dependencies và prerequisites

### Bước 4: Visualization
1. Auto-layout nodes theo algorithm
2. Hiển thị connections và relationships
3. Enable tương tác click và navigation

## Validation Rules

### Node Creation Rules
1. **Bắt buộc có node**: Roadmap không thể tồn tại mà không có node
2. **Category validation**: Mỗi node phải có category hợp lệ
3. **Target validation**: 
   - Role nodes phải có `targetRoadmapId`
   - Skill nodes phải có `targetArticleId`

### Relationship Rules
1. **Hierarchy**: Role nodes có thể chứa skill nodes
2. **Dependencies**: Skill nodes có thể depend on nhau
3. **Circular prevention**: Không cho phép circular dependencies

## UI/UX Specifications

### Node Appearance

**Role Node:**
```css
.node-role {
  background: linear-gradient(135deg, #3B82F6, #1E40AF);
  border: 2px solid #1E40AF;
  border-radius: 12px;
  min-width: 200px;
  min-height: 80px;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.node-role::before {
  content: "👤";
  font-size: 24px;
}
```

**Skill Node:**
```css
.node-skill {
  background: linear-gradient(135deg, #10B981, #047857);
  border: 2px solid #047857;
  border-radius: 50%;
  width: 120px;
  height: 120px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.node-skill::before {
  content: "🎯";
  font-size: 20px;
}
```

### Sidebar Design

```css
.node-sidebar {
  width: 300px;
  height: 100vh;
  background: #F8FAFC;
  border-right: 1px solid #E2E8F0;
  overflow-y: auto;
}

.node-category {
  padding: 16px;
  border-bottom: 1px solid #E2E8F0;
}

.draggable-node {
  padding: 12px;
  margin: 8px 0;
  background: white;
  border-radius: 8px;
  cursor: grab;
  transition: all 0.2s;
}

.draggable-node:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
```

## Implementation Phases

### Phase 3.1: Core Node System
- [ ] Implement basic node data model
- [ ] Create node rendering components
- [ ] Add click behavior logic
- [ ] Implement category-based styling

### Phase 3.2: Drag & Drop
- [ ] Build sidebar node library
- [ ] Implement drag & drop functionality
- [ ] Add node positioning system
- [ ] Create validation rules

### Phase 3.3: Navigation Integration
- [ ] Implement role → roadmap navigation
- [ ] Implement skill → article navigation
- [ ] Add breadcrumb navigation
- [ ] Handle deep linking

### Phase 3.4: Advanced Features
- [ ] Add node search and filtering
- [ ] Implement node templates
- [ ] Add bulk operations
- [ ] Create node analytics

## Testing Strategy

### Unit Tests
- Node creation and validation
- Category-based behavior
- Click event handling
- Drag & drop functionality

### Integration Tests
- Navigation between roadmaps
- Article page integration
- Sidebar interaction
- Canvas positioning

### E2E Tests
- Complete roadmap creation flow
- Node interaction scenarios
- Cross-roadmap navigation
- Performance with large node counts

## Performance Considerations

### Optimization Strategies
1. **Virtual scrolling** cho sidebar với nhiều nodes
2. **Lazy loading** cho node content
3. **Memoization** cho node rendering
4. **Debounced positioning** khi drag & drop

### Memory Management
1. **Node pooling** để tái sử dụng instances
2. **Cleanup** khi navigate giữa roadmaps
3. **Efficient updates** chỉ re-render nodes thay đổi

## Security & Validation

### Input Validation
- Sanitize node titles và descriptions
- Validate target IDs existence
- Prevent malicious node injection

### Access Control
- Check permissions trước khi navigate
- Validate user access to target roadmaps/articles
- Audit node creation và modifications

---

**Ghi chú**: Spec này sẽ được implement trong giai đoạn 3, sau khi hoàn thành visualization cơ bản và UI/UX system.