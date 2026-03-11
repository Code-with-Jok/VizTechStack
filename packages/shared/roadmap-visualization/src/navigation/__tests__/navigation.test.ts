/**
 * Tests for navigation utilities
 */

import {
    getNodeNavigationUrl,
    canNavigate,
    getCategoryDisplayName,
    getCategoryIcon,
    validateNodeNavigation,
    isExternalUrl,
    getArticlePreview,
} from '../index';
import type { NodeData } from '../../types';

describe('Navigation Utilities', () => {
    describe('getNodeNavigationUrl', () => {
        it('should return roadmap URL for role node with targetRoadmapId', () => {
            const nodeData: NodeData = {
                label: 'Frontend Developer',
                level: 1,
                section: 'Roles',
                category: 'role',
                targetRoadmapId: 'frontend-roadmap',
            };

            const result = getNodeNavigationUrl(nodeData);

            expect(result).toEqual({
                url: '/roadmaps/frontend-roadmap',
                type: 'roadmap',
                openInNewTab: false,
                isExternal: false,
            });
        });

        it('should return article URL for skill node with targetArticleId', () => {
            const nodeData: NodeData = {
                label: 'React Basics',
                level: 2,
                section: 'Skills',
                category: 'skill',
                targetArticleId: 'react-basics-guide',
            };

            const result = getNodeNavigationUrl(nodeData);

            expect(result).toEqual({
                url: '/articles/react-basics-guide',
                type: 'article',
                openInNewTab: false,
                isExternal: false,
            });
        });

        it('should return external URL for skill node with external link', () => {
            const nodeData: NodeData = {
                label: 'React Documentation',
                level: 2,
                section: 'Skills',
                category: 'skill',
                targetArticleId: 'https://react.dev/learn',
            };

            const result = getNodeNavigationUrl(nodeData);

            expect(result).toEqual({
                url: 'https://react.dev/learn',
                type: 'external',
                openInNewTab: true,
                isExternal: true,
            });
        });

        it('should handle HTTP external links', () => {
            const nodeData: NodeData = {
                label: 'External Resource',
                level: 2,
                section: 'Skills',
                category: 'skill',
                targetArticleId: 'http://example.com/article',
            };

            const result = getNodeNavigationUrl(nodeData);

            expect(result).toEqual({
                url: 'http://example.com/article',
                type: 'external',
                openInNewTab: true,
                isExternal: true,
            });
        });

        it('should return none type for role node without targetRoadmapId', () => {
            const nodeData: NodeData = {
                label: 'Backend Developer',
                level: 1,
                section: 'Roles',
                category: 'role',
            };

            const result = getNodeNavigationUrl(nodeData);

            expect(result).toEqual({
                url: '#',
                type: 'none',
                openInNewTab: false,
                isExternal: false,
            });
        });

        it('should return none type for skill node without targetArticleId', () => {
            const nodeData: NodeData = {
                label: 'Node.js',
                level: 2,
                section: 'Skills',
                category: 'skill',
            };

            const result = getNodeNavigationUrl(nodeData);

            expect(result).toEqual({
                url: '#',
                type: 'none',
                openInNewTab: false,
                isExternal: false,
            });
        });

        it('should return none type for node without category', () => {
            const nodeData: NodeData = {
                label: 'General Topic',
                level: 1,
                section: 'Topics',
            };

            const result = getNodeNavigationUrl(nodeData);

            expect(result).toEqual({
                url: '#',
                type: 'none',
                openInNewTab: false,
                isExternal: false,
            });
        });
    });

    describe('canNavigate', () => {
        it('should return true for role node with targetRoadmapId', () => {
            const nodeData: NodeData = {
                label: 'Frontend Developer',
                level: 1,
                section: 'Roles',
                category: 'role',
                targetRoadmapId: 'frontend-roadmap',
            };

            expect(canNavigate(nodeData)).toBe(true);
        });

        it('should return false for role node without targetRoadmapId', () => {
            const nodeData: NodeData = {
                label: 'Backend Developer',
                level: 1,
                section: 'Roles',
                category: 'role',
            };

            expect(canNavigate(nodeData)).toBe(false);
        });

        it('should return true for skill node with targetArticleId', () => {
            const nodeData: NodeData = {
                label: 'React Basics',
                level: 2,
                section: 'Skills',
                category: 'skill',
                targetArticleId: 'react-basics-guide',
            };

            expect(canNavigate(nodeData)).toBe(true);
        });

        it('should return false for skill node without targetArticleId', () => {
            const nodeData: NodeData = {
                label: 'Node.js',
                level: 2,
                section: 'Skills',
                category: 'skill',
            };

            expect(canNavigate(nodeData)).toBe(false);
        });

        it('should return false for node without category', () => {
            const nodeData: NodeData = {
                label: 'General Topic',
                level: 1,
                section: 'Topics',
            };

            expect(canNavigate(nodeData)).toBe(false);
        });

        it('should return false for role node with empty targetRoadmapId', () => {
            const nodeData: NodeData = {
                label: 'Frontend Developer',
                level: 1,
                section: 'Roles',
                category: 'role',
                targetRoadmapId: '',
            };

            expect(canNavigate(nodeData)).toBe(false);
        });

        it('should return false for skill node with empty targetArticleId', () => {
            const nodeData: NodeData = {
                label: 'React Basics',
                level: 2,
                section: 'Skills',
                category: 'skill',
                targetArticleId: '',
            };

            expect(canNavigate(nodeData)).toBe(false);
        });
    });

    describe('getCategoryDisplayName', () => {
        it('should return correct display name for role category', () => {
            expect(getCategoryDisplayName('role')).toBe('Vai trò');
        });

        it('should return correct display name for skill category', () => {
            expect(getCategoryDisplayName('skill')).toBe('Kỹ năng');
        });

        it('should return default display name for undefined category', () => {
            expect(getCategoryDisplayName(undefined)).toBe('Chủ đề');
        });
    });

    describe('getCategoryIcon', () => {
        it('should return correct icon for role category', () => {
            expect(getCategoryIcon('role')).toBe('👤');
        });

        it('should return correct icon for skill category', () => {
            expect(getCategoryIcon('skill')).toBe('🎯');
        });

        it('should return default icon for undefined category', () => {
            expect(getCategoryIcon(undefined)).toBe('📌');
        });
    });

    describe('validateNodeNavigation', () => {
        it('should return null for valid role node', () => {
            const nodeData: NodeData = {
                label: 'Frontend Developer',
                level: 1,
                section: 'Roles',
                category: 'role',
                targetRoadmapId: 'frontend-roadmap',
            };

            expect(validateNodeNavigation(nodeData)).toBeNull();
        });

        it('should return error for role node without targetRoadmapId', () => {
            const nodeData: NodeData = {
                label: 'Backend Developer',
                level: 1,
                section: 'Roles',
                category: 'role',
            };

            expect(validateNodeNavigation(nodeData)).toBe(
                'Role node phải có targetRoadmapId'
            );
        });

        it('should return null for valid skill node', () => {
            const nodeData: NodeData = {
                label: 'React Basics',
                level: 2,
                section: 'Skills',
                category: 'skill',
                targetArticleId: 'react-basics-guide',
            };

            expect(validateNodeNavigation(nodeData)).toBeNull();
        });

        it('should return error for skill node without targetArticleId', () => {
            const nodeData: NodeData = {
                label: 'Node.js',
                level: 2,
                section: 'Skills',
                category: 'skill',
            };

            expect(validateNodeNavigation(nodeData)).toBe(
                'Skill node phải có targetArticleId'
            );
        });

        it('should return null for node without category', () => {
            const nodeData: NodeData = {
                label: 'General Topic',
                level: 1,
                section: 'Topics',
            };

            expect(validateNodeNavigation(nodeData)).toBeNull();
        });

        it('should return error for role node with empty targetRoadmapId', () => {
            const nodeData: NodeData = {
                label: 'Frontend Developer',
                level: 1,
                section: 'Roles',
                category: 'role',
                targetRoadmapId: '',
            };

            expect(validateNodeNavigation(nodeData)).toBe(
                'Role node phải có targetRoadmapId'
            );
        });

        it('should return error for skill node with empty targetArticleId', () => {
            const nodeData: NodeData = {
                label: 'React Basics',
                level: 2,
                section: 'Skills',
                category: 'skill',
                targetArticleId: '',
            };

            expect(validateNodeNavigation(nodeData)).toBe(
                'Skill node phải có targetArticleId'
            );
        });
    });

    describe('Edge cases', () => {
        it('should handle role node with both targetRoadmapId and targetArticleId', () => {
            const nodeData: NodeData = {
                label: 'Hybrid Role',
                level: 1,
                section: 'Roles',
                category: 'role',
                targetRoadmapId: 'frontend-roadmap',
                targetArticleId: 'some-article',
            };

            // Should prioritize role navigation
            const result = getNodeNavigationUrl(nodeData);
            expect(result.type).toBe('roadmap');
            expect(result.url).toBe('/roadmaps/frontend-roadmap');
        });

        it('should handle skill node with both targetRoadmapId and targetArticleId', () => {
            const nodeData: NodeData = {
                label: 'Hybrid Skill',
                level: 2,
                section: 'Skills',
                category: 'skill',
                targetRoadmapId: 'some-roadmap',
                targetArticleId: 'react-basics-guide',
            };

            // Should prioritize skill navigation
            const result = getNodeNavigationUrl(nodeData);
            expect(result.type).toBe('article');
            expect(result.url).toBe('/articles/react-basics-guide');
        });

        it('should handle special characters in IDs', () => {
            const nodeData: NodeData = {
                label: 'Frontend Developer',
                level: 1,
                section: 'Roles',
                category: 'role',
                targetRoadmapId: 'frontend-developer-2024',
            };

            const result = getNodeNavigationUrl(nodeData);
            expect(result.url).toBe('/roadmaps/frontend-developer-2024');
        });

        it('should handle URL-safe characters in IDs', () => {
            const nodeData: NodeData = {
                label: 'React Guide',
                level: 2,
                section: 'Skills',
                category: 'skill',
                targetArticleId: 'react_basics_guide-v2',
            };

            const result = getNodeNavigationUrl(nodeData);
            expect(result.url).toBe('/articles/react_basics_guide-v2');
        });
    });

    describe('isExternalUrl', () => {
        it('should return true for HTTPS URLs', () => {
            expect(isExternalUrl('https://example.com')).toBe(true);
            expect(isExternalUrl('https://react.dev/learn')).toBe(true);
        });

        it('should return true for HTTP URLs', () => {
            expect(isExternalUrl('http://example.com')).toBe(true);
            expect(isExternalUrl('http://localhost:3000')).toBe(true);
        });

        it('should return false for relative URLs', () => {
            expect(isExternalUrl('/articles/react-basics')).toBe(false);
            expect(isExternalUrl('articles/react-basics')).toBe(false);
        });

        it('should return false for internal slugs', () => {
            expect(isExternalUrl('react-basics-guide')).toBe(false);
            expect(isExternalUrl('frontend-roadmap')).toBe(false);
        });

        it('should be case insensitive', () => {
            expect(isExternalUrl('HTTPS://EXAMPLE.COM')).toBe(true);
            expect(isExternalUrl('HTTP://EXAMPLE.COM')).toBe(true);
        });
    });

    describe('getArticlePreview', () => {
        it('should return article metadata for skill node with internal article', () => {
            const nodeData: NodeData = {
                label: 'React Basics',
                level: 2,
                section: 'Skills',
                category: 'skill',
                targetArticleId: 'react-basics-guide',
                description: 'Learn React fundamentals',
                difficulty: 'beginner',
            };

            const preview = getArticlePreview(nodeData);

            expect(preview).toEqual({
                title: 'React Basics',
                description: 'Learn React fundamentals',
                difficulty: 'beginner',
                url: '/articles/react-basics-guide',
                isExternal: false,
                readTime: undefined,
                author: undefined,
                tags: undefined,
            });
        });

        it('should return article metadata for skill node with external article', () => {
            const nodeData: NodeData = {
                label: 'React Documentation',
                level: 2,
                section: 'Skills',
                category: 'skill',
                targetArticleId: 'https://react.dev/learn',
                description: 'Official React documentation',
                difficulty: 'intermediate',
            };

            const preview = getArticlePreview(nodeData);

            expect(preview).toEqual({
                title: 'React Documentation',
                description: 'Official React documentation',
                difficulty: 'intermediate',
                url: 'https://react.dev/learn',
                isExternal: true,
                readTime: undefined,
                author: undefined,
                tags: undefined,
            });
        });

        it('should use default description if not provided', () => {
            const nodeData: NodeData = {
                label: 'Node.js Guide',
                level: 2,
                section: 'Skills',
                category: 'skill',
                targetArticleId: 'nodejs-guide',
            };

            const preview = getArticlePreview(nodeData);

            expect(preview?.description).toBe('Nhấp để xem chi tiết bài viết');
        });

        it('should return null for non-skill nodes', () => {
            const nodeData: NodeData = {
                label: 'Frontend Developer',
                level: 1,
                section: 'Roles',
                category: 'role',
                targetRoadmapId: 'frontend-roadmap',
            };

            const preview = getArticlePreview(nodeData);

            expect(preview).toBeNull();
        });

        it('should return null for skill node without targetArticleId', () => {
            const nodeData: NodeData = {
                label: 'React Basics',
                level: 2,
                section: 'Skills',
                category: 'skill',
            };

            const preview = getArticlePreview(nodeData);

            expect(preview).toBeNull();
        });

        it('should return null for node without category', () => {
            const nodeData: NodeData = {
                label: 'General Topic',
                level: 1,
                section: 'Topics',
            };

            const preview = getArticlePreview(nodeData);

            expect(preview).toBeNull();
        });
    });
});
