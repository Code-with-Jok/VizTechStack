/**
 * Mock graph data for testing roadmap visualization
 * This data represents a simplified Frontend Development roadmap
 */

import type { GraphData } from '@viztechstack/roadmap-visualization';

export const mockGraphData: GraphData = {
    nodes: [
        // Level 0: Main Topic
        {
            id: 'node-1',
            type: 'topic',
            position: { x: 0, y: 0 },
            data: {
                label: 'Frontend Development',
                description: 'Complete roadmap for becoming a frontend developer',
                level: 0,
                section: 'Main',
                estimatedTime: '6-12 months',
                difficulty: 'beginner',
                category: 'role',
                targetRoadmapId: 'frontend-developer',
            },
        },

        // Level 1: Core Technologies
        {
            id: 'node-2',
            type: 'skill',
            position: { x: 0, y: 0 },
            data: {
                label: 'HTML',
                description: 'HyperText Markup Language - Structure of web pages',
                level: 1,
                section: 'Core Technologies',
                estimatedTime: '2-4 weeks',
                difficulty: 'beginner',
                category: 'skill',
                targetArticleId: 'html-basics',
                resources: [
                    {
                        title: 'MDN HTML Guide',
                        url: 'https://developer.mozilla.org/en-US/docs/Web/HTML',
                        type: 'documentation',
                    },
                ],
            },
        },
        {
            id: 'node-3',
            type: 'skill',
            position: { x: 0, y: 0 },
            data: {
                label: 'CSS',
                description: 'Cascading Style Sheets - Styling web pages',
                level: 1,
                section: 'Core Technologies',
                estimatedTime: '4-6 weeks',
                difficulty: 'beginner',
                resources: [
                    {
                        title: 'MDN CSS Guide',
                        url: 'https://developer.mozilla.org/en-US/docs/Web/CSS',
                        type: 'documentation',
                    },
                ],
            },
        },
        {
            id: 'node-4',
            type: 'skill',
            position: { x: 0, y: 0 },
            data: {
                label: 'JavaScript',
                description: 'Programming language for web interactivity',
                level: 1,
                section: 'Core Technologies',
                estimatedTime: '8-12 weeks',
                difficulty: 'intermediate',
                resources: [
                    {
                        title: 'JavaScript.info',
                        url: 'https://javascript.info/',
                        type: 'course',
                    },
                ],
            },
        },

        // Level 2: Advanced CSS
        {
            id: 'node-5',
            type: 'skill',
            position: { x: 0, y: 0 },
            data: {
                label: 'Flexbox',
                description: 'CSS layout model for flexible containers',
                level: 2,
                section: 'Advanced CSS',
                estimatedTime: '1-2 weeks',
                difficulty: 'intermediate',
            },
        },
        {
            id: 'node-6',
            type: 'skill',
            position: { x: 0, y: 0 },
            data: {
                label: 'Grid',
                description: 'CSS layout system for 2D layouts',
                level: 2,
                section: 'Advanced CSS',
                estimatedTime: '1-2 weeks',
                difficulty: 'intermediate',
            },
        },
        {
            id: 'node-7',
            type: 'skill',
            position: { x: 0, y: 0 },
            data: {
                label: 'Responsive Design',
                description: 'Creating layouts that work on all devices',
                level: 2,
                section: 'Advanced CSS',
                estimatedTime: '2-3 weeks',
                difficulty: 'intermediate',
            },
        },

        // Level 2: Modern JavaScript
        {
            id: 'node-8',
            type: 'skill',
            position: { x: 0, y: 0 },
            data: {
                label: 'ES6+',
                description: 'Modern JavaScript features and syntax',
                level: 2,
                section: 'Modern JavaScript',
                estimatedTime: '3-4 weeks',
                difficulty: 'intermediate',
            },
        },
        {
            id: 'node-9',
            type: 'skill',
            position: { x: 0, y: 0 },
            data: {
                label: 'Async/Await',
                description: 'Handling asynchronous operations',
                level: 2,
                section: 'Modern JavaScript',
                estimatedTime: '2-3 weeks',
                difficulty: 'intermediate',
            },
        },

        // Level 3: Frameworks
        {
            id: 'node-10',
            type: 'milestone',
            position: { x: 0, y: 0 },
            data: {
                label: 'React',
                description: 'Popular JavaScript library for building UIs',
                level: 3,
                section: 'Frameworks',
                estimatedTime: '8-12 weeks',
                difficulty: 'advanced',
                category: 'skill',
                targetArticleId: 'react-fundamentals',
                resources: [
                    {
                        title: 'React Official Docs',
                        url: 'https://react.dev/',
                        type: 'documentation',
                    },
                ],
            },
        },
        {
            id: 'node-11',
            type: 'skill',
            position: { x: 0, y: 0 },
            data: {
                label: 'TypeScript',
                description: 'Typed superset of JavaScript',
                level: 3,
                section: 'Frameworks',
                estimatedTime: '4-6 weeks',
                difficulty: 'advanced',
            },
        },

        // Level 4: Advanced Topics
        {
            id: 'node-12',
            type: 'skill',
            position: { x: 0, y: 0 },
            data: {
                label: 'State Management',
                description: 'Managing application state (Redux, Zustand)',
                level: 4,
                section: 'Advanced Topics',
                estimatedTime: '3-4 weeks',
                difficulty: 'advanced',
            },
        },
        {
            id: 'node-13',
            type: 'skill',
            position: { x: 0, y: 0 },
            data: {
                label: 'Testing',
                description: 'Unit and integration testing (Jest, React Testing Library)',
                level: 4,
                section: 'Advanced Topics',
                estimatedTime: '4-6 weeks',
                difficulty: 'advanced',
            },
        },
        {
            id: 'node-14',
            type: 'milestone',
            position: { x: 0, y: 0 },
            data: {
                label: 'Next.js',
                description: 'React framework for production',
                level: 4,
                section: 'Advanced Topics',
                estimatedTime: '6-8 weeks',
                difficulty: 'advanced',
            },
        },
    ],

    edges: [
        // Main topic to core technologies
        {
            id: 'edge-1',
            source: 'node-1',
            target: 'node-2',
            type: 'progression',
            data: {
                relationship: 'leads-to',
                strength: 1,
            },
        },
        {
            id: 'edge-2',
            source: 'node-1',
            target: 'node-3',
            type: 'progression',
            data: {
                relationship: 'leads-to',
                strength: 1,
            },
        },
        {
            id: 'edge-3',
            source: 'node-1',
            target: 'node-4',
            type: 'progression',
            data: {
                relationship: 'leads-to',
                strength: 1,
            },
        },

        // CSS to advanced CSS
        {
            id: 'edge-4',
            source: 'node-3',
            target: 'node-5',
            type: 'progression',
            data: {
                relationship: 'leads-to',
                strength: 0.9,
            },
        },
        {
            id: 'edge-5',
            source: 'node-3',
            target: 'node-6',
            type: 'progression',
            data: {
                relationship: 'leads-to',
                strength: 0.9,
            },
        },
        {
            id: 'edge-6',
            source: 'node-5',
            target: 'node-7',
            type: 'dependency',
            data: {
                relationship: 'prerequisite',
                strength: 0.8,
            },
        },
        {
            id: 'edge-7',
            source: 'node-6',
            target: 'node-7',
            type: 'dependency',
            data: {
                relationship: 'prerequisite',
                strength: 0.8,
            },
        },

        // JavaScript to modern JavaScript
        {
            id: 'edge-8',
            source: 'node-4',
            target: 'node-8',
            type: 'progression',
            data: {
                relationship: 'leads-to',
                strength: 1,
            },
        },
        {
            id: 'edge-9',
            source: 'node-8',
            target: 'node-9',
            type: 'progression',
            data: {
                relationship: 'leads-to',
                strength: 0.9,
            },
        },

        // Prerequisites for React
        {
            id: 'edge-10',
            source: 'node-2',
            target: 'node-10',
            type: 'dependency',
            data: {
                relationship: 'prerequisite',
                strength: 1,
            },
        },
        {
            id: 'edge-11',
            source: 'node-3',
            target: 'node-10',
            type: 'dependency',
            data: {
                relationship: 'prerequisite',
                strength: 1,
            },
        },
        {
            id: 'edge-12',
            source: 'node-8',
            target: 'node-10',
            type: 'dependency',
            data: {
                relationship: 'prerequisite',
                strength: 1,
            },
        },

        // TypeScript
        {
            id: 'edge-13',
            source: 'node-4',
            target: 'node-11',
            type: 'progression',
            data: {
                relationship: 'leads-to',
                strength: 0.8,
            },
        },

        // Advanced topics
        {
            id: 'edge-14',
            source: 'node-10',
            target: 'node-12',
            type: 'progression',
            data: {
                relationship: 'leads-to',
                strength: 0.9,
            },
        },
        {
            id: 'edge-15',
            source: 'node-10',
            target: 'node-13',
            type: 'progression',
            data: {
                relationship: 'leads-to',
                strength: 0.9,
            },
        },
        {
            id: 'edge-16',
            source: 'node-10',
            target: 'node-14',
            type: 'progression',
            data: {
                relationship: 'leads-to',
                strength: 1,
            },
        },
        {
            id: 'edge-17',
            source: 'node-11',
            target: 'node-14',
            type: 'dependency',
            data: {
                relationship: 'prerequisite',
                strength: 0.7,
            },
        },

        // Related connections
        {
            id: 'edge-18',
            source: 'node-7',
            target: 'node-10',
            type: 'related',
            data: {
                relationship: 'related-to',
                strength: 0.6,
            },
        },
    ],

    metadata: {
        totalNodes: 14,
        totalEdges: 18,
        maxDepth: 4,
        layoutType: 'hierarchical',
        generatedAt: new Date(),
    },
};
