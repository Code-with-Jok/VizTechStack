/**
 * ResourceExtractor - Extract links, references từ markdown content
 * 
 * Validates: Requirement 2.4
 */

import { GraphNode } from './node-extractor';

export interface ResourceNode extends GraphNode {
    resourceType: ResourceType;
    url?: string;
    author?: string;
    duration?: string;
    cost?: ResourceCost;
    difficulty?: DifficultyLevel;
    language?: string;
    publishedDate?: Date;
    lastUpdated?: Date;
    rating?: number; // 1-5
    reviews?: number;
    tags?: string[];
    description?: string;
}

export type ResourceType =
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

export type ResourceCost = 'free' | 'paid' | 'subscription' | 'freemium';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface ExtractedResource {
    url: string;
    title: string;
    type: ResourceType;
    context: string; // Surrounding text context
    position: number; // Position in content
    metadata?: ResourceMetadata;
}

export interface ResourceMetadata {
    domain?: string;
    protocol?: string;
    path?: string;
    anchor?: string;
    queryParams?: Record<string, string>;
    isInternal?: boolean;
    isDownload?: boolean;
    fileExtension?: string;
}

export interface ResourceExtractionOptions {
    includeInternalLinks?: boolean;
    includeExternalLinks?: boolean;
    includeImages?: boolean;
    includeDownloads?: boolean;
    maxContextLength?: number;
    detectResourceType?: boolean;
    validateUrls?: boolean;
    extractMetadata?: boolean;
}

interface ResourceFeatures {
    domain: string;
    path: string;
    fileExtension?: string;
    titleKeywords: string[];
    titleLength: number;
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

export interface ResourceExtractionResult {
    resources: ExtractedResource[];
    resourceNodes: ResourceNode[];
    statistics: {
        totalResources: number;
        resourcesByType: Record<ResourceType, number>;
        internalLinks: number;
        externalLinks: number;
        brokenLinks: number;
        duplicateResources: number;
    };
    errors: string[];
    warnings: string[];
}

export class ResourceExtractor {
    private options: ResourceExtractionOptions;

    constructor(options: ResourceExtractionOptions = {}) {
        this.options = {
            includeInternalLinks: true,
            includeExternalLinks: true,
            includeImages: false,
            includeDownloads: true,
            maxContextLength: 100,
            detectResourceType: true,
            validateUrls: true,
            extractMetadata: true,
            ...options
        };
    }

    /**
     * Extract resources từ markdown content
     */
    extract(content: string, baseUrl?: string): ResourceExtractionResult {
        if (!content || typeof content !== 'string') {
            throw new Error('Content must be a non-empty string');
        }

        const resources: ExtractedResource[] = [];
        const errors: string[] = [];
        const warnings: string[] = [];

        try {
            // Extract markdown links [text](url)
            const markdownLinks = this.extractMarkdownLinks(content);
            resources.push(...markdownLinks);

            // Extract HTML links <a href="url">text</a>
            const htmlLinks = this.extractHtmlLinks(content);
            resources.push(...htmlLinks);

            // Extract plain URLs
            const plainUrls = this.extractPlainUrls(content);
            resources.push(...plainUrls);

            // Extract images if enabled
            if (this.options.includeImages) {
                const images = this.extractImages(content);
                resources.push(...images);
            }

            // Filter resources based on options
            const filteredResources = this.filterResources(resources);

            // Detect resource types
            if (this.options.detectResourceType) {
                this.detectResourceTypes(filteredResources);
            }

            // Extract metadata
            if (this.options.extractMetadata) {
                this.extractResourceMetadata(filteredResources, baseUrl);
            }

            // Validate URLs if enabled
            if (this.options.validateUrls) {
                this.validateResourceUrls(filteredResources, errors, warnings);
            }

            // Remove duplicates
            const uniqueResources = this.removeDuplicateResources(filteredResources);

            // Create resource nodes
            const resourceNodes = this.createResourceNodes(uniqueResources);

            // Generate statistics
            const statistics = this.generateStatistics(uniqueResources, resources);

            return {
                resources: uniqueResources,
                resourceNodes,
                statistics,
                errors,
                warnings
            };

        } catch (error) {
            errors.push(`Resource extraction failed: ${error instanceof Error ? error.message : String(error)}`);

            return {
                resources: [],
                resourceNodes: [],
                statistics: this.getEmptyStatistics(),
                errors,
                warnings
            };
        }
    }

    /**
     * Extract markdown links [text](url)
     */
    private extractMarkdownLinks(content: string): ExtractedResource[] {
        const resources: ExtractedResource[] = [];
        const markdownLinkRegex = /\[([^\]]*)\]\(([^)]+)\)/g;
        let match;

        while ((match = markdownLinkRegex.exec(content)) !== null) {
            const [fullMatch, title, url] = match;
            const position = match.index;
            const context = this.extractContext(content, position);

            resources.push({
                url: url.trim(),
                title: title.trim() || this.extractTitleFromUrl(url),
                type: 'article', // Will be detected later
                context,
                position,
                metadata: {
                    isInternal: this.isInternalUrl(url)
                }
            });
        }

        return resources;
    }

    /**
     * Extract HTML links <a href="url">text</a>
     */
    private extractHtmlLinks(content: string): ExtractedResource[] {
        const resources: ExtractedResource[] = [];
        const htmlLinkRegex = /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1[^>]*>(.*?)<\/a>/gi;
        let match;

        while ((match = htmlLinkRegex.exec(content)) !== null) {
            const [fullMatch, quote, url, title] = match;
            const position = match.index;
            const context = this.extractContext(content, position);

            // Clean HTML from title
            const cleanTitle = title.replace(/<[^>]*>/g, '').trim();

            resources.push({
                url: url.trim(),
                title: cleanTitle || this.extractTitleFromUrl(url),
                type: 'article', // Will be detected later
                context,
                position,
                metadata: {
                    isInternal: this.isInternalUrl(url)
                }
            });
        }

        return resources;
    }

    /**
     * Extract plain URLs from text
     */
    private extractPlainUrls(content: string): ExtractedResource[] {
        const resources: ExtractedResource[] = [];
        const urlRegex = /https?:\/\/[^\s<>"{}|\\^`[\]]+/g;
        let match;

        while ((match = urlRegex.exec(content)) !== null) {
            const url = match[0];
            const position = match.index;
            const context = this.extractContext(content, position);

            // Skip if already captured by markdown or HTML link
            if (!this.isAlreadyCaptured(content, position)) {
                resources.push({
                    url: url.trim(),
                    title: this.extractTitleFromUrl(url),
                    type: 'website', // Will be detected later
                    context,
                    position,
                    metadata: {
                        isInternal: this.isInternalUrl(url)
                    }
                });
            }
        }

        return resources;
    }

    /**
     * Extract images ![alt](src)
     */
    private extractImages(content: string): ExtractedResource[] {
        const resources: ExtractedResource[] = [];
        const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
        let match;

        while ((match = imageRegex.exec(content)) !== null) {
            const [fullMatch, alt, src] = match;
            const position = match.index;
            const context = this.extractContext(content, position);

            resources.push({
                url: src.trim(),
                title: alt.trim() || this.extractTitleFromUrl(src),
                type: 'reference', // Images are references
                context,
                position,
                metadata: {
                    isInternal: this.isInternalUrl(src),
                    fileExtension: this.extractFileExtension(src)
                }
            });
        }

        return resources;
    }

    /**
     * Filter resources based on options
     */
    private filterResources(resources: ExtractedResource[]): ExtractedResource[] {
        return resources.filter(resource => {
            // Filter internal/external links
            if (resource.metadata?.isInternal && !this.options.includeInternalLinks) {
                return false;
            }
            if (!resource.metadata?.isInternal && !this.options.includeExternalLinks) {
                return false;
            }

            // Filter downloads
            if (resource.metadata?.isDownload && !this.options.includeDownloads) {
                return false;
            }

            return true;
        });
    }

    /**
     * Detect resource types based on URL patterns
     */
    private detectResourceTypes(resources: ExtractedResource[]): void {
        for (const resource of resources) {
            resource.type = this.detectResourceType(resource.url, resource.title);
        }
    }

    /**
     * Detect resource type from URL và title với advanced categorization
     */
    private detectResourceType(url: string, title: string): ResourceType {
        const urlLower = url.toLowerCase();
        const titleLower = title.toLowerCase();

        // Use advanced categorization system
        return this.advancedResourceCategorization(urlLower, titleLower);
    }

    /**
     * Extract metadata từ resources
     */
    private extractResourceMetadata(resources: ExtractedResource[], baseUrl?: string): void {
        for (const resource of resources) {
            try {
                const url = new URL(resource.url, baseUrl);

                resource.metadata = {
                    ...resource.metadata,
                    domain: url.hostname,
                    protocol: url.protocol,
                    path: url.pathname,
                    anchor: url.hash ? url.hash.substring(1) : undefined,
                    queryParams: this.parseQueryParams(url.search),
                    isDownload: this.isDownloadUrl(resource.url),
                    fileExtension: this.extractFileExtension(resource.url)
                };
            } catch (error) {
                // Invalid URL, keep existing metadata
            }
        }
    }

    /**
     * Validate resource URLs
     */
    private validateResourceUrls(resources: ExtractedResource[], errors: string[], warnings: string[]): void {
        for (const resource of resources) {
            try {
                new URL(resource.url);

                // Check for suspicious URLs
                if (this.isSuspiciousUrl(resource.url)) {
                    warnings.push(`Suspicious URL detected: ${resource.url}`);
                }
            } catch (error) {
                errors.push(`Invalid URL: ${resource.url}`);
            }
        }
    }

    /**
     * Remove duplicate resources
     */
    private removeDuplicateResources(resources: ExtractedResource[]): ExtractedResource[] {
        const seen = new Set<string>();
        const unique: ExtractedResource[] = [];

        for (const resource of resources) {
            const key = this.normalizeUrl(resource.url);
            if (!seen.has(key)) {
                seen.add(key);
                unique.push(resource);
            }
        }

        return unique;
    }

    /**
     * Create resource nodes từ extracted resources
     */
    private createResourceNodes(resources: ExtractedResource[]): ResourceNode[] {
        return resources.map((resource, index) => {
            const node: ResourceNode = {
                id: this.generateResourceId(resource, index),
                title: resource.title,
                content: resource.context,
                level: 0, // Resources are typically leaf nodes
                type: 'resource',
                metadata: {
                    resourceType: resource.type,
                    domain: resource.metadata?.domain,
                    isExternal: !resource.metadata?.isInternal
                },
                url: resource.url,
                cost: this.detectResourceCost(resource),
                difficulty: this.detectResourceDifficulty(resource),
                description: resource.context
            };

            return node;
        });
    }

    /**
     * Generate statistics về extracted resources
     */
    private generateStatistics(
        uniqueResources: ExtractedResource[],
        allResources: ExtractedResource[]
    ): ResourceExtractionResult['statistics'] {
        const resourcesByType: Record<ResourceType, number> = {} as Record<ResourceType, number>;
        let internalLinks = 0;
        let externalLinks = 0;

        for (const resource of uniqueResources) {
            // Count by type
            resourcesByType[resource.type] = (resourcesByType[resource.type] || 0) + 1;

            // Count internal/external
            if (resource.metadata?.isInternal) {
                internalLinks++;
            } else {
                externalLinks++;
            }
        }

        return {
            totalResources: uniqueResources.length,
            resourcesByType,
            internalLinks,
            externalLinks,
            brokenLinks: 0, // Would need actual URL checking
            duplicateResources: allResources.length - uniqueResources.length
        };
    }

    /**
     * Helper methods
     */
    private extractContext(content: string, position: number): string {
        const maxLength = this.options.maxContextLength || 100;
        const start = Math.max(0, position - maxLength / 2);
        const end = Math.min(content.length, position + maxLength / 2);

        return content.substring(start, end).trim();
    }

    private extractTitleFromUrl(url: string): string {
        try {
            const urlObj = new URL(url);
            const path = urlObj.pathname;

            // Extract filename without extension
            const filename = path.split('/').pop() || '';
            const nameWithoutExt = filename.split('.')[0];

            if (nameWithoutExt) {
                return nameWithoutExt.replace(/[-_]/g, ' ').trim();
            }

            // Use domain as fallback
            return urlObj.hostname;
        } catch {
            return url;
        }
    }

    private isInternalUrl(url: string): boolean {
        try {
            const urlObj = new URL(url);
            return false; // Assume external unless we have base URL to compare
        } catch {
            // Relative URLs are internal
            return !url.startsWith('http');
        }
    }

    private isAlreadyCaptured(content: string, position: number): boolean {
        // Check if position is within a markdown or HTML link
        const beforeContext = content.substring(Math.max(0, position - 50), position);
        const afterContext = content.substring(position, Math.min(content.length, position + 50));

        // Check for markdown link pattern
        if (beforeContext.includes('[') && afterContext.includes(')')) {
            return true;
        }

        // Check for HTML link pattern
        if (beforeContext.includes('<a') && afterContext.includes('</a>')) {
            return true;
        }

        return false;
    }

    private extractFileExtension(url: string): string | undefined {
        try {
            const urlObj = new URL(url);
            const path = urlObj.pathname;
            const match = path.match(/\.([^.]+)$/);
            return match ? match[1].toLowerCase() : undefined;
        } catch {
            const match = url.match(/\.([^.]+)$/);
            return match ? match[1].toLowerCase() : undefined;
        }
    }

    private isDownloadUrl(url: string): boolean {
        const downloadExtensions = ['pdf', 'doc', 'docx', 'zip', 'tar', 'gz', 'exe', 'dmg', 'pkg'];
        const extension = this.extractFileExtension(url);
        return extension ? downloadExtensions.includes(extension) : false;
    }

    private parseQueryParams(search: string): Record<string, string> {
        const params: Record<string, string> = {};
        if (search) {
            const urlParams = new URLSearchParams(search);
            for (const [key, value] of urlParams) {
                params[key] = value;
            }
        }
        return params;
    }

    private isSuspiciousUrl(url: string): boolean {
        const suspiciousPatterns = [
            /bit\.ly/i,
            /tinyurl/i,
            /t\.co/i,
            /goo\.gl/i,
            /ow\.ly/i
        ];

        return suspiciousPatterns.some(pattern => pattern.test(url));
    }

    private normalizeUrl(url: string): string {
        try {
            const urlObj = new URL(url);
            // Remove trailing slash, fragments, and some query params
            urlObj.hash = '';
            urlObj.search = '';
            return urlObj.toString().replace(/\/$/, '');
        } catch {
            return url.toLowerCase().trim();
        }
    }

    private generateResourceId(resource: ExtractedResource, index: number): string {
        const domain = resource.metadata?.domain || 'unknown';
        const cleanDomain = domain.replace(/[^a-zA-Z0-9]/g, '-');
        const cleanTitle = resource.title.toLowerCase()
            .replace(/[^a-zA-Z0-9]/g, '-')
            .replace(/-+/g, '-')
            .substring(0, 30);

        return `resource-${cleanDomain}-${cleanTitle}-${index}`;
    }

    private detectResourceCost(resource: ExtractedResource): ResourceCost {
        const url = resource.url.toLowerCase();
        const title = resource.title.toLowerCase();

        // Free platforms
        if (url.includes('github.com') || url.includes('developer.mozilla.org') ||
            url.includes('w3schools.com') || title.includes('free')) {
            return 'free';
        }

        // Paid platforms
        if (url.includes('udemy.com') || url.includes('pluralsight.com') ||
            title.includes('premium') || title.includes('paid')) {
            return 'paid';
        }

        // Subscription platforms
        if (url.includes('netflix.com') || url.includes('linkedin.com/learning')) {
            return 'subscription';
        }

        // Default to free
        return 'free';
    }

    private detectResourceDifficulty(resource: ExtractedResource): DifficultyLevel {
        const title = resource.title.toLowerCase();
        const context = resource.context.toLowerCase();
        const combined = title + ' ' + context;

        if (combined.includes('beginner') || combined.includes('intro') ||
            combined.includes('basic') || combined.includes('getting started')) {
            return 'beginner';
        }

        if (combined.includes('advanced') || combined.includes('expert') ||
            combined.includes('master') || combined.includes('deep dive')) {
            return 'advanced';
        }

        if (combined.includes('intermediate') || combined.includes('medium')) {
            return 'intermediate';
        }

        // Default to intermediate
        return 'intermediate';
    }

    private getEmptyStatistics(): ResourceExtractionResult['statistics'] {
        return {
            totalResources: 0,
            resourcesByType: {} as Record<ResourceType, number>,
            internalLinks: 0,
            externalLinks: 0,
            brokenLinks: 0,
            duplicateResources: 0
        };
    }

    /**
     * Advanced resource categorization với machine learning-like approach
     */
    private advancedResourceCategorization(url: string, title: string): ResourceType {
        const features = this.extractResourceFeatures(url, title);

        // Score-based classification
        const scores = this.calculateCategoryScores(features);

        // Return category với highest score
        return this.selectBestCategory(scores);
    }

    /**
     * Extract features từ URL và title cho categorization
     */
    private extractResourceFeatures(url: string, title: string): ResourceFeatures {
        return {
            // URL-based features
            domain: this.extractDomain(url),
            path: this.extractPath(url),
            fileExtension: this.extractFileExtension(url),

            // Content-based features
            titleKeywords: this.extractCategoricalKeywords(title),
            titleLength: title.length,

            // Pattern-based features
            hasVideoIndicators: this.hasVideoIndicators(url, title),
            hasCourseIndicators: this.hasCourseIndicators(url, title),
            hasDocumentationIndicators: this.hasDocumentationIndicators(url, title),
            hasTutorialIndicators: this.hasTutorialIndicators(url, title),
            hasToolIndicators: this.hasToolIndicators(url, title),
            hasBookIndicators: this.hasBookIndicators(url, title),
            hasBlogIndicators: this.hasBlogIndicators(url, title),
            hasExampleIndicators: this.hasExampleIndicators(url, title),
            hasGithubIndicators: this.hasGithubIndicators(url, title),
            hasPodcastIndicators: this.hasPodcastIndicators(url, title),

            // Quality indicators
            isOfficialSource: this.isOfficialSource(url),
            isEducationalDomain: this.isEducationalDomain(url),
            isCommercialPlatform: this.isCommercialPlatform(url)
        };
    }

    /**
     * Calculate scores cho each resource category
     */
    private calculateCategoryScores(features: ResourceFeatures): CategoryScores {
        const scores: CategoryScores = {
            github: 0,
            video: 0,
            course: 0,
            documentation: 0,
            tutorial: 0,
            tool: 0,
            book: 0,
            blog: 0,
            podcast: 0,
            example: 0,
            article: 0.1, // Base score
            website: 0.05,
            reference: 0.05
        };

        // GitHub scoring
        if (features.hasGithubIndicators) scores.github += 0.9;
        if (features.domain === 'github.com') scores.github += 0.8;

        // Video scoring
        if (features.hasVideoIndicators) scores.video += 0.8;
        if (this.isVideoPlatform(features.domain)) scores.video += 0.9;

        // Course scoring
        if (features.hasCourseIndicators) scores.course += 0.7;
        if (this.isCoursePlatform(features.domain)) scores.course += 0.9;
        if (features.isCommercialPlatform) scores.course += 0.3;

        // Documentation scoring
        if (features.hasDocumentationIndicators) scores.documentation += 0.8;
        if (features.isOfficialSource) scores.documentation += 0.6;
        if (features.path.includes('/docs/') || features.path.includes('/api/')) scores.documentation += 0.7;

        // Tutorial scoring
        if (features.hasTutorialIndicators) scores.tutorial += 0.8;
        if (features.isEducationalDomain) scores.tutorial += 0.4;

        // Tool scoring
        if (features.hasToolIndicators) scores.tool += 0.8;
        if (this.isToolDomain(features.domain)) scores.tool += 0.7;

        // Book scoring
        if (features.hasBookIndicators) scores.book += 0.8;
        if (features.fileExtension === 'pdf') scores.book += 0.6;
        if (this.isBookPlatform(features.domain)) scores.book += 0.9;

        // Blog scoring
        if (features.hasBlogIndicators) scores.blog += 0.8;
        if (this.isBlogPlatform(features.domain)) scores.blog += 0.9;

        // Podcast scoring
        if (features.hasPodcastIndicators) scores.podcast += 0.9;
        if (this.isPodcastPlatform(features.domain)) scores.podcast += 0.8;

        // Example scoring
        if (features.hasExampleIndicators) scores.example += 0.8;
        if (this.isExamplePlatform(features.domain)) scores.example += 0.9;

        // Reference scoring (for images, PDFs, etc.)
        if (this.isReferenceFile(features.fileExtension)) scores.reference += 0.7;

        return scores;
    }

    /**
     * Select category với highest score
     */
    private selectBestCategory(scores: CategoryScores): ResourceType {
        let maxScore = 0;
        let bestCategory: ResourceType = 'article';

        for (const [category, score] of Object.entries(scores)) {
            if (score > maxScore) {
                maxScore = score;
                bestCategory = category as ResourceType;
            }
        }

        return bestCategory;
    }

    /**
     * Feature extraction helper methods
     */
    private extractCategoricalKeywords(text: string): string[] {
        const keywords = text.toLowerCase().match(/\b\w+\b/g) || [];
        const categoricalKeywords = [
            // Video keywords
            'video', 'watch', 'tutorial', 'screencast', 'webinar', 'presentation',
            // Course keywords
            'course', 'training', 'bootcamp', 'certification', 'class', 'lesson',
            // Documentation keywords
            'docs', 'documentation', 'api', 'reference', 'manual', 'specification',
            // Tutorial keywords
            'tutorial', 'guide', 'walkthrough', 'howto', 'stepbystep',
            // Tool keywords
            'tool', 'editor', 'ide', 'framework', 'library', 'plugin', 'extension',
            // Book keywords
            'book', 'ebook', 'pdf', 'chapter', 'publication',
            // Blog keywords
            'blog', 'post', 'article', 'opinion', 'thoughts',
            // Example keywords
            'example', 'demo', 'sample', 'playground', 'codepen', 'jsfiddle'
        ];

        return keywords.filter(keyword => categoricalKeywords.includes(keyword));
    }

    private hasVideoIndicators(url: string, title: string): boolean {
        const videoKeywords = ['video', 'watch', 'tutorial', 'screencast', 'webinar'];
        return videoKeywords.some(keyword =>
            url.includes(keyword) || title.toLowerCase().includes(keyword)
        );
    }

    private hasCourseIndicators(url: string, title: string): boolean {
        const courseKeywords = ['course', 'training', 'bootcamp', 'certification', 'class'];
        return courseKeywords.some(keyword =>
            url.includes(keyword) || title.toLowerCase().includes(keyword)
        );
    }

    private hasDocumentationIndicators(url: string, title: string): boolean {
        const docKeywords = ['docs', 'documentation', 'api', 'reference', 'manual'];
        return docKeywords.some(keyword =>
            url.includes(keyword) || title.toLowerCase().includes(keyword)
        );
    }

    private hasTutorialIndicators(url: string, title: string): boolean {
        const tutorialKeywords = ['tutorial', 'guide', 'walkthrough', 'how to', 'step by step'];
        return tutorialKeywords.some(keyword =>
            url.includes(keyword.replace(' ', '')) || title.toLowerCase().includes(keyword)
        );
    }

    private hasToolIndicators(url: string, title: string): boolean {
        const toolKeywords = ['tool', 'editor', 'ide', 'framework', 'library'];
        return toolKeywords.some(keyword =>
            url.includes(keyword) || title.toLowerCase().includes(keyword)
        );
    }

    private hasBookIndicators(url: string, title: string): boolean {
        const bookKeywords = ['book', 'ebook', 'pdf', 'publication'];
        return bookKeywords.some(keyword =>
            url.includes(keyword) || title.toLowerCase().includes(keyword)
        );
    }

    private hasBlogIndicators(url: string, title: string): boolean {
        const blogKeywords = ['blog', 'post', 'article'];
        return blogKeywords.some(keyword =>
            url.includes(keyword) || title.toLowerCase().includes(keyword)
        );
    }

    private hasExampleIndicators(url: string, title: string): boolean {
        const exampleKeywords = ['example', 'demo', 'sample', 'playground'];
        return exampleKeywords.some(keyword =>
            url.includes(keyword) || title.toLowerCase().includes(keyword)
        );
    }

    private hasGithubIndicators(url: string, title: string): boolean {
        return url.includes('github.com') || title.toLowerCase().includes('github');
    }

    private hasPodcastIndicators(url: string, title: string): boolean {
        const podcastKeywords = ['podcast', 'audio', 'listen'];
        return podcastKeywords.some(keyword =>
            url.includes(keyword) || title.toLowerCase().includes(keyword)
        );
    }

    /**
     * Domain classification methods
     */
    private isVideoPlatform(domain: string): boolean {
        const videoPlatforms = [
            'youtube.com', 'youtu.be', 'vimeo.com', 'twitch.tv',
            'dailymotion.com', 'wistia.com', 'brightcove.com'
        ];
        return videoPlatforms.some(platform => domain.includes(platform));
    }

    private isCoursePlatform(domain: string): boolean {
        const coursePlatforms = [
            'udemy.com', 'coursera.org', 'edx.org', 'pluralsight.com',
            'linkedin.com', 'skillshare.com', 'masterclass.com',
            'khanacademy.org', 'codecademy.com', 'treehouse.com'
        ];
        return coursePlatforms.some(platform => domain.includes(platform));
    }

    private isToolDomain(domain: string): boolean {
        const toolDomains = [
            'code.visualstudio.com', 'atom.io', 'sublimetext.com',
            'jetbrains.com', 'eclipse.org', 'vim.org', 'emacs.org'
        ];
        return toolDomains.some(toolDomain => domain.includes(toolDomain));
    }

    private isBookPlatform(domain: string): boolean {
        const bookPlatforms = [
            'amazon.com', 'oreilly.com', 'manning.com', 'packtpub.com',
            'apress.com', 'nostarch.com', 'pragprog.com'
        ];
        return bookPlatforms.some(platform => domain.includes(platform));
    }

    private isBlogPlatform(domain: string): boolean {
        const blogPlatforms = [
            'medium.com', 'dev.to', 'hashnode.com', 'substack.com',
            'wordpress.com', 'blogger.com', 'ghost.org'
        ];
        return blogPlatforms.some(platform => domain.includes(platform));
    }

    private isPodcastPlatform(domain: string): boolean {
        const podcastPlatforms = [
            'spotify.com', 'apple.com', 'google.com/podcasts',
            'soundcloud.com', 'anchor.fm', 'overcast.fm'
        ];
        return podcastPlatforms.some(platform => domain.includes(platform));
    }

    private isExamplePlatform(domain: string): boolean {
        const examplePlatforms = [
            'codepen.io', 'jsfiddle.net', 'codesandbox.io',
            'stackblitz.com', 'repl.it', 'glitch.com'
        ];
        return examplePlatforms.some(platform => domain.includes(platform));
    }

    private isOfficialSource(url: string): boolean {
        const officialIndicators = [
            'reactjs.org', 'vuejs.org', 'angular.io', 'nodejs.org',
            'developer.mozilla.org', 'w3.org', 'whatwg.org',
            'tc39.es', 'ecma-international.org'
        ];
        return officialIndicators.some(indicator => url.includes(indicator));
    }

    private isEducationalDomain(url: string): boolean {
        const eduIndicators = ['.edu', '.ac.', 'university', 'college', 'school'];
        return eduIndicators.some(indicator => url.includes(indicator));
    }

    private isCommercialPlatform(url: string): boolean {
        const commercialPlatforms = [
            'udemy.com', 'pluralsight.com', 'linkedin.com/learning',
            'masterclass.com', 'skillshare.com'
        ];
        return commercialPlatforms.some(platform => url.includes(platform));
    }

    private isReferenceFile(extension?: string): boolean {
        if (!extension) return false;
        const referenceExtensions = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'];
        return referenceExtensions.includes(extension);
    }

    private extractDomain(url: string): string {
        try {
            return new URL(url).hostname;
        } catch {
            return '';
        }
    }

    private extractPath(url: string): string {
        try {
            return new URL(url).pathname;
        } catch {
            return '';
        }
    }
}

/**
 * Factory function để create ResourceExtractor với options
 */
export function createResourceExtractor(options?: ResourceExtractionOptions): ResourceExtractor {
    return new ResourceExtractor(options);
}

/**
 * Utility function để extract resources từ content
 */
export function extractResourcesFromContent(
    content: string,
    options?: ResourceExtractionOptions,
    baseUrl?: string
): ResourceExtractionResult {
    const extractor = createResourceExtractor(options);
    return extractor.extract(content, baseUrl);
}

/**
 * Utility function để get resource statistics
 */
export function getResourceStatistics(resources: ExtractedResource[]): {
    totalCount: number;
    typeDistribution: Record<ResourceType, number>;
    costDistribution: Record<ResourceCost, number>;
    difficultyDistribution: Record<DifficultyLevel, number>;
} {
    const typeDistribution: Record<ResourceType, number> = {} as Record<ResourceType, number>;
    const costDistribution: Record<ResourceCost, number> = {} as Record<ResourceCost, number>;
    const difficultyDistribution: Record<DifficultyLevel, number> = {} as Record<DifficultyLevel, number>;

    for (const resource of resources) {
        // Count by type
        typeDistribution[resource.type] = (typeDistribution[resource.type] || 0) + 1;
    }

    return {
        totalCount: resources.length,
        typeDistribution,
        costDistribution,
        difficultyDistribution
    };
}