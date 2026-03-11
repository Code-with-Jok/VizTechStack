# Hướng Dẫn Metadata trong Roadmap Visualization

## Tổng Quan

Tài liệu này mô tả hệ thống metadata được sử dụng trong roadmap visualization để lưu trữ thông tin bổ sung về nodes, edges và graph structure. Metadata system cung cấp khả năng mở rộng và tùy chỉnh cho visualization components.

## Trạng Thái Triển Khai

**🚧 ĐANG PHÁT TRIỂN** - Sẽ được triển khai trong các phases tiếp theo

**Giai đoạn hiện tại:** Phase 1.2 - React Flow Canvas Setup  
**Metadata system:** Sẽ được implement trong Phase 2.1 - Content Parser

## Node Metadata Structure

### 1. Core Node Metadata

```typescript
interface NodeMetadata {
  // Basic information
  id: string;
  label: string;
  description?: string;
  
  // Categorization
  category?: NodeCategory;
  type: NodeType;
  difficulty?: DifficultyLevel;
  
  // Learning information
  estimatedTime?: string;
  prerequisites?: string[];
  learningObjectives?: string[];
  
  // Navigation
  targetRoadmapId?: string;
  targetArticleId?: string;
  externalUrl?: string;
  
  // Visual properties
  position: Position;
  style?: NodeStyle;
  
  // Progress tracking
  completed?: boolean;
  progress?: number; // 0-100
  lastAccessed?: Date;
  
  // Content references
  contentSections?: string[];
  resources?: Resource[];
  
  // Collaboration
  annotations?: Annotation[];
  comments?: Comment[];
}
```

### 2. Node Categories

```typescript
type NodeCategory = 'role' | 'skill' | 'topic' | 'milestone' | 'resource';

interface CategoryMetadata {
  role: {
    targetRoadmapId: string; // Required
    jobTitle?: string;
    seniority?: 'junior' | 'mid' | 'senior' | 'lead';
    department?: string;
  };
  
  skill: {
    targetArticleId: string; // Required
    skillLevel?: 'basic' | 'intermediate' | 'advanced' | 'expert';
    practiceTime?: string;
    certifications?: string[];
  };
  
  topic: {
    subtopics?: string[];
    relatedTopics?: string[];
    importance?: 'low' | 'medium' | 'high' | 'critical';
  };
  
  milestone: {
    criteria?: string[];
    deliverables?: string[];
    timeline?: string;
  };
  
  resource: {
    resourceType: 'article' | 'video' | 'course' | 'book' | 'tool' | 'documentation';
    url?: string;
    author?: string;
    duration?: string;
    cost?: 'free' | 'paid' | 'subscription';
  };
}
```

### 3. Difficulty Levels

```typescript
type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

interface DifficultyMetadata {
  beginner: {
    color: 'success'; // Green
    icon: '🟢';
    description: 'Phù hợp cho người mới bắt đầu';
    timeMultiplier: 1.0;
  };
  
  intermediate: {
    color: 'warning'; // Yellow/Orange
    icon: '🟡';
    description: 'Cần có kiến thức cơ bản';
    timeMultiplier: 1.5;
  };
  
  advanced: {
    color: 'error'; // Red
    icon: '🔴';
    description: 'Cần có kinh nghiệm và kiến thức sâu';
    timeMultiplier: 2.0;
  };
}
```

## Edge Metadata Structure

### 1. Core Edge Metadata

```typescript
interface EdgeMetadata {
  // Basic information
  id: string;
  source: string;
  target: string;
  
  // Relationship type
  type: EdgeType;
  relationship: RelationshipType;
  
  // Strength and importance
  strength?: number; // 0-1
  importance?: 'low' | 'medium' | 'high';
  
  // Directionality
  bidirectional?: boolean;
  
  // Visual properties
  style?: EdgeStyle;
  animated?: boolean;
  
  // Content
  label?: string;
  description?: string;
  
  // Conditional relationships
  conditions?: EdgeCondition[];
}
```

### 2. Edge Types và Relationships

```typescript
type EdgeType = 'dependency' | 'progression' | 'related' | 'optional';
type RelationshipType = 'prerequisite' | 'leads-to' | 'related-to' | 'part-of';

interface EdgeTypeMetadata {
  dependency: {
    color: 'error-500'; // Red
    style: 'solid';
    description: 'Phụ thuộc bắt buộc';
    blocking: true;
  };
  
  progression: {
    color: 'primary-500'; // Orange
    style: 'solid';
    description: 'Tiến trình học tập';
    blocking: false;
  };
  
  related: {
    color: 'secondary-500'; // Blue
    style: 'dashed';
    description: 'Liên quan';
    blocking: false;
  };
  
  optional: {
    color: 'neutral-400'; // Gray
    style: 'dotted';
    description: 'Tùy chọn';
    blocking: false;
  };
}
```

## Graph Metadata Structure

### 1. Graph-Level Metadata

```typescript
interface GraphMetadata {
  // Basic information
  roadmapId: string;
  title: string;
  description?: string;
  
  // Statistics
  totalNodes: number;
  totalEdges: number;
  maxDepth: number;
  
  // Layout information
  layoutType: LayoutType;
  layoutConfig?: LayoutConfig;
  
  // Generation information
  generatedAt: Date;
  generatedBy: 'manual' | 'auto' | 'ai';
  version: string;
  
  // Performance metrics
  renderTime?: number;
  layoutTime?: number;
  
  // Validation status
  validated: boolean;
  validationErrors?: ValidationError[];
  
  // User preferences
  userPreferences?: UserPreferences;
}
```

### 2. Layout Configuration

```typescript
interface LayoutConfig {
  hierarchical: {
    direction: 'TB' | 'BT' | 'LR' | 'RL';
    nodeSpacing: number;
    levelSpacing: number;
    alignment: 'start' | 'center' | 'end';
  };
  
  force: {
    strength: number;
    distance: number;
    iterations: number;
    centerForce: number;
  };
  
  circular: {
    radius: number;
    startAngle: number;
    endAngle: number;
    clockwise: boolean;
  };
  
  grid: {
    columns: number;
    rows: number;
    cellWidth: number;
    cellHeight: number;
  };
}
```

## Resource Metadata

### 1. Resource Types

```typescript
interface ResourceMetadata {
  id: string;
  title: string;
  type: ResourceType;
  url?: string;
  
  // Content information
  description?: string;
  author?: string;
  publishedDate?: Date;
  lastUpdated?: Date;
  
  // Learning information
  difficulty: DifficultyLevel;
  estimatedTime?: string;
  language: string;
  
  // Access information
  cost: 'free' | 'paid' | 'subscription';
  accessLevel: 'public' | 'member' | 'premium';
  
  // Quality metrics
  rating?: number; // 1-5
  reviews?: number;
  popularity?: number;
  
  // Tags and categorization
  tags?: string[];
  topics?: string[];
  skills?: string[];
}

type ResourceType = 
  | 'article' 
  | 'video' 
  | 'course' 
  | 'book' 
  | 'tool' 
  | 'documentation'
  | 'tutorial'
  | 'example'
  | 'reference';
```

## Progress Tracking Metadata

### 1. User Progress

```typescript
interface UserProgressMetadata {
  userId: string;
  roadmapId: string;
  
  // Overall progress
  overallProgress: number; // 0-100
  completedNodes: string[];
  inProgressNodes: string[];
  
  // Time tracking
  totalTimeSpent: number; // minutes
  lastAccessed: Date;
  startedAt: Date;
  
  // Learning path
  currentPath: string[];
  suggestedNext: string[];
  
  // Achievements
  milestones: Milestone[];
  badges: Badge[];
  
  // Preferences
  learningStyle?: 'visual' | 'reading' | 'hands-on' | 'mixed';
  pace?: 'slow' | 'normal' | 'fast';
  
  // Notes and bookmarks
  notes: Note[];
  bookmarks: string[];
}
```

### 2. Collaboration Metadata

```typescript
interface CollaborationMetadata {
  // Session information
  sessionId: string;
  participants: Participant[];
  
  // Real-time data
  cursors: CursorPosition[];
  selections: Selection[];
  
  // Annotations
  annotations: Annotation[];
  comments: Comment[];
  
  // Changes tracking
  changes: Change[];
  lastSyncAt: Date;
}

interface Annotation {
  id: string;
  nodeId: string;
  userId: string;
  content: string;
  type: 'note' | 'question' | 'suggestion' | 'issue';
  createdAt: Date;
  resolved?: boolean;
}
```

## Validation Rules

### 1. Node Metadata Validation

```typescript
const nodeMetadataValidation = {
  // Required fields
  required: ['id', 'label', 'type', 'position'],
  
  // Category-specific requirements
  categoryRequirements: {
    role: ['targetRoadmapId'],
    skill: ['targetArticleId'],
    resource: ['resourceType'],
  },
  
  // Field validations
  validations: {
    id: /^[a-zA-Z0-9-_]+$/,
    difficulty: ['beginner', 'intermediate', 'advanced'],
    progress: (value: number) => value >= 0 && value <= 100,
    estimatedTime: /^\d+[hm]$/, // e.g., "2h", "30m"
  },
};
```

### 2. Edge Metadata Validation

```typescript
const edgeMetadataValidation = {
  // Required fields
  required: ['id', 'source', 'target', 'type'],
  
  // Relationship validations
  validRelationships: {
    dependency: ['prerequisite'],
    progression: ['leads-to'],
    related: ['related-to'],
    optional: ['part-of', 'related-to'],
  },
  
  // Strength validation
  strength: (value: number) => value >= 0 && value <= 1,
  
  // No self-references
  noSelfReference: (edge: EdgeMetadata) => edge.source !== edge.target,
};
```

## API Integration

### 1. Metadata Queries

```typescript
// GraphQL queries cho metadata
const GET_NODE_METADATA = gql`
  query GetNodeMetadata($nodeId: ID!) {
    node(id: $nodeId) {
      id
      label
      description
      category
      difficulty
      estimatedTime
      prerequisites
      resources {
        id
        title
        type
        url
      }
      progress {
        completed
        progress
        lastAccessed
      }
    }
  }
`;

const GET_GRAPH_METADATA = gql`
  query GetGraphMetadata($roadmapId: ID!) {
    roadmap(id: $roadmapId) {
      id
      title
      metadata {
        totalNodes
        totalEdges
        layoutType
        generatedAt
        validated
      }
    }
  }
`;
```

### 2. Metadata Mutations

```typescript
const UPDATE_NODE_PROGRESS = gql`
  mutation UpdateNodeProgress($nodeId: ID!, $progress: Int!, $completed: Boolean!) {
    updateNodeProgress(nodeId: $nodeId, progress: $progress, completed: $completed) {
      id
      progress {
        progress
        completed
        lastAccessed
      }
    }
  }
`;

const ADD_NODE_ANNOTATION = gql`
  mutation AddNodeAnnotation($nodeId: ID!, $content: String!, $type: AnnotationType!) {
    addNodeAnnotation(nodeId: $nodeId, content: $content, type: $type) {
      id
      content
      type
      createdAt
      user {
        id
        name
      }
    }
  }
`;
```

## Usage Examples

### 1. Node với Complete Metadata

```typescript
const completeNode: NodeMetadata = {
  id: 'react-hooks',
  label: 'React Hooks',
  description: 'Learn modern React state management with hooks',
  
  // Categorization
  category: 'skill',
  type: 'topic',
  difficulty: 'intermediate',
  
  // Learning information
  estimatedTime: '4h',
  prerequisites: ['react-basics', 'javascript-es6'],
  learningObjectives: [
    'Understand useState and useEffect',
    'Create custom hooks',
    'Optimize performance with useMemo'
  ],
  
  // Navigation
  targetArticleId: 'react-hooks-comprehensive-guide',
  
  // Visual
  position: { x: 200, y: 100 },
  
  // Progress
  completed: false,
  progress: 65,
  lastAccessed: new Date('2026-03-10'),
  
  // Resources
  resources: [
    {
      id: 'react-docs-hooks',
      title: 'React Hooks Documentation',
      type: 'documentation',
      url: 'https://react.dev/reference/react',
      difficulty: 'intermediate',
      cost: 'free'
    }
  ],
  
  // Collaboration
  annotations: [
    {
      id: 'ann-1',
      nodeId: 'react-hooks',
      userId: 'user-123',
      content: 'This is a crucial topic for modern React development',
      type: 'note',
      createdAt: new Date('2026-03-09'),
      resolved: false
    }
  ]
};
```

### 2. Edge với Relationship Metadata

```typescript
const dependencyEdge: EdgeMetadata = {
  id: 'react-basics-to-hooks',
  source: 'react-basics',
  target: 'react-hooks',
  
  // Relationship
  type: 'dependency',
  relationship: 'prerequisite',
  
  // Properties
  strength: 0.9,
  importance: 'high',
  bidirectional: false,
  
  // Visual
  style: {
    stroke: '#ef4444',
    strokeWidth: 2,
  },
  
  // Content
  label: 'Prerequisite',
  description: 'React basics must be completed before learning hooks',
  
  // Conditions
  conditions: [
    {
      type: 'completion',
      nodeId: 'react-basics',
      threshold: 80
    }
  ]
};
```

## Best Practices

### 1. Metadata Design Principles

- **Consistency**: Sử dụng naming conventions nhất quán
- **Extensibility**: Design cho future enhancements
- **Performance**: Minimize metadata size cho large graphs
- **Validation**: Always validate metadata integrity
- **Documentation**: Document all metadata fields

### 2. Performance Considerations

```typescript
// Lazy loading cho large metadata
const useNodeMetadata = (nodeId: string) => {
  const [metadata, setMetadata] = useState<NodeMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (nodeId) {
      setLoading(true);
      loadNodeMetadata(nodeId).then(setMetadata).finally(() => setLoading(false));
    }
  }, [nodeId]);
  
  return { metadata, loading };
};

// Caching cho frequently accessed metadata
const metadataCache = new Map<string, NodeMetadata>();

const getCachedMetadata = (nodeId: string): NodeMetadata | null => {
  return metadataCache.get(nodeId) || null;
};
```

### 3. Error Handling

```typescript
const validateMetadata = (metadata: NodeMetadata): ValidationResult => {
  const errors: string[] = [];
  
  // Required field validation
  if (!metadata.id) errors.push('Node ID is required');
  if (!metadata.label) errors.push('Node label is required');
  
  // Category-specific validation
  if (metadata.category === 'role' && !metadata.targetRoadmapId) {
    errors.push('Role nodes must have targetRoadmapId');
  }
  
  // Progress validation
  if (metadata.progress && (metadata.progress < 0 || metadata.progress > 100)) {
    errors.push('Progress must be between 0 and 100');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};
```

## Future Enhancements

### Planned Features

- [ ] **AI-Generated Metadata**: Automatic metadata extraction từ content
- [ ] **Smart Recommendations**: AI-powered learning path suggestions
- [ ] **Advanced Analytics**: Detailed learning analytics và insights
- [ ] **Collaborative Filtering**: User behavior-based recommendations
- [ ] **Adaptive Learning**: Personalized difficulty adjustments

### Integration Roadmap

- **Phase 2.1**: Basic metadata structure implementation
- **Phase 2.2**: Progress tracking integration
- **Phase 3.x**: Advanced analytics và AI features
- **Phase 4.x**: Collaborative features và real-time sync

---

**Cập nhật lần cuối:** 2026-03-11  
**Phiên bản:** 1.0.0  
**Trạng thái:** Documentation - Ready for Implementation