/**
 * Tests for ContentParser
 */

import { ContentParser } from '../content-parser';
import type { GraphData } from '../../types';

describe('ContentParser', () => {
    let parser: ContentParser;

    beforeEach(() => {
        parser = new ContentParser();
    });

    describe('parseContent', () => {
        it('should parse simple markdown with headers', async () => {
            const markdown = `
# Frontend Development

Learn the basics of frontend development.

## HTML

HTML is the foundation of web pages.

## CSS

CSS is used for styling.

## JavaScript

JavaScript adds interactivity.
      `.trim();

            const result = await parser.parseContent(markdown);

            expect(result.nodes.length).toBeGreaterThan(0);
            expect(result.metadata.totalNodes).toBe(result.nodes.length);
            expect(result.metadata.totalEdges).toBe(result.edges.length);
        });

        it('should extract node hierarchy correctly', async () => {
            const markdown = `
# Main Topic

## Subtopic 1

### Detail 1

## Subtopic 2
      `.trim();

            const result = await parser.parseContent(markdown);

            // Should have nodes at different levels
            const levels = result.nodes.map(n => n.data.level);
            expect(Math.max(...levels)).toBeGreaterThan(0);
        });

        it('should sanitize malicious content', async () => {
            const markdown = `
# Safe Header

<script>alert('xss')</script>

[Link](javascript:alert('xss'))
      `.trim();

            const result = await parser.parseContent(markdown);

            // Should not throw and should produce valid graph
            expect(result.nodes.length).toBeGreaterThan(0);
            expect(result.metadata).toBeDefined();
        });

        it('should extract difficulty levels', async () => {
            const markdown = `
# Beginner Topic

This is a beginner level topic.

# Advanced Topic

This is an advanced level topic.
      `.trim();

            const result = await parser.parseContent(markdown);

            const difficulties = result.nodes
                .map(n => n.data.difficulty)
                .filter(d => d !== undefined);

            expect(difficulties.length).toBeGreaterThan(0);
        });

        it('should extract estimated time', async () => {
            const markdown = `
# Quick Topic

This takes 2 hours to complete.

# Long Topic

This takes 3 weeks to master.
      `.trim();

            const result = await parser.parseContent(markdown);

            const times = result.nodes
                .map(n => n.data.estimatedTime)
                .filter(t => t !== undefined);

            expect(times.length).toBeGreaterThan(0);
        });

        it('should extract resources from links', async () => {
            const markdown = `
# Topic with Resources

Check out [MDN Documentation](https://developer.mozilla.org) and [Video Tutorial](https://youtube.com/watch).
      `.trim();

            const result = await parser.parseContent(markdown);

            const nodesWithResources = result.nodes.filter(
                n => n.data.resources && n.data.resources.length > 0
            );

            expect(nodesWithResources.length).toBeGreaterThan(0);
        });

        it('should create hierarchical edges', async () => {
            const markdown = `
# Parent

## Child 1

## Child 2
      `.trim();

            const result = await parser.parseContent(markdown, {
                includeSubsections: true,
                maxDepth: 5,
                extractDependencies: true,
                autoLayout: true,
            });

            expect(result.edges.length).toBeGreaterThan(0);
        });

        it('should handle empty content gracefully', async () => {
            const markdown = '';

            await expect(parser.parseContent(markdown)).rejects.toThrow();
        });

        it('should handle content without headers', async () => {
            const markdown = 'Just some text without any headers.';

            await expect(parser.parseContent(markdown)).rejects.toThrow();
        });

        it('should respect maxDepth option', async () => {
            const markdown = `
# Level 1
## Level 2
### Level 3
#### Level 4
##### Level 5
###### Level 6
      `.trim();

            const result = await parser.parseContent(markdown, {
                includeSubsections: true,
                maxDepth: 3,
                extractDependencies: false,
                autoLayout: false,
            });

            const maxLevel = Math.max(...result.nodes.map(n => n.data.level));
            expect(maxLevel).toBeLessThanOrEqual(3);
        });

        it('should determine node types correctly', async () => {
            const markdown = `
# Main Topic

## Prerequisite Section

This is a prerequisite.

## Milestone Section

This is a milestone.

## Resource Section

This is a resource.
      `.trim();

            const result = await parser.parseContent(markdown);

            const nodeTypes = result.nodes.map(n => n.type);
            expect(nodeTypes).toContain('topic');
        });

        it('should validate generated graph data', async () => {
            const markdown = `
# Valid Roadmap

## Section 1

## Section 2
      `.trim();

            const result = await parser.parseContent(markdown);

            // Should not throw validation error
            expect(result.nodes.length).toBeGreaterThan(0);
            expect(result.metadata.totalNodes).toBe(result.nodes.length);

            // All node IDs should be unique
            const nodeIds = result.nodes.map(n => n.id);
            const uniqueIds = new Set(nodeIds);
            expect(uniqueIds.size).toBe(nodeIds.length);
        });
    });
});
