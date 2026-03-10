import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConvexService } from '../../../../common/convex/convex.service';
import type {
  Roadmap,
  CreateRoadmapInput,
  UpdateRoadmapInput,
} from '../../domain/models/roadmap.model';

/**
 * RoadmapService - Application service for roadmap CRUD operations
 *
 * This service provides business logic for managing roadmaps, including:
 * - Querying roadmaps (findAll, findBySlug)
 * - Creating new roadmaps with duplicate slug validation
 * - Updating existing roadmaps with existence validation
 * - Deleting roadmaps with existence validation
 *
 * All operations include comprehensive error logging for debugging and security auditing.
 *
 * Requirements: 4.1, 4.2, 4.3, 4.4, 7.2, 7.3, 7.4, 7.5, 10.4
 */
@Injectable()
export class RoadmapService {
  private readonly logger = new Logger(RoadmapService.name);

  constructor(private readonly convexService: ConvexService) {}

  /**
   * Find all published roadmaps
   *
   * Returns all roadmaps that have isPublished=true, ordered by publishedAt descending.
   * This is a public operation accessible to all users (Guest, User, Admin).
   *
   * @returns Promise<Roadmap[]> Array of published roadmaps
   * @throws InternalServerErrorException if Convex query fails
   *
   * Requirements: 4.1, 4.2, 4.3, 4.4
   */
  async findAll(): Promise<Roadmap[]> {
    this.logger.log('Fetching all published roadmaps');

    try {
      const roadmaps =
        await this.convexService.query<Roadmap[]>('roadmaps:list');

      if (!roadmaps) {
        this.logger.log('No roadmaps found (null/undefined response)');
        return [];
      }

      if (!Array.isArray(roadmaps)) {
        this.logger.warn(
          'Convex returned non-array response for roadmaps:list',
        );
        return [];
      }

      this.logger.log(`Successfully fetched ${roadmaps.length} roadmaps`);
      return roadmaps;
    } catch (error) {
      this.logger.error(
        'Failed to fetch roadmaps',
        error instanceof Error ? error.stack : error,
      );
      throw new InternalServerErrorException('Failed to fetch roadmaps');
    }
  }

  /**
   * Find all roadmaps including drafts (admin only)
   *
   * Returns all roadmaps regardless of publication status, ordered by updatedAt descending.
   * This is an admin-only operation used for the admin dashboard.
   *
   * @returns Promise<Roadmap[]> Array of all roadmaps (published and drafts)
   * @throws InternalServerErrorException if Convex query fails
   */
  async findAllForAdmin(): Promise<Roadmap[]> {
    this.logger.log('Fetching all roadmaps for admin (including drafts)');

    try {
      const roadmaps =
        await this.convexService.query<Roadmap[]>('roadmaps:listAll');

      if (!roadmaps) {
        this.logger.log('No roadmaps found (null/undefined response)');
        return [];
      }

      if (!Array.isArray(roadmaps)) {
        this.logger.warn(
          'Convex returned non-array response for roadmaps:listAll',
        );
        return [];
      }

      this.logger.log(
        `Successfully fetched ${roadmaps.length} roadmaps for admin`,
      );
      return roadmaps;
    } catch (error) {
      this.logger.error(
        'Failed to fetch roadmaps for admin',
        error instanceof Error ? error.stack : error,
      );
      throw new InternalServerErrorException(
        'Failed to fetch roadmaps for admin',
      );
    }
  }

  /**
   * Find a roadmap by its slug
   *
   * Returns a single roadmap matching the provided slug, or null if not found.
   * This is a public operation accessible to all users (Guest, User, Admin).
   *
   * @param slug - URL-friendly identifier for the roadmap
   * @returns Promise<Roadmap | null> The roadmap if found, null otherwise
   * @throws InternalServerErrorException if Convex query fails
   *
   * Requirements: 4.1, 4.2, 4.3, 4.4
   */
  async findBySlug(slug: string): Promise<Roadmap | null> {
    this.logger.log(`Fetching roadmap by slug: ${slug}`);

    try {
      const roadmap = await this.convexService.query<Roadmap | null>(
        'roadmaps:getBySlug',
        { slug },
      );

      if (roadmap) {
        this.logger.log(`Successfully fetched roadmap: ${slug}`);
      } else {
        this.logger.log(`Roadmap not found: ${slug}`);
      }

      return roadmap;
    } catch (error) {
      this.logger.error(
        `Failed to fetch roadmap by slug: ${slug}`,
        error instanceof Error ? error.stack : error,
      );
      throw new InternalServerErrorException('Failed to fetch roadmap');
    }
  }

  /**
   * Create a new roadmap
   *
   * Creates a new roadmap with the provided input data and author ID.
   * Validates that the slug is unique before creating.
   * Fetches author name from Clerk for display purposes.
   * Only accessible to Admin users (enforced by resolver guards).
   *
   * @param input - CreateRoadmapInput containing roadmap data
   * @param authorId - Clerk user ID of the creator (extracted from JWT)
   * @returns Promise<Roadmap> The created roadmap with full data
   * @throws BadRequestException if slug already exists
   * @throws InternalServerErrorException if Convex mutation fails
   *
   * Requirements: 7.2, 10.4
   */
  async create(input: CreateRoadmapInput, authorId: string): Promise<Roadmap> {
    this.logger.log(`Creating roadmap: ${input.slug} by user: ${authorId}`);

    try {
      // Validate: Check for duplicate slug
      const existing = await this.findBySlug(input.slug);
      if (existing) {
        this.logger.warn(`Duplicate slug detected: ${input.slug}`);
        throw new BadRequestException(
          `Roadmap với slug "${input.slug}" đã tồn tại`,
        );
      }

      // Fetch author name from Clerk - temporarily disabled for debugging
      // const authorInfo = await this.clerkService.getUserById(authorId);
      // const authorName = authorInfo?.name || `User ${authorId.slice(-8)}`;
      // const authorName = `User ${authorId.slice(-8)}`; // Temporary fallback

      // Create roadmap in Convex - temporarily without authorName
      const roadmapId = await this.convexService.mutation<string>(
        'roadmaps:create',
        {
          ...input,
          author: authorId,
          // authorName, // Temporarily disabled until schema is deployed
        },
      );

      this.logger.log(
        `Successfully created roadmap: ${roadmapId} with slug: ${input.slug}`,
      );

      // Fetch and return the created roadmap
      const createdRoadmap = await this.findBySlug(input.slug);
      if (!createdRoadmap) {
        throw new InternalServerErrorException(
          'Failed to fetch created roadmap',
        );
      }

      return createdRoadmap;
    } catch (error) {
      // Re-throw BadRequestException as-is
      if (error instanceof BadRequestException) {
        throw error;
      }

      // Log and wrap other errors
      this.logger.error(
        `Failed to create roadmap: ${input.slug}`,
        error instanceof Error ? error.stack : error,
      );
      throw new InternalServerErrorException('Failed to create roadmap');
    }
  }

  /**
   * Update an existing roadmap
   *
   * Updates a roadmap with the provided input data.
   * Validates that the roadmap exists before updating.
   * If slug is being changed, validates that the new slug is unique.
   * Only accessible to Admin users (enforced by resolver guards).
   *
   * @param input - UpdateRoadmapInput containing roadmap ID and fields to update
   * @returns Promise<Roadmap> The updated roadmap with full data
   * @throws NotFoundException if roadmap with given ID does not exist
   * @throws BadRequestException if new slug already exists
   * @throws InternalServerErrorException if Convex mutation fails
   *
   * Requirements: 7.4, 10.4
   */
  async update(input: UpdateRoadmapInput): Promise<Roadmap> {
    this.logger.log(`Updating roadmap: ${input.id}`);

    try {
      // Validate: If slug is being changed, check for duplicates
      if (input.slug) {
        const existing = await this.findBySlug(input.slug);
        if (existing && existing._id !== input.id) {
          this.logger.warn(
            `Duplicate slug detected during update: ${input.slug}`,
          );
          throw new BadRequestException(
            `Roadmap với slug "${input.slug}" đã tồn tại`,
          );
        }
      }

      // Update roadmap in Convex
      await this.convexService.mutation<string>(
        'roadmaps:update',
        input as unknown as Record<string, unknown>,
      );

      this.logger.log(`Successfully updated roadmap: ${input.id}`);

      // Fetch and return the updated roadmap
      // If slug was updated, use the new slug, otherwise fetch by ID
      const updatedRoadmap = input.slug
        ? await this.findBySlug(input.slug)
        : await this.findById(input.id);

      if (!updatedRoadmap) {
        throw new NotFoundException(
          `Không tìm thấy roadmap với ID: ${input.id}`,
        );
      }

      return updatedRoadmap;
    } catch (error) {
      // Re-throw known exceptions as-is
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      // Check if error is due to non-existent ID (Convex will throw an error)
      if (
        error instanceof Error &&
        error.message.includes('Document not found')
      ) {
        this.logger.warn(`Roadmap not found for update: ${input.id}`);
        throw new NotFoundException(
          `Không tìm thấy roadmap với ID: ${input.id}`,
        );
      }

      // Log and wrap other errors
      this.logger.error(
        `Failed to update roadmap: ${input.id}`,
        error instanceof Error ? error.stack : error,
      );
      throw new InternalServerErrorException('Failed to update roadmap');
    }
  }

  /**
   * Find a roadmap by its ID
   *
   * Helper method to fetch a roadmap by its Convex document ID.
   *
   * @param id - Convex document ID
   * @returns Promise<Roadmap | null> The roadmap if found, null otherwise
   */
  private async findById(id: string): Promise<Roadmap | null> {
    try {
      // Use findAllForAdmin to get all roadmaps (including drafts) for admin operations
      const roadmaps = await this.findAllForAdmin();
      return roadmaps.find((r) => r._id === id) || null;
    } catch (error) {
      this.logger.error(
        `Failed to fetch roadmap by ID: ${id}`,
        error instanceof Error ? error.stack : error,
      );
      return null;
    }
  }

  /**
   * Delete a roadmap
   *
   * Deletes a roadmap with the provided ID.
   * Validates that the roadmap exists before deleting.
   * Only accessible to Admin users (enforced by resolver guards).
   *
   * @param id - Unique identifier of the roadmap to delete
   * @returns Promise<Roadmap> The deleted roadmap with full data
   * @throws NotFoundException if roadmap with given ID does not exist
   * @throws InternalServerErrorException if Convex mutation fails
   *
   * Requirements: 7.5, 10.4
   */
  async delete(id: string): Promise<Roadmap> {
    this.logger.log(`Deleting roadmap: ${id}`);

    try {
      // Fetch roadmap before deleting to return it
      const roadmap = await this.findById(id);
      if (!roadmap) {
        this.logger.warn(`Roadmap not found for deletion: ${id}`);
        throw new NotFoundException(`Không tìm thấy roadmap với ID: ${id}`);
      }

      // Delete roadmap in Convex
      await this.convexService.mutation<string>('roadmaps:remove', { id });

      this.logger.log(`Successfully deleted roadmap: ${id}`);
      return roadmap;
    } catch (error) {
      // Re-throw NotFoundException as-is
      if (error instanceof NotFoundException) {
        throw error;
      }

      // Check if error is due to non-existent ID (Convex will throw an error)
      if (
        error instanceof Error &&
        error.message.includes('Document not found')
      ) {
        this.logger.warn(`Roadmap not found for deletion: ${id}`);
        throw new NotFoundException(`Không tìm thấy roadmap với ID: ${id}`);
      }

      // Log and wrap other errors
      this.logger.error(
        `Failed to delete roadmap: ${id}`,
        error instanceof Error ? error.stack : error,
      );
      throw new InternalServerErrorException('Failed to delete roadmap');
    }
  }
}
