/**
 * Extractors module exports
 */

// Node Extractor
export {
    NodeExtractor,
    createNodeExtractor,
    extractNodesFromMarkdown,
    extractRoadmapNodesFromMarkdown
} from './node-extractor';

export type {
    GraphNode,
    ExtractedNodes,
    NodeExtractionOptions
} from './node-extractor';

// Relationship Analyzer
export {
    RelationshipAnalyzer,
    createRelationshipAnalyzer,
    analyzeRelationships
} from './relationship-analyzer';

export type {
    Relationship,
    AnalyzedRelationships,
    RelationshipAnalysisOptions
} from './relationship-analyzer';

// Edge Generator
export {
    EdgeGenerator,
    createEdgeGenerator,
    generateEdges,
    generateAndValidateEdges
} from './edge-generator';

export type {
    EdgeGenerationOptions,
    GeneratedEdges
} from './edge-generator';

// Hierarchy Processor
export {
    HierarchyProcessor,
    createHierarchyProcessor,
    processNodeHierarchy,
    validateHierarchyStructure
} from './hierarchy-processor';

export type {
    HierarchyRelationship,
    ProcessedHierarchy,
    HierarchyProcessingOptions,
    HierarchyValidationResult,
    MalformedStructure,
    HierarchyFix
} from './hierarchy-processor';

// Resource Extractor
export {
    ResourceExtractor,
    createResourceExtractor,
    extractResourcesFromContent,
    getResourceStatistics
} from './resource-extractor';

export type {
    ResourceNode,
    ExtractedResource,
    ResourceMetadata,
    ResourceExtractionOptions,
    ResourceExtractionResult,
    ResourceType,
    ResourceCost,
    DifficultyLevel
} from './resource-extractor';