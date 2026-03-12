# Hướng Dẫn Metadata trong Roadmap Visualization

## Tổng Quan

Tài liệu này mô tả hệ thống metadata được sử dụng trong roadmap visualization để lưu trữ thông tin bổ sung về nodes, edges và graph structure. Metadata system cung cấp khả năng mở rộng và tùy chỉnh cho visualization components.

## Trạng Thái Triển Khai

**🚧 ĐANG PHÁT TRIỂN** - Đang triển khai các components cốt lõi

**Giai đoạn hiện tại:** Phase 4.4 - Node Selection và Highlighting Implementation  
**Đã hoàn thành:** 
- MarkdownParser class (Task 2.1.1) ✅  
- NodeExtractor service (Task 2.1.2) ✅  
- RelationshipAnalyzer service (Task 2.2.1) ✅  
- EdgeGenerator service (Task 2.2.2) ✅  
- HierarchyProcessor service (Task 2.3.1) ✅  
- Hierarchy validation (Task 2.3.2) ✅  
- ResourceExtractor service (Task 2.4.1) ✅  
- Resource categorization (Task 2.4.2) ✅  
- HierarchicalLayout algorithm (Task 3.1.1) ✅  
- Hierarchical layout controls (Task 3.1.2) ✅  
- ForceDirectedLayout algorithm (Task 3.2.1) ✅  
- Force layout controls (Task 3.2.2) ✅  
- CircularLayout algorithm (Task 3.3.1) ✅  
- Circular layout controls (Task 3.3.2) ✅  
- GridLayout algorithm (Task 3.4.1) ✅  
- Grid layout controls (Task 3.4.2) ✅  
- LayoutManager service (Task 3.5.1) ✅  
- LayoutControls component (Task 3.5.2) ✅  
- NodeTooltip component (Task 4.1.1) ✅  
- Tooltip positioning system (Task 4.1.2) ✅  
- Enhanced NodeDetailsPanel (Task 4.2.1) ✅  
- Panel responsive design (Task 4.2.2) ✅  
- Edge click handlers (Task 4.3.1) ✅  
- EdgeDetailsPanel component (Task 4.3.2) ✅  
**Tiếp theo:** Selection state management (Task 4.4.1)  
**Metadata system:** Đã tích hợp với hierarchy processing, validation, resource extraction, advanced categorization, layout system, node interaction tooltips, advanced positioning system, enhanced node details panel, responsive design system, edge interaction system và comprehensive edge details panel

## Hierarchy Validation Metadata

### 1. Validation Result Structure

```typescript
interface HierarchyValidationResult {
  isValid: boolean;
  criticalErrors: string[];
  warnings: string[];
  malformedStructures: MalformedStructure[];
  suggestedFixes: HierarchyFix[];
}

interface MalformedStructure {
  type: 'orphaned_node' | 'level_gap' | 'circular_dependency' | 'invalid_progression' | 'missing_parent';
  nodeIds: string[];
  description: string;
  severity: 'critical' | 'warning' | 'info';
}

interface HierarchyFix {
  type: 'insert_intermediate_level' | 'adjust_level' | 'create_parent' | 'remove_node' | 'merge_nodes';
  targetNodeIds: string[];
  description: string;
  autoApplicable: boolean;
}
```

### 2. Hierarchy Processing Options

```typescript
interface HierarchyProcessingOptions {
  maxDepth?: number; // Default: 10
  includeImplicitHierarchy?: boolean; // Default: true
  strengthByDepth?: boolean; // Default: true
  validateHierarchy?: boolean; // Default: true
  fallbackOptions?: HierarchyFallbackOptions;
}

interface HierarchyFallbackOptions {
  createMissingParents: boolean;
  adjustLevelGaps: boolean;
  removeOrphanedNodes: boolean;
  flattenDeepHierarchy: boolean;
  maxFallbackDepth: number;
}
```

### 3. Hierarchy Statistics

```typescript
interface HierarchyStatistics {
  averageDepth: number;
  hierarchyBalance: number; // 0-1, higher means more balanced
  branchingFactor: number; // Average children per parent
  totalRelationships: number;
  maxDepth: number;
  nodesByDepth: Record<number, number>;
  rootNodes: string[]; // Nodes with no parents
  leafNodes: string[]; // Nodes with no children
}
```

### 5. Advanced Positioning System Metadata

Enhanced tooltip positioning system với collision detection và performance optimization:

```typescript
interface AdvancedPositioningMetadata {
  // Position calculation results
  calculatedPosition: {
    x: number;
    y: number;
    placement: 'top' | 'bottom' | 'left' | 'right';
    adjustedX?: number;
    adjustedY?: number;
  };
  
  // Collision detection information
  collisionDetection: {
    hasCollisions: boolean;
    collisionElements: CollisionRect[];
    avoidedCollisions: number;
    fallbackUsed: boolean;
  };
  
  // Performance metrics
  performanceMetrics: {
    positionCalculationTime: number;  // ms
    collisionDetectionTime: number;   // ms
    cacheHitRate: number;            // 0-1
    totalCalculations: number;
  };
  
  // Viewport information
  viewportInfo: {
    width: number;
    height: number;
    scrollX: number;
    scrollY: number;
  };
  
  // Positioning options used
  positioningOptions: {
    offset: number;
    padding: number;
    preferredPlacement: string;
    allowFlip: boolean;
    avoidCollisions: boolean;
    maxWidth?: number;
    maxHeight?: number;
  };
}
```

### 6. Multi-Tooltip Management Metadata

System quản lý multiple tooltips với priority và collision resolution:

```typescript
interface MultiTooltipMetadata {
  // Active tooltip instances
  activeTooltips: Map<string, TooltipInstance>;
  
  // Collision management
  collisionMatrix: {
    tooltipId: string;
    collidingWith: string[];
    resolutionStrategy: 'priority' | 'timestamp' | 'position';
  }[];
  
  // Performance tracking
  systemPerformance: {
    totalTooltips: number;
    maxConcurrentTooltips: number;
    averageLifetime: number;        // ms
    memoryUsage: number;            // bytes
    cacheEfficiency: number;        // 0-1
  };
  
  // Resource management
  resourceUsage: {
    domObservers: number;
    eventListeners: number;
    timeouts: number;
    animationFrames: number;
  };
}

interface TooltipInstance {
  id: string;
  position: TooltipPosition;
  dimensions: TooltipDimensions;
  mousePosition: { x: number; y: number };
  priority: number;
  timestamp: number;
  nodeData: NodeData;
  isVisible: boolean;
}
```

## Node Tooltip Metadata

### 1. Tooltip Display Metadata

NodeTooltip component sử dụng comprehensive metadata để hiển thị thông tin chi tiết về nodes trong roadmap visualization:

```typescript
interface TooltipDisplayMetadata {
  // Core information
  label: string;                    // Node title
  description?: string;             // Detailed description
  level: number;                    // Learning level (0-10)
  section: string;                  // Section/category name
  
  // Status indicators
  completed?: boolean;              // Completion status
  progress?: number;                // Progress percentage (0-100)
  
  // Learning metadata
  estimatedTime?: string;           // Time estimate (e.g., "2 hours")
  difficulty?: DifficultyLevel;     // beginner | intermediate | advanced
  
  // Navigation metadata (for categorized nodes)
  category?: NodeCategory;          // role | skill
  targetRoadmapId?: string;         // For role nodes
  targetArticleId?: string;         // For skill nodes
  
  // Resources metadata
  resources?: Resource[];           // Learning resources
  prerequisites?: string[];        // Prerequisite node IDs
}
```

### 2. Tooltip Positioning Metadata

Smart positioning system sử dụng viewport và mouse position metadata:

```typescript
interface TooltipPositionMetadata {
  // Mouse position
  mousePosition: { x: number; y: number };
  
  // Viewport information
  viewportWidth: number;
  viewportHeight: number;
  
  // Tooltip dimensions
  tooltipWidth: number;
  tooltipHeight: number;
  
  // Calculated position
  finalPosition: { x: number; y: number };
  placement: 'top' | 'bottom' | 'left' | 'right';
  
  // Edge detection
  edgeDetection: {
    rightEdge: boolean;
    bottomEdge: boolean;
    leftEdge: boolean;
    topEdge: boolean;
  };
}
```

### 3. Tooltip Performance Metadata

Performance optimization tracking cho tooltip interactions:

```typescript
interface TooltipPerformanceMetadata {
  // Timing information
  showDelay: number;                // Delay before showing (ms)
  hideDelay: number;                // Delay before hiding (ms)
  renderTime: number;               // Time to render tooltip (ms)
  
  // Interaction tracking
  hoverCount: number;               // Number of hovers in session
  averageHoverDuration: number;     // Average hover time (ms)
  
  // Performance metrics
  positionCalculationTime: number;  // Time to calculate position (ms)
  animationFrameRate: number;       // Animation FPS
  
  // Memory usage
  tooltipInstanceCount: number;     // Active tooltip instances
  memoryUsage: number;              // Memory footprint (bytes)
}
```

### 4. Tooltip Content Metadata

Rich content display với category-specific information:

```typescript
interface TooltipContentMetadata {
  // Basic content
  title: string;
  description: string;
  
  // Visual indicators
  difficultyBadge: {
    level: DifficultyLevel;
    color: string;
    icon: string;
    description: string;
  };
  
  // Status indicators
  completionStatus: {
    completed: boolean;
    progress: number;
    icon: string;
    color: string;
  };
  
  // Time information
  timeEstimate: {
    value: string;
    icon: string;
    formatted: string;
  };
  
  // Category-specific content
  categoryInfo: {
    type: NodeCategory;
    icon: string;
    displayName: string;
    navigationHint: string;
  };
  
  // Resources preview
  resourcesPreview: {
    totalCount: number;
    displayedCount: number;
    resources: Array<{
      title: string;
      type: string;
      icon: string;
      typeLabel: string;
    }>;
  };
  
  // Learning level
  levelInfo: {
    current: number;
    maximum: number;
    percentage: number;
    progressBar: {
      width: string;
      color: string;
    };
  };
}
```

### 7. Responsive Design Metadata (Task 4.2.2)

Enhanced NodeDetailsPanel với responsive design system và performance optimization:

```typescript
interface ResponsiveDesignMetadata {
  // Breakpoint information
  breakpointInfo: {
    current: BreakpointSize;           // 'mobile' | 'tablet' | 'desktop'
    screenWidth: number;
    screenHeight: number;
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
  };
  
  // Panel state management
  panelState: {
    current: PanelState;               // 'collapsed' | 'expanded' | 'minimized'
    previousState: PanelState;
    autoResizeEnabled: boolean;
    persistenceKey: string;
    stateHistory: PanelStateChange[];
  };
  
  // Responsive layout calculations
  layoutCalculations: {
    panelWidth: string;                // CSS class for width
    maxPanelHeight: number;            // Calculated max height in pixels
    shouldShowFullContent: boolean;
    shouldUseCompactLayout: boolean;
    adaptiveSpacing: ResponsiveSpacing;
  };
  
  // Performance optimization metadata
  performanceOptimization: {
    virtualizationEnabled: boolean;
    virtualizationThreshold: number;   // Number of items to trigger virtualization
    memoryOptimizationEnabled: boolean;
    cacheSize: number;
    cacheHitRate: number;             // 0-1
    renderTime: number;               // ms
    memoryUsage: number;              // bytes
  };
  
  // Touch and interaction metadata
  touchInteraction: {
    touchFriendlyControls: boolean;
    minimumTouchTargetSize: number;   // 44px minimum
    swipeGesturesEnabled: boolean;
    clickOutsideToClose: boolean;     // Mobile only
  };
  
  // Content adaptation
  contentAdaptation: {
    compactMode: boolean;
    iconOnlyTabs: boolean;
    limitedRelatedNodes: number;      // Max nodes shown on mobile
    abbreviatedLabels: boolean;
    responsiveGrid: ResponsiveGridConfig;
  };
}

interface ResponsiveSpacing {
  padding: {
    mobile: string;    // 'p-4'
    tablet: string;    // 'p-4 sm:p-6'
    desktop: string;   // 'p-6'
  };
  gap: {
    mobile: string;    // 'gap-3'
    tablet: string;    // 'gap-3 sm:gap-4'
    desktop: string;   // 'gap-4'
  };
  typography: {
    mobile: string;    // 'text-xs'
    tablet: string;    // 'text-xs sm:text-sm'
    desktop: string;   // 'text-sm'
  };
}

interface ResponsiveGridConfig {
  mobile: {
    columns: number;   // 2
    maxItems: number;  // 3
    showMore: boolean; // true
  };
  tablet: {
    columns: number;   // 2-3
    maxItems: number;  // 6
    showMore: boolean; // false
  };
  desktop: {
    columns: number;   // 3-4
    maxItems: number;  // unlimited
    showMore: boolean; // false
  };
}

interface PanelStateChange {
  from: PanelState;
  to: PanelState;
  timestamp: number;
  trigger: 'user' | 'auto' | 'breakpoint';
  reason: string;
}
```

#### Responsive Behavior Patterns

1. **Mobile-First Approach**: Panel tự động minimize trên mobile để tiết kiệm không gian
2. **Progressive Enhancement**: Thêm features khi screen size tăng
3. **Touch Optimization**: Controls được tối ưu cho touch interactions
4. **Content Prioritization**: Hiển thị thông tin quan trọng nhất trước trên mobile
5. **Performance Scaling**: Virtualization và optimization tự động kích hoạt khi cần

#### Accessibility Integration

```typescript
interface ResponsiveAccessibilityMetadata {
  // Keyboard navigation
  keyboardNavigation: {
    focusManagement: boolean;
    tabOrder: string[];
    shortcuts: KeyboardShortcut[];
  };
  
  // Screen reader support
  screenReader: {
    ariaLabels: Record<string, string>;
    liveRegions: string[];
    roleDefinitions: Record<string, string>;
  };
  
  // High contrast support
  highContrast: {
    enabled: boolean;
    alternativeIndicators: boolean;
    contrastRatios: Record<string, number>;
  };
}

interface KeyboardShortcut {
  key: string;
  modifiers: string[];
  action: string;
  description: string;
  context: 'global' | 'panel' | 'tab';
}
```

### 8. Edge Interaction Metadata (Task 4.3.1)

Comprehensive edge interaction system với click handlers, relationship highlighting và detailed information panel:

```typescript
interface EdgeInteractionMetadata {
  // Edge selection state
  selectionState: {
    selectedEdgeId: string | null;
    highlightedPath: string[];           // Node IDs in highlighted path
    relationshipDetails: EdgeRelationshipDetails | null;
    hoveredEdgeId: string | null;
  };
  
  // Relationship analysis
  relationshipDetails: {
    edgeId: string;
    sourceNode: RoadmapNode;
    targetNode: RoadmapNode;
    relationship: RelationshipType;      // 'prerequisite' | 'leads-to' | 'related-to' | 'part-of'
    strength?: number;                   // 0-1 connection strength
    bidirectional?: boolean;
    description: string;                 // Auto-generated description
    reasoning: string;                   // Auto-generated reasoning
  };
  
  // Visual feedback states
  visualStates: {
    selected: EdgeVisualState;           // Warning colors với glow effect
    highlighted: EdgeVisualState;        // Primary colors với enhanced stroke
    dimmed: EdgeVisualState;            // Reduced opacity và stroke width
    hovered: EdgeVisualState;           // Subtle scale và shadow effects
  };
  
  // Path highlighting logic
  pathHighlighting: {
    primaryPath: string[];              // Direct source-target connection
    relatedPaths: string[];             // Bidirectional và related connections
    highlightingStrategy: 'direct' | 'extended' | 'network';
    pathDepth: number;                  // Levels of connection to highlight
  };
  
  // Interaction performance
  interactionPerformance: {
    clickResponseTime: number;          // ms
    highlightUpdateTime: number;        // ms
    panelRenderTime: number;           // ms
    pathCalculationTime: number;        // ms
  };
}

interface EdgeVisualState {
  stroke: string;                       // Color value
  strokeWidth: number;                  // Line thickness
  opacity: number;                      // 0-1 transparency
  filter?: string;                      // CSS filter effects
  animation?: EdgeAnimation;            // Animation properties
}

interface EdgeAnimation {
  type: 'glow' | 'pulse' | 'flow' | 'none';
  duration: number;                     // ms
  easing: string;                       // CSS easing function
  iterations: number | 'infinite';
}

interface RelationshipType {
  prerequisite: {
    icon: '🔒';
    color: '#dc2626';                   // error-600
    description: 'Điều kiện tiên quyết';
    directionality: 'unidirectional';
    importance: 'critical';
  };
  'leads-to': {
    icon: '➡️';
    color: '#ed7c47';                   // primary-500
    description: 'Dẫn đến';
    directionality: 'unidirectional';
    importance: 'high';
  };
  'related-to': {
    icon: '🔗';
    color: '#0ea5e9';                   // secondary-500
    description: 'Liên quan';
    directionality: 'bidirectional';
    importance: 'medium';
  };
  'part-of': {
    icon: '📦';
    color: '#22c55e';                   // success-500
    description: 'Thuộc về';
    directionality: 'hierarchical';
    importance: 'structural';
  };
}
```

#### Edge Interaction Flow

1. **User clicks edge** → Edge selection event triggered
2. **Hook processes click** → `useEdgeInteraction.handleEdgeClick`
3. **State updates** → selectedEdgeId, relationshipDetails, highlightedPath
4. **Visual feedback** → Edge styling changes, path highlighting
5. **Panel renders** → EdgeDetailsPanel với comprehensive information
6. **Navigation ready** → Quick navigation đến connected nodes

#### Relationship Analysis Engine

```typescript
interface RelationshipAnalysisEngine {
  // Description generation
  descriptionGenerator: {
    templateEngine: 'rule-based' | 'ai-powered';
    templates: Record<RelationshipType, string[]>;
    contextualFactors: string[];        // difficulty, level, section
    personalization: boolean;
  };
  
  // Reasoning generation
  reasoningGenerator: {
    analysisFactors: [
      'difficulty_progression',         // beginner → intermediate → advanced
      'level_hierarchy',               // level 1 → level 2 → level 3
      'section_grouping',              // same section relationships
      'content_similarity',            // topic overlap analysis
      'learning_path_optimization'     // optimal learning sequence
    ];
    confidenceScore: number;           // 0-1 confidence in reasoning
    fallbackReasoning: string;         // default reasoning when analysis fails
  };
  
  // Strength calculation
  strengthCalculation: {
    factors: {
      difficultyGap: number;          // Weight: 0.3
      levelDistance: number;          // Weight: 0.2
      sectionAlignment: number;       // Weight: 0.2
      contentOverlap: number;         // Weight: 0.2
      userBehavior: number;           // Weight: 0.1
    };
    algorithm: 'weighted_sum' | 'neural_network' | 'rule_based';
    normalization: 'min_max' | 'z_score' | 'sigmoid';
  };
}
```

#### Visual Design System

```typescript
interface EdgeVisualDesignSystem {
  // Color palette cho relationship types
  relationshipColors: {
    prerequisite: {
      primary: '#dc2626';             // error-600
      light: '#fecaca';               // error-200
      dark: '#991b1b';                // error-800
      background: '#fef2f2';          // error-50
    };
    'leads-to': {
      primary: '#ed7c47';             // primary-500
      light: '#fed7aa';               // primary-200
      dark: '#c2410c';                // primary-800
      background: '#fff7ed';          // primary-50
    };
    // ... other relationship types
  };
  
  // Visual states
  stateStyles: {
    default: { strokeWidth: 2, opacity: 1 };
    selected: { strokeWidth: 3, opacity: 1, glow: true };
    highlighted: { strokeWidth: 2.5, opacity: 1 };
    dimmed: { strokeWidth: 1.5, opacity: 0.3 };
    hovered: { strokeWidth: 2.5, opacity: 1, shadow: true };
  };
  
  // Animation system
  animations: {
    selection: {
      duration: 200,
      easing: 'ease-out',
      properties: ['stroke-width', 'filter']
    };
    highlighting: {
      duration: 150,
      easing: 'ease-in-out',
      properties: ['stroke', 'stroke-width']
    };
    flow: {
      duration: 2000,
      easing: 'linear',
      iterations: 'infinite',
      properties: ['stroke-dashoffset']
    };
  };
}
```

#### Accessibility Integration

```typescript
interface EdgeAccessibilityMetadata {
  // Keyboard navigation
  keyboardSupport: {
    tabNavigation: boolean;           // Tab through edges
    arrowKeyNavigation: boolean;      // Navigate connected edges
    enterActivation: boolean;         // Enter to select edge
    escapeDeselection: boolean;       // Escape to clear selection
  };
  
  // Screen reader support
  screenReaderSupport: {
    ariaLabels: Record<string, string>;
    roleDefinitions: Record<string, string>;
    liveRegions: string[];            // Dynamic content announcements
    relationshipDescriptions: Record<RelationshipType, string>;
  };
  
  // Visual accessibility
  visualAccessibility: {
    highContrastSupport: boolean;
    colorIndependentIndicators: boolean;  // Icons và patterns supplement colors
    focusIndicators: boolean;
    scalableElements: boolean;        // Responsive sizing
  };
  
  // Alternative interaction methods
  alternativeInteractions: {
    voiceCommands: string[];          // "select edge", "show relationship"
    gestureSupport: boolean;          // Touch gestures on mobile
    contextMenus: boolean;            // Right-click menus
  };
}
```

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
    innerRadius: number;
    outerRadius: number;
    startAngle: number;
    endAngle: number;
    levelSpacing: number;
    angularSpacing: number;
    preventOverlaps: boolean;
    sortByLevel: boolean;
    clockwise: boolean;
  };
  
  grid: {
    columns: number;
    rows: number;
    cellWidth: number;
    cellHeight: number;
    padding: number;
    autoSize: boolean;
    aspectRatio: number;
    sortBy: 'level' | 'section' | 'difficulty' | 'none';
    groupBy: 'section' | 'level' | 'none';
  };
}
```

### 3. Circular Layout Metadata

CircularLayout algorithm sử dụng d3-hierarchy để tạo concentric circles với metadata đặc biệt:

```typescript
interface CircularLayoutResult {
  nodes: RoadmapNode[];
  edges: RoadmapEdge[];
  bounds: LayoutBounds;
  metadata: CircularLayoutMetadata;
}

interface CircularLayoutMetadata {
  layoutTime: number;
  nodeCount: number;
  levels: number;
  rings: number;
  averageRadius: number;
  angularSpacing: number;
  overlapsPrevented: number;
  hierarchyDepth: number;
}

interface CircularLayoutOptions {
  width?: number;
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  startAngle?: number;
  endAngle?: number;
  levelSpacing?: number;
  angularSpacing?: number;
  preventOverlaps?: boolean;
  sortByLevel?: boolean;
}
```

#### Circular Layout Features

1. **Concentric Positioning**: Nodes được đặt trong các vòng tròn đồng tâm dựa trên hierarchy level
2. **Angular Optimization**: Tự động tối ưu hóa khoảng cách góc để tránh overlap
3. **Hierarchy Preservation**: Duy trì cấu trúc phân cấp trong circular arrangement
4. **Section Grouping**: Hỗ trợ nhóm nodes theo section trong cùng một ring
5. **Progressive Layout**: Tối ưu hóa cho topic progression và learning paths

#### Circular Layout Strategies

```typescript
// Basic circular layout
const basicResult = applyCircularLayout(graphData);

// Progression-optimized layout
const progressionResult = applyProgressionOptimizedCircularLayout(graphData);

// Section-optimized layout
const sectionResult = applySectionOptimizedCircularLayout(graphData);

// Custom options layout
const customLayout = createCircularLayout({
  innerRadius: 100,
  outerRadius: 400,
  startAngle: 0,
  endAngle: 2 * Math.PI,
  preventOverlaps: true
});
```

### 4. Grid Layout Metadata

GridLayout algorithm tạo structured grid arrangement với metadata tối ưu hóa:

```typescript
interface GridLayoutResult {
  nodes: RoadmapNode[];
  edges: RoadmapEdge[];
  bounds: LayoutBounds;
  metadata: GridLayoutMetadata;
}

interface GridLayoutMetadata {
  layoutTime: number;
  nodeCount: number;
  gridDimensions: {
    columns: number;
    rows: number;
  };
  cellDimensions: {
    width: number;
    height: number;
  };
  utilization: number; // 0-1, percentage of grid cells used
  aspectRatio: number;
  sortingApplied: string;
  groupingApplied: string;
}

interface GridLayoutOptions {
  width?: number;
  height?: number;
  columns?: number;
  rows?: number;
  cellWidth?: number;
  cellHeight?: number;
  padding?: number;
  autoSize?: boolean;
  aspectRatio?: number;
  sortBy?: 'level' | 'section' | 'difficulty' | 'none';
  groupBy?: 'section' | 'level' | 'none';
  contentOptimized?: boolean;
}
```

#### Grid Layout Features

1. **Structured Positioning**: Nodes được đặt trong grid cells có tổ chức
2. **Automatic Sizing**: Tự động tính toán kích thước grid tối ưu dựa trên content
3. **Content Optimization**: Điều chỉnh cell sizes dựa trên node content và labels
4. **Smart Organization**: Sắp xếp và nhóm nodes theo level, section hoặc difficulty
5. **Aspect Ratio Control**: Duy trì tỷ lệ khung hình mong muốn cho layout

#### Grid Layout Strategies

```typescript
// Basic grid layout
const basicResult = applyGridLayout(graphData);

// Content-optimized layout
const contentResult = applyContentOptimizedGridLayout(graphData);

// Auto-sized layout
const autoResult = applyAutoSizedGridLayout(graphData);

// Custom options layout
const customLayout = createGridLayout({
  columns: 4,
  rows: 3,
  cellWidth: 200,
  cellHeight: 150,
  padding: 20,
  sortBy: 'level',
  groupBy: 'section'
});
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
  | 'reference'
  | 'github'
  | 'website'
  | 'blog'
  | 'podcast';
```

### 2. Advanced Resource Categorization System

Hệ thống phân loại tài nguyên nâng cao sử dụng machine learning-like approach để tự động xác định loại tài nguyên dựa trên URL patterns, domain analysis và content features.

```typescript
interface ResourceFeatures {
  // URL-based features
  domain: string;
  path: string;
  fileExtension?: string;
  
  // Content-based features
  titleKeywords: string[];
  titleLength: number;
  
  // Pattern-based features
  hasVideoIndicators: boolean;
  hasCourseIndicators: boolean;
  hasDocumentationIndicators: boolean;
  hasTutorialIndicators: boolean;
  hasToolIndicators: boolean;
  hasBookIndicators: boolean;
  hasBlogIndicators: boolean;
  hasExampleIndicators: boolean;
  hasGithubIndicators: boolean;
  hasPodcastIndicators: boolean;
  
  // Quality indicators
  isOfficialSource: boolean;
  isEducationalDomain: boolean;
  isCommercialPlatform: boolean;
}

interface CategoryScores {
  github: number;
  video: number;
  course: number;
  documentation: number;
  tutorial: number;
  tool: number;
  book: number;
  blog: number;
  podcast: number;
  example: number;
  article: number;
  website: number;
  reference: number;
}
```

#### Categorization Algorithm

1. **Feature Extraction**: Trích xuất features từ URL và title
2. **Score Calculation**: Tính điểm cho mỗi category dựa trên features
3. **Best Category Selection**: Chọn category có điểm cao nhất

#### Platform Recognition

Hệ thống nhận diện các platform phổ biến:

- **Video Platforms**: YouTube, Vimeo, Twitch, Dailymotion
- **Course Platforms**: Udemy, Coursera, edX, Pluralsight, LinkedIn Learning
- **Documentation Sites**: Official docs, MDN, W3C
- **Tool Sites**: VS Code, JetBrains, Eclipse
- **Book Platforms**: Amazon, O'Reilly, Manning, Packt
- **Blog Platforms**: Medium, Dev.to, Hashnode, Substack
- **Example Platforms**: CodePen, JSFiddle, CodeSandbox, StackBlitz

### 3. Resource Cost và Difficulty Detection

```typescript
type ResourceCost = 'free' | 'paid' | 'subscription' | 'freemium';
type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

// Automatic cost detection
const detectResourceCost = (resource: ExtractedResource): ResourceCost => {
  // Free platforms: GitHub, MDN, W3Schools
  // Paid platforms: Udemy, Pluralsight
  // Subscription: Netflix, LinkedIn Learning
  // Default: free
};

// Automatic difficulty detection
const detectResourceDifficulty = (resource: ExtractedResource): DifficultyLevel => {
  // Keywords: beginner, intro, basic, getting started
  // Keywords: advanced, expert, master, deep dive
  // Keywords: intermediate, medium
  // Default: intermediate
};
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