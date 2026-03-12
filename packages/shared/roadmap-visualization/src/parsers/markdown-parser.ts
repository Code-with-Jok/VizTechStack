/**
 * MarkdownParser - Parse markdown content để extract headers và sections
 * 
 * Validates: Requirement 2.1
 */

export interface MarkdownSection {
    id: string;
    title: string;
    content: string;
    level: number;
    startLine: number;
    endLine: number;
}

export interface ParsedMarkdown {
    sections: MarkdownSection[];
    metadata: {
        totalSections: number;
        maxLevel: number;
        minLevel: number;
    };
}

export class MarkdownParser {
    /**
     * Parse markdown content để extract headers và sections
     */
    parse(content: string): ParsedMarkdown {
        const lines = content.split('\n');
        const sections: MarkdownSection[] = [];
        let currentSection: Partial<MarkdownSection> | null = null;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);

            if (headerMatch) {
                // Finish previous section
                if (currentSection) {
                    currentSection.endLine = i - 1;
                    sections.push(currentSection as MarkdownSection);
                }

                // Start new section
                const level = headerMatch[1].length;
                const title = headerMatch[2].trim();
                const id = this.generateId(title);

                currentSection = {
                    id,
                    title,
                    content: '',
                    level,
                    startLine: i,
                    endLine: i
                };
            } else if (currentSection) {
                // Add content to current section
                currentSection.content += (currentSection.content ? '\n' : '') + line;
            }
        }

        // Finish last section
        if (currentSection) {
            currentSection.endLine = lines.length - 1;
            sections.push(currentSection as MarkdownSection);
        }

        const levels = sections.map(s => s.level);

        return {
            sections,
            metadata: {
                totalSections: sections.length,
                maxLevel: levels.length > 0 ? Math.max(...levels) : 0,
                minLevel: levels.length > 0 ? Math.min(...levels) : 0
            }
        };
    }

    /**
     * Generate unique ID từ title
     */
    private generateId(title: string): string {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }

    /**
     * Extract text content từ markdown section
     */
    extractTextContent(content: string): string {
        return content
            .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to text
            .replace(/`([^`]+)`/g, '$1') // Remove code backticks
            .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
            .replace(/\*([^*]+)\*/g, '$1') // Remove italic
            .replace(/#{1,6}\s+/g, '') // Remove headers
            .replace(/^\s*[-*+]\s+/gm, '') // Remove list markers
            .replace(/^\s*\d+\.\s+/gm, '') // Remove numbered list markers
            .trim();
    }
}