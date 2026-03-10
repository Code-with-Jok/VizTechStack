import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { RoadmapSchema } from '../schemas/roadmap.schema';
import {
  CreateRoadmapInput,
  UpdateRoadmapInput,
} from '../schemas/roadmap-input.schema';
import { RoadmapService } from '../../../application/services/roadmap.service';
import { ClerkAuthGuard } from '../../../../../common/guards/clerk-auth.guard';
import { RolesGuard } from '../../../../../common/guards/roles.guard';
import { Roles } from '../../../../../common/decorators/roles.decorator';
import { Public } from '../../../../../common/decorators/public.decorator';
import { CurrentUser } from '../../../../../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../../../../../common/decorators/current-user.decorator';

/**
 * RoadmapResolver - GraphQL resolver for roadmap queries and mutations
 *
 * This resolver provides GraphQL endpoints for roadmap CRUD operations with
 * role-based access control:
 *
 * Public Operations (Guest, User, Admin):
 * - roadmaps: Query all published roadmaps
 * - roadmap: Query a single roadmap by slug
 *
 * Admin-Only Operations:
 * - createRoadmap: Create a new roadmap
 * - updateRoadmap: Update an existing roadmap
 * - deleteRoadmap: Delete a roadmap
 *
 * Authorization Flow:
 * 1. ClerkAuthGuard verifies JWT token and extracts user info (unless @Public)
 * 2. RolesGuard checks if user has required role (unless @Public)
 * 3. Resolver executes the operation
 *
 * Requirements: 1.3, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 6.1, 6.2, 6.3, 6.4,
 *               7.2, 7.3, 7.4, 7.5, 8.1, 8.2, 8.3, 8.4, 8.5
 */
@Resolver(() => RoadmapSchema)
@UseGuards(ClerkAuthGuard, RolesGuard)
export class RoadmapResolver {
  constructor(private readonly roadmapService: RoadmapService) {}

  /**
   * Query all published roadmaps
   *
   * Public endpoint accessible to all users (Guest, User, Admin).
   * Returns all roadmaps with isPublished=true.
   *
   * @returns Promise<RoadmapSchema[]> Array of published roadmaps
   *
   * Requirements: 1.3, 4.1, 4.2, 4.3, 4.4, 5.1, 6.1
   */
  @Query(() => [RoadmapSchema])
  @Public()
  async roadmaps(): Promise<RoadmapSchema[]> {
    const roadmaps = await this.roadmapService.findAll();

    if (!roadmaps || !Array.isArray(roadmaps)) {
      return [];
    }

    return roadmaps.map((roadmap) => ({
      ...roadmap,
      id: roadmap._id,
      content: roadmap.content || '',
      author: roadmap.author || '',
      title: roadmap.title || '',
      description: roadmap.description || '',
      tags: roadmap.tags || [],
      publishedAt: roadmap.publishedAt || 0,
      updatedAt: roadmap.updatedAt || 0,
      isPublished: roadmap.isPublished || false,
    }));
  }

  /**
   * Query all roadmaps including drafts (admin only)
   *
   * Admin-only endpoint that returns all roadmaps regardless of publication status.
   * Used for admin dashboard to manage both published and draft roadmaps.
   *
   * Authorization:
   * - Requires valid JWT token (ClerkAuthGuard)
   * - Requires 'admin' role (RolesGuard)
   *
   * @returns Promise<RoadmapSchema[]> Array of all roadmaps (published and drafts)
   * @throws UnauthorizedException if JWT token is invalid (401)
   * @throws ForbiddenException if user is not admin (403)
   */
  @Query(() => [RoadmapSchema])
  @Roles('admin')
  async roadmapsForAdmin(): Promise<RoadmapSchema[]> {
    const roadmaps = await this.roadmapService.findAllForAdmin();

    if (!roadmaps || !Array.isArray(roadmaps)) {
      return [];
    }

    return roadmaps.map((roadmap) => ({
      ...roadmap,
      id: roadmap._id,
      content: roadmap.content || '',
      author: roadmap.author || '',
      title: roadmap.title || '',
      description: roadmap.description || '',
      tags: roadmap.tags || [],
      publishedAt: roadmap.publishedAt || 0,
      updatedAt: roadmap.updatedAt || 0,
      isPublished: roadmap.isPublished || false,
    }));
  }

  /**
   * Query a single roadmap by slug
   *
   * Public endpoint accessible to all users (Guest, User, Admin).
   * Returns the roadmap matching the provided slug, or null if not found.
   *
   * @param slug - URL-friendly identifier for the roadmap
   * @returns Promise<RoadmapSchema | null> The roadmap if found, null otherwise
   *
   * Requirements: 1.3, 4.1, 4.2, 4.3, 4.4, 5.1, 6.1
   */
  @Query(() => RoadmapSchema, { nullable: true })
  @Public()
  async roadmap(@Args('slug') slug: string): Promise<RoadmapSchema | null> {
    const roadmap = await this.roadmapService.findBySlug(slug);
    if (!roadmap) {
      return null;
    }
    return {
      ...roadmap,
      id: roadmap._id,
      content: roadmap.content || '',
      author: roadmap.author || '',
      title: roadmap.title || '',
      description: roadmap.description || '',
      tags: roadmap.tags || [],
      publishedAt: roadmap.publishedAt || 0,
      updatedAt: roadmap.updatedAt || 0,
      isPublished: roadmap.isPublished || false,
    };
  }

  /**
   * Create a new roadmap
   *
   * Admin-only mutation. Creates a new roadmap with the provided input data.
   * The author field is automatically set to the authenticated user's ID.
   *
   * Authorization:
   * - Requires valid JWT token (ClerkAuthGuard)
   * - Requires 'admin' role (RolesGuard)
   *
   * @param input - CreateRoadmapInput containing roadmap data
   * @param user - Current authenticated user (extracted by @CurrentUser decorator)
   * @returns Promise<RoadmapSchema> The created roadmap with full data
   * @throws UnauthorizedException if JWT token is invalid (401)
   * @throws ForbiddenException if user is not admin (403)
   * @throws BadRequestException if slug already exists (400)
   *
   * Requirements: 7.2, 8.1, 8.2, 8.3, 8.4, 8.5
   */
  @Mutation(() => RoadmapSchema)
  @Roles('admin')
  async createRoadmap(
    @Args('input') input: CreateRoadmapInput,
    @CurrentUser() user: CurrentUserData,
  ): Promise<RoadmapSchema> {
    const roadmap = await this.roadmapService.create(input, user.id);
    return {
      ...roadmap,
      id: roadmap._id,
      content: roadmap.content || '',
      author: roadmap.author || '',
      title: roadmap.title || '',
      description: roadmap.description || '',
      tags: roadmap.tags || [],
      publishedAt: roadmap.publishedAt || 0,
      updatedAt: roadmap.updatedAt || 0,
      isPublished: roadmap.isPublished || false,
    };
  }

  /**
   * Update an existing roadmap
   *
   * Admin-only mutation. Updates a roadmap with the provided input data.
   * Only the fields provided in the input will be updated (partial update).
   *
   * Authorization:
   * - Requires valid JWT token (ClerkAuthGuard)
   * - Requires 'admin' role (RolesGuard)
   *
   * @param input - UpdateRoadmapInput containing roadmap ID and fields to update
   * @returns Promise<RoadmapSchema> The updated roadmap with full data
   * @throws UnauthorizedException if JWT token is invalid (401)
   * @throws ForbiddenException if user is not admin (403)
   * @throws NotFoundException if roadmap does not exist (404)
   * @throws BadRequestException if new slug already exists (400)
   *
   * Requirements: 7.4, 8.1, 8.2, 8.3, 8.4, 8.5
   */
  @Mutation(() => RoadmapSchema)
  @Roles('admin')
  async updateRoadmap(
    @Args('input') input: UpdateRoadmapInput,
  ): Promise<RoadmapSchema> {
    const roadmap = await this.roadmapService.update(input);
    return {
      ...roadmap,
      id: roadmap._id,
      content: roadmap.content || '',
      author: roadmap.author || '',
      title: roadmap.title || '',
      description: roadmap.description || '',
      tags: roadmap.tags || [],
      publishedAt: roadmap.publishedAt || 0,
      updatedAt: roadmap.updatedAt || 0,
      isPublished: roadmap.isPublished || false,
    };
  }

  /**
   * Delete a roadmap
   *
   * Admin-only mutation. Deletes a roadmap with the provided ID.
   *
   * Authorization:
   * - Requires valid JWT token (ClerkAuthGuard)
   * - Requires 'admin' role (RolesGuard)
   *
   * @param id - Unique identifier of the roadmap to delete
   * @returns Promise<RoadmapSchema> The deleted roadmap with full data
   * @throws UnauthorizedException if JWT token is invalid (401)
   * @throws ForbiddenException if user is not admin (403)
   * @throws NotFoundException if roadmap does not exist (404)
   *
   * Requirements: 7.5, 8.1, 8.2, 8.3, 8.4, 8.5
   */
  @Mutation(() => RoadmapSchema)
  @Roles('admin')
  async deleteRoadmap(@Args('id') id: string): Promise<RoadmapSchema> {
    const roadmap = await this.roadmapService.delete(id);
    return {
      ...roadmap,
      id: roadmap._id,
      content: roadmap.content || '',
      author: roadmap.author || '',
      title: roadmap.title || '',
      description: roadmap.description || '',
      tags: roadmap.tags || [],
      publishedAt: roadmap.publishedAt || 0,
      updatedAt: roadmap.updatedAt || 0,
      isPublished: roadmap.isPublished || false,
    };
  }
}
