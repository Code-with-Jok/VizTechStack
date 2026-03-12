import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock the useDeleteRoadmap hook
jest.mock('@/lib/hooks/use-roadmap');

// Import after mocking
import { DeleteRoadmapDialog } from '../delete-roadmap-dialog';
import { useDeleteRoadmap } from '@/lib/hooks/use-roadmap';
import type { Roadmap, NodeCategory } from '@/features/roadmap/types';

const mockUseDeleteRoadmap = useDeleteRoadmap as jest.MockedFunction<typeof useDeleteRoadmap>;

// Mock roadmap data
const mockRoadmap: Roadmap = {
    id: 'roadmap-123',
    slug: 'react-roadmap',
    title: 'React Development Roadmap',
    description: 'Complete guide to learning React',
    content: '# React Roadmap\n\nLearn React step by step...',
    nodeCategory: 'TOPIC',
    author: 'user_123',
    tags: ['react', 'javascript', 'frontend'],
    publishedAt: Date.now(),
    updatedAt: Date.now(),
    isPublished: true,
};

describe('DeleteRoadmapDialog', () => {
    const mockDeleteRoadmap = jest.fn();
    const mockOnOpenChange = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseDeleteRoadmap.mockReturnValue({
            deleteRoadmap: mockDeleteRoadmap,
            loading: false,
            error: undefined,
        });
    });

    it('should render dialog when open is true', () => {
        render(
            <DeleteRoadmapDialog
                roadmap={mockRoadmap}
                open={true}
                onOpenChange={mockOnOpenChange}
            />
        );

        expect(screen.getByText('Delete Roadmap')).toBeInTheDocument();
        expect(screen.getByText(/Are you sure you want to delete.*React Development Roadmap/)).toBeInTheDocument();
        expect(screen.getByText('Cancel')).toBeInTheDocument();
        expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('should not render dialog when open is false', () => {
        render(
            <DeleteRoadmapDialog
                roadmap={mockRoadmap}
                open={false}
                onOpenChange={mockOnOpenChange}
            />
        );

        expect(screen.queryByText('Delete Roadmap')).not.toBeInTheDocument();
    });

    it('should call onOpenChange when cancel button is clicked', async () => {
        render(
            <DeleteRoadmapDialog
                roadmap={mockRoadmap}
                open={true}
                onOpenChange={mockOnOpenChange}
            />
        );

        const cancelButton = screen.getByText('Cancel');
        fireEvent.click(cancelButton);

        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    it('should call deleteRoadmap when delete button is clicked', async () => {
        mockDeleteRoadmap.mockResolvedValue(mockRoadmap);

        render(
            <DeleteRoadmapDialog
                roadmap={mockRoadmap}
                open={true}
                onOpenChange={mockOnOpenChange}
            />
        );

        const deleteButton = screen.getByText('Delete');
        fireEvent.click(deleteButton);

        expect(mockDeleteRoadmap).toHaveBeenCalledWith('roadmap-123');
    });

    it('should close dialog after successful deletion', async () => {
        mockDeleteRoadmap.mockResolvedValue(mockRoadmap);

        render(
            <DeleteRoadmapDialog
                roadmap={mockRoadmap}
                open={true}
                onOpenChange={mockOnOpenChange}
            />
        );

        const deleteButton = screen.getByText('Delete');
        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(mockOnOpenChange).toHaveBeenCalledWith(false);
        });
    });

    it('should show loading state when deleting', () => {
        mockUseDeleteRoadmap.mockReturnValue({
            deleteRoadmap: mockDeleteRoadmap,
            loading: true,
            error: undefined,
        });

        render(
            <DeleteRoadmapDialog
                roadmap={mockRoadmap}
                open={true}
                onOpenChange={mockOnOpenChange}
            />
        );

        expect(screen.getByText('Deleting...')).toBeInTheDocument();

        // Buttons should be disabled when loading
        const cancelButton = screen.getByText('Cancel');
        const deleteButton = screen.getByText('Deleting...');

        expect(cancelButton).toBeDisabled();
        expect(deleteButton).toBeDisabled();
    });

    it('should show error message when deletion fails', async () => {
        const errorMessage = 'Failed to delete roadmap';
        mockDeleteRoadmap.mockRejectedValue(new Error(errorMessage));

        render(
            <DeleteRoadmapDialog
                roadmap={mockRoadmap}
                open={true}
                onOpenChange={mockOnOpenChange}
            />
        );

        const deleteButton = screen.getByText('Delete');
        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(screen.getByText(errorMessage)).toBeInTheDocument();
        });

        // Reset mock calls to check if dialog closes after error
        mockOnOpenChange.mockClear();

        // Wait a bit more to ensure no additional calls
        await new Promise(resolve => setTimeout(resolve, 100));

        // Dialog should remain open when there's an error (no additional calls to close)
        expect(mockOnOpenChange).not.toHaveBeenCalled();
    });

    it('should clear error when cancel is clicked', async () => {
        mockDeleteRoadmap.mockRejectedValue(new Error('Delete failed'));

        render(
            <DeleteRoadmapDialog
                roadmap={mockRoadmap}
                open={true}
                onOpenChange={mockOnOpenChange}
            />
        );

        // First, trigger an error
        const deleteButton = screen.getByText('Delete');
        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(screen.getByText('Delete failed')).toBeInTheDocument();
        });

        // Then click cancel
        const cancelButton = screen.getByText('Cancel');
        fireEvent.click(cancelButton);

        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    it('should handle non-Error objects in catch block', async () => {
        mockDeleteRoadmap.mockRejectedValue('String error');

        render(
            <DeleteRoadmapDialog
                roadmap={mockRoadmap}
                open={true}
                onOpenChange={mockOnOpenChange}
            />
        );

        const deleteButton = screen.getByText('Delete');
        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(screen.getByText('Failed to delete roadmap')).toBeInTheDocument();
        });
    });

    it('should have correct styling for delete button', () => {
        render(
            <DeleteRoadmapDialog
                roadmap={mockRoadmap}
                open={true}
                onOpenChange={mockOnOpenChange}
            />
        );

        const deleteButton = screen.getByText('Delete');
        expect(deleteButton).toHaveClass('bg-red-600', 'hover:bg-red-700', 'focus:ring-red-600');
    });

    it('should display roadmap title in confirmation message', () => {
        const customRoadmap = {
            ...mockRoadmap,
            title: 'Custom Roadmap Title',
        };

        render(
            <DeleteRoadmapDialog
                roadmap={customRoadmap}
                open={true}
                onOpenChange={mockOnOpenChange}
            />
        );

        expect(screen.getByText(/Are you sure you want to delete.*Custom Roadmap Title/)).toBeInTheDocument();
    });
});