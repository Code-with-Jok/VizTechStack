/**
 * GridLayout - Structured grid positioning algorithm
 * 
 * Validates: Requirement 3.4
 */

import { RoadmapNode, RoadmapEdge, GraphData, Position } from '../types/index';

export interface GridLayoutOptions {
    width: number;
    height: number;
    columns: number;
    rows: number;
    cellWidth: number;
    cellHeight: number;
    paddingX: number;
    paddingY: number;
    marginX: number;
    marginY: number;
    autoSize: boolean;
    sortBy: 'level' | 'section' | 'label' | 'difficulty' | 'none';
    sortDirection: 'asc' | 'desc';
    groupBy: 'level' | 'section' | 'difficulty' | 'none';
    enableOptimization: boolean;
    preventOverlaps: boolean;
    centerGrid: boolean;
    aspectRatio: number;
}

export interface GridLayoutResult {
    nodes: RoadmapNode[];
    edges: RoadmapEdge[];
    bounds: {
        width: number;
        height: number;
        minX: number;
        minY: number;
        maxX: number;
        maxY: number;
    };
    metadata: {
        layoutTime: number;
        nodeCount: number;
        edgeCount: number;
        actualColumns: number;
        actualRows: number;
        cellWidth: number;
        cellHeight: number;
        gridUtilization: number;
    };
}

const DEFAULT_OPTIONS: GridLayoutOptions = {
    width: 1200,
    height: 800,
    columns: 0, // Auto-calculate
    rows: 0, // Auto-calculate
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
    aspectRatio: 1.5 // width/height ratio preference
};

interface GridCell {
    row: number;
    column: number;
    x: number;
    y: number;
    occupied: boolean;
    nodeId?: string;
}

interface GridGroup {
    key: string;
    nodes: RoadmapNode[];
    startRow: number;
    endRow: number;
    startColumn: number;
    endColumn: number;
}

export class GridLayout {
    private options: GridLayoutOptions;

    constructor(options: Partial<GridLayoutOptions> = {}) {
        this.options = { ...DEFAULT_OPTIONS, ...options };
    }

    /**
     * Apply grid layout to graph data
     * Positions nodes in structured grid with optimized dimensions and spacing
     */
    applyLayout(graphData: GraphData): GridLayoutResult {
        const startTime = performance.now();

        // Validate input
        this.validateInput(graphData);

        // Calculate optimal grid dimensions
        const gridDimensions = this.calculateOptimalGridDimensions(graphData.nodes);

        // Sort and group nodes for better organization
        const organizedNodes = this.organizeNodes(graphData.nodes);

        // Create grid structure
        const grid = this.createGrid(gridDimensions.columns, gridDimensions.rows);

        // Position nodes in grid
        const positionedNodes = this.positionNodesInGrid(organizedNodes, grid, gridDimensions);

        // Optimize positioning if enabled
        if (this.options.enableOptimization) {
            this.optimizeGridPositioning(positionedNodes, grid);
        }

        // Calculate bounds
        const bounds = this.calculateBounds(positionedNodes, gridDimensions);

        // Calculate grid utilization
        const gridUtilization = this.calculateGridUtilization(positionedNodes.length, gridDimensions);

        const layoutTime = performance.now() - startTime;

        return {
            nodes: positionedNodes,
            edges: graphData.edges,
            bounds,
            metadata: {
                layoutTime,
                nodeCount: graphData.nodes.length,
                edgeCount: graphData.edges.length,
                actualColumns: gridDimensions.columns,
                actualRows: gridDimensions.rows,
                cellWidth: gridDimensions.cellWidth,
                cellHeight: gridDimensions.cellHeight,
                gridUtilization
            }
        };
    }

    /**
     * Validate input graph data
     */
    private validateInput(graphData: GraphData): void {
        if (!graphData) {
            throw new Error('GraphData is required');
        }

        if (!graphData.nodes || graphData.nodes.length === 0) {
            throw new Error('Graph must have at least one node');
        }

        if (!graphData.edges) {
            throw new Error('Graph edges array is required');
        }

        if (this.options.cellWidth <= 0 || this.options.cellHeight <= 0) {
            throw new Error('Cell dimensions must be positive');
        }

        if (this.options.aspectRatio <= 0) {
            throw new Error('Aspect ratio must be positive');
        }
    }

    /**
     * Calculate optimal grid dimensions based on content and constraints
     */
    private calculateOptimalGridDimensions(nodes: RoadmapNode[]): {
        columns: number;
        rows: number;
        cellWidth: number;
        cellHeight: number;
    } {
        const nodeCount = nodes.length;

        let columns = this.options.columns;
        let rows = this.options.rows;
        let cellWidth = this.options.cellWidth;
        let cellHeight = this.options.cellHeight;

        if (this.options.autoSize) {
            // Calculate optimal grid dimensions
            if (columns === 0 && rows === 0) {
                // Calculate based on aspect ratio and node count
                const idealArea = nodeCount;
                const idealWidth = Math.sqrt(idealArea * this.options.aspectRatio);
                columns = Math.ceil(idealWidth);
                rows = Math.ceil(nodeCount / columns);
            } else if (columns === 0) {
                // Calculate columns based on rows
                columns = Math.ceil(nodeCount / rows);
            } else if (rows === 0) {
                // Calculate rows based on columns
                rows = Math.ceil(nodeCount / columns);
            }

            // Optimize dimensions based on available space
            const availableWidth = this.options.width - (2 * this.options.marginX);
            const availableHeight = this.options.height - (2 * this.options.marginY);

            const maxCellWidth = (availableWidth - ((columns - 1) * this.options.paddingX)) / columns;
            const maxCellHeight = (availableHeight - ((rows - 1) * this.options.paddingY)) / rows;

            // Adjust cell size to fit available space
            if (maxCellWidth < cellWidth || maxCellHeight < cellHeight) {
                cellWidth = Math.min(cellWidth, maxCellWidth);
                cellHeight = Math.min(cellHeight, maxCellHeight);
            }

            // Ensure minimum cell size
            cellWidth = Math.max(cellWidth, 120);
            cellHeight = Math.max(cellHeight, 80);
        }

        // Ensure we have enough cells for all nodes
        while (columns * rows < nodeCount) {
            if (columns <= rows) {
                columns++;
            } else {
                rows++;
            }
        }

        return { columns, rows, cellWidth, cellHeight };
    }

    /**
     * Organize nodes by sorting and grouping
     */
    private organizeNodes(nodes: RoadmapNode[]): RoadmapNode[] {
        let organizedNodes = [...nodes];

        // Sort nodes
        if (this.options.sortBy !== 'none') {
            organizedNodes = this.sortNodes(organizedNodes);
        }

        // Group nodes if specified
        if (this.options.groupBy !== 'none') {
            organizedNodes = this.groupNodes(organizedNodes);
        }

        return organizedNodes;
    }

    /**
     * Sort nodes based on specified criteria
     */
    private sortNodes(nodes: RoadmapNode[]): RoadmapNode[] {
        return nodes.sort((a, b) => {
            let comparison = 0;

            switch (this.options.sortBy) {
                case 'level':
                    comparison = (a.data.level || 0) - (b.data.level || 0);
                    break;
                case 'section':
                    comparison = (a.data.section || '').localeCompare(b.data.section || '');
                    break;
                case 'label':
                    comparison = (a.data.label || '').localeCompare(b.data.label || '');
                    break;
                case 'difficulty':
                    const difficultyOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
                    const aDiff = difficultyOrder[a.data.difficulty as keyof typeof difficultyOrder] || 0;
                    const bDiff = difficultyOrder[b.data.difficulty as keyof typeof difficultyOrder] || 0;
                    comparison = aDiff - bDiff;
                    break;
                default:
                    comparison = 0;
            }

            return this.options.sortDirection === 'desc' ? -comparison : comparison;
        });
    }

    /**
     * Group nodes based on specified criteria
     */
    private groupNodes(nodes: RoadmapNode[]): RoadmapNode[] {
        if (this.options.groupBy === 'none') {
            return nodes;
        }

        // Group nodes by the specified criteria
        const groups = new Map<string, RoadmapNode[]>();

        nodes.forEach(node => {
            let groupKey = '';

            switch (this.options.groupBy) {
                case 'level':
                    groupKey = String(node.data.level || 0);
                    break;
                case 'section':
                    groupKey = node.data.section || 'default';
                    break;
                case 'difficulty':
                    groupKey = node.data.difficulty || 'unknown';
                    break;
                default:
                    groupKey = 'default';
            }

            if (!groups.has(groupKey)) {
                groups.set(groupKey, []);
            }
            groups.get(groupKey)!.push(node);
        });

        // Flatten groups back to array, maintaining group order
        const sortedGroupKeys = Array.from(groups.keys()).sort();
        const groupedNodes: RoadmapNode[] = [];

        sortedGroupKeys.forEach(key => {
            const groupNodes = groups.get(key)!;
            groupedNodes.push(...groupNodes);
        });

        return groupedNodes;
    }

    /**
     * Create grid structure
     */
    private createGrid(columns: number, rows: number): GridCell[][] {
        const grid: GridCell[][] = [];

        for (let row = 0; row < rows; row++) {
            grid[row] = [];
            for (let col = 0; col < columns; col++) {
                const x = this.options.marginX + (col * (this.options.cellWidth + this.options.paddingX));
                const y = this.options.marginY + (row * (this.options.cellHeight + this.options.paddingY));

                grid[row][col] = {
                    row,
                    column: col,
                    x,
                    y,
                    occupied: false
                };
            }
        }

        return grid;
    }

    /**
     * Position nodes in the grid
     */
    private positionNodesInGrid(
        nodes: RoadmapNode[],
        grid: GridCell[][],
        dimensions: { columns: number; rows: number; cellWidth: number; cellHeight: number }
    ): RoadmapNode[] {
        const positionedNodes: RoadmapNode[] = [];
        let currentRow = 0;
        let currentCol = 0;

        nodes.forEach(node => {
            // Find next available cell
            while (currentRow < dimensions.rows && grid[currentRow][currentCol].occupied) {
                currentCol++;
                if (currentCol >= dimensions.columns) {
                    currentCol = 0;
                    currentRow++;
                }
            }

            if (currentRow >= dimensions.rows) {
                // Grid is full, expand if possible or place at last position
                console.warn('Grid is full, some nodes may overlap');
                currentRow = dimensions.rows - 1;
                currentCol = dimensions.columns - 1;
            }

            const cell = grid[currentRow][currentCol];
            cell.occupied = true;
            cell.nodeId = node.id;

            // Calculate node position within cell (centered)
            const nodeX = cell.x + (dimensions.cellWidth / 2) - (this.getNodeWidth(node) / 2);
            const nodeY = cell.y + (dimensions.cellHeight / 2) - (this.getNodeHeight(node) / 2);

            positionedNodes.push({
                ...node,
                position: { x: nodeX, y: nodeY }
            });

            // Move to next cell
            currentCol++;
            if (currentCol >= dimensions.columns) {
                currentCol = 0;
                currentRow++;
            }
        });

        return positionedNodes;
    }

    /**
     * Get node width for positioning calculations
     */
    private getNodeWidth(node: RoadmapNode): number {
        // Base width calculation - can be enhanced based on node content
        const baseWidth = 160;
        const label = node.data.label || '';

        // Adjust width based on label length
        const charWidth = 8;
        const labelWidth = label.length * charWidth + 40;

        return Math.min(Math.max(baseWidth, labelWidth), this.options.cellWidth - 20);
    }

    /**
     * Get node height for positioning calculations
     */
    private getNodeHeight(node: RoadmapNode): number {
        // Base height calculation
        const baseHeight = 60;

        // Adjust height based on content
        if (node.data.description && node.data.description.length > 100) {
            return Math.min(baseHeight + 20, this.options.cellHeight - 20);
        }

        return Math.min(baseHeight, this.options.cellHeight - 20);
    }

    /**
     * Optimize grid positioning to improve layout
     */
    private optimizeGridPositioning(nodes: RoadmapNode[], grid: GridCell[][]): void {
        if (!this.options.enableOptimization) return;

        // Implement optimization strategies
        this.optimizeGroupCohesion(nodes, grid);
        this.optimizeRelatedNodeProximity(nodes, grid);
    }

    /**
     * Optimize group cohesion by keeping related nodes close
     */
    private optimizeGroupCohesion(nodes: RoadmapNode[], grid: GridCell[][]): void {
        // Group nodes by section or level
        const groups = new Map<string, RoadmapNode[]>();

        nodes.forEach(node => {
            const groupKey = node.data.section || String(node.data.level || 0);
            if (!groups.has(groupKey)) {
                groups.set(groupKey, []);
            }
            groups.get(groupKey)!.push(node);
        });

        // Try to keep group members close together
        groups.forEach(groupNodes => {
            if (groupNodes.length > 1) {
                this.arrangeGroupNodes(groupNodes, grid);
            }
        });
    }

    /**
     * Arrange nodes within a group to be close together
     */
    private arrangeGroupNodes(groupNodes: RoadmapNode[], grid: GridCell[][]): void {
        // Find the centroid of the group
        const centroidX = groupNodes.reduce((sum, node) => sum + node.position.x, 0) / groupNodes.length;
        const centroidY = groupNodes.reduce((sum, node) => sum + node.position.y, 0) / groupNodes.length;

        // Sort nodes by distance from centroid
        groupNodes.sort((a, b) => {
            const distA = Math.sqrt(Math.pow(a.position.x - centroidX, 2) + Math.pow(a.position.y - centroidY, 2));
            const distB = Math.sqrt(Math.pow(b.position.x - centroidX, 2) + Math.pow(b.position.y - centroidY, 2));
            return distA - distB;
        });

        // This is a simplified optimization - in a full implementation,
        // we would rearrange nodes to minimize group spread
    }

    /**
     * Optimize related node proximity based on relationships
     */
    private optimizeRelatedNodeProximity(nodes: RoadmapNode[], grid: GridCell[][]): void {
        // This would analyze edges to determine related nodes
        // and try to position them closer together
        // Implementation would depend on edge data being available
    }

    /**
     * Calculate layout bounds
     */
    private calculateBounds(
        nodes: RoadmapNode[],
        dimensions: { columns: number; rows: number; cellWidth: number; cellHeight: number }
    ): GridLayoutResult['bounds'] {
        if (nodes.length === 0) {
            return { width: 0, height: 0, minX: 0, minY: 0, maxX: 0, maxY: 0 };
        }

        // Calculate bounds based on grid dimensions
        const minX = this.options.marginX;
        const minY = this.options.marginY;
        const maxX = minX + (dimensions.columns * dimensions.cellWidth) + ((dimensions.columns - 1) * this.options.paddingX);
        const maxY = minY + (dimensions.rows * dimensions.cellHeight) + ((dimensions.rows - 1) * this.options.paddingY);

        return {
            width: maxX - minX,
            height: maxY - minY,
            minX,
            minY,
            maxX,
            maxY
        };
    }

    /**
     * Calculate grid utilization percentage
     */
    private calculateGridUtilization(
        nodeCount: number,
        dimensions: { columns: number; rows: number }
    ): number {
        const totalCells = dimensions.columns * dimensions.rows;
        return totalCells > 0 ? (nodeCount / totalCells) * 100 : 0;
    }

    /**
     * Update layout options
     */
    updateOptions(newOptions: Partial<GridLayoutOptions>): void {
        this.options = { ...this.options, ...newOptions };
    }

    /**
     * Get current layout options
     */
    getOptions(): GridLayoutOptions {
        return { ...this.options };
    }

    /**
     * Calculate optimal options for content-based grid layout
     */
    calculateContentOptimizedLayout(graphData: GraphData): Partial<GridLayoutOptions> {
        const nodeCount = graphData.nodes.length;

        // Analyze content characteristics
        const hasLongLabels = graphData.nodes.some(n => (n.data.label || '').length > 20);
        const hasDescriptions = graphData.nodes.some(n => n.data.description && n.data.description.length > 50);
        const sections = new Set(graphData.nodes.map(n => n.data.section)).size;
        const levels = new Set(graphData.nodes.map(n => n.data.level || 0)).size;

        // Calculate optimal cell size
        let cellWidth = this.options.cellWidth;
        let cellHeight = this.options.cellHeight;

        if (hasLongLabels) {
            cellWidth = Math.max(cellWidth, 240);
        }

        if (hasDescriptions) {
            cellHeight = Math.max(cellHeight, 140);
        }

        // Determine optimal grouping strategy
        let groupBy: GridLayoutOptions['groupBy'] = 'none';
        let sortBy: GridLayoutOptions['sortBy'] = 'level';

        if (sections > 1 && sections <= 8) {
            groupBy = 'section';
            sortBy = 'section';
        } else if (levels > 1 && levels <= 6) {
            groupBy = 'level';
            sortBy = 'level';
        }

        // Calculate optimal aspect ratio
        let aspectRatio = this.options.aspectRatio;
        if (nodeCount > 50) {
            aspectRatio = 2.0; // Wider layout for many nodes
        } else if (nodeCount < 20) {
            aspectRatio = 1.2; // More square layout for few nodes
        }

        return {
            cellWidth,
            cellHeight,
            groupBy,
            sortBy,
            aspectRatio,
            autoSize: true,
            enableOptimization: nodeCount <= 100 // Disable optimization for very large graphs
        };
    }

    /**
     * Calculate optimal grid dimensions for specific aspect ratio
     */
    calculateOptimalDimensions(nodeCount: number, targetAspectRatio: number): { columns: number; rows: number } {
        // Find dimensions that best match the target aspect ratio
        let bestColumns = 1;
        let bestRows = nodeCount;
        let bestRatioDiff = Math.abs(targetAspectRatio - (bestColumns / bestRows));

        for (let cols = 1; cols <= nodeCount; cols++) {
            const rows = Math.ceil(nodeCount / cols);
            const currentRatio = cols / rows;
            const ratioDiff = Math.abs(targetAspectRatio - currentRatio);

            if (ratioDiff < bestRatioDiff) {
                bestColumns = cols;
                bestRows = rows;
                bestRatioDiff = ratioDiff;
            }
        }

        return { columns: bestColumns, rows: bestRows };
    }
}

/**
 * Factory function to create GridLayout
 */
export function createGridLayout(options?: Partial<GridLayoutOptions>): GridLayout {
    return new GridLayout(options);
}

/**
 * Utility function to apply grid layout
 */
export function applyGridLayout(
    graphData: GraphData,
    options?: Partial<GridLayoutOptions>
): GridLayoutResult {
    const layout = createGridLayout(options);
    return layout.applyLayout(graphData);
}

/**
 * Utility function to apply grid layout with content optimization
 */
export function applyContentOptimizedGridLayout(
    graphData: GraphData,
    options?: Partial<GridLayoutOptions>
): GridLayoutResult {
    const layout = createGridLayout();

    // Get optimal options for content
    const optimalOptions = layout.calculateContentOptimizedLayout(graphData);

    // Merge with user-provided options (user options take precedence)
    const finalOptions = {
        ...optimalOptions,
        ...options
    };

    layout.updateOptions(finalOptions);
    return layout.applyLayout(graphData);
}

/**
 * Get optimal grid layout options for content organization
 */
export function getOptimalGridOptions(graphData: GraphData): Partial<GridLayoutOptions> {
    const layout = new GridLayout();
    return layout.calculateContentOptimizedLayout(graphData);
}

/**
 * Apply grid layout with automatic sizing
 */
export function applyAutoSizedGridLayout(
    graphData: GraphData,
    targetAspectRatio: number = 1.5,
    options?: Partial<GridLayoutOptions>
): GridLayoutResult {
    const layout = createGridLayout();
    const nodeCount = graphData.nodes.length;

    // Calculate optimal dimensions
    const dimensions = layout.calculateOptimalDimensions(nodeCount, targetAspectRatio);

    const finalOptions: Partial<GridLayoutOptions> = {
        columns: dimensions.columns,
        rows: dimensions.rows,
        autoSize: true,
        aspectRatio: targetAspectRatio,
        ...options
    };

    layout.updateOptions(finalOptions);
    return layout.applyLayout(graphData);
}