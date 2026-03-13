import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ArticleSchema } from '../schemas/article.schema';
import {
  CreateArticleInput,
  UpdateArticleInput,
} from '../schemas/article-input.schema';
import { ArticleService } from '../../../application/services/article.service';
import { ClerkAuthGuard } from '../../../../../common/guards/clerk-auth.guard';
import { RolesGuard } from '../../../../../common/guards/roles.guard';
import { Roles } from '../../../../../common/decorators/roles.decorator';
import { Public } from '../../../../../common/decorators/public.decorator';
import { CurrentUser } from '../../../../../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../../../../../common/decorators/current-user.decorator';

/**
 * ArticleResolver - GraphQL resolver for article queries and mutations
 *
 * This resolver provides GraphQL endpoints for article CRUD operations with
 * role-based access control:
 *
 * Public Operations (Guest, User, Admin):
 * - articles: Query all published articles
 * - article: Query a single article by slug
 *
 * Admin-Only Operations:
 * - articlesForAdmin: Query all articles including drafts and deleted
 * - createArticle: Create a new article
 * - updateArticle: Update an existing article
 * - deleteArticle: Soft delete an article
 *
 * Authorization Flow:
 * 1. ClerkAuthGuard verifies JWT token and extracts user info (unless @Public)
 * 2. RolesGuard checks if user has required role (unless @Public)
 * 3. Resolver executes the operation
 *
 * Requirements: 2.6, 2.7, 2.8, 2.9, 2.10, 8.1, 9.1, 9.3, 9.5
 */
@Resolver(() => ArticleSchema)
@UseGuards(ClerkAuthGuard, RolesGuard)
export class ArticleResolver {
  constructor(private readonly articleService: ArticleService) {}

  /**
   * Query all published articles
   *
   * Public endpoint accessible to all users (Guest, User, Admin).
   * Returns all articles with isPublished=true and isDeleted=false.
   *
   * @returns Promise<ArticleSchema[]> Array of published articles
   *
   * Requirements: 2.6, 2.10, 9.1
   */
  @Query(() => [ArticleSchema])
  @Public()
  async articles(): Promise<ArticleSchema[]> {
    const articles = await this.articleService.findAll();

    if (!articles || !Array.isArray(articles)) {
      return [];
    }

    return articles.map((article) => ({
      ...article,
      id: article._id,
    }));
  }

  /**
   * Query all articles including drafts and deleted (admin only)
   *
   * Admin-only endpoint that returns all articles regardless of publication
   * or deletion status. Used for admin dashboard to manage all articles.
   *
   * Authorization:
   * - Requires valid JWT token (ClerkAuthGuard)
   * - Requires 'admin' role (RolesGuard)
   *
   * @returns Promise<ArticleSchema[]> Array of all articles
   * @throws UnauthorizedException if JWT token is invalid (401)
   * @throws ForbiddenException if user is not admin (403)
   *
   * Requirements: 2.6, 10.8
   */
  @Query(() => [ArticleSchema])
  @Roles('admin')
  async articlesForAdmin(): Promise<ArticleSchema[]> {
    const articles = await this.articleService.findAllForAdmin();

    if (!articles || !Array.isArray(articles)) {
      return [];
    }

    return articles.map((article) => ({
      ...article,
      id: article._id,
    }));
  }

  /**
   * Query a single article by slug
   *
   * Public endpoint accessible to all users (Guest, User, Admin).
   * Returns the article matching the provided slug, or null if not found.
   * Only returns published and non-deleted articles for public access.
   *
   * @param slug - URL-friendly identifier for the article
   * @returns Promise<ArticleSchema | null> The article if found, null otherwise
   *
   * Requirements: 2.6, 2.7, 8.1, 9.5
   */
  @Query(() => ArticleSchema, { nullable: true })
  @Public()
  async article(@Args('slug') slug: string): Promise<ArticleSchema | null> {
    const article = await this.articleService.findBySlug(slug);
    if (!article) {
      return null;
    }
    return {
      ...article,
      id: article._id,
    };
  }

  /**
   * Create a new article
   *
   * Admin-only mutation. Creates a new article with the provided input data.
   * The author field is automatically set to the authenticated user's ID.
   * Automatically calculates reading time and word count from content.
   *
   * Authorization:
   * - Requires valid JWT token (ClerkAuthGuard)
   * - Requires 'admin' role (RolesGuard)
   *
   * @param input - CreateArticleInput containing article data
   * @param user - Current authenticated user (extracted by @CurrentUser decorator)
   * @returns Promise<ArticleSchema> The created article with full data
   * @throws UnauthorizedException if JWT token is invalid (401)
   * @throws ForbiddenException if user is not admin (403)
   * @throws ConflictException if slug already exists (409)
   *
   * Requirements: 2.6, 2.7, 2.10, 9.3
   */
  @Mutation(() => ArticleSchema)
  @Roles('admin')
  async createArticle(
    @Args('input') input: CreateArticleInput,
    @CurrentUser() user: CurrentUserData,
  ): Promise<ArticleSchema> {
    const article = await this.articleService.create(input, user.id);
    return {
      ...article,
      id: article._id,
    };
  }

  /**
   * Update an existing article
   *
   * Admin-only mutation. Updates an article with the provided input data.
   * Only the fields provided in the input will be updated (partial update).
   * Automatically recalculates reading time and word count if content is updated.
   * Updates the updatedAt timestamp.
   *
   * Authorization:
   * - Requires valid JWT token (ClerkAuthGuard)
   * - Requires 'admin' role (RolesGuard)
   *
   * @param input - UpdateArticleInput containing article ID and fields to update
   * @returns Promise<ArticleSchema> The updated article with full data
   * @throws UnauthorizedException if JWT token is invalid (401)
   * @throws ForbiddenException if user is not admin (403)
   * @throws NotFoundException if article does not exist (404)
   * @throws ConflictException if new slug already exists (409)
   *
   * Requirements: 2.8, 2.9, 9.3
   */
  @Mutation(() => ArticleSchema)
  @Roles('admin')
  async updateArticle(
    @Args('input') input: UpdateArticleInput,
  ): Promise<ArticleSchema> {
    const article = await this.articleService.update(input);
    return {
      ...article,
      id: article._id,
    };
  }

  /**
   * Soft delete an article
   *
   * Admin-only mutation. Marks an article as deleted by setting isDeleted=true.
   * The article remains in the database but is excluded from public queries.
   *
   * Authorization:
   * - Requires valid JWT token (ClerkAuthGuard)
   * - Requires 'admin' role (RolesGuard)
   *
   * @param id - Unique identifier of the article to delete
   * @returns Promise<ArticleSchema> The deleted article with full data
   * @throws UnauthorizedException if JWT token is invalid (401)
   * @throws ForbiddenException if user is not admin (403)
   * @throws NotFoundException if article does not exist (404)
   *
   * Requirements: 2.9, 10.8, 9.3
   */
  @Mutation(() => ArticleSchema)
  @Roles('admin')
  async deleteArticle(@Args('id') id: string): Promise<ArticleSchema> {
    const article = await this.articleService.delete(id);
    return {
      ...article,
      id: article._id,
    };
  }
}
