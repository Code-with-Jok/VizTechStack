# EdgeDetailsPanel Component

## Tổng Quan

EdgeDetailsPanel là component hiển thị chi tiết về mối quan hệ giữa các nodes trong roadmap visualization. Component này được kích hoạt khi người dùng click vào một edge và hiển thị thông tin toàn diện về kết nối đó.

## Tính Năng Chính

### 1. Hiển Thị Thông Tin Relationship
- **Loại mối quan hệ**: prerequisite, leads-to, related-to, part-of
- **Mô tả chi tiết**: Giải thích ý nghĩa của mối quan hệ
- **Lý do kết nối**: Tại sao hai nodes được kết nối với nhau

### 2. Thông Tin Nodes Được Kết Nối
- **Source Node**: Node nguồn với thông tin chi tiết
- **Target Node**: Node đích với thông tin chi tiết
- **Difficulty badges**: Hiển thị mức độ khó
- **Estimated time**: Thời gian ước tính cho mỗi node

### 3. Độ Mạnh Kết Nối
- **Strength indicator**: Thanh progress hiển thị độ mạnh (0-100%)
- **Level description**: Mô tả mức độ (Rất mạnh, Trung bình, Yếu)
- **Contextual explanation**: Giải thích ý nghĩa của độ mạnh

### 4. Navigation Controls
- **Đi đến nguồn**: Navigate đến source node
- **Đi đến đích**: Navigate đến target node
- **Close panel**: Đóng panel và clear selection

## Props Interface

```typescript
interface EdgeDetailsPanelProps {
    relationshipDetails: EdgeRelationshipDetails;
    onClose: () => void;
    onNavigateToNode: (nodeId: string) => void;
    className?: string;
}
```

## Styling và Design

### Color System
- **Prerequisite**: Error colors (đỏ) - quan trọng
- **Leads-to**: Primary colors (cam) - tiến trình
- **Related-to**: Secondary colors (xanh) - liên quan
- **Part-of**: Success colors (xanh lá) - phân cấp

### Visual Elements
- **Glass morphism**: Backdrop blur với transparency
- **Animated entrance**: Slide-down animation
- **Interactive buttons**: Hover states và transitions
- **Progress bars**: Visual strength indicators

## Accessibility

### Keyboard Support
- **Tab navigation**: Điều hướng qua các buttons
- **Enter/Space**: Kích hoạt navigation buttons
- **Escape**: Đóng panel

### Screen Reader Support
- **ARIA labels**: Mô tả rõ ràng cho screen readers
- **Semantic markup**: Proper heading hierarchy
- **Focus management**: Focus trapping trong panel

## Integration

### Với useEdgeInteraction Hook
```typescript
const edgeInteraction = useEdgeInteraction({
    nodes: graphData.nodes,
    edges: graphData.edges,
});

// Hiển thị panel khi có relationship details
{edgeInteraction.relationshipDetails && (
    <EdgeDetailsPanel
        relationshipDetails={edgeInteraction.relationshipDetails}
        onClose={() => edgeInteraction.clearSelection()}
        onNavigateToNode={handleNodeNavigation}
    />
)}
```

### Với RoadmapVisualization
- Tự động hiển thị khi edge được click
- Tích hợp với node selection system
- Responsive positioning trên các screen sizes

## Performance

### Optimizations
- **Memoized calculations**: Tránh re-render không cần thiết
- **Lazy loading**: Chỉ render khi cần thiết
- **Efficient updates**: Minimal DOM manipulations

### Memory Management
- **Cleanup on unmount**: Clear event listeners
- **Optimized re-renders**: React.memo nếu cần
- **Efficient state updates**: Batch updates khi có thể