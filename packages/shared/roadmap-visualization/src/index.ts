/**
 * Roadmap Visualization Package
 * 
 * Main entry point for the roadmap visualization library
 */

// Export types
export type {
    NodeType,
    DifficultyLevel,
    LayoutType,
    ViewMode,
    EdgeType,
    RelationshipType,
    Position,
    Resource,
    NodeData,
    NodeStyle,
    RoadmapNode,
    EdgeData,
    EdgeStyle,
    RoadmapEdge,
    GraphMetadata,
    GraphData,
    ParseOptions,
    MarkdownSection,
    Roadmap,
} from './types';

// Export validation
export {
    validateGraphData,
    validateNode,
    validateEdge,
    validateGraphStructure,
    PositionSchema,
    ResourceSchema,
    NodeDataSchema,
    NodeStyleSchema,
    RoadmapNodeSchema,
    EdgeDataSchema,
    EdgeStyleSchema,
    RoadmapEdgeSchema,
    GraphMetadataSchema,
    GraphDataSchema,
    ParseOptionsSchema,
    MarkdownSectionSchema,
} from './validation';

// Export validation types (Giai đoạn 3)
export type { ValidationError, ValidationResult } from './validation';

// Export new validation functions (Giai đoạn 3)
export {
    validateNodeCategory,
    validateNodePrerequisites,
    validateNodeComplete,
    validateMinimumNodes,
    validateAllNodes,
} from './validation';

// Export edge validation and relationship management (Task 3.1.5)
export type {
    CircularDependencyResult,
} from './validation';

export {
    validateEdges,
    detectCircularDependencies,
    calculateRelationshipStrength,
    calculateAllRelationshipStrengths,
} from './validation';

// Export parser
export {
    ContentParser,
    createContentParser,
} from './parser';

// Export markdown parser
export {
    MarkdownParser,
    type MarkdownParseOptions,
    type MarkdownParseResult,
    type MarkdownHeader,
    type MarkdownValidationResult,
} from './parsers';

// Export extractors
export {
    NodeExtractor,
    createNodeExtractor,
    extractNodesFromMarkdown,
    extractRoadmapNodesFromMarkdown,
    type GraphNode,
    type ExtractedNodes,
    type NodeExtractionOptions,
} from './extractors/node-extractor';

export {
    RelationshipAnalyzer,
    createRelationshipAnalyzer,
    analyzeRelationships,
    type Relationship,
    type AnalyzedRelationships,
    type RelationshipAnalysisOptions,
} from './extractors/relationship-analyzer';

export {
    EdgeGenerator,
    createEdgeGenerator,
    generateEdges,
    generateAndValidateEdges,
    type EdgeGenerationOptions,
    type GeneratedEdges,
} from './extractors/edge-generator';

export {
    HierarchyProcessor,
    createHierarchyProcessor,
    processNodeHierarchy,
    validateHierarchyStructure,
    type HierarchyRelationship,
    type ProcessedHierarchy,
    type HierarchyProcessingOptions,
} from './extractors/hierarchy-processor';

// Export utilities
export {
    generateId,
    calculateDistance,
    nodesOverlap,
    groupNodesByLevel,
    calculateBoundingBox,
    normalizeNodePositions,
    formatTime,
    getDifficultyColor,
    debounce,
    throttle,
} from './utils';

// Export layouts
export {
    HierarchicalLayout,
    createHierarchicalLayout,
    applyHierarchicalLayout,
    applyProgressionOptimizedLayout,
    getOptimalHierarchicalOptions,
    ForceDirectedLayout,
    createForceDirectedLayout,
    applyForceDirectedLayout,
    applyRelationshipOptimizedLayout,
    getOptimalForceDirectedOptions,
    applyClusteredForceLayout,
    applyCircularLayout,
    GridLayout,
    createGridLayout,
    applyGridLayout,
    applyContentOptimizedGridLayout,
    getOptimalGridOptions,
    applyAutoSizedGridLayout,
    applyLayoutAlgorithm,
    LayoutManager,
    createLayoutManager,
    switchLayoutWithTransition,
    applyLayoutDirect,
    getOptimalTransitionOptions,
} from './layouts';

export type {
    LayoutOptions,
    HierarchicalLayoutOptions,
    HierarchicalLayoutResult,
    ForceDirectedLayoutOptions,
    ForceDirectedLayoutResult,
    GridLayoutOptions,
    GridLayoutResult,
    LayoutManagerOptions,
    LayoutTransition,
    LayoutManagerState,
    LayoutManagerResult
} from './layouts';

// Export navigation (Giai đoạn 3)
export type { NavigationResult, ArticleMetadata } from './navigation';
export {
    getNodeNavigationUrl,
    canNavigate,
    getCategoryDisplayName,
    getCategoryIcon,
    validateNodeNavigation,
    isExternalUrl,
    getArticlePreview,
} from './navigation';

// Export NodeCategory type
export type { NodeCategory } from './types';

// Export metadata (Giai đoạn 3)
export type {
    NodeMetadataSummary,
    DifficultyInfo,
    TimeEstimate,
} from './metadata';

export {
    getNodeMetadataSummary,
    getDifficultyInfo,
    parseEstimatedTime,
    formatEstimatedTime,
    compareDifficulty,
    hasCompleteMetadata,
    getMissingMetadata,
    calculateTotalTime,
    formatTotalTime,
    getPrerequisiteChain,
    isNodeReady,
    getNodesByDifficulty,
    sortNodesByDifficulty,
} from './metadata';
