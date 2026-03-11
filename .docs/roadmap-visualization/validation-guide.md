# Hướng Dẫn Validation trong Roadmap Visualization

## Tổng Quan

Tài liệu này mô tả các validation rules và constraints cho nodes trong roadmap visualization system. Validation đảm bảo data integrity và prevent errors trong quá trình tạo và hiển thị roadmaps.

## Validation Rules

### 1. Node Category Validation

#### Role Nodes
**Bắt buộc:**
- Phải có `targetRoadmapId`
- `targetRoadmapId` phải là string không rỗng

**Error Codes:**
- `MISSING_TARGET_ROADMAP`: Thiếu targetRoadmapId
- `INVALID_TARGET_ROADMAP`: targetRoadmapId không hợp lệ

**Example:**
```typescript
// ✅ Valid
const roleNode = {
  category: 'role',
  targetRoadmapId: 'frontend-developer',
  // ...
};

// ❌ Invalid - Missing targetRoadmapId
const invalidRole = {
  category: 'role',
  // Missing targetRoadmapId
};

// ❌ Invalid - Empty targetRoadmapId
const invalidRole2 = {
  category: 'role',
  targetRoadmapId: '',
};
```

#### Skill Nodes
**Bắt buộc:**
- Phải có `targetArticleId`
- `targetArticleId` phải là string không rỗng

**Error Codes:**
- `MISSING_TARGET_ARTICLE`: Thiếu targetArticleId
- `INVALID_TARGET_ARTICLE`: targetArticleId không hợp lệ

**Example:**
```typescript
// ✅ Valid
const skillNode = {
  category: 'skill',
  targetArticleId: 'react-hooks-guide',
  // ...
};

// ❌ Invalid - Missing targetArticleId
const invalidSkill = {
  category: 'skill',
  // Missing targetArticleId
};
```

### 2. Node Label Validation

**Rules:**
- Label không được rỗng
- Label phải có ít nhất 1 ký tự sau khi trim

**Error Code:** `EMPTY_LABEL`

**Example:**
```typescript
// ✅ Valid
const validNode = {
  label: 'React Fundamentals',
  // ...
};

// ❌ Invalid - Empty label
const invalidNode = {
  label: '',
  // ...
};

// ❌ Invalid - Whitespace only
const invalidNode2 = {
  label: '   ',
  // ...
};
```

### 3. Prerequisites Validation

**Rules:**
- Tất cả prerequisite IDs phải tồn tại trong graph
- Không được có duplicate IDs
- Prerequisites không được tạo circular dependencies

**Error Codes:**
- `INVALID_PREREQUISITE`: Prerequisite node không tồn tại
- `DUPLICATE_PREREQUISITES`: Prerequisites chứa ID trùng lặp

**Example:**
```typescript
// ✅ Valid
const nodeWithPrereqs = {
  id: 'node-3',
  prerequisites: ['node-1', 'node-2'],
  // ...
};

// ❌ Invalid - Non-existent prerequisite
const invalidNode = {
  id: 'node-3',
  prerequisites: ['node-1', 'non-existent-node'],
  // ...
};

// ❌ Invalid - Duplicate prerequisites
const invalidNode2 = {
  id: 'node-3',
  prerequisites: ['node-1', 'node-1'],
  // ...
};
```

### 4. Estimated Time Format Validation

**Rules:**
- Format: `{number}(-{number})? {unit}`
- Valid units: `week(s)`, `month(s)`, `day(s)`, `hour(s)`
- Case insensitive

**Error Code:** `INVALID_TIME_FORMAT`

**Valid Examples:**
```typescript
'2 weeks'
'2-4 weeks'
'3 months'
'1-2 months'
'5 days'
'8 hours'
```

**Invalid Examples:**
```typescript
'2'              // Missing unit
'weeks'          // Missing number
'2 wks'          // Invalid unit
'2 to 4 weeks'   // Wrong format
```

### 5. Minimum Nodes Validation

**Rules:**
- Roadmap phải có ít nhất 1 node
- Empty roadmaps không được phép

**Error Code:** `NO_NODES`

**Example:**
```typescript
// ✅ Valid
const validGraph = {
  nodes: [{ id: 'node-1', /* ... */ }],
  edges: [],
  // ...
};

// ❌ Invalid - No nodes
const invalidGraph = {
  nodes: [],
  edges: [],
  // ...
};
```

## API Reference

### Validation Functions

#### `validateNodeCategory(nodeData: NodeData): ValidationResult`

Validate node category và navigation targets.

**Returns:**
```typescript
interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

interface ValidationError {
  field: string;
  message: string;
  code: string;
}
```

**Example:**
```typescript
import { validateNodeCategory } from '@viztechstack/roadmap-visualization';

const result = validateNodeCategory(nodeData);
if (!result.valid) {
  console.error('Validation errors:', result.errors);
}
```

#### `validateNodePrerequisites(nodeData: NodeData, allNodeIds: Set<string>): ValidationResult`

Validate node prerequisites.

**Parameters:**
- `nodeData`: Node data to validate
- `allNodeIds`: Set of all node IDs in the graph

**Example:**
```typescript
import { validateNodePrerequisites } from '@viztechstack/roadmap-visualization';

const allNodeIds = new Set(['node-1', 'node-2', 'node-3']);
const result = validateNodePrerequisites(nodeData, allNodeIds);
```

#### `validateNodeComplete(node: RoadmapNode, allNodeIds?: Set<string>): ValidationResult`

Validate complete node với tất cả rules.

**Example:**
```typescript
import { validateNodeComplete } from '@viztechstack/roadmap-visualization';

const allNodeIds = new Set(graphData.nodes.map(n => n.id));
const result = validateNodeComplete(node, allNodeIds);

if (!result.valid) {
  result.errors.forEach(error => {
    console.error(`${error.field}: ${error.message} (${error.code})`);
  });
}
```

#### `validateMinimumNodes(graphData: GraphData): ValidationResult`

Validate roadmap có ít nhất 1 node.

**Example:**
```typescript
import { validateMinimumNodes } from '@viztechstack/roadmap-visualization';

const result = validateMinimumNodes(graphData);
if (!result.valid) {
  console.error('Roadmap must have at least one node');
}
```

#### `validateAllNodes(graphData: GraphData): ValidationResult`

Validate tất cả nodes trong graph.

**Example:**
```typescript
import { validateAllNodes } from '@viztechstack/roadmap-visualization';

const result = validateAllNodes(graphData);
if (!result.valid) {
  console.error('Graph validation failed:');
  result.errors.forEach(error => {
    console.error(`  ${error.field}: ${error.message}`);
  });
}
```

## Usage Examples

### Validating Before Creating Node

```typescript
import { 
  validateNodeCategory,
  validateNodeComplete 
} from '@viztechstack/roadmap-visualization';

function createNode(nodeData: NodeData): RoadmapNode | null {
  // Validate category first
  const categoryResult = validateNodeCategory(nodeData);
  if (!categoryResult.valid) {
    console.error('Category validation failed:', categoryResult.errors);
    return null;
  }

  // Create node
  const node: RoadmapNode = {
    id: generateId(),
    type: 'skill',
    position: { x: 0, y: 0 },
    data: nodeData,
  };

  // Validate complete node
  const completeResult = validateNodeComplete(node);
  if (!completeResult.valid) {
    console.error('Node validation failed:', completeResult.errors);
    return null;
  }

  return node;
}
```

### Validating Entire Graph

```typescript
import { 
  validateMinimumNodes,
  validateAllNodes,
  validateGraphStructure 
} from '@viztechstack/roadmap-visualization';

function validateGraph(graphData: GraphData): boolean {
  // Check minimum nodes
  const minNodesResult = validateMinimumNodes(graphData);
  if (!minNodesResult.valid) {
    console.error('Minimum nodes validation failed');
    return false;
  }

  // Validate all nodes
  const allNodesResult = validateAllNodes(graphData);
  if (!allNodesResult.valid) {
    console.error('Node validation failed:', allNodesResult.errors);
    return false;
  }

  // Validate graph structure
  if (!validateGraphStructure(graphData)) {
    console.error('Graph structure validation failed');
    return false;
  }

  return true;
}
```

### Form Validation

```typescript
import { validateNodeCategory } from '@viztechstack/roadmap-visualization';

function NodeForm({ onSubmit }: Props) {
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const handleSubmit = (formData: NodeData) => {
    // Validate
    const result = validateNodeCategory(formData);
    
    if (!result.valid) {
      setErrors(result.errors);
      return;
    }

    // Submit if valid
    setErrors([]);
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      
      {/* Display errors */}
      {errors.length > 0 && (
        <div className="error-messages">
          {errors.map((error, i) => (
            <div key={i} className="error">
              {error.message}
            </div>
          ))}
        </div>
      )}
    </form>
  );
}
```

## Error Handling

### Error Codes Reference

| Code | Description | Field |
|------|-------------|-------|
| `MISSING_TARGET_ROADMAP` | Role node thiếu targetRoadmapId | targetRoadmapId |
| `INVALID_TARGET_ROADMAP` | targetRoadmapId không hợp lệ | targetRoadmapId |
| `MISSING_TARGET_ARTICLE` | Skill node thiếu targetArticleId | targetArticleId |
| `INVALID_TARGET_ARTICLE` | targetArticleId không hợp lệ | targetArticleId |
| `INVALID_CATEGORY` | Category không hợp lệ | category |
| `INVALID_PREREQUISITE` | Prerequisite node không tồn tại | prerequisites |
| `DUPLICATE_PREREQUISITES` | Prerequisites trùng lặp | prerequisites |
| `EMPTY_LABEL` | Node label rỗng | label |
| `INVALID_TIME_FORMAT` | Estimated time format sai | estimatedTime |
| `NO_NODES` | Roadmap không có nodes | nodes |
| `INVALID_SCHEMA` | Node không đúng schema | node |

### Handling Validation Errors

```typescript
function handleValidationErrors(errors: ValidationError[]) {
  // Group errors by field
  const errorsByField = errors.reduce((acc, error) => {
    if (!acc[error.field]) {
      acc[error.field] = [];
    }
    acc[error.field].push(error);
    return acc;
  }, {} as Record<string, ValidationError[]>);

  // Display errors
  Object.entries(errorsByField).forEach(([field, fieldErrors]) => {
    console.error(`Errors in ${field}:`);
    fieldErrors.forEach(error => {
      console.error(`  - ${error.message} (${error.code})`);
    });
  });
}
```

## Best Practices

1. **Validate Early**: Validate node data ngay khi user input, không đợi đến khi submit
2. **Show Clear Errors**: Hiển thị error messages rõ ràng và actionable
3. **Validate Complete Graph**: Validate toàn bộ graph trước khi save hoặc publish
4. **Handle Edge Cases**: Test với empty strings, null values, và edge cases
5. **Use Type Safety**: Leverage TypeScript types để catch errors sớm

## Testing

### Unit Tests Example

```typescript
import { validateNodeCategory } from '@viztechstack/roadmap-visualization';

describe('validateNodeCategory', () => {
  it('should validate role node with targetRoadmapId', () => {
    const nodeData = {
      category: 'role',
      targetRoadmapId: 'test-roadmap',
      // ...
    };
    
    const result = validateNodeCategory(nodeData);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should fail role node without targetRoadmapId', () => {
    const nodeData = {
      category: 'role',
      // Missing targetRoadmapId
    };
    
    const result = validateNodeCategory(nodeData);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].code).toBe('MISSING_TARGET_ROADMAP');
  });

  it('should validate skill node with targetArticleId', () => {
    const nodeData = {
      category: 'skill',
      targetArticleId: 'test-article',
      // ...
    };
    
    const result = validateNodeCategory(nodeData);
    expect(result.valid).toBe(true);
  });
});
```

## Troubleshooting

### Common Issues

**Issue: "Role node phải có targetRoadmapId"**
- **Cause**: Role node thiếu targetRoadmapId property
- **Solution**: Thêm targetRoadmapId vào node data

**Issue: "Prerequisite node không tồn tại"**
- **Cause**: Prerequisites reference node ID không có trong graph
- **Solution**: Kiểm tra node IDs và đảm bảo tất cả prerequisites tồn tại

**Issue: "Estimated time format không hợp lệ"**
- **Cause**: Estimated time không đúng format
- **Solution**: Sử dụng format `{number}(-{number})? {unit}` (e.g., "2-4 weeks")

## 6. Edge Validation

### Edge Structure Validation

**Rules:**
- Edge phải có ID không rỗng và unique
- Source và target phải reference existing nodes
- Edge không được self-referencing (source !== target)
- Relationship strength (nếu có) phải trong khoảng [0, 1]

**Error Codes:**
- `EMPTY_EDGE_ID`: Edge ID rỗng
- `INVALID_EDGE_SOURCE`: Source node không tồn tại
- `INVALID_EDGE_TARGET`: Target node không tồn tại
- `SELF_REFERENCING_EDGE`: Edge tự reference chính nó
- `INVALID_STRENGTH`: Strength không trong khoảng [0, 1]
- `DUPLICATE_EDGE_IDS`: Edge IDs trùng lặp

**Example:**
```typescript
// ✅ Valid
const validEdge = {
  id: 'edge-1',
  source: 'node-a',
  target: 'node-b',
  type: 'progression',
  data: {
    relationship: 'leads-to',
    strength: 0.8,
  },
};

// ❌ Invalid - Self-referencing
const invalidEdge = {
  id: 'edge-1',
  source: 'node-a',
  target: 'node-a', // Same as source
};

// ❌ Invalid - Invalid strength
const invalidEdge2 = {
  id: 'edge-1',
  source: 'node-a',
  target: 'node-b',
  data: {
    strength: 1.5, // > 1
  },
};
```

### Circular Dependency Detection

**Rules:**
- Hierarchical layouts không được có circular dependencies
- Circular dependencies được phát hiện bằng DFS algorithm
- System sẽ báo cáo tất cả cycles tìm thấy

**Error Code:** `CIRCULAR_DEPENDENCY`

**Example:**
```typescript
// ❌ Invalid - Circular dependency
const nodes = [
  { id: 'A', /* ... */ },
  { id: 'B', /* ... */ },
  { id: 'C', /* ... */ },
];

const edges = [
  { id: 'e1', source: 'A', target: 'B' },
  { id: 'e2', source: 'B', target: 'C' },
  { id: 'e3', source: 'C', target: 'A' }, // Creates cycle: A → B → C → A
];

// ✅ Valid - Acyclic graph
const validEdges = [
  { id: 'e1', source: 'A', target: 'B' },
  { id: 'e2', source: 'B', target: 'C' },
  // No back edge
];
```

### Relationship Strength Calculation

**Calculation Factors:**

1. **Level Difference** (max 0.3 contribution)
   - Nodes ở levels gần nhau có relationship mạnh hơn
   - Formula: `0.3 - (levelDiff * 0.1)`

2. **Edge Type** (max 0.2 contribution)
   - `dependency`: 0.2 (mạnh nhất)
   - `progression`: 0.15
   - `related`: 0.1
   - `optional`: 0.05 (yếu nhất)

3. **Relationship Type** (max 0.15 contribution)
   - `prerequisite`: 0.15 (mạnh nhất)
   - `part-of`: 0.12
   - `leads-to`: 0.1
   - `related-to`: 0.08

4. **Bidirectional Bonus** (0.1 contribution)
   - Thêm 0.1 nếu relationship là bidirectional

**Example:**
```typescript
// Strong relationship (0.85)
const strongEdge = {
  source: nodeA, // level 0
  target: nodeB, // level 1
  type: 'dependency',
  data: {
    relationship: 'prerequisite',
    bidirectional: false,
  },
};

// Weak relationship (0.43)
const weakEdge = {
  source: nodeA, // level 0
  target: nodeC, // level 5
  type: 'optional',
  data: {
    relationship: 'related-to',
    bidirectional: false,
  },
};
```

## API Reference - Edge Validation

### Edge Validation Functions

#### `validateEdge(edge: RoadmapEdge, nodes: RoadmapNode[]): ValidationResult`

Validate một edge đơn lẻ.

**Parameters:**
- `edge`: Edge cần validate
- `nodes`: Array tất cả nodes trong graph

**Returns:** `ValidationResult` với errors nếu invalid

**Example:**
```typescript
import { validateEdge } from '@viztechstack/roadmap-visualization';

const result = validateEdge(edge, nodes);
if (!result.valid) {
  console.error('Edge validation errors:', result.errors);
}
```

#### `validateEdges(edges: RoadmapEdge[], nodes: RoadmapNode[]): ValidationResult`

Validate tất cả edges trong graph.

**Parameters:**
- `edges`: Array edges cần validate
- `nodes`: Array tất cả nodes trong graph

**Returns:** `ValidationResult` với tất cả errors

**Additional Checks:**
- Phát hiện duplicate edge IDs
- Validate từng edge riêng lẻ
- Collect tất cả validation errors

**Example:**
```typescript
import { validateEdges } from '@viztechstack/roadmap-visualization';

const result = validateEdges(graphData.edges, graphData.nodes);
if (!result.valid) {
  result.errors.forEach(error => console.error(error));
}
```

#### `detectCircularDependencies(nodes: RoadmapNode[], edges: RoadmapEdge[]): CircularDependencyResult`

Phát hiện circular dependencies trong graph.

**Parameters:**
- `nodes`: Array tất cả nodes
- `edges`: Array tất cả edges

**Returns:**
```typescript
interface CircularDependencyResult {
  hasCircularDependency: boolean;
  cycles: string[][]; // Array of node ID paths forming cycles
}
```

**Algorithm:**
- Sử dụng DFS với three-color marking
- White (0): Chưa visit
- Gray (1): Đang process (trong DFS stack)
- Black (2): Đã process xong
- Back edge (edge đến gray node) = cycle detected

**Example:**
```typescript
import { detectCircularDependencies } from '@viztechstack/roadmap-visualization';

const result = detectCircularDependencies(nodes, edges);
if (result.hasCircularDependency) {
  console.log('Cycles found:', result.cycles);
  // Output: [['A', 'B', 'C', 'A'], ['D', 'E', 'D']]
}
```

#### `calculateRelationshipStrength(sourceNode: RoadmapNode, targetNode: RoadmapNode, edge: RoadmapEdge): number`

Tính relationship strength giữa hai nodes.

**Parameters:**
- `sourceNode`: Source node
- `targetNode`: Target node
- `edge`: Edge kết nối hai nodes

**Returns:** Number trong khoảng [0, 1]

**Example:**
```typescript
import { calculateRelationshipStrength } from '@viztechstack/roadmap-visualization';

const strength = calculateRelationshipStrength(sourceNode, targetNode, edge);
console.log(`Relationship strength: ${strength.toFixed(2)}`);
// Output: Relationship strength: 0.85
```

#### `calculateAllRelationshipStrengths(graphData: GraphData): GraphData`

Tính relationship strengths cho tất cả edges trong graph.

**Parameters:**
- `graphData`: Complete graph data

**Returns:** New GraphData với updated edge strengths

**Notes:**
- Không mutate original graph data
- Handle edges với non-existent nodes gracefully
- Tất cả strengths trong khoảng [0, 1]

**Example:**
```typescript
import { calculateAllRelationshipStrengths } from '@viztechstack/roadmap-visualization';

const enhancedGraph = calculateAllRelationshipStrengths(graphData);
console.log('Updated edges:', enhancedGraph.edges);
```

#### `validateGraphStructure(graphData: GraphData, checkCircularDeps?: boolean): ValidationResult`

Validate toàn bộ graph structure integrity.

**Parameters:**
- `graphData`: Graph data cần validate
- `checkCircularDeps`: Có check circular dependencies không (default: true cho hierarchical layouts)

**Validation Checks:**
1. Graph có ít nhất 1 node
2. Node IDs unique
3. Tất cả edges valid
4. Không có circular dependencies (cho hierarchical layouts)

**Example:**
```typescript
import { validateGraphStructure } from '@viztechstack/roadmap-visualization';

const result = validateGraphStructure(graphData);
if (!result.valid) {
  console.error('Graph validation failed:');
  result.errors.forEach(error => console.error(`  - ${error}`));
}
```

## Usage Examples - Edge Validation

### Complete Graph Validation Workflow

```typescript
import {
  validateGraphStructure,
  detectCircularDependencies,
  calculateAllRelationshipStrengths,
} from '@viztechstack/roadmap-visualization';

function validateAndEnhanceGraph(graphData: GraphData): GraphData {
  // 1. Validate graph structure
  const validationResult = validateGraphStructure(graphData);
  if (!validationResult.valid) {
    throw new Error(`Invalid graph: ${validationResult.errors.join(', ')}`);
  }

  // 2. Check for circular dependencies (for hierarchical layouts)
  if (graphData.metadata.layoutType === 'hierarchical') {
    const circularCheck = detectCircularDependencies(
      graphData.nodes,
      graphData.edges
    );
    if (circularCheck.hasCircularDependency) {
      console.warn('Circular dependencies detected:', circularCheck.cycles);
      throw new Error('Hierarchical layout requires acyclic graph');
    }
  }

  // 3. Calculate relationship strengths
  const enhancedGraph = calculateAllRelationshipStrengths(graphData);

  return enhancedGraph;
}
```

### Validating Before Rendering

```typescript
import { validateGraphStructure } from '@viztechstack/roadmap-visualization';

function RoadmapVisualization({ graphData }: Props) {
  // Validate before rendering
  const validationResult = validateGraphStructure(graphData);
  
  if (!validationResult.valid) {
    return (
      <ErrorBoundary>
        <div className="error-message">
          <h3>Không thể hiển thị roadmap visualization</h3>
          <ul>
            {validationResult.errors.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
          <button onClick={() => switchToContentView()}>
            Xem dạng nội dung
          </button>
        </div>
      </ErrorBoundary>
    );
  }

  // Render visualization
  return <ReactFlow nodes={nodes} edges={edges} />;
}
```

### Custom Edge Validation

```typescript
import { validateEdge } from '@viztechstack/roadmap-visualization';

function validateCustomEdge(edge: RoadmapEdge, nodes: RoadmapNode[]): ValidationResult {
  // Basic validation
  const basicResult = validateEdge(edge, nodes);
  if (!basicResult.valid) {
    return basicResult;
  }

  // Custom validation rules
  const errors: string[] = [];
  
  // Example: Dependency edges phải có strength >= 0.5
  if (edge.type === 'dependency' && edge.data?.strength) {
    if (edge.data.strength < 0.5) {
      errors.push('Dependency edges must have strength >= 0.5');
    }
  }

  return {
    valid: errors.length === 0,
    errors: [...basicResult.errors, ...errors],
  };
}
```

## Testing - Edge Validation

### Unit Tests Example

```typescript
import {
  validateEdge,
  detectCircularDependencies,
  calculateRelationshipStrength,
} from '@viztechstack/roadmap-visualization';

describe('Edge Validation', () => {
  it('should validate correct edge', () => {
    const edge = {
      id: 'edge1',
      source: 'node1',
      target: 'node2',
      type: 'progression',
    };
    const nodes = [
      { id: 'node1', /* ... */ },
      { id: 'node2', /* ... */ },
    ];

    const result = validateEdge(edge, nodes);
    expect(result.valid).toBe(true);
  });

  it('should reject self-referencing edge', () => {
    const edge = {
      id: 'edge1',
      source: 'node1',
      target: 'node1', // Self-reference
    };
    const nodes = [{ id: 'node1', /* ... */ }];

    const result = validateEdge(edge, nodes);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('cannot reference itself'))).toBe(true);
  });

  it('should detect circular dependency', () => {
    const nodes = [
      { id: 'A', /* ... */ },
      { id: 'B', /* ... */ },
      { id: 'C', /* ... */ },
    ];
    const edges = [
      { id: 'e1', source: 'A', target: 'B' },
      { id: 'e2', source: 'B', target: 'C' },
      { id: 'e3', source: 'C', target: 'A' }, // Creates cycle
    ];

    const result = detectCircularDependencies(nodes, edges);
    expect(result.hasCircularDependency).toBe(true);
    expect(result.cycles.length).toBeGreaterThan(0);
  });

  it('should calculate relationship strength', () => {
    const sourceNode = { id: 'A', data: { level: 0 }, /* ... */ };
    const targetNode = { id: 'B', data: { level: 1 }, /* ... */ };
    const edge = {
      id: 'e1',
      source: 'A',
      target: 'B',
      type: 'dependency',
      data: { relationship: 'prerequisite' },
    };

    const strength = calculateRelationshipStrength(sourceNode, targetNode, edge);
    expect(strength).toBeGreaterThan(0);
    expect(strength).toBeLessThanOrEqual(1);
  });
});
```

## Troubleshooting - Edge Validation

### "Circular dependencies detected"

**Nguyên nhân:**
- Graph có cycles (A → B → C → A)
- Hierarchical layout không support cycles

**Giải pháp:**
1. Kiểm tra edges và loại bỏ back edges
2. Sử dụng layout khác (force-directed, circular) cho phép cycles
3. Restructure graph để loại bỏ circular dependencies

```typescript
// Debug cycles
const result = detectCircularDependencies(nodes, edges);
if (result.hasCircularDependency) {
  console.log('Cycles found:');
  result.cycles.forEach(cycle => {
    console.log(`  ${cycle.join(' → ')}`);
  });
}
```

### "Edge source/target does not reference existing node"

**Nguyên nhân:**
- Edge reference node ID không tồn tại trong graph
- Typo trong node ID

**Giải pháp:**
```typescript
// Verify node IDs
const nodeIds = new Set(nodes.map(n => n.id));
const invalidEdges = edges.filter(e => 
  !nodeIds.has(e.source) || !nodeIds.has(e.target)
);
console.log('Invalid edges:', invalidEdges);
```

### "Relationship strength must be between 0 and 1"

**Nguyên nhân:**
- Strength value ngoài khoảng [0, 1]
- Strength là NaN hoặc Infinity

**Giải pháp:**
```typescript
// Clamp strength to valid range
const clampedStrength = Math.max(0, Math.min(1, strength));
```

---

**Cập nhật lần cuối:** 2026-03-11  
**Phiên bản:** 1.1.0  
**Giai đoạn:** 3.1 - Core Node System (Tasks 3.1.3, 3.1.5 completed)
