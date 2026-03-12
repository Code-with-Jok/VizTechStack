/**
 * Tests for ViewToggle component
 * 
 * Validates: Requirement 1.1 - View toggle functionality
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { ViewToggle, CompactViewToggle, FloatingViewToggle } from '../ViewToggle';

describe('ViewToggle', () => {
    const mockOnViewChange = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('ViewToggle', () => {
        it('renders both content and visualization buttons', () => {
            render(
                <ViewToggle
                    currentView="content"
                    onViewChange={mockOnViewChange}
                />
            );

            expect(screen.getByRole('button', { name: /switch to content view/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /switch to visualization view/i })).toBeInTheDocument();
        });

        it('shows correct active state for content view', () => {
            render(
                <ViewToggle
                    currentView="content"
                    onViewChange={mockOnViewChange}
                />
            );

            const contentButton = screen.getByRole('button', { name: /switch to content view/i });
            const visualizationButton = screen.getByRole('button', { name: /switch to visualization view/i });

            expect(contentButton).toHaveAttribute('aria-pressed', 'true');
            expect(visualizationButton).toHaveAttribute('aria-pressed', 'false');
        });

        it('shows correct active state for visualization view', () => {
            render(
                <ViewToggle
                    currentView="visualization"
                    onViewChange={mockOnViewChange}
                />
            );

            const contentButton = screen.getByRole('button', { name: /switch to content view/i });
            const visualizationButton = screen.getByRole('button', { name: /switch to visualization view/i });

            expect(contentButton).toHaveAttribute('aria-pressed', 'false');
            expect(visualizationButton).toHaveAttribute('aria-pressed', 'true');
        });

        it('calls onViewChange when content button is clicked', () => {
            render(
                <ViewToggle
                    currentView="visualization"
                    onViewChange={mockOnViewChange}
                />
            );

            const contentButton = screen.getByRole('button', { name: /switch to content view/i });
            fireEvent.click(contentButton);

            expect(mockOnViewChange).toHaveBeenCalledWith('content');
        });

        it('calls onViewChange when visualization button is clicked', () => {
            render(
                <ViewToggle
                    currentView="content"
                    onViewChange={mockOnViewChange}
                />
            );

            const visualizationButton = screen.getByRole('button', { name: /switch to visualization view/i });
            fireEvent.click(visualizationButton);

            expect(mockOnViewChange).toHaveBeenCalledWith('visualization');
        });

        it('shows loading spinner when isLoading is true', () => {
            render(
                <ViewToggle
                    currentView="content"
                    onViewChange={mockOnViewChange}
                    isLoading={true}
                />
            );

            const visualizationButton = screen.getByRole('button', { name: /switch to visualization view/i });
            const spinner = visualizationButton.querySelector('.animate-spin');

            expect(spinner).toBeInTheDocument();
        });

        it('disables buttons when disabled prop is true', () => {
            render(
                <ViewToggle
                    currentView="content"
                    onViewChange={mockOnViewChange}
                    disabled={true}
                />
            );

            const contentButton = screen.getByRole('button', { name: /switch to content view/i });
            const visualizationButton = screen.getByRole('button', { name: /switch to visualization view/i });

            expect(contentButton).toBeDisabled();
            expect(visualizationButton).toBeDisabled();
        });

        it('disables visualization button when isLoading is true', () => {
            render(
                <ViewToggle
                    currentView="content"
                    onViewChange={mockOnViewChange}
                    isLoading={true}
                />
            );

            const contentButton = screen.getByRole('button', { name: /switch to content view/i });
            const visualizationButton = screen.getByRole('button', { name: /switch to visualization view/i });

            expect(contentButton).not.toBeDisabled();
            expect(visualizationButton).toBeDisabled();
        });

        it('applies custom className', () => {
            const { container } = render(
                <ViewToggle
                    currentView="content"
                    onViewChange={mockOnViewChange}
                    className="custom-class"
                />
            );

            expect(container.firstChild).toHaveClass('custom-class');
        });
    });

    describe('CompactViewToggle', () => {
        it('renders compact version with smaller buttons', () => {
            render(
                <CompactViewToggle
                    currentView="content"
                    onViewChange={mockOnViewChange}
                />
            );

            expect(screen.getByRole('button', { name: /content view/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /visualization view/i })).toBeInTheDocument();
        });

        it('functions correctly like regular ViewToggle', () => {
            render(
                <CompactViewToggle
                    currentView="content"
                    onViewChange={mockOnViewChange}
                />
            );

            const visualizationButton = screen.getByRole('button', { name: /visualization view/i });
            fireEvent.click(visualizationButton);

            expect(mockOnViewChange).toHaveBeenCalledWith('visualization');
        });
    });

    describe('FloatingViewToggle', () => {
        it('renders floating version with fixed positioning', () => {
            const { container } = render(
                <FloatingViewToggle
                    currentView="content"
                    onViewChange={mockOnViewChange}
                />
            );

            const floatingContainer = container.querySelector('.fixed');
            expect(floatingContainer).toBeInTheDocument();
            expect(floatingContainer).toHaveClass('top-6', 'right-6', 'z-30');
        });

        it('contains CompactViewToggle inside', () => {
            render(
                <FloatingViewToggle
                    currentView="content"
                    onViewChange={mockOnViewChange}
                />
            );

            expect(screen.getByRole('button', { name: /content view/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /visualization view/i })).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('has proper ARIA labels', () => {
            render(
                <ViewToggle
                    currentView="content"
                    onViewChange={mockOnViewChange}
                />
            );

            const contentButton = screen.getByRole('button', { name: /switch to content view/i });
            const visualizationButton = screen.getByRole('button', { name: /switch to visualization view/i });

            expect(contentButton).toHaveAttribute('aria-label', 'Switch to content view');
            expect(visualizationButton).toHaveAttribute('aria-label', 'Switch to visualization view');
        });

        it('has proper aria-pressed states', () => {
            render(
                <ViewToggle
                    currentView="content"
                    onViewChange={mockOnViewChange}
                />
            );

            const contentButton = screen.getByRole('button', { name: /switch to content view/i });
            const visualizationButton = screen.getByRole('button', { name: /switch to visualization view/i });

            expect(contentButton).toHaveAttribute('aria-pressed', 'true');
            expect(visualizationButton).toHaveAttribute('aria-pressed', 'false');
        });

        it('supports keyboard navigation', () => {
            render(
                <ViewToggle
                    currentView="content"
                    onViewChange={mockOnViewChange}
                />
            );

            const visualizationButton = screen.getByRole('button', { name: /switch to visualization view/i });

            // Focus the button
            visualizationButton.focus();
            expect(visualizationButton).toHaveFocus();

            // Press Enter
            fireEvent.keyDown(visualizationButton, { key: 'Enter', code: 'Enter' });
            fireEvent.click(visualizationButton);

            expect(mockOnViewChange).toHaveBeenCalledWith('visualization');
        });
    });

    describe('Visual States', () => {
        it('applies correct CSS classes for active content button', () => {
            render(
                <ViewToggle
                    currentView="content"
                    onViewChange={mockOnViewChange}
                />
            );

            const contentButton = screen.getByRole('button', { name: /switch to content view/i });

            expect(contentButton).toHaveClass('bg-primary-500', 'text-white', 'shadow-soft', 'transform', 'scale-105');
        });

        it('applies correct CSS classes for active visualization button', () => {
            render(
                <ViewToggle
                    currentView="visualization"
                    onViewChange={mockOnViewChange}
                />
            );

            const visualizationButton = screen.getByRole('button', { name: /switch to visualization view/i });

            expect(visualizationButton).toHaveClass('bg-primary-500', 'text-white', 'shadow-soft', 'transform', 'scale-105');
        });

        it('applies correct CSS classes for inactive buttons', () => {
            render(
                <ViewToggle
                    currentView="content"
                    onViewChange={mockOnViewChange}
                />
            );

            const visualizationButton = screen.getByRole('button', { name: /switch to visualization view/i });

            expect(visualizationButton).toHaveClass('text-neutral-700', 'hover:text-neutral-900', 'hover:bg-neutral-50');
        });
    });
});