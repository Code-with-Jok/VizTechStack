/**
 * Enhanced content parser for extracting graph data from markdown
 */

import MarkdownIt from 'markdown-it';
import type {
    GraphData,
    RoadmapNode,
    RoadmapEdge,
    MarkdownSection,
    ParseOptions,
    NodeType,
    RelationshipType
} from '../types';
import { validateGraphData } from '../validation';

/**
 * Default parse options
 */
const DEFAULT_PARSE_OPTIONS: ParseOptions = {
    includeSubsections: true,
    maxDepth: 5,
    extractDependencies: true,
    autoLayout: true,
};

/**
 * Enhanced content parser class
 */
export class ContentParser {
    private md: MarkdownIt;

    constructor() {
        this.md = new MarkdownIt({
            html: false, // Disable HTML for security
            linkify: true,
            typographer: true,
        });
    }

    /**
     * Parse markdown content into graph data
     * 
     * @param content - Markdown content to parse
     * @param options - Parse options
     * @returns Promise resolving to graph data
     */
    async parseContent(
        content: string,
        options: Partial<ParseOptions> = {}
    ): Promise<GraphData> {
        const opts = { ...DEFAULT_PARSE_OPTIONS, ...options };

        // Sanitize content
        const sanitizedContent = this.sanitizeContent(content);

        // Parse markdown into sections
        const sections = this.parseMarkdownSections(sanitizedContent, opts);

        // Extract nodes from sections
        const nodes = this.extractNodes(sections, opts);

        // Extract relationships between nodes
        const edges = opts.extractDependencies
            ? this.extractRelationships(nodes, sanitizedContent)
            : [];

        // Create graph data
        const graphData: GraphData = {
            nodes,
            edges,
            metadata: {
                totalNodes: nodes.length,
                totalEdges: edges.length,
                maxDepth: this.calculateMaxDepth(nodes),
                layoutType: 'hierarchical',
                generatedAt: new Date(),
            },
        };

        // Validate graph data
        if (!validateGraphData(graphData)) {
            throw new Error('Generated graph data is invalid');
        }

        return graphData;
    }

    /**
     * Sanitize markdown content to prevent XSS
     * 
     * @param content - Raw markdown content
     * @returns Sanitized content
     */
    private sanitizeContent(content: string): string {
        // Remove script tags
        let sanitized = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

        // Remove event handlers
        sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');

        // Remove javascript: protocol
        sanitized = sanitized.replace(/javascript:/gi, '');

        return sanitized;
    }

    /**
     * Parse markdown into hierarchical sections
     * 
     * @param content - Markdown content
     * @param options - Parse options
     * @returns Array of markdown sections
     */
    private parseMarkdownSections(
        content: string,
        options: ParseOptions
    ): MarkdownSection[] {
        const tokens = this.md.parse(content, {});
        const sections: MarkdownSection[] = [];
        let currentSection: MarkdownSection | null = null;
        let currentContent: string[] = [];

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];

            if (token.type === 'heading_open') {
                // Save previous section
                if (currentSection) {
                    currentSection.content = currentContent.join('\n').trim();
                    sections.push(currentSection);
                }

                // Start new section
                const level = parseInt(token.tag.substring(1));
                const headerToken = tokens[i + 1];
                const header = headerToken?.type === 'inline' ? headerToken.content : '';

                currentSection = {
                    header,
                    level,
                    content: '',
                    subsections: [],
                };
                currentContent = [];

                // Skip the inline and heading_close tokens
                i += 2;
            } else if (token.type === 'inline' || token.type === 'paragraph_open') {
                // Collect content
                if (token.type === 'inline' && token.content) {
                    currentContent.push(token.content);
                }
            }
        }

        // Save last section
        if (currentSection) {
            currentSection.content = currentContent.join('\n').trim();
            sections.push(currentSection);
        }

        return this.organizeSectionsHierarchy(sections, options);
    }

    /**
     * Organize flat sections into hierarchical structure
     * 
     * @param sections - Flat array of sections
     * @param options - Parse options
     * @returns Hierarchical sections
     */
    private organizeSectionsHierarchy(
        sections: MarkdownSection[],
        options: ParseOptions
    ): MarkdownSection[] {
        const result: MarkdownSection[] = [];
        const stack: MarkdownSection[] = [];

        for (const section of sections) {
            if (section.level > options.maxDepth) {
                continue;
            }

            // Pop stack until we find parent level
            while (stack.length > 0 && stack[stack.length - 1].level >= section.level) {
                stack.pop();
            }

            if (stack.length === 0) {
                // Top level section
                result.push(section);
            } else {
                // Add as subsection to parent
                stack[stack.length - 1].subsections.push(section);
            }

            if (options.includeSubsections) {
                stack.push(section);
            }
        }

        return result;
    }

    /**
     * Extract nodes from markdown sections
     * 
     * @param sections - Markdown sections
     * @param options - Parse options
     * @returns Array of roadmap nodes
     */
    private extractNodes(
        sections: MarkdownSection[],
        options: ParseOptions
    ): RoadmapNode[] {
        const nodes: RoadmapNode[] = [];
        let nodeIdCounter = 0;

        const processSection = (
            section: MarkdownSection,
            parentId?: string,
            depth: number = 0
        ) => {
            if (depth > options.maxDepth) {
                return;
            }

            const nodeId = `node-${nodeIdCounter++}`;
            const nodeType = this.determineNodeType(section, depth);

            const node: RoadmapNode = {
                id: nodeId,
                type: nodeType,
                position: { x: 0, y: 0 }, // Will be calculated by layout algorithm
                data: {
                    label: section.header || 'Untitled',
                    description: section.content.substring(0, 200),
                    level: depth,
                    section: section.header || 'Untitled',
                    difficulty: this.extractDifficulty(section.content),
                    estimatedTime: this.extractEstimatedTime(section.content),
                    resources: this.extractResources(section.content),
                },
            };

            nodes.push(node);

            // Process subsections recursively
            if (options.includeSubsections) {
                for (const subsection of section.subsections) {
                    processSection(subsection, nodeId, depth + 1);
                }
            }
        };

        for (const section of sections) {
            processSection(section);
        }

        return nodes;
    }

    /**
     * Determine node type based on section content and depth
     * 
     * @param section - Markdown section
     * @param depth - Section depth
     * @returns Node type
     */
    private determineNodeType(section: MarkdownSection, depth: number): NodeType {
        const header = section.header?.toLowerCase() || '';
        const content = section.content.toLowerCase();

        // Check for keywords
        if (header.includes('prerequisite') || content.includes('prerequisite')) {
            return 'prerequisite';
        }
        if (header.includes('milestone') || content.includes('milestone')) {
            return 'milestone';
        }
        if (header.includes('resource') || content.includes('resource')) {
            return 'resource';
        }
        if (depth === 0) {
            return 'topic';
        }

        return 'skill';
    }

    /**
     * Extract difficulty level from content
     * 
     * @param content - Section content
     * @returns Difficulty level or undefined
     */
    private extractDifficulty(content: string): 'beginner' | 'intermediate' | 'advanced' | undefined {
        const lower = content.toLowerCase();
        if (lower.includes('beginner') || lower.includes('basic')) {
            return 'beginner';
        }
        if (lower.includes('intermediate') || lower.includes('medium')) {
            return 'intermediate';
        }
        if (lower.includes('advanced') || lower.includes('expert')) {
            return 'advanced';
        }
        return undefined;
    }

    /**
     * Extract estimated time from content
     * 
     * @param content - Section content
     * @returns Estimated time string or undefined
     */
    private extractEstimatedTime(content: string): string | undefined {
        // Match patterns like "2 hours", "3 weeks", "1 month"
        const timePattern = /(\d+)\s*(hour|day|week|month)s?/i;
        const match = content.match(timePattern);
        return match ? match[0] : undefined;
    }

    /**
     * Extract resources from content
     * 
     * @param content - Section content
     * @returns Array of resources
     */
    private extractResources(content: string): Array<{ title: string; url: string; type: 'article' | 'video' | 'course' | 'documentation' | 'book' }> {
        const resources: Array<{ title: string; url: string; type: 'article' | 'video' | 'course' | 'documentation' | 'book' }> = [];

        // Match markdown links [title](url)
        const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
        let match;

        while ((match = linkPattern.exec(content)) !== null) {
            const title = match[1];
            const url = match[2];

            // Determine resource type from URL or title
            let type: 'article' | 'video' | 'course' | 'documentation' | 'book' = 'article';
            const lower = (title + url).toLowerCase();

            if (lower.includes('video') || lower.includes('youtube')) {
                type = 'video';
            } else if (lower.includes('course') || lower.includes('tutorial')) {
                type = 'course';
            } else if (lower.includes('docs') || lower.includes('documentation')) {
                type = 'documentation';
            } else if (lower.includes('book')) {
                type = 'book';
            }

            resources.push({ title, url, type });
        }

        return resources;
    }

    /**
     * Extract relationships between nodes
     * 
     * @param nodes - Array of nodes
     * @param content - Original markdown content
     * @returns Array of edges
     */
    private extractRelationships(
        nodes: RoadmapNode[],
        content: string
    ): RoadmapEdge[] {
        const edges: RoadmapEdge[] = [];
        let edgeIdCounter = 0;

        // Create hierarchical relationships based on node levels
        for (let i = 0; i < nodes.length; i++) {
            const currentNode = nodes[i];

            // Find parent node (previous node with lower level)
            for (let j = i - 1; j >= 0; j--) {
                const potentialParent = nodes[j];

                if (potentialParent.data.level < currentNode.data.level) {
                    edges.push({
                        id: `edge-${edgeIdCounter++}`,
                        source: potentialParent.id,
                        target: currentNode.id,
                        type: 'progression',
                        data: {
                            relationship: 'part-of',
                        },
                    });
                    break;
                }
            }

            // Create progression edges between same-level nodes
            if (i > 0) {
                const previousNode = nodes[i - 1];
                if (previousNode.data.level === currentNode.data.level) {
                    edges.push({
                        id: `edge-${edgeIdCounter++}`,
                        source: previousNode.id,
                        target: currentNode.id,
                        type: 'progression',
                        data: {
                            relationship: 'leads-to',
                        },
                    });
                }
            }
        }

        return edges;
    }

    /**
     * Calculate maximum depth of nodes
     * 
     * @param nodes - Array of nodes
     * @returns Maximum depth
     */
    private calculateMaxDepth(nodes: RoadmapNode[]): number {
        return nodes.reduce((max, node) => Math.max(max, node.data.level), 0);
    }
}

/**
 * Create a new content parser instance
 */
export function createContentParser(): ContentParser {
    return new ContentParser();
}
