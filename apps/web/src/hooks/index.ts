/**
 * Custom hooks for the web application
 */

export { useNodeTooltip } from './useNodeTooltip';
export { useGridLayout } from './useGridLayout';
export { useCircularLayout } from './useCircularLayout';
export { useEdgeInteraction } from './useEdgeInteraction';
export { useSelectionState } from './useSelectionState';
export { useSelectionManager } from './useSelectionManager';

// Export types
export type { UseEdgeInteractionOptions, UseEdgeInteractionReturn, EdgeSelectionState, EdgeRelationshipDetails } from './useEdgeInteraction';
export type { SelectionState, SelectionMode, UseSelectionStateOptions, UseSelectionStateReturn } from './useSelectionState';
export type { SelectionManagerConfig, UseSelectionManagerOptions, UseSelectionManagerReturn } from './useSelectionManager';