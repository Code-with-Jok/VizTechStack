/**
 * RelationshipAnalyzer - Analyze content structure để identify relationships
 * 
 * Validates: Requirement 2.2
 */

import { GraphNode } from './node-extractor';
import { RelationshipType, EdgeType } from '../types';

export interface Relationship {
    sourceId: string;
    targetId: string;
    type: RelationshipType;
    edgeType: EdgeType;
    strength: number; // 0-1, confidence level of the relationship
    evidence: string[]; // Text evidence that supports this relationship
}

export interface AnalyzedRelationships {
    relationships: Relationship[];
    metadata: {
        totalRelationships: number;
        relationshipsByType: Record<RelationshipType, number>;
        averageStrength: number;
        hierarchicalDepth: number;
    };
}

export interface RelationshipAnalysisOptions {
    includeHierarchical?: boolean;
    includeCrossReferences?: boolean;
    includeImplicitDependencies?: boolean;
    minimumStrength?: number;
    maxRelationshipsPerNode?: number;
}

export class RelationshipAnalyzer {
    private options: RelationshipAnalysisOptions;

    constructor(options: RelationshipAnalysisOptions = {}) {
        this.options = {
            includeHierarchical: true,
            includeCrossReferences: true,
            includeImplicitDependencies: true,
            minimumStrength: 0.3,
            maxRelationshipsPerNode: 10,
            ...options
        };
    }

    /**
     * Analyze relationships between nodes
     */
    analyze(nodes: GraphNode[], originalContent: string): AnalyzedRelationships {
        if (!nodes || nodes.length === 0) {
            throw new Error('Nodes array cannot be empty');
        }

        if (!originalContent || typeof originalContent !== 'string') {
            throw new Error('Original content must be a non-empty string');
        }

        const relationships: Relationship[] = [];

        // 1. Detect parent-child relationships từ header hierarchy
        if (this.options.includeHierarchical) {
            const hierarchicalRels = this.detectHierarchicalRelationships(nodes);
            relationships.push(...hierarchicalRels);
        }

        // 2. Identify cross-references trong content
        if (this.options.includeCrossReferences) {
            const crossRefRels = this.identifyCrossReferences(nodes, originalContent);
            relationships.push(...crossRefRels);
        }

        // 3. Detect implicit dependencies
        if (this.options.includeImplicitDependencies) {
            const implicitRels = this.detectImplicitDependencies(nodes);
            relationships.push(...implicitRels);
        }

        // Filter by minimum strength and limit per node
        const filteredRelationships = this.filterAndLimitRelationships(relationships);

        return {
            relationships: filteredRelationships,
            metadata: this.generateMetadata(filteredRelationships, nodes)
        };
    }

    /**
     * Detect parent-child relationships từ header hierarchy
     */
    private detectHierarchicalRelationships(nodes: GraphNode[]): Relationship[] {
        const relationships: Relationship[] = [];

        // Sort nodes by level để process hierarchy correctly
        const sortedNodes = [...nodes].sort((a, b) => a.level - b.level);

        for (let i = 0; i < sortedNodes.length; i++) {
            const currentNode = sortedNodes[i];

            // Find parent node (closest node with lower level)
            const parentNode = this.findParentNode(currentNode, sortedNodes.slice(0, i));

            if (parentNode) {
                relationships.push({
                    sourceId: parentNode.id,
                    targetId: currentNode.id,
                    type: 'part-of',
                    edgeType: 'dependency',
                    strength: 0.9, // High confidence for hierarchical relationships
                    evidence: [
                        `"${currentNode.title}" is a subsection of "${parentNode.title}"`,
                        `Level ${currentNode.level} under level ${parentNode.level}`
                    ]
                });
            }
        }

        return relationships;
    }

    /**
     * Find parent node cho current node dựa trên hierarchy
     */
    private findParentNode(currentNode: GraphNode, previousNodes: GraphNode[]): GraphNode | null {
        // Find the most recent node with a lower level
        for (let i = previousNodes.length - 1; i >= 0; i--) {
            const candidate = previousNodes[i];
            if (candidate.level < currentNode.level) {
                return candidate;
            }
        }
        return null;
    }

    /**
     * Identify cross-references trong content
     */
    private identifyCrossReferences(nodes: GraphNode[], originalContent: string): Relationship[] {
        const relationships: Relationship[] = [];

        for (const sourceNode of nodes) {
            for (const targetNode of nodes) {
                if (sourceNode.id === targetNode.id) continue;

                const crossRefs = this.findCrossReferencesInContent(
                    sourceNode,
                    targetNode,
                    originalContent
                );

                relationships.push(...crossRefs);
            }
        }

        return relationships;
    }

    /**
     * Find cross-references between two specific nodes
     */
    private findCrossReferencesInContent(
        sourceNode: GraphNode,
        targetNode: GraphNode,
        content: string
    ): Relationship[] {
        const relationships: Relationship[] = [];
        const evidence: string[] = [];
        let strength = 0;

        // Check for direct title mentions
        const targetTitleVariations = this.generateTitleVariations(targetNode.title);
        const sourceContent = sourceNode.content.toLowerCase();

        for (const variation of targetTitleVariations) {
            if (sourceContent.includes(variation.toLowerCase())) {
                evidence.push(`"${sourceNode.title}" mentions "${variation}"`);
                strength += 0.3;
            }
        }

        // Check for link references
        const linkPattern = new RegExp(`\\[([^\\]]*${this.escapeRegex(targetNode.title)}[^\\]]*)\\]\\([^)]+\\)`, 'gi');
        const linkMatches = sourceNode.content.match(linkPattern);

        if (linkMatches) {
            evidence.push(`Link reference found: ${linkMatches[0]}`);
            strength += 0.4;
        }

        // Check for anchor references
        const anchorPattern = new RegExp(`#${this.escapeRegex(targetNode.id)}|#${this.escapeRegex(this.slugify(targetNode.title))}`, 'gi');
        const anchorMatches = sourceNode.content.match(anchorPattern);

        if (anchorMatches) {
            evidence.push(`Anchor reference found: ${anchorMatches[0]}`);
            strength += 0.5;
        }

        // Check for prerequisite keywords
        const prerequisiteKeywords = [
            'before', 'first', 'prerequisite', 'required', 'need to know',
            'must understand', 'should learn', 'depends on', 'requires'
        ];

        for (const keyword of prerequisiteKeywords) {
            const pattern = new RegExp(`${keyword}[^.]*${this.escapeRegex(targetNode.title)}`, 'gi');
            if (sourceContent.match(pattern)) {
                evidence.push(`Prerequisite relationship: "${keyword}" found with target`);
                strength += 0.6;

                // This indicates a prerequisite relationship
                relationships.push({
                    sourceId: targetNode.id, // Target is prerequisite of source
                    targetId: sourceNode.id,
                    type: 'prerequisite',
                    edgeType: 'dependency',
                    strength: Math.min(strength, 1.0),
                    evidence
                });
                return relationships;
            }
        }

        // Check for progression keywords
        const progressionKeywords = [
            'next', 'then', 'after', 'following', 'leads to', 'continues with',
            'move on to', 'proceed to', 'advance to'
        ];

        for (const keyword of progressionKeywords) {
            const pattern = new RegExp(`${keyword}[^.]*${this.escapeRegex(targetNode.title)}`, 'gi');
            if (sourceContent.match(pattern)) {
                evidence.push(`Progression relationship: "${keyword}" found with target`);
                strength += 0.5;

                relationships.push({
                    sourceId: sourceNode.id,
                    targetId: targetNode.id,
                    type: 'leads-to',
                    edgeType: 'progression',
                    strength: Math.min(strength, 1.0),
                    evidence
                });
                return relationships;
            }
        }

        // If we found evidence but no specific relationship type, it's a general reference
        if (evidence.length > 0 && strength >= this.options.minimumStrength!) {
            relationships.push({
                sourceId: sourceNode.id,
                targetId: targetNode.id,
                type: 'related-to',
                edgeType: 'related',
                strength: Math.min(strength, 1.0),
                evidence
            });
        }

        return relationships;
    }

    /**
     * Detect implicit dependencies dựa trên content analysis
     */
    private detectImplicitDependencies(nodes: GraphNode[]): Relationship[] {
        const relationships: Relationship[] = [];

        for (const sourceNode of nodes) {
            for (const targetNode of nodes) {
                if (sourceNode.id === targetNode.id) continue;

                const implicitRel = this.analyzeImplicitDependency(sourceNode, targetNode);
                if (implicitRel) {
                    relationships.push(implicitRel);
                }
            }
        }

        return relationships;
    }

    /**
     * Analyze implicit dependency between two nodes
     */
    private analyzeImplicitDependency(sourceNode: GraphNode, targetNode: GraphNode): Relationship | null {
        const evidence: string[] = [];
        let strength = 0;

        // Check difficulty progression (beginner -> intermediate -> advanced)
        const difficultyOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
        const sourceDifficulty = sourceNode.metadata.difficulty;
        const targetDifficulty = targetNode.metadata.difficulty;

        if (sourceDifficulty && targetDifficulty) {
            const sourceLevel = difficultyOrder[sourceDifficulty];
            const targetLevel = difficultyOrder[targetDifficulty];

            if (sourceLevel < targetLevel) {
                evidence.push(`Difficulty progression: ${sourceDifficulty} → ${targetDifficulty}`);
                strength += 0.4;
            }
        }

        // Check level progression (lower levels typically come before higher levels)
        if (sourceNode.level < targetNode.level) {
            evidence.push(`Level progression: ${sourceNode.level} → ${targetNode.level}`);
            strength += 0.3;
        }

        // Check for common technology stacks
        const techStackDependencies = this.analyzeTechStackDependencies(sourceNode, targetNode);
        if (techStackDependencies) {
            evidence.push(techStackDependencies.evidence);
            strength += techStackDependencies.strength;
        }

        // Check for shared tags/keywords
        const sharedTags = this.findSharedTags(sourceNode, targetNode);
        if (sharedTags.length > 0) {
            evidence.push(`Shared concepts: ${sharedTags.join(', ')}`);
            strength += Math.min(sharedTags.length * 0.1, 0.3);
        }

        if (strength >= this.options.minimumStrength! && evidence.length > 0) {
            return {
                sourceId: sourceNode.id,
                targetId: targetNode.id,
                type: 'prerequisite',
                edgeType: 'dependency',
                strength: Math.min(strength, 1.0),
                evidence
            };
        }

        return null;
    }

    /**
     * Analyze technology stack dependencies
     */
    private analyzeTechStackDependencies(sourceNode: GraphNode, targetNode: GraphNode): { evidence: string; strength: number } | null {
        const techDependencies: Record<string, string[]> = {
            'html': [],
            'css': ['html'],
            'javascript': ['html', 'css'],
            'typescript': ['javascript'],
            'react': ['javascript', 'html', 'css'],
            'vue': ['javascript', 'html', 'css'],
            'angular': ['typescript', 'html', 'css'],
            'node': ['javascript'],
            'express': ['node', 'javascript'],
            'mongodb': [],
            'sql': [],
            'postgresql': ['sql'],
            'mysql': ['sql'],
            'git': [],
            'github': ['git'],
            'docker': [],
            'kubernetes': ['docker'],
            'aws': [],
            'testing': ['javascript'],
            'jest': ['testing', 'javascript']
        };

        const sourceTitle = sourceNode.title.toLowerCase();
        const targetTitle = targetNode.title.toLowerCase();

        for (const [tech, dependencies] of Object.entries(techDependencies)) {
            if (targetTitle.includes(tech)) {
                for (const dependency of dependencies) {
                    if (sourceTitle.includes(dependency)) {
                        return {
                            evidence: `Technology dependency: ${dependency} is prerequisite for ${tech}`,
                            strength: 0.6
                        };
                    }
                }
            }
        }

        return null;
    }

    /**
     * Find shared tags between two nodes
     */
    private findSharedTags(sourceNode: GraphNode, targetNode: GraphNode): string[] {
        const sourceTags = sourceNode.metadata.tags || [];
        const targetTags = targetNode.metadata.tags || [];

        return sourceTags.filter(tag => targetTags.includes(tag));
    }

    /**
     * Generate title variations để improve matching
     */
    private generateTitleVariations(title: string): string[] {
        const variations = [title];

        // Add lowercase version
        variations.push(title.toLowerCase());

        // Add version without special characters
        variations.push(title.replace(/[^\w\s]/g, ''));

        // Add slugified version
        variations.push(this.slugify(title));

        // Add version with common abbreviations
        const abbreviations: Record<string, string> = {
            'javascript': 'js',
            'typescript': 'ts',
            'cascading style sheets': 'css',
            'hypertext markup language': 'html',
            'application programming interface': 'api',
            'user interface': 'ui',
            'user experience': 'ux'
        };

        const lowerTitle = title.toLowerCase();
        for (const [full, abbr] of Object.entries(abbreviations)) {
            if (lowerTitle.includes(full)) {
                variations.push(title.replace(new RegExp(full, 'gi'), abbr));
            }
            if (lowerTitle.includes(abbr)) {
                variations.push(title.replace(new RegExp(abbr, 'gi'), full));
            }
        }

        return [...new Set(variations)];
    }

    /**
     * Escape special regex characters
     */
    private escapeRegex(text: string): string {
        return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    /**
     * Convert text to slug format
     */
    private slugify(text: string): string {
        return text
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    /**
     * Filter relationships by strength and limit per node
     */
    private filterAndLimitRelationships(relationships: Relationship[]): Relationship[] {
        // Filter by minimum strength
        const filtered = relationships.filter(rel => rel.strength >= this.options.minimumStrength!);

        // Group by source node and limit per node
        const groupedBySource: Record<string, Relationship[]> = {};

        for (const rel of filtered) {
            if (!groupedBySource[rel.sourceId]) {
                groupedBySource[rel.sourceId] = [];
            }
            groupedBySource[rel.sourceId].push(rel);
        }

        // Sort by strength and limit
        const limited: Relationship[] = [];

        for (const sourceId in groupedBySource) {
            const sourceRels = groupedBySource[sourceId]
                .sort((a, b) => b.strength - a.strength)
                .slice(0, this.options.maxRelationshipsPerNode!);

            limited.push(...sourceRels);
        }

        return limited;
    }

    /**
     * Generate metadata cho analyzed relationships
     */
    private generateMetadata(relationships: Relationship[], nodes: GraphNode[]): AnalyzedRelationships['metadata'] {
        const relationshipsByType: Record<RelationshipType, number> = {
            'prerequisite': 0,
            'leads-to': 0,
            'related-to': 0,
            'part-of': 0
        };

        let totalStrength = 0;
        let maxLevel = 0;

        for (const rel of relationships) {
            relationshipsByType[rel.type]++;
            totalStrength += rel.strength;
        }

        for (const node of nodes) {
            maxLevel = Math.max(maxLevel, node.level);
        }

        return {
            totalRelationships: relationships.length,
            relationshipsByType,
            averageStrength: relationships.length > 0 ? totalStrength / relationships.length : 0,
            hierarchicalDepth: maxLevel
        };
    }

    /**
     * Validate relationships để ensure they reference existing nodes
     */
    validateRelationships(relationships: Relationship[], nodes: GraphNode[]): boolean {
        const nodeIds = new Set(nodes.map(node => node.id));

        for (const rel of relationships) {
            if (!nodeIds.has(rel.sourceId) || !nodeIds.has(rel.targetId)) {
                return false;
            }
        }

        return true;
    }
}

/**
 * Factory function để create RelationshipAnalyzer với options
 */
export function createRelationshipAnalyzer(options?: RelationshipAnalysisOptions): RelationshipAnalyzer {
    return new RelationshipAnalyzer(options);
}

/**
 * Utility function để analyze relationships từ nodes và content
 */
export function analyzeRelationships(
    nodes: GraphNode[],
    originalContent: string,
    options?: RelationshipAnalysisOptions
): AnalyzedRelationships {
    const analyzer = createRelationshipAnalyzer(options);
    return analyzer.analyze(nodes, originalContent);
}