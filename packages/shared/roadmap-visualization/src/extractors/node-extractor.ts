/**
 * NodeExtractor - Convert markdown headers thành graph nodes
 * 
 * Validates: Requirement 2.1
 */

import { MarkdownSection, MarkdownParser } from '../parsers/markdown-parser';
import {
    NodeType,
    DifficultyLevel,
    Position,
    Resource,
    RoadmapNode,
    NodeData
} from '../types';

export interface GraphNode {
    id: string;
    title: string;
    content: string;
    level: number;
    type: NodeType;
    metadata: {
        wordCount: number;
        estimatedReadTime: number; // in minutes
        difficulty?: DifficultyLevel;
        tags: string[];
        resources?: Resource[];
    };
    position?: Position;
}

export interface ExtractedNodes {
    nodes: GraphNode[];
    metadata: {
        totalNodes: number;
        nodesByLevel: Record<number, number>;
        nodesByType: Record<string, number>;
        averageReadTime: number;
        totalWordCount: number;
    };
}

export interface NodeExtractionOptions {
    includeResources?: boolean;
    maxDepth?: number;
    autoDetectDifficulty?: boolean;
    extractTags?: boolean;
}

export class NodeExtractor {
    private parser: MarkdownParser;
    private options: NodeExtractionOptions;

    constructor(options: NodeExtractionOptions = {}) {
        this.parser = new MarkdownParser();
        this.options = {
            includeResources: true,
            maxDepth: 6,
            autoDetectDifficulty: true,
            extractTags: true,
            ...options
        };
    }

    /**
     * Extract nodes từ markdown content
     */
    extract(content: string): ExtractedNodes {
        if (!content || typeof content !== 'string') {
            throw new Error('Content must be a non-empty string');
        }

        const trimmedContent = content.trim();
        if (!trimmedContent) {
            throw new Error('Content cannot be empty or only whitespace');
        }

        const parsed = this.parser.parse(content);
        const nodes: GraphNode[] = [];

        for (const section of parsed.sections) {
            // Skip sections deeper than maxDepth
            if (section.level > (this.options.maxDepth || 6)) {
                continue;
            }

            const node = this.convertSectionToNode(section);
            nodes.push(node);
        }

        if (nodes.length === 0) {
            throw new Error('No valid nodes could be extracted from the content');
        }

        return {
            nodes,
            metadata: this.generateMetadata(nodes)
        };
    }

    /**
     * Convert markdown section thành graph node
     */
    private convertSectionToNode(section: MarkdownSection): GraphNode {
        const textContent = this.parser.extractTextContent(section.content);
        const wordCount = this.countWords(textContent);
        const estimatedReadTime = Math.ceil(wordCount / 200); // 200 words per minute

        const node: GraphNode = {
            id: this.generateUniqueId(section.id),
            title: section.title,
            content: section.content,
            level: section.level,
            type: this.determineNodeType(section),
            metadata: {
                wordCount,
                estimatedReadTime,
                tags: this.options.extractTags ? this.extractTags(section) : []
            }
        };

        // Add difficulty if auto-detection is enabled
        if (this.options.autoDetectDifficulty) {
            node.metadata.difficulty = this.determineDifficulty(section);
        }

        // Add resources if extraction is enabled
        if (this.options.includeResources) {
            const resources = this.extractResources(section);
            if (resources.length > 0) {
                node.metadata.resources = resources;
            }
        }

        return node;
    }

    /**
     * Generate unique ID để avoid collisions
     */
    private generateUniqueId(baseId: string): string {
        // For now, return the base ID as the MarkdownParser should generate unique IDs
        // In the future, we could add collision detection and resolution
        return baseId;
    }

    /**
     * Convert GraphNode to RoadmapNode format
     */
    convertToRoadmapNode(graphNode: GraphNode): RoadmapNode {
        const nodeData: NodeData = {
            label: graphNode.title,
            description: this.parser.extractTextContent(graphNode.content),
            level: graphNode.level,
            section: graphNode.title,
            estimatedTime: `${graphNode.metadata.estimatedReadTime} min`,
            difficulty: graphNode.metadata.difficulty,
            resources: graphNode.metadata.resources
        };

        return {
            id: graphNode.id,
            type: graphNode.type,
            position: graphNode.position || { x: 0, y: 0 },
            data: nodeData
        };
    }

    /**
     * Extract multiple nodes and convert to RoadmapNode format
     */
    extractAsRoadmapNodes(content: string): RoadmapNode[] {
        const extracted = this.extract(content);
        return extracted.nodes.map(node => this.convertToRoadmapNode(node));
    }

    /**
     * Determine node type dựa trên content và level
     */
    private determineNodeType(section: MarkdownSection): NodeType {
        const title = section.title.toLowerCase();
        const content = section.content.toLowerCase();

        // Check for milestone keywords
        if (title.includes('milestone') || title.includes('checkpoint') ||
            title.includes('goal') || title.includes('objective') ||
            title.includes('achievement')) {
            return 'milestone';
        }

        // Check for prerequisite keywords
        if (title.includes('prerequisite') || title.includes('requirement') ||
            title.includes('before') || title.includes('needed')) {
            return 'prerequisite';
        }

        // Check for resource keywords
        if (title.includes('resource') || title.includes('tool') ||
            title.includes('library') || title.includes('framework') ||
            title.includes('documentation') || title.includes('guide') ||
            content.includes('http') || content.includes('github') ||
            content.includes('npm') || content.includes('cdn')) {
            return 'resource';
        }

        // Check for skill keywords
        if (title.includes('skill') || title.includes('ability') ||
            title.includes('competency') || title.includes('proficiency')) {
            return 'skill';
        }

        // Default to topic for main sections
        return 'topic';
    }

    /**
     * Determine difficulty level dựa trên keywords và content
     */
    private determineDifficulty(section: MarkdownSection): DifficultyLevel {
        const text = (section.title + ' ' + section.content).toLowerCase();

        const beginnerKeywords = [
            'basic', 'intro', 'introduction', 'beginner', 'start', 'starting',
            'getting started', 'fundamentals', 'basics', 'simple', 'easy',
            'first', 'initial', 'overview'
        ];

        const advancedKeywords = [
            'advanced', 'expert', 'complex', 'optimization', 'performance',
            'architecture', 'deep dive', 'mastery', 'professional', 'enterprise',
            'scalability', 'security', 'best practices', 'patterns'
        ];

        const beginnerScore = beginnerKeywords.reduce((score, keyword) =>
            text.includes(keyword) ? score + 1 : score, 0);

        const advancedScore = advancedKeywords.reduce((score, keyword) =>
            text.includes(keyword) ? score + 1 : score, 0);

        // Use scoring system for better accuracy
        if (advancedScore > beginnerScore && advancedScore > 0) return 'advanced';
        if (beginnerScore > advancedScore && beginnerScore > 0) return 'beginner';

        // Consider section level as a factor
        if (section.level >= 4) return 'advanced';
        if (section.level <= 2) return 'beginner';

        return 'intermediate';
    }

    /**
     * Extract tags từ content
     */
    private extractTags(section: MarkdownSection): string[] {
        const tags: string[] = [];
        const text = section.title + ' ' + section.content;

        // Extract hashtags
        const hashtagMatches = text.match(/#(\w+)/g);
        if (hashtagMatches) {
            tags.push(...hashtagMatches.map(tag => tag.substring(1).toLowerCase()));
        }

        // Extract common tech terms (expanded list)
        const techTerms = [
            // Frontend
            'javascript', 'typescript', 'react', 'vue', 'angular', 'svelte',
            'html', 'css', 'sass', 'scss', 'less', 'tailwind', 'bootstrap',
            'webpack', 'vite', 'rollup', 'parcel', 'babel', 'eslint',

            // Backend
            'node', 'nodejs', 'express', 'fastify', 'koa', 'nestjs',
            'python', 'django', 'flask', 'java', 'spring', 'php', 'laravel',
            'ruby', 'rails', 'go', 'rust', 'c#', 'dotnet',

            // Databases
            'mongodb', 'postgresql', 'mysql', 'sqlite', 'redis', 'elasticsearch',
            'dynamodb', 'cassandra', 'neo4j',

            // Cloud & DevOps
            'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform',
            'jenkins', 'github', 'gitlab', 'ci/cd', 'nginx', 'apache',

            // APIs & Protocols
            'graphql', 'rest', 'api', 'grpc', 'websocket', 'http', 'https',
            'oauth', 'jwt', 'json', 'xml',

            // Tools & Concepts
            'git', 'testing', 'jest', 'cypress', 'selenium', 'agile', 'scrum',
            'microservices', 'serverless', 'pwa', 'spa', 'ssr', 'ssg'
        ];

        const lowerText = text.toLowerCase();
        for (const term of techTerms) {
            if (lowerText.includes(term)) {
                tags.push(term);
            }
        }

        return [...new Set(tags)]; // Remove duplicates
    }

    /**
     * Extract resources từ content
     */
    private extractResources(section: MarkdownSection): Resource[] {
        const resources: Resource[] = [];
        const content = section.content;

        // Extract markdown links
        const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
        let match;

        while ((match = linkRegex.exec(content)) !== null) {
            const title = match[1];
            const url = match[2];

            // Skip internal links (anchors)
            if (url.startsWith('#')) continue;

            const resource: Resource = {
                title,
                url,
                type: this.determineResourceType(title, url)
            };

            resources.push(resource);
        }

        return resources;
    }

    /**
     * Determine resource type từ title và URL
     */
    private determineResourceType(title: string, url: string): Resource['type'] {
        const lowerTitle = title.toLowerCase();
        const lowerUrl = url.toLowerCase();

        if (lowerTitle.includes('video') || lowerUrl.includes('youtube') ||
            lowerUrl.includes('vimeo') || lowerUrl.includes('video')) {
            return 'video';
        }

        if (lowerTitle.includes('course') || lowerUrl.includes('course') ||
            lowerUrl.includes('udemy') || lowerUrl.includes('coursera') ||
            lowerUrl.includes('edx') || lowerUrl.includes('pluralsight')) {
            return 'course';
        }

        if (lowerTitle.includes('book') || lowerTitle.includes('ebook') ||
            lowerUrl.includes('book') || lowerUrl.includes('pdf')) {
            return 'book';
        }

        if (lowerTitle.includes('doc') || lowerTitle.includes('documentation') ||
            lowerUrl.includes('docs') || lowerUrl.includes('documentation') ||
            lowerUrl.includes('developer.mozilla.org') || lowerUrl.includes('w3schools')) {
            return 'documentation';
        }

        // Default to article
        return 'article';
    }

    /**
     * Count words trong text
     */
    private countWords(text: string): number {
        if (!text || typeof text !== 'string') return 0;
        return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    }

    /**
     * Generate metadata cho extracted nodes
     */
    private generateMetadata(nodes: GraphNode[]): ExtractedNodes['metadata'] {
        const nodesByLevel: Record<number, number> = {};
        const nodesByType: Record<string, number> = {};
        let totalWordCount = 0;
        let totalReadTime = 0;

        for (const node of nodes) {
            nodesByLevel[node.level] = (nodesByLevel[node.level] || 0) + 1;
            nodesByType[node.type] = (nodesByType[node.type] || 0) + 1;
            totalWordCount += node.metadata.wordCount;
            totalReadTime += node.metadata.estimatedReadTime;
        }

        return {
            totalNodes: nodes.length,
            nodesByLevel,
            nodesByType,
            averageReadTime: nodes.length > 0 ? Math.round(totalReadTime / nodes.length) : 0,
            totalWordCount
        };
    }
}

/**
 * Factory function để create NodeExtractor với options
 */
export function createNodeExtractor(options?: NodeExtractionOptions): NodeExtractor {
    return new NodeExtractor(options);
}

/**
 * Utility function để extract nodes từ markdown content
 */
export function extractNodesFromMarkdown(
    content: string,
    options?: NodeExtractionOptions
): ExtractedNodes {
    const extractor = createNodeExtractor(options);
    return extractor.extract(content);
}

/**
 * Utility function để extract RoadmapNodes từ markdown content
 */
export function extractRoadmapNodesFromMarkdown(
    content: string,
    options?: NodeExtractionOptions
): RoadmapNode[] {
    const extractor = createNodeExtractor(options);
    return extractor.extractAsRoadmapNodes(content);
}