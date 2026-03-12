/**
 * EdgeGenerator - Convert relationships thành graph edges
 * 
 * Validates: Requirement 2.2
 */

import { Relationship, AnalyzedRelationships } from './relationship-analyzer';
import { RoadmapEdge, EdgeType, RelationshipType, EdgeData, EdgeStyle } from '../types';

export interface EdgeGenerationOptions {
    includeWeakEdges?: boolean;
    minimumStrength?: number;
    maxEdgesPerNode?: number;
    enableBidirectional?: boolean;
    customStyling?: boolean;
}

export interface GeneratedEdges {
    edges: RoadmapEdge[];
    metadata: {
        totalEdges: number;
        edgesByType: Record<EdgeType, number>;
        averageStrength: number;
        strongestEdge: number;
        weakestEdge: number;
    };
}

export class EdgeGenerator {
    private options: EdgeGenerationOptions;

    constructor(options: EdgeGenerationOptions = {}) {
        this.options = {
            includeWeakEdges: false,
            minimumStrength: 0.3,
            maxEdgesPerNode: 15,
            enableBidirectional: false,
            customStyling: true,
            ...options
        };
    }

    /**
     * Generate graph edges từ analyzed relationships
     */
    generate(analyzedRelationships: AnalyzedRelationships): GeneratedEdges {
        if (!analyzedRelationships || !analyzedRelationships.relationships) {
            throw new Error('AnalyzedRelationships cannot be null or empty');
        }

        const { relationships } = analyzedRelationships;

        // Filter relationships based on options
        const filteredRelationships = this.filterRelationships(relationships);

        // Convert relationships to edges
        const edges = this.convertRelationshipsToEdges(filteredRelationships);

        // Apply edge styling if enabled
        const styledEdges = this.options.customStyling ?
            this.applyEdgeStyling(edges) : edges;

        // Generate metadata
        const metadata = this.generateEdgeMetadata(styledEdges);

        return {
            edges: styledEdges,
            metadata
        };
    }

    /**
     * Filter relationships based on generation options
     */
    private filterRelationships(relationships: Relationship[]): Relationship[] {
        let filtered = [...relationships];

        // Filter by minimum strength
        if (!this.options.includeWeakEdges) {
            filtered = filtered.filter(rel => rel.strength >= this.options.minimumStrength!);
        }

        // Limit edges per node
        if (this.options.maxEdgesPerNode! > 0) {
            filtered = this.limitEdgesPerNode(filtered);
        }

        return filtered;
    }

    /**
     * Limit number of edges per node
     */
    private limitEdgesPerNode(relationships: Relationship[]): Relationship[] {
        const nodeEdgeCount: Record<string, number> = {};
        const limited: Relationship[] = [];

        // Sort by strength (strongest first)
        const sorted = relationships.sort((a, b) => b.strength - a.strength);

        for (const rel of sorted) {
            const sourceCount = nodeEdgeCount[rel.sourceId] || 0;
            const targetCount = nodeEdgeCount[rel.targetId] || 0;

            // Check if either node has reached the limit
            if (sourceCount < this.options.maxEdgesPerNode! &&
                targetCount < this.options.maxEdgesPerNode!) {

                limited.push(rel);
                nodeEdgeCount[rel.sourceId] = sourceCount + 1;
                nodeEdgeCount[rel.targetId] = targetCount + 1;
            }
        }

        return limited;
    }

    /**
     * Convert relationships to RoadmapEdge objects
     */
    private convertRelationshipsToEdges(relationships: Relationship[]): RoadmapEdge[] {
        const edges: RoadmapEdge[] = [];

        for (const relationship of relationships) {
            const edge = this.createEdgeFromRelationship(relationship);
            edges.push(edge);

            // Create bidirectional edge if enabled and appropriate
            if (this.options.enableBidirectional && this.shouldCreateBidirectionalEdge(relationship)) {
                const reverseEdge = this.createReverseEdge(relationship);
                edges.push(reverseEdge);
            }
        }

        return edges;
    }

    /**
     * Create a RoadmapEdge from a Relationship
     */
    private createEdgeFromRelationship(relationship: Relationship): RoadmapEdge {
        const edgeId = this.generateEdgeId(relationship.sourceId, relationship.targetId);

        const edgeData: EdgeData = {
            label: this.generateEdgeLabel(relationship),
            relationship: relationship.type,
            strength: relationship.strength,
            bidirectional: false
        };

        return {
            id: edgeId,
            source: relationship.sourceId,
            target: relationship.targetId,
            type: relationship.edgeType,
            data: edgeData
        };
    }

    /**
     * Create reverse edge for bidirectional relationships
     */
    private createReverseEdge(relationship: Relationship): RoadmapEdge {
        const edgeId = this.generateEdgeId(relationship.targetId, relationship.sourceId);

        const reverseType = this.getReverseRelationshipType(relationship.type);
        const reverseEdgeType = this.getReverseEdgeType(relationship.edgeType);

        const edgeData: EdgeData = {
            label: this.generateReverseEdgeLabel(relationship),
            relationship: reverseType,
            strength: relationship.strength * 0.8, // Slightly lower strength for reverse
            bidirectional: true
        };

        return {
            id: edgeId,
            source: relationship.targetId,
            target: relationship.sourceId,
            type: reverseEdgeType,
            data: edgeData
        };
    }

    /**
     * Generate unique edge ID
     */
    private generateEdgeId(sourceId: string, targetId: string): string {
        return `edge-${sourceId}-${targetId}`;
    }

    /**
     * Generate edge label based on relationship
     */
    private generateEdgeLabel(relationship: Relationship): string {
        const labels: Record<RelationshipType, string> = {
            'prerequisite': 'requires',
            'leads-to': 'leads to',
            'related-to': 'related',
            'part-of': 'contains'
        };

        return labels[relationship.type] || 'connected';
    }

    /**
     * Generate reverse edge label
     */
    private generateReverseEdgeLabel(relationship: Relationship): string {
        const reverseLabels: Record<RelationshipType, string> = {
            'prerequisite': 'enables',
            'leads-to': 'follows',
            'related-to': 'related',
            'part-of': 'part of'
        };

        return reverseLabels[relationship.type] || 'connected';
    }

    /**
     * Get reverse relationship type
     */
    private getReverseRelationshipType(type: RelationshipType): RelationshipType {
        const reverseMap: Record<RelationshipType, RelationshipType> = {
            'prerequisite': 'leads-to',
            'leads-to': 'prerequisite',
            'related-to': 'related-to',
            'part-of': 'part-of'
        };

        return reverseMap[type] || type;
    }

    /**
     * Get reverse edge type
     */
    private getReverseEdgeType(type: EdgeType): EdgeType {
        const reverseMap: Record<EdgeType, EdgeType> = {
            'dependency': 'progression',
            'progression': 'dependency',
            'related': 'related',
            'optional': 'optional'
        };

        return reverseMap[type] || type;
    }

    /**
     * Determine if a bidirectional edge should be created
     */
    private shouldCreateBidirectionalEdge(relationship: Relationship): boolean {
        // Only create bidirectional edges for certain relationship types
        const bidirectionalTypes: RelationshipType[] = ['related-to'];

        return bidirectionalTypes.includes(relationship.type) &&
            relationship.strength >= 0.6; // Only for strong relationships
    }

    /**
     * Apply custom styling to edges based on their properties
     */
    private applyEdgeStyling(edges: RoadmapEdge[]): RoadmapEdge[] {
        return edges.map(edge => ({
            ...edge,
            style: this.generateEdgeStyle(edge)
        }));
    }

    /**
     * Generate edge style based on edge properties
     */
    private generateEdgeStyle(edge: RoadmapEdge): EdgeStyle {
        const strength = edge.data?.strength || 0.5;
        const edgeType = edge.type;

        // Base style
        const style: EdgeStyle = {
            strokeWidth: this.calculateStrokeWidth(strength),
            stroke: this.getEdgeColor(edgeType, strength)
        };

        // Add dash pattern for certain edge types
        if (edgeType === 'optional') {
            style.strokeDasharray = '5,5';
        } else if (edgeType === 'related') {
            style.strokeDasharray = '3,3';
        }

        return style;
    }

    /**
     * Calculate stroke width based on relationship strength
     */
    private calculateStrokeWidth(strength: number): number {
        // Map strength (0-1) to stroke width (1-4)
        return Math.max(1, Math.min(4, 1 + (strength * 3)));
    }

    /**
     * Get edge color based on type and strength
     */
    private getEdgeColor(edgeType: EdgeType, strength: number): string {
        const baseColors: Record<EdgeType, string> = {
            'dependency': '#dc2626', // Red for dependencies
            'progression': '#16a34a', // Green for progression
            'related': '#2563eb',     // Blue for related
            'optional': '#6b7280'     // Gray for optional
        };

        const baseColor = baseColors[edgeType] || '#6b7280';

        // Adjust opacity based on strength
        const opacity = Math.max(0.3, Math.min(1.0, strength));

        return this.addOpacityToColor(baseColor, opacity);
    }

    /**
     * Add opacity to a hex color
     */
    private addOpacityToColor(hexColor: string, opacity: number): string {
        // Convert hex to RGB and add alpha
        const hex = hexColor.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);

        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }

    /**
     * Generate metadata for the generated edges
     */
    private generateEdgeMetadata(edges: RoadmapEdge[]): GeneratedEdges['metadata'] {
        const edgesByType: Record<EdgeType, number> = {
            'dependency': 0,
            'progression': 0,
            'related': 0,
            'optional': 0
        };

        let totalStrength = 0;
        let maxStrength = 0;
        let minStrength = 1;

        for (const edge of edges) {
            edgesByType[edge.type]++;

            const strength = edge.data?.strength || 0;
            totalStrength += strength;
            maxStrength = Math.max(maxStrength, strength);
            minStrength = Math.min(minStrength, strength);
        }

        return {
            totalEdges: edges.length,
            edgesByType,
            averageStrength: edges.length > 0 ? totalStrength / edges.length : 0,
            strongestEdge: maxStrength,
            weakestEdge: edges.length > 0 ? minStrength : 0
        };
    }

    /**
     * Validate generated edges
     */
    validateEdges(edges: RoadmapEdge[], nodeIds: Set<string>): boolean {
        for (const edge of edges) {
            // Check if source and target nodes exist
            if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) {
                return false;
            }

            // Check for self-referencing edges
            if (edge.source === edge.target) {
                return false;
            }

            // Validate edge ID format
            if (!edge.id || typeof edge.id !== 'string') {
                return false;
            }

            // Validate strength if present
            if (edge.data?.strength !== undefined) {
                const strength = edge.data.strength;
                if (typeof strength !== 'number' || strength < 0 || strength > 1) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Remove duplicate edges (same source and target)
     */
    removeDuplicateEdges(edges: RoadmapEdge[]): RoadmapEdge[] {
        const seen = new Set<string>();
        const unique: RoadmapEdge[] = [];

        for (const edge of edges) {
            const key = `${edge.source}-${edge.target}`;

            if (!seen.has(key)) {
                seen.add(key);
                unique.push(edge);
            }
        }

        return unique;
    }

    /**
     * Optimize edge layout for better visualization
     */
    optimizeEdgeLayout(edges: RoadmapEdge[]): RoadmapEdge[] {
        // Sort edges by strength (strongest first for better visual hierarchy)
        return edges.sort((a, b) => {
            const strengthA = a.data?.strength || 0;
            const strengthB = b.data?.strength || 0;
            return strengthB - strengthA;
        });
    }
}

/**
 * Factory function để create EdgeGenerator với options
 */
export function createEdgeGenerator(options?: EdgeGenerationOptions): EdgeGenerator {
    return new EdgeGenerator(options);
}

/**
 * Utility function để generate edges từ analyzed relationships
 */
export function generateEdges(
    analyzedRelationships: AnalyzedRelationships,
    options?: EdgeGenerationOptions
): GeneratedEdges {
    const generator = createEdgeGenerator(options);
    return generator.generate(analyzedRelationships);
}

/**
 * Utility function để generate và validate edges
 */
export function generateAndValidateEdges(
    analyzedRelationships: AnalyzedRelationships,
    nodeIds: Set<string>,
    options?: EdgeGenerationOptions
): GeneratedEdges {
    const generator = createEdgeGenerator(options);
    const result = generator.generate(analyzedRelationships);

    // Validate edges
    const isValid = generator.validateEdges(result.edges, nodeIds);
    if (!isValid) {
        throw new Error('Generated edges failed validation');
    }

    // Remove duplicates and optimize
    const optimizedEdges = generator.optimizeEdgeLayout(
        generator.removeDuplicateEdges(result.edges)
    );

    return {
        ...result,
        edges: optimizedEdges,
        metadata: {
            ...result.metadata,
            totalEdges: optimizedEdges.length
        }
    };
}