/**
 * Core types and interfaces for roadmap visualization
 */

/**
 * Node type categories
 */
export type NodeType = 'topic' | 'skill' | 'milestone' | 'resource' | 'prerequisite';

/**
 * Node category for navigation behavior
 */
export type NodeCategory = 'role' | 'skill';

/**
 * Node difficulty levels
 */
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

/**
 * Layout algorithm types
 */
export type LayoutType = 'hierarchical' | 'force' | 'circular' | 'grid';

/**
 * View modes for visualization
 */
export type ViewMode = 'overview' | 'detailed' | 'focus';

/**
 * Edge types representing different relationships
 */
export type EdgeType = 'dependency' | 'progression' | 'related' | 'optional';

/**
 * Relationship types between nodes
 */
export type RelationshipType = 'prerequisite' | 'leads-to' | 'related-to' | 'part-of';

/**
 * Position coordinates for node placement
 */
export interface Position {
    x: number;
    y: number;
}

/**
 * Resource information
 */
export interface Resource {
    title: string;
    url: string;
    type: 'article' | 'video' | 'course' | 'documentation' | 'book';
}

/**
 * Node data containing all information about a roadmap node
 * Compatible with React Flow's data requirements
 */
export interface NodeData {
    label: string;
    description?: string;
    level: number;
    section: string;
    estimatedTime?: string;
    difficulty?: DifficultyLevel;
    resources?: Resource[];
    completed?: boolean;

    // Navigation properties (Giai đoạn 3)
    category?: NodeCategory;
    targetRoadmapId?: string; // For role nodes
    targetArticleId?: string; // For skill nodes
    prerequisites?: string[]; // IDs of prerequisite nodes

    // Index signature for React Flow compatibility
    [key: string]: unknown;
}

/**
 * Custom styling for nodes
 */
export interface NodeStyle {
    backgroundColor?: string;
    borderColor?: string;
    color?: string;
    borderWidth?: number;
}

/**
 * Roadmap node representing a topic or skill in the visualization
 */
export interface RoadmapNode {
    id: string;
    type: NodeType;
    position: Position;
    data: NodeData;
    style?: NodeStyle;
}

/**
 * Edge data containing relationship information
 * Compatible with React Flow's data requirements
 */
export interface EdgeData {
    label?: string;
    relationship: RelationshipType;
    strength?: number;
    bidirectional?: boolean;

    // Index signature for React Flow compatibility
    [key: string]: unknown;
}

/**
 * Custom styling for edges
 */
export interface EdgeStyle {
    stroke?: string;
    strokeWidth?: number;
    strokeDasharray?: string;
}

/**
 * Roadmap edge representing a relationship between nodes
 */
export interface RoadmapEdge {
    id: string;
    source: string;
    target: string;
    type: EdgeType;
    data?: EdgeData;
    style?: EdgeStyle;
}

/**
 * Metadata about the graph structure
 */
export interface GraphMetadata {
    totalNodes: number;
    totalEdges: number;
    maxDepth: number;
    layoutType: LayoutType;
    generatedAt: Date;
}

/**
 * Complete graph data structure
 */
export interface GraphData {
    nodes: RoadmapNode[];
    edges: RoadmapEdge[];
    metadata: GraphMetadata;
}

/**
 * Options for content parsing
 */
export interface ParseOptions {
    includeSubsections: boolean;
    maxDepth: number;
    extractDependencies: boolean;
    autoLayout: boolean;
}

/**
 * Markdown section structure
 */
export interface MarkdownSection {
    header: string | null;
    level: number;
    content: string;
    subsections: MarkdownSection[];
}

/**
 * Roadmap data structure (from existing system)
 */
export interface Roadmap {
    id: string;
    title: string;
    slug: string;
    content: string;
    description?: string;
    estimatedTime?: string;
    difficulty?: DifficultyLevel;
    createdAt: Date;
    updatedAt: Date;
}
