/**
 * Unit Tests for RoadmapService
 *
 * These tests verify specific behaviors of the RoadmapService methods,
 * including validation, error handling, and edge cases.
 *
 * Feature: user-role-based-access-control
 * Task: 12.1
 * Requirements: 7.2
 */

import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { RoadmapService } from '../../application/services/roadmap.service';
import { ConvexService } from '../../../../common/convex/convex.service';
import type {
  CreateRoadmapInput,
  Roadmap,
} from '../../domain/models/roadmap.model';

describe('RoadmapService', () => {
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

  describe('create', () => {
    const validInput: CreateRoadmapInput = {
      slug: 'test-roadmap',
      title: 'Test Roadmap',
      description: 'Test Description',
      content: 'Test Content',
      tags: ['test', 'example'],
      isPublished: true,
    };

    const authorId = 'user_123';

    /**
     * Test: Duplicate slug rejection
     * Validates: Requirements 7.2
     *
     * When attempting to create a roadmap with a slug that already exists,
     * the service should throw a BadRequestException.
     */
    it('should throw BadRequestException for duplicate slug', async () => {
      // Mock: Existing roadmap with the same slug
      const existingRoadmap: Roadmap = {
        _id: 'existing_id',
        slug: validInput.slug,
        title: 'Existing Roadmap',
        description: 'Existing Description',
        content: 'Existing Content',
        author: 'other_user',
        tags: ['existing'],
        publishedAt: Date.now(),
        updatedAt: Date.now(),
        isPublished: true,
      };

      (convexService.query as jest.Mock).mockResolvedValue(existingRoadmap);

      // Attempt to create roadmap with duplicate slug
      await expect(service.create(validInput, authorId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(validInput, authorId)).rejects.toThrow(
        `Roadmap với slug "${validInput.slug}" đã tồn tại`,
      );

      // Verify that findBySlug was called
      expect(convexService.query).toHaveBeenCalledWith('roadmaps:getBySlug', {
        slug: validInput.slug,
      });

      // Verify that mutation was NOT called
      expect(convexService.mutation).not.toHaveBeenCalled();
    });

    /**
     * Test: Empty tags array handling
     * Validates: Requirements 7.2
     *
     * When creating a roadmap with an empty tags array, the service should
     * successfully create the roadmap without errors.
     */
    it('should handle empty tags array', async () => {
      const inputWithEmptyTags: CreateRoadmapInput = {
        ...validInput,
        tags: [],
      };

      const mockId = 'roadmap_new_id';
      const mockRoadmap: Roadmap = {
        _id: mockId,
        ...inputWithEmptyTags,
        author: authorId,
        publishedAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Mock: No existing roadmap
      (convexService.query as jest.Mock).mockResolvedValueOnce(null);

      // Mock: Successful creation
      (convexService.mutation as jest.Mock).mockResolvedValueOnce(mockId);

      // Mock: Query returns created roadmap
      (convexService.query as jest.Mock).mockResolvedValueOnce(mockRoadmap);

      // Create roadmap with empty tags
      const result = await service.create(inputWithEmptyTags, authorId);

      // Verify result is full roadmap object
      expect(result).toEqual(mockRoadmap);
      expect(result._id).toBe(mockId);
      expect(result.tags).toEqual([]);

      // Verify mutation was called with empty tags array
      expect(convexService.mutation).toHaveBeenCalledWith('roadmaps:create', {
        ...inputWithEmptyTags,
        author: authorId,
      });
    });

    /**
     * Test: Author ID assignment
     * Validates: Requirements 7.2
     *
     * When creating a roadmap, the service should properly assign the
     * provided author ID to the roadmap data sent to Convex.
     */
    it('should assign author ID correctly', async () => {
      const mockId = 'roadmap_new_id';
      const testAuthorId = 'user_test_author';
      const mockRoadmap: Roadmap = {
        _id: mockId,
        ...validInput,
        author: testAuthorId,
        publishedAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Mock: No existing roadmap
      (convexService.query as jest.Mock).mockResolvedValueOnce(null);

      // Mock: Successful creation
      (convexService.mutation as jest.Mock).mockResolvedValueOnce(mockId);

      // Mock: Query returns created roadmap
      (convexService.query as jest.Mock).mockResolvedValueOnce(mockRoadmap);

      // Create roadmap
      const result = await service.create(validInput, testAuthorId);

      // Verify result is full roadmap object
      expect(result).toEqual(mockRoadmap);
      expect(result.author).toBe(testAuthorId);

      // Verify mutation was called with correct author ID
      expect(convexService.mutation).toHaveBeenCalledWith('roadmaps:create', {
        ...validInput,
        author: testAuthorId,
      });

      // Verify the author field matches the provided authorId
      const mutationCall = (convexService.mutation as jest.Mock).mock.calls[0];
      expect(mutationCall[1].author).toBe(testAuthorId);
    });

    /**
     * Test: Successful creation with valid input
     * Validates: Requirements 7.2
     *
     * When creating a roadmap with valid input and no duplicate slug,
     * the service should successfully create the roadmap and return its ID.
     */
    it('should successfully create roadmap with valid input', async () => {
      const mockId = 'roadmap_success_id';
      const mockRoadmap: Roadmap = {
        _id: mockId,
        ...validInput,
        author: authorId,
        publishedAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Mock: No existing roadmap
      (convexService.query as jest.Mock).mockResolvedValueOnce(null);

      // Mock: Successful creation
      (convexService.mutation as jest.Mock).mockResolvedValueOnce(mockId);

      // Mock: Query returns created roadmap
      (convexService.query as jest.Mock).mockResolvedValueOnce(mockRoadmap);

      // Create roadmap
      const result = await service.create(validInput, authorId);

      // Verify result is full roadmap object
      expect(result).toEqual(mockRoadmap);
      expect(result._id).toBe(mockId);

      // Verify query was called to check for duplicates
      expect(convexService.query).toHaveBeenCalledWith('roadmaps:getBySlug', {
        slug: validInput.slug,
      });

      // Verify mutation was called with correct data
      expect(convexService.mutation).toHaveBeenCalledWith('roadmaps:create', {
        ...validInput,
        author: authorId,
      });
    });

    /**
     * Test: Convex mutation failure handling
     * Validates: Requirements 7.2
     *
     * When Convex mutation fails, the service should throw an
     * InternalServerErrorException and log the error.
     */
    it('should throw InternalServerErrorException when Convex mutation fails', async () => {
      // Mock: No existing roadmap
      (convexService.query as jest.Mock).mockResolvedValue(null);

      // Mock: Mutation fails
      const convexError = new Error('Convex connection failed');
      (convexService.mutation as jest.Mock).mockRejectedValue(convexError);

      // Attempt to create roadmap
      await expect(service.create(validInput, authorId)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.create(validInput, authorId)).rejects.toThrow(
        'Failed to create roadmap',
      );
    });
  });

  describe('update', () => {
    const validUpdateInput = {
      id: 'roadmap_123',
      title: 'Updated Title',
      description: 'Updated Description',
    };

    /**
     * Test: Non-existent roadmap rejection
     * Validates: Requirements 7.4
     *
     * When attempting to update a roadmap that doesn't exist,
     * the service should throw a NotFoundException.
     */
    it('should throw NotFoundException for non-existent roadmap', async () => {
      // Mock: Convex mutation throws "Document not found" error
      const convexError = new Error('Document not found');
      (convexService.mutation as jest.Mock).mockRejectedValue(convexError);

      // Attempt to update non-existent roadmap
      await expect(service.update(validUpdateInput)).rejects.toThrow(
        NotFoundException,
      );
    });

    /**
     * Test: Partial updates
     * Validates: Requirements 7.4
     *
     * When updating a roadmap with only some fields, the service should
     * successfully update only those fields without requiring all fields.
     */
    it('should handle partial updates', async () => {
      const partialUpdateInput = {
        id: 'roadmap_456',
        title: 'New Title Only',
      };

      const mockId = 'roadmap_456';
      const mockRoadmap: Roadmap = {
        _id: mockId,
        slug: 'test-slug',
        title: 'New Title Only',
        description: 'Original Description',
        content: 'Original Content',
        author: 'user_123',
        tags: ['test'],
        publishedAt: Date.now(),
        updatedAt: Date.now(),
        isPublished: true,
      };

      // Mock: Successful update
      (convexService.mutation as jest.Mock).mockResolvedValue(mockId);

      // Mock: Query returns updated roadmap
      (convexService.query as jest.Mock).mockResolvedValue([mockRoadmap]);

      // Update roadmap with partial data
      const result = await service.update(partialUpdateInput);

      // Verify result is full roadmap object
      expect(result).toEqual(mockRoadmap);
      expect(result._id).toBe(mockId);
      expect(result.title).toBe('New Title Only');

      // Verify mutation was called with only the provided fields
      expect(convexService.mutation).toHaveBeenCalledWith(
        'roadmaps:update',
        partialUpdateInput,
      );

      // Verify only the title field was included
      const mutationCall = (convexService.mutation as jest.Mock).mock.calls[0];
      expect(mutationCall[1]).toEqual(partialUpdateInput);
      expect(mutationCall[1].description).toBeUndefined();
      expect(mutationCall[1].content).toBeUndefined();
    });

    /**
     * Test: UpdatedAt timestamp update
     * Validates: Requirements 7.4
     *
     * When updating a roadmap, the service should call the Convex mutation
     * which automatically updates the updatedAt timestamp.
     * This test verifies the mutation is called correctly.
     */
    it('should update updatedAt timestamp through Convex mutation', async () => {
      const updateInput = {
        id: 'roadmap_789',
        content: 'Updated content',
      };

      const mockId = 'roadmap_789';
      const mockRoadmap: Roadmap = {
        _id: mockId,
        slug: 'test-slug',
        title: 'Test Title',
        description: 'Test Description',
        content: 'Updated content',
        author: 'user_123',
        tags: ['test'],
        publishedAt: Date.now(),
        updatedAt: Date.now(),
        isPublished: true,
      };

      // Mock: Successful update
      (convexService.mutation as jest.Mock).mockResolvedValue(mockId);

      // Mock: Query returns updated roadmap
      (convexService.query as jest.Mock).mockResolvedValue([mockRoadmap]);

      // Update roadmap
      const result = await service.update(updateInput);

      // Verify result is full roadmap object
      expect(result).toEqual(mockRoadmap);
      expect(result.content).toBe('Updated content');

      // Verify mutation was called (Convex handles updatedAt automatically)
      expect(convexService.mutation).toHaveBeenCalledWith(
        'roadmaps:update',
        updateInput,
      );

      // Note: The actual updatedAt timestamp is managed by Convex backend,
      // not by the service layer. This test verifies the mutation is called
      // correctly, which triggers Convex to update the timestamp.
    });

    /**
     * Test: Successful update with multiple fields
     * Validates: Requirements 7.4
     *
     * When updating a roadmap with multiple fields, the service should
     * successfully update all provided fields.
     */
    it('should successfully update roadmap with multiple fields', async () => {
      const multiFieldUpdate = {
        id: 'roadmap_multi',
        title: 'New Title',
        description: 'New Description',
        content: 'New Content',
        tags: ['updated', 'tags'],
        isPublished: false,
      };

      const mockId = 'roadmap_multi';
      const mockRoadmap: Roadmap = {
        _id: mockId,
        slug: 'multi-slug',
        title: 'New Title',
        description: 'New Description',
        content: 'New Content',
        author: 'user_123',
        tags: ['updated', 'tags'],
        publishedAt: Date.now(),
        updatedAt: Date.now(),
        isPublished: false,
      };

      // Mock: Successful update
      (convexService.mutation as jest.Mock).mockResolvedValue(mockId);

      // Mock: Query returns updated roadmap
      (convexService.query as jest.Mock).mockResolvedValue([mockRoadmap]);

      // Update roadmap
      const result = await service.update(multiFieldUpdate);

      // Verify result is full roadmap object
      expect(result).toEqual(mockRoadmap);
      expect(result._id).toBe(mockId);

      // Verify mutation was called with all fields
      expect(convexService.mutation).toHaveBeenCalledWith(
        'roadmaps:update',
        multiFieldUpdate,
      );
    });

    /**
     * Test: Slug uniqueness validation during update
     * Validates: Requirements 7.4
     *
     * When updating a roadmap's slug to one that already exists,
     * the service should throw a BadRequestException.
     */
    it('should throw BadRequestException when updating to duplicate slug', async () => {
      const updateWithDuplicateSlug = {
        id: 'roadmap_update',
        slug: 'existing-slug',
      };

      // Mock: Existing roadmap with the same slug but different ID
      const existingRoadmap: Roadmap = {
        _id: 'different_roadmap_id',
        slug: 'existing-slug',
        title: 'Existing Roadmap',
        description: 'Existing Description',
        content: 'Existing Content',
        author: 'other_user',
        tags: ['existing'],
        publishedAt: Date.now(),
        updatedAt: Date.now(),
        isPublished: true,
      };

      (convexService.query as jest.Mock).mockResolvedValue(existingRoadmap);

      // Attempt to update with duplicate slug
      await expect(service.update(updateWithDuplicateSlug)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.update(updateWithDuplicateSlug)).rejects.toThrow(
        `Roadmap với slug "existing-slug" đã tồn tại`,
      );

      // Verify query was called to check for duplicates
      expect(convexService.query).toHaveBeenCalledWith('roadmaps:getBySlug', {
        slug: 'existing-slug',
      });

      // Verify mutation was NOT called
      expect(convexService.mutation).not.toHaveBeenCalled();
    });

    /**
     * Test: Slug update to same slug (no conflict)
     * Validates: Requirements 7.4
     *
     * When updating a roadmap's slug to its own current slug,
     * the service should allow the update without throwing an error.
     */
    it('should allow updating slug to the same value', async () => {
      const updateWithSameSlug = {
        id: 'roadmap_same',
        slug: 'same-slug',
        title: 'Updated Title',
      };

      // Mock: Existing roadmap with the same ID and slug
      const existingRoadmap: Roadmap = {
        _id: 'roadmap_same',
        slug: 'same-slug',
        title: 'Old Title',
        description: 'Description',
        content: 'Content',
        author: 'user_123',
        tags: ['test'],
        publishedAt: Date.now(),
        updatedAt: Date.now(),
        isPublished: true,
      };

      const updatedRoadmap: Roadmap = {
        ...existingRoadmap,
        title: 'Updated Title',
      };

      (convexService.query as jest.Mock).mockResolvedValueOnce(existingRoadmap);
      (convexService.mutation as jest.Mock).mockResolvedValue('roadmap_same');
      (convexService.query as jest.Mock).mockResolvedValueOnce(updatedRoadmap);

      // Update roadmap with same slug
      const result = await service.update(updateWithSameSlug);

      // Verify result is full roadmap object
      expect(result).toEqual(updatedRoadmap);
      expect(result.title).toBe('Updated Title');

      // Verify mutation was called
      expect(convexService.mutation).toHaveBeenCalledWith(
        'roadmaps:update',
        updateWithSameSlug,
      );
    });

    /**
     * Test: Convex mutation failure handling
     * Validates: Requirements 7.4
     *
     * When Convex mutation fails with a generic error, the service should
     * throw an InternalServerErrorException.
     */
    it('should throw InternalServerErrorException when Convex mutation fails', async () => {
      const updateInput = {
        id: 'roadmap_error',
        title: 'New Title',
      };

      // Mock: Mutation fails with generic error
      const convexError = new Error('Convex connection failed');
      (convexService.mutation as jest.Mock).mockRejectedValue(convexError);

      // Attempt to update roadmap
      await expect(service.update(updateInput)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.update(updateInput)).rejects.toThrow(
        'Failed to update roadmap',
      );
    });
  });

  describe('delete', () => {
    /**
     * Test: Non-existent roadmap handling
     * Validates: Requirements 7.5
     *
     * When attempting to delete a roadmap that doesn't exist,
     * the service should throw a NotFoundException with a clear message.
     */
    it('should throw NotFoundException for non-existent roadmap', async () => {
      const nonExistentId = 'roadmap_nonexistent';

      // Mock: Query returns empty array (roadmap not found in findById)
      (convexService.query as jest.Mock).mockResolvedValueOnce([]);

      // Attempt to delete non-existent roadmap
      await expect(service.delete(nonExistentId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.delete(nonExistentId)).rejects.toThrow(
        `Không tìm thấy roadmap với ID: ${nonExistentId}`,
      );

      // Verify query was called to find the roadmap
      expect(convexService.query).toHaveBeenCalledWith('roadmaps:list');

      // Verify mutation was NOT called
      expect(convexService.mutation).not.toHaveBeenCalled();
    });

    /**
     * Test: Successful deletion
     * Validates: Requirements 7.5
     *
     * When deleting an existing roadmap, the service should successfully
     * delete it and return the roadmap ID.
     */
    it('should successfully delete existing roadmap', async () => {
      const roadmapId = 'roadmap_to_delete';
      const mockRoadmap: Roadmap = {
        _id: roadmapId,
        slug: 'delete-test',
        title: 'To Delete',
        description: 'Description',
        content: 'Content',
        author: 'user_123',
        tags: ['test'],
        publishedAt: Date.now(),
        updatedAt: Date.now(),
        isPublished: true,
      };

      // Mock: Query returns roadmap before deletion
      (convexService.query as jest.Mock).mockResolvedValue([mockRoadmap]);

      // Mock: Successful deletion
      (convexService.mutation as jest.Mock).mockResolvedValue(roadmapId);

      // Delete roadmap
      const result = await service.delete(roadmapId);

      // Verify result is full roadmap object
      expect(result).toEqual(mockRoadmap);
      expect(result._id).toBe(roadmapId);

      // Verify mutation was called with correct parameters
      expect(convexService.mutation).toHaveBeenCalledWith('roadmaps:remove', {
        id: roadmapId,
      });
      expect(convexService.mutation).toHaveBeenCalledTimes(1);
    });

    /**
     * Test: Convex mutation failure handling
     * Validates: Requirements 7.5
     *
     * When Convex mutation fails with a generic error (not "Document not found"),
     * the service should throw an InternalServerErrorException.
     */
    it('should throw InternalServerErrorException when Convex mutation fails', async () => {
      const roadmapId = 'roadmap_error';
      const mockRoadmap: Roadmap = {
        _id: roadmapId,
        slug: 'test-slug',
        title: 'Test Roadmap',
        description: 'Test Description',
        content: 'Test Content',
        author: 'user_123',
        tags: ['test'],
        publishedAt: Date.now(),
        updatedAt: Date.now(),
        isPublished: true,
      };

      // Mock: Query returns roadmap for findById (before deletion)
      (convexService.query as jest.Mock).mockResolvedValue([mockRoadmap]);

      // Mock: Mutation fails with generic error
      const convexError = new Error('Convex connection failed');
      (convexService.mutation as jest.Mock).mockRejectedValue(convexError);

      // Attempt to delete roadmap
      await expect(service.delete(roadmapId)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.delete(roadmapId)).rejects.toThrow(
        'Failed to delete roadmap',
      );

      // Verify mutation was called
      expect(convexService.mutation).toHaveBeenCalledWith('roadmaps:remove', {
        id: roadmapId,
      });
    });

    /**
     * Test: Deletion with valid ID format
     * Validates: Requirements 7.5
     *
     * When deleting a roadmap with a valid Convex ID format,
     * the service should pass the ID correctly to the Convex mutation.
     */
    it('should handle deletion with valid Convex ID format', async () => {
      const validConvexId = 'jd7x8y9z0a1b2c3d4e5f6g7h';
      const mockRoadmap: Roadmap = {
        _id: validConvexId,
        slug: 'convex-id-test',
        title: 'Convex ID Test',
        description: 'Description',
        content: 'Content',
        author: 'user_123',
        tags: ['test'],
        publishedAt: Date.now(),
        updatedAt: Date.now(),
        isPublished: true,
      };

      // Mock: Query returns roadmap before deletion
      (convexService.query as jest.Mock).mockResolvedValue([mockRoadmap]);

      // Mock: Successful deletion
      (convexService.mutation as jest.Mock).mockResolvedValue(validConvexId);

      // Delete roadmap
      const result = await service.delete(validConvexId);

      // Verify result is full roadmap object
      expect(result).toEqual(mockRoadmap);
      expect(result._id).toBe(validConvexId);

      // Verify mutation was called with the exact ID
      expect(convexService.mutation).toHaveBeenCalledWith('roadmaps:remove', {
        id: validConvexId,
      });
    });
  });

  describe('findAll', () => {
    /**
     * Test: Return published roadmaps
     * Validates: Requirements 4.1, 4.2, 4.3, 4.4
     *
     * When calling findAll, the service should return all published roadmaps
     * from the Convex database.
     */
    it('should return all published roadmaps', async () => {
      const mockRoadmaps: Roadmap[] = [
        {
          _id: 'roadmap_1',
          slug: 'frontend-roadmap',
          title: 'Frontend Developer Roadmap',
          description: 'Complete guide to frontend development',
          content: 'Detailed content here...',
          author: 'user_123',
          tags: ['frontend', 'javascript'],
          publishedAt: Date.now(),
          updatedAt: Date.now(),
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
          publishedAt: Date.now(),
          updatedAt: Date.now(),
          isPublished: true,
        },
      ];

      // Mock: Successful query
      (convexService.query as jest.Mock).mockResolvedValue(mockRoadmaps);

      // Fetch all roadmaps
      const result = await service.findAll();

      // Verify result
      expect(result).toEqual(mockRoadmaps);
      expect(result).toHaveLength(2);

      // Verify query was called with correct parameters
      expect(convexService.query).toHaveBeenCalledWith('roadmaps:list');
      expect(convexService.query).toHaveBeenCalledTimes(1);
    });

    /**
     * Test: Return empty array when no roadmaps exist
     * Validates: Requirements 4.1, 4.2, 4.3, 4.4
     *
     * When no published roadmaps exist, the service should return an empty array
     * without throwing an error.
     */
    it('should return empty array when no roadmaps exist', async () => {
      // Mock: Empty result
      (convexService.query as jest.Mock).mockResolvedValue([]);

      // Fetch all roadmaps
      const result = await service.findAll();

      // Verify result
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);

      // Verify query was called
      expect(convexService.query).toHaveBeenCalledWith('roadmaps:list');
    });

    /**
     * Test: Convex query failure handling
     * Validates: Requirements 4.1, 4.2, 4.3, 4.4
     *
     * When Convex query fails, the service should throw an
     * InternalServerErrorException with a clear message.
     */
    it('should throw InternalServerErrorException when Convex query fails', async () => {
      // Mock: Query fails
      const convexError = new Error('Convex connection failed');
      (convexService.query as jest.Mock).mockRejectedValue(convexError);

      // Attempt to fetch roadmaps
      await expect(service.findAll()).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.findAll()).rejects.toThrow(
        'Failed to fetch roadmaps',
      );

      // Verify query was called
      expect(convexService.query).toHaveBeenCalledWith('roadmaps:list');
    });
  });

  describe('findBySlug', () => {
    const testSlug = 'test-roadmap';

    /**
     * Test: Return roadmap when slug exists
     * Validates: Requirements 4.1, 4.2, 4.3, 4.4
     *
     * When calling findBySlug with an existing slug, the service should
     * return the matching roadmap.
     */
    it('should return roadmap when slug exists', async () => {
      const mockRoadmap: Roadmap = {
        _id: 'roadmap_123',
        slug: testSlug,
        title: 'Test Roadmap',
        description: 'Test Description',
        content: 'Test Content',
        author: 'user_123',
        tags: ['test'],
        publishedAt: Date.now(),
        updatedAt: Date.now(),
        isPublished: true,
      };

      // Mock: Successful query
      (convexService.query as jest.Mock).mockResolvedValue(mockRoadmap);

      // Fetch roadmap by slug
      const result = await service.findBySlug(testSlug);

      // Verify result
      expect(result).toEqual(mockRoadmap);
      expect(result?.slug).toBe(testSlug);

      // Verify query was called with correct parameters
      expect(convexService.query).toHaveBeenCalledWith('roadmaps:getBySlug', {
        slug: testSlug,
      });
      expect(convexService.query).toHaveBeenCalledTimes(1);
    });

    /**
     * Test: Return null when slug does not exist
     * Validates: Requirements 4.1, 4.2, 4.3, 4.4
     *
     * When calling findBySlug with a non-existing slug, the service should
     * return null without throwing an error.
     */
    it('should return null when slug does not exist', async () => {
      const nonExistentSlug = 'non-existent-roadmap';

      // Mock: No roadmap found
      (convexService.query as jest.Mock).mockResolvedValue(null);

      // Fetch roadmap by slug
      const result = await service.findBySlug(nonExistentSlug);

      // Verify result
      expect(result).toBeNull();

      // Verify query was called with correct parameters
      expect(convexService.query).toHaveBeenCalledWith('roadmaps:getBySlug', {
        slug: nonExistentSlug,
      });
    });

    /**
     * Test: Handle special characters in slug
     * Validates: Requirements 4.1, 4.2, 4.3, 4.4
     *
     * When calling findBySlug with a slug containing special characters,
     * the service should pass it correctly to Convex.
     */
    it('should handle special characters in slug', async () => {
      const specialSlug = 'test-roadmap-2024';

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

      // Mock: Successful query
      (convexService.query as jest.Mock).mockResolvedValue(mockRoadmap);

      // Fetch roadmap by slug
      const result = await service.findBySlug(specialSlug);

      // Verify result
      expect(result).toEqual(mockRoadmap);
      expect(result?.slug).toBe(specialSlug);

      // Verify query was called with the exact slug
      expect(convexService.query).toHaveBeenCalledWith('roadmaps:getBySlug', {
        slug: specialSlug,
      });
    });

    /**
     * Test: Convex query failure handling
     * Validates: Requirements 4.1, 4.2, 4.3, 4.4
     *
     * When Convex query fails, the service should throw an
     * InternalServerErrorException with a clear message.
     */
    it('should throw InternalServerErrorException when Convex query fails', async () => {
      // Mock: Query fails
      const convexError = new Error('Convex connection failed');
      (convexService.query as jest.Mock).mockRejectedValue(convexError);

      // Attempt to fetch roadmap
      await expect(service.findBySlug(testSlug)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.findBySlug(testSlug)).rejects.toThrow(
        'Failed to fetch roadmap',
      );

      // Verify query was called
      expect(convexService.query).toHaveBeenCalledWith('roadmaps:getBySlug', {
        slug: testSlug,
      });
    });
  });
});
