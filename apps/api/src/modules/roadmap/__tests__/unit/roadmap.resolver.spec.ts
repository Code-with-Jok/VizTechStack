/**
 * Unit Tests for RoadmapResolver
 *
 * These tests verify specific behaviors of the RoadmapResolver query methods,
 * focusing on public access to roadmap data without authentication.
 *
 * Feature: user-role-based-access-control
 * Task: 13.1
 * Requirements: 4.1, 4.2, 4.3, 4.4, 5.1, 6.1
 */

import { Test, TestingModule } from '@nestjs/testing';
import { RoadmapResolver } from '../../transport/graphql/resolvers/roadmap.resolver';
import { RoadmapService } from '../../application/services/roadmap.service';
import type { Roadmap } from '../../domain/models/roadmap.model';

describe('RoadmapResolver', () => {
  let resolver: RoadmapResolver;
  let roadmapService: RoadmapService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoadmapResolver,
        {
          provide: RoadmapService,
          useValue: {
            findAll: jest.fn(),
            findBySlug: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    resolver = module.get<RoadmapResolver>(RoadmapResolver);
    roadmapService = module.get<RoadmapService>(RoadmapService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('roadmaps query', () => {
    /**
     * Test: Query roadmaps without authentication
     * Validates: Requirements 4.1, 4.2, 4.3, 4.4, 5.1, 6.1
     *
     * The roadmaps query is marked with @Public() decorator, allowing
     * unauthenticated access. This test verifies that the resolver
     * correctly calls the service and transforms the response.
     */
    it('should return all published roadmaps without authentication', async () => {
      // Mock: Service returns roadmaps with _id field
      const mockRoadmaps: Roadmap[] = [
        {
          _id: 'roadmap_1',
          slug: 'frontend-roadmap',
          title: 'Frontend Developer Roadmap',
          description: 'Complete guide to frontend development',
          content: 'Detailed content here...',
          author: 'user_123',
          tags: ['frontend', 'javascript'],
          publishedAt: 1704067200000,
          updatedAt: 1704067200000,
          isPublished: true,
        },
        {
          _id: 'roadmap_2',
          slug: 'backend-roadmap',
          title: 'Backend Developer Roadmap',
          description: 'Complete guide to backend development',
          content: 'Detailed content here...',
          author: 'user_456',
          tags: ['backend', 'nodejs'],
          publishedAt: 1704153600000,
          updatedAt: 1704153600000,
          isPublished: true,
        },
      ];

      (roadmapService.findAll as jest.Mock).mockResolvedValue(mockRoadmaps);

      // Query roadmaps (no authentication required)
      const result = await resolver.roadmaps();

      // Verify result: _id should be transformed to id
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('id', 'roadmap_1');
      expect(result[0]).toHaveProperty('slug', 'frontend-roadmap');
      expect(result[0]).toHaveProperty('title', 'Frontend Developer Roadmap');
      expect(result[1]).toHaveProperty('id', 'roadmap_2');
      expect(result[1]).toHaveProperty('slug', 'backend-roadmap');

      // Verify service was called
      expect(roadmapService.findAll).toHaveBeenCalledTimes(1);
      expect(roadmapService.findAll).toHaveBeenCalledWith();
    });

    /**
     * Test: Return empty array when no roadmaps exist
     * Validates: Requirements 4.1, 4.2, 4.3, 4.4, 5.1, 6.1
     *
     * When no published roadmaps exist, the resolver should return
     * an empty array without errors.
     */
    it('should return empty array when no roadmaps exist', async () => {
      // Mock: Service returns empty array
      (roadmapService.findAll as jest.Mock).mockResolvedValue([]);

      // Query roadmaps
      const result = await resolver.roadmaps();

      // Verify result
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);

      // Verify service was called
      expect(roadmapService.findAll).toHaveBeenCalledTimes(1);
    });

    /**
     * Test: Transform _id to id for GraphQL schema
     * Validates: Requirements 4.1, 4.2, 4.3, 4.4
     *
     * The resolver should transform Convex's _id field to id field
     * to match the GraphQL schema definition.
     */
    it('should transform _id to id for GraphQL schema', async () => {
      const mockRoadmap: Roadmap = {
        _id: 'convex_id_123',
        slug: 'test-roadmap',
        title: 'Test Roadmap',
        description: 'Test Description',
        content: 'Test Content',
        author: 'user_123',
        tags: ['test'],
        publishedAt: Date.now(),
        updatedAt: Date.now(),
        isPublished: true,
      };

      (roadmapService.findAll as jest.Mock).mockResolvedValue([mockRoadmap]);

      // Query roadmaps
      const result = await resolver.roadmaps();

      // Verify transformation: id field should be added matching _id
      expect(result[0]).toHaveProperty('id', 'convex_id_123');
      expect(result[0].id).toBe(mockRoadmap._id);
    });

    /**
     * Test: Preserve all roadmap fields
     * Validates: Requirements 4.1, 4.2, 4.3, 4.4
     *
     * The resolver should preserve all fields from the service response
     * except for the _id to id transformation.
     */
    it('should preserve all roadmap fields', async () => {
      const mockRoadmap: Roadmap = {
        _id: 'roadmap_full',
        slug: 'full-roadmap',
        title: 'Full Roadmap',
        description: 'Full Description',
        content: 'Full Content',
        author: 'user_full',
        tags: ['tag1', 'tag2', 'tag3'],
        publishedAt: 1704067200000,
        updatedAt: 1704153600000,
        isPublished: true,
      };

      (roadmapService.findAll as jest.Mock).mockResolvedValue([mockRoadmap]);

      // Query roadmaps
      const result = await resolver.roadmaps();

      // Verify all fields are preserved
      expect(result[0]).toMatchObject({
        id: 'roadmap_full',
        slug: 'full-roadmap',
        title: 'Full Roadmap',
        description: 'Full Description',
        content: 'Full Content',
        author: 'user_full',
        tags: ['tag1', 'tag2', 'tag3'],
        publishedAt: 1704067200000,
        updatedAt: 1704153600000,
        isPublished: true,
      });
    });
  });

  describe('roadmap query', () => {
    const testSlug = 'test-roadmap';

    /**
     * Test: Query roadmap by slug without authentication
     * Validates: Requirements 4.1, 4.2, 4.3, 4.4, 5.1, 6.1
     *
     * The roadmap query is marked with @Public() decorator, allowing
     * unauthenticated access. This test verifies that the resolver
     * correctly calls the service with the slug parameter.
     */
    it('should return roadmap by slug without authentication', async () => {
      // Mock: Service returns roadmap
      const mockRoadmap: Roadmap = {
        _id: 'roadmap_123',
        slug: testSlug,
        title: 'Test Roadmap',
        description: 'Test Description',
        content: 'Test Content',
        author: 'user_123',
        tags: ['test', 'example'],
        publishedAt: 1704067200000,
        updatedAt: 1704067200000,
        isPublished: true,
      };

      (roadmapService.findBySlug as jest.Mock).mockResolvedValue(mockRoadmap);

      // Query roadmap by slug (no authentication required)
      const result = await resolver.roadmap(testSlug);

      // Verify result: _id should be transformed to id
      expect(result).not.toBeNull();
      expect(result).toHaveProperty('id', 'roadmap_123');
      expect(result).toHaveProperty('slug', testSlug);
      expect(result).toHaveProperty('title', 'Test Roadmap');
      expect(result).toHaveProperty('description', 'Test Description');

      // Verify service was called with correct slug
      expect(roadmapService.findBySlug).toHaveBeenCalledTimes(1);
      expect(roadmapService.findBySlug).toHaveBeenCalledWith(testSlug);
    });

    /**
     * Test: Return null when roadmap not found
     * Validates: Requirements 4.1, 4.2, 4.3, 4.4, 5.1, 6.1
     *
     * When a roadmap with the given slug doesn't exist, the resolver
     * should return null without throwing an error.
     */
    it('should return null when roadmap not found', async () => {
      const nonExistentSlug = 'non-existent-roadmap';

      // Mock: Service returns null
      (roadmapService.findBySlug as jest.Mock).mockResolvedValue(null);

      // Query roadmap by slug
      const result = await resolver.roadmap(nonExistentSlug);

      // Verify result
      expect(result).toBeNull();

      // Verify service was called with correct slug
      expect(roadmapService.findBySlug).toHaveBeenCalledTimes(1);
      expect(roadmapService.findBySlug).toHaveBeenCalledWith(nonExistentSlug);
    });

    /**
     * Test: Transform _id to id for GraphQL schema
     * Validates: Requirements 4.1, 4.2, 4.3, 4.4
     *
     * The resolver should transform Convex's _id field to id field
     * to match the GraphQL schema definition.
     */
    it('should transform _id to id for GraphQL schema', async () => {
      const mockRoadmap: Roadmap = {
        _id: 'convex_id_456',
        slug: 'transform-test',
        title: 'Transform Test',
        description: 'Description',
        content: 'Content',
        author: 'user_456',
        tags: ['test'],
        publishedAt: Date.now(),
        updatedAt: Date.now(),
        isPublished: true,
      };

      (roadmapService.findBySlug as jest.Mock).mockResolvedValue(mockRoadmap);

      // Query roadmap by slug
      const result = await resolver.roadmap('transform-test');

      // Verify transformation: id field should be added matching _id
      expect(result).not.toBeNull();
      expect(result).toHaveProperty('id', 'convex_id_456');
      expect(result!.id).toBe(mockRoadmap._id);
    });

    /**
     * Test: Handle special characters in slug
     * Validates: Requirements 4.1, 4.2, 4.3, 4.4
     *
     * The resolver should correctly pass slugs with special characters
     * to the service without modification.
     */
    it('should handle special characters in slug', async () => {
      const specialSlug = 'roadmap-2024-v2';

      const mockRoadmap: Roadmap = {
        _id: 'roadmap_special',
        slug: specialSlug,
        title: 'Special Roadmap',
        description: 'Description',
        content: 'Content',
        author: 'user_123',
        tags: ['test'],
        publishedAt: Date.now(),
        updatedAt: Date.now(),
        isPublished: true,
      };

      (roadmapService.findBySlug as jest.Mock).mockResolvedValue(mockRoadmap);

      // Query roadmap with special slug
      const result = await resolver.roadmap(specialSlug);

      // Verify result
      expect(result).not.toBeNull();
      expect(result!.slug).toBe(specialSlug);

      // Verify service was called with exact slug
      expect(roadmapService.findBySlug).toHaveBeenCalledWith(specialSlug);
    });

    /**
     * Test: Preserve all roadmap fields
     * Validates: Requirements 4.1, 4.2, 4.3, 4.4
     *
     * The resolver should preserve all fields from the service response
     * except for the _id to id transformation.
     */
    it('should preserve all roadmap fields', async () => {
      const mockRoadmap: Roadmap = {
        _id: 'roadmap_complete',
        slug: 'complete-roadmap',
        title: 'Complete Roadmap',
        description: 'Complete Description',
        content: 'Complete Content with markdown',
        author: 'user_complete',
        tags: ['complete', 'test', 'example'],
        publishedAt: 1704067200000,
        updatedAt: 1704240000000,
        isPublished: true,
      };

      (roadmapService.findBySlug as jest.Mock).mockResolvedValue(mockRoadmap);

      // Query roadmap
      const result = await resolver.roadmap('complete-roadmap');

      // Verify all fields are preserved
      expect(result).toMatchObject({
        id: 'roadmap_complete',
        slug: 'complete-roadmap',
        title: 'Complete Roadmap',
        description: 'Complete Description',
        content: 'Complete Content with markdown',
        author: 'user_complete',
        tags: ['complete', 'test', 'example'],
        publishedAt: 1704067200000,
        updatedAt: 1704240000000,
        isPublished: true,
      });
    });

    /**
     * Test: Query with empty string slug
     * Validates: Requirements 4.1, 4.2, 4.3, 4.4
     *
     * The resolver should handle edge cases like empty string slugs
     * by passing them to the service, which will return null.
     */
    it('should handle empty string slug', async () => {
      const emptySlug = '';

      // Mock: Service returns null for empty slug
      (roadmapService.findBySlug as jest.Mock).mockResolvedValue(null);

      // Query roadmap with empty slug
      const result = await resolver.roadmap(emptySlug);

      // Verify result
      expect(result).toBeNull();

      // Verify service was called with empty slug
      expect(roadmapService.findBySlug).toHaveBeenCalledWith(emptySlug);
    });
  });

  describe('createRoadmap mutation', () => {
    /**
     * Test: Create roadmap with admin role
     * Validates: Requirements 7.2, 8.1, 8.2, 8.3
     *
     * Admin users should be able to create new roadmaps. The resolver
     * should pass the input data and the authenticated user's ID to the service.
     */
    it('should create roadmap with admin role', async () => {
      const mockInput = {
        slug: 'new-roadmap',
        title: 'New Roadmap',
        description: 'New Description',
        content: 'New Content',
        tags: ['new', 'test'],
        isPublished: true,
      };

      const mockUser = {
        id: 'admin_user_123',
        role: 'admin',
      };

      const mockCreatedRoadmap: Roadmap = {
        _id: 'roadmap_new_123',
        ...mockInput,
        author: mockUser.id,
        publishedAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Mock: Service returns created roadmap
      (roadmapService.create as jest.Mock).mockResolvedValue(
        mockCreatedRoadmap,
      );

      // Create roadmap as admin
      const result = await resolver.createRoadmap(mockInput, mockUser);

      // Verify result has id field (transformed from _id)
      expect(result).toHaveProperty('id', 'roadmap_new_123');
      expect(result.slug).toBe(mockInput.slug);
      expect(result.title).toBe(mockInput.title);

      // Verify service was called with correct parameters
      expect(roadmapService.create).toHaveBeenCalledTimes(1);
      expect(roadmapService.create).toHaveBeenCalledWith(
        mockInput,
        mockUser.id,
      );
    });

    /**
     * Test: Pass author ID from authenticated user
     * Validates: Requirements 7.2, 8.2
     *
     * The resolver should extract the user ID from the CurrentUser decorator
     * and pass it to the service as the author parameter.
     */
    it('should pass author ID from authenticated user', async () => {
      const mockInput = {
        slug: 'author-test',
        title: 'Author Test',
        description: 'Description',
        content: 'Content',
        tags: ['test'],
        isPublished: false,
      };

      const mockUser = {
        id: 'specific_admin_456',
        role: 'admin',
      };

      const mockCreatedRoadmap: Roadmap = {
        _id: 'roadmap_author_test',
        ...mockInput,
        author: mockUser.id,
        publishedAt: Date.now(),
        updatedAt: Date.now(),
      };

      (roadmapService.create as jest.Mock).mockResolvedValue(
        mockCreatedRoadmap,
      );

      // Create roadmap
      await resolver.createRoadmap(mockInput, mockUser);

      // Verify service received the correct author ID
      expect(roadmapService.create).toHaveBeenCalledWith(
        mockInput,
        'specific_admin_456',
      );
    });

    /**
     * Test: Handle all input fields correctly
     * Validates: Requirements 7.2
     *
     * The resolver should pass all input fields to the service without modification.
     */
    it('should handle all input fields correctly', async () => {
      const mockInput = {
        slug: 'complete-input',
        title: 'Complete Input Test',
        description: 'Complete Description',
        content: 'Complete Content with markdown',
        tags: ['tag1', 'tag2', 'tag3'],
        isPublished: true,
      };

      const mockUser = {
        id: 'admin_789',
        role: 'admin',
      };

      const mockCreatedRoadmap: Roadmap = {
        _id: 'roadmap_complete',
        ...mockInput,
        author: mockUser.id,
        publishedAt: Date.now(),
        updatedAt: Date.now(),
      };

      (roadmapService.create as jest.Mock).mockResolvedValue(
        mockCreatedRoadmap,
      );

      // Create roadmap
      await resolver.createRoadmap(mockInput, mockUser);

      // Verify all fields are passed to service
      expect(roadmapService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          slug: 'complete-input',
          title: 'Complete Input Test',
          description: 'Complete Description',
          content: 'Complete Content with markdown',
          tags: ['tag1', 'tag2', 'tag3'],
          isPublished: true,
        }),
        'admin_789',
      );
    });
  });

  describe('updateRoadmap mutation', () => {
    /**
     * Test: Update roadmap with admin role
     * Validates: Requirements 7.4, 8.1, 8.2, 8.3
     *
     * Admin users should be able to update existing roadmaps. The resolver
     * should pass the update input to the service.
     */
    it('should update roadmap with admin role', async () => {
      const mockInput = {
        id: 'roadmap_to_update',
        title: 'Updated Title',
        description: 'Updated Description',
      };

      const mockUpdatedRoadmap: Roadmap = {
        _id: 'roadmap_to_update',
        slug: 'test-slug',
        title: 'Updated Title',
        description: 'Updated Description',
        content: 'Content',
        author: 'user_123',
        tags: ['test'],
        publishedAt: Date.now(),
        updatedAt: Date.now(),
        isPublished: true,
      };

      // Mock: Service returns updated roadmap
      (roadmapService.update as jest.Mock).mockResolvedValue(
        mockUpdatedRoadmap,
      );

      // Update roadmap as admin
      const result = await resolver.updateRoadmap(mockInput);

      // Verify result has id field (transformed from _id)
      expect(result).toHaveProperty('id', 'roadmap_to_update');
      expect(result.title).toBe('Updated Title');
      expect(result.description).toBe('Updated Description');

      // Verify service was called with correct parameters
      expect(roadmapService.update).toHaveBeenCalledTimes(1);
      expect(roadmapService.update).toHaveBeenCalledWith(mockInput);
    });

    /**
     * Test: Handle partial updates
     * Validates: Requirements 7.4
     *
     * The resolver should support partial updates where only some fields
     * are provided in the input.
     */
    it('should handle partial updates', async () => {
      const mockInput = {
        id: 'roadmap_partial',
        title: 'Only Title Updated',
      };

      const mockUpdatedRoadmap: Roadmap = {
        _id: 'roadmap_partial',
        slug: 'partial-slug',
        title: 'Only Title Updated',
        description: 'Original Description',
        content: 'Original Content',
        author: 'user_123',
        tags: ['test'],
        publishedAt: Date.now(),
        updatedAt: Date.now(),
        isPublished: true,
      };

      (roadmapService.update as jest.Mock).mockResolvedValue(
        mockUpdatedRoadmap,
      );

      // Update roadmap with partial input
      const result = await resolver.updateRoadmap(mockInput);

      // Verify result has id field
      expect(result).toHaveProperty('id', 'roadmap_partial');
      expect(result.title).toBe('Only Title Updated');

      // Verify service received partial input
      expect(roadmapService.update).toHaveBeenCalledWith(mockInput);
      expect(roadmapService.update).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'roadmap_partial',
          title: 'Only Title Updated',
        }),
      );
    });

    /**
     * Test: Update all optional fields
     * Validates: Requirements 7.4
     *
     * The resolver should handle updates with all optional fields provided.
     */
    it('should update all optional fields', async () => {
      const mockInput = {
        id: 'roadmap_full_update',
        slug: 'updated-slug',
        title: 'Updated Title',
        description: 'Updated Description',
        content: 'Updated Content',
        tags: ['updated', 'tags'],
        isPublished: false,
      };

      const mockUpdatedRoadmap: Roadmap = {
        _id: 'roadmap_full_update',
        slug: 'updated-slug',
        title: 'Updated Title',
        description: 'Updated Description',
        content: 'Updated Content',
        author: 'user_123',
        tags: ['updated', 'tags'],
        publishedAt: Date.now(),
        updatedAt: Date.now(),
        isPublished: false,
      };

      (roadmapService.update as jest.Mock).mockResolvedValue(
        mockUpdatedRoadmap,
      );

      // Update roadmap with all fields
      const result = await resolver.updateRoadmap(mockInput);

      // Verify result has id field
      expect(result).toHaveProperty('id', 'roadmap_full_update');

      // Verify all fields are passed to service
      expect(roadmapService.update).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'roadmap_full_update',
          slug: 'updated-slug',
          title: 'Updated Title',
          description: 'Updated Description',
          content: 'Updated Content',
          tags: ['updated', 'tags'],
          isPublished: false,
        }),
      );
    });
  });

  describe('deleteRoadmap mutation', () => {
    /**
     * Test: Delete roadmap with admin role
     * Validates: Requirements 7.5, 8.1, 8.2, 8.3
     *
     * Admin users should be able to delete roadmaps. The resolver
     * should pass the roadmap ID to the service.
     */
    it('should delete roadmap with admin role', async () => {
      const mockId = 'roadmap_to_delete';
      const mockDeletedRoadmap: Roadmap = {
        _id: mockId,
        slug: 'deleted-roadmap',
        title: 'Deleted Roadmap',
        description: 'Description',
        content: 'Content',
        author: 'user_123',
        tags: ['test'],
        publishedAt: Date.now(),
        updatedAt: Date.now(),
        isPublished: true,
      };

      // Mock: Service returns deleted roadmap
      (roadmapService.delete as jest.Mock).mockResolvedValue(
        mockDeletedRoadmap,
      );

      // Delete roadmap as admin
      const result = await resolver.deleteRoadmap(mockId);

      // Verify result has id field (transformed from _id)
      expect(result).toHaveProperty('id', mockId);
      expect(result.slug).toBe('deleted-roadmap');

      // Verify service was called with correct ID
      expect(roadmapService.delete).toHaveBeenCalledTimes(1);
      expect(roadmapService.delete).toHaveBeenCalledWith(mockId);
    });

    /**
     * Test: Handle different ID formats
     * Validates: Requirements 7.5
     *
     * The resolver should correctly pass any valid ID format to the service.
     */
    it('should handle different ID formats', async () => {
      const testIds = ['roadmap_123', 'convex_id_abc', 'k1j2h3g4f5d6s7a8'];

      for (const testId of testIds) {
        const mockDeletedRoadmap: Roadmap = {
          _id: testId,
          slug: `test-${testId}`,
          title: 'Test Roadmap',
          description: 'Description',
          content: 'Content',
          author: 'user_123',
          tags: ['test'],
          publishedAt: Date.now(),
          updatedAt: Date.now(),
          isPublished: true,
        };

        // Mock: Service returns the deleted roadmap
        (roadmapService.delete as jest.Mock).mockResolvedValue(
          mockDeletedRoadmap,
        );

        // Delete roadmap
        const result = await resolver.deleteRoadmap(testId);

        // Verify result has id field
        expect(result).toHaveProperty('id', testId);
        expect(roadmapService.delete).toHaveBeenCalledWith(testId);
      }

      // Verify service was called for each ID
      expect(roadmapService.delete).toHaveBeenCalledTimes(testIds.length);
    });
  });

  describe('mutation authorization', () => {
    /**
     * Test: Mutations require authentication
     * Validates: Requirements 6.2, 6.3, 6.4, 8.1, 8.5
     *
     * All mutation operations (create, update, delete) are protected by
     * ClerkAuthGuard and RolesGuard. Without proper authentication and
     * authorization, these mutations should not execute.
     *
     * Note: This test verifies that the resolver expects authenticated user data.
     * The actual guard enforcement is tested in integration/e2e tests.
     */
    it('should expect authenticated user for createRoadmap', async () => {
      const mockInput = {
        slug: 'test',
        title: 'Test',
        description: 'Test',
        content: 'Test',
        tags: ['test'],
        isPublished: true,
      };

      const mockUser = {
        id: 'admin_user',
        role: 'admin',
      };

      const mockCreatedRoadmap: Roadmap = {
        _id: 'roadmap_id',
        ...mockInput,
        author: mockUser.id,
        publishedAt: Date.now(),
        updatedAt: Date.now(),
      };

      (roadmapService.create as jest.Mock).mockResolvedValue(
        mockCreatedRoadmap,
      );

      // Create roadmap requires user parameter
      await resolver.createRoadmap(mockInput, mockUser);

      // Verify service was called with user ID
      expect(roadmapService.create).toHaveBeenCalledWith(
        mockInput,
        'admin_user',
      );
    });

    /**
     * Test: Update and delete mutations work without user parameter
     * Validates: Requirements 7.4, 7.5
     *
     * Unlike createRoadmap, updateRoadmap and deleteRoadmap don't need
     * the user parameter since they don't track the modifier.
     * However, they still require admin role (enforced by guards).
     */
    it('should not require user parameter for updateRoadmap', async () => {
      const mockInput = {
        id: 'roadmap_id',
        title: 'Updated',
      };

      const mockUpdatedRoadmap: Roadmap = {
        _id: 'roadmap_id',
        slug: 'test-slug',
        title: 'Updated',
        description: 'Description',
        content: 'Content',
        author: 'user_123',
        tags: ['test'],
        publishedAt: Date.now(),
        updatedAt: Date.now(),
        isPublished: true,
      };

      (roadmapService.update as jest.Mock).mockResolvedValue(
        mockUpdatedRoadmap,
      );

      // Update roadmap doesn't require user parameter
      await resolver.updateRoadmap(mockInput);

      // Verify service was called
      expect(roadmapService.update).toHaveBeenCalledWith(mockInput);
    });

    it('should not require user parameter for deleteRoadmap', async () => {
      const mockId = 'roadmap_id';
      const mockDeletedRoadmap: Roadmap = {
        _id: mockId,
        slug: 'test-slug',
        title: 'Test',
        description: 'Description',
        content: 'Content',
        author: 'user_123',
        tags: ['test'],
        publishedAt: Date.now(),
        updatedAt: Date.now(),
        isPublished: true,
      };

      (roadmapService.delete as jest.Mock).mockResolvedValue(
        mockDeletedRoadmap,
      );

      // Delete roadmap doesn't require user parameter
      await resolver.deleteRoadmap(mockId);

      // Verify service was called
      expect(roadmapService.delete).toHaveBeenCalledWith(mockId);
    });
  });
});
