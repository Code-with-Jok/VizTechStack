'use client';

/**
 * Selection indicator component cho roadmap visualization
 * Hiển thị visual feedback cho selected và highlighted elements
 * Tích hợp với VizTechStack design system
 */

import React from 'react';
import type { RoadmapNode, RoadmapEdge } from '@viztechstack/roadmap-visualization';

/**
 * Selection indicator props
 */
export interface SelectionIndicatorProps {
    // Selection state
    selectedNodes: Set<string>;
    selectedEdges: Set<string>;
    highlightedNodes: Set<string>;
    highlightedEdges: Set<string>;

    // Primary selection (for keyboard navigation)
    primarySelectedNode: string | null;
    primarySelectedEdge: string | null;

    // Data
    nodes: RoadmapNode[];
    edges: RoadmapEdge[];

    // Configuration
    showConnections?: boolean;
    showLabels?: boolean;
    animateSelection?: boolean;

    // Styling
    className?: string;
}

/**
 * Node selection indicator
 */
interface NodeIndicatorProps {
    node: RoadmapNode;
    isSelected: boolean;
    isHighlighted: boolean;
    isPrimary: boolean;
    showLabel?: boolean;
    animate?: boolean;
}

function NodeIndicator({
    node,
    isSelected,
    isHighlighted,
    isPrimary,
    showLabel = false,
    animate = true
}: NodeIndicatorProps) {
    if (!isSelected && !isHighlighted) return null;

    const getIndicatorStyle = () => {
        if (isSelected) {
            return isPrimary
                ? 'ring-4 ring-primary-500 ring-opacity-75 bg-primary-100'
                : 'ring-2 ring-primary-400 ring-opacity-50 bg-primary-50';
        }

        if (isHighlighted) {
            return 'ring-2 ring-secondary-300 ring-opacity-40 bg-secondary-50';
        }

        return '';
    };

    const getAnimationClass = () => {
        if (!animate) return '';

        if (isSelected) {
            return isPrimary ? 'animate-pulse' : 'animate-bounce-gentle';
        }

        return 'animate-fade-in';
    };

    return (
        <div
            className={`
                absolute pointer-events-none rounded-xl transition-all duration-300
                ${getIndicatorStyle()}
                ${getAnimationClass()}
            `}
            style={{
                left: node.position.x - 10,
                top: node.position.y - 10,
                width: 220, // Node width + padding
                height: 80, // Node height + padding
                zIndex: isSelected ? 10 : 5,
            }}
        >
            {/* Selection glow effect */}
            {isSelected && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-400/20 to-primary-600/20 blur-sm" />
            )}

            {/* Primary selection indicator */}
            {isPrimary && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center shadow-medium">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                </div>
            )}

            {/* Node label */}
            {showLabel && (
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-neutral-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap shadow-large">
                    {node.data.label}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 w-0 h-0 border-l-2 border-r-2 border-b-2 border-transparent border-b-neutral-900" />
                </div>
            )}
        </div>
    );
}

/**
 * Edge selection indicator
 */
interface EdgeIndicatorProps {
    edge: RoadmapEdge;
    sourceNode: RoadmapNode;
    targetNode: RoadmapNode;
    isSelected: boolean;
    isHighlighted: boolean;
    isPrimary: boolean;
    showLabel?: boolean;
    animate?: boolean;
}

function EdgeIndicator({
    edge,
    sourceNode,
    targetNode,
    isSelected,
    isHighlighted,
    isPrimary,
    showLabel = false,
    animate = true
}: EdgeIndicatorProps) {
    if (!isSelected && !isHighlighted) return null;

    // Calculate edge path
    const startX = sourceNode.position.x + 100; // Node center
    const startY = sourceNode.position.y + 30;
    const endX = targetNode.position.x + 100;
    const endY = targetNode.position.y + 30;

    // Calculate midpoint for label
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;

    const getStrokeStyle = () => {
        if (isSelected) {
            return isPrimary
                ? { stroke: 'var(--color-primary-500)', strokeWidth: 4, opacity: 0.9 }
                : { stroke: 'var(--color-primary-400)', strokeWidth: 3, opacity: 0.7 };
        }

        if (isHighlighted) {
            return { stroke: 'var(--color-secondary-400)', strokeWidth: 2, opacity: 0.6 };
        }

        return {};
    };

    const getAnimationClass = () => {
        if (!animate) return '';

        if (isSelected) {
            return 'animate-pulse';
        }

        return 'animate-fade-in';
    };

    return (
        <svg
            className={`absolute pointer-events-none transition-all duration-300 ${getAnimationClass()}`}
            style={{
                left: Math.min(startX, endX) - 50,
                top: Math.min(startY, endY) - 50,
                width: Math.abs(endX - startX) + 100,
                height: Math.abs(endY - startY) + 100,
                zIndex: isSelected ? 8 : 3,
            }}
        >
            {/* Selection glow */}
            {isSelected && (
                <line
                    x1={startX - Math.min(startX, endX) + 50}
                    y1={startY - Math.min(startY, endY) + 50}
                    x2={endX - Math.min(startX, endX) + 50}
                    y2={endY - Math.min(startY, endY) + 50}
                    stroke="var(--color-primary-300)"
                    strokeWidth="8"
                    opacity="0.3"
                    className="blur-sm"
                />
            )}

            {/* Main selection line */}
            <line
                x1={startX - Math.min(startX, endX) + 50}
                y1={startY - Math.min(startY, endY) + 50}
                x2={endX - Math.min(startX, endX) + 50}
                y2={endY - Math.min(startY, endY) + 50}
                {...getStrokeStyle()}
                strokeDasharray={isSelected ? "5,5" : "none"}
            />

            {/* Primary selection indicator */}
            {isPrimary && (
                <circle
                    cx={midX - Math.min(startX, endX) + 50}
                    cy={midY - Math.min(startY, endY) + 50}
                    r="8"
                    fill="var(--color-primary-500)"
                    className="drop-shadow-md"
                />
            )}

            {/* Edge label */}
            {showLabel && edge.data?.label && (
                <g>
                    <rect
                        x={midX - Math.min(startX, endX) + 50 - 30}
                        y={midY - Math.min(startY, endY) + 50 - 10}
                        width="60"
                        height="20"
                        fill="var(--color-neutral-900)"
                        rx="4"
                        opacity="0.9"
                    />
                    <text
                        x={midX - Math.min(startX, endX) + 50}
                        y={midY - Math.min(startY, endY) + 50 + 4}
                        textAnchor="middle"
                        fill="white"
                        fontSize="10"
                        fontWeight="500"
                    >
                        {edge.data.label}
                    </text>
                </g>
            )}
        </svg>
    );
}

/**
 * Connection path indicator
 */
interface ConnectionPathProps {
    nodes: RoadmapNode[];
    edges: RoadmapEdge[];
    selectedNodes: Set<string>;
    selectedEdges: Set<string>;
    animate?: boolean;
}

function ConnectionPath({ nodes, edges, selectedNodes, selectedEdges, animate = true }: ConnectionPathProps) {
    if (selectedNodes.size === 0 && selectedEdges.size === 0) return null;

    // Find all connections between selected elements
    const connections: Array<{ source: RoadmapNode; target: RoadmapNode; edge: RoadmapEdge }> = [];

    edges.forEach(edge => {
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);

        if (sourceNode && targetNode) {
            const isSourceSelected = selectedNodes.has(edge.source);
            const isTargetSelected = selectedNodes.has(edge.target);
            const isEdgeSelected = selectedEdges.has(edge.id);

            if ((isSourceSelected && isTargetSelected) || isEdgeSelected) {
                connections.push({ source: sourceNode, target: targetNode, edge });
            }
        }
    });

    if (connections.length === 0) return null;

    // Calculate bounding box
    const allNodes = [...selectedNodes].map(id => nodes.find(n => n.id === id)).filter(Boolean) as RoadmapNode[];
    const minX = Math.min(...allNodes.map(n => n.position.x)) - 100;
    const minY = Math.min(...allNodes.map(n => n.position.y)) - 100;
    const maxX = Math.max(...allNodes.map(n => n.position.x)) + 300;
    const maxY = Math.max(...allNodes.map(n => n.position.y)) + 200;

    return (
        <svg
            className={`absolute pointer-events-none transition-all duration-500 ${animate ? 'animate-fade-in' : ''}`}
            style={{
                left: minX,
                top: minY,
                width: maxX - minX,
                height: maxY - minY,
                zIndex: 1,
            }}
        >
            {/* Connection paths */}
            {connections.map(({ source, target, edge }, index) => {
                const startX = source.position.x - minX + 100;
                const startY = source.position.y - minY + 30;
                const endX = target.position.x - minX + 100;
                const endY = target.position.y - minY + 30;

                return (
                    <g key={edge.id}>
                        {/* Glow effect */}
                        <line
                            x1={startX}
                            y1={startY}
                            x2={endX}
                            y2={endY}
                            stroke="var(--color-primary-300)"
                            strokeWidth="6"
                            opacity="0.2"
                            className="blur-sm"
                        />

                        {/* Main path */}
                        <line
                            x1={startX}
                            y1={startY}
                            x2={endX}
                            y2={endY}
                            stroke="var(--color-primary-400)"
                            strokeWidth="2"
                            opacity="0.6"
                            strokeDasharray="3,3"
                            className={animate ? 'animate-pulse' : ''}
                            style={{
                                animationDelay: `${index * 0.1}s`,
                            }}
                        />
                    </g>
                );
            })}
        </svg>
    );
}

/**
 * Main selection indicator component
 */
export function SelectionIndicator({
    selectedNodes,
    selectedEdges,
    highlightedNodes,
    highlightedEdges,
    primarySelectedNode,
    primarySelectedEdge,
    nodes,
    edges,
    showConnections = true,
    showLabels = false,
    animateSelection = true,
    className = '',
}: SelectionIndicatorProps) {

    return (
        <div className={`absolute inset-0 pointer-events-none ${className}`}>
            {/* Connection paths */}
            {showConnections && (
                <ConnectionPath
                    nodes={nodes}
                    edges={edges}
                    selectedNodes={selectedNodes}
                    selectedEdges={selectedEdges}
                    animate={animateSelection}
                />
            )}

            {/* Node indicators */}
            {nodes.map(node => {
                const isSelected = selectedNodes.has(node.id);
                const isHighlighted = highlightedNodes.has(node.id);
                const isPrimary = primarySelectedNode === node.id;

                return (
                    <NodeIndicator
                        key={node.id}
                        node={node}
                        isSelected={isSelected}
                        isHighlighted={isHighlighted}
                        isPrimary={isPrimary}
                        showLabel={showLabels && (isSelected || isPrimary)}
                        animate={animateSelection}
                    />
                );
            })}

            {/* Edge indicators */}
            {edges.map(edge => {
                const sourceNode = nodes.find(n => n.id === edge.source);
                const targetNode = nodes.find(n => n.id === edge.target);

                if (!sourceNode || !targetNode) return null;

                const isSelected = selectedEdges.has(edge.id);
                const isHighlighted = highlightedEdges.has(edge.id);
                const isPrimary = primarySelectedEdge === edge.id;

                return (
                    <EdgeIndicator
                        key={edge.id}
                        edge={edge}
                        sourceNode={sourceNode}
                        targetNode={targetNode}
                        isSelected={isSelected}
                        isHighlighted={isHighlighted}
                        isPrimary={isPrimary}
                        showLabel={showLabels && (isSelected || isPrimary)}
                        animate={animateSelection}
                    />
                );
            })}

            {/* Selection summary overlay */}
            {(selectedNodes.size > 0 || selectedEdges.size > 0) && (
                <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-medium border border-neutral-200">
                    <div className="text-sm font-medium text-neutral-800 mb-2">
                        Đã chọn
                    </div>

                    <div className="space-y-1 text-xs text-neutral-600">
                        {selectedNodes.size > 0 && (
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                                <span>{selectedNodes.size} nodes</span>
                            </div>
                        )}

                        {selectedEdges.size > 0 && (
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-secondary-500 rounded-full"></div>
                                <span>{selectedEdges.size} kết nối</span>
                            </div>
                        )}
                    </div>

                    {/* Primary selection info */}
                    {primarySelectedNode && (
                        <div className="mt-2 pt-2 border-t border-neutral-200">
                            <div className="text-xs text-neutral-500">
                                Chính: {nodes.find(n => n.id === primarySelectedNode)?.data.label}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}