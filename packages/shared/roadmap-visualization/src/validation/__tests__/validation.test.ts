/**
 * Tests for validation functions
 */

import {
    validateGraphData,
    validateNode,
    validateEdge,
    validateGraphStructure,
    validateNodeCategory,
    validateNodePrerequisites,
    validateNodeComplete,
    validateMinimumNodes,
    validateAllNodes,
} from '../index';
import type { GraphData, RoadmapNode, RoadmapEdge, NodeData } from '../../types';

describe('Validation', () => {
    describe('validateNode', () => {
        it('should validate a valid node', () => {
            const node: RoadmapNode = {
                id: 'node-1',
                type: 'topic',
                position: { x: 0, y: 0 },
                data: {
                    label: 'Test Node',
                    level: 0,
                    section: 'Test Section',
                },
            };

            expect(() => validateNode(node)).not.toThrow();
        });

        it('should reject node with empty id', () => {
            const node = {
                id: '',
                type: 'topic',
                position: { x: 0, y: 0 },
                data: {
                    label: 'Test',
                    level: 0,
                    section: 'Test',
                },
            };

            expect(() => validateNode(node)).toThrow();
        });

        it('should reject node with invalid position', () => {
            const node = {
                id: 'node-1',
                type: 'topic',
                position: { x: NaN, y: 0 },
                data: {
                    label: 'Test',
                    level: 0,
                    section: 'Test',
                },
            };

            expect(() => validateNode(node)).toThrow();
        });

        it('should reject node with negative level', () => {
            const node = {
                id: 'node-1',
                type: 'topic',
                position: { x: 0, y: 0 },
                data: {
                    label: 'Test',
                    level: -1,
                    section: 'Test',
                },
            };

            expect(() => validateNode(node)).toThrow();
        });
    });

    describe('validateEdge', () => {
        it('should validate a valid edge', () => {
            const edge: RoadmapEdge = {
                id: 'edge-1',
                source: 'node-1',
                target: 'node-2',
                type: 'progression',
            };

            expect(() => validateEdge(edge)).not.toThrow();
        });

        it('should reject self-referencing edge', () => {
            const edge = {
                id: 'edge-1',
                source: 'node-1',
                target: 'node-1',
                type: 'progression',
            };

            expect(() => validateEdge(edge)).toThrow();
        });

        it('should reject edge with empty source', () => {
            const edge = {
                id: 'edge-1',
                source: '',
                target: 'node-2',
                type: 'progression',
            };

            expect(() => validateEdge(edge)).toThrow();
        });

        it('should validate edge with data', () => {
            const edge: RoadmapEdge = {
                id: 'edge-1',
                source: 'node-1',
                target: 'node-2',
                type: 'dependency',
                data: {
                    relationship: 'prerequisite',
                    strength: 0.8,
                },
            };

            expect(() => validateEdge(edge)).not.toThrow();
        });
    });

    describe('validateGraphData', () => {
        it('should validate valid graph data', () => {
            const graphData: GraphData = {
                nodes: [
                    {
                        id: 'node-1',
                        type: 'topic',
                        position: { x: 0, y: 0 },
                        data: {
                            label: 'Node 1',
                            level: 0,
                            section: 'Section 1',
                        },
                    },
                    {
                        id: 'node-2',
                        type: 'skill',
                        position: { x: 100, y: 100 },
                        data: {
                            label: 'Node 2',
                            level: 1,
                            section: 'Section 2',
                        },
                    },
                ],
                edges: [
                    {
                        id: 'edge-1',
                        source: 'node-1',
                        target: 'node-2',
                        type: 'progression',
                    },
                ],
                metadata: {
                    totalNodes: 2,
                    totalEdges: 1,
                    maxDepth: 1,
                    layoutType: 'hierarchical',
                    generatedAt: new Date(),
                },
            };

            expect(() => validateGraphData(graphData)).not.toThrow();
        });

        it('should reject graph with no nodes', () => {
            const graphData = {
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

            expect(() => validateGraphData(graphData)).toThrow();
        });

        it('should reject graph with invalid edge references', () => {
            const graphData = {
                nodes: [
                    {
                        id: 'node-1',
                        type: 'topic',
                        position: { x: 0, y: 0 },
                        data: {
                            label: 'Node 1',
                            level: 0,
                            section: 'Section 1',
                        },
                    },
                ],
                edges: [
                    {
                        id: 'edge-1',
                        source: 'node-1',
                        target: 'non-existent',
                        type: 'progression',
                    },
                ],
                metadata: {
                    totalNodes: 1,
                    totalEdges: 1,
                    maxDepth: 0,
                    layoutType: 'hierarchical',
                    generatedAt: new Date(),
                },
            };

            expect(() => validateGraphData(graphData)).toThrow();
        });

        it('should reject graph with duplicate node IDs', () => {
            const graphData = {
                nodes: [
                    {
                        id: 'node-1',
                        type: 'topic',
                        position: { x: 0, y: 0 },
                        data: {
                            label: 'Node 1',
                            level: 0,
                            section: 'Section 1',
                        },
                    },
                    {
                        id: 'node-1', // Duplicate ID
                        type: 'skill',
                        position: { x: 100, y: 100 },
                        data: {
                            label: 'Node 2',
                            level: 1,
                            section: 'Section 2',
                        },
                    },
                ],
                edges: [],
                metadata: {
                    totalNodes: 2,
                    totalEdges: 0,
                    maxDepth: 1,
                    layoutType: 'hierarchical',
                    generatedAt: new Date(),
                },
            };

            expect(() => validateGraphData(graphData)).toThrow();
        });
    });

    describe('validateGraphStructure', () => {
        it('should return true for valid graph structure', () => {
            const graphData: GraphData = {
                nodes: [
                    {
                        id: 'node-1',
                        type: 'topic',
                        position: { x: 0, y: 0 },
                        data: {
                            label: 'Node 1',
                            level: 0,
                            section: 'Section 1',
                        },
                    },
                    {
                        id: 'node-2',
                        type: 'skill',
                        position: { x: 100, y: 100 },
                        data: {
                            label: 'Node 2',
                            level: 1,
                            section: 'Section 2',
                        },
                    },
                ],
                edges: [
                    {
                        id: 'edge-1',
                        source: 'node-1',
                        target: 'node-2',
                        type: 'progression',
                    },
                ],
                metadata: {
                    totalNodes: 2,
                    totalEdges: 1,
                    maxDepth: 1,
                    layoutType: 'hierarchical',
                    generatedAt: new Date(),
                },
            };

            expect(validateGraphStructure(graphData)).toBe(true);
        });

        it('should return false for empty graph', () => {
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

            expect(validateGraphStructure(graphData)).toBe(false);
        });

        it('should return false for graph with circular dependencies', () => {
            const graphData: GraphData = {
                nodes: [
                    {
                        id: 'node-1',
                        type: 'topic',
                        position: { x: 0, y: 0 },
                        data: { label: 'Node 1', level: 0, section: 'Section 1' },
                    },
                    {
                        id: 'node-2',
                        type: 'skill',
                        position: { x: 100, y: 100 },
                        data: { label: 'Node 2', level: 1, section: 'Section 2' },
                    },
                    {
                        id: 'node-3',
                        type: 'skill',
                        position: { x: 200, y: 200 },
                        data: { label: 'Node 3', level: 2, section: 'Section 3' },
                    },
                ],
                edges: [
                    {
                        id: 'edge-1',
                        source: 'node-1',
                        target: 'node-2',
                        type: 'progression',
                    },
                    {
                        id: 'edge-2',
                        source: 'node-2',
                        target: 'node-3',
                        type: 'progression',
                    },
                    {
                        id: 'edge-3',
                        source: 'node-3',
                        target: 'node-1', // Creates cycle
                        type: 'progression',
                    },
                ],
                metadata: {
                    totalNodes: 3,
                    totalEdges: 3,
                    maxDepth: 2,
                    layoutType: 'hierarchical',
                    generatedAt: new Date(),
                },
            };

            expect(validateGraphStructure(graphData)).toBe(false);
        });

        it('should return false for duplicate node IDs', () => {
            const graphData: GraphData = {
                nodes: [
                    {
                        id: 'node-1',
                        type: 'topic',
                        position: { x: 0, y: 0 },
                        data: { label: 'Node 1', level: 0, section: 'Section 1' },
                    },
                    {
                        id: 'node-1', // Duplicate
                        type: 'skill',
                        position: { x: 100, y: 100 },
                        data: { label: 'Node 2', level: 1, section: 'Section 2' },
                    },
                ],
                edges: [],
                metadata: {
                    totalNodes: 2,
                    totalEdges: 0,
                    maxDepth: 1,
                    layoutType: 'hierarchical',
                    generatedAt: new Date(),
                },
            };

            expect(validateGraphStructure(graphData)).toBe(false);
        });
    });
});

describe('validateNodeCategory', () => {
    it('should validate role node with targetRoadmapId', () => {
        const nodeData: NodeData = {
            label: 'Frontend Developer',
            category: 'role',
            targetRoadmapId: 'frontend-dev',
            level: 0,
            section: 'Roles',
        };

        const result = validateNodeCategory(nodeData);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('should fail role node without targetRoadmapId', () => {
        const nodeData: NodeData = {
            label: 'Frontend Developer',
            category: 'role',
            level: 0,
            section: 'Roles',
        };

        const result = validateNodeCategory(nodeData);
        expect(result.valid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].code).toBe('MISSING_TARGET_ROADMAP');
    });

    it('should fail role node with empty targetRoadmapId', () => {
        const nodeData: NodeData = {
            label: 'Frontend Developer',
            category: 'role',
            targetRoadmapId: '',
            level: 0,
            section: 'Roles',
        };

        const result = validateNodeCategory(nodeData);
        expect(result.valid).toBe(false);
        // Empty string is falsy, so it will be treated as missing
        expect(result.errors[0].code).toBe('MISSING_TARGET_ROADMAP');
    });

    it('should fail role node with whitespace-only targetRoadmapId', () => {
        const nodeData: NodeData = {
            label: 'Frontend Developer',
            category: 'role',
            targetRoadmapId: '   ',
            level: 0,
            section: 'Roles',
        };

        const result = validateNodeCategory(nodeData);
        expect(result.valid).toBe(false);
        // Whitespace-only string is truthy but invalid
        expect(result.errors[0].code).toBe('INVALID_TARGET_ROADMAP');
    });

    it('should validate skill node with targetArticleId', () => {
        const nodeData: NodeData = {
            label: 'React Hooks',
            category: 'skill',
            targetArticleId: 'react-hooks-guide',
            level: 0,
            section: 'Skills',
        };

        const result = validateNodeCategory(nodeData);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('should fail skill node without targetArticleId', () => {
        const nodeData: NodeData = {
            label: 'React Hooks',
            category: 'skill',
            level: 0,
            section: 'Skills',
        };

        const result = validateNodeCategory(nodeData);
        expect(result.valid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].code).toBe('MISSING_TARGET_ARTICLE');
    });

    it('should fail with invalid category', () => {
        const nodeData: NodeData = {
            label: 'Test',
            category: 'invalid' as any,
            level: 0,
            section: 'Test',
        };

        const result = validateNodeCategory(nodeData);
        expect(result.valid).toBe(false);
        expect(result.errors[0].code).toBe('INVALID_CATEGORY');
    });

    it('should pass node without category', () => {
        const nodeData: NodeData = {
            label: 'Test',
            level: 0,
            section: 'Test',
        };

        const result = validateNodeCategory(nodeData);
        expect(result.valid).toBe(true);
    });
});

describe('validateNodePrerequisites', () => {
    it('should validate node with valid prerequisites', () => {
        const nodeData: NodeData = {
            label: 'Advanced React',
            prerequisites: ['node-1', 'node-2'],
            level: 0,
            section: 'Test',
        };

        const allNodeIds = new Set(['node-1', 'node-2', 'node-3']);
        const result = validateNodePrerequisites(nodeData, allNodeIds);

        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('should fail with non-existent prerequisite', () => {
        const nodeData: NodeData = {
            label: 'Advanced React',
            prerequisites: ['node-1', 'non-existent'],
            level: 0,
            section: 'Test',
        };

        const allNodeIds = new Set(['node-1', 'node-2']);
        const result = validateNodePrerequisites(nodeData, allNodeIds);

        expect(result.valid).toBe(false);
        expect(result.errors[0].code).toBe('INVALID_PREREQUISITE');
    });

    it('should fail with duplicate prerequisites', () => {
        const nodeData: NodeData = {
            label: 'Advanced React',
            prerequisites: ['node-1', 'node-1'],
            level: 0,
            section: 'Test',
        };

        const allNodeIds = new Set(['node-1', 'node-2']);
        const result = validateNodePrerequisites(nodeData, allNodeIds);

        expect(result.valid).toBe(false);
        expect(result.errors[0].code).toBe('DUPLICATE_PREREQUISITES');
    });

    it('should pass node without prerequisites', () => {
        const nodeData: NodeData = {
            label: 'React Basics',
            level: 0,
            section: 'Test',
        };

        const allNodeIds = new Set(['node-1']);
        const result = validateNodePrerequisites(nodeData, allNodeIds);

        expect(result.valid).toBe(true);
    });
});

describe('validateNodeComplete', () => {
    it('should validate complete valid node', () => {
        const node: RoadmapNode = {
            id: 'node-1',
            type: 'skill',
            position: { x: 0, y: 0 },
            data: {
                label: 'React Hooks',
                category: 'skill',
                targetArticleId: 'react-hooks',
                estimatedTime: '2-4 weeks',
                level: 0,
                section: 'Skills',
            },
        };

        const result = validateNodeComplete(node);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('should fail node with empty label', () => {
        const node: RoadmapNode = {
            id: 'node-1',
            type: 'skill',
            position: { x: 0, y: 0 },
            data: {
                label: '',
                level: 0,
                section: 'Test',
            },
        };

        const result = validateNodeComplete(node);
        expect(result.valid).toBe(false);
        // Schema validation will catch this first
        expect(result.errors.some(e => e.code === 'INVALID_SCHEMA')).toBe(true);
    });

    it('should fail node with invalid time format', () => {
        const node: RoadmapNode = {
            id: 'node-1',
            type: 'skill',
            position: { x: 0, y: 0 },
            data: {
                label: 'Test',
                estimatedTime: 'invalid format',
                level: 0,
                section: 'Test',
            },
        };

        const result = validateNodeComplete(node);
        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.code === 'INVALID_TIME_FORMAT')).toBe(true);
    });

    it('should validate various time formats', () => {
        const validFormats = ['2 weeks', '2-4 weeks', '3 months', '1-2 months', '5 days', '8 hours'];

        validFormats.forEach(format => {
            const node: RoadmapNode = {
                id: 'node-1',
                type: 'skill',
                position: { x: 0, y: 0 },
                data: {
                    label: 'Test',
                    estimatedTime: format,
                    level: 0,
                    section: 'Test',
                },
            };

            const result = validateNodeComplete(node);
            expect(result.valid).toBe(true);
        });
    });

    it('should validate prerequisites when node IDs provided', () => {
        const node: RoadmapNode = {
            id: 'node-3',
            type: 'skill',
            position: { x: 0, y: 0 },
            data: {
                label: 'Advanced React',
                prerequisites: ['node-1', 'node-2'],
                level: 0,
                section: 'Test',
            },
        };

        const allNodeIds = new Set(['node-1', 'node-2', 'node-3']);
        const result = validateNodeComplete(node, allNodeIds);

        expect(result.valid).toBe(true);
    });

    it('should fail with invalid prerequisites', () => {
        const node: RoadmapNode = {
            id: 'node-3',
            type: 'skill',
            position: { x: 0, y: 0 },
            data: {
                label: 'Advanced React',
                prerequisites: ['non-existent'],
                level: 0,
                section: 'Test',
            },
        };

        const allNodeIds = new Set(['node-1', 'node-2', 'node-3']);
        const result = validateNodeComplete(node, allNodeIds);

        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.code === 'INVALID_PREREQUISITE')).toBe(true);
    });
});

describe('validateMinimumNodes', () => {
    it('should pass graph with nodes', () => {
        const graphData: GraphData = {
            nodes: [
                {
                    id: 'node-1',
                    type: 'skill',
                    position: { x: 0, y: 0 },
                    data: {
                        label: 'Test',
                        level: 0,
                        section: 'Test',
                    },
                },
            ],
            edges: [],
            metadata: {
                totalNodes: 1,
                totalEdges: 0,
                maxDepth: 0,
                layoutType: 'hierarchical',
                generatedAt: new Date(),
            },
        };

        const result = validateMinimumNodes(graphData);
        expect(result.valid).toBe(true);
    });

    it('should fail empty graph', () => {
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

        const result = validateMinimumNodes(graphData);
        expect(result.valid).toBe(false);
        expect(result.errors[0].code).toBe('NO_NODES');
    });
});

describe('validateAllNodes', () => {
    it('should validate all nodes in graph', () => {
        const graphData: GraphData = {
            nodes: [
                {
                    id: 'node-1',
                    type: 'skill',
                    position: { x: 0, y: 0 },
                    data: {
                        label: 'React Basics',
                        category: 'skill',
                        targetArticleId: 'react-basics',
                        level: 0,
                        section: 'Skills',
                    },
                },
                {
                    id: 'node-2',
                    type: 'skill',
                    position: { x: 100, y: 100 },
                    data: {
                        label: 'React Hooks',
                        category: 'skill',
                        targetArticleId: 'react-hooks',
                        prerequisites: ['node-1'],
                        level: 1,
                        section: 'Skills',
                    },
                },
            ],
            edges: [],
            metadata: {
                totalNodes: 2,
                totalEdges: 0,
                maxDepth: 1,
                layoutType: 'hierarchical',
                generatedAt: new Date(),
            },
        };

        const result = validateAllNodes(graphData);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('should collect errors from all invalid nodes', () => {
        const graphData: GraphData = {
            nodes: [
                {
                    id: 'node-1',
                    type: 'skill',
                    position: { x: 0, y: 0 },
                    data: {
                        label: '', // Invalid: empty label
                        level: 0,
                        section: 'Test',
                    },
                },
                {
                    id: 'node-2',
                    type: 'skill',
                    position: { x: 100, y: 100 },
                    data: {
                        label: 'Test',
                        category: 'role',
                        // Invalid: missing targetRoadmapId
                        level: 1,
                        section: 'Test',
                    },
                },
            ],
            edges: [],
            metadata: {
                totalNodes: 2,
                totalEdges: 0,
                maxDepth: 1,
                layoutType: 'hierarchical',
                generatedAt: new Date(),
            },
        };

        const result = validateAllNodes(graphData);
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);

        // Check that errors include node index
        expect(result.errors.some(e => e.field.startsWith('nodes[0]'))).toBe(true);
        expect(result.errors.some(e => e.field.startsWith('nodes[1]'))).toBe(true);
    });

    it('should validate prerequisites across all nodes', () => {
        const graphData: GraphData = {
            nodes: [
                {
                    id: 'node-1',
                    type: 'skill',
                    position: { x: 0, y: 0 },
                    data: {
                        label: 'React Basics',
                        level: 0,
                        section: 'Test',
                    },
                },
                {
                    id: 'node-2',
                    type: 'skill',
                    position: { x: 100, y: 100 },
                    data: {
                        label: 'Advanced React',
                        prerequisites: ['node-1', 'non-existent'], // Invalid prerequisite
                        level: 1,
                        section: 'Test',
                    },
                },
            ],
            edges: [],
            metadata: {
                totalNodes: 2,
                totalEdges: 0,
                maxDepth: 1,
                layoutType: 'hierarchical',
                generatedAt: new Date(),
            },
        };

        const result = validateAllNodes(graphData);
        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.code === 'INVALID_PREREQUISITE')).toBe(true);
    });
});

