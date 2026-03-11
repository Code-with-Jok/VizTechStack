/**
 * Tests for VisualizationControls component
 * Validates zoom controls, layout switching, and accessibility
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { VisualizationControls } from '../VisualizationControls';
import type { LayoutType } from '@viztechstack/roadmap-visualization';

describe('VisualizationControls', () => {
    const mockProps = {
        onZoomIn: jest.fn(),
        onZoomOut: jest.fn(),
        onFitView: jest.fn(),
        onPanReset: jest.fn(),
        onLayoutChange: jest.fn(),
        currentLayout: 'hierarchical' as LayoutType,
        zoomLevel: 1.5,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Zoom Controls', () => {
        it('should render zoom in button with correct accessibility attributes', () => {
            render(<VisualizationControls {...mockProps} />);

            const zoomInButton = screen.getByRole('button', { name: /zoom in/i });
            expect(zoomInButton).toBeInTheDocument();
            expect(zoomInButton).toHaveAttribute('title', 'Phóng to (Ctrl + +)');
            expect(zoomInButton).toHaveAttribute('aria-label', 'Zoom in');
        });

        it('should render zoom out button with correct accessibility attributes', () => {
            render(<VisualizationControls {...mockProps} />);

            const zoomOutButton = screen.getByRole('button', { name: /zoom out/i });
            expect(zoomOutButton).toBeInTheDocument();
            expect(zoomOutButton).toHaveAttribute('title', 'Thu nhỏ (Ctrl + -)');
            expect(zoomOutButton).toHaveAttribute('aria-label', 'Zoom out');
        });

        it('should render fit view button with correct accessibility attributes', () => {
            render(<VisualizationControls {...mockProps} />);

            const fitViewButton = screen.getByRole('button', { name: /fit to view/i });
            expect(fitViewButton).toBeInTheDocument();
            expect(fitViewButton).toHaveAttribute('title', 'Vừa màn hình (Ctrl + 0)');
            expect(fitViewButton).toHaveAttribute('aria-label', 'Fit to view');
        });

        it('should render pan reset button with correct accessibility attributes', () => {
            render(<VisualizationControls {...mockProps} />);

            const panResetButton = screen.getByRole('button', { name: /reset pan position/i });
            expect(panResetButton).toBeInTheDocument();
            expect(panResetButton).toHaveAttribute('title', 'Đặt lại vị trí (Ctrl + R)');
            expect(panResetButton).toHaveAttribute('aria-label', 'Reset pan position');
        });

        it('should call onZoomIn when zoom in button is clicked', () => {
            render(<VisualizationControls {...mockProps} />);

            const zoomInButton = screen.getByRole('button', { name: /zoom in/i });
            fireEvent.click(zoomInButton);

            expect(mockProps.onZoomIn).toHaveBeenCalledTimes(1);
        });

        it('should call onZoomOut when zoom out button is clicked', () => {
            render(<VisualizationControls {...mockProps} />);

            const zoomOutButton = screen.getByRole('button', { name: /zoom out/i });
            fireEvent.click(zoomOutButton);

            expect(mockProps.onZoomOut).toHaveBeenCalledTimes(1);
        });

        it('should call onFitView when fit view button is clicked', () => {
            render(<VisualizationControls {...mockProps} />);

            const fitViewButton = screen.getByRole('button', { name: /fit to view/i });
            fireEvent.click(fitViewButton);

            expect(mockProps.onFitView).toHaveBeenCalledTimes(1);
        });

        it('should call onPanReset when pan reset button is clicked', () => {
            render(<VisualizationControls {...mockProps} />);

            const panResetButton = screen.getByRole('button', { name: /reset pan position/i });
            fireEvent.click(panResetButton);

            expect(mockProps.onPanReset).toHaveBeenCalledTimes(1);
        });
    });

    describe('Zoom Level Indicator', () => {
        it('should display zoom level as percentage', () => {
            render(<VisualizationControls {...mockProps} zoomLevel={1.5} />);

            expect(screen.getByText('150%')).toBeInTheDocument();
        });

        it('should round zoom level to nearest integer', () => {
            render(<VisualizationControls {...mockProps} zoomLevel={1.234} />);

            expect(screen.getByText('123%')).toBeInTheDocument();
        });

        it('should handle zoom level of 1 (100%)', () => {
            render(<VisualizationControls {...mockProps} zoomLevel={1} />);

            expect(screen.getByText('100%')).toBeInTheDocument();
        });

        it('should handle very small zoom levels', () => {
            render(<VisualizationControls {...mockProps} zoomLevel={0.1} />);

            expect(screen.getByText('10%')).toBeInTheDocument();
        });

        it('should handle large zoom levels', () => {
            render(<VisualizationControls {...mockProps} zoomLevel={2.5} />);

            expect(screen.getByText('250%')).toBeInTheDocument();
        });

        it('should use default zoom level when not provided', () => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { zoomLevel: _zoomLevel, ...propsWithoutZoom } = mockProps;
            render(<VisualizationControls {...propsWithoutZoom} />);

            expect(screen.getByText('100%')).toBeInTheDocument();
        });
    });

    describe('Layout Selector', () => {
        it('should render layout selector with correct options', () => {
            render(<VisualizationControls {...mockProps} />);

            const layoutSelect = screen.getByRole('combobox', { name: /select layout type/i });
            expect(layoutSelect).toBeInTheDocument();

            // Check all layout options are present
            expect(screen.getByRole('option', { name: 'Phân cấp' })).toBeInTheDocument();
            expect(screen.getByRole('option', { name: 'Lực hút' })).toBeInTheDocument();
            expect(screen.getByRole('option', { name: 'Vòng tròn' })).toBeInTheDocument();
            expect(screen.getByRole('option', { name: 'Lưới' })).toBeInTheDocument();
        });

        it('should display current layout as selected', () => {
            render(<VisualizationControls {...mockProps} currentLayout="force" />);

            const layoutSelect = screen.getByRole('combobox') as HTMLSelectElement;
            expect(layoutSelect.value).toBe('force');
        });

        it('should call onLayoutChange when layout is changed', () => {
            render(<VisualizationControls {...mockProps} />);

            const layoutSelect = screen.getByRole('combobox');
            fireEvent.change(layoutSelect, { target: { value: 'circular' } });

            expect(mockProps.onLayoutChange).toHaveBeenCalledWith('circular');
        });

        it('should handle all layout types correctly', () => {
            const layouts: LayoutType[] = ['hierarchical', 'force', 'circular', 'grid'];

            layouts.forEach(layout => {
                const { rerender } = render(
                    <VisualizationControls {...mockProps} currentLayout={layout} />
                );

                const layoutSelect = screen.getByRole('combobox') as HTMLSelectElement;
                expect(layoutSelect.value).toBe(layout);

                rerender(<div />); // Clean up for next iteration
            });
        });
    });

    describe('Styling and Layout', () => {
        it('should apply custom className', () => {
            const { container } = render(
                <VisualizationControls {...mockProps} className="custom-class" />
            );

            const controlsContainer = container.firstChild as HTMLElement;
            expect(controlsContainer).toHaveClass('custom-class');
        });

        it('should have proper button styling classes', () => {
            render(<VisualizationControls {...mockProps} />);

            const buttons = screen.getAllByRole('button');
            buttons.forEach(button => {
                expect(button).toHaveClass('viz-button', 'group');
            });
        });

        it('should have proper layout with gaps and dividers', () => {
            const { container } = render(<VisualizationControls {...mockProps} />);

            const controlsContainer = container.firstChild as HTMLElement;
            expect(controlsContainer).toHaveClass('flex', 'items-center', 'gap-3');
        });
    });

    describe('Accessibility', () => {
        it('should have proper ARIA labels for all interactive elements', () => {
            render(<VisualizationControls {...mockProps} />);

            expect(screen.getByLabelText('Zoom in')).toBeInTheDocument();
            expect(screen.getByLabelText('Zoom out')).toBeInTheDocument();
            expect(screen.getByLabelText('Fit to view')).toBeInTheDocument();
            expect(screen.getByLabelText('Select layout type')).toBeInTheDocument();
        });

        it('should support keyboard navigation', () => {
            render(<VisualizationControls {...mockProps} />);

            const zoomInButton = screen.getByRole('button', { name: /zoom in/i });
            zoomInButton.focus();
            expect(document.activeElement).toBe(zoomInButton);

            // Tab to next element
            fireEvent.keyDown(zoomInButton, { key: 'Tab' });
            // Note: Full tab navigation testing would require more complex setup
        });

        it('should provide keyboard shortcuts information in tooltips', () => {
            render(<VisualizationControls {...mockProps} />);

            expect(screen.getByTitle('Phóng to (Ctrl + +)')).toBeInTheDocument();
            expect(screen.getByTitle('Thu nhỏ (Ctrl + -)')).toBeInTheDocument();
            expect(screen.getByTitle('Vừa màn hình (Ctrl + 0)')).toBeInTheDocument();
            expect(screen.getByTitle('Đặt lại vị trí (Ctrl + R)')).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('should handle undefined zoom level gracefully', () => {
            render(<VisualizationControls {...mockProps} zoomLevel={undefined} />);

            expect(screen.getByText('100%')).toBeInTheDocument();
        });

        it('should handle NaN zoom level gracefully', () => {
            render(<VisualizationControls {...mockProps} zoomLevel={NaN} />);

            expect(screen.getByText('NaN%')).toBeInTheDocument();
        });

        it('should handle negative zoom level', () => {
            render(<VisualizationControls {...mockProps} zoomLevel={-0.5} />);

            expect(screen.getByText('-50%')).toBeInTheDocument();
        });

        it('should handle zero zoom level', () => {
            render(<VisualizationControls {...mockProps} zoomLevel={0} />);

            expect(screen.getByText('0%')).toBeInTheDocument();
        });
    });
});