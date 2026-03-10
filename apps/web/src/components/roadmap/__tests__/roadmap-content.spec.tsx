import { render, screen } from '@testing-library/react';
import { RoadmapContent } from '../roadmap-content';

describe('RoadmapContent', () => {
    it('renders basic markdown content', () => {
        const content = '# Heading\n\nThis is a paragraph with **bold** text.';

        render(<RoadmapContent content={content} />);

        expect(screen.getByText('Heading')).toBeInTheDocument();
        expect(screen.getByText('bold')).toBeInTheDocument();
    });

    it('renders markdown lists', () => {
        const content = '* Item 1\n* Item 2\n* Item 3';

        render(<RoadmapContent content={content} />);

        expect(screen.getByText('Item 1')).toBeInTheDocument();
        expect(screen.getByText('Item 2')).toBeInTheDocument();
        expect(screen.getByText('Item 3')).toBeInTheDocument();
    });

    it('renders markdown links', () => {
        const content = 'Check out [Google](https://google.com) for more info.';

        render(<RoadmapContent content={content} />);

        const link = screen.getByRole('link', { name: 'Google' });
        expect(link).toHaveAttribute('href', 'https://google.com');
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('renders code blocks', () => {
        const content = 'Here is some `inline code` and:\n\n```\nconst x = 1;\n```';

        render(<RoadmapContent content={content} />);

        expect(screen.getByText('inline code')).toBeInTheDocument();
        expect(screen.getByText('const x = 1;')).toBeInTheDocument();
    });

    it('handles empty content', () => {
        render(<RoadmapContent content="" />);

        // Should render without crashing
        expect(document.querySelector('.roadmap-content')).toBeInTheDocument();
    });

    it('applies proper CSS classes for styling', () => {
        const content = '# Test Content';

        render(<RoadmapContent content={content} />);

        const container = document.querySelector('.prose');
        expect(container).toHaveClass('prose-zinc', 'dark:prose-invert', 'max-w-none');
    });
});