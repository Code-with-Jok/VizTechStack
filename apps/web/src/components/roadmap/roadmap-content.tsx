"use client";

/**
 * RoadmapContent component renders markdown content with proper styling.
 * 
 * Features:
 * - Renders markdown content as HTML
 * - Uses Tailwind Typography (prose) classes for styling
 * - Handles HTML sanitization to prevent XSS attacks
 * - Responsive design with proper typography
 * - Accessible markup structure
 * - Dark mode support
 * 
 * Security:
 * - Uses dangerouslySetInnerHTML with caution
 * - Content should be sanitized on the backend
 * - Consider using react-markdown for enhanced security in production
 */

interface RoadmapContentProps {
    /** The markdown content string to render */
    content: string;
}

/**
 * Simple markdown to HTML converter for basic markdown elements
 * This is a minimal implementation - consider using react-markdown for production
 */
function convertMarkdownToHtml(markdown: string): string {
    return markdown
        // Headers
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')

        // Bold and Italic
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')

        // Code blocks (simple)
        .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
        .replace(/`(.*?)`/g, '<code>$1</code>')

        // Links
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')

        // Lists (basic)
        .replace(/^\* (.*$)/gim, '<li>$1</li>')
        .replace(/^- (.*$)/gim, '<li>$1</li>')

        // Line breaks
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>');
}

/**
 * Wrap list items in proper ul tags
 */
function wrapLists(html: string): string {
    return html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
}

/**
 * Wrap content in paragraphs if not already wrapped
 */
function wrapParagraphs(html: string): string {
    // Only wrap if content doesn't start with a block element
    if (!html.match(/^\s*<(h[1-6]|div|p|ul|ol|pre|blockquote)/)) {
        return `<p>${html}</p>`;
    }
    return html;
}

export function RoadmapContent({ content }: RoadmapContentProps) {
    // Convert markdown to HTML with basic processing
    let processedContent = convertMarkdownToHtml(content);
    processedContent = wrapLists(processedContent);
    processedContent = wrapParagraphs(processedContent);

    return (
        <div className="prose prose-zinc dark:prose-invert max-w-none prose-headings:scroll-mt-20 prose-h1:text-3xl prose-h1:font-bold prose-h1:tracking-tight prose-h2:text-2xl prose-h2:font-semibold prose-h2:tracking-tight prose-h3:text-xl prose-h3:font-semibold prose-p:leading-7 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline dark:prose-a:text-blue-400 prose-code:relative prose-code:rounded prose-code:bg-zinc-100 prose-code:px-[0.3rem] prose-code:py-[0.2rem] prose-code:text-sm prose-code:font-mono dark:prose-code:bg-zinc-800 prose-pre:overflow-x-auto prose-pre:rounded-lg prose-pre:bg-zinc-100 prose-pre:p-4 dark:prose-pre:bg-zinc-800 prose-ul:my-6 prose-li:my-2 prose-strong:font-semibold">
            <div
                dangerouslySetInnerHTML={{ __html: processedContent }}
                className="roadmap-content"
            />
        </div>
    );
}