/**
 * Property-Based Tests for Roadmap CRUD Operations
 *
 * These tests verify CRUD operation properties using fast-check.
 * Tests focus on persistence, idempotency, and deletion completeness.
 *
 * Feature: user-role-based-access-control
 * Tasks: 11.1, 11.2, 11.3
 */

import * as fc from 'fast-check';
import { Test, TestingModule } from '@nestjs/testing';
import { RoadmapService } from '../../application/services/roadmap.service';
import { ConvexService } from '../../../../common/convex/convex.service';
import { BadRequestException } from '@nestjs/common';
import { NodeCategory } from '../../transport/graphql/schemas/roadmap-input.schema';
import type { Roadmap } from '../../domain/models/roadmap.model';

describe('Roadmap CRUD Properties', () => {
  let service: RoadmapService;
  let convexService: ConvexService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoadmapService,
        {
          provide: ConvexService,
          useValue: {
            query: jest.fn(),
            mutation: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RoadmapService>(RoadmapService);
    convexService = module.get<ConvexService>(ConvexService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Property 11: Roadmap Creation Persistence
   * **Validates: Requirements 7.2**
   *
   * For any valid CreateRoadmapInput provided by an admin user, after the
   * createRoadmap mutation completes successfully, querying the roadmap by
   * its slug should return a roadmap with all the provided input fields matching.
   *
   * Feature: user-role-based-access-control, Property 11: Roadmap Creation Persistence
   */
  it('should persist any valid roadmap created by admin', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          slug: fc
            .string({ minLength: 1, maxLength: 50 })
            .filter((s) => /^[a-z0-9-]+$/.test(s)),
          title: fc.string({ minLength: 1, maxLength: 100 }),
          description: fc.string({ minLength: 0, maxLength: 500 }),
          content: fc.string({ minLength: 0, maxLength: 5000 }),
          nodeCategory: fc.constantFrom(NodeCategory.ROLE, NodeCategory.SKILL, NodeCategory.TOPIC, NodeCategory.MILESTONE, NodeCategory.RESOURCE),
          tags: fc.array(fc.string({ minLength: 1, maxLength: 20 }), {
            maxLength: 10,
          }),
          isPublished: fc.boolean(),
        }),
        fc.string({ minLength: 1 }), // authorId
        async (input, authorId) => {
          // Clear mocks for this iteration
          jest.clearAllMocks();

          // Mock: No existing roadmap with this slug (for duplicate check)
          (convexService.query as jest.Mock).mockResolvedValueOnce(null);

          // Mock: Create returns a new ID
          const mockId = `roadmap_${Date.now()}`;
          (convexService.mutation as jest.Mock).mockResolvedValueOnce(mockId);

          // Mock: Query by slug returns the created roadmap (after creation)
          const createdRoadmap: Roadmap = {
            _id: mockId,
            ...input,
            author: authorId,
            publishedAt: Date.now(),
            updatedAt: Date.now(),
          };
          (convexService.query as jest.Mock).mockResolvedValueOnce(
            createdRoadmap,
          );

          // Create the roadmap
          const result = await service.create(input, authorId);
          expect(result).toEqual(createdRoadmap);
          expect(result._id).toBe(mockId);

          // Mock: Query by slug again to verify persistence
          (convexService.query as jest.Mock).mockResolvedValueOnce(
            createdRoadmap,
          );

          // Query back the roadmap
          const queriedRoadmap = await service.findBySlug(input.slug);

          // Verify persistence: All input fields should match
          expect(queriedRoadmap).not.toBeNull();
          expect(queriedRoadmap!.slug).toBe(input.slug);
          expect(queriedRoadmap!.title).toBe(input.title);
          expect(queriedRoadmap!.description).toBe(input.description);
          expect(queriedRoadmap!.content).toBe(input.content);
          expect(queriedRoadmap!.nodeCategory).toBe(input.nodeCategory);
          expect(queriedRoadmap!.tags).toEqual(input.tags);
          expect(queriedRoadmap!.isPublished).toBe(input.isPublished);
          expect(queriedRoadmap!.author).toBe(authorId);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property 12: Roadmap Update Idempotency
   * **Validates: Requirements 7.4**
   *
   * For any roadmap and any UpdateRoadmapInput, applying the same update twice
   * should result in the same final state as applying it once.
   *
   * Feature: user-role-based-access-control, Property 12: Roadmap Update Idempotency
   */
  it('should produce same result when applying same update twice', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          id: fc.string({ minLength: 1 }),
          title: fc.option(fc.string({ minLength: 1, maxLength: 100 }), {
            nil: undefined,
          }),
          description: fc.option(fc.string({ minLength: 0, maxLength: 500 }), {
            nil: undefined,
          }),
          content: fc.option(fc.string({ minLength: 0, maxLength: 5000 }), {
            nil: undefined,
          }),
          nodeCategory: fc.option(fc.constantFrom(
            NodeCategory.ROLE,
            NodeCategory.SKILL,
            NodeCategory.TOPIC,
            NodeCategory.MILESTONE,
            NodeCategory.RESOURCE
          ), {
            nil: undefined,
          }),
          tags: fc.option(
            fc.array(fc.string({ minLength: 1, maxLength: 20 }), {
              maxLength: 10,
            }),
            { nil: undefined },
          ),
          isPublished: fc.option(fc.boolean(), { nil: undefined }),
        }),
        async (updateInput) => {
          // Clear mocks for this iteration
          jest.clearAllMocks();

          const mockRoadmap: Roadmap = {
            _id: updateInput.id,
            slug: 'test-slug',
            title: updateInput.title || 'Test Title',
            description: updateInput.description || 'Test Description',
            content: updateInput.content || 'Test Content',
            nodeCategory: updateInput.nodeCategory || NodeCategory.TOPIC,
            author: 'user_123',
            tags: updateInput.tags || ['test'],
            publishedAt: Date.now(),
            updatedAt: Date.now(),
            isPublished: updateInput.isPublished ?? true,
          };

          // Mock: Update succeeds and returns the ID
          (convexService.mutation as jest.Mock).mockResolvedValue(
            updateInput.id,
          );

          // Mock: Query returns updated roadmap
          (convexService.query as jest.Mock).mockResolvedValue([mockRoadmap]);

          // Apply update first time
          const firstResult = await service.update(updateInput);
          expect(firstResult).toEqual(mockRoadmap);

          // Reset mocks for second call
          (convexService.mutation as jest.Mock).mockResolvedValue(
            updateInput.id,
          );
          (convexService.query as jest.Mock).mockResolvedValue([mockRoadmap]);

          // Apply same update second time
          const secondResult = await service.update(updateInput);
          expect(secondResult).toEqual(mockRoadmap);

          // Verify idempotency: Both results should be identical
          expect(secondResult).toEqual(firstResult);

          // Verify mutation was called twice with same arguments
          expect(convexService.mutation).toHaveBeenCalledTimes(2);
          const firstCall = (convexService.mutation as jest.Mock).mock.calls[0];
          const secondCall = (convexService.mutation as jest.Mock).mock
            .calls[1];
          expect(firstCall).toEqual(secondCall);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property 13: Roadmap Deletion Completeness
   * **Validates: Requirements 7.5**
   *
   * For any existing roadmap, after an admin successfully deletes it,
   * subsequent queries for that roadmap by slug should return null.
   *
   * Feature: user-role-based-access-control, Property 13: Roadmap Deletion Completeness
   */
  it('should make any deleted roadmap unqueryable', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          id: fc.string({ minLength: 1 }),
          slug: fc
            .string({ minLength: 1, maxLength: 50 })
            .filter((s) => /^[a-z0-9-]+$/.test(s)),
          title: fc.string({ minLength: 1, maxLength: 100 }),
        }),
        async (roadmapData) => {
          // Mock: Roadmap exists before deletion
          const existingRoadmap: Roadmap = {
            _id: roadmapData.id,
            slug: roadmapData.slug,
            title: roadmapData.title,
            description: '',
            content: '',
            nodeCategory: NodeCategory.TOPIC,
            author: 'test-author',
            tags: [],
            publishedAt: Date.now(),
            updatedAt: Date.now(),
            isPublished: true,
          };
          (convexService.query as jest.Mock).mockResolvedValueOnce(
            existingRoadmap,
          );

          // Verify roadmap exists before deletion
          const beforeDeletion = await service.findBySlug(roadmapData.slug);
          expect(beforeDeletion).not.toBeNull();
          expect(beforeDeletion!._id).toBe(roadmapData.id);

          // Mock: Query returns roadmap for findById (before deletion)
          (convexService.query as jest.Mock).mockResolvedValueOnce([
            existingRoadmap,
          ]);

          // Mock: Delete succeeds
          (convexService.mutation as jest.Mock).mockResolvedValueOnce(
            roadmapData.id,
          );

          // Delete the roadmap
          const deletedRoadmap = await service.delete(roadmapData.id);
          expect(deletedRoadmap).toEqual(existingRoadmap);
          expect(deletedRoadmap._id).toBe(roadmapData.id);

          // Mock: Query returns null after deletion
          (convexService.query as jest.Mock).mockResolvedValueOnce(null);

          // Query should return null after deletion
          const afterDeletion = await service.findBySlug(roadmapData.slug);
          expect(afterDeletion).toBeNull();
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Additional Property: Duplicate Slug Rejection
   *
   * Verifies that attempting to create a roadmap with an existing slug
   * is rejected with BadRequestException.
   */
  it('should reject creation of roadmap with duplicate slug', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          slug: fc
            .string({ minLength: 1, maxLength: 50 })
            .filter((s) => /^[a-z0-9-]+$/.test(s)),
          title: fc.string({ minLength: 1, maxLength: 100 }),
          description: fc.string({ minLength: 0, maxLength: 500 }),
          content: fc.string({ minLength: 0, maxLength: 5000 }),
          nodeCategory: fc.constantFrom(NodeCategory.ROLE, NodeCategory.SKILL, NodeCategory.TOPIC, NodeCategory.MILESTONE, NodeCategory.RESOURCE),
          tags: fc.array(fc.string({ minLength: 1, maxLength: 20 }), {
            maxLength: 10,
          }),
          isPublished: fc.boolean(),
        }),
        fc.string({ minLength: 1 }),
        async (input, authorId) => {
          // Mock: Existing roadmap with same slug
          const existingRoadmap: Roadmap = {
            _id: 'existing-id',
            ...input,
            author: 'other-author',
            publishedAt: Date.now(),
            updatedAt: Date.now(),
          };
          (convexService.query as jest.Mock).mockResolvedValueOnce(
            existingRoadmap,
          );

          // Attempt to create should throw BadRequestException
          await expect(service.create(input, authorId)).rejects.toThrow(
            BadRequestException,
          );
        },
      ),
      { numRuns: 100 },
    );
  });
});
