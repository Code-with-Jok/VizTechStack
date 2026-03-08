/**
 * MarkdownRenderer Component
 * 
 * Renders markdown content as formatted HTML with syntax highlighting support.
 * 
 * Features:
 * - Parses markdown to HTML
 * - Sanitizes HTML to prevent XSS attacks
 * - Applies styling for markdown elements
 * - Supports code blocks, lists, headings, links, etc.
 * 
 * Usage:
 * ```tsx
 * import { MarkdownRenderer } from '@/features/topic/components/MarkdownRenderer';
 * 
 * function TopicContent() {
 *   const markdown = "# Hello\n\nThis is **bold** text.";
 *   return <MarkdownRenderer content={markdown} />;
 * }
 * ```
 * 
 * @param content - The markdown string to render
 */
'use client';

import { useMemo } from 'react';

interface MarkdownRendererProps {
    content: string;
}

/**
 * Simple markdown parser that converts markdown to HTML
 * Supports: headings, bold, italic, links, code blocks, inline code, lists
 */
function parseMarkdown(markdown: string): string {
    let html = markdown;

    // Escape HTML to prevent XSS
    html = html
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    // Code blocks (must be before inline code)
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
        const language = lang || 'plaintext';
        return `<pre class="code-block"><code class="language-${language}">${code.trim()}</code></pre>`;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

    // Headings
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Bold
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    html = html.replace(/_([^_]+)_/g, '<em>$1</em>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // Unordered lists
    html = html.replace(/^\* (.+)$/gim, '<li>$1</li>');
    html = html.replace(/^- (.+)$/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

    // Ordered lists
    html = html.replace(/^\d+\. (.+)$/gim, '<li>$1</li>');

    // Paragraphs (lines separated by blank lines)
    const lines = html.split('\n');
    const paragraphs: string[] = [];
    let currentParagraph = '';

    for (const line of lines) {
        const trimmedLine = line.trim();

        // Skip if it's already wrapped in a tag
        if (
            trimmedLine.startsWith('<h') ||
            trimmedLine.startsWith('<pre') ||
            trimmedLine.startsWith('<ul') ||
            trimmedLine.startsWith('<ol') ||
            trimmedLine.startsWith('<li') ||
            trimmedLine.startsWith('</') ||
            trimmedLine === ''
        ) {
            if (currentParagraph) {
                paragraphs.push(`<p>${currentParagraph}</p>`);
                currentParagraph = '';
            }
            if (trimmedLine) {
                paragraphs.push(trimmedLine);
            }
        } else {
            if (currentParagraph) {
                currentParagraph += ' ';
            }
            currentParagraph += trimmedLine;
        }
    }

    if (currentParagraph) {
        paragraphs.push(`<p>${currentParagraph}</p>`);
    }

    html = paragraphs.join('\n');

    return html;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
    const htmlContent = useMemo(() => parseMarkdown(content), [content]);

    return (
        <div
            className="markdown-content prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
            style={{
                // Styling for markdown elements
                '--tw-prose-body': 'rgb(55 65 81)',
                '--tw-prose-headings': 'rgb(17 24 39)',
                '--tw-prose-links': 'rgb(59 130 246)',
                '--tw-prose-bold': 'rgb(17 24 39)',
                '--tw-prose-code': 'rgb(17 24 39)',
                '--tw-prose-pre-bg': 'rgb(249 250 251)',
            } as React.CSSProperties}
        />
    );
}
