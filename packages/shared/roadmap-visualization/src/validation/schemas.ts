/**
 * Zod validation schemas for roadmap visualization data structures
 */

import { z } from 'zod';

/**
 * Position schema
 */
export const PositionSchema = z.object({
    x: z.number().finite(),
    y: z.number().finite(),
});

/**
 * Resource schema
 */
export const ResourceSchema = z.object({
    title: z.string().min(1),
    url: z.string().url(),
    type: z.enum(['article', 'video', 'course', 'documentation', 'book']),
});

/**
 * Node data schema
 */
export const NodeDataSchema = z.object({
    label: z.string().min(1),
    description: z.string().optional(),
    level: z.number().int().nonnegative(),
    section: z.string().min(1),
    estimatedTime: z.string().optional(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    resources: z.array(ResourceSchema).optional(),
    completed: z.boolean().optional(),
});

/**
 * Node style schema
 */
export const NodeStyleSchema = z.object({
    backgroundColor: z.string().optional(),
    borderColor: z.string().optional(),
    color: z.string().optional(),
    borderWidth: z.number().optional(),
});

/**
 * Roadmap node schema
 */
export const RoadmapNodeSchema = z.object({
    id: z.string().min(1),
    type: z.enum(['topic', 'skill', 'milestone', 'resource', 'prerequisite']),
    position: PositionSchema,
    data: NodeDataSchema,
    style: NodeStyleSchema.optional(),
});

/**
 * Edge data schema
 */
export const EdgeDataSchema = z.object({
    label: z.string().optional(),
    relationship: z.enum(['prerequisite', 'leads-to', 'related-to', 'part-of']),
    strength: z.number().min(0).max(1).optional(),
    bidirectional: z.boolean().optional(),
});

/**
 * Edge style schema
 */
export const EdgeStyleSchema = z.object({
    stroke: z.string().optional(),
    strokeWidth: z.number().optional(),
    strokeDasharray: z.string().optional(),
});

/**
 * Roadmap edge schema
 */
export const RoadmapEdgeSchema = z.object({
    id: z.string().min(1),
    source: z.string().min(1),
    target: z.string().min(1),
    type: z.enum(['dependency', 'progression', 'related', 'optional']),
    data: EdgeDataSchema.optional(),
    style: EdgeStyleSchema.optional(),
}).refine(
    (edge) => edge.source !== edge.target,
    { message: 'Edge cannot reference itself (source === target)' }
);

/**
 * Graph metadata schema
 */
export const GraphMetadataSchema = z.object({
    totalNodes: z.number().int().nonnegative(),
    totalEdges: z.number().int().nonnegative(),
    maxDepth: z.number().int().nonnegative(),
    layoutType: z.enum(['hierarchical', 'force', 'circular', 'grid']),
    generatedAt: z.date(),
});

/**
 * Graph data schema with validation rules
 */
export const GraphDataSchema = z.object({
    nodes: z.array(RoadmapNodeSchema).min(1, 'Graph must have at least one node'),
    edges: z.array(RoadmapEdgeSchema),
    metadata: GraphMetadataSchema,
}).refine(
    (data) => {
        // Validate that all edge sources and targets reference existing nodes
        const nodeIds = new Set(data.nodes.map(n => n.id));
        return data.edges.every(edge =>
            nodeIds.has(edge.source) && nodeIds.has(edge.target)
        );
    },
    { message: 'All edge source and target IDs must reference existing nodes' }
).refine(
    (data) => {
        // Validate that node IDs are unique
        const nodeIds = data.nodes.map(n => n.id);
        return nodeIds.length === new Set(nodeIds).size;
    },
    { message: 'Node IDs must be unique within the graph' }
);

/**
 * Parse options schema
 */
export const ParseOptionsSchema = z.object({
    includeSubsections: z.boolean(),
    maxDepth: z.number().int().positive(),
    extractDependencies: z.boolean(),
    autoLayout: z.boolean(),
});

/**
 * Markdown section schema
 */
export const MarkdownSectionSchema: z.ZodType<any> = z.lazy(() => z.object({
    header: z.string().nullable(),
    level: z.number().int().nonnegative(),
    content: z.string(),
    subsections: z.array(MarkdownSectionSchema),
}));
