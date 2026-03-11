/**
 * Force-directed layout algorithm
 * Uses a simple physics simulation to position nodes
 */

import type { RoadmapNode, RoadmapEdge } from '../types';
import type { LayoutOptions } from './types';

interface ForceNode extends RoadmapNode {
    vx: number;
    vy: number;
    fx?: number;
    fy?: number;
}

/**
 * Apply force-directed layout to nodes
 * 
 * @param nodes - Array of roadmap nodes
 * @param edges - Array of roadmap edges
 * @param options - Layout configuration options
 * @returns Array of nodes with calculated positions
 */
export function applyForceDirectedLayout(
    nodes: RoadmapNode[],
    edges: RoadmapEdge[],
    options: LayoutOptions = {}
): RoadmapNode[] {
    const {
        nodeWidth = 200,
        nodeHeight = 80,
    } = options;

    // Configuration
    const iterations = 300;
    const repulsionStrength = 5000;
    const attractionStrength = 0.01;
    const damping = 0.9;
    const centeringForce = 0.01;

    // Initialize nodes with velocities
    const forceNodes: ForceNode[] = nodes.map((node, index) => ({
        ...node,
        position: {
            // Start with circular initial positions
            x: Math.cos((index / nodes.length) * 2 * Math.PI) * 300,
            y: Math.sin((index / nodes.length) * 2 * Math.PI) * 300,
        },
        vx: 0,
        vy: 0,
    }));

    // Build adjacency map for faster edge lookups
    const adjacencyMap = new Map<string, Set<string>>();
    edges.forEach((edge) => {
        if (!adjacencyMap.has(edge.source)) {
            adjacencyMap.set(edge.source, new Set());
        }
        adjacencyMap.get(edge.source)!.add(edge.target);
    });

    // Run simulation
    for (let iteration = 0; iteration < iterations; iteration++) {
        // Apply repulsion force between all nodes
        for (let i = 0; i < forceNodes.length; i++) {
            for (let j = i + 1; j < forceNodes.length; j++) {
                const nodeA = forceNodes[i];
                const nodeB = forceNodes[j];

                const dx = nodeB.position.x - nodeA.position.x;
                const dy = nodeB.position.y - nodeA.position.y;
                const distance = Math.sqrt(dx * dx + dy * dy) || 1;

                // Repulsion force (inverse square law)
                const force = repulsionStrength / (distance * distance);
                const fx = (dx / distance) * force;
                const fy = (dy / distance) * force;

                nodeA.vx -= fx;
                nodeA.vy -= fy;
                nodeB.vx += fx;
                nodeB.vy += fy;
            }
        }

        // Apply attraction force for connected nodes
        edges.forEach((edge) => {
            const sourceNode = forceNodes.find((n) => n.id === edge.source);
            const targetNode = forceNodes.find((n) => n.id === edge.target);

            if (!sourceNode || !targetNode) return;

            const dx = targetNode.position.x - sourceNode.position.x;
            const dy = targetNode.position.y - sourceNode.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy) || 1;

            // Spring force (Hooke's law)
            const force = distance * attractionStrength;
            const fx = (dx / distance) * force;
            const fy = (dy / distance) * force;

            sourceNode.vx += fx;
            sourceNode.vy += fy;
            targetNode.vx -= fx;
            targetNode.vy -= fy;
        });

        // Apply centering force
        const centerX = forceNodes.reduce((sum, n) => sum + n.position.x, 0) / forceNodes.length;
        const centerY = forceNodes.reduce((sum, n) => sum + n.position.y, 0) / forceNodes.length;

        forceNodes.forEach((node) => {
            node.vx -= (node.position.x - centerX) * centeringForce;
            node.vy -= (node.position.y - centerY) * centeringForce;
        });

        // Update positions and apply damping
        forceNodes.forEach((node) => {
            if (!node.fx && !node.fy) {
                node.position.x += node.vx;
                node.position.y += node.vy;
                node.vx *= damping;
                node.vy *= damping;
            }
        });
    }

    // Return nodes with updated positions (remove velocity properties)
    return forceNodes.map(({ vx, vy, fx, fy, ...node }) => node);
}
