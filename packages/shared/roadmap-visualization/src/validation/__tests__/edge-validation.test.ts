/**
 * Unit tests for edge validation and relationship management
 */

import {
    validateEdge,
    validateEdges,
    detectCircularDependencies,
    calculateRelationshipStrength,
    calculateAllRelationshipStrengths,
    validateGraphStructure,
} from '../edge-validation';
import type { RoadmapNode, RoadmapEdge, GraphData } from '../../types';

describe('Edge Validation', () => {
    // Helper function to create test nodes
    const createNode = (id: string, level: number = 0): RoadmapNode => ({
        id,
        type: 'topic',
        position: { x: 0, y: 0 },
        data: {
            label: `Node ${id}`,
            level,
            section: `Section ${id}`,
        },
    });

    // Helper function to create test edges
    const createEdge = (
        id: string,
        source: string,
        target: string,
        strength?: number
    ): RoadmapEdge => ({
        id,
        source,
        target,
        type: 'progression',
        data: {
            relationship: 'leads-to',
            strength,
        },
    });

    describe('validateEdge', () => {
        const nodes = [createNode('node1'), createNode('node2'), createNode('node3')];

        it('should validate a correct edge', () => {
            const edge = createEdge('edge1', 'node1', 'node2');
            const result = validateEdge(edge, nodes);

            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should reject edge with empty ID', () => {
            const edge = { ...createEdge('', 'node1', 'node2'), id: '' };
            const result = validateEdge(edge, nodes);

            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Edge must have a non-empty ID');
        });

        it('should reject edge with empty source', () => {
            const edge = { ...createEdge('edge1', '', 'node2'), source: '' };
            const result = validateEdge(edge, nodes);

            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.includes('non-empty source'))).toBe(true);
        });

        it('should reject edge with empty target', () => {
            const edge = { ...createEdge('edge1', 'node1', ''), target: '' };
            const result = validateEdge(edge, nodes);

            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.includes('non-empty target'))).toBe(true);
        });

        it('should reject self-referencing edge', () => {
            const edge = createEdge('edge1', 'node1', 'node1');
            const result = validateEdge(edge, nodes);

            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.includes('cannot reference itself'))).toBe(true);
        });

        it('should reject edge with non-existent source node', () => {
            const edge = createEdge('edge1', 'nonexistent', 'node2');
            const result = validateEdge(edge, nodes);

            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.includes('does not reference an existing node'))).toBe(true);
        });

        it('should reject edge with non-existent target node', () => {
            const edge = createEdge('edge1', 'node1', 'nonexistent');
            const result = validateEdge(edge, nodes);

            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.includes('does not reference an existing node'))).toBe(true);
        });

        it('should reject edge with strength < 0', () => {
            const edge = createEdge('edge1', 'node1', 'node2', -0.5);
            const result = validateEdge(edge, nodes);

            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.includes('strength must be between 0 and 1'))).toBe(true);
        });

        it('should reject edge with strength > 1', () => {
            const edge = createEdge('edge1', 'node1', 'node2', 1.5);
            const result = validateEdge(edge, nodes);

            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.includes('strength must be between 0 and 1'))).toBe(true);
        });

        it('should reject edge with non-finite strength', () => {
            const edge = createEdge('edge1', 'node1', 'node2', NaN);
            const result = validateEdge(edge, nodes);

            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.includes('must be a finite number'))).toBe(true);
        });

        it('should accept edge with valid strength', () => {
            const edge = createEdge('edge1', 'node1', 'node2', 0.75);
            const result = validateEdge(edge, nodes);

            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });
    });

    describe('validateEdges', () => {
        const nodes = [createNode('node1'), createNode('node2'), createNode('node3')];

        it('should validate empty edge array', () => {
            const result = validateEdges([], nodes);

            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should validate multiple correct edges', () => {
            const edges = [
                createEdge('edge1', 'node1', 'node2'),
                createEdge('edge2', 'node2', 'node3'),
            ];
            const result = validateEdges(edges, nodes);

            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should detect duplicate edge IDs', () => {
            const edges = [
                createEdge('edge1', 'node1', 'node2'),
                createEdge('edge1', 'node2', 'node3'), // Duplicate ID
            ];
            const result = validateEdges(edges, nodes);

            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.includes('Duplicate edge IDs'))).toBe(true);
        });

        it('should collect all validation errors', () => {
            const edges = [
                createEdge('edge1', 'nonexistent', 'node2'), // Invalid source
                createEdge('edge2', 'node1', 'node1'), // Self-reference
                createEdge('edge3', 'node2', 'node3', 2.0), // Invalid strength
            ];
            const result = validateEdges(edges, nodes);

            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(2);
        });
    });

    describe('detectCircularDependencies', () => {
        it('should detect no cycles in acyclic graph', () => {
            const nodes = [createNode('A'), createNode('B'), createNode('C')];
            const edges = [
                createEdge('e1', 'A', 'B'),
                createEdge('e2', 'B', 'C'),
            ];

            const result = detectCircularDependencies(nodes, edges);

            expect(result.hasCircularDependency).toBe(false);
            expect(result.cycles).toHaveLength(0);
        });

        it('should detect simple cycle (A -> B -> A)', () => {
            const nodes = [createNode('A'), createNode('B')];
            const edges = [
                createEdge('e1', 'A', 'B'),
                createEdge('e2', 'B', 'A'),
            ];

            const result = detectCircularDependencies(nodes, edges);

            expect(result.hasCircularDependency).toBe(true);
            expect(result.cycles.length).toBeGreaterThan(0);
        });

        it('should detect self-loop (A -> A)', () => {
            const nodes = [createNode('A')];
            const edges = [createEdge('e1', 'A', 'A')];

            const result = detectCircularDependencies(nodes, edges);

            expect(result.hasCircularDependency).toBe(true);
            expect(result.cycles.length).toBeGreaterThan(0);
        });

        it('should detect cycle in larger graph (A -> B -> C -> A)', () => {
            const nodes = [createNode('A'), createNode('B'), createNode('C')];
            const edges = [
                createEdge('e1', 'A', 'B'),
                createEdge('e2', 'B', 'C'),
                createEdge('e3', 'C', 'A'),
            ];

            const result = detectCircularDependencies(nodes, edges);

            expect(result.hasCircularDependency).toBe(true);
            expect(result.cycles.length).toBeGreaterThan(0);
        });

        it('should detect multiple cycles', () => {
            const nodes = [
                createNode('A'),
                createNode('B'),
                createNode('C'),
                createNode('D'),
            ];
            const edges = [
                createEdge('e1', 'A', 'B'),
                createEdge('e2', 'B', 'A'), // Cycle 1: A -> B -> A
                createEdge('e3', 'C', 'D'),
                createEdge('e4', 'D', 'C'), // Cycle 2: C -> D -> C
            ];

            const result = detectCircularDependencies(nodes, edges);

            expect(result.hasCircularDependency).toBe(true);
            expect(result.cycles.length).toBeGreaterThanOrEqual(2);
        });

        it('should handle graph with no edges', () => {
            const nodes = [createNode('A'), createNode('B')];
            const edges: RoadmapEdge[] = [];

            const result = detectCircularDependencies(nodes, edges);

            expect(result.hasCircularDependency).toBe(false);
            expect(result.cycles).toHaveLength(0);
        });

        it('should handle complex graph with cycle', () => {
            const nodes = [
                createNode('A'),
                createNode('B'),
                createNode('C'),
                createNode('D'),
                createNode('E'),
            ];
            const edges = [
                createEdge('e1', 'A', 'B'),
                createEdge('e2', 'B', 'C'),
                createEdge('e3', 'C', 'D'),
                createEdge('e4', 'D', 'E'),
                createEdge('e5', 'E', 'B'), // Creates cycle: B -> C -> D -> E -> B
            ];

            const result = detectCircularDependencies(nodes, edges);

            expect(result.hasCircularDependency).toBe(true);
            expect(result.cycles.length).toBeGreaterThan(0);
        });
    });

    describe('calculateRelationshipStrength', () => {
        it('should use explicit strength if provided', () => {
            const source = createNode('A', 0);
            const target = createNode('B', 1);
            const edge = createEdge('e1', 'A', 'B', 0.9);

            const strength = calculateRelationshipStrength(source, target, edge);

            expect(strength).toBe(0.9);
        });

        it('should calculate strength based on level difference', () => {
            const source = createNode('A', 0);
            const target = createNode('B', 1);
            const edge = createEdge('e1', 'A', 'B');

            const strength = calculateRelationshipStrength(source, target, edge);

            expect(strength).toBeGreaterThan(0);
            expect(strength).toBeLessThanOrEqual(1);
        });

        it('should give higher strength to closer levels', () => {
            const source = createNode('A', 0);
            const closeTarget = createNode('B', 1);
            const farTarget = createNode('C', 5);

            const edge1 = createEdge('e1', 'A', 'B');
            const edge2 = createEdge('e2', 'A', 'C');

            const closeStrength = calculateRelationshipStrength(source, closeTarget, edge1);
            const farStrength = calculateRelationshipStrength(source, farTarget, edge2);

            expect(closeStrength).toBeGreaterThan(farStrength);
        });

        it('should give higher strength to dependency edges', () => {
            const source = createNode('A', 0);
            const target = createNode('B', 1);

            const dependencyEdge: RoadmapEdge = {
                id: 'e1',
                source: 'A',
                target: 'B',
                type: 'dependency',
                data: { relationship: 'prerequisite' },
            };

            const optionalEdge: RoadmapEdge = {
                id: 'e2',
                source: 'A',
                target: 'B',
                type: 'optional',
                data: { relationship: 'related-to' },
            };

            const depStrength = calculateRelationshipStrength(source, target, dependencyEdge);
            const optStrength = calculateRelationshipStrength(source, target, optionalEdge);

            expect(depStrength).toBeGreaterThan(optStrength);
        });

        it('should add bonus for bidirectional relationships', () => {
            const source = createNode('A', 0);
            const target = createNode('B', 1);

            const unidirectionalEdge = createEdge('e1', 'A', 'B');
            const bidirectionalEdge: RoadmapEdge = {
                ...createEdge('e2', 'A', 'B'),
                data: {
                    relationship: 'leads-to',
                    bidirectional: true,
                },
            };

            const uniStrength = calculateRelationshipStrength(source, target, unidirectionalEdge);
            const biStrength = calculateRelationshipStrength(source, target, bidirectionalEdge);

            expect(biStrength).toBeGreaterThan(uniStrength);
        });

        it('should always return value between 0 and 1', () => {
            const source = createNode('A', 0);
            const target = createNode('B', 100); // Very far level
            const edge = createEdge('e1', 'A', 'B');

            const strength = calculateRelationshipStrength(source, target, edge);

            expect(strength).toBeGreaterThanOrEqual(0);
            expect(strength).toBeLessThanOrEqual(1);
        });

        it('should clamp explicit strength to [0, 1] range', () => {
            const source = createNode('A', 0);
            const target = createNode('B', 1);

            const tooHighEdge = createEdge('e1', 'A', 'B', 5.0);
            const tooLowEdge = createEdge('e2', 'A', 'B', -2.0);

            const highStrength = calculateRelationshipStrength(source, target, tooHighEdge);
            const lowStrength = calculateRelationshipStrength(source, target, tooLowEdge);

            expect(highStrength).toBe(1);
            expect(lowStrength).toBe(0);
        });
    });

    describe('calculateAllRelationshipStrengths', () => {
        it('should calculate strengths for all edges', () => {
            const graphData: GraphData = {
                nodes: [createNode('A', 0), createNode('B', 1), createNode('C', 2)],
                edges: [
                    createEdge('e1', 'A', 'B'),
                    createEdge('e2', 'B', 'C'),
                ],
                metadata: {
                    totalNodes: 3,
                    totalEdges: 2,
                    maxDepth: 2,
                    layoutType: 'hierarchical',
                    generatedAt: new Date(),
                },
            };

            const result = calculateAllRelationshipStrengths(graphData);

            expect(result.edges).toHaveLength(2);
            expect(result.edges[0].data?.strength).toBeDefined();
            expect(result.edges[1].data?.strength).toBeDefined();
            expect(result.edges[0].data!.strength).toBeGreaterThan(0);
            expect(result.edges[0].data!.strength).toBeLessThanOrEqual(1);
        });

        it('should not mutate original graph data', () => {
            const graphData: GraphData = {
                nodes: [createNode('A', 0), createNode('B', 1)],
                edges: [createEdge('e1', 'A', 'B')],
                metadata: {
                    totalNodes: 2,
                    totalEdges: 1,
                    maxDepth: 1,
                    layoutType: 'hierarchical',
                    generatedAt: new Date(),
                },
            };

            const originalEdge = graphData.edges[0];
            const originalStrength = originalEdge.data?.strength;

            calculateAllRelationshipStrengths(graphData);

            expect(graphData.edges[0].data?.strength).toBe(originalStrength);
        });

        it('should handle edges with non-existent nodes gracefully', () => {
            const graphData: GraphData = {
                nodes: [createNode('A', 0)],
                edges: [createEdge('e1', 'A', 'nonexistent')],
                metadata: {
                    totalNodes: 1,
                    totalEdges: 1,
                    maxDepth: 0,
                    layoutType: 'hierarchical',
                    generatedAt: new Date(),
                },
            };

            const result = calculateAllRelationshipStrengths(graphData);

            expect(result.edges).toHaveLength(1);
            // Should keep original edge unchanged
            expect(result.edges[0]).toEqual(graphData.edges[0]);
        });
    });

    describe('validateGraphStructure', () => {
        it('should validate correct graph structure', () => {
            const graphData: GraphData = {
                nodes: [createNode('A', 0), createNode('B', 1)],
                edges: [createEdge('e1', 'A', 'B')],
                metadata: {
                    totalNodes: 2,
                    totalEdges: 1,
                    maxDepth: 1,
                    layoutType: 'hierarchical',
                    generatedAt: new Date(),
                },
            };

            const result = validateGraphStructure(graphData);

            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should reject graph with no nodes', () => {
            const graphData: GraphData = {
                nodes: [],
                edges: [],
                metadata: {
                    totalNodes: 0,
                    totalEdges: 0,
                    maxDepth: 0,
                    layoutType: 'hierarchical',
                    generatedAt: new Date(),
                },
            };

            const result = validateGraphStructure(graphData);

            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.includes('at least one node'))).toBe(true);
        });

        it('should detect duplicate node IDs', () => {
            const graphData: GraphData = {
                nodes: [createNode('A', 0), createNode('A', 1)], // Duplicate ID
                edges: [],
                metadata: {
                    totalNodes: 2,
                    totalEdges: 0,
                    maxDepth: 1,
                    layoutType: 'hierarchical',
                    generatedAt: new Date(),
                },
            };

            const result = validateGraphStructure(graphData);

            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.includes('Duplicate node IDs'))).toBe(true);
        });

        it('should detect circular dependencies in hierarchical layout', () => {
            const graphData: GraphData = {
                nodes: [createNode('A', 0), createNode('B', 1)],
                edges: [
                    createEdge('e1', 'A', 'B'),
                    createEdge('e2', 'B', 'A'), // Creates cycle
                ],
                metadata: {
                    totalNodes: 2,
                    totalEdges: 2,
                    maxDepth: 1,
                    layoutType: 'hierarchical',
                    generatedAt: new Date(),
                },
            };

            const result = validateGraphStructure(graphData, true);

            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.includes('Circular dependencies detected'))).toBe(true);
        });

        it('should skip circular dependency check when disabled', () => {
            const graphData: GraphData = {
                nodes: [createNode('A', 0), createNode('B', 1)],
                edges: [
                    createEdge('e1', 'A', 'B'),
                    createEdge('e2', 'B', 'A'), // Creates cycle
                ],
                metadata: {
                    totalNodes: 2,
                    totalEdges: 2,
                    maxDepth: 1,
                    layoutType: 'hierarchical',
                    generatedAt: new Date(),
                },
            };

            const result = validateGraphStructure(graphData, false);

            // Should still fail due to other validations, but not circular dependency
            expect(result.errors.every(e => !e.includes('Circular dependencies'))).toBe(true);
        });

        it('should skip circular dependency check for non-hierarchical layouts', () => {
            const graphData: GraphData = {
                nodes: [createNode('A', 0), createNode('B', 1)],
                edges: [
                    createEdge('e1', 'A', 'B'),
                    createEdge('e2', 'B', 'A'), // Creates cycle
                ],
                metadata: {
                    totalNodes: 2,
                    totalEdges: 2,
                    maxDepth: 1,
                    layoutType: 'force', // Non-hierarchical
                    generatedAt: new Date(),
                },
            };

            const result = validateGraphStructure(graphData, true);

            // Should pass because circular deps are allowed in force layout
            expect(result.valid).toBe(true);
        });

        it('should collect all validation errors', () => {
            const graphData: GraphData = {
                nodes: [createNode('A', 0), createNode('A', 1)], // Duplicate IDs
                edges: [
                    createEdge('e1', 'A', 'nonexistent'), // Invalid target
                    createEdge('e1', 'A', 'B'), // Duplicate edge ID
                ],
                metadata: {
                    totalNodes: 2,
                    totalEdges: 2,
                    maxDepth: 1,
                    layoutType: 'hierarchical',
                    generatedAt: new Date(),
                },
            };

            const result = validateGraphStructure(graphData);

            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(2);
        });
    });
});
