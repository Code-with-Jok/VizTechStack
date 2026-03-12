/**
 * React Flow Configuration
 * Centralized configuration for React Flow setup with VizTechStack design system
 */

import type {
    ReactFlowInstance,
    FitViewOptions,
    DefaultEdgeOptions,
    NodeTypes,
    EdgeTypes,
    Node,
} from '@xyflow/react';
import type { NodeData } from '@viztechstack/roadmap-visualization';

/**
 * Default fit view options for consistent behavior
 */
export const defaultFitViewOptions: FitViewOptions = {
    padding: 0.15,
    duration: 400,
    minZoom: 0.1,
    maxZoom: 2.5,
};

/**
 * Default edge options following VizTechStack design system
 */
export const defaultEdgeOptions: DefaultEdgeOptions = {
    animated: false,
    style: {
        strokeWidth: 2,
        stroke: 'var(--color-neutral-300)',
    },
};

/**
 * Connection line options for interactive edge creation
 */
export const connectionLineOptions = {
    style: {
        strokeWidth: 2,
        stroke: 'var(--color-primary-400)',
        strokeDasharray: '5,5',
    },
};

/**
 * React Flow viewport configuration
 */
export const viewportConfig = {
    minZoom: 0.1,
    maxZoom: 2.5,
    defaultZoom: 1,
    fitView: true,
    fitViewOptions: defaultFitViewOptions,
};

/**
 * Background configuration following VizTechStack design
 */
export const backgroundConfig = {
    color: 'var(--color-neutral-300)',
    gap: 20,
    size: 1.5,
    className: 'opacity-30',
};

/**
 * Controls configuration
 */
export const controlsConfig = {
    showZoom: false,
    showFitView: false,
    showInteractive: false,
    className: 'hidden',
};

/**
 * MiniMap configuration with difficulty-based node colors
 */
export const miniMapConfig = {
    nodeColor: (node: Node) => {
        const data = node.data as NodeData;
        switch (data.difficulty) {
            case 'beginner':
                return 'var(--color-success-500)';
            case 'intermediate':
                return 'var(--color-warning-500)';
            case 'advanced':
                return 'var(--color-error-500)';
            default:
                return 'var(--color-primary-400)';
        }
    },
    className: '!bg-white/90 !backdrop-blur-sm !border !border-neutral-200 !rounded-lg !shadow-medium',
    maskColor: 'rgba(237, 124, 71, 0.1)',
    position: 'bottom-right' as const,
    pannable: true,
    zoomable: true,
};

/**
 * Edge style configuration based on edge type
 */
export const getEdgeStyle = (edgeType: string) => {
    const baseStyle = {
        strokeWidth: 2,
    };

    switch (edgeType) {
        case 'dependency':
            return {
                ...baseStyle,
                stroke: 'var(--color-error-500)',
                strokeDasharray: '5,5',
            };
        case 'progression':
            return {
                ...baseStyle,
                stroke: 'var(--color-primary-500)',
            };
        case 'related':
            return {
                ...baseStyle,
                stroke: 'var(--color-secondary-400)',
                strokeDasharray: '3,3',
            };
        case 'optional':
            return {
                ...baseStyle,
                stroke: 'var(--color-neutral-400)',
                strokeDasharray: '2,2',
                opacity: 0.7,
            };
        default:
            return {
                ...baseStyle,
                stroke: 'var(--color-neutral-300)',
            };
    }
};

/**
 * Animation configuration for different edge types
 */
export const getEdgeAnimation = (edgeType: string): boolean => {
    return edgeType === 'progression';
};

/**
 * React Flow instance configuration helper
 */
export const configureReactFlowInstance = (instance: ReactFlowInstance) => {
    // Set default viewport
    instance.setViewport({
        x: 0,
        y: 0,
        zoom: viewportConfig.defaultZoom,
    });

    // Apply fit view with default options
    instance.fitView(defaultFitViewOptions);
};

/**
 * Zoom control configuration
 */
export const zoomConfig = {
    zoomInDuration: 400,
    zoomOutDuration: 400,
    zoomStep: 0.25,
    smoothZoom: true,
};

/**
 * Pan control configuration
 */
export const panConfig = {
    panOnDrag: true,
    panOnScroll: false,
    panOnScrollSpeed: 0.5,
};

/**
 * Selection configuration
 */
export const selectionConfig = {
    selectionOnDrag: false,
    multiSelectionKeyCode: 'Meta' as const,
    deleteKeyCode: 'Delete' as const,
    selectNodesOnDrag: false,
};

/**
 * Performance configuration for large graphs
 */
export const performanceConfig = {
    // Enable virtualization for large graphs
    nodesDraggable: true,
    nodesConnectable: false,
    elementsSelectable: true,

    // Optimize rendering
    onlyRenderVisibleElements: true,

    // Smooth interactions
    nodeOrigin: [0.5, 0.5] as [number, number],

    // Connection validation
    isValidConnection: () => false, // Disable manual connections

    // Prevent accidental selections
    selectNodesOnDrag: false,
};

/**
 * Accessibility configuration
 */
export const accessibilityConfig = {
    // Keyboard navigation
    nodesFocusable: true,
    edgesFocusable: true,

    // ARIA labels - use correct attribute name
    'aria-label': 'Roadmap Visualization',

    // Screen reader support
    role: 'application',
};

/**
 * Complete React Flow configuration object
 */
export const reactFlowConfig = {
    // Viewport and zoom settings
    minZoom: viewportConfig.minZoom,
    maxZoom: viewportConfig.maxZoom,
    fitView: viewportConfig.fitView,
    fitViewOptions: viewportConfig.fitViewOptions,

    // Pan settings
    panOnDrag: panConfig.panOnDrag,
    panOnScroll: panConfig.panOnScroll,
    panOnScrollSpeed: panConfig.panOnScrollSpeed,

    // Selection settings
    selectionOnDrag: selectionConfig.selectionOnDrag,
    multiSelectionKeyCode: selectionConfig.multiSelectionKeyCode,
    deleteKeyCode: selectionConfig.deleteKeyCode,
    selectNodesOnDrag: selectionConfig.selectNodesOnDrag,

    // Performance settings
    nodesDraggable: performanceConfig.nodesDraggable,
    nodesConnectable: performanceConfig.nodesConnectable,
    elementsSelectable: performanceConfig.elementsSelectable,
    onlyRenderVisibleElements: performanceConfig.onlyRenderVisibleElements,
    nodeOrigin: performanceConfig.nodeOrigin,
    isValidConnection: performanceConfig.isValidConnection,

    // Accessibility settings
    nodesFocusable: accessibilityConfig.nodesFocusable,
    edgesFocusable: accessibilityConfig.edgesFocusable,
    'aria-label': accessibilityConfig['aria-label'],
    role: accessibilityConfig.role,

    // Edge and connection settings
    defaultEdgeOptions,
    connectionLineStyle: connectionLineOptions.style,

    // Enhanced interaction settings
    snapToGrid: false,
    snapGrid: [15, 15] as [number, number],

    // Enhanced zoom behavior
    zoomOnScroll: true,
    zoomOnPinch: true,
    zoomOnDoubleClick: false,

    // Better UX settings
    preventScrolling: true,
};

/**
 * Type-safe React Flow props interface
 */
export interface ReactFlowProps {
    nodeTypes?: NodeTypes;
    edgeTypes?: EdgeTypes;
    fitView?: boolean;
    fitViewOptions?: FitViewOptions;
    minZoom?: number;
    maxZoom?: number;
    defaultEdgeOptions?: DefaultEdgeOptions;
    className?: string;
}

/**
 * Default React Flow props with VizTechStack configuration
 */
export const defaultReactFlowProps: ReactFlowProps = {
    fitView: true,
    fitViewOptions: defaultFitViewOptions,
    minZoom: viewportConfig.minZoom,
    maxZoom: viewportConfig.maxZoom,
    defaultEdgeOptions,
    className: 'w-full h-full bg-background-secondary',
};