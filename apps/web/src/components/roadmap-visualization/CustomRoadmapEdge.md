# CustomRoadmapEdge Component

## Tổng Quan

CustomRoadmapEdge là component tùy chỉnh cho việc hiển thị các kết nối (edges) trong roadmap visualization. Component này tích hợp với React Flow và VizTechStack design system để cung cấp trải nghiệm trực quan phong phú với các loại relationship khác nhau.

## Tính Năng

### 🎨 Styling Theo Relationship Type

- **Prerequisite** (`prerequisite`): Màu đỏ với icon 🔒, stroke width 3px
- **Progression** (`leads-to`): Màu cam chính với icon ➡️, stroke width 2.5px  
- **Related** (`related-to`): Màu xanh với icon 🔗, stroke dashed
- **Part-of** (`part-of`): Màu xanh lá với icon 📦, stroke dashed nhỏ
- **Default**: Màu xám với icon ↔️

### 🏷️ Edge Labels và Tooltips

- Labels hiển thị khi có `edgeData.label`
- Tooltips tương tác với thông tin chi tiết
- Strength indicators (●●●, ●●○, ●○○, ○○○)
- Bidirectional indicators
- Development mode debugging info

### 🎯 Interactive States

- **Hover**: Tăng stroke width, hiển thị tooltip
- **Selected**: Màu warning với drop shadow
- **Smooth animations**: Transition duration 200-300ms

### 🔧 SVG Markers

Component tự động tạo các SVG markers cho từng loại relationship:
- `#prerequisite-arrow`: Mũi tên đỏ solid
- `#progression-arrow`: Mũi tên cam solid  
- `#related-arrow`: Vòng tròn xanh
- `#part-of-arrow`: Hình vuông xanh lá
- `#default-arrow`: Mũi tên xám nhỏ

## Sử Dụng

### Basic Usage

```tsx
import { CustomRoadmapEdge } from '@/components/roadmap-visualization';

// Trong React Flow
const edgeTypes = {
  dependency: CustomRoadmapEdge,
  progression: CustomRoadmapEdge,
  related: CustomRoadmapEdge,
  optional: CustomRoadmapEdge,
};

<ReactFlow
  edges={edges}
  edgeTypes={edgeTypes}
  // ...other props
/>
```

### Edge Data Structure

```tsx
interface EdgeData {
  label?: string;                    // Nhãn hiển thị trên edge
  relationship: RelationshipType;    // Loại quan hệ
  strength?: number;                 // Độ mạnh (0-1)
  bidirectional?: boolean;           // Kết nối hai chiều
}

type RelationshipType = 'prerequisite' | 'leads-to' | 'related-to' | 'part-of';
```

### Ví Dụ Edge Data

```tsx
// Prerequisite edge với label và strength
const prerequisiteEdge = {
  id: 'edge-1',
  source: 'html-basics',
  target: 'css-basics',
  type: 'dependency',
  data: {
    label: 'Cần học trước',
    relationship: 'prerequisite',
    strength: 0.9,
  }
};

// Related edge bidirectional
const relatedEdge = {
  id: 'edge-2', 
  source: 'react',
  target: 'vue',
  type: 'related',
  data: {
    label: 'Tương tự',
    relationship: 'related-to',
    bidirectional: true,
    strength: 0.6,
  }
};
```

## Styling Classes

### Relationship Styles

```css
/* Prerequisite - Đỏ, quan trọng */
.prerequisite-edge {
  stroke: #dc2626;
  stroke-width: 3;
  animation: pulse;
}

/* Progression - Cam chính */
.progression-edge {
  stroke: #ed7c47;
  stroke-width: 2.5;
}

/* Related - Xanh, dashed */
.related-edge {
  stroke: #0ea5e9;
  stroke-width: 2;
  stroke-dasharray: 8,4;
  opacity: 0.75;
}

/* Part-of - Xanh lá, dashed nhỏ */
.part-of-edge {
  stroke: #22c55e;
  stroke-width: 2;
  stroke-dasharray: 4,2;
  opacity: 0.6;
}
```

### Interactive States

```css
/* Hover state */
.edge:hover {
  stroke-width: +0.5px;
  filter: drop-shadow(0 0 6px rgba(0, 0, 0, 0.2));
}

/* Selected state */
.edge.selected {
  stroke: #f59e0b;
  stroke-width: +1px;
  filter: drop-shadow(0 0 8px rgba(245, 158, 11, 0.4));
}
```

## Props Interface

```tsx
interface CustomRoadmapEdgeProps extends EdgeProps {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: Position;
  targetPosition: Position;
  data?: EdgeData;
  selected?: boolean;
  style?: React.CSSProperties;
}
```

## Accessibility

### Keyboard Navigation
- Edge paths có `cursor-pointer` cho visual feedback
- Tooltips có proper ARIA labels
- Screen reader compatible

### Color Accessibility  
- High contrast ratios cho tất cả relationship types
- Không dựa hoàn toàn vào màu sắc (có icons và patterns)
- Support cho color blind users

### Development Mode
- Hiển thị edge ID trong tooltips khi `NODE_ENV === 'development'`
- Debug information cho troubleshooting

## Performance

### Optimizations
- Memoized relationship style calculations
- Efficient hover state management
- Minimal re-renders với React.memo patterns
- SVG marker reuse

### Best Practices
- Limit số lượng edges với labels (< 50 recommended)
- Use strength indicators thay vì complex styling
- Prefer simple relationship types

## Testing

### Unit Tests
```bash
pnpm test CustomRoadmapEdge
```

### Test Coverage
- ✅ Basic rendering
- ✅ Relationship type styling  
- ✅ Strength indicators
- ✅ Interactive behavior
- ✅ Selected states
- ✅ Accessibility
- ✅ Edge cases

### Manual Testing
1. Hover over edges để test tooltips
2. Click edges để test selection
3. Test với different relationship types
4. Verify SVG markers render correctly
5. Test responsive behavior

## Troubleshooting

### Common Issues

**Labels không hiển thị:**
- Kiểm tra `edgeData.label` có tồn tại
- Verify EdgeLabelRenderer context
- Check React Flow setup

**Tooltips không hoạt động:**
- Ensure proper mouse event handlers
- Check z-index conflicts
- Verify pointer-events settings

**SVG markers bị missing:**
- Check defs element rendering
- Verify marker IDs unique
- Ensure proper marker references

**Performance issues:**
- Limit số lượng edges với complex styling
- Use React.memo cho edge components
- Optimize hover state calculations

### Debug Mode

Enable development mode để xem additional debugging info:

```tsx
// Set NODE_ENV=development
process.env.NODE_ENV = 'development';

// Tooltips sẽ hiển thị edge ID và debug info
```

## Roadmap

### Planned Features
- [ ] Animated edge flows
- [ ] Custom edge shapes
- [ ] Edge grouping/bundling
- [ ] Advanced tooltip customization
- [ ] Edge editing capabilities

### Performance Improvements
- [ ] Edge virtualization cho large graphs
- [ ] WebGL rendering option
- [ ] Edge clustering algorithms
- [ ] Lazy loading cho complex edges

## Contributing

Khi contribute vào CustomRoadmapEdge:

1. Follow VizTechStack design system
2. Maintain accessibility standards
3. Add comprehensive tests
4. Update documentation
5. Consider performance impact

### Code Style
- Use TypeScript strict mode
- Follow existing naming conventions
- Add JSDoc comments cho public APIs
- Maintain consistent styling patterns