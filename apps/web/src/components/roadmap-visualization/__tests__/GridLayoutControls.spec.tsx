/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GridLayoutControls } from '../GridLayoutControls';
import type { GridLayoutOptions } from '@viztechstack/roadmap-visualization';

const mockOptions: GridLayoutOptions = {
    width: 1200,
    height: 800,
    columns: 0,
    rows: 0,
    cellWidth: 200,
    cellHeight: 120,
    paddingX: 20,
    paddingY: 20,
    marginX: 40,
    marginY: 40,
    autoSize: true,
    sortBy: 'level',
    sortDirection: 'asc',
    groupBy: 'level',
    enableOptimization: true,
    preventOverlaps: true,
    centerGrid: true,
    aspectRatio: 1.5
};

const mockAlignment = {
    horizontal: 'center' as const,
    vertical: 'center' as const
};

const defaultProps = {
    options: mockOptions,
    onOptionsChange: jest.fn(),
    snapToGrid: true,
    onSnapToGridChange: jest.fn(),
    showGridLines: false,
    onShowGridLinesChange: jest.fn(),
    alignment: mockAlignment,
    onAlignmentChange: jest.fn(),
    onOptimizeForContent: jest.fn()
};

describe('GridLayoutControls', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('rendering', () => {
        it('should render with collapsed state by default', () => {
            render(<GridLayoutControls {...defaultProps} />);

            expect(screen.getByText('Điều khiển bố cục lưới')).toBeInTheDocument();
            expect(screen.queryByText('Kích thước')).not.toBeInTheDocument();
        });

        it('should expand when header is clicked', async () => {
            render(<GridLayoutControls {...defaultProps} />);

            const expandButton = screen.getByLabelText('Mở rộng điều khiển');
            fireEvent.click(expandButton);

            await waitFor(() => {
                expect(screen.getByText('Kích thước')).toBeInTheDocument();
                expect(screen.getByText('Khoảng cách')).toBeInTheDocument();
                expect(screen.getByText('Căn chỉnh')).toBeInTheDocument();
            });
        });
    });

    describe('size controls', () => {
        beforeEach(async () => {
            render(<GridLayoutControls {...defaultProps} />);
            const expandButton = screen.getByLabelText('Mở rộng điều khiển');
            fireEvent.click(expandButton);
            await waitFor(() => {
                expect(screen.getByText('Kích thước')).toBeInTheDocument();
            });
        });

        it('should show auto-size toggle', () => {
            expect(screen.getByText('Tự động điều chỉnh kích thước')).toBeInTheDocument();
            const checkbox = screen.getByRole('checkbox', { name: /tự động điều chỉnh kích thước/i });
            expect(checkbox).toBeChecked();
        });

        it('should call onOptionsChange when auto-size is toggled', () => {
            const checkbox = screen.getByRole('checkbox', { name: /tự động điều chỉnh kích thước/i });
            fireEvent.click(checkbox);

            expect(defaultProps.onOptionsChange).toHaveBeenCalledWith({ autoSize: false });
        });

        it('should show manual grid controls when auto-size is disabled', async () => {
            const propsWithManualSize = {
                ...defaultProps,
                options: { ...mockOptions, autoSize: false, columns: 5, rows: 4 }
            };

            render(<GridLayoutControls {...propsWithManualSize} />);
            const expandButton = screen.getByLabelText('Mở rộng điều khiển');
            fireEvent.click(expandButton);

            await waitFor(() => {
                expect(screen.getByText('Số cột: 5')).toBeInTheDocument();
                expect(screen.getByText('Số hàng: 4')).toBeInTheDocument();
            });
        });

        it('should show cell size controls', () => {
            expect(screen.getByText('Chiều rộng ô: 200px')).toBeInTheDocument();
            expect(screen.getByText('Chiều cao ô: 120px')).toBeInTheDocument();
        });
    });
    describe('spacing controls', () => {
        beforeEach(async () => {
            render(<GridLayoutControls {...defaultProps} />);
            const expandButton = screen.getByLabelText('Mở rộng điều khiển');
            fireEvent.click(expandButton);

            await waitFor(() => {
                expect(screen.getByText('Kích thước')).toBeInTheDocument();
            });

            const spacingTab = screen.getByText('Khoảng cách');
            fireEvent.click(spacingTab);
        });

        it('should show spacing controls', async () => {
            await waitFor(() => {
                expect(screen.getByText('Khoảng cách ngang: 20px')).toBeInTheDocument();
                expect(screen.getByText('Khoảng cách dọc: 20px')).toBeInTheDocument();
                expect(screen.getByText('Lề ngang: 40px')).toBeInTheDocument();
                expect(screen.getByText('Lề dọc: 40px')).toBeInTheDocument();
            });
        });
    });

    describe('alignment controls', () => {
        beforeEach(async () => {
            render(<GridLayoutControls {...defaultProps} />);
            const expandButton = screen.getByLabelText('Mở rộng điều khiển');
            fireEvent.click(expandButton);

            await waitFor(() => {
                expect(screen.getByText('Kích thước')).toBeInTheDocument();
            });

            const alignmentTab = screen.getByText('Căn chỉnh');
            fireEvent.click(alignmentTab);
        });

        it('should show snap to grid toggle', async () => {
            await waitFor(() => {
                expect(screen.getByText('Bám dính lưới')).toBeInTheDocument();
                const checkbox = screen.getByRole('checkbox', { name: /bám dính lưới/i });
                expect(checkbox).toBeChecked();
            });
        });

        it('should show grid lines toggle', async () => {
            await waitFor(() => {
                expect(screen.getByText('Hiển thị đường lưới')).toBeInTheDocument();
                const checkbox = screen.getByRole('checkbox', { name: /hiển thị đường lưới/i });
                expect(checkbox).not.toBeChecked();
            });
        });

        it('should show alignment buttons', async () => {
            await waitFor(() => {
                expect(screen.getByText('Căn chỉnh ngang')).toBeInTheDocument();
                expect(screen.getByText('Căn chỉnh dọc')).toBeInTheDocument();

                // Check alignment buttons
                expect(screen.getByText('Trái')).toBeInTheDocument();
                expect(screen.getByText('Giữa')).toBeInTheDocument();
                expect(screen.getByText('Phải')).toBeInTheDocument();
                expect(screen.getByText('Trên')).toBeInTheDocument();
                expect(screen.getByText('Dưới')).toBeInTheDocument();
            });
        });

        it('should call onAlignmentChange when alignment button is clicked', async () => {
            await waitFor(() => {
                const leftButton = screen.getByText('Trái');
                fireEvent.click(leftButton);

                expect(defaultProps.onAlignmentChange).toHaveBeenCalledWith({ horizontal: 'left' });
            });
        });

        it('should show sorting options', async () => {
            await waitFor(() => {
                expect(screen.getByText('Sắp xếp theo')).toBeInTheDocument();
                expect(screen.getByText('Nhóm theo')).toBeInTheDocument();
            });
        });
    });

    describe('action buttons', () => {
        beforeEach(async () => {
            render(<GridLayoutControls {...defaultProps} />);
            const expandButton = screen.getByLabelText('Mở rộng điều khiển');
            fireEvent.click(expandButton);

            await waitFor(() => {
                expect(screen.getByText('Kích thước')).toBeInTheDocument();
            });
        });

        it('should show optimize and reset buttons', () => {
            expect(screen.getByText('🎯 Tối ưu cho nội dung')).toBeInTheDocument();
            expect(screen.getByText('Đặt lại mặc định')).toBeInTheDocument();
        });

        it('should call onOptimizeForContent when optimize button is clicked', () => {
            const optimizeButton = screen.getByText('🎯 Tối ưu cho nội dung');
            fireEvent.click(optimizeButton);

            expect(defaultProps.onOptimizeForContent).toHaveBeenCalled();
        });

        it('should call multiple handlers when reset button is clicked', () => {
            const resetButton = screen.getByText('Đặt lại mặc định');
            fireEvent.click(resetButton);

            expect(defaultProps.onOptionsChange).toHaveBeenCalled();
            expect(defaultProps.onSnapToGridChange).toHaveBeenCalledWith(true);
            expect(defaultProps.onShowGridLinesChange).toHaveBeenCalledWith(false);
            expect(defaultProps.onAlignmentChange).toHaveBeenCalledWith({
                horizontal: 'center',
                vertical: 'center'
            });
        });
    });

    describe('layout options', () => {
        beforeEach(async () => {
            render(<GridLayoutControls {...defaultProps} />);
            const expandButton = screen.getByLabelText('Mở rộng điều khiển');
            fireEvent.click(expandButton);

            await waitFor(() => {
                expect(screen.getByText('Kích thước')).toBeInTheDocument();
            });
        });

        it('should show layout option checkboxes', () => {
            expect(screen.getByText('Căn giữa lưới')).toBeInTheDocument();
            expect(screen.getByText('Ngăn chồng lấp')).toBeInTheDocument();
            expect(screen.getByText('Tối ưu hóa bố cục')).toBeInTheDocument();
        });

        it('should reflect current option states', () => {
            const centerGridCheckbox = screen.getByRole('checkbox', { name: /căn giữa lưới/i });
            const preventOverlapsCheckbox = screen.getByRole('checkbox', { name: /ngăn chồng lấp/i });
            const optimizationCheckbox = screen.getByRole('checkbox', { name: /tối ưu hóa bố cục/i });

            expect(centerGridCheckbox).toBeChecked();
            expect(preventOverlapsCheckbox).toBeChecked();
            expect(optimizationCheckbox).toBeChecked();
        });
    });
});